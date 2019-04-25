/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { Utils, BRACKETS, LocaleERRS as ERRS, DateUtils, TIME_RANGE } from "jriapp_shared";
import { TBindingInfo } from "../int";

import { bootstrap } from "../bootstrap";

const { isNumeric, isBoolString, _undefined, isString } = Utils.check,
    { format, fastTrim: trim, startsWith, endsWith, trimQuotes } = Utils.str,
    { parseBool } = Utils.core, dates = DateUtils, { resolvePath, getBraceLen } = Utils.sys;

const getRX = /^get[(].+[)]$/g, spaceRX = /^\s+$/;

const enum TOKEN {
    DELIMETER1 = ":",
    DELIMETER2 = "=",
    COMMA = ",",
    THIS = "this.",
    PARAM = "param",
    TARGET_PATH = "targetPath",
    BIND = "bind",
    GET = "get",
    DATE = "date",
    INJECT = "inject"
}

const enum TAG {
    NONE = "",
    LITERAL = "0",
    BIND = "1",
    GET = "2",
    DATE = "3",
    INJECT ="4",
    BRACE = "5",
    INDEXER = "6"
}

const enum PARSE_TYPE {
    NONE = 0,
    BINDING = 1,
    VIEW = 2
}

const enum DATES {
    NOW = "now",
    TODAY = "today",
    TOMORROW = "tomorrow",
    YESTERDAY = "yesterday"
}

const len_this = TOKEN.THIS.length;

interface IKeyVal {
    tag?: TAG;
    key: string;
    val: any;
}

// extract content from the inside of top level figure braces
function getCurlyBraceParts(val: string): string[] {
    let i: number, ch: string;
    const parts: string[] = [], len = val.length;

    for (i = 0; i < len; i += 1) {
        ch = val.charAt(i);

        switch (ch) {
            case "{":
                const braceLen = getBraceLen(val, i, BRACKETS.CURLY);
                parts.push(trim(val.substr(i + 1, braceLen - 2)));
                i += (braceLen - 1);
                break;
            default:
                if (!spaceRX.test(ch)) {
                    throw new Error(format(ERRS.ERR_EXPR_BRACES_INVALID, val));
                }
                break;
        }
    }

    return parts;
}

function getBraceContent(val: string, brace: BRACKETS): string {
    let ch: string, start: number = 0;

    const len = val.length;
    let br1: string;
    switch (brace) {
        case BRACKETS.ROUND:
            br1 = "(";
            break;
        case BRACKETS.CURLY:
            br1 = "{";
            break;
        case BRACKETS.SQUARE:
            br1 = "[";
            break;
    }

    for (let i = 0; i < len; i += 1) {
        if (start < 0) {
            start = i;
        }
        ch = val.charAt(i);
        if (ch === br1) {
            const braceLen = getBraceLen(val, i, brace);
            return trim(val.substr(i + 1, braceLen - 2));
        }
    }

    throw new Error("Invalid Expression: " + val);
}

function setKeyVal(kv: IKeyVal, start: number, end: number, val: string, isKey: boolean, isLit: boolean): void {
    if (start > -1 && start < end) {
        const str = val.substring(start, end);
        const v = !isLit ? trim(str) : str;
        if (!v) {
            return;
        }
        if (isKey) {
            kv.key += v;
        } else {
            kv.val += v;
        }
    }
}

function getDate(val: string, format: string): Date {
    if (!val) {
        return dates.today();
    } else {
        const lower = val.toLowerCase();
        if (startsWith(lower, "startof")) {
            return dates.startOf(lower.substr("startof".length) as TIME_RANGE);
        } else if (startsWith(lower, "endof")) {
            return dates.endOf(lower.substr("endof".length) as TIME_RANGE);
        } else {
            switch (val.toLowerCase()) {
                case DATES.NOW:
                    return dates.now();
                case DATES.TODAY:
                    return dates.today();
                case DATES.TOMORROW:
                    return dates.tomorrow();
                case DATES.YESTERDAY:
                    return dates.yesterday();
                default:
                    return dates.strToDate(val, format);
            }
        }
    }
}

