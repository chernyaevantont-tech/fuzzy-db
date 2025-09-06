import { InputParameterResponse } from '../../types/input_parameter';
import classes from './InputParameter.module.css';
import InputParameterCard from './InputParameterCard/InputParameterCard';

interface InputParameterListProps {
    inputParameters: Array<InputParameterResponse>,
    setInputParameters: (value: InputParameterResponse[]) => void,
}

const InputParameterList: React.FC<InputParameterListProps> = ({
    inputParameters,
    setInputParameters,
}) => {
    return (
        <div className={classes.InputParameterList}>
            {
                inputParameters.map((inputParameter, index) =>
                    <InputParameterCard
                        inputParameter={inputParameter}
                        setInputParameter={(value) => {
                            const newInputParameters = [...inputParameters];
                            newInputParameters.splice(index, 1, value);
                            setInputParameters(newInputParameters);
                        }}
                        deleteCallback={() => {
                            const id = inputParameter.id;
                            const newInputParameters = [...inputParameters];
                            setInputParameters(newInputParameters.filter(x => x.id != id));
                        }}
                        key={inputParameter.id}
                    />
                )
            }
        </div>
    );
};

export default InputParameterList;