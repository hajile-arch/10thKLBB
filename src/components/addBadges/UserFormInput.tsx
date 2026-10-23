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
  hint?: string; // Optional helper text under the field
  
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
  hint,
  options = []
}) => {
  const baseClasses =
    "w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:[color-scheme:dark]";
  const hintEl = hint ? (
    <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>
  ) : null;
  const labelClasses = "text-sm font-semibold text-gray-700 dark:text-gray-300";

  if (type === 'select') {
    return (
      <div className="space-y-2">
        <label className={labelClasses}>{label}</label>
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
        {hintEl}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className={labelClasses}>{label}</label>
      <input
        type={type}
        className={`${baseClasses} ${className}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        min={min} // Add min here
        max={max} // Add max here
      />
      {hintEl}
    </div>
  );
};
