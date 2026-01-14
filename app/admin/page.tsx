import { getUsers } from '@/lib/data-kv';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { MergedUserCertificateForm } from './MergedFormClient';

export default async function AdminDashboardPage() {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    redirect('/login');
  }

  const users = await getUsers();
  
  // Get all certificates from magang users
  const magangUsers = users.filter(u => u.role === 'user');
  const activeCertificates = magangUsers.flatMap(u => u.certificates || []);

  // Stats
  const totalUsers = magangUsers.length;
  const totalCertificates = activeCertificates.length;
  const activeUsers = magangUsers.length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0A0909]">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">Manage users and certificates</p>
        </div>
        <Link href="/admin/users">
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-[#4791EA] text-white rounded-lg hover:bg-[#2874d1] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Manage All Users
          </button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-[#4791EA] to-[#2874d1] rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80 mb-1">Total Users</p>
              <p className="text-4xl font-bold">{totalUsers}</p>
              <p className="text-xs text-white/70 mt-1">Registered interns</p>
            </div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Certificates</p>
              <p className="text-4xl font-bold text-[#0A0909]">{totalCertificates}</p>
              <p className="text-xs text-gray-500 mt-1">Issued certificates</p>
            </div>
            <div className="w-16 h-16 bg-[#e8f3fd] rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-[#4791EA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Active Users</p>
              <p className="text-4xl font-bold text-[#0A0909]">{activeUsers}</p>
              <p className="text-xs text-gray-500 mt-1">With system access</p>
            </div>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Merged Form */}
      <MergedUserCertificateForm />

      {/* Recent Users Section */}
      {magangUsers.length > 0 && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-[#0A0909]">Recent Users</h2>
              <p className="text-sm text-gray-600 mt-1">Latest registered interns</p>
            </div>
            <Link href="/admin/users" className="text-[#4791EA] hover:text-[#2874d1] font-medium text-sm transition-colors">
              View All →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">User</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Position</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Period</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Certificates</th>
                </tr>
              </thead>
              <tbody>
                {magangUsers.slice(0, 5).map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {user.posisi || '-'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {new Date(user.periode_start).toLocaleDateString()} - {new Date(user.periode_end).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-semibold text-sm">
                          {user.certificates?.length || 0}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Tips */}
      <div className="bg-gradient-to-r from-[#e8f3fd] to-white rounded-xl border-2 border-[#4791EA]/20 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-[#4791EA] rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-[#0A0909] mb-2">Quick Tip</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              Use the form above to create new user accounts. You can upload certificates immediately or later from the user management page. Make sure all required fields are filled before submitting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
