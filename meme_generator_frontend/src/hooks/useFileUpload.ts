import { useState, useCallback, ChangeEvent, useRef } from 'react';

interface FileUploadOptions {
    maxSize?: number;
    onSuccess?: (dataUrl: string) => void;
    onError?: (error: string) => void;
}

export const useFileUpload = (options: FileUploadOptions = {}) => {
    const { maxSize = 10 * 1024 * 1024, onSuccess, onError } = options;
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const fileInput = e.currentTarget;
        fileInputRef.current = fileInput;
        if (!fileInput.files || !fileInput.files[0]) {
            onSuccess?.('');
            return;
        }

        const file = fileInput.files[0];
        setIsLoading(true);
        setError(null);

        if (file.size > maxSize) {
            const errorMessage = `File is too large. Please upload a file smaller than ${Math.round(maxSize / (1024 * 1024))}MB.`;
            setError(errorMessage);
            onError?.(errorMessage);
            fileInput.value = '';
            setIsLoading(false);
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            onSuccess?.(dataUrl);
            setIsLoading(false);
        };
        reader.onerror = () => {
            const errorMessage = 'Failed to read file.';
            setError(errorMessage);
            onError?.(errorMessage);
            setIsLoading(false);
        };
        reader.readAsDataURL(file);
    }, [maxSize, onSuccess, onError]);

    const clearError = useCallback(() => {
        setError(null);
        // Clear the file input value
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    return {
        error,
        isLoading,
        handleFileUpload,
        clearError,
    };
};
