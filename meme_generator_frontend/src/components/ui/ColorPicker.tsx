import React from 'react';

interface ColorPickerProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  error?: string;
  disabled?: boolean;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  id,
  name,
  value,
  onChange,
  label,
  error,
  disabled = false
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-gray-700 text-sm font-semibold" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type="color"
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full h-12 border border-gray-300 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <div 
          className="absolute inset-0 rounded-lg border-2 border-gray-200 pointer-events-none"
          style={{ backgroundColor: value }}
        />
      </div>
      {error && (
        <p className="text-red-500 text-sm flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};
