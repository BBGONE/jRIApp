﻿/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { Utils, LocaleERRS as ERRS } from "jriapp_shared";
const checks = Utils.check, strUtils = Utils.str, coreUtils = Utils.core,
    sys = Utils.sys;

const trimOuterBracesRX = /^([{]){0,1}|([}]){0,1}$/g;

const enum TOKEN {
    DELIMETER1 = ":",
    DELIMETER2 = "=",
    COMMA = ",",
    EVAL = "eval",
    THIS = "this.",
    PARAM = "param",
    TARGET_PATH = "targetPath",
    BRACE_PART = "BRP"
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

function trimOuterBraces(val: string): string {
    return strUtils.fastTrim(val.replace(trimOuterBracesRX, ""));
}
function isInsideBraces(str: string): boolean {
    return (strUtils.startsWith(str, "{") && strUtils.endsWith(str, "}"));
}

function convertKeyVal(kv: IKeyVal): void {
    kv.key = strUtils.fastTrim(kv.key);
    kv.val = strUtils.fastTrim(kv.val);
    if (checks.isNumeric(kv.val)) {
        kv.val = Number(kv.val);
    } else if (checks.isBoolString(kv.val)) {
        kv.val = coreUtils.parseBool(kv.val);
    }
}

// extract top level braces
function getBraceParts(val: string, firstOnly: boolean): string[] {
    let i: number, s = "", ch: string, literal: string, cnt = 0;
    const parts: string[] = [];

    for (i = 0; i < val.length; i += 1) {
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
            cnt += 1;
            s += ch;
        } else if (!literal && ch === "}") {
            cnt -= 1;
            s += ch;
            if (cnt === 0) {
                parts.push(s);
                s = "";
                if (firstOnly) {
                    return parts;
                }
            }
        } else {
            if (cnt > 0) {
                s += ch;
            }
        }
    }

    return parts;
}

// extract key - value pairs
function getKeyVals(val: string): IKeyVal[] {
    let i: number, ch: string, literal: string,
        parts: IKeyVal[] = [], kv: IKeyVal = { tag: null, key: "", val: "" }, isKey = true;
    const len = val.length;
    

    for (i = 0; i < len; i += 1) {
        ch = val.charAt(i);
        // is this a content inside '' or "" ?
        if (ch === "'" || ch === '"') {
            if (!literal) {
                literal = ch;
                continue;
            } else if (literal === ch) {
                //check for quotes escape 
                const i1 = i + 1, next = i1 < len ? val.charAt(i1) : null;
                if (next === ch) {
                    kv.val += ch;
                    i += 1;
                } else {
                    literal = null;
                }
                continue;
            }
        }

        // is this a content inside eval( ) ?
        if (ch === "(" && checks.isString(kv.val)) {
            if (!literal && strUtils.fastTrim(kv.val) === TOKEN.EVAL) {
                literal = ch;
                kv.tag = TOKEN.EVAL;
            }
        }

        if (ch === ")") {
            if (literal === "(") {
                literal = null;
            }
        }

        if (!literal) {
            if (ch === "{" && !isKey) {
                let bracePart = val.substr(i);
                const braceParts = getBraceParts(bracePart, true);
                if (braceParts.length > 0) {
                    bracePart = braceParts[0];
                    kv.val += bracePart;
                    kv.tag = TOKEN.BRACE_PART;
                    i += bracePart.length - 1;
                } else {
                    throw new Error(strUtils.format(ERRS.ERR_EXPR_BRACES_INVALID, bracePart));
                }
            } else if (ch === TOKEN.COMMA) {
                if (!!kv.key) {
                    convertKeyVal(kv);
                    parts.push(kv);
                    kv = { tag: null, key: "", val: "" };
                    isKey = true; // currently parsing key value
                }
            } else if (ch === TOKEN.DELIMETER1 || ch === TOKEN.DELIMETER2) {
                isKey = false; // begin parsing value
            } else {
                if (isKey) {
                    kv.key += ch;
                } else {
                    kv.val += ch;
                }
            }
        } else {
            if (isKey) {
                kv.key += ch;
            } else {
                kv.val += ch;
            }
        }
    } //for (i = 0; i < val.length; i += 1)

    //check the last value
    if (!!kv.key) {
        convertKeyVal(kv);
        parts.push(kv);
    }

    parts = parts.filter(function (kv) {
       // when key has value
        return !!kv.key && kv.val !== ""; 
    });

    return parts;
}

function getEvalParts(val: string): string[] {
    let ch: string, is_expression = false,
        parts: string[] = [], part = "";


    for (let i = 0; i < val.length; i += 1) {
        ch = val.charAt(i);
        // is this content inside eval( ) ?
        if (ch === "(" && checks.isString(part)) {
            if (is_expression ) {
                throw new Error("Invalid expression: " + val);
            }

            if (!is_expression && strUtils.fastTrim(part) === TOKEN.EVAL) {
                part = "";
                is_expression = true;
                continue;
            }
        }

        if (ch === ")") {
            if (is_expression) {
                is_expression = false;
                parts.push(part);
                part = "";
                if (parts.length > 2) {
                    throw new Error("Invalid expression: " + val);
                }
                break;
            } else {
                throw new Error("Invalid expression: " + val);
            }
        }

        if (ch === TOKEN.COMMA && is_expression) {
            parts.push(part);
            part = "";
            continue;
        }

        part += ch; 
    }

    for (let j = 0; j < parts.length; j += 1) {
        parts[j] = strUtils.fastTrim(parts[j]);
    }

    return parts;
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
    if (isInsideBraces(part)) {
        part = trimOuterBraces(part);
    }
    const kvals = getKeyVals(part);
    kvals.forEach(function (kv) {
        let isEval = false, evalparts: string[];
        const isTryGetEval = parse_type === PARSE_TYPE.VIEW || parse_type === PARSE_TYPE.BINDING;

        if (parse_type === PARSE_TYPE.BINDING && !kv.val && strUtils.startsWith(kv.key, TOKEN.THIS)) {
            kv.val = kv.key.substr(len_this); // extract property
            kv.key = TOKEN.TARGET_PATH;
        }

        if (isTryGetEval && kv.tag === TOKEN.EVAL) {
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
        } else if (kv.tag === TOKEN.BRACE_PART) {
            res[kv.key] = parseOption(parse_type, kv.val, app, dataContext);
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
        strs[i] = strUtils.fastTrim(strs[i]);
        if (isInsideBraces(strs[i])) {
            const subparts = getBraceParts(strs[i], false);
            for (let k = 0; k < subparts.length; k += 1) {
                parts.push(subparts[k]);
            }
        } else {
            parts.push(strs[i]);
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
    static parseBindings(bindings: string[]): any[] {
        return parseOptions(PARSE_TYPE.BINDING, bindings, null, null);
    }
    static parseViewOptions(options: string, app: any, dataContext: any): any {
        const res = parseOptions(PARSE_TYPE.VIEW, [options], app, dataContext);
        return (!!res && res.length > 0) ? res[0] : {};
    }
}
