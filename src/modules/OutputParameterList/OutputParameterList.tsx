import { OutputParameterResponse } from '../../types/output_parameter';
import classes from './OutputParameter.module.css';
import OutputParameterCard from './OutputParameterCard/OutputParameterCard';

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
                        allParameters={outputParameters}
                        isOpen={openCards[outputParameter.id] ?? false}
                        setIsOpen={(open) => setOpenCards({ ...openCards, [outputParameter.id]: open })}
                        key={outputParameter.id}
                    />
                )
            }
        </div>
    );
};

export default OutputParameterList;
