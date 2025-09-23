import React, { useState } from 'react';
import { PreviewPanelProps } from '../types/meme';
import {
    LoadingSpinner,
    ErrorState,
    EmptyState,
    ImagePreview,
    PreviewControls,
    ImageInfo,
    StatusBar,
    SectionHeader
} from './ui';

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
    isLoading,
    apiError,
    previewImage,
    originalImage,
    canvasSize,
}) => {
    const [imageError, setImageError] = useState(false);
    const [showOriginal, setShowOriginal] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
    const [imageFits, setImageFits] = useState(false);

    const handleImageError = () => {
        setImageError(true);
    };

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        setImageError(false);
        
        // Capture the image element reference before setTimeout
        const img = e.currentTarget;
        
        // Use setTimeout to ensure the image has been properly rendered
        setTimeout(() => {
            if (!img) {
                return;
            }
            
            const container = img.parentElement?.parentElement;
            
            if (container) {
                const containerRect = container.getBoundingClientRect();
                const imageRect = img.getBoundingClientRect();
                
                // Get the actual image dimensions (not the displayed dimensions)
                const actualImageWidth = img.naturalWidth;
                const actualImageHeight = img.naturalHeight;
                
                // Check if the actual image is larger than the container
                const fitsWidth = actualImageWidth <= containerRect.width;
                const fitsHeight = actualImageHeight <= containerRect.height;
                
                setImageFits(fitsWidth && fitsHeight);
                
                // Reset position if image fits
                if (fitsWidth && fitsHeight) {
                    setImagePosition({ x: 0, y: 0 });
                }
            }
        }, 100); // Small delay to ensure proper rendering
    };

    const toggleView = () => {
        setShowOriginal(!showOriginal);
        // Reset image position when switching views
        setImagePosition({ x: 0, y: 0 });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
         if (imageFits) return; // Don't allow dragging if image fits
        
        setIsDragging(true);
        setDragStart({
            x: e.clientX - imagePosition.x,
            y: e.clientY - imagePosition.y
        });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || imageFits) return;
        
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        setImagePosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const resetImagePosition = () => {
        setImagePosition({ x: 0, y: 0 });
    };

    // Calculate optimal container dimensions based on canvas size
    const getContainerDimensions = () => {
        if (!canvasSize?.width || !canvasSize?.height) {
            return {
                className: "min-h-[200px]",
                style: {}
            };
        }

        const width = parseInt(canvasSize.width) || 0;
        const height = parseInt(canvasSize.height) || 0;
        
        if (width === 0 || height === 0) {
            return {
                className: "min-h-[200px]",
                style: {}
            };
        }
        
        // Use actual canvas dimensions, but ensure reasonable minimum size
        let containerWidth = Math.max(width, 200);
        let containerHeight = Math.max(height, 200);
        return {
            className: "",
                style: {
                    width: `${containerWidth}px`,
                    height: `${containerHeight}px`,
                    minHeight: '200px'
                }
        };
    };

    const containerConfig = getContainerDimensions();


    const MemeIcon = () => (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
    );

    return (
        <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-xl border border-gray-200">
            {/* Header */}
            <SectionHeader
                icon={<MemeIcon />}
                title="Preview"
                subtitle="See your meme come to life"
                iconBgColor="bg-gradient-to-r from-green-500 to-emerald-600"
                iconColor="text-white"
            />

            {/* Preview Container */}
            <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
                <div 
                    className={`p-4 ${containerConfig.className}`}
                    style={containerConfig.style}
                >
                    {isLoading && (
                        <LoadingSpinner 
                            message="Generating Preview"
                            subtitle="Please wait while we create your meme..."
                        />
                    )}
                    {!isLoading && apiError && (
                        <ErrorState 
                            title="Preview Error"
                            message={apiError}
                        />
                    )}
                    {!isLoading && !apiError && !originalImage && (
                        <EmptyState 
                            title="Ready to Create?"
                            message="Upload an image to start creating your meme"
                        />
                    )}
                    {!isLoading && !apiError && originalImage && (
                        <div className="relative w-full h-full">
                            <ImagePreview
                                src={showOriginal ? originalImage : previewImage || ''}
                                alt={showOriginal ? 'Original Image' : 'Meme Preview'}
                                title={showOriginal ? 'Original Image' : 'Meme Preview'}
                                onLoad={handleImageLoad}
                                onImageError={handleImageError}
                                isDragging={isDragging}
                                imagePosition={imagePosition}
                                imageFits={imageFits}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseLeave}
                            />
                            <PreviewControls
                                showOriginal={showOriginal}
                                onToggleView={toggleView}
                                hasOriginalImage={!!originalImage}
                                hasPreviewImage={!!previewImage}
                                imagePosition={imagePosition}
                                imageFits={imageFits}
                                onResetPosition={resetImagePosition}
                            />
                            <ImageInfo 
                                title={showOriginal ? 'Original Image' : 'Meme Preview'}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Status Bar */}
            <StatusBar
                hasOriginalImage={!!originalImage}
                hasPreviewImage={!!previewImage}
                isLoading={isLoading}
                showOriginal={showOriginal}
                canvasSize={canvasSize}
            />
        </div>
    );
};