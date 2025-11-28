import React from 'react';
import Select, { Props as SelectProps, StylesConfig, ActionMeta, GroupBase } from 'react-select';
import { cn } from '@/lib/utils';

export interface SelectOption {
    value: string | number;
    label: string;
    [key: string]: unknown;
}

export interface BaseSelectProps extends Omit<SelectProps<SelectOption, boolean>, 'onChange' | 'value' | 'styles'> {
    options: SelectOption[];
    value?: SelectOption | SelectOption[] | null;
    onChange?: (value: SelectOption | SelectOption[] | null, actionMeta?: ActionMeta<SelectOption>) => void;
    error?: string;
    label?: string;
    required?: boolean;
    className?: string;
    placeholder?: string;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'outline' | 'ghost';
}

const BaseSelect: React.FC<BaseSelectProps> = ({
    options,
    value,
    onChange,
    error,
    label,
    required = false,
    className,
    placeholder = "Select item",
    size = 'sm',
    isDisabled = false,
    isLoading = false,
    ...props
}) => {
    // Size styles
    const sizeStyles = {
        sm: {
            control: { minHeight: '32px', fontSize: '14px' },
            menu: { fontSize: '14px' },
        },
        md: {
            control: { minHeight: '40px', fontSize: '14px' },
            menu: { fontSize: '14px' },
        },
        lg: {
            control: { minHeight: '48px', fontSize: '16px' },
            menu: { fontSize: '16px' },
        },
    };

    // Custom styles
    const customStyles: StylesConfig<SelectOption, boolean, GroupBase<SelectOption>> = {
        control: (provided, state) => ({
            ...provided,
            ...sizeStyles[size].control,
            borderColor: error
                ? '#ef4444'
                : state.isFocused
                    ? '#3b82f6'
                    : 'var(--color-input)',
            boxShadow: state.isFocused
                ? error
                    ? '0 0 0 3px rgba(239, 68, 68, 0.1)'
                    : '0 0 0 3px rgba(59, 130, 246, 0.1)'
                : 'none',
            borderRadius: 'var(--radius-md)',
            transition: 'all 0.15s ease',
            '&:hover': {
                borderColor: error ? '#ef4444' : '#9ca3af',
            },
            backgroundColor: isDisabled ? '#f9fafb' : 'white',
            cursor: isDisabled ? 'not-allowed' : 'text',
        }),
        menu: (provided) => ({
            ...provided,
            ...sizeStyles[size].menu,
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb',
            zIndex: 19999,
        }),
        menuList: (provided) => ({
            ...provided,
            padding: '4px',
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected
                ? '#3b82f6'
                : state.isFocused
                    ? '#eff6ff'
                    : 'transparent',
            color: state.isSelected ? 'white' : '#374151',
            borderRadius: '6px',
            margin: '2px 0',
            padding: '8px 12px',
            cursor: 'pointer',
            '&:hover': {
                backgroundColor: state.isSelected ? '#3b82f6' : '#eff6ff',
            },
        }),
        placeholder: (provided) => ({
            ...provided,
            color: '#9ca3af',
        }),
        singleValue: (provided) => ({
            ...provided,
            color: '#374151',
        }),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: '#eff6ff',
            borderRadius: '6px',
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: '#1e40af',
            padding: '2px 6px',
            fontSize: '0.9em',
            fontWeight: '500',
        }),
        multiValueRemove: (provided) => ({
            ...provided,
            color: '#6b7280',
            '&:hover': {
                backgroundColor: '#dc2626',
                color: 'white',
            },
            borderRadius: '0 6px 6px 0',
        }),
        indicatorSeparator: (provided) => ({
            ...provided,
            backgroundColor: '#d1d5db',
        }),
        dropdownIndicator: (provided, state) => ({
            ...provided,
            color: '#6b7280',
            transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease',
        }),
        loadingIndicator: (provided) => ({
            ...provided,
            color: '#3b82f6',
        }),
    };

    return (
        <div className={cn('w-full', className)}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <Select<SelectOption, boolean>
                options={options}
                value={value}
                onChange={(newValue, actionMeta) => onChange?.(newValue as SelectOption | SelectOption[] | null, actionMeta)}
                placeholder={placeholder}
                styles={customStyles}
                isDisabled={isDisabled}
                isLoading={isLoading}
                className="react-select-container"
                classNamePrefix="react-select"
                {...props}
            />

            {error && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    {/* <span className="text-red-500">⚠</span> */}
                    {error}
                </p>
            )}
        </div>
    );
};

export default BaseSelect;
