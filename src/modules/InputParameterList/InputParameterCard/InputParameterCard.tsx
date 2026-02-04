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

    // Reset local state when switching to different parameter
    useEffect(() => {
        setLocalInputValues([...inputParameter.input_values]);
        setIsDirty(false);
    }, [inputParameter.id]);

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
            
            // Strategy: maintain Ruspini partition by propagating changes
            // If b is edited: affects prev.d and next.a (through curr.a which = prev.c)
            // If c is edited: affects next.a and prev.d (through curr.d which = next.b)
            
            // First, ensure internal consistency of edited term
            const curr = newValues[actualIndex];
            if (curr.a >= curr.b) curr.b = curr.a + epsilon;
            if (curr.b > curr.c) curr.c = curr.b;
            if (curr.c >= curr.d) curr.d = curr.c + epsilon;
            
            // Forward pass: propagate changes to the right
            for (let i = actualIndex; i < numTerms - 1; i++) {
                // Enforce: next.a = curr.c, next.b = curr.d
                newValues[i + 1].a = newValues[i].c;
                newValues[i + 1].b = newValues[i].d;
                
                // Ensure next term is valid: a < b <= c < d
                if (newValues[i + 1].b > newValues[i + 1].c) {
                    newValues[i + 1].c = newValues[i + 1].b;
                }
                if (newValues[i + 1].c >= newValues[i + 1].d) {
                    // Don't modify d of last term
                    if (i + 1 < numTerms - 1) {
                        newValues[i + 1].d = newValues[i + 1].c + epsilon;
                    } else {
                        // Last term: if c >= d, move c back
                        newValues[i + 1].c = newValues[i + 1].d - epsilon;
                        if (newValues[i + 1].c < newValues[i + 1].b) {
                            newValues[i + 1].b = newValues[i + 1].c;
                        }
                    }
                }
            }
            
            // Backward pass: propagate changes to the left
            for (let i = actualIndex; i > 0; i--) {
                // Enforce: prev.c = curr.a, prev.d = curr.b
                newValues[i - 1].c = newValues[i].a;
                newValues[i - 1].d = newValues[i].b;
                
                // Ensure prev term is valid: a < b <= c < d
                if (newValues[i - 1].c < newValues[i - 1].b) {
                    newValues[i - 1].b = newValues[i - 1].c;
                }
                if (newValues[i - 1].b <= newValues[i - 1].a) {
                    // Don't modify a of first term
                    if (i - 1 > 0) {
                        newValues[i - 1].a = newValues[i - 1].b - epsilon;
                    } else {
                        // First term: if b <= a, move b forward
                        newValues[i - 1].b = newValues[i - 1].a + epsilon;
                        if (newValues[i - 1].b > newValues[i - 1].c) {
                            newValues[i - 1].c = newValues[i - 1].b;
                        }
                    }
                }
            }
            
            // Final enforcement of fixed boundaries
            newValues[0].a = inputParameter.start - epsilon;
            newValues[0].b = inputParameter.start;
            newValues[numTerms - 1].c = inputParameter.end;
            newValues[numTerms - 1].d = inputParameter.end + epsilon;
            
            // Final validation: ensure all terms satisfy a < b <= c < d
            for (let i = 0; i < numTerms; i++) {
                const term = newValues[i];
                if (term.a >= term.b) term.b = term.a + epsilon;
                if (term.b > term.c) term.c = term.b;
                if (term.c >= term.d) term.d = term.c + epsilon;
            }
            
            // Re-apply fixed boundaries (in case validation changed them)
            newValues[0].a = inputParameter.start - epsilon;
            newValues[0].b = inputParameter.start;
            newValues[numTerms - 1].c = inputParameter.end;
            newValues[numTerms - 1].d = inputParameter.end + epsilon;
            
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