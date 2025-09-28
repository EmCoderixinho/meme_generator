import { useState, useCallback } from 'react';
import { MemeConfig } from '../types/meme';

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
            
            // Backend now returns MemeConfig format directly
            const memeConfig: MemeConfig = await response.json();
            
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
