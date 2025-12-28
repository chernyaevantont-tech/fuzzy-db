import { OutputParameterResponse } from '../../types/output_parameter';
import classes from './OutputParameter.module.css';
import OutputParameterCard from './OutputParameterCard/OutputParameterCard';

interface OutputParameterListProps {
    outputParameters: Array<OutputParameterResponse>,
    setOutputParameters: (value: OutputParameterResponse[]) => void,
    refetchData: () => void,
}

const OutputParameterList: React.FC<OutputParameterListProps> = ({
    outputParameters,
    setOutputParameters,
    refetchData,
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
                        key={outputParameter.id}
                    />
                )
            }
        </div>
    );
};

export default OutputParameterList;
