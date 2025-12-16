import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { getUserById } from '@/lib/data';
import { logoutAction } from '@/app/actions/auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    redirect('/login');
  }

  const user = getUserById(session.id);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gray-900 text-white">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🎓</span>
            <div>
              <h1 className="font-bold text-lg">Admin Panel</h1>
              <p className="text-xs text-gray-400">Sertifikat Magang</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <Link
            href="/admin"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <span>📊</span>
            <span>Dashboard</span>
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <span>👥</span>
            <span>Kelola User</span>
          </Link>
          <Link
            href="/admin/upload-certificate"
            className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <span>📤</span>
            <span>Upload Sertifikat</span>
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">
                {user?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <div>
              <p className="font-medium text-sm">{user?.name}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm transition-colors"
            >
              🚪 Logout
            </button>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 min-h-screen">
        <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
          <h2 className="text-xl font-bold text-gray-800">Admin Dashboard</h2>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
