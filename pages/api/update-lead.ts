import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { leadId, email, imageUrls, comments, doorIssue } = req.body;

    console.log('Received update request for leadId:', leadId); // Debug logging

    if (!leadId) {
      console.log('No leadId provided in request'); // Debug logging
      return res.status(400).json({ error: 'Lead ID is required' });
    }

    // Find the lead using leadId
    const lead = await prisma.lead.findUnique({
      where: {
        id: leadId
      }
    });

    if (!lead) {
      console.log('Lead not found with ID:', leadId); // Debug logging
      return res.status(404).json({ error: 'Lead not found' });
    }

    console.log('Found lead:', lead); // Debug logging

    // Update the lead with new information
    const updatedLead = await prisma.lead.update({
      where: {
        id: leadId
      },
      data: {
        email: email || null,
        doorIssue: doorIssue || null,
        imageUrls: imageUrls || [],
        comments: comments || '',
        secondStepAt: new Date()
      }
    });

    // Create email content
    const emailContent = `
    Additional Information Submitted for Lead
    
    Name: ${updatedLead.firstName}
    Phone: ${updatedLead.phone}
    Email: ${updatedLead.email}
    Door Issue: ${updatedLead.doorIssue}
    Location: ${updatedLead.location || 'Not specified'}
    
    Comments: ${updatedLead.comments || 'No comments provided'}
    
    Images: ${updatedLead.imageUrls && updatedLead.imageUrls.length > 0 ? '\n' + updatedLead.imageUrls.join('\n') : 'No images uploaded'}
    
    Original Submission: ${updatedLead.createdAt}
    Updated: ${updatedLead.secondStepAt?.toISOString() || new Date().toISOString()}
    `;

    // Send to master email
    await resend.emails.send({
      from: 'Door Renew Leads <notifications@marketvibe.app>',
      to: MASTER_EMAIL,
      subject: 'Additional Information - Door Renew Lead',
      text: emailContent,
    });

    // Send to location-specific email if applicable
    if (updatedLead.location && LOCATION_EMAILS[updatedLead.location]) {
      await resend.emails.send({
        from: 'Door Renew Leads <notifications@marketvibe.app>',
        to: LOCATION_EMAILS[updatedLead.location],
        subject: 'Additional Information - Door Renew Lead',
        text: emailContent,
      });
    }

    console.log('Successfully updated lead and sent notifications'); // Debug logging

    res.status(200).json({ 
      success: true,
      message: 'Lead updated successfully and notifications sent'
    });
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}