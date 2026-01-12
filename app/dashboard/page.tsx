import { getSession } from '@/lib/auth';
import { getUserById } from '@/lib/data-kv';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

function getGreeting(date: Date = new Date()): string {
  const gmt7 = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  const hour = gmt7.getUTCHours();

  if (hour >= 4 && hour < 11) return "Good morning ☀️";
  if (hour >= 11 && hour < 15) return "Good afternoon 🌤️";
  if (hour >= 15 && hour < 18) return "Good evening 🌅";
  return "Good night 🌙";
}

export default async function CertificatesLandingPage() {
  const session = await getSession();
  const user = session ? await getUserById(session.id) : null;

  if (!user) return <div>Loading...</div>;

  return (
    <div className="bg-white w-full min-h-screen">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 py-20">

        {/* Header */}
        <section className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#4791EA]">
            Welcome, {user.name} 👋
          </h1>

          <p className="mt-4 text-xl sm:text-2xl font-medium text-[#0A0909] animate-fade-in">
            {getGreeting()}
          </p>
        </section>

        {/* Main content */}
        <section className="max-w-4xl mx-auto text-[#0A0909] text-base sm:text-lg leading-relaxed space-y-6">
          <p>
            Thank you for being part of the <strong>Start Friday Asia Brand & Business Strategy Consulting AI Innovation Internship.</strong>
            We truly appreciate the time, effort, and dedication you contributed
            throughout your experience with us.
          </p>

          <p>
            During your internship, you were exposed to real professional environments
            that emphasize clarity, accountability, and purposeful execution.
            Your involvement supported not only day-to-day operations,
            but also the broader culture we continue to build.
          </p>

          <p>
            This platform serves as a formal record of your participation.
            Your internship certificate reflects the learning journey you completed
            and the professional standards you demonstrated along the way.
          </p>

          <p>
            We wish you continued growth and success as you progress in your career.
            We hope the experience you gained here becomes a valuable foundation
            for your future endeavors.
          </p>
        </section>

        {/* CTA */}
        <div className="mt-20 flex justify-center">
          <Link href="/dashboard/certificates">
            <Button
              variant="primary"
              className="
                px-14 py-4 text-base font-semibold rounded-full
                bg-[#4791EA] text-white
                transition-all duration-300
                hover:scale-105 hover:shadow-lg
                active:scale-95
              "
            >
              View My Certificate
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
