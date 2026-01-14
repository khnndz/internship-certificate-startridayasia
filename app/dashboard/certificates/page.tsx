import { getSession } from '@/lib/auth';
import { getUserByEmail } from '@/lib/data-kv';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
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
    <div className="max-w-6xl mx-auto fade-in-up">
      {/* Back Button */}
      <div className="mb-6">
        <BackButton href="/dashboard" label="Back" />
      </div>

      {/* Page Header */}
      <section className="text-center mb-8">
        <h1 className="text-4xl lg:text-5xl font-bold text-[#4791EA] mb-4">
          Internship Certificate
        </h1>
        <p className="text-base sm:text-lg text-gray-600">
          View and download your official internship certificate
        </p>
      </section>

      {/* Certificate Display */}
      {certificates.length > 0 ? (
        <section className="space-y-6">
          {/* PDF Preview */}
          <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-lg">
            <div className="relative w-full bg-gray-50" style={{ height: '600px' }}>
              <iframe
                src={`${pdfUrl}#view=FitH`}
                className="absolute inset-0 w-full h-full"
                title="Certificate Preview"
              />
            </div>
          </div>

          {/* Download Button */}
          <div className="flex justify-center">
            <a 
              href={pdfUrl} 
              download={certificates[0].file}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                className="px-12 py-6 text-lg font-semibold rounded-lg bg-[#4791EA] text-white hover:bg-[#2874d1] hover:scale-105 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Certificate
              </Button>
            </a>
          </div>
        </section>
      ) : (
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-16 text-center">
          <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-700 mb-3">
            Certificate Not Available
          </h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Your internship certificate is not yet available. Please contact the administrator for more information.
          </p>
          <BackButton href="/dashboard" label="Back" />
        </div>
      )}
    </div>
  );
}
