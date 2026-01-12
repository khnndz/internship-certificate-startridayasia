import { getSession } from '@/lib/auth';
import { getUserById } from '@/lib/data-kv';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';

export default async function ProfilePage() {
  const session = await getSession();
  const user = session ? await getUserById(session.id) : null;

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-white w-full min-h-screen">
      <div className="max-w-5xl mx-auto px-6 sm:px-10 py-20 space-y-12">

        {/* Page Header */}
        <section className="text-center max-w-3xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#4791EA]">
            My Profile
          </h1>
          <p className="text-base sm:text-lg text-[#0A0909]">
            This page displays your registered profile information
            as recorded by Start Friday Asia.
          </p>
        </section>

        {/* Profile Card */}
        <Card className="max-w-4xl mx-auto shadow-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">

            {/* Avatar */}
            <Avatar
              name={user.name}
              className="w-28 h-28 text-3xl"
            />

            {/* Identity */}
            <div className="flex-1 space-y-3 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-[#0A0909]">
                {user.name}
              </h2>

              <p className="text-base text-slate-600">
                {user.email}
              </p>

              <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-2">
                <Badge variant="primary" className="capitalize">
                  {user.role}
                </Badge>
                <Badge
                  variant={user.status === 'Aktif' ? 'success' : 'neutral'}
                >
                  {user.status}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Profile Details */}
        <Card className="max-w-4xl mx-auto shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm sm:text-base">

            <div>
              <p className="text-slate-500 mb-1">Full Name</p>
              <div className="px-4 py-3 bg-slate-50 rounded-lg text-[#0A0909]">
                {user.name}
              </div>
            </div>

            <div>
              <p className="text-slate-500 mb-1">Email Address</p>
              <div className="px-4 py-3 bg-slate-50 rounded-lg text-[#0A0909]">
                {user.email}
              </div>
            </div>

            <div>
              <p className="text-slate-500 mb-1">Account Status</p>
              <div className="px-4 py-3 bg-slate-50 rounded-lg text-[#0A0909]">
                {user.status}
              </div>
            </div>

            <div>
              <p className="text-slate-500 mb-1">Certificates Issued</p>
              <div className="px-4 py-3 bg-slate-50 rounded-lg text-[#0A0909]">
                {user.certificates?.length || 0}
              </div>
            </div>

          </div>

          {/* Info Notice */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-sm text-slate-600">
            <p>
              Your profile information is managed by Start Friday Asia.
              Please contact the administrator if you need to update your details.
            </p>
          </div>
        </Card>

      </div>
    </div>
  );
}
