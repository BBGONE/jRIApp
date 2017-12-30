/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { Utils, LocaleERRS as ERRS } from "jriapp_shared";
import { IBindingInfo } from "../int";

import { bootstrap } from "../bootstrap";

const checks = Utils.check, strUtils = Utils.str, coreUtils = Utils.core,
    sys = Utils.sys;

const getRX = /^get[(].+[)]$/g;

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
    BRACE_PART = "2",
    LITERAL = "3",
    GET = "4",
    DATE= "5"
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
    k: boolean;
    v: boolean;
}

// extract content from inside of top level braces
function getBraceParts(val: string, firstOnly: boolean): string[] {
    let i: number, start = 0, cnt = 0, ch: string, literal: string, test = 0;
    const parts: string[] = [], len = val.length;

    for (i = 0; i < len; i += 1) {
        ch = val.charAt(i);
        // is this content inside '' or "" ?
        if (ch === "'" || ch === '"') {
            if (!literal) {
                literal = ch;
            } else if (literal === ch) {
                literal = null;
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
                if (firstOnly) {
                    return parts;
                }
            }
        } else {
            if (test > 0) {
                cnt += 1;
            }
        }
    }
    return parts;
}

function setVal(kv: IKeyVal, val: string, isKey: boolean): void {
    if (isKey && !kv.k) {
        kv.key = strUtils.fastTrim(val);
        kv.k = true
    } else if (!isKey && !kv.v) {
        kv.val = strUtils.fastTrim(val);
        kv.v = true;
        if (!!kv.val) {
            if (kv.tag === TAG.DATE) {
                let parts = getEvalParts(kv.val), format = "YYYYMMDD";
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
                if (checks.isNumeric(kv.val)) {
                    kv.val = Number(kv.val);
                } else if (checks.isBoolString(kv.val)) {
                    kv.val = coreUtils.parseBool(kv.val);
                }
            }
        }
    }
}

// extract key - value pairs
function getKeyVals(val: string): IKeyVal[] {
    let i: number, ch: string, literal: string, parts: IKeyVal[] = [], str: string,
        kv: IKeyVal = { tag: null, key: "", val: "", k:false, v:false }, isKey = true, start = 0, escapedQuotes = "";

    const len = val.length;
    for (i = 0; i < len; i += 1) {
        if (start < 0) {
            start = i;
        }

        ch = val.charAt(i);
        // is this a content inside '' or "" ?
        if (ch === "'" || ch === '"') {
            if (!literal) {
                literal = ch;
                start = i + 1;
                escapedQuotes = "";
                continue;
            } else if (literal === ch) {
                //check for quotes escape 
                const i1 = i + 1, next = i1 < len ? val.charAt(i1) : null;
                if (next === ch) {
                    i += 1;
                    escapedQuotes = ch;
                } else {
                    if (start < i) {
                        str = val.substring(start, i);
                        if (!!escapedQuotes) {
                            str = str.replace(escapedQuotes + escapedQuotes, escapedQuotes);
                        }
                        setVal(kv, str, isKey);
                    }
                    literal = null;
                    start = -1;
                }
                continue;
            }
        }

        // is this a content inside eval( ) or get() or date()?
        if (ch === "(" && !literal && !isKey && start < i) {
            const token = strUtils.fastTrim(val.substring(start, i));
            switch (token) {
                case TOKEN.EVAL:
                    literal = ch;
                    kv.tag = TAG.EVAL;
                    break;
                case TOKEN.GET:
                    literal = ch;
                    kv.tag = TAG.GET;
                    break;
                case TOKEN.DATE:
                    literal = ch;
                    kv.tag = TAG.DATE;
                    break;
                default:
                    throw new Error(`Unknown token: ${token} in expression ${val}`);
            }
        }

        if (ch === ")") {
            if (!literal) {
                throw new Error(`Invalid: ) in expression ${val}`);
            }
            if (literal === "(") {
                    str = val.substring(start, i + 1);
                    setVal(kv, str, isKey);
                    literal = null;
                    start = -1;
                    continue;
            }
        }

        if (!literal) {
            if (ch === "{" && !isKey) {
                let bracePart = val.substr(i); // all the string starting from {
                const braceParts = getBraceParts(bracePart, true);
                if (braceParts.length === 1) {
                    bracePart = braceParts[0];
                    setVal(kv, bracePart, false);
                    kv.tag = TAG.BRACE_PART;
                    start = -1;
                    i += (bracePart.length + 1);
                } else {
                    throw new Error(strUtils.format(ERRS.ERR_EXPR_BRACES_INVALID, bracePart));
                }
            } else if (ch === TOKEN.COMMA) {
                if (start < i) {
                    str = val.substring(start, i);
                    setVal(kv, str, isKey);
                }
                start = -1;
                parts.push(kv);
                kv = { tag: null, key: "", val: "", k: false, v: false }
                // switch to parsing the key
                isKey = true;
            } else if (ch === TOKEN.DELIMETER1 || ch === TOKEN.DELIMETER2) {
                if (start < i) {
                    str = val.substring(start, i);
                    setVal(kv, str, isKey);
                }
                start = -1;
                // switch to parsing the value
                isKey = false;
            }
        } else {
            // parsing literal value here
            if (!kv.tag) {
                kv.tag = TAG.LITERAL;
            }
        }
    } //for (i = 0; i < val.length; i += 1)

    if (start > -1 && start < i) {
        str = val.substring(start, i);
        setVal(kv, str, isKey);
    }

    //the last value
    parts.push(kv);

    parts = parts.filter(function (kv) {
        // if the key was set
        return kv.k;
    });

    return parts;
}

/**
    * resolve parts by parsing expression: eval(part1, part2?) or date(stringDate,format?)
*/
function getEvalParts(val: string): string[] {
    let ch: string, is_expression = false,
        parts: string[] = [], start = 0, part: string;
    for (let i = 0; i < val.length; i += 1) {
        if (start < 0) {
            start = i;
        }

        ch = val.charAt(i);
        // is this content inside eval( ) or date() ?
        if (ch === "(" && start < i) {
            if (is_expression) {
                throw new Error("Invalid Expression: " + val);
            }

            part = strUtils.fastTrim(val.substring(start, i));
            if (!is_expression && (part === TOKEN.EVAL || part === TOKEN.DATE || part === TOKEN.GET)) {
                is_expression = true;
                start = -1;
                continue;
            }
        }

        if (ch === ")" && start < i) {
            if (is_expression) {
                is_expression = false;
                part = strUtils.fastTrim(val.substring(start, i));
                parts.push(part);
                start = -1;
                break;
            } else {
                throw new Error("Invalid Expression: " + val);
            }
        }

        if (ch === TOKEN.COMMA && is_expression && start < i) {
            part = strUtils.fastTrim(val.substring(start, i));
            parts.push(part);
            start = -1;
            continue;
        }
    }

    if (parts.length > 2) {
        throw new Error("Invalid Expression: " + val);
    }

    return parts;
}

function getOptions(val: string): string {
    let parts = getEvalParts(val);
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
    let options = getOptions(val);
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
    part = strUtils.fastTrim(part);
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
            evalparts = getEvalParts(kv.val);
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
        } else if (kv.tag === TAG.BRACE_PART) {
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
        let str = strUtils.fastTrim(strs[i]);
        if (isGet(str)) {
            str = strUtils.fastTrim(getOptions(str));
        }
        if (strUtils.startsWith(str, "{") && strUtils.endsWith(str, "}")) {
            const subparts = getBraceParts(str, false);
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