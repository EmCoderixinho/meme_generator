import React from 'react';
import { MemeConfig, ControlsPanelProps } from '../types/meme';

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
    config,
    canvasSize,
    fieldErrors,
    apiError,
    isLoading,
    originalImage,
    configId,
    availableFonts,
    fontsLoading,
    handleConfigChange,
    handleImageUpload,
    handleWatermarkUpload,
    handleClearWatermark,
    handleCanvasSizeChange,
    handleGenerateMeme,
}) => {

    const renderControl = (label: string, name: keyof MemeConfig, type: string, options: any = {}) => (
        <div>
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
        <div className="bg-white p-4 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Meme Controls</h2>

            {/* Main Image Upload */}
            <div className="mb-6">
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image-upload">
                        Upload Image
                    </label>
                    <input id="image-upload" type="file" accept="image/png, image/jpeg" onChange={handleImageUpload} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    {fieldErrors.imageUpload && <p className="text-red-500 text-xs italic mt-1">{fieldErrors.imageUpload}</p>}
                </div>
            </div>

            {/* Text and Font Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {renderControl('Top Text', 'topText', 'text')}
                {renderControl('Bottom Text', 'bottomText', 'text')}
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="fontFamily">
                        Font Family
                        {fontsLoading && <span className="text-xs text-gray-500 ml-2">(Loading...)</span>}
                    </label>
                    <select 
                        id="fontFamily" 
                        name="fontFamily" 
                        value={config.fontFamily} 
                        onChange={handleConfigChange} 
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        disabled={fontsLoading}
                    >
                        {availableFonts.map((font) => (
                            <option key={font} value={font}>{font}</option>
                        ))}
                    </select>
                </div>
                <div>
                    {renderControl('Font Size', 'fontSize', 'range', { min: 10, max: 100 })}
                    {fieldErrors.fontSize && <p className="text-yellow-600 text-xs italic -mt-2 mb-2">{fieldErrors.fontSize}</p>}
                </div>
                {renderControl('Text Color', 'textColor', 'color')}
                {renderControl('Stroke Color', 'strokeColor', 'color')}
                {renderControl('Stroke Width', 'strokeWidth', 'range', { min: 0, max: 10 })}
                {renderControl('Padding', 'padding', 'range', { min: 0, max: 50 })}
                {renderControl('Text Align', 'textAlign', 'select', { items: ['left', 'center', 'right'] })}
                <div className="flex items-center mt-4">
                    {renderControl('All Caps', 'allCaps', 'checkbox')}
                </div>
            </div>

            {/* Advanced Controls */}
            <h3 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Advanced</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="watermark-upload">
                        Upload Watermark
                    </label>
                    <input id="watermark-upload" type="file" accept="image/png, image/jpeg" onChange={handleWatermarkUpload} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    {fieldErrors.watermarkUpload && <p className="text-red-500 text-xs italic mt-1">{fieldErrors.watermarkUpload}</p>}
                    {config.watermarkImage && (
                        <button
                            onClick={handleClearWatermark}
                            className="text-xs text-red-500 hover:text-red-700 mt-1">
                            Clear Watermark
                        </button>
                    )}
                </div>
                {renderControl('Watermark Position', 'watermarkPosition', 'select', { items: ['top-left', 'top-right', 'bottom-left', 'bottom-right'] })}
                {renderControl('Preview Scale Down', 'scaleDown', 'range', { min: 0.01, max: 0.25, step: 0.01 })}
                <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>

            <button
                onClick={handleGenerateMeme}
                disabled={!originalImage || !configId || isLoading}
                className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-400 mt-4 transition-colors duration-200"
            >
                {isLoading ? 'Generating...' : 'Generate Meme'}
            </button>
            {apiError && <p className="text-red-500 text-xs italic mt-4">{apiError}</p>}
        </div>
    );
};