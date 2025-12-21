'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/app/actions/auth';
import { Avatar } from './ui/Avatar';

interface SidebarProps {
  user: {
    name: string;
    email: string;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: '📊' },
    { label: 'Users', href: '/admin/users', icon: '👥' },
    { label: 'Certificates', href: '/admin/upload-certificate', icon: '📜' },
    { label: 'My Profile', href: '/admin/profile', icon: '👤' },
  ];

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-dark-200 flex flex-col z-20">
      <div className="h-16 flex items-center px-6 border-b border-dark-100">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
            SF
          </div>
          <span className="text-lg font-bold text-dark-900">
            StartFriday<span className="font-light">Admin</span>
          </span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600'
                  : 'text-dark-600 hover:bg-dark-50 hover:text-dark-900 border-l-4 border-transparent'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-dark-100">
        <div className="flex items-center space-x-3 mb-4 px-2">
          <Avatar name={user.name} size="sm" />
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-dark-900 truncate">{user.name}</p>
            <p className="text-xs text-dark-500 truncate">{user.email}</p>
          </div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-dark-200 rounded-lg text-sm font-medium text-dark-600 hover:bg-dark-50 hover:text-dark-900 transition-colors"
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </div>
  );
}
