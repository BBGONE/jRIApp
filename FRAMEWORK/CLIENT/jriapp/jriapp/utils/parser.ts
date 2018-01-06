﻿/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { Utils, LocaleERRS as ERRS } from "jriapp_shared";
import { IBindingInfo } from "../int";

import { bootstrap } from "../bootstrap";

const { isNumeric, isBoolString } = Utils.check, strUtils = Utils.str, { parseBool } = Utils.core, sys = Utils.sys;

const trim = strUtils.fastTrim, getRX = /^get[(].+[)]$/g;

const enum TOKEN {
    DELIMETER1 = ":",
    DELIMETER2 = "=",
    COMMA = ",",
    EVAL = "eval",
    THIS = "this.",
    PARAM = "param",
    TARGET_PATH = "targetPath",
    GET = "get",
    DATE = "date"
}

const enum TAG {
    EVAL = "1",
    GET = "2",
    DATE = "3",
    BRACE = "4",
    LITERAL = "5"
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

// extract content from inside of top level braces
function getBraceParts(val: string): string[] {
    let i: number, start = 0, cnt = 0, ch: string, literal: string, test = 0;
    const parts: string[] = [], len = val.length;

    for (i = 0; i < len; i += 1) {
        ch = val.charAt(i);
        // is this content inside '' or "" ?
        if (ch === "'" || ch === '"') {
            if (!literal) {
                literal = ch;
                cnt += 1;
                continue;
            } else if (literal === ch) {
                //check for quotes escape 
                const i1 = i + 1, next = i1 < len ? val.charAt(i1) : null;
                if (next === ch) {
                    i += 1;
                    cnt += 2;
                } else {
                    literal = null;
                    cnt += 1;
                }
                continue;
            }
        }

        if (!literal && ch === "{") {
            if (test === 0) {
                start = i;
            }
            test += 1;
            cnt += 1;
        } else if (!literal && ch === "}") {
            test -= 1;
            cnt += 1;
            if (test === 0) {
                if ((cnt - 2) > 0) {
                    parts.push(val.substr(start + 1, cnt - 2));
                } else {
                    parts.push("");
                }
                cnt = 0;
                start = 0;
            }
        } else {
            if (test > 0) {
                cnt += 1;
            }
        }
    }

    if (test !== 0) {
        throw new Error(strUtils.format(ERRS.ERR_EXPR_BRACES_INVALID, val));
    }
    return parts;
}

function getBraceLen(val: string, start: number): number {
    let i: number, cnt = 0, ch: string, literal: string, test = 0;
    const len = val.length;

    for (i = start; i < len; i += 1) {
        ch = val.charAt(i);
        // is this content inside '' or "" ?
        if (ch === "'" || ch === '"') {
            if (!literal) {
                literal = ch;
                cnt += 1;
                continue;
            } else if (literal === ch) {
                //check for quotes escape 
                const i1 = i + 1, next = i1 < len ? val.charAt(i1) : null;
                if (next === ch) {
                    i += 1;
                    cnt += 2;
                } else {
                    literal = null;
                    cnt += 1;
                }
                continue;
            }
        }

        if (!literal && ch === "{") {
            test += 1;
            cnt += 1;
        } else if (!literal && ch === "}") {
            test -= 1;
            cnt += 1;
            if (test === 0) {
                return cnt;
            }
        } else {
            if (test > 0) {
                cnt += 1;
            }
        }
    }
    if (test !== 0) {
        throw new Error(strUtils.format(ERRS.ERR_EXPR_BRACES_INVALID, val));
    }
    return cnt;
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
        // is this a content inside '' or "" ?
        if (ch === "'" || ch === '"') {
            if (!literal) {
                setVal(kv, start, i, val, isKey, false);
                literal = ch;
                start = i + 1;
                if (!kv.tag) {
                    kv.tag = TAG.LITERAL;
                }
                continue;
            } else if (literal === ch) {
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
                continue;
            }
        }

        // is this a content inside eval( ) or get() or date()?
        if (ch === "(" && !literal && !isKey && start < i) {
            const token = trim(val.substring(start, i));
            switch (token) {
                case TOKEN.EVAL:
                    kv.tag = TAG.EVAL;
                    break;
                case TOKEN.GET:
                    kv.tag = TAG.GET;
                    break;
                case TOKEN.DATE:
                    kv.tag = TAG.DATE;
                    break;
                default:
                    throw new Error(`Unknown token: ${token} in expression ${val}`);
            }
            literal = ch;
            setVal(kv, start, i, val, isKey, false);
            start = i;
            setVal(kv, start, i + 1, val, isKey, false);
            start = -1;
            continue;
        }

        if (ch === ")") {
            if (!literal) {
                throw new Error(`Invalid: ) in expression ${val}`);
            }
            if (literal === "(") {
                literal = null;
                setVal(kv, start, i, val, isKey, false);
                start = i;
                setVal(kv, start, i + 1, val, isKey, false);
                start = -1;
            }
            continue;
        }

        // is this a content inside []?
        if (ch === "[" && !literal) {
            setVal(kv, start, i, val, isKey, false);
            start = i;
            setVal(kv, start, i + 1, val, isKey, false);
            start = -1;
            continue;
        }

        if (ch === "]" && !literal) {
            setVal(kv, start, i, val, isKey, false);
            start = i;
            setVal(kv, start, i + 1, val, isKey, false);
            start = -1;
            continue;
        }

        if (!literal) {
            if (ch === "{" && !isKey) {
                const braceLen = getBraceLen(val, i);
                setVal(kv, i + 1, i + braceLen - 1, val, isKey, false);
                kv.tag = TAG.BRACE;
                i += (braceLen - 1);
                start = -1;
            } else if (ch === TOKEN.COMMA) {
                setVal(kv, start, i, val, isKey, false);
                start = -1;
                parts.push(kv);
                kv = { tag: null, key: "", val: "" }
                // switch to parsing the key
                isKey = true;
            } else if (ch === TOKEN.DELIMETER1 || ch === TOKEN.DELIMETER2) {
                setVal(kv, start, i, val, isKey, false);
                start = -1;
                // switch to parsing the value
                isKey = false;
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
    * resolve arguments by parsing expression: eval(part1, part2?) or date(stringDate,format?) or get(id)
*/
function getExprArgs(expr: string): string[] {
    let ch: string, is_expression = false,
        parts: string[] = [], start = 0, part: string;
    for (let i = 0; i < expr.length; i += 1) {
        if (start < 0) {
            start = i;
        }

        ch = expr.charAt(i);
        // is this content inside eval( ) or date() or get()?
        if (ch === "(" && start < i) {
            if (is_expression) {
                throw new Error("Invalid Expression: " + expr);
            }

            part = trim(expr.substring(start, i));
            if (!is_expression && (part === TOKEN.EVAL || part === TOKEN.DATE || part === TOKEN.GET)) {
                is_expression = true;
                start = -1;
                continue;
            }
        }

        if (ch === ")" && start < i) {
            if (is_expression) {
                is_expression = false;
                part = trim(expr.substring(start, i));
                parts.push(part);
                start = -1;
                break;
            } else {
                throw new Error("Invalid Expression: " + expr);
            }
        }

        if (ch === TOKEN.COMMA && is_expression && start < i) {
            part = trim(expr.substring(start, i));
            parts.push(part);
            start = -1;
            continue;
        }
    }

    if (parts.length > 2) {
        throw new Error("Invalid Expression: " + expr);
    }

    return parts;
}

function getOptions(val: string): string {
    let parts = getExprArgs(val);
    if (parts.length !== 1) {
        throw new Error("Invalid Expression: " + val);
    }
    return bootstrap.getOptions(parts[0]);
}

/**
    * resolve options by parsing expression: get(id)
    * where id  is an ID of a script tag which contains options
    * like: get(gridOptions)
*/
function resolveOptions(parse_type: PARSE_TYPE, val: string, app: any, dataContext: any): any {
    const options = getOptions(val);
    return parseOption(parse_type, options, app, dataContext);
}


function isGet(val: string): boolean {
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
    if (isGet(part)) {
        return resolveOptions(parse_type, part, app, dataContext);
    }
    const kvals = getKeyVals(part);
    kvals.forEach(function (kv) {
        let isEval = false, evalparts: string[];

        if (parse_type === PARSE_TYPE.BINDING && !kv.val && strUtils.startsWith(kv.key, TOKEN.THIS)) {
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
        } else if (kv.tag === TAG.BRACE) {
            res[kv.key] = parseOption(parse_type, kv.val, app, dataContext);
        } else if (kv.tag === TAG.GET) {
            res[kv.key] = resolveOptions(PARSE_TYPE.NONE, kv.val, app, dataContext);
        } else {
            res[kv.key] = kv.val;
        }
    });

    return res;
}

function parseOptions(parse_type: PARSE_TYPE, strs: string[], app: any, dataContext: any): any[] {
    const res: any[] = [];
    let parts: string[] = [];
    for (let i = 0; i < strs.length; i += 1) {
        let str = trim(strs[i]);
        if (isGet(str)) {
            str = trim(getOptions(str));
        }
        if (strUtils.startsWith(str, "{") && strUtils.endsWith(str, "}")) {
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