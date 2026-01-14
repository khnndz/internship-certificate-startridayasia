import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  isLoading, 
  icon,
  className = '',
  ...props 
}: ButtonProps) {
  const baseClass =
    'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClass =
    variant === 'primary'
      ? 'bg-[#4791EA] text-white hover:bg-[#2874d1] focus:ring-[#4791EA] shadow-sm hover:shadow-md'
      : variant === 'secondary'
        ? 'bg-white text-dark-700 border border-dark-200 hover:bg-dark-50 focus:ring-dark-200 shadow-sm'
        : variant === 'outline'
          ? 'bg-transparent text-[#4791EA] border border-[#4791EA] hover:bg-[#e8f3fd] focus:ring-[#4791EA]'
          : variant === 'danger'
            ? 'bg-danger text-white hover:bg-red-600 focus:ring-red-500 shadow-sm'
            : 'bg-success text-white hover:bg-green-600 focus:ring-green-500 shadow-sm';

  const sizeClass = size === 'sm' ? 'text-sm px-3 py-1.5' : size === 'lg' ? 'text-lg px-6 py-3' : 'px-4 py-2';
  
  return (
    <button 
      className={`${baseClass} ${variantClass} ${sizeClass} ${className} ${isLoading ? 'opacity-75 cursor-wait' : ''}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!isLoading && icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}
