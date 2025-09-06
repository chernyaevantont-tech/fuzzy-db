import React from 'react';
import { InputValueResponse } from '../../../../types/input_value';
import TextInput from '../../../../ui/inputs/TextInput/TextInput';
import classes from './InputValueUnit.module.css';

interface InputValueUnitProps {
    inputValue: InputValueResponse;
    setInputValue: (value: InputValueResponse) => void;
    deleteCallback: () => void;
}

const InputValueUnit: React.FC<InputValueUnitProps> = ({ inputValue, setInputValue, deleteCallback }) => {
    return (
        <div >
            <div className={classes.Top}>
                <TextInput value={inputValue.value} setValue={(value: string) => setInputValue({ ...inputValue, value: value })} className={classes.Value}/>
            </div>
        </div>
    );
};

export default InputValueUnit;