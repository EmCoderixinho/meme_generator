import { useState, useCallback, useEffect } from 'react';
import { MemeConfig } from '../types/meme';

interface CanvasSize {
    width: string;
    height: string;
}

export const useFieldValidation = (
    config: MemeConfig,
    canvasSize: CanvasSize,
    originalImage: string | null
) => {
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string | null }>({});

    const validateFontSize = useCallback(() => {
        const effectiveCanvasWidth = canvasSize.width ? parseInt(canvasSize.width, 10) : (originalImage ? 1000 : 0);
        
        if (effectiveCanvasWidth > 0 && config.fontSize > effectiveCanvasWidth / 5) {
            setFieldErrors(prev => ({ 
                ...prev, 
                fontSize: 'Font size might be too large for the canvas.' 
            }));
        } else {
            setFieldErrors(prev => ({ 
                ...prev, 
                fontSize: null 
            }));
        }
    }, [config.fontSize, canvasSize.width, originalImage]);

    const setFieldError = useCallback((field: string, error: string | null) => {
        setFieldErrors(prev => ({ ...prev, [field]: error }));
    }, []);

    const clearFieldError = useCallback((field: string) => {
        setFieldErrors(prev => ({ ...prev, [field]: null }));
    }, []);

    const clearAllErrors = useCallback(() => {
        setFieldErrors({});
    }, []);

    useEffect(() => {
        validateFontSize();
    }, [validateFontSize]);

    return {
        fieldErrors,
        setFieldError,
        clearFieldError,
        clearAllErrors,
    };
};
