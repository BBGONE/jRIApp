/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { SysChecks } from "../jriapp_utils/syschecks";
import { ICollectionItem } from "int";
import { BaseCollection } from "base";
import { IListItem } from "list";
import { BaseDictionary } from "dictionary";
import { ValidationError } from "validation";

export * from "int";
export * from "base";
export * from "item";
export * from "aspect";
export * from "list";
export * from "dictionary";
export * from "validation";
export * from "utils";

//REPLACE DUMMY IMPLEMENTATIONS
SysChecks._isCollection = (obj) => { return (!!obj && obj instanceof BaseCollection); };
SysChecks._getItemByProp = (obj: any, prop: string) => {
    if (obj instanceof BaseDictionary) {
        return (<BaseDictionary<IListItem, any>>obj).getItemByKey(prop);
   }
    else if (obj instanceof BaseCollection) {
        (<BaseCollection<ICollectionItem>>obj).getItemByPos(parseInt(prop, 10));
   }
    else
        return null;
};
SysChecks._isValidationError = (obj: any) => {
    return (!!obj && obj instanceof ValidationError);
};








