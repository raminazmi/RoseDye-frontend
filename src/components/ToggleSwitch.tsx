import React from 'react';

interface ToggleSwitchProps {
    checked: boolean;
    onChange: () => void;
    disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, disabled = false }) => {
    return (
        <label
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${checked ? 'bg-green-500' : 'bg-gray-300'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                className="sr-only"
            />
            <span
                className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${checked ? '-translate-x-5' : '-translate-x-1'
                    }`}
            />
        </label>
    );
};

export default ToggleSwitch;