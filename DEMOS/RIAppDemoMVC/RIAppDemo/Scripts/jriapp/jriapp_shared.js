var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define("jriapp_shared/const", ["require", "exports"], function (require, exports) {
    "use strict";
    (function (DEBUG_LEVEL) {
        DEBUG_LEVEL[DEBUG_LEVEL["NONE"] = 0] = "NONE";
        DEBUG_LEVEL[DEBUG_LEVEL["NORMAL"] = 1] = "NORMAL";
        DEBUG_LEVEL[DEBUG_LEVEL["HIGH"] = 2] = "HIGH";
    })(exports.DEBUG_LEVEL || (exports.DEBUG_LEVEL = {}));
    var DEBUG_LEVEL = exports.DEBUG_LEVEL;
    exports.APP_NAME = "app";
    exports.DUMY_ERROR = "DUMMY_ERROR";
});
define("jriapp_shared/utils/ideferred", ["require", "exports"], function (require, exports) {
    "use strict";
    (function (PromiseState) {
        PromiseState[PromiseState["Pending"] = 0] = "Pending";
        PromiseState[PromiseState["ResolutionInProgress"] = 1] = "ResolutionInProgress";
        PromiseState[PromiseState["Resolved"] = 2] = "Resolved";
        PromiseState[PromiseState["Rejected"] = 3] = "Rejected";
    })(exports.PromiseState || (exports.PromiseState = {}));
    var PromiseState = exports.PromiseState;
});
define("jriapp_shared/int", ["require", "exports", "jriapp_shared/const"], function (require, exports, const_1) {
    "use strict";
    exports.Config = window.jriapp_config || {};
    exports.DebugLevel = (!exports.Config.debugLevel) ? const_1.DEBUG_LEVEL.NONE : exports.Config.debugLevel;
    (function (TPriority) {
        TPriority[TPriority["Normal"] = 0] = "Normal";
        TPriority[TPriority["AboveNormal"] = 1] = "AboveNormal";
        TPriority[TPriority["High"] = 2] = "High";
    })(exports.TPriority || (exports.TPriority = {}));
    var TPriority = exports.TPriority;
});
define("jriapp_shared/errors", ["require", "exports", "jriapp_shared/const"], function (require, exports, const_2) {
    "use strict";
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
            _super.call(this, const_2.DUMY_ERROR);
            this._origError = originalError;
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
            _super.call(this, const_2.DUMY_ERROR);
            this._reason = reason || "Operation Aborted";
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
            _super.call(this, "AggregateError");
            this._errors = errors || [];
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
                    if (!err)
                        return;
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
                    else
                        str = "" + err;
                    hashMap[str] = "";
                });
                var msg = "", errs = Object.keys(hashMap);
                errs.forEach(function (err) {
                    if (!!msg) {
                        msg += "\r\n";
                    }
                    msg += "" + err;
                });
                if (!msg)
                    msg = "Aggregate Error";
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
});
define("jriapp_shared/utils/arrhelper", ["require", "exports"], function (require, exports) {
    "use strict";
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
        ArrayHelper.distinct = function (arr) {
            var o = {}, i, l = arr.length, r = [];
            for (i = 0; i < l; i += 1)
                o["" + arr[i]] = arr[i];
            var k = Object.keys(o);
            for (i = 0, l = k.length; i < l; i += 1)
                r.push(o[k[i]]);
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
define("jriapp_shared/utils/strutils", ["require", "exports"], function (require, exports) {
    "use strict";
    var undefined = void (0), trimQuotsRX = /^(['"])+|(['"])+$/g, trimBracketsRX = /^(\[)+|(\])+$/g;
    var StringUtils = (function () {
        function StringUtils() {
        }
        StringUtils.endsWith = function (str, suffix) {
            if (!str || !suffix)
                return false;
            return (str.substr(str.length - suffix.length) === suffix);
        };
        StringUtils.startsWith = function (str, prefix) {
            if (!str || !prefix)
                return false;
            return (str.substr(0, prefix.length) === prefix);
        };
        StringUtils.fastTrim = function (str) {
            if (!str)
                return str;
            return str.replace(/^\s+|\s+$/g, "");
        };
        StringUtils.trim = function (str, chars) {
            if (!chars) {
                return StringUtils.fastTrim(str);
            }
            return StringUtils.ltrim(StringUtils.rtrim(str, chars), chars);
        };
        StringUtils.ltrim = function (str, chars) {
            if (!str)
                return str;
            chars = chars || "\\s";
            return str.replace(new RegExp("^[" + chars + "]+", "g"), "");
        };
        StringUtils.rtrim = function (str, chars) {
            if (!str)
                return str;
            chars = chars || "\\s";
            return str.replace(new RegExp("[" + chars + "]+$", "g"), "");
        };
        StringUtils.format = function (format_str) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var result = "";
            for (var i = 0;;) {
                var open_1 = format_str.indexOf("{", i);
                var close_1 = format_str.indexOf("}", i);
                if ((open_1 < 0) && (close_1 < 0)) {
                    result += format_str.slice(i);
                    break;
                }
                if ((close_1 > 0) && ((close_1 < open_1) || (open_1 < 0))) {
                    if (format_str.charAt(close_1 + 1) !== "}") {
                        throw new Error(StringUtils.ERR_STRING_FORMAT_INVALID + format_str);
                    }
                    result += format_str.slice(i, close_1 + 1);
                    i = close_1 + 2;
                    continue;
                }
                result += format_str.slice(i, open_1);
                i = open_1 + 1;
                if (format_str.charAt(i) === "{") {
                    result += "{";
                    i++;
                    continue;
                }
                if (close_1 < 0)
                    throw new Error(StringUtils.ERR_STRING_FORMAT_INVALID + format_str);
                var brace = format_str.substring(i, close_1);
                var colonIndex = brace.indexOf(":");
                var argNumber = parseInt((colonIndex < 0) ? brace : brace.substring(0, colonIndex), 10);
                if (isNaN(argNumber))
                    throw new Error(StringUtils.ERR_STRING_FORMAT_INVALID + format_str);
                var argFormat = (colonIndex < 0) ? "" : brace.substring(colonIndex + 1);
                var arg = args[argNumber];
                if (arg === undefined || arg === null) {
                    arg = "";
                }
                if (arg.format) {
                    result += arg.format(argFormat);
                }
                else
                    result += arg.toString();
                i = close_1 + 1;
            }
            return result;
        };
        StringUtils.formatNumber = function (num, decimals, dec_point, thousands_sep) {
            num = (num + "").replace(/[^0-9+-Ee.]/g, "");
            var n = !isFinite(+num) ? 0 : +num, prec = !isFinite(+decimals) ? 0 : Math.abs(decimals), sep = (thousands_sep === undefined) ? "," : thousands_sep, dec = (dec_point === undefined) ? "." : dec_point, s = [""], toFixedFix = function (n, prec) {
                var k = Math.pow(10, prec);
                return "" + Math.round(n * k) / k;
            };
            if (decimals === null || decimals === undefined) {
                s = ("" + n).split(".");
                prec = 2;
            }
            else {
                s = (prec ? toFixedFix(n, prec) : "" + Math.round(n)).split(".");
            }
            var i, s0 = "", len = s[0].length;
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
        StringUtils.padLeft = function (val, length, str) {
            str = str || " ";
            if (val.length >= length)
                return val;
            var pad = (new Array(Math.ceil((length - val.length) / str.length) + 1).join(str));
            return (pad + val).slice(-length);
        };
        StringUtils.trimQuotes = function (val) {
            return StringUtils.trim(val.replace(trimQuotsRX, ""));
        };
        StringUtils.trimBrackets = function (val) {
            return StringUtils.trim(val.replace(trimBracketsRX, ""));
        };
        StringUtils.ERR_STRING_FORMAT_INVALID = "String format has invalid expression value: ";
        return StringUtils;
    }());
    exports.StringUtils = StringUtils;
    ;
});
define("jriapp_shared/utils/checks", ["require", "exports"], function (require, exports) {
    "use strict";
    var Checks = (function () {
        function Checks() {
        }
        Checks.isHasProp = function (obj, prop) {
            if (!obj)
                return false;
            return prop in obj;
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
            if (Checks.isNt(a))
                return false;
            return (typeof a === "object");
        };
        Checks.isSimpleObject = function (a) {
            if (!a)
                return false;
            return ((typeof a === "object") && Object.prototype === Object.getPrototypeOf(a));
        };
        Checks.isString = function (a) {
            if (Checks.isNt(a))
                return false;
            return (typeof a === "string") || (typeof a === "object" && a instanceof String);
        };
        Checks.isFunc = function (a) {
            if (Checks.isNt(a))
                return false;
            return (typeof a === "function") || (typeof a === "object" && a instanceof Function);
        };
        Checks.isBoolean = function (a) {
            if (Checks.isNt(a))
                return false;
            return (typeof a === "boolean") || (typeof a === "object" && a instanceof Boolean);
        };
        Checks.isDate = function (a) {
            if (Checks.isNt(a))
                return false;
            return (typeof a === "object" && a instanceof Date);
        };
        Checks.isNumber = function (a) {
            if (Checks.isNt(a))
                return false;
            return typeof a === "number" || (typeof a === "object" && a instanceof Number);
        };
        Checks.isNumeric = function (a) {
            return Checks.isNumber(a) || (Checks.isString(a) && !isNaN(Number(a)));
        };
        Checks.isBoolString = function (a) {
            if (Checks.isNt(a))
                return false;
            return (a === "true" || a === "false");
        };
        Checks.isArray = function (a) {
            if (!a)
                return false;
            return Array.isArray(a);
        };
        Checks.isThenable = function (a) {
            if (!a)
                return false;
            return ((typeof (a) === "object") && Checks.isFunc(a.then));
        };
        Checks.undefined = void (0);
        return Checks;
    }());
    exports.Checks = Checks;
});
define("jriapp_shared/utils/coreutils", ["require", "exports", "jriapp_shared/utils/arrhelper", "jriapp_shared/utils/strutils", "jriapp_shared/utils/checks"], function (require, exports, arrhelper_1, strutils_1, checks_1) {
    "use strict";
    var checks = checks_1.Checks, strUtils = strutils_1.StringUtils, arrHelper = arrhelper_1.ArrayHelper;
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
        CoreUtils.setValue = function (root, namePath, val, checkOverwrite) {
            var parts = namePath.split("."), parent = root, i;
            for (i = 0; i < parts.length - 1; i += 1) {
                if (!parent[parts[i]]) {
                    parent[parts[i]] = {};
                }
                parent = parent[parts[i]];
            }
            var n = parts[parts.length - 1];
            if (!!checkOverwrite && (parent[n] !== checks.undefined)) {
                throw new Error(strUtils.format(CoreUtils.ERR_OBJ_ALREADY_REGISTERED, namePath));
            }
            parent[n] = val;
        };
        CoreUtils.getValue = function (root, namePath) {
            var res;
            var parts = namePath.split("."), parent = root, i;
            for (i = 0; i < parts.length; i += 1) {
                res = parent[parts[i]];
                if (res === checks.undefined) {
                    return null;
                }
                parent = res;
            }
            return res;
        };
        CoreUtils.removeValue = function (root, namePath) {
            var parts = namePath.split("."), parent = root, i, val = null;
            for (i = 0; i < parts.length - 1; i += 1) {
                if (!parent[parts[i]]) {
                    return null;
                }
                parent = parent[parts[i]];
            }
            var n = parts[parts.length - 1];
            val = parent[n];
            if (val !== checks_1.Checks.undefined) {
                delete parent[n];
            }
            return val;
        };
        CoreUtils.resolveOwner = function (obj, path) {
            var parts = path.split("."), i, res, len = parts.length;
            if (len === 1)
                return obj;
            res = obj;
            for (i = 0; i < len - 1; i += 1) {
                res = res[parts[i]];
                if (res === checks.undefined)
                    return checks.undefined;
                if (res === null)
                    return null;
            }
            return res;
        };
        CoreUtils.uuid = function (len, radix) {
            var i, chars = UUID_CHARS, uuid = [], rnd = Math.random;
            radix = radix || chars.length;
            if (!!len) {
                for (i = 0; i < len; i += 1)
                    uuid[i] = chars[0 | rnd() * radix];
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
            if (checks.isBoolean(a))
                return a;
            var v = strUtils.trim(a).toLowerCase();
            if (v === "false")
                return false;
            if (v === "true")
                return true;
            throw new Error(strUtils.format("parseBool, argument: {0} is not a valid boolean string", a));
        };
        CoreUtils.round = function (num, decimals) {
            return parseFloat(num.toFixed(decimals));
        };
        CoreUtils.merge = function (source, target) {
            if (!target) {
                target = {};
            }
            if (!source)
                return target;
            var names = Object.getOwnPropertyNames(source), n;
            for (var i = 0, len = names.length; i < len; i += 1) {
                n = names[i];
                target[n] = source[n];
            }
            return target;
        };
        CoreUtils.clone = function (obj, target) {
            var res, i, len;
            if (!obj) {
                return obj;
            }
            if (CoreUtils.check.isArray(obj)) {
                len = obj.length;
                res = new Array(len);
                for (i = 0; i < len; i += 1) {
                    res[i] = CoreUtils.clone(obj[i], null);
                }
            }
            else if (CoreUtils.check.isSimpleObject(obj)) {
                res = target || {};
                var p = void 0, keys = Object.getOwnPropertyNames(obj);
                len = keys.length;
                for (i = 0; i < len; i += 1) {
                    p = keys[i];
                    res[p] = CoreUtils.clone(obj[p], null);
                }
            }
            else
                return obj;
            return res;
        };
        CoreUtils.iterateIndexer = function (obj, fn) {
            if (!obj)
                return;
            var names = Object.keys(obj);
            for (var i = 0; i < names.length; i += 1) {
                var name_1 = names[i];
                var val = obj[name_1];
                fn(name_1, val);
            }
        };
        CoreUtils.extend = function (defaults, current) {
            return CoreUtils.merge(current, defaults);
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
            if (!obj)
                return;
            var names = Object.getOwnPropertyNames(obj);
            names.forEach(fn);
        };
        CoreUtils.assignStrings = function (target, source) {
            if (checks.isNt(target))
                target = {};
            if (!checks.isSimpleObject(source))
                return target;
            var p, keys = Object.keys(source), len = keys.length, tval, sval;
            for (var i = 0; i < len; i += 1) {
                p = keys[i];
                tval = target[p];
                sval = source[p];
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
        CoreUtils.check = checks;
        CoreUtils.str = strUtils;
        CoreUtils.arr = arrHelper;
        CoreUtils.get_timeZoneOffset = (function () {
            var dt = new Date(), tz = dt.getTimezoneOffset();
            return function () {
                return tz;
            };
        })();
        CoreUtils.hasProp = checks.isHasProp;
        return CoreUtils;
    }());
    exports.CoreUtils = CoreUtils;
});
define("jriapp_shared/lang", ["require", "exports", "jriapp_shared/utils/coreutils"], function (require, exports, coreutils_1) {
    "use strict";
    var coreUtils = coreutils_1.CoreUtils;
    function assign(target, source) {
        return coreUtils.assignStrings(target, source);
    }
    exports.assign = assign;
    var _ERRS = {
        ERR_OBJ_ALREADY_REGISTERED: "an Object with the name: {0} is already registered and can not be overwritten",
        ERR_APP_NEED_JQUERY: "The project is dependent on JQuery",
        ERR_ASSERTION_FAILED: 'The Assertion "{0}" failed',
        ERR_BINDING_CONTENT_NOT_FOUND: "BindingContent is not found",
        ERR_DBSET_READONLY: "TDbSet: {0} is readOnly and can not be edited",
        ERR_DBSET_INVALID_FIELDNAME: "TDbSet: {0} has no field with the name: {1}",
        ERR_FIELD_READONLY: "Field is readOnly and can not be edited",
        ERR_FIELD_ISNOT_NULLABLE: "Field is not nullable and can not be set to null",
        ERR_FIELD_WRONG_TYPE: "Value {0} has wrong datatype. It should have {1} datatype.",
        ERR_FIELD_MAXLEN: "Value exceeds field maxlength: {0}",
        ERR_FIELD_DATATYPE: "Unknown field data type: {0}",
        ERR_FIELD_REGEX: "Value {0} can not be accepted as the right value for this field",
        ERR_FIELD_RANGE: "Value {0} is outside the allowed range {1} for this field",
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
        ERR_JQUERY_DATEPICKER_NOTFOUND: "Application is dependent on JQuery.UI.datepicker. Please include it in the scripts.",
        ERR_PARAM_INVALID: "Parameter: {0} has invalid value: {1}",
        ERR_PARAM_INVALID_TYPE: "Parameter: {0} has invalid type. It must be {1}",
        ERR_KEY_IS_EMPTY: "Key value must not be empty",
        ERR_KEY_IS_NOTFOUND: "Can not find item with the key: {0}",
        ERR_ITEM_IS_ATTACHED: "Operation invalid, reason: Item already has been attached",
        ERR_ITEM_IS_DETACHED: "Operation invalid, reason: Item is detached",
        ERR_ITEM_IS_NOTFOUND: "Operation invalid, reason: Item is not found",
        ERR_ITEM_NAME_COLLISION: 'The "{0}" TDbSet\'s field name: "{1}" is invalid, because a property with that name already exists on the entity type.',
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
        ERR_TEMPLATE_ID_INVALID: "Element can not be found by TemplateID: {0}",
        ERR_ITEM_DELETED_BY_ANOTHER_USER: "The record was deleted by another user",
        ERR_ACCESS_DENIED: "The access is denied. Please, ask administrator to assign user rights to your account.",
        ERR_CONCURRENCY: "The record has been modified by another user. Please, refresh record before editing.",
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
define("jriapp_shared/utils/sysutils", ["require", "exports", "jriapp_shared/utils/checks", "jriapp_shared/utils/strutils"], function (require, exports, checks_2, strUtils_1) {
    "use strict";
    var checks = checks_2.Checks, strUtils = strUtils_1.StringUtils;
    var PROP_BAG = "IPBag", INDEXED_PROP_RX = /(^\w+)\s*\[\s*['"]?\s*([^'"]+)\s*['",]?\s*\]/i;
    var SysUtils = (function () {
        function SysUtils() {
        }
        SysUtils.isEditable = function (obj) {
            var isBO = SysUtils.isBaseObj(obj);
            return isBO && checks.isFunc(obj.beginEdit) && !!obj.endEdit && !!obj.cancelEdit && checks_2.Checks.isHasProp(obj, "isEditing");
        };
        SysUtils.isSubmittable = function (obj) {
            return !!obj && checks.isFunc(obj.submitChanges) && checks.isHasProp(obj, "isCanSubmit");
        };
        SysUtils.isErrorNotification = function (obj) {
            if (!obj)
                return false;
            if (!checks.isFunc(obj.getIErrorNotification))
                return false;
            var tmp = obj.getIErrorNotification();
            return !!tmp && checks.isFunc(tmp.getIErrorNotification);
        };
        SysUtils.getErrorNotification = function (obj) {
            if (!obj) {
                return null;
            }
            else if (!!obj._aspect && SysUtils.isErrorNotification(obj._aspect))
                return obj._aspect.getIErrorNotification();
            else if (SysUtils.isErrorNotification(obj))
                return obj.getIErrorNotification();
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
        SysUtils.PROP_BAG_NAME = function () { return PROP_BAG; };
        SysUtils.getPathParts = function (path) {
            var parts = (!path) ? [] : path.split("."), parts2 = [];
            parts.forEach(function (part) {
                var obj, index;
                var matches = part.match(INDEXED_PROP_RX);
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
        };
        SysUtils.getProp = function (obj, prop) {
            var self = SysUtils;
            if (!prop)
                return obj;
            if (self.isBaseObj(obj) && obj.getIsDestroyCalled())
                return checks.undefined;
            if (strUtils.startsWith(prop, "[")) {
                prop = strUtils.trimQuotes(strUtils.trimBrackets(prop));
                if (self.isCollection(obj)) {
                    return self.getItemByProp(obj, prop);
                }
                else if (checks.isArray(obj)) {
                    return obj[parseInt(prop, 10)];
                }
            }
            if (self.isPropBag(obj)) {
                return obj.getProp(prop);
            }
            else {
                return obj[prop];
            }
        };
        SysUtils.resolvePath = function (obj, path) {
            var self = SysUtils;
            if (!path)
                return obj;
            var parts = self.getPathParts(path), res = obj, len = parts.length - 1;
            for (var i = 0; i < len; i += 1) {
                res = self.getProp(res, parts[i]);
                if (!res)
                    return checks.undefined;
            }
            return self.getProp(res, parts[len]);
        };
        SysUtils.setProp = function (obj, prop, val) {
            var self = SysUtils;
            if (!prop)
                throw new Error("Invalid operation: Empty Property name");
            if (self.isBaseObj(obj) && obj.getIsDestroyCalled())
                return;
            if (strUtils.startsWith(prop, "[")) {
                prop = strUtils.trimQuotes(strUtils.trimBrackets(prop));
                if (checks.isArray(obj)) {
                    obj[parseInt(prop, 10)] = val;
                    return;
                }
            }
            if (self.isPropBag(obj)) {
                obj.setProp(prop, val);
            }
            else {
                obj[prop] = val;
            }
        };
        SysUtils.isBaseObj = function (obj) { return false; };
        SysUtils.isBinding = function (obj) { return false; };
        SysUtils.isPropBag = function (obj) {
            return SysUtils.isBaseObj(obj) && obj.toString() === PROP_BAG;
        };
        SysUtils.isCollection = function (obj) { return false; };
        SysUtils.getItemByProp = function (obj, prop) { return null; };
        SysUtils.isValidationError = function (obj) { return false; };
        return SysUtils;
    }());
    exports.SysUtils = SysUtils;
});
define("jriapp_shared/utils/error", ["require", "exports", "jriapp_shared/const", "jriapp_shared/errors"], function (require, exports, const_3, errors_1) {
    "use strict";
    var ERROR = (function () {
        function ERROR() {
        }
        ERROR.addHandler = function (name, handler) {
            ERROR._handlers[name] = handler;
        };
        ERROR.removeHandler = function (name) {
            delete ERROR._handlers[name];
        };
        ERROR.handleError = function (sender, error, source) {
            if (ERROR.checkIsDummy(error)) {
                return true;
            }
            var handler, isHandled = false;
            handler = ERROR._handlers[const_3.APP_NAME];
            if (!!handler) {
                if (handler === sender)
                    handler = null;
                else {
                    isHandled = handler.handleError(error, source);
                }
            }
            if (!isHandled) {
                handler = ERROR._handlers["*"];
                if (!!handler) {
                    if (handler === sender)
                        handler = null;
                    else
                        isHandled = handler.handleError(error, source);
                }
            }
            return isHandled;
        };
        ERROR.throwDummy = function (err) {
            if (ERROR.checkIsDummy(err))
                throw err;
            else
                throw new errors_1.DummyError(err);
        };
        ERROR.checkIsDummy = function (error) {
            return !!error && !!error.isDummy;
        };
        ERROR.checkIsAbort = function (error) {
            return !!error && (error instanceof errors_1.AbortError);
        };
        ERROR.reThrow = function (ex, isHandled) {
            if (!isHandled)
                throw ex;
            else
                ERROR.throwDummy(ex);
        };
        ERROR.abort = function (reason) {
            throw new errors_1.AbortError(reason);
        };
        ERROR._handlers = {};
        return ERROR;
    }());
    exports.ERROR = ERROR;
});
define("jriapp_shared/utils/debug", ["require", "exports", "jriapp_shared/const", "jriapp_shared/int"], function (require, exports, const_4, int_1) {
    "use strict";
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
define("jriapp_shared/utils/eventhelper", ["require", "exports", "jriapp_shared/lang", "jriapp_shared/utils/checks", "jriapp_shared/utils/strutils", "jriapp_shared/utils/debug"], function (require, exports, lang_1, checks_3, strutils_2, debug_1) {
    "use strict";
    var checks = checks_3.Checks, strUtils = strutils_2.StringUtils, debug = debug_1.DEBUG;
    var EventList = (function () {
        function EventList() {
        }
        EventList.Create = function () {
            return {};
        };
        EventList.Node = function (handler, ns, context) {
            return { fn: handler, next: null, context: !context ? null : context };
        };
        EventList.count = function (list) {
            if (!list)
                return 0;
            var ns_keys, cnt = 0, obj;
            for (var j = 0; j <= 2; ++j) {
                obj = list[j];
                if (!!obj) {
                    ns_keys = Object.keys(obj);
                    for (var i = 0; i < ns_keys.length; ++i) {
                        cnt += obj[ns_keys[i]].length;
                    }
                }
            }
            return cnt;
        };
        EventList.append = function (list, node, ns, priority) {
            if (priority === void 0) { priority = 0; }
            if (!ns)
                ns = "*";
            var obj = list[priority];
            if (!obj) {
                list[priority] = obj = {};
            }
            var arr = obj[ns];
            if (!arr)
                obj[ns] = arr = [];
            arr.push(node);
        };
        EventList.remove = function (list, ns) {
            if (!list)
                return;
            var ns_keys, obj;
            if (!ns)
                ns = "*";
            for (var j = 0; j <= 2; ++j) {
                obj = list[j];
                if (!!obj) {
                    if (ns === "*") {
                        ns_keys = Object.keys(obj);
                        for (var i = 0; i < ns_keys.length; ++i) {
                            delete obj[ns_keys[i]];
                        }
                    }
                    else {
                        delete obj[ns];
                    }
                }
            }
        };
        EventList.toArray = function (list) {
            if (!list)
                return [];
            var res = [], arr, cur, obj;
            for (var k = 2; k >= 0; k -= 1) {
                obj = list[k];
                if (!!obj) {
                    var ns_keys = Object.keys(obj);
                    for (var i = 0; i < ns_keys.length; ++i) {
                        arr = obj[ns_keys[i]];
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
        EventHelper.removeNs = function (ev, ns) {
            if (!ev)
                return;
            if (!ns)
                ns = "*";
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
                throw new Error(strUtils.format(lang_1.ERRS.ERR_ASSERTION_FAILED, "ev is a valid object"));
            }
            if (!checks.isFunc(handler)) {
                throw new Error(lang_1.ERRS.ERR_EVENT_INVALID_FUNC);
            }
            if (!name)
                throw new Error(strUtils.format(lang_1.ERRS.ERR_EVENT_INVALID, "[Empty]"));
            var self = this, n = name, ns = !nmspace ? "*" : "" + nmspace;
            var list = ev[n], node = evList.Node(handler, ns, context);
            if (!list) {
                ev[n] = list = evList.Create();
            }
            evList.append(list, node, ns, priority);
        };
        EventHelper.remove = function (ev, name, nmspace) {
            if (!ev)
                return null;
            var self = this, ns = !nmspace ? "*" : "" + nmspace;
            if (!name) {
                EventHelper.removeNs(ev, ns);
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
        EventHelper.raise = function (sender, ev, name, args) {
            if (!ev)
                return;
            if (!!name) {
                var arr = evList.toArray(ev[name]);
                var node = void 0;
                for (var i = 0; i < arr.length; i++) {
                    node = arr[i];
                    node.fn.apply(node.context, [sender, args]);
                }
            }
        };
        EventHelper.raiseProp = function (sender, ev, prop, args) {
            if (!ev)
                return;
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
define("jriapp_shared/object", ["require", "exports", "jriapp_shared/lang", "jriapp_shared/utils/sysutils", "jriapp_shared/utils/checks", "jriapp_shared/utils/strutils", "jriapp_shared/utils/coreutils", "jriapp_shared/utils/error", "jriapp_shared/utils/debug", "jriapp_shared/utils/eventhelper"], function (require, exports, lang_2, sysutils_1, checks_4, strUtils_2, coreutils_2, error_1, debug_2, eventhelper_1) {
    "use strict";
    var OBJ_EVENTS = {
        error: "error",
        destroyed: "destroyed"
    };
    var checks = checks_4.Checks, strUtils = strUtils_2.StringUtils, coreUtils = coreutils_2.CoreUtils, evHelper = eventhelper_1.EventHelper, debug = debug_2.DEBUG, sys = sysutils_1.SysUtils;
    sys.isBaseObj = function (obj) {
        return (!!obj && obj instanceof BaseObject);
    };
    var ObjState;
    (function (ObjState) {
        ObjState[ObjState["None"] = 0] = "None";
        ObjState[ObjState["DestroyCalled"] = 1] = "DestroyCalled";
        ObjState[ObjState["Destroyed"] = 2] = "Destroyed";
    })(ObjState || (ObjState = {}));
    var BaseObject = (function () {
        function BaseObject() {
            this._obj_state = 0;
            this._events = null;
        }
        BaseObject.prototype._getEventNames = function () {
            return [OBJ_EVENTS.error, OBJ_EVENTS.destroyed];
        };
        BaseObject.prototype._addHandler = function (name, handler, nmspace, context, priority) {
            if (this._obj_state === void 0) {
                throw new Error("Using uninitialized object");
            }
            if (this._obj_state !== 0)
                throw new Error(strUtils.format(lang_2.ERRS.ERR_ASSERTION_FAILED, "this._obj_state !== ObjState.None"));
            if (debug.isDebugging()) {
                if (!!name && this._getEventNames().indexOf(name) < 0) {
                    debug.checkStartDebugger();
                    throw new Error(strUtils.format(lang_2.ERRS.ERR_EVENT_INVALID, name));
                }
            }
            if (!this._events)
                this._events = {};
            evHelper.add(this._events, name, handler, nmspace, context, priority);
        };
        BaseObject.prototype._removeHandler = function (name, nmspace) {
            evHelper.remove(this._events, name, nmspace);
        };
        Object.defineProperty(BaseObject.prototype, "_isDestroyed", {
            get: function () {
                return this._obj_state === 2;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseObject.prototype, "_isDestroyCalled", {
            get: function () {
                return this._obj_state !== 0;
            },
            set: function (v) {
                if (this._obj_state === 2) {
                    throw new Error(strUtils.format(lang_2.ERRS.ERR_ASSERTION_FAILED, "this._obj_state !== ObjState.Destroyed"));
                }
                this._obj_state = !v ? 0 : 1;
            },
            enumerable: true,
            configurable: true
        });
        BaseObject.prototype._isHasProp = function (prop) {
            return checks.isHasProp(this, prop);
        };
        BaseObject.prototype.handleError = function (error, source) {
            if (error_1.ERROR.checkIsDummy(error)) {
                return true;
            }
            if (!error.message) {
                error = new Error("Unexpected Error: " + error);
            }
            var args = { error: error, source: source, isHandled: false };
            evHelper.raise(this, this._events, OBJ_EVENTS.error, args);
            var isHandled = args.isHandled;
            if (!isHandled) {
                isHandled = error_1.ERROR.handleError(this, error, source);
            }
            return isHandled;
        };
        BaseObject.prototype.addHandler = function (name, handler, nmspace, context, priority) {
            this._addHandler(name, handler, nmspace, context, priority);
        };
        BaseObject.prototype.removeHandler = function (name, nmspace) {
            if (debug.isDebugging() && !!name && this._getEventNames().indexOf(name) < 0) {
                debug.checkStartDebugger();
                throw new Error(strUtils.format(lang_2.ERRS.ERR_EVENT_INVALID, name));
            }
            this._removeHandler(name, nmspace);
        };
        BaseObject.prototype.addOnDestroyed = function (handler, nmspace, context, priority) {
            this._addHandler(OBJ_EVENTS.destroyed, handler, nmspace, context, priority);
        };
        BaseObject.prototype.removeOnDestroyed = function (nmspace) {
            evHelper.remove(this._events, OBJ_EVENTS.destroyed, nmspace);
        };
        BaseObject.prototype.addOnError = function (handler, nmspace, context, priority) {
            this._addHandler(OBJ_EVENTS.error, handler, nmspace, context, priority);
        };
        BaseObject.prototype.removeOnError = function (nmspace) {
            evHelper.remove(this._events, OBJ_EVENTS.error, nmspace);
        };
        BaseObject.prototype.removeNSHandlers = function (nmspace) {
            evHelper.remove(this._events, null, nmspace);
        };
        BaseObject.prototype.raiseEvent = function (name, args) {
            if (!name)
                throw new Error(lang_2.ERRS.ERR_EVENT_INVALID);
            evHelper.raise(this, this._events, name, args);
        };
        BaseObject.prototype.raisePropertyChanged = function (name) {
            var data = { property: name };
            var parts = name.split("."), lastPropName = parts[parts.length - 1];
            if (parts.length > 1) {
                var obj = coreUtils.resolveOwner(this, name);
                if (debug.isDebugging() && checks.isUndefined(obj)) {
                    debug.checkStartDebugger();
                    throw new Error(strUtils.format(lang_2.ERRS.ERR_PROP_NAME_INVALID, name));
                }
                if (sys.isBaseObj(obj)) {
                    obj.raisePropertyChanged(lastPropName);
                }
            }
            else {
                if (debug.isDebugging() && !this._isHasProp(lastPropName)) {
                    debug.checkStartDebugger();
                    throw new Error(strUtils.format(lang_2.ERRS.ERR_PROP_NAME_INVALID, lastPropName));
                }
                evHelper.raiseProp(this, this._events, lastPropName, data);
            }
        };
        BaseObject.prototype.addOnPropertyChange = function (prop, handler, nmspace, context, priority) {
            if (!prop)
                throw new Error(lang_2.ERRS.ERR_PROP_NAME_EMPTY);
            if (debug.isDebugging() && prop !== "*" && !this._isHasProp(prop)) {
                debug.checkStartDebugger();
                throw new Error(strUtils.format(lang_2.ERRS.ERR_PROP_NAME_INVALID, prop));
            }
            if (!this._events)
                this._events = {};
            evHelper.add(this._events, "0" + prop, handler, nmspace, context, priority);
        };
        BaseObject.prototype.removeOnPropertyChange = function (prop, nmspace) {
            if (!!prop) {
                if (debug.isDebugging() && prop !== "*" && !this._isHasProp(prop)) {
                    debug.checkStartDebugger();
                    throw new Error(strUtils.format(lang_2.ERRS.ERR_PROP_NAME_INVALID, prop));
                }
                evHelper.remove(this._events, "0" + prop, nmspace);
            }
            else {
                evHelper.removeNs(this._events, nmspace);
            }
        };
        BaseObject.prototype.getIsDestroyed = function () {
            return this._obj_state === 2;
        };
        BaseObject.prototype.getIsDestroyCalled = function () {
            return this._obj_state !== 0;
        };
        BaseObject.prototype.destroy = function () {
            if (this._obj_state === 2)
                return;
            this._obj_state = 2;
            try {
                evHelper.raise(this, this._events, OBJ_EVENTS.destroyed, {});
            }
            finally {
                this._events = null;
            }
        };
        return BaseObject;
    }());
    exports.BaseObject = BaseObject;
});
define("jriapp_shared/collection/const", ["require", "exports"], function (require, exports) {
    "use strict";
    (function (DATE_CONVERSION) {
        DATE_CONVERSION[DATE_CONVERSION["None"] = 0] = "None";
        DATE_CONVERSION[DATE_CONVERSION["ServerLocalToClientLocal"] = 1] = "ServerLocalToClientLocal";
        DATE_CONVERSION[DATE_CONVERSION["UtcToClientLocal"] = 2] = "UtcToClientLocal";
    })(exports.DATE_CONVERSION || (exports.DATE_CONVERSION = {}));
    var DATE_CONVERSION = exports.DATE_CONVERSION;
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
    })(exports.DATA_TYPE || (exports.DATA_TYPE = {}));
    var DATA_TYPE = exports.DATA_TYPE;
    (function (FIELD_TYPE) {
        FIELD_TYPE[FIELD_TYPE["None"] = 0] = "None";
        FIELD_TYPE[FIELD_TYPE["ClientOnly"] = 1] = "ClientOnly";
        FIELD_TYPE[FIELD_TYPE["Calculated"] = 2] = "Calculated";
        FIELD_TYPE[FIELD_TYPE["Navigation"] = 3] = "Navigation";
        FIELD_TYPE[FIELD_TYPE["RowTimeStamp"] = 4] = "RowTimeStamp";
        FIELD_TYPE[FIELD_TYPE["Object"] = 5] = "Object";
        FIELD_TYPE[FIELD_TYPE["ServerCalculated"] = 6] = "ServerCalculated";
    })(exports.FIELD_TYPE || (exports.FIELD_TYPE = {}));
    var FIELD_TYPE = exports.FIELD_TYPE;
    (function (SORT_ORDER) {
        SORT_ORDER[SORT_ORDER["ASC"] = 0] = "ASC";
        SORT_ORDER[SORT_ORDER["DESC"] = 1] = "DESC";
    })(exports.SORT_ORDER || (exports.SORT_ORDER = {}));
    var SORT_ORDER = exports.SORT_ORDER;
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
    })(exports.FILTER_TYPE || (exports.FILTER_TYPE = {}));
    var FILTER_TYPE = exports.FILTER_TYPE;
    (function (COLL_CHANGE_TYPE) {
        COLL_CHANGE_TYPE[COLL_CHANGE_TYPE["Remove"] = 0] = "Remove";
        COLL_CHANGE_TYPE[COLL_CHANGE_TYPE["Add"] = 1] = "Add";
        COLL_CHANGE_TYPE[COLL_CHANGE_TYPE["Reset"] = 2] = "Reset";
        COLL_CHANGE_TYPE[COLL_CHANGE_TYPE["Remap"] = 3] = "Remap";
    })(exports.COLL_CHANGE_TYPE || (exports.COLL_CHANGE_TYPE = {}));
    var COLL_CHANGE_TYPE = exports.COLL_CHANGE_TYPE;
    (function (COLL_CHANGE_REASON) {
        COLL_CHANGE_REASON[COLL_CHANGE_REASON["None"] = 0] = "None";
        COLL_CHANGE_REASON[COLL_CHANGE_REASON["PageChange"] = 1] = "PageChange";
        COLL_CHANGE_REASON[COLL_CHANGE_REASON["Sorting"] = 2] = "Sorting";
    })(exports.COLL_CHANGE_REASON || (exports.COLL_CHANGE_REASON = {}));
    var COLL_CHANGE_REASON = exports.COLL_CHANGE_REASON;
    (function (COLL_CHANGE_OPER) {
        COLL_CHANGE_OPER[COLL_CHANGE_OPER["None"] = 0] = "None";
        COLL_CHANGE_OPER[COLL_CHANGE_OPER["Fill"] = 1] = "Fill";
        COLL_CHANGE_OPER[COLL_CHANGE_OPER["Attach"] = 2] = "Attach";
        COLL_CHANGE_OPER[COLL_CHANGE_OPER["Remove"] = 3] = "Remove";
        COLL_CHANGE_OPER[COLL_CHANGE_OPER["Commit"] = 4] = "Commit";
        COLL_CHANGE_OPER[COLL_CHANGE_OPER["Sort"] = 5] = "Sort";
    })(exports.COLL_CHANGE_OPER || (exports.COLL_CHANGE_OPER = {}));
    var COLL_CHANGE_OPER = exports.COLL_CHANGE_OPER;
    (function (ITEM_STATUS) {
        ITEM_STATUS[ITEM_STATUS["None"] = 0] = "None";
        ITEM_STATUS[ITEM_STATUS["Added"] = 1] = "Added";
        ITEM_STATUS[ITEM_STATUS["Updated"] = 2] = "Updated";
        ITEM_STATUS[ITEM_STATUS["Deleted"] = 3] = "Deleted";
    })(exports.ITEM_STATUS || (exports.ITEM_STATUS = {}));
    var ITEM_STATUS = exports.ITEM_STATUS;
});
define("jriapp_shared/collection/int", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.PROP_NAME = {
        isEditing: "isEditing",
        currentItem: "currentItem",
        count: "count",
        totalCount: "totalCount",
        pageCount: "pageCount",
        pageSize: "pageSize",
        pageIndex: "pageIndex",
        isUpdating: "isUpdating",
        isLoading: "isLoading"
    };
    exports.ITEM_EVENTS = {
        errors_changed: "errors_changed",
        destroyed: "destroyed"
    };
});
define("jriapp_shared/utils/waitqueue", ["require", "exports", "jriapp_shared/object", "jriapp_shared/utils/coreutils"], function (require, exports, object_1, coreutils_3) {
    "use strict";
    var coreUtils = coreutils_3.CoreUtils;
    var WaitQueue = (function (_super) {
        __extends(WaitQueue, _super);
        function WaitQueue(owner) {
            _super.call(this);
            this._objId = coreUtils.getNewID("wq");
            this._owner = owner;
            this._queue = {};
        }
        WaitQueue.prototype._checkQueue = function (prop, value) {
            if (!this._owner || this._owner.getIsDestroyCalled()) {
                return;
            }
            var self = this, propQueue = this._queue[prop], task;
            if (!propQueue || propQueue.length === 0) {
                return;
            }
            var i, firstWinsTask = null, groups = { group: null, tasks: [] }, found = [], forRemoval = [];
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
                        if (found.length === 0)
                            found.push(task);
                    }
                    else
                        found.push(task);
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
                    this._owner.removeOnPropertyChange(prop, this.uniqueID);
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
            if (!this._owner)
                return;
            var property = opts.prop, propQueue = this._queue[property];
            if (!propQueue) {
                propQueue = [];
                this._queue[property] = propQueue;
                this._owner.addOnPropertyChange(property, function (s, a) {
                    setTimeout(function () {
                        if (self.getIsDestroyCalled())
                            return;
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
                if (self.getIsDestroyCalled())
                    return;
                self._checkQueue(property, self._owner[property]);
            }, 0);
        };
        WaitQueue.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            this._owner.removeNSHandlers(this.uniqueID);
            this._queue = {};
            this._owner = null;
            _super.prototype.destroy.call(this);
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
    }(object_1.BaseObject));
    exports.WaitQueue = WaitQueue;
});
define("jriapp_shared/utils/logger", ["require", "exports"], function (require, exports) {
    "use strict";
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
define("jriapp_shared/utils/queue", ["require", "exports", "jriapp_shared/utils/checks", "jriapp_shared/utils/arrhelper", "jriapp_shared/utils/error"], function (require, exports, checks_5, arrhelper_2, error_2) {
    "use strict";
    var checks = checks_5.Checks, arrHelper = arrhelper_2.ArrayHelper, error = error_2.ERROR;
    var MAX_NUM = 99999900000, win = window;
    function createQueue(interval) {
        if (interval === void 0) { interval = 0; }
        var _rafQueue = [], _rafQueueMap = {}, _timer = null, _newTaskId = 1;
        var res = {
            cancel: function (taskId) {
                var task = _rafQueueMap[taskId];
                if (!!task) {
                    task.func = null;
                }
            },
            enque: function (func) {
                var taskId = _newTaskId;
                _newTaskId += 1;
                var task = { taskId: taskId, func: func }, len = _rafQueue.push(task);
                _rafQueueMap[taskId] = task;
                if (!_timer) {
                    _timer = win.setTimeout(function () {
                        var arr = _rafQueue;
                        _timer = null;
                        _rafQueue = [];
                        if (_newTaskId > MAX_NUM)
                            _newTaskId = 1;
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
                            _rafQueueMap = {};
                            for (var i = 0; i < _rafQueue.length; i += 1) {
                                _rafQueueMap[_rafQueue[i].taskId] = _rafQueue[i];
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
define("jriapp_shared/utils/deferred", ["require", "exports", "jriapp_shared/errors", "jriapp_shared/utils/checks", "jriapp_shared/utils/queue"], function (require, exports, errors_2, checks_6, queue_1) {
    "use strict";
    var checks = checks_6.Checks;
    var taskQueue = null;
    function createDefer(isSync) {
        return new Promise(null, (!isSync ? fn_dispatch : fn_dispatchImmediate)).deferred();
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
    function fn_dispatch(task) {
        getTaskQueue().enque(task);
    }
    function fn_dispatchImmediate(task) {
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
                this._dispatcher(function () { return _this._dispatchCallback(_this._successCB, value); });
            }
            else {
                this._dispatchCallback(this._successCB, value);
            }
        };
        Callback.prototype.reject = function (error, defer) {
            var _this = this;
            if (!checks.isFunc(this._errorCB)) {
                this._deferred.reject(error);
                return;
            }
            if (!!defer) {
                this._dispatcher(function () { return _this._dispatchCallback(_this._errorCB, error); });
            }
            else {
                this._dispatchCallback(this._errorCB, error);
            }
        };
        Callback.prototype._dispatchCallback = function (callback, arg) {
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
                    var fn_then = value.then;
                    this._state = 1;
                    fn_then.call(value, function (result) {
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
                        var i, stackSize = _this._stack.length;
                        for (i = 0; i < stackSize; i++) {
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
                var stackSize = _this._stack.length, i = 0;
                for (i = 0; i < stackSize; i++) {
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
            var disp = (!dispatcher ? fn_dispatch : dispatcher), deferred = new Deferred(this, disp);
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
            var promises = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                promises[_i - 0] = arguments[_i];
            }
            return whenAll(promises);
        };
        Promise.race = function (promises) {
            return race(promises);
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
            if (this._aborted)
                return;
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
define("jriapp_shared/utils/async", ["require", "exports", "jriapp_shared/utils/deferred", "jriapp_shared/utils/checks"], function (require, exports, deferred_1, checks_7) {
    "use strict";
    var checks = checks_7.Checks;
    var AsyncUtils = (function () {
        function AsyncUtils() {
        }
        AsyncUtils.createDeferred = function () {
            return deferred_1.createDefer();
        };
        AsyncUtils.createSyncDeferred = function () {
            return deferred_1.createSyncDefer();
        };
        AsyncUtils.whenAll = function (args) {
            return deferred_1.whenAll(args);
        };
        AsyncUtils.race = function (promises) {
            return deferred_1.race(promises);
        };
        AsyncUtils.getTaskQueue = function () {
            return deferred_1.getTaskQueue();
        };
        AsyncUtils.delay = function (func, time) {
            var deferred = deferred_1.createDefer();
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
                var parsed = null;
                if (checks.isString(res))
                    parsed = JSON.parse(res);
                else
                    parsed = res;
                return parsed;
            });
        };
        return AsyncUtils;
    }());
    exports.AsyncUtils = AsyncUtils;
});
define("jriapp_shared/utils/http", ["require", "exports", "jriapp_shared/utils/strutils", "jriapp_shared/errors", "jriapp_shared/utils/coreutils", "jriapp_shared/utils/deferred", "jriapp_shared/utils/async"], function (require, exports, strUtils_3, errors_3, coreutils_4, deferred_2, async_1) {
    "use strict";
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
                var status = "" + this.status;
                if (status === "200") {
                    var res = this.response;
                    deferred.resolve(res);
                }
                else {
                    if (HttpUtils.isStatusOK(status))
                        deferred.reject(new errors_3.DummyError(new Error(strUtils.format('Status: "{0}" loading from URL: "{1}"', status, url))));
                    else
                        deferred.reject(new Error(strUtils.format('Error: "{0}" to load from URL: "{1}"', status, url)));
                }
            };
            req.onerror = function (e) {
                deferred.reject(new Error(strUtils.format('Error: "{0}" to load from URL: "{1}"', this.status, url)));
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
            coreUtils.iterateIndexer(_headers, function (name, val) {
                req.setRequestHeader(name, val);
            });
            return req;
        };
        HttpUtils.postAjax = function (url, postData, headers) {
            var _headers = coreUtils.merge(headers, { "Content-Type": "application/json; charset=utf-8" });
            var deferred = _async.createDeferred(), req = HttpUtils._getXMLRequest(url, "POST", deferred, _headers);
            req.send(postData);
            return new deferred_2.AbortablePromise(deferred, req);
        };
        HttpUtils.getAjax = function (url, headers) {
            var deferred = _async.createDeferred(), req = HttpUtils._getXMLRequest(url, "GET", deferred, headers);
            req.send(null);
            return new deferred_2.AbortablePromise(deferred, req);
        };
        HttpUtils.defaultHeaders = {};
        HttpUtils.ajaxTimeOut = 600;
        return HttpUtils;
    }());
    exports.HttpUtils = HttpUtils;
});
define("jriapp_shared/utils/dom", ["require", "exports"], function (require, exports) {
    "use strict";
    var hasClassList = (!!window.document.documentElement.classList);
    var DomUtils = (function () {
        function DomUtils() {
        }
        DomUtils.isContained = function (oNode, oCont) {
            if (!oNode)
                return false;
            while (!!(oNode = oNode.parentNode)) {
                if (oNode === oCont)
                    return true;
            }
            return false;
        };
        DomUtils.removeNode = function (node) {
            if (!node)
                return;
            var pnd = node.parentNode;
            if (!!pnd)
                pnd.removeChild(node);
        };
        DomUtils.insertAfter = function (node, refNode) {
            var parent = refNode.parentNode;
            if (parent.lastChild === refNode)
                parent.appendChild(node);
            else
                parent.insertBefore(node, refNode.nextSibling);
        };
        DomUtils.insertBefore = function (node, refNode) {
            var parent = refNode.parentNode;
            parent.insertBefore(node, refNode);
        };
        DomUtils.wrap = function (elem, wrapper) {
            var parent = elem.parentElement, nsibling = elem.nextSibling;
            if (!parent)
                return;
            wrapper.appendChild(elem);
            (!nsibling) ? parent.appendChild(wrapper) : parent.insertBefore(wrapper, nsibling);
        };
        DomUtils.unwrap = function (elem) {
            var wrapper = elem.parentElement;
            if (!wrapper)
                return;
            var parent = wrapper.parentElement, nsibling = wrapper.nextSibling;
            if (!parent)
                return;
            parent.removeChild(wrapper);
            (!nsibling) ? parent.appendChild(elem) : parent.insertBefore(elem, nsibling);
        };
        DomUtils.getClassMap = function (el) {
            var res = {};
            if (!el)
                return res;
            var className = el.className;
            if (!className)
                return res;
            var arr = className.split(" ");
            for (var i = 0; i < arr.length; i += 1) {
                arr[i] = arr[i].trim();
                if (!!arr[i]) {
                    res[arr[i]] = i;
                }
            }
            return res;
        };
        DomUtils.setClasses = function (elems, classes) {
            if (!elems.length || !classes.length)
                return;
            var toAdd = [], toRemove = [], removeAll = false;
            classes.forEach(function (v) {
                if (!v)
                    return;
                var name = v.trim();
                if (!name)
                    return;
                var op = v.charAt(0);
                if (op == "+" || op == "-") {
                    name = v.substr(1).trim();
                }
                if (!name)
                    return;
                var arr = name.split(" ");
                for (var i = 0; i < arr.length; i += 1) {
                    var v2 = arr[i].trim();
                    if (!!v2) {
                        if (op != "-") {
                            toAdd.push(v2);
                        }
                        else {
                            if (name === "*")
                                removeAll = true;
                            else
                                toRemove.push(v2);
                        }
                    }
                }
            });
            if (removeAll) {
                toRemove = [];
            }
            for (var j = 0; j < elems.length; j += 1) {
                var el = elems[j], map = DomUtils.getClassMap(el);
                if (removeAll) {
                    map = {};
                }
                for (var i = 0; i < toRemove.length; i += 1) {
                    delete map[toRemove[i]];
                }
                for (var i = 0; i < toAdd.length; i += 1) {
                    map[toAdd[i]] = i + 1000;
                }
                var keys = Object.keys(map);
                el.className = keys.join(" ");
            }
        };
        DomUtils.setClass = function (elems, css, remove) {
            if (remove === void 0) { remove = false; }
            if (!elems.length)
                return;
            if (!css) {
                if (remove) {
                    for (var j = 0; j < elems.length; j += 1) {
                        elems[j].className = "";
                    }
                }
                return;
            }
            var _arr = css.split(" ");
            for (var i = 0; i < _arr.length; i += 1) {
                _arr[i] = _arr[i].trim();
            }
            var arr = _arr.filter(function (val) { return !!val; });
            if (hasClassList && arr.length === 1) {
                for (var j = 0; j < elems.length; j += 1) {
                    var el = elems[j];
                    if (remove)
                        el.classList.remove(arr[0]);
                    else
                        el.classList.add(arr[0]);
                }
            }
            else {
                for (var j = 0; j < elems.length; j += 1) {
                    var el = elems[j], map = DomUtils.getClassMap(el);
                    for (var i = 0; i < arr.length; i += 1) {
                        if (remove)
                            delete map[arr[i]];
                        else
                            map[arr[i]] = i + 1000;
                    }
                    var keys = Object.keys(map);
                    el.className = keys.join(" ");
                }
            }
        };
        DomUtils.addClass = function (elems, css) {
            DomUtils.setClass(elems || [], css, false);
        };
        DomUtils.removeClass = function (elems, css) {
            DomUtils.setClass(elems || [], css, true);
        };
        DomUtils.window = window;
        DomUtils.document = window.document;
        return DomUtils;
    }());
    exports.DomUtils = DomUtils;
});
define("jriapp_shared/utils/utils", ["require", "exports", "jriapp_shared/utils/coreutils", "jriapp_shared/utils/debug", "jriapp_shared/utils/error", "jriapp_shared/utils/logger", "jriapp_shared/utils/sysutils", "jriapp_shared/utils/async", "jriapp_shared/utils/http", "jriapp_shared/utils/strutils", "jriapp_shared/utils/checks", "jriapp_shared/utils/arrhelper", "jriapp_shared/utils/dom", "jriapp_shared/utils/deferred"], function (require, exports, coreutils_5, debug_3, error_3, logger_1, sysutils_2, async_2, http_1, strutils_3, checks_8, arrhelper_3, dom_1, deferred_3) {
    "use strict";
    var Utils = (function () {
        function Utils() {
        }
        Utils.check = checks_8.Checks;
        Utils.str = strutils_3.StringUtils;
        Utils.arr = arrhelper_3.ArrayHelper;
        Utils.http = http_1.HttpUtils;
        Utils.core = coreutils_5.CoreUtils;
        Utils.defer = async_2.AsyncUtils;
        Utils.err = error_3.ERROR;
        Utils.log = logger_1.LOGGER;
        Utils.debug = debug_3.DEBUG;
        Utils.sys = sysutils_2.SysUtils;
        Utils.dom = dom_1.DomUtils;
        Utils.queue = deferred_3.getTaskQueue();
        return Utils;
    }());
    exports.Utils = Utils;
});
define("jriapp_shared/collection/utils", ["require", "exports", "jriapp_shared/utils/utils", "jriapp_shared/lang"], function (require, exports, utils_1, lang_3) {
    "use strict";
    var utils = utils_1.Utils, coreUtils = utils.core, strUtils = utils.str, checks = utils.check;
    function pad(num) {
        if (num < 10) {
            return "0" + num;
        }
        return "" + num;
    }
    function dateToString(dt) {
        return ("" + dt.getFullYear()) +
            '-' + pad(dt.getMonth() + 1) +
            '-' + pad(dt.getDate()) +
            'T' + pad(dt.getHours()) +
            ':' + pad(dt.getMinutes()) +
            ':' + pad(dt.getSeconds()) +
            '.' + (dt.getMilliseconds() / 1000).toFixed(3).slice(2, 5) + 'Z';
    }
    exports.valueUtils = {
        valueToDate: function (val, dtcnv, serverTZ) {
            if (!val)
                return null;
            var dt = new Date(val);
            var clientTZ = coreUtils.get_timeZoneOffset();
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
                    throw new Error(strUtils.format(lang_3.ERRS.ERR_PARAM_INVALID, "dtcnv", dtcnv));
            }
            return dt;
        },
        dateToValue: function (dt, dtcnv, serverTZ) {
            if (dt === null)
                return null;
            if (!checks.isDate(dt))
                throw new Error(strUtils.format(lang_3.ERRS.ERR_PARAM_INVALID, "dt", dt));
            var clientTZ = coreUtils.get_timeZoneOffset();
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
                    throw new Error(strUtils.format(lang_3.ERRS.ERR_PARAM_INVALID, "dtcnv", dtcnv));
            }
            return dateToString(dt);
        },
        compareVals: function (v1, v2, dataType) {
            if ((v1 === null && v2 !== null) || (v1 !== null && v2 === null))
                return false;
            switch (dataType) {
                case 6:
                case 7:
                case 8:
                    if (checks.isDate(v1) && checks.isDate(v2))
                        return v1.getTime() === v2.getTime();
                    else
                        return false;
                default:
                    return v1 === v2;
            }
        },
        stringifyValue: function (v, dtcnv, dataType, serverTZ) {
            var res = null;
            if (checks.isNt(v))
                return res;
            function conv(v) {
                if (checks.isDate(v))
                    return exports.valueUtils.dateToValue(v, dtcnv, serverTZ);
                else if (checks.isArray(v))
                    return JSON.stringify(v);
                else if (checks.isString(v))
                    return v;
                else
                    return JSON.stringify(v);
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
                        res = exports.valueUtils.dateToValue(v, dtcnv, serverTZ);
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
                    throw new Error(strUtils.format(lang_3.ERRS.ERR_PARAM_INVALID, "dataType", dataType));
            }
            if (!isOK)
                throw new Error(strUtils.format(lang_3.ERRS.ERR_FIELD_WRONG_TYPE, v, dataType));
            return res;
        },
        parseValue: function (v, dataType, dtcnv, serverTZ) {
            var res = null;
            if (v === checks.undefined || v === null)
                return res;
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
                    res = exports.valueUtils.valueToDate(v, dtcnv, serverTZ);
                    break;
                case 10:
                    res = JSON.parse(v);
                    break;
                default:
                    throw new Error(strUtils.format(lang_3.ERRS.ERR_PARAM_INVALID, "dataType", dataType));
            }
            return res;
        }
    };
    function fn_getPropertyByName(name, props) {
        var arrProps = props.filter(function (f) { return f.fieldName === name; });
        if (!arrProps || arrProps.length !== 1)
            throw new Error(strUtils.format(lang_3.ERRS.ERR_ASSERTION_FAILED, "arrProps.length === 1"));
        return arrProps[0];
    }
    exports.fn_getPropertyByName = fn_getPropertyByName;
    function _fn_traverseField(fldName, fld, fn, parent_res) {
        if (fld.fieldType === 5) {
            var res = fn(fld, fldName, parent_res);
            if (!!fld.nested && fld.nested.length > 0) {
                var nestedFld = void 0, len = fld.nested.length;
                for (var i = 0; i < len; i += 1) {
                    nestedFld = fld.nested[i];
                    if (nestedFld.fieldType === 5) {
                        _fn_traverseField(fldName + "." + nestedFld.fieldName, nestedFld, fn, res);
                    }
                    else {
                        fn(nestedFld, fldName + "." + nestedFld.fieldName, res);
                    }
                }
            }
        }
        else {
            fn(fld, fldName, parent_res);
        }
    }
    function fn_traverseField(fld, fn, parent_res) {
        _fn_traverseField(fld.fieldName, fld, fn, parent_res);
    }
    exports.fn_traverseField = fn_traverseField;
    function fn_traverseFields(flds, fn, parent_res) {
        for (var i = 0; i < flds.length; i += 1) {
            fn_traverseField(flds[i], fn, parent_res);
        }
    }
    exports.fn_traverseFields = fn_traverseFields;
});
define("jriapp_shared/collection/validation", ["require", "exports", "jriapp_shared/errors", "jriapp_shared/lang", "jriapp_shared/utils/utils"], function (require, exports, errors_4, lang_4, utils_2) {
    "use strict";
    var utils = utils_2.Utils, sys = utils.sys;
    sys.isValidationError = function (obj) {
        return (!!obj && obj instanceof ValidationError);
    };
    var ValidationError = (function (_super) {
        __extends(ValidationError, _super);
        function ValidationError(errorInfo, item) {
            var message = lang_4.ERRS.ERR_VALIDATION + "\r\n", i = 0;
            errorInfo.forEach(function (err) {
                if (i > 0)
                    message = message + "\r\n";
                if (!!err.fieldName)
                    message = message + " " + lang_4.STRS.TEXT.txtField + ": " + err.fieldName + " -> " + err.errors.join(", ");
                else
                    message = message + err.errors.join(", ");
                i += 1;
            });
            _super.call(this, message);
            this._errors = errorInfo;
            this._item = item;
        }
        Object.defineProperty(ValidationError.prototype, "item", {
            get: function () {
                return this._item;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ValidationError.prototype, "errors", {
            get: function () {
                return this._errors;
            },
            enumerable: true,
            configurable: true
        });
        return ValidationError;
    }(errors_4.BaseError));
    exports.ValidationError = ValidationError;
    var Validations = (function () {
        function Validations() {
        }
        Validations._dtRangeToDate = function (str) {
            var dtParts = str.split("-");
            var dt = new Date(parseInt(dtParts[0], 10), parseInt(dtParts[1], 10) - 1, parseInt(dtParts[2], 10));
            return dt;
        };
        Validations.checkNumRange = function (num, range) {
            var rangeParts = range.split(",");
            if (!!rangeParts[0]) {
                if (num < parseFloat(rangeParts[0])) {
                    throw new Error(utils.str.format(lang_4.ERRS.ERR_FIELD_RANGE, num, range));
                }
            }
            if (!!rangeParts[1]) {
                if (num > parseFloat(rangeParts[1])) {
                    throw new Error(utils.str.format(lang_4.ERRS.ERR_FIELD_RANGE, num, range));
                }
            }
        };
        Validations.checkDateRange = function (dt, range) {
            var rangeParts = range.split(",");
            if (!!rangeParts[0]) {
                if (dt < Validations._dtRangeToDate(rangeParts[0])) {
                    throw new Error(utils.str.format(lang_4.ERRS.ERR_FIELD_RANGE, dt, range));
                }
            }
            if (!!rangeParts[1]) {
                if (dt > Validations._dtRangeToDate(rangeParts[1])) {
                    throw new Error(utils.str.format(lang_4.ERRS.ERR_FIELD_RANGE, dt, range));
                }
            }
        };
        return Validations;
    }());
    exports.Validations = Validations;
});
define("jriapp_shared/collection/base", ["require", "exports", "jriapp_shared/object", "jriapp_shared/lang", "jriapp_shared/utils/waitqueue", "jriapp_shared/utils/utils", "jriapp_shared/collection/int", "jriapp_shared/collection/utils", "jriapp_shared/collection/validation"], function (require, exports, object_2, lang_5, waitqueue_1, utils_3, int_2, utils_4, validation_1) {
    "use strict";
    var utils = utils_3.Utils, coreUtils = utils.core, strUtils = utils.str, checks = utils.check, sys = utils.sys;
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
        validate: "validate",
        current_changing: "current_changing",
        page_changing: "page_changing",
        errors_changed: "errors_changed",
        status_changed: "status_changed",
        clearing: "clearing",
        cleared: "cleared",
        commit_changes: "commit_changes"
    };
    var BaseCollection = (function (_super) {
        __extends(BaseCollection, _super);
        function BaseCollection() {
            _super.call(this);
            var self = this;
            this._options = { enablePaging: false, pageSize: 50 };
            this._isLoading = false;
            this._isUpdating = false;
            this._EditingItem = null;
            this._perms = { canAddRow: true, canEditRow: true, canDeleteRow: true, canRefreshRow: false };
            this._totalCount = 0;
            this._pageIndex = 0;
            this._items = [];
            this._itemsByKey = {};
            this._currentPos = -1;
            this._newKey = 0;
            this._fieldMap = {};
            this._fieldInfos = [];
            this._errors = {};
            this._ignoreChangeErrors = false;
            this._pkInfo = null;
            this._waitQueue = new waitqueue_1.WaitQueue(this);
            this._internal = {
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
                validateItem: function (item) {
                    return self._validateItem(item);
                },
                validateItemField: function (item, fieldName) {
                    return self._validateItemField(item, fieldName);
                },
                addErrors: function (item, errors) {
                    self._addErrors(item, errors);
                },
                addError: function (item, fieldName, errors) {
                    self._addError(item, fieldName, errors);
                },
                removeError: function (item, fieldName) {
                    self._removeError(item, fieldName);
                },
                removeAllErrors: function (item) {
                    self._removeAllErrors(item);
                },
                getErrors: function (item) {
                    return self._getErrors(item);
                },
                onErrorsChanged: function (item) {
                    self._onErrorsChanged(item);
                },
                onItemDeleting: function (args) {
                    return self._onItemDeleting(args);
                }
            };
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
        BaseCollection.prototype._getEventNames = function () {
            var base_events = _super.prototype._getEventNames.call(this);
            var events = Object.keys(COLL_EVENTS).map(function (key, i, arr) { return COLL_EVENTS[key]; });
            return events.concat(base_events);
        };
        BaseCollection.prototype.addOnClearing = function (fn, nmspace, context, priority) {
            this._addHandler(COLL_EVENTS.clearing, fn, nmspace, context, priority);
        };
        BaseCollection.prototype.removeOnClearing = function (nmspace) {
            this._removeHandler(COLL_EVENTS.clearing, nmspace);
        };
        BaseCollection.prototype.addOnCleared = function (fn, nmspace, context, priority) {
            this._addHandler(COLL_EVENTS.cleared, fn, nmspace, context, priority);
        };
        BaseCollection.prototype.removeOnCleared = function (nmspace) {
            this._removeHandler(COLL_EVENTS.cleared, nmspace);
        };
        BaseCollection.prototype.addOnCollChanged = function (fn, nmspace, context, priority) {
            this._addHandler(COLL_EVENTS.collection_changed, fn, nmspace, context, priority);
        };
        BaseCollection.prototype.removeOnCollChanged = function (nmspace) {
            this._removeHandler(COLL_EVENTS.collection_changed, nmspace);
        };
        BaseCollection.prototype.addOnFill = function (fn, nmspace, context, priority) {
            this._addHandler(COLL_EVENTS.fill, fn, nmspace, context, priority);
        };
        BaseCollection.prototype.removeOnFill = function (nmspace) {
            this._removeHandler(COLL_EVENTS.fill, nmspace);
        };
        BaseCollection.prototype.addOnValidate = function (fn, nmspace, context, priority) {
            this._addHandler(COLL_EVENTS.validate, fn, nmspace, context, priority);
        };
        BaseCollection.prototype.removeOnValidate = function (nmspace) {
            this._removeHandler(COLL_EVENTS.validate, nmspace);
        };
        BaseCollection.prototype.addOnItemDeleting = function (fn, nmspace, context, priority) {
            this._addHandler(COLL_EVENTS.item_deleting, fn, nmspace, context, priority);
        };
        BaseCollection.prototype.removeOnItemDeleting = function (nmspace) {
            this._removeHandler(COLL_EVENTS.item_deleting, nmspace);
        };
        BaseCollection.prototype.addOnItemAdding = function (fn, nmspace, context, priority) {
            this._addHandler(COLL_EVENTS.item_adding, fn, nmspace, context, priority);
        };
        BaseCollection.prototype.removeOnItemAdding = function (nmspace) {
            this._removeHandler(COLL_EVENTS.item_adding, nmspace);
        };
        BaseCollection.prototype.addOnItemAdded = function (fn, nmspace, context, priority) {
            this._addHandler(COLL_EVENTS.item_added, fn, nmspace, context, priority);
        };
        BaseCollection.prototype.removeOnItemAdded = function (nmspace) {
            this._removeHandler(COLL_EVENTS.item_added, nmspace);
        };
        BaseCollection.prototype.addOnCurrentChanging = function (fn, nmspace, context, priority) {
            this._addHandler(COLL_EVENTS.current_changing, fn, nmspace, context, priority);
        };
        BaseCollection.prototype.removeOnCurrentChanging = function (nmspace) {
            this._removeHandler(COLL_EVENTS.current_changing, nmspace);
        };
        BaseCollection.prototype.addOnPageChanging = function (fn, nmspace, context, priority) {
            this._addHandler(COLL_EVENTS.page_changing, fn, nmspace, context, priority);
        };
        BaseCollection.prototype.removeOnPageChanging = function (nmspace) {
            this._removeHandler(COLL_EVENTS.page_changing, nmspace);
        };
        BaseCollection.prototype.addOnErrorsChanged = function (fn, nmspace, context, priority) {
            this._addHandler(COLL_EVENTS.errors_changed, fn, nmspace, context, priority);
        };
        BaseCollection.prototype.removeOnErrorsChanged = function (nmspace) {
            this._removeHandler(COLL_EVENTS.errors_changed, nmspace);
        };
        BaseCollection.prototype.addOnBeginEdit = function (fn, nmspace, context, priority) {
            this._addHandler(COLL_EVENTS.begin_edit, fn, nmspace, context, priority);
        };
        BaseCollection.prototype.removeOnBeginEdit = function (nmspace) {
            this._removeHandler(COLL_EVENTS.begin_edit, nmspace);
        };
        BaseCollection.prototype.addOnEndEdit = function (fn, nmspace, context, priority) {
            this._addHandler(COLL_EVENTS.end_edit, fn, nmspace, context, priority);
        };
        BaseCollection.prototype.removeOnEndEdit = function (nmspace) {
            this._removeHandler(COLL_EVENTS.end_edit, nmspace);
        };
        BaseCollection.prototype.addOnBeforeBeginEdit = function (fn, nmspace, context, priority) {
            this._addHandler(COLL_EVENTS.before_begin_edit, fn, nmspace, context, priority);
        };
        BaseCollection.prototype.removeOnBeforeBeginEdit = function (nmspace) {
            this._removeHandler(COLL_EVENTS.before_begin_edit, nmspace);
        };
        BaseCollection.prototype.addOnBeforeEndEdit = function (fn, nmspace, context, priority) {
            this._addHandler(COLL_EVENTS.before_end_edit, fn, nmspace, context, priority);
        };
        BaseCollection.prototype.removeBeforeOnEndEdit = function (nmspace) {
            this._removeHandler(COLL_EVENTS.before_end_edit, nmspace);
        };
        BaseCollection.prototype.addOnCommitChanges = function (fn, nmspace, context, priority) {
            this._addHandler(COLL_EVENTS.commit_changes, fn, nmspace, context, priority);
        };
        BaseCollection.prototype.removeOnCommitChanges = function (nmspace) {
            this._removeHandler(COLL_EVENTS.commit_changes, nmspace);
        };
        BaseCollection.prototype.addOnStatusChanged = function (fn, nmspace, context, priority) {
            this._addHandler(COLL_EVENTS.status_changed, fn, nmspace, context, priority);
        };
        BaseCollection.prototype.removeOnStatusChanged = function (nmspace) {
            this._removeHandler(COLL_EVENTS.status_changed, nmspace);
        };
        BaseCollection.prototype.addOnPageIndexChanged = function (handler, nmspace, context) {
            this.addOnPropertyChange(int_2.PROP_NAME.pageIndex, handler, nmspace, context);
        };
        BaseCollection.prototype.addOnPageSizeChanged = function (handler, nmspace, context) {
            this.addOnPropertyChange(int_2.PROP_NAME.pageSize, handler, nmspace, context);
        };
        BaseCollection.prototype.addOnTotalCountChanged = function (handler, nmspace, context) {
            this.addOnPropertyChange(int_2.PROP_NAME.totalCount, handler, nmspace, context);
        };
        BaseCollection.prototype.addOnCurrentChanged = function (handler, nmspace, context) {
            this.addOnPropertyChange(int_2.PROP_NAME.currentItem, handler, nmspace, context);
        };
        BaseCollection.prototype._getPKFieldInfos = function () {
            if (!!this._pkInfo)
                return this._pkInfo;
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
            this.raiseEvent(COLL_EVENTS.current_changing, { newCurrent: newCurrent });
        };
        BaseCollection.prototype._onCurrentChanged = function () {
            this.raisePropertyChanged(int_2.PROP_NAME.currentItem);
        };
        BaseCollection.prototype._onCountChanged = function () {
            this.raisePropertyChanged(int_2.PROP_NAME.count);
        };
        BaseCollection.prototype._onEditingChanged = function () {
            this.raisePropertyChanged(int_2.PROP_NAME.isEditing);
        };
        BaseCollection.prototype._onItemStatusChanged = function (item, oldStatus) {
            this.raiseEvent(COLL_EVENTS.status_changed, { item: item, oldStatus: oldStatus, key: item._key });
        };
        BaseCollection.prototype._onCollectionChanged = function (args) {
            this.raiseEvent(COLL_EVENTS.collection_changed, args);
        };
        BaseCollection.prototype._onFillEnd = function (args) {
            this.raiseEvent(COLL_EVENTS.fill, args);
        };
        BaseCollection.prototype._onItemAdding = function (item) {
            var args = { item: item, isCancel: false };
            this.raiseEvent(COLL_EVENTS.item_adding, args);
            if (args.isCancel)
                utils.err.throwDummy(new Error("operation canceled"));
        };
        BaseCollection.prototype._onItemAdded = function (item) {
            var args = { item: item, isAddNewHandled: false };
            this.raiseEvent(COLL_EVENTS.item_added, args);
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
            this._onCollectionChanged({ changeType: 1, reason: 0, oper: 2, items: [item], pos: [pos] });
            item._aspect._onAttach();
            this.raisePropertyChanged(int_2.PROP_NAME.count);
            this._onCurrentChanging(item);
            this._currentPos = pos;
            this._onCurrentChanged();
            return pos;
        };
        BaseCollection.prototype._onRemoved = function (item, pos) {
            try {
                this._onCollectionChanged({ changeType: 0, reason: 0, oper: 3, items: [item], pos: [pos] });
            }
            finally {
                this.raisePropertyChanged(int_2.PROP_NAME.count);
            }
        };
        BaseCollection.prototype._onPageSizeChanged = function () {
        };
        BaseCollection.prototype._onPageChanging = function () {
            var args = { page: this.pageIndex, isCancel: false };
            this.raiseEvent(COLL_EVENTS.page_changing, args);
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
            if (!v._key)
                throw new Error(lang_5.ERRS.ERR_ITEM_IS_DETACHED);
            var oldItem, pos, item = self.getItemByKey(v._key);
            if (!item) {
                throw new Error(lang_5.ERRS.ERR_ITEM_IS_NOTFOUND);
            }
            oldItem = self.getItemByPos(oldPos);
            pos = self._items.indexOf(v);
            if (pos < 0) {
                throw new Error(lang_5.ERRS.ERR_ITEM_IS_NOTFOUND);
            }
            if (oldPos !== pos || oldItem !== v) {
                self._onCurrentChanging(v);
                self._currentPos = pos;
                self._onCurrentChanged();
            }
        };
        BaseCollection.prototype._destroyItems = function () {
            this._items.forEach(function (item) {
                item._aspect._setIsDetached(true);
                item.destroy();
            });
        };
        BaseCollection.prototype._isHasProp = function (prop) {
            if (strUtils.startsWith(prop, "[")) {
                var res = sys.getProp(this, prop);
                return !checks.isUndefined(res);
            }
            return _super.prototype._isHasProp.call(this, prop);
        };
        BaseCollection.prototype._getEditingItem = function () {
            return this._EditingItem;
        };
        BaseCollection.prototype._getStrValue = function (val, fieldInfo) {
            var dcnv = fieldInfo.dateConversion, stz = coreUtils.get_timeZoneOffset();
            return utils_4.valueUtils.stringifyValue(val, dcnv, fieldInfo.dataType, stz);
        };
        BaseCollection.prototype._onBeforeEditing = function (item, isBegin, isCanceled) {
            if (this._isUpdating)
                return;
            if (isBegin) {
                this.raiseEvent(COLL_EVENTS.before_begin_edit, { item: item });
            }
            else {
                this.raiseEvent(COLL_EVENTS.before_end_edit, { item: item, isCanceled: isCanceled });
            }
        };
        BaseCollection.prototype._onEditing = function (item, isBegin, isCanceled) {
            if (this._isUpdating)
                return;
            if (isBegin) {
                this._EditingItem = item;
                this.raiseEvent(COLL_EVENTS.begin_edit, { item: item });
                this._onEditingChanged();
                if (!!item) {
                    item._aspect.raisePropertyChanged(int_2.PROP_NAME.isEditing);
                }
            }
            else {
                var oldItem = this._EditingItem;
                this._EditingItem = null;
                this.raiseEvent(COLL_EVENTS.end_edit, { item: item, isCanceled: isCanceled });
                this._onEditingChanged();
                if (!!oldItem) {
                    oldItem._aspect.raisePropertyChanged(int_2.PROP_NAME.isEditing);
                }
            }
        };
        BaseCollection.prototype._onCommitChanges = function (item, isBegin, isRejected, status) {
            this.raiseEvent(COLL_EVENTS.commit_changes, { item: item, isBegin: isBegin, isRejected: isRejected, status: status });
        };
        BaseCollection.prototype._validateItem = function (item) {
            var args = { item: item, fieldName: null, errors: [] };
            this.raiseEvent(COLL_EVENTS.validate, args);
            if (!!args.errors && args.errors.length > 0)
                return { fieldName: null, errors: args.errors };
            else
                return null;
        };
        BaseCollection.prototype._validateItemField = function (item, fieldName) {
            var args = { item: item, fieldName: fieldName, errors: [] };
            this.raiseEvent(COLL_EVENTS.validate, args);
            if (!!args.errors && args.errors.length > 0)
                return { fieldName: fieldName, errors: args.errors };
            else
                return null;
        };
        BaseCollection.prototype._addErrors = function (item, errors) {
            var self = this;
            this._ignoreChangeErrors = true;
            try {
                errors.forEach(function (err) {
                    self._addError(item, err.fieldName, err.errors);
                });
            }
            finally {
                this._ignoreChangeErrors = false;
            }
            this._onErrorsChanged(item);
        };
        BaseCollection.prototype._addError = function (item, fieldName, errors) {
            if (!fieldName)
                fieldName = "*";
            if (!(checks.isArray(errors) && errors.length > 0)) {
                this._removeError(item, fieldName);
                return;
            }
            if (!this._errors[item._key])
                this._errors[item._key] = {};
            var itemErrors = this._errors[item._key];
            itemErrors[fieldName] = errors;
            if (!this._ignoreChangeErrors)
                this._onErrorsChanged(item);
        };
        BaseCollection.prototype._removeError = function (item, fieldName) {
            var itemErrors = this._errors[item._key];
            if (!itemErrors)
                return;
            if (!fieldName)
                fieldName = "*";
            if (!itemErrors[fieldName])
                return;
            delete itemErrors[fieldName];
            if (Object.keys(itemErrors).length === 0) {
                delete this._errors[item._key];
            }
            this._onErrorsChanged(item);
        };
        BaseCollection.prototype._removeAllErrors = function (item) {
            var self = this, itemErrors = this._errors[item._key];
            if (!itemErrors)
                return;
            delete this._errors[item._key];
            self._onErrorsChanged(item);
        };
        BaseCollection.prototype._getErrors = function (item) {
            return this._errors[item._key];
        };
        BaseCollection.prototype._onErrorsChanged = function (item) {
            var args = { item: item };
            this.raiseEvent(COLL_EVENTS.errors_changed, args);
            item._aspect.raiseErrorsChanged({});
        };
        BaseCollection.prototype._onItemDeleting = function (args) {
            this.raiseEvent(COLL_EVENTS.item_deleting, args);
            return !args.isCancel;
        };
        BaseCollection.prototype._clear = function (reason, oper) {
            this.raiseEvent(COLL_EVENTS.clearing, { reason: reason });
            this.cancelEdit();
            this._EditingItem = null;
            this._newKey = 0;
            this.currentItem = null;
            this._destroyItems();
            this._items = [];
            this._itemsByKey = {};
            this._errors = {};
            if (oper !== 1)
                this._onCollectionChanged({ changeType: 2, reason: reason, oper: oper, items: [], pos: [] });
            this.raiseEvent(COLL_EVENTS.cleared, { reason: reason });
            this._onCountChanged();
        };
        BaseCollection.prototype._setIsLoading = function (v) {
            if (this._isLoading !== v) {
                this._isLoading = v;
                this.raisePropertyChanged(int_2.PROP_NAME.isLoading);
            }
        };
        BaseCollection.prototype._getInternal = function () {
            return this._internal;
        };
        BaseCollection.prototype._getSortFn = function (fieldNames, sortOrder) {
            var self = this, mult = 1;
            if (sortOrder === 1)
                mult = -1;
            var fn_sort = function (a, b) {
                var res = 0, i, len, af, bf, fieldName;
                for (i = 0, len = fieldNames.length; i < len; i += 1) {
                    fieldName = fieldNames[i];
                    af = sys.resolvePath(a, fieldName);
                    bf = sys.resolvePath(b, fieldName);
                    if (af === checks.undefined)
                        af = null;
                    if (bf === checks.undefined)
                        bf = null;
                    if (af === null && bf !== null)
                        res = -1 * mult;
                    else if (af !== null && bf === null)
                        res = mult;
                    else if (af < bf)
                        res = -1 * mult;
                    else if (af > bf)
                        res = mult;
                    else
                        res = 0;
                    if (res !== 0)
                        return res;
                }
                return res;
            };
            return fn_sort;
        };
        BaseCollection.prototype.getFieldInfo = function (fieldName) {
            var parts = fieldName.split(".");
            var fld = this._fieldMap[parts[0]];
            if (parts.length === 1) {
                return fld;
            }
            if (fld.fieldType === 5) {
                for (var i = 1; i < parts.length; i += 1) {
                    fld = utils_4.fn_getPropertyByName(parts[i], fld.nested);
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
                    this.handleError(new validation_1.ValidationError(EditingItem._aspect.getAllErrors(), EditingItem), EditingItem);
                    this.cancelEdit();
                }
            }
        };
        BaseCollection.prototype.getItemsWithErrors = function () {
            var self = this, res = [];
            coreUtils.forEachProp(this._errors, function (key) {
                var item = self.getItemByKey(key);
                res.push(item);
            });
            return res;
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
            if (pos < 0 || pos >= this._items.length)
                return null;
            return this._items[pos];
        };
        BaseCollection.prototype.getItemByKey = function (key) {
            if (!key)
                throw new Error(lang_5.ERRS.ERR_KEY_IS_EMPTY);
            return this._itemsByKey["" + key];
        };
        BaseCollection.prototype.findByPK = function () {
            var vals = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                vals[_i - 0] = arguments[_i];
            }
            if (arguments.length === 0)
                return null;
            var self = this, pkInfo = self._getPKFieldInfos(), arr = [], key, values = [];
            if (vals.length === 1 && checks.isArray(vals[0])) {
                values = vals[0];
            }
            else
                values = vals;
            if (values.length !== pkInfo.length) {
                return null;
            }
            for (var i = 0, len = pkInfo.length; i < len; i += 1) {
                arr.push(self._getStrValue(values[i], pkInfo[i]));
            }
            key = arr.join(";");
            return self.getItemByKey(key);
        };
        BaseCollection.prototype.moveFirst = function (skipDeleted) {
            var pos = 0, old = this._currentPos;
            if (old === pos)
                return false;
            var item = this.getItemByPos(pos);
            if (!item)
                return false;
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
            var pos = -1, old = this._currentPos;
            var item = this.getItemByPos(old);
            if (!!item) {
                pos = old;
                pos -= 1;
            }
            item = this.getItemByPos(pos);
            if (!item)
                return false;
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
            var pos = -1, old = this._currentPos;
            var item = this.getItemByPos(old);
            if (!!item) {
                pos = old;
                pos += 1;
            }
            item = this.getItemByPos(pos);
            if (!item)
                return false;
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
            if (old === pos)
                return false;
            var item = this.getItemByPos(pos);
            if (!item)
                return false;
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
            if (old === pos)
                return false;
            var item = this.getItemByPos(pos);
            if (!item)
                return false;
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
                delete this._errors[key];
                item._aspect._setIsDetached(true);
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
                if (!item.getIsDestroyCalled()) {
                    item.destroy();
                }
            }
        };
        BaseCollection.prototype.getIsHasErrors = function () {
            if (!this._errors)
                return false;
            return (Object.keys(this._errors).length > 0);
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
                    self._onCollectionChanged({ changeType: 2, reason: 2, oper: 5, items: [], pos: [] });
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
        BaseCollection.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            this._waitQueue.destroy();
            this._waitQueue = null;
            this.clear();
            this._fieldMap = {};
            this._fieldInfos = [];
            _super.prototype.destroy.call(this);
        };
        BaseCollection.prototype.waitForNotLoading = function (callback, groupName) {
            this._waitQueue.enQueue({
                prop: int_2.PROP_NAME.isLoading,
                groupName: groupName,
                predicate: function (val) {
                    return !val;
                },
                action: callback,
                actionArgs: [],
                lastWins: !!groupName
            });
        };
        BaseCollection.prototype.toString = function () {
            return "Collection";
        };
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
                    this.raisePropertyChanged(int_2.PROP_NAME.totalCount);
                    this.raisePropertyChanged(int_2.PROP_NAME.pageCount);
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
                    this.raisePropertyChanged(int_2.PROP_NAME.pageSize);
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
                    if (v < 0)
                        return;
                    if (!this._onPageChanging()) {
                        return;
                    }
                    this._pageIndex = v;
                    this._onPageChanged();
                    this.raisePropertyChanged(int_2.PROP_NAME.pageIndex);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseCollection.prototype, "pageCount", {
            get: function () {
                var rowCount = this.totalCount, rowPerPage = this.pageSize, result;
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
                    this.raisePropertyChanged(int_2.PROP_NAME.isUpdating);
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
        return BaseCollection;
    }(object_2.BaseObject));
    exports.BaseCollection = BaseCollection;
});
define("jriapp_shared/collection/aspect", ["require", "exports", "jriapp_shared/object", "jriapp_shared/lang", "jriapp_shared/utils/utils", "jriapp_shared/collection/int", "jriapp_shared/collection/utils", "jriapp_shared/collection/validation"], function (require, exports, object_3, lang_6, utils_5, int_3, utils_6, validation_2) {
    "use strict";
    var utils = utils_5.Utils, coreUtils = utils.core, strUtils = utils.str, checks = utils.check, sys = utils.sys, ERROR = utils.err;
    var ItemAspect = (function (_super) {
        __extends(ItemAspect, _super);
        function ItemAspect(collection) {
            _super.call(this);
            this._key = null;
            this._item = null;
            this._collection = collection;
            this._status = 0;
            this._saveVals = null;
            this._vals = {};
            this._notEdited = true;
            this._isCached = false;
            this._isDetached = false;
        }
        ItemAspect.prototype._setIsDetached = function (v) {
            this._isDetached = v;
        };
        ItemAspect.prototype._setIsCached = function (v) {
            this._isCached = v;
        };
        ItemAspect.prototype._getEventNames = function () {
            var base_events = _super.prototype._getEventNames.call(this);
            return [int_3.ITEM_EVENTS.errors_changed].concat(base_events);
        };
        ItemAspect.prototype._onErrorsChanged = function (args) {
            this.raiseEvent(int_3.ITEM_EVENTS.errors_changed, args);
        };
        ItemAspect.prototype._beginEdit = function () {
            var coll = this.collection;
            var isHandled = false;
            if (coll.isEditing) {
                var item = coll._getInternal().getEditingItem();
                if (item._aspect === this)
                    return false;
                try {
                    item._aspect.endEdit();
                    if (item._aspect.getIsHasErrors()) {
                        this.handleError(new validation_2.ValidationError(item._aspect.getAllErrors(), item), item);
                        item._aspect.cancelEdit();
                    }
                }
                catch (ex) {
                    isHandled = this.handleError(ex, item);
                    item._aspect.cancelEdit();
                    ERROR.reThrow(ex, isHandled);
                }
            }
            if (this.isDetached)
                return false;
            this._saveVals = coreUtils.clone(this._vals);
            this.collection.currentItem = this.item;
            return true;
        };
        ItemAspect.prototype._endEdit = function () {
            if (!this.isEditing)
                return false;
            var coll = this.collection, self = this, internal = coll._getInternal();
            if (this.getIsHasErrors()) {
                return false;
            }
            internal.removeAllErrors(this.item);
            var validation_errors = this._validateAll();
            if (validation_errors.length > 0) {
                internal.addErrors(self.item, validation_errors);
            }
            if (this.getIsHasErrors()) {
                return false;
            }
            this._saveVals = null;
            return true;
        };
        ItemAspect.prototype._cancelEdit = function () {
            if (!this.isEditing)
                return false;
            var coll = this.collection, self = this, item = self.item, changes = this._saveVals;
            this._vals = this._saveVals;
            this._saveVals = null;
            coll._getInternal().removeAllErrors(item);
            coll.getFieldNames().forEach(function (name) {
                if (changes[name] !== self._vals[name]) {
                    item.raisePropertyChanged(name);
                }
            });
            return true;
        };
        ItemAspect.prototype._validate = function () {
            return this.collection._getInternal().validateItem(this.item);
        };
        ItemAspect.prototype._skipValidate = function (fieldInfo, val) {
            return false;
        };
        ItemAspect.prototype._validateField = function (fieldName) {
            var value, fieldInfo = this.getFieldInfo(fieldName), valInfo = null;
            try {
                value = coreUtils.getValue(this._vals, fieldName);
                if (this._skipValidate(fieldInfo, value))
                    return valInfo;
                if (this.isNew) {
                    if (value === null && !fieldInfo.isNullable && !fieldInfo.isReadOnly && !fieldInfo.isAutoGenerated)
                        throw new Error(lang_6.ERRS.ERR_FIELD_ISNOT_NULLABLE);
                }
                else {
                    if (value === null && !fieldInfo.isNullable && !fieldInfo.isReadOnly)
                        throw new Error(lang_6.ERRS.ERR_FIELD_ISNOT_NULLABLE);
                }
            }
            catch (ex) {
                valInfo = { fieldName: fieldName, errors: [ex.message] };
            }
            var tmpValInfo = this.collection._getInternal().validateItemField(this.item, fieldName);
            if (!!valInfo && !!tmpValInfo) {
                valInfo = { fieldName: valInfo.fieldName, errors: valInfo.errors.concat(tmpValInfo.errors) };
            }
            else if (!!tmpValInfo)
                valInfo = tmpValInfo;
            return valInfo;
        };
        ItemAspect.prototype._validateAll = function () {
            var self = this, fieldInfos = this.collection.getFieldInfos(), errs = [];
            utils_6.fn_traverseFields(fieldInfos, function (fld, fullName) {
                if (fld.fieldType !== 5) {
                    var res_1 = self._validateField(fullName);
                    if (!!res_1) {
                        errs.push(res_1);
                    }
                }
            });
            var res = self._validate();
            if (!!res) {
                errs.push(res);
            }
            return errs;
        };
        ItemAspect.prototype._checkVal = function (fieldInfo, val) {
            var res = val;
            if (this._skipValidate(fieldInfo, val))
                return res;
            if (fieldInfo.isReadOnly && !(fieldInfo.allowClientDefault && this.isNew))
                throw new Error(lang_6.ERRS.ERR_FIELD_READONLY);
            if ((val === null || (checks.isString(val) && !val)) && !fieldInfo.isNullable)
                throw new Error(lang_6.ERRS.ERR_FIELD_ISNOT_NULLABLE);
            if (val === null)
                return val;
            switch (fieldInfo.dataType) {
                case 0:
                    break;
                case 9:
                case 1:
                    if (!checks.isString(val)) {
                        throw new Error(strUtils.format(lang_6.ERRS.ERR_FIELD_WRONG_TYPE, val, "String"));
                    }
                    if (fieldInfo.maxLength > 0 && val.length > fieldInfo.maxLength)
                        throw new Error(strUtils.format(lang_6.ERRS.ERR_FIELD_MAXLEN, fieldInfo.maxLength));
                    if (fieldInfo.isNullable && val === "")
                        res = null;
                    if (!!fieldInfo.regex) {
                        var reg = new RegExp(fieldInfo.regex, "i");
                        if (!reg.test(val)) {
                            throw new Error(strUtils.format(lang_6.ERRS.ERR_FIELD_REGEX, val));
                        }
                    }
                    break;
                case 10:
                    if (!checks.isArray(val)) {
                        throw new Error(strUtils.format(lang_6.ERRS.ERR_FIELD_WRONG_TYPE, val, "Array"));
                    }
                    if (fieldInfo.maxLength > 0 && val.length > fieldInfo.maxLength)
                        throw new Error(strUtils.format(lang_6.ERRS.ERR_FIELD_MAXLEN, fieldInfo.maxLength));
                    break;
                case 2:
                    if (!checks.isBoolean(val))
                        throw new Error(strUtils.format(lang_6.ERRS.ERR_FIELD_WRONG_TYPE, val, "Boolean"));
                    break;
                case 3:
                case 4:
                case 5:
                    if (!checks.isNumber(val))
                        throw new Error(strUtils.format(lang_6.ERRS.ERR_FIELD_WRONG_TYPE, val, "Number"));
                    if (!!fieldInfo.range) {
                        validation_2.Validations.checkNumRange(Number(val), fieldInfo.range);
                    }
                    break;
                case 6:
                case 7:
                    if (!checks.isDate(val))
                        throw new Error(strUtils.format(lang_6.ERRS.ERR_FIELD_WRONG_TYPE, val, "Date"));
                    if (!!fieldInfo.range) {
                        validation_2.Validations.checkDateRange(val, fieldInfo.range);
                    }
                    break;
                case 8:
                    if (!checks.isDate(val))
                        throw new Error(strUtils.format(lang_6.ERRS.ERR_FIELD_WRONG_TYPE, val, "Time"));
                    break;
                default:
                    throw new Error(strUtils.format(lang_6.ERRS.ERR_PARAM_INVALID, "dataType", fieldInfo.dataType));
            }
            return res;
        };
        ItemAspect.prototype._resetIsNew = function () {
        };
        ItemAspect.prototype._fakeDestroy = function () {
            this.raiseEvent(int_3.ITEM_EVENTS.destroyed, {});
            this.removeNSHandlers();
        };
        ItemAspect.prototype.handleError = function (error, source) {
            if (!this._collection)
                return _super.prototype.handleError.call(this, error, source);
            else
                return this._collection.handleError(error, source);
        };
        ItemAspect.prototype._onAttaching = function () {
        };
        ItemAspect.prototype._onAttach = function () {
        };
        ItemAspect.prototype.raiseErrorsChanged = function (args) {
            this._onErrorsChanged(args);
        };
        ItemAspect.prototype.getFieldInfo = function (fieldName) {
            return this.collection.getFieldInfo(fieldName);
        };
        ItemAspect.prototype.getFieldNames = function () {
            return this.collection.getFieldNames();
        };
        ItemAspect.prototype.getErrorString = function () {
            var itemErrors = this.collection._getInternal().getErrors(this.item);
            if (!itemErrors)
                return "";
            var res = [];
            coreUtils.forEachProp(itemErrors, function (name) {
                res.push(strUtils.format("{0}: {1}", name, itemErrors[name]));
            });
            return res.join("|");
        };
        ItemAspect.prototype.submitChanges = function () {
            var deferred = utils.defer.createDeferred();
            deferred.reject();
            return deferred.promise();
        };
        ItemAspect.prototype.rejectChanges = function () {
        };
        ItemAspect.prototype.beginEdit = function () {
            if (this.isEditing)
                return false;
            var coll = this.collection, internal = coll._getInternal(), item = this.item;
            internal.onBeforeEditing(item, true, false);
            if (!this._beginEdit())
                return false;
            internal.onEditing(item, true, false);
            if (!!this._valueBag && this.isEditing) {
                coreUtils.iterateIndexer(this._valueBag, function (name, obj) {
                    if (!!obj && sys.isEditable(obj.val))
                        obj.val.beginEdit();
                });
            }
            return true;
        };
        ItemAspect.prototype.endEdit = function () {
            if (!this.isEditing)
                return false;
            var coll = this.collection, internal = coll._getInternal(), item = this.item;
            internal.onBeforeEditing(item, false, false);
            if (!!this._valueBag) {
                coreUtils.iterateIndexer(this._valueBag, function (name, obj) {
                    if (!!obj && sys.isEditable(obj.val))
                        obj.val.endEdit();
                });
            }
            if (!this._endEdit())
                return false;
            internal.onEditing(item, false, false);
            this._notEdited = false;
            return true;
        };
        ItemAspect.prototype.cancelEdit = function () {
            if (!this.isEditing)
                return false;
            var coll = this.collection, internal = coll._getInternal(), item = this.item, isNew = this.isNew;
            internal.onBeforeEditing(item, false, true);
            if (!!this._valueBag) {
                coreUtils.iterateIndexer(this._valueBag, function (name, obj) {
                    if (!!obj && sys.isEditable(obj.val))
                        obj.val.cancelEdit();
                });
            }
            if (!this._cancelEdit())
                return false;
            internal.onEditing(item, false, true);
            if (isNew && this._notEdited && !this.getIsDestroyCalled()) {
                this.destroy();
            }
            return true;
        };
        ItemAspect.prototype.deleteItem = function () {
            var coll = this.collection;
            if (!this.key)
                return false;
            var args = { item: this.item, isCancel: false };
            coll._getInternal().onItemDeleting(args);
            if (args.isCancel) {
                return false;
            }
            this.destroy();
            return true;
        };
        ItemAspect.prototype.getIsHasErrors = function () {
            var itemErrors = this.collection._getInternal().getErrors(this.item);
            return !!itemErrors;
        };
        ItemAspect.prototype.addOnErrorsChanged = function (fn, nmspace, context) {
            this._addHandler(int_3.ITEM_EVENTS.errors_changed, fn, nmspace, context);
        };
        ItemAspect.prototype.removeOnErrorsChanged = function (nmspace) {
            this._removeHandler(int_3.ITEM_EVENTS.errors_changed, nmspace);
        };
        ItemAspect.prototype.getFieldErrors = function (fieldName) {
            var itemErrors = this.collection._getInternal().getErrors(this.item);
            if (!itemErrors)
                return [];
            var name = fieldName;
            if (!fieldName)
                fieldName = "*";
            if (!itemErrors[fieldName])
                return [];
            if (fieldName === "*")
                name = null;
            return [
                { fieldName: name, errors: itemErrors[fieldName] }
            ];
        };
        ItemAspect.prototype.getAllErrors = function () {
            var itemErrors = this.collection._getInternal().getErrors(this.item);
            if (!itemErrors)
                return [];
            var res = [];
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
        ItemAspect.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            var self = this;
            this._isDestroyCalled = true;
            var coll = this._collection;
            var item = this._item;
            if (!!item) {
                this.cancelEdit();
                if (this._isCached) {
                    try {
                        this._fakeDestroy();
                    }
                    finally {
                        this._isDestroyCalled = false;
                    }
                    return;
                }
                if (!item._aspect.isDetached) {
                    coll.removeItem(item);
                }
            }
            this._key = null;
            this._saveVals = null;
            this._vals = {};
            this._isCached = false;
            this._isDetached = true;
            this._collection = null;
            if (!!this._valueBag) {
                utils.core.forEachProp(this._valueBag, function (name) {
                    self._delCustomVal(self._valueBag[name]);
                });
                this._valueBag = null;
            }
            _super.prototype.destroy.call(this);
        };
        ItemAspect.prototype._delCustomVal = function (old) {
            if (!!old) {
                if (sys.isEditable(old.val) && old.val.isEditing)
                    old.val.cancelEdit();
                if (old.isOwnIt && sys.isBaseObj(old.val))
                    old.val.destroy();
            }
        };
        ItemAspect.prototype.toString = function () {
            return "ItemAspect";
        };
        Object.defineProperty(ItemAspect.prototype, "item", {
            get: function () {
                return this._item;
            },
            set: function (v) {
                this._item = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemAspect.prototype, "isCanSubmit", {
            get: function () { return false; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemAspect.prototype, "status", {
            get: function () { return this._status; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemAspect.prototype, "isNew", {
            get: function () {
                return false;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemAspect.prototype, "isDeleted", {
            get: function () { return false; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemAspect.prototype, "key", {
            get: function () { return this._key; },
            set: function (v) {
                if (v !== null)
                    v = "" + v;
                this._key = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemAspect.prototype, "collection", {
            get: function () { return this._collection; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemAspect.prototype, "isUpdating", {
            get: function () {
                var coll = this.collection;
                if (!coll)
                    return false;
                return coll.isUpdating;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemAspect.prototype, "isEditing", {
            get: function () {
                var coll = this._collection, editingItem = !coll ? null : coll._getInternal().getEditingItem();
                return !!editingItem && editingItem._aspect === this;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemAspect.prototype, "isHasChanges", {
            get: function () { return this._status !== 0; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemAspect.prototype, "isCached", {
            get: function () { return this._isCached; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ItemAspect.prototype, "isDetached", {
            get: function () { return this._isDetached; },
            enumerable: true,
            configurable: true
        });
        ItemAspect.prototype.setCustomVal = function (name, val, isOwnVal) {
            if (isOwnVal === void 0) { isOwnVal = true; }
            if (this.getIsDestroyCalled())
                return;
            if (!this._valueBag) {
                if (checks.isNt(val))
                    return;
                this._valueBag = {};
            }
            var old = this._valueBag[name];
            if (!!old && old.val !== val) {
                this._delCustomVal(old);
            }
            if (checks.isNt(val)) {
                delete this._valueBag[name];
            }
            else {
                this._valueBag[name] = { val: val, isOwnIt: !!isOwnVal };
                if (this.isEditing && sys.isEditable(val))
                    val.beginEdit();
            }
        };
        ItemAspect.prototype.getCustomVal = function (name) {
            if (this.getIsDestroyCalled() || !this._valueBag)
                return null;
            var obj = this._valueBag[name];
            if (!obj) {
                return null;
            }
            return obj.val;
        };
        return ItemAspect;
    }(object_3.BaseObject));
    exports.ItemAspect = ItemAspect;
});
define("jriapp_shared/collection/item", ["require", "exports", "jriapp_shared/object", "jriapp_shared/collection/int"], function (require, exports, object_4, int_4) {
    "use strict";
    var CollectionItem = (function (_super) {
        __extends(CollectionItem, _super);
        function CollectionItem(aspect) {
            _super.call(this);
            this.__aspect = aspect;
        }
        CollectionItem.prototype._fakeDestroy = function () {
            this.raiseEvent(int_4.ITEM_EVENTS.destroyed, {});
            this.removeNSHandlers();
        };
        Object.defineProperty(CollectionItem.prototype, "_aspect", {
            get: function () { return this.__aspect; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CollectionItem.prototype, "_key", {
            get: function () { return !!this.__aspect ? this.__aspect.key : null; },
            set: function (v) { if (!this.__aspect)
                return; this.__aspect.key = v; },
            enumerable: true,
            configurable: true
        });
        CollectionItem.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            var aspect = this.__aspect;
            if (!!aspect) {
                if (!aspect.getIsDestroyCalled()) {
                    aspect.destroy();
                }
                if (aspect.isCached) {
                    try {
                        this._fakeDestroy();
                    }
                    finally {
                        this._isDestroyCalled = false;
                    }
                }
                else {
                    _super.prototype.destroy.call(this);
                }
            }
        };
        CollectionItem.prototype.toString = function () {
            return "CollectionItem";
        };
        return CollectionItem;
    }(object_4.BaseObject));
    exports.CollectionItem = CollectionItem;
});
define("jriapp_shared/collection/list", ["require", "exports", "jriapp_shared/utils/utils", "jriapp_shared/lang", "jriapp_shared/collection/int", "jriapp_shared/collection/utils", "jriapp_shared/collection/base", "jriapp_shared/collection/aspect", "jriapp_shared/collection/validation"], function (require, exports, utils_7, lang_7, int_5, utils_8, base_1, aspect_1, validation_3) {
    "use strict";
    var utils = utils_7.Utils, coreUtils = utils.core, strUtils = utils.str, checks = utils.check, ERROR = utils.err;
    function fn_initVals(coll, obj) {
        var vals = obj || {};
        if (!!obj) {
            var fieldInfos = coll.getFieldInfos();
            utils_8.fn_traverseFields(fieldInfos, function (fld, fullName) {
                if (fld.fieldType === 5)
                    coreUtils.setValue(vals, fullName, {}, false);
                else
                    coreUtils.setValue(vals, fullName, null, false);
            });
        }
        return vals;
    }
    ;
    var ListItemAspect = (function (_super) {
        __extends(ListItemAspect, _super);
        function ListItemAspect(coll, obj) {
            _super.call(this, coll);
            var self = this;
            this._isNew = !obj ? true : false;
            if (!!obj)
                this._vals = obj;
            else
                this._vals = fn_initVals(coll, obj);
        }
        ListItemAspect.prototype._setProp = function (name, val) {
            var validation_error, error;
            var coll = this.collection, item = this.item;
            if (this._getProp(name) !== val) {
                try {
                    coreUtils.setValue(this._vals, name, val, false);
                    item.raisePropertyChanged(name);
                    coll._getInternal().removeError(item, name);
                    validation_error = this._validateField(name);
                    if (!!validation_error) {
                        throw new validation_3.ValidationError([validation_error], this);
                    }
                }
                catch (ex) {
                    if (utils.sys.isValidationError(ex)) {
                        error = ex;
                    }
                    else {
                        error = new validation_3.ValidationError([
                            { fieldName: name, errors: [ex.message] }
                        ], this);
                    }
                    coll._getInternal().addError(item, name, error.errors[0].errors);
                    throw error;
                }
            }
        };
        ListItemAspect.prototype._getProp = function (name) {
            return coreUtils.getValue(this._vals, name);
        };
        ListItemAspect.prototype._resetIsNew = function () {
            this._isNew = false;
        };
        ListItemAspect.prototype.toString = function () {
            if (!this.item)
                return "ListItemAspect";
            return this.item.toString() + "Aspect";
        };
        Object.defineProperty(ListItemAspect.prototype, "list", {
            get: function () { return this.collection; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListItemAspect.prototype, "vals", {
            get: function () { return this._vals; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListItemAspect.prototype, "isNew", {
            get: function () { return this._isNew; },
            enumerable: true,
            configurable: true
        });
        return ListItemAspect;
    }(aspect_1.ItemAspect));
    exports.ListItemAspect = ListItemAspect;
    var BaseList = (function (_super) {
        __extends(BaseList, _super);
        function BaseList(itemType, props) {
            _super.call(this);
            this._itemType = itemType;
            if (!!props)
                this._updateFieldMap(props);
        }
        BaseList.prototype._updateFieldMap = function (props) {
            var self = this;
            if (!checks.isArray(props) || props.length === 0)
                throw new Error(strUtils.format(lang_7.ERRS.ERR_PARAM_INVALID, "props", props));
            self._fieldMap = {};
            self._fieldInfos = [];
            props.forEach(function (prop) {
                var fldInfo = base_1.BaseCollection.getEmptyFieldInfo(prop.name);
                fldInfo.dataType = prop.dtype;
                self._fieldMap[prop.name] = fldInfo;
                self._fieldInfos.push(fldInfo);
                utils_8.fn_traverseField(fldInfo, function (fld, fullName) {
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
        BaseList.prototype._getNewKey = function (item) {
            var key = "clkey_" + this._newKey;
            this._newKey += 1;
            return key;
        };
        BaseList.prototype.createItem = function (obj) {
            var aspect = new ListItemAspect(this, obj);
            var item = new this._itemType(aspect);
            aspect.key = this._getNewKey(item);
            aspect.item = item;
            return item;
        };
        BaseList.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            this._itemType = null;
            _super.prototype.destroy.call(this);
        };
        BaseList.prototype.fillItems = function (objArray, clearAll) {
            var self = this, newItems = [], positions = [], items = [];
            if (!objArray)
                objArray = [];
            try {
                if (!!clearAll)
                    this.clear();
                objArray.forEach(function (obj) {
                    var item = self.createItem(obj);
                    var oldItem = self._itemsByKey[item._key];
                    if (!oldItem) {
                        self._items.push(item);
                        self._itemsByKey[item._key] = item;
                        newItems.push(item);
                        positions.push(self._items.length - 1);
                        items.push(item);
                    }
                    else {
                        items.push(oldItem);
                    }
                });
                if (newItems.length > 0) {
                    this.raisePropertyChanged(int_5.PROP_NAME.count);
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
        BaseList.prototype.toArray = function () {
            return this.items.map(function (item, index, arr) {
                return coreUtils.clone(item._aspect.vals);
            });
        };
        BaseList.prototype.getNewObjects = function () {
            return this._items.filter(function (item) {
                return item._aspect.isNew;
            });
        };
        BaseList.prototype.resetNewObjects = function () {
            this._items.forEach(function (item) {
                item._aspect._resetIsNew();
            });
        };
        BaseList.prototype.toString = function () {
            return "BaseList";
        };
        return BaseList;
    }(base_1.BaseCollection));
    exports.BaseList = BaseList;
});
define("jriapp_shared/collection/dictionary", ["require", "exports", "jriapp_shared/utils/utils", "jriapp_shared/lang", "jriapp_shared/collection/base", "jriapp_shared/collection/list"], function (require, exports, utils_9, lang_8, base_2, list_1) {
    "use strict";
    var utils = utils_9.Utils, strUtils = utils.str, checks = utils.check, sys = utils.sys;
    sys.getItemByProp = function (obj, prop) {
        if (obj instanceof BaseDictionary) {
            return obj.getItemByKey(prop);
        }
        else if (obj instanceof base_2.BaseCollection) {
            obj.getItemByPos(parseInt(prop, 10));
        }
        else
            return null;
    };
    var BaseDictionary = (function (_super) {
        __extends(BaseDictionary, _super);
        function BaseDictionary(itemType, keyName, props) {
            if (!keyName)
                throw new Error(strUtils.format(lang_8.ERRS.ERR_PARAM_INVALID, "keyName", keyName));
            _super.call(this, itemType, props);
            this._keyName = keyName;
            var keyFld = this.getFieldInfo(keyName);
            if (!keyFld)
                throw new Error(strUtils.format(lang_8.ERRS.ERR_DICTKEY_IS_NOTFOUND, keyName));
            keyFld.isPrimaryKey = 1;
        }
        BaseDictionary.prototype._getNewKey = function (item) {
            if (!item || item._aspect.isNew) {
                return _super.prototype._getNewKey.call(this, item);
            }
            var key = item[this._keyName];
            if (checks.isNt(key))
                throw new Error(strUtils.format(lang_8.ERRS.ERR_DICTKEY_IS_EMPTY, this.keyName));
            return "" + key;
        };
        BaseDictionary.prototype._onItemAdded = function (item) {
            _super.prototype._onItemAdded.call(this, item);
            var key = item[this._keyName], self = this;
            if (checks.isNt(key))
                throw new Error(strUtils.format(lang_8.ERRS.ERR_DICTKEY_IS_EMPTY, this.keyName));
            var oldkey = item._key, newkey = "" + key;
            if (oldkey !== newkey) {
                delete self._itemsByKey[oldkey];
                item._aspect.key = newkey;
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
            this.raisePropertyChanged("[" + item._key + "]");
        };
        BaseDictionary.prototype._onRemoved = function (item, pos) {
            var key = item[this._keyName];
            _super.prototype._onRemoved.call(this, item, pos);
            this.raisePropertyChanged("[" + key + "]");
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
    }(list_1.BaseList));
    exports.BaseDictionary = BaseDictionary;
});
define("jriapp_shared/utils/debounce", ["require", "exports", "jriapp_shared/utils/deferred"], function (require, exports, deferred_4) {
    "use strict";
    var Debounce = (function () {
        function Debounce(interval) {
            if (interval === void 0) { interval = 0; }
            this._timer = null;
            this._interval = !interval ? 0 : interval;
            this._fn = null;
        }
        Debounce.prototype.enqueue = function (fn) {
            var _this = this;
            if (this.IsDestroyed)
                return;
            if (!fn)
                throw new Error("Debounce: Invalid operation");
            this._fn = fn;
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
                    this._timer = deferred_4.getTaskQueue().enque(callback);
                }
                else {
                    this._timer = setTimeout(callback, this._interval);
                }
            }
        };
        Debounce.prototype.cancel = function () {
            this._fn = null;
        };
        Debounce.prototype.destroy = function () {
            if (!!this._timer) {
                if (!this._interval) {
                    deferred_4.getTaskQueue().cancel(this._timer);
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
        Object.defineProperty(Debounce.prototype, "IsDestroyed", {
            get: function () {
                return this._timer === void 0;
            },
            enumerable: true,
            configurable: true
        });
        return Debounce;
    }());
    exports.Debounce = Debounce;
});
define("jriapp_shared/utils/lazy", ["require", "exports", "jriapp_shared/utils/checks"], function (require, exports, checks_9) {
    "use strict";
    var checks = checks_9.Checks;
    var Lazy = (function () {
        function Lazy(factory) {
            this._val = null;
            this._factory = factory;
            if (!this._factory)
                throw new Error("Lazy: Invalid value factory");
        }
        Object.defineProperty(Lazy.prototype, "Value", {
            get: function () {
                if (this._val === null) {
                    this._val = this._factory();
                    if (checks.isNt(this._val))
                        throw new Error("Lazy: the value factory did'not returned an object");
                    this._factory = null;
                }
                return this._val;
            },
            enumerable: true,
            configurable: true
        });
        Lazy.prototype.destroy = function () {
            if (this.IsValueCreated) {
                if ("destroy" in this._val) {
                    this._val.destroy();
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
        Object.defineProperty(Lazy.prototype, "IsDestroyed", {
            get: function () {
                return this._val === void 0;
            },
            enumerable: true,
            configurable: true
        });
        return Lazy;
    }());
    exports.Lazy = Lazy;
});
define("jriapp_shared", ["require", "exports", "jriapp_shared/const", "jriapp_shared/int", "jriapp_shared/errors", "jriapp_shared/object", "jriapp_shared/lang", "jriapp_shared/collection/base", "jriapp_shared/collection/item", "jriapp_shared/collection/aspect", "jriapp_shared/collection/list", "jriapp_shared/collection/dictionary", "jriapp_shared/collection/validation", "jriapp_shared/utils/ideferred", "jriapp_shared/utils/utils", "jriapp_shared/utils/waitqueue", "jriapp_shared/utils/debounce", "jriapp_shared/utils/lazy"], function (require, exports, const_5, int_6, errors_5, object_5, lang_9, base_3, item_1, aspect_2, list_2, dictionary_1, validation_4, ideferred_1, utils_10, waitqueue_2, debounce_1, lazy_1) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    __export(const_5);
    __export(int_6);
    __export(errors_5);
    __export(object_5);
    exports.LocaleSTRS = lang_9.STRS;
    exports.LocaleERRS = lang_9.ERRS;
    exports.BaseCollection = base_3.BaseCollection;
    exports.CollectionItem = item_1.CollectionItem;
    exports.ItemAspect = aspect_2.ItemAspect;
    exports.ListItemAspect = list_2.ListItemAspect;
    exports.BaseList = list_2.BaseList;
    exports.BaseDictionary = dictionary_1.BaseDictionary;
    exports.ValidationError = validation_4.ValidationError;
    __export(ideferred_1);
    exports.Utils = utils_10.Utils;
    exports.WaitQueue = waitqueue_2.WaitQueue;
    exports.Debounce = debounce_1.Debounce;
    exports.Lazy = lazy_1.Lazy;
});
