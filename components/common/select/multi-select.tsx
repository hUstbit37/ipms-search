import React from 'react';
import BaseSelect, { BaseSelectProps, SelectOption } from './base-select';

export interface MultiSelectProps extends Omit<BaseSelectProps, 'isMulti' | 'value' | 'onChange'> {
    value?: SelectOption[];
    onChange?: (value: SelectOption[]) => void;
    maxMenuHeight?: number;
    closeMenuOnSelect?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
    value = [],
    onChange,
    maxMenuHeight = 200,
    closeMenuOnSelect = false,
    ...props
}) => {
    return (
        <BaseSelect
            {...props}
            isMulti={true}
            value={value}
            maxMenuHeight={maxMenuHeight}
            closeMenuOnSelect={closeMenuOnSelect}
            onChange={(selectedOptions) => {
                onChange?.(selectedOptions as SelectOption[] || []);
            }}
        />
    );
};

export default MultiSelect;
