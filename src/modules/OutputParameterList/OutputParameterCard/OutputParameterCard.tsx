import React, { useState, useEffect, useCallback } from 'react';
import ParameterCard from '../../../components/ParameterCard/ParameterCard';
import { OutputParameterResponse } from '../../../types/output_parameter';
import AccentButton from '../../../ui/buttons/AccentButton/AccentButton';
import SecondaryButton from '../../../ui/buttons/SecondaryButton/SecondaryButton';
import { createFuzzyOutputValue } from '../../../api/fuzzy_output_value/createFuzzyOutputValue';
import { updateOutputParameterById } from '../../../api/output_parameter/updateOutputParameterById';
import { removeOutputParameterById } from '../../../api/output_parameter/removeOutputParameterById';
import FuzzyOutputValueUnit from './FuzzyOutputValueUnit/FuzzyOutputValueUnit';
import { FuzzyOutputValueResponse } from '../../../types/fuzzy_output_value';
import FuzzyGraph from '../../../components/FuzzyGraph/FuzzyGraph';
import { updateFuzzyOutputValueById } from '../../../api/fuzzy_output_value/updateFuzzyOutputValueById';
import { removeFuzzyOutputValueById } from '../../../api/fuzzy_output_value/removeFuzzyOutputValueById';
import classes from './OutputParameterCard.module.css';

interface OutputParameterCardProps {
    outputParameter: OutputParameterResponse;
    setOutputParameter: (value: OutputParameterResponse) => void;
    deleteCallback: () => void;
    refetchData: () => void;
}

const OutputParameterCard: React.FC<OutputParameterCardProps> = ({ 
    outputParameter, 
    setOutputParameter, 
    deleteCallback,
    refetchData,
}) => {
    // Local state for editing - will be synced with props
    const [localOutputValues, setLocalOutputValues] = useState<FuzzyOutputValueResponse[]>([]);
    const [isDirty, setIsDirty] = useState(false);

    // Sync local state with props
    useEffect(() => {
        setLocalOutputValues([...outputParameter.fuzzy_output_values]);
        setIsDirty(false);
    }, [outputParameter.fuzzy_output_values]);

    // Sort fuzzy output values by 'a' for consistent ordering with graph
    const sortedFuzzyOutputValues = [...localOutputValues].sort((a, b) => a.a - b.a);

    // Update a single term and sync adjacent terms
    const handleTermChange = useCallback((updatedValue: FuzzyOutputValueResponse) => {
        setLocalOutputValues(prevValues => {
            const sorted = [...prevValues].sort((a, b) => a.a - b.a);
            const newValues = [...sorted];
            
            // Find the actual index in sorted array
            const actualIndex = sorted.findIndex(v => v.id === updatedValue.id);
            if (actualIndex === -1) return prevValues;
            
            newValues[actualIndex] = updatedValue;
            
            const isFirst = actualIndex === 0;
            const isLast = actualIndex === newValues.length - 1;
            
            // First term: a = b = parameterStart
            if (isFirst) {
                newValues[actualIndex] = {
                    ...newValues[actualIndex],
                    a: outputParameter.start,
                    b: outputParameter.start,
                };
            }
            
            // Last term: c = d = parameterEnd
            if (isLast) {
                newValues[actualIndex] = {
                    ...newValues[actualIndex],
                    c: outputParameter.end,
                    d: outputParameter.end,
                };
            }
            
            // Sync with previous term: prev.c = prev.d = current.a
            if (actualIndex > 0) {
                const prev = newValues[actualIndex - 1];
                const currentA = newValues[actualIndex].a;
                newValues[actualIndex - 1] = {
                    ...prev,
                    c: currentA,
                    d: currentA,
                };
            }
            
            // Sync with next term: next.a = next.b = current.d
            if (actualIndex < newValues.length - 1) {
                const next = newValues[actualIndex + 1];
                const currentD = newValues[actualIndex].d;
                newValues[actualIndex + 1] = {
                    ...next,
                    a: currentD,
                    b: currentD,
                };
            }
            
            return newValues;
        });
        setIsDirty(true);
    }, [outputParameter.start, outputParameter.end]);

    // Delete a term
    const handleDeleteTerm = useCallback((id: number) => {
        removeFuzzyOutputValueById(id, () => {
            refetchData();
        });
    }, [refetchData]);

    // Save all changes
    const handleSaveAll = useCallback(async () => {
        try {
            // Save all terms
            for (const value of localOutputValues) {
                await new Promise<void>((resolve) => {
                    updateFuzzyOutputValueById(value.id, {
                        value: value.value,
                        a: value.a,
                        b: value.b,
                        c: value.c,
                        d: value.d,
                        is_triangle: value.is_triangle,
                    }, () => resolve());
                });
            }
            setIsDirty(false);
            refetchData();
        } catch (error) {
            console.error('Failed to save fuzzy output values:', error);
        }
    }, [localOutputValues, refetchData]);

    // Cancel changes
    const handleCancel = useCallback(() => {
        setLocalOutputValues([...outputParameter.fuzzy_output_values]);
        setIsDirty(false);
    }, [outputParameter.fuzzy_output_values]);

    return (
        <ParameterCard
            name={outputParameter.name}
            setParameter={(name: string, start: number, end: number) => {
                updateOutputParameterById(outputParameter.id, {
                    name: name,
                    start: start,
                    end: end
                }, () => { 
                    setOutputParameter({ ...outputParameter, name: name, start: start, end: end }); 
                });
            }}
            start={outputParameter.start}
            end={outputParameter.end}
            removeCallback={() => removeOutputParameterById(outputParameter.id, deleteCallback)}
        >
            <FuzzyGraph start={outputParameter.start} end={outputParameter.end} units={sortedFuzzyOutputValues} />
            {
                sortedFuzzyOutputValues.map((fuzzyOutputValue, index) =>
                    <FuzzyOutputValueUnit
                        key={fuzzyOutputValue.id}
                        fuzzyOutputValue={fuzzyOutputValue}
                        index={index}
                        parameterStart={outputParameter.start}
                        parameterEnd={outputParameter.end}
                        isFirst={index === 0}
                        isLast={index === sortedFuzzyOutputValues.length - 1}
                        onValueChange={(updated: FuzzyOutputValueResponse) => handleTermChange(updated)}
                        onDelete={() => handleDeleteTerm(fuzzyOutputValue.id)}
                    />
                )
            }
            <div className={classes.Actions}>
                <AccentButton onClick={
                    () => createFuzzyOutputValue({ output_parameter_id: outputParameter.id },
                        () => {
                            refetchData();
                        }
                    )
                }>Добавить терм</AccentButton>
                {isDirty && (
                    <>
                        <AccentButton onClick={handleSaveAll}>Сохранить изменения</AccentButton>
                        <SecondaryButton onClick={handleCancel}>Отменить</SecondaryButton>
                    </>
                )}
            </div>
        </ParameterCard>
    );
};

export default OutputParameterCard;
