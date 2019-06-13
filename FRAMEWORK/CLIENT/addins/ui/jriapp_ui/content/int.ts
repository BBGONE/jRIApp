/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import {
    Utils
} from "jriapp_shared";
import {
    IContentOptions, ITemplateInfo
} from "jriapp/int";
import {
    Parser
} from "jriapp/utils/parser";

const utils = Utils, { parseBool } = utils.core, { _undefined } = utils.check, parser = Parser;

// the result of parsing of the data-content attribute
export interface IDataContentAttr {
    fieldName?: string;
    readOnly?: boolean;
    css?: { readCss: string; editCss: string; };
    template?: ITemplateInfo;
    name?: string;
    options?: any;
}

export function parseContentAttr(contentAttr: string): IContentOptions {
    const contentOptions: IContentOptions = {
        name: null,
        readOnly: false,
        initContentFn: null,
        fieldInfo: null,
        css: null,
        template: null,
        fieldName: null,
        options: null
    };


    const tempOpts = parser.parseOptions(contentAttr);

    if (tempOpts.length === 0) {
        return contentOptions;
    }
    const attr: IDataContentAttr = tempOpts[0];
    if (!attr.template && !!attr.fieldName) {
        contentOptions.css = attr.css;
        contentOptions.fieldName = attr.fieldName;
        if (!!attr.name) {
            contentOptions.name = attr.name;
        }
        if (!!attr.options) {
            contentOptions.options = attr.options;
        }
        if (attr.readOnly !== _undefined) {
            contentOptions.readOnly = parseBool(attr.readOnly);
        }
    } else if (!!attr.template) {
        contentOptions.template = attr.template;
        contentOptions.css = attr.css;
        if (attr.readOnly !== _undefined) {
            contentOptions.readOnly = parseBool(attr.readOnly);
        }
    }
    return contentOptions;
}
