// utils/upload.ts
import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_TOTAL_SIZE = 30 * 1024 * 1024; // 30MB
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/heic'];
export const MAX_FILES = 3;

export interface UploadResult {
  success: boolean;
  urls: string[];
  error?: string;
}

export async function uploadImages(files: File[]): Promise<UploadResult> {
  try {
    console.log('Starting upload process with files:', files.length);
    
    // Validation checks
    if (files.length > MAX_FILES) {
      console.log('Too many files:', files.length);
      return { success: false, urls: [], error: `Maximum ${MAX_FILES} files allowed` };
    }

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    console.log('Total size:', totalSize, 'bytes');
    
    if (totalSize > MAX_TOTAL_SIZE) {
      console.log('Total size too large:', totalSize);
      return { success: false, urls: [], error: 'Total file size exceeds 30MB' };
    }

    for (const file of files) {
      console.log('Checking file:', file.name, 'Size:', file.size, 'Type:', file.type);
      
      if (file.size > MAX_FILE_SIZE) {
        console.log('File too large:', file.name);
        return { success: false, urls: [], error: 'Individual file size exceeds 10MB' };
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        console.log('Invalid file type:', file.type);
        return { success: false, urls: [], error: 'Invalid file type. Please upload only images.' };
      }
    }

    // Upload files
    console.log('Starting individual file uploads');
    const uploadPromises = files.map(async (file) => {
      try {
        const filename = `${nanoid()}-${file.name}`;
        console.log('Uploading file:', filename);
        
        const blob = await put(filename, file, {
          access: 'public',
        });
        
        console.log('Upload successful for:', filename, 'URL:', blob.url);
        return blob.url;
      } catch (error) {
        console.error('Error uploading individual file:', file.name, error);
        throw error;
      }
    });

    const urls = await Promise.all(uploadPromises);
    console.log('All uploads completed successfully:', urls);
    return { success: true, urls };
  } catch (error) {
    console.error('Upload error:', error);
    return { 
      success: false, 
      urls: [], 
      error: error instanceof Error ? error.message : 'Failed to upload images. Please try again.' 
    };
  }
}