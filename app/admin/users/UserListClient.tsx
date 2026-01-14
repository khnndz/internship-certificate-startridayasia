'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/lib/types';
import { createUserAction, updateUserAction, deleteUserAction } from '@/app/actions/admin';
import { formatPeriode } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { BackButton } from '@/components/ui/BackButton';

interface UserListClientProps {
  users: User[];
}

export default function UserListClient({ users = [] }: UserListClientProps) {  // ✅ ADD DEFAULT VALUE
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // ✅ ADD SAFETY CHECK
  if (!users) {
    return (
      <Card className="p-8 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <p className="text-lg font-medium text-gray-700">Error loading users</p>
        <p className="text-sm text-gray-500 mt-1">Please refresh the page</p>
      </Card>
    );
  }

  function showMessage(type: 'success' | 'error', text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  }

  async function handleCreate(formData: FormData) {
    const result = await createUserAction(formData);
    if (result.error) {
      showMessage('error', result.error);
    } else {
      showMessage('success', result.message || 'Success');
      setIsCreating(false);
      router.refresh();
    }
  }

  async function handleUpdate(formData: FormData) {
    const result = await updateUserAction(formData);
    if (result.error) {
      showMessage('error', result.error);
    } else {
      showMessage('success', result.message || 'Success');
      setEditingUser(null);
      router.refresh();
    }
  }

  async function handleDelete(formData: FormData) {
    if (!confirm('Are you sure you want to delete this user? All user certificates will also be deleted.')) return;
    
    const result = await deleteUserAction(formData);
    if (result.error) {
      showMessage('error', result.error);
    } else {
      showMessage('success', result.message || 'Success');
      router.refresh();
    }
  }

  return (
    <>
      {/* Success/Error Message */}
      {message && (
        <div className={`mb-4 p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border-green-200' 
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-xl">{message.type === 'success' ? '✅' :  '❌'}</span>
            <span className="font-medium">{message.text}</span>
          </div>
        </div>
      )}

      {/* Back button */}
      <div className="mb-6">
        <BackButton href="/dashboard" label="Back" />
      </div> 
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold text-[#4791EA] flex items-center gap-2">
            User Management
          </h1>
          <p className="text-gray-600 mt-1">Manage intern users and their certificates</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <span className="text-lg">+</span> Add User
        </Button>
      </div>

      {/* ===================================
          CREATE USER MODAL
          =================================== */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg p-0 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                Add Intern User
              </h3>
              <p className="text-sm text-gray-500 mt-1">Create account for new intern</p>
            </div>
            <div className="p-5 bg-white max-h-[70vh] overflow-y-auto">
              <form action={handleCreate} className="space-y-4">
                {/* Nama Lengkap */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    autoComplete="name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g., John Smith"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="name@example.com"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <PasswordInput
                    type="password"
                    name="password"
                    required
                    autoComplete="new-password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Minimum 6 characters"
                  />
                  <p className="text-xs text-gray-500 mt-1">Password will be used for user login</p>
                </div>

                {/* Posisi/Divisi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position/Division <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="posisi"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="e.g., Software Engineer, UI/UX Designer, Marketing"
                  />
                </div>

                {/* Periode Magang (Date Range) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="periode_start"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="periode_end"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 -mt-2 flex items-center gap-1">
                  <span>Click the calendar icon to easily select dates</span>
                </p>

                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    💾 Save
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreating(false)} 
                    className="flex-1"
                  >
                    ✖️ Cancel
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}

      {/* ===================================
          EDIT USER MODAL
          =================================== */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg p-0 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-white">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">✏️</span>
                Edit User
              </h3>
              <p className="text-sm text-gray-500 mt-1">{editingUser.name}</p>
            </div>
            <div className="p-5 bg-white max-h-[70vh] overflow-y-auto">
              <form action={handleUpdate} className="space-y-4">
                <input type="hidden" name="id" value={editingUser.id} />
                
                {/* Nama Lengkap */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    name="name" 
                    defaultValue={editingUser.name}
                    required 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  />
                </div>
                
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="email" 
                    name="email" 
                    defaultValue={editingUser.email}
                    required 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  />
                </div>
                
                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password (Optional)
                  </label>
                  <PasswordInput
                    type="password" 
                    name="password" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                    placeholder="Leave blank to keep current password" 
                  />
                  <p className="text-xs text-gray-500 mt-1">Fill only if you want to change the password</p>
                </div>
                
                {/* Posisi/Divisi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position/Division
                  </label>
                  <input 
                    type="text" 
                    name="posisi" 
                    defaultValue={editingUser.posisi}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                    placeholder="e.g., Software Engineer"
                  />
                </div>
                
                {/* Periode Magang */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input 
                      type="date" 
                      name="periode_start" 
                      defaultValue={editingUser.periode_start}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input 
                      type="date" 
                      name="periode_end" 
                      defaultValue={editingUser.periode_end}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                    />
                  </div>
                </div>
                
                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    💾 Update
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setEditingUser(null)}
                    className="flex-1"
                  >
                    ✖️ Cancel
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}

      {/* ===================================
          USER TABLE
          =================================== */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span>👤</span>
                    <span>Name & Email</span>
                  </div>
                </th>
                <th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span>Position</span>
                  </div>
                </th>
                <th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span>📅</span>
                    <span>Period</span>
                  </div>
                </th>
                <th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span>📄</span>
                    <span>Certificates</span>
                  </div>
                </th>
                <th className="text-right py-3.5 px-5 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center justify-end gap-2">
                    <span>⚙️</span>
                    <span>Actions</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.filter(u => u.role !== 'admin').map((user) => (
                <tr key={user.id} className="hover:bg-blue-50/50 transition-colors duration-150">
                  {/* Name & Email */}
                  <td className="py-4 px-5">
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  
                  {/* Posisi */}
                  <td className="py-4 px-5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      <span>{user.posisi || '-'}</span>
                    </span>
                  </td>
                  
                  {/* Periode */}
                  <td className="py-4 px-5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <span>{formatPeriode(user.periode_start, user.periode_end)}</span>
                    </span>
                  </td>
                  
                  {/* Certificates Count */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-semibold text-sm">
                        {user.certificates.length}
                      </span>
                      <span className="text-sm text-gray-600">file</span>
                    </div>
                  </td>
                  
                  {/* Actions */}
                  <td className="py-4 px-5 text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingUser(user)}
                        className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                      >
                        <span className="text-base">✏️</span>
                        <span className="ml-1">Edit</span>
                      </Button>
                      <form action={handleDelete}>
                        <input type="hidden" name="id" value={user.id} />
                        <Button 
                          variant="outline" 
                          size="sm" 
                          type="submit"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                        >
                          <span className="text-base">🗑️</span>
                          <span className="ml-1">Delete</span>
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              
              {/* Empty State */}
              {users.filter(u => u.role !== 'admin').length === 0 && (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-6xl mb-4">📭</div>
                      <p className="text-lg font-medium text-gray-700">No intern users yet</p>
                      <p className="text-sm text-gray-500 mt-1">Click "Add User" button to start adding users</p>
                      <Button 
                        onClick={() => setIsCreating(true)}
                        className="mt-4"
                      >
                        <span className="text-lg">+</span> Add First User
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
