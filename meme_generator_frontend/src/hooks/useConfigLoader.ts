import { useState, useCallback } from 'react';
import { MemeConfig } from '../types/meme';

interface ConfigResponse {
    id: string;
    topText?: string;
    bottomText?: string;
    fontFamily?: string;
    fontSize?: number;
    textColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    textAlign?: 'center' | 'left' | 'right';
    padding?: number;
    allCaps?: boolean;
    scaleDown?: number;
    watermarkImage?: string;
    watermarkPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    createdAt: string;
    updatedAt: string;
}

export const useConfigLoader = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadConfig = useCallback(async (configId: string): Promise<MemeConfig | null> => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/config/${configId}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Configuration not found');
                }
                throw new Error(`Failed to load configuration: ${response.status}`);
            }
            
            const configData: ConfigResponse = await response.json();
            
            // Convert backend response to frontend MemeConfig format
            const memeConfig: MemeConfig = {
                topText: configData.topText || '',
                bottomText: configData.bottomText || '',
                fontFamily: configData.fontFamily || 'Arial',
                fontSize: configData.fontSize || 24,
                textColor: configData.textColor || '#FFFFFF',
                strokeColor: configData.strokeColor || '#000000',
                strokeWidth: configData.strokeWidth || 4,
                textAlign: configData.textAlign || 'center',
                padding: configData.padding || 20,
                allCaps: configData.allCaps || false,
                scaleDown: configData.scaleDown || 0.05,
                watermarkImage: configData.watermarkImage || '',
                watermarkPosition: configData.watermarkPosition || 'bottom-right',
            };
            
            return memeConfig;
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to load configuration';
            setError(errorMessage);
            console.error('Error loading config:', err);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        loadConfig,
        isLoading,
        error,
        clearError,
    };
};
