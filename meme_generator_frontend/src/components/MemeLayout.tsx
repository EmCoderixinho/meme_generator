import React from 'react';

interface MemeLayoutProps {
    children: React.ReactNode;
    className?: string;
}

export const MemeLayout: React.FC<MemeLayoutProps> = ({ 
    children, 
    className = '' 
}) => {
    return (
        <div className={`container mx-auto p-4 flex flex-col gap-6 ${className}`}>
            {children}
        </div>
    );
};
