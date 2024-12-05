// pages/api/submit-lead.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import { sendMetaEvent, MetaEvent } from '../../utils/meta-api';
import { debugEvent, debugMetaResponse } from '@/utils/debug-events';
import crypto from 'crypto';

type Lead = {
    id: string;
    firstName: string;
    phone: string;
    email: string;
    doorIssue: string;
    location: string | null;
    createdAt: Date;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
    userAgent: string | null;
    ipAddress: string | null;
    imageUrls: string[];
    comments: string | null;
    secondStepAt: Date | null;
}

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
const MASTER_EMAIL = 'kevin@vandenboss.com';
const LOCATION_EMAILS: { [key: string]: string } = {
  detroit: 'jim@vandenboss.com',
  chicago: 'chicago@example.com',
  orlando: 'trevor.templin@doorrenew.com',
  providence: 'kyle.sperduti@doorrenew.com'
};

// Basic rate limiting
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 3; // Max 3 submissions per minute
const rateLimitMap = new Map<string, number[]>();

// Helper function to hash data for Meta
function hashData(data: string): string {
  return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
}

async function isRateLimited(ip: string): Promise<boolean> {
  const now = Date.now();
  const submissions = rateLimitMap.get(ip) || [];
  
  // Remove old submissions
  const recentSubmissions = submissions.filter(
    time => now - time < RATE_LIMIT_WINDOW
  );
  
  if (recentSubmissions.length >= RATE_LIMIT_MAX) {
    return true;
  }
  
  rateLimitMap.set(ip, [...recentSubmissions, now]);
  return false;
}

async function sendEmails(lead: Lead) {
  const emailContent = `
    New Lead from Door Renew Website
    
    Name: ${lead.firstName}
    Phone: ${lead.phone}
    Email: ${lead.email}
    Door Issue: ${lead.doorIssue}
    Location: ${lead.location || 'Not specified'}
    
    Lead Source: ${lead.utmSource || 'Direct'}
    Campaign: ${lead.utmCampaign || 'None'}
    Medium: ${lead.utmMedium || 'None'}
    
    Submitted at: ${lead.createdAt}
  `;

  // Send to master email
  await resend.emails.send({
    from: 'Door Renew Leads<notifications@marketvibe.app>',
    to: MASTER_EMAIL,
    subject: 'New Door Renew Lead',
    text: emailContent,
  });

  // Send to location-specific email if applicable
  if (lead.location && LOCATION_EMAILS[lead.location]) {
    await resend.emails.send({
      from: 'Door Renew Leads <notifications@marketvibe.app>',
      to: LOCATION_EMAILS[lead.location],
      subject: 'New Door Renew Lead',
      text: emailContent,
    });
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get IP for rate limiting and Meta API
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'];
    
    // Basic rate limiting
    if (await isRateLimited(ip.toString())) {
      return res.status(429).json({ error: 'Too many requests' });
    }

    const {
      firstName,
      phone,
      email,
      doorIssue,
      location,
    } = req.body;

    // Basic validation
    if (!firstName || !phone || !email || !doorIssue) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get UTM parameters and other tracking data
    const utmSource = req.query.utm_source as string;
    const utmMedium = req.query.utm_medium as string;
    const utmCampaign = req.query.utm_campaign as string;

    // Save to database
    const lead = await prisma.lead.create({
      data: {
        firstName,
        phone,
        email,
        doorIssue,
        location,
        utmSource,
        utmMedium,
        utmCampaign,
        userAgent,
        ipAddress: ip.toString(),
        imageUrls: [],
        comments: null,
        secondStepAt: null
      },
    });

    // Generate deterministic event ID for deduplication
    const eventId = `lead_${Date.now()}_${hashData(email + phone)}`;

    // Create the Meta event data
    const eventData: MetaEvent = {
      event_name: 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: req.headers.referer || '',
      action_source: 'website',
      event_id: eventId,
      user_data: {
        client_ip_address: typeof ip === 'string' ? ip : ip[0],
        client_user_agent: userAgent || undefined,
        em: email ? [email] : undefined,
        ph: phone ? [phone] : undefined,
      },
      custom_data: {
        location,
        doorIssue,
        value: 100,
        currency: 'USD',
        event_id: eventId
      }
    };

    // Add UTM parameters if they exist
    if (utmSource || utmMedium || utmCampaign) {
      eventData.custom_data = {
        ...eventData.custom_data,
        ...(utmSource && { utm_source: utmSource }),
        ...(utmMedium && { utm_medium: utmMedium }),
        ...(utmCampaign && { utm_campaign: utmCampaign })
      };
    }

    // Debug logging before sending event
    if (process.env.NODE_ENV === 'development') {
      debugEvent('Lead', eventData);
    }

    // Send event to Meta
    const metaResponse = await sendMetaEvent(eventData);

    // Debug logging for Meta API response in development
    if (process.env.NODE_ENV === 'development') {
      debugMetaResponse(metaResponse);
      console.log('Meta API complete response:', JSON.stringify(metaResponse, null, 2));
    }

    // Send notification emails
    await sendEmails(lead);

    // Return success response
    res.status(200).json({ 
      success: true,
      leadId: lead.id,
      eventId: eventId
    });

  } catch (error) {
    console.error('Error processing lead:', error);
    
    // Send appropriate error response
    if (error instanceof Error) {
      res.status(500).json({ 
        error: 'Internal server error', 
        message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred while processing your request'
      });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}