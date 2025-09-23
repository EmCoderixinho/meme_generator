import React from 'react';

interface RangeSliderProps {
  id: string;
  name: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  error?: string | null;
  disabled?: boolean;
  showValue?: boolean;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
  id,
  name,
  value,
  onChange,
  label,
  min,
  max,
  step = 1,
  unit = '',
  error,
  disabled = false,
  showValue = true
}) => {
  const displayLabel = showValue ? `${label}: ${value}${unit}` : label;

  return (
    <div className="space-y-2">
      <label className="block text-gray-700 text-sm font-semibold" htmlFor={id}>
        {displayLabel}
      </label>
      <input
        id={id}
        name={name}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50 disabled:cursor-not-allowed"
      />
      {error && (
        <p className="text-yellow-600 text-xs flex items-center">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};
