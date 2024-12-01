// pages/api/submit-lead.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import { sendMetaEvent } from '../../utils/meta-api';

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get IP for rate limiting
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

    // Send event to Meta
    const metaResponse = await sendMetaEvent({
      event_name: 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: req.headers.referer || '',
      action_source: 'website',
      user_data: {
        client_ip_address: typeof ip === 'string' ? ip : ip[0],
        client_user_agent: userAgent || undefined,
      },
      custom_data: {
        location,
        doorIssue,
        value: 100, // You can adjust this value based on your lead value estimation
        currency: 'USD'
      }
    });

    console.log('Meta API response for lead:', metaResponse);

    // Send emails
    await sendEmails(lead);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing lead:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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
  // Create email content
  const emailContent = `
    New Lead from Door Renew Website
    
    Name: ${lead.firstName}
    Phone: ${lead.phone}
    Email: ${lead.email}
    Door Issue: ${lead.doorIssue}
    Location: ${lead.location || 'Not specified'}
    
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