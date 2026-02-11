import React, { useRef, useEffect, useLayoutEffect, useState, useCallback } from 'react';
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
    showRowNumbers?: boolean; // Show row numbers column
};

const DEFAULT_COLUMN_WIDTH = 300; // Увеличено в 2 раза (было 150)
const ROW_NUMBER_COLUMN_WIDTH = 50;

const Table: React.FC<TableProps> = ({ rows, onCellChange, className, showRowNumbers = false }) => {
    const cellRefs = useRef<(HTMLSelectElement | HTMLInputElement | null)[][]>([]);
    const [columnWidths, setColumnWidths] = useState<number[]>([]);
    const [resizingColumn, setResizingColumn] = useState<number | null>(null);
    const resizeStateRef = useRef<{ startX: number; startWidth: number; column: number | null }>({
        startX: 0,
        startWidth: 0,
        column: null
    });
    const tableRef = useRef<HTMLDivElement>(null);
    const savedScrollRef = useRef<{ top: number; left: number } | null>(null);

    // Save scroll position before rows change
    useEffect(() => {
        if (tableRef.current) {
            savedScrollRef.current = {
                top: tableRef.current.scrollTop,
                left: tableRef.current.scrollLeft
            };
        }
    });

    // Restore scroll position after render
    useLayoutEffect(() => {
        if (tableRef.current && savedScrollRef.current) {
            tableRef.current.scrollTop = savedScrollRef.current.top;
            tableRef.current.scrollLeft = savedScrollRef.current.left;
        }
    }, [rows]);

    // Initialize column widths
    useEffect(() => {
        if (rows.length > 0) {
            const numColumns = rows[0].length;
            setColumnWidths(new Array(numColumns).fill(DEFAULT_COLUMN_WIDTH));
        }
    }, [rows.length > 0 ? rows[0].length : 0]);

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

    // Start column resize
    const handleMouseDownResize = useCallback((e: React.MouseEvent, colIdx: number) => {
        e.preventDefault();
        e.stopPropagation();
        const startWidth = columnWidths[colIdx] || DEFAULT_COLUMN_WIDTH;
        resizeStateRef.current = {
            column: colIdx,
            startX: e.clientX,
            startWidth: startWidth
        };
        
        console.log('MouseDown: Starting resize for column', colIdx);
        
        const handleMouseMove = (e: MouseEvent) => {
            const { column, startX, startWidth } = resizeStateRef.current;
            if (column === null) return;
            
            // КРИТИЧЕСКИ ВАЖНО: проверяем, нажата ли кнопка мыши
            // Если buttons === 0, значит кнопка отпущена, но событие mouseup не дошло
            if (e.buttons === 0) {
                console.log('MouseMove detected button release (buttons=0)');
                cleanup();
                return;
            }
            
            // Проверяем, не вышел ли курсор за пределы окна
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            if (e.clientX < 0 || e.clientX > windowWidth || e.clientY < 0 || e.clientY > windowHeight) {
                console.log('Mouse left window bounds');
                // Сразу сбрасываем курсор перед cleanup
                document.body.style.cursor = '';
                cleanup();
                return;
            }
            
            const diff = e.clientX - startX;
            const newWidth = Math.max(50, startWidth + diff);
            setColumnWidths(prev => {
                const newWidths = [...prev];
                newWidths[column] = newWidth;
                return newWidths;
            });
        };

        const cleanup = () => {
            console.log('Cleanup called!');
            
            // Удаляем все обработчики
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('keydown', handleEscape);
            
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            
            resizeStateRef.current = { column: null, startX: 0, startWidth: 0 };
            setResizingColumn(null);
        };

        const handleMouseUp = () => {
            console.log('Mouse up detected!');
            cleanup();
        };

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                console.log('Escape pressed');
                cleanup();
            }
        };

        // Добавляем обработчики на document БЕЗ capture
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('keydown', handleEscape);
        
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        
        console.log('Mouse handlers added');
        
        setResizingColumn(colIdx);
    }, [columnWidths]);

    // Cleanup на случай размонтирования компонента во время resize
    useEffect(() => {
        return () => {
            if (resizingColumn !== null) {
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        };
    }, [resizingColumn]);

    // Cleanup на случай размонтирования компонента во время resize
    useEffect(() => {
        return () => {
            if (resizingColumn !== null) {
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        };
    }, [resizingColumn]);

    // Auto-fit column width on double-click
    const handleDoubleClickHeader = useCallback((colIdx: number) => {
        // Measure max content width in this column
        let maxWidth = 0;
        rows.forEach(row => {
            const cell = row[colIdx];
            if (cell) {
                const text = String(cell.displayValue);
                // Approximate width: each character is ~8px + padding
                const estimatedWidth = text.length * 8 + 40; // 40px for padding
                maxWidth = Math.max(maxWidth, estimatedWidth);
            }
        });

        // Set minimum and maximum bounds
        const newWidth = Math.max(100, Math.min(maxWidth, 600));
        setColumnWidths(prev => {
            const newWidths = [...prev];
            newWidths[colIdx] = newWidth;
            return newWidths;
        });
    }, [rows]);

    return (
        <div className={`${classes.TableWrapper} ${className || ''}`} ref={tableRef}>
            <div className={classes.Table}>
                {rows.map((row, rowIdx) => (
                    <div key={rowIdx} className={classes.TableRow}>
                        {/* Row number column */}
                        {showRowNumbers && (
                            <div 
                                className={`${classes.CellContainer} ${classes.RowNumberCell}`}
                                style={{
                                    width: `${ROW_NUMBER_COLUMN_WIDTH}px`,
                                    minWidth: `${ROW_NUMBER_COLUMN_WIDTH}px`,
                                    maxWidth: `${ROW_NUMBER_COLUMN_WIDTH}px`
                                }}
                            >
                                <div className={`${classes.TableCell} ${classes.UneditableCell} ${classes.RowNumber}`}>
                                    {rowIdx === 0 ? '#' : rowIdx}
                                </div>
                            </div>
                        )}
                        {row.map((cell, colIdx) => {
                            const cellWidth = columnWidths[colIdx] || DEFAULT_COLUMN_WIDTH;
                            const cellStyle = {
                                width: `${cellWidth}px`,
                                minWidth: `${cellWidth}px`,
                                maxWidth: `${cellWidth}px`
                            };

                            // Add resize handle to header cells (first row)
                            const isHeader = rowIdx === 0;

                            // Use select dropdown if options are available and cell is editable
                            if (cell.editable && cell.options && cell.options.length > 0) {
                                return (
                                    <div key={`${rowIdx}-${colIdx}`} className={classes.CellContainer} style={cellStyle}>
                                        <select
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
                                            style={{ width: '100%' }}
                                        >
                                            <option value="">-- Выберите --</option>
                                            {cell.options.map((option, idx) => (
                                                <option key={idx} value={option}>
                                                    {option}
                                                </option>
                                            ))}
                                        </select>
                                        {isHeader && (
                                            <div
                                                className={classes.ResizeHandle}
                                                onMouseDown={(e) => handleMouseDownResize(e, colIdx)}
                                                onDoubleClick={() => handleDoubleClickHeader(colIdx)}
                                            />
                                        )}
                                    </div>
                                );
                            }

                            // Use regular input for non-editable cells or editable without options
                            return (
                                <div key={`${rowIdx}-${colIdx}`} className={classes.CellContainer} style={cellStyle}>
                                    <input
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
                                        className={`${classes.TableCell} ${cell.editable ? classes.EditableCell : classes.UneditableCell
                                            }`}
                                        style={{ width: '100%' }}
                                    />
                                    {isHeader && (
                                        <div
                                            className={classes.ResizeHandle}
                                            onMouseDown={(e) => handleMouseDownResize(e, colIdx)}
                                            onDoubleClick={() => handleDoubleClickHeader(colIdx)}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Table;
