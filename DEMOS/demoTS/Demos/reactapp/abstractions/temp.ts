export interface ITempModel {
    value: string;
    title?: string;
}

export interface ITempActions {
    tempChanged(temp: string);
}

export interface ITempProps<T> {
    model: T;
    styles: { spacer: any; span: any; };
    actions: ITempActions;
}