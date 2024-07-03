import { Client } from '@elastic/elasticsearch';
import get from 'lodash/get';
import { env } from 'process';

import { executeSearchAfterQuery } from '../../utils/esUtils';
import { SheetConfig } from '../types';

/** this recursive func allow you to find nested array values */
const getValueRecursive = (file, fieldSplitedByDot, i = 0) => {
    const parent = fieldSplitedByDot[i];
    const child = fieldSplitedByDot[i + 1];
    if (Array.isArray(child)) {
        return getValueRecursive(file, fieldSplitedByDot, i + 1);
    }
    return file[parent].map((e) => e[child])?.join(', ');
};

/** generic function to prepare { key: value }[] from a config ES search friendly */
const getInfosByConfig = async (
    es: Client,
    config: SheetConfig,
    ids: string[],
    idField: string,
    esIndex: string,
    extraFields?: string[],
): Promise<{ key: string }[]> => {
    const esRequest = {
        query: { bool: { must: [{ terms: { [idField]: ids, boost: 0 } }] } },
        _source: [...config.columns.map((e) => e.field), ...(extraFields || [])],
        sort: config.sort,
    };
    const sources: any[] = [];
    await executeSearchAfterQuery(es, esIndex, esRequest, {
        onPageFetched: (pageHits) => {
            sources.push(...pageHits);
        },
        onFinish: (total) => {
            console.log(`Finished fetching all pages in getInfosByConfig. Total hits: ${total}`);
        },
        pageSize: Number(env.ES_PAGESIZE),
    });

    return (sources as any).map((source) =>
        config.columns.reduce((data, column) => {
            const field = column.field;
            /** default case example: field = 'file_id' */
            let value = source[field];
            const fieldSplitedByDot = field?.split('.');
            if (fieldSplitedByDot?.length > 1) {
                if (Array.isArray(source[fieldSplitedByDot[0]])) {
                    /** array case example: field = 'participants.participant_id' */
                    value = getValueRecursive(source, fieldSplitedByDot);
                } else {
                    /** nested object case example: field = 'sequencing_experiment.experimental_strategy' */
                    value = get(source, field);
                }
            }
            if (column.transform) {
                value = column.transform(value);
            }

            return { ...data, [`${column.field}${column.fieldExtraSuffix || ''}`]: value };
        }, {}),
    );
};

export default getInfosByConfig;
