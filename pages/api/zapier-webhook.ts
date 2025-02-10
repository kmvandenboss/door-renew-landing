// pages/api/zapier-webhook.ts

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
  detroit: 'detroit@doorrenew.com'
};

interface FormConfig {
  location: string;
  leadType: 'door' | 'cabinet';
}

interface ZapierData {
  // Facebook Lead Form Fields
  id?: string;                    // Facebook Form ID
  created_time?: string;
  campaign_name?: string;
  ad_name?: string;
  form_name?: string;
  platform?: string;
  
  // Lead Information
  full_name?: string;
  email?: string;
  phone_number?: string;
  
  // UTM Parameters
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  
  // Zapier Security
  zapier_secret?: string;
}

// Map Facebook form IDs to locations and lead types
const FORM_CONFIG: { [key: string]: FormConfig } = {
  // Orlando forms
  '1248830573015854': { location: 'orlando', leadType: 'door' },
  '3844541842467999': { location: 'orlando', leadType: 'cabinet' },
  
  // Providence forms
  '946695224044577': { location: 'providence', leadType: 'cabinet' },
  '3059467917542329': { location: 'providence', leadType: 'door' },

  // Detroit forms
  '1169932074781994': { location: 'detroit', leadType: 'door' },
  '1130506105240869': { location: 'detroit', leadType: 'cabinet' },
};

function getFormConfig(formId: string): FormConfig | null {
  return FORM_CONFIG[formId] || null;
}

async function sendEmailNotifications(leadData: ZapierData, formConfig: FormConfig | null) {
  if (!formConfig) {
    // Send warning email for unrecognized form
    const errorContent = `
    ⚠️ WARNING: Unrecognized Facebook Lead Form
    
    Received lead from unknown form ID: ${leadData.id}
    
    Lead Details:
    Name: ${leadData.full_name || 'Not provided'}
    Phone: ${leadData.phone_number || 'Not provided'}
    Email: ${leadData.email || 'Not provided'}
    
    Form Details:
    Form ID: ${leadData.id || 'Not specified'}
    Form Name: ${leadData.form_name || 'Not specified'}
    
    Campaign Details:
    Campaign: ${leadData.campaign_name || 'Not specified'}
    Ad: ${leadData.ad_name || 'Not specified'}
    
    Raw Form Data:
    ${JSON.stringify(leadData, null, 2)}
    `;

    await resend.emails.send({
      from: 'Door Renew Leads <notifications@marketvibe.app>',
      to: MASTER_EMAIL,
      subject: '⚠️ Unknown Facebook Lead Form - Action Required',
      text: errorContent,
    });

    return;
  }

  const { location, leadType } = formConfig;
  
  const emailContent = `
    New ${leadType.toUpperCase()} Lead from Facebook (via Zapier)
    
    Location: ${location.toUpperCase()}
    Lead Type: ${leadType.toUpperCase()}
    
    Contact Information:
    Name: ${leadData.full_name || 'Not provided'}
    Phone: ${leadData.phone_number || 'Not provided'}
    Email: ${leadData.email || 'Not provided'}
    
    Form Details:
    Form ID: ${leadData.id || 'Not specified'}
    Form Name: ${leadData.form_name || 'Not specified'}
    
    Campaign Details:
    Campaign: ${leadData.campaign_name || 'Not specified'}
    Ad: ${leadData.ad_name || 'Not specified'}
    Platform: ${leadData.platform || 'Facebook'}
    
    Submitted at: ${new Date().toISOString()}
  `;

  // Send to master email
  await resend.emails.send({
    from: 'Door Renew Leads <notifications@marketvibe.app>',
    to: MASTER_EMAIL,
    subject: `New ${leadType.toUpperCase()} Lead - ${location.toUpperCase()}`,
    text: emailContent,
  });

  // Send to location-specific email if configured
  if (LOCATION_EMAILS[location]) {
    await resend.emails.send({
      from: 'Door Renew Leads <notifications@marketvibe.app>',
      to: LOCATION_EMAILS[location],
      subject: `New ${leadType.toUpperCase()} Lead - ${location.toUpperCase()}`,
      text: emailContent,
    });
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Zapier-Secret');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Log incoming request for debugging
  console.log('Webhook request received:', {
    method: req.method,
    headers: req.headers,
    body: req.body,
    query: req.query
  });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const leadData: ZapierData = req.body;

    // Verify Zapier secret token
    const zapierToken = leadData.zapier_secret || req.headers['x-zapier-secret'];
    const configuredToken = process.env.ZAPIER_SECRET_TOKEN;

    if (configuredToken && zapierToken !== configuredToken) {
      console.error('Invalid Zapier token');
      return res.status(403).json({ error: 'Invalid authentication token' });
    }

    // Get form configuration
    const formConfig = leadData.id ? getFormConfig(leadData.id) : null;

    // Clean phone number
    const phoneNumber = (leadData.phone_number || '').replace(/^\+/, '');

    // Create lead in database
    const createdLead = await prisma.lead.create({
      data: {
        firstName: leadData.full_name || '',
        phone: phoneNumber,
        email: leadData.email || null,
        location: formConfig?.location || null,
        leadType: formConfig?.leadType || null,
        source: 'facebook_zapier',
        utmSource: leadData.utm_source || null,
        utmMedium: leadData.utm_medium || null,
        utmCampaign: leadData.utm_campaign || null,
        campaignName: leadData.campaign_name || null,
        adName: leadData.ad_name || null,
        formName: leadData.form_name || null,
        formId: leadData.id || null,
        imageUrls: [],
        comments: null
      },
    });

    // Send email notifications
    await sendEmailNotifications(leadData, formConfig);

    // Return success response
    return res.status(200).json({
      success: true,
      leadId: createdLead.id,
      location: formConfig?.location || null,
      leadType: formConfig?.leadType || null,
      formId: leadData.id
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}