/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { Utils, LocaleERRS as ERRS } from "jriapp_shared";
const checks = Utils.check, strUtils = Utils.str, coreUtils = Utils.core,
    sys = Utils.sys;

const trimOuterBracesRX = /^([{]){0,1}|([}]){0,1}$/g;
const testEvalRX = /^eval\s*[(]\s*((?:\w*\.?\w*)*)\s*(?:[,]\s*((?:\w*\.?\w*)*)\s*)?[)]$/g;
const VAL_DELIMETER1 = ":", VAL_DELIMETER2 = "=", KEY_VAL_DELIMETER = ",";


function trimOuterBraces(val: string): string {
    return strUtils.fastTrim(val.replace(trimOuterBracesRX, ""));
}
function isInsideBraces(str: string): boolean {
    return (strUtils.startsWith(str, "{") && strUtils.endsWith(str, "}"));
}


 function _checkKeyVal(kv: { key: string; val: any; }) {
    // key starts with this like used in binding expressions this.property
    if (kv.val === "" && strUtils.startsWith(kv.key, "this.")) {
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

// extract key - value pairs
function _getKeyVals(val: string): { key: string; val: any; }[] {
    let i: number, ch: string, literal: string,
        parts: { key: string; val: any; }[] = [],
        kv: { key: string; val: any; } = { key: "", val: "" }, isKey = true;
    const vd1 = VAL_DELIMETER1, vd2 = VAL_DELIMETER2, kvd = KEY_VAL_DELIMETER;

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
        // is this content inside ( ) ?
        if (ch === "(") {
            if (!literal) {
                literal = ch;
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

        if (!literal && ch === kvd) {
            if (!!kv.key) {
                _addKeyVal(kv, parts);
                kv = { key: "", val: "" };
                isKey = true; // currently parsing key value
            }
        } else if (!literal && (ch === vd1 || ch === vd2)) {
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

function _getEvalPath(str: string): { path: string; source: string; } {
    // the regexp produces two groups
    // for "eval(ttttt.yyyy.gggg,hhh.ddd)" it produces a match with 
    // matches[1] = ttttt.yyyy.gggg, matches[2] = hhh.ddd
    const matches = testEvalRX.exec(str);
    const evalpath = (!!matches && matches.length > 1) ? {
        path: matches[1],
        source: (matches.length > 2) ? matches[2] : null
    } : {
            path: null,
            source: null
        };
    return evalpath;
}

function _parseOption(part: string, app: any, defSource: any): any {
    const res: any = {};
    part = strUtils.fastTrim(part);
    if (isInsideBraces(part)) {
        part = trimOuterBraces(part);
    }
    const kvals = _getKeyVals(part);
    kvals.forEach(function (kv) {
        let isEval = false, evalpath: { path: string; source: string; } = null;
        const isString = checks.isString(kv.val);

        if (isString && !!app) {
            evalpath = _getEvalPath(kv.val);
            isEval = !!evalpath.path;
        }

        if (isEval) {
            let source = defSource || app;
            if (!!evalpath.source) {
                source = Parser.resolvePath(app, sys.getPathParts(evalpath.source));
            }
            res[kv.key] = Parser.resolvePath(source, sys.getPathParts(evalpath.path));
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
    static resolvePath(root: any, srcParts: string[]): any {
        const self = Parser;
        if (!root) {
            return checks.undefined;
        }

        if (srcParts.length === 0) {
            return root;
        }

        if (srcParts.length > 0) {
            return self.resolvePath(sys.getProp(root, srcParts[0]), srcParts.slice(1));
        }

        throw new Error("Parser could not resolve the source");
    }
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
