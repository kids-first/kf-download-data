import { formatFileSize } from '../../utils/formatFileSize';
import { SheetConfig } from '../types';

type BiospecimenData = { family?: { family_id?: string }; sample_id?: string; external_sample_id?: string };
type ParticipantsData = {
    biospecimens: BiospecimenData[];
}[];
const processBiospecimens = (participants: ParticipantsData, key: keyof BiospecimenData): string[] =>
    (participants || [])
        .map(x => x?.biospecimens || [])
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        .flat()
        .map(x => (key === 'family' ? x?.family?.family_id : x[key]))
        .filter(x => !!x);

const config: SheetConfig = {
    sheetName: 'Files',
    root: 'file',
    columns: [
        { field: 'access_urls', header: 'Access URL' },
        { field: 'study.data_category', header: 'Data Category' },
        { field: 'data_type', header: 'Data Type' },
        { field: 'sequencing_experiment.experiment_strategy', header: 'Experimental Strategy' },
        //TODO not implemented  { field: '--', header: 'External Collection ID' },
        //TODO not implemented   { field: '--', header: 'External Participant ID' },
        {
            field: 'participants',
            header: 'External Sample ID',
            transform: participants => processBiospecimens(participants, 'external_sample_id'),
        },
        {
            field: 'participants',
            header: 'Family ID',
            transform: participants => processBiospecimens(participants, 'family'),
        },
        { field: 'file_format', header: 'File Format' },
        {
            field: 'file_id',
            header: 'File ID',
        },
        { field: 'file_name', header: 'File Name' },
        { field: 'size', header: 'File Size', transform: value => formatFileSize(value, { output: 'string' }) },
        { field: 'hashes.md5', header: 'Hash' },
        { field: 'participants.participant_id', header: 'Participant ID' },
        { field: 'participants', header: 'Proband', transform: xs => xs.map(x => (x ? 'Yes' : 'No')).join(',') },
        {
            field: 'participants',
            header: 'Sample ID',
            transform: participants => processBiospecimens(participants, 'sample_id'),
        },
        { field: 'study.study_name', header: 'Study Name' },
    ],
    sort: [{ file_id: { order: 'asc' } }],
};

export default config;
