export interface ISimpleState {
    value: string;
    title?: string;
}

export interface ISimpleActions {
    tempChanged(temp: string);
}

export interface ITempProps<T> {
    model: T;
    styles: { spacer: any; span: any; };
    actions: ISimpleActions;
}