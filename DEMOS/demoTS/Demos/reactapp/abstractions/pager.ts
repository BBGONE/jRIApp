export interface IPagerModel {
    total: number;
    current: number;
    visiblePages: number;
}

export interface IPagerActions {
    onPageChanged(newPage: number);
}

export interface IPagerProps<T> {
    model: T;
    actions: IPagerActions;
}