import * as RIAPP from "jriapp";

// temperature

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

// pager

export interface IPagerModel {
    total: number;
    current: number;
    visiblePage: number;
}

export interface IPagerActions {
    pageChanged(newPage: number);
}

export interface IPagerProps<T> {
    model: T;
    actions: IPagerActions;
}

export interface IPagerState {
    current: number;
}