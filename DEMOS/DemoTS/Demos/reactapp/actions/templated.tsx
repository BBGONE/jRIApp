import { ITemplatedState } from "../abstractions/templated";

export interface Action<T> {
    type: string;
    name: keyof ITemplatedState;
    value: T;
}

export const enum ActionTypes {
    CHANGE_PROP = "CHANGE_PROP"
}

export function propertyChanged<T>(name: keyof ITemplatedState, value: T): Action<T> {
    return { type: ActionTypes.CHANGE_PROP, name: name, value: value };
}