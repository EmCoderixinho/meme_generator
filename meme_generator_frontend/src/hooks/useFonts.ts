import { useState, useCallback, useEffect } from 'react';

export const useFonts = () => {
    const [availableFonts, setAvailableFonts] = useState<string[]>(['Impact', 'Arial', 'Helvetica', 'Comic Sans MS']);
    const [fontsLoading, setFontsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAvailableFonts = useCallback(async () => {
        setFontsLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/meme/fonts`);
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Failed to fetch available fonts:', response.status, errorText);
                throw new Error(`Failed to fetch available fonts: ${response.status} ${errorText}`);
            }
            
            const data = await response.json();
            const fonts = data.fonts || ['Impact', 'Arial', 'Helvetica', 'Comic Sans MS'];
            setAvailableFonts(fonts);
            
            return fonts;
        } catch (error) {
            console.error('Error fetching available fonts:', error);
            const errorMessage = `Font loading error: ${error instanceof Error ? error.message : 'Unknown error'}`;
            setError(errorMessage);
            // Don't return availableFonts here to avoid dependency
            return ['Impact', 'Arial', 'Helvetica', 'Comic Sans MS']; // Return default fonts as fallback
        } finally {
            setFontsLoading(false);
        }
    }, []); // Remove availableFonts from dependencies

    const refreshFonts = useCallback(() => {
        fetchAvailableFonts();
    }, [fetchAvailableFonts]);

    useEffect(() => {
        fetchAvailableFonts();
    }, [fetchAvailableFonts]);

    return {
        availableFonts,
        fontsLoading,
        error,
        fetchAvailableFonts,
        refreshFonts,
    };
};
