/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import * as coreMOD from "../jriapp_core/shared";

const undefined: any = void (0);

export class StringUtils {
    private static ERR_STRING_FORMAT_INVALID = "String format has invalid expression value: ";

    static endsWith(str: string, suffix: string): boolean {
        if (!str || !suffix)
            return false;
        return (str.substr(str.length - suffix.length) === suffix);
    }
    static startsWith(str: string, prefix: string): boolean {
        if (!str || !prefix)
            return false;
        return (str.substr(0, prefix.length) === prefix);
    }
    static fastTrim(str: string): string {
        if (!str)
            return str;
        return str.replace(/^\s+|\s+$/g, "");
    }
    static trim(str: string, chars?: string): string {
        if (!chars) {
            return StringUtils.fastTrim(str);
        }
        return StringUtils.ltrim(StringUtils.rtrim(str, chars), chars);
    }
    static ltrim(str: string, chars?: string): string {
        if (!str)
            return str;
        chars = chars || "\\s";
        return str.replace(new RegExp("^[" + chars + "]+", "g"), "");
    }
    static rtrim(str: string, chars?: string): string {
        if (!str)
            return str;
        chars = chars || "\\s";
        return str.replace(new RegExp("[" + chars + "]+$", "g"), "");
    }
    static format(format_str: string, ...args: any[]): string {
        let result = "";
        for (let i = 0; ;) {
            let open = format_str.indexOf("{", i);
            let close = format_str.indexOf("}", i);
            if ((open < 0) && (close < 0)) {
                result += format_str.slice(i);
                break;
            }
            if ((close > 0) && ((close < open) || (open < 0))) {
                if (format_str.charAt(close + 1) !== "}") {
                    throw new Error(StringUtils.ERR_STRING_FORMAT_INVALID + format_str);
                }
                result += format_str.slice(i, close + 1);
                i = close + 2;
                continue;
            }
            result += format_str.slice(i, open);
            i = open + 1;
            if (format_str.charAt(i) === "{") {
                result += "{";
                i++;
                continue;
            }
            if (close < 0) throw new Error(StringUtils.ERR_STRING_FORMAT_INVALID + format_str);
            let brace = format_str.substring(i, close);
            let colonIndex = brace.indexOf(":");
            let argNumber = parseInt((colonIndex < 0) ? brace : brace.substring(0, colonIndex), 10);
            if (isNaN(argNumber)) throw new Error(StringUtils.ERR_STRING_FORMAT_INVALID + format_str);
            let argFormat = (colonIndex < 0) ? "" : brace.substring(colonIndex + 1);
            let arg = args[argNumber];
            if (arg === undefined || arg === null) {
                arg = "";
            }

            if (arg.format) {
                result += arg.format(argFormat);
            }
            else
                result += arg.toString();
            i = close + 1;
        }
        return result;
    }
    /**
     *    Usage:     formatNumber(123456.789, 2, '.', ',');
     *    result:    123,456.79
    **/
    static formatNumber(num: any, decimals?: number, dec_point?: string, thousands_sep?: string) {
        num = (num + "").replace(/[^0-9+-Ee.]/g, "");
        let n = !isFinite(+num) ? 0 : +num,
            prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
            sep = (thousands_sep === undefined) ? "," : thousands_sep,
            dec = (dec_point === undefined) ? "." : dec_point,
            s = [""],
            // Fix for IE parseFloat(0.55).toFixed(0) = 0;
            toFixedFix = function (n: number, prec: number) {
                let k = Math.pow(10, prec);
                return "" + Math.round(n * k) / k;
            };

        if (decimals === null || decimals === undefined) {
            s = ("" + n).split(".");
            prec = 2;
        }
        else
            s = (prec ? toFixedFix(n, prec) : "" + Math.round(n)).split(".");

        let i: number, s0 = "", len = s[0].length;
        if (len > 3) {
            for (i = 0; i < len; i += 1) {
                s0 = s0 + s[0].charAt(i);
                if (i < (len - 1) && (len - i - 1) % 3 === 0)
                    s0 = s0 + sep;
            }
            s[0] = s0;
        }
        if ((s[1] || "").length < prec) {
            s[1] = s[1] || "";
            s[1] += new Array(prec - s[1].length + 1).join("0");
        }
        return s.join(dec);
    }
    static stripNonNumeric(str: string) {
        str += "";
        let rgx = /^\d|\.|-$/;
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
    static padLeft(val: string, length: number, str: string) {
        str = str || " ";
        return val.length >= length
            ? val
            : (new Array(Math.ceil((length - val.length) / str.length) + 1).join(str)).substr(0, (length - val.length)) + val;
    }
};