import React, { useState, useEffect, useCallback } from 'react';
import Table, { TableCellValue } from '../../components/Table/Table';
import { InputParameterResponse } from '../../types/input_parameter';
import { OutputParameterResponse } from '../../types/output_parameter';
import { OutputValueResponse } from '../../types/output_value';
import { updateOutputValueById } from '../../api/output_value/updateOutputValueById';
import { getOutputValuesByProblemId } from '../../api/output_value/getOutputValuesByProblemId';
import { createOutputValue } from '../../api/output_value/createOutputValue';
import classes from './RulesTable.module.css';

type RulesTableProps = {
    problemId: number;
    inputParameters: InputParameterResponse[];
    outputParameters: OutputParameterResponse[];
};

// Generate all combinations of input values
function generateCombinations<T>(arrays: T[][]): T[][] {
    if (arrays.length === 0) return [[]];
    if (arrays.length === 1) return arrays[0].map(item => [item]);
    
    const result: T[][] = [];
    const rest = generateCombinations(arrays.slice(1));
    
    for (const item of arrays[0]) {
        for (const combination of rest) {
            result.push([item, ...combination]);
        }
    }
    
    return result;
}

const RulesTable: React.FC<RulesTableProps> = ({ problemId, inputParameters, outputParameters }) => {
    const [outputValues, setOutputValues] = useState<OutputValueResponse[]>([]);
    const [tableRows, setTableRows] = useState<TableCellValue[][]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load output values from backend
    const loadOutputValues = useCallback(async () => {
        try {
            setIsLoading(true);
            const values = await getOutputValuesByProblemId(problemId);
            setOutputValues(values);
        } catch (error) {
            console.error('Failed to load output values:', error);
        } finally {
            setIsLoading(false);
        }
    }, [problemId]);

    useEffect(() => {
        loadOutputValues();
    }, [loadOutputValues]);

    // Build table structure
    useEffect(() => {
        if (inputParameters.length === 0 || outputParameters.length === 0) {
            setTableRows([]);
            return;
        }

        // Filter input parameters that have values
        const parametersWithValues = inputParameters.filter(p => p.input_values.length > 0);
        
        if (parametersWithValues.length === 0) {
            setTableRows([]);
            return;
        }

        // Generate header row
        const headerRow: TableCellValue[] = [
            ...parametersWithValues.map(p => ({
                displayValue: p.name,
                editable: false,
            })),
            ...outputParameters.map(p => ({
                displayValue: p.name,
                editable: false,
            })),
        ];

        // Generate all combinations of input values
        const inputValueArrays = parametersWithValues.map(p => p.input_values);
        const combinations = generateCombinations(inputValueArrays);

        // Build data rows
        const dataRows: TableCellValue[][] = combinations.map(combination => {
            const row: TableCellValue[] = [];

            // Add input value cells (non-editable, show term names)
            combination.forEach(inputValue => {
                row.push({
                    displayValue: inputValue.value,
                    editable: false,
                    metadata: { inputValueId: inputValue.id },
                });
            });

            // Add output value cells (editable, show selected fuzzy output value)
            outputParameters.forEach(outputParam => {
                // Create hash for this combination
                const sortedIds = combination
                    .map(iv => iv.id)
                    .sort((a, b) => a - b);
                const inputValueIdsHash = sortedIds.reduce((acc, id) => acc + `|${id}|`, '');

                // Find existing output value
                const existingOutputValue = outputValues.find(
                    ov =>
                        ov.output_parameter_id === outputParam.id &&
                        ov.input_value_ids === inputValueIdsHash
                );

                // Find the corresponding fuzzy output value term
                let displayValue = '';
                if (existingOutputValue?.fuzzy_output_value_id) {
                    const fuzzyValue = outputParam.fuzzy_output_values.find(
                        fv => fv.id === existingOutputValue.fuzzy_output_value_id
                    );
                    displayValue = fuzzyValue?.value || '';
                }

                row.push({
                    displayValue,
                    editableValue: displayValue,
                    editable: true,
                    options: outputParam.fuzzy_output_values.map(fv => fv.value),
                    metadata: {
                        outputParameterId: outputParam.id,
                        inputValueIdsHash,
                        outputValueId: existingOutputValue?.id,
                        fuzzyOutputValues: outputParam.fuzzy_output_values,
                    },
                });
            });

            return row;
        });

        setTableRows([headerRow, ...dataRows]);
    }, [inputParameters, outputParameters, outputValues]);

    const handleCellChange = useCallback(
        async (rowIdx: number, colIdx: number, value: string) => {
            if (rowIdx === 0) return; // Header row is not editable

            const cell = tableRows[rowIdx][colIdx];
            if (!cell.editable || !cell.metadata) return;

            const { outputParameterId, inputValueIdsHash, outputValueId, fuzzyOutputValues } = cell.metadata;

            // Find the fuzzy output value by name (value entered by user)
            const fuzzyValue = fuzzyOutputValues.find((fv: any) => fv.value === value);
            const fuzzyOutputValueId = fuzzyValue?.id || null;

            try {
                if (outputValueId) {
                    // Update existing output value
                    await updateOutputValueById(outputValueId, fuzzyOutputValueId);
                } else {
                    // Create new output value
                    await createOutputValue(outputParameterId, inputValueIdsHash, (newId) => {
                        // After creation, update it with the selected fuzzy output value
                        updateOutputValueById(newId, fuzzyOutputValueId);
                    });
                }

                // Reload output values
                await loadOutputValues();
            } catch (error) {
                console.error('Failed to update rule:', error);
            }
        },
        [tableRows, loadOutputValues]
    );

    if (isLoading) {
        return <div className={classes.EmptyState}>Загрузка правил...</div>;
    }

    if (inputParameters.length === 0 || outputParameters.length === 0) {
        return (
            <div className={classes.EmptyState}>
                Добавьте входные и выходные параметры с термами для создания правил
            </div>
        );
    }

    if (inputParameters.every(p => p.input_values.length === 0)) {
        return (
            <div className={classes.EmptyState}>
                Добавьте термы для входных параметров
            </div>
        );
    }

    return (
        <div className={classes.RulesTableContainer}>
            <Table rows={tableRows} onCellChange={handleCellChange} />
        </div>
    );
};

export default RulesTable;
