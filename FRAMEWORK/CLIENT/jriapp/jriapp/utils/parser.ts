﻿/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { Utils, LocaleERRS as ERRS } from "jriapp_shared";
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
    GET = "get"
}

const enum TAG {
    EVAL = "1",
    BRACE_PART = "2",
    LITERAL = "3",
    GET = "4"
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

function checkType(kv: IKeyVal): void {
    kv.key = strUtils.fastTrim(kv.key);
    kv.val = strUtils.fastTrim(kv.val);
    if (!kv.tag) {
        if (checks.isNumeric(kv.val)) {
            kv.val = Number(kv.val);
        } else if (checks.isBoolString(kv.val)) {
            kv.val = coreUtils.parseBool(kv.val);
        }
    }
}

// extract content from inside of top level braces
function getBraceParts(val: string, firstOnly: boolean): string[] {
    let i: number, start=0, cnt = 0, ch: string, literal: string, test = 0;
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

// extract key - value pairs
function getKeyVals(val: string): IKeyVal[] {
    let i: number, ch: string, literal: string, space: number = 0,
        parts: IKeyVal[] = [], kv: IKeyVal = { tag: null, key: "", val: "" }, isKey = true;
    const len = val.length;
 
    for (i = 0; i < len; i += 1) {
        ch = val.charAt(i);
        // is this a content inside '' or "" ?
        if (ch === "'" || ch === '"') {
            if (!literal) {
                space = 0;
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

        // is this a content inside eval( ) or json() ?
        if (ch === "(" && !literal) {
            space = 0;
            if (checks.isString(kv.val)) {
                const token = kv.val;
                switch (token) {
                    case TOKEN.EVAL:
                        literal = ch;
                        kv.tag = TAG.EVAL;
                        break;
                    case TOKEN.GET:
                        literal = ch;
                        kv.tag = TAG.GET;
                        break;
                    default:
                        throw new Error(`Unknown token: ${token} in expression ${val}`);
                }
            }
        }

        if (ch === ")") {
            if (!literal) {
                throw new Error(`Invalid: ) in expression ${val}`);
            }
            switch (literal) {
                case "(":
                    literal = null;
                    break;
            }
        }

        if (!literal) {
            if (ch === "{" && !isKey) {
                space = 0;
                let bracePart = val.substr(i); // all the string starting from {
                const braceParts = getBraceParts(bracePart, true);
                if (braceParts.length === 1) {
                    bracePart = braceParts[0];
                    kv.val += bracePart;
                    kv.tag = TAG.BRACE_PART;
                    i += (bracePart.length + 1);
                } else {
                    throw new Error(strUtils.format(ERRS.ERR_EXPR_BRACES_INVALID, bracePart));
                }
            } else if (ch === TOKEN.COMMA) {
                space = 0;
                if (!!kv.key) {
                    checkType(kv);
                    parts.push(kv);
                    kv = { tag: null, key: "", val: "" };
                    // switch to parsing key
                    isKey = true;
                }
            } else if (ch === TOKEN.DELIMETER1 || ch === TOKEN.DELIMETER2) {
                space = 0;
                // switch to parsing value
                isKey = false; 
            } else {
                if (isKey) {
                    if (!kv.key && (ch === " " || ch.charCodeAt(0) < 14)) {
                        space += 1;
                    } else {
                        if (!kv.key) {
                            space = 0;
                        }
                        if (!!space) {
                            kv.key += Array(space).join(" ");
                            space = 0;
                        }
                        kv.key += ch;
                    }
                } else {
                    if (!kv.val && (ch === " " || ch.charCodeAt(0) < 14)) {
                        space += 1;
                    } else {
                        if (!kv.val) {
                            space = 0;
                        }
                        if (!!space) {
                            kv.val += Array(space).join(" ");
                            space = 0;
                        }
                        kv.val += ch;
                    }
                }
            }
        } else {
            // parsing literal value here
            space = 0;
            if (isKey) {
                kv.key += ch;
            } else {
                kv.val += ch;
                if (!kv.tag) {
                    kv.tag = TAG.LITERAL;
                }
            }
        }
    } //for (i = 0; i < val.length; i += 1)

    space = 0;
    //check the last value
    if (!!kv.key) {
        checkType(kv);
        parts.push(kv);
    }

    parts = parts.filter(function (kv) {
       // when key has value
        return !!kv.key && kv.val !== ""; 
    });

    return parts;
}

/**
    * resolve parts by parsing expression: eval(part1, part2)
*/
function getEvalParts(val: string): string[] {
    let ch: string, is_expression = false,
        parts: string[] = [], part = "";


    for (let i = 0; i < val.length; i += 1) {
        ch = val.charAt(i);
        // is this content inside eval( ) ?
        if (ch === "(" && checks.isString(part)) {
            if (is_expression ) {
                throw new Error("Invalid Expression: " + val);
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
                    throw new Error("Invalid Expression: " + val);
                }
                break;
            } else {
                throw new Error("Invalid Expression: " + val);
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

/**
    * resolve options by parsing expression: get(id)
    * where id  is an ID of a script tag which contains options
    * like: get(gridOptions)
*/
function getOptions(parse_type: PARSE_TYPE, val: string, app: any, dataContext: any): any {
    let ch: string, is_expression = false, part = "";
    for (let i = 0; i < val.length; i += 1) {
        ch = val.charAt(i);
        // is this content inside json( ) ?
        if (ch === "(" && checks.isString(part)) {
            if (is_expression) {
                throw new Error("Invalid Expression: " + val);
            }

            if (!is_expression && strUtils.fastTrim(part) === TOKEN.GET) {
                part = "";
                is_expression = true;
                continue;
            }
        }

        if (ch === ")") {
            if (is_expression) {
                is_expression = false;
                break;
            } else {
                throw new Error("Invalid Expression: " + val);
            }
        }

        part += ch;
    }
    if (!part) {
        throw new Error("Invalid Expression: " + val);
    }
    let options = bootstrap.getOptions(part);
    return parseOption(parse_type, options, app, dataContext);
}

function isGetExpression(val: string): boolean {
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

    if (isGetExpression(part)) {
        return getOptions(parse_type, part, app, dataContext);
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
            res[kv.key] = getOptions(PARSE_TYPE.NONE, kv.val, app, dataContext);
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
        if (strUtils.startsWith(strs[i], "{") && strUtils.endsWith(strs[i], "}")) {
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
