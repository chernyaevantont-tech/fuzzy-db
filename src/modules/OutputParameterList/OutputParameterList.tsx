import { OutputParameterResponse } from '../../types/output_parameter';
import classes from './OutputParameter.module.css';
import OutputParameterCard from './OutputParameterCard/OutputParameterCard';
import { switchOutputParameters } from '../../api/output_parameter/switchOutputParameters';

interface OutputParameterListProps {
    outputParameters: Array<OutputParameterResponse>,
    setOutputParameters: (value: OutputParameterResponse[]) => void,
    refetchData: () => void,
    openCards: Record<number, boolean>,
    setOpenCards: (value: Record<number, boolean>) => void,
}

const OutputParameterList: React.FC<OutputParameterListProps> = ({
    outputParameters,
    setOutputParameters,
    refetchData,
    openCards,
    setOpenCards,
}) => {
    // Обработчики для перемещения параметров
    const handleSwitchUp = (id1: number, id2: number) => {
        switchOutputParameters(id1, id2, () => {
            refetchData();
        });
    };

    const handleSwitchDown = (id1: number, id2: number) => {
        switchOutputParameters(id1, id2, () => {
            refetchData();
        });
    };

    return (
        <div className={classes.OutputParameterList}>
            {
                outputParameters.map((outputParameter, index) =>
                    <OutputParameterCard
                        outputParameter={outputParameter}
                        setOutputParameter={(value) => {
                            const newOutputParameters = [...outputParameters];
                            newOutputParameters.splice(index, 1, value);
                            setOutputParameters(newOutputParameters);
                        }}
                        deleteCallback={() => {
                            const id = outputParameter.id;
                            const newOutputParameters = [...outputParameters];
                            setOutputParameters(newOutputParameters.filter(x => x.id != id));
                        }}
                        refetchData={refetchData}
                        isOpen={openCards[outputParameter.id] ?? false}
                        setIsOpen={(open) => setOpenCards({ ...openCards, [outputParameter.id]: open })}
                        switchUpCallback={index > 0 ? () => handleSwitchUp(outputParameter.id, outputParameters[index - 1].id) : undefined}
                        switchDownCallback={index < outputParameters.length - 1 ? () => handleSwitchDown(outputParameter.id, outputParameters[index + 1].id) : undefined}
                        canSwitchUp={index > 0}
                        canSwitchDown={index < outputParameters.length - 1}
                        key={outputParameter.id}
                    />
                )
            }
        </div>
    );
};

export default OutputParameterList;
