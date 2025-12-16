import { getUsers } from '@/lib/data';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const users = getUsers();
  const totalUsers = users.filter(u => u.role === 'user').length;
  const totalCertificates = users.reduce((acc, user) => acc + (user.certificates?.length || 0), 0);
  const activeUsers = users.filter(u => u.status === 'Aktif' && u.role === 'user').length;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="card bg-gradient-to-r from-gray-800 to-gray-900 text-white">
        <h2 className="text-2xl font-bold mb-2">Admin Dashboard 👋</h2>
        <p className="opacity-90">Kelola user dan sertifikat magang dari sini.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total User</p>
              <p className="text-3xl font-bold text-gray-800">{totalUsers}</p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">User Aktif</p>
              <p className="text-3xl font-bold text-green-600">{activeUsers}</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Sertifikat</p>
              <p className="text-3xl font-bold text-primary-600">{totalCertificates}</p>
            </div>
            <div className="text-4xl">📜</div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Admin</p>
              <p className="text-3xl font-bold text-gray-800">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
            <div className="text-4xl">🛡️</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Aksi Cepat</h3>
        <div className="flex flex-wrap gap-4">
          <Link href="/admin/users" className="btn-primary">
            👥 Kelola User
          </Link>
          <Link href="/admin/upload-certificate" className="btn-success">
            📤 Upload Sertifikat
          </Link>
        </div>
      </div>

      {/* Recent Users */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">User Terbaru</h3>
          <Link href="/admin/users" className="text-primary-600 hover:underline text-sm">
            Lihat Semua →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Nama</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Email</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Sertifikat</th>
              </tr>
            </thead>
            <tbody>
              {users.filter(u => u.role === 'user').slice(0, 5).map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-800">{user.name}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === 'Aktif' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{user.certificates?.length || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
