/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { Utils, LocaleERRS as ERRS } from "jriapp_shared";


const checks = Utils.check, strUtils = Utils.str, coreUtils = Utils.core, sys = Utils.sys;

const trimOuterBracesRX = /^([{]){0,1}|([}]){0,1}$/g;
const VAL_DELIMETER1 = ":", VAL_DELIMETER2 = "=",  KEY_VAL_DELIMETER = ",";

function trimOuterBraces(val: string) {
    return strUtils.trim(val.replace(trimOuterBracesRX, ""));
}
function isInsideBraces(str: string) {
    return (strUtils.startsWith(str, "{") && strUtils.endsWith(str, "}"));
}

export class Parser {
    private static _checkKeyVal(kv: { key: string; val: any; }) {
        // key starts with this like used in binding expressions this.property
        if (kv.val === "" && strUtils.startsWith(kv.key, "this.")) {
            kv.val = kv.key.substr(5); // extract property
            kv.key = "targetPath";
        }
    }
    private static _addKeyVal(kv: {
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
    // extract key - value pairs
    private static _getKeyVals(val: string) {
        const self = Parser;
        let i: number, ch: string, literal: string, parts: { key: string; val: any; }[] = [],
            kv: { key: string; val: any; } = { key: "", val: "" }, isKey = true;
        const vd1 = VAL_DELIMETER1, vd2 = VAL_DELIMETER2, kvd =  KEY_VAL_DELIMETER;

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

            // value inside braces
            if (!literal && ch === "{" && !isKey) {
                let bracePart = val.substr(i);
                const braceParts = self.getBraceParts(bracePart, true);
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
                    self._addKeyVal(kv, parts);
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
            self._addKeyVal(kv, parts);
        }

        parts.forEach(function (kv) {
            kv.key = strUtils.trim(kv.key);
            if (checks.isString(kv.val)) {
                kv.val = strUtils.trim(kv.val);
            }
            self._checkKeyVal(kv);
        });

        parts = parts.filter(function (kv) {
            return kv.val !== ""; // when key has value
        });
        return parts;
    }
    static resolveSource(root: any, srcParts: string[]): any {
        const self = Parser;
        if (!root) {
            return checks.undefined;
        }

        if (srcParts.length === 0) {
            return root;
        }

        if (srcParts.length > 0) {
            return self.resolveSource(sys.getProp(root, srcParts[0]), srcParts.slice(1));
        }

        throw new Error("Invalid operation");
    }
    // extract top level braces
    static getBraceParts(val: string, firstOnly: boolean): string[] {
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
    static parseOption(part: string) {
        const self = Parser;
        const res: any = {};
        part = strUtils.trim(part);
        if (isInsideBraces(part)) {
            part = trimOuterBraces(part);
        }
        const kvals = self._getKeyVals(part);
        kvals.forEach(function (kv) {
            const isString = checks.isString(kv.val);
            if (isString && isInsideBraces(kv.val)) {
                res[kv.key] = self.parseOption(kv.val);
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
    static parseOptions(str: string) {
        const self = Parser;
        const res: any[] = [];

        str = strUtils.trim(str);
        let parts = [str];
        if (isInsideBraces(str)) {
            parts = self.getBraceParts(str, false);
        }
        parts.forEach(function (part) {
            res.push(self.parseOption(part));
        });

        return res;
    }
}
