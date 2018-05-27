import * as RIAPP from "jriapp";


export interface IModel {
    value: string;
    title?: string;
}


export interface IActions {
    tempChanged(temp: string);
}

export interface IProps<T> {
    model: T;
    styles: { spacer: any; span: any; };
    actions: IActions;
}
