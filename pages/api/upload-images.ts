// pages/api/upload-images.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { put } from '@vercel/blob';
import formidable from 'formidable';
import { createReadStream } from 'fs';
import { nanoid } from 'nanoid';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      maxFiles: 3,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    const [, files] = await form.parse(req); // Using underscore to indicate intentionally unused variable
    const uploadedFiles = Array.isArray(files.images) ? files.images : [];

    if (uploadedFiles.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const urls = await Promise.all(
      uploadedFiles.map(async (file) => {
        const stream = createReadStream(file.filepath);
        const filename = `${nanoid()}-${file.originalFilename}`;
        
        const blob = await put(filename, stream, {
          access: 'public',
        });

        return blob.url;
      })
    );

    return res.status(200).json({ success: true, urls });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      error: 'Failed to upload images',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}