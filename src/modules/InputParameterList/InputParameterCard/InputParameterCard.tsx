import React, { useState, useEffect, useCallback } from 'react';
import ParameterCard from '../../../components/ParameterCard/ParameterCard';
import { InputParameterResponse } from '../../../types/input_parameter';
import AccentButton from '../../../ui/buttons/AccentButton/AccentButton';
import SecondaryButton from '../../../ui/buttons/SecondaryButton/SecondaryButton';
import { createInputValue } from '../../../api/input_value/createInputValue';
import { updateInputParameterById } from '../../../api/input_parameter/updateInputParameter';
import { removeInputParameterById } from '../../../api/input_parameter/removeInputParameterById';
import InputValueUnit from './InputValueUnit/InputValueUnit';
import { InputValueResponse } from '../../../types/input_value';
import FuzzyGraph from '../../../components/FuzzyGraph/FuzzyGraph';
import { updateInputValueById } from '../../../api/input_value/updateInputValueById';
import { removeInputValueById } from '../../../api/input_value/removeInputValueById';
import classes from './InputParameterCard.module.css';

interface InputParameterCardProps {
    inputParameter: InputParameterResponse;
    setInputParameter: (value: InputParameterResponse) => void;
    deleteCallback: () => void;
    refetchData: () => void;
}

const InputParameterCard: React.FC<InputParameterCardProps> = ({
    inputParameter,
    setInputParameter,
    deleteCallback,
    refetchData,
}) => {
    // Local state for editing - will be synced with props
    const [localInputValues, setLocalInputValues] = useState<InputValueResponse[]>([]);
    const [isDirty, setIsDirty] = useState(false);

    // Sync local state with props
    useEffect(() => {
        setLocalInputValues([...inputParameter.input_values]);
        setIsDirty(false);
    }, [inputParameter.input_values]);

    // Sort input values by 'a' for consistent ordering with graph
    const sortedInputValues = [...localInputValues].sort((a, b) => a.a - b.a);

    // Update a single term and sync adjacent terms using Ruspini partition rules:
    // A.c = B.a, A.d = B.b (overlapping terms)
    // Constraint: a < b <= c < d
    const handleTermChange = useCallback((updatedValue: InputValueResponse, editedParam?: 'a' | 'b' | 'c' | 'd') => {
        setLocalInputValues(prevValues => {
            const sorted = [...prevValues].sort((a, b) => a.a - b.a);
            
            // Find the actual index in sorted array
            const actualIndex = sorted.findIndex(v => v.id === updatedValue.id);
            if (actualIndex === -1) return prevValues;
            
            // Create a copy with the updated value
            const newValues = [...sorted];
            newValues[actualIndex] = { ...updatedValue };
            
            const numTerms = newValues.length;
            const epsilon = (inputParameter.end - inputParameter.start) * 0.001;
            const isFirst = actualIndex === 0;
            const isLast = actualIndex === numTerms - 1;
            
            // Apply Ruspini partition rules based on which param was edited
            // Rules: prev.c = next.a, prev.d = next.b
            
            if (editedParam === 'a' || editedParam === 'b') {
                // Edited left boundary (a or b) -> propagate to previous term's c/d
                if (!isFirst) {
                    // prev.c = curr.a, prev.d = curr.b
                    newValues[actualIndex - 1] = {
                        ...newValues[actualIndex - 1],
                        c: newValues[actualIndex].a,
                        d: newValues[actualIndex].b,
                    };
                }
            }
            
            if (editedParam === 'c' || editedParam === 'd') {
                // Edited right boundary (c or d) -> propagate to next term's a/b
                if (!isLast) {
                    // next.a = curr.c, next.b = curr.d
                    newValues[actualIndex + 1] = {
                        ...newValues[actualIndex + 1],
                        a: newValues[actualIndex].c,
                        b: newValues[actualIndex].d,
                    };
                }
            }
            
            // Enforce fixed boundaries:
            // First term: a is fixed (slightly before start)
            newValues[0] = {
                ...newValues[0],
                a: inputParameter.start - epsilon,
            };
            
            // Last term: d is fixed (slightly after end)
            newValues[numTerms - 1] = {
                ...newValues[numTerms - 1],
                d: inputParameter.end + epsilon,
            };
            
            return newValues;
        });
        setIsDirty(true);
    }, [inputParameter.start, inputParameter.end]);

    // Delete a term
    const handleDeleteTerm = useCallback((id: number) => {
        removeInputValueById(id, () => {
            refetchData();
        });
    }, [refetchData]);

    // Save all changes
    const handleSaveAll = useCallback(async () => {
        try {
            // Save all terms
            for (const value of localInputValues) {
                await new Promise<void>((resolve) => {
                    updateInputValueById(value.id, {
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
            console.error('Failed to save input values:', error);
        }
    }, [localInputValues, refetchData]);

    // Cancel changes
    const handleCancel = useCallback(() => {
        setLocalInputValues([...inputParameter.input_values]);
        setIsDirty(false);
    }, [inputParameter.input_values]);

    return (
        <ParameterCard
            name={inputParameter.name}
            setParameter={(name: string, start: number, end: number) => {
                updateInputParameterById(inputParameter.id, {
                    name: name,
                    start: start,
                    end: end
                }, () => { 
                    setInputParameter({ ...inputParameter, name: name, start: start, end: end }); 
                });
            }}
            start={inputParameter.start}
            end={inputParameter.end}
            removeCallback={() => removeInputParameterById(inputParameter.id, deleteCallback)}
        >
            <FuzzyGraph start={inputParameter.start} end={inputParameter.end} units={sortedInputValues} />
            {
                sortedInputValues.map((inputValue, index) =>
                    <InputValueUnit
                        key={inputValue.id}
                        inputValue={inputValue}
                        index={index}
                        parameterStart={inputParameter.start}
                        parameterEnd={inputParameter.end}
                        isFirst={index === 0}
                        isLast={index === sortedInputValues.length - 1}
                        onValueChange={(updated: InputValueResponse, editedParam?: 'a' | 'b' | 'c' | 'd') => handleTermChange(updated, editedParam)}
                        onDelete={() => handleDeleteTerm(inputValue.id)}
                    />
                )
            }
            <div className={classes.Actions}>
                <AccentButton onClick={
                    () => createInputValue({ input_parameter_id: inputParameter.id },
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

export default InputParameterCard;