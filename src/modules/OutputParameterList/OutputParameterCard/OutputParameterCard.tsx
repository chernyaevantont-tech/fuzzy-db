import React, { useState, useEffect, useCallback } from 'react';
import ParameterCard from '../../../components/ParameterCard/ParameterCard';
import { OutputParameterResponse } from '../../../types/output_parameter';
import AccentButton from '../../../ui/buttons/AccentButton/AccentButton';
import SecondaryButton from '../../../ui/buttons/SecondaryButton/SecondaryButton';
import { createFuzzyOutputValue } from '../../../api/fuzzy_output_value/createFuzzyOutputValue';
import { updateOutputParameterById } from '../../../api/output_parameter/updateOutputParameterById';
import { removeOutputParameterById } from '../../../api/output_parameter/removeOutputParameterById';
import { switchOutputParameters } from '../../../api/output_parameter/switchOutputParameters';
import { switchFuzzyOutputValues } from '../../../api/fuzzy_output_value/switchFuzzyOutputValues';
import FuzzyOutputValueUnit from './FuzzyOutputValueUnit/FuzzyOutputValueUnit';
import { FuzzyOutputValueResponse } from '../../../types/fuzzy_output_value';
import FuzzyGraph from '../../../components/FuzzyGraph/FuzzyGraph';
import { updateFuzzyOutputValueById } from '../../../api/fuzzy_output_value/updateFuzzyOutputValueById';
import { removeFuzzyOutputValueById } from '../../../api/fuzzy_output_value/removeFuzzyOutputValueById';
import classes from './OutputParameterCard.module.css';
import { FaAngleUp, FaAngleDown } from 'react-icons/fa6';

interface OutputParameterCardProps {
    outputParameter: OutputParameterResponse;
    setOutputParameter: (value: OutputParameterResponse) => void;
    deleteCallback: () => void;
    refetchData: () => void;
    allParameters: OutputParameterResponse[];
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

const OutputParameterCard: React.FC<OutputParameterCardProps> = ({ 
    outputParameter, 
    setOutputParameter, 
    deleteCallback,
    refetchData,
    allParameters,
    isOpen,
    setIsOpen,
}) => {
    // Local state for editing - will be synced with props
    const [localOutputValues, setLocalOutputValues] = useState<FuzzyOutputValueResponse[]>([]);
    const [isDirty, setIsDirty] = useState(false);

    // Get current index of this parameter
    const currentIndex = allParameters.findIndex(p => p.id === outputParameter.id);
    const canMoveUp = currentIndex > 0;
    const canMoveDown = currentIndex < allParameters.length - 1;

    // Handle switch up
    const handleSwitchUp = useCallback(() => {
        if (canMoveUp) {
            const prevParameter = allParameters[currentIndex - 1];
            switchOutputParameters(outputParameter.id, prevParameter.id, () => {
                refetchData();
            });
        }
    }, [canMoveUp, currentIndex, allParameters, outputParameter.id, refetchData]);

    // Handle switch down
    const handleSwitchDown = useCallback(() => {
        if (canMoveDown) {
            const nextParameter = allParameters[currentIndex + 1];
            switchOutputParameters(outputParameter.id, nextParameter.id, () => {
                refetchData();
            });
        }
    }, [canMoveDown, currentIndex, allParameters, outputParameter.id, refetchData]);

    // Sync local state with props - always use fresh data
    useEffect(() => {
        setLocalOutputValues([...outputParameter.fuzzy_output_values]);
        setIsDirty(false);
    }, [outputParameter]);

    // Use database order directly - NO sorting by 'a'
    // This way switch operations preserve the order
    const displayFuzzyOutputValues = localOutputValues;

    // Update a single term and sync adjacent terms using Ruspini partition rules:
    // Same logic as input parameters - overlapping trapezoidal membership functions
    // A.c = B.a, A.d = B.b (overlapping terms)
    // Constraint: a < b <= c < d
    const handleTermChange = useCallback((updatedValue: FuzzyOutputValueResponse, editedParam?: 'a' | 'b' | 'c' | 'd') => {
        setLocalOutputValues(prevValues => {
            const sorted = [...prevValues].sort((a, b) => a.a - b.a);
            
            // Find the actual index in sorted array
            const actualIndex = sorted.findIndex(v => v.id === updatedValue.id);
            if (actualIndex === -1) return prevValues;
            
            // Create a copy with the updated value
            const newValues = [...sorted];
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
            newValues[0].a = outputParameter.start - epsilon;
            newValues[0].b = outputParameter.start;
            newValues[numTerms - 1].c = outputParameter.end;
            newValues[numTerms - 1].d = outputParameter.end + epsilon;
            
            // Final validation: ensure all terms satisfy a < b <= c < d
            for (let i = 0; i < numTerms; i++) {
                const term = newValues[i];
                if (term.a >= term.b) term.b = term.a + epsilon;
                if (term.b > term.c) term.c = term.b;
                if (term.c >= term.d) term.d = term.c + epsilon;
            }
            
            // Re-apply fixed boundaries (in case validation changed them)
            newValues[0].a = outputParameter.start - epsilon;
            newValues[0].b = outputParameter.start;
            newValues[numTerms - 1].c = outputParameter.end;
            newValues[numTerms - 1].d = outputParameter.end + epsilon;
            
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
            switchUpCallback={handleSwitchUp}
            switchDownCallback={handleSwitchDown}
            canSwitchUp={canMoveUp}
            canSwitchDown={canMoveDown}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
        >
            <FuzzyGraph start={outputParameter.start} end={outputParameter.end} units={displayFuzzyOutputValues} />
            {
                displayFuzzyOutputValues.map((fuzzyOutputValue, index) => {
                    return (
                        <FuzzyOutputValueUnit
                            key={`value-${fuzzyOutputValue.id}-${fuzzyOutputValue.value}-${fuzzyOutputValue.a}-${fuzzyOutputValue.b}-${fuzzyOutputValue.c}-${fuzzyOutputValue.d}`}
                            fuzzyOutputValue={fuzzyOutputValue}
                            index={index}
                            parameterStart={outputParameter.start}
                            parameterEnd={outputParameter.end}
                            isFirst={index === 0}
                            isLast={index === displayFuzzyOutputValues.length - 1}
                            onValueChange={(updated: FuzzyOutputValueResponse, editedParam?: 'a' | 'b' | 'c' | 'd') => handleTermChange(updated, editedParam)}
                            onDelete={() => handleDeleteTerm(fuzzyOutputValue.id)}
                            onSwitchUp={() => {
                                if (index > 0) {
                                    const prevValue = displayFuzzyOutputValues[index - 1];
                                    switchFuzzyOutputValues(fuzzyOutputValue.id, prevValue.id, refetchData);
                                }
                            }}
                            onSwitchDown={() => {
                                if (index < displayFuzzyOutputValues.length - 1) {
                                    const nextValue = displayFuzzyOutputValues[index + 1];
                                    switchFuzzyOutputValues(fuzzyOutputValue.id, nextValue.id, refetchData);
                                }
                            }}
                            canSwitchUp={index > 0}
                            canSwitchDown={index < displayFuzzyOutputValues.length - 1}
                        />
                    );
                })
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
