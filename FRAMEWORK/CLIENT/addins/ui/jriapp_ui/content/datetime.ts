/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    DATA_TYPE
} from "jriapp_shared/const";
import { IBaseObject } from "jriapp_shared";
import { IApplication, IBindingInfo, IBindingOptions }  from "jriapp/shared";
import { bootstrap } from "jriapp/bootstrap";

import { css } from "./int";
import { BasicContent } from "./basic";

export class DateTimeContent extends BasicContent {
    protected getBindingOption(bindingInfo: IBindingInfo, tgt: IBaseObject, dctx: any, targetPath: string) {
        let options = super.getBindingOption(bindingInfo, tgt, dctx, targetPath);
        options.converter = this.app.getConverter("dateTimeConverter");
        const finf = this.getFieldInfo(), defaults = bootstrap.defaults;
        switch (finf.dataType) {
            case DATA_TYPE.DateTime:
                options.converterParam = defaults.dateTimeFormat;
                break;
            case DATA_TYPE.Date:
                options.converterParam = defaults.dateFormat;
                break;
            case DATA_TYPE.Time:
                options.converterParam = defaults.timeFormat;
                break;
            default:
                options.converterParam = null;
                break;
        }
        return options;
    }
    toString() {
        return "DateTimeContent";
    }
}