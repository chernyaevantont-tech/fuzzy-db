import { useState } from 'react';
import classes from './TextInput.module.css'

interface TextInputProps {
    value: string,
    setValue: (newValue: string) => void,
    onBlur?: () => void,
    disabled?: boolean,
    autocomplete?: string,
    label?: string,
    placeholder?: string,
    regex?: RegExp,
    wrongMessage?: string,
    isWrongBlock?: boolean,
    rightIcon?: React.ReactNode,
    isHidden?: boolean,
    className?: string,
    inputClassName?: string
}

const TextInput: React.FC<TextInputProps> = ({ value, setValue, onBlur, disabled = false, autocomplete = "off", label, placeholder, regex, wrongMessage, isWrongBlock, rightIcon, isHidden, className, inputClassName }) => {
    const [wrongFlag, setWrongFlag] = useState<boolean>(false);
    const [prevIsWrongBlock, setPrevIsWrongBlock] = useState<boolean | undefined>(isWrongBlock);


    if (isWrongBlock != prevIsWrongBlock) {
        setPrevIsWrongBlock(isWrongBlock);
        if (isWrongBlock) {
            setWrongFlag(true);
        }
        else {
            if (!regex) {
                setWrongFlag(false);
            }
            else if (!regex.test(value)) setWrongFlag(true)
        }
    }

    const handleInputChange = (newValue: string) => {
        setValue(newValue);
        if (isWrongBlock) return;
        if (!regex) {
            setWrongFlag(false);
        }
        else if (!regex.test(value)) setWrongFlag(true)
    }

    return (
        <div className={`${classes.TextInput} ${wrongFlag ? classes.Wrong : ""} ${className}`}>
            <label className={`${classes.Label} ${wrongFlag ? classes.Wrong : ""}`}>{label}</label>
            <input
                type={isHidden ? "password" : "text"}
                value={value}
                onBlur={onBlur}
                onChange={e => handleInputChange(e.target.value)}
                className={`${classes.Input} ${wrongFlag ? classes.Wrong : ""} ${inputClassName}`}
                placeholder={placeholder}
                disabled={disabled}
                autoComplete={autocomplete}
                style={{ color: disabled ? "var(--unactive-text-color)" : "var(--text-color)" }}
            />
            <p className={`${classes.Wrong} ${classes.WrongMessage}`} style={{ opacity: (wrongFlag ? "100%" : "0") }}>{wrongMessage}</p>
            {<div className={`${classes.RightIconWrapper} ${wrongFlag ? classes.Wrong : ""}`}>{rightIcon}</div>}
        </div>
    );
};

export default TextInput;