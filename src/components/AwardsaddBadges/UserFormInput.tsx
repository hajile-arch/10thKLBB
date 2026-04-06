// UserFormInput.tsx (improved version)
import React from 'react';

interface UserFormInputProps {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
  options?: string[];
  min?: string;
  max?: string;
  placeholder?: string; // Added placeholder prop
}

export const UserFormInput: React.FC<UserFormInputProps> = ({
  label,
  type,
  value,
  onChange,
  required = false,
  className = '',
  min,
  max,
  options = [],
  placeholder // Added placeholder
}) => {
  const baseClasses =
    "w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base";

  if (type === 'select') {
    return (
      <div className="space-y-1 md:space-y-2">
        <label className="text-sm font-medium md:font-semibold text-gray-700">{label}</label>
        <select
          className={`${baseClasses} ${className}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="space-y-1 md:space-y-2">
      <label className="text-sm font-medium md:font-semibold text-gray-700">{label}</label>
      <input
        type={type}
        className={`${baseClasses} ${className}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        min={min}
        max={max}
        placeholder={placeholder}
      />
    </div>
  );
};