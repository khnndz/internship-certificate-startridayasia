import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getUserById } from '@/lib/data-kv';
import { Header } from '@/components/layout/Header';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || session.role !== 'admin') {
    redirect('/login');
  }

  const user = await getUserById(session.id);

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-white">
      <Header user={{ name: user.name, email: user.email, role: user.role }} />
      <main className="pt-28 px-4 sm:px-6 lg:px-10 py-8">
        {children}
      </main>
    </div>
  );
}
