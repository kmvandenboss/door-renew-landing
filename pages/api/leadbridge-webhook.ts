import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
const MASTER_EMAIL = 'kevin@vandenboss.com';
const LOCATION_EMAILS: { [key: string]: string } = {
  orlando: 'trevor.templin@doorrenew.com',
  providence: 'kyle.sperduti@doorrenew.com',
};

interface FormConfig {
  location: string;
  leadType: 'door' | 'cabinet';
}

interface LeadBridgeData {
  form_id?: string;
  form_name?: string;
  full_name?: string;
  name?: string;
  phone_number?: string;
  phone?: string;
  email?: string;
  campaign_name?: string;
  ad_name?: string;
  platform?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  secret?: string;
}

// Map Facebook form IDs to locations and lead types
const FORM_CONFIG: { [key: string]: FormConfig } = {
  // Orlando forms
  '1248830573015854': { location: 'orlando', leadType: 'door' },
  '3844541842467999': { location: 'orlando', leadType: 'cabinet' },

  // Providence forms
  '946695224044577': { location: 'providence', leadType: 'cabinet' },
};

function getFormConfig(leadData: LeadBridgeData): FormConfig | null {
  return leadData.form_id && FORM_CONFIG[leadData.form_id]
    ? FORM_CONFIG[leadData.form_id]
    : null;
}

async function sendEmailNotifications(leadData: LeadBridgeData, formConfig: FormConfig | null) {
  const { location, leadType } = formConfig || {};
  const emailContent = `
    New ${leadType?.toUpperCase() || 'Unknown'} Lead from Facebook (via LeadBridge)
    
    Location: ${location?.toUpperCase() || 'Unknown'}
    Lead Type: ${leadType?.toUpperCase() || 'Unknown'}
    
    Contact Information:
    Name: ${leadData.full_name || leadData.name || 'Not provided'}
    Phone: ${leadData.phone_number || leadData.phone || 'Not provided'}
    Email: ${leadData.email || 'Not provided'}
    
    Campaign: ${leadData.campaign_name || 'Not specified'}
    Ad: ${leadData.ad_name || 'Not specified'}
    Form ID: ${leadData.form_id || 'Unknown'}
  `;

  // Always send to the master email
  await resend.emails.send({
    from: 'Door Renew Leads <notifications@marketvibe.app>',
    to: MASTER_EMAIL,
    subject: `New ${leadType?.toUpperCase() || 'Unknown'} Lead - ${location?.toUpperCase() || 'Unknown'}`,
    text: emailContent,
  });

  // Send to location-specific email if applicable
  if (location && LOCATION_EMAILS[location]) {
    await resend.emails.send({
      from: 'Door Renew Leads <notifications@marketvibe.app>',
      to: LOCATION_EMAILS[location],
      subject: `New ${leadType?.toUpperCase() || 'Unknown'} Lead - ${location?.toUpperCase() || 'Unknown'}`,
      text: emailContent,
    });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('Webhook received:', { method: req.method, headers: req.headers });

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-leadbridge-token');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    console.error('Invalid method:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the payload
    const leadData: LeadBridgeData = req.body?.body || req.body?.DATA || req.body;
    console.log('Parsed lead data:', leadData);

    // Token verification
    //const token = leadData.secret || req.headers['x-leadbridge-token'];
    //if (token !== process.env.LEADBRIDGE_SECRET_TOKEN) {
      //console.error('Token mismatch:', { receivedToken: token, expectedToken: process.env.LEADBRIDGE_SECRET_TOKEN });
      //return res.status(403).json({ error: 'Invalid token' });
    //}

    // Get form configuration
    const formConfig = getFormConfig(leadData);

    // Save to database
    const lead = await prisma.lead.create({
      data: {
        firstName: leadData.full_name || leadData.name || '',
        phone: (leadData.phone_number || leadData.phone || '').replace(/^\+/, ''),
        email: leadData.email || null,
        location: formConfig?.location || null,
        leadType: formConfig?.leadType || null,
        source: 'facebook_leadbridge',
        campaignName: leadData.campaign_name || null,
        adName: leadData.ad_name || null,
        formId: leadData.form_id || null,
        formName: leadData.form_name || null,
      },
    });

    console.log('Lead saved:', lead);

    // Send email notifications
    await sendEmailNotifications(leadData, formConfig);
    console.log('Notifications sent');

    return res.status(200).json({ success: true, leadId: lead.id });
} catch (error) {
    if (error instanceof Error) {
      console.error('Webhook error:', {
        error: error.message,
        stack: error.stack,
      });
      return res.status(500).json({
        error: 'Internal server error',
        details: error.message,
      });
    } else {
      console.error('Unexpected error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        details: 'An unknown error occurred',
      });
    }
  }
}
