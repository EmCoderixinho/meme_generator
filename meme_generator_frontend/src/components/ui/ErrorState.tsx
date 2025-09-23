import React from 'react';

interface ErrorStateProps {
    title?: string;
    message: string;
    icon?: React.ReactNode;
    iconBgColor?: string;
    iconColor?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
    title = 'Error',
    message,
    icon,
    iconBgColor = 'bg-red-100',
    iconColor = 'text-red-600'
}) => {
    const defaultIcon = (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
    );

    return (
        <div className="flex flex-col items-center justify-center space-y-4 p-8">
            <div className={`${iconBgColor} p-4 rounded-full`}>
                <div className={iconColor}>
                    {icon || defaultIcon}
                </div>
            </div>
            <div className="text-center">
                <h3 className="text-lg font-semibold text-red-800">{title}</h3>
                <p className="text-sm text-red-600 mt-2">{message}</p>
            </div>
        </div>
    );
};