function checkVal(kv: IKeyVal): boolean {
    if (!kv.key) {
        return false;
    }

    if (!!kv.val) {
        switch (kv.tag) {
            case TAG.DATE:
                {
                    const args = getExprArgs(kv.val),
                        val = args.length > 0 ? args[0] : _undefined,
                        format = args.length > 1 ? args[1] : "YYYYMMDD";

                    kv.val = getDate(val, format);
                }
                break;
            case TAG.NONE:
                {
                    if (isNumeric(kv.val)) {
                        kv.val = Number(kv.val);
                    } else if (isBoolString(kv.val)) {
                        kv.val = parseBool(kv.val);
                    }
                }
                break;
        }
    }

    return true;
}

function getTag(val: string, start: number, end: number): TAG {
    const token = trim(val.substring(start, end));
    let tag = TAG.NONE;

    switch (token) {
        case TOKEN.BIND:
            tag = TAG.BIND;
            break;
        case TOKEN.GET:
            tag = TAG.GET;
            break;
        case TOKEN.INJECT:
            tag = TAG.INJECT;
            break;
        case TOKEN.DATE:
            tag = TAG.DATE;
            break;
        default:
            throw new Error(`Unknown token: "${token}" in expression ${val}`);
    }

    return tag;
}

// extract key - value pairs
function getKeyVals(val: string): IKeyVal[] {
    let i: number, ch: string, literal: string, parts: IKeyVal[] = [],
        kv: IKeyVal = { tag: TAG.NONE, key: "", val: "" }, isKey = true, start = -1;
    const len = val.length;
    for (i = 0; i < len; i += 1) {
        if (start < 0) {
            start = i;
        }
        ch = val.charAt(i);

        if (!literal) {
            switch (ch) {
                case "'":
                case '"':
                    // is this a content inside '' or "" ?
                    setKeyVal(kv, start, i, val, isKey, false);
                    literal = ch;
                    start = i + 1;
                    if (kv.tag === TAG.NONE) {
                        kv.tag = TAG.LITERAL;
                    }
                    break;
                case "(":
                    // is this a content inside bind( ) or get() or date() or inject?
                    if (!isKey && start < i) {
                        const tag: TAG = getTag(val, start, i);
                        const braceLen = getBraceLen(val, i, BRACKETS.ROUND);
                        setKeyVal(kv, i + 1, i + braceLen - 1, val, isKey, false);
                        if (kv.tag !== TAG.NONE) {
                            throw new Error(`Invalid tag: ${trim(val.substring(start, i))} and value: ${kv.val} in expression: ${val}`);
                        }
                        kv.tag = tag;
                        i += (braceLen - 1);
                        start = -1;
                    } else {
                        throw new Error(`Invalid: "${ch}" in expression ${val}`);
                    }
                    break;
                case "[":
                    // is this a content inside [], something like customer[address.phone] or [Line1] or this.classes[*]?
                    setKeyVal(kv, start, i, val, isKey, false);
                    const braceLen = getBraceLen(val, i, BRACKETS.SQUARE);
                    const str = trimQuotes(val.substring(i + 1, i + braceLen - 1));
                    if (!str) {
                        throw new Error(`Invalid: "${ch}" in expression ${val}`);
                    }
                    if (isKey) {
                        kv.key += `[${str}]`;
                    } else {
                        kv.val += `[${str}]`;
                        if (kv.tag !== TAG.NONE) {
                            throw new Error(`Invalid value: ${kv.val} in expression: ${val}`);
                        }
                        kv.tag = TAG.INDEXER;
                    }
                    i += (braceLen - 1);
                    start = -1;
                    break;
                case "{":
                    if (!isKey) {
                        const test = trim(val.substring(start, i));
                        if (!!test) {
                            throw new Error(`Invalid word: "${test}{" in expression ${val}`);
                        }
                        const braceLen = getBraceLen(val, i, BRACKETS.CURLY);
                        kv.val = val.substring(i + 1, i + braceLen - 1);
                        if (kv.tag !== TAG.NONE) {
                            throw new Error(`Invalid value: ${kv.val} after brace "{" in expression: ${val}`);
                        }
                        kv.tag = TAG.BRACE;
                        i += (braceLen - 1);
                        start = -1;
                    } else {
                        throw new Error(`Invalid: "${ch}" in expression ${val}`);
                    }
                    break;
                case TOKEN.COMMA:
                    setKeyVal(kv, start, i, val, isKey, false);
                    start = -1;
                    parts.push(kv);
                    kv = { tag: TAG.NONE, key: "", val: "" }
                    // switch to parsing the key
                    isKey = true;
                    break;
                case TOKEN.DELIMETER1:
                case TOKEN.DELIMETER2:
                    setKeyVal(kv, start, i, val, isKey, false);
                    if (kv.tag !== TAG.NONE || !isKey) {
                        throw new Error(`Invalid "${ch}" at the start of: ${val.substring(i)} in expression: ${val}`);
                    }
                    start = -1;
                    // switch to parsing the value
                    isKey = false;
                    break;
                case ")":
                case "}":
                case "]":
                    throw new Error(`Invalid: "${ch}" in expression ${val}`);
                default:
                    if (kv.tag !== TAG.NONE && kv.tag !== TAG.INDEXER) {
                        if (ch !== "\t" && ch !== " " && ch !== "\n" && ch !== "\r")
                            throw new Error(`Invalid: "${ch}" at the start of: ${val.substring(i)} in expression: ${val}`);
                    }
                    break;
            }
        } else {
            // inside literal content here
            switch (ch) {
                case "'":
                case '"':
                   if (literal === ch) {
                        // check for quotes escape 
                        const i1 = i + 1, next = i1 < len ? val.charAt(i1) : null;
                        if (next === ch) {
                            setKeyVal(kv, start, i + 1, val, isKey, true);
                            i += 1;
                            start = -1;
                        } else {
                            setKeyVal(kv, start, i, val, isKey, true);
                            literal = null;
                            start = -1;
                        }
                    }
                    break;
            }
        }
    } // for (i = 0; i < val.length; i += 1)

    setKeyVal(kv, start, i, val, isKey, false);
    // push the last
    parts.push(kv);

    parts = parts.filter(function (kv) {
        return checkVal(kv);
    });
    return parts;
}

