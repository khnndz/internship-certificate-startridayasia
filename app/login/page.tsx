'use client';

import { useState } from 'react';
import { loginAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import Image from 'next/image';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    try {
      const result = await loginAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    } catch {
      // redirect handled by server
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Header */}
      <header className="w-full bg-[#4791EA]">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <a
            href="https://www.startfriday.asia/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center w-fit"
          >
            <Image
              src="/img/SF_logo.webp"
              alt="Start Friday Asia"
              width={44}
              height={44}
              className="mr-4"
            />
            <span className="text-xl font-semibold text-white">
              Start Friday Asia
            </span>
          </a>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6 mt-10">
        <div className="w-full max-w-xl">

          {/* Title */}
          <section className="text-center mb-10">
            <h1 className="text-3xl font-bold text-[#4791EA] mb-3 max-w-2xl">
              Start Friday Asia Brand & Business Strategy Consulting AI Innovation Internship
            </h1>
            <p className="text-base text-[#0A0909]">
              Please enter your registered credentials to access the system.
            </p>
          </section>

          {/* Card */}
          <Card className="shadow-sm border border-slate-200 p-10">

            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Form wrapper (biar tidak terlalu lebar) */}
            <div className="max-w-md mx-auto">
              <form action={handleSubmit} className="space-y-5">

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="
                      w-full rounded-lg border border-slate-300
                      px-4 py-3 text-slate-900
                      focus:border-[#4791EA] focus:ring-2 focus:ring-[#4791EA]/20
                      outline-none transition
                    "
                    placeholder="name@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="
                      w-full rounded-lg border border-slate-300
                      px-4 py-3 text-slate-900
                      focus:border-[#4791EA] focus:ring-2 focus:ring-[#4791EA]/20
                      outline-none transition
                    "
                    placeholder="••••••••"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="
                    w-full mt-2 rounded-full
                    bg-[#4791EA] text-white
                    py-3 text-base font-semibold
                    transition-all duration-300
                    hover:shadow-lg hover:scale-[1.02]
                    disabled:opacity-50 disabled:hover:scale-100
                  "
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>

              </form>
            </div>
          </Card>

          {/* Footer info */}
          <p className="mt-8 text-center text-sm text-slate-600">
            Do not have an account? Please contact the administrator for registration.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Start Friday Asia. All rights reserved.
      </footer>
    </div>
  );
}
