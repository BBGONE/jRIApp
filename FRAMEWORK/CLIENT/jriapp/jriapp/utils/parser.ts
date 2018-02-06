﻿/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { Utils, BRACE_TYPE, LocaleERRS as ERRS } from "jriapp_shared";
import { IBindingInfo, IApplication } from "../int";

import { bootstrap } from "../bootstrap";

const { isNumeric, isBoolString } = Utils.check,
    { format, fastTrim: trim, startsWith, endsWith, trimQuotes } = Utils.str,
    { parseBool } = Utils.core, sys = Utils.sys;

const getRX = /^get[(].+[)]$/g, spaceRX = /^\s+$/;

const enum TOKEN {
    DELIMETER1 = ":",
    DELIMETER2 = "=",
    COMMA = ",",
    EVAL = "eval",
    THIS = "this.",
    PARAM = "param",
    TARGET_PATH = "targetPath",
    GET = "get",
    DATE = "date",
    INJECT = "inject"
}

const enum TAG {
    EVAL = "1",
    GET = "2",
    DATE = "3",
    INJECT ="4",
    BRACE = "5",
    LITERAL = "6"
}

const enum DATES {
    TODAY = "today",
    TOMORROW = "tomorrow",
    YESTERDAY = "yesterday",
    ENDOFMONTH = "endofmonth"
}


const enum PARSE_TYPE {
    NONE = 0,
    BINDING = 1,
    VIEW = 2
}

const len_this = TOKEN.THIS.length;

interface IKeyVal {
    tag?: string;
    key: string;
    val: any;
}

