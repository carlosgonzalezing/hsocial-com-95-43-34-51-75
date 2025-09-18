
import { supabase } from "@/integrations/supabase/client";

export async function uploadToR2(file: File, fileName: string): Promise<string> {
  try {
    console.log('Uploading to Cloudflare R2:', { fileName, fileSize: file.size, fileType: file.type });
    // Extract user ID from auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Create FormData for the edge function
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', fileName);

    // Call the upload-to-r2 edge function
    const { data, error } = await supabase.functions.invoke('upload-to-r2', {
      body: formData
    });

    if (error) {
      console.error('R2 upload error:', error);
      throw error;
    }

    if (!data?.url) {
      throw new Error('No URL returned from R2 upload');
    }

    console.log('R2 upload successful:', { url: data.url });
    return data.url;
  } catch (error) {
    console.error('Error uploading to R2:', error);
    throw error;
  }
}

// Fallback function to upload to Supabase storage
async function uploadToSupabaseStorage(file: File, fileName: string): Promise<string> {
  try {
    console.log('Fallback: Uploading file to Supabase storage:', { fileName, fileSize: file.size, fileType: file.type });

    // Extract user ID from auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const filePath = fileName;

    // Upload to Supabase storage bucket 'media'
    const { data, error } = await supabase.storage
      .from('media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(filePath);

    console.log('Supabase fallback upload successful:', { publicUrl });
    return publicUrl;
  } catch (error) {
    console.error('Error uploading to Supabase storage:', error);
    throw error;
  }
}

export function getMediaType(file: File): 'image' | 'video' | 'audio' | null {
  if (!file) return null;
  
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/') || file.type === 'audio/webm') return 'audio';
  
  return null;
}

/**
 * Compress image before upload for better performance
 */
export async function compressImage(file: File, quality: number = 0.8): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate optimal dimensions
      const maxWidth = 1920;
      const maxHeight = 1080;
      
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/webp',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            resolve(file); // Fallback to original
          }
        },
        'image/webp',
        quality
      );
    };
    
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Upload with automatic compression for images
 */
export async function uploadWithOptimization(file: File, fileName: string): Promise<string> {
  let processedFile = file;
  
  // Compress images automatically
  if (file.type.startsWith('image/') && file.size > 500000) { // 500KB threshold
    try {
      processedFile = await compressImage(file, 0.85);
      console.log('Image compressed:', { 
        originalSize: file.size, 
        compressedSize: processedFile.size,
        reduction: Math.round(((file.size - processedFile.size) / file.size) * 100) + '%'
      });
    } catch (error) {
      console.warn('Image compression failed, using original:', error);
    }
  }
  
  return uploadToR2(processedFile, fileName);
}
