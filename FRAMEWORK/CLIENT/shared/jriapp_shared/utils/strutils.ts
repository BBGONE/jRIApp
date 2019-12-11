/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { SIDE } from "../consts";
import { Checks } from "./checks";
const _undefined: any = void (0), hasNativeTrim = !!("".trim), spaceChars = [" ", "\t", "\r", "\n"];
const ERR_STRING_FORMAT_INVALID = "String format has invalid expression value: ";
const { isFunc, isNt } = Checks;

export class StringUtils {
    static endsWith(str: string, suffix: string): boolean {
        return (!str || !suffix) ? false : (str.substr(str.length - suffix.length) === suffix);
    }
    static startsWith(str: string, prefix: string): boolean {
        return (!str || !prefix) ? false : (str.substr(0, prefix.length) === prefix);
    }
    static fastTrim(str: string): string {
        if (!str) {
            return "";
        }
        return hasNativeTrim ? str.trim() : trim(str, spaceChars, SIDE.BOTH);
    }
    static trim(str: string, chars: string[] = null, side: SIDE = SIDE.BOTH): string {
        if (!str) {
            return "";
        }
        if (side === SIDE.BOTH && !chars && hasNativeTrim) {
            return str.trim();
        }
        const len = str.length, arr: string[] = !chars ? spaceChars : chars;
        let start = 0, end = len, ch: string;
        if (side === SIDE.BOTH || side === SIDE.LEFT) {
            for (let i = 0; i < len; i += 1) {
                ch = str.charAt(i);
                if (arr.indexOf(ch) > -1) {
                    start = i + 1;
                } else {
                    break;
                }
            }
        }
        if (side === SIDE.BOTH || side === SIDE.RIGHT) {
            for (let j = len - 1; j >= start; j -= 1) {
                ch = str.charAt(j);
                if (arr.indexOf(ch) > -1) {
                    end = j;
                } else {
                    break;
                }
            }
        }

        if (start === 0 && end === len) {
            return str;
        } else {
            return (end > start) ? str.substring(start, end) : "";
        }
    }
    static ltrim(str: string, chars?: string[]): string {
        return trim(str, chars, SIDE.LEFT);
    }
    static rtrim(str: string, chars?: string[]): string {
        return trim(str, chars, SIDE.RIGHT);
    }
    /*
     *    Usage:     format('test {0}={1}', 'x', 100);
     *    result:    test x=100
    */
    static format(formatStr: string, ...args: any[]): string {
        let result = "";
        for (let i = 0; ; ) {
            const open = formatStr.indexOf("{", i);
            const close = formatStr.indexOf("}", i);
            if ((open < 0) && (close < 0)) {
                result += formatStr.slice(i);
                break;
            }
            if ((close > 0) && ((close < open) || (open < 0))) {
                if (formatStr.charAt(close + 1) !== "}") {
                    throw new Error(ERR_STRING_FORMAT_INVALID + formatStr);
                }
                result += formatStr.slice(i, close + 1);
                i = close + 2;
                continue;
            }
            result += formatStr.slice(i, open);
            i = open + 1;
            if (formatStr.charAt(i) === "{") {
                result += "{";
                i++;
                continue;
            }
            if (close < 0) {
                throw new Error(ERR_STRING_FORMAT_INVALID + formatStr);
            }
            const brace = formatStr.substring(i, close);
            const colonIndex = brace.indexOf(":");
            const argNumber = parseInt((colonIndex < 0) ? brace : brace.substring(0, colonIndex), 10);
            if (isNaN(argNumber)) {
                throw new Error(ERR_STRING_FORMAT_INVALID + formatStr);
            }
            const argFormat = (colonIndex < 0) ? "" : brace.substring(colonIndex + 1);
            let arg = args[argNumber];
            if (isNt(arg)) {
                arg = "";
            }

            if (isFunc(arg.format)) {
                result += arg.format(argFormat);
            } else {
                result += arg.toString();
            }
            i = close + 1;
        }
        return result;
    }
    /**
     *    Usage:     formatNumber(123456.789, 2, '.', ',');
     *    result:    123,456.79
    **/
    static formatNumber(num: any, decimals?: number, decPoint?: string, thousandsSep?: string): string {
        num = (num + "").replace(/[^0-9+-Ee.]/g, "");
        const n = !isFinite(+num) ? 0 : +num, dec = (decPoint === _undefined) ? "." : decPoint,
        sep = (thousandsSep === _undefined) ? "," : thousandsSep;
        let prec = !isFinite(+decimals) ? 0 : Math.abs(decimals), s = [""];
        // Fix for IE parseFloat(0.55).toFixed(0) = 0;
        const toFixedFix = function (n: number, prec: number) {
                const k = Math.pow(10, prec);
                return "" + Math.round(n * k) / k;
            };

        if (decimals === null || decimals === _undefined) {
            s = ("" + n).split(".");
            prec = 2;
        } else {
            s = (prec ? toFixedFix(n, prec) : "" + Math.round(n)).split(".");
        }

        let i: number, s0 = "";
        const len = s[0].length;
        if (len > 3) {
            for (i = 0; i < len; i += 1) {
                s0 = s0 + s[0].charAt(i);
                if (i < (len - 1) && (len - i - 1) % 3 === 0) {
                    s0 = s0 + sep;
                }
            }
            s[0] = s0;
        }

        if ((s[1] || "").length < prec) {
            s[1] = s[1] || "";
            s[1] += new Array(prec - s[1].length + 1).join("0");
        }
        return s.join(dec);
    }
    static stripNonNumeric(str: string): string {
        str += "";
        const rgx = /^\d|\.|-$/;
        let out = "";
        for (let i = 0; i < str.length; i++) {
            if (rgx.test(str.charAt(i))) {
                if (!((str.charAt(i) === "." && out.indexOf(".") !== -1) ||
                    (str.charAt(i) === "-" && out.length !== 0))) {
                    out += str.charAt(i);
                }
            }
        }
        return out;
    }
    static padLeft(val: string, len: number, pad: string): string {
        if (!val) {
            val = "";
        }
        pad = pad || " ";
        if (val.length >= len) {
            return val;
        }
        const str = new Array(len).join(pad[0]);
        return (str + val).slice(-len);
    }
    static fastPadLeft(val: string, pad: string): string {
        if (!val) {
            val = "";
        }
        if (val.length >= pad.length) {
            return val;
        }
        return (pad + val).slice(-pad.length);
    }
    static trimQuotes(val: string): string {
        if (!val) {
            return "";
        }
        const len = val.length;
        let start = 0, end = len, ch: string;
        for (let i = 0; i < len; i += 1) {
            ch = val.charAt(i);
            if (ch === " " || ch === "'" || ch === '"') {
                start = i + 1;
            } else {
                break;
            }
        }
        for (let j = len - 1; j >= start; j -= 1) {
            ch = val.charAt(j);
            if (ch === " " || ch === "'" || ch === '"') {
                end = j;
            } else {
                break;
            }
        }
        if (start === 0 && end === len) {
            return val;
        } else {
            return (end > start) ? val.substring(start, end) : "";
        }
    }
    static trimBrackets(val: string): string {
        if (!val) {
            return "";
        }
        const len = val.length;
        let start = 0, end = len, ch: string;
        for (let i = 0; i < len; i += 1) {
            ch = val.charAt(i);
            if (ch === " " || ch === "[") {
                start = i + 1;
            } else {
                break;
            }
        }
        for (let j = len - 1; j >= start; j -= 1) {
            ch = val.charAt(j);
            if (ch === " " || ch === "]") {
                end = j;
            } else {
                break;
            }
        }
        if (start === 0 && end === len) {
            return val;
        } else {
            return (end > start) ? val.substring(start, end) : "";
        }
    }
}

const { trim } = StringUtils;