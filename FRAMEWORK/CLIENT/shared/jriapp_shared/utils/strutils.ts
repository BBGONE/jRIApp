/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
const _undefined: any = void (0), trimQuotsRX = /^(['"])+|(['"])+$/g, trimBracketsRX = /^(\[)+|(\])+$/g, trimSpaceRX = /^\s+|\s+$/g;


export class StringUtils {
    private static ERR_STRING_FORMAT_INVALID = "String format has invalid expression value: ";

    static endsWith(str: string, suffix: string): boolean {
        return (!str || !suffix) ? false : (str.substr(str.length - suffix.length) === suffix);
    }
    static startsWith(str: string, prefix: string): boolean {
        return (!str || !prefix) ? false : (str.substr(0, prefix.length) === prefix);
    }
    static fastTrim(str: string): string {
        return (!str) ? str : str.replace(trimSpaceRX, "");
    }
    static trim(str: string, chars?: string): string {
        return (!chars) ? StringUtils.fastTrim(str) : StringUtils.ltrim(StringUtils.rtrim(str, chars), chars);
    }
    static ltrim(str: string, chars?: string): string {
        if (!str) {
            return str;
        }
        chars = chars || "\\s";
        return str.replace(new RegExp("^[" + chars + "]+", "g"), "");
    }
    static rtrim(str: string, chars?: string): string {
        if (!str) {
            return str;
        }
        chars = chars || "\\s";
        return str.replace(new RegExp("[" + chars + "]+$", "g"), "");
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
                    throw new Error(StringUtils.ERR_STRING_FORMAT_INVALID + formatStr);
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
                throw new Error(StringUtils.ERR_STRING_FORMAT_INVALID + formatStr);
            }
            const brace = formatStr.substring(i, close);
            const colonIndex = brace.indexOf(":");
            const argNumber = parseInt((colonIndex < 0) ? brace : brace.substring(0, colonIndex), 10);
            if (isNaN(argNumber)) {
                throw new Error(StringUtils.ERR_STRING_FORMAT_INVALID + formatStr);
            }
            const argFormat = (colonIndex < 0) ? "" : brace.substring(colonIndex + 1);
            let arg = args[argNumber];
            if (arg === _undefined || arg === null) {
                arg = "";
            }

            if (arg.format) {
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
    static formatNumber(num: any, decimals?: number, decPoint?: string, thousandsSep?: string) {
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
    static stripNonNumeric(str: string) {
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
    static padLeft(val: string, len: number, pad: string) {
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
    static fastPadLeft(val: string, pad: string) {
        if (!val) {
            val = "";
        }
        if (val.length >= pad.length) {
            return val;
        }
        return (pad + val).slice(-pad.length);
    }
    static trimQuotes(val: string) {
        if (!val) {
            return "";
        }
        return StringUtils.fastTrim(val.replace(trimQuotsRX, ""));
    }
    static trimBrackets(val: string) {
        if (!val) {
            return "";
        }
        return StringUtils.fastTrim(val.replace(trimBracketsRX, ""));
    }
}
