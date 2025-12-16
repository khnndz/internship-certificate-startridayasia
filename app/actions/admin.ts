'use server';

import { revalidatePath } from 'next/cache';
import { getUsers, saveUsers, generateUserId, generateCertificateId } from '@/lib/data';
import { User, Certificate } from '@/lib/types';
import fs from 'fs';
import path from 'path';

export async function createUserAction(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const status = formData.get('status') as string || 'Aktif';

  if (!name || !email || !password) {
    return { error: 'Semua field harus diisi' };
  }

  const users = getUsers();
  
  // Check if email already exists
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { error: 'Email sudah terdaftar' };
  }

  const newUser: User = {
    id: generateUserId(),
    name,
    email,
    password, // In production, hash this password
    role: 'user',
    status,
    certificates: [],
  };

  users.push(newUser);
  const saved = saveUsers(users);

  if (!saved) {
    return { error: 'Gagal menyimpan user' };
  }

  revalidatePath('/admin/users');
  return { success: true, message: 'User berhasil ditambahkan' };
}

export async function updateUserAction(formData: FormData) {
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const status = formData.get('status') as string;

  if (!id || !name || !email) {
    return { error: 'Data tidak lengkap' };
  }

  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === id);

  if (userIndex === -1) {
    return { error: 'User tidak ditemukan' };
  }

  // Check if email already used by another user
  const emailExists = users.some(
    u => u.email.toLowerCase() === email.toLowerCase() && u.id !== id
  );
  
  if (emailExists) {
    return { error: 'Email sudah digunakan user lain' };
  }

  users[userIndex] = {
    ...users[userIndex],
    name,
    email,
    status,
    ...(password && { password }), // Only update password if provided
  };

  const saved = saveUsers(users);

  if (!saved) {
    return { error: 'Gagal menyimpan perubahan' };
  }

  revalidatePath('/admin/users');
  return { success: true, message: 'User berhasil diupdate' };
}

export async function deleteUserAction(formData: FormData) {
  const id = formData.get('id') as string;

  if (!id) {
    return { error: 'ID user tidak valid' };
  }

  const users = getUsers();
  const filteredUsers = users.filter(u => u.id !== id);

  if (filteredUsers.length === users.length) {
    return { error: 'User tidak ditemukan' };
  }

  const saved = saveUsers(filteredUsers);

  if (!saved) {
    return { error: 'Gagal menghapus user' };
  }

  revalidatePath('/admin/users');
  return { success: true, message: 'User berhasil dihapus' };
}

export async function uploadCertificateAction(formData: FormData) {
  const userId = formData.get('userId') as string;
  const title = formData.get('title') as string;
  const file = formData.get('file') as File;

  if (!userId || !title || !file) {
    return { error: 'Semua field harus diisi' };
  }

  if (!file.name.endsWith('.pdf')) {
    return { error: 'File harus berformat PDF' };
  }

  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return { error: 'User tidak ditemukan' };
  }

  // Generate unique filename
  const timestamp = Date.now();
  const sanitizedName = users[userIndex].name.toLowerCase().replace(/\s+/g, '-');
  const fileName = `${sanitizedName}-${timestamp}.pdf`;
  
  // Save file to public/certificates
  const certificatesDir = path.join(process.cwd(), 'public', 'certificates');
  
  // Ensure directory exists
  if (!fs.existsSync(certificatesDir)) {
    fs.mkdirSync(certificatesDir, { recursive: true });
  }

  const filePath = path.join(certificatesDir, fileName);
  
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);
  } catch (error) {
    console.error('Error saving file:', error);
    return { error: 'Gagal menyimpan file' };
  }

  // Add certificate to user
  const newCertificate: Certificate = {
    id: generateCertificateId(),
    title,
    file: fileName,
    issuedAt: new Date().toISOString().split('T')[0],
  };

  if (!users[userIndex].certificates) {
    users[userIndex].certificates = [];
  }
  
  users[userIndex].certificates.push(newCertificate);

  const saved = saveUsers(users);

  if (!saved) {
    return { error: 'Gagal menyimpan data sertifikat' };
  }

  revalidatePath('/admin/users');
  revalidatePath('/admin/upload-certificate');
  return { success: true, message: 'Sertifikat berhasil diupload' };
}

export async function deleteCertificateAction(formData: FormData) {
  const userId = formData.get('userId') as string;
  const certId = formData.get('certId') as string;

  if (!userId || !certId) {
    return { error: 'Data tidak valid' };
  }

  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return { error: 'User tidak ditemukan' };
  }

  const certIndex = users[userIndex].certificates?.findIndex(c => c.id === certId);
  
  if (certIndex === undefined || certIndex === -1) {
    return { error: 'Sertifikat tidak ditemukan' };
  }

  // Get filename before removing
  const fileName = users[userIndex].certificates[certIndex].file;

  // Remove certificate from array
  users[userIndex].certificates.splice(certIndex, 1);

  // Try to delete the file
  try {
    const filePath = path.join(process.cwd(), 'public', 'certificates', fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    // Continue anyway, file deletion is not critical
  }

  const saved = saveUsers(users);

  if (!saved) {
    return { error: 'Gagal menyimpan perubahan' };
  }

  revalidatePath('/admin/users');
  return { success: true, message: 'Sertifikat berhasil dihapus' };
}
