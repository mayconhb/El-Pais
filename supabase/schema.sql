-- Quiz Analytics Schema for Supabase
-- Run this in the Supabase SQL Editor to create the necessary tables

-- Sessions table - tracks each unique visitor
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  xcod TEXT,
  sck TEXT,
  device_type TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step events table - tracks views and abandonment at each step
CREATE TABLE IF NOT EXISTS step_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
  step_index INTEGER NOT NULL CHECK (step_index >= 0 AND step_index <= 18),
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'complete', 'abandon')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  dwell_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Answers table - tracks selected options for each question
CREATE TABLE IF NOT EXISTS answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
  step_index INTEGER NOT NULL,
  question_key TEXT NOT NULL,
  answer_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Checkouts table - tracks checkout clicks
CREATE TABLE IF NOT EXISTS checkouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
  checkout_url TEXT,
  source_step INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_step_events_session_id ON step_events(session_id);
CREATE INDEX IF NOT EXISTS idx_step_events_step_index ON step_events(step_index);
CREATE INDEX IF NOT EXISTS idx_step_events_event_type ON step_events(event_type);
CREATE INDEX IF NOT EXISTS idx_step_events_timestamp ON step_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_answers_session_id ON answers(session_id);
CREATE INDEX IF NOT EXISTS idx_answers_step_index ON answers(step_index);
CREATE INDEX IF NOT EXISTS idx_answers_question_key ON answers(question_key);
CREATE INDEX IF NOT EXISTS idx_checkouts_session_id ON checkouts(session_id);
CREATE INDEX IF NOT EXISTS idx_checkouts_timestamp ON checkouts(timestamp);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON sessions(started_at);

-- Enable Row Level Security (RLS)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE step_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkouts ENABLE ROW LEVEL SECURITY;

-- Create policies for service role access (API can insert/select)
CREATE POLICY "Enable insert for service role" ON sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for service role" ON sessions FOR SELECT USING (true);

CREATE POLICY "Enable insert for service role" ON step_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for service role" ON step_events FOR SELECT USING (true);

CREATE POLICY "Enable insert for service role" ON answers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for service role" ON answers FOR SELECT USING (true);

CREATE POLICY "Enable insert for service role" ON checkouts FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for service role" ON checkouts FOR SELECT USING (true);

-- Function to get funnel analytics
CREATE OR REPLACE FUNCTION get_funnel_analytics(
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
  step_index INTEGER,
  total_views BIGINT,
  total_completes BIGINT,
  total_abandons BIGINT,
  abandonment_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    se.step_index,
    COUNT(*) FILTER (WHERE se.event_type = 'view') as total_views,
    COUNT(*) FILTER (WHERE se.event_type = 'complete') as total_completes,
    COUNT(*) FILTER (WHERE se.event_type = 'abandon') as total_abandons,
    CASE 
      WHEN COUNT(*) FILTER (WHERE se.event_type = 'view') > 0 
      THEN ROUND(
        (COUNT(*) FILTER (WHERE se.event_type = 'abandon')::NUMERIC / 
         COUNT(*) FILTER (WHERE se.event_type = 'view')::NUMERIC) * 100, 
        2
      )
      ELSE 0
    END as abandonment_rate
  FROM step_events se
  JOIN sessions s ON se.session_id = s.session_id
  WHERE s.started_at >= start_date AND s.started_at <= end_date
  GROUP BY se.step_index
  ORDER BY se.step_index;
END;
$$ LANGUAGE plpgsql;

-- Function to get answer distributions
CREATE OR REPLACE FUNCTION get_answer_distributions(
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
  question_key TEXT,
  answer_value TEXT,
  answer_count BIGINT,
  percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH answer_counts AS (
    SELECT 
      a.question_key,
      a.answer_value,
      COUNT(*) as count
    FROM answers a
    JOIN sessions s ON a.session_id = s.session_id
    WHERE s.started_at >= start_date AND s.started_at <= end_date
    GROUP BY a.question_key, a.answer_value
  ),
  question_totals AS (
    SELECT 
      question_key,
      SUM(count) as total
    FROM answer_counts
    GROUP BY question_key
  )
  SELECT 
    ac.question_key,
    ac.answer_value,
    ac.count as answer_count,
    ROUND((ac.count::NUMERIC / qt.total::NUMERIC) * 100, 2) as percentage
  FROM answer_counts ac
  JOIN question_totals qt ON ac.question_key = qt.question_key
  ORDER BY ac.question_key, ac.count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get conversion metrics
CREATE OR REPLACE FUNCTION get_conversion_metrics(
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
  total_sessions BIGINT,
  total_checkouts BIGINT,
  conversion_rate NUMERIC,
  avg_steps_before_abandon NUMERIC,
  quiz_completion_rate NUMERIC
) AS $$
DECLARE
  sessions_count BIGINT;
  checkouts_count BIGINT;
  completions_count BIGINT;
BEGIN
  -- Count total sessions
  SELECT COUNT(DISTINCT session_id) INTO sessions_count
  FROM sessions
  WHERE started_at >= start_date AND started_at <= end_date;
  
  -- Count total checkouts
  SELECT COUNT(DISTINCT session_id) INTO checkouts_count
  FROM checkouts c
  JOIN sessions s ON c.session_id = s.session_id
  WHERE s.started_at >= start_date AND s.started_at <= end_date;
  
  -- Count sessions that reached step 18 (video/sales page)
  SELECT COUNT(DISTINCT se.session_id) INTO completions_count
  FROM step_events se
  JOIN sessions s ON se.session_id = s.session_id
  WHERE se.step_index = 18 
    AND se.event_type = 'view'
    AND s.started_at >= start_date 
    AND s.started_at <= end_date;
  
  RETURN QUERY
  SELECT 
    sessions_count as total_sessions,
    checkouts_count as total_checkouts,
    CASE WHEN sessions_count > 0 
      THEN ROUND((checkouts_count::NUMERIC / sessions_count::NUMERIC) * 100, 2)
      ELSE 0
    END as conversion_rate,
    COALESCE((
      SELECT ROUND(AVG(max_step)::NUMERIC, 2)
      FROM (
        SELECT se.session_id, MAX(se.step_index) as max_step
        FROM step_events se
        JOIN sessions s ON se.session_id = s.session_id
        WHERE se.event_type = 'abandon'
          AND s.started_at >= start_date 
          AND s.started_at <= end_date
        GROUP BY se.session_id
      ) abandoned_sessions
    ), 0) as avg_steps_before_abandon,
    CASE WHEN sessions_count > 0 
      THEN ROUND((completions_count::NUMERIC / sessions_count::NUMERIC) * 100, 2)
      ELSE 0
    END as quiz_completion_rate;
END;
$$ LANGUAGE plpgsql;
