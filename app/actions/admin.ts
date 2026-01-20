'use server';

import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { getUsers, generateUserId, generateCertificateId, addCertificate, deleteCertificate, getCertificateById, addUser, updateUser, deleteUser } from '@/lib/data-kv';
import { User, Certificate } from '@/lib/types';
import { getSession } from '@/lib/auth';
import { saveCertificateFile, deleteCertificateFile } from '@/lib/file-storage';

// ===================================
// HELPER FUNCTIONS
// ===================================

// Helper:  Sanitize string input
function sanitizeInput(input: string | null, maxLength: number = 255): string {
  if (!input) return '';
  return input.trim().slice(0, maxLength);
}

// Helper:  Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

// Helper:  Validate date format (YYYY-MM-DD)
function isValidDate(dateString: string): boolean {
  if (!dateString) return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

// Helper: Check admin session
async function requireAdmin(): Promise<{ error?: string; session?: any }> {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    return { error: 'Unauthorized:  Admin access required' };
  }
  return { session };
}

// ===================================
// USER MANAGEMENT ACTIONS
// ===================================

export async function createUserAction(formData: FormData) {
  const { error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const name = sanitizeInput(formData.get('name') as string, 100);
  const email = sanitizeInput(formData.get('email') as string, 255).toLowerCase();
  const password = formData.get('password') as string;
  const posisi = sanitizeInput(formData.get('posisi') as string, 100);
  const periode_start = sanitizeInput(formData.get('periode_start') as string, 20);
  const periode_end = sanitizeInput(formData.get('periode_end') as string, 20);

  // Validation
  if (!name || !email || !password) {
    return { error: 'Name, email, and password are required' };
  }

  if (!isValidEmail(email)) {
    return { error: 'Invalid email format' };
  }

  if (password.length < 6 || password.length > 128) {
    return { error: 'Password must be 6-128 characters' };
  }

  if (!posisi) {
    return { error: 'Position/division is required' };
  }

  if (!periode_start || !periode_end) {
    return { error: 'Internship period is required (start and end dates)' };
  }

  if (!isValidDate(periode_start) || !isValidDate(periode_end)) {
    return { error: 'Invalid date format' };
  }

  if (new Date(periode_start) > new Date(periode_end)) {
    return { error: 'Start date must be before end date' };
  }

  const users = await getUsers();

  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { error: 'Email already registered' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser: User = {
    id: generateUserId(),
    name,
    email,
    password: hashedPassword,
    role: 'user',
    posisi,
    periode_start,
    periode_end,
    certificates: [],
  };

  const saved = await addUser(newUser);

  if (!saved) {
    return { error: 'Failed to save user' };
  }

  revalidatePath('/admin/users');
  return { success: true, message: 'User successfully added', userId: newUser.id };
}

export async function updateUserAction(formData: FormData) {
  const { error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const id = sanitizeInput(formData.get('id') as string, 50);
  const name = sanitizeInput(formData.get('name') as string, 100);
  const email = sanitizeInput(formData.get('email') as string, 255).toLowerCase();
  const password = formData.get('password') as string;
  const posisi = sanitizeInput(formData.get('posisi') as string, 100);
  const periode_start = sanitizeInput(formData.get('periode_start') as string, 20);
  const periode_end = sanitizeInput(formData.get('periode_end') as string, 20);

  if (!id || !name || !email) {
    return { error: 'Incomplete data' };
  }

  if (!isValidEmail(email)) {
    return { error: 'Invalid email format' };
  }

  if (password && (password.length < 6 || password.length > 128)) {
    return { error: 'Password must be 6-128 characters' };
  }

  if (periode_start && !isValidDate(periode_start)) {
    return { error: 'Invalid start date format' };
  }

  if (periode_end && !isValidDate(periode_end)) {
    return { error: 'Invalid end date format' };
  }

  if (periode_start && periode_end && new Date(periode_start) > new Date(periode_end)) {
    return { error: 'Start date must be before end date' };
  }

  const users = await getUsers();
  const userIndex = users.findIndex(u => u.id === id);

  if (userIndex === -1) {
    return { error: 'User not found' };
  }

  const emailExists = users.some(
    u => u.email.toLowerCase() === email.toLowerCase() && u.id !== id
  );

  if (emailExists) {
    return { error: 'Email already used by another user' };
  }

  const updates: Partial<User> = {
    name,
    email,
  };

  if (posisi) updates.posisi = posisi;
  if (periode_start) updates.periode_start = periode_start;
  if (periode_end) updates.periode_end = periode_end;

  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    updates.password = hashedPassword;
  }

  const saved = await updateUser(id, updates);

  if (!saved) {
    return { error: 'Failed to save changes' };
  }

  revalidatePath('/admin/users');
  return { success: true, message: 'User successfully updated' };
}

export async function deleteUserAction(formData: FormData) {
  const { error: authError, session } = await requireAdmin();
  if (authError) return { error: authError };

  const id = sanitizeInput(formData.get('id') as string, 50);

  if (!id) {
    return { error: 'Invalid user ID' };
  }

  // Prevent admin from deleting themselves
  if (session?.id === id) {
    return { error: 'Cannot delete your own account' };
  }

  const users = await getUsers();
  const userToDelete = users.find(u => u.id === id);

  if (!userToDelete) {
    return { error: 'User not found' };
  }

  // Delete certificate files from storage
  const certificateFiles = (userToDelete.certificates || [])
    .map(c => c.file)
    .filter((fileName): fileName is string => typeof fileName === 'string' && fileName.length > 0);

  for (const fileName of certificateFiles) {
    try {
      await deleteCertificateFile(fileName);
    } catch (error) {
      console.error('Error deleting certificate file:', error);
    }
  }

  // Delete user (will cascade delete certificates in database)
  const saved = await deleteUser(id);

  if (!saved) {
    return { error: 'Failed to delete user' };
  }

  revalidatePath('/admin/users');
  return { success: true, message: 'User successfully deleted' };
}

// ===================================
// ADMIN PROFILE ACTIONS
// ===================================

export async function updateAdminProfileAction(formData: FormData) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return { error: 'Unauthorized' };
  }

  const name = (formData.get('name') as string) || '';
  const email = (formData.get('email') as string) || '';
  const password = (formData.get('password') as string) || '';

  if (!name || !email) {
    return { error: 'Name and email are required' };
  }

  const users = await getUsers();
  const userIndex = users.findIndex(u => u.id === session.id);

  if (userIndex === -1) {
    return { error: 'User not found' };
  }

  const emailExists = users.some(
    u => u.email.toLowerCase() === email.toLowerCase() && u.id !== session.id
  );

  if (emailExists) {
    return { error: 'Email already used by another user' };
  }

  const updates: Partial<User> = {
    name,
    email,
  };

  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    updates.password = hashedPassword;
  }

  const saved = await updateUser(session.id, updates);

  if (!saved) {
    return { error: 'Failed to save profile changes' };
  }

  revalidatePath('/admin/profile');
  revalidatePath('/admin');
  return { success: true, message: 'Profile successfully updated' };
}

