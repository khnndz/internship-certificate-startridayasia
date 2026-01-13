import { getUsers } from '@/lib/data-kv';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default async function AdminDashboardPage() {
  const users = await getUsers();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const activeCertificates = users.flatMap(user => 
    (user.certificates || []).filter(cert => {
      if (!cert.expiryDate) return true;
      const expiryDate = new Date(cert.expiryDate);
      expiryDate.setHours(0, 0, 0, 0);
      return expiryDate >= today;
    })
  );

  const totalUsers = users.filter(u => u.role === 'user').length;
  const totalCertificates = activeCertificates.length;
  const activeUsers = users.filter(u => u. role === 'user').length;

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 p-10 text-white shadow-2xl">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <span className="text-2xl">👋</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold">Admin Dashboard</h2>
              <p className="text-slate-300 text-sm">Manage users, certificates, and monitor activities</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-600 text-sm font-semibold uppercase tracking-wider mb-2">Total User</p>
              <p className="text-4xl font-bold text-blue-900">{totalUsers}</p>
              <p className="text-xs text-blue-600 mt-2">Registered users</p>
            </div>
            <div className="h-14 w-14 bg-blue-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
              👥
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-green-600 text-sm font-semibold uppercase tracking-wider mb-2">User Aktif</p>
              <p className="text-4xl font-bold text-green-900">{activeUsers}</p>
              <p className="text-xs text-green-600 mt-2">Active status</p>
            </div>
            <div className="h-14 w-14 bg-green-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
              ✅
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-indigo-600 text-sm font-semibold uppercase tracking-wider mb-2">Sertifikat</p>
              <p className="text-4xl font-bold text-indigo-900">{totalCertificates}</p>
              <p className="text-xs text-indigo-600 mt-2">Valid certificates</p>
            </div>
            <div className="h-14 w-14 bg-indigo-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
              📜
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-purple-600 text-sm font-semibold uppercase tracking-wider mb-2">Total Admin</p>
              <p className="text-4xl font-bold text-purple-900">
                {users.filter(u => u.role === 'admin').length}
              </p>
              <p className="text-xs text-purple-600 mt-2">System admins</p>
            </div>
            <div className="h-14 w-14 bg-purple-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
              🛡️
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                <Button variant="outline" size="sm" className="hover:bg-primary-50 hover:text-primary-600 hover:border-primary-300">
                  Lihat Semua →
                </Button>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-4 px-6 text-xs font-bold text-slate-600 uppercase tracking-wider">Nama</th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-slate-600 uppercase tracking-wider">Sertifikat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.filter(u => u.role === 'user').slice(0, 5).map((user) => {
                    const validCerts = (user.certificates || []).filter(cert => {
                      if (!cert.expiryDate) return true;
                      const expiryDate = new Date(cert.expiryDate);
                      expiryDate.setHours(0, 0, 0, 0);
                      return expiryDate >= today;
                    });
                    return (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center font-bold text-sm mr-3 shadow-md">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">{user.name}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant={user.status === 'Aktif' ? 'success' : 'warning'} className="font-medium">
                          {user.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-2 text-sm text-slate-700 font-medium bg-slate-100 px-3 py-1 rounded-lg">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {validCerts.length} File
                        </span>
                      </td>
                    </tr>
                    );
                  })}
                  {users.filter(u => u.role === 'user').length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-12 text-center">
                        <div className="text-slate-400 text-sm">
                          <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          Belum ada data user
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="h-full border-slate-200 shadow-lg">
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                Aksi Cepat
              </h3>
              <p className="text-sm text-slate-600">Menu yang sering digunakan</p>
            </div>
            <div className="p-6 space-y-3">
              <Link href="/admin/users" className="block">
                <div className="group p-5 rounded-2xl border-2 border-slate-200 hover:border-primary-400 hover:bg-gradient-to-br hover:from-primary-50 hover:to-blue-50 transition-all cursor-pointer flex items-center shadow-sm hover:shadow-md">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-2xl mr-4 group-hover:scale-110 transition-transform shadow-lg">
                    👥
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 group-hover:text-primary-700 mb-0.5">Kelola User</h4>
                    <p className="text-xs text-slate-500">Tambah, edit, atau hapus user</p>
                  </div>
                </div>
              </Link>

              <Link href="/admin/upload-certificate" className="block">
                <div className="group p-5 rounded-2xl border-2 border-slate-200 hover:border-green-400 hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 transition-all cursor-pointer flex items-center shadow-sm hover:shadow-md">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 text-white flex items-center justify-center text-2xl mr-4 group-hover:scale-110 transition-transform shadow-lg">
                    📤
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 group-hover:text-green-700 mb-0.5">Upload Sertifikat</h4>
                    <p className="text-xs text-gray-500">Upload file PDF sertifikat baru</p>
                  </div>
                </div>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
