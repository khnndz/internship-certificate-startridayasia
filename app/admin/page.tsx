import { getUsers } from '@/lib/data-kv';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatPeriode } from '@/lib/supabase';

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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <span className="text-4xl">👋</span>
            Selamat Datang, {session.name}
          </h1>
          <p className="text-slate-600 mt-2">Dashboard Admin - Kelola Sertifikat Magang</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Total User Magang</p>
              <p className="text-3xl font-bold text-slate-900">{totalUsers}</p>
              <p className="text-xs text-slate-500 mt-1">Anak magang terdaftar</p>
            </div>
            <div className="h-14 w-14 bg-blue-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
              👥
            </div>
          </div>
        </Card>

        <Card className="p-6 border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">Total Sertifikat</p>
              <p className="text-3xl font-bold text-slate-900">{totalCertificates}</p>
              <p className="text-xs text-slate-500 mt-1">Sertifikat diterbitkan</p>
            </div>
            <div className="h-14 w-14 bg-green-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
              📄
            </div>
          </div>
        </Card>

        <Card className="p-6 border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">User Aktif</p>
              <p className="text-3xl font-bold text-slate-900">{activeUsers}</p>
              <p className="text-xs text-slate-500 mt-1">Memiliki akses sistem</p>
            </div>
            <div className="h-14 w-14 bg-purple-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
              🛡️
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Users & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Users Table */}
        <div className="lg:col-span-2">
          <Card className="h-full border-slate-200 shadow-lg">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-2xl">👥</span>
                  User Terbaru
                </h3>
                <p className="text-sm text-slate-600">Daftar user yang baru ditambahkan</p>
              </div>
              <Link href="/admin/users">
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  Lihat Semua
                  <span>→</span>
                </button>
              </Link>
            </div>
            <div className="p-6">
              {magangUsers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📭</div>
                  <p className="text-lg font-medium text-gray-700">Belum ada user magang</p>
                  <p className="text-sm text-gray-500 mt-1">Tambahkan user pertama untuk mulai</p>
                  <Link href="/admin/users">
                    <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      + Tambah User
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">User</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Posisi</th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Periode</th>
                        <th className="text-center py-3 px-4 text-xs font-semibold text-slate-600 uppercase">Sertifikat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {magangUsers.slice(0, 5).map((user) => (
                        <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-slate-900">{user.name}</div>
                              <p className="text-xs text-slate-500">{user.email}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              <span>💼</span>
                              <span>{user.posisi || '-'}</span>
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <span>📅</span>
                              <span>{formatPeriode(user.periode_start, user.periode_end)}</span>
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-center gap-2">
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
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="border-slate-200 shadow-lg">
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                Quick Actions
              </h3>
            </div>
            <div className="p-6 space-y-3">
              <Link href="/admin/users">
                <button className="w-full text-left px-4 py-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-200 flex items-center gap-3 group">
                  <span className="text-2xl group-hover:scale-110 transition-transform">👥</span>
                  <div>
                    <div className="font-semibold text-slate-900">Kelola User</div>
                    <div className="text-xs text-slate-600">Tambah atau edit user magang</div>
                  </div>
                </button>
              </Link>

              <Link href="/admin/upload-certificate">
                <button className="w-full text-left px-4 py-3 rounded-xl bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all duration-200 flex items-center gap-3 group">
                  <span className="text-2xl group-hover:scale-110 transition-transform">📤</span>
                  <div>
                    <div className="font-semibold text-slate-900">Upload Sertifikat</div>
                    <div className="text-xs text-slate-600">Upload sertifikat untuk user</div>
                  </div>
                </button>
              </Link>

              <Link href="/admin/profile">
                <button className="w-full text-left px-4 py-3 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all duration-200 flex items-center gap-3 group">
                  <span className="text-2xl group-hover:scale-110 transition-transform">⚙️</span>
                  <div>
                    <div className="font-semibold text-slate-900">Settings</div>
                    <div className="text-xs text-slate-600">Kelola profil admin</div>
                  </div>
                </button>
              </Link>
            </div>
          </Card>

          {/* Info Card */}
          <Card className="border-slate-200 shadow-lg mt-6">
            <div className="p-6">
              <div className="flex items-start gap-3">
                <span className="text-3xl">💡</span>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Tips</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Pastikan setiap user magang sudah memiliki sertifikat yang ter-upload dengan benar sebelum mereka login ke sistem.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}