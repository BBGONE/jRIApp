/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { DATA_TYPE } from "jriapp_shared/collection/const";
import { IBaseObject } from "jriapp_shared";
import { IBindingInfo, IBindingOptions }  from "jriapp/int";
import { bootstrap } from "jriapp/bootstrap";

import { BasicContent } from "./basic";

export class DateTimeContent extends BasicContent {
    protected getBindingOption(bindingInfo: IBindingInfo, tgt: IBaseObject, dctx: any, targetPath: string): IBindingOptions {
        const options = super.getBindingOption(bindingInfo, tgt, dctx, targetPath);
        options.converter = this.app.getConverter("dateTimeConverter");
        const finf = this.getFieldInfo(), defaults = bootstrap.defaults;
        switch (finf.dataType) {
            case DATA_TYPE.DateTime:
                options.param = defaults.dateTimeFormat;
                break;
            case DATA_TYPE.Date:
                options.param = defaults.dateFormat;
                break;
            case DATA_TYPE.Time:
                options.param = defaults.timeFormat;
                break;
            default:
                options.param = null;
                break;
        }
        return options;
    }
    toString() {
        return "DateTimeContent";
    }
}
