import { InputParameterResponse } from '../../types/input_parameter';
import classes from './InputParameter.module.css';
import InputParameterCard from './InputParameterCard/InputParameterCard';
import { switchInputParameters } from '../../api/input_parameter/switchInputParameters';

interface InputParameterListProps {
    inputParameters: Array<InputParameterResponse>,
    setInputParameters: (value: InputParameterResponse[]) => void,
    refetchData: () => void,
    openCards: Record<number, boolean>,
    setOpenCards: (value: Record<number, boolean>) => void,
}

const InputParameterList: React.FC<InputParameterListProps> = ({
    inputParameters,
    setInputParameters,
    refetchData,
    openCards,
    setOpenCards,
}) => {
    // Обработчики для перемещения параметров
    const handleSwitchUp = (id1: number, id2: number) => {
        switchInputParameters(id1, id2, () => {
            refetchData();
        });
    };

    const handleSwitchDown = (id1: number, id2: number) => {
        switchInputParameters(id1, id2, () => {
            refetchData();
        });
    };

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
                        refetchData={refetchData}
                        isOpen={openCards[inputParameter.id] ?? true}
                        setIsOpen={(open) => setOpenCards({ ...openCards, [inputParameter.id]: open })}
                        switchUpCallback={index > 0 ? () => handleSwitchUp(inputParameter.id, inputParameters[index - 1].id) : undefined}
                        switchDownCallback={index < inputParameters.length - 1 ? () => handleSwitchDown(inputParameter.id, inputParameters[index + 1].id) : undefined}
                        canSwitchUp={index > 0}
                        canSwitchDown={index < inputParameters.length - 1}
                        key={inputParameter.id}
                    />
                )
            }
        </div>
    );
};

export default InputParameterList;