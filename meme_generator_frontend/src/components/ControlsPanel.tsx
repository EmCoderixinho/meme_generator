import React from 'react';
import { MemeConfig, ControlsPanelProps } from '../types/meme';
import {
  SectionHeader,
  FormInput,
  FormSelect,
  ToggleSwitch,
  ColorPicker,
  RangeSlider,
  FileUpload,
  ActionButton,
  SectionCard
} from './ui';

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


    // Icon components for reuse
    const ImageIcon = () => (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    );

    const TextIcon = () => (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
    );

    const TypographyIcon = () => (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    );

    const StyleIcon = () => (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
        </svg>
    );

    const SettingsIcon = () => (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );

    const MemeIcon = () => (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 12h6m-6 4h6" />
        </svg>
    );

    return (
        <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-xl border border-gray-200 max-h-screen overflow-y-auto">
            {/* Header */}
            <SectionHeader
                icon={<MemeIcon />}
                title="Meme Creator"
                subtitle="Customize your meme with powerful controls"
                iconBgColor="bg-gradient-to-r from-blue-500 to-purple-600"
                iconColor="text-white"
            />

            {/* Image Upload Section */}
            <SectionCard>
                <SectionHeader
                    icon={<ImageIcon />}
                    title="Upload Image"
                    iconBgColor="bg-blue-100"
                    iconColor="text-blue-600"
                />
                <FileUpload
                    id="image-upload"
                    onChange={handleImageUpload}
                    label=""
                    accept="image/png, image/jpeg"
                    error={fieldErrors.imageUpload || ''}
                    buttonColor="blue"
                />
            </SectionCard>

            {/* Text Content Section */}
            <SectionCard>
                <SectionHeader
                    icon={<TextIcon />}
                    title="Text Content"
                    iconBgColor="bg-green-100"
                    iconColor="text-green-600"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                        id="topText"
                        name="topText"
                        type="text"
                        value={config.topText}
                        onChange={handleConfigChange}
                        label="Top Text"
                        placeholder="Enter top text..."
                    />
                    <FormInput
                        id="bottomText"
                        name="bottomText"
                        type="text"
                        value={config.bottomText}
                        onChange={handleConfigChange}
                        label="Bottom Text"
                        placeholder="Enter bottom text..."
                    />
                </div>
            </SectionCard>

            {/* Typography Section */}
            <SectionCard>
                <SectionHeader
                    icon={<TypographyIcon />}
                    title="Typography"
                    iconBgColor="bg-purple-100"
                    iconColor="text-purple-600"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FormSelect
                        id="fontFamily"
                        name="fontFamily"
                        value={config.fontFamily}
                        onChange={handleConfigChange}
                        label="Font Family"
                        options={availableFonts.map(font => ({ value: font, label: font }))}
                        loading={fontsLoading}
                    />
                    <RangeSlider
                        id="fontSize"
                        name="fontSize"
                        value={config.fontSize}
                        onChange={handleConfigChange}
                        label="Font Size"
                        min={10}
                        max={100}
                        unit="px"
                        error={fieldErrors.fontSize}
                    />
                    <FormSelect
                        id="textAlign"
                        name="textAlign"
                        value={config.textAlign}
                        onChange={handleConfigChange}
                        label="Text Alignment"
                        options={[
                            { value: 'left', label: 'Left' },
                            { value: 'center', label: 'Center' },
                            { value: 'right', label: 'Right' }
                        ]}
                    />
                    <ToggleSwitch
                        id="allCaps"
                        name="allCaps"
                        checked={config.allCaps}
                        onChange={handleConfigChange}
                        label="All Caps"
                    />
                </div>
            </SectionCard>

            {/* Styling Section */}
            <SectionCard>
                <SectionHeader
                    icon={<StyleIcon />}
                    title="Text Styling"
                    iconBgColor="bg-orange-100"
                    iconColor="text-orange-600"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <ColorPicker
                        id="textColor"
                        name="textColor"
                        value={config.textColor}
                        onChange={handleConfigChange}
                        label="Text Color"
                    />
                    <ColorPicker
                        id="strokeColor"
                        name="strokeColor"
                        value={config.strokeColor}
                        onChange={handleConfigChange}
                        label="Stroke Color"
                    />
                    <RangeSlider
                        id="strokeWidth"
                        name="strokeWidth"
                        value={config.strokeWidth}
                        onChange={handleConfigChange}
                        label="Stroke Width"
                        min={0}
                        max={10}
                        unit="px"
                    />
                    <RangeSlider
                        id="padding"
                        name="padding"
                        value={config.padding}
                        onChange={handleConfigChange}
                        label="Padding"
                        min={0}
                        max={50}
                        unit="px"
                    />
                </div>
            </SectionCard>

            {/* Advanced Controls */}
            <SectionCard>
                <SectionHeader
                    icon={<SettingsIcon />}
                    title="Advanced Settings"
                    iconBgColor="bg-red-100"
                    iconColor="text-red-600"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FileUpload
                        id="watermark-upload"
                        onChange={handleWatermarkUpload}
                        label="Watermark"
                        accept="image/png, image/jpeg"
                        error={fieldErrors.watermarkUpload || ''}
                        buttonColor="red"
                        showClearButton={!!config.watermarkImage}
                        onClear={handleClearWatermark}
                        clearButtonText="Clear Watermark"
                    />
                    <FormSelect
                        id="watermarkPosition"
                        name="watermarkPosition"
                        value={config.watermarkPosition}
                        onChange={handleConfigChange}
                        label="Watermark Position"
                        options={[
                            { value: 'top-left', label: 'Top Left' },
                            { value: 'top-right', label: 'Top Right' },
                            { value: 'bottom-left', label: 'Bottom Left' },
                            { value: 'bottom-right', label: 'Bottom Right' }
                        ]}
                    />
                    <RangeSlider
                        id="scaleDown"
                        name="scaleDown"
                        value={config.scaleDown}
                        onChange={handleConfigChange}
                        label="Preview Scale"
                        min={0.01}
                        max={0.25}
                        step={0.01}
                        unit="%"
                        showValue={false}
                    />
                </div>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                        id="width"
                        name="width"
                        type="number"
                        value={canvasSize.width}
                        onChange={handleCanvasSizeChange}
                        label="Canvas Width (px)"
                        placeholder="Auto"
                    />
                    <FormInput
                        id="height"
                        name="height"
                        type="number"
                        value={canvasSize.height}
                        onChange={handleCanvasSizeChange}
                        label="Canvas Height (px)"
                        placeholder="Auto"
                    />
                </div>
            </SectionCard>

            {/* Generate Button */}
            <ActionButton
                onClick={handleGenerateMeme}
                disabled={!originalImage || !configId || isLoading}
                loading={isLoading}
                variant="success"
                fullWidth
            >
                {isLoading ? 'Generating...' : 'Generate Meme'}
            </ActionButton>
            {apiError && (
                <p className="text-red-100 text-sm mt-4 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {apiError}
                </p>
            )}
        </div>
    );
};