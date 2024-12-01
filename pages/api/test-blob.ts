// pages/api/test-blob.ts
import { put } from '@vercel/blob';
import { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  try {
    if (request.method !== 'GET') {
      return response.status(405).json({ error: 'Method not allowed' });
    }

    const blob = await put('test.txt', 'Hello World!', {
      access: 'public',
    });

    return response.status(200).json({
      success: true,
      url: blob.url,
      message: "Blob storage is working correctly!"
    });
  } catch (error) {
    console.error('Blob test error:', error);
    return response.status(500).json({ 
      success: false,
      error: 'Failed to test blob storage',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

console.log('Token exists:', !!process.env.BLOB_READ_WRITE_TOKEN);
console.log('Token first 10 chars:', process.env.BLOB_READ_WRITE_TOKEN?.substring(0, 10));