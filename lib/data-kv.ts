// Data module - Uses Supabase for database storage

import { supabase, dbUserToLegacy, dbCertificateToLegacy, DbUser, DbCertificate } from './supabase';
import { User, Certificate } from './types';

export async function getUsers(): Promise<User[]> {
  try {
    const { data: dbUsers, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching users from Supabase:', error);
      return [];
    }

    if (!dbUsers) return [];

    // Get certificates for all users
    const userIds = dbUsers.map(u => u.id);
    const { data: dbCertificates } = await supabase
      .from('certificates')
      .select('*')
      .in('user_id', userIds);

    // Convert to legacy format
    const users: User[] = dbUsers.map((dbUser: DbUser) => {
      const userCerts = (dbCertificates || [])
        .filter((c: DbCertificate) => c.user_id === dbUser.id)
        .map(dbCertificateToLegacy);
      return dbUserToLegacy(dbUser, userCerts);
    });

    return users;
  } catch (error) {
    console.error('Error in getUsers:', error);
    return [];
  }
}

export async function getUserById(id: string): Promise<User | undefined> {
  try {
    const { data: dbUser, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !dbUser) {
      return undefined;
    }

    // Get user's certificates
    const { data: dbCertificates } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', id);

    const certificates = (dbCertificates || []).map(dbCertificateToLegacy);
    return dbUserToLegacy(dbUser, certificates);
  } catch (error) {
    console.error('Error in getUserById:', error);
    return undefined;
  }
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  try {
    const { data: dbUser, error } = await supabase
      .from('users')
      .select('*')
      .ilike('email', email)
      .single();

    if (error || !dbUser) {
      return undefined;
    }

    // Get user's certificates
    const { data: dbCertificates } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', dbUser.id);

    const certificates = (dbCertificates || []).map(dbCertificateToLegacy);
    return dbUserToLegacy(dbUser, certificates);
  } catch (error) {
    console.error('Error in getUserByEmail:', error);
    return undefined;
  }
}

export async function saveUsers(users: User[]): Promise<boolean> {
  // This function is deprecated in Supabase version
  // Use addUser, updateUser, deleteUser instead
  console.warn('saveUsers is deprecated - use specific CRUD functions');
  return false;
}

export async function addUser(user: User): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email,
        name: user.name,
        password_hash: user.password,
        role: user.role,
        status: user.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error adding user to Supabase:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in addUser:', error);
    return false;
  }
}

export async function updateUser(id: string, updates: Partial<User>): Promise<boolean> {
  try {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.name) updateData.name = updates.name;
    if (updates.email) updateData.email = updates.email;
    if (updates.password) updateData.password_hash = updates.password;
    if (updates.status) updateData.status = updates.status;
    if (updates.role) updateData.role = updates.role;

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating user in Supabase:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateUser:', error);
    return false;
  }
}

export async function deleteUser(id: string): Promise<boolean> {
  try {
    // Delete user (certificates will be cascade deleted by database FK constraint)
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting user from Supabase:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteUser:', error);
    return false;
  }
}

export function generateUserId(): string {
  // Use crypto.randomUUID() for better unique IDs compatible with Supabase UUID
  return crypto.randomUUID();
}

export function generateCertificateId(): string {
  // Use crypto.randomUUID() for better unique IDs compatible with Supabase UUID
  return crypto.randomUUID();
}

// Helper to add certificate to user
export async function addCertificate(userId: string, certificate: Certificate): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('certificates')
      .insert({
        id: certificate.id,
        user_id: userId,
        cert_number: certificate.id, // Use cert ID as cert number
        intern_name: certificate.title.split(' - ')[0] || certificate.title,
        position: certificate.title,
        start_date: certificate.issuedAt,
        end_date: certificate.expiryDate || certificate.issuedAt,
        pdf_url: certificate.file,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error adding certificate to Supabase:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in addCertificate:', error);
    return false;
  }
}

// Helper to delete certificate
export async function deleteCertificate(certId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('certificates')
      .delete()
      .eq('id', certId);

    if (error) {
      console.error('Error deleting certificate from Supabase:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteCertificate:', error);
    return false;
  }
}

// Helper to get certificate by ID
export async function getCertificateById(certId: string): Promise<Certificate | undefined> {
  try {
    const { data: dbCert, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('id', certId)
      .single();

    if (error || !dbCert) {
      return undefined;
    }

    return dbCertificateToLegacy(dbCert);
  } catch (error) {
    console.error('Error in getCertificateById:', error);
    return undefined;
  }
}
