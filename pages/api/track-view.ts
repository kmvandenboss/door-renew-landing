// pages/api/track-view.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { sendMetaEvent } from '../../utils/meta-api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { location, url } = req.body;
    
    // Debug logging
    console.log('Tracking page view:', {
      location,
      url,
      pixelId: process.env.META_PIXEL_ID,
      hasAccessToken: !!process.env.META_ACCESS_TOKEN
    });
    
    // Get IP and user agent
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'];

    // Debug logging
    console.log('Request details:', {
      ip,
      userAgent
    });

    // Send event to Meta
    const result = await sendMetaEvent({
      event_name: 'ViewContent',
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: url,
      action_source: 'website',
      user_data: {
        client_ip_address: typeof ip === 'string' ? ip : ip[0],
        client_user_agent: userAgent || undefined,
      },
      custom_data: {
        location: location,
      }
    });

    // Debug logging
    console.log('Meta API response:', result);

    res.status(200).json({ success: true });
  } catch (error) {
    // Debug logging
    console.error('Error tracking view:', error);
    
    res.status(500).json({ 
      error: 'Failed to track view',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}