"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: '🏠' },
  { label: 'Certificates', href: '/dashboard/certificates', icon: '📜' },
  { label: 'My Profile', href: '/dashboard/profile', icon: '👤' },
];

export function UserSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:block w-64 flex-shrink-0">
      <nav className="bg-white border border-dark-100 rounded-2xl p-4 shadow-sm">
        <h2 className="text-xs font-semibold text-dark-500 uppercase tracking-wide mb-3">
          Menu
        </h2>
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-dark-600 hover:text-dark-900 hover:bg-dark-50'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