// ===================================
// CERTIFICATE MANAGEMENT ACTIONS
// ===================================

export async function uploadCertificateAction(formData: FormData) {
  const { error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const userId = sanitizeInput(formData.get('userId') as string, 50);
  const title = sanitizeInput(formData.get('title') as string, 200);
  const expiryDate = sanitizeInput(formData.get('expiryDate') as string, 20);
  const files = formData
    .getAll('file')
    .filter((f): f is File => typeof (f as any)?.arrayBuffer === 'function' && typeof (f as any)?.name === 'string');

  if (!userId || !title || files.length === 0) {
    return { error: 'All fields are required' };
  }

  // Validate file extensions
  if (files.some((f) => !f.name.toLowerCase().endsWith('.pdf'))) {
    return { error: 'File must be in PDF format' };
  }

  // Validate file sizes (max 10MB per file)
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  if (files.some((f) => f.size > MAX_FILE_SIZE)) {
    return { error: 'Maximum file size is 10MB per file' };
  }

  // Limit number of files per upload
  if (files.length > 10) {
    return { error: 'Maximum 10 files per upload' };
  }

  const users = await getUsers();
  const user = users.find(u => u.id === userId);

  if (!user) {
    return { error: 'User not found' };
  }

  const timestamp = Date.now();
  const sanitizedName = user.name.toLowerCase().replace(/\s+/g, '-');

  const issuedAt = new Date().toISOString().split('T')[0];
  const newCertificates: Certificate[] = [];
  const writtenFiles: string[] = [];

  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = `${sanitizedName}-${timestamp}-${randomUUID()}.pdf`;

      const buffer = Buffer.from(await file.arrayBuffer());
      const saved = await saveCertificateFile(fileName, buffer);

      if (!saved) {
        throw new Error(`Failed to save file: ${fileName}`);
      }

      writtenFiles.push(fileName);

      const certTitle = files.length > 1 ? `${title} (${i + 1})` : title;
      const certificate: Certificate = {
        id: generateCertificateId(),
        title: certTitle,
        file: fileName,
        issuedAt,
        ...(expiryDate && { expiryDate }),
      };

      newCertificates.push(certificate);

      // Add certificate to database
      const certSaved = await addCertificate(userId, certificate);
      if (!certSaved) {
        throw new Error(`Failed to save certificate metadata: ${fileName}`);
      }
    }
  } catch (error) {
    // Rollback:  delete written files
    for (const fileName of writtenFiles) {
      try {
        await deleteCertificateFile(fileName);
      } catch { }
    }
    console.error('Error saving file:', error);
    return { error: 'Failed to save file' };
  }

  revalidatePath('/admin/users');
  revalidatePath('/admin/upload-certificate');
  return { success: true, message: `Certificate successfully uploaded (${newCertificates.length} file${newCertificates.length > 1 ? 's' : ''})` };
}

export async function deleteCertificateAction(formData: FormData) {
  const { error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const userId = sanitizeInput(formData.get('userId') as string, 50);
  const certId = sanitizeInput(formData.get('certId') as string, 50);

  if (!userId || !certId) {
    return { error: 'Invalid data' };
  }

  const certificate = await getCertificateById(certId);

  if (!certificate) {
    return { error: 'Certificate not found' };
  }

  const fileName = certificate.file;

  // Delete from storage
  try {
    await deleteCertificateFile(fileName);
  } catch (error) {
    console.error('Error deleting file:', error);
  }

  // Delete from database
  const saved = await deleteCertificate(certId);

  if (!saved) {
    return { error: 'Failed to delete certificate' };
  }

  revalidatePath('/admin/users');
  return { success: true, message: 'Certificate successfully deleted' };
}