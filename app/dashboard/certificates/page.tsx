import { getSession } from '@/lib/auth';
import { getUserByEmail } from '@/lib/data-kv';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getCertificatePublicUrl } from '@/lib/supabase';

export default async function CertificatesPage() {
  const session = await getSession();

  if (!session || session.role !== 'user') {
    redirect('/login');
  }

  const user = await getUserByEmail(session.email);

  if (!user) {
    redirect('/login');
  }

  const certificates = user.certificates || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">My Certificates</h1>
          <p className="text-dark-500">Download your internship certificates</p>
        </div>
        <Badge variant="primary" className="text-sm px-3 py-1">
          Total:  {certificates.length}
        </Badge>
      </div>

      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <Card key={cert.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-primary-50 rounded-lg text-primary-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <Badge variant="neutral">{cert.issuedAt}</Badge>
              </div>
              <h3 className="font-bold text-dark-900 mb-1 line-clamp-1">{cert.title}</h3>
              <p className="text-sm text-dark-500 mb-4">PDF Document</p>
              <a href={getCertificatePublicUrl(cert.file)} download target="_blank" rel="noopener noreferrer" className="block">
                <Button variant="primary" className="w-full">Download PDF</Button>
              </a>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12 border-dashed border-2 border-dark-200 shadow-none">
          <div className="mx-auto w-16 h-16 bg-dark-50 rounded-full flex items-center justify-center mb-4 text-dark-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-dark-900 mb-1">No certificates yet</h3>
          <p className="text-dark-500">Your certificates will appear here once approved by the StartFriday team.</p>
        </Card>
      )}
    </div>
  );
}