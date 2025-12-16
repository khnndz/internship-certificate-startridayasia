import { getSession } from '@/lib/auth';
import { getUserById } from '@/lib/data';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await getSession();
  const user = session ? getUserById(session.id) : null;

  if (!user) {
    return <div>Loading...</div>;
  }

  const certificateCount = user.certificates?.length || 0;

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="card bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <h2 className="text-2xl font-bold mb-2">Selamat Datang, {user.name}! 👋</h2>
        <p className="opacity-90">Kelola dan download sertifikat magang Anda di sini.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Status Magang</p>
              <p className="text-2xl font-bold text-gray-800">{user.status}</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Sertifikat</p>
              <p className="text-2xl font-bold text-gray-800">{certificateCount}</p>
            </div>
            <div className="text-4xl">📜</div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Role</p>
              <p className="text-2xl font-bold text-gray-800 capitalize">{user.role}</p>
            </div>
            <div className="text-4xl">👤</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Aksi Cepat</h3>
        <div className="flex flex-wrap gap-4">
          <Link href="/dashboard/certificates" className="btn-primary">
            📜 Lihat Sertifikat
          </Link>
        </div>
      </div>

      {/* Recent Certificates */}
      {certificateCount > 0 && (
        <div className="card">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Sertifikat Terbaru</h3>
          <div className="space-y-3">
            {user.certificates.slice(0, 3).map((cert) => (
              <div 
                key={cert.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📄</span>
                  <div>
                    <p className="font-medium text-gray-800">{cert.title}</p>
                    <p className="text-sm text-gray-500">Diterbitkan: {cert.issuedAt}</p>
                  </div>
                </div>
                <a 
                  href={`/certificates/${cert.file}`}
                  download
                  className="btn-success text-sm"
                >
                  ⬇️ Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