/**
    * resolve arguments by parsing content of expression: part1, part2 or stringDate,format? or id
*/
function getExprArgs(expr: string): string[] {
    let i: number, ch: string, literal: string, parts: string[] = [], start = -1, seekNext = false;
    const len = expr.length;
    let current = "";

    for (i = 0; i < len; i += 1) {
        if (start < 0) {
            start = i;
        }
        ch = expr.charAt(i);

        if (!literal) {
            switch (ch) {
                case "'":
                case '"':
                    literal = ch;
                    current += expr.substring(start, i);
                    start = i + 1;
                    break;
                case ',':
                    {
                        if (seekNext && (current != "" || trim(expr.substring(start, i)) != ""))
                            throw new Error(`Invalid expression arguments: ${expr}`);

                        if (!seekNext) {
                            current += expr.substring(start, i);
                            parts.push(current);
                        } else {
                            seekNext = false;
                        }
                        start = -1;
                        current = "";
                    }
                    break;
                case '{':
                    {
                        if (trim(current) !== "")
                            throw new Error(`Invalid expression arguments: ${expr}`);
                     
                        const braceLen = getBraceLen(expr, i, BRACKETS.CURLY);
                        const val = expr.substring(i + 1, i + braceLen - 1);
                        const obj = parseOption(PARSE_TYPE.NONE, val, null);
                        parts.push(obj);
                        i += (braceLen - 1);
                        start = -1;
                        current = "";
                        seekNext = true;
                    }
                    break;
            }
        } else {
            // inside literal content here
            switch (ch) {
                case "'":
                case '"':
                    if (literal === ch) {
                        // check for quotes escape 
                        const i1 = i + 1, next = i1 < len ? expr.charAt(i1) : null;
                       
                        if (next === ch) {
                            current += expr.substring(start, i + 1);
                            i += 1;
                            start = i + 1;
                        } else {
                            current += expr.substring(start, i);
                            literal = null;
                            start = i + 1;
                        }
                    }
                    break;
            }
        }
    }

    if (start > -1) {
        if (seekNext && (current != "" || trim(expr.substring(start, i)) != ""))
            throw new Error(`Invalid expression arguments: ${expr}`);

        current += expr.substring(start, i);
        parts.push(current);
    }

    return parts.map((p) => isString(p)?trim(p):p);
}

function getSvc(id: string, ...args: any[]): string {
    const argsdata: any[] = [];
    for (let i = 0; i < args.length; ++i) {
        const val = args[i];
        if (isNumeric(val)) {
            argsdata[i] = Number(val);
        } else if (isBoolString(val)) {
            argsdata[i] = parseBool(val);
        } else {
            argsdata[i] = val;
        }
    }
    return bootstrap.app.getSvc(trimQuotes(id), ...argsdata);
}

