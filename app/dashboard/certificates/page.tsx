import { getSession } from '@/lib/auth';
import { getUserById } from '@/lib/data-kv';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default async function CertificatesPage() {
  const session = await getSession();
  const user = session ? await getUserById(session.id) : null;

  if (!user) {
    return <div>Loading...</div>;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const certificates = (user.certificates || []).filter((cert) => {
    if (!cert.expiryDate) return true;
    const expiryDate = new Date(cert.expiryDate);
    expiryDate.setHours(0, 0, 0, 0);
    return expiryDate >= today;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <span className="text-4xl">📜</span>
            My Certificates
          </h1>
          <p className="text-slate-600 mt-1">Download your internship certificates</p>
        </div>
        <Badge variant="primary" className="text-base px-5 py-2 font-bold shadow-lg bg-gradient-to-r from-primary-500 to-blue-500">
          Total: {certificates.length}
        </Badge>
      </div>

      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
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
  );
}
