export interface PropChangedAction<T = any, S = any> {
    type: string;
    name: keyof S;
    value: T;
}

export const enum CommonActionTypes {
    CHANGE_PROP = "CHANGE_PROP"
}

export function propertyChanged<T, S>(name: keyof S, value: T): PropChangedAction<T, S> {
    return { type: CommonActionTypes.CHANGE_PROP, name: name, value: value };
}
