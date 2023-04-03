import { formatFileSize } from '../../utils/formatFileSize';
import { SheetConfig } from '../types';

const config: SheetConfig = {
    sheetName: 'Files',
    root: 'file',
    columns: [
        { field: 'file_id', header: 'File ID' },
        { field: 'file_name', header: 'File Name' },
        { field: 'file_size', header: 'File Size', transform: value => formatFileSize(value, { output: 'string' }) },
        { field: 'data_category', header: 'Data Category' },
        { field: 'data_type', header: 'Data Type' },
        { field: 'file_format', header: 'File Format' },
        { field: 'sequencing_experiment.experimental_strategy', header: 'Experimental Strategy' },
        { field: 'file_hash', header: 'Hash' },
        { field: 'study.name', header: 'Study Name' },
        { field: 'participants.participant_id', header: 'Participant ID' },
        { field: 'biospecimens.sample_id', header: 'Sample ID' },
        { field: 'biospecimens.biospecimen_id', header: 'Biospecimen ID' },
        { field: 'participants.family_relationships.family_type', header: 'Participant Type' },
        { field: 'participants.family_id', header: 'Family ID' },
        { field: 'participants.submitter_participant_id', header: 'Submitter Participant ID' },
        { field: 'biospecimens.submitter_sample_id', header: 'Submitter Sample ID' },
        { field: 'biospecimens.submitter_biospecimen_id', header: 'Submitter Biospecimen ID' },
        { field: 'sequencing_experiment.bio_informatic_analysis', header: 'Analysis ID' },
    ],
    sort: [{ file_id: { order: 'asc' } }],
};

export default config;
