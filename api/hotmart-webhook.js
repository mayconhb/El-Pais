// Vercel Serverless Function - Hotmart Webhook Handler
// POST /api/hotmart-webhook

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const hotmartToken = process.env.HOTMART_WEBHOOK_TOKEN;

const STATUS_MAP = {
  'approved': 'approved',
  'complete': 'completed',
  'completed': 'completed',
  'billet_printed': 'pending',
  'waiting_payment': 'pending',
  'pending': 'pending',
  'refunded': 'refunded',
  'chargeback': 'disputed',
  'dispute': 'disputed',
  'cancelled': 'cancelled',
  'expired': 'expired',
  'overdue': 'expired'
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Hotmart-Hottok');
  
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
  
  if (hotmartToken) {
    const receivedToken = req.headers['x-hotmart-hottok'] || req.query.hottok;
    if (receivedToken !== hotmartToken) {
      console.warn('Invalid Hotmart token received');
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    const payload = req.body;
    
    console.log('[Hotmart Webhook] Received payload:', JSON.stringify(payload, null, 2));
    
    const data = payload.data || payload;
    const purchase = data.purchase || {};
    const product = data.product || {};
    const buyer = data.buyer || {};
    const producer = data.producer || {};
    const subscription = data.subscription || {};
    const commissions = data.commissions || [];
    
    const hotmartStatus = (purchase.status || payload.status || '').toLowerCase();
    const status = STATUS_MAP[hotmartStatus] || 'pending';
    
    const transactionId = purchase.transaction || 
                          purchase.order_bump?.transaction || 
                          payload.transaction || 
                          `hotmart_${Date.now()}`;
    
    let amountCents = 0;
    if (purchase.price?.value) {
      amountCents = Math.round(purchase.price.value * 100);
    } else if (purchase.original_offer_price?.value) {
      amountCents = Math.round(purchase.original_offer_price.value * 100);
    } else if (typeof purchase.price === 'number') {
      amountCents = Math.round(purchase.price * 100);
    }
    
    let commissionCents = 0;
    if (producer.name && commissions.length > 0) {
      const producerComm = commissions.find(c => c.source === 'PRODUCER');
      if (producerComm?.value) {
        commissionCents = Math.round(producerComm.value * 100);
      }
    }
    
    const trackingParams = purchase.tracking || {};
    const srcParam = trackingParams.src || trackingParams.source || '';
    const utmSource = trackingParams.utm_source || extractParam(srcParam, 'utm_source') || '';
    const utmMedium = trackingParams.utm_medium || extractParam(srcParam, 'utm_medium') || '';
    const utmCampaign = trackingParams.utm_campaign || extractParam(srcParam, 'utm_campaign') || '';
    const utmContent = trackingParams.utm_content || extractParam(srcParam, 'utm_content') || '';
    const utmTerm = trackingParams.utm_term || extractParam(srcParam, 'utm_term') || '';
    const xcod = trackingParams.xcod || extractParam(srcParam, 'xcod') || '';
    const sck = trackingParams.sck || extractParam(srcParam, 'sck') || '';
    
    // Convert Hotmart timestamp (milliseconds) to ISO date string
    const hotmartDate = purchase.approved_date || purchase.order_date || null;
    let hotmartCreatedAt = null;
    if (hotmartDate) {
      // If it's a large number (milliseconds timestamp), convert it
      if (typeof hotmartDate === 'number' && hotmartDate > 1000000000000) {
        hotmartCreatedAt = new Date(hotmartDate).toISOString();
      } else if (typeof hotmartDate === 'number') {
        // If it's seconds timestamp, convert to milliseconds first
        hotmartCreatedAt = new Date(hotmartDate * 1000).toISOString();
      } else if (typeof hotmartDate === 'string') {
        // If it's already a string, try to parse it
        const parsed = new Date(hotmartDate);
        if (!isNaN(parsed.getTime())) {
          hotmartCreatedAt = parsed.toISOString();
        }
      }
    }
    
    const saleData = {
      transaction_id: transactionId,
      hotmart_transaction_id: purchase.transaction || null,
      status: status,
      payment_type: purchase.payment?.type || null,
      payment_method: purchase.payment?.method || null,
      buyer_email: buyer.email || null,
      buyer_name: buyer.name || null,
      product_id: product.id?.toString() || null,
      product_name: product.name || null,
      amount_cents: amountCents,
      currency: purchase.price?.currency_code || 'BRL',
      commission_cents: commissionCents,
      utm_source: utmSource || null,
      utm_medium: utmMedium || null,
      utm_campaign: utmCampaign || null,
      utm_content: utmContent || null,
      utm_term: utmTerm || null,
      xcod: xcod || null,
      sck: sck || null,
      src: srcParam || null,
      hotmart_created_at: hotmartCreatedAt
    };
    
    console.log('[Hotmart Webhook] Processed sale data:', saleData);
    
    const { data: existingSale } = await supabase
      .from('sales')
      .select('id, status')
      .eq('transaction_id', transactionId)
      .single();
    
    if (existingSale) {
      const { error: updateError } = await supabase
        .from('sales')
        .update({
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('transaction_id', transactionId);
      
      if (updateError) {
        console.error('[Hotmart Webhook] Error updating sale:', updateError);
        throw updateError;
      }
      
      console.log(`[Hotmart Webhook] Updated existing sale ${transactionId} to status ${status}`);
    } else {
      const { error: insertError } = await supabase
        .from('sales')
        .insert([saleData]);
      
      if (insertError) {
        console.error('[Hotmart Webhook] Error inserting sale:', insertError);
        throw insertError;
      }
      
      console.log(`[Hotmart Webhook] Inserted new sale ${transactionId} with status ${status}`);
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Webhook processed successfully',
      transaction_id: transactionId,
      status: status
    });
    
  } catch (error) {
    console.error('[Hotmart Webhook] Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function extractParam(str, param) {
  if (!str) return '';
  const regex = new RegExp(`[?&]${param}=([^&]+)`);
  const match = str.match(regex);
  return match ? decodeURIComponent(match[1]) : '';
}
