import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Types for database tables
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
  intern_name: string
  position: string
  start_date: string
  end_date: string
  pdf_url: string
  created_at: string
  updated_at: string
}

// Legacy types for compatibility with existing code
export interface Certificate {
  id: string;
  title: string;
  file: string;
  issuedAt: string;
  expiryDate?: string;
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

// Helper to convert DB certificate to legacy format
export function dbCertificateToLegacy(dbCert: DbCertificate): Certificate {
  return {
    id: dbCert.id,
    title: `${dbCert.position} - ${dbCert.intern_name}`,
    file: dbCert.pdf_url.split('/').pop() || '',
    issuedAt: dbCert.start_date,
    expiryDate: dbCert.end_date,
  }
}

// Helper to convert DB user to legacy format
export function dbUserToLegacy(dbUser: DbUser, certificates: Certificate[] = []): User {
  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    password: dbUser.password_hash,
    role: dbUser.role,
    status: dbUser.status,
    certificates,
  }
}
