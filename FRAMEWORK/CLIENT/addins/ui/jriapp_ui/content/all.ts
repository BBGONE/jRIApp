/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { DATA_TYPE } from "jriapp_shared/const";
import { LocaleERRS as ERRS, Utils } from "jriapp_shared";
import {
    IApplication, IContentFactory, IContentFactoryList, IContentOptions,
    IContentConstructor, IConstructorContentOptions, TFactoryGetter, IContent
} from "jriapp/shared";
import { bootstrap } from "jriapp/bootstrap";

import { css } from "./int";
import { BasicContent } from "./basic";
import { TemplateContent } from "./template";
import { StringContent } from "./string";
import { MultyLineContent } from "./multyline";
import { BoolContent } from "./bool";
import { NumberContent } from "./number";
import { DateContent } from "./date";
import { DateTimeContent } from "./datetime";
import { LookupContent, initContentFactory as initListBoxContent } from "./listbox";

export { css as contentCSS } from "./int";
export { BasicContent } from "./basic";
export { TemplateContent } from "./template";
export { StringContent } from "./string";
export { MultyLineContent } from "./multyline";
export { BoolContent } from "./bool";
export { NumberContent } from "./number";
export { DateContent } from "./date";
export { DateTimeContent } from "./datetime";
export { LookupContent } from "./listbox";

const utils = Utils, strUtils = utils.str;

class ContentFactory implements IContentFactory {
    private _nextFactory: IContentFactory;

    constructor(nextFactory?: IContentFactory) {
        this._nextFactory = nextFactory;
    }

    getContentType(options: IContentOptions): IContentConstructor {
        if (!!options.templateInfo) {
            return TemplateContent;
        }
        if (!options.bindingInfo) {
            throw new Error(strUtils.format(ERRS.ERR_PARAM_INVALID, "options", "bindingInfo"));
        }

        const fieldInfo = options.fieldInfo;
        let res: IContentConstructor;

        switch (fieldInfo.dataType) {
            case DATA_TYPE.None:
                res = BasicContent;
                break;
            case DATA_TYPE.String:
                if (options.name === "multyline")
                    res = MultyLineContent;
                else
                    res = StringContent;
                break;
            case DATA_TYPE.Bool:
                res = BoolContent;
                break;
            case DATA_TYPE.Integer:
                res = NumberContent;
                break;
            case DATA_TYPE.Decimal:
            case DATA_TYPE.Float:
                res = NumberContent;
                break;
            case DATA_TYPE.DateTime:
            case DATA_TYPE.Time:
                res = DateTimeContent;
                break;
            case DATA_TYPE.Date:
                if (options.name === "datepicker")
                    res = DateContent;
                else
                    res = DateTimeContent;
                break;
            case DATA_TYPE.Guid:
            case DATA_TYPE.Binary:
                res = BasicContent;
                break;
            default:
                throw new Error(strUtils.format(ERRS.ERR_FIELD_DATATYPE, fieldInfo.dataType));
        }

        if (!res) {
            if (!this._nextFactory)
                throw new Error(ERRS.ERR_BINDING_CONTENT_NOT_FOUND);
            else
                return this._nextFactory.getContentType(options);
        }
        else {
            return res;
        }
    }
    createContent(options: IConstructorContentOptions): IContent {
        const contentType = this.getContentType(options.contentOptions);
        return new contentType(options);
    }
    isExternallyCachable(contentType: IContentConstructor): boolean {
        if (!this._nextFactory)
            return false;
        return this._nextFactory.isExternallyCachable(contentType);
    }
}

export function initContentFactory() {
    bootstrap.contentFactory.addFactory((nextFactory?: IContentFactory) => {
        return new ContentFactory(nextFactory);
    });

    initListBoxContent();
}