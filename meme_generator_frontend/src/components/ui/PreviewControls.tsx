import React from 'react';

interface PreviewControlsProps {
    showOriginal: boolean;
    onToggleView: () => void;
    hasOriginalImage: boolean;
    hasPreviewImage: boolean;
    imagePosition: { x: number; y: number };
    imageFits: boolean;
    onResetPosition: () => void;
}

export const PreviewControls: React.FC<PreviewControlsProps> = ({
    showOriginal,
    onToggleView,
    hasOriginalImage,
    hasPreviewImage,
    imagePosition,
    imageFits,
    onResetPosition
}) => {
    return (
        <div className="absolute top-4 right-4 flex space-x-2">
            {hasOriginalImage && hasPreviewImage && (
                <button
                    onClick={onToggleView}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        showOriginal 
                            ? 'bg-blue-500 text-white shadow-lg' 
                            : 'bg-white text-gray-700 shadow-md hover:shadow-lg'
                    }`}
                >
                    {showOriginal ? 'Show Meme' : 'Show Original'}
                </button>
            )}
            {!imageFits && (imagePosition.x !== 0 || imagePosition.y !== 0) && (
                <button
                    onClick={onResetPosition}
                    className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-500 text-white shadow-md hover:shadow-lg transition-all duration-200"
                    title="Reset image position"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            )}
        </div>
    );
};
