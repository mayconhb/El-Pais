// Quiz Analytics Tracking System
(function() {
  'use strict';
  
  const ANALYTICS_ENDPOINT = '/api/track-event';
  const SESSION_KEY = 'quiz_session_id';
  const LAST_STEP_KEY = 'quiz_last_step';
  const STEP_START_TIME_KEY = 'quiz_step_start_time';
  const CHECKOUT_CLICKED_KEY = 'quiz_checkout_clicked';
  
  let sessionId = null;
  let currentStep = 0;
  let stepStartTime = Date.now();
  let isInitialized = false;
  let checkoutClicked = false;
  
  // Generate UUID v4
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  // Get or create session ID
  function getSessionId() {
    if (sessionId) return sessionId;
    
    sessionId = localStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = generateUUID();
      localStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
  }
  
  // Get URL parameters
  function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get('utm_source') || null,
      utm_medium: params.get('utm_medium') || null,
      utm_campaign: params.get('utm_campaign') || null,
      utm_content: params.get('utm_content') || null,
      utm_term: params.get('utm_term') || null,
      xcod: params.get('xcod') || null,
      sck: params.get('sck') || null
    };
  }
  
  // Get device type
  function getDeviceType() {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }
  
  // Send event to API
  async function sendEvent(eventData) {
    try {
      const payload = {
        session_id: getSessionId(),
        timestamp: new Date().toISOString(),
        ...eventData
      };
      
      // Use sendBeacon for reliability on page unload
      if (eventData.event_type === 'abandon' && navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        navigator.sendBeacon(ANALYTICS_ENDPOINT, blob);
        return;
      }
      
      await fetch(ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      });
    } catch (error) {
      console.error('[Analytics] Error sending event:', error);
    }
  }
  
  // Initialize session
  function initSession() {
    if (isInitialized) return;
    isInitialized = true;
    
    const params = getUrlParams();
    sendEvent({
      event_type: 'session_start',
      device_type: getDeviceType(),
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
      ...params
    });
    
    // Track initial step view
    trackStepView(0);
    
    console.log('[Analytics] Session initialized:', getSessionId());
  }
  
  // Track step view
  function trackStepView(stepIndex) {
    currentStep = stepIndex;
    stepStartTime = Date.now();
    localStorage.setItem(LAST_STEP_KEY, stepIndex.toString());
    localStorage.setItem(STEP_START_TIME_KEY, stepStartTime.toString());
    
    sendEvent({
      event_type: 'step_view',
      step_index: stepIndex
    });
    
    console.log('[Analytics] Step view:', stepIndex);
  }
  
  // Track step completion
  function trackStepComplete(stepIndex) {
    const dwellTime = Date.now() - stepStartTime;
    
    sendEvent({
      event_type: 'step_complete',
      step_index: stepIndex,
      dwell_ms: dwellTime
    });
    
    console.log('[Analytics] Step complete:', stepIndex, 'Dwell:', dwellTime, 'ms');
  }
  
  // Track answer selection
  function trackAnswer(stepIndex, questionKey, answerValue) {
    sendEvent({
      event_type: 'answer',
      step_index: stepIndex,
      question_key: questionKey,
      answer_value: answerValue
    });
    
    console.log('[Analytics] Answer:', questionKey, '=', answerValue);
  }
  
  // Track checkout click (with duplicate prevention)
  function trackCheckout(checkoutUrl, sourceStep) {
    // Prevent duplicate checkout tracking
    if (checkoutClicked || sessionStorage.getItem(CHECKOUT_CLICKED_KEY) === 'true') {
      console.log('[Analytics] Checkout already tracked - skipping duplicate');
      return;
    }
    
    checkoutClicked = true;
    sessionStorage.setItem(CHECKOUT_CLICKED_KEY, 'true');
    
    sendEvent({
      event_type: 'checkout',
      checkout_url: checkoutUrl,
      source_step: sourceStep
    });
    
    console.log('[Analytics] Checkout click from step:', sourceStep);
  }
  
  // Track abandonment
  function trackAbandon() {
    if (checkoutClicked || sessionStorage.getItem(CHECKOUT_CLICKED_KEY) === 'true') {
      console.log('[Analytics] Skipping abandon tracking - user clicked checkout');
      return;
    }
    
    const lastStep = parseInt(localStorage.getItem(LAST_STEP_KEY) || '0');
    const lastStepStartTime = parseInt(localStorage.getItem(STEP_START_TIME_KEY) || Date.now().toString());
    const dwellTime = Date.now() - lastStepStartTime;
    
    sendEvent({
      event_type: 'abandon',
      step_index: lastStep,
      dwell_ms: dwellTime
    });
    
    console.log('[Analytics] Abandon at step:', lastStep);
  }
  
  // Setup abandonment detection
  function setupAbandonmentTracking() {
    let abandonTracked = false;
    
    // Track on page unload only (not on visibility change to avoid duplicates)
    window.addEventListener('beforeunload', function() {
      if (!abandonTracked) {
        abandonTracked = true;
        trackAbandon();
      }
    });
    
    // Also track on pagehide for mobile browsers
    window.addEventListener('pagehide', function() {
      if (!abandonTracked) {
        abandonTracked = true;
        trackAbandon();
      }
    });
  }
  
  // Reset session (for testing)
  function resetSession() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(LAST_STEP_KEY);
    localStorage.removeItem(STEP_START_TIME_KEY);
    sessionId = null;
    isInitialized = false;
    console.log('[Analytics] Session reset');
  }
  
  // Expose analytics API globally
  window.QuizAnalytics = {
    init: initSession,
    trackStepView: trackStepView,
    trackStepComplete: trackStepComplete,
    trackAnswer: trackAnswer,
    trackCheckout: trackCheckout,
    trackAbandon: trackAbandon,
    resetSession: resetSession,
    getSessionId: getSessionId
  };
  
  // Auto-initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initSession();
      setupAbandonmentTracking();
    });
  } else {
    initSession();
    setupAbandonmentTracking();
  }
})();
