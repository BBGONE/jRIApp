/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { DATA_TYPE } from "jriapp_shared/const";
import { LocaleERRS as ERRS, Utils } from "jriapp_shared";
import {
    IContentFactory, IContentFactoryList, IContentOptions,
    IContentConstructor, IConstructorContentOptions, TFactoryGetter, IContent
} from "jriapp/shared";
import { BasicContent } from "./basic";
import { TemplateContent } from "./template";
import { StringContent } from "./string";
import { MultyLineContent } from "./multyline";
import { BoolContent } from "./bool";
import { NumberContent } from "./number";
import { DateContent } from "./date";
import { DateTimeContent } from "./datetime";
import { LookupContent } from "./listbox";

import { bootstrap } from "jriapp/bootstrap";

const utils = Utils, strUtils = utils.str;
let factoryInstance: IContentFactory;

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

        if (options.name === "lookup") {
            return LookupContent;
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
    isExternallyCachable(contentType: IContentConstructor): boolean {
        if (LookupContent === contentType)
            return true;
        if (!this._nextFactory)
            return false;
        return this._nextFactory.isExternallyCachable(contentType);
    }
}

export function initContentFactory() {
    if (!factoryInstance)
    {
        factoryInstance = new ContentFactory();
        bootstrap.contentFactory.addFactory((nextFactory?: IContentFactory) => {
            return factoryInstance;
        });
    }
}