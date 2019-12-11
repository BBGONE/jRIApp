/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { LocaleERRS as ERRS, Utils } from "jriapp_shared";
import { IConstructorContentOptions, IConverter } from "jriapp/int";
import { BasicContent } from "./basic";

const utils = Utils, { format } = utils.str;

const NAME = "datepicker";

export class DateContent extends BasicContent {
    constructor(options: IConstructorContentOptions) {
        if (options.contentOptions.name !== NAME) {
            throw new Error(format(ERRS.ERR_ASSERTION_FAILED, `contentOptions.name === '${NAME}'`));
        }
        super(options);
    }
    // override
    protected getConverter(isEdit: boolean): IConverter {
        return this.app.getConverter("dateConverter");
    }
    protected getViewName(isEdit: boolean): string {
        return isEdit ? NAME : null;
    }
    toString(): string {
        return "DateContent";
    }
}
