import { getSession } from '@/lib/auth';
import { getUserById } from '@/lib/data-kv';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default async function CertificatePreviewPage() {
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
    <div className="bg-white w-full min-h-screen">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 py-16 space-y-12">

        {/* Page context */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#4791EA]">
            Your Internship Certificate
          </h1>
          <p className="text-base sm:text-lg text-[#0A0909] leading-relaxed">
            Below is the official internship certificate issued by Start Friday Asia.
            This document serves as formal recognition of your participation and
            completion of the <strong>Start Friday Asia Brand & Business Strategy Consulting AI Innovation Internship.</strong>
          </p>
        </section>

        {/* Certificate content */}
        {certificates.length > 0 ? (
          <section className="space-y-8">

            {/* Preview */}
            <div className="flex justify-center">
              <div className="w-full max-w-4xl border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                <div className="w-full h-[620px]">
                  <iframe
                    src={`/certificates/${certificates[0].file}`}
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="flex justify-center">
              <a href={`/api/download/${certificates[0].file}`} download>
                <Button
                  variant="primary"
                  className="
                    px-12 py-4 text-base font-semibold rounded-full
                    bg-[#4791EA] text-white
                    transition-all duration-300
                    hover:scale-105 hover:shadow-lg
                    active:scale-95
                  "
                >
                  Download Certificate (PDF)
                </Button>
              </a>
            </div>

          </section>
        ) : (
          <Card className="text-center py-20 border-dashed border-2 border-slate-300 shadow-none bg-white">
            <h3 className="text-xl font-semibold text-slate-700 mb-3">
              Certificate Not Available
            </h3>
            <p className="text-slate-500 max-w-md mx-auto">
              Your internship certificate is not yet available.
              Please allow some time for verification and approval
              by the Start Friday Asia team.
            </p>
          </Card>
        )}

      </div>
    </div>
  );
}
