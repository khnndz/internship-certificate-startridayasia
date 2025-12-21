import { getSession } from '@/lib/auth';
import { getUserById } from '@/lib/data-kv';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await getSession();
  const user = session ? await getUserById(session.id) : null;

  if (!user) {
    return <div>Loading...</div>;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeCertificates = (user.certificates || []).filter((cert) => {
    if (!cert.expiryDate) return true;
    const expiryDate = new Date(cert.expiryDate);
    expiryDate.setHours(0, 0, 0, 0);
    return expiryDate >= today;
  });

  const certificateCount = activeCertificates.length;
  const lastUpdate = activeCertificates.length > 0 
    ? activeCertificates[activeCertificates.length - 1].issuedAt 
    : 'N/A';

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 p-10 text-white shadow-2xl">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-3">Welcome back, {user.name.split(' ')[0]}! 👋</h1>
          <p className="text-slate-300 text-lg">Access your internship certificates and track your progress.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all hover:scale-105">
          <div className="flex items-start justify-between mb-4">
            <div className="text-blue-600 text-sm font-semibold uppercase tracking-wider mb-2">Total Certificates</div>
            <div className="h-12 w-12 bg-blue-500 rounded-xl flex items-center justify-center text-2xl shadow-lg">
              📜
            </div>
          </div>
          <div className="text-4xl font-bold text-blue-900">{certificateCount}</div>
          <p className="text-xs text-blue-600 mt-2">Valid certificates</p>
        </Card>
        
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all hover:scale-105">
          <div className="flex items-start justify-between mb-4">
            <div className="text-green-600 text-sm font-semibold uppercase tracking-wider mb-2">Internship Status</div>
            <div className="h-12 w-12 bg-green-500 rounded-xl flex items-center justify-center text-2xl shadow-lg">
              ✅
            </div>
          </div>
          <div>
            <Badge variant={user.status === 'Aktif' ? 'success' : 'neutral'} className="text-base px-4 py-2 font-bold">
              {user.status}
            </Badge>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all hover:scale-105">
          <div className="flex items-start justify-between mb-4">
            <div className="text-purple-600 text-sm font-semibold uppercase tracking-wider mb-2">Last Update</div>
            <div className="h-12 w-12 bg-purple-500 rounded-xl flex items-center justify-center text-2xl shadow-lg">
              📅
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-900">{lastUpdate}</div>
        </Card>
      </div>

      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span className="text-3xl">📚</span>
            Recent Certificates
          </h2>
          <Link href="/dashboard/certificates" className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
            View All 
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {certificateCount > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCertificates.slice(0, 3).map((cert) => (
              <Card key={cert.id} className="hover:shadow-xl transition-all hover:scale-105 border-slate-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl text-white shadow-lg">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <div className="text-right">
                    <Badge variant="neutral" className="font-medium">{cert.issuedAt}</Badge>
                    {cert.expiryDate && (
                      <p className="text-xs text-slate-500 mt-1">
                        Berlaku sampai: {cert.expiryDate}
                      </p>
                    )}
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 text-lg">{cert.title}</h3>
                <p className="text-sm text-slate-500 mb-4 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  PDF Document
                </p>
                <a href={`/certificates/${cert.file}`} download className="block">
                  <Button variant="primary" className="w-full bg-gradient-to-r from-primary-500 to-blue-500 hover:from-primary-600 hover:to-blue-600 shadow-lg">
                    Download PDF
                  </Button>
                </a>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-16 border-dashed border-2 border-slate-300 shadow-none bg-slate-50">
            <div className="mx-auto w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-4 text-slate-400">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No certificates yet</h3>
            <p className="text-slate-500">Your certificates will appear here once approved by the StartFriday team.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
