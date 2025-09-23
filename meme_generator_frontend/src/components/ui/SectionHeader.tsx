import React from 'react';

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  iconBgColor?: string;
  iconColor?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon,
  title,
  subtitle,
  iconBgColor = 'bg-blue-100',
  iconColor = 'text-blue-600'
}) => {
  return (
    <div className="flex items-center mb-6">
      <div className={`${iconBgColor} p-2 rounded-lg mr-3`}>
        <div className={`w-5 h-5 ${iconColor}`}>
          {icon}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        {subtitle && <p className="text-gray-600 text-sm">{subtitle}</p>}
      </div>
    </div>
  );
};
