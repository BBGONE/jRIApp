var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define("jriapp_shared/const", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DEBUG_LEVEL;
    (function (DEBUG_LEVEL) {
        DEBUG_LEVEL[DEBUG_LEVEL["NONE"] = 0] = "NONE";
        DEBUG_LEVEL[DEBUG_LEVEL["NORMAL"] = 1] = "NORMAL";
        DEBUG_LEVEL[DEBUG_LEVEL["HIGH"] = 2] = "HIGH";
    })(DEBUG_LEVEL = exports.DEBUG_LEVEL || (exports.DEBUG_LEVEL = {}));
    exports.APP_NAME = "app";
    exports.DUMY_ERROR = "DUMMY_ERROR";
});
define("jriapp_shared/utils/ideferred", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var PromiseState;
    (function (PromiseState) {
        PromiseState[PromiseState["Pending"] = 0] = "Pending";
        PromiseState[PromiseState["ResolutionInProgress"] = 1] = "ResolutionInProgress";
        PromiseState[PromiseState["Resolved"] = 2] = "Resolved";
        PromiseState[PromiseState["Rejected"] = 3] = "Rejected";
    })(PromiseState = exports.PromiseState || (exports.PromiseState = {}));
});
define("jriapp_shared/int", ["require", "exports", "jriapp_shared/const"], function (require, exports, const_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Config = window.jriapp_config || {};
    exports.DebugLevel = (!exports.Config.debugLevel) ? const_1.DEBUG_LEVEL.NONE : exports.Config.debugLevel;
    var TPriority;
    (function (TPriority) {
        TPriority[TPriority["Normal"] = 0] = "Normal";
        TPriority[TPriority["AboveNormal"] = 1] = "AboveNormal";
        TPriority[TPriority["High"] = 2] = "High";
    })(TPriority = exports.TPriority || (exports.TPriority = {}));
});
define("jriapp_shared/utils/checks", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var GUID_RX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    var Checks = (function () {
        function Checks() {
        }
        Checks.isHasProp = function (obj, prop) {
            return (!obj) ? false : (prop in obj);
        };
        Checks.isNull = function (a) {
            return a === null;
        };
        Checks.isUndefined = function (a) {
            return a === Checks.undefined;
        };
        Checks.isNt = function (a) {
            return (a === null || a === Checks.undefined);
        };
        Checks.isObject = function (a) {
            return (Checks.isNt(a)) ? false : (typeof a === "object");
        };
        Checks.isSimpleObject = function (a) {
            return (!a) ? false : ((typeof a === "object") && Object.prototype === Object.getPrototypeOf(a));
        };
        Checks.isString = function (a) {
            return (Checks.isNt(a)) ? false : ((typeof a === "string") || (typeof a === "object" && a instanceof String));
        };
        Checks.isFunc = function (a) {
            return (Checks.isNt(a)) ? false : ((typeof a === "function") || (typeof a === "object" && a instanceof Function));
        };
        Checks.isBoolean = function (a) {
            return (Checks.isNt(a)) ? false : ((typeof a === "boolean") || (typeof a === "object" && a instanceof Boolean));
        };
        Checks.isDate = function (a) {
            return (Checks.isNt(a)) ? false : (typeof a === "object" && a instanceof Date);
        };
        Checks.isNumber = function (a) {
            return (Checks.isNt(a)) ? false : (typeof a === "number" || (typeof a === "object" && a instanceof Number));
        };
        Checks.isNumeric = function (a) {
            return Checks.isNumber(a) || (Checks.isString(a) && !isNaN(Number(a)));
        };
        Checks.isBoolString = function (a) {
            return (Checks.isNt(a)) ? false : (a === "true" || a === "false");
        };
        Checks.isGuid = function (a) {
            return Checks.isString(a) && GUID_RX.test(a);
        };
        Checks.isArray = function (a) {
            return (!a) ? false : Array.isArray(a);
        };
        Checks.isThenable = function (a) {
            return (!a) ? false : ((typeof (a) === "object") && Checks.isFunc(a.then));
        };
        Checks.undefined = void (0);
        return Checks;
    }());
    exports.Checks = Checks;
});
define("jriapp_shared/utils/strUtils", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var _undefined = void (0), trimQuotsRX = /^(['"])+|(['"])+$/g, trimBracketsRX = /^(\[)+|(\])+$/g, trimSpaceRX = /^\s+|\s+$/g;
    var StringUtils = (function () {
        function StringUtils() {
        }
        StringUtils.endsWith = function (str, suffix) {
            return (!str || !suffix) ? false : (str.substr(str.length - suffix.length) === suffix);
        };
        StringUtils.startsWith = function (str, prefix) {
            return (!str || !prefix) ? false : (str.substr(0, prefix.length) === prefix);
        };
        StringUtils.fastTrim = function (str) {
            return (!str) ? str : str.replace(trimSpaceRX, "");
        };
        StringUtils.trim = function (str, chars) {
            return (!chars) ? StringUtils.fastTrim(str) : StringUtils.ltrim(StringUtils.rtrim(str, chars), chars);
        };
        StringUtils.ltrim = function (str, chars) {
            if (!str) {
                return str;
            }
            chars = chars || "\\s";
            return str.replace(new RegExp("^[" + chars + "]+", "g"), "");
        };
        StringUtils.rtrim = function (str, chars) {
            if (!str) {
                return str;
            }
            chars = chars || "\\s";
            return str.replace(new RegExp("[" + chars + "]+$", "g"), "");
        };
        StringUtils.format = function (formatStr) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var result = "";
            for (var i = 0;;) {
                var open_1 = formatStr.indexOf("{", i);
                var close_1 = formatStr.indexOf("}", i);
                if ((open_1 < 0) && (close_1 < 0)) {
                    result += formatStr.slice(i);
                    break;
                }
                if ((close_1 > 0) && ((close_1 < open_1) || (open_1 < 0))) {
                    if (formatStr.charAt(close_1 + 1) !== "}") {
                        throw new Error(StringUtils.ERR_STRING_FORMAT_INVALID + formatStr);
                    }
                    result += formatStr.slice(i, close_1 + 1);
                    i = close_1 + 2;
                    continue;
                }
                result += formatStr.slice(i, open_1);
                i = open_1 + 1;
                if (formatStr.charAt(i) === "{") {
                    result += "{";
                    i++;
                    continue;
                }
                if (close_1 < 0) {
                    throw new Error(StringUtils.ERR_STRING_FORMAT_INVALID + formatStr);
                }
                var brace = formatStr.substring(i, close_1);
                var colonIndex = brace.indexOf(":");
                var argNumber = parseInt((colonIndex < 0) ? brace : brace.substring(0, colonIndex), 10);
                if (isNaN(argNumber)) {
                    throw new Error(StringUtils.ERR_STRING_FORMAT_INVALID + formatStr);
                }
                var argFormat = (colonIndex < 0) ? "" : brace.substring(colonIndex + 1);
                var arg = args[argNumber];
                if (arg === _undefined || arg === null) {
                    arg = "";
                }
                if (arg.format) {
                    result += arg.format(argFormat);
                }
                else {
                    result += arg.toString();
                }
                i = close_1 + 1;
            }
            return result;
        };
        StringUtils.formatNumber = function (num, decimals, decPoint, thousandsSep) {
            num = (num + "").replace(/[^0-9+-Ee.]/g, "");
            var n = !isFinite(+num) ? 0 : +num, dec = (decPoint === _undefined) ? "." : decPoint, sep = (thousandsSep === _undefined) ? "," : thousandsSep;
            var prec = !isFinite(+decimals) ? 0 : Math.abs(decimals), s = [""];
            var toFixedFix = function (n, prec) {
                var k = Math.pow(10, prec);
                return "" + Math.round(n * k) / k;
            };
            if (decimals === null || decimals === _undefined) {
                s = ("" + n).split(".");
                prec = 2;
            }
            else {
                s = (prec ? toFixedFix(n, prec) : "" + Math.round(n)).split(".");
            }
            var i, s0 = "";
            var len = s[0].length;
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
        };
        StringUtils.stripNonNumeric = function (str) {
            str += "";
            var rgx = /^\d|\.|-$/;
            var out = "";
            for (var i = 0; i < str.length; i++) {
                if (rgx.test(str.charAt(i))) {
                    if (!((str.charAt(i) === "." && out.indexOf(".") !== -1) ||
                        (str.charAt(i) === "-" && out.length !== 0))) {
                        out += str.charAt(i);
                    }
                }
            }
            return out;
        };
        StringUtils.padLeft = function (val, len, pad) {
            if (!val) {
                val = "";
            }
            pad = pad || " ";
            if (val.length >= len) {
                return val;
            }
            var str = new Array(len).join(pad[0]);
            return (str + val).slice(-len);
        };
        StringUtils.fastPadLeft = function (val, pad) {
            if (!val) {
                val = "";
            }
            if (val.length >= pad.length) {
                return val;
            }
            return (pad + val).slice(-pad.length);
        };
        StringUtils.trimQuotes = function (val) {
            if (!val) {
                return "";
            }
            return StringUtils.fastTrim(val.replace(trimQuotsRX, ""));
        };
        StringUtils.trimBrackets = function (val) {
            if (!val) {
                return "";
            }
            return StringUtils.fastTrim(val.replace(trimBracketsRX, ""));
        };
        StringUtils.ERR_STRING_FORMAT_INVALID = "String format has invalid expression value: ";
        return StringUtils;
    }());
    exports.StringUtils = StringUtils;
});
define("jriapp_shared/utils/sysutils", ["require", "exports", "jriapp_shared/utils/checks", "jriapp_shared/utils/strUtils"], function (require, exports, checks_1, strUtils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var checks = checks_1.Checks, strUtils = strUtils_1.StringUtils;
    var INDEX_PROP_RX = /(\b\w+\b)?\s*(\[.*?\])/gi, trimQuotsRX = /^(['"])+|(['"])+$/g, trimBracketsRX = /^(\[)+|(\])+$/g, trimSpaceRX = /^\s+|\s+$/g, allTrims = [trimBracketsRX, trimSpaceRX, trimQuotsRX, trimSpaceRX];
    var SysUtils = (function () {
        function SysUtils() {
        }
        SysUtils.isEditable = function (obj) {
            var isBO = SysUtils.isBaseObj(obj);
            return isBO && checks.isFunc(obj.beginEdit) && !!obj.endEdit && !!obj.cancelEdit && checks_1.Checks.isHasProp(obj, "isEditing");
        };
        SysUtils.isSubmittable = function (obj) {
            return !!obj && checks.isFunc(obj.submitChanges) && checks.isHasProp(obj, "isCanSubmit");
        };
        SysUtils.isErrorNotification = function (obj) {
            if (!obj) {
                return false;
            }
            if (!checks.isFunc(obj.getIErrorNotification)) {
                return false;
            }
            var tmp = obj.getIErrorNotification();
            return !!tmp && checks.isFunc(tmp.getIErrorNotification);
        };
        SysUtils.getErrorNotification = function (obj) {
            if (!obj) {
                return null;
            }
            else if (!!obj._aspect && SysUtils.isErrorNotification(obj._aspect)) {
                return obj._aspect.getIErrorNotification();
            }
            else if (SysUtils.isErrorNotification(obj)) {
                return obj.getIErrorNotification();
            }
            return null;
        };
        SysUtils.getEditable = function (obj) {
            if (!obj) {
                return null;
            }
            else if (!!obj._aspect && SysUtils.isEditable(obj._aspect)) {
                return obj._aspect;
            }
            else if (SysUtils.isEditable(obj)) {
                return obj;
            }
            return null;
        };
        SysUtils.getSubmittable = function (obj) {
            if (!obj) {
                return null;
            }
            else if (!!obj._aspect && SysUtils.isSubmittable(obj._aspect)) {
                return obj._aspect;
            }
            else if (SysUtils.isSubmittable(obj)) {
                return obj;
            }
            return null;
        };
        SysUtils.getPathParts = function (path) {
            var parts = (!path) ? [] : path.split("."), parts2 = [];
            parts.forEach(function (part) {
                part = part.trim();
                if (!part) {
                    throw new Error("Invalid path: " + path);
                }
                var obj = null, matches = INDEX_PROP_RX.exec(part);
                if (!!matches) {
                    while (!!matches) {
                        if (!!matches[1]) {
                            if (!!obj) {
                                throw new Error("Invalid path: " + path);
                            }
                            obj = matches[1].trim();
                            if (!!obj) {
                                parts2.push(obj);
                            }
                        }
                        var val = matches[2];
                        if (!!val) {
                            for (var i = 0; i < allTrims.length; i += 1) {
                                val = val.replace(allTrims[i], "");
                            }
                            if (!!val) {
                                parts2.push("[" + val + "]");
                            }
                        }
                        matches = INDEX_PROP_RX.exec(part);
                    }
                }
                else {
                    parts2.push(part);
                }
            });
            return parts2;
        };
        SysUtils.getProp = function (obj, prop) {
            var self = SysUtils;
            if (!prop) {
                return obj;
            }
            if (self.isBaseObj(obj) && obj.getIsStateDirty()) {
                return checks.undefined;
            }
            if (strUtils.startsWith(prop, "[")) {
                if (self.isCollection(obj)) {
                    prop = strUtils.trimBrackets(prop);
                    return self.getItemByProp(obj, prop);
                }
                else if (checks.isArray(obj)) {
                    prop = strUtils.trimBrackets(prop);
                    return obj[parseInt(prop, 10)];
                }
                else if (self.isPropBag(obj)) {
                    return obj.getProp(prop);
                }
            }
            return obj[prop];
        };
        SysUtils.setProp = function (obj, prop, val) {
            var self = SysUtils;
            if (!prop) {
                throw new Error("Invalid operation: Empty Property name");
            }
            if (self.isBaseObj(obj) && obj.getIsStateDirty()) {
                return;
            }
            if (strUtils.startsWith(prop, "[")) {
                if (checks.isArray(obj)) {
                    prop = strUtils.trimBrackets(prop);
                    obj[parseInt(prop, 10)] = val;
                    return;
                }
                else if (self.isPropBag(obj)) {
                    obj.setProp(prop, val);
                    return;
                }
            }
            obj[prop] = val;
        };
        SysUtils.resolvePath = function (obj, path) {
            var self = SysUtils;
            if (!path) {
                return obj;
            }
            var parts = self.getPathParts(path), maxindex = parts.length - 1;
            var res = obj;
            for (var i = 0; i < maxindex; i += 1) {
                res = self.getProp(res, parts[i]);
                if (!res) {
                    return checks.undefined;
                }
            }
            return self.getProp(res, parts[maxindex]);
        };
        SysUtils.isBaseObj = function () { return false; };
        SysUtils.isBinding = function () { return false; };
        SysUtils.isPropBag = function (obj) {
            return !!obj && obj.isPropertyBag;
        };
        SysUtils.isCollection = function () { return false; };
        SysUtils.getItemByProp = function () { return null; };
        SysUtils.isValidationError = function () { return false; };
        return SysUtils;
    }());
    exports.SysUtils = SysUtils;
});
define("jriapp_shared/utils/coreutils", ["require", "exports", "jriapp_shared/utils/strUtils", "jriapp_shared/utils/checks"], function (require, exports, strutils_1, checks_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var checks = checks_2.Checks, strUtils = strutils_1.StringUtils;
    var UUID_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
    var NEWID_MAP = {};
    var CoreUtils = (function () {
        function CoreUtils() {
        }
        CoreUtils.getNewID = function (prefix) {
            if (prefix === void 0) { prefix = "*"; }
            var id = NEWID_MAP[prefix] || 0;
            NEWID_MAP[prefix] = id + 1;
            return (prefix === "*") ? id.toString(36) : (prefix + "_" + id.toString(36));
        };
        CoreUtils.setValue = function (root, namePath, val, checkOverwrite, separator) {
            if (checkOverwrite === void 0) { checkOverwrite = false; }
            if (separator === void 0) { separator = "."; }
            var parts = namePath.split(separator), len = parts.length;
            var parent = root;
            for (var i = 0; i < len - 1; i += 1) {
                if (!parent[parts[i]]) {
                    parent[parts[i]] = {};
                }
                parent = parent[parts[i]];
            }
            var n = parts[len - 1];
            if (!!checkOverwrite && (parent[n] !== checks.undefined)) {
                throw new Error(strUtils.format(CoreUtils.ERR_OBJ_ALREADY_REGISTERED, namePath));
            }
            parent[n] = val;
        };
        CoreUtils.getValue = function (root, namePath, separator) {
            if (separator === void 0) { separator = "."; }
            var parts = namePath.split(separator);
            var res, parent = root;
            for (var i = 0; i < parts.length; i += 1) {
                res = parent[parts[i]];
                if (res === checks.undefined) {
                    return null;
                }
                parent = res;
            }
            return res;
        };
        CoreUtils.removeValue = function (root, namePath, separator) {
            if (separator === void 0) { separator = "."; }
            var parts = namePath.split(separator);
            var parent = root;
            for (var i = 0; i < parts.length - 1; i += 1) {
                if (!parent[parts[i]]) {
                    return null;
                }
                parent = parent[parts[i]];
            }
            var n = parts[parts.length - 1], val = parent[n];
            if (val !== checks_2.Checks.undefined) {
                delete parent[n];
            }
            return val;
        };
        CoreUtils.resolveOwner = function (obj, path, separator) {
            if (separator === void 0) { separator = "."; }
            var parts = path.split(separator), len = parts.length;
            if (len === 1) {
                return obj;
            }
            var res = obj;
            for (var i = 0; i < len - 1; i += 1) {
                res = res[parts[i]];
                if (res === checks.undefined || res === null) {
                    return res;
                }
            }
            return res;
        };
        CoreUtils.uuid = function (len, radix) {
            var i;
            var chars = UUID_CHARS, uuid = [], rnd = Math.random;
            radix = radix || chars.length;
            if (!!len) {
                for (i = 0; i < len; i += 1) {
                    uuid[i] = chars[0 | rnd() * radix];
                }
            }
            else {
                var r = void 0;
                uuid[8] = uuid[13] = uuid[18] = uuid[23] = "-";
                uuid[14] = "4";
                for (i = 0; i < 36; i += 1) {
                    if (!uuid[i]) {
                        r = 0 | rnd() * 16;
                        uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r & 0xf];
                    }
                }
            }
            return uuid.join("");
        };
        CoreUtils.parseBool = function (a) {
            if (checks.isBoolean(a)) {
                return a;
            }
            var v = strUtils.trim(a).toLowerCase();
            if (v === "false") {
                return false;
            }
            else if (v === "true") {
                return true;
            }
            else {
                throw new Error(strUtils.format("parseBool, argument: {0} is not a valid boolean string", a));
            }
        };
        CoreUtils.round = function (num, decimals) {
            return parseFloat(num.toFixed(decimals));
        };
        CoreUtils.clone = function (obj, target) {
            if (!obj) {
                return obj;
            }
            var res;
            if (checks.isArray(obj)) {
                res = [];
                var len = obj.length;
                for (var i = 0; i < len; i += 1) {
                    res.push(CoreUtils.clone(obj[i], null));
                }
            }
            else if (checks.isSimpleObject(obj)) {
                res = target || {};
                var keys = Object.getOwnPropertyNames(obj), len = keys.length;
                for (var i = 0; i < len; i += 1) {
                    var p = keys[i];
                    res[p] = CoreUtils.clone(obj[p], null);
                }
            }
            else {
                res = obj;
            }
            return res;
        };
        CoreUtils.merge = function (source, target) {
            if (!target) {
                target = {};
            }
            if (!source) {
                return target;
            }
            return CoreUtils.extend(target, source);
        };
        CoreUtils.extend = function (target) {
            var source = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                source[_i - 1] = arguments[_i];
            }
            if (checks.isNt(target)) {
                throw new TypeError("extend: Cannot convert first argument to object");
            }
            var to = Object(target);
            for (var i = 0; i < source.length; i++) {
                var nextSource = source[i];
                if (nextSource === undefined || nextSource === null) {
                    continue;
                }
                var keys = Object.keys(Object(nextSource)), len = keys.length;
                for (var nextIndex = 0; nextIndex < len; nextIndex++) {
                    var nextKey = keys[nextIndex], desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                    if (desc !== undefined && desc.enumerable) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
            return to;
        };
        CoreUtils.memoize = function (callback) {
            var value;
            return function () {
                if (!!callback) {
                    value = callback();
                    callback = checks.undefined;
                }
                return value;
            };
        };
        CoreUtils.forEachProp = function (obj, fn) {
            if (!obj) {
                return;
            }
            var names = Object.keys(obj), len = names.length;
            for (var i = 0; i < len; i += 1) {
                fn(names[i], obj[names[i]]);
            }
        };
        CoreUtils.assignStrings = function (target, source) {
            if (checks.isNt(target)) {
                target = {};
            }
            if (!checks.isSimpleObject(source)) {
                return target;
            }
            var keys = Object.keys(source), len = keys.length;
            for (var i = 0; i < len; i += 1) {
                var p = keys[i], tval = target[p], sval = source[p];
                if (checks.isSimpleObject(sval)) {
                    target[p] = CoreUtils.assignStrings(tval, sval);
                }
                else if (checks.isString(sval)) {
                    target[p] = sval;
                }
            }
            return target;
        };
        CoreUtils.ERR_OBJ_ALREADY_REGISTERED = "an Object with the name: {0} is already registered and can not be overwritten";
        CoreUtils.getTimeZoneOffset = (function () {
            var dt = new Date(), tz = dt.getTimezoneOffset();
            return function () { return tz; };
        })();
        CoreUtils.hasProp = checks.isHasProp;
        return CoreUtils;
    }());
    exports.CoreUtils = CoreUtils;
});
define("jriapp_shared/lang", ["require", "exports", "jriapp_shared/utils/coreutils"], function (require, exports, coreutils_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var coreUtils = coreutils_1.CoreUtils;
    function assign(target, source) {
        return coreUtils.assignStrings(target, source);
    }
    exports.assign = assign;
    var _ERRS = {
        ERR_OBJ_ALREADY_REGISTERED: "an Object with the name: {0} is already registered and can not be overwritten",
        ERR_APP_NEED_JQUERY: "The project is dependent on JQuery and can not function properly without it",
        ERR_ASSERTION_FAILED: 'The Assertion "{0}" failed',
        ERR_BINDING_CONTENT_NOT_FOUND: "BindingContent is not found",
        ERR_DBSET_READONLY: "TDbSet: {0} is readOnly and can not be edited",
        ERR_DBSET_INVALID_FIELDNAME: "TDbSet: {0} has no field with the name: {1}",
        ERR_FIELD_READONLY: "Field is readOnly and can not be edited",
        ERR_FIELD_ISNOT_NULLABLE: "Field must not be empty",
        ERR_FIELD_WRONG_TYPE: "Value {0} has a wrong datatype. It must have {1} datatype.",
        ERR_FIELD_MAXLEN: "Value exceeds maximum field length: {0}",
        ERR_FIELD_DATATYPE: "Unknown field data type: {0}",
        ERR_FIELD_REGEX: "Value {0} is not validated for correctness",
        ERR_FIELD_RANGE: "Value {0} is outside the allowed range {1}",
        ERR_EVENT_INVALID: "Invalid event name: {0}",
        ERR_EVENT_INVALID_FUNC: "Invalid event function value",
        ERR_MODULE_NOT_REGISTERED: "Module: {0} is not registered",
        ERR_MODULE_ALREDY_REGISTERED: "Module: {0} is already registered",
        ERR_PROP_NAME_EMPTY: "Empty property name parameter",
        ERR_PROP_NAME_INVALID: 'The object does not have a property with a name: "{0}"',
        ERR_GLOBAL_SINGLTON: "There must be only one instance of Global object",
        ERR_TEMPLATE_ALREADY_REGISTERED: "TEMPLATE with the name: {0} is already registered",
        ERR_TEMPLATE_NOTREGISTERED: "TEMPLATE with the name: {0} is not registered",
        ERR_TEMPLATE_GROUP_NOTREGISTERED: "TEMPLATE's group: {0} is not registered",
        ERR_TEMPLATE_HAS_NO_ID: "TEMPLATE inside SCRIPT tag must have an ID attribute",
        ERR_CONVERTER_NOTREGISTERED: "Converter: {0} is not registered",
        ERR_JQUERY_DATEPICKER_NOTFOUND: "Application is dependent on JQuery.UI.datepicker",
        ERR_PARAM_INVALID: "Parameter: {0} has invalid value: {1}",
        ERR_PARAM_INVALID_TYPE: "Parameter: {0} has invalid type. It must be {1}",
        ERR_KEY_IS_EMPTY: "Key value must not be empty",
        ERR_KEY_IS_NOTFOUND: "Can not find an item with the key: {0}",
        ERR_ITEM_IS_ATTACHED: "Operation invalid. The reason: Item already has been attached",
        ERR_ITEM_IS_DETACHED: "Operation invalid. The reason: Item is detached",
        ERR_ITEM_IS_NOTFOUND: "Operation invalid. The reason: Item is not found",
        ERR_ITEM_NAME_COLLISION: 'The "{0}" TDbSet\'s field name: "{1}" is invalid, because a property with that name already exists on the entity',
        ERR_DICTKEY_IS_NOTFOUND: "Dictionary keyName: {0} does not exist in item's properties",
        ERR_DICTKEY_IS_EMPTY: "Dictionary key property: {0} must be not empty",
        ERR_CONV_INVALID_DATE: "Cannot parse string value: {0} to a valid Date",
        ERR_CONV_INVALID_NUM: "Cannot parse string value: {0} to a valid Numeric",
        ERR_QUERY_NAME_NOTFOUND: "Can not find Query with the name: {0}",
        ERR_QUERY_BETWEEN: '"BETWEEN" Query operator expects two values',
        ERR_QUERY_OPERATOR_INVALID: "Invalid query operator {0}",
        ERR_OPER_REFRESH_INVALID: "Refresh operation can not be done with items in Detached or Added State",
        ERR_CALC_FIELD_DEFINE: 'Field: "{0}" definition error: Calculated fields can be dependent only on items fields',
        ERR_CALC_FIELD_SELF_DEPEND: 'Field: "{0}" definition error: Calculated fields can not be dependent on themselves',
        ERR_DOMAIN_CONTEXT_INITIALIZED: "DbContext already initialized",
        ERR_DOMAIN_CONTEXT_NOT_INITIALIZED: "DbContext is not initialized",
        ERR_SVC_METH_PARAM_INVALID: "Invalid parameter {0} value {1} for service method: {2} invocation",
        ERR_DB_LOAD_NO_QUERY: "Query parameter is not supplied",
        ERR_DBSET_NAME_INVALID: "Invalid dbSet Name: {0}",
        ERR_APP_NAME_NOT_UNIQUE: "Application instance with the name: {0} already exists",
        ERR_ELVIEW_NOT_REGISTERED: "Can not find registered element view with the name: {0}",
        ERR_ELVIEW_NOT_CREATED: "Can not create element view for element with Tag Name: {0}",
        ERR_BIND_TARGET_EMPTY: "Binding target is empty",
        ERR_BIND_TGTPATH_INVALID: "Binding targetPath has invalid value: {0}",
        ERR_BIND_MODE_INVALID: "Binding mode has invalid value: {0}",
        ERR_BIND_TARGET_INVALID: "Binding target must be a descendant of BaseObject",
        ERR_EXPR_BRACES_INVALID: "Expression {0} has no closing braces",
        ERR_APP_SETUP_INVALID: "Application's setUp method parameter must be a valid function",
        ERR_GRID_DATASRC_INVALID: "DataGrid's datasource must be a descendant of Collection type",
        ERR_COLLECTION_CHANGETYPE_INVALID: "Invalid Collection change type value: {0}",
        ERR_GRID_COLTYPE_INVALID: "Invalid Column type type value: {0}",
        ERR_PAGER_DATASRC_INVALID: "Pager datasource must be a descendant of Collection type",
        ERR_STACKPNL_DATASRC_INVALID: "StackPanel datasource must be a descendant of Collection type",
        ERR_STACKPNL_TEMPLATE_INVALID: "StackPanel templateID is not provided in the options",
        ERR_LISTBOX_DATASRC_INVALID: "ListBox datasource must be a descendant of Collection type",
        ERR_DATAFRM_DCTX_INVALID: "DataForm's dataContext must be a descendant of BaseObject type",
        ERR_DCTX_HAS_NO_FIELDINFO: "DataContext has no getFieldInfo method",
        ERR_TEMPLATE_ID_INVALID: "Element can not be found by its TemplateID: {0}",
        ERR_ITEM_DELETED_BY_ANOTHER_USER: "The record have been deleted by another user",
        ERR_ACCESS_DENIED: "The access is denied. Please, ask administrator to assign user rights to your account",
        ERR_CONCURRENCY: "The record has been modified by another user. Please, refresh record before editing",
        ERR_VALIDATION: "Data validation error",
        ERR_SVC_VALIDATION: "Data validation error: {0}",
        ERR_SVC_ERROR: "Service error: {0}",
        ERR_UNEXPECTED_SVC_ERROR: "Unexpected service error: {0}",
        ERR_ASSOC_NAME_INVALID: "Invalid association name: {0}",
        ERR_DATAVIEW_DATASRC_INVALID: "TDataView datasource must not be null and should be descendant of Collection type",
        ERR_DATAVIEW_FILTER_INVALID: "TDataView fn_filter option must be valid function which accepts entity and returns boolean value"
    };
    var PAGER = {
        firstText: "<<",
        lastText: ">>",
        previousText: "<",
        nextText: ">",
        pageInfo: "Page {0} of {1}",
        firstPageTip: "to first page",
        prevPageTip: "back to page {0}",
        nextPageTip: "next to page {0}",
        lastPageTip: "last page",
        showingTip: "showing result {0} to {1} of {2}",
        showTip: "show result {0} to {1} of {2}"
    };
    var VALIDATE = {
        errorInfo: "Validation errors:",
        errorField: "field:"
    };
    var TEXT = {
        txtEdit: "Edit",
        txtAddNew: "Add new",
        txtDelete: "Delete",
        txtCancel: "Cancel",
        txtOk: "Ok",
        txtRefresh: "Refresh",
        txtAskDelete: "Are you sure, you want to delete row?",
        txtSubmitting: "Submitting data ...",
        txtSave: "Save",
        txtClose: "Close",
        txtField: "Field"
    };
    var _STRS = { PAGER: PAGER, VALIDATE: VALIDATE, TEXT: TEXT };
    exports.ERRS = _ERRS;
    exports.STRS = _STRS;
});
define("jriapp_shared/errors", ["require", "exports", "jriapp_shared/const", "jriapp_shared/utils/sysutils", "jriapp_shared/lang"], function (require, exports, const_2, sysutils_1, lang_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var sys = sysutils_1.SysUtils;
    var BaseError = (function () {
        function BaseError(message) {
            this._message = message || "Error";
        }
        BaseError.prototype.toString = function () {
            return this._message;
        };
        Object.defineProperty(BaseError.prototype, "isDummy", {
            get: function () {
                return false;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseError.prototype, "message", {
            get: function () {
                return this._message;
            },
            enumerable: true,
            configurable: true
        });
        return BaseError;
    }());
    exports.BaseError = BaseError;
    var DummyError = (function (_super) {
        __extends(DummyError, _super);
        function DummyError(originalError) {
            var _this = _super.call(this, const_2.DUMY_ERROR) || this;
            _this._origError = originalError;
            return _this;
        }
        Object.defineProperty(DummyError.prototype, "isDummy", {
            get: function () {
                return true;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DummyError.prototype, "origError", {
            get: function () {
                return this._origError;
            },
            enumerable: true,
            configurable: true
        });
        return DummyError;
    }(BaseError));
    exports.DummyError = DummyError;
    var AbortError = (function (_super) {
        __extends(AbortError, _super);
        function AbortError(reason) {
            var _this = _super.call(this, const_2.DUMY_ERROR) || this;
            _this._reason = reason || "Operation Aborted";
            return _this;
        }
        Object.defineProperty(AbortError.prototype, "isDummy", {
            get: function () {
                return true;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AbortError.prototype, "reason", {
            get: function () {
                return this._reason;
            },
            enumerable: true,
            configurable: true
        });
        return AbortError;
    }(BaseError));
    exports.AbortError = AbortError;
    var AggregateError = (function (_super) {
        __extends(AggregateError, _super);
        function AggregateError(errors) {
            var _this = _super.call(this, "AggregateError") || this;
            _this._errors = errors || [];
            return _this;
        }
        Object.defineProperty(AggregateError.prototype, "errors", {
            get: function () {
                return this._errors;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AggregateError.prototype, "count", {
            get: function () {
                return this._errors.length;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AggregateError.prototype, "message", {
            get: function () {
                var hashMap = {};
                this._errors.forEach(function (err) {
                    if (!err) {
                        return;
                    }
                    var str = "";
                    if (err instanceof AggregateError) {
                        str = err.message;
                    }
                    else if (err instanceof Error) {
                        str = err.message;
                    }
                    else if (!!err.message) {
                        str = "" + err.message;
                    }
                    else {
                        str = "" + err;
                    }
                    hashMap[str] = "";
                });
                var msg = "";
                var errs = Object.keys(hashMap);
                errs.forEach(function (err) {
                    if (!!msg) {
                        msg += "\r\n";
                    }
                    msg += "" + err;
                });
                if (!msg) {
                    msg = "Aggregate Error";
                }
                return msg;
            },
            enumerable: true,
            configurable: true
        });
        AggregateError.prototype.toString = function () {
            return "AggregateError: " + "\r\n" + this.message;
        };
        return AggregateError;
    }(BaseError));
    exports.AggregateError = AggregateError;
    sys.isValidationError = function (obj) {
        return (!!obj && obj instanceof ValidationError);
    };
    var ValidationError = (function (_super) {
        __extends(ValidationError, _super);
        function ValidationError(validations, item) {
            var _this = this;
            var message = lang_1.ERRS.ERR_VALIDATION + "\r\n";
            validations.forEach(function (err, i) {
                if (i > 0) {
                    message = message + "\r\n";
                }
                if (!!err.fieldName) {
                    message = message + " " + lang_1.STRS.TEXT.txtField + ": '" + err.fieldName + "'  " + err.errors.join(", ");
                }
                else {
                    message = message + err.errors.join(", ");
                }
            });
            _this = _super.call(this, message) || this;
            _this._validations = validations;
            _this._item = item;
            return _this;
        }
        Object.defineProperty(ValidationError.prototype, "item", {
            get: function () {
                return this._item;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ValidationError.prototype, "validations", {
            get: function () {
                return this._validations;
            },
            enumerable: true,
            configurable: true
        });
        return ValidationError;
    }(BaseError));
    exports.ValidationError = ValidationError;
});
define("jriapp_shared/utils/error", ["require", "exports", "jriapp_shared/const", "jriapp_shared/errors"], function (require, exports, const_3, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ERROR = (function () {
        function ERROR() {
        }
        ERROR.addErrorHandler = function (name, handler) {
            ERROR._handlers[name] = handler;
        };
        ERROR.removeErrorHandler = function (name) {
            delete ERROR._handlers[name];
        };
        ERROR.handleError = function (sender, error, source) {
            if (ERROR.checkIsDummy(error)) {
                return true;
            }
            var handler, isHandled = false;
            handler = ERROR._handlers[const_3.APP_NAME];
            if (!!handler) {
                if (handler === sender) {
                    handler = null;
                }
                else {
                    isHandled = handler.handleError(error, source);
                }
            }
            if (!isHandled) {
                handler = ERROR._handlers["*"];
                if (!!handler) {
                    if (handler === sender) {
                        handler = null;
                    }
                    else {
                        isHandled = handler.handleError(error, source);
                    }
                }
            }
            return isHandled;
        };
        ERROR.throwDummy = function (err) {
            if (ERROR.checkIsDummy(err)) {
                throw err;
            }
            else {
                throw new errors_1.DummyError(err);
            }
        };
        ERROR.checkIsDummy = function (error) {
            return !!error && !!error.isDummy;
        };
        ERROR.checkIsAbort = function (error) {
            return !!error && (error instanceof errors_1.AbortError);
        };
        ERROR.reThrow = function (ex, isHandled) {
            if (!isHandled) {
                throw ex;
            }
            else {
                ERROR.throwDummy(ex);
            }
        };
        ERROR.abort = function (reason) {
            throw new errors_1.AbortError(reason);
        };
        ERROR._handlers = {};
        return ERROR;
    }());
    exports.ERROR = ERROR;
});
define("jriapp_shared/utils/weakmap", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var _undefined = void 0;
    var counter = (new Date().getTime()) % 1e9;
    function createWeakMap() {
        var win = window;
        if (!win.WeakMap) {
            win.WeakMap = WeakMap;
        }
        return new win.WeakMap();
    }
    exports.createWeakMap = createWeakMap;
    var WeakMap = (function () {
        function WeakMap() {
            this._name = "_wm_" + (Math.random() * 1e9 >>> 0) + (counter++ + "__");
        }
        WeakMap.prototype.set = function (key, value) {
            var entry = key[this._name];
            if (!!entry && entry[0] === key) {
                entry[1] = value;
            }
            else {
                Object.defineProperty(key, this._name, { value: [key, value], writable: true });
            }
            return this;
        };
        WeakMap.prototype.get = function (key) {
            var entry = key[this._name];
            return (!entry ? _undefined : (entry[0] === key ? entry[1] : _undefined));
        };
        WeakMap.prototype.delete = function (key) {
            var entry = key[this._name];
            if (!entry) {
                return false;
            }
            var hasValue = (entry[0] === key);
            entry[0] = entry[1] = _undefined;
            return hasValue;
        };
        WeakMap.prototype.has = function (key) {
            var entry = key[this._name];
            if (!entry) {
                return false;
            }
            return (entry[0] === key);
        };
        return WeakMap;
    }());
});
define("jriapp_shared/utils/debug", ["require", "exports", "jriapp_shared/const", "jriapp_shared/int"], function (require, exports, const_4, int_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DEBUG = (function () {
        function DEBUG() {
        }
        DEBUG.checkStartDebugger = function () {
            if (int_1.DebugLevel === const_4.DEBUG_LEVEL.HIGH) {
                debugger;
            }
        };
        DEBUG.isDebugging = function () {
            return int_1.DebugLevel > const_4.DEBUG_LEVEL.NONE;
        };
        return DEBUG;
    }());
    exports.DEBUG = DEBUG;
});
define("jriapp_shared/utils/eventhelper", ["require", "exports", "jriapp_shared/lang", "jriapp_shared/utils/checks", "jriapp_shared/utils/strUtils", "jriapp_shared/utils/debug"], function (require, exports, lang_2, checks_3, strutils_2, debug_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var checks = checks_3.Checks, strUtils = strutils_2.StringUtils, debug = debug_1.DEBUG;
    var EventList = (function () {
        function EventList() {
        }
        EventList.Create = function () {
            return {};
        };
        EventList.Node = function (handler, context) {
            return { fn: handler, context: !context ? null : context };
        };
        EventList.count = function (list) {
            if (!list) {
                return 0;
            }
            var nsKeys, cnt = 0, obj;
            for (var j = 0; j <= 2; ++j) {
                obj = list[j];
                if (!!obj) {
                    nsKeys = Object.keys(obj);
                    for (var i = 0; i < nsKeys.length; ++i) {
                        cnt += obj[nsKeys[i]].length;
                    }
                }
            }
            return cnt;
        };
        EventList.append = function (list, node, ns, priority) {
            if (priority === void 0) { priority = 0; }
            if (!ns) {
                ns = "*";
            }
            var obj = list[priority];
            if (!obj) {
                list[priority] = obj = {};
            }
            var arr = obj[ns];
            if (!arr) {
                obj[ns] = arr = [];
            }
            arr.push(node);
        };
        EventList.remove = function (list, ns) {
            if (!list) {
                return;
            }
            var nsKeys, obj;
            if (!ns) {
                ns = "*";
            }
            for (var j = 0; j <= 2; ++j) {
                obj = list[j];
                if (!!obj) {
                    if (ns === "*") {
                        nsKeys = Object.keys(obj);
                        for (var i = 0; i < nsKeys.length; ++i) {
                            delete obj[nsKeys[i]];
                        }
                    }
                    else {
                        delete obj[ns];
                    }
                }
            }
        };
        EventList.toArray = function (list) {
            if (!list) {
                return [];
            }
            var res = [];
            for (var k = 2; k >= 0; k -= 1) {
                var obj = list[k];
                if (!!obj) {
                    var nsKeys = Object.keys(obj);
                    for (var i = 0; i < nsKeys.length; ++i) {
                        var arr = obj[nsKeys[i]];
                        for (var j = 0; j < arr.length; ++j) {
                            res.push(arr[j]);
                        }
                    }
                }
            }
            return res;
        };
        return EventList;
    }());
    var evList = EventList;
    var EventHelper = (function () {
        function EventHelper() {
        }
        EventHelper.removeNS = function (ev, ns) {
            if (!ev) {
                return;
            }
            if (!ns) {
                ns = "*";
            }
            var keys = Object.keys(ev);
            for (var i = 0; i < keys.length; i += 1) {
                if (ns === "*") {
                    delete ev[keys[i]];
                }
                else {
                    evList.remove(ev[keys[i]], ns);
                }
            }
        };
        EventHelper.add = function (ev, name, handler, nmspace, context, priority) {
            if (!ev) {
                debug.checkStartDebugger();
                throw new Error(strUtils.format(lang_2.ERRS.ERR_ASSERTION_FAILED, "ev is a valid object"));
            }
            if (!checks.isFunc(handler)) {
                throw new Error(lang_2.ERRS.ERR_EVENT_INVALID_FUNC);
            }
            if (!name) {
                throw new Error(strUtils.format(lang_2.ERRS.ERR_EVENT_INVALID, "[Empty]"));
            }
            var n = name, ns = !nmspace ? "*" : "" + nmspace;
            var list = ev[n];
            var node = evList.Node(handler, context);
            if (!list) {
                ev[n] = list = evList.Create();
            }
            evList.append(list, node, ns, priority);
        };
        EventHelper.remove = function (ev, name, nmspace) {
            if (!ev) {
                return null;
            }
            var ns = !nmspace ? "*" : "" + nmspace;
            if (!name) {
                EventHelper.removeNS(ev, ns);
            }
            else {
                if (ns === "*") {
                    delete ev[name];
                }
                else {
                    evList.remove(ev[name], ns);
                }
            }
        };
        EventHelper.count = function (ev, name) {
            if (!ev) {
                return 0;
            }
            return (!name) ? 0 : evList.toArray(ev[name]).length;
        };
        EventHelper.raise = function (sender, ev, name, args) {
            if (!ev) {
                return;
            }
            if (!!name) {
                var arr = evList.toArray(ev[name]), len = arr.length;
                for (var i = 0; i < len; i++) {
                    var node = arr[i];
                    node.fn.apply(node.context, [sender, args]);
                }
            }
        };
        EventHelper.raiseProp = function (sender, ev, prop, args) {
            if (!ev) {
                return;
            }
            if (!!prop) {
                var isAllProp = prop === "*";
                if (!isAllProp) {
                    EventHelper.raise(sender, ev, "0*", args);
                }
                EventHelper.raise(sender, ev, "0" + prop, args);
            }
        };
        return EventHelper;
    }());
    exports.EventHelper = EventHelper;
});
define("jriapp_shared/object", ["require", "exports", "jriapp_shared/lang", "jriapp_shared/utils/sysutils", "jriapp_shared/utils/checks", "jriapp_shared/utils/strUtils", "jriapp_shared/utils/coreutils", "jriapp_shared/utils/error", "jriapp_shared/utils/weakmap", "jriapp_shared/utils/eventhelper"], function (require, exports, lang_3, sysutils_2, checks_4, strUtils_2, coreutils_2, error_1, weakmap_1, eventhelper_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var OBJ_EVENTS;
    (function (OBJ_EVENTS) {
        OBJ_EVENTS["error"] = "error";
        OBJ_EVENTS["destroyed"] = "destroyed";
    })(OBJ_EVENTS || (OBJ_EVENTS = {}));
    var checks = checks_4.Checks, strUtils = strUtils_2.StringUtils, coreUtils = coreutils_2.CoreUtils, evHelper = eventhelper_1.EventHelper, sys = sysutils_2.SysUtils, weakmap = weakmap_1.createWeakMap();
    sys.isBaseObj = function (obj) {
        return (!!obj && !!weakmap.get(obj));
    };
    var ObjState;
    (function (ObjState) {
        ObjState[ObjState["None"] = 0] = "None";
        ObjState[ObjState["Disposing"] = 1] = "Disposing";
        ObjState[ObjState["Disposed"] = 2] = "Disposed";
    })(ObjState || (ObjState = {}));
    var ObjectEvents = (function () {
        function ObjectEvents(owner) {
            this._events = null;
            this._owner = owner;
        }
        ObjectEvents.prototype.canRaise = function (name) {
            return evHelper.count(this._events, name) > 0;
        };
        ObjectEvents.prototype.on = function (name, handler, nmspace, context, priority) {
            if (!this._events) {
                this._events = {};
            }
            evHelper.add(this._events, name, handler, nmspace, context, priority);
        };
        ObjectEvents.prototype.off = function (name, nmspace) {
            if (!name && !nmspace) {
                this._events = null;
                return;
            }
            evHelper.remove(this._events, name, nmspace);
        };
        ObjectEvents.prototype.offNS = function (nmspace) {
            this.off(null, nmspace);
        };
        ObjectEvents.prototype.raise = function (name, args) {
            if (!name) {
                throw new Error(lang_3.ERRS.ERR_EVENT_INVALID);
            }
            evHelper.raise(this._owner, this._events, name, args);
        };
        ObjectEvents.prototype.raiseProp = function (name) {
            if (!name) {
                throw new Error(lang_3.ERRS.ERR_PROP_NAME_EMPTY);
            }
            var data = { property: name }, parts = name.split("."), lastProp = parts[parts.length - 1];
            if (parts.length > 1) {
                var owner = coreUtils.resolveOwner(this._owner, name);
                var state = weakmap.get(owner);
                if (!!state && !!state.events) {
                    state.events.raiseProp(lastProp);
                }
            }
            else {
                evHelper.raiseProp(this._owner, this._events, lastProp, data);
            }
        };
        ObjectEvents.prototype.onProp = function (prop, handler, nmspace, context, priority) {
            if (!prop) {
                throw new Error(lang_3.ERRS.ERR_PROP_NAME_EMPTY);
            }
            if (!this._events) {
                this._events = {};
            }
            evHelper.add(this._events, "0" + prop, handler, nmspace, context, priority);
        };
        ObjectEvents.prototype.offProp = function (prop, nmspace) {
            if (!!prop) {
                evHelper.remove(this._events, "0" + prop, nmspace);
            }
            else {
                evHelper.removeNS(this._events, nmspace);
            }
        };
        Object.defineProperty(ObjectEvents.prototype, "owner", {
            get: function () {
                return this._owner;
            },
            enumerable: true,
            configurable: true
        });
        return ObjectEvents;
    }());
    exports.ObjectEvents = ObjectEvents;
    var BaseObject = (function () {
        function BaseObject() {
            weakmap.set(this, { objState: 0, events: null });
        }
        BaseObject.prototype.setDisposing = function () {
            var state = weakmap.get(this);
            if (state.objState === 2) {
                throw new Error(strUtils.format(lang_3.ERRS.ERR_ASSERTION_FAILED, "objState !== ObjState.Disposed"));
            }
            state.objState = 1;
        };
        BaseObject.prototype._createObjEvents = function () {
            return new ObjectEvents(this);
        };
        BaseObject.prototype.getEventNames = function () {
            return ["error", "destroyed"];
        };
        BaseObject.prototype.isHasProp = function (prop) {
            return checks.isHasProp(this, prop);
        };
        BaseObject.prototype.handleError = function (error, source) {
            if (error_1.ERROR.checkIsDummy(error)) {
                return true;
            }
            if (!error.message) {
                error = new Error("Error: " + error);
            }
            var args = { error: error, source: source, isHandled: false };
            this.objEvents.raise("error", args);
            var isHandled = args.isHandled;
            if (!isHandled) {
                isHandled = error_1.ERROR.handleError(this, error, source);
            }
            return isHandled;
        };
        BaseObject.prototype.addOnDisposed = function (handler, nmspace, context, priority) {
            this.objEvents.on("destroyed", handler, nmspace, context, priority);
        };
        BaseObject.prototype.removeOnDisposed = function (nmspace) {
            this.objEvents.off("destroyed", nmspace);
        };
        BaseObject.prototype.addOnError = function (handler, nmspace, context, priority) {
            this.objEvents.on("error", handler, nmspace, context, priority);
        };
        BaseObject.prototype.removeOnError = function (nmspace) {
            this.objEvents.off("error", nmspace);
        };
        Object.defineProperty(BaseObject.prototype, "objEvents", {
            get: function () {
                var state = weakmap.get(this);
                if (!state.events) {
                    state.events = this._createObjEvents();
                }
                return state.events;
            },
            enumerable: true,
            configurable: true
        });
        BaseObject.prototype.getIsDisposed = function () {
            var state = weakmap.get(this);
            return state.objState == 2;
        };
        BaseObject.prototype.getIsStateDirty = function () {
            var state = weakmap.get(this);
            return state.objState !== 0;
        };
        BaseObject.prototype.dispose = function () {
            var state = weakmap.get(this);
            if (state.objState === 2) {
                return;
            }
            state.objState = 2;
            if (!!state.events) {
                try {
                    state.events.raise("destroyed", {});
                }
                finally {
                    state.events.off();
                }
            }
        };
        return BaseObject;
    }());
    exports.BaseObject = BaseObject;
});
define("jriapp_shared/utils/arrhelper", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ArrayHelper = (function () {
        function ArrayHelper() {
        }
        ArrayHelper.clone = function (arr) {
            if (arr.length === 1) {
                return [arr[0]];
            }
            else {
                return Array.apply(null, arr);
            }
        };
        ArrayHelper.fromList = function (list) {
            return [].slice.call(list);
        };
        ArrayHelper.merge = function (arrays) {
            return [].concat.apply([], arrays);
        };
        ArrayHelper.distinct = function (arr) {
            var o = {}, r = [], l1 = arr.length;
            for (var i = 0; i < l1; i += 1) {
                o["" + arr[i]] = arr[i];
            }
            var k = Object.keys(o), l2 = k.length;
            for (var i = 0; i < l2; i += 1) {
                r.push(o[k[i]]);
            }
            return r;
        };
        ArrayHelper.remove = function (array, obj) {
            var i = array.indexOf(obj);
            if (i > -1) {
                array.splice(i, 1);
            }
            return i;
        };
        ArrayHelper.removeIndex = function (array, index) {
            var isOk = index > -1 && array.length > index;
            array.splice(index, 1);
            return isOk;
        };
        ArrayHelper.insert = function (array, obj, pos) {
            array.splice(pos, 0, obj);
        };
        return ArrayHelper;
    }());
    exports.ArrayHelper = ArrayHelper;
});
define("jriapp_shared/utils/queue", ["require", "exports", "jriapp_shared/utils/error"], function (require, exports, error_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var error = error_2.ERROR;
    var MAX_NUM = 99999900000, win = window;
    function createQueue(interval) {
        if (interval === void 0) { interval = 0; }
        var _tasks = [], _taskMap = {}, _timer = null, _newTaskId = 1;
        var res = {
            cancel: function (taskId) {
                var task = _taskMap[taskId];
                if (!!task) {
                    task.func = null;
                }
            },
            enque: function (func) {
                var taskId = _newTaskId;
                _newTaskId += 1;
                var task = { taskId: taskId, func: func };
                _tasks.push(task);
                _taskMap[taskId] = task;
                if (!_timer) {
                    _timer = win.setTimeout(function () {
                        var arr = _tasks;
                        _timer = null;
                        _tasks = [];
                        if (_newTaskId > MAX_NUM) {
                            _newTaskId = 1;
                        }
                        try {
                            arr.forEach(function (task) {
                                try {
                                    if (!!task.func) {
                                        task.func();
                                    }
                                }
                                catch (err) {
                                    error.handleError(win, err, win);
                                }
                            });
                        }
                        finally {
                            _taskMap = {};
                            for (var i = 0; i < _tasks.length; i += 1) {
                                _taskMap[_tasks[i].taskId] = _tasks[i];
                            }
                            ;
                        }
                    }, interval);
                }
                return taskId;
            }
        };
        return res;
    }
    exports.createQueue = createQueue;
});
define("jriapp_shared/utils/deferred", ["require", "exports", "jriapp_shared/errors", "jriapp_shared/utils/checks", "jriapp_shared/utils/arrhelper", "jriapp_shared/utils/queue"], function (require, exports, errors_2, checks_5, arrhelper_1, queue_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var checks = checks_5.Checks, arrHelper = arrhelper_1.ArrayHelper;
    var taskQueue = null;
    function createDefer(isSync) {
        return new Promise(null, (!isSync ? fn_enque : fn_exec)).deferred();
    }
    exports.createDefer = createDefer;
    function createSyncDefer() {
        return createDefer(true);
    }
    exports.createSyncDefer = createSyncDefer;
    function getTaskQueue() {
        if (!taskQueue) {
            taskQueue = new TaskQueue();
        }
        return taskQueue;
    }
    exports.getTaskQueue = getTaskQueue;
    function whenAll(promises) {
        var results = [], resolved = createDefer().resolve(null);
        var merged = promises.reduce(function (acc, p) { return acc.then(function () { return p; }).then(function (r) { return results.push(r); }); }, resolved);
        return merged.then(function () { return results; });
    }
    exports.whenAll = whenAll;
    function race(promises) {
        return new Promise(function (res, rej) {
            promises.forEach(function (p) { return p.then(res).catch(rej); });
        });
    }
    exports.race = race;
    function promiseSerial(funcs) {
        return funcs.reduce(function (promise, func) {
            return promise.then(function (result) { return func().then(Array.prototype.concat.bind(result)); });
        }, Promise.resolve([]));
    }
    exports.promiseSerial = promiseSerial;
    function fn_enque(task) {
        getTaskQueue().enque(task);
    }
    function fn_exec(task) {
        task();
    }
    var TaskQueue = (function () {
        function TaskQueue() {
            this._queue = queue_1.createQueue(0);
        }
        TaskQueue.prototype.enque = function (task) {
            return this._queue.enque(task);
        };
        TaskQueue.prototype.cancel = function (taskId) {
            this._queue.cancel(taskId);
        };
        return TaskQueue;
    }());
    var Callback = (function () {
        function Callback(dispatcher, successCB, errorCB) {
            this._dispatcher = dispatcher;
            this._successCB = successCB;
            this._errorCB = errorCB;
            this._deferred = new Promise(null, dispatcher).deferred();
        }
        Callback.prototype.resolve = function (value, defer) {
            var _this = this;
            if (!checks.isFunc(this._successCB)) {
                this._deferred.resolve(value);
                return;
            }
            if (!!defer) {
                this._dispatcher(function () { return _this._dispatch(_this._successCB, value); });
            }
            else {
                this._dispatch(this._successCB, value);
            }
        };
        Callback.prototype.reject = function (error, defer) {
            var _this = this;
            if (!checks.isFunc(this._errorCB)) {
                this._deferred.reject(error);
                return;
            }
            if (!!defer) {
                this._dispatcher(function () { return _this._dispatch(_this._errorCB, error); });
            }
            else {
                this._dispatch(this._errorCB, error);
            }
        };
        Callback.prototype._dispatch = function (callback, arg) {
            try {
                var result = callback(arg);
                this._deferred.resolve(result);
            }
            catch (err) {
                this._deferred.reject(err);
            }
        };
        Object.defineProperty(Callback.prototype, "deferred", {
            get: function () {
                return this._deferred;
            },
            enumerable: true,
            configurable: true
        });
        return Callback;
    }());
    var Deferred = (function () {
        function Deferred(promise, dispatcher) {
            this._dispatcher = dispatcher;
            this._value = checks.undefined;
            this._error = checks.undefined;
            this._state = 0;
            this._stack = [];
            this._promise = promise;
        }
        Deferred.prototype._resolve = function (value) {
            var _this = this;
            var pending = true;
            try {
                if (checks.isThenable(value)) {
                    if (value === this._promise) {
                        throw new TypeError("recursive resolution");
                    }
                    var fnThen = value.then;
                    this._state = 1;
                    fnThen.call(value, function (result) {
                        if (pending) {
                            pending = false;
                            _this._resolve(result);
                        }
                    }, function (error) {
                        if (pending) {
                            pending = false;
                            _this._reject(error);
                        }
                    });
                }
                else {
                    this._state = 1;
                    this._dispatcher(function () {
                        _this._state = 2;
                        _this._value = value;
                        var stackSize = _this._stack.length;
                        for (var i = 0; i < stackSize; i++) {
                            _this._stack[i].resolve(value, false);
                        }
                        _this._stack.splice(0, stackSize);
                    });
                }
            }
            catch (err) {
                if (pending) {
                    this._reject(err);
                }
            }
            return this;
        };
        Deferred.prototype._reject = function (error) {
            var _this = this;
            this._state = 1;
            this._dispatcher(function () {
                _this._state = 3;
                _this._error = error;
                var stackSize = _this._stack.length;
                for (var i = 0; i < stackSize; i++) {
                    _this._stack[i].reject(error, false);
                }
                _this._stack.splice(0, stackSize);
            });
            return this;
        };
        Deferred.prototype._then = function (successCB, errorCB) {
            if (!checks.isFunc(successCB) && !checks.isFunc(errorCB)) {
                return this._promise;
            }
            var cb = new Callback(this._dispatcher, successCB, errorCB);
            switch (this._state) {
                case 0:
                case 1:
                    this._stack.push(cb);
                    break;
                case 2:
                    cb.resolve(this._value, true);
                    break;
                case 3:
                    cb.reject(this._error, true);
                    break;
            }
            return cb.deferred.promise();
        };
        Deferred.prototype.resolve = function (value) {
            if (this._state !== 0) {
                return this.promise();
            }
            return this._resolve(value).promise();
        };
        Deferred.prototype.reject = function (error) {
            if (this._state !== 0) {
                return this.promise();
            }
            return this._reject(error).promise();
        };
        Deferred.prototype.promise = function () {
            return this._promise;
        };
        Deferred.prototype.state = function () {
            return this._state;
        };
        return Deferred;
    }());
    var Promise = (function () {
        function Promise(fn, dispatcher) {
            var disp = (!dispatcher ? fn_enque : dispatcher), deferred = new Deferred(this, disp);
            this._deferred = deferred;
            if (!!fn) {
                getTaskQueue().enque(function () {
                    fn(function (res) { return deferred.resolve(res); }, function (err) { return deferred.reject(err); });
                });
            }
        }
        Promise.prototype.then = function (successCB, errorCB) {
            return this._deferred._then(successCB, errorCB);
        };
        Promise.prototype.catch = function (errorCB) {
            return this._deferred._then(checks.undefined, errorCB);
        };
        Promise.prototype.always = function (errorCB) {
            return this._deferred._then(errorCB, errorCB);
        };
        Promise.all = function () {
            var args = arrHelper.fromList(arguments);
            return (args.length === 1 && checks.isArray(args[0])) ? whenAll(args[0]) : whenAll(args);
        };
        Promise.race = function () {
            var args = arrHelper.fromList(arguments);
            return (args.length === 1 && checks.isArray(args[0])) ? race(args[0]) : race(args);
        };
        Promise.reject = function (reason, isSync) {
            var deferred = createDefer(isSync);
            deferred.reject(reason);
            return deferred.promise();
        };
        Promise.resolve = function (value, isSync) {
            var deferred = createDefer(isSync);
            deferred.resolve(value);
            return deferred.promise();
        };
        Promise.prototype.state = function () {
            return this._deferred.state();
        };
        Promise.prototype.deferred = function () {
            return this._deferred;
        };
        return Promise;
    }());
    exports.Promise = Promise;
    var AbortablePromise = (function () {
        function AbortablePromise(deferred, abortable) {
            this._deferred = deferred;
            this._abortable = abortable;
            this._aborted = false;
        }
        AbortablePromise.prototype.then = function (successCB, errorCB) {
            return this._deferred.promise().then(successCB, errorCB);
        };
        AbortablePromise.prototype.catch = function (errorCB) {
            return this._deferred.promise().catch(errorCB);
        };
        AbortablePromise.prototype.always = function (errorCB) {
            return this._deferred.promise().always(errorCB);
        };
        AbortablePromise.prototype.abort = function (reason) {
            if (this._aborted) {
                return;
            }
            var self = this;
            self._deferred.reject(new errors_2.AbortError(reason));
            self._aborted = true;
            setTimeout(function () { self._abortable.abort(); }, 0);
        };
        AbortablePromise.prototype.state = function () {
            return this._deferred.state();
        };
        return AbortablePromise;
    }());
    exports.AbortablePromise = AbortablePromise;
});
define("jriapp_shared/utils/debounce", ["require", "exports", "jriapp_shared/utils/deferred"], function (require, exports, deferred_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Debounce = (function () {
        function Debounce(interval) {
            if (interval === void 0) { interval = 0; }
            this._timer = null;
            this._interval = interval;
            this._fn = null;
        }
        Debounce.prototype.enque = function (fn) {
            var _this = this;
            if (this.getIsStateDirty()) {
                return;
            }
            if (!fn) {
                throw new Error("Debounce: Invalid operation");
            }
            this._fn = fn;
            if (!!this._interval && !!this._timer) {
                clearTimeout(this._timer);
                this._timer = null;
            }
            if (!this._timer) {
                var callback = function () {
                    var fn = _this._fn;
                    _this._timer = null;
                    _this._fn = null;
                    if (!!fn) {
                        fn();
                    }
                };
                if (!this._interval) {
                    this._timer = deferred_1.getTaskQueue().enque(callback);
                }
                else {
                    this._timer = setTimeout(callback, this._interval);
                }
            }
        };
        Debounce.prototype.cancel = function () {
            this._fn = null;
        };
        Debounce.prototype.dispose = function () {
            if (!!this._timer) {
                if (!this._interval) {
                    deferred_1.getTaskQueue().cancel(this._timer);
                }
                else {
                    clearTimeout(this._timer);
                }
            }
            this._timer = void 0;
            this._fn = null;
        };
        Object.defineProperty(Debounce.prototype, "interval", {
            get: function () {
                return this._interval;
            },
            enumerable: true,
            configurable: true
        });
        Debounce.prototype.getIsDisposed = function () {
            return this._timer === void 0;
        };
        Debounce.prototype.getIsStateDirty = function () {
            return this._timer === void 0;
        };
        return Debounce;
    }());
    exports.Debounce = Debounce;
});
define("jriapp_shared/utils/jsonbag", ["require", "exports", "jriapp_shared/object", "jriapp_shared/utils/coreutils", "jriapp_shared/utils/strUtils", "jriapp_shared/utils/sysutils", "jriapp_shared/utils/checks", "jriapp_shared/utils/debounce", "jriapp_shared/errors"], function (require, exports, object_1, coreutils_3, strutils_3, sysutils_3, checks_6, debounce_1, errors_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var coreUtils = coreutils_3.CoreUtils, strUtils = strutils_3.StringUtils, checks = checks_6.Checks, sys = sysutils_3.SysUtils;
    var BAG_EVENTS = {
        errors_changed: "errors_changed",
        validate_bag: "validate_bag",
        validate_field: "validate_field"
    };
    var JsonBag = (function (_super) {
        __extends(JsonBag, _super);
        function JsonBag(json, jsonChanged) {
            var _this = _super.call(this) || this;
            _this._json = void 0;
            _this._val = {};
            _this._saveVal = null;
            _this._debounce = new debounce_1.Debounce();
            _this.resetJson(json);
            _this._jsonChanged = jsonChanged;
            _this._errors = {};
            return _this;
        }
        JsonBag.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            this._debounce.dispose();
            this._jsonChanged = null;
            this._json = void 0;
            this._val = {};
            _super.prototype.dispose.call(this);
        };
        JsonBag.prototype.getEventNames = function () {
            var baseEvents = _super.prototype.getEventNames.call(this);
            return [BAG_EVENTS.validate_bag, BAG_EVENTS.validate_field].concat(baseEvents);
        };
        JsonBag.prototype.isHasProp = function (prop) {
            if (strUtils.startsWith(prop, "[")) {
                return true;
            }
            return _super.prototype.isHasProp.call(this, prop);
        };
        JsonBag.prototype.addOnValidateBag = function (fn, nmspace, context) {
            this.objEvents.on(BAG_EVENTS.validate_bag, fn, nmspace, context);
        };
        JsonBag.prototype.removeOnValidateBag = function (nmspace) {
            this.objEvents.off(BAG_EVENTS.validate_bag, nmspace);
        };
        JsonBag.prototype.addOnValidateField = function (fn, nmspace, context) {
            this.objEvents.on(BAG_EVENTS.validate_field, fn, nmspace, context);
        };
        JsonBag.prototype.removeOnValidateField = function (nmspace) {
            this.objEvents.off(BAG_EVENTS.validate_field, nmspace);
        };
        JsonBag.prototype.addOnErrorsChanged = function (fn, nmspace, context) {
            this.objEvents.on(BAG_EVENTS.errors_changed, fn, nmspace, context);
        };
        JsonBag.prototype.removeOnErrorsChanged = function (nmspace) {
            this.objEvents.off(BAG_EVENTS.errors_changed, nmspace);
        };
        JsonBag.prototype.onChanged = function () {
            var _this = this;
            this._debounce.enque(function () {
                if (!!_this._jsonChanged) {
                    _this._jsonChanged(_this._json);
                }
            });
        };
        JsonBag.prototype.resetJson = function (json) {
            if (json === void 0) { json = null; }
            if (this._json !== json) {
                this._json = json;
                this._val = (!json ? {} : JSON.parse(json));
                this.objEvents.raiseProp("json");
                this.objEvents.raiseProp("val");
                this.objEvents.raiseProp("[*]");
            }
        };
        JsonBag.prototype.updateJson = function () {
            var json = JSON.stringify(this._val);
            if (json !== this._json) {
                this._json = json;
                this.onChanged();
                this.objEvents.raiseProp("json");
                return true;
            }
            return false;
        };
        JsonBag.prototype._validateBag = function () {
            var args = {
                bag: this,
                result: []
            };
            this.objEvents.raise(BAG_EVENTS.validate_bag, args);
            return (!!args.result) ? args.result : [];
        };
        JsonBag.prototype._validateField = function (fieldName) {
            var args = {
                bag: this,
                fieldName: fieldName,
                errors: []
            };
            this.objEvents.raise(BAG_EVENTS.validate_field, args);
            return (!!args.errors && args.errors.length > 0) ? { fieldName: fieldName, errors: args.errors } : null;
        };
        JsonBag.prototype._onErrorsChanged = function () {
            this.objEvents.raise(BAG_EVENTS.errors_changed, {});
        };
        JsonBag.prototype._addErrors = function (errors) {
            var self = this;
            errors.forEach(function (err) {
                self._addError(err.fieldName, err.errors, true);
            });
            this._onErrorsChanged();
        };
        JsonBag.prototype._addError = function (fieldName, errors, ignoreChangeErrors) {
            if (!fieldName) {
                fieldName = "*";
            }
            if (!(checks.isArray(errors) && errors.length > 0)) {
                this._removeError(fieldName, ignoreChangeErrors);
                return;
            }
            var itemErrors = this._errors;
            itemErrors[fieldName] = errors;
            if (!ignoreChangeErrors) {
                this._onErrorsChanged();
            }
        };
        JsonBag.prototype._removeError = function (fieldName, ignoreChangeErrors) {
            var itemErrors = this._errors;
            if (!itemErrors) {
                return false;
            }
            if (!fieldName) {
                fieldName = "*";
            }
            if (!itemErrors[fieldName]) {
                return false;
            }
            delete itemErrors[fieldName];
            if (!ignoreChangeErrors) {
                this._onErrorsChanged();
            }
            return true;
        };
        JsonBag.prototype._removeAllErrors = function () {
            this._errors = {};
            this._onErrorsChanged();
        };
        JsonBag.prototype.getIsHasErrors = function () {
            return !!this._errors && Object.keys(this._errors).length > 0;
        };
        JsonBag.prototype.getFieldErrors = function (fieldName) {
            var bagErrors = this._errors;
            if (!bagErrors) {
                return [];
            }
            var name = fieldName;
            if (!fieldName) {
                fieldName = "*";
            }
            if (!bagErrors[fieldName]) {
                return [];
            }
            if (fieldName === "*") {
                name = null;
            }
            return [
                { fieldName: name, errors: bagErrors[fieldName] }
            ];
        };
        JsonBag.prototype.getAllErrors = function () {
            var bagErrors = this._errors;
            if (!bagErrors) {
                return [];
            }
            var res = [];
            coreUtils.forEachProp(bagErrors, function (name) {
                var fieldName = null;
                if (name !== "*") {
                    fieldName = name;
                }
                res.push({ fieldName: fieldName, errors: bagErrors[name] });
            });
            return res;
        };
        JsonBag.prototype.getIErrorNotification = function () {
            return this;
        };
        JsonBag.prototype.beginEdit = function () {
            if (!this.isEditing) {
                this._saveVal = JSON.parse(JSON.stringify(this._val));
                return true;
            }
            return false;
        };
        JsonBag.prototype.endEdit = function () {
            if (this.isEditing) {
                this._removeAllErrors();
                var validationInfos = this._validateBag();
                if (validationInfos.length > 0) {
                    this._addErrors(validationInfos);
                }
                if (this.getIsHasErrors()) {
                    return false;
                }
                this._saveVal = null;
                this.updateJson();
                return true;
            }
            return false;
        };
        JsonBag.prototype.cancelEdit = function () {
            if (this.isEditing) {
                this._val = this._saveVal;
                this._saveVal = null;
                this._removeAllErrors();
                this.objEvents.raiseProp("[*]");
                return true;
            }
            return false;
        };
        Object.defineProperty(JsonBag.prototype, "isEditing", {
            get: function () {
                return !!this._saveVal;
            },
            enumerable: true,
            configurable: true
        });
        JsonBag.prototype.getProp = function (name) {
            var fieldName = strUtils.trimBrackets(name);
            return coreUtils.getValue(this._val, fieldName, "->");
        };
        JsonBag.prototype.setProp = function (name, val) {
            var old = this.getProp(name);
            if (old !== val) {
                try {
                    var fieldName = strUtils.trimBrackets(name);
                    coreUtils.setValue(this._val, fieldName, val, false, "->");
                    this.objEvents.raiseProp(name);
                    this._removeError(name);
                    var validationInfo = this._validateField(name);
                    if (!!validationInfo && validationInfo.errors.length > 0) {
                        throw new errors_3.ValidationError([validationInfo], this);
                    }
                }
                catch (ex) {
                    var error = void 0;
                    if (sys.isValidationError(ex)) {
                        error = ex;
                    }
                    else {
                        error = new errors_3.ValidationError([
                            { fieldName: name, errors: [ex.message] }
                        ], this);
                    }
                    this._addError(name, error.validations[0].errors);
                    throw error;
                }
            }
        };
        Object.defineProperty(JsonBag.prototype, "isPropertyBag", {
            get: function () {
                return true;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(JsonBag.prototype, "val", {
            get: function () {
                return this._val;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(JsonBag.prototype, "json", {
            get: function () {
                return this._json;
            },
            enumerable: true,
            configurable: true
        });
        JsonBag.prototype.toString = function () {
            return "JsonBag";
        };
        return JsonBag;
    }(object_1.BaseObject));
    exports.JsonBag = JsonBag;
});
define("jriapp_shared/collection/const", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DATE_CONVERSION;
    (function (DATE_CONVERSION) {
        DATE_CONVERSION[DATE_CONVERSION["None"] = 0] = "None";
        DATE_CONVERSION[DATE_CONVERSION["ServerLocalToClientLocal"] = 1] = "ServerLocalToClientLocal";
        DATE_CONVERSION[DATE_CONVERSION["UtcToClientLocal"] = 2] = "UtcToClientLocal";
    })(DATE_CONVERSION = exports.DATE_CONVERSION || (exports.DATE_CONVERSION = {}));
    var DATA_TYPE;
    (function (DATA_TYPE) {
        DATA_TYPE[DATA_TYPE["None"] = 0] = "None";
        DATA_TYPE[DATA_TYPE["String"] = 1] = "String";
        DATA_TYPE[DATA_TYPE["Bool"] = 2] = "Bool";
        DATA_TYPE[DATA_TYPE["Integer"] = 3] = "Integer";
        DATA_TYPE[DATA_TYPE["Decimal"] = 4] = "Decimal";
        DATA_TYPE[DATA_TYPE["Float"] = 5] = "Float";
        DATA_TYPE[DATA_TYPE["DateTime"] = 6] = "DateTime";
        DATA_TYPE[DATA_TYPE["Date"] = 7] = "Date";
        DATA_TYPE[DATA_TYPE["Time"] = 8] = "Time";
        DATA_TYPE[DATA_TYPE["Guid"] = 9] = "Guid";
        DATA_TYPE[DATA_TYPE["Binary"] = 10] = "Binary";
    })(DATA_TYPE = exports.DATA_TYPE || (exports.DATA_TYPE = {}));
    var FIELD_TYPE;
    (function (FIELD_TYPE) {
        FIELD_TYPE[FIELD_TYPE["None"] = 0] = "None";
        FIELD_TYPE[FIELD_TYPE["ClientOnly"] = 1] = "ClientOnly";
        FIELD_TYPE[FIELD_TYPE["Calculated"] = 2] = "Calculated";
        FIELD_TYPE[FIELD_TYPE["Navigation"] = 3] = "Navigation";
        FIELD_TYPE[FIELD_TYPE["RowTimeStamp"] = 4] = "RowTimeStamp";
        FIELD_TYPE[FIELD_TYPE["Object"] = 5] = "Object";
        FIELD_TYPE[FIELD_TYPE["ServerCalculated"] = 6] = "ServerCalculated";
    })(FIELD_TYPE = exports.FIELD_TYPE || (exports.FIELD_TYPE = {}));
    var SORT_ORDER;
    (function (SORT_ORDER) {
        SORT_ORDER[SORT_ORDER["ASC"] = 0] = "ASC";
        SORT_ORDER[SORT_ORDER["DESC"] = 1] = "DESC";
    })(SORT_ORDER = exports.SORT_ORDER || (exports.SORT_ORDER = {}));
    var FILTER_TYPE;
    (function (FILTER_TYPE) {
        FILTER_TYPE[FILTER_TYPE["Equals"] = 0] = "Equals";
        FILTER_TYPE[FILTER_TYPE["Between"] = 1] = "Between";
        FILTER_TYPE[FILTER_TYPE["StartsWith"] = 2] = "StartsWith";
        FILTER_TYPE[FILTER_TYPE["EndsWith"] = 3] = "EndsWith";
        FILTER_TYPE[FILTER_TYPE["Contains"] = 4] = "Contains";
        FILTER_TYPE[FILTER_TYPE["Gt"] = 5] = "Gt";
        FILTER_TYPE[FILTER_TYPE["Lt"] = 6] = "Lt";
        FILTER_TYPE[FILTER_TYPE["GtEq"] = 7] = "GtEq";
        FILTER_TYPE[FILTER_TYPE["LtEq"] = 8] = "LtEq";
        FILTER_TYPE[FILTER_TYPE["NotEq"] = 9] = "NotEq";
    })(FILTER_TYPE = exports.FILTER_TYPE || (exports.FILTER_TYPE = {}));
    var COLL_CHANGE_TYPE;
    (function (COLL_CHANGE_TYPE) {
        COLL_CHANGE_TYPE[COLL_CHANGE_TYPE["Remove"] = 0] = "Remove";
        COLL_CHANGE_TYPE[COLL_CHANGE_TYPE["Add"] = 1] = "Add";
        COLL_CHANGE_TYPE[COLL_CHANGE_TYPE["Reset"] = 2] = "Reset";
        COLL_CHANGE_TYPE[COLL_CHANGE_TYPE["Remap"] = 3] = "Remap";
    })(COLL_CHANGE_TYPE = exports.COLL_CHANGE_TYPE || (exports.COLL_CHANGE_TYPE = {}));
    var COLL_CHANGE_REASON;
    (function (COLL_CHANGE_REASON) {
        COLL_CHANGE_REASON[COLL_CHANGE_REASON["None"] = 0] = "None";
        COLL_CHANGE_REASON[COLL_CHANGE_REASON["PageChange"] = 1] = "PageChange";
        COLL_CHANGE_REASON[COLL_CHANGE_REASON["Sorting"] = 2] = "Sorting";
    })(COLL_CHANGE_REASON = exports.COLL_CHANGE_REASON || (exports.COLL_CHANGE_REASON = {}));
    var COLL_CHANGE_OPER;
    (function (COLL_CHANGE_OPER) {
        COLL_CHANGE_OPER[COLL_CHANGE_OPER["None"] = 0] = "None";
        COLL_CHANGE_OPER[COLL_CHANGE_OPER["Fill"] = 1] = "Fill";
        COLL_CHANGE_OPER[COLL_CHANGE_OPER["Attach"] = 2] = "Attach";
        COLL_CHANGE_OPER[COLL_CHANGE_OPER["Remove"] = 3] = "Remove";
        COLL_CHANGE_OPER[COLL_CHANGE_OPER["Commit"] = 4] = "Commit";
        COLL_CHANGE_OPER[COLL_CHANGE_OPER["Sort"] = 5] = "Sort";
    })(COLL_CHANGE_OPER = exports.COLL_CHANGE_OPER || (exports.COLL_CHANGE_OPER = {}));
    var ITEM_STATUS;
    (function (ITEM_STATUS) {
        ITEM_STATUS[ITEM_STATUS["None"] = 0] = "None";
        ITEM_STATUS[ITEM_STATUS["Added"] = 1] = "Added";
        ITEM_STATUS[ITEM_STATUS["Updated"] = 2] = "Updated";
        ITEM_STATUS[ITEM_STATUS["Deleted"] = 3] = "Deleted";
    })(ITEM_STATUS = exports.ITEM_STATUS || (exports.ITEM_STATUS = {}));
});
define("jriapp_shared/collection/int", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PROP_NAME = {
        isEditing: "isEditing",
        currentItem: "currentItem",
        count: "count",
        totalCount: "totalCount",
        pageCount: "pageCount",
        pageSize: "pageSize",
        pageIndex: "pageIndex",
        isUpdating: "isUpdating",
        isLoading: "isLoading",
        isRefreshing: "isRefreshing"
    };
    exports.ITEM_EVENTS = {
        errors_changed: "errors_changed",
        destroyed: "destroyed"
    };
});
define("jriapp_shared/utils/logger", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var LOGGER = (function () {
        function LOGGER() {
        }
        LOGGER.log = function (str) {
            console.log(str);
        };
        LOGGER.warn = function (str) {
            console.warn(str);
        };
        LOGGER.error = function (str) {
            console.error(str);
        };
        return LOGGER;
    }());
    exports.LOGGER = LOGGER;
});
define("jriapp_shared/utils/async", ["require", "exports", "jriapp_shared/utils/deferred", "jriapp_shared/utils/checks"], function (require, exports, deferred_2, checks_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var checks = checks_7.Checks, _whenAll = deferred_2.whenAll, _race = deferred_2.race, _getTaskQueue = deferred_2.getTaskQueue, _createDefer = deferred_2.createDefer;
    var AsyncUtils = (function () {
        function AsyncUtils() {
        }
        AsyncUtils.createDeferred = function (isSync) {
            return _createDefer(isSync);
        };
        AsyncUtils.reject = function (reason, isSync) {
            return deferred_2.Promise.reject(reason, isSync);
        };
        AsyncUtils.resolve = function (value, isSync) {
            return deferred_2.Promise.resolve(value, isSync);
        };
        AsyncUtils.promiseSerial = function (funcs) {
            return deferred_2.promiseSerial(funcs);
        };
        AsyncUtils.whenAll = function (args) {
            return _whenAll(args);
        };
        AsyncUtils.race = function (promises) {
            return _race(promises);
        };
        AsyncUtils.getTaskQueue = function () {
            return _getTaskQueue();
        };
        AsyncUtils.delay = function (func, time) {
            var deferred = deferred_2.createDefer(true);
            setTimeout(function () {
                try {
                    deferred.resolve(func());
                }
                catch (err) {
                    deferred.reject(err);
                }
            }, !time ? 0 : time);
            return deferred.promise();
        };
        AsyncUtils.parseJSON = function (res) {
            return AsyncUtils.delay(function () {
                return (checks.isString(res)) ? JSON.parse(res) : res;
            });
        };
        return AsyncUtils;
    }());
    exports.AsyncUtils = AsyncUtils;
});
define("jriapp_shared/utils/http", ["require", "exports", "jriapp_shared/utils/strUtils", "jriapp_shared/errors", "jriapp_shared/utils/coreutils", "jriapp_shared/utils/deferred", "jriapp_shared/utils/async"], function (require, exports, strUtils_3, errors_4, coreutils_4, deferred_3, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var coreUtils = coreutils_4.CoreUtils, strUtils = strUtils_3.StringUtils, _async = async_1.AsyncUtils;
    var HttpUtils = (function () {
        function HttpUtils() {
        }
        HttpUtils.isStatusOK = function (status) {
            var chk = "" + status;
            return chk.length === 3 && strUtils.startsWith(chk, "2");
        };
        HttpUtils._getXMLRequest = function (url, method, deferred, headers) {
            var req = new XMLHttpRequest();
            req.open(method, url, true);
            req.responseType = "text";
            req.onload = function (e) {
                var status = "" + req.status;
                if (status === "200") {
                    var res = req.response;
                    deferred.resolve(res);
                }
                else {
                    if (HttpUtils.isStatusOK(status)) {
                        deferred.reject(new errors_4.DummyError(new Error(strUtils.format('Status: "{0}" loading from URL: "{1}"', status, url))));
                    }
                    else {
                        deferred.reject(new Error(strUtils.format('Error: "{0}" to load from URL: "{1}"', status, url)));
                    }
                }
            };
            req.onerror = function (e) {
                deferred.reject(new Error(strUtils.format('Error: "{0}" to load from URL: "{1}"', req.status, url)));
            };
            req.ontimeout = function () {
                deferred.reject(new Error(strUtils.format('Error: "Request Timeout" to load from URL: "{0}"', url)));
            };
            req.onabort = function (e) {
                deferred.reject(new Error(strUtils.format('HTTP Request Operation Aborted for URL: "{0}"', url)));
            };
            req.timeout = HttpUtils.ajaxTimeOut * 1000;
            var _headers = coreUtils.merge(HttpUtils.defaultHeaders);
            _headers = coreUtils.merge(headers, _headers);
            coreUtils.forEachProp(_headers, function (name, val) {
                req.setRequestHeader(name, val);
            });
            return req;
        };
        HttpUtils.postAjax = function (url, postData, headers) {
            var _headers = coreUtils.merge(headers, { "Content-Type": "application/json; charset=utf-8" });
            var deferred = _async.createDeferred(), req = HttpUtils._getXMLRequest(url, "POST", deferred, _headers);
            req.send(postData);
            return new deferred_3.AbortablePromise(deferred, req);
        };
        HttpUtils.getAjax = function (url, headers) {
            var deferred = _async.createDeferred(), req = HttpUtils._getXMLRequest(url, "GET", deferred, headers);
            req.send(null);
            return new deferred_3.AbortablePromise(deferred, req);
        };
        HttpUtils.defaultHeaders = {};
        HttpUtils.ajaxTimeOut = 600;
        return HttpUtils;
    }());
    exports.HttpUtils = HttpUtils;
});
define("jriapp_shared/utils/utils", ["require", "exports", "jriapp_shared/utils/coreutils", "jriapp_shared/utils/debug", "jriapp_shared/utils/error", "jriapp_shared/utils/logger", "jriapp_shared/utils/sysutils", "jriapp_shared/utils/async", "jriapp_shared/utils/http", "jriapp_shared/utils/strUtils", "jriapp_shared/utils/checks", "jriapp_shared/utils/arrhelper", "jriapp_shared/utils/deferred"], function (require, exports, coreutils_5, debug_2, error_3, logger_1, sysutils_4, async_2, http_1, strutils_4, checks_8, arrhelper_2, deferred_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Utils = (function () {
        function Utils() {
        }
        Utils.check = checks_8.Checks;
        Utils.str = strutils_4.StringUtils;
        Utils.arr = arrhelper_2.ArrayHelper;
        Utils.http = http_1.HttpUtils;
        Utils.core = coreutils_5.CoreUtils;
        Utils.defer = async_2.AsyncUtils;
        Utils.err = error_3.ERROR;
        Utils.log = logger_1.LOGGER;
        Utils.debug = debug_2.DEBUG;
        Utils.sys = sysutils_4.SysUtils;
        Utils.queue = deferred_4.getTaskQueue();
        return Utils;
    }());
    exports.Utils = Utils;
});
define("jriapp_shared/utils/waitqueue", ["require", "exports", "jriapp_shared/object", "jriapp_shared/utils/coreutils"], function (require, exports, object_2, coreutils_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var coreUtils = coreutils_6.CoreUtils;
    var WaitQueue = (function (_super) {
        __extends(WaitQueue, _super);
        function WaitQueue(owner) {
            var _this = _super.call(this) || this;
            _this._objId = coreUtils.getNewID("wq");
            _this._owner = owner;
            _this._queue = {};
            return _this;
        }
        WaitQueue.prototype._checkQueue = function (prop, value) {
            if (!this._owner || this._owner.getIsStateDirty()) {
                return;
            }
            var self = this, propQueue = this._queue[prop];
            var task;
            if (!propQueue || propQueue.length === 0) {
                return;
            }
            var i, firstWinsTask = null;
            var groups = { group: null, tasks: [] }, found = [], forRemoval = [];
            for (i = 0; i < propQueue.length; i += 1) {
                task = propQueue[i];
                if (task.predicate(value)) {
                    if (!task.group && groups.tasks.length === 0) {
                        firstWinsTask = task;
                        break;
                    }
                    else if (!!task.group) {
                        if (!groups.group) {
                            groups.group = task.group;
                        }
                        if (groups.group === task.group) {
                            groups.tasks.push(task);
                        }
                    }
                }
            }
            if (!!firstWinsTask) {
                found.push(firstWinsTask);
                forRemoval.push(firstWinsTask);
            }
            else {
                while (groups.tasks.length > 0) {
                    task = groups.tasks.pop();
                    if (!firstWinsTask) {
                        firstWinsTask = task;
                    }
                    if (firstWinsTask.lastWins) {
                        if (found.length === 0) {
                            found.push(task);
                        }
                    }
                    else {
                        found.push(task);
                    }
                    forRemoval.push(task);
                }
            }
            try {
                if (found.length > 0) {
                    i = propQueue.length;
                    while (i > 0) {
                        i -= 1;
                        if (forRemoval.indexOf(propQueue[i]) > -1) {
                            propQueue.splice(i, 1);
                        }
                    }
                    found.forEach(function (task) {
                        try {
                            task.action.apply(self._owner, task.args);
                        }
                        catch (ex) {
                            self._owner.handleError(ex, self);
                        }
                    });
                }
            }
            finally {
                if (propQueue.length === 0) {
                    delete this._queue[prop];
                    this._owner.objEvents.offProp(prop, this.uniqueID);
                }
            }
        };
        WaitQueue.prototype.enQueue = function (item) {
            var opts = coreUtils.extend({
                prop: "",
                groupName: null,
                predicate: null,
                action: null,
                actionArgs: [],
                lastWins: false
            }, item);
            var self = this;
            if (!this._owner) {
                return;
            }
            var property = opts.prop;
            var propQueue = this._queue[property];
            if (!propQueue) {
                propQueue = [];
                this._queue[property] = propQueue;
                this._owner.objEvents.onProp(property, function (s, a) {
                    setTimeout(function () {
                        if (self.getIsStateDirty()) {
                            return;
                        }
                        self._checkQueue(property, self._owner[property]);
                    }, 0);
                }, self.uniqueID);
            }
            var task = {
                predicate: opts.predicate,
                action: opts.action,
                group: opts.groupName,
                lastWins: opts.lastWins,
                args: (!opts.actionArgs ? [] : opts.actionArgs)
            };
            propQueue.push(task);
            self._checkQueue(property, self._owner[property]);
            setTimeout(function () {
                if (self.getIsStateDirty()) {
                    return;
                }
                self._checkQueue(property, self._owner[property]);
            }, 0);
        };
        WaitQueue.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            this._owner.objEvents.offNS(this.uniqueID);
            this._queue = {};
            this._owner = null;
            _super.prototype.dispose.call(this);
        };
        WaitQueue.prototype.toString = function () {
            return "WaitQueue " + this._objId;
        };
        Object.defineProperty(WaitQueue.prototype, "uniqueID", {
            get: function () {
                return this._objId;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WaitQueue.prototype, "owner", {
            get: function () {
                return this._owner;
            },
            enumerable: true,
            configurable: true
        });
        return WaitQueue;
    }(object_2.BaseObject));
    exports.WaitQueue = WaitQueue;
});
define("jriapp_shared/collection/utils", ["require", "exports", "jriapp_shared/utils/utils", "jriapp_shared/lang"], function (require, exports, utils_1, lang_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = utils_1.Utils, coreUtils = utils.core, strUtils = utils.str, checks = utils.check;
    function pad(num) {
        if (num < 10) {
            return "0" + num;
        }
        return "" + num;
    }
    function dateToString(dt) {
        return ("" + dt.getFullYear()) +
            "-" + pad(dt.getMonth() + 1) +
            "-" + pad(dt.getDate()) +
            "T" + pad(dt.getHours()) +
            ":" + pad(dt.getMinutes()) +
            ":" + pad(dt.getSeconds()) +
            "." + (dt.getMilliseconds() / 1000).toFixed(3).slice(2, 5) + "Z";
    }
    exports.ValueUtils = {
        valueToDate: function (val, dtcnv, serverTZ) {
            if (!val) {
                return null;
            }
            var dt = new Date(val);
            var clientTZ = coreUtils.getTimeZoneOffset();
            dt.setMinutes(dt.getMinutes() + clientTZ);
            switch (dtcnv) {
                case 0:
                    break;
                case 1:
                    dt.setMinutes(dt.getMinutes() + serverTZ);
                    dt.setMinutes(dt.getMinutes() - clientTZ);
                    break;
                case 2:
                    dt.setMinutes(dt.getMinutes() - clientTZ);
                    break;
                default:
                    throw new Error(strUtils.format(lang_4.ERRS.ERR_PARAM_INVALID, "dtcnv", dtcnv));
            }
            return dt;
        },
        dateToValue: function (dt, dtcnv, serverTZ) {
            if (dt === null) {
                return null;
            }
            if (!checks.isDate(dt)) {
                throw new Error(strUtils.format(lang_4.ERRS.ERR_PARAM_INVALID, "dt", dt));
            }
            var clientTZ = coreUtils.getTimeZoneOffset();
            switch (dtcnv) {
                case 0:
                    break;
                case 1:
                    dt.setMinutes(dt.getMinutes() + clientTZ);
                    dt.setMinutes(dt.getMinutes() - serverTZ);
                    break;
                case 2:
                    dt.setMinutes(dt.getMinutes() + clientTZ);
                    break;
                default:
                    throw new Error(strUtils.format(lang_4.ERRS.ERR_PARAM_INVALID, "dtcnv", dtcnv));
            }
            return dateToString(dt);
        },
        compareVals: function (v1, v2, dataType) {
            if ((v1 === null && v2 !== null) || (v1 !== null && v2 === null)) {
                return false;
            }
            switch (dataType) {
                case 6:
                case 7:
                case 8:
                    return (checks.isDate(v1) && checks.isDate(v2)) ? (v1.getTime() === v2.getTime()) : false;
                default:
                    return v1 === v2;
            }
        },
        stringifyValue: function (v, dtcnv, dataType, serverTZ) {
            var res = null;
            if (checks.isNt(v)) {
                return res;
            }
            function conv(v) {
                if (checks.isDate(v)) {
                    return exports.ValueUtils.dateToValue(v, dtcnv, serverTZ);
                }
                else if (checks.isArray(v)) {
                    return JSON.stringify(v);
                }
                else if (checks.isString(v)) {
                    return v;
                }
                else {
                    return JSON.stringify(v);
                }
            }
            ;
            var isOK = false;
            switch (dataType) {
                case 0:
                    res = conv(v);
                    isOK = true;
                    break;
                case 1:
                case 9:
                    if (checks.isString(v)) {
                        res = v;
                        isOK = true;
                    }
                    break;
                case 2:
                    if (checks.isBoolean(v)) {
                        res = JSON.stringify(v);
                        isOK = true;
                    }
                    break;
                case 3:
                case 4:
                case 5:
                    if (checks.isNumber(v)) {
                        res = JSON.stringify(v);
                        isOK = true;
                    }
                    break;
                case 6:
                case 7:
                case 8:
                    if (checks.isDate(v)) {
                        res = exports.ValueUtils.dateToValue(v, dtcnv, serverTZ);
                        isOK = true;
                    }
                    break;
                case 10:
                    if (checks.isArray(v)) {
                        res = JSON.stringify(v);
                        isOK = true;
                    }
                    break;
                default:
                    throw new Error(strUtils.format(lang_4.ERRS.ERR_PARAM_INVALID, "dataType", dataType));
            }
            if (!isOK) {
                throw new Error(strUtils.format(lang_4.ERRS.ERR_FIELD_WRONG_TYPE, v, dataType));
            }
            return res;
        },
        parseValue: function (v, dataType, dtcnv, serverTZ) {
            var res = null;
            if (v === checks.undefined || v === null) {
                return res;
            }
            switch (dataType) {
                case 0:
                    res = v;
                    break;
                case 1:
                case 9:
                    res = v;
                    break;
                case 2:
                    res = coreUtils.parseBool(v);
                    break;
                case 3:
                    res = parseInt(v, 10);
                    break;
                case 4:
                case 5:
                    res = parseFloat(v);
                    break;
                case 6:
                case 7:
                case 8:
                    res = exports.ValueUtils.valueToDate(v, dtcnv, serverTZ);
                    break;
                case 10:
                    res = JSON.parse(v);
                    break;
                default:
                    throw new Error(strUtils.format(lang_4.ERRS.ERR_PARAM_INVALID, "dataType", dataType));
            }
            return res;
        }
    };
    function _traverseField(fldName, fld, fn, parentRes) {
        if (fld.fieldType === 5) {
            var res = fn(fld, fldName, parentRes);
            if (!!fld.nested && fld.nested.length > 0) {
                var nestedFld = void 0;
                var len = fld.nested.length;
                for (var i = 0; i < len; i += 1) {
                    nestedFld = fld.nested[i];
                    if (nestedFld.fieldType === 5) {
                        _traverseField(fldName + "." + nestedFld.fieldName, nestedFld, fn, res);
                    }
                    else {
                        fn(nestedFld, fldName + "." + nestedFld.fieldName, res);
                    }
                }
            }
        }
        else {
            fn(fld, fldName, parentRes);
        }
    }
    exports.CollUtils = {
        getObjectField: function (name, flds) {
            var arrFlds = flds.filter(function (f) { return f.fieldName === name; });
            if (!arrFlds || arrFlds.length !== 1) {
                throw new Error(strUtils.format(lang_4.ERRS.ERR_ASSERTION_FAILED, "arrFlds.length === 1"));
            }
            return arrFlds[0];
        },
        traverseField: function (fld, fn, parentRes) {
            _traverseField(fld.fieldName, fld, fn, parentRes);
        },
        traverseFields: function (flds, fn, parentRes) {
            for (var i = 0; i < flds.length; i += 1) {
                _traverseField(flds[i].fieldName, flds[i], fn, parentRes);
            }
        },
        getPKFields: function (fieldInfos) {
            var pkFlds = [], len = fieldInfos.length;
            for (var i = 0; i < len; i += 1) {
                var fld = fieldInfos[i];
                if (fld.isPrimaryKey > 0) {
                    pkFlds.push(fld);
                }
            }
            return pkFlds.sort(function (f1, f2) {
                return f1.isPrimaryKey - f2.isPrimaryKey;
            });
        },
        initVals: function (flds, vals) {
            exports.CollUtils.traverseFields(flds, function (fld, fullName) {
                if (fld.fieldType === 5) {
                    coreUtils.setValue(vals, fullName, {});
                }
                else {
                    if (!(fld.fieldType === 3 || fld.fieldType === 2)) {
                        coreUtils.setValue(vals, fullName, null);
                    }
                }
            });
            return vals;
        },
        copyVals: function (flds, from, to) {
            exports.CollUtils.traverseFields(flds, function (fld, fullName) {
                if (fld.fieldType === 5) {
                    coreUtils.setValue(to, fullName, {});
                }
                else {
                    if (!(fld.fieldType === 3 || fld.fieldType === 2)) {
                        var value = coreUtils.getValue(from, fullName);
                        coreUtils.setValue(to, fullName, value);
                    }
                }
            });
            return to;
        },
        objToVals: function (flds, obj) {
            return (!obj) ? exports.CollUtils.initVals(flds, {}) : exports.CollUtils.copyVals(flds, obj, {});
        },
        cloneVals: function (flds, vals) {
            return exports.CollUtils.copyVals(flds, vals, {});
        }
    };
});
define("jriapp_shared/collection/base", ["require", "exports", "jriapp_shared/object", "jriapp_shared/lang", "jriapp_shared/utils/waitqueue", "jriapp_shared/utils/utils", "jriapp_shared/collection/int", "jriapp_shared/collection/utils", "jriapp_shared/errors"], function (require, exports, object_3, lang_5, waitqueue_1, utils_2, int_2, utils_3, errors_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = utils_2.Utils, coreUtils = utils.core, strUtils = utils.str, checks = utils.check, sys = utils.sys, valUtils = utils_3.ValueUtils, collUtils = utils_3.CollUtils;
    sys.isCollection = function (obj) { return (!!obj && obj instanceof BaseCollection); };
    var COLL_EVENTS = {
        begin_edit: "begin_edit",
        end_edit: "end_edit",
        before_begin_edit: "before_be",
        before_end_edit: "before_ee",
        collection_changed: "coll_changed",
        fill: "fill",
        item_deleting: "item_deleting",
        item_adding: "item_adding",
        item_added: "item_added",
        validate_field: "validate_field",
        validate_item: "validate_item",
        current_changing: "current_changing",
        page_changing: "page_changing",
        errors_changed: "errors_changed",
        status_changed: "status_changed",
        clearing: "clearing",
        cleared: "cleared",
        commit_changes: "commit_changes"
    };
    var Errors = (function () {
        function Errors(owner) {
            this._errors = {};
            this._owner = owner;
        }
        Errors.prototype.clear = function () {
            this._errors = {};
        };
        Errors.prototype.validateItem = function (item) {
            var args = { item: item, result: [] };
            return this._owner._getInternal().validateItem(args);
        };
        Errors.prototype.validateItemField = function (item, fieldName) {
            var args = { item: item, fieldName: fieldName, errors: [] };
            return this._owner._getInternal().validateItemField(args);
        };
        Errors.prototype.addErrors = function (item, errors) {
            var _this = this;
            errors.forEach(function (err) {
                _this.addError(item, err.fieldName, err.errors, true);
            });
            this.onErrorsChanged(item);
        };
        Errors.prototype.addError = function (item, fieldName, errors, ignoreChangeErrors) {
            if (!fieldName) {
                fieldName = "*";
            }
            if (!(checks.isArray(errors) && errors.length > 0)) {
                this.removeError(item, fieldName, ignoreChangeErrors);
                return;
            }
            if (!this._errors[item._key]) {
                this._errors[item._key] = {};
            }
            var itemErrors = this._errors[item._key];
            itemErrors[fieldName] = errors;
            if (!ignoreChangeErrors) {
                this.onErrorsChanged(item);
            }
        };
        Errors.prototype.removeError = function (item, fieldName, ignoreChangeErrors) {
            var itemErrors = this._errors[item._key];
            if (!itemErrors) {
                return;
            }
            if (!fieldName) {
                fieldName = "*";
            }
            if (!itemErrors[fieldName]) {
                return;
            }
            delete itemErrors[fieldName];
            if (Object.keys(itemErrors).length === 0) {
                delete this._errors[item._key];
            }
            if (!ignoreChangeErrors) {
                this.onErrorsChanged(item);
            }
        };
        Errors.prototype.removeAllErrors = function (item) {
            var itemErrors = this._errors[item._key];
            if (!itemErrors) {
                return;
            }
            delete this._errors[item._key];
            this.onErrorsChanged(item);
        };
        Errors.prototype.getErrors = function (item) {
            return this._errors[item._key];
        };
        Errors.prototype.onErrorsChanged = function (item) {
            var args = { item: item };
            this._owner._getInternal().onErrorsChanged(args);
            item._aspect.raiseErrorsChanged();
        };
        Errors.prototype.getItemsWithErrors = function () {
            var _this = this;
            var res = [];
            coreUtils.forEachProp(this._errors, function (key) {
                var item = _this._owner.getItemByKey(key);
                res.push(item);
            });
            return res;
        };
        return Errors;
    }());
    exports.Errors = Errors;
    var BaseCollection = (function (_super) {
        __extends(BaseCollection, _super);
        function BaseCollection() {
            var _this = _super.call(this) || this;
            var self = _this;
            _this._objId = coreUtils.getNewID("coll");
            _this._options = { enablePaging: false, pageSize: 50 };
            _this._isLoading = false;
            _this._isUpdating = false;
            _this._EditingItem = null;
            _this._perms = { canAddRow: true, canEditRow: true, canDeleteRow: true, canRefreshRow: false };
            _this._totalCount = 0;
            _this._pageIndex = 0;
            _this._items = [];
            _this._itemsByKey = {};
            _this._currentPos = -1;
            _this._newKey = 0;
            _this._fieldMap = {};
            _this._fieldInfos = [];
            _this._errors = new Errors(_this);
            _this._pkInfo = null;
            _this._waitQueue = new waitqueue_1.WaitQueue(_this);
            _this._internal = {
                getEditingItem: function () {
                    return self._getEditingItem();
                },
                getStrValue: function (val, fieldInfo) {
                    return self._getStrValue(val, fieldInfo);
                },
                onBeforeEditing: function (item, isBegin, isCanceled) {
                    self._onBeforeEditing(item, isBegin, isCanceled);
                },
                onEditing: function (item, isBegin, isCanceled) {
                    self._onEditing(item, isBegin, isCanceled);
                },
                onCommitChanges: function (item, isBegin, isRejected, status) {
                    self._onCommitChanges(item, isBegin, isRejected, status);
                },
                onItemDeleting: function (args) {
                    return self._onItemDeleting(args);
                },
                onErrorsChanged: function (args) {
                    self.objEvents.raise(COLL_EVENTS.errors_changed, args);
                },
                validateItemField: function (args) {
                    self.objEvents.raise(COLL_EVENTS.validate_field, args);
                    return (!!args.errors && args.errors.length > 0) ? { fieldName: args.fieldName, errors: args.errors } : null;
                },
                validateItem: function (args) {
                    self.objEvents.raise(COLL_EVENTS.validate_item, args);
                    return (!!args.result && args.result.length > 0) ? args.result : [];
                }
            };
            return _this;
        }
        BaseCollection.getEmptyFieldInfo = function (fieldName) {
            var fieldInfo = {
                fieldName: fieldName,
                isPrimaryKey: 0,
                dataType: 0,
                isNullable: true,
                maxLength: -1,
                isReadOnly: false,
                isAutoGenerated: false,
                allowClientDefault: false,
                dateConversion: 0,
                fieldType: 1,
                isNeedOriginal: false,
                range: null,
                regex: null,
                nested: null,
                dependentOn: null,
                fullName: null
            };
            return fieldInfo;
        };
        BaseCollection.prototype.getEventNames = function () {
            var baseEvents = _super.prototype.getEventNames.call(this);
            var events = Object.keys(COLL_EVENTS).map(function (key) { return COLL_EVENTS[key]; });
            return events.concat(baseEvents);
        };
        BaseCollection.prototype.addOnClearing = function (fn, nmspace, context, priority) {
            this.objEvents.on(COLL_EVENTS.clearing, fn, nmspace, context, priority);
        };
        BaseCollection.prototype.removeOnClearing = function (nmspace) {
            this.objEvents.off(COLL_EVENTS.clearing, nmspace);
        };
        BaseCollection.prototype.addOnCleared = function (fn, nmspace, context, priority) {
            this.objEvents.on(COLL_EVENTS.cleared, fn, nmspace, context, priority);
        };
        BaseCollection.prototype.removeOnCleared = function (nmspace) {
            this.objEvents.off(COLL_EVENTS.cleared, nmspace);
        };
        BaseCollection.prototype.addOnCollChanged = function (fn, nmspace, context, priority) {
            this.objEvents.on(COLL_EVENTS.collection_changed, fn, nmspace, context, priority);
        };
        BaseCollection.prototype.removeOnCollChanged = function (nmspace) {
            this.objEvents.off(COLL_EVENTS.collection_changed, nmspace);
        };
        BaseCollection.prototype.addOnFill = function (fn, nmspace, context, priority) {
            this.objEvents.on(COLL_EVENTS.fill, fn, nmspace, context, priority);
        };
        BaseCollection.prototype.removeOnFill = function (nmspace) {
            this.objEvents.off(COLL_EVENTS.fill, nmspace);
        };
        BaseCollection.prototype.addOnValidateField = function (fn, nmspace, context, priority) {
            this.objEvents.on(COLL_EVENTS.validate_field, fn, nmspace, context, priority);
        };
        BaseCollection.prototype.removeOnValidateField = function (nmspace) {
            this.objEvents.off(COLL_EVENTS.validate_field, nmspace);
        };
        BaseCollection.prototype.addOnValidateItem = function (fn, nmspace, context, priority) {
            this.objEvents.on(COLL_EVENTS.validate_item, fn, nmspace, context, priority);
        };
        BaseCollection.prototype.removeOnValidateItem = function (nmspace) {
            this.objEvents.off(COLL_EVENTS.validate_item, nmspace);
        };
        BaseCollection.prototype.addOnItemDeleting = function (fn, nmspace, context, priority) {
            this.objEvents.on(COLL_EVENTS.item_deleting, fn, nmspace, context, priority);
        };
        BaseCollection.prototype.removeOnItemDeleting = function (nmspace) {
            this.objEvents.off(COLL_EVENTS.item_deleting, nmspace);
        };
        BaseCollection.prototype.addOnItemAdding = function (fn, nmspace, context, priority) {
            this.objEvents.on(COLL_EVENTS.item_adding, fn, nmspace, context, priority);
        };
        BaseCollection.prototype.removeOnItemAdding = function (nmspace) {
            this.objEvents.off(COLL_EVENTS.item_adding, nmspace);
        };
        BaseCollection.prototype.addOnItemAdded = function (fn, nmspace, context, priority) {
            this.objEvents.on(COLL_EVENTS.item_added, fn, nmspace, context, priority);
        };
        BaseCollection.prototype.removeOnItemAdded = function (nmspace) {
            this.objEvents.off(COLL_EVENTS.item_added, nmspace);
        };
        BaseCollection.prototype.addOnCurrentChanging = function (fn, nmspace, context, priority) {
            this.objEvents.on(COLL_EVENTS.current_changing, fn, nmspace, context, priority);
        };
        BaseCollection.prototype.removeOnCurrentChanging = function (nmspace) {
            this.objEvents.off(COLL_EVENTS.current_changing, nmspace);
        };
        BaseCollection.prototype.addOnPageChanging = function (fn, nmspace, context, priority) {
            this.objEvents.on(COLL_EVENTS.page_changing, fn, nmspace, context, priority);
        };
        BaseCollection.prototype.removeOnPageChanging = function (nmspace) {
            this.objEvents.off(COLL_EVENTS.page_changing, nmspace);
        };
        BaseCollection.prototype.addOnErrorsChanged = function (fn, nmspace, context, priority) {
            this.objEvents.on(COLL_EVENTS.errors_changed, fn, nmspace, context, priority);
        };
        BaseCollection.prototype.removeOnErrorsChanged = function (nmspace) {
            this.objEvents.off(COLL_EVENTS.errors_changed, nmspace);
        };
        BaseCollection.prototype.addOnBeginEdit = function (fn, nmspace, context, priority) {
            this.objEvents.on(COLL_EVENTS.begin_edit, fn, nmspace, context, priority);
        };
        BaseCollection.prototype.removeOnBeginEdit = function (nmspace) {
            this.objEvents.off(COLL_EVENTS.begin_edit, nmspace);
        };
        BaseCollection.prototype.addOnEndEdit = function (fn, nmspace, context, priority) {
            this.objEvents.on(COLL_EVENTS.end_edit, fn, nmspace, context, priority);
        };
        BaseCollection.prototype.removeOnEndEdit = function (nmspace) {
            this.objEvents.off(COLL_EVENTS.end_edit, nmspace);
        };
        BaseCollection.prototype.addOnBeforeBeginEdit = function (fn, nmspace, context, priority) {
            this.objEvents.on(COLL_EVENTS.before_begin_edit, fn, nmspace, context, priority);
        };
        BaseCollection.prototype.removeOnBeforeBeginEdit = function (nmspace) {
            this.objEvents.off(COLL_EVENTS.before_begin_edit, nmspace);
        };
        BaseCollection.prototype.addOnBeforeEndEdit = function (fn, nmspace, context, priority) {
            this.objEvents.on(COLL_EVENTS.before_end_edit, fn, nmspace, context, priority);
        };
        BaseCollection.prototype.removeBeforeOnEndEdit = function (nmspace) {
            this.objEvents.off(COLL_EVENTS.before_end_edit, nmspace);
        };
        BaseCollection.prototype.addOnCommitChanges = function (fn, nmspace, context, priority) {
            this.objEvents.on(COLL_EVENTS.commit_changes, fn, nmspace, context, priority);
        };
        BaseCollection.prototype.removeOnCommitChanges = function (nmspace) {
            this.objEvents.off(COLL_EVENTS.commit_changes, nmspace);
        };
        BaseCollection.prototype.addOnStatusChanged = function (fn, nmspace, context, priority) {
            this.objEvents.on(COLL_EVENTS.status_changed, fn, nmspace, context, priority);
        };
        BaseCollection.prototype.removeOnStatusChanged = function (nmspace) {
            this.objEvents.off(COLL_EVENTS.status_changed, nmspace);
        };
        BaseCollection.prototype.addOnPageIndexChanged = function (handler, nmspace, context) {
            this.objEvents.onProp(int_2.PROP_NAME.pageIndex, handler, nmspace, context);
        };
        BaseCollection.prototype.addOnPageSizeChanged = function (handler, nmspace, context) {
            this.objEvents.onProp(int_2.PROP_NAME.pageSize, handler, nmspace, context);
        };
        BaseCollection.prototype.addOnTotalCountChanged = function (handler, nmspace, context) {
            this.objEvents.onProp(int_2.PROP_NAME.totalCount, handler, nmspace, context);
        };
        BaseCollection.prototype.addOnCurrentChanged = function (handler, nmspace, context) {
            this.objEvents.onProp(int_2.PROP_NAME.currentItem, handler, nmspace, context);
        };
        BaseCollection.prototype._updatePermissions = function (perms) {
            this._perms = perms;
        };
        BaseCollection.prototype._getPKFieldInfos = function () {
            if (!!this._pkInfo) {
                return this._pkInfo;
            }
            var fldMap = this._fieldMap, pk = [];
            coreUtils.forEachProp(fldMap, function (fldName) {
                if (fldMap[fldName].isPrimaryKey > 0) {
                    pk.push(fldMap[fldName]);
                }
            });
            pk.sort(function (a, b) {
                return a.isPrimaryKey - b.isPrimaryKey;
            });
            this._pkInfo = pk;
            return this._pkInfo;
        };
        BaseCollection.prototype._checkCurrentChanging = function (newCurrent) {
            try {
                this.endEdit();
            }
            catch (ex) {
                utils.err.reThrow(ex, this.handleError(ex, this));
            }
        };
        BaseCollection.prototype._onCurrentChanging = function (newCurrent) {
            this._checkCurrentChanging(newCurrent);
            this.objEvents.raise(COLL_EVENTS.current_changing, { newCurrent: newCurrent });
        };
        BaseCollection.prototype._onCurrentChanged = function () {
            this.objEvents.raiseProp(int_2.PROP_NAME.currentItem);
        };
        BaseCollection.prototype._onCountChanged = function () {
            this.objEvents.raiseProp(int_2.PROP_NAME.count);
        };
        BaseCollection.prototype._onEditingChanged = function () {
            this.objEvents.raiseProp(int_2.PROP_NAME.isEditing);
        };
        BaseCollection.prototype._onItemStatusChanged = function (item, oldStatus) {
            this.objEvents.raise(COLL_EVENTS.status_changed, { item: item, oldStatus: oldStatus, key: item._key });
        };
        BaseCollection.prototype._onCollectionChanged = function (args) {
            this.objEvents.raise(COLL_EVENTS.collection_changed, args);
        };
        BaseCollection.prototype._onFillEnd = function (args) {
            this.objEvents.raise(COLL_EVENTS.fill, args);
        };
        BaseCollection.prototype._onItemAdding = function (item) {
            var args = { item: item, isCancel: false };
            this.objEvents.raise(COLL_EVENTS.item_adding, args);
            if (args.isCancel) {
                utils.err.throwDummy(new Error("operation canceled"));
            }
        };
        BaseCollection.prototype._onItemAdded = function (item) {
            var args = { item: item, isAddNewHandled: false };
            this.objEvents.raise(COLL_EVENTS.item_added, args);
        };
        BaseCollection.prototype._createNew = function () {
            throw new Error("_createNew Not implemented");
        };
        BaseCollection.prototype._attach = function (item, itemPos) {
            if (!!this._itemsByKey[item._key]) {
                throw new Error(lang_5.ERRS.ERR_ITEM_IS_ATTACHED);
            }
            try {
                this.endEdit();
            }
            catch (ex) {
                utils.err.reThrow(ex, this.handleError(ex, this));
            }
            var pos;
            item._aspect._onAttaching();
            if (checks.isNt(itemPos)) {
                pos = this._items.length;
                this._items.push(item);
            }
            else {
                pos = itemPos;
                utils.arr.insert(this._items, item, pos);
            }
            this._itemsByKey[item._key] = item;
            this._onCollectionChanged({
                changeType: 1,
                reason: 0,
                oper: 2,
                items: [item],
                pos: [pos],
                new_key: item._key
            });
            item._aspect._onAttach();
            this.objEvents.raiseProp(int_2.PROP_NAME.count);
            this._onCurrentChanging(item);
            this._currentPos = pos;
            this._onCurrentChanged();
            return pos;
        };
        BaseCollection.prototype._onRemoved = function (item, pos) {
            try {
                this._onCollectionChanged({
                    changeType: 0,
                    reason: 0,
                    oper: 3,
                    items: [item],
                    pos: [pos],
                    old_key: item._key
                });
            }
            finally {
                this.objEvents.raiseProp(int_2.PROP_NAME.count);
            }
        };
        BaseCollection.prototype._onPageSizeChanged = function () {
        };
        BaseCollection.prototype._onPageChanging = function () {
            var args = { page: this.pageIndex, isCancel: false };
            this.objEvents.raise(COLL_EVENTS.page_changing, args);
            if (!args.isCancel) {
                try {
                    this.endEdit();
                }
                catch (ex) {
                    utils.err.reThrow(ex, this.handleError(ex, this));
                }
            }
            return !args.isCancel;
        };
        BaseCollection.prototype._onPageChanged = function () {
        };
        BaseCollection.prototype._setCurrentItem = function (v) {
            var self = this, oldPos = self._currentPos;
            if (!v) {
                if (oldPos !== -1) {
                    self._onCurrentChanging(null);
                    self._currentPos = -1;
                    self._onCurrentChanged();
                }
                return;
            }
            if (v._aspect.isDetached) {
                throw new Error(lang_5.ERRS.ERR_ITEM_IS_DETACHED);
            }
            var item = self.getItemByKey(v._key);
            if (!item) {
                throw new Error(lang_5.ERRS.ERR_ITEM_IS_NOTFOUND);
            }
            var oldItem = self.getItemByPos(oldPos);
            var pos = self._items.indexOf(v);
            if (pos < 0) {
                throw new Error(lang_5.ERRS.ERR_ITEM_IS_NOTFOUND);
            }
            if (oldPos !== pos || oldItem !== v) {
                self._onCurrentChanging(v);
                self._currentPos = pos;
                self._onCurrentChanged();
            }
        };
        BaseCollection.prototype._clearItems = function (items) {
            items.forEach(function (item) {
                item._aspect._setIsAttached(false);
                item.dispose();
            });
        };
        BaseCollection.prototype.isHasProp = function (prop) {
            if (strUtils.startsWith(prop, "[")) {
                var res = sys.getProp(this, prop);
                return !checks.isUndefined(res);
            }
            return _super.prototype.isHasProp.call(this, prop);
        };
        BaseCollection.prototype._getEditingItem = function () {
            return this._EditingItem;
        };
        BaseCollection.prototype._getStrValue = function (val, fieldInfo) {
            var dcnv = fieldInfo.dateConversion, stz = coreUtils.getTimeZoneOffset();
            return valUtils.stringifyValue(val, dcnv, fieldInfo.dataType, stz);
        };
        BaseCollection.prototype._onBeforeEditing = function (item, isBegin, isCanceled) {
            if (this._isUpdating) {
                return;
            }
            if (isBegin) {
                this.objEvents.raise(COLL_EVENTS.before_begin_edit, { item: item });
            }
            else {
                this.objEvents.raise(COLL_EVENTS.before_end_edit, { item: item, isCanceled: isCanceled });
            }
        };
        BaseCollection.prototype._onEditing = function (item, isBegin, isCanceled) {
            if (this._isUpdating) {
                return;
            }
            if (isBegin) {
                this._EditingItem = item;
                this.objEvents.raise(COLL_EVENTS.begin_edit, { item: item });
                this._onEditingChanged();
                if (!!item) {
                    item._aspect.objEvents.raiseProp(int_2.PROP_NAME.isEditing);
                }
            }
            else {
                var oldItem = this._EditingItem;
                this._EditingItem = null;
                this.objEvents.raise(COLL_EVENTS.end_edit, { item: item, isCanceled: isCanceled });
                this._onEditingChanged();
                if (!!oldItem) {
                    oldItem._aspect.objEvents.raiseProp(int_2.PROP_NAME.isEditing);
                }
            }
        };
        BaseCollection.prototype._onCommitChanges = function (item, isBegin, isRejected, status) {
            this.objEvents.raise(COLL_EVENTS.commit_changes, { item: item, isBegin: isBegin, isRejected: isRejected, status: status });
        };
        BaseCollection.prototype._validateItem = function (item) {
            var args = { item: item, result: [] };
            this.objEvents.raise(COLL_EVENTS.validate_item, args);
            return (!!args.result && args.result.length > 0) ? args.result : [];
        };
        BaseCollection.prototype._validateItemField = function (item, fieldName) {
            var args = { item: item, fieldName: fieldName, errors: [] };
            this.objEvents.raise(COLL_EVENTS.validate_field, args);
            return (!!args.errors && args.errors.length > 0) ? { fieldName: fieldName, errors: args.errors } : null;
        };
        BaseCollection.prototype._onItemDeleting = function (args) {
            this.objEvents.raise(COLL_EVENTS.item_deleting, args);
            return !args.isCancel;
        };
        BaseCollection.prototype._clear = function (reason, oper) {
            this.objEvents.raise(COLL_EVENTS.clearing, { reason: reason });
            this.cancelEdit();
            this._EditingItem = null;
            this._newKey = 0;
            this.currentItem = null;
            var oldItems = this._items;
            try {
                this._items = [];
                this._itemsByKey = {};
                this._errors.clear();
                if (oper !== 1) {
                    this._onCollectionChanged({
                        changeType: 2,
                        reason: reason,
                        oper: oper,
                        items: [],
                        pos: []
                    });
                }
                this.objEvents.raise(COLL_EVENTS.cleared, { reason: reason });
                this._onCountChanged();
            }
            finally {
                this._clearItems(oldItems);
            }
        };
        BaseCollection.prototype._setIsLoading = function (v) {
            if (this._isLoading !== v) {
                this._isLoading = v;
                this.objEvents.raiseProp(int_2.PROP_NAME.isLoading);
            }
        };
        BaseCollection.prototype._getInternal = function () {
            return this._internal;
        };
        BaseCollection.prototype._getSortFn = function (fieldNames, sortOrder) {
            var mult = 1;
            if (sortOrder === 1) {
                mult = -1;
            }
            return function (a, b) {
                var res = 0, i, af, bf, fieldName;
                var len = fieldNames.length;
                for (i = 0; i < len; i += 1) {
                    fieldName = fieldNames[i];
                    af = sys.resolvePath(a, fieldName);
                    bf = sys.resolvePath(b, fieldName);
                    if (af === checks.undefined) {
                        af = null;
                    }
                    if (bf === checks.undefined) {
                        bf = null;
                    }
                    if (af === null && bf !== null) {
                        res = -1 * mult;
                    }
                    else if (af !== null && bf === null) {
                        res = mult;
                    }
                    else if (af < bf) {
                        res = -1 * mult;
                    }
                    else if (af > bf) {
                        res = mult;
                    }
                    else {
                        res = 0;
                    }
                    if (res !== 0) {
                        return res;
                    }
                }
                return res;
            };
        };
        BaseCollection.prototype.getFieldInfo = function (fieldName) {
            var parts = fieldName.split(".");
            var fld = this._fieldMap[parts[0]];
            if (parts.length === 1) {
                return fld;
            }
            if (fld.fieldType === 5) {
                for (var i = 1; i < parts.length; i += 1) {
                    fld = collUtils.getObjectField(parts[i], fld.nested);
                }
                return fld;
            }
            throw new Error(strUtils.format(lang_5.ERRS.ERR_PARAM_INVALID, "fieldName", fieldName));
        };
        BaseCollection.prototype.getFieldNames = function () {
            return this.getFieldInfos().map(function (f) {
                return f.fieldName;
            });
        };
        BaseCollection.prototype.getFieldInfos = function () {
            return this._fieldInfos;
        };
        BaseCollection.prototype.cancelEdit = function () {
            if (this.isEditing) {
                this._EditingItem._aspect.cancelEdit();
            }
        };
        BaseCollection.prototype.endEdit = function () {
            var EditingItem;
            if (this.isEditing) {
                EditingItem = this._EditingItem;
                if (!EditingItem._aspect.endEdit() && EditingItem._aspect.getIsHasErrors()) {
                    this.handleError(new errors_5.ValidationError(EditingItem._aspect.getAllErrors(), EditingItem), EditingItem);
                    this.cancelEdit();
                }
            }
        };
        BaseCollection.prototype.getItemsWithErrors = function () {
            return this._errors.getItemsWithErrors();
        };
        BaseCollection.prototype.addNew = function () {
            var item, isHandled;
            item = this._createNew();
            this._onItemAdding(item);
            this._attach(item, null);
            try {
                this.currentItem = item;
                item._aspect.beginEdit();
                this._onItemAdded(item);
            }
            catch (ex) {
                isHandled = this.handleError(ex, this);
                item._aspect.cancelEdit();
                utils.err.reThrow(ex, isHandled);
            }
            return item;
        };
        BaseCollection.prototype.getItemByPos = function (pos) {
            if (pos < 0 || pos >= this._items.length) {
                return null;
            }
            return this._items[pos];
        };
        BaseCollection.prototype.getItemByKey = function (key) {
            if (!key) {
                throw new Error(lang_5.ERRS.ERR_KEY_IS_EMPTY);
            }
            return this._itemsByKey["" + key];
        };
        BaseCollection.prototype.findByPK = function () {
            var vals = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                vals[_i] = arguments[_i];
            }
            if (arguments.length === 0) {
                return null;
            }
            var self = this, pkInfo = self._getPKFieldInfos(), arr = [];
            var key, values = [];
            if (vals.length === 1 && checks.isArray(vals[0])) {
                values = vals[0];
            }
            else {
                values = vals;
            }
            if (values.length !== pkInfo.length) {
                return null;
            }
            var len = pkInfo.length;
            for (var i = 0; i < len; i += 1) {
                arr.push(self._getStrValue(values[i], pkInfo[i]));
            }
            key = arr.join(";");
            return self.getItemByKey(key);
        };
        BaseCollection.prototype.moveFirst = function (skipDeleted) {
            var pos = 0, old = this._currentPos;
            if (old === pos) {
                return false;
            }
            var item = this.getItemByPos(pos);
            if (!item) {
                return false;
            }
            if (!!skipDeleted) {
                if (item._aspect.isDeleted) {
                    return this.moveNext(true);
                }
            }
            this._onCurrentChanging(item);
            this._currentPos = pos;
            this._onCurrentChanged();
            return true;
        };
        BaseCollection.prototype.movePrev = function (skipDeleted) {
            var pos = -1;
            var old = this._currentPos;
            var item = this.getItemByPos(old);
            if (!!item) {
                pos = old;
                pos -= 1;
            }
            item = this.getItemByPos(pos);
            if (!item) {
                return false;
            }
            if (!!skipDeleted) {
                if (item._aspect.isDeleted) {
                    this._currentPos = pos;
                    return this.movePrev(true);
                }
            }
            this._onCurrentChanging(item);
            this._currentPos = pos;
            this._onCurrentChanged();
            return true;
        };
        BaseCollection.prototype.moveNext = function (skipDeleted) {
            var pos = -1;
            var old = this._currentPos;
            var item = this.getItemByPos(old);
            if (!!item) {
                pos = old;
                pos += 1;
            }
            item = this.getItemByPos(pos);
            if (!item) {
                return false;
            }
            if (!!skipDeleted) {
                if (item._aspect.isDeleted) {
                    this._currentPos = pos;
                    return this.moveNext(true);
                }
            }
            this._onCurrentChanging(item);
            this._currentPos = pos;
            this._onCurrentChanged();
            return true;
        };
        BaseCollection.prototype.moveLast = function (skipDeleted) {
            var pos = this._items.length - 1, old = this._currentPos;
            if (old === pos) {
                return false;
            }
            var item = this.getItemByPos(pos);
            if (!item) {
                return false;
            }
            if (!!skipDeleted) {
                if (item._aspect.isDeleted) {
                    return this.movePrev(true);
                }
            }
            this._onCurrentChanging(item);
            this._currentPos = pos;
            this._onCurrentChanged();
            return true;
        };
        BaseCollection.prototype.goTo = function (pos) {
            var old = this._currentPos;
            if (old === pos) {
                return false;
            }
            var item = this.getItemByPos(pos);
            if (!item) {
                return false;
            }
            this._onCurrentChanging(item);
            this._currentPos = pos;
            this._onCurrentChanged();
            return true;
        };
        BaseCollection.prototype.forEach = function (callback, thisObj) {
            this._items.forEach(callback, thisObj);
        };
        BaseCollection.prototype.removeItem = function (item) {
            if (item._aspect.isDetached || !this._itemsByKey[item._key]) {
                return;
            }
            try {
                var oldPos = utils.arr.remove(this._items, item), key = item._key;
                if (oldPos < 0) {
                    throw new Error(lang_5.ERRS.ERR_ITEM_IS_NOTFOUND);
                }
                this._onRemoved(item, oldPos);
                delete this._itemsByKey[key];
                this._errors.removeAllErrors(item);
                item._aspect._setIsAttached(false);
                var test = this.getItemByPos(oldPos), curPos = this._currentPos;
                if (curPos === oldPos) {
                    if (!test) {
                        this._currentPos = curPos - 1;
                    }
                    this._onCurrentChanged();
                }
                if (curPos > oldPos) {
                    this._currentPos = curPos - 1;
                    this._onCurrentChanged();
                }
            }
            finally {
                if (!item.getIsStateDirty()) {
                    item.dispose();
                }
            }
        };
        BaseCollection.prototype.sort = function (fieldNames, sortOrder) {
            return this.sortLocal(fieldNames, sortOrder);
        };
        BaseCollection.prototype.sortLocal = function (fieldNames, sortOrder) {
            var sortFn = this._getSortFn(fieldNames, sortOrder);
            var self = this, deferred = utils.defer.createDeferred();
            this.waitForNotLoading(function () {
                var cur = self.currentItem;
                self._setIsLoading(true);
                try {
                    self._items.sort(sortFn);
                    self._onCollectionChanged({
                        changeType: 2,
                        reason: 2,
                        oper: 5,
                        items: [],
                        pos: []
                    });
                }
                finally {
                    self._setIsLoading(false);
                    deferred.resolve();
                }
                self.currentItem = null;
                self.currentItem = cur;
            }, "sorting");
            return deferred.promise();
        };
        BaseCollection.prototype.clear = function () {
            this._clear(0, 0);
            this.totalCount = 0;
        };
        BaseCollection.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            this._waitQueue.dispose();
            this._waitQueue = null;
            this.clear();
            this._fieldMap = {};
            this._fieldInfos = [];
            _super.prototype.dispose.call(this);
        };
        BaseCollection.prototype.waitForNotLoading = function (callback, groupName) {
            this._waitQueue.enQueue({
                prop: int_2.PROP_NAME.isLoading,
                groupName: groupName,
                predicate: function (val) { return !val; },
                action: callback,
                actionArgs: [],
                lastWins: !!groupName
            });
        };
        BaseCollection.prototype.toString = function () {
            return "Collection";
        };
        Object.defineProperty(BaseCollection.prototype, "errors", {
            get: function () { return this._errors; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseCollection.prototype, "options", {
            get: function () { return this._options; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseCollection.prototype, "items", {
            get: function () { return this._items; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseCollection.prototype, "currentItem", {
            get: function () { return this.getItemByPos(this._currentPos); },
            set: function (v) { this._setCurrentItem(v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseCollection.prototype, "count", {
            get: function () { return this._items.length; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseCollection.prototype, "totalCount", {
            get: function () { return this._totalCount; },
            set: function (v) {
                if (v !== this._totalCount) {
                    this._totalCount = v;
                    this.objEvents.raiseProp(int_2.PROP_NAME.totalCount);
                    this.objEvents.raiseProp(int_2.PROP_NAME.pageCount);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseCollection.prototype, "pageSize", {
            get: function () { return this._options.pageSize; },
            set: function (v) {
                if (this._options.pageSize !== v) {
                    this._options.pageSize = v;
                    this.objEvents.raiseProp(int_2.PROP_NAME.pageSize);
                    this._onPageSizeChanged();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseCollection.prototype, "pageIndex", {
            get: function () { return this._pageIndex; },
            set: function (v) {
                if (v !== this._pageIndex && this.isPagingEnabled) {
                    if (v < 0) {
                        return;
                    }
                    if (!this._onPageChanging()) {
                        return;
                    }
                    this._pageIndex = v;
                    this._onPageChanged();
                    this.objEvents.raiseProp(int_2.PROP_NAME.pageIndex);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseCollection.prototype, "pageCount", {
            get: function () {
                var rowCount = this.totalCount, rowPerPage = this.pageSize;
                var result;
                if ((rowCount === 0) || (rowPerPage === 0)) {
                    return 0;
                }
                if ((rowCount % rowPerPage) === 0) {
                    result = (rowCount / rowPerPage);
                }
                else {
                    result = (rowCount / rowPerPage);
                    result = Math.floor(result) + 1;
                }
                return result;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseCollection.prototype, "isPagingEnabled", {
            get: function () { return this._options.enablePaging; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseCollection.prototype, "isEditing", {
            get: function () { return !!this._EditingItem; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseCollection.prototype, "isLoading", {
            get: function () { return this._isLoading; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseCollection.prototype, "isUpdating", {
            get: function () { return this._isUpdating; },
            set: function (v) {
                if (this._isUpdating !== v) {
                    this._isUpdating = v;
                    this.objEvents.raiseProp(int_2.PROP_NAME.isUpdating);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseCollection.prototype, "permissions", {
            get: function () { return this._perms; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseCollection.prototype, "uniqueID", {
            get: function () {
                return this._objId;
            },
            enumerable: true,
            configurable: true
        });
        return BaseCollection;
    }(object_3.BaseObject));
    exports.BaseCollection = BaseCollection;
});
define("jriapp_shared/collection/validation", ["require", "exports", "jriapp_shared/lang", "jriapp_shared/utils/utils"], function (require, exports, lang_6, utils_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = utils_4.Utils, checks = utils.check, strUtils = utils.str;
    function fn_toArray(index) {
        var keys = Object.keys(index), result = [], len = keys.length;
        for (var i = 0; i < len; i += 1) {
            result.push(index[keys[i]]);
        }
        return result;
    }
    var Validations = (function () {
        function Validations() {
        }
        Validations._dtRangeToDate = function (str) {
            var dtParts = str.split("-"), dt = new Date(parseInt(dtParts[0], 10), parseInt(dtParts[1], 10) - 1, parseInt(dtParts[2], 10));
            return dt;
        };
        Validations.checkNumRange = function (num, range) {
            var errors = [], rangeParts = range.split(",");
            if (!!rangeParts[0]) {
                if (num < parseFloat(rangeParts[0])) {
                    errors.push(utils.str.format(lang_6.ERRS.ERR_FIELD_RANGE, num, range));
                }
            }
            if (!!rangeParts[1]) {
                if (num > parseFloat(rangeParts[1])) {
                    errors.push(utils.str.format(lang_6.ERRS.ERR_FIELD_RANGE, num, range));
                }
            }
            return errors;
        };
        Validations.checkDateRange = function (dt, range) {
            var errors = [], rangeParts = range.split(",");
            if (!!rangeParts[0]) {
                if (dt < Validations._dtRangeToDate(rangeParts[0])) {
                    errors.push(utils.str.format(lang_6.ERRS.ERR_FIELD_RANGE, dt, range));
                }
            }
            if (!!rangeParts[1]) {
                if (dt > Validations._dtRangeToDate(rangeParts[1])) {
                    errors.push(utils.str.format(lang_6.ERRS.ERR_FIELD_RANGE, dt, range));
                }
            }
            return errors;
        };
        Validations.checkField = function (fieldInfo, value, isNew) {
            var res = [];
            var isNullVal = (value === null || (checks.isString(value) && !value));
            if (isNullVal && !fieldInfo.isNullable && !fieldInfo.isReadOnly) {
                if (!(isNew && fieldInfo.isAutoGenerated)) {
                    res.push(lang_6.ERRS.ERR_FIELD_ISNOT_NULLABLE);
                }
            }
            if (isNullVal) {
                return res;
            }
            switch (fieldInfo.dataType) {
                case 0:
                    break;
                case 9:
                    if (!checks.isGuid(value)) {
                        res.push(strUtils.format(lang_6.ERRS.ERR_FIELD_WRONG_TYPE, value, "Guid"));
                    }
                    break;
                case 1:
                    if (!checks.isString(value)) {
                        res.push(strUtils.format(lang_6.ERRS.ERR_FIELD_WRONG_TYPE, value, "String"));
                    }
                    if (fieldInfo.maxLength > 0 && value.length > fieldInfo.maxLength) {
                        res.push(strUtils.format(lang_6.ERRS.ERR_FIELD_MAXLEN, fieldInfo.maxLength));
                    }
                    if (!!fieldInfo.regex) {
                        var reg = new RegExp(fieldInfo.regex, "i");
                        if (!reg.test(value)) {
                            res.push(strUtils.format(lang_6.ERRS.ERR_FIELD_REGEX, value));
                        }
                    }
                    break;
                case 10:
                    if (!checks.isArray(value)) {
                        res.push(strUtils.format(lang_6.ERRS.ERR_FIELD_WRONG_TYPE, value, "Array"));
                    }
                    if (fieldInfo.maxLength > 0 && value.length > fieldInfo.maxLength) {
                        res.push(strUtils.format(lang_6.ERRS.ERR_FIELD_MAXLEN, fieldInfo.maxLength));
                    }
                    break;
                case 2:
                    if (!checks.isBoolean(value)) {
                        res.push(strUtils.format(lang_6.ERRS.ERR_FIELD_WRONG_TYPE, value, "Boolean"));
                    }
                    break;
                case 3:
                case 4:
                case 5:
                    if (!checks.isNumber(value)) {
                        res.push(strUtils.format(lang_6.ERRS.ERR_FIELD_WRONG_TYPE, value, "Number"));
                    }
                    if (!!fieldInfo.range) {
                        Validations.checkNumRange(Number(value), fieldInfo.range).forEach(function (err) {
                            res.push(err);
                        });
                    }
                    break;
                case 6:
                case 7:
                    if (!checks.isDate(value)) {
                        res.push(strUtils.format(lang_6.ERRS.ERR_FIELD_WRONG_TYPE, value, "Date"));
                    }
                    if (!!fieldInfo.range) {
                        Validations.checkDateRange(value, fieldInfo.range).forEach(function (err) {
                            res.push(err);
                        });
                    }
                    break;
                case 8:
                    if (!checks.isDate(value)) {
                        res.push(strUtils.format(lang_6.ERRS.ERR_FIELD_WRONG_TYPE, value, "Time"));
                    }
                    break;
                default:
                    res.push(strUtils.format(lang_6.ERRS.ERR_PARAM_INVALID, "dataType", fieldInfo.dataType));
            }
            return res;
        };
        Validations.distinct = function (vals) {
            if (!vals) {
                return [];
            }
            var index = {};
            vals.forEach(function (val) {
                var name = !val.fieldName ? "*" : val.fieldName;
                var test = index[name];
                if (!!test) {
                    test.errors = test.errors.concat(val.errors);
                }
                else {
                    index[name] = val;
                }
            });
            return fn_toArray(index);
        };
        return Validations;
    }());
    exports.Validations = Validations;
});
define("jriapp_shared/collection/aspect", ["require", "exports", "jriapp_shared/object", "jriapp_shared/utils/utils", "jriapp_shared/collection/int", "jriapp_shared/collection/utils", "jriapp_shared/errors", "jriapp_shared/collection/validation"], function (require, exports, object_4, utils_5, int_3, utils_6, errors_6, validation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = utils_5.Utils, coreUtils = utils.core, checks = utils.check, sys = utils.sys, ERROR = utils.err, collUtils = utils_6.CollUtils;
    var AspectFlags;
    (function (AspectFlags) {
        AspectFlags[AspectFlags["IsAttached"] = 0] = "IsAttached";
        AspectFlags[AspectFlags["IsEdited"] = 1] = "IsEdited";
        AspectFlags[AspectFlags["IsRefreshing"] = 2] = "IsRefreshing";
        AspectFlags[AspectFlags["IsCancelling"] = 3] = "IsCancelling";
    })(AspectFlags || (AspectFlags = {}));
    function fn_destroyVal(entry, nmspace) {
        if (!entry) {
            return;
        }
        var val = entry.val;
        if (sys.isEditable(val) && val.isEditing) {
            val.cancelEdit();
        }
        var errNotification = sys.getErrorNotification(val);
        if (!!errNotification) {
            errNotification.removeOnErrorsChanged(nmspace);
        }
        if (entry.isOwnIt && sys.isBaseObj(val)) {
            val.dispose();
        }
    }
    function fn_checkDetached(aspect) {
        if (aspect.isDetached) {
            throw new Error("Invalid operation. The item is detached");
        }
    }
    var ItemAspect = (function (_super) {
        __extends(ItemAspect, _super);
        function ItemAspect(collection) {
            var _this = _super.call(this) || this;
            _this._collection = collection;
            _this._key = null;
            _this._item = null;
            _this._status = 0;
            _this._saveVals = null;
            _this._vals = null;
            _this._flags = 0;
            _this._valueBag = null;
            return _this;
        }
        ItemAspect.prototype.getEventNames = function () {
            var baseEvents = _super.prototype.getEventNames.call(this);
            return [int_3.ITEM_EVENTS.errors_changed].concat(baseEvents);
        };
        ItemAspect.prototype._onErrorsChanged = function () {
            this.objEvents.raise(int_3.ITEM_EVENTS.errors_changed, {});
        };
        ItemAspect.prototype._setIsEdited = function (v) {
            if (v) {
                this._flags |= (1 << 1);
            }
            else {
                this._flags &= ~(1 << 1);
            }
        };
        ItemAspect.prototype._setIsCancelling = function (v) {
            if (v) {
                this._flags |= (1 << 3);
            }
            else {
                this._flags &= ~(1 << 3);
            }
        };
        ItemAspect.prototype._beginEdit = function () {
            fn_checkDetached(this);
            var coll = this.collection;
            var isHandled = false;
            if (coll.isEditing) {
                var item = coll._getInternal().getEditingItem();
                if (item._aspect === this) {
                    return false;
                }
                try {
                    item._aspect.endEdit();
                    if (item._aspect.getIsHasErrors()) {
                        this.handleError(new errors_6.ValidationError(item._aspect.getAllErrors(), item), item);
                        item._aspect.cancelEdit();
                    }
                }
                catch (ex) {
                    isHandled = this.handleError(ex, item);
                    item._aspect.cancelEdit();
                    ERROR.reThrow(ex, isHandled);
                }
            }
            this._saveVals = collUtils.cloneVals(this.collection.getFieldInfos(), this._vals);
            this.collection.currentItem = this.item;
            return true;
        };
        ItemAspect.prototype._endEdit = function () {
            if (!this.isEditing) {
                return false;
            }
            fn_checkDetached(this);
            var coll = this.collection, self = this, errors = coll.errors;
            errors.removeAllErrors(this.item);
            var validations = this._validateFields();
            if (validations.length > 0) {
                errors.addErrors(self.item, validations);
            }
            if (this.getIsHasErrors()) {
                return false;
            }
            this._saveVals = null;
            return true;
        };
        ItemAspect.prototype._cancelEdit = function () {
            if (!this.isEditing) {
                return false;
            }
            fn_checkDetached(this);
            var coll = this.collection, self = this, item = self.item, changes = this._saveVals;
            this._vals = this._saveVals;
            this._saveVals = null;
            coll.errors.removeAllErrors(item);
            coll.getFieldNames().forEach(function (name) {
                if (changes[name] !== self._vals[name]) {
                    item.objEvents.raiseProp(name);
                }
            });
            return true;
        };
        ItemAspect.prototype._skipValidate = function (fieldInfo, val) {
            return false;
        };
        ItemAspect.prototype._validateItem = function () {
            return this.collection.errors.validateItem(this.item);
        };
        ItemAspect.prototype._validateField = function (fieldName) {
            var fieldInfo = this.getFieldInfo(fieldName), errors = this.collection.errors;
            var value = coreUtils.getValue(this._vals, fieldName);
            if (this._skipValidate(fieldInfo, value)) {
                return null;
            }
            var standardErrors = validation_1.Validations.checkField(fieldInfo, value, this.isNew);
            var customValidation = errors.validateItemField(this.item, fieldName);
            var result = { fieldName: fieldName, errors: [] };
            if (standardErrors.length > 0) {
                result.errors = standardErrors;
            }
            if (!!customValidation && customValidation.errors.length > 0) {
                result.errors = result.errors.concat(customValidation.errors);
            }
            return (result.errors.length > 0) ? result : null;
        };
        ItemAspect.prototype._validateFields = function () {
            var self = this, fieldInfos = this.collection.getFieldInfos(), res = [];
            collUtils.traverseFields(fieldInfos, function (fld, fullName) {
                if (fld.fieldType !== 5) {
                    var fieldValidation = self._validateField(fullName);
                    if (!!fieldValidation && fieldValidation.errors.length > 0) {
                        res.push(fieldValidation);
                    }
                }
            });
            var itemVals = self._validateItem();
            return validation_1.Validations.distinct(res.concat(itemVals));
        };
        ItemAspect.prototype._resetStatus = function () {
        };
        ItemAspect.prototype.handleError = function (error, source) {
            return this.collection.handleError(error, source);
        };
        ItemAspect.prototype._setItem = function (v) {
            this._item = v;
        };
        ItemAspect.prototype._setKey = function (v) {
            this._key = v;
        };
        ItemAspect.prototype._setIsAttached = function (v) {
            if (v) {
                this._flags |= (1 << 0);
            }
            else {
                this._flags &= ~(1 << 0);
            }
        };
        ItemAspect.prototype._setIsRefreshing = function (v) {
            if (this.isRefreshing !== v) {
                if (v) {
                    this._flags |= (1 << 2);
                }
                else {
                    this._flags &= ~(1 << 2);
                }
                this.objEvents.raiseProp(int_3.PROP_NAME.isRefreshing);
            }
        };
        ItemAspect.prototype._onAttaching = function () {
        };
        ItemAspect.prototype._onAttach = function () {
            this._setIsAttached(true);
        };
        ItemAspect.prototype.raiseErrorsChanged = function () {
            this._onErrorsChanged();
        };
        ItemAspect.prototype.getFieldInfo = function (fieldName) {
            return this.collection.getFieldInfo(fieldName);
        };
        ItemAspect.prototype.getFieldNames = function () {
            return this.collection.getFieldNames();
        };
        ItemAspect.prototype.getErrorString = function () {
            var itemErrors = this.collection.errors.getErrors(this.item);
            if (!itemErrors) {
                return "";
            }
            var res = [];
            coreUtils.forEachProp(itemErrors, function (name, errs) {
                for (var i = 0; i < errs.length; i += 1) {
                    res.push(name + ": " + errs[i]);
                }
            });
            return res.join("|");
        };
        ItemAspect.prototype.submitChanges = function () {
            return utils.defer.reject("not implemented");
        };
        ItemAspect.prototype.rejectChanges = function () {
        };
        ItemAspect.prototype.beginEdit = function () {
            fn_checkDetached(this);
            if (this.isEditing) {
                return false;
            }
            var coll = this.collection, internal = coll._getInternal(), item = this.item;
            internal.onBeforeEditing(item, true, false);
            if (!this._beginEdit()) {
                return false;
            }
            internal.onEditing(item, true, false);
            if (!!this._valueBag && this.isEditing) {
                coreUtils.forEachProp(this._valueBag, function (name, obj) {
                    if (!!obj && sys.isEditable(obj.val)) {
                        obj.val.beginEdit();
                    }
                });
            }
            return true;
        };
        ItemAspect.prototype.endEdit = function () {
            if (!this.isEditing) {
                return false;
            }
            fn_checkDetached(this);
            var coll = this.collection, internal = coll._getInternal(), item = this.item;
            internal.onBeforeEditing(item, false, false);
            var customEndEdit = true;
            if (!!this._valueBag) {
                coreUtils.forEachProp(this._valueBag, function (name, obj) {
                    if (!!obj && sys.isEditable(obj.val)) {
                        if (!obj.val.endEdit()) {
                            customEndEdit = false;
                        }
                    }
                });
            }
            if (!customEndEdit || !this._endEdit()) {
                return false;
            }
            internal.onEditing(item, false, false);
            this._setIsEdited(true);
            return true;
        };
        ItemAspect.prototype.cancelEdit = function () {
            if (!this.isEditing) {
                return false;
            }
            fn_checkDetached(this);
            this._setIsCancelling(true);
            try {
                var coll = this.collection, internal = coll._getInternal(), item = this.item, isNew = this.isNew;
                internal.onBeforeEditing(item, false, true);
                if (!!this._valueBag) {
                    coreUtils.forEachProp(this._valueBag, function (name, obj) {
                        if (!!obj && sys.isEditable(obj.val)) {
                            obj.val.cancelEdit();
                        }
                    });
                }
                if (!this._cancelEdit()) {
                    return false;
                }
                internal.onEditing(item, false, true);
                if (isNew && !this.isEdited && !this.getIsStateDirty()) {
                    this.dispose();
                }
            }
            finally {
                this._setIsCancelling(false);
            }
            return true;
        };
        ItemAspect.prototype.deleteItem = function () {
            var coll = this.collection;
            if (this.isDetached) {
                return false;
            }
            var args = { item: this.item, isCancel: false };
            coll._getInternal().onItemDeleting(args);
            if (args.isCancel) {
                return false;
            }
            this.dispose();
            return true;
        };
        ItemAspect.prototype.getIsHasErrors = function () {
            var res = !!this.collection.errors.getErrors(this.item);
            if (!res && !!this._valueBag) {
                coreUtils.forEachProp(this._valueBag, function (name, obj) {
                    if (!!obj) {
                        var errNotification = sys.getErrorNotification(obj.val);
                        if (!!errNotification && errNotification.getIsHasErrors()) {
                            res = true;
                        }
                    }
                });
            }
            return res;
        };
        ItemAspect.prototype.addOnErrorsChanged = function (fn, nmspace, context) {
            this.objEvents.on(int_3.ITEM_EVENTS.errors_changed, fn, nmspace, context);
        };
        ItemAspect.prototype.removeOnErrorsChanged = function (nmspace) {
            this.objEvents.off(int_3.ITEM_EVENTS.errors_changed, nmspace);
        };
        ItemAspect.prototype.getFieldErrors = function (fieldName) {
            var res = [], itemErrors = this.collection.errors.getErrors(this.item);
            if (!itemErrors) {
                return res;
            }
            var name = fieldName;
            if (!fieldName) {
                fieldName = "*";
            }
            if (!itemErrors[fieldName]) {
                return res;
            }
            if (fieldName === "*") {
                name = null;
            }
            res.push({ fieldName: name, errors: itemErrors[fieldName] });
            return res;
        };
        ItemAspect.prototype.getAllErrors = function () {
            var res = [];
            if (!!this._valueBag) {
                coreUtils.forEachProp(this._valueBag, function (name, obj) {
                    var errNotification = sys.getErrorNotification(obj.val);
                    if (!!errNotification) {
                        res = res.concat(errNotification.getAllErrors());
                    }
                });
            }
            var itemErrors = this.collection.errors.getErrors(this.item);
            if (!itemErrors) {
                return res;
            }
            coreUtils.forEachProp(itemErrors, function (name) {
                var fieldName = null;
                if (name !== "*") {
                    fieldName = name;
                }
                res.push({ fieldName: fieldName, errors: itemErrors[name] });
            });
            return res;
        };
        ItemAspect.prototype.getIErrorNotification = function () {
            return this;
        };
        ItemAspect.prototype.setCustomVal = function (name, val, isOwnVal) {
            var _this = this;
            if (isOwnVal === void 0) { isOwnVal = true; }
            if (!this._valueBag) {
                if (checks.isNt(val)) {
                    return;
                }
                this._valueBag = {};
            }
            var oldEntry = this._valueBag[name], coll = this.collection;
            if (!!oldEntry && oldEntry.val !== val) {
                fn_destroyVal(oldEntry, coll.uniqueID);
            }
            if (checks.isNt(val)) {
                delete this._valueBag[name];
            }
            else {
                var newEntry = { val: val, isOwnIt: !!isOwnVal };
                this._valueBag[name] = newEntry;
                var errNotification = sys.getErrorNotification(val);
                if (!!errNotification) {
                    errNotification.addOnErrorsChanged(function () {
                        _this.raiseErrorsChanged();
                    }, coll.uniqueID);
                }
                if (this.isEditing && sys.isEditable(val)) {
                    val.beginEdit();
                }
            }
        };
        ItemAspect.prototype.getCustomVal = function (name) {
            if (!this._valueBag) {
                return null;
            }
            var obj = this._valueBag[name];
            return (!obj) ? null : obj.val;
        };
        ItemAspect.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            var coll = this._collection, item = this._item;
            if (!!item) {
                this.cancelEdit();
                var bag = this._valueBag;
                if (!!bag) {
                    coreUtils.forEachProp(bag, function (name, val) {
                        fn_destroyVal(val, coll.uniqueID);
                    });
                }
                if (!this.isDetached) {
                    coll.removeItem(item);
                }
            }
            this._flags = 0;
            _super.prototype.dispose.call(this);
        };
        ItemAspect.prototype.toString = function () {
            return "ItemAspect";
        };
        Object.defineProperty(ItemAspect.prototype, "vals", {
            get: function () {
                return collUtils.copyVals(this.collection.getFieldInfos(), this._vals, {});
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemAspect.prototype, "item", {
            get: function () {
                return this._item;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemAspect.prototype, "key", {
            get: function () {
                return this._key;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemAspect.prototype, "collection", {
            get: function () {
                return this._collection;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemAspect.prototype, "status", {
            get: function () {
                return this._status;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemAspect.prototype, "isUpdating", {
            get: function () {
                return this.collection.isUpdating;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemAspect.prototype, "isEditing", {
            get: function () {
                var editingItem = this.collection._getInternal().getEditingItem();
                return !!editingItem && editingItem._aspect === this;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemAspect.prototype, "isCanSubmit", {
            get: function () {
                return false;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemAspect.prototype, "isHasChanges", {
            get: function () {
                return this._status !== 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemAspect.prototype, "isNew", {
            get: function () {
                return this._status === 1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemAspect.prototype, "isDeleted", {
            get: function () {
                return this._status === 3;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemAspect.prototype, "isEdited", {
            get: function () {
                return !!(this._flags & (1 << 1));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemAspect.prototype, "isDetached", {
            get: function () {
                return !(this._flags & (1 << 0));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemAspect.prototype, "isRefreshing", {
            get: function () {
                return !!(this._flags & (1 << 2));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemAspect.prototype, "isCancelling", {
            get: function () {
                return !!(this._flags & (1 << 3));
            },
            enumerable: true,
            configurable: true
        });
        return ItemAspect;
    }(object_4.BaseObject));
    exports.ItemAspect = ItemAspect;
});
define("jriapp_shared/collection/item", ["require", "exports", "jriapp_shared/object", "jriapp_shared/utils/weakmap"], function (require, exports, object_5, weakmap_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var weakmap = weakmap_2.createWeakMap();
    var CollectionItem = (function (_super) {
        __extends(CollectionItem, _super);
        function CollectionItem(aspect) {
            var _this = _super.call(this) || this;
            weakmap.set(_this, aspect);
            return _this;
        }
        Object.defineProperty(CollectionItem.prototype, "_aspect", {
            get: function () {
                return weakmap.get(this);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CollectionItem.prototype, "_key", {
            get: function () {
                return this._aspect.key;
            },
            enumerable: true,
            configurable: true
        });
        CollectionItem.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            var aspect = this._aspect;
            if (!aspect.getIsStateDirty()) {
                aspect.dispose();
            }
            _super.prototype.dispose.call(this);
        };
        CollectionItem.prototype.toString = function () {
            return "CollectionItem";
        };
        return CollectionItem;
    }(object_5.BaseObject));
    exports.CollectionItem = CollectionItem;
});
define("jriapp_shared/collection/list", ["require", "exports", "jriapp_shared/utils/utils", "jriapp_shared/lang", "jriapp_shared/collection/int", "jriapp_shared/collection/utils", "jriapp_shared/collection/base", "jriapp_shared/collection/aspect", "jriapp_shared/errors"], function (require, exports, utils_7, lang_7, int_4, utils_8, base_1, aspect_1, errors_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = utils_7.Utils, coreUtils = utils.core, strUtils = utils.str, checks = utils.check, ERROR = utils.err, collUtils = utils_8.CollUtils;
    var ListItemAspect = (function (_super) {
        __extends(ListItemAspect, _super);
        function ListItemAspect(coll, vals, key, isNew) {
            var _this = _super.call(this, coll) || this;
            if (isNew) {
                _this._status = 1;
            }
            _this._vals = vals;
            var item = coll.itemFactory(_this);
            _this._setItem(item);
            _this._setKey(key);
            return _this;
        }
        ListItemAspect.prototype._setProp = function (name, val) {
            if (this.isCancelling) {
                return;
            }
            var error;
            var coll = this.collection, item = this.item, fieldInfo = this.getFieldInfo(name), errors = coll.errors;
            if (this._getProp(name) !== val) {
                try {
                    if (fieldInfo.isReadOnly && !(this.isNew && fieldInfo.allowClientDefault)) {
                        throw new Error(lang_7.ERRS.ERR_FIELD_READONLY);
                    }
                    coreUtils.setValue(this._vals, name, val, false);
                    item.objEvents.raiseProp(name);
                    errors.removeError(item, name);
                    var validationInfo = this._validateField(name);
                    if (!!validationInfo && validationInfo.errors.length > 0) {
                        throw new errors_7.ValidationError([validationInfo], this);
                    }
                }
                catch (ex) {
                    if (utils.sys.isValidationError(ex)) {
                        error = ex;
                    }
                    else {
                        error = new errors_7.ValidationError([
                            { fieldName: name, errors: [ex.message] }
                        ], this);
                    }
                    errors.addError(item, name, error.validations[0].errors);
                    throw error;
                }
            }
        };
        ListItemAspect.prototype._getProp = function (name) {
            return coreUtils.getValue(this._vals, name);
        };
        ListItemAspect.prototype._resetStatus = function () {
            this._status = 0;
        };
        ListItemAspect.prototype.toString = function () {
            if (!this.item) {
                return "ListItemAspect";
            }
            return this.item.toString() + "Aspect";
        };
        Object.defineProperty(ListItemAspect.prototype, "list", {
            get: function () { return this.collection; },
            enumerable: true,
            configurable: true
        });
        return ListItemAspect;
    }(aspect_1.ItemAspect));
    exports.ListItemAspect = ListItemAspect;
    var BaseList = (function (_super) {
        __extends(BaseList, _super);
        function BaseList(props) {
            var _this = _super.call(this) || this;
            if (!!props) {
                _this._updateFieldMap(props);
            }
            return _this;
        }
        BaseList.prototype._updateFieldMap = function (props) {
            var self = this;
            if (!checks.isArray(props) || props.length === 0) {
                throw new Error(strUtils.format(lang_7.ERRS.ERR_PARAM_INVALID, "props", props));
            }
            self._fieldMap = {};
            self._fieldInfos = [];
            props.forEach(function (prop) {
                var fldInfo = base_1.BaseCollection.getEmptyFieldInfo(prop.name);
                fldInfo.dataType = prop.dtype;
                self._fieldMap[prop.name] = fldInfo;
                self._fieldInfos.push(fldInfo);
                collUtils.traverseField(fldInfo, function (fld, fullName) {
                    fld.dependents = null;
                    fld.fullName = fullName;
                });
            });
        };
        BaseList.prototype._attach = function (item) {
            try {
                this.endEdit();
            }
            catch (ex) {
                ERROR.reThrow(ex, this.handleError(ex, this));
            }
            return _super.prototype._attach.call(this, item);
        };
        BaseList.prototype._createNew = function () {
            return this.createItem(null);
        };
        BaseList.prototype.createItem = function (obj) {
            var isNew = !obj, vals = isNew ? collUtils.initVals(this.getFieldInfos(), {}) : obj, key = this._getNewKey();
            var aspect = new ListItemAspect(this, vals, key, isNew);
            return aspect.item;
        };
        BaseList.prototype._getNewKey = function () {
            var key = "clkey_" + this._newKey;
            this._newKey += 1;
            return key;
        };
        BaseList.prototype.fillItems = function (objArray, clearAll) {
            var self = this, newItems = [], positions = [], items = [];
            if (!objArray) {
                objArray = [];
            }
            try {
                if (!!clearAll) {
                    this.clear();
                }
                objArray.forEach(function (obj) {
                    var item = self.createItem(obj), oldItem = self._itemsByKey[item._key];
                    if (!oldItem) {
                        self._items.push(item);
                        self._itemsByKey[item._key] = item;
                        newItems.push(item);
                        positions.push(self._items.length - 1);
                        items.push(item);
                        item._aspect._setIsAttached(true);
                    }
                    else {
                        items.push(oldItem);
                    }
                });
                if (newItems.length > 0) {
                    this.objEvents.raiseProp(int_4.PROP_NAME.count);
                }
            }
            finally {
                this._onCollectionChanged({
                    changeType: 2,
                    reason: 0,
                    oper: 1,
                    items: items,
                    pos: positions
                });
                this._onFillEnd({
                    items: items,
                    newItems: newItems,
                    reason: 0
                });
            }
            this.moveFirst();
        };
        BaseList.prototype.getNewItems = function () {
            return this._items.filter(function (item) {
                return item._aspect.isNew;
            });
        };
        BaseList.prototype.resetStatus = function () {
            this._items.forEach(function (item) {
                item._aspect._resetStatus();
            });
        };
        BaseList.prototype.toArray = function () {
            return this.items.map(function (item) {
                return item._aspect.vals;
            });
        };
        BaseList.prototype.toString = function () {
            return "BaseList";
        };
        return BaseList;
    }(base_1.BaseCollection));
    exports.BaseList = BaseList;
});
define("jriapp_shared/utils/anylist", ["require", "exports", "jriapp_shared/utils/coreutils", "jriapp_shared/utils/sysutils", "jriapp_shared/utils/strUtils", "jriapp_shared/utils/debounce", "jriapp_shared/collection/item", "jriapp_shared/collection/validation", "jriapp_shared/collection/list", "jriapp_shared/errors"], function (require, exports, coreutils_7, sysutils_5, strutils_5, debounce_2, item_1, validation_2, list_1, errors_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var coreUtils = coreutils_7.CoreUtils, strUtils = strutils_5.StringUtils, sys = sysutils_5.SysUtils;
    var AnyItemAspect = (function (_super) {
        __extends(AnyItemAspect, _super);
        function AnyItemAspect() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        AnyItemAspect.prototype._validateField = function (name) {
            return this.collection.errors.validateItemField(this.item, name);
        };
        AnyItemAspect.prototype._validateFields = function () {
            return validation_2.Validations.distinct(this._validateItem());
        };
        AnyItemAspect.prototype._setProp = function (name, val) {
            if (this._getProp(name) !== val) {
                coreUtils.setValue(this._vals, name, val, false);
                this.item.objEvents.raiseProp(name);
            }
        };
        AnyItemAspect.prototype._getProp = function (name) {
            return coreUtils.getValue(this._vals, name);
        };
        return AnyItemAspect;
    }(list_1.ListItemAspect));
    exports.AnyItemAspect = AnyItemAspect;
    var AnyValListItem = (function (_super) {
        __extends(AnyValListItem, _super);
        function AnyValListItem() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(AnyValListItem.prototype, "val", {
            get: function () { return this._aspect._getProp("val"); },
            set: function (v) { this._aspect._setProp("val", v); },
            enumerable: true,
            configurable: true
        });
        AnyValListItem.prototype.isHasProp = function (prop) {
            if (strUtils.startsWith(prop, "[")) {
                return true;
            }
            return _super.prototype.isHasProp.call(this, prop);
        };
        AnyValListItem.prototype.getProp = function (name) {
            var fieldName = strUtils.trimBrackets(name);
            return coreUtils.getValue(this.val, fieldName, "->");
        };
        AnyValListItem.prototype.setProp = function (name, val) {
            var coll = this._aspect.collection, errors = coll.errors, old = this.getProp(name);
            if (old !== val) {
                try {
                    var fieldName = strUtils.trimBrackets(name);
                    coreUtils.setValue(this.val, fieldName, val, false, "->");
                    this.objEvents.raiseProp(name);
                    errors.removeError(this, name);
                    var validation = this._aspect._validateField(name);
                    if (!!validation && validation.errors.length > 0) {
                        throw new errors_8.ValidationError([validation], this);
                    }
                }
                catch (ex) {
                    var error = void 0;
                    if (sys.isValidationError(ex)) {
                        error = ex;
                    }
                    else {
                        error = new errors_8.ValidationError([
                            { fieldName: name, errors: [ex.message] }
                        ], this);
                    }
                    errors.addError(this, name, error.validations[0].errors);
                    throw error;
                }
            }
        };
        Object.defineProperty(AnyValListItem.prototype, "isPropertyBag", {
            get: function () {
                return true;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnyValListItem.prototype, "list", {
            get: function () {
                return this._aspect.list;
            },
            enumerable: true,
            configurable: true
        });
        AnyValListItem.prototype.toString = function () {
            return "AnyValListItem";
        };
        return AnyValListItem;
    }(item_1.CollectionItem));
    exports.AnyValListItem = AnyValListItem;
    var AnyList = (function (_super) {
        __extends(AnyList, _super);
        function AnyList(onChanged) {
            var _this = _super.call(this, [{ name: "val", dtype: 0 }]) || this;
            _this._saveVal = null;
            _this._onChanged = onChanged;
            _this._debounce = new debounce_2.Debounce();
            _this.addOnBeginEdit(function (s, a) {
                _this._saveVal = JSON.stringify(a.item.val);
            });
            _this.addOnEndEdit(function (s, a) {
                var item = a.item;
                if (a.isCanceled) {
                    _this._saveVal = null;
                    item.objEvents.raiseProp("[*]");
                    return;
                }
                var oldVal = _this._saveVal, newVal = JSON.parse(JSON.stringify(item.val));
                _this._saveVal = null;
                if (oldVal !== newVal) {
                    _this.onChanged();
                }
            });
            _this.addOnCollChanged(function (s, a) {
                switch (a.changeType) {
                    case 0:
                        {
                            _this.onChanged();
                        }
                        break;
                    default:
                        break;
                }
            });
            return _this;
        }
        AnyList.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            this._debounce.dispose();
            this._onChanged = null;
            _super.prototype.dispose.call(this);
        };
        AnyList.prototype.itemFactory = function (aspect) {
            return new AnyValListItem(aspect);
        };
        AnyList.prototype.createItem = function (obj) {
            var isNew = !obj;
            var vals = isNew ? { val: {} } : obj;
            if (!vals.val) {
                vals.val = {};
            }
            var key = this._getNewKey();
            var aspect = new AnyItemAspect(this, vals, key, isNew);
            return aspect.item;
        };
        AnyList.prototype.onChanged = function () {
            var _this = this;
            this._debounce.enque(function () {
                if (!!_this._onChanged) {
                    var arr = _this.items.map(function (item) {
                        return item.val;
                    });
                    _this._onChanged(arr);
                }
            });
        };
        AnyList.prototype.setValues = function (values) {
            var vals = values.map(function (val) {
                return { val: val };
            });
            this.fillItems(vals, true);
        };
        AnyList.prototype.toString = function () {
            return "AnyList";
        };
        return AnyList;
    }(list_1.BaseList));
    exports.AnyList = AnyList;
});
define("jriapp_shared/utils/jsonarray", ["require", "exports", "jriapp_shared/object", "jriapp_shared/utils/coreutils", "jriapp_shared/utils/anylist"], function (require, exports, object_6, coreutils_8, anylist_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var coreUtils = coreutils_8.CoreUtils;
    var BAG_EVENTS = {
        errors_changed: "errors_changed",
        validate_bag: "validate_bag",
        validate_field: "validate_field"
    };
    var JsonArray = (function (_super) {
        __extends(JsonArray, _super);
        function JsonArray(owner, pathToArray) {
            var _this = _super.call(this) || this;
            _this._list = null;
            _this._objId = coreUtils.getNewID("jsn");
            _this._owner = owner;
            _this._pathToArray = pathToArray;
            _this.owner.objEvents.onProp("val", function () {
                if (!!_this._list) {
                    _this._list.setValues(_this.getArray());
                }
            }, _this._objId);
            return _this;
        }
        JsonArray.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            this._owner.objEvents.offNS(this._objId);
            this._list.dispose();
            this._list = null;
            this._owner = null;
            _super.prototype.dispose.call(this);
        };
        JsonArray.prototype.getEventNames = function () {
            var baseEvents = _super.prototype.getEventNames.call(this);
            return [BAG_EVENTS.validate_bag, BAG_EVENTS.validate_field].concat(baseEvents);
        };
        JsonArray.prototype.updateArray = function (arr) {
            coreUtils.setValue(this._owner.val, this._pathToArray, arr, false, "->");
            this._owner.updateJson();
        };
        JsonArray.prototype.addOnValidateBag = function (fn, nmspace, context) {
            this.objEvents.on(BAG_EVENTS.validate_bag, fn, nmspace, context);
        };
        JsonArray.prototype.removeOnValidateBag = function (nmspace) {
            this.objEvents.off(BAG_EVENTS.validate_bag, nmspace);
        };
        JsonArray.prototype.addOnValidateField = function (fn, nmspace, context) {
            this.objEvents.on(BAG_EVENTS.validate_field, fn, nmspace, context);
        };
        JsonArray.prototype.removeOnValidateField = function (nmspace) {
            this.objEvents.off(BAG_EVENTS.validate_field, nmspace);
        };
        JsonArray.prototype._validateBag = function (bag) {
            var args = {
                bag: bag,
                result: []
            };
            this.objEvents.raise(BAG_EVENTS.validate_bag, args);
            return (!!args.result) ? args.result : [];
        };
        JsonArray.prototype._validateField = function (bag, fieldName) {
            var args = {
                bag: bag,
                fieldName: fieldName,
                errors: []
            };
            this.objEvents.raise(BAG_EVENTS.validate_field, args);
            return (!!args.errors && args.errors.length > 0) ? { fieldName: fieldName, errors: args.errors } : null;
        };
        JsonArray.prototype.getArray = function () {
            if (!this._owner) {
                return [];
            }
            var res = coreUtils.getValue(this._owner.val, this._pathToArray, "->");
            return (!res) ? [] : res;
        };
        Object.defineProperty(JsonArray.prototype, "pathToArray", {
            get: function () {
                return this._pathToArray;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(JsonArray.prototype, "owner", {
            get: function () {
                return this._owner;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(JsonArray.prototype, "list", {
            get: function () {
                var _this = this;
                if (!!this._owner && !this._list) {
                    this._list = new anylist_1.AnyList(function (vals) {
                        _this.updateArray(vals);
                    });
                    this._list.addOnValidateField(function (s, args) {
                        var validationInfo = _this._validateField(args.item, args.fieldName);
                        if (!!validationInfo && validationInfo.errors.length > 0) {
                            args.errors = validationInfo.errors;
                        }
                    }, this._objId);
                    this._list.addOnValidateItem(function (s, args) {
                        var validationInfos = _this._validateBag(args.item);
                        args.result = validationInfos;
                    }, this._objId);
                    this._list.setValues(this.getArray());
                }
                return this._list;
            },
            enumerable: true,
            configurable: true
        });
        return JsonArray;
    }(object_6.BaseObject));
    exports.JsonArray = JsonArray;
});
define("jriapp_shared/collection/dictionary", ["require", "exports", "jriapp_shared/utils/utils", "jriapp_shared/lang", "jriapp_shared/collection/utils", "jriapp_shared/collection/base", "jriapp_shared/collection/list"], function (require, exports, utils_9, lang_8, utils_10, base_2, list_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = utils_9.Utils, strUtils = utils.str, checks = utils.check, sys = utils.sys, collUtils = utils_10.CollUtils;
    sys.getItemByProp = function (obj, prop) {
        if (obj instanceof BaseDictionary) {
            return obj.getItemByKey(prop);
        }
        else if (obj instanceof base_2.BaseCollection) {
            return obj.getItemByPos(parseInt(prop, 10));
        }
        else {
            return null;
        }
    };
    var BaseDictionary = (function (_super) {
        __extends(BaseDictionary, _super);
        function BaseDictionary(keyName, props) {
            var _this = this;
            if (!keyName) {
                throw new Error(strUtils.format(lang_8.ERRS.ERR_PARAM_INVALID, "keyName", keyName));
            }
            _this = _super.call(this, props) || this;
            _this._keyName = keyName;
            var keyFld = _this.getFieldInfo(keyName);
            if (!keyFld) {
                throw new Error(strUtils.format(lang_8.ERRS.ERR_DICTKEY_IS_NOTFOUND, keyName));
            }
            keyFld.isPrimaryKey = 1;
            return _this;
        }
        BaseDictionary.prototype.createItem = function (obj) {
            var isNew = !obj, vals = isNew ? collUtils.initVals(this.getFieldInfos(), {}) : obj;
            var key;
            if (isNew) {
                key = this._getNewKey();
            }
            else {
                if (checks.isNt(vals[this._keyName])) {
                    throw new Error(strUtils.format(lang_8.ERRS.ERR_DICTKEY_IS_EMPTY, this._keyName));
                }
                key = "" + vals[this._keyName];
            }
            var aspect = new list_2.ListItemAspect(this, vals, key, isNew);
            return aspect.item;
        };
        BaseDictionary.prototype._onItemAdded = function (item) {
            _super.prototype._onItemAdded.call(this, item);
            var key = item[this._keyName], self = this;
            if (checks.isNt(key)) {
                throw new Error(strUtils.format(lang_8.ERRS.ERR_DICTKEY_IS_EMPTY, this._keyName));
            }
            var oldkey = item._key, newkey = "" + key;
            if (oldkey !== newkey) {
                delete self._itemsByKey[oldkey];
                item._aspect._setKey(newkey);
                self._itemsByKey[item._key] = item;
                self._onCollectionChanged({
                    changeType: 3,
                    reason: 0,
                    oper: 4,
                    items: [item],
                    old_key: oldkey,
                    new_key: newkey
                });
            }
            this.objEvents.raiseProp("[" + item._key + "]");
        };
        BaseDictionary.prototype._onRemoved = function (item, pos) {
            var key = item[this._keyName];
            _super.prototype._onRemoved.call(this, item, pos);
            this.objEvents.raiseProp("[" + key + "]");
        };
        Object.defineProperty(BaseDictionary.prototype, "keyName", {
            get: function () {
                return this._keyName;
            },
            enumerable: true,
            configurable: true
        });
        BaseDictionary.prototype.toString = function () {
            return "BaseDictionary";
        };
        return BaseDictionary;
    }(list_2.BaseList));
    exports.BaseDictionary = BaseDictionary;
});
define("jriapp_shared/utils/lazy", ["require", "exports", "jriapp_shared/utils/checks"], function (require, exports, checks_9) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var checks = checks_9.Checks;
    var Lazy = (function () {
        function Lazy(factory) {
            this._val = null;
            this._factory = factory;
            if (!this._factory) {
                throw new Error("Lazy: Invalid value factory");
            }
        }
        Object.defineProperty(Lazy.prototype, "Value", {
            get: function () {
                if (this._val === null) {
                    this._val = this._factory();
                    if (checks.isNt(this._val)) {
                        throw new Error("Lazy: the value factory did'not returned an object");
                    }
                    this._factory = null;
                }
                return this._val;
            },
            enumerable: true,
            configurable: true
        });
        Lazy.prototype.dispose = function () {
            if (this.IsValueCreated) {
                if ("dispose" in this._val) {
                    this._val.dispose();
                }
            }
            this._val = void 0;
            this._factory = null;
        };
        Object.defineProperty(Lazy.prototype, "IsValueCreated", {
            get: function () {
                return !checks.isNt(this._val);
            },
            enumerable: true,
            configurable: true
        });
        Lazy.prototype.getIsDisposed = function () {
            return this._val === void 0;
        };
        return Lazy;
    }());
    exports.Lazy = Lazy;
});
define("jriapp_shared", ["require", "exports", "jriapp_shared/const", "jriapp_shared/int", "jriapp_shared/errors", "jriapp_shared/object", "jriapp_shared/utils/jsonbag", "jriapp_shared/utils/jsonarray", "jriapp_shared/utils/weakmap", "jriapp_shared/lang", "jriapp_shared/collection/base", "jriapp_shared/collection/item", "jriapp_shared/collection/aspect", "jriapp_shared/collection/list", "jriapp_shared/collection/dictionary", "jriapp_shared/errors", "jriapp_shared/utils/ideferred", "jriapp_shared/utils/utils", "jriapp_shared/utils/waitqueue", "jriapp_shared/utils/debounce", "jriapp_shared/utils/lazy"], function (require, exports, const_5, int_5, errors_9, object_7, jsonbag_1, jsonarray_1, weakmap_3, lang_9, base_3, item_2, aspect_2, list_3, dictionary_1, errors_10, ideferred_1, utils_11, waitqueue_2, debounce_3, lazy_1) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    __export(const_5);
    __export(int_5);
    __export(errors_9);
    __export(object_7);
    __export(jsonbag_1);
    __export(jsonarray_1);
    exports.createWeakMap = weakmap_3.createWeakMap;
    exports.LocaleSTRS = lang_9.STRS;
    exports.LocaleERRS = lang_9.ERRS;
    exports.BaseCollection = base_3.BaseCollection;
    exports.CollectionItem = item_2.CollectionItem;
    exports.ItemAspect = aspect_2.ItemAspect;
    exports.ListItemAspect = list_3.ListItemAspect;
    exports.BaseList = list_3.BaseList;
    exports.BaseDictionary = dictionary_1.BaseDictionary;
    exports.ValidationError = errors_10.ValidationError;
    __export(ideferred_1);
    exports.Utils = utils_11.Utils;
    exports.WaitQueue = waitqueue_2.WaitQueue;
    exports.Debounce = debounce_3.Debounce;
    exports.Lazy = lazy_1.Lazy;
});
