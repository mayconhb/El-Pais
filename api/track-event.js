// Vercel Serverless Function - Track Analytics Events
// POST /api/track-event

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function parseBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }
  
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        resolve(null);
      }
    });
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    return res.status(500).json({ error: 'Server configuration error' });
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    const event = await parseBody(req);
    
    if (!event || !event.session_id || !event.event_type) {
      return res.status(400).json({ error: 'Invalid event data' });
    }
    
    const { session_id, event_type, timestamp } = event;
    
    // Handle session start - create or update session
    if (event_type === 'session_start') {
      const { error: sessionError } = await supabase
        .from('sessions')
        .upsert({
          session_id: session_id,
          started_at: timestamp || new Date().toISOString(),
          utm_source: event.utm_source,
          utm_medium: event.utm_medium,
          utm_campaign: event.utm_campaign,
          utm_content: event.utm_content,
          utm_term: event.utm_term,
          xcod: event.xcod,
          sck: event.sck,
          device_type: event.device_type,
          user_agent: event.user_agent,
          referrer: event.referrer
        }, {
          onConflict: 'session_id',
          ignoreDuplicates: false
        });
      
      if (sessionError) {
        console.error('Session upsert error:', sessionError);
        return res.status(500).json({ error: 'Failed to create session' });
      }
      
      return res.status(204).end();
    }
    
    // Ensure session exists before adding events
    const { data: existingSession } = await supabase
      .from('sessions')
      .select('session_id')
      .eq('session_id', session_id)
      .single();
    
    if (!existingSession) {
      // Create session if it doesn't exist
      const { error: createSessionError } = await supabase
        .from('sessions')
        .insert({
          session_id: session_id,
          started_at: new Date().toISOString()
        });
      
      if (createSessionError && createSessionError.code !== '23505') {
        console.error('Session creation error:', createSessionError);
      }
    }
    
    // Handle step events (view, complete, abandon)
    if (['step_view', 'step_complete', 'abandon'].includes(event_type)) {
      const eventTypeMap = {
        'step_view': 'view',
        'step_complete': 'complete',
        'abandon': 'abandon'
      };
      
      const { error: stepError } = await supabase
        .from('step_events')
        .insert({
          session_id: session_id,
          step_index: event.step_index,
          event_type: eventTypeMap[event_type],
          timestamp: timestamp || new Date().toISOString(),
          dwell_ms: event.dwell_ms || null
        });
      
      if (stepError) {
        console.error('Step event error:', stepError);
        return res.status(500).json({ error: 'Failed to track step event' });
      }
      
      return res.status(204).end();
    }
    
    // Handle answer events
    if (event_type === 'answer') {
      const { error: answerError } = await supabase
        .from('answers')
        .insert({
          session_id: session_id,
          step_index: event.step_index,
          question_key: event.question_key,
          answer_value: event.answer_value
        });
      
      if (answerError) {
        console.error('Answer event error:', answerError);
        return res.status(500).json({ error: 'Failed to track answer' });
      }
      
      return res.status(204).end();
    }
    
    // Handle checkout events
    if (event_type === 'checkout') {
      const { error: checkoutError } = await supabase
        .from('checkouts')
        .insert({
          session_id: session_id,
          checkout_url: event.checkout_url,
          source_step: event.source_step,
          timestamp: timestamp || new Date().toISOString()
        });
      
      if (checkoutError) {
        console.error('Checkout event error:', checkoutError);
        return res.status(500).json({ error: 'Failed to track checkout' });
      }
      
      return res.status(204).end();
    }
    
    return res.status(400).json({ error: 'Unknown event type' });
    
  } catch (error) {
    console.error('Track event error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
