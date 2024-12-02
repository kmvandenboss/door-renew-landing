// pages/api/track-event.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { sendMetaEvent } from '../../utils/meta-api';

const EVENT_NAME_MAP: { [key: string]: string } = {
  FormStart: 'InitiateCheckout',
  FormSubmit: 'Lead',
  FormAbandon: 'FormAbandon',
  CallButtonClick: 'Contact'
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { eventName, location, url, ...additionalData } = req.body;
    
    // Debug logging
    console.log('Tracking event:', {
      eventName,
      location,
      url,
      additionalData
    });
    
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'];

    const result = await sendMetaEvent({
      event_name: EVENT_NAME_MAP[eventName] || eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: url,
      action_source: 'website',
      user_data: {
        client_ip_address: typeof ip === 'string' ? ip : ip[0],
        client_user_agent: userAgent || undefined,
      },
      custom_data: {
        location,
        ...additionalData
      }
    });

    console.log('Meta API response for event:', result);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error tracking event:', error);
    res.status(500).json({ 
      error: 'Failed to track event',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}