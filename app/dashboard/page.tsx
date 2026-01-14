import { getSession } from '@/lib/auth';
import { getUserById } from '@/lib/data-kv';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

function getGreeting(date: Date = new Date()): string {
  const gmt7 = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const hour = gmt7.getUTCHours();

  if (hour >= 4 && hour < 11) return "Good morning";
  if (hour >= 11 && hour < 15) return "Good afternoon";
  if (hour >= 15 && hour < 18) return "Good evening";
  return "Good night";
}

export default async function CertificatesLandingPage() {
  const session = await getSession();
  const user = session ? await getUserById(session.id) : null;

  if (!user) return <div>Loading...</div>;

  const greeting = getGreeting();
  const certificateCount = user.certificates?.length || 0;
  const latestCertificate = user.certificates?.[0];

  return (
    <div className="max-w-6xl mx-auto fade-in-up">
      {/* Welcome Section */}
      <section className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-[#4791EA] mb-4">
          Welcome, {user.name} 👋
        </h1>
        <p className="text-xl sm:text-2xl font-medium text-[#0A0909]">
          {greeting}!
        </p>
      </section>

      {/* Content Section */}
      <section className="bg-white rounded-xl border-2 border-gray-200 p-8 sm:p-10 mb-12 shadow-lg">
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed mb-6">
            Thank you for being part of the <strong>Start Friday Asia Brand & Business Strategy Consulting AI Innovation Internship.</strong> We truly appreciate the time, effort, and dedication you contributed throughout your experience with us.
          </p>

          <p className="text-gray-700 leading-relaxed mb-6">
            During your internship, you were exposed to real professional environments that emphasize clarity, accountability, and purposeful execution. Your involvement supported not only day-to-day operations, but also the broader culture we continue to build.
          </p>

          <p className="text-gray-700 leading-relaxed mb-6">
            This platform serves as a formal record of your participation. Your internship certificate reflects the learning journey you completed and the professional standards you demonstrated along the way.
          </p>

          <p className="text-gray-700 leading-relaxed">
            We wish you continued growth and success as you progress in your career. We hope the experience you gained here becomes a valuable foundation for your future endeavors.
          </p>
        </div>
      </section>

      {/* CTA Button */}
      <div className="text-center">
        <Link href="/dashboard/certificates">
          <Button
            size="lg"
            className="
              px-12 py-6 text-lg font-semibold rounded-lg
              bg-[#4791EA] text-white
              hover:bg-[#2874d1] hover:scale-105
              shadow-xl hover:shadow-2xl
              transition-all duration-300
            "
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            View My Certificate
          </Button>
        </Link>
      </div>
    </div>
  );
}
