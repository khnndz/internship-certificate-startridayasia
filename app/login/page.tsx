'use client';

import { useState } from 'react';
import { loginAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PasswordInput } from '@/components/ui/PasswordInput';
import Image from 'next/image';
import Link from 'next/link';

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
    <div className="min-h-screen bg-gradient-to-br from-[#e8f3fd] via-white to-[#e8f3fd] flex flex-col">

      {/* Header */}
      <header className="w-full bg-[#4791EA]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
          <Link
            href="https://www.startfriday.asia/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center w-fit hover:opacity-90 transition-opacity"
          >
            <Image
              src="/img/SF_logo.webp"
              alt="Start Friday Asia"
              width={44}
              height={44}
              className="mr-3"
            />
            <span className="text-xl font-semibold text-white">
              Start Friday Asia
            </span>
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-md fade-in-up">

          {/* Title */}
          <section className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0A0909] mb-3">
              Welcome Back
            </h1>
            <p className="text-base text-gray-600">
              Please enter your registered credentials to access the system.
            </p>
          </section>

          {/* Card */}
          <Card className="shadow-lg border border-gray-200 p-8 bg-white">

            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 fade-in">
                {error}
              </div>
            )}

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
                  autoComplete="email"
                  className="
                    w-full rounded-lg border border-slate-300
                    px-4 py-3 text-slate-900
                    focus:border-[#4791EA] focus:ring-2 focus:ring-[#4791EA]/20
                    outline-none transition
                  "
                  placeholder="name@example.com"
                />
              </div>

              <PasswordInput
                id="password"
                name="password"
                label="Password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
              />

              <Button
                type="submit"
                disabled={loading}
                isLoading={loading}
                className="
                  w-full mt-2 rounded-lg
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
          </Card>

          {/* Footer info */}
          <p className="mt-6 text-center text-sm text-slate-600">
            Do not have an account? Please contact the administrator for registration.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-slate-500 border-t border-gray-200">
        © {new Date().getFullYear()} Start Friday Asia. All rights reserved.
      </footer>
    </div>
  );
}
