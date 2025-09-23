import React, { useState, useEffect, useRef } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { useMemeConfig } from '../hooks/useMemeConfig';
import { useFileUpload } from '../hooks/useFileUpload';
import { useCanvasSize } from '../hooks/useCanvasSize';
import { useFonts } from '../hooks/useFonts';
import { useMemeAPI } from '../hooks/useMemeAPI';
import { useFieldValidation } from '../hooks/useFieldValidation';
import { useConfigRouting } from '../hooks/useConfigRouting';
import { ControlsPanel } from './ControlsPanel';
import { PreviewPanel } from './PreviewPanel';
import { MemeLayout } from './MemeLayout';

const MemeEditor: React.FC = () => {
    // Custom hooks for state management
    const { config, handleConfigChange, updateConfig } = useMemeConfig();
    const { canvasSize, handleCanvasSizeChange } = useCanvasSize();
    const { availableFonts, fontsLoading, error: fontsError } = useFonts();
    const { isLoading, apiError, saveConfig, generatePreview, generateMeme } = useMemeAPI();
    const { configId, isNewConfig, updateConfigId } = useConfigRouting();
    
    // Local state
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const isInitialMount = useRef(true);
    
    // Field validation
    const { fieldErrors, setFieldError, clearFieldError } = useFieldValidation(config, canvasSize, originalImage);

    const debouncedConfig = useDebounce(config, 500);
    const debouncedCanvasSize = useDebounce(canvasSize, 500);

    // File upload hooks
    const imageUpload = useFileUpload({
        onSuccess: (dataUrl) => setOriginalImage(dataUrl),
        onError: (error) => setFieldError('imageUpload', error),
    });

    const watermarkUpload = useFileUpload({
        onSuccess: (dataUrl) => updateConfig({ watermarkImage: dataUrl }),
        onError: (error) => setFieldError('watermarkUpload', error),
    });

    const handleClearWatermark = () => {
        updateConfig({ watermarkImage: '' });
    };

    // Update font family if current font is not available
    useEffect(() => {
        if (availableFonts.length > 0 && !availableFonts.includes(config.fontFamily)) {
            updateConfig({ fontFamily: availableFonts[0] || 'Impact' });
        }
    }, [availableFonts, config.fontFamily, updateConfig]);

    // Save config when it changes
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        // Always save config first to get/update configId
        saveConfig(debouncedConfig, isNewConfig ? undefined : configId || undefined)
            .then((newConfigId) => {
                // If this was a new config, update the config ID and route
                if (isNewConfig && newConfigId) {
                    updateConfigId(newConfigId);
                }
                
                // Generate preview after config is saved
                if (originalImage && (newConfigId || configId)) {
                    const canvasSizeForAPI = {
                        width: debouncedCanvasSize.width ? parseInt(debouncedCanvasSize.width, 10) : undefined,
                        height: debouncedCanvasSize.height ? parseInt(debouncedCanvasSize.height, 10) : undefined,
                    };

                    generatePreview(originalImage, newConfigId || configId!, canvasSizeForAPI)
                        .then(setPreviewImage)
                        .catch(() => {
                            setPreviewImage(null);
                        });
                }
            })
            .catch(() => {
                // Error handling is done in the hook
            });
    }, [debouncedConfig, saveConfig, configId, isNewConfig, updateConfigId, originalImage, debouncedCanvasSize, generatePreview]);

    // Generate preview when image changes (but not config changes)
    useEffect(() => {
        if (!originalImage || !configId) {
            setPreviewImage(null);
            return;
        }

        const canvasSizeForAPI = {
            width: debouncedCanvasSize.width ? parseInt(debouncedCanvasSize.width, 10) : undefined,
            height: debouncedCanvasSize.height ? parseInt(debouncedCanvasSize.height, 10) : undefined,
        };

        generatePreview(originalImage, configId, canvasSizeForAPI)
            .then(setPreviewImage)
            .catch(() => {
                setPreviewImage(null);
            });
    }, [originalImage, configId, debouncedCanvasSize, generatePreview]);

    const handleGenerateMeme = async () => {
        if (!originalImage || !configId) return;
        
        try {
            await generateMeme(originalImage, configId);
        } catch (error) {
            // Error handling is done in the hook
        }
    };

    return (
        <MemeLayout>
            <ControlsPanel
                config={config}
                canvasSize={canvasSize}
                fieldErrors={fieldErrors}
                apiError={apiError || fontsError}
                isLoading={isLoading}
                originalImage={originalImage}
                configId={configId}
                availableFonts={availableFonts}
                fontsLoading={fontsLoading}
                handleConfigChange={handleConfigChange}
                handleImageUpload={imageUpload.handleFileUpload}
                handleWatermarkUpload={watermarkUpload.handleFileUpload}
                handleClearWatermark={handleClearWatermark}
                handleCanvasSizeChange={handleCanvasSizeChange}
                handleGenerateMeme={handleGenerateMeme}
            />
            <PreviewPanel
                isLoading={isLoading}
                apiError={apiError}
                previewImage={previewImage}
                originalImage={originalImage}
                canvasSize={canvasSize}
            />
        </MemeLayout>
    );
};

export default MemeEditor;