export interface ITemplatedState {
    rows: object[];
    templateId: string;
    keyName: string;
    selectedRow: any;
}

export interface ITemplatedProps<T> {
    model: T;
}