import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { MemeConfig } from '../types/meme';
import { ControlsPanel } from './ControlsPanel';
import { PreviewPanel } from './PreviewPanel';

const MemeEditor: React.FC = () => {
    const [config, setConfig] = useState<MemeConfig>({
        topText: 'Top Text',
        bottomText: 'Bottom Text',
        fontFamily: 'Impact',
        fontSize: 50,
        textColor: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 2,
        textAlign: 'center',
        padding: 20,
        allCaps: true,
        scaleDown: 0.05,
        watermarkImage: '',
        watermarkPosition: 'bottom-right',
    });

    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string | null }>({});
    const [configId, setConfigId] = useState<string | null>(null);
    const isInitialMount = useRef(true);
    const [canvasSize, setCanvasSize] = useState<{ width: string; height: string }>({ width: '', height: '' });

    const debouncedConfig = useDebounce(config, 500);
    const debouncedCanvasSize = useDebounce(canvasSize, 500);

    const handleConfigChange = (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, type } = e.currentTarget;
        const value =
            type === 'checkbox' && e.currentTarget instanceof HTMLInputElement
                ? e.currentTarget.checked
                : e.currentTarget.value;

        setConfig((prev) => ({
            ...prev,
            [name]: (() => {
                if (type === 'checkbox') return value;
                if (typeof value === 'string' && !isNaN(Number(value)) && value !== '') { // Check if it's a valid number string
                    const numValue = Number(value); // Convert to number
                    // Round the values for fields that must be integers for the backend
                    return ['fontSize', 'strokeWidth', 'padding'].includes(name)
                        ? Math.round(numValue)
                        : numValue;
                }
                return value;
            })(),
        }));
    };

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const fileInput = e.currentTarget;
        if (fileInput.files && fileInput.files[0]) {
            const file = fileInput.files[0];
            const maxSize = 10 * 1024 * 1024;

            if (file.size > maxSize) {
                setFieldErrors(prev => ({ ...prev, imageUpload: 'Image is too large. Please upload an image smaller than 10MB.' }));
                setOriginalImage(null);
                fileInput.value = ''; 
                return;
            }

            setFieldErrors(prev => ({ ...prev, imageUpload: null }));

            const reader = new FileReader();
            reader.onload = (event) => {
                setOriginalImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setOriginalImage(null);
        }
    };

    const handleWatermarkUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const fileInput = e.currentTarget;
        if (fileInput.files && fileInput.files[0]) {
            const file = fileInput.files[0];
            const maxSize = 10 * 1024 * 1024;

            if (file.size > maxSize) {
                setFieldErrors(prev => ({ ...prev, watermarkUpload: 'Watermark is too large. Please upload an image smaller than 10MB.' }));
                setConfig(prev => ({ ...prev, watermarkImage: '' }));
                fileInput.value = '';
                return;
            }

            setFieldErrors(prev => ({ ...prev, watermarkUpload: null }));

            const reader = new FileReader();
            reader.onload = (event) => {
                setConfig(prev => ({ ...prev, watermarkImage: event.target?.result as string }));
            };
            reader.readAsDataURL(file);
        } else {
            setConfig(prev => ({ ...prev, watermarkImage: '' }));
        }
    };

    const handleCanvasSizeChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.currentTarget;
        setCanvasSize(prev => ({ ...prev, [name]: value }));
    };

    const handleClearWatermark = () => {
        setConfig(prev => ({ ...prev, watermarkImage: '' }));
    };

    useEffect(() => {
        const effectiveCanvasWidth = canvasSize.width ? parseInt(canvasSize.width, 10) : (originalImage ? 1000 : 0); 
        if (effectiveCanvasWidth > 0 && config.fontSize > effectiveCanvasWidth / 5) {
            setFieldErrors(prev => ({ ...prev, fontSize: 'Font size might be too large for the canvas.' }));
        } else {
            setFieldErrors(prev => ({ ...prev, fontSize: null }));
        }
    }, [config.fontSize, canvasSize.width, originalImage]);

    useEffect(() => {
        // Do not save the default config on the initial render
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const saveConfig = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/config`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(debouncedConfig),
                });
                if (!response.ok) throw new Error('Failed to save configuration.');
                const savedConfig = await response.json();
                setConfigId(savedConfig.id);
            } catch (err: any) {
                setApiError(err.message);
            }
        };

        saveConfig();
    }, [debouncedConfig]);

    useEffect(() => {
        if (!originalImage || !configId) {
            // Clear preview if there's no image or saved config
            setPreviewImage(null);
            return;
        }

        const fetchPreview = async () => {
            setIsLoading(true);
            setApiError(null);
            try {
                const body = {
                    image: originalImage,
                    configId: configId,
                    canvasSize: {
                        width: debouncedCanvasSize.width ? parseInt(debouncedCanvasSize.width, 10) : undefined,
                        height: debouncedCanvasSize.height ? parseInt(debouncedCanvasSize.height, 10) : undefined,
                    }
                };
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/meme/preview`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to generate preview.');
                }

                const blob = await response.blob();
                setPreviewImage(URL.createObjectURL(blob));
            } catch (err: any) {
                setApiError(err.message);
                setPreviewImage(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPreview();
    }, [originalImage, configId, debouncedCanvasSize]);

    const handleGenerateMeme = async () => {
        if (!originalImage || !configId) return;
        setIsLoading(true);
        setApiError(null);
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/meme/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: originalImage, configId: configId }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate meme.');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'meme.jpg';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (err: any) {
            setApiError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 flex flex-col gap-6">
            <ControlsPanel
                config={config}
                canvasSize={canvasSize}
                fieldErrors={fieldErrors}
                apiError={apiError}
                isLoading={isLoading}
                originalImage={originalImage}
                configId={configId}
                handleConfigChange={handleConfigChange}
                handleImageUpload={handleImageUpload}
                handleWatermarkUpload={handleWatermarkUpload}
                handleClearWatermark={handleClearWatermark}
                handleCanvasSizeChange={handleCanvasSizeChange}
                handleGenerateMeme={handleGenerateMeme}
            />
            <PreviewPanel
                isLoading={isLoading}
                apiError={apiError}
                previewImage={previewImage}
                originalImage={originalImage}
            />
        </div>
    );
};

export default MemeEditor;