// Vercel Serverless Function - Get Analytics Data
// GET /api/analytics

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const dashboardPassword = process.env.DASHBOARD_PASSWORD;

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Password authentication - require DASHBOARD_PASSWORD env var
  if (!dashboardPassword) {
    return res.status(500).json({ error: 'Dashboard password not configured' });
  }
  
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${dashboardPassword}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials');
    return res.status(500).json({ error: 'Server configuration error' });
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Parse date range from query params
    const { range = '7d', start_date, end_date } = req.query;
    
    let startDate;
    let endDate = new Date();
    
    // Helper to get start of day in local timezone
    const getStartOfDay = (date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d;
    };
    
    // Helper to get end of day in local timezone
    const getEndOfDay = (date) => {
      const d = new Date(date);
      d.setHours(23, 59, 59, 999);
      return d;
    };
    
    switch (range) {
      case 'today':
        startDate = getStartOfDay(new Date());
        endDate = getEndOfDay(new Date());
        break;
      case 'yesterday':
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
        startDate = getStartOfDay(yesterday);
        endDate = getEndOfDay(yesterday);
        break;
      case '24h':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        startDate = new Date('2020-01-01');
        break;
      case 'custom':
        // Use provided start_date and end_date
        if (start_date && end_date) {
          startDate = getStartOfDay(new Date(start_date));
          endDate = getEndOfDay(new Date(end_date));
        } else {
          // Fallback to last 30 days if no dates provided
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        }
        break;
      default:
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }
    
    // Fetch funnel data using RPC
    const { data: funnelData, error: funnelError } = await supabase
      .rpc('get_funnel_analytics', {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      });
    
    if (funnelError) {
      console.error('Funnel RPC error:', funnelError);
      // Fallback to direct query if RPC doesn't exist
    }
    
    // Fetch answer distributions using RPC
    const { data: answersData, error: answersError } = await supabase
      .rpc('get_answer_distributions', {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      });
    
    if (answersError) {
      console.error('Answers RPC error:', answersError);
    }
    
    // Fetch conversion metrics using RPC
    const { data: conversionData, error: conversionError } = await supabase
      .rpc('get_conversion_metrics', {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      });
    
    if (conversionError) {
      console.error('Conversion RPC error:', conversionError);
    }
    
    // If RPCs fail, use direct queries as fallback
    let funnel = funnelData || [];
    let answers = answersData || [];
    let conversion = conversionData?.[0] || null;
    
    // Fallback: Direct queries if RPCs don't exist
    if (!funnelData || funnelData.length === 0) {
      const { data: stepEvents } = await supabase
        .from('step_events')
        .select('step_index, event_type, session_id')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
      
      if (stepEvents) {
        const funnelMap = {};
        for (let i = 0; i <= 18; i++) {
          funnelMap[i] = { 
            step_index: i, 
            viewSessions: new Set(),
            completeSessions: new Set(),
            abandonSessions: new Set()
          };
        }
        
        stepEvents.forEach(event => {
          const step = funnelMap[event.step_index];
          if (step && event.session_id) {
            if (event.event_type === 'view') step.viewSessions.add(event.session_id);
            if (event.event_type === 'complete') step.completeSessions.add(event.session_id);
            if (event.event_type === 'abandon') step.abandonSessions.add(event.session_id);
          }
        });
        
        funnel = Object.values(funnelMap).map(step => {
          const total_views = step.viewSessions.size;
          const total_completes = step.completeSessions.size;
          const total_abandons = step.abandonSessions.size;
          return {
            step_index: step.step_index,
            total_views,
            total_completes,
            total_abandons,
            abandonment_rate: total_views > 0 
              ? ((total_abandons / total_views) * 100).toFixed(2)
              : 0
          };
        });
      }
    }
    
    if (!answersData || answersData.length === 0) {
      const { data: answersRaw } = await supabase
        .from('answers')
        .select('question_key, answer_value')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
      
      if (answersRaw) {
        const answerCounts = {};
        answersRaw.forEach(a => {
          const key = `${a.question_key}|${a.answer_value}`;
          answerCounts[key] = (answerCounts[key] || 0) + 1;
        });
        
        const questionTotals = {};
        Object.entries(answerCounts).forEach(([key, count]) => {
          const qKey = key.split('|')[0];
          questionTotals[qKey] = (questionTotals[qKey] || 0) + count;
        });
        
        answers = Object.entries(answerCounts).map(([key, count]) => {
          const [question_key, answer_value] = key.split('|');
          const total = questionTotals[question_key];
          return {
            question_key,
            answer_value,
            answer_count: count,
            percentage: ((count / total) * 100).toFixed(2)
          };
        });
      }
    }
    
    if (!conversion) {
      const { count: totalSessions } = await supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .gte('started_at', startDate.toISOString())
        .lte('started_at', endDate.toISOString());
      
      const { count: totalCheckouts } = await supabase
        .from('checkouts')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
      
      const { data: step0Views } = await supabase
        .from('step_events')
        .select('session_id')
        .eq('step_index', 0)
        .eq('event_type', 'view')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
      
      const { data: step18Views } = await supabase
        .from('step_events')
        .select('session_id')
        .eq('step_index', 18)
        .eq('event_type', 'view')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
      
      const uniqueStep0Sessions = step0Views ? new Set(step0Views.map(v => v.session_id)).size : 0;
      const uniqueStep18Sessions = step18Views ? new Set(step18Views.map(v => v.session_id)).size : 0;
      
      const totalViews = uniqueStep0Sessions;
      const completedQuiz = uniqueStep18Sessions;
      const sessions = totalSessions || 0;
      
      conversion = {
        total_sessions: sessions,
        total_checkouts: totalCheckouts || 0,
        total_views: totalViews,
        conversion_rate: sessions > 0 
          ? ((totalCheckouts / sessions) * 100).toFixed(2) 
          : 0,
        quiz_completion_rate: sessions > 0
          ? ((completedQuiz / sessions) * 100).toFixed(2)
          : 0,
        avg_steps_before_abandon: 0
      };
    }
    
    // Step names for display
    const stepNames = [
      'Intro (Inicio)',
      'Objetivo de peso',
      'Clasificación corporal',
      'Área objetivo',
      'Nombre',
      'Satisfacción apariencia',
      'Obstáculos',
      'Impacto vida diaria',
      'Beneficios deseados',
      'Intro Protocolo',
      'Testimonios',
      'Altura',
      'Peso objetivo',
      'Peso actual',
      'Consumo de agua',
      'Loading/Análisis',
      'Resultados IMC',
      'Rosana Story',
      'Video/Ventas'
    ];
    
    // Filter out slider answers (peso, altura, objetivo) from answer distributions
    const sliderKeys = ['peso', 'altura', 'objetivo'];
    const filteredAnswers = answers.filter(a => !sliderKeys.includes(a.question_key));
    
    return res.status(200).json({
      success: true,
      range,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      funnel: funnel.map((step, idx) => ({
        ...step,
        step_name: stepNames[step.step_index] || `Etapa ${step.step_index}`
      })),
      answers: filteredAnswers,
      conversion: conversion,
      step_names: stepNames
    });
    
  } catch (error) {
    console.error('Analytics error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
