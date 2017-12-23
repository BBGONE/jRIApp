import * as RIAPP from "jriapp";

export interface IProps<T extends RIAPP.IBaseObject> {
    model: T;
}

export interface IReactView extends RIAPP.IBaseObject {
    value: string;
}