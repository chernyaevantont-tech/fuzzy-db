import React, { useState, useEffect, useCallback, useRef } from 'react';
import ParameterCard from '../../../components/ParameterCard/ParameterCard';
import { OutputParameterResponse } from '../../../types/output_parameter';
import AccentButton from '../../../ui/buttons/AccentButton/AccentButton';
import { createFuzzyOutputValue } from '../../../api/fuzzy_output_value/createFuzzyOutputValue';
import { updateOutputParameterById } from '../../../api/output_parameter/updateOutputParameterById';
import { removeOutputParameterById } from '../../../api/output_parameter/removeOutputParameterById';
import FuzzyOutputValueUnit from './FuzzyOutputValueUnit/FuzzyOutputValueUnit';
import { FuzzyOutputValueResponse } from '../../../types/fuzzy_output_value';
import FuzzyGraph from '../../../components/FuzzyGraph/FuzzyGraph';
import { updateFuzzyOutputValueById } from '../../../api/fuzzy_output_value/updateFuzzyOutputValueById';
import { removeFuzzyOutputValueById } from '../../../api/fuzzy_output_value/removeFuzzyOutputValueById';
import { switchFuzzyOutputValues } from '../../../api/fuzzy_output_value/switchFuzzyOutputValues';
import classes from './OutputParameterCard.module.css';

interface OutputParameterCardProps {
    outputParameter: OutputParameterResponse;
    setOutputParameter: (value: OutputParameterResponse) => void;
    deleteCallback: () => void;
    refetchData: () => void;
    isOpen?: boolean;
    setIsOpen?: (open: boolean) => void;
    switchUpCallback?: () => void;
    switchDownCallback?: () => void;
    canSwitchUp?: boolean;
    canSwitchDown?: boolean;
}

const OutputParameterCard: React.FC<OutputParameterCardProps> = ({ 
    outputParameter, 
    setOutputParameter, 
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
    const [localOutputValues, setLocalOutputValues] = useState<FuzzyOutputValueResponse[]>([]);
    
    // Ref to track if changes came from local editing (to sync back to parent)
    const isLocalEdit = useRef(false);
    
    // Ref to store current outputParameter for use in effects
    const outputParameterRef = useRef(outputParameter);
    useEffect(() => {
        outputParameterRef.current = outputParameter;
    }, [outputParameter]);

    // Sync local state with props (from parent)
    useEffect(() => {
        if (!isLocalEdit.current) {
            setLocalOutputValues([...outputParameter.fuzzy_output_values]);
        }
        isLocalEdit.current = false;
    }, [outputParameter.fuzzy_output_values, outputParameter.start, outputParameter.end]);

    // Reset local state when switching to different parameter
    useEffect(() => {
        setLocalOutputValues([...outputParameter.fuzzy_output_values]);
    }, [outputParameter.id]);
    
    // Sync local changes back to parent state
    useEffect(() => {
        if (isLocalEdit.current) {
            setOutputParameter({
                ...outputParameterRef.current,
                fuzzy_output_values: localOutputValues
            });
        }
    }, [localOutputValues, setOutputParameter]);

    // Sort fuzzy output values by 'a' for consistent ordering with graph
    const sortedFuzzyOutputValues = [...localOutputValues].sort((a, b) => a.a - b.a);

    // Update a single term and sync adjacent terms using Ruspini partition rules:
    // Same logic as input parameters - overlapping trapezoidal membership functions
    // A.c = B.a, A.d = B.b (overlapping terms)
    // Constraint: a < b <= c < d
    const handleTermChange = useCallback((updatedValue: FuzzyOutputValueResponse) => {
        isLocalEdit.current = true;  // Mark as local edit to sync back to parent
        setLocalOutputValues(prevValues => {
            const sorted = [...prevValues].sort((a, b) => a.a - b.a);
            
            // Find the actual index in sorted array
            const actualIndex = sorted.findIndex(v => v.id === updatedValue.id);
            if (actualIndex === -1) return prevValues;
            
            // Create deep copies of all terms
            const newValues = sorted.map(v => ({ ...v }));
            newValues[actualIndex] = { ...updatedValue };
            
            const numTerms = newValues.length;
            const epsilon = (outputParameter.end - outputParameter.start) * 0.001;
            
            // Use same strategy as InputParameterCard: maintain Ruspini partition by propagating changes
            
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
            newValues[0].a = outputParameter.start;
            newValues[0].b = outputParameter.start;
            newValues[numTerms - 1].c = outputParameter.end;
            newValues[numTerms - 1].d = outputParameter.end;
            
            // Final validation: ensure all terms satisfy a < b <= c < d
            for (let i = 0; i < numTerms; i++) {
                const term = newValues[i];
                if (term.a >= term.b) term.b = term.a + epsilon;
                if (term.b > term.c) term.c = term.b;
                if (term.c >= term.d) term.d = term.c + epsilon;
            }
            
            // Re-apply fixed boundaries (in case validation changed them)
            newValues[0].a = outputParameter.start;
            newValues[0].b = outputParameter.start;
            newValues[numTerms - 1].c = outputParameter.end;
            newValues[numTerms - 1].d = outputParameter.end;
            
            return newValues;
        });
    }, [outputParameter.start, outputParameter.end, localOutputValues]);

    // Delete a term
    const handleDeleteTerm = useCallback((id: number) => {
        removeFuzzyOutputValueById(id, () => {
            refetchData();
        });
    }, [refetchData]);

    // Switch two terms (swap their a,b,c,d values, not IDs or names)
    const handleSwitch = useCallback((id1: number, id2: number) => {
        switchFuzzyOutputValues(id1, id2, () => {
            refetchData();
        });
    }, [refetchData]);

    return (
        <ParameterCard
            name={outputParameter.name}
            setParameter={(name: string, start: number, end: number) => {
                const startChanged = start !== outputParameter.start;
                const endChanged = end !== outputParameter.end;
                const epsilon = (end - start) * 0.001;
                
                updateOutputParameterById(outputParameter.id, {
                    name: name,
                    start: start,
                    end: end
                }, () => { 
                    setOutputParameter({ ...outputParameter, name: name, start: start, end: end });
                    
                    // Обновить граничные термы при изменении start/end
                    const sorted = [...localOutputValues].sort((a, b) => a.a - b.a);
                    if (sorted.length > 0) {
                        let needsRefetch = false;
                        if (startChanged) {
                            // Обновить первую терму: a и b должны быть равны start
                            const firstTerm = sorted[0];
                            updateFuzzyOutputValueById(firstTerm.id, {
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
                            updateFuzzyOutputValueById(lastTerm.id, {
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
            start={outputParameter.start}
            end={outputParameter.end}
            removeCallback={() => removeOutputParameterById(outputParameter.id, deleteCallback)}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            switchUpCallback={switchUpCallback}
            switchDownCallback={switchDownCallback}
            canSwitchUp={canSwitchUp}
            canSwitchDown={canSwitchDown}
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
                        onMoveUp={index > 0 ? () => handleSwitch(fuzzyOutputValue.id, sortedFuzzyOutputValues[index - 1].id) : undefined}
                        onMoveDown={index < sortedFuzzyOutputValues.length - 1 ? () => handleSwitch(fuzzyOutputValue.id, sortedFuzzyOutputValues[index + 1].id) : undefined}
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
            </div>
        </ParameterCard>
    );
};

export default OutputParameterCard;
