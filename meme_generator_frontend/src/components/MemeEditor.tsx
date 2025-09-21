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
    });

    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [configId, setConfigId] = useState<string | null>(null);
    const isInitialMount = useRef(true);

    const debouncedConfig = useDebounce(config, 500);

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
                    // Round the values for fields that must be integers for the backend
                    return ['fontSize', 'strokeWidth', 'padding'].includes(name)
                        ? Math.round(numValue)
                        : numValue;
                }
                return value;
            })(),
        }));
    };

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setOriginalImage(event.target?.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
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
                setError(err.message);
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
            setError(null);
            try {
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/meme/preview`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: originalImage, configId: configId }),
                });

                if (!response.ok) {
                    throw new Error('Failed to generate preview.');
                }

                const blob = await response.blob();
                setPreviewImage(URL.createObjectURL(blob));
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPreview();
    }, [originalImage, configId]);

    const handleGenerateMeme = async () => {
        if (!originalImage) return;
        setIsLoading(true);
        setError(null);
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
            setError(err.message);
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
                <input id={name} name={name} type="checkbox" checked={config[name] as boolean} onChange={handleConfigChange} className="mt-2" />
            ) : (
                <input id={name} name={name} type={type} value={config[name] as string | number} onChange={handleConfigChange} {...options} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            )}
            {type === 'range' && <span className="text-sm ml-2">{config[name]}px</span>}
        </div>
    );

    return (
        <div className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Controls Panel */}
            <div className="md:col-span-1 bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-6">Meme Controls</h2>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image-upload">
                        Upload Image
                    </label>
                    <input id="image-upload" type="file" accept="image/png, image/jpeg" onChange={handleImageUpload} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
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
                {renderControl('All Caps', 'allCaps', 'checkbox')}

                <button
                    onClick={handleGenerateMeme}
                    disabled={!originalImage || isLoading}
                    className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400"
                >
                    {isLoading ? 'Generating...' : 'Generate Meme'}
                </button>
                {error && <p className="text-red-500 text-xs italic mt-4">{error}</p>}
            </div>

            {/* Preview Panel */}
            <div className="md:col-span-2 bg-gray-200 p-6 rounded-lg shadow-lg flex items-center justify-center min-h-[400px]">
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