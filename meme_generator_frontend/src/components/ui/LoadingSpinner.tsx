import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    message?: string;
    subtitle?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'md',
    message = 'Loading...',
    subtitle
}) => {
    const sizeClasses = {
        sm: 'h-8 w-8',
        md: 'h-20 w-20',
        lg: 'h-32 w-32'
    };

    const textSizeClasses = {
        sm: 'text-sm',
        md: 'text-lg',
        lg: 'text-xl'
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
                <div className={`animate-spin rounded-full border-4 border-gray-200 ${sizeClasses[size]}`}></div>
                <div className={`animate-spin rounded-full border-4 border-blue-500 border-t-transparent absolute top-0 left-0 ${sizeClasses[size]}`}></div>
            </div>
            <div className="text-center">
                <p className={`font-semibold text-gray-700 ${textSizeClasses[size]}`}>{message}</p>
                {subtitle && (
                    <p className="text-sm text-gray-500">{subtitle}</p>
                )}
            </div>
        </div>
    );
};
