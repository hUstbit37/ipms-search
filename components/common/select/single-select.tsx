import React from 'react';
import BaseSelect, { BaseSelectProps, SelectOption } from './base-select';

export interface SingleSelectProps extends Omit<BaseSelectProps, 'isMulti' | 'value' | 'onChange'> {
    value?: SelectOption | null;
    onChange?: (value: SelectOption | null) => void;
}

const SingleSelect: React.FC<SingleSelectProps> = ({
    value,
    onChange,
    ...props
}) => {
    return (
        <BaseSelect
            {...props}
            isMulti={false}
            value={value}
            onChange={(selectedOption) => {
                onChange?.(selectedOption as SelectOption | null);
            }}
        />
    );
};

export default SingleSelect;
