import { ITempModel } from "../abstractions/temp";

export interface Action<T> {
    type: string;
    name: keyof ITempModel;
    value: T;
}

export const enum ActionTypes {
    CHANGE_PROP = "CHANGE_PROP"
}

export function propertyChanged<T>(name: keyof ITempModel, value: T): Action<T> {
    return { type: ActionTypes.CHANGE_PROP, name: name, value: value };
}