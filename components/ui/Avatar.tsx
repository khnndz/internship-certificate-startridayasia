import React from 'react';
import Image from 'next/image';

interface AvatarProps {
  name: string;
  email?: string;
  role?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Hash string to generate consistent color
function stringToColor(str: string): string {
  const colors = ['#4791EA', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4', '#EF4444', '#6366F1', '#14B8A6', '#F97316'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({ name, email, role, size = 'md', className = '' }: AvatarProps) {
  const sizes = {
    sm: { container: 'w-10 h-10', text: 'text-xs', icon: 'w-5 h-5' },
    md: { container: 'w-12 h-12', text: 'text-sm', icon: 'w-6 h-6' },
    lg: { container: 'w-20 h-20', text: 'text-lg', icon: 'w-10 h-10' },
  };

  const sizeConfig = sizes[size];

  // Admin users: show admin avatar image
  if (role === 'admin') {
    return (
      <div className={`${sizeConfig.container} rounded-full overflow-hidden bg-white border-2 border-white shadow-md hover:shadow-lg transition-all duration-300 ${className}`}>
        <Image
          src="/img/admin-avatar.webp"
          alt={name}
          width={80}
          height={80}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Regular users: colorful SVG avatar
  const backgroundColor = stringToColor(email || name);
  
  return (
    <div 
      className={`${sizeConfig.container} rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 ${className}`}
      style={{ backgroundColor }}
    >
      <svg 
        className={`${sizeConfig.icon} text-white`}
        fill="currentColor" 
        viewBox="0 0 24 24"
      >
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
    </div>
  );
}