// extract content from the inside of top level figure braces
function getBraceParts(val: string): string[] {
    let i: number, ch: string;
    const parts: string[] = [], len = val.length;

    for (i = 0; i < len; i += 1) {
        ch = val.charAt(i);

        switch (ch) {
            case "{":
                const braceLen = sys.getBraceLen(val, i, BRACE_TYPE.FIGURE);
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

function getBraceContent(val: string, brace: BRACE_TYPE): string {
    let ch: string, start: number = 0;

    const len = val.length;
    let br1: string;
    switch (brace) {
        case BRACE_TYPE.SIMPLE:
            br1 = "(";
            break;
        case BRACE_TYPE.FIGURE:
            br1 = "{";
            break;
        case BRACE_TYPE.SQUARE:
            br1 = "[";
            break;
    }

    for (let i = 0; i < len; i += 1) {
        if (start < 0) {
            start = i;
        }
        ch = val.charAt(i);
        if (ch === br1) {
            const braceLen = sys.getBraceLen(val, i, brace);
            return trim(val.substr(i + 1, braceLen - 2));
        }
    }

    throw new Error("Invalid Expression: " + val);
}

function setVal(kv: IKeyVal, start: number, end: number, val: string, isKey: boolean, isLit: boolean): void {
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

function appendVal(kv: IKeyVal, isKey: boolean, val: string): void {
    if (isKey) {
        kv.key += val;
    } else {
        kv.val += val;
    }
}

function checkVal(kv: IKeyVal): boolean {
    if (!kv.key) {
        return false;
    }
    if (!!kv.val) {
        if (kv.tag === TAG.DATE) {
            let parts = getExprArgs(kv.val), format = "YYYYMMDD";
            if (parts.length > 1) {
                format = parts[1];
            }
            if (parts.length > 0) {
                switch (parts[0]) {
                    case DATES.TODAY:
                        kv.val = moment().startOf('day').toDate();
                        break;
                    case DATES.TOMORROW:
                        kv.val = moment().startOf('day').add(1, 'days').toDate();
                        break;
                    case DATES.YESTERDAY:
                        kv.val = moment().startOf('day').subtract(1, 'days').toDate();
                        break;
                    case DATES.ENDOFMONTH:
                        kv.val = moment().startOf('month').add(1, 'months').subtract(1, 'days').toDate();
                        break;
                    default:
                        kv.val = moment(parts[0], format).toDate();
                        break;
                }
            } else {
                kv.val = moment().startOf('day').toDate();
            }
        } else if (!kv.tag) {
            if (isNumeric(kv.val)) {
                kv.val = Number(kv.val);
            } else if (isBoolString(kv.val)) {
                kv.val = parseBool(kv.val);
            }
        }
    }

    return true;
}

// extract key - value pairs
function getKeyVals(val: string): IKeyVal[] {
    let i: number, ch: string, literal: string, parts: IKeyVal[] = [],
        kv: IKeyVal = { tag: null, key: "", val: "" }, isKey = true, start = -1;

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
                    setVal(kv, start, i, val, isKey, false);
                    literal = ch;
                    start = i + 1;
                    if (!kv.tag) {
                        kv.tag = TAG.LITERAL;
                    }
                    break;
                case "(":
                    // is this a content inside eval( ) or get() or date() or inject?
                    if (!isKey && start < i) {
                        const token = trim(val.substring(start, i));
                        switch (token) {
                            case TOKEN.EVAL:
                                kv.tag = TAG.EVAL;
                                break;
                            case TOKEN.GET:
                                kv.tag = TAG.GET;
                                break;
                            case TOKEN.INJECT:
                                kv.tag = TAG.INJECT;
                                break;
                            case TOKEN.DATE:
                                kv.tag = TAG.DATE;
                                break;
                            default:
                                throw new Error(`Unknown token: ${token} in expression ${val}`);
                        }
                        const braceLen = sys.getBraceLen(val, i, BRACE_TYPE.SIMPLE);
                        setVal(kv, i + 1, i + braceLen - 1, val, isKey, false);
                        i += (braceLen - 1);
                        start = -1;
                    } else {
                        throw new Error(`Invalid: ${ch} in expression ${val}`);
                    }
                    break;
                case "[":
                    // is this a content inside [], something like customer[address.phone] or [Line1] or this.classes[*]?
                    setVal(kv, start, i, val, isKey, false);
                    const braceLen = sys.getBraceLen(val, i, BRACE_TYPE.SQUARE);
                    const str = trimQuotes(val.substring(i + 1, i + braceLen - 1));
                    if (!str) {
                        throw new Error(`Invalid: ${ch} in expression ${val}`);
                    }
                    appendVal(kv, isKey, `[${str}]`);
                    i += (braceLen - 1);
                    start = -1;
                    break;
                case "{":
                    if (!isKey) {
                        const braceLen = sys.getBraceLen(val, i, BRACE_TYPE.FIGURE);
                        setVal(kv, i + 1, i + braceLen - 1, val, isKey, false);
                        kv.tag = TAG.BRACE;
                        i += (braceLen - 1);
                        start = -1;
                    } else {
                        throw new Error(`Invalid: ${ch} in expression ${val}`);
                    }
                    break;
                case TOKEN.COMMA:
                    setVal(kv, start, i, val, isKey, false);
                    start = -1;
                    parts.push(kv);
                    kv = { tag: null, key: "", val: "" }
                    // switch to parsing the key
                    isKey = true;
                    break;
                case TOKEN.DELIMETER1:
                case TOKEN.DELIMETER2:
                    setVal(kv, start, i, val, isKey, false);
                    start = -1;
                    // switch to parsing the value
                    isKey = false;
                    break;
                case ")":
                case "}":
                case "]":
                    throw new Error(`Invalid: ${ch} in expression ${val}`);
            }
        } else {
            // inside literal content here
            switch (ch) {
                case "'":
                case '"':
                    if (literal === ch) {
                        //check for quotes escape 
                        const i1 = i + 1, next = i1 < len ? val.charAt(i1) : null;
                        if (next === ch) {
                            setVal(kv, start, i + 1, val, isKey, true);
                            i += 1;
                            start = -1;
                        } else {
                            setVal(kv, start, i, val, isKey, true);
                            literal = null;
                            start = -1;
                        }
                    }
                    break;
            }
        }
    } // for (i = 0; i < val.length; i += 1)

    setVal(kv, start, i, val, isKey, false);
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
    const parts = expr.split(",");
    if (parts.length > 2) {
        throw new Error("Invalid Expression: " + expr);
    }
    return parts.map((p) => trim(p));
}

function inject(id: string, app: IApplication): string {
    return !app ? bootstrap.getSvc(id) : app.getSvc(id);
}

function getOptions(id: string): string {
    return bootstrap.getOptions(id);
}

/**
    * resolve options by getting options by their id, and then parses them to the object
    * where id  is an ID of a script tag which contains options
    * as in: get(gridOptions)
*/
function parseById(parse_type: PARSE_TYPE, id: string, app: any, dataContext: any): any {
    const options = getOptions(id);
    return parseOption(parse_type, options, app, dataContext);
}

function isGetExpr(val: string): boolean {
    return !!val && getRX.test(val);
}

function parseOption(parse_type: PARSE_TYPE, part: string, app: any, dataContext: any): any {
    const res: any = parse_type === PARSE_TYPE.BINDING ? {
        targetPath: "",
        sourcePath: "",
        to: "",
        target: null,
        source: null,
        mode: "OneWay",
        converter: null,
        param: null,
        isEval: false
    } : {};
    part = trim(part);
    if (isGetExpr(part)) {
        const id = getBraceContent(part, BRACE_TYPE.SIMPLE);
        return parseById(parse_type,trim(id), app, dataContext);
    }
    const kvals = getKeyVals(part);
    kvals.forEach(function (kv) {
        let isEval = false, evalparts: string[];

        if (parse_type === PARSE_TYPE.BINDING && !kv.val && startsWith(kv.key, TOKEN.THIS)) {
            kv.val = kv.key.substr(len_this); // extract property
            kv.key = TOKEN.TARGET_PATH;
        }

        const isTryGetEval = parse_type === PARSE_TYPE.VIEW || parse_type === PARSE_TYPE.BINDING;
        if (isTryGetEval && kv.tag === TAG.EVAL) {
            evalparts = getExprArgs(kv.val);
            isEval = evalparts.length > 0;
        }

        if (isEval) {
            switch (parse_type) {
                case PARSE_TYPE.VIEW:
                    let source = dataContext || app;
                    if (evalparts.length > 1) {
                        //resolve source (second path in the array)
                        source = sys.resolvePath(app, evalparts[1]);
                    }
                    res[kv.key] = sys.resolvePath(source, evalparts[0]);
                    break;
                case PARSE_TYPE.BINDING:
                    if (evalparts.length > 0 && kv.key === TOKEN.PARAM) {
                        res[kv.key] = evalparts;
                        res.isEval = true;
                    }
                    break;
                default:
                    res[kv.key] = kv.val;
                    break;
            }
        } else {
            switch (kv.tag) {
                case TAG.BRACE:
                    res[kv.key] = parseOption(parse_type, kv.val, app, dataContext);
                    break;
                case TAG.GET:
                    res[kv.key] = parseById(PARSE_TYPE.NONE, kv.val, app, dataContext);
                    break;
                case TAG.INJECT:
                    res[kv.key] = inject(kv.val, app);
                    break;
                default:
                    res[kv.key] = kv.val;
                    break;
            }
        }
    });

    return res;
}

function parseOptions(parse_type: PARSE_TYPE, strs: string[], app: any, dataContext: any): any[] {
    const res: any[] = [];
    let parts: string[] = [];
    for (let i = 0; i < strs.length; i += 1) {
        let str = trim(strs[i]);
        if (isGetExpr(str)) {
            const id = getBraceContent(str, BRACE_TYPE.SIMPLE);
            str = trim(getOptions(trim(id)));
        }
        if (startsWith(str, "{") && endsWith(str, "}")) {
            const subparts = getBraceParts(str);
            for (let k = 0; k < subparts.length; k += 1) {
                parts.push(subparts[k]);
            }
        } else {
            parts.push(str);
        }
    }

    for (let j = 0; j < parts.length; j += 1) {
        res.push(parseOption(parse_type, parts[j], app, dataContext));
    }

    return res;
}

export class Parser {
    static parseOptions(options: string): any[] {
        return parseOptions(PARSE_TYPE.NONE, [options], null, null);
    }
    static parseBindings(bindings: string[]): IBindingInfo[] {
        return parseOptions(PARSE_TYPE.BINDING, bindings, null, null);
    }
    static parseViewOptions(options: string, app: any, dataContext: any): any {
        const res = parseOptions(PARSE_TYPE.VIEW, [options], app, dataContext);
        return (!!res && res.length > 0) ? res[0] : {};
    }
}