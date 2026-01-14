'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Avatar } from '@/components/ui/Avatar';
import { logoutAction } from '@/app/actions/auth';

interface HeaderProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export function Header({ user }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY) {
        // Scrolling down
        setIsVisible(false);
        setIsDropdownOpen(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const profileLink = user.role === 'admin' ? '/admin/profile' : '/dashboard/profile';
  const dashboardLink = user.role === 'admin' ? '/admin' : '/dashboard';

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 bg-[#4791EA] shadow-md transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
      style={{ height: '64px' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Left side - Logo */}
          <Link
            href="https://startfriday.asia"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 hover:opacity-90 transition-opacity"
          >
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden">
              <Image
                src="/img/SF_logo.webp"
                alt="Start Friday Asia"
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
            <span className="text-white font-semibold text-lg hidden sm:block">
              Start Friday Asia
            </span>
          </Link>

          {/* Right side - User profile dropdown */}
          <div className="relative dropdown-container">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 sm:gap-3 focus:outline-none hover:opacity-90 transition-opacity"
              aria-label="User menu"
            >
              <span className="hidden sm:block text-sm font-medium text-white">
                {user.name}
              </span>
              <Avatar name={user.name} size="sm" />
            </button>

            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 slide-in-down">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.email}
                  </p>
                  <p className="text-xs text-primary-600 font-medium mt-1 capitalize">
                    {user.role}
                  </p>
                </div>

                <Link
                  href={dashboardLink}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Dashboard
                </Link>

                <Link
                  href={profileLink}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Profile
                </Link>

                <div className="border-t border-gray-100 mt-1 pt-1">
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Logout
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
