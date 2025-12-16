export interface Certificate {
  id: string;
  title: string;
  file: string;
  issuedAt: string;
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
