'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Avatar } from './ui/Avatar';
import { logoutAction } from '@/app/actions/auth';

interface NavbarProps {
  user: {
    name: string;
    email: string;
  };
}

export function Navbar({ user }: NavbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="bg-[#4791EA] sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-24">

          {/* LOGO LEFT */}
          <Link
            href="https://www.startfriday.asia/"
            rel="noopener noreferrer"
            className="flex items-center"
          >
            <div className="w-50 h-30 rounded-full bg-white flex items-center justify-center">
              <Image
                src="/img/SF_logo.webp"
                alt="Start Friday Asia"
                width={65}
                height={65}
                priority
              />
            </div>
          </Link>

          {/* PROFILE RIGHT */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 focus:outline-none"
            >
              <span className="hidden sm:block text-sm font-medium text-white">
                {user.name}
              </span>
              <Avatar name={user.name} />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-slate-200">
                  <p className="text-sm font-medium text-slate-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {user.email}
                  </p>
                </div>

                <Link
                  href="/dashboard/profile"
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  onClick={() => setIsProfileOpen(false)}
                >
                  My Profile
                </Link>

                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </form>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
