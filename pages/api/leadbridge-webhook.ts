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
    // Log raw request
    console.log('Raw request received:', {
      method: req.method,
      url: req.url,
      headers: req.headers,
      rawBody: req.body,
      query: req.query
    });
  
    if (req.method === 'GET') {
      // Add simple GET response for testing
      console.log('GET request received');
      return res.status(200).json({ status: 'webhook endpoint active' });
    }
  
    if (req.method !== 'POST') {
      console.log('Invalid method:', req.method);
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    try {
      // Log the raw body content
      console.log('Raw body content:', JSON.stringify(req.body, null, 2));
  
      // Extract data from body, handling potential array format
      let leadData: LeadBridgeData;
      if (Array.isArray(req.body)) {
        console.log('Received array data:', req.body);
        leadData = req.body[0];
      } else if (req.body.body) {
        console.log('Received nested body data:', req.body.body);
        leadData = req.body.body;
      } else {
        console.log('Received direct data:', req.body);
        leadData = req.body;
      }
  
      // Log parsed lead data
      console.log('Parsed lead data:', leadData);
  
      // Check for token in various possible locations
      const headerToken = req.headers['x-leadbridge-token'];
      const bodyToken = leadData.secret || req.body.secret;
      const configuredToken = process.env.LEADBRIDGE_SECRET_TOKEN;
  
      console.log('Token check:', {
        hasHeaderToken: !!headerToken,
        hasBodyToken: !!bodyToken,
        hasConfiguredToken: !!configuredToken,
        tokenMatch: bodyToken === configuredToken || headerToken === configuredToken
      });
  
      if (configuredToken && headerToken !== configuredToken && bodyToken !== configuredToken) {
        console.error('Token mismatch');
        return res.status(403).json({ error: 'Invalid authentication token' });
      }
  
      // Get form configuration
      const formConfig = getFormConfig(leadData);
      console.log('Form config:', formConfig);
  
      // Clean phone number
      const phoneNumber = (leadData.phone_number || leadData.phone || '').replace(/^\+/, '');
      console.log('Processed phone number:', phoneNumber);
  
      // Create lead in database
      console.log('Attempting database creation with:', {
        firstName: leadData.full_name || leadData.name || '',
        phone: phoneNumber,
        email: leadData.email || null,
        location: formConfig?.location || null,
        leadType: formConfig?.leadType || null
      });
  
      const createdLead = await prisma.lead.create({
        data: {
          firstName: leadData.full_name || leadData.name || '',
          phone: phoneNumber,
          email: leadData.email || null,
          location: formConfig?.location || null,
          leadType: formConfig?.leadType || null,
          source: 'facebook_leadbridge',
          utmSource: leadData.utm_source || null,
          utmMedium: leadData.utm_medium || null,
          utmCampaign: leadData.utm_campaign || null,
          campaignName: leadData.campaign_name || null,
          adName: leadData.ad_name || null,
          formName: leadData.form_name || null,
          formId: leadData.form_id || null,
          imageUrls: [],
          comments: null
        },
      });
  
      console.log('Lead created:', createdLead);
  
      // Send email notifications
      console.log('Attempting to send email notifications');
      await sendEmailNotifications(leadData, formConfig);
      console.log('Email notifications sent');
  
      // Return success response
      const response = {
        success: true,
        location: formConfig?.location || null,
        leadType: formConfig?.leadType || null,
        formId: leadData.form_id,
        processedPhone: phoneNumber
      };
      console.log('Sending success response:', response);
      return res.status(200).json(response);
  
    } catch (error) {
      // Detailed error logging
      console.error('Webhook error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      return res.status(500).json({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  