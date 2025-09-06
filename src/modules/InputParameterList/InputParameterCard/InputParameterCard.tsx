import React from 'react';
import ParameterCard from '../../../components/ParameterCard/ParameterCard';
import { InputParameterResponse } from '../../../types/input_parameter';
import AccentButton from '../../../ui/buttons/AccentButton/AccentButton';
import { createInputValue } from '../../../api/input_value/createInputValue';
import { updateInputParameterById } from '../../../api/input_parameter/updateInputParameter';
import { removeInputParameterById } from '../../../api/input_parameter/removeInputParameterById';
import InputValueUnit from './InputValueUnit/InputValueUnit';
import { InputValueResponse } from '../../../types/input_value';

interface InputParameterCardProps {
    inputParameter: InputParameterResponse;
    setInputParameter: (value: InputParameterResponse) => void;
    deleteCallback: () => void;
}

const InputParameterCard: React.FC<InputParameterCardProps> = ({ inputParameter, setInputParameter, deleteCallback }) => {
    return (
        <ParameterCard
            name={inputParameter.name}
            setParameter={(name: string, start: number, end: number) => {
                updateInputParameterById(inputParameter.id, {
                    name: name,
                    start: start,
                    end: end
                }, () => { setInputParameter({ ...inputParameter, name: name, start: start, end: end }); });
            }}
            start={inputParameter.start}
            end={inputParameter.end}
            removeCallback={() => removeInputParameterById(inputParameter.id, deleteCallback)}
        >
            {
                inputParameter.input_values.map((inputValue, index) =>
                    <InputValueUnit
                        key={inputValue.id}
                        inputValue={inputValue}
                        setInputValue={(value: InputValueResponse) => {
                            const newInputValues = [...inputParameter.input_values];
                            newInputValues.splice(index, 1, value);
                            setInputParameter({...inputParameter, input_values: newInputValues});
                        }}
                        deleteCallback={() => null}
                    />
                )
            }
            <AccentButton onClick={
                () => createInputValue({ input_parameter_id: inputParameter.id },
                    (id: number) => setInputParameter({
                        ...inputParameter,
                        input_values: [
                            ...inputParameter.input_values,
                            {
                                id: id,
                                value: "Новое значение",
                                input_parameter_id: inputParameter.id,
                                a: 0,
                                b: 0,
                                c: 0,
                                d: 0,
                                is_triangle: false
                            }
                        ]
                    }
                    )
                )
            }>Добавить значение</AccentButton>
        </ParameterCard>
    );
};

export default InputParameterCard;