import { useState, useCallback } from 'react';
import { MemeConfig } from '../types/meme';

interface CanvasSize {
    width?: number;
    height?: number;
}

export const useMemeAPI = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const saveConfig = useCallback(async (config: MemeConfig, configId?: string) => {
        try {
            const url = configId 
                ? `${process.env.REACT_APP_BACKEND_URL}/api/config/${configId}`
                : `${process.env.REACT_APP_BACKEND_URL}/api/config`;
            
            const method = configId ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });
            
            if (!response.ok) {
                throw new Error('Failed to save configuration.');
            }
            
            const savedConfig = await response.json();
            const newConfigId = savedConfig.id || configId;
            return newConfigId;
        } catch (err: any) {
            setApiError(err.message);
            throw err;
        }
    }, []);

    const generatePreview = useCallback(async (
        image: string, 
        configId: string, 
        canvasSize?: CanvasSize
    ) => {
        setIsLoading(true);
        setApiError(null);
        
        try {
            const body = {
                image,
                configId,
                canvasSize: {
                    width: canvasSize?.width,
                    height: canvasSize?.height,
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
            return URL.createObjectURL(blob);
        } catch (err: any) {
            setApiError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const generateMeme = useCallback(async (image: string, configId: string) => {
        setIsLoading(true);
        setApiError(null);
        
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/meme/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image, configId }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate meme.');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            
            // Trigger download
            const a = document.createElement('a');
            a.href = url;
            a.download = 'meme.jpg';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            return url;
        } catch (err: any) {
            setApiError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearError = useCallback(() => {
        setApiError(null);
    }, []);

    return {
        isLoading,
        apiError,
        saveConfig,
        generatePreview,
        generateMeme,
        clearError,
    };
};
