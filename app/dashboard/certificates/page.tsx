import { getSession } from '@/lib/auth';
import { getUserByEmail } from '@/lib/data-kv';
import { redirect } from 'next/navigation';
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

        {/* Page Header */}
        <section className="text-center max-w-3xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#4791EA]">
            Internship Certificate
          </h1>
          <p className="text-base sm:text-lg text-[#0A0909]">
            View and download your official internship certificate issued by Start Friday Asia
          </p>
        </section>

        {/* Certificate Display */}
        {certificates.length > 0 ?  (
          <section className="space-y-6">
            {/* PDF Preview */}
            <Card className="overflow-hidden border-2 border-gray-200">
              <div className="relative w-full bg-gray-50" style={{ height: '600px' }}>
                <iframe
                  src={`${pdfUrl}#view=FitH`}
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
                  Download Certificate
                </Button>
              </a>
            </div>
          </section>
        ) : (
          <Card className="text-center py-20 border-dashed border-2 border-slate-300 shadow-none bg-white">
            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-3">
              Certificate Not Available
            </h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Your internship certificate is not yet available. 
              Please contact the administrator for more information.
            </p>
          </Card>
        )}

      </div>
    </div>
  );
}