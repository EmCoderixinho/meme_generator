import React from 'react';

interface EmptyStateProps {
    title?: string;
    message?: string;
    icon?: React.ReactNode;
    iconBgColor?: string;
    iconColor?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    title = 'Ready to Start',
    message = 'Upload an image to begin',
    icon,
    iconBgColor = 'bg-gradient-to-br from-blue-100 to-purple-100',
    iconColor = 'text-blue-600'
}) => {
    const defaultIcon = (
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    );

    return (
        <div className="flex flex-col items-center justify-center space-y-6 p-8">
            <div className={`${iconBgColor} p-6 rounded-full`}>
                <div className={iconColor}>
                    {icon || defaultIcon}
                </div>
            </div>
            <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                <p className="text-gray-600 mt-2">{message}</p>
            </div>
        </div>
    );
};
