import { DATA_TYPE } from "../jriapp_core/const";
import { IApplication, IContentFactory, IContentFactoryList, IContentOptions, IContentConstructor,
    IConstructorContentOptions, TFactoryGetter, IContent }  from "../jriapp_core/shared";
import { ERRS } from "../jriapp_core/lang";
import { Utils as utils } from "../jriapp_utils/utils";
import { bootstrap } from "../jriapp_core/bootstrap";

import { css } from "./int";
import { BasicContent } from "./basic";
import { TemplateContent } from "./template";
import { StringContent } from "./string";
import { MultyLineContent } from "./multyline";
import { BoolContent } from "./bool";
import { NumberContent } from "./number";
import { DateContent } from "./date";
import { DateTimeContent } from "./datetime";

export { css as contentCSS } from "./int";
export { BasicContent } from "./basic";
export { TemplateContent } from "./template";
export { StringContent } from "./string";
export { MultyLineContent } from "./multyline";
export { BoolContent } from "./bool";
export { NumberContent } from "./number";
export { DateContent } from "./date";
export { DateTimeContent } from "./datetime";

const strUtils = utils.str;

//the base content factory
//It is always the last in the chain of factories
export class ContentFactory implements IContentFactory {
    constructor() {
    }
    getContentType(options: IContentOptions): IContentConstructor {
        if (!!options.templateInfo) {
            return TemplateContent;
        }
        if (!options.bindingInfo) {
            throw new Error(strUtils.format(ERRS.ERR_PARAM_INVALID, "options", "bindingInfo"));
        }

        let fieldInfo = options.fieldInfo, res: IContentConstructor;
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

        if (!res)
            throw new Error(ERRS.ERR_BINDING_CONTENT_NOT_FOUND);
        return res;
    }
    createContent(options: IConstructorContentOptions): IContent {
        let contentType = this.getContentType(options.contentOptions);
        return new contentType(options);
    }
    isExternallyCachable(contentType: IContentConstructor): boolean {
        return false;
    }
}

export class FactoryList implements IContentFactoryList {
    private _factory: IContentFactory;

    constructor() {
        this._factory = new ContentFactory();
    }
    addFactory(factoryGetter: TFactoryGetter) {
        this._factory = factoryGetter(this._factory);
    }
    getContentType(options: IContentOptions): IContentConstructor {
        return this._factory.getContentType(options);
    }
    createContent(options: IConstructorContentOptions): IContent {
        return this._factory.createContent(options);
    }
    isExternallyCachable(contentType: IContentConstructor): boolean {
        return this._factory.isExternallyCachable(contentType);
    }
}

export const contentFactories = new FactoryList();