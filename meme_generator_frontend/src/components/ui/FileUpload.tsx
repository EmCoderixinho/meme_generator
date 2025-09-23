import React from 'react';

interface FileUploadProps {
  id: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  accept: string;
  error?: string;
  disabled?: boolean;
  buttonColor?: 'blue' | 'red' | 'green';
  showClearButton?: boolean;
  onClear?: () => void;
  clearButtonText?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  id,
  onChange,
  label,
  accept,
  error,
  disabled = false,
  buttonColor = 'blue',
  showClearButton = false,
  onClear,
  clearButtonText = 'Clear'
}) => {
  const getButtonClasses = () => {
    const baseClasses = 'file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:text-white transition-all duration-200';
    
    switch (buttonColor) {
      case 'red':
        return `${baseClasses} file:bg-gradient-to-r file:from-red-500 file:to-pink-600 hover:file:from-red-600 hover:file:to-pink-700`;
      case 'green':
        return `${baseClasses} file:bg-gradient-to-r file:from-green-500 file:to-emerald-600 hover:file:from-green-600 hover:file:to-emerald-700`;
      default:
        return `${baseClasses} file:bg-gradient-to-r file:from-blue-500 file:to-purple-600 hover:file:from-blue-600 hover:file:to-purple-700`;
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-gray-700 text-sm font-semibold" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="file"
          accept={accept}
          onChange={onChange}
          disabled={disabled}
          className={`w-full text-sm text-gray-500 ${getButtonClasses()} disabled:opacity-50 disabled:cursor-not-allowed`}
        />
      </div>
      {error && (
        <p className="text-red-500 text-sm flex items-center mt-1">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {showClearButton && onClear && (
        <button
          onClick={onClear}
          className="text-xs text-red-500 hover:text-red-700 mt-1 flex items-center"
        >
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          {clearButtonText}
        </button>
      )}
    </div>
  );
};
