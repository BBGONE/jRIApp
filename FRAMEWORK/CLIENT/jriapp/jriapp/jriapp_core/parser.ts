/*
The MIT License (MIT)

Copyright(c) 2016 Maxim V.Tsapov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and / or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
import { IPropertyBag } from "shared";
import { BaseObject }  from "object";
import { IEventStore } from "./eventstore";
import { SysChecks } from "../jriapp_utils/syschecks";
import { Checks, StringUtils, CoreUtils } from "../jriapp_utils/coreutils";

const checks = Checks, syschecks = SysChecks, strUtils = StringUtils, coreUtils = CoreUtils;

export class Parser {
    static __trimOuterBracesRX = /^([{]){0,1}|([}]){0,1}$/g;
    static __trimQuotsRX = /^(['"])+|(['"])+$/g;
    static __trimBracketsRX = /^(\[)+|(\])+$/g;
    //regex expression to extract parts from obj[index] strings
    static __indexedPropRX = /(^\w+)\s*\[\s*['"]?\s*([^'"]+)\s*['",]?\s*\]/i;
    static __valueDelimeter1 = ":";
    static __valueDelimeter2 = "=";
    static __keyValDelimeter = ",";

    //extract key - value pairs
    protected _getKeyVals(val: string) {
        let i: number, ch: string, literal: string, parts: { key: string; val: any; }[] = [],
            kv: { key: string; val: any; } = { key: "", val: "" }, isKey = true, bracePart: string,
            vd1 = Parser.__valueDelimeter1, vd2 = Parser.__valueDelimeter2, kvd = Parser.__keyValDelimeter;

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
                bracePart = val.substr(i);
                bracePart = this.getBraceParts(bracePart, true)[0];
                kv.val += bracePart;
                i += bracePart.length - 1;
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
            matches = part.match(Parser.__indexedPropRX);
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

        if (strUtils.startsWith(prop, "[")) {
            //it is an indexed property, obj must be of collection type or Array or a simple Indexer
            prop = this.trimQuotes(this.trimBrackets(prop));

            if (syschecks._isCollection(obj)) {
                return syschecks._getItemByProp(obj, prop);
            }
            else if (checks.isArray(obj)) {
                return obj[parseInt(prop, 10)];
            }
            else {
                return obj[prop];
            }
        }
        else {
            if (syschecks._isEventStore(obj)) {
                return (<IEventStore>obj).getCommand(prop);
            }
            else if (syschecks._isPropBag(obj)) {
                return (<IPropertyBag>obj).getProperty(prop);
            }
            else {
                return obj[prop];
            }
        }
    }
    setPropertyValue(obj: any, prop: string, val: any) {
        //it is an indexed property, obj must be an Array or ComandStore or a simple indexer
        if (strUtils.startsWith(prop, "[")) {
            //remove brakets from a string like: [index]
            prop = this.trimQuotes(this.trimBrackets(prop));

            if (checks.isArray(obj)) {
                obj[parseInt(prop, 10)] = val;
            }
            else {
                obj[prop] = val;
            }
        }
        else {
            if (syschecks._isEventStore(obj)) {
                return (<IEventStore>obj).setCommand(prop, val);
            }
            else if (syschecks._isPropBag(obj)) {
                (<IPropertyBag>obj).setProperty(prop, val);
            }
            else {
                obj[prop] = val;
            }
        }
    }
    resolveBindingSource(root: any, srcParts: string[]): any {
        if (!root)
            return undefined;

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
                return undefined;
        }
        return this.resolveProp(res, parts[len]);
    }
    //extract top level braces
    getBraceParts(val: string, firstOnly: boolean) {
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
    trimOuterBraces(val: string) {
        return strUtils.trim(val.replace(Parser.__trimOuterBracesRX, ""));
    }
    trimQuotes(val: string) {
        return strUtils.trim(val.replace(Parser.__trimQuotsRX, ""));
    }
    trimBrackets(val: string) {
        return strUtils.trim(val.replace(Parser.__trimBracketsRX, ""));
    }
    isWithOuterBraces(str: string) {
        return (strUtils.startsWith(str, "{") && strUtils.endsWith(str, "}"));
    }
    parseOption(part: string) {
        let res: any = {}, self = this;
        part = strUtils.trim(part);
        if (self.isWithOuterBraces(part))
            part = self.trimOuterBraces(part);
        let kvals = self._getKeyVals(part);
        kvals.forEach(function (kv) {
            let isString = checks.isString(kv.val);
            if (isString && self.isWithOuterBraces(kv.val))
                res[kv.key] = self.parseOption(kv.val);
            else {
                if (isString)
                    res[kv.key] = self.trimQuotes(kv.val);
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
        if (self.isWithOuterBraces(str)) {
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