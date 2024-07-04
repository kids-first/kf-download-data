import fs from 'fs';

import { SheetConfig } from '../types';

const generateTsvReport = (data: { key: string }[], path: string, config: SheetConfig): void => {
    let tsvContent = config.columns.map((c) => c.header).join('\t') + '\n';

    for (const row of data) {
        const values = config.columns.map((c) => row[`${c.field}${c.fieldExtraSuffix || ''}`]);
        tsvContent += values.join('\t') + '\n';
    }

    fs.writeFileSync(path, tsvContent);
};

export default generateTsvReport;
