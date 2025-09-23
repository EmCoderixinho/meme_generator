import React, { useState } from 'react';

interface ImagePreviewProps {
    src: string;
    alt: string;
    title: string;
    onError?: () => void;
    onLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
    className?: string;
    style?: React.CSSProperties;
    draggable?: boolean;
    isDragging?: boolean;
    imagePosition?: { x: number; y: number };
    imageFits?: boolean;
    onMouseDown?: (e: React.MouseEvent) => void;
    onMouseMove?: (e: React.MouseEvent) => void;
    onMouseUp?: (e: React.MouseEvent) => void;
    onMouseLeave?: (e: React.MouseEvent) => void;
    onImageError?: () => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
    src,
    alt,
    title,
    onError,
    onLoad,
    className = '',
    style = {},
    draggable = false,
    isDragging = false,
    imagePosition = { x: 0, y: 0 },
    imageFits = false,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
    onImageError
}) => {
    const [imageError, setImageError] = useState(false);

    const handleImageError = () => {
        setImageError(true);
        onError?.();
        onImageError?.();
    };

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        setImageError(false);
        onLoad?.(e);
    };

    if (imageError) {
        return (
            <div className="flex flex-col items-center justify-center space-y-4 p-8 h-full">
                <div className="bg-gray-100 p-4 rounded-full">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <p className="text-gray-500">Failed to load image</p>
            </div>
        );
    }

    return (
        <div 
            className="relative w-full h-full bg-white rounded-lg shadow-inner border-2 border-gray-100 overflow-auto"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            style={{ 
                cursor: imageFits 
                    ? 'default' 
                    : isDragging 
                        ? 'grabbing' 
                        : 'grab' 
            }}
        >
            <div 
                className="relative"
                style={{
                    transform: `translate(${imagePosition.x}px, ${imagePosition.y}px)`,
                    transition: isDragging ? 'none' : 'transform 0.2s ease-out'
                }}
            >
                <img 
                    src={src} 
                    alt={alt}
                    className={`rounded-lg ${className}`}
                    style={{
                        display: 'block',
                        minWidth: '100%',
                        minHeight: '100%',
                        objectFit: 'contain',
                        ...style
                    }}
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                    draggable={draggable}
                />
            </div>
        </div>
    );
};