function getOptions(id: string): string {
    return bootstrap.app.getOptions(trimQuotes(id));
}

/**
    * resolve options by getting options by their id, and then parses them to the object
    * where id  is an ID of a script tag which contains options
    * as in: get(gridOptions)
*/
function parseById(parse_type: PARSE_TYPE, id: string, dataContext: any): any {
    const options = getOptions(id);
    return parseOption(parse_type, options, dataContext);
}

function isGetExpr(val: string): boolean {
    return !!val && getRX.test(val);
}

function parseOption(parse_type: PARSE_TYPE, part: string, dataContext: any): any {
    const res: any = parse_type === PARSE_TYPE.BINDING ? {
        targetPath: "",
        sourcePath: "",
        to: "",
        target: null,
        source: null,
        mode: "OneWay",
        converter: null,
        param: null,
        isBind: false
    } : {};

    part = trim(part);
    if (isGetExpr(part)) {
        const id = getBraceContent(part, BRACKETS.ROUND);
        return parseById(parse_type,trim(id), dataContext);
    }
    const kvals = getKeyVals(part);
    kvals.forEach(function (kv) {
        let isBind = false, bindparts: string[];

        if (parse_type === PARSE_TYPE.BINDING && !kv.val && startsWith(kv.key, TOKEN.THIS)) {
            kv.val = kv.key.substr(len_this); // extract property
            kv.key = TOKEN.TARGET_PATH;
        }

        const checkIsBind = parse_type === PARSE_TYPE.VIEW || parse_type === PARSE_TYPE.BINDING;

        if (checkIsBind && kv.tag === TAG.BIND) {
            bindparts = getExprArgs(kv.val);
            isBind = bindparts.length > 0;
        }

        if (isBind) {
            switch (parse_type) {
                case PARSE_TYPE.VIEW:
                    let source = dataContext || bootstrap.app;
                    if (bindparts.length > 1) {
                        //resolve source (second path in the array)
                        source = resolvePath(bootstrap.app, bindparts[1]);
                    }
                    res[kv.key] = resolvePath(source, bindparts[0]);
                    break;
                case PARSE_TYPE.BINDING:
                    if (bindparts.length > 0 && kv.key === TOKEN.PARAM) {
                        res[kv.key] = bindparts;
                        res.isBind = true;
                    }
                    break;
                default:
                    res[kv.key] = kv.val;
                    break;
            }
        } else {
            switch (kv.tag) {
                case TAG.BRACE:
                    res[kv.key] = parseOption(parse_type, kv.val, dataContext);
                    break;
                case TAG.GET:
                    res[kv.key] = parseById(PARSE_TYPE.NONE, kv.val, dataContext);
                    break;
                case TAG.INJECT:
                    {
                        const args = getExprArgs(kv.val);
                        let [id, ...rest] = args;
                        res[kv.key] = getSvc(id, ...rest);
                    }
                    break;
                default:
                    res[kv.key] = kv.val;
                    break;
            }
        }
    });

    return res;
}

function parseOptions(parse_type: PARSE_TYPE, strs: string[], dataContext: any): any[] {
    const res: any[] = [];
    let parts: string[] = [];
    for (let i = 0; i < strs.length; i += 1) {
        let str = trim(strs[i]);
        if (isGetExpr(str)) {
            const id = getBraceContent(str, BRACKETS.ROUND);
            str = trim(getOptions(trim(id)));
        }
        if (startsWith(str, "{") && endsWith(str, "}")) {
            const subparts = getCurlyBraceParts(str);
            for (let k = 0; k < subparts.length; k += 1) {
                parts.push(subparts[k]);
            }
        } else {
            parts.push(str);
        }
    }

    for (let j = 0; j < parts.length; j += 1) {
        res.push(parseOption(parse_type, parts[j],dataContext));
    }

    return res;
}

export class Parser {
    static parseOptions(options: string): any[] {
        return parseOptions(PARSE_TYPE.NONE, [options], null);
    }
    static parseBindings(bindings: string[]): TBindingInfo[] {
        return parseOptions(PARSE_TYPE.BINDING, bindings, null);
    }
    static parseViewOptions(options: string, dataContext: any): any {
        const res = parseOptions(PARSE_TYPE.VIEW, [options], dataContext);
        return (!!res && res.length > 0) ? res[0] : {};
    }
}