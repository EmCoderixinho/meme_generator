import React from 'react';
import { PreviewPanelProps } from '../types/meme';

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
    isLoading,
    apiError,
    previewImage,
    originalImage,
}) => {
    return (
        <div className="bg-gray-200 p-4 rounded-lg shadow-lg flex items-center justify-center min-h-[400px]">
            {isLoading && (
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-2">Loading Preview...</p>
                </div>
            )}
            {!isLoading && apiError && (
                <div className="text-center text-red-600 bg-red-100 p-4 rounded-lg">
                    <p className="font-bold">Preview Error</p>
                    <p className="text-sm">{apiError}</p>
                </div>
            )}
            {!isLoading && !apiError && previewImage && (
                <img src={previewImage} alt="Meme Preview" className="max-w-full max-h-full object-contain" />
            )}
            {!isLoading && !apiError && !originalImage && (
                <div className="text-center text-gray-500">
                    <p className="text-lg">Please upload an image to start.</p>
                </div>
            )}
        </div>
    );
};