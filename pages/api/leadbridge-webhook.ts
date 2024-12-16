import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
const MASTER_EMAIL = 'kevin@vandenboss.com';
const LOCATION_EMAILS: { [key: string]: string } = {
  orlando: 'trevor.templin@doorrenew.com',
  providence: 'kyle.sperduti@doorrenew.com'
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
  '946695224044577': { location: 'providence', leadType: 'cabinet' }
};

function getFormConfig(leadData: LeadBridgeData): FormConfig | null {
  // Try to get config from form ID
  if (leadData.form_id && FORM_CONFIG[leadData.form_id]) {
    return FORM_CONFIG[leadData.form_id];
  }
  
  return null;
}

async function sendEmailNotifications(leadData: LeadBridgeData, formConfig: FormConfig | null) {
  if (!formConfig) {
    // If no form config found, still send to master email with a warning
    const errorContent = `
    ⚠️ WARNING: Unrecognized Facebook Lead Form
    
    Received lead from unknown form ID: ${leadData.form_id}
    
    Lead Details:
    Name: ${leadData.full_name || leadData.name || 'Not provided'}
    Phone: ${leadData.phone_number || leadData.phone || 'Not provided'}
    Email: ${leadData.email || 'Not provided'}
    
    Form Details:
    Form ID: ${leadData.form_id || 'Not specified'}
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
    New ${leadType.toUpperCase()} Lead from Facebook (via LeadBridge)
    
    Location: ${location.toUpperCase()}
    Lead Type: ${leadType.toUpperCase()}
    
    Contact Information:
    Name: ${leadData.full_name || leadData.name || 'Not provided'}
    Phone: ${leadData.phone_number || leadData.phone || 'Not provided'}
    Email: ${leadData.email || 'Not provided'}
    
    Form Details:
    Form ID: ${leadData.form_id || 'Not specified'}
    Form Name: ${leadData.form_name || 'Not specified'}
    
    Campaign Details:
    Campaign: ${leadData.campaign_name || 'Not specified'}
    Ad: ${leadData.ad_name || 'Not specified'}
    Platform: ${leadData.platform || 'Facebook'}
    
    Submitted at: ${new Date().toISOString()}
  `;

  // Always send to master email
  await resend.emails.send({
    from: 'Door Renew Leads <notifications@marketvibe.app>',
    to: MASTER_EMAIL,
    subject: `New ${leadType.toUpperCase()} Lead - ${location.toUpperCase()}`,
    text: emailContent,
  });

  // Send to location-specific email
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
    // Enable CORS for LeadBridge
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
    console.log('Webhook request received:', {
      method: req.method,
      headers: req.headers,
      body: req.body,
      url: req.url
    });
  
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
  
    // Test endpoint
    if (req.method === 'GET') {
      return res.status(200).json({ status: 'webhook endpoint active' });
    }
  
    if (req.method !== 'POST') {
      console.log('Invalid method:', req.method);
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    try {
      // Log incoming data
      console.log('Raw webhook data:', JSON.stringify(req.body, null, 2));
  
      // Extract data from the LeadBridge format
      let leadData;
      if (typeof req.body === 'string') {
        try {
          leadData = JSON.parse(req.body);
        } catch (e) {
          console.log('Failed to parse string body:', e);
        }
      } else if (req.body.body) {
        leadData = req.body.body;
      } else if (req.body.DATA) {
        leadData = req.body.DATA;
      } else {
        leadData = req.body;
      }
  
      console.log('Processed lead data:', leadData);
  
      // Verify token
      const token = req.headers['x-leadbridge-token'] || leadData?.secret;
      console.log('Token verification:', {
        receivedToken: token,
        matches: token === process.env.LEADBRIDGE_SECRET_TOKEN
      });
  
      if (!token || token !== process.env.LEADBRIDGE_SECRET_TOKEN) {
        console.log('Token verification failed');
        return res.status(403).json({ error: 'Invalid token' });
      }
  
      // Process the lead
      const formConfig = FORM_CONFIG[leadData.form_id];
      console.log('Form configuration:', formConfig);
  
      const phoneNumber = (leadData.phone_number || leadData.phone || '').replace(/^\+/, '');
  
      // Create lead in database
      const lead = await prisma.lead.create({
        data: {
          firstName: leadData.full_name || leadData.name || '',
          phone: phoneNumber,
          email: leadData.email || null,
          location: formConfig?.location || null,
          leadType: formConfig?.leadType || null,
          source: 'facebook_leadbridge',
          campaignName: leadData.campaign_name || null,
          formId: leadData.form_id || null,
          formName: leadData.form_name || null,
          imageUrls: [],
          comments: null
        },
      });
  
      console.log('Lead created:', lead);
  
      // Send notification emails
      await sendEmailNotifications(leadData, formConfig);
      console.log('Notifications sent');
  
      return res.status(200).json({
        success: true,
        leadId: lead.id,
        location: formConfig?.location
      });
  
    } catch (error) {
      console.error('Webhook error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }