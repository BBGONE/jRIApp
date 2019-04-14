import { IPagerModel } from "../abstractions/pager";

export interface Action<T> {
    type: string;
    name: keyof IPagerModel;
    value: T;
}

export const enum ActionTypes {
    CHANGE_PROP = "CHANGE_PROP"
}

export function propertyChanged<T>(name: keyof IPagerModel, value: T): Action<T> {
    return { type: ActionTypes.CHANGE_PROP, name: name, value: value };
}