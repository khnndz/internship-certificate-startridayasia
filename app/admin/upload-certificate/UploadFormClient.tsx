'use client';

import { formatPeriode } from '@/lib/supabase';
import { useState, useRef, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/types';
import { uploadCertificateAction } from '@/app/actions/admin';
import { getCertificatePublicUrl } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface UploadFormClientProps {
  users: User[];
}

export default function UploadFormClient({ users }: UploadFormClientProps) {
  const router = useRouter();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;

    if (!selectedUserId) {
      showMessage('error', 'Please select a user from search results');
      return;
    }

    if (selectedFiles.length === 0) {
      showMessage('error', 'Please select at least one file');
      return;
    }

    // Get form values from the submitted form directly
    const titleInput = form.querySelector('input[name="title"]') as HTMLInputElement;
    const expiryDateInput = form.querySelector('input[name="expiryDate"]') as HTMLInputElement;

    const title = titleInput?.value || '';
    const expiryDate = expiryDateInput?.value || '';

    if (!title.trim()) {
      showMessage('error', 'Certificate title is required');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('userId', selectedUserId);
      formData.append('title', title);
      formData.append('expiryDate', expiryDate);

      for (const file of selectedFiles) {
        formData.append('file', file);
      }

      const result = await uploadCertificateAction(formData);
      if (result.error) {
        showMessage('error', result.error);
      } else {
        showMessage('success', result.message || 'Certificate successfully uploaded');
        formRef.current?.reset();
        setSelectedFiles([]);
        setUserSearch('');
        setSelectedUserId('');
        router.refresh();
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      showMessage('error', errorMessage);
    } finally {
      setUploading(false);
    }
  }

  const regularUsers = users.filter(u => u.role === 'user');
  const filteredUsers = regularUsers.filter((u) => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return true;
    return `${u.name} ${u.email}`.toLowerCase().includes(q);
  });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold text-[#4791EA]">Upload Certificate</h1>
          <p className="text-slate-600 text-sm mt-2">Upload and assign certificates to intern users.</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg border ${message.type === 'success'
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-red-50 text-red-700 border-red-200'
          }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
          <Card className="border-slate-200 shadow-lg">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-xl">📤</span> Certificate Upload Form
                </h3>
                <p className="text-xs text-slate-500 mt-1">Complete the form below to upload certificate PDF.</p>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <form
                ref={formRef}
                id="upload-form"
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Select User</label>
                  <input type="hidden" name="userId" value={selectedUserId} />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => {
                      const value = e.target.value;
                      setUserSearch(value);
                      setShowUserDropdown(true);
                      if (!value.trim()) {
                        setSelectedUserId('');
                      }
                    }}
                    onFocus={() => setShowUserDropdown(true)}
                    autoComplete="off"
                    className="w-full rounded-lg border-2 border-slate-200 focus:border-primary-500 focus:ring-primary-500 shadow-sm mb-2 bg-slate-50"
                    placeholder="Search name or email..."
                  />
                  {showUserDropdown && (
                    <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-md text-sm">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => {
                          const isSelected = selectedUserId === user.id;
                          return (
                            <button
                              type="button"
                              key={user.id}
                              onClick={() => {
                                setSelectedUserId(user.id);
                                setUserSearch(`${user.name} (${user.email})`);
                                setShowUserDropdown(false);
                              }}
                              className={`w-full text-left px-3 py-2 flex flex-col hover:bg-primary-50 transition-colors ${isSelected ? 'bg-primary-50 text-primary-700' : 'text-slate-700'
                                }`}
                            >
                              <span className="font-medium truncate">{user.name}</span>
                              <span className="text-xs text-slate-500 truncate">{user.email}</span>
                            </button>
                          );
                        })
                      ) : (
                        <div className="px-3 py-2 text-slate-500">No user found</div>
                      )}
                    </div>
                  )}
                  {selectedUserId && (
                    <p className="mt-1 text-xs text-green-600">Selected user will receive the certificate.</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Certificate Title</label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full rounded-lg border-2 border-slate-200 focus:border-primary-500 focus:ring-primary-500 shadow-sm bg-white"
                    placeholder="e.g., Backend Internship Certificate"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    name="expiryDate"
                    className="w-full rounded-lg border-2 border-slate-200 focus:border-primary-500 focus:ring-primary-500 shadow-sm bg-white"
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Certificate will be automatically deleted after this date
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">File PDF</label>
                  <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors ${selectedFiles.length > 0
                      ? 'border-primary-300 bg-primary-50'
                      : 'border-slate-200 hover:border-primary-500 bg-slate-50'
                    }`}>
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                          <span>{selectedFiles.length > 0 ? 'Change file' : 'Upload file'}</span>
                          <input
                            id="file-upload"
                            name="file"
                            type="file"
                            accept=".pdf"
                            multiple
                            required
                            className="sr-only"
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-slate-500">PDF up to 10MB</p>
                    </div>
                  </div>

                  {selectedFiles.length > 0 && (
                    <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
                      <div className="text-sm font-medium text-slate-900 mb-2">Selected files</div>
                      <div className="space-y-2">
                        {selectedFiles.map((f) => (
                          <div key={`${f.name}-${f.lastModified}`} className="flex items-center justify-between gap-2 text-sm">
                            <div className="min-w-0">
                              <p className="font-medium text-slate-900 truncate">{f.name}</p>
                              <p className="text-xs text-slate-500">{Math.ceil(f.size / 1024)} KB</p>
                            </div>
                            <span className="text-xs font-semibold text-slate-600">PDF</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-gradient-to-r from-primary-500 to-blue-500 hover:from-primary-600 hover:to-blue-600 text-white shadow-lg"
                >
                  {uploading ? '⏳ Uploading...' : '📤 Upload Certificate'}
                </Button>
              </form>
            </div>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card className="border-slate-200 shadow-lg">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>📋</span> User Certificates List
              </h3>
            </div>
            <div className="p-6 space-y-3 max-h-[480px] overflow-y-auto">
              {regularUsers.map((user) => {
                const certCount = user.certificates?.length || 0;
                return (
                  <details key={user.id} className="group rounded-xl border border-gray-100 bg-white">
                    <summary className="cursor-pointer select-none p-4 flex items-center justify-between gap-4 hover:bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold flex-shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="flex items-center gap-2"></div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <span>💼</span>
                          <span>{user.posisi || '-'}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <span>📅</span>
                          <span>{formatPeriode(user.periode_start, user.periode_end)}</span>
                        </span>
                        <span className="text-sm text-gray-600 font-medium">{certCount}</span>
                      </div>
                    </summary>

                    <div className="px-4 pb-4">
                      {certCount === 0 ? (
                        <div className="text-sm text-gray-500">No certificates yet.</div>
                      ) : (
                        <div className="space-y-2">
                          {user.certificates!.map((cert) => (
                            <div key={cert.id} className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 bg-white p-3">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate" title={cert.title}>{cert.title}</p>
                                <p className="text-xs text-gray-500 truncate">{cert.file}</p>
                                {cert.expiryDate && (
                                  <p className="text-xs text-amber-600 mt-0.5">Valid until: {cert.expiryDate}</p>
                                )}
                              </div>
                              <a
                                href={getCertificatePublicUrl(cert.file)}
                                rel="noopener noreferrer"
                                className="text-xs font-medium text-primary-600 hover:text-primary-700"
                              >
                                Lihat
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </details>
                );
              })}

              {regularUsers.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  <p>No users registered yet</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
