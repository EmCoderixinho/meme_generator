import { useState, useCallback, ChangeEvent } from 'react';

export const useCanvasSize = () => {
    const [canvasSize, setCanvasSize] = useState<{ width: string; height: string }>({ 
        width: '', 
        height: '' 
    });

    const handleCanvasSizeChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.currentTarget;
        setCanvasSize(prev => ({ ...prev, [name]: value }));
    }, []);

    const updateCanvasSize = useCallback((updates: Partial<{ width: string; height: string }>) => {
        setCanvasSize(prev => ({ ...prev, ...updates }));
    }, []);

    const resetCanvasSize = useCallback(() => {
        setCanvasSize({ width: '', height: '' });
    }, []);

    return {
        canvasSize,
        setCanvasSize,
        handleCanvasSizeChange,
        updateCanvasSize,
        resetCanvasSize,
    };
};
