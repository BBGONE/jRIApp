/*
The MIT License (MIT)

Copyright(c) 2016 Maxim V.Tsapov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and / or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
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








