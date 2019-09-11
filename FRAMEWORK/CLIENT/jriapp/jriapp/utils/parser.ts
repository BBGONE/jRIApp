/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { Utils, BRACKETS } from "jriapp_shared";
import { TBindingInfo } from "../int";
import { PARSE_TYPE } from "../parsing/int";
import { Helper } from "../parsing/helper";

const { fastTrim: trim, startsWith, endsWith } = Utils.str,
    { isGetExpr, getBraceContent, getCurlyBraceParts, getGetParts, parseOptions } = Helper;
    

function _appendPart(parts: string[], str: string) {
    if (startsWith(str, "{") && endsWith(str, "}")) {
        const subparts = getCurlyBraceParts(str);
        for (let k = 0; k < subparts.length; k += 1) {
            parts.push(subparts[k]);
        }
    } else {
        parts.push(str);
    }
}

function _getParts(strs: string[]): string[] {
    let parts: string[] = [];

    for (let i = 0; i < strs.length; i += 1) {
        _appendPart(parts, trim(strs[i]));
    }

    return parts;
}

function _parseOptions(parseType: PARSE_TYPE, options: string, dataContext: any): object {
    let parts: string[] = [];

    if (isGetExpr(options)) {
        const ids = getBraceContent(options, BRACKETS.ROUND);
        const args = getGetParts(ids);
        args.forEach((val) => {
            _appendPart(parts, val);
        });
       
        return parseOptions(parseType, parts, dataContext);
    } else {
        _appendPart(parts, options);
        return parseOptions(parseType, parts, dataContext);
    }
}

function _parseOptionsArr(parseType: PARSE_TYPE, strs: string[], dataContext: any): object[] {
    const parts = _getParts(strs);
    return parts.map((part) => _parseOptions(parseType, part, dataContext));
}

export class Parser {
    static parseOptions(options: string): object {
        return _parseOptions(PARSE_TYPE.NONE, options, null);
    }
    static parseBindings(bindings: string[]): TBindingInfo[] {
        let parts: string[] = [];
        bindings.forEach((str) => {
            if (isGetExpr(str)) {
                const ids = getBraceContent(str, BRACKETS.ROUND);
                const args = getGetParts(ids);
                parts = [...parts, ...args];
            } else {
                parts = [...parts, str];
            }
        });
        return <any>_parseOptionsArr(PARSE_TYPE.BINDING, parts, null);
    }
    static parseViewOptions(options: string, dataContext: any): object {
        return _parseOptions(PARSE_TYPE.VIEW, options, dataContext);
    }
}