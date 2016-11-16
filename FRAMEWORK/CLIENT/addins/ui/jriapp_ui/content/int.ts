/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    Utils, parser
} from "jriapp_shared";
import {
    IContentOptions, ITemplateInfo, IBindingInfo
} from "jriapp/shared";

const utils = Utils, coreUtils = utils.core, checks = utils.check, parse = parser;

export const css = {
    content: "ria-content-field",
    required: "ria-required-field",
    checkbox: "ria-checkbox"
};

//the result of parsing of the data-content attribute
export interface IDataContentAttr {
    fieldName?: string;
    readOnly?: boolean;
    css?: { displayCss: string; editCss: string; };
    template?: ITemplateInfo;
    name?: string;
    options?: any;
}

export function parseContentAttr(content_attr: string): IContentOptions {
    let contentOptions: IContentOptions = {
        name: null,
        templateInfo: null,
        bindingInfo: null,
        displayInfo: null,
        fieldName: null,
        options: null
    };

    let attr: IDataContentAttr, temp_opts = parse.parseOptions(content_attr);

    if (temp_opts.length === 0)
        return contentOptions;
    attr = temp_opts[0];
    if (!attr.template && !!attr.fieldName) {
        let bindInfo: IBindingInfo = {
            target: null, source: null,
            targetPath: null, sourcePath: attr.fieldName,
            mode: "OneWay",
            converter: null, converterParam: null
        };

        contentOptions.bindingInfo = bindInfo;
        contentOptions.displayInfo = attr.css;
        contentOptions.fieldName = attr.fieldName;
        if (!!attr.name)
            contentOptions.name = attr.name;
        if (!!attr.options)
            contentOptions.options = attr.options;
        if (attr.readOnly !== checks.undefined)
            contentOptions.readOnly = coreUtils.parseBool(attr.readOnly);
    }
    else if (!!attr.template) {
        contentOptions.templateInfo = attr.template;
        delete attr.template;
    }
    return contentOptions;
}