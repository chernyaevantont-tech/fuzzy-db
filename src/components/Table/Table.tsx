import React, { useRef, useEffect } from 'react';
import classes from './Table.module.css';

export type TableCellValue = {
    displayValue: string | number;
    editableValue?: string | number;
    editable: boolean;
    metadata?: any;
    options?: string[]; // Available options for dropdown
};

export type TableProps = {
    rows: TableCellValue[][];
    onCellChange?: (row: number, col: number, value: string) => void;
    className?: string;
};

const Table: React.FC<TableProps> = ({ rows, onCellChange, className }) => {
    const cellRefs = useRef<(HTMLSelectElement | HTMLInputElement | null)[][]>([]);

    useEffect(() => {
        // Initialize refs array
        cellRefs.current = rows.map(row => new Array(row.length).fill(null));
    }, [rows]);

    const handleKeyDown = (e: React.KeyboardEvent, rowIdx: number, colIdx: number) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (e.shiftKey) {
                // Move to previous row, same column
                const prevRow = rowIdx - 1;
                if (prevRow >= 0 && cellRefs.current[prevRow]?.[colIdx]) {
                    cellRefs.current[prevRow][colIdx]?.focus();
                } else {
                    // Wrap to last row
                    const lastRow = rows.length - 1;
                    cellRefs.current[lastRow]?.[colIdx]?.focus();
                }
            } else {
                // Move to next row, same column
                const nextRow = rowIdx + 1;
                if (nextRow < rows.length && cellRefs.current[nextRow]?.[colIdx]) {
                    cellRefs.current[nextRow][colIdx]?.focus();
                } else {
                    // Wrap to first row
                    cellRefs.current[0]?.[colIdx]?.focus();
                }
            }
        }
    };

    return (
        <div className={`${classes.TableWrapper} ${className || ''}`}>
            <div className={classes.Table}>
                {rows.map((row, rowIdx) => (
                    <div key={rowIdx} className={classes.TableRow}>
                        {row.map((cell, colIdx) => {
                            // Use select dropdown if options are available and cell is editable
                            if (cell.editable && cell.options && cell.options.length > 0) {
                                return (
                                    <select
                                        key={`${rowIdx}-${colIdx}`}
                                        ref={(el) => {
                                            if (!cellRefs.current[rowIdx]) {
                                                cellRefs.current[rowIdx] = [];
                                            }
                                            cellRefs.current[rowIdx][colIdx] = el;
                                        }}
                                        value={String(cell.editableValue ?? cell.displayValue)}
                                        onChange={(e) => {
                                            if (onCellChange) {
                                                onCellChange(rowIdx, colIdx, e.target.value);
                                            }
                                        }}
                                        onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
                                        className={`${classes.TableCell} ${classes.EditableCell} ${classes.SelectCell}`}
                                    >
                                        <option value="">-- Выберите --</option>
                                        {cell.options.map((option, idx) => (
                                            <option key={idx} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                );
                            }

                            // Use regular input for non-editable cells or editable without options
                            return (
                                <input
                                    key={`${rowIdx}-${colIdx}`}
                                    ref={(el) => {
                                        if (!cellRefs.current[rowIdx]) {
                                            cellRefs.current[rowIdx] = [];
                                        }
                                        cellRefs.current[rowIdx][colIdx] = el;
                                    }}
                                    type="text"
                                    value={cell.editable ? (cell.editableValue ?? cell.displayValue) : cell.displayValue}
                                    disabled={!cell.editable}
                                    onChange={(e) => {
                                        if (cell.editable && onCellChange) {
                                            onCellChange(rowIdx, colIdx, e.target.value);
                                        }
                                    }}
                                    onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
                                    className={`${classes.TableCell} ${
                                        cell.editable ? classes.EditableCell : classes.UneditableCell
                                    }`}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Table;
