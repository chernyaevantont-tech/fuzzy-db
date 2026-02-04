import React, { useCallback } from 'react';
import { FuzzyOutputValueResponse } from '../../../../types/fuzzy_output_value';
import TextInput from '../../../../ui/inputs/TextInput/TextInput';
import classes from './FuzzyOutputValueUnit.module.css';
import { FaAngleUp, FaAngleDown } from 'react-icons/fa6';

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
    onSwitchUp?: () => void;
    onSwitchDown?: () => void;
    canSwitchUp?: boolean;
    canSwitchDown?: boolean;
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
    onSwitchUp,
    onSwitchDown,
    canSwitchUp = false,
    canSwitchDown = false,
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
    // First term: a and b are fixed (start of range), c and d editable
    // Last term: a and b editable, c and d are fixed (end of range)
    // Middle terms: all fields editable (a affects prev.c, d affects next.b)
    const aDisabled = isFirst;  // Only first term: a is fixed to start - epsilon
    const bDisabled = isFirst;  // Only first term: b is fixed to start
    const cDisabled = isLast;   // Only last term: c is fixed to end
    const dDisabled = isLast;   // Only last term: d is fixed to end + epsilon

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
                    {onSwitchUp && (
                        <div className={classes.SwitchButtons}>
                            {canSwitchUp ? (
                                <FaAngleUp className={classes.SwitchIcon} onClick={onSwitchUp} title="Переместить вверх" />
                            ) : (
                                <div className={classes.SwitchIcon} />
                            )}
                            {canSwitchDown ? (
                                <FaAngleDown className={classes.SwitchIcon} onClick={onSwitchDown} title="Переместить вниз" />
                            ) : (
                                <div className={classes.SwitchIcon} />
                            )}
                        </div>
                    )}
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
                        title={isFirst ? "Фиксировано (начало диапазона)" : "Левая граница (влияет на prev.c)"}
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
                        title={isLast ? "Фиксировано (конец диапазона)" : "Правая граница (влияет на next.b)"}
                    />
                </div>
            </div>
        </div>
    );
};

export default FuzzyOutputValueUnit;
