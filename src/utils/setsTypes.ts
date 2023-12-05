import { Riff } from './riffClient';

export type Sqon = {
    op: string;
    content: any; // Since SQON is generic, it is too complex to define an explicit type for its content.
};

export type Sort = {
    field: string;
    order: string;
};

export type Content = {
    setType: string;
    riffType: string;
    ids: string[];
    sqon: Sqon;
    sort: Sort[];
    idField: string;
};

export type Output = {
    id: string;
    keycloak_id: string;
    content: Content;
    alias: string;
    sharedpublicly: boolean;
    creation_date: Date;
    updated_date: Date;
};

export const mapRiffOutputToUserOutput = (output: Riff): Output => ({
    id: output.id,
    keycloak_id: output.uid,
    content: output.content,
    alias: output.alias,
    sharedpublicly: output.sharedPublicly,
    creation_date: output.creationDate,
    updated_date: output.updatedDate,
});
