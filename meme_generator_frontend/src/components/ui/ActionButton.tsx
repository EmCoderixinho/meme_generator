import React from 'react';

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  children,
  size = 'lg',
  fullWidth = false
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'py-2 px-4 text-sm';
      case 'md':
        return 'py-3 px-5 text-base';
      default:
        return 'py-4 px-6 text-lg';
    }
  };

  const buttonClasses = `
    ${fullWidth ? 'w-full' : ''} 
    bg-white hover:bg-gray-50 text-green-600 focus:ring-green-300
    font-bold rounded-lg focus:outline-none focus:ring-4 
    disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed 
    transition-all duration-200 flex items-center justify-center
    ${getSizeClasses()}
  `;

  const containerClasses = 'bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-lg shadow-lg';

  const button = (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={buttonClasses}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {children}
        </>
      ) : (
        <>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {children}
        </>
      )}
    </button>
  );

  if (containerClasses) {
    return <div className={containerClasses}>{button}</div>;
  }

  return button;
};
