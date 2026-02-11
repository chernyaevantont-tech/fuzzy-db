import React, { useState, useEffect, useCallback, useRef } from 'react';
import ParameterCard from '../../../components/ParameterCard/ParameterCard';
import { InputParameterResponse } from '../../../types/input_parameter';
import AccentButton from '../../../ui/buttons/AccentButton/AccentButton';
import { createInputValue } from '../../../api/input_value/createInputValue';
import { updateInputParameterById } from '../../../api/input_parameter/updateInputParameter';
import { removeInputParameterById } from '../../../api/input_parameter/removeInputParameterById';
import InputValueUnit from './InputValueUnit/InputValueUnit';
import { InputValueResponse } from '../../../types/input_value';
import FuzzyGraph from '../../../components/FuzzyGraph/FuzzyGraph';
import { updateInputValueById } from '../../../api/input_value/updateInputValueById';
import { removeInputValueById } from '../../../api/input_value/removeInputValueById';
import { switchInputValues } from '../../../api/input_value/switchInputValues';
import classes from './InputParameterCard.module.css';

interface InputParameterCardProps {
    inputParameter: InputParameterResponse;
    setInputParameter: (value: InputParameterResponse) => void;
    deleteCallback: () => void;
    refetchData: () => void;
    isOpen?: boolean;
    setIsOpen?: (open: boolean) => void;
    switchUpCallback?: () => void;
    switchDownCallback?: () => void;
    canSwitchUp?: boolean;
    canSwitchDown?: boolean;
}

const InputParameterCard: React.FC<InputParameterCardProps> = ({
    inputParameter,
    setInputParameter,
    deleteCallback,
    refetchData,
    isOpen,
    setIsOpen,
    switchUpCallback,
    switchDownCallback,
    canSwitchUp = false,
    canSwitchDown = false,
}) => {
    // Local state for editing - will be synced with props
    const [localInputValues, setLocalInputValues] = useState<InputValueResponse[]>([]);
    
    // Ref to track if changes came from local editing (to sync back to parent)
    const isLocalEdit = useRef(false);
    
    // Ref to store current inputParameter for use in effects
    const inputParameterRef = useRef(inputParameter);
    useEffect(() => {
        inputParameterRef.current = inputParameter;
    }, [inputParameter]);

    // Sync local state with props (from parent)
    useEffect(() => {
        if (!isLocalEdit.current) {
            setLocalInputValues([...inputParameter.input_values]);
        }
        isLocalEdit.current = false;
    }, [inputParameter.input_values, inputParameter.start, inputParameter.end]);

    // Reset local state when switching to different parameter
    useEffect(() => {
        setLocalInputValues([...inputParameter.input_values]);
    }, [inputParameter.id]);
    
    // Sync local changes back to parent state
    useEffect(() => {
        if (isLocalEdit.current) {
            setInputParameter({
                ...inputParameterRef.current,
                input_values: localInputValues
            });
        }
    }, [localInputValues, setInputParameter]);

    // Sort input values by 'a' for consistent ordering with graph
    const sortedInputValues = [...localInputValues].sort((a, b) => a.a - b.a);

    // Update a single term and sync adjacent terms using Ruspini partition rules:
    // A.c = B.a, A.d = B.b (overlapping terms)
    // Constraint: a < b <= c < d
    const handleTermChange = useCallback((updatedValue: InputValueResponse) => {
        isLocalEdit.current = true;  // Mark as local edit to sync back to parent
        setLocalInputValues(prevValues => {
            const sorted = [...prevValues].sort((a, b) => a.a - b.a);
            
            // Find the actual index in sorted array
            const actualIndex = sorted.findIndex(v => v.id === updatedValue.id);
            if (actualIndex === -1) return prevValues;
            
            // Create deep copies of all terms
            const newValues = sorted.map(v => ({ ...v }));
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
            // For Ruspini partition: first term a=b=start, last term c=d=end
            newValues[0].a = inputParameter.start;
            newValues[0].b = inputParameter.start;
            newValues[numTerms - 1].c = inputParameter.end;
            newValues[numTerms - 1].d = inputParameter.end;
            
            // Final validation: ensure all terms satisfy a < b <= c < d
            for (let i = 0; i < numTerms; i++) {
                const term = newValues[i];
                if (term.a >= term.b) term.b = term.a + epsilon;
                if (term.b > term.c) term.c = term.b;
                if (term.c >= term.d) term.d = term.c + epsilon;
            }
            
            // Re-apply fixed boundaries (in case validation changed them)
            newValues[0].a = inputParameter.start;
            newValues[0].b = inputParameter.start;
            newValues[numTerms - 1].c = inputParameter.end;
            newValues[numTerms - 1].d = inputParameter.end;
            
            return newValues;
        });
    }, [inputParameter.start, inputParameter.end, localInputValues]);

    // Delete a term
    const handleDeleteTerm = useCallback((id: number) => {
        removeInputValueById(id, () => {
            refetchData();
        });
    }, [refetchData]);

    // Обработчик switch (перемещение терма)
    const handleSwitch = useCallback((id1: number, id2: number) => {
        switchInputValues(id1, id2, () => {
            refetchData();
        });
    }, [refetchData]);

    return (
        <ParameterCard
            name={inputParameter.name}
            setParameter={(name: string, start: number, end: number) => {
                const startChanged = start !== inputParameter.start;
                const endChanged = end !== inputParameter.end;
                
                updateInputParameterById(inputParameter.id, {
                    name: name,
                    start: start,
                    end: end
                }, () => { 
                    setInputParameter({ ...inputParameter, name: name, start: start, end: end });
                    
                    // Обновить граничные термы при изменении start/end
                    const sorted = [...localInputValues].sort((a, b) => a.a - b.a);
                    if (sorted.length > 0) {
                        let needsRefetch = false;
                        if (startChanged) {
                            // Обновить первую терму: a и b должны быть равны start
                            const firstTerm = sorted[0];
                            updateInputValueById(firstTerm.id, {
                                value: firstTerm.value,
                                a: start,
                                b: start,
                                c: firstTerm.c,
                                d: firstTerm.d,
                                is_triangle: firstTerm.is_triangle,
                            }, () => {});
                            needsRefetch = true;
                        }
                        if (endChanged) {
                            // Обновить последнюю терму: c и d должны быть равны end
                            const lastTerm = sorted[sorted.length - 1];
                            updateInputValueById(lastTerm.id, {
                                value: lastTerm.value,
                                a: lastTerm.a,
                                b: lastTerm.b,
                                c: end,
                                d: end,
                                is_triangle: lastTerm.is_triangle,
                            }, () => {});
                            needsRefetch = true;
                        }
                        if (needsRefetch) {
                            // Обновить данные после изменения термов
                            setTimeout(() => refetchData(), 100);
                        }
                    }
                });
            }}
            start={inputParameter.start}
            end={inputParameter.end}
            removeCallback={() => removeInputParameterById(inputParameter.id, deleteCallback)}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            switchUpCallback={switchUpCallback}
            switchDownCallback={switchDownCallback}
            canSwitchUp={canSwitchUp}
            canSwitchDown={canSwitchDown}
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
                        onValueChange={(updated: InputValueResponse) => handleTermChange(updated)}
                        onDelete={() => handleDeleteTerm(inputValue.id)}
                        onMoveUp={index > 0 ? () => handleSwitch(inputValue.id, sortedInputValues[index - 1].id) : undefined}
                        onMoveDown={index < sortedInputValues.length - 1 ? () => handleSwitch(inputValue.id, sortedInputValues[index + 1].id) : undefined}
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
            </div>
        </ParameterCard>
    );
};

export default InputParameterCard;