import React, { useCallback, useMemo } from 'react';
import { InputValueResponse } from '../../../../types/input_value';
import TextInput from '../../../../ui/inputs/TextInput/TextInput';
import classes from './InputValueUnit.module.css';

// Color palette - should match FuzzyGraph
const COLORS = [
    '#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f39c12',
    '#1abc9c', '#e91e63', '#00bcd4', '#ff5722', '#8bc34a',
];

/**
 * Validate constraint: a < b <= c < d for overlapping Ruspini partition
 */
function validateTermConstraints(a: number, b: number, c: number, d: number): boolean {
    return a < b && b <= c && c < d;
}

interface InputValueUnitProps {
    inputValue: InputValueResponse;
    index: number;
    parameterStart: number;
    parameterEnd: number;
    isFirst: boolean;
    isLast: boolean;
    onValueChange: (updated: InputValueResponse, editedParam?: 'a' | 'b' | 'c' | 'd') => void;
    onDelete: () => void;
}

const InputValueUnit: React.FC<InputValueUnitProps> = ({
    inputValue,
    index,
    parameterStart,
    parameterEnd,
    isFirst,
    isLast,
    onValueChange,
    onDelete,
}) => {
    const color = COLORS[index % COLORS.length];

    const handleTextChange = useCallback((value: string) => {
        onValueChange({ ...inputValue, value });
    }, [inputValue, onValueChange]);

    /**
     * Handle number input change with Ruspini partition constraints:
     * - a < b <= c < d (always enforced within this term)
     * - Changes propagate to adjacent terms via parent
     * 
     * Editable fields:
     * - First term: b, c, d (a is fixed to start - epsilon)
     * - Middle terms: b, c (a and d are synced with neighbors)
     * - Last term: a, b, c (d is fixed to end + epsilon)
     * 
     * Key insight: Only allow editing of "independent" points:
     * - b and c are independent (plateau boundaries)
     * - a and d are dependent (overlap boundaries, synced with neighbors)
     */
    const handleNumberChange = useCallback((param: 'a' | 'b' | 'c' | 'd', valueStr: string) => {
        const value = parseFloat(valueStr);
        if (isNaN(value)) return;
        
        const epsilon = (parameterEnd - parameterStart) * 0.001;
        
        // Clamp strictly within parameter range (only epsilon margin for boundary terms)
        // First term a can be slightly before start, last term d can be slightly after end
        const minAllowed = isFirst ? parameterStart - epsilon : parameterStart;
        const maxAllowed = isLast ? parameterEnd + epsilon : parameterEnd;
        let clampedValue = Math.max(minAllowed, Math.min(maxAllowed, value));
        
        let newValue = { ...inputValue };
        
        newValue[param] = clampedValue;

        // Enforce constraint within this term: a < b <= c < d
        // Adjust other values to maintain validity, respecting neighbor sync points
        if (param === 'b') {
            // b changed: ensure a < b <= c < d
            // a is synced from prev term (if not first), so adjust it locally only
            if (newValue.b <= newValue.a) {
                if (isFirst) {
                    // First term: a is fixed
                    newValue.b = newValue.a + epsilon;
                    clampedValue = newValue.b;
                } else {
                    // Will be synced from neighbor
                    newValue.a = newValue.b - epsilon;
                }
            }
            // Ensure b <= c
            if (newValue.b > newValue.c) {
                newValue.c = newValue.b;
            }
            // Ensure c < d
            if (newValue.c >= newValue.d) {
                if (isLast) {
                    // Last term: d is fixed
                    newValue.c = newValue.d - epsilon;
                } else {
                    newValue.d = newValue.c + epsilon;
                }
            }
        } else if (param === 'c') {
            // c changed: ensure b <= c < d
            if (newValue.c < newValue.b) {
                newValue.b = newValue.c;
                // Cascade: ensure a < b
                if (newValue.b <= newValue.a) {
                    if (isFirst) {
                        newValue.b = newValue.a + epsilon;
                        newValue.c = newValue.b;
                        clampedValue = newValue.c;
                    } else {
                        newValue.a = newValue.b - epsilon;
                    }
                }
            }
            // Ensure c < d
            if (newValue.c >= newValue.d) {
                if (isLast) {
                    // Last term: d is fixed
                    newValue.c = newValue.d - epsilon;
                    clampedValue = newValue.c;
                } else {
                    newValue.d = newValue.c + epsilon;
                }
            }
        } else if (param === 'a') {
            // Only for first term or when syncing
            if (newValue.a >= newValue.b) {
                newValue.b = newValue.a + epsilon;
            }
            if (newValue.b > newValue.c) {
                newValue.c = newValue.b;
            }
            if (newValue.c >= newValue.d) {
                newValue.d = newValue.c + epsilon;
            }
        } else if (param === 'd') {
            // Only for last term or when syncing
            if (newValue.d <= newValue.c) {
                newValue.c = newValue.d - epsilon;
            }
            if (newValue.c < newValue.b) {
                newValue.b = newValue.c;
            }
            if (newValue.b <= newValue.a) {
                newValue.a = newValue.b - epsilon;
            }
        }

        // Send to parent with info about which param was edited
        onValueChange(newValue, param);
    }, [inputValue, parameterStart, parameterEnd, isFirst, isLast, onValueChange]);

    // Overlapping Ruspini partition:
    // First term: a and b are fixed (start of range), c and d editable
    // Last term: a and b editable, c and d are fixed (end of range)
    // Middle terms: all fields editable (a affects prev.c, d affects next.b)
    const aDisabled = isFirst;  // Only first term: a is fixed to start - epsilon
    const bDisabled = isFirst;  // Only first term: b is fixed to start
    const cDisabled = isLast;   // Only last term: c is fixed to end
    const dDisabled = isLast;   // Only last term: d is fixed to end + epsilon

    // Validation state for visual feedback
    const isValid = useMemo(() => {
        return validateTermConstraints(inputValue.a, inputValue.b, inputValue.c, inputValue.d);
    }, [inputValue.a, inputValue.b, inputValue.c, inputValue.d]);

    return (
        <div className={`${classes.Container} ${!isValid ? classes.Invalid : ''}`}>
            <div className={classes.Top}>
                <div
                    className={classes.ColorIndicator}
                    style={{ backgroundColor: color }}
                />
                <TextInput
                    value={inputValue.value}
                    setValue={handleTextChange}
                    className={classes.Value}
                />
                <div className={classes.Actions}>
                    <button className={classes.DeleteButton} onClick={onDelete} title="Удалить">
                        ✕
                    </button>
                </div>
            </div>
            <div className={classes.Parameters}>
                <div className={classes.ParameterRow}>
                    <span className={classes.ParameterLabel}>a:</span>
                    <input
                        type="number"
                        step="0.01"
                        value={inputValue.a.toFixed(2)}
                        onChange={(e) => handleNumberChange('a', e.target.value)}
                        className={classes.NumberInput}
                        disabled={aDisabled}
                        title={isFirst ? "Фиксировано (начало диапазона)" : "Левая граница (= prev.c)"}
                    />
                </div>
                <div className={classes.ParameterRow}>
                    <span className={classes.ParameterLabel}>b:</span>
                    <input
                        type="number"
                        step="0.01"
                        value={inputValue.b.toFixed(2)}
                        onChange={(e) => handleNumberChange('b', e.target.value)}
                        className={classes.NumberInput}
                        disabled={bDisabled}
                        title={isFirst ? "Фиксировано (начало диапазона)" : "Начало плато (a < b, редактируемо)"}
                    />
                </div>
                <div className={classes.ParameterRow}>
                    <span className={classes.ParameterLabel}>c:</span>
                    <input
                        type="number"
                        step="0.01"
                        value={inputValue.c.toFixed(2)}
                        onChange={(e) => handleNumberChange('c', e.target.value)}
                        className={classes.NumberInput}
                        disabled={cDisabled}
                        title={isLast ? "Фиксировано (конец диапазона)" : "Конец плато (b ≤ c, редактируемо)"}
                    />
                </div>
                <div className={classes.ParameterRow}>
                    <span className={classes.ParameterLabel}>d:</span>
                    <input
                        type="number"
                        step="0.01"
                        value={inputValue.d.toFixed(2)}
                        onChange={(e) => handleNumberChange('d', e.target.value)}
                        className={classes.NumberInput}
                        disabled={dDisabled}
                        title={isLast ? "Фиксировано (конец диапазона)" : "Правая граница (c < d, = next.b)"}
                    />
                </div>
            </div>
        </div>
    );
};

export default InputValueUnit;