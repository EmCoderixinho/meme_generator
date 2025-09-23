import { useState, useCallback } from 'react';

export const useFieldValidation = () => {
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string | null }>({});

    const setFieldError = useCallback((field: string, error: string | null) => {
        setFieldErrors(prev => ({ ...prev, [field]: error }));
    }, []);

    const clearFieldError = useCallback((field: string) => {
        setFieldErrors(prev => ({ ...prev, [field]: null }));
    }, []);

    const clearAllErrors = useCallback(() => {
        setFieldErrors({});
    }, []);

    return {
        fieldErrors,
        setFieldError,
        clearFieldError,
        clearAllErrors,
    };
};
