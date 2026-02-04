import React, { useCallback } from 'react';
import { FuzzyOutputValueResponse } from '../../../../types/fuzzy_output_value';
import TextInput from '../../../../ui/inputs/TextInput/TextInput';
import classes from './FuzzyOutputValueUnit.module.css';

// Color palette - should match FuzzyGraph
const COLORS = [
    '#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f39c12',
    '#1abc9c', '#e91e63', '#00bcd4', '#ff5722', '#8bc34a',
];

interface FuzzyOutputValueUnitProps {
    fuzzyOutputValue: FuzzyOutputValueResponse;
    index: number;
    parameterStart: number;
    parameterEnd: number;
    isFirst: boolean;
    isLast: boolean;
    onValueChange: (updated: FuzzyOutputValueResponse, editedParam?: 'a' | 'b' | 'c' | 'd') => void;
    onDelete: () => void;
}

const FuzzyOutputValueUnit: React.FC<FuzzyOutputValueUnitProps> = ({
    fuzzyOutputValue,
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
        onValueChange({ ...fuzzyOutputValue, value });
    }, [fuzzyOutputValue, onValueChange]);

    const handleNumberChange = useCallback((param: 'a' | 'b' | 'c' | 'd', valueStr: string) => {
        const value = parseFloat(valueStr);
        if (isNaN(value)) return;
        
        const epsilon = (parameterEnd - parameterStart) * 0.001;
        
        // Clamp strictly within parameter range (only epsilon margin for boundary terms)
        const minAllowed = isFirst ? parameterStart - epsilon : parameterStart;
        const maxAllowed = isLast ? parameterEnd + epsilon : parameterEnd;
        let clampedValue = Math.max(minAllowed, Math.min(maxAllowed, value));
        
        let newValue = { ...fuzzyOutputValue };
        
        // Same logic as InputValueUnit - don't allow editing synced fields for middle terms
        if (!isFirst && !isLast) {
            if (param === 'a' || param === 'd') {
                // These are synced from neighbors, don't allow direct editing
                // But still process to trigger parent update which will sync properly
                newValue[param] = clampedValue;
                onValueChange(newValue, param);
                return;
            }
        }
        
        newValue[param] = clampedValue;

        // Enforce constraint within this term: a < b <= c < d
        if (param === 'b') {
            if (newValue.b <= newValue.a) {
                if (isFirst) {
                    newValue.b = newValue.a + epsilon;
                    clampedValue = newValue.b;
                } else {
                    newValue.a = newValue.b - epsilon;
                }
            }
            if (newValue.b > newValue.c) {
                newValue.c = newValue.b;
            }
            if (newValue.c >= newValue.d) {
                if (isLast) {
                    newValue.c = newValue.d - epsilon;
                } else {
                    newValue.d = newValue.c + epsilon;
                }
            }
        } else if (param === 'c') {
            if (newValue.c < newValue.b) {
                newValue.b = newValue.c;
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
            if (newValue.c >= newValue.d) {
                if (isLast) {
                    newValue.c = newValue.d - epsilon;
                    clampedValue = newValue.c;
                } else {
                    newValue.d = newValue.c + epsilon;
                }
            }
        } else if (param === 'a') {
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

        onValueChange(newValue, param);
    }, [fuzzyOutputValue, parameterStart, parameterEnd, isFirst, isLast, onValueChange]);

    // Overlapping Ruspini partition (same as InputValueUnit):
    // First term: a and b are fixed (start of range), c editable
    // Last term: b editable, c and d are fixed (end of range)
    // Middle terms: a synced with prev.c, b and c editable, d synced with next.b
    const aDisabled = true;  // Always disabled - first term fixed, others synced from prev.c
    const bDisabled = isFirst;  // Only first term: b is fixed to start
    const cDisabled = isLast;   // Only last term: c is fixed to end
    const dDisabled = true;   // Always disabled - last term fixed, others synced to next.b

    return (
        <div className={classes.Container}>
            <div className={classes.Top}>
                <div
                    className={classes.ColorIndicator}
                    style={{ backgroundColor: color }}
                />
                <TextInput
                    value={fuzzyOutputValue.value}
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
                        min={parameterStart}
                        max={parameterEnd}
                        value={fuzzyOutputValue.a.toFixed(2)}
                        onChange={(e) => handleNumberChange('a', e.target.value)}
                        className={classes.NumberInput}
                        disabled={aDisabled}
                        title="Синхронизируется с предыдущим термом (= prev.c)"
                    />
                </div>
                <div className={classes.ParameterRow}>
                    <span className={classes.ParameterLabel}>b:</span>
                    <input
                        type="number"
                        step="0.01"
                        min={parameterStart}
                        max={parameterEnd}
                        value={fuzzyOutputValue.b.toFixed(2)}
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
                        min={parameterStart}
                        max={parameterEnd}
                        value={fuzzyOutputValue.c.toFixed(2)}
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
                        min={parameterStart}
                        max={parameterEnd}
                        value={fuzzyOutputValue.d.toFixed(2)}
                        onChange={(e) => handleNumberChange('d', e.target.value)}
                        className={classes.NumberInput}
                        disabled={dDisabled}
                        title="Синхронизируется со следующим термом (= next.b)"
                    />
                </div>
            </div>
        </div>
    );
};

export default FuzzyOutputValueUnit;
