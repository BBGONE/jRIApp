/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { Utils, LocaleERRS, IIndexer } from "jriapp_shared";
import { IFieldInfo } from "jriapp_shared/collection/int";
import { FIELD_TYPE } from "jriapp_shared/collection/const";
import { fn_traverseFields, valueUtils } from "jriapp_shared/collection/utils";
import { IRowData, IFieldName, IValueChange, IRowInfo } from "./int";

const utils = Utils, coreUtils = utils.core, strUtils = utils.str, ERRS = LocaleERRS,
    valUtils = valueUtils;

export class RowDataHelper {
    private _fields: IFieldInfo[];
    private _pkFlds: IFieldInfo[];
    private _getStrValue: (val: any, fieldInfo: IFieldInfo) => string;

    constructor(fields: IFieldInfo[], pkFlds: IFieldInfo[], getStrValue: (val: any, fieldInfo: IFieldInfo) => string) {
        this._fields = fields;
        this._pkFlds = pkFlds;
        this._getStrValue = getStrValue;
    }
    private processRowData(rowData: IIndexer<any>, keys: string[], fld: IFieldInfo, name: string, arr: any[]): void {
        const isOK = fld.fieldType === FIELD_TYPE.None || fld.fieldType === FIELD_TYPE.RowTimeStamp || fld.fieldType === FIELD_TYPE.ServerCalculated;
        if (!isOK) {
            return;
        }

        const val = coreUtils.getValue(rowData, name), strval = this._getStrValue(val, fld);

        if (fld.isPrimaryKey > 0) {
            let keyIndex = this._pkFlds.indexOf(fld);
            keys[keyIndex] = strval;
        }
        arr.push(strval);
    }
    processRowsData(data: any[]): IRowData[] {
        const self = this;
        return data.map(function (rowData: IIndexer<any>) {
            const row: IRowData = { k: null, v: [] }, keys: string[] = new Array<string>(this._pkFlds.length);

            fn_traverseFields(self._fields, (fld, fullName, arr) => {
                if (fld.fieldType === FIELD_TYPE.Object) {
                    let res: any[] = [];
                    arr.push(res);
                    return res;
                }
                else {
                    self.processRowData(rowData, keys, fld, fullName, arr);
                    return arr;
                }
            }, row.v);

            row.k = keys.join(";");
            return row;
        });

    }
}
