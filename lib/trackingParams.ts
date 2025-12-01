const STORAGE_KEY = 'checkout_tracking_params';

const TRACKING_PARAMS = [
  'xcod',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'src',
  'sck',
  'ref',
  'fbclid',
  'gclid',
  'ttclid',
  'msclkid',
];

export interface TrackingParams {
  [key: string]: string;
}

export function captureTrackingParams(): TrackingParams {
  const params: TrackingParams = {};
  
  try {
    const urlParams = new URLSearchParams(window.location.search);
    
    TRACKING_PARAMS.forEach((param) => {
      const value = urlParams.get(param);
      if (value) {
        params[param] = value;
      }
    });
    
    urlParams.forEach((value, key) => {
      if (key.startsWith('utm_') && !params[key]) {
        params[key] = value;
      }
    });
    
    if (Object.keys(params).length > 0) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(params));
      console.log('[Tracking] Captured params:', params);
    }
  } catch (e) {
    console.error('[Tracking] Error capturing params:', e);
  }
  
  return params;
}

export function getStoredTrackingParams(): TrackingParams {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('[Tracking] Error reading stored params:', e);
  }
  return {};
}

export function buildCheckoutUrl(baseUrl: string): string {
  const params = getStoredTrackingParams();
  
  if (Object.keys(params).length === 0) {
    console.log('[Tracking] No tracking params to add to checkout URL');
    return baseUrl;
  }
  
  try {
    const url = new URL(baseUrl);
    
    Object.entries(params).forEach(([key, value]) => {
      if (!url.searchParams.has(key)) {
        url.searchParams.set(key, value);
      }
    });
    
    const finalUrl = url.toString();
    console.log('[Tracking] Built checkout URL with params:', finalUrl);
    return finalUrl;
  } catch (e) {
    console.error('[Tracking] Error building checkout URL:', e);
    return baseUrl;
  }
}

export function initTrackingOnLoad(): void {
  const existingParams = getStoredTrackingParams();
  
  if (Object.keys(existingParams).length === 0) {
    captureTrackingParams();
  } else {
    const newParams = captureTrackingParams();
    if (Object.keys(newParams).length > 0) {
      const merged = { ...existingParams, ...newParams };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      console.log('[Tracking] Merged params:', merged);
    }
  }
}
