import { ChangeEvent } from 'react';

export interface MemeConfig {
    topText: string;
    bottomText: string;
    fontFamily: string;
    fontSize: number;
    textColor: string;
    strokeColor: string;
    strokeWidth: number;
    textAlign: 'center' | 'left' | 'right';
    padding: number;
    allCaps: boolean;
    scaleDown: number;
    watermarkImage?: string;
    watermarkPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export interface ControlsPanelProps {
    config: MemeConfig;
    canvasSize: { width: string; height: string };
    fieldErrors: { [key: string]: string | null };
    apiError: string | null;
    isLoading: boolean;
    originalImage: string | null;
    configId: string | null;
    availableFonts: string[];
    fontsLoading: boolean;
    handleConfigChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    handleImageUpload: (e: ChangeEvent<HTMLInputElement>) => void;
    handleWatermarkUpload: (e: ChangeEvent<HTMLInputElement>) => void;
    handleClearWatermark: () => void;
    handleCanvasSizeChange: (e: ChangeEvent<HTMLInputElement>) => void;
    handleGenerateMeme: () => void;
}

 export interface PreviewPanelProps {
    isLoading: boolean;
    apiError: string | null;
    previewImage: string | null;
    originalImage: string | null;
}