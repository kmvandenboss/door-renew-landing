// pages/api/update-lead.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration - reusing from submit-lead.ts
const MASTER_EMAIL = 'kevin@vandenboss.com';
const LOCATION_EMAILS: { [key: string]: string } = {
  detroit: 'jim@vandenboss.com',
  chicago: 'chicago@example.com',
  orlando: 'trevor.templin@doorrenew.com',
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, imageUrls, comments } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required to match the lead' });
    }

    // Find the existing lead
    const lead = await prisma.lead.findFirst({
      where: {
        email: email
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // Update the lead with new information
    const updatedLead = await prisma.lead.update({
      where: {
        id: lead.id
      },
      data: {
        imageUrls: imageUrls || [],
        comments: comments || '',
        secondStepAt: new Date()
      }
    });

    // Create email content
    const emailContent = `
    Additional Information Submitted for Lead
    
    Name: ${lead.firstName}
    Phone: ${lead.phone}
    Email: ${lead.email}
    Door Issue: ${lead.doorIssue}
    Location: ${lead.location || 'Not specified'}
    
    Comments: ${comments || 'No comments provided'}
    
    Images: ${imageUrls && imageUrls.length > 0 ? '\n' + imageUrls.join('\n') : 'No images uploaded'}
    
    Original Submission: ${lead.createdAt}
    Updated: ${new Date().toISOString()}
    `;

    // Send to master email
    await resend.emails.send({
      from: 'Door Renew Leads <notifications@marketvibe.app>',
      to: MASTER_EMAIL,
      subject: 'Additional Information - Door Renew Lead',
      text: emailContent,
    });

    // Send to location-specific email if applicable
    if (lead.location && LOCATION_EMAILS[lead.location]) {
      await resend.emails.send({
        from: 'Door Renew Leads <notifications@marketvibe.app>',
        to: LOCATION_EMAILS[lead.location],
        subject: 'Additional Information - Door Renew Lead',
        text: emailContent,
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}