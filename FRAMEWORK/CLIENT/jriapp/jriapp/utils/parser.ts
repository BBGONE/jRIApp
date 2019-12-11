/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { Utils, BRACKETS } from "jriapp_shared";
import { TBindingInfo } from "../int";
import { PARSE_TYPE } from "../parsing/int";
import { Helper } from "../parsing/helper";

const { fastTrim: trim, startsWith, endsWith } = Utils.str,
    { isGetExpr, getBraceContent, getCurlyBraceParts, getGetParts, parseOptions, parseOption } = Helper;
    

function _appendPart(parts: string[], str: string) {
    if (startsWith(str, "{") && endsWith(str, "}")) {
        const subparts = getCurlyBraceParts(str);
        for (let k = 0; k < subparts.length; k += 1) {
            parts.push(trim(subparts[k]));
        }
    } else {
        parts.push(str);
    }
}

function _splitIntoParts(str: string): string[] {
    let parts: string[] = [];

    if (isGetExpr(str)) {
        const ids = getBraceContent(str, BRACKETS.ROUND);
        const args = getGetParts(ids);
        args.forEach((val) => {
            _appendPart(parts, trim(val));
        });
    } else {
        _appendPart(parts, trim(str));
    }

    return parts;
}

function _parseOptions(parseType: PARSE_TYPE, options: string, dataContext: any): object {
    const parts: string[] = _splitIntoParts(options);
    return parseOptions(parseType, parts, dataContext);
}

function _parseBindings(parseType: PARSE_TYPE, bindings: string[], dataContext: any): object[] {
    return bindings.map((str) => parseOption(parseType, str, dataContext));
}

export class Parser {
    static parseOptions(options: string): object {
        return _parseOptions(PARSE_TYPE.NONE, options, null);
    }
    static parseBindings(bindings: string[]): TBindingInfo[] {
        let parts: string[] = [];
        bindings.forEach((str) => {
            const arr = _splitIntoParts(str);
            for (let i = 0; i < arr.length; ++i){
                parts.push(arr[i]);
            }
        });
        return <any>_parseBindings(PARSE_TYPE.BINDING, parts, null);
    }
    static parseViewOptions(options: string, dataContext: any): object {
        return _parseOptions(PARSE_TYPE.VIEW, options, dataContext);
    }
}