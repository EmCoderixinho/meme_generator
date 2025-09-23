import React from 'react';

interface StatusBarProps {
    hasOriginalImage: boolean;
    hasPreviewImage: boolean;
    isLoading: boolean;
    showOriginal: boolean;
    canvasSize?: { width: string; height: string };
}

export const StatusBar: React.FC<StatusBarProps> = ({
    hasOriginalImage,
    hasPreviewImage,
    isLoading,
    showOriginal,
    canvasSize
}) => {
    return (
        <div className="mt-4 flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
                {hasOriginalImage && (
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-600">Image uploaded</span>
                    </div>
                )}
                {hasPreviewImage && !isLoading && (
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-600">Preview ready</span>
                    </div>
                )}
            </div>
            <div className="text-gray-500">
                {hasOriginalImage && (
                    <span className="mr-4">
                        {showOriginal ? 'Original view' : 'Meme preview'}
                    </span>
                )}
                {canvasSize?.width && canvasSize?.height && (
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {canvasSize.width} × {canvasSize.height}px
                    </span>
                )}
            </div>
        </div>
    );
};
