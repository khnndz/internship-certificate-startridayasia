'use server';

import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { getUsers, saveUsers, generateUserId, generateCertificateId } from '@/lib/data-kv';
import { User, Certificate } from '@/lib/types';
import { getSession } from '@/lib/auth';
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

  const users = await getUsers();
  
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { error: 'Email sudah terdaftar' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser: User = {
    id: generateUserId(),
    name,
    email,
    password: hashedPassword,
    role: 'user',
    status,
    certificates: [],
  };

  users.push(newUser);
  const saved = await saveUsers(users);

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

  const users = await getUsers();
  const userIndex = users.findIndex(u => u.id === id);

  if (userIndex === -1) {
    return { error: 'User tidak ditemukan' };
  }

  const emailExists = users.some(
    u => u.email.toLowerCase() === email.toLowerCase() && u.id !== id
  );
  
  if (emailExists) {
    return { error: 'Email sudah digunakan user lain' };
  }

  const nextPassword = password ? await bcrypt.hash(password, 10) : null;

  users[userIndex] = {
    ...users[userIndex],
    name,
    email,
    status,
    ...(nextPassword && { password: nextPassword }),
  };

  const saved = await saveUsers(users);

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

  const users = await getUsers();
  const userToDelete = users.find(u => u.id === id);
  const filteredUsers = users.filter(u => u.id !== id);

  if (filteredUsers.length === users.length) {
    return { error: 'User tidak ditemukan' };
  }

  const certificateFiles = (userToDelete?.certificates || [])
    .map(c => c.file)
    .filter((fileName): fileName is string => typeof fileName === 'string' && fileName.length > 0);

  for (const fileName of certificateFiles) {
    try {
      const filePath = path.join(process.cwd(), 'public', 'certificates', fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting certificate file:', error);
    }
  }

  const saved = await saveUsers(filteredUsers);

  if (!saved) {
    return { error: 'Gagal menghapus user' };
  }

  revalidatePath('/admin/users');
  return { success: true, message: 'User berhasil dihapus' };
}

export async function updateAdminProfileAction(formData: FormData) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    return { error: 'Unauthorized' };
  }

  const name = (formData.get('name') as string) || '';
  const email = (formData.get('email') as string) || '';
  const password = (formData.get('password') as string) || '';

  if (!name || !email) {
    return { error: 'Nama dan email wajib diisi' };
  }

  const users = await getUsers();
  const userIndex = users.findIndex(u => u.id === session.id);

  if (userIndex === -1) {
    return { error: 'User tidak ditemukan' };
  }

  const emailExists = users.some(
    u => u.email.toLowerCase() === email.toLowerCase() && u.id !== session.id
  );

  if (emailExists) {
    return { error: 'Email sudah digunakan user lain' };
  }

  const nextPassword = password ? await bcrypt.hash(password, 10) : null;

  users[userIndex] = {
    ...users[userIndex],
    name,
    email,
    ...(nextPassword && { password: nextPassword }),
  };

  const saved = await saveUsers(users);

  if (!saved) {
    return { error: 'Gagal menyimpan perubahan profil' };
  }

  revalidatePath('/admin/profile');
  revalidatePath('/admin');
  return { success: true, message: 'Profil berhasil diperbarui' };
}

export async function uploadCertificateAction(formData: FormData) {
  const userId = formData.get('userId') as string;
  const title = formData.get('title') as string;  const expiryDate = formData.get('expiryDate') as string;  const files = formData
    .getAll('file')
    .filter((f): f is File => typeof (f as any)?.arrayBuffer === 'function' && typeof (f as any)?.name === 'string');

  if (!userId || !title || files.length === 0) {
    return { error: 'Semua field harus diisi' };
  }

  if (files.some((f) => !f.name.toLowerCase().endsWith('.pdf'))) {
    return { error: 'File harus berformat PDF' };
  }

  const users = await getUsers();
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return { error: 'User tidak ditemukan' };
  }

  const timestamp = Date.now();
  const sanitizedName = users[userIndex].name.toLowerCase().replace(/\s+/g, '-');

  const certificatesDir = path.join(process.cwd(), 'public', 'certificates');
  
  if (!fs.existsSync(certificatesDir)) {
    fs.mkdirSync(certificatesDir, { recursive: true });
  }

  const issuedAt = new Date().toISOString().split('T')[0];
  const newCertificates: Certificate[] = [];
  const writtenFiles: string[] = [];

  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = `${sanitizedName}-${timestamp}-${randomUUID()}.pdf`;
      const filePath = path.join(certificatesDir, fileName);

      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(filePath, buffer);
      writtenFiles.push(fileName);

      const certTitle = files.length > 1 ? `${title} (${i + 1})` : title;
      newCertificates.push({
        id: generateCertificateId(),
        title: certTitle,
        file: fileName,
        issuedAt,
        ...(expiryDate && { expiryDate }),
      });
    }
  } catch (error) {
    for (const fileName of writtenFiles) {
      try {
        const filePath = path.join(certificatesDir, fileName);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch {}
    }
    console.error('Error saving file:', error);
    return { error: 'Gagal menyimpan file' };
  }

  if (!users[userIndex].certificates) {
    users[userIndex].certificates = [];
  }

  users[userIndex].certificates.push(...newCertificates);

  const saved = await saveUsers(users);

  if (!saved) {
    for (const fileName of writtenFiles) {
      try {
        const filePath = path.join(certificatesDir, fileName);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch {}
    }
    return { error: 'Gagal menyimpan data sertifikat' };
  }

  revalidatePath('/admin/users');
  revalidatePath('/admin/upload-certificate');
  return { success: true, message: `Sertifikat berhasil diupload (${newCertificates.length} file)` };
}

export async function deleteCertificateAction(formData: FormData) {
  const userId = formData.get('userId') as string;
  const certId = formData.get('certId') as string;

  if (!userId || !certId) {
    return { error: 'Data tidak valid' };
  }

  const users = await getUsers();
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    return { error: 'User tidak ditemukan' };
  }

  const certIndex = users[userIndex].certificates?.findIndex(c => c.id === certId);
  
  if (certIndex === undefined || certIndex === -1) {
    return { error: 'Sertifikat tidak ditemukan' };
  }

  const fileName = users[userIndex].certificates[certIndex].file;

  users[userIndex].certificates.splice(certIndex, 1);

  try {
    const filePath = path.join(process.cwd(), 'public', 'certificates', fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }

  const saved = await saveUsers(users);

  if (!saved) {
    return { error: 'Gagal menyimpan perubahan' };
  }

  revalidatePath('/admin/users');
  return { success: true, message: 'Sertifikat berhasil dihapus' };
}
