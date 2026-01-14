'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
}

export function BackButton({ href, label = 'Back', className = '' }: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      return; // Let Link handle navigation
    }
    router.back();
  };

  const buttonClasses = `
    inline-flex items-center gap-2 px-4 py-2 
    text-sm font-medium text-gray-700 
    bg-white border border-gray-300 rounded-lg
    hover:bg-gray-50 hover:border-gray-400
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
    transition-all duration-200
    ${className}
  `;

  const icon = (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );

  if (href) {
    return (
      <Link href={href} className={buttonClasses}>
        {icon}
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <button onClick={handleClick} className={buttonClasses}>
      {icon}
      <span>{label}</span>
    </button>
  );
}
