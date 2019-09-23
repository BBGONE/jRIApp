import { ISimpleState } from "../abstractions/simple";

export interface Action<T> {
    type: string;
    name: keyof ISimpleState;
    value: T;
}

export const enum ActionTypes {
    CHANGE_PROP = "CHANGE_PROP"
}

export function propertyChanged<T>(name: keyof ISimpleState, value: T): Action<T> {
    return { type: ActionTypes.CHANGE_PROP, name: name, value: value };
}