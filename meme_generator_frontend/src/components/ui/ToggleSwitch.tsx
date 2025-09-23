import React from 'react';

interface ToggleSwitchProps {
  id: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  disabled?: boolean;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  id,
  name,
  checked,
  onChange,
  label,
  disabled = false
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-gray-700 text-sm font-semibold mb-3">{label}</label>
      <label htmlFor={id} className="flex items-center cursor-pointer">
        <div className="relative">
          <input
            id={id}
            name={name}
            type="checkbox"
            className="sr-only"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
          />
          <div className={`block w-16 h-8 rounded-full transition-colors duration-200 ${
            checked 
              ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
              : 'bg-gray-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
          <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-200 shadow-lg ${
            checked ? 'transform translate-x-8' : ''
          }`}></div>
        </div>
        <div className={`ml-3 text-gray-700 font-medium ${disabled ? 'opacity-50' : ''}`}>
          {checked ? 'ON' : 'OFF'}
        </div>
      </label>
    </div>
  );
};
