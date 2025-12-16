import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { getUserById } from '@/lib/data';
import { logoutAction } from '@/app/actions/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const user = getUserById(session.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <span className="text-2xl">🎓</span>
              <h1 className="text-xl font-bold text-gray-800">
                Portal Sertifikat
              </h1>
            </div>
            
            <nav className="flex items-center space-x-6">
              <Link 
                href="/dashboard" 
                className="text-gray-600 hover:text-primary-600 font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                href="/dashboard/certificates" 
                className="text-gray-600 hover:text-primary-600 font-medium transition-colors"
              >
                Sertifikat
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <form action={logoutAction}>
                <button 
                  type="submit"
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
