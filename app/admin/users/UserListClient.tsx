'use client';

import { useState } from 'react';
import { User } from '@/lib/types';
import { createUserAction, updateUserAction, deleteUserAction, deleteCertificateAction } from '@/app/actions/admin';

interface UserListClientProps {
  initialUsers: User[];
}

export default function UserListClient({ initialUsers }: UserListClientProps) {
  const [users] = useState<User[]>(initialUsers);
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
    }
  }

  async function handleUpdate(formData: FormData) {
    const result = await updateUserAction(formData);
    if (result.error) {
      showMessage('error', result.error);
    } else {
      showMessage('success', result.message || 'Berhasil');
      setEditingUser(null);
    }
  }

  async function handleDelete(formData: FormData) {
    if (!confirm('Yakin ingin menghapus user ini?')) return;
    
    const result = await deleteUserAction(formData);
    if (result.error) {
      showMessage('error', result.error);
    } else {
      showMessage('success', result.message || 'Berhasil');
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
    }
  }

  const regularUsers = users.filter(u => u.role === 'user');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Kelola User</h1>
          <p className="text-gray-500">Tambah, edit, atau hapus user magang</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="btn-primary"
        >
          ➕ Tambah User
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Create User Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Tambah User Baru</h3>
            <form action={handleCreate} className="space-y-4">
              <div>
                <label className="label">Nama</label>
                <input type="text" name="name" required className="input-field" />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" name="email" required className="input-field" />
              </div>
              <div>
                <label className="label">Password</label>
                <input type="password" name="password" required className="input-field" />
              </div>
              <div>
                <label className="label">Status</label>
                <select name="status" className="input-field">
                  <option value="Aktif">Aktif</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="btn-primary flex-1">Simpan</button>
                <button 
                  type="button" 
                  onClick={() => setIsCreating(false)}
                  className="btn-secondary flex-1"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Edit User</h3>
            <form action={handleUpdate} className="space-y-4">
              <input type="hidden" name="id" value={editingUser.id} />
              <div>
                <label className="label">Nama</label>
                <input 
                  type="text" 
                  name="name" 
                  defaultValue={editingUser.name}
                  required 
                  className="input-field" 
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input 
                  type="email" 
                  name="email" 
                  defaultValue={editingUser.email}
                  required 
                  className="input-field" 
                />
              </div>
              <div>
                <label className="label">Password (kosongkan jika tidak diubah)</label>
                <input type="password" name="password" className="input-field" />
              </div>
              <div>
                <label className="label">Status</label>
                <select name="status" defaultValue={editingUser.status} className="input-field">
                  <option value="Aktif">Aktif</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="btn-primary flex-1">Update</button>
                <button 
                  type="button" 
                  onClick={() => setEditingUser(null)}
                  className="btn-secondary flex-1"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">ID</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Nama</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Email</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Sertifikat</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {regularUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-500 font-mono">{user.id}</td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-800">{user.name}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === 'Aktif' 
                        ? 'bg-green-100 text-green-700' 
                        : user.status === 'Selesai'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-600">{user.certificates?.length || 0}</span>
                      {user.certificates && user.certificates.length > 0 && (
                        <div className="group relative">
                          <button className="text-primary-600 hover:underline text-sm ml-2">
                            Lihat
                          </button>
                          <div className="absolute left-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3 hidden group-hover:block z-10">
                            <p className="text-xs font-medium text-gray-500 mb-2">Daftar Sertifikat:</p>
                            {user.certificates.map(cert => (
                              <div key={cert.id} className="flex items-center justify-between py-1 text-xs">
                                <span className="truncate flex-1">{cert.title}</span>
                                <button
                                  onClick={() => handleDeleteCertificate(user.id, cert.id)}
                                  className="text-red-500 hover:text-red-700 ml-2"
                                >
                                  🗑️
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                      >
                        ✏️ Edit
                      </button>
                      <form action={handleDelete}>
                        <input type="hidden" name="id" value={user.id} />
                        <button
                          type="submit"
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          🗑️ Hapus
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {regularUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Belum ada user terdaftar
          </div>
        )}
      </div>
    </div>
  );
}
