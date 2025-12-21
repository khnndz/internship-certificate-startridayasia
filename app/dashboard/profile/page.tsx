import { getSession } from '@/lib/auth';
import { getUserById } from '@/lib/data-kv';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';

export default async function ProfilePage() {
  const session = await getSession();
  const user = session ? await getUserById(session.id) : null;

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-dark-900 mb-6">My Profile</h1>
      
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          <Avatar name={user.name} size="lg" className="w-24 h-24 text-3xl" />
          
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-dark-900">{user.name}</h2>
            <p className="text-dark-500 mb-2">{user.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <Badge variant="primary" className="capitalize">{user.role}</Badge>
              <Badge variant={user.status === 'Aktif' ? 'success' : 'neutral'}>{user.status}</Badge>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Internship Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">Full Name</label>
            <div className="p-3 bg-dark-50 rounded-lg text-dark-900">{user.name}</div>
          </div>
          <div>
            <label className="label">Email Address</label>
            <div className="p-3 bg-dark-50 rounded-lg text-dark-900">{user.email}</div>
          </div>
          <div>
            <label className="label">Status</label>
            <div className="p-3 bg-dark-50 rounded-lg text-dark-900">{user.status}</div>
          </div>
          <div>
            <label className="label">Total Certificates</label>
            <div className="p-3 bg-dark-50 rounded-lg text-dark-900">{user.certificates?.length || 0}</div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-dark-100 text-sm text-dark-500">
          <p>Your profile information is managed by StartFriday. Please contact the administrator if you need to update your details.</p>
        </div>
      </Card>
    </div>
  );
}
