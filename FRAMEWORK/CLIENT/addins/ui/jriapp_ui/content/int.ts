﻿/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import {
    Utils
} from "jriapp_shared";
import {
    IContentOptions, ITemplateInfo, IBindingInfo
} from "jriapp/int";
import {
    Parser
} from "jriapp/utils/parser";

const utils = Utils, coreUtils = utils.core, checks = utils.check, parser = Parser;

export const enum css {
    content = "ria-content-field",
    required = "ria-required-field",
    checkbox = "ria-checkbox"
}

// the result of parsing of the data-content attribute
export interface IDataContentAttr {
    fieldName?: string;
    readOnly?: boolean;
    css?: { displayCss: string; editCss: string; };
    template?: ITemplateInfo;
    name?: string;
    options?: any;
}

export function parseContentAttr(contentAttr: string): IContentOptions {
    const contentOptions: IContentOptions = {
        name: null,
        templateInfo: null,
        bindingInfo: null,
        displayInfo: null,
        fieldName: null,
        options: null
    };


    const tempOpts = parser.parseOptions(contentAttr);

    if (tempOpts.length === 0) {
        return contentOptions;
    }
    const attr: IDataContentAttr = tempOpts[0];
    if (!attr.template && !!attr.fieldName) {
        const bindInfo: IBindingInfo = {
            target: null,
            source: null,
            targetPath: null,
            sourcePath: attr.fieldName,
            mode: "OneWay",
            converter: null,
            param: null,
            isEval: false
        };

        contentOptions.bindingInfo = bindInfo;
        contentOptions.displayInfo = attr.css;
        contentOptions.fieldName = attr.fieldName;
        if (!!attr.name) {
            contentOptions.name = attr.name;
        }
        if (!!attr.options) {
            contentOptions.options = attr.options;
        }
        if (attr.readOnly !== checks.undefined) {
            contentOptions.readOnly = coreUtils.parseBool(attr.readOnly);
        }
    } else if (!!attr.template) {
        contentOptions.templateInfo = attr.template;
        delete attr.template;
    }
    return contentOptions;
}
