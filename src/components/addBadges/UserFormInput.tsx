// UserFormInput.tsx
import React from 'react';

interface UserFormInputProps {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
  options?: string[];
  min?: string; // Add this line
  max?: string; // Add this line
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
  options = []
}) => {
  const baseClasses =
    "w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  if (type === 'select') {
    return (
      <div className="space-y-2">
        <label className="text-sm font-semibold text-gray-700">{label}</label>
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
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <input
        type={type}
        className={`${baseClasses} ${className}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        min={min} // Add min here
        max={max} // Add max here
      />
    </div>
  );
};
