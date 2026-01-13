// Data module - Uses Supabase with dual client pattern (public + admin)

import { 
  getSupabaseClient, 
  getSupabaseAdmin, 
  dbUserToLegacy, 
  dbCertificateToLegacy, 
  DbUser, 
  DbCertificate 
} from './supabase';
import { User, Certificate } from './types';

// ===================================
// READ OPERATIONS (use public client)
// ===================================

export async function getUsers(): Promise<User[]> {
  try {
    const supabase = getSupabaseClient(); // Public client for read
    
    const { data: dbUsers, error } = await supabase
      . from('users')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ [DATA-KV] Error fetching users:', error);
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
    const users: User[] = dbUsers.map((dbUser:  DbUser) => {
      const userCerts = (dbCertificates || [])
        .filter((c: DbCertificate) => c.user_id === dbUser.id)
        .map(dbCertificateToLegacy);
      return dbUserToLegacy(dbUser, userCerts);
    });

    return users;
  } catch (error) {
    console.error('❌ [DATA-KV] Exception in getUsers:', error);
    return [];
  }
}

export async function getUserById(id: string): Promise<User | undefined> {
  try {
    const supabase = getSupabaseClient(); // Public client for read
    
    const { data: dbUser, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !dbUser) {
      console.error('❌ [DATA-KV] Error fetching user by ID:', error);
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
    console.error('❌ [DATA-KV] Exception in getUserById:', error);
    return undefined;
  }
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  try {
    const supabase = getSupabaseClient(); // Public client for read
    
    console.log('🔍 [DATA-KV] Getting user by email:', email);
    
    const { data: dbUser, error } = await supabase
      .from('users')
      .select('*')
      .ilike('email', email)
      .single();

    if (error) {
      console.error('❌ [DATA-KV] Supabase error:', error);
      return undefined;
    }

    if (!dbUser) {
      console.log('❌ [DATA-KV] User not found');
      return undefined;
    }

    console.log('✅ [DATA-KV] User found:', { email:  dbUser.email, role: dbUser.role });

    // Get user's certificates
    const { data: dbCertificates } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', dbUser.id);

    const certificates = (dbCertificates || []).map(dbCertificateToLegacy);
    return dbUserToLegacy(dbUser, certificates);
  } catch (error) {
    console.error('❌ [DATA-KV] Exception in getUserByEmail:', error);
    return undefined;
  }
}

// ===================================
// WRITE OPERATIONS (use admin client)
// ===================================

export async function addUser(user: User): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin(); // Admin client for write
    
    console.log('📝 [DATA-KV] Adding user:', user.email);
    
    const { error } = await supabase
      .from('users')
      .insert({
        id: user. id,
        email: user.email,
        name: user.name,
        password_hash: user.password,
        role: user.role,
        status: user.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('❌ [DATA-KV] Error adding user to Supabase:', error);
      return false;
    }

    console.log('✅ [DATA-KV] User added successfully');
    return true;
  } catch (error) {
    console.error('❌ [DATA-KV] Exception in addUser:', error);
    return false;
  }
}

export async function updateUser(id: string, updates: Partial<User>): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin(); // Admin client for write
    
    console.log('📝 [DATA-KV] Updating user:', id);
    
    const updateData:  any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.name) updateData.name = updates.name;
    if (updates.email) updateData.email = updates. email;
    if (updates. password) updateData.password_hash = updates.password;
    if (updates.status) updateData.status = updates. status;
    if (updates.role) updateData.role = updates.role;

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('❌ [DATA-KV] Error updating user in Supabase:', error);
      return false;
    }

    console. log('✅ [DATA-KV] User updated successfully');
    return true;
  } catch (error) {
    console.error('❌ [DATA-KV] Exception in updateUser:', error);
    return false;
  }
}

export async function deleteUser(id: string): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin(); // Admin client for write
    
    console. log('🗑️ [DATA-KV] Deleting user:', id);
    
    // Delete user (certificates will be cascade deleted by database FK constraint)
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ [DATA-KV] Error deleting user from Supabase:', error);
      return false;
    }

    console.log('✅ [DATA-KV] User deleted successfully');
    return true;
  } catch (error) {
    console.error('❌ [DATA-KV] Exception in deleteUser:', error);
    return false;
  }
}

// ===================================
// DEPRECATED FUNCTION
// ===================================

export async function saveUsers(users: User[]): Promise<boolean> {
  // This function is deprecated in Supabase version
  // Use addUser, updateUser, deleteUser instead
  console.warn('⚠️ [DATA-KV] saveUsers is deprecated - use specific CRUD functions');
  return false;
}

// ===================================
// CERTIFICATE OPERATIONS
// ===================================

export async function addCertificate(userId: string, certificate: Certificate): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin(); // Admin client for write
    
    console.log('📝 [DATA-KV] Adding certificate for user:', userId);
    
    // Parse title to extract intern name and position
    // Expected format: "Position - Name" or just "Position"
    let intern_name = certificate.title;
    let position = certificate.title;
    
    if (certificate.title.includes(' - ')) {
      const parts = certificate. title.split(' - ');
      position = parts[0]. trim();
      intern_name = parts. slice(1).join(' - ').trim() || position;
    }
    
    const { error } = await supabase
      . from('certificates')
      .insert({
        id: certificate.id,
        user_id: userId,
        cert_number: certificate.id, // Use cert ID as cert number
        intern_name:  intern_name,
        position:  position,
        start_date:  certificate.issuedAt,
        end_date: certificate.expiryDate || certificate.issuedAt,
        pdf_url: certificate.file,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('❌ [DATA-KV] Error adding certificate to Supabase:', error);
      return false;
    }

    console.log('✅ [DATA-KV] Certificate added successfully');
    return true;
  } catch (error) {
    console.error('❌ [DATA-KV] Exception in addCertificate:', error);
    return false;
  }
}

export async function deleteCertificate(certId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin(); // Admin client for write
    
    console.log('🗑️ [DATA-KV] Deleting certificate:', certId);
    
    const { error } = await supabase
      .from('certificates')
      .delete()
      .eq('id', certId);

    if (error) {
      console.error('❌ [DATA-KV] Error deleting certificate from Supabase:', error);
      return false;
    }

    console.log('✅ [DATA-KV] Certificate deleted successfully');
    return true;
  } catch (error) {
    console.error('❌ [DATA-KV] Exception in deleteCertificate:', error);
    return false;
  }
}

export async function getCertificateById(certId: string): Promise<Certificate | undefined> {
  try {
    const supabase = getSupabaseClient(); // Public client for read
    
    const { data: dbCert, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('id', certId)
      .single();

    if (error || !dbCert) {
      console.error('❌ [DATA-KV] Error fetching certificate:', error);
      return undefined;
    }

    return dbCertificateToLegacy(dbCert);
  } catch (error) {
    console.error('❌ [DATA-KV] Exception in getCertificateById:', error);
    return undefined;
  }
}

// ===================================
// ID GENERATION HELPERS
// ===================================

export function generateUserId(): string {
  // Use crypto.randomUUID() for better unique IDs compatible with Supabase UUID
  // Requires Node.js 18.4.0+
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older Node.js versions
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function generateCertificateId(): string {
  // Use crypto.randomUUID() for better unique IDs compatible with Supabase UUID
  // Requires Node.js 18.4.0+
  if (typeof crypto !== 'undefined' && crypto. randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older Node.js versions
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}