import { createClient } from '@supabase/supabase-js'

// ===================================
// DUAL CLIENT PATTERN
// ===================================

// Public client (anon key) - Read-only via RLS
export function getSupabaseClient() {
  const supabaseUrl = process.env. NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env. NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || ! supabaseKey) {
    console.error('❌ Supabase public env vars not set!')
    throw new Error('Supabase public configuration missing.  Check .env.local file.')
  }

  return createClient(supabaseUrl, supabaseKey)
}

// Admin client (service_role key) - Full access
export function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Supabase admin env vars not set!')
    console.error('Make sure SUPABASE_SERVICE_ROLE_KEY is in .env.local')
    throw new Error('Supabase admin configuration missing.')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth:  {
      autoRefreshToken:  false,
      persistSession: false
    }
  })
}

// Export default public client for convenience
export const supabase = getSupabaseClient()

// ===================================
// DATABASE TYPES
// ===================================

export type DbUser = {
  id: string
  email: string
  name: string
  password_hash: string
  role: 'admin' | 'user'
  status: string
  created_at: string
  updated_at: string
}

export type DbCertificate = {
  id: string
  user_id: string
  cert_number: string
  intern_name:  string
  position: string
  start_date: string
  end_date: string
  pdf_url: string
  created_at: string
  updated_at:  string
}

// ===================================
// LEGACY TYPES (for compatibility)
// ===================================

export interface Certificate {
  id: string;
  title: string;
  file: string;
  issuedAt: string;
  expiryDate?:  string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  status: string;
  certificates: Certificate[];
}

// ===================================
// CONVERSION HELPERS
// ===================================

// Helper to convert DB certificate to legacy format
export function dbCertificateToLegacy(dbCert: DbCertificate): Certificate {
  // Extract filename from pdf_url (could be just filename or full path)
  let fileName = dbCert.pdf_url;
  if (fileName.includes('/')) {
    fileName = fileName.split('/').pop() || fileName;
  }
  
  return {
    id: dbCert.id,
    title: `${dbCert.position} - ${dbCert.intern_name}`,
    file: fileName,
    issuedAt: dbCert.start_date,
    expiryDate:  dbCert.end_date,
  }
}

// Helper to convert DB user to legacy format
export function dbUserToLegacy(dbUser: DbUser, certificates: Certificate[] = []): User {
  return {
    id: dbUser. id,
    name: dbUser.name,
    email: dbUser.email,
    password: dbUser.password_hash,
    role: dbUser.role,
    status: dbUser.status,
    certificates,
  }
}