export interface Certificate {
  id: string;
  title: string;
  file:  string;
  issuedAt: string;
  expiryDate?:  string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password:  string;
  role: 'user' | 'admin';
  posisi: string;          // ✅ NEW: Posisi/Divisi
  periode_start: string;   // ✅ NEW: Start date (ISO format:  YYYY-MM-DD)
  periode_end: string;     // ✅ NEW: End date (ISO format: YYYY-MM-DD)
  certificates: Certificate[];
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}