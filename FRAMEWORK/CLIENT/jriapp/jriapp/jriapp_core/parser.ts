/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IPropertyBag } from "shared";
import { ERRS } from "./lang";
import { BaseObject }  from "object";
import { SysChecks } from "../jriapp_utils/syschecks";
import { Checks, StringUtils, CoreUtils } from "../jriapp_utils/coreutils";

const checks = Checks, syschecks = SysChecks, strUtils = StringUtils, coreUtils = CoreUtils;

const __trimOuterBracesRX = /^([{]){0,1}|([}]){0,1}$/g;
const __trimQuotsRX = /^(['"])+|(['"])+$/g;
const __trimBracketsRX = /^(\[)+|(\])+$/g;
//regex expression to extract parts from obj[index] strings
const __indexedPropRX = /(^\w+)\s*\[\s*['"]?\s*([^'"]+)\s*['",]?\s*\]/i;
const __valueDelimeter1 = ":";
const __valueDelimeter2 = "=";
const __keyValDelimeter = ",";

function trimOuterBraces(val: string) {
    return strUtils.trim(val.replace(__trimOuterBracesRX, ""));
}
function trimQuotes(val: string) {
    return strUtils.trim(val.replace(__trimQuotsRX, ""));
}
function trimBrackets(val: string) {
    return strUtils.trim(val.replace(__trimBracketsRX, ""));
}
function isInsideBraces(str: string) {
    return (strUtils.startsWith(str, "{") && strUtils.endsWith(str, "}"));
}

export class Parser {
    //extract key - value pairs
    protected _getKeyVals(val: string) {
        let i: number, ch: string, literal: string, parts: { key: string; val: any; }[] = [],
            kv: { key: string; val: any; } = { key: "", val: "" }, isKey = true,
            vd1 = __valueDelimeter1, vd2 = __valueDelimeter2, kvd = __keyValDelimeter;

        let addNewKeyValPair = function (kv: { key: string; val: any; }) {
            if (kv.val) {
                if (checks.isNumeric(kv.val)) {
                    kv.val = Number(kv.val);
                }
                else if (checks.isBoolString(kv.val)) {
                    kv.val = coreUtils.parseBool(kv.val);
                }
            }
            parts.push(kv);
        };

        let checkTokens = function (kv: { key: string; val: any; }) {
            //key starts with this like used in binding expressions this.property
            if (kv.val === "" && strUtils.startsWith(kv.key, "this.")) {
                kv.val = kv.key.substr(5); //extract property
                kv.key = "targetPath";
            }
        };

        for (i = 0; i < val.length; i += 1) {
            ch = val.charAt(i);
            //is this content inside '' or "" ?
            if (ch === "'" || ch === '"') {
                if (!literal)
                    literal = ch;
                else if (literal === ch)
                    literal = null;
            }

            //value inside braces
            if (!literal && ch === "{" && !isKey) {
                let bracePart = val.substr(i);
                let braceParts = this.getBraceParts(bracePart, true);
                if (braceParts.length > 0) {
                    bracePart = braceParts[0];
                    kv.val += bracePart;
                    i += bracePart.length - 1;
                }
                else {
                    throw new Error(strUtils.format(ERRS.ERR_EXPR_BRACES_INVALID, bracePart));
                }
                continue;
            }

            if (!literal && ch === kvd) {
                if (!!kv.key) {
                    addNewKeyValPair(kv);
                    kv = { key: "", val: "" };
                    isKey = true; //currently parsing key value
                }
            }
            else if (!literal && (ch === vd1 || ch === vd2)) {
                isKey = false; //begin parsing value
            }
            else {
                if (isKey)
                    kv.key += ch;
                else
                    kv.val += ch;
            }
        }

        if (!!kv.key) {
            addNewKeyValPair(kv);
        }

        parts.forEach(function (kv) {
            kv.key = strUtils.trim(kv.key);
            if (checks.isString(kv.val))
                kv.val = strUtils.trim(kv.val);
            checkTokens(kv);
        });

        parts = parts.filter(function (kv) {
            return kv.val !== ""; //when key has value
        });
        return parts;
    }
    getPathParts(path: string) {
        let self = this, parts: string[] = (!path) ? [] : path.split("."), parts2: string[] = [];
        parts.forEach(function (part) {
            let matches: string[], obj: string, index: string;
            matches = part.match(__indexedPropRX);
            if (!!matches) {
                obj = matches[1];
                index = matches[2];
                parts2.push(obj);
                parts2.push("[" + index + "]");
            }
            else
                parts2.push(part);
        });

        return parts2;
    }
    resolveProp(obj: any, prop: string) {
        if (!prop)
            return obj;

        if (checks.isBaseObject(obj) && obj.getIsDestroyCalled())
            return checks.undefined;

        if (strUtils.startsWith(prop, "[")) {
            //it is an indexed property like ['someProp']
            prop = trimQuotes(trimBrackets(prop));

            if (syschecks._isCollection(obj)) {
                return syschecks._getItemByProp(obj, prop);
            }
            else if (checks.isArray(obj)) {
                return obj[parseInt(prop, 10)];
            }
        }

        if (syschecks._isPropBag(obj)) {
            return (<IPropertyBag>obj).getProp(prop);
        }
        else {
            return obj[prop];
        }
    }
    setPropertyValue(obj: any, prop: string, val: any) {
        if (!prop)
            throw new Error("Invalid operation: Empty Property name");
        if (checks.isBaseObject(obj) && obj.getIsDestroyCalled())
            return;

        //it is an indexed property, obj must be an Array or ComandStore or a simple indexer
        if (strUtils.startsWith(prop, "[")) {
            //remove brakets from a string like: [index]
            prop = trimQuotes(trimBrackets(prop));

            if (checks.isArray(obj)) {
                obj[parseInt(prop, 10)] = val;
                return;
            }
        }

        if (syschecks._isPropBag(obj)) {
            (<IPropertyBag>obj).setProp(prop, val);
        }
        else {
            obj[prop] = val;
        }
    }
    resolveBindingSource(root: any, srcParts: string[]): any {
        if (!root)
            return checks.undefined;

        if (srcParts.length === 0) {
            return root;
        }

        if (srcParts.length > 0) {
            return this.resolveBindingSource(this.resolveProp(root, srcParts[0]), srcParts.slice(1));
        }

        throw new Error("Invalid operation");
    }
    resolvePath(obj: any, path: string): any {
        if (!path)
            return obj;
        let parts = this.getPathParts(path), res = obj, len = parts.length - 1;
        for (let i = 0; i < len; i += 1) {
            res = this.resolveProp(res, parts[i]);
            if (!res)
                return checks.undefined;
        }
        return this.resolveProp(res, parts[len]);
    }
    //extract top level braces
    private getBraceParts(val: string, firstOnly: boolean): string[] {
        let i: number, s = "", ch: string, literal: string, cnt = 0, parts: string[] = [];

        for (i = 0; i < val.length; i += 1) {
            ch = val.charAt(i);
            //is this content inside '' or "" ?
            if (ch === "'" || ch === '"') {
                if (!literal)
                    literal = ch;
                else if (literal === ch)
                    literal = null;
            }

            if (!literal && ch === "{") {
                cnt += 1;
                s += ch;
            }
            else if (!literal && ch === "}") {
                cnt -= 1;
                s += ch;
                if (cnt === 0) {
                    parts.push(s);
                    s = "";
                    if (firstOnly)
                        return parts;
                }
            }
            else {
                if (cnt > 0) {
                    s += ch;
                }
            }
        }

        return parts;
    }
    parseOption(part: string) {
        let res: any = {}, self = this;
        part = strUtils.trim(part);
        if (isInsideBraces(part))
            part = trimOuterBraces(part);
        let kvals = self._getKeyVals(part);
        kvals.forEach(function (kv) {
            let isString = checks.isString(kv.val);
            if (isString && isInsideBraces(kv.val))
                res[kv.key] = self.parseOption(kv.val);
            else {
                if (isString)
                    res[kv.key] = trimQuotes(kv.val);
                else
                    res[kv.key] = kv.val;
            }
        });

        return res;
    }
    parseOptions(str: string) {
        let res: any[] = [], self = this;

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
    toString() {
        return "Parser";
    }
}

export const parser = new Parser();