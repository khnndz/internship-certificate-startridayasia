'use client';

import { useState } from 'react';
import { User } from '@/lib/types';
import { uploadCertificateAction } from '@/app/actions/admin';

interface UploadFormClientProps {
  users: User[];
}

export default function UploadFormClient({ users }: UploadFormClientProps) {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  async function handleSubmit(formData: FormData) {
    setUploading(true);
    try {
      const result = await uploadCertificateAction(formData);
      if (result.error) {
        showMessage('error', result.error);
      } else {
        showMessage('success', result.message || 'Sertifikat berhasil diupload');
        // Reset form
        const form = document.getElementById('upload-form') as HTMLFormElement;
        form?.reset();
      }
    } catch (error) {
      console.error('Upload error:', error);
      showMessage('error', 'Terjadi kesalahan saat upload');
    } finally {
      setUploading(false);
    }
  }

  const regularUsers = users.filter(u => u.role === 'user');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Upload Sertifikat</h1>
        <p className="text-gray-500">Upload dan assign sertifikat ke user</p>
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

      {/* Upload Form */}
      <div className="card max-w-2xl">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📤 Form Upload</h3>
        
        <form id="upload-form" action={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Pilih User</label>
            <select name="userId" required className="input-field">
              <option value="">-- Pilih User --</option>
              {regularUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Judul Sertifikat</label>
            <input 
              type="text" 
              name="title" 
              required 
              className="input-field"
              placeholder="Contoh: Sertifikat Magang Backend"
            />
          </div>

          <div>
            <label className="label">File PDF</label>
            <input 
              type="file" 
              name="file" 
              accept=".pdf"
              required 
              className="input-field"
            />
            <p className="text-xs text-gray-500 mt-1">Format: PDF, max 10MB</p>
          </div>

          <button 
            type="submit" 
            disabled={uploading}
            className="btn-success w-full disabled:opacity-50"
          >
            {uploading ? '⏳ Mengupload...' : '📤 Upload Sertifikat'}
          </button>
        </form>
      </div>

      {/* User Certificates Overview */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📋 Daftar Sertifikat User</h3>
        
        <div className="space-y-4">
          {regularUsers.map(user => (
            <div key={user.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-bold text-gray-800">{user.name}</h4>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user.status === 'Aktif' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {user.status}
                </span>
              </div>

              {user.certificates && user.certificates.length > 0 ? (
                <div className="space-y-2">
                  {user.certificates.map(cert => (
                    <div 
                      key={cert.id}
                      className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">📄</span>
                        <div>
                          <p className="font-medium text-sm">{cert.title}</p>
                          <p className="text-xs text-gray-500">{cert.file} • {cert.issuedAt}</p>
                        </div>
                      </div>
                      <a 
                        href={`/certificates/${cert.file}`}
                        target="_blank"
                        className="text-primary-600 hover:underline text-sm"
                      >
                        Lihat
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">Belum ada sertifikat</p>
              )}
            </div>
          ))}
        </div>

        {regularUsers.length === 0 && (
          <p className="text-center text-gray-500 py-4">
            Belum ada user terdaftar
          </p>
        )}
      </div>

      {/* Info */}
      <div className="card bg-blue-50 border border-blue-200">
        <div className="flex items-start space-x-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h4 className="font-bold text-blue-800">Informasi Upload</h4>
            <ul className="text-blue-700 text-sm mt-2 space-y-1">
              <li>• File akan disimpan di folder <code className="bg-blue-100 px-1 rounded">/public/certificates/</code></li>
              <li>• Nama file akan otomatis di-generate dengan format unik</li>
              <li>• User dapat langsung download setelah sertifikat diupload</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
