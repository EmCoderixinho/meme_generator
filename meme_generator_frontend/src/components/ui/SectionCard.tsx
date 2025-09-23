import React from 'react';

interface SectionCardProps {
  children: React.ReactNode;
  className?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-md border border-gray-100 mb-8 ${className}`}>
      {children}
    </div>
  );
};
