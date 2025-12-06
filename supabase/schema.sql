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
-- Using DROP IF EXISTS to allow re-running the script safely
DROP POLICY IF EXISTS "Enable insert for service role" ON sessions;
DROP POLICY IF EXISTS "Enable select for service role" ON sessions;
CREATE POLICY "Enable insert for service role" ON sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for service role" ON sessions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for service role" ON step_events;
DROP POLICY IF EXISTS "Enable select for service role" ON step_events;
CREATE POLICY "Enable insert for service role" ON step_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for service role" ON step_events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for service role" ON answers;
DROP POLICY IF EXISTS "Enable select for service role" ON answers;
CREATE POLICY "Enable insert for service role" ON answers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for service role" ON answers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for service role" ON checkouts;
DROP POLICY IF EXISTS "Enable select for service role" ON checkouts;
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

-- ================================================
-- HOTMART INTEGRATION - Sales Tracking
-- ================================================

-- Sales table - tracks sales from Hotmart webhooks
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT UNIQUE NOT NULL,
  hotmart_transaction_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'refunded', 'disputed', 'cancelled', 'expired', 'completed')),
  payment_type TEXT,
  payment_method TEXT,
  buyer_email TEXT,
  buyer_name TEXT,
  product_id TEXT,
  product_name TEXT,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'BRL',
  commission_cents INTEGER DEFAULT 0,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  xcod TEXT,
  sck TEXT,
  src TEXT,
  hotmart_created_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for sales table
CREATE INDEX IF NOT EXISTS idx_sales_transaction_id ON sales(transaction_id);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_buyer_email ON sales(buyer_email);
CREATE INDEX IF NOT EXISTS idx_sales_utm_source ON sales(utm_source);

-- Enable Row Level Security for sales
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Create policies for service role access
DROP POLICY IF EXISTS "Enable insert for service role" ON sales;
DROP POLICY IF EXISTS "Enable select for service role" ON sales;
DROP POLICY IF EXISTS "Enable update for service role" ON sales;
CREATE POLICY "Enable insert for service role" ON sales FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable select for service role" ON sales FOR SELECT USING (true);
CREATE POLICY "Enable update for service role" ON sales FOR UPDATE USING (true);

-- Function to get sales metrics
CREATE OR REPLACE FUNCTION get_sales_metrics(
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
  total_sales BIGINT,
  approved_sales BIGINT,
  refunded_sales BIGINT,
  total_revenue_cents BIGINT,
  net_revenue_cents BIGINT,
  total_commission_cents BIGINT,
  avg_ticket_cents NUMERIC,
  refund_rate NUMERIC
) AS $$
DECLARE
  all_sales BIGINT;
  approved BIGINT;
  refunded BIGINT;
  total_rev BIGINT;
  refunded_amount BIGINT;
  total_comm BIGINT;
BEGIN
  -- Count total sales
  SELECT COUNT(*) INTO all_sales
  FROM sales
  WHERE created_at >= start_date AND created_at <= end_date;
  
  -- Count approved sales
  SELECT COUNT(*) INTO approved
  FROM sales
  WHERE status IN ('approved', 'completed')
    AND created_at >= start_date AND created_at <= end_date;
  
  -- Count refunded sales
  SELECT COUNT(*) INTO refunded
  FROM sales
  WHERE status = 'refunded'
    AND created_at >= start_date AND created_at <= end_date;
  
  -- Sum approved revenue
  SELECT COALESCE(SUM(amount_cents), 0) INTO total_rev
  FROM sales
  WHERE status IN ('approved', 'completed')
    AND created_at >= start_date AND created_at <= end_date;
  
  -- Sum refunded amount
  SELECT COALESCE(SUM(amount_cents), 0) INTO refunded_amount
  FROM sales
  WHERE status = 'refunded'
    AND created_at >= start_date AND created_at <= end_date;
  
  -- Sum commissions
  SELECT COALESCE(SUM(commission_cents), 0) INTO total_comm
  FROM sales
  WHERE status IN ('approved', 'completed')
    AND created_at >= start_date AND created_at <= end_date;
  
  RETURN QUERY
  SELECT 
    all_sales as total_sales,
    approved as approved_sales,
    refunded as refunded_sales,
    total_rev as total_revenue_cents,
    (total_rev - refunded_amount) as net_revenue_cents,
    total_comm as total_commission_cents,
    CASE WHEN approved > 0 
      THEN ROUND(total_rev::NUMERIC / approved::NUMERIC, 2)
      ELSE 0
    END as avg_ticket_cents,
    CASE WHEN all_sales > 0 
      THEN ROUND((refunded::NUMERIC / all_sales::NUMERIC) * 100, 2)
      ELSE 0
    END as refund_rate;
END;
$$ LANGUAGE plpgsql;

-- Function to get sales by source (UTM)
CREATE OR REPLACE FUNCTION get_sales_by_source(
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE (
  source TEXT,
  total_sales BIGINT,
  total_revenue_cents BIGINT,
  approved_sales BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(s.utm_source, 'direto') as source,
    COUNT(*) as total_sales,
    COALESCE(SUM(CASE WHEN s.status IN ('approved', 'completed') THEN s.amount_cents ELSE 0 END), 0) as total_revenue_cents,
    COUNT(*) FILTER (WHERE s.status IN ('approved', 'completed')) as approved_sales
  FROM sales s
  WHERE s.created_at >= start_date AND s.created_at <= end_date
  GROUP BY COALESCE(s.utm_source, 'direto')
  ORDER BY total_revenue_cents DESC;
END;
$$ LANGUAGE plpgsql;
