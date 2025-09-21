import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import { useDebounce } from '../hooks/useDebounce';

interface MemeConfig {
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

const MemeEditor: React.FC = () => {
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

    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string | null }>({});
    const [configId, setConfigId] = useState<string | null>(null);
    const isInitialMount = useRef(true);
    const [canvasSize, setCanvasSize] = useState<{ width: string; height: string }>({ width: '', height: '' });

    const debouncedConfig = useDebounce(config, 500);
    const debouncedCanvasSize = useDebounce(canvasSize, 500);

    const handleConfigChange = (
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
                    
                    return ['fontSize', 'strokeWidth', 'padding'].includes(name)
                        ? Math.round(numValue)
                        : numValue;
                }
                return value;
            })(),
        }));
    };

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const fileInput = e.currentTarget;
        if (fileInput.files && fileInput.files[0]) {
            const file = fileInput.files[0];
            const maxSize = 10 * 1024 * 1024; // 10MB

            if (file.size > maxSize) {
                setFieldErrors(prev => ({ ...prev, imageUpload: 'Image is too large. Please upload an image smaller than 10MB.' }));
                setOriginalImage(null);
                fileInput.value = ''; 
                return;
            }

            setFieldErrors(prev => ({ ...prev, imageUpload: null }));

            const reader = new FileReader();
            reader.onload = (event) => {
                setOriginalImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setOriginalImage(null);
        }
    };

    const handleWatermarkUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const fileInput = e.currentTarget;
        if (fileInput.files && fileInput.files[0]) {
            const file = fileInput.files[0];
            const maxSize = 10 * 1024 * 1024; // 10MB

            if (file.size > maxSize) {
                setFieldErrors(prev => ({ ...prev, watermarkUpload: 'Watermark is too large. Please upload an image smaller than 10MB.' }));
                setConfig(prev => ({ ...prev, watermarkImage: '' }));
                fileInput.value = '';
                return;
            }

            setFieldErrors(prev => ({ ...prev, watermarkUpload: null }));

            const reader = new FileReader();
            reader.onload = (event) => {
                setConfig(prev => ({ ...prev, watermarkImage: event.target?.result as string }));
            };
            reader.readAsDataURL(file);
        } else {
            setConfig(prev => ({ ...prev, watermarkImage: '' }));
        }
    };

    const handleCanvasSizeChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.currentTarget;
        setCanvasSize(prev => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        // Do not save the default config on the initial render
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        const saveConfig = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/config`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(debouncedConfig),
                });
                if (!response.ok) throw new Error('Failed to save configuration.');
                const savedConfig = await response.json();
                setConfigId(savedConfig.id);
            } catch (err: any) {
                setApiError(err.message);
            }
        };

        saveConfig();
    }, [debouncedConfig]);

    useEffect(() => {
        if (!originalImage || !configId) {
            // Clear preview if there's no image or saved config
            setPreviewImage(null);
            return;
        }

        const fetchPreview = async () => {
            setIsLoading(true);
            setApiError(null);
            try {
                const body = {
                    image: originalImage,
                    configId: configId,
                    canvasSize: {
                        width: debouncedCanvasSize.width ? parseInt(debouncedCanvasSize.width, 10) : undefined,
                        height: debouncedCanvasSize.height ? parseInt(debouncedCanvasSize.height, 10) : undefined,
                    }
                };
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/meme/preview`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                });

                if (!response.ok) {
                    throw new Error('Failed to generate preview.');
                }

                const blob = await response.blob();
                setPreviewImage(URL.createObjectURL(blob));
            } catch (err: any) {
                setApiError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPreview();
    }, [originalImage, configId, debouncedCanvasSize]);

    const handleGenerateMeme = async () => {
        if (!originalImage || !configId) return;
        setIsLoading(true);
        setApiError(null);
        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/meme/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: originalImage, configId: configId }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate meme.');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'meme.jpg';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (err: any) {
            setApiError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const renderControl = (label: string, name: keyof MemeConfig, type: string, options: any = {}) => (
        <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={name}>
                {label}
            </label>
            {type === 'select' ? (
                <select id={name} name={name} value={config[name] as string} onChange={handleConfigChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                    {options.items.map((item: string) => <option key={item} value={item}>{item}</option>)}
                </select>
            ) : type === 'checkbox' ? (
                <label htmlFor={name} className="flex items-center cursor-pointer">
                    <div className="relative">
                        <input
                            id={name}
                            name={name}
                            type="checkbox"
                            className="sr-only"
                            checked={config[name] as boolean}
                            onChange={handleConfigChange}
                        />
                        <div className={`block w-14 h-8 rounded-full ${config[name] ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${config[name] ? 'transform translate-x-6' : ''}`}></div>
                    </div>
                    <div className="ml-3 text-gray-700 font-medium">{label}</div>
                </label>
            ) : (
                <input id={name} name={name} type={type} value={config[name] as string | number} onChange={handleConfigChange} {...options} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            )}
            {type === 'range' && <span className="text-sm ml-2">{config[name]}{name !== 'scaleDown' ? 'px' : ''}</span>}
        </div>
    );

    return (
        <div className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Controls Panel */}
            <div className="md:col-span-1 bg-white p-4 rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4">Meme Controls</h2>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image-upload">
                        Upload Image
                    </label>
                    <input id="image-upload" type="file" accept="image/png, image/jpeg" onChange={handleImageUpload} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    {fieldErrors.imageUpload && <p className="text-red-500 text-xs italic mt-1">{fieldErrors.imageUpload}</p>}
                </div>
                <hr className="my-6" />
                {renderControl('Top Text', 'topText', 'text')}
                {renderControl('Bottom Text', 'bottomText', 'text')}
                {renderControl('Font Family', 'fontFamily', 'select', { items: ['Impact', 'Arial', 'Helvetica', 'Comic Sans MS'] })}
                {renderControl('Font Size', 'fontSize', 'range', { min: 10, max: 100 })}
                {renderControl('Text Color', 'textColor', 'color')}
                {renderControl('Stroke Color', 'strokeColor', 'color')}
                {renderControl('Stroke Width', 'strokeWidth', 'range', { min: 0, max: 10 })}
                {renderControl('Padding', 'padding', 'range', { min: 0, max: 50 })}
                {renderControl('Text Align', 'textAlign', 'select', { items: ['left', 'center', 'right'] })}
                <div className="mb-4">
                    {renderControl('All Caps', 'allCaps', 'checkbox')}
                </div>
                <hr className="my-4" />
                <h3 className="text-xl font-bold mb-4">Advanced</h3>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="watermark-upload">
                        Upload Watermark
                    </label>
                    <input id="watermark-upload" type="file" accept="image/png, image/jpeg" onChange={handleWatermarkUpload} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    {fieldErrors.watermarkUpload && <p className="text-red-500 text-xs italic mt-1">{fieldErrors.watermarkUpload}</p>}
                </div>
                {renderControl('Watermark Position', 'watermarkPosition', 'select', { items: ['top-left', 'top-right', 'bottom-left', 'bottom-right'] })}
                {renderControl('Preview Scale Down', 'scaleDown', 'range', { min: 0.01, max: 0.25, step: 0.01 })}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="width">
                            Canvas Width (px)
                        </label>
                        <input id="width" name="width" type="number" value={canvasSize.width} onChange={handleCanvasSizeChange} placeholder="Auto" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="height">
                            Canvas Height (px)
                        </label>
                        <input id="height" name="height" type="number" value={canvasSize.height} onChange={handleCanvasSizeChange} placeholder="Auto" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    </div>
                </div>

                <button
                    onClick={handleGenerateMeme}
                    disabled={!originalImage || !configId || isLoading}
                    className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400 mt-4"
                >
                    {isLoading ? 'Generating...' : 'Generate Meme'}
                </button>
                {apiError && <p className="text-red-500 text-xs italic mt-4">{apiError}</p>}
            </div>

            {/* Preview Panel */}
            <div className="md:col-span-2 bg-gray-200 p-4 rounded-lg shadow-lg flex items-center justify-center min-h-[300px]">
                {isLoading && (
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-2">Loading Preview...</p>
                    </div>
                )}
                {!isLoading && previewImage && (
                    <img src={previewImage} alt="Meme Preview" className="max-w-full max-h-full object-contain" />
                )}
                {!isLoading && !originalImage && (
                    <div className="text-center text-gray-500">
                        <p className="text-lg">Please upload an image to start.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MemeEditor;