import { save, open } from '@tauri-apps/plugin-dialog';
import { writeTextFile, readTextFile } from '@tauri-apps/plugin-fs';
import { invoke } from '@tauri-apps/api/core';
import { ExportedProblem } from '../../types/export_import';

export const exportProblemById = async (id: number) => {
    try {
        const data = await invoke<ExportedProblem>('export_problem', { id });
        const json = JSON.stringify(data, null, 2);
        
        const path = await save({
            filters: [{
                name: 'Fuzzy DB Problem',
                extensions: ['json']
            }]
        });
        
        if (path) {
            await writeTextFile(path, json);
            return true;
        }
        return false;
    } catch (e) {
        console.error("Export failed:", e);
        throw e;
    }
}

export const importProblemToParent = async (parentId: number | null, onFinish?: () => void) => {
     try {
        const result = await open({
            filters: [{
                name: 'Fuzzy DB Problem',
                extensions: ['json']
            }],
            multiple: false
        });
        
        if (result) {
            const filePath = result as string; // multiple: false returns string | null (in recent versions, or just string)
            // Note: Types might imply string | string[] depending on version. Casting safely.
            
            const text = await readTextFile(filePath);
            const data = JSON.parse(text) as ExportedProblem;
            
            await invoke('import_problem', { parentId, data });
            if (onFinish) onFinish();
            return true;
        }
        return false;
     } catch (e) {
         console.error("Import failed:", e);
         throw e;
     }
}
