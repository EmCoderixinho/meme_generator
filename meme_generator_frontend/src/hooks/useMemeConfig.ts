import { useState, useCallback, ChangeEvent } from 'react';
import { MemeConfig } from '../types/meme';

export const useMemeConfig = () => {
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

    const handleConfigChange = useCallback((
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
                if (typeof value === 'string' && !isNaN(Number(value)) && value !== '') {
                    const numValue = Number(value);
                    // Round the values for fields that must be integers for the backend
                    return ['fontSize', 'strokeWidth', 'padding'].includes(name)
                        ? Math.round(numValue)
                        : numValue;
                }
                return value;
            })(),
        }));
    }, []);

    const updateConfig = useCallback((updates: Partial<MemeConfig>) => {
        setConfig(prev => ({ ...prev, ...updates }));
    }, []);

    return {
        config,
        setConfig,
        handleConfigChange,
        updateConfig,
    };
};
