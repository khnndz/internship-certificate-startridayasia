'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/types';
import { createUserAction, updateUserAction, deleteUserAction, deleteCertificateAction } from '@/app/actions/admin';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface UserListClientProps {
  initialUsers: User[];
}

export default function UserListClient({ initialUsers }: UserListClientProps) {
  const router = useRouter();
  const users = initialUsers;
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  async function handleCreate(formData: FormData) {
    const result = await createUserAction(formData);
    if (result.error) {
      showMessage('error', result.error);
    } else {
      showMessage('success', result.message || 'Berhasil');
      setIsCreating(false);
      router.refresh();
    }
  }

  async function handleUpdate(formData: FormData) {
    const result = await updateUserAction(formData);
    if (result.error) {
      showMessage('error', result.error);
    } else {
      showMessage('success', result.message || 'Berhasil');
      setEditingUser(null);
      router.refresh();
    }
  }

  async function handleDelete(formData: FormData) {
    if (!confirm('Yakin ingin menghapus user ini?')) return;
    
    const result = await deleteUserAction(formData);
    if (result.error) {
      showMessage('error', result.error);
    } else {
      showMessage('success', result.message || 'Berhasil');
      router.refresh();
    }
  }

  async function handleDeleteCertificate(userId: string, certId: string) {
    if (!confirm('Yakin ingin menghapus sertifikat ini?')) return;
    
    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('certId', certId);
    
    const result = await deleteCertificateAction(formData);
    if (result.error) {
      showMessage('error', result.error);
    } else {
      showMessage('success', result.message || 'Berhasil');
      router.refresh();
    }
  }

  const regularUsers = users.filter(u => u.role === 'user');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola User</h1>
          <p className="text-gray-500">Tambah, edit, atau hapus user magang.</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2"
        >
          <span>➕</span> Tambah User
        </Button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border-green-200' 
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {isCreating && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-0 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-gray-100 bg-white">
              <h3 className="text-lg font-bold text-gray-900">Tambah User</h3>
              <p className="text-sm text-gray-500 mt-1">Buat akun user magang baru.</p>
            </div>
            <div className="p-5 bg-white">
              <form action={handleCreate} className="space-y-4">
                <div>
                  <label className="label">Nama Lengkap</label>
                  <input
                    type="text"
                    name="name"
                    required
                    autoComplete="name"
                    className="input-field"
                    placeholder="Contoh: Ahmad Lazim"
                  />
                </div>

                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    className="input-field"
                    placeholder="name@example.com"
                  />
                </div>

                <div>
                  <label className="label">Password</label>
                  <input
                    type="password"
                    name="password"
                    required
                    autoComplete="new-password"
                    className="input-field"
                    placeholder="Minimal 6 karakter"
                  />
                </div>

                <div>
                  <label className="label">Status</label>
                  <select name="status" className="input-field">
                    <option value="Aktif">Aktif</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="submit" className="flex-1">Simpan</Button>
                  <Button type="button" variant="outline" onClick={() => setIsCreating(false)} className="flex-1">
                    Batal
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">Edit User</h3>
            </div>
            <div className="p-6">
              <form action={handleUpdate} className="space-y-4">
                <input type="hidden" name="id" value={editingUser.id} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                  <input 
                    type="text" 
                    name="name" 
                    defaultValue={editingUser.name}
                    required 
                    className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 shadow-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    defaultValue={editingUser.email}
                    required 
                    className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 shadow-sm" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password (Opsional)</label>
                  <input type="password" name="password" className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 shadow-sm" placeholder="Kosongkan jika tidak diubah" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select name="status" defaultValue={editingUser.status} className="w-full rounded-lg border-gray-300 focus:border-primary-500 focus:ring-primary-500 shadow-sm">
                    <option value="Aktif">Aktif</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button type="submit" className="flex-1">Update</Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setEditingUser(null)}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama</th>
                <th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sertifikat</th>
                <th className="text-right py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {regularUsers.map((user) => {
                const certCount = user.certificates?.length || 0;
                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors align-top">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm">
                          {user.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{user.name}</p>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <Badge
                        variant={
                          user.status === 'Aktif' ? 'success' :
                          user.status === 'Selesai' ? 'info' :
                          'neutral'
                        }
                      >
                        {user.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-5">
                      {certCount === 0 ? (
                        <span className="text-sm text-gray-500">0</span>
                      ) : (
                        <details className="group">
                          <summary className="cursor-pointer select-none text-sm text-primary-600 hover:text-primary-700 font-medium">
                            {certCount} file
                          </summary>
                          <div className="mt-3 space-y-2">
                            {user.certificates!.map((cert) => (
                              <div key={cert.id} className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 bg-white p-2">
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate" title={cert.title}>{cert.title}</p>
                                  <p className="text-xs text-gray-500 truncate">{cert.file}</p>
                                  {cert.expiryDate && (
                                    <p className="text-xs text-amber-600 mt-0.5">Berlaku sampai: {cert.expiryDate}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <a
                                    href={`/certificates/${cert.file}`}
                                    target="_blank"
                                    className="text-xs font-medium text-primary-600 hover:text-primary-700"
                                  >
                                    Lihat
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCertificate(user.id, cert.id)}
                                    className="text-xs font-medium text-red-600 hover:text-red-700"
                                    title="Hapus Sertifikat"
                                  >
                                    Hapus
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </details>
                      )}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingUser(user)}>
                          Edit
                        </Button>
                        <form action={handleDelete} className="inline-block">
                          <input type="hidden" name="id" value={user.id} />
                          <Button variant="danger" size="sm" type="submit">
                            Hapus
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {regularUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-gray-500">
                    <p>Belum ada user terdaftar.</p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => setIsCreating(true)}>
                      Tambah User
                    </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
