import { DATA_TYPE } from "../jriapp_core/const";
import { IApplication, IBindingInfo, IBaseObject, IBindingOptions }  from "../jriapp_core/shared";
import { bootstrap } from "../jriapp_core/bootstrap";

import { css } from "./int";
import { BasicContent } from "./basic";

export class DateTimeContent extends BasicContent {
    protected getBindingOption(bindingInfo: IBindingInfo, tgt: IBaseObject, dctx: any, targetPath: string) {
        let options = super.getBindingOption(bindingInfo, tgt, dctx, targetPath);
        options.converter = this.app.getConverter("dateTimeConverter");
        let finf = this.getFieldInfo(), defaults = bootstrap.defaults;
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