import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getUserById } from '@/lib/data-kv';
import { Navbar } from '@/components/Navbar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const user = await getUserById(session.id);

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      <main className="px-4 sm:px-6 lg:px-10 py-8">
        <div className="flex gap-6">
          <div className="flex-1">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
