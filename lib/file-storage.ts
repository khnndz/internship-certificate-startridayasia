import { getSupabaseClient, getSupabaseAdmin } from './supabase';

const BUCKET_NAME = 'certificates';

// ===================================
// FILE OPERATIONS (use admin client for write)
// ===================================

/**
 * Simpan file certificate ke Supabase Storage
 */
export async function saveCertificateFile(fileName: string, content: Buffer): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin(); // ✅ Use admin client for upload
    
    console.log('📤 [STORAGE] Uploading file:', fileName);
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, content, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (error) {
      console.error('❌ [STORAGE] Error uploading to Supabase Storage:', error);
      return false;
    }

    console.log('✅ [STORAGE] File uploaded successfully');
    return true;
  } catch (error) {
    console.error('❌ [STORAGE] Exception in saveCertificateFile:', error);
    return false;
  }
}

/**
 * Baca file certificate dari Supabase Storage
 */
export async function getCertificateFile(fileName: string): Promise<Buffer | null> {
  try {
    const supabase = getSupabaseClient(); // Public client for read
    
    console.log('📥 [STORAGE] Downloading file:', fileName);
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(fileName);

    if (error) {
      console.error('❌ [STORAGE] Error downloading from Supabase Storage:', error);
      return null;
    }

    if (!data) {
      console.log('❌ [STORAGE] File not found');
      return null;
    }

    // Convert Blob to Buffer
    const arrayBuffer = await data.arrayBuffer();
    console.log('✅ [STORAGE] File downloaded successfully');
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('❌ [STORAGE] Exception in getCertificateFile:', error);
    return null;
  }
}

/**
 * Hapus file certificate dari Supabase Storage
 */
export async function deleteCertificateFile(fileName: string): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin(); // ✅ Use admin client for delete
    
    console.log('🗑️ [STORAGE] Deleting file:', fileName);
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([fileName]);

    if (error) {
      console.error('❌ [STORAGE] Error deleting from Supabase Storage:', error);
      return false;
    }

    console.log('✅ [STORAGE] File deleted successfully');
    return true;
  } catch (error) {
    console.error('❌ [STORAGE] Exception in deleteCertificateFile:', error);
    return false;
  }
}

/**
 * Cek apakah file certificate ada di Supabase Storage
 */
export async function certificateFileExists(fileName: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient(); // Public client for list
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', {
        search: fileName,
      });

    if (error) {
      console.error('❌ [STORAGE] Error checking file exists:', error);
      return false;
    }

    return data ?  data.some(file => file. name === fileName) : false;
  } catch (error) {
    console.error('❌ [STORAGE] Exception in certificateFileExists:', error);
    return false;
  }
}

/**
 * Get URL untuk download certificate dari Supabase Storage
 */
export function getCertificateDownloadUrl(fileName: string): string {
  // Use API route for consistent access control
  return `/api/download/${encodeURIComponent(fileName)}`;
}

/**
 * Get public URL dari Supabase Storage
 */
export function getCertificatePublicUrl(fileName: string): string {
  const supabase = getSupabaseClient();
  
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);

  return data.publicUrl;
}

/**
 * Get signed URL dari Supabase Storage (expires in 1 hour)
 */
export async function getCertificateSignedUrl(fileName: string): Promise<string | null> {
  try {
    const supabase = getSupabaseClient(); // Public client can create signed URLs
    
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(fileName, 3600); // 1 hour expiry

    if (error) {
      console.error('❌ [STORAGE] Error creating signed URL:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('❌ [STORAGE] Exception in getCertificateSignedUrl:', error);
    return null;
  }
}