import React, { useState, useEffect, useCallback } from 'react';
import ParameterCard from '../../../components/ParameterCard/ParameterCard';
import { InputParameterResponse } from '../../../types/input_parameter';
import AccentButton from '../../../ui/buttons/AccentButton/AccentButton';
import SecondaryButton from '../../../ui/buttons/SecondaryButton/SecondaryButton';
import { createInputValue } from '../../../api/input_value/createInputValue';
import { updateInputParameterById } from '../../../api/input_parameter/updateInputParameter';
import { removeInputParameterById } from '../../../api/input_parameter/removeInputParameterById';
import { switchInputParameters } from '../../../api/input_parameter/switchInputParameters';
import { switchInputValues } from '../../../api/input_value/switchInputValues';
import InputValueUnit from './InputValueUnit/InputValueUnit';
import { InputValueResponse } from '../../../types/input_value';
import FuzzyGraph from '../../../components/FuzzyGraph/FuzzyGraph';
import { updateInputValueById } from '../../../api/input_value/updateInputValueById';
import { removeInputValueById } from '../../../api/input_value/removeInputValueById';
import classes from './InputParameterCard.module.css';
import { FaAngleUp, FaAngleDown } from 'react-icons/fa6';

interface InputParameterCardProps {
    inputParameter: InputParameterResponse;
    setInputParameter: (value: InputParameterResponse) => void;
    deleteCallback: () => void;
    refetchData: () => void;
    allParameters: InputParameterResponse[];
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

const InputParameterCard: React.FC<InputParameterCardProps> = ({
    inputParameter,
    setInputParameter,
    deleteCallback,
    refetchData,
    allParameters,
    isOpen,
    setIsOpen,
}) => {
    // Local state for editing - will be synced with props
    const [localInputValues, setLocalInputValues] = useState<InputValueResponse[]>([]);
    const [isDirty, setIsDirty] = useState(false);

    // Sync local state with props - always use fresh data
    useEffect(() => {
        setLocalInputValues([...inputParameter.input_values]);
        setIsDirty(false);
    }, [inputParameter]);

    // Get current index of this parameter
    const currentIndex = allParameters.findIndex(p => p.id === inputParameter.id);
    const canMoveUp = currentIndex > 0;
    const canMoveDown = currentIndex < allParameters.length - 1;

    // Handle switch up
    const handleSwitchUp = useCallback(() => {
        if (canMoveUp) {
            const prevParameter = allParameters[currentIndex - 1];
            switchInputParameters(inputParameter.id, prevParameter.id, () => {
                refetchData();
            });
        }
    }, [canMoveUp, currentIndex, allParameters, inputParameter.id, refetchData]);

    // Handle switch down
    const handleSwitchDown = useCallback(() => {
        if (canMoveDown) {
            const nextParameter = allParameters[currentIndex + 1];
            switchInputParameters(inputParameter.id, nextParameter.id, () => {
                refetchData();
            });
        }
    }, [canMoveDown, currentIndex, allParameters, inputParameter.id, refetchData]);

    // Sync local state with props - always use fresh data
    useEffect(() => {
        setLocalInputValues([...inputParameter.input_values]);
        setIsDirty(false);
    }, [inputParameter]);

    // Use database order directly - NO sorting by 'a'
    // This way switch operations preserve the order
    const displayInputValues = localInputValues;

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
            switchUpCallback={handleSwitchUp}
            switchDownCallback={handleSwitchDown}
            canSwitchUp={canMoveUp}
            canSwitchDown={canMoveDown}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
        >
            <FuzzyGraph start={inputParameter.start} end={inputParameter.end} units={displayInputValues} />
            {
                displayInputValues.map((inputValue, index) => {
                    // Используем актуальные данные напрямую из inputParameter для switch
                    const actualIndex = inputParameter.input_values.findIndex(v => v.id === inputValue.id);
                    const actualValue = inputParameter.input_values[actualIndex];
                    
                    return (
                        <InputValueUnit
                            key={`value-${inputValue.id}-${inputValue.value}-${inputValue.a}-${inputValue.b}-${inputValue.c}-${inputValue.d}`}
                            inputValue={inputValue}
                            index={index}
                            parameterStart={inputParameter.start}
                            parameterEnd={inputParameter.end}
                            isFirst={index === 0}
                            isLast={index === displayInputValues.length - 1}
                            onValueChange={(updated: InputValueResponse, editedParam?: 'a' | 'b' | 'c' | 'd') => handleTermChange(updated, editedParam)}
                            onDelete={() => handleDeleteTerm(inputValue.id)}
                            onSwitchUp={() => {
                                if (index > 0) {
                                    const prevValue = displayInputValues[index - 1];
                                    switchInputValues(inputValue.id, prevValue.id, refetchData);
                                }
                            }}
                            onSwitchDown={() => {
                                if (index < displayInputValues.length - 1) {
                                    const nextValue = displayInputValues[index + 1];
                                    switchInputValues(inputValue.id, nextValue.id, refetchData);
                                }
                            }}
                            canSwitchUp={index > 0}
                            canSwitchDown={index < displayInputValues.length - 1}
                        />
                    );
                })
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