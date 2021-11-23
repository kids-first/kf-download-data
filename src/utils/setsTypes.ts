export type Sqon = {
    op: string;
    content: any; // Since SQON is generic, it is too complex to define an explicit type for its content.
};

export type Sort = {
    field: string;
    order: string;
};
