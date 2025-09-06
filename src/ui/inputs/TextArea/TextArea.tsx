import React from 'react';
import classes from './TextArea.module.css';

interface TextAreaProps {
    value: string;
    setValue: (newValue: string) => void;
    disabled?: boolean,
    label?: string,
    labelColor?: string,
    placeholder?: string,
    inputClassName?: string,
}

const TextArea: React.FC<TextAreaProps> = ({
    value,
    setValue,
    disabled,
    label,
    labelColor,
    placeholder,
    inputClassName
}) => {
    return (
        <>
            <div className={classes.LabelWrapper}>
                <label style={{backgroundColor: labelColor}}>{label}</label>
            </div>
            <textarea
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className={`${classes.TextArea} ${inputClassName} ${disabled ? classes.UnactiveTextArea : ""}`}
            />
        </>
    );
};

export default TextArea;