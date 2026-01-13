import { getSession } from '@/lib/auth';
import { getUserByEmail } from '@/lib/data-kv';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
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
  const pdfUrl = certificates.length > 0 ? getCertificatePublicUrl(certificates[0].file) : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-600">
          <Link href="/dashboard" className="hover:text-[#4791EA] transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">Certificates</span>
        </nav>

        {/* Page Header */}
        <section className="text-center max-w-3xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#4791EA]">
            My Certificates
          </h1>
          <p className="text-base sm:text-lg text-[#0A0909]">
            View and download your internship certificates issued by Start Friday Asia
          </p>
        </section>

        {/* Certificate Display */}
        {certificates.length > 0 ?  (
          <section className="space-y-6">
            {/* PDF Preview */}
            <Card className="overflow-hidden border-2 border-gray-200">
              <div className="bg-gray-100 p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Preview</h3>
              </div>
              <div className="relative w-full bg-gray-50" style={{ height: '800px' }}>
                <iframe
                  src={pdfUrl}
                  className="absolute inset-0 w-full h-full"
                  title="Certificate Preview"
                />
              </div>
            </Card>

            {/* Download Button */}
            <div className="flex justify-center pt-4">
              <a 
                href={pdfUrl} 
                download={certificates[0].file}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="primary"
                  className="px-12 py-4 text-base font-semibold rounded-full"
                >
                  📥 Download Certificate (PDF)
                </Button>
              </a>
            </div>
          </section>
        ) : (
          <Card className="text-center py-20 border-dashed border-2 border-slate-300 shadow-none bg-white">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-slate-700 mb-3">
              Certificate Not Available
            </h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Your internship certificate is not yet available. 
              Please contact the administrator. 
            </p>
          </Card>
        )}

      </div>
    </div>
  );
}