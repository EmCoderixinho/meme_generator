import React from 'react';

interface ImageInfoProps {
    title: string;
    position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
    className?: string;
}

export const ImageInfo: React.FC<ImageInfoProps> = ({
    title,
    position = 'bottom-left',
    className = ''
}) => {
    const positionClasses = {
        'bottom-left': 'bottom-4 left-4',
        'bottom-right': 'bottom-4 right-4',
        'top-left': 'top-4 left-4',
        'top-right': 'top-4 right-4'
    };

    return (
        <div className={`absolute ${positionClasses[position]} bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-sm ${className}`}>
            <span className="font-medium">{title}</span>
        </div>
    );
};
