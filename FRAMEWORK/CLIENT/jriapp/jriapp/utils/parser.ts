/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { Utils, LocaleERRS as ERRS } from "jriapp_shared";
const checks = Utils.check, strUtils = Utils.str, coreUtils = Utils.core,
    sys = Utils.sys;

const trimOuterBracesRX = /^([{]){0,1}|([}]){0,1}$/g;

const enum TOKEN {
    DELIMETER1 = ":",
    DELIMETER2 = "=",
    COMMA = ",",
    EVAL = "eval",
    THIS = "this."
}


function trimOuterBraces(val: string): string {
    return strUtils.fastTrim(val.replace(trimOuterBracesRX, ""));
}
function isInsideBraces(str: string): boolean {
    return (strUtils.startsWith(str, "{") && strUtils.endsWith(str, "}"));
}


 function _checkKeyVal(kv: { key: string; val: any; }) {
     // key starts with this like used in binding expressions this.property
     if (kv.val === "" && strUtils.startsWith(kv.key, TOKEN.THIS)) {
        kv.val = kv.key.substr(5); // extract property
        kv.key = "targetPath";
    }
}

function _addKeyVal(kv: {
    key: string;
    val: any;
}, parts: {
    key: string;
    val: any;
}[]) {
    if (kv.val) {
        if (checks.isNumeric(kv.val)) {
            kv.val = Number(kv.val);
        } else if (checks.isBoolString(kv.val)) {
            kv.val = coreUtils.parseBool(kv.val);
        }
    }
    parts.push(kv);
}

// extract top level braces
 function _getBraceParts(val: string, firstOnly: boolean): string[] {
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

interface IKeyVal {
    tag?: string;
    key: string;
    val: any;
}

// extract key - value pairs
function _getKeyVals(val: string): IKeyVal[] {
    let i: number, ch: string, literal: string,
        parts: IKeyVal[] = [], kv: IKeyVal = { tag: null, key: "", val: "" }, isKey = true;
    

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
        // is this content inside eval( ) ?
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

        // value inside braces
        if (!literal && ch === "{" && !isKey) {
            let bracePart = val.substr(i);
            const braceParts = _getBraceParts(bracePart, true);
            if (braceParts.length > 0) {
                bracePart = braceParts[0];
                kv.val += bracePart;
                i += bracePart.length - 1;
            } else {
                throw new Error(strUtils.format(ERRS.ERR_EXPR_BRACES_INVALID, bracePart));
            }
            continue;
        }

        if (!literal && ch === TOKEN.COMMA) {
            if (!!kv.key) {
                _addKeyVal(kv, parts);
                kv = {tag: null, key: "", val: "" };
                isKey = true; // currently parsing key value
            }
        } else if (!literal && (ch === TOKEN.DELIMETER1 || ch === TOKEN.DELIMETER2)) {
            isKey = false; // begin parsing value
        } else {
            if (isKey) {
                kv.key += ch;
            } else {
                kv.val += ch;
            }
        }
    }

    if (!!kv.key) {
        _addKeyVal(kv, parts);
    }

    parts.forEach(function (kv) {
        kv.key = strUtils.fastTrim(kv.key);
        if (checks.isString(kv.val)) {
            kv.val = strUtils.fastTrim(kv.val);
        }
        _checkKeyVal(kv);
    });

    parts = parts.filter(function (kv) {
        return kv.val !== ""; // when key has value
    });
    return parts;
}

function _getEvalParts(val: string): string[] {
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

function _parseOption(part: string, app: any, defSource: any): any {
    const res: any = {};
    part = strUtils.fastTrim(part);
    if (isInsideBraces(part)) {
        part = trimOuterBraces(part);
    }
    const kvals = _getKeyVals(part);
    kvals.forEach(function (kv) {
        let isEval = false, evalparts:string[];
        const isString = checks.isString(kv.val);

        if (isString && kv.tag === TOKEN.EVAL && !!app) {
            evalparts = _getEvalParts(kv.val);
            isEval = evalparts.length > 0;
        }

        if (isEval) {
            let source = defSource || app;
            if (evalparts.length > 1) {
                //resolve source (second path in the array)
                source = sys.resolvePath(app, evalparts[1]);
            }
            res[kv.key] = sys.resolvePath(source, evalparts[0]);
        } else if (isString && isInsideBraces(kv.val)) {
            res[kv.key] = _parseOption(kv.val, app, defSource);
        } else {
            if (isString) {
                res[kv.key] = strUtils.trimQuotes(kv.val);
            } else {
                res[kv.key] = kv.val;
            }
        }
    });

    return res;
}

function _parseOptions(strs: string[], app: any, defSource: any): any[] {
    const res: any[] = [];
    let parts: string[] = [];
    for (let i = 0; i < strs.length; i += 1) {
        strs[i] = strUtils.fastTrim(strs[i]);
        if (isInsideBraces(strs[i])) {
            const subparts = _getBraceParts(strs[i], false);
            for (let k = 0; k < subparts.length; k += 1) {
                parts.push(subparts[k]);
            }
        } else {
            parts.push(strs[i]);
        }
    }
   
    for (let j = 0; j < parts.length; j += 1) {
        res.push(_parseOption(parts[j], app, defSource));
    }

    return res;
}

export class Parser {
    static parseOptions(options: string): any[] {
        return _parseOptions([options], null, null);
    }
    static parseBindings(bindings: string[]): any[] {
        return _parseOptions(bindings, null, null);
    }
    static parseViewOptions(options: string, app: any, defSource: any): any {
        const res = _parseOptions([options], app, defSource);
        return (!!res && res.length > 0) ? res[0] : {};
    }
}
