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
define("jriapp/const", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SERVICES;
    (function (SERVICES) {
        SERVICES["TOOLTIP_SVC"] = "ITooltipService";
        SERVICES["DATEPICKER_SVC"] = "IDatepicker";
        SERVICES["UIERRORS_SVC"] = "IUIErrorsService";
    })(SERVICES = exports.SERVICES || (exports.SERVICES = {}));
    var BINDING_MODE;
    (function (BINDING_MODE) {
        BINDING_MODE[BINDING_MODE["OneTime"] = 0] = "OneTime";
        BINDING_MODE[BINDING_MODE["OneWay"] = 1] = "OneWay";
        BINDING_MODE[BINDING_MODE["TwoWay"] = 2] = "TwoWay";
        BINDING_MODE[BINDING_MODE["BackWay"] = 3] = "BackWay";
    })(BINDING_MODE = exports.BINDING_MODE || (exports.BINDING_MODE = {}));
    var STORE_KEY;
    (function (STORE_KEY) {
        STORE_KEY["SVC"] = "svc.";
        STORE_KEY["CONVERTER"] = "cnv.";
        STORE_KEY["OBJECT"] = "obj.";
        STORE_KEY["OPTION"] = "opt.";
    })(STORE_KEY = exports.STORE_KEY || (exports.STORE_KEY = {}));
    var DATA_ATTR;
    (function (DATA_ATTR) {
        DATA_ATTR["DATA_BIND"] = "data-bind";
        DATA_ATTR["DATA_VIEW"] = "data-view";
        DATA_ATTR["DATA_VIEW_OPTIONS"] = "data-view-options";
        DATA_ATTR["DATA_EVENT_SCOPE"] = "data-scope";
        DATA_ATTR["DATA_ITEM_KEY"] = "data-key";
        DATA_ATTR["DATA_CONTENT"] = "data-content";
        DATA_ATTR["DATA_COLUMN"] = "data-column";
        DATA_ATTR["DATA_NAME"] = "data-name";
        DATA_ATTR["DATA_REQUIRE"] = "data-require";
    })(DATA_ATTR = exports.DATA_ATTR || (exports.DATA_ATTR = {}));
    var KEYS;
    (function (KEYS) {
        KEYS[KEYS["backspace"] = 8] = "backspace";
        KEYS[KEYS["tab"] = 9] = "tab";
        KEYS[KEYS["enter"] = 13] = "enter";
        KEYS[KEYS["esc"] = 27] = "esc";
        KEYS[KEYS["space"] = 32] = "space";
        KEYS[KEYS["pageUp"] = 33] = "pageUp";
        KEYS[KEYS["pageDown"] = 34] = "pageDown";
        KEYS[KEYS["end"] = 35] = "end";
        KEYS[KEYS["home"] = 36] = "home";
        KEYS[KEYS["left"] = 37] = "left";
        KEYS[KEYS["up"] = 38] = "up";
        KEYS[KEYS["right"] = 39] = "right";
        KEYS[KEYS["down"] = 40] = "down";
        KEYS[KEYS["del"] = 127] = "del";
    })(KEYS = exports.KEYS || (exports.KEYS = {}));
    var ELVIEW_NM;
    (function (ELVIEW_NM) {
        ELVIEW_NM["DataForm"] = "dataform";
    })(ELVIEW_NM = exports.ELVIEW_NM || (exports.ELVIEW_NM = {}));
    var LOADER_GIF;
    (function (LOADER_GIF) {
        LOADER_GIF["Small"] = "loader2.gif";
        LOADER_GIF["Default"] = "loader.gif";
    })(LOADER_GIF = exports.LOADER_GIF || (exports.LOADER_GIF = {}));
    var BindScope;
    (function (BindScope) {
        BindScope[BindScope["Application"] = 0] = "Application";
        BindScope[BindScope["Template"] = 1] = "Template";
        BindScope[BindScope["DataForm"] = 2] = "DataForm";
    })(BindScope = exports.BindScope || (exports.BindScope = {}));
    var BindTo;
    (function (BindTo) {
        BindTo[BindTo["Source"] = 0] = "Source";
        BindTo[BindTo["Target"] = 1] = "Target";
    })(BindTo = exports.BindTo || (exports.BindTo = {}));
    var SubscribeFlags;
    (function (SubscribeFlags) {
        SubscribeFlags[SubscribeFlags["delegationOn"] = 0] = "delegationOn";
        SubscribeFlags[SubscribeFlags["click"] = 1] = "click";
        SubscribeFlags[SubscribeFlags["change"] = 2] = "change";
        SubscribeFlags[SubscribeFlags["keypress"] = 3] = "keypress";
        SubscribeFlags[SubscribeFlags["keydown"] = 4] = "keydown";
        SubscribeFlags[SubscribeFlags["keyup"] = 5] = "keyup";
    })(SubscribeFlags = exports.SubscribeFlags || (exports.SubscribeFlags = {}));
});
define("jriapp/int", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Config = window.jriapp_config || {};
    var ButtonCss = (function () {
        function ButtonCss() {
        }
        ButtonCss.Edit = "jriapp-actions jriapp-edit";
        ButtonCss.Delete = "jriapp-actions jriapp-delete";
        ButtonCss.OK = "jriapp-actions jriapp-ok";
        ButtonCss.Cancel = "jriapp-actions jriapp-cancel";
        return ButtonCss;
    }());
    exports.ButtonCss = ButtonCss;
});
define("jriapp/utils/parser", ["require", "exports", "jriapp_shared", "jriapp/bootstrap"], function (require, exports, jriapp_shared_1, bootstrap_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var _a = jriapp_shared_1.Utils.check, isNumeric = _a.isNumeric, isBoolString = _a.isBoolString, _b = jriapp_shared_1.Utils.str, format = _b.format, trim = _b.fastTrim, startsWith = _b.startsWith, endsWith = _b.endsWith, trimQuotes = _b.trimQuotes, parseBool = jriapp_shared_1.Utils.core.parseBool, _c = jriapp_shared_1.Utils.sys, resolvePath = _c.resolvePath, getBraceLen = _c.getBraceLen;
    var getRX = /^get[(].+[)]$/g, spaceRX = /^\s+$/;
    var TOKEN;
    (function (TOKEN) {
        TOKEN["DELIMETER1"] = ":";
        TOKEN["DELIMETER2"] = "=";
        TOKEN["COMMA"] = ",";
        TOKEN["THIS"] = "this.";
        TOKEN["PARAM"] = "param";
        TOKEN["TARGET_PATH"] = "targetPath";
        TOKEN["BIND"] = "bind";
        TOKEN["GET"] = "get";
        TOKEN["DATE"] = "date";
        TOKEN["INJECT"] = "inject";
    })(TOKEN || (TOKEN = {}));
    var TAG;
    (function (TAG) {
        TAG["NONE"] = "";
        TAG["LITERAL"] = "0";
        TAG["BIND"] = "1";
        TAG["GET"] = "2";
        TAG["DATE"] = "3";
        TAG["INJECT"] = "4";
        TAG["BRACE"] = "5";
        TAG["INDEXER"] = "6";
    })(TAG || (TAG = {}));
    var DATES;
    (function (DATES) {
        DATES["TODAY"] = "today";
        DATES["TOMORROW"] = "tomorrow";
        DATES["YESTERDAY"] = "yesterday";
        DATES["ENDOFMONTH"] = "endofmonth";
    })(DATES || (DATES = {}));
    var PARSE_TYPE;
    (function (PARSE_TYPE) {
        PARSE_TYPE[PARSE_TYPE["NONE"] = 0] = "NONE";
        PARSE_TYPE[PARSE_TYPE["BINDING"] = 1] = "BINDING";
        PARSE_TYPE[PARSE_TYPE["VIEW"] = 2] = "VIEW";
    })(PARSE_TYPE || (PARSE_TYPE = {}));
    var len_this = "this.".length;
    function getCurlyBraceParts(val) {
        var i, ch;
        var parts = [], len = val.length;
        for (i = 0; i < len; i += 1) {
            ch = val.charAt(i);
            switch (ch) {
                case "{":
                    var braceLen = getBraceLen(val, i, 1);
                    parts.push(trim(val.substr(i + 1, braceLen - 2)));
                    i += (braceLen - 1);
                    break;
                default:
                    if (!spaceRX.test(ch)) {
                        throw new Error(format(jriapp_shared_1.LocaleERRS.ERR_EXPR_BRACES_INVALID, val));
                    }
                    break;
            }
        }
        return parts;
    }
    function getBraceContent(val, brace) {
        var ch, start = 0;
        var len = val.length;
        var br1;
        switch (brace) {
            case 0:
                br1 = "(";
                break;
            case 1:
                br1 = "{";
                break;
            case 2:
                br1 = "[";
                break;
        }
        for (var i = 0; i < len; i += 1) {
            if (start < 0) {
                start = i;
            }
            ch = val.charAt(i);
            if (ch === br1) {
                var braceLen = getBraceLen(val, i, brace);
                return trim(val.substr(i + 1, braceLen - 2));
            }
        }
        throw new Error("Invalid Expression: " + val);
    }
    function setKeyVal(kv, start, end, val, isKey, isLit) {
        if (start > -1 && start < end) {
            var str = val.substring(start, end);
            var v = !isLit ? trim(str) : str;
            if (!v) {
                return;
            }
            if (isKey) {
                kv.key += v;
            }
            else {
                kv.val += v;
            }
        }
    }
    function checkVal(kv) {
        if (!kv.key) {
            return false;
        }
        if (!!kv.val) {
            if (kv.tag === "3") {
                var parts = getExprArgs(kv.val), format_1 = "YYYYMMDD";
                if (parts.length > 1) {
                    format_1 = parts[1];
                }
                if (parts.length > 0) {
                    switch (parts[0]) {
                        case "today":
                            kv.val = moment().startOf('day').toDate();
                            break;
                        case "tomorrow":
                            kv.val = moment().startOf('day').add(1, 'days').toDate();
                            break;
                        case "yesterday":
                            kv.val = moment().startOf('day').subtract(1, 'days').toDate();
                            break;
                        case "endofmonth":
                            kv.val = moment().startOf('month').add(1, 'months').subtract(1, 'days').toDate();
                            break;
                        default:
                            kv.val = moment(parts[0], format_1).toDate();
                            break;
                    }
                }
                else {
                    kv.val = moment().startOf('day').toDate();
                }
            }
            else if (!kv.tag) {
                if (isNumeric(kv.val)) {
                    kv.val = Number(kv.val);
                }
                else if (isBoolString(kv.val)) {
                    kv.val = parseBool(kv.val);
                }
            }
        }
        return true;
    }
    function getTag(val, start, end) {
        var token = trim(val.substring(start, end));
        var tag = "";
        switch (token) {
            case "bind":
                tag = "1";
                break;
            case "get":
                tag = "2";
                break;
            case "inject":
                tag = "4";
                break;
            case "date":
                tag = "3";
                break;
            default:
                throw new Error("Unknown token: \"" + token + "\" in expression " + val);
        }
        return tag;
    }
    function getKeyVals(val) {
        var i, ch, literal, parts = [], kv = { tag: null, key: "", val: "" }, isKey = true, start = -1;
        var len = val.length;
        for (i = 0; i < len; i += 1) {
            if (start < 0) {
                start = i;
            }
            ch = val.charAt(i);
            if (!literal) {
                switch (ch) {
                    case "'":
                    case '"':
                        setKeyVal(kv, start, i, val, isKey, false);
                        literal = ch;
                        start = i + 1;
                        if (!kv.tag) {
                            kv.tag = "0";
                        }
                        break;
                    case "(":
                        if (!isKey && start < i) {
                            var tag = getTag(val, start, i);
                            var braceLen_1 = getBraceLen(val, i, 0);
                            setKeyVal(kv, i + 1, i + braceLen_1 - 1, val, isKey, false);
                            kv.tag = tag;
                            i += (braceLen_1 - 1);
                            start = -1;
                        }
                        else {
                            throw new Error("Invalid: \"" + ch + "\" in expression " + val);
                        }
                        break;
                    case "[":
                        setKeyVal(kv, start, i, val, isKey, false);
                        var braceLen = getBraceLen(val, i, 2);
                        var str = trimQuotes(val.substring(i + 1, i + braceLen - 1));
                        if (!str) {
                            throw new Error("Invalid: \"" + ch + "\" in expression " + val);
                        }
                        if (isKey) {
                            kv.key += "[" + str + "]";
                        }
                        else {
                            kv.val += "[" + str + "]";
                            kv.tag = "6";
                        }
                        i += (braceLen - 1);
                        start = -1;
                        break;
                    case "{":
                        if (!isKey) {
                            var test = trim(val.substring(start, i));
                            if (!!test) {
                                throw new Error("Invalid word: \"" + test + "{\" in expression " + val);
                            }
                            var braceLen_2 = getBraceLen(val, i, 1);
                            kv.val = val.substring(i + 1, i + braceLen_2 - 1);
                            kv.tag = "5";
                            i += (braceLen_2 - 1);
                            start = -1;
                        }
                        else {
                            throw new Error("Invalid: \"" + ch + "\" in expression " + val);
                        }
                        break;
                    case ",":
                        setKeyVal(kv, start, i, val, isKey, false);
                        start = -1;
                        parts.push(kv);
                        kv = { tag: null, key: "", val: "" };
                        isKey = true;
                        break;
                    case ":":
                    case "=":
                        setKeyVal(kv, start, i, val, isKey, false);
                        start = -1;
                        isKey = false;
                        break;
                    case ")":
                    case "}":
                    case "]":
                        throw new Error("Invalid: \"" + ch + "\" in expression " + val);
                }
            }
            else {
                switch (ch) {
                    case "'":
                    case '"':
                        if (literal === ch) {
                            var i1 = i + 1, next = i1 < len ? val.charAt(i1) : null;
                            if (next === ch) {
                                setKeyVal(kv, start, i + 1, val, isKey, true);
                                i += 1;
                                start = -1;
                            }
                            else {
                                setKeyVal(kv, start, i, val, isKey, true);
                                literal = null;
                                start = -1;
                            }
                        }
                        break;
                }
            }
        }
        setKeyVal(kv, start, i, val, isKey, false);
        parts.push(kv);
        parts = parts.filter(function (kv) {
            return checkVal(kv);
        });
        return parts;
    }
    function getExprArgs(expr) {
        var parts = expr.split(",");
        if (parts.length > 2) {
            throw new Error("Invalid Expression: " + expr);
        }
        return parts.map(function (p) { return trim(p); });
    }
    function inject(id, app) {
        return !app ? bootstrap_1.bootstrap.getSvc(id) : app.getSvc(id);
    }
    function getOptions(id) {
        return bootstrap_1.bootstrap.getOptions(id);
    }
    function parseById(parse_type, id, app, dataContext) {
        var options = getOptions(id);
        return parseOption(parse_type, options, app, dataContext);
    }
    function isGetExpr(val) {
        return !!val && getRX.test(val);
    }
    function parseOption(parse_type, part, app, dataContext) {
        var res = parse_type === 1 ? {
            targetPath: "",
            sourcePath: "",
            to: "",
            target: null,
            source: null,
            mode: "OneWay",
            converter: null,
            param: null,
            isBind: false
        } : {};
        part = trim(part);
        if (isGetExpr(part)) {
            var id = getBraceContent(part, 0);
            return parseById(parse_type, trim(id), app, dataContext);
        }
        var kvals = getKeyVals(part);
        kvals.forEach(function (kv) {
            var isBind = false, bindparts;
            if (parse_type === 1 && !kv.val && startsWith(kv.key, "this.")) {
                kv.val = kv.key.substr(len_this);
                kv.key = "targetPath";
            }
            var checkIsBind = parse_type === 2 || parse_type === 1;
            if (checkIsBind && kv.tag === "1") {
                bindparts = getExprArgs(kv.val);
                isBind = bindparts.length > 0;
            }
            if (isBind) {
                switch (parse_type) {
                    case 2:
                        var source = dataContext || app;
                        if (bindparts.length > 1) {
                            source = resolvePath(app, bindparts[1]);
                        }
                        res[kv.key] = resolvePath(source, bindparts[0]);
                        break;
                    case 1:
                        if (bindparts.length > 0 && kv.key === "param") {
                            res[kv.key] = bindparts;
                            res.isBind = true;
                        }
                        break;
                    default:
                        res[kv.key] = kv.val;
                        break;
                }
            }
            else {
                switch (kv.tag) {
                    case "5":
                        res[kv.key] = parseOption(parse_type, kv.val, app, dataContext);
                        break;
                    case "2":
                        res[kv.key] = parseById(0, kv.val, app, dataContext);
                        break;
                    case "4":
                        res[kv.key] = inject(kv.val, app);
                        break;
                    default:
                        res[kv.key] = kv.val;
                        break;
                }
            }
        });
        return res;
    }
    function parseOptions(parse_type, strs, app, dataContext) {
        var res = [];
        var parts = [];
        for (var i = 0; i < strs.length; i += 1) {
            var str = trim(strs[i]);
            if (isGetExpr(str)) {
                var id = getBraceContent(str, 0);
                str = trim(getOptions(trim(id)));
            }
            if (startsWith(str, "{") && endsWith(str, "}")) {
                var subparts = getCurlyBraceParts(str);
                for (var k = 0; k < subparts.length; k += 1) {
                    parts.push(subparts[k]);
                }
            }
            else {
                parts.push(str);
            }
        }
        for (var j = 0; j < parts.length; j += 1) {
            res.push(parseOption(parse_type, parts[j], app, dataContext));
        }
        return res;
    }
    var Parser = (function () {
        function Parser() {
        }
        Parser.parseOptions = function (options) {
            return parseOptions(0, [options], null, null);
        };
        Parser.parseBindings = function (bindings) {
            return parseOptions(1, bindings, null, null);
        };
        Parser.parseViewOptions = function (options, app, dataContext) {
            var res = parseOptions(2, [options], app, dataContext);
            return (!!res && res.length > 0) ? res[0] : {};
        };
        return Parser;
    }());
    exports.Parser = Parser;
});
define("jriapp/elview", ["require", "exports", "jriapp_shared", "jriapp/bootstrap", "jriapp/utils/parser"], function (require, exports, jriapp_shared_2, bootstrap_2, parser_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_2.Utils, parser = parser_1.Parser, ERRS = jriapp_shared_2.LocaleERRS;
    function createElViewFactory(register) {
        return new ElViewFactory(register);
    }
    exports.createElViewFactory = createElViewFactory;
    function createElViewRegister(next) {
        return new ElViewRegister(next);
    }
    exports.createElViewRegister = createElViewRegister;
    var ElViewRegister = (function () {
        function ElViewRegister(next) {
            this._exports = {};
            this._next = next;
        }
        ElViewRegister.prototype.dispose = function () {
            this._exports = {};
        };
        ElViewRegister.prototype.registerElView = function (name, vwType) {
            if (!bootstrap_2.bootstrap._getInternal().getObject(this, name)) {
                bootstrap_2.bootstrap._getInternal().registerObject(this, name, vwType);
            }
            else {
                throw new Error(utils.str.format(ERRS.ERR_OBJ_ALREADY_REGISTERED, name));
            }
        };
        ElViewRegister.prototype.getElViewType = function (name) {
            var res = bootstrap_2.bootstrap._getInternal().getObject(this, name);
            if (!res && !!this._next) {
                res = this._next.getElViewType(name);
            }
            return res;
        };
        ElViewRegister.prototype.getExports = function () {
            return this._exports;
        };
        return ElViewRegister;
    }());
    var ElViewStore = (function () {
        function ElViewStore() {
            this._weakmap = jriapp_shared_2.createWeakMap();
        }
        ElViewStore.prototype.dispose = function () {
        };
        ElViewStore.prototype.getElView = function (el) {
            return this._weakmap.get(el);
        };
        ElViewStore.prototype.setElView = function (el, view) {
            if (!view) {
                this._weakmap.delete(el);
            }
            else {
                this._weakmap.set(el, view);
            }
        };
        return ElViewStore;
    }());
    var ElViewFactory = (function (_super) {
        __extends(ElViewFactory, _super);
        function ElViewFactory(register) {
            var _this = _super.call(this) || this;
            _this._store = new ElViewStore();
            _this._register = createElViewRegister(register);
            return _this;
        }
        ElViewFactory.prototype.dispose = function () {
            if (!this._store) {
                return;
            }
            this._store.dispose();
            this._register.dispose();
            this._store = null;
            this._register = null;
            _super.prototype.dispose.call(this);
        };
        ElViewFactory.prototype.createElView = function (viewInfo) {
            var viewType, elView;
            var el = viewInfo.el, options = viewInfo.options, name = viewInfo.name;
            if (!!name) {
                viewType = this._register.getElViewType(name);
                if (!viewType) {
                    throw new Error(utils.str.format(ERRS.ERR_ELVIEW_NOT_REGISTERED, name));
                }
            }
            if (!viewType) {
                var nodeNm = el.nodeName.toLowerCase(), attrType = void 0;
                switch (nodeNm) {
                    case "input":
                        {
                            attrType = el.getAttribute("type");
                            nodeNm = nodeNm + ":" + attrType;
                            viewType = this._register.getElViewType(nodeNm);
                        }
                        break;
                    default:
                        viewType = this._register.getElViewType(nodeNm);
                        break;
                }
                if (!viewType) {
                    throw new Error(utils.str.format(ERRS.ERR_ELVIEW_NOT_CREATED, nodeNm));
                }
            }
            try {
                elView = new viewType(el, options || {});
            }
            catch (e) {
                this._store.setElView(el, null);
                throw e;
            }
            return elView;
        };
        ElViewFactory.prototype.getElView = function (el) {
            return this.store.getElView(el);
        };
        ElViewFactory.prototype.getOrCreateElView = function (el, dataContext) {
            if (dataContext === void 0) { dataContext = null; }
            var elView = this.store.getElView(el);
            if (!!elView) {
                return elView;
            }
            var info = this.getElementViewInfo(el, dataContext);
            return this.createElView(info);
        };
        ElViewFactory.prototype.getElementViewInfo = function (el, dataContext) {
            if (dataContext === void 0) { dataContext = null; }
            var viewName = null;
            if (el.hasAttribute("data-view")) {
                var attr = el.getAttribute("data-view");
                if (!!attr && attr !== "default") {
                    viewName = attr;
                }
            }
            var options;
            if (el.hasAttribute("data-view-options")) {
                var attr = el.getAttribute("data-view-options");
                options = parser.parseViewOptions(attr, bootstrap_2.bootstrap.getApp(), dataContext);
            }
            else {
                options = {};
            }
            return { el: el, name: viewName, options: options };
        };
        Object.defineProperty(ElViewFactory.prototype, "store", {
            get: function () {
                return this._store;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ElViewFactory.prototype, "register", {
            get: function () {
                return this._register;
            },
            enumerable: true,
            configurable: true
        });
        return ElViewFactory;
    }(jriapp_shared_2.BaseObject));
});
define("jriapp/content", ["require", "exports", "jriapp_shared"], function (require, exports, jriapp_shared_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ERRS = jriapp_shared_3.LocaleERRS;
    function createContentFactoryList() {
        return new FactoryList();
    }
    exports.createContentFactoryList = createContentFactoryList;
    var LastFactory = (function () {
        function LastFactory() {
        }
        LastFactory.prototype.getContentType = function (options) {
            throw new Error(ERRS.ERR_BINDING_CONTENT_NOT_FOUND);
        };
        LastFactory.prototype.isExternallyCachable = function (contentType) {
            return false;
        };
        return LastFactory;
    }());
    var FactoryList = (function () {
        function FactoryList() {
            this._factory = new LastFactory();
        }
        FactoryList.prototype.addFactory = function (factoryGetter) {
            this._factory = factoryGetter(this._factory);
        };
        FactoryList.prototype.getContentType = function (options) {
            return this._factory.getContentType(options);
        };
        FactoryList.prototype.isExternallyCachable = function (contentType) {
            return this._factory.isExternallyCachable(contentType);
        };
        return FactoryList;
    }());
});
define("jriapp/defaults", ["require", "exports", "jriapp_shared", "jriapp/int"], function (require, exports, jriapp_shared_4, int_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_4.Utils, endsWith = utils.str.endsWith;
    var Defaults = (function (_super) {
        __extends(Defaults, _super);
        function Defaults() {
            var _this = _super.call(this) || this;
            _this._dateFormat = "DD.MM.YYYY";
            _this._dateTimeFormat = "DD.MM.YYYY HH:mm:ss";
            _this._timeFormat = "HH:mm:ss";
            _this._imagesPath = "";
            _this._decimalPoint = ",";
            _this._thousandSep = " ";
            _this._decPrecision = 2;
            return _this;
        }
        Defaults.prototype.toString = function () {
            return "Defaults";
        };
        Object.defineProperty(Defaults.prototype, "dateFormat", {
            get: function () {
                return this._dateFormat;
            },
            set: function (v) {
                if (this._dateFormat !== v) {
                    this._dateFormat = v;
                    this.objEvents.raiseProp("dateFormat");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Defaults.prototype, "timeFormat", {
            get: function () {
                return this._timeFormat;
            },
            set: function (v) {
                if (this._timeFormat !== v) {
                    this._timeFormat = v;
                    this.objEvents.raiseProp("timeFormat");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Defaults.prototype, "dateTimeFormat", {
            get: function () {
                return this._dateTimeFormat;
            },
            set: function (v) {
                if (this._dateTimeFormat !== v) {
                    this._dateTimeFormat = v;
                    this.objEvents.raiseProp("dateTimeFormat");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Defaults.prototype, "imagesPath", {
            get: function () {
                return this._imagesPath;
            },
            set: function (v) {
                if (!v) {
                    v = "";
                }
                if (this._imagesPath !== v) {
                    if (!endsWith(v, "/")) {
                        this._imagesPath = v + "/";
                    }
                    else {
                        this._imagesPath = v;
                    }
                    this.objEvents.raiseProp("imagesPath");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Defaults.prototype, "decimalPoint", {
            get: function () {
                return this._decimalPoint;
            },
            set: function (v) {
                if (this._decimalPoint !== v) {
                    this._decimalPoint = v;
                    this.objEvents.raiseProp("decimalPoint");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Defaults.prototype, "thousandSep", {
            get: function () {
                return this._thousandSep;
            },
            set: function (v) {
                if (this._thousandSep !== v) {
                    this._thousandSep = v;
                    this.objEvents.raiseProp("thousandSep");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Defaults.prototype, "decPrecision", {
            get: function () {
                return this._decPrecision;
            },
            set: function (v) {
                if (this._decPrecision !== v) {
                    this._decPrecision = v;
                    this.objEvents.raiseProp("decPrecision");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Defaults.prototype, "ButtonsCSS", {
            get: function () {
                return int_1.ButtonCss;
            },
            enumerable: true,
            configurable: true
        });
        return Defaults;
    }(jriapp_shared_4.BaseObject));
    exports.Defaults = Defaults;
});
define("jriapp/utils/tloader", ["require", "exports", "jriapp_shared"], function (require, exports, jriapp_shared_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_5.Utils, isFunc = utils.check.isFunc, _a = utils.core, getValue = _a.getValue, setValue = _a.setValue, removeValue = _a.removeValue, extend = _a.extend, format = utils.str.format, createDeferred = utils.defer.createDeferred, ERRS = jriapp_shared_5.LocaleERRS, DEBUG = utils.debug, LOG = utils.log, http = utils.http;
    var LOADER_EVENTS;
    (function (LOADER_EVENTS) {
        LOADER_EVENTS["loaded"] = "loaded";
    })(LOADER_EVENTS || (LOADER_EVENTS = {}));
    var TemplateLoader = (function (_super) {
        __extends(TemplateLoader, _super);
        function TemplateLoader() {
            var _this = _super.call(this) || this;
            var self = _this;
            _this._templateLoaders = {};
            _this._templateGroups = {};
            _this._promises = [];
            _this._waitQueue = new jriapp_shared_5.WaitQueue(self);
            return _this;
        }
        TemplateLoader.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            var self = this;
            self._promises = [];
            self._templateLoaders = {};
            self._templateGroups = {};
            if (!!self._waitQueue) {
                self._waitQueue.dispose();
                self._waitQueue = null;
            }
            _super.prototype.dispose.call(this);
        };
        TemplateLoader.prototype.addOnLoaded = function (fn, nmspace) {
            this.objEvents.on("loaded", fn, nmspace);
        };
        TemplateLoader.prototype.offOnLoaded = function (nmspace) {
            this.objEvents.off("loaded", nmspace);
        };
        TemplateLoader.prototype.waitForNotLoading = function (callback, callbackArgs) {
            this._waitQueue.enQueue({
                prop: "isLoading",
                groupName: null,
                predicate: function (val) { return !val; },
                action: callback,
                actionArgs: callbackArgs
            });
        };
        TemplateLoader.prototype._onLoaded = function (html, app) {
            this.objEvents.raise("loaded", { html: html, app: app });
        };
        TemplateLoader.prototype._getTemplateGroup = function (name) {
            return getValue(this._templateGroups, name);
        };
        TemplateLoader.prototype._registerTemplateLoaderCore = function (name, loader) {
            setValue(this._templateLoaders, name, loader, false);
        };
        TemplateLoader.prototype._getTemplateLoaderCore = function (name) {
            return getValue(this._templateLoaders, name);
        };
        TemplateLoader.prototype.loadTemplatesAsync = function (fnLoader, app) {
            var self = this, promise = fnLoader(), old = self.isLoading;
            self._promises.push(promise);
            if (self.isLoading !== old) {
                self.objEvents.raiseProp("isLoading");
            }
            var res = promise.then(function (html) {
                self._onLoaded(html, app);
            });
            res.always(function () {
                utils.arr.remove(self._promises, promise);
                if (!self.isLoading) {
                    self.objEvents.raiseProp("isLoading");
                }
            });
            return res;
        };
        TemplateLoader.prototype.unRegisterTemplateLoader = function (name) {
            removeValue(this._templateLoaders, name);
        };
        TemplateLoader.prototype.unRegisterTemplateGroup = function (name) {
            removeValue(this._templateGroups, name);
        };
        TemplateLoader.prototype.registerTemplateLoader = function (name, loader) {
            var self = this;
            loader = extend({
                fn_loader: null,
                groupName: null
            }, loader);
            if (!loader.groupName && !isFunc(loader.fn_loader)) {
                throw new Error(format(ERRS.ERR_ASSERTION_FAILED, "fn_loader is Function"));
            }
            var prevLoader = self._getTemplateLoaderCore(name);
            if (!!prevLoader) {
                if ((!prevLoader.fn_loader && !!prevLoader.groupName) && (!loader.groupName && !!loader.fn_loader)) {
                    return self._registerTemplateLoaderCore(name, loader);
                }
                throw new Error(format(ERRS.ERR_TEMPLATE_ALREADY_REGISTERED, name));
            }
            return self._registerTemplateLoaderCore(name, loader);
        };
        TemplateLoader.prototype.getTemplateLoader = function (name) {
            var self = this, loader = self._getTemplateLoaderCore(name);
            if (!loader) {
                return null;
            }
            if (!loader.fn_loader && !!loader.groupName) {
                var group_1 = self._getTemplateGroup(loader.groupName);
                if (!group_1) {
                    throw new Error(format(ERRS.ERR_TEMPLATE_GROUP_NOTREGISTERED, loader.groupName));
                }
                return function () {
                    if (!group_1.promise) {
                        group_1.promise = self.loadTemplatesAsync(group_1.fn_loader, group_1.app);
                    }
                    var deferred = createDeferred(true);
                    group_1.promise.then(function () {
                        group_1.promise = null;
                        group_1.names.forEach(function (name) {
                            if (!!group_1.app) {
                                name = group_1.app.appName + "." + name;
                            }
                            var loader = self._getTemplateLoaderCore(name);
                            if (!loader || !loader.fn_loader) {
                                var error = format(ERRS.ERR_TEMPLATE_NOTREGISTERED, name);
                                if (DEBUG.isDebugging()) {
                                    LOG.error(error);
                                }
                                throw new Error(error);
                            }
                        });
                        var loader = self._getTemplateLoaderCore(name);
                        if (!loader || !loader.fn_loader) {
                            var error = format(ERRS.ERR_TEMPLATE_NOTREGISTERED, name);
                            if (DEBUG.isDebugging()) {
                                LOG.error(error);
                            }
                            throw new Error(error);
                        }
                        delete self._templateGroups[loader.groupName];
                        var promise = loader.fn_loader();
                        promise.then(function (html) {
                            deferred.resolve(html);
                        }, function (err) {
                            deferred.reject(err);
                        });
                    }).catch(function (err) {
                        group_1.promise = null;
                        deferred.reject(err);
                    });
                    return deferred.promise();
                };
            }
            else {
                return loader.fn_loader;
            }
        };
        TemplateLoader.prototype.registerTemplateGroup = function (groupName, group) {
            var self = this, group2 = extend({
                fn_loader: null,
                url: null,
                names: null,
                promise: null,
                app: null
            }, group);
            if (!!group2.url && !group2.fn_loader) {
                group2.fn_loader = function () {
                    return http.getAjax(group2.url);
                };
            }
            setValue(self._templateGroups, groupName, group2, true);
            group2.names.forEach(function (name) {
                if (!!group2.app) {
                    name = group2.app.appName + "." + name;
                }
                self.registerTemplateLoader(name, {
                    groupName: groupName,
                    fn_loader: null
                });
            });
        };
        TemplateLoader.prototype.loadTemplates = function (url) {
            return this.loadTemplatesAsync(function () { return http.getAjax(url); }, null);
        };
        Object.defineProperty(TemplateLoader.prototype, "isLoading", {
            get: function () {
                return this._promises.length > 0;
            },
            enumerable: true,
            configurable: true
        });
        return TemplateLoader;
    }(jriapp_shared_5.BaseObject));
    exports.TemplateLoader = TemplateLoader;
});
define("jriapp/utils/domevents", ["require", "exports", "jriapp_shared"], function (require, exports, jriapp_shared_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_6.Utils, _a = utils.check, isFunc = _a.isFunc, isString = _a.isString, isNt = _a.isNt, arrHelper = utils.arr, format = utils.str.format, debug = utils.debug, ERRS = jriapp_shared_6.LocaleERRS;
    var EventWrap = (function () {
        function EventWrap(ev, target) {
            this._ev = ev;
            this._target = target;
            this._cancelBubble = false;
        }
        Object.defineProperty(EventWrap.prototype, "type", {
            get: function () {
                return this._ev.type;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventWrap.prototype, "target", {
            get: function () {
                return this._target;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventWrap.prototype, "bubbles", {
            get: function () {
                return this._ev.bubbles;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventWrap.prototype, "defaultPrevented", {
            get: function () {
                return this._ev.defaultPrevented;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventWrap.prototype, "cancelable", {
            get: function () {
                return this._ev.cancelable;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventWrap.prototype, "isTrusted", {
            get: function () {
                return this._ev.isTrusted;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventWrap.prototype, "returnValue", {
            get: function () {
                return this._ev.returnValue;
            },
            set: function (v) {
                this._ev.returnValue = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventWrap.prototype, "srcElement", {
            get: function () {
                return this._ev.srcElement;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventWrap.prototype, "eventPhase", {
            get: function () {
                return this._ev.eventPhase;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventWrap.prototype, "cancelBubble", {
            get: function () {
                return this._cancelBubble;
            },
            set: function (v) {
                if (!!v) {
                    this._cancelBubble = v;
                    this._ev.stopPropagation();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventWrap.prototype, "timeStamp", {
            get: function () {
                return this._ev.timeStamp;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventWrap.prototype, "currentTarget", {
            get: function () {
                return this._ev.currentTarget;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventWrap.prototype, "originalEvent", {
            get: function () {
                return this._ev;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventWrap.prototype, "AT_TARGET", {
            get: function () {
                return this._ev.AT_TARGET;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventWrap.prototype, "BUBBLING_PHASE", {
            get: function () {
                return this._ev.BUBBLING_PHASE;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EventWrap.prototype, "CAPTURING_PHASE", {
            get: function () {
                return this._ev.CAPTURING_PHASE;
            },
            enumerable: true,
            configurable: true
        });
        EventWrap.prototype.preventDefault = function () {
            this._ev.preventDefault();
        };
        EventWrap.prototype.stopPropagation = function () {
            this._ev.stopPropagation();
            this._cancelBubble = true;
        };
        EventWrap.prototype.stopImmediatePropagation = function () {
            this._ev.stopImmediatePropagation();
        };
        return EventWrap;
    }());
    exports.EventWrap = EventWrap;
    var EventHelper = (function () {
        function EventHelper() {
        }
        EventHelper.Node = function (handler, name, useCapture) {
            return { fn: handler, name: name, useCapture: useCapture };
        };
        EventHelper.add = function (ev, name, handler, nmspace, useCapture) {
            if (!ev) {
                debug.checkStartDebugger();
                throw new Error(format(ERRS.ERR_ASSERTION_FAILED, "ev is a valid object"));
            }
            if (!isFunc(handler)) {
                throw new Error(ERRS.ERR_EVENT_INVALID_FUNC);
            }
            if (!name) {
                throw new Error(format(ERRS.ERR_EVENT_INVALID, "[Empty]"));
            }
            var ns = !nmspace ? "*" : "" + nmspace;
            var list = ev[ns];
            var node = EventHelper.Node(handler, name, useCapture);
            if (!list) {
                ev[ns] = list = [];
            }
            list.push(node);
        };
        EventHelper.getNS = function (ev, ns) {
            if (!ev) {
                return [];
            }
            var res = [], list = ev[ns];
            if (!list) {
                return res;
            }
            for (var k = 0; k < list.length; ++k) {
                res.push(list[k]);
            }
            return res;
        };
        EventHelper.removeNS = function (ev, name, ns) {
            if (!ev) {
                return [];
            }
            var res = [], list = ev[ns];
            if (!list) {
                return res;
            }
            if (!name) {
                delete ev[ns];
                return list;
            }
            var newArr = [];
            for (var k = 0; k < list.length; ++k) {
                if (list[k].name === name) {
                    res.push(list[k]);
                }
                else {
                    newArr.push(list[k]);
                }
            }
            if (newArr.length > 0) {
                ev[ns] = newArr;
            }
            else {
                delete ev[ns];
            }
            return res;
        };
        EventHelper.remove = function (ev, name, nmspace) {
            if (!ev) {
                return [];
            }
            var ns = !nmspace ? "*" : "" + nmspace, arr = [];
            if (ns === "*") {
                var nsKeys = Object.keys(ev);
                for (var i = 0; i < nsKeys.length; ++i) {
                    arr.push(EventHelper.removeNS(ev, name, nsKeys[i]));
                }
                return arrHelper.merge(arr);
            }
            else {
                return EventHelper.removeNS(ev, name, ns);
            }
        };
        EventHelper.toArray = function (ev) {
            if (!ev) {
                return [];
            }
            var nsKeys = Object.keys(ev), arr = [];
            for (var i = 0; i < nsKeys.length; ++i) {
                arr.push(EventHelper.getNS(ev, nsKeys[i]));
            }
            return arrHelper.merge(arr);
        };
        EventHelper.getDelegateListener = function (root, isMatch, listener) {
            var res = function (event) {
                var target = event.target;
                while (!!target && target !== root) {
                    if (isMatch(target)) {
                        var eventWrap = new EventWrap(event, target);
                        listener.apply(target, [eventWrap]);
                        if (eventWrap.cancelBubble) {
                            return;
                        }
                    }
                    target = target.parentElement;
                }
            };
            return res;
        };
        return EventHelper;
    }());
    var helper = EventHelper;
    var weakmap = jriapp_shared_6.createWeakMap();
    function isDelegateArgs(a) {
        return (!a) ? false : isFunc(a.matchElement);
    }
    var DomEvents = (function () {
        function DomEvents() {
        }
        DomEvents.on = function (el, evType, listener, args) {
            var events = weakmap.get(el), ns, useCapture = false;
            if (!events) {
                events = {};
                weakmap.set(el, events);
            }
            if (!!args) {
                if (isString(args)) {
                    ns = args;
                }
                else if (isDelegateArgs(args)) {
                    ns = args.nmspace;
                    listener = helper.getDelegateListener(el, args.matchElement, listener);
                }
                else {
                    ns = args.nmspace;
                    useCapture = !!args.useCapture;
                }
            }
            helper.add(events, evType, listener, ns, useCapture);
            el.addEventListener(evType, listener, useCapture);
        };
        DomEvents.off = function (el, evType, nmspace, useCapture) {
            var ev = weakmap.get(el);
            if (!ev) {
                return;
            }
            var handlers = helper.remove(ev, evType, nmspace);
            for (var i = 0; i < handlers.length; i += 1) {
                var handler = handlers[i];
                if (isNt(useCapture) || (useCapture === handler.useCapture)) {
                    el.removeEventListener(handler.name, handler.fn, handler.useCapture);
                }
            }
        };
        DomEvents.offNS = function (el, nmspace) {
            DomEvents.off(el, null, nmspace);
        };
        return DomEvents;
    }());
    exports.DomEvents = DomEvents;
});
define("jriapp/utils/dom", ["require", "exports", "jriapp_shared", "jriapp/utils/domevents"], function (require, exports, jriapp_shared_7, domevents_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var arrHelper = jriapp_shared_7.Utils.arr, fastTrim = jriapp_shared_7.Utils.str.fastTrim, win = window, doc = win.document, queue = jriapp_shared_7.Utils.queue, hasClassList = ("classList" in window.document.documentElement), weakmap = jriapp_shared_7.createWeakMap();
    var _checkDOMReady = (function () {
        var funcs = [], hack = doc.documentElement.doScroll, domContentLoaded = "DOMContentLoaded";
        var isDOMloaded = (hack ? /^loaded|^c/ : /^loaded|^i|^c/).test(doc.readyState);
        if (!isDOMloaded) {
            var callback_1 = function () {
                doc.removeEventListener(domContentLoaded, callback_1);
                isDOMloaded = true;
                var fnOnloaded = null;
                while (fnOnloaded = funcs.shift()) {
                    queue.enque(fnOnloaded);
                }
            };
            doc.addEventListener(domContentLoaded, callback_1);
        }
        return function (fn) {
            isDOMloaded ? queue.enque(fn) : funcs.push(fn);
        };
    })();
    var DomUtils = (function () {
        function DomUtils() {
        }
        DomUtils.getData = function (el, key) {
            var map = weakmap.get(el);
            if (!map) {
                return (void 0);
            }
            return map[key];
        };
        DomUtils.setData = function (el, key, val) {
            var map = weakmap.get(el);
            if (!map) {
                map = {};
                weakmap.set(el, map);
            }
            map[key] = val;
        };
        DomUtils.removeData = function (el, key) {
            var map = weakmap.get(el);
            if (!map) {
                return;
            }
            if (!key) {
                weakmap.delete(el);
            }
            else {
                delete map[key];
            }
        };
        DomUtils.isContained = function (oNode, oCont) {
            if (!oNode) {
                return false;
            }
            while (!!(oNode = oNode.parentNode)) {
                if (oNode === oCont) {
                    return true;
                }
            }
            return false;
        };
        DomUtils.fromHTML = function (html) {
            var div = doc.createElement("div");
            div.innerHTML = html;
            return arrHelper.fromList(div.children);
        };
        DomUtils.queryAll = function (root, selector) {
            var res = root.querySelectorAll(selector);
            return arrHelper.fromList(res);
        };
        DomUtils.queryOne = function (root, selector) {
            return root.querySelector(selector);
        };
        DomUtils.append = function (parent, children) {
            if (!children) {
                return;
            }
            children.forEach(function (node) {
                parent.appendChild(node);
            });
        };
        DomUtils.prepend = function (parent, child) {
            if (!child) {
                return;
            }
            var firstChild = null;
            if (!(firstChild = parent.firstChild)) {
                parent.appendChild(child);
            }
            else {
                parent.insertBefore(child, firstChild);
            }
        };
        DomUtils.removeNode = function (node) {
            if (!node) {
                return;
            }
            var pnd = node.parentNode;
            if (!!pnd) {
                pnd.removeChild(node);
            }
        };
        DomUtils.insertAfter = function (node, refNode) {
            var parent = refNode.parentNode;
            if (parent.lastChild === refNode) {
                parent.appendChild(node);
            }
            else {
                parent.insertBefore(node, refNode.nextSibling);
            }
        };
        DomUtils.insertBefore = function (node, refNode) {
            var parent = refNode.parentNode;
            return parent.insertBefore(node, refNode);
        };
        DomUtils.wrap = function (elem, wrapper) {
            var parent = elem.parentElement, nsibling = elem.nextSibling;
            if (!parent) {
                return;
            }
            wrapper.appendChild(elem);
            (!nsibling) ? parent.appendChild(wrapper) : parent.insertBefore(wrapper, nsibling);
        };
        DomUtils.unwrap = function (elem) {
            var wrapper = elem.parentElement;
            if (!wrapper) {
                return;
            }
            var parent = wrapper.parentElement, nsibling = wrapper.nextSibling;
            if (!parent) {
                return;
            }
            parent.removeChild(wrapper);
            (!nsibling) ? parent.appendChild(elem) : parent.insertBefore(elem, nsibling);
        };
        DomUtils.getClassMap = function (el) {
            var res = {};
            if (!el) {
                return res;
            }
            var className = el.className;
            if (!className) {
                return res;
            }
            var arr = className.split(" ");
            for (var i = 0; i < arr.length; i += 1) {
                arr[i] = fastTrim(arr[i]);
                if (!!arr[i]) {
                    res[arr[i]] = i;
                }
            }
            return res;
        };
        DomUtils.setClasses = function (elems, classes) {
            if (!elems.length || !classes.length) {
                return;
            }
            var toAdd = [];
            var toRemove = [], removeAll = false;
            classes.forEach(function (v) {
                if (!v) {
                    return;
                }
                var name = fastTrim(v);
                if (!name) {
                    return;
                }
                var op = v.charAt(0);
                if (op == "+" || op == "-") {
                    name = fastTrim(v.substr(1));
                }
                if (!name) {
                    return;
                }
                var arr = name.split(" ");
                for (var i = 0; i < arr.length; i += 1) {
                    var v2 = fastTrim(arr[i]);
                    if (!!v2) {
                        if (op != "-") {
                            toAdd.push(v2);
                        }
                        else {
                            if (name === "*") {
                                removeAll = true;
                            }
                            else {
                                toRemove.push(v2);
                            }
                        }
                    }
                }
            });
            if (removeAll) {
                toRemove = [];
            }
            for (var j = 0; j < elems.length; j += 1) {
                var el = elems[j];
                var map = DomUtils.getClassMap(el);
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
            if (!elems.length) {
                return;
            }
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
                _arr[i] = fastTrim(_arr[i]);
            }
            var arr = _arr.filter(function (val) { return !!val; });
            if (hasClassList && arr.length === 1) {
                for (var j = 0; j < elems.length; j += 1) {
                    var el = elems[j];
                    if (remove) {
                        el.classList.remove(arr[0]);
                    }
                    else {
                        el.classList.add(arr[0]);
                    }
                }
            }
            else {
                for (var j = 0; j < elems.length; j += 1) {
                    var el = elems[j], map = DomUtils.getClassMap(el);
                    for (var i = 0; i < arr.length; i += 1) {
                        if (remove) {
                            delete map[arr[i]];
                        }
                        else {
                            map[arr[i]] = i + 1000;
                        }
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
        DomUtils.window = win;
        DomUtils.document = doc;
        DomUtils.ready = _checkDOMReady;
        DomUtils.events = domevents_1.DomEvents;
        return DomUtils;
    }());
    exports.DomUtils = DomUtils;
});
define("jriapp/utils/path", ["require", "exports", "jriapp_shared", "jriapp/utils/dom", "jriapp/int"], function (require, exports, jriapp_shared_8, dom_1, int_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_8.Utils, doc = dom_1.DomUtils.document, arrHelper = utils.arr, _a = utils.str, format = _a.format, ltrim = _a.ltrim, rtrim = _a.rtrim;
    exports.frameworkJS = int_2.Config.frameworkJS || "jriapp.js";
    var stylesDir = "css", imageDir = "img";
    function fn_getFrameworkPath() {
        var name = exports.frameworkJS;
        var arr = arrHelper.fromList(doc.scripts);
        for (var i = 0; i < arr.length; i += 1) {
            var script = arr[i];
            if (!!script.src) {
                var parts = PathHelper.getUrlParts(script.src);
                var pathName = rtrim(parts.pathname, ["/"]);
                if (!!parts.pathname) {
                    pathName = pathName.toLowerCase();
                    if (!!pathName && pathName.lastIndexOf(name) > -1) {
                        var url = script.src;
                        return PathHelper.getParentUrl(url);
                    }
                }
            }
        }
        return null;
    }
    var _cache = {};
    var PathHelper = (function () {
        function PathHelper() {
        }
        PathHelper.appendBust = function (url) {
            var bust = int_2.Config.bust;
            if (!bust) {
                return url;
            }
            return PathHelper.appendSearch(url, bust);
        };
        PathHelper.appendSearch = function (url, search) {
            search = ltrim(search, ["?", " "]);
            var parts = PathHelper.getUrlParts(url);
            var oldSearch = ltrim(parts.search, ["?", " "]);
            if (!!oldSearch && oldSearch.lastIndexOf(search) > -1) {
                return url;
            }
            if (!oldSearch) {
                url = url + "?" + search;
            }
            else {
                url = url + "&" + search;
            }
            return url;
        };
        PathHelper.getNormalizedUrl = function (url) {
            PathHelper._anchor.href = url;
            return PathHelper._anchor.href;
        };
        PathHelper.getUrlParts = function (url) {
            var parser = PathHelper._anchor;
            parser.href = url;
            if (!parser.host) {
                parser.href = parser.href;
            }
            return {
                protocol: parser.protocol,
                host: parser.host,
                hostname: parser.hostname,
                port: parser.port,
                pathname: parser.pathname,
                hash: parser.hash,
                search: parser.search
            };
        };
        PathHelper.getParentUrl = function (url) {
            var res = "";
            if (url.charAt(url.length - 1) === "/") {
                res = url.slice(0, url.lastIndexOf("/"));
                res = res.slice(0, res.lastIndexOf("/")) + "/";
            }
            else {
                res = url.slice(0, url.lastIndexOf("/")) + "/";
            }
            return res;
        };
        PathHelper.getFrameworkPath = function () {
            var res = _cache["root"];
            if (!res) {
                if (!!int_2.Config.frameworkPath) {
                    res = int_2.Config.frameworkPath;
                }
                if (!res) {
                    res = fn_getFrameworkPath();
                }
                if (!!res) {
                    _cache["root"] = res;
                }
            }
            if (!res) {
                throw new Error(format("Can not resolve {0} framework path", name));
            }
            return res;
        };
        PathHelper.getFrameworkCssPath = function () {
            var res = _cache["css"];
            if (!res) {
                res = PathHelper.getFrameworkPath() + [stylesDir, "/"].join("");
                _cache["css"] = res;
            }
            return res;
        };
        PathHelper.getFrameworkImgPath = function () {
            var res = _cache["img"];
            if (!res) {
                res = PathHelper.getFrameworkPath() + [imageDir, "/"].join("");
                _cache["img"] = res;
            }
            return res;
        };
        PathHelper._anchor = doc.createElement("a");
        return PathHelper;
    }());
    exports.PathHelper = PathHelper;
});
define("jriapp/utils/sloader", ["require", "exports", "jriapp_shared", "jriapp_shared/utils/async", "jriapp/utils/dom", "jriapp/utils/path"], function (require, exports, jriapp_shared_9, async_1, dom_2, path_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var _resolve = async_1.AsyncUtils.resolve, _whenAll = async_1.AsyncUtils.whenAll, createDeferred = async_1.AsyncUtils.createDeferred, utils = jriapp_shared_9.Utils, dom = dom_2.DomUtils, arrHelper = utils.arr, doc = dom.document, head = doc.head || doc.getElementsByTagName("head")[0];
    var _stylesLoader = null;
    exports.frameworkCss = "jriapp.css";
    function createCssLoader() {
        if (!_stylesLoader) {
            _stylesLoader = new StylesLoader();
        }
        return _stylesLoader;
    }
    exports.createCssLoader = createCssLoader;
    function whenAll(promises) {
        if (!promises) {
            return _resolve(void 0, true);
        }
        if (promises.length === 1) {
            return promises[0];
        }
        var resolved = 0;
        var cnt = promises.length;
        for (var i = 0; i < cnt; i += 1) {
            if (promises[i].state() === 2) {
                ++resolved;
            }
        }
        return (resolved === cnt) ? _resolve(void 0, true) : _whenAll(promises);
    }
    function createLink(url) {
        var link = doc.createElement("link");
        link.rel = "stylesheet";
        link.type = "text/css";
        link.href = url;
        return link;
    }
    var StylesLoader = (function () {
        function StylesLoader() {
            this._loadedCSS = {};
        }
        StylesLoader.prototype.isStyleSheetLoaded = function (url) {
            var testUrl = path_1.PathHelper.getUrlParts(url);
            var arr = arrHelper.fromList(doc.styleSheets);
            for (var i = 0; i < arr.length; i += 1) {
                var cssUrl = path_1.PathHelper.getUrlParts(arr[i].href);
                if (cssUrl.hostname === testUrl.hostname && cssUrl.pathname === testUrl.pathname) {
                    return true;
                }
            }
            return false;
        };
        StylesLoader.prototype.loadByLink = function (url, fnOnload) {
            var link = createLink(url);
            link.onload = function () {
                fnOnload(null);
            };
            link.onerror = function () {
                fnOnload("Error loading: " + url);
            };
            head.appendChild(link);
        };
        StylesLoader.prototype.load = function (url, load) {
            this.loadByLink(url, load);
        };
        ;
        StylesLoader.ensureCssExt = function (name) {
            return name.search(/\.(css|less|scss)$/i) === -1 ? name + ".css" : name;
        };
        StylesLoader.prototype.loadStyle = function (url) {
            url = path_1.PathHelper.appendBust(url);
            var cssUrl = path_1.PathHelper.getNormalizedUrl(url);
            var cssPromise = this._loadedCSS[cssUrl];
            if (!!cssPromise) {
                return cssPromise;
            }
            var deferred = createDeferred(true);
            cssPromise = deferred.promise();
            if (this.isStyleSheetLoaded(url)) {
                deferred.resolve(url);
                this._loadedCSS[cssUrl] = cssPromise;
                return cssPromise;
            }
            this.load(url, function (err) {
                if (!!err) {
                    deferred.reject(err);
                }
                else {
                    deferred.resolve(url);
                }
            });
            this._loadedCSS[cssUrl] = cssPromise;
            return cssPromise;
        };
        StylesLoader.prototype.loadStyles = function (urls) {
            var promises = [];
            for (var i = 0; i < urls.length; i += 1) {
                promises.push(this.loadStyle(urls[i]));
            }
            return whenAll(promises);
        };
        StylesLoader.prototype.loadOwnStyle = function (cssName) {
            cssName = cssName || exports.frameworkCss;
            var cssUrl = path_1.PathHelper.getFrameworkCssPath() + StylesLoader.ensureCssExt(cssName);
            return this.loadStyle(cssUrl);
        };
        StylesLoader.prototype.whenAllLoaded = function () {
            var obj = this._loadedCSS, names = Object.keys(obj), promises = [];
            for (var i = 0; i < names.length; i += 1) {
                promises.push(obj[names[i]]);
            }
            return whenAll(promises);
        };
        return StylesLoader;
    }());
});
define("jriapp/bootstrap", ["require", "exports", "jriapp_shared", "jriapp/elview", "jriapp/content", "jriapp/defaults", "jriapp/utils/tloader", "jriapp/utils/sloader", "jriapp/utils/path", "jriapp/utils/dom", "jriapp_shared/utils/deferred", "jriapp_shared/utils/queue"], function (require, exports, jriapp_shared_10, elview_1, content_1, defaults_1, tloader_1, sloader_1, path_2, dom_3, deferred_1, queue_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_10.Utils, dom = dom_3.DomUtils, win = dom.window, doc = win.document, isFunc = utils.check.isFunc, _a = utils.defer, createDeferred = _a.createDeferred, delay = _a.delay, _b = utils.core, forEachProp = _b.forEachProp, getNewID = _b.getNewID, getValue = _b.getValue, setValue = _b.setValue, removeValue = _b.removeValue, _c = utils.str, format = _c.format, fastTrim = _c.fastTrim, ERROR = utils.err, ERRS = jriapp_shared_10.LocaleERRS;
    exports.subscribeWeakMap = jriapp_shared_10.createWeakMap(), exports.selectableProviderWeakMap = jriapp_shared_10.createWeakMap();
    (function () {
        var win = dom.window;
        if (!win.Promise) {
            win.Promise = deferred_1.Promise;
        }
        if (!win.requestAnimationFrame) {
            var requestAnimationFrame_1 = win.requestAnimationFrame || win.mozRequestAnimationFrame ||
                win.webkitRequestAnimationFrame || win.msRequestAnimationFrame;
            var cancelAnimationFrame_1 = win.cancelAnimationFrame || win.mozCancelAnimationFrame ||
                (win.webkitCancelAnimationFrame || win.webkitCancelRequestAnimationFrame) ||
                win.msCancelAnimationFrame;
            if (!requestAnimationFrame_1 || !cancelAnimationFrame_1) {
                var queue = queue_1.createQueue(40);
                requestAnimationFrame_1 = queue.enque;
                cancelAnimationFrame_1 = queue.cancel;
            }
            win.requestAnimationFrame = requestAnimationFrame_1;
            win.cancelAnimationFrame = cancelAnimationFrame_1;
        }
    })();
    var _TEMPLATE_SELECTOR = 'script[type="text/x-template"]';
    var _OPTION_SELECTOR = 'script[type="text/x-options"]';
    var _stylesLoader = sloader_1.createCssLoader();
    var eventNames = {
        click: 1,
        change: 2,
        keypress: 3,
        keydown: 4,
        keyup: 5
    };
    var GLOB_EVENTS;
    (function (GLOB_EVENTS) {
        GLOB_EVENTS["load"] = "load";
        GLOB_EVENTS["unload"] = "unload";
        GLOB_EVENTS["initialized"] = "initialize";
    })(GLOB_EVENTS || (GLOB_EVENTS = {}));
    var BootstrapState;
    (function (BootstrapState) {
        BootstrapState[BootstrapState["None"] = 0] = "None";
        BootstrapState[BootstrapState["Initializing"] = 1] = "Initializing";
        BootstrapState[BootstrapState["Initialized"] = 2] = "Initialized";
        BootstrapState[BootstrapState["Ready"] = 3] = "Ready";
        BootstrapState[BootstrapState["Error"] = 4] = "Error";
        BootstrapState[BootstrapState["Disposed"] = 5] = "Disposed";
    })(BootstrapState = exports.BootstrapState || (exports.BootstrapState = {}));
    var _ObjectEvents = (function (_super) {
        __extends(_ObjectEvents, _super);
        function _ObjectEvents() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        _ObjectEvents.prototype.on = function (name, handler, nmspace, context, priority) {
            var owner = this.owner;
            var self = this, isReady = owner.state === 3;
            var isIntialized = (owner.state === 2 || owner.state === 3);
            if ((name === "load" && isReady) || (name === "initialize" && isIntialized)) {
                utils.queue.enque(function () { handler.apply(self, [self, {}]); });
            }
            else {
                _super.prototype.on.call(this, name, handler, nmspace, context, priority);
            }
        };
        return _ObjectEvents;
    }(jriapp_shared_10.ObjectEvents));
    var Bootstrap = (function (_super) {
        __extends(Bootstrap, _super);
        function Bootstrap() {
            var _this = _super.call(this) || this;
            var self = _this;
            if (!!exports.bootstrap) {
                throw new Error(ERRS.ERR_GLOBAL_SINGLTON);
            }
            _this._bootState = 0;
            _this._app = null;
            _this._selectedControl = null;
            _this._uniqueID = getNewID("app");
            _this._exports = {};
            _this._moduleInits = [];
            _this._templateLoader = null;
            _this._templateLoader = new tloader_1.TemplateLoader();
            _this._templateLoader.addOnLoaded(function (s, a) {
                if (!s) {
                    throw new Error("Invalid Operation");
                }
                self._onTemplateLoaded(a.html, a.app);
            });
            _this._templateLoader.objEvents.addOnError(function (s, a) {
                if (!s) {
                    throw new Error("Invalid Operation");
                }
                return self.handleError(a.error, a.source);
            });
            _this._elViewRegister = elview_1.createElViewRegister(null);
            _this._contentFactory = content_1.createContentFactoryList();
            _this._internal = {
                initialize: function () {
                    return self._initialize();
                },
                registerApp: function (app) {
                    self._registerApp(app);
                },
                unregisterApp: function (app) {
                    self._unregisterApp(app);
                },
                registerObject: function (root, name, obj) {
                    self._registerObject(root, name, obj);
                },
                unregisterObject: function (root, name) {
                    self._unregisterObject(root, name);
                },
                getObject: function (root, name) {
                    return self._getObject(root, name);
                },
                getConverter: function (name) {
                    return self._getConverter(name);
                }
            };
            _this._defaults = new defaults_1.Defaults();
            _this.defaults.imagesPath = path_2.PathHelper.getFrameworkImgPath();
            _stylesLoader.loadOwnStyle();
            ERROR.addHandler("*", _this);
            return _this;
        }
        Bootstrap._initFramework = function () {
            dom.ready(function () {
                exports.bootstrap._getInternal().initialize();
            });
        };
        Bootstrap.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            var self = this;
            self.objEvents.off();
            self._destroyApp();
            self._exports = {};
            if (self._templateLoader !== null) {
                self._templateLoader.dispose();
                self._templateLoader = null;
            }
            self._elViewRegister.dispose();
            self._elViewRegister = null;
            self._contentFactory = null;
            self._moduleInits = [];
            dom.events.offNS(doc, this._uniqueID);
            dom.events.offNS(win, this._uniqueID);
            win.onerror = null;
            ERROR.removeHandler("*");
            this._bootState = 5;
            _super.prototype.dispose.call(this);
        };
        Bootstrap.prototype._bindGlobalEvents = function () {
            var _this = this;
            var self = this, subscribeMap = exports.subscribeWeakMap, selectableMap = exports.selectableProviderWeakMap;
            dom.events.on(doc, "click", function (e) {
                var target = e.target;
                while (!!target && target !== doc) {
                    var obj = selectableMap.get(target);
                    if (!!obj) {
                        self.selectedControl = obj;
                        return;
                    }
                    target = target.parentElement;
                }
                self.selectedControl = null;
            }, this._uniqueID);
            forEachProp(eventNames, (function (name, flag) {
                var fn_name = "handle_" + name;
                dom.events.on(doc, name, function (e) {
                    var obj = subscribeMap.get(e.target);
                    if (isFunc(obj[fn_name])) {
                        e.cancelBubble = !!(obj[fn_name](e.originalEvent));
                    }
                }, {
                    nmspace: _this._uniqueID,
                    matchElement: function (el) {
                        var obj = subscribeMap.get(el);
                        return !!obj && !!obj.isSubscribed(flag);
                    }
                });
            }));
            dom.events.on(doc, "keydown", function (e) {
                if (!!self._selectedControl) {
                    var selectable = self._selectedControl.selectable;
                    if (!!selectable) {
                        selectable.onKeyDown(e.which, e);
                    }
                }
            }, this._uniqueID);
            dom.events.on(doc, "keyup", function (e) {
                if (!!self._selectedControl) {
                    var selectable = self._selectedControl.selectable;
                    if (!!selectable) {
                        selectable.onKeyUp(e.which, e);
                    }
                }
            }, this._uniqueID);
            dom.events.on(win, "beforeunload", function () {
                self.objEvents.raise("unload", {});
            }, this._uniqueID);
            win.onerror = function (msg, url, linenumber) {
                if (!!msg && msg.toString().indexOf(jriapp_shared_10.DUMY_ERROR) > -1) {
                    return true;
                }
                alert("Error: " + msg + "\nURL: " + url + "\nLine Number: " + linenumber);
                return false;
            };
        };
        Bootstrap.prototype._onTemplateLoaded = function (html, app) {
            var divEl = doc.createElement("div");
            divEl.innerHTML = html;
            this._processOptions(divEl, app);
            this._processTemplates(divEl, app);
        };
        Bootstrap.prototype._processOptions = function (root, app) {
            if (app === void 0) { app = null; }
            var self = this, jsons = dom.queryAll(root, _OPTION_SELECTOR);
            jsons.forEach(function (el) {
                var name = el.getAttribute("id");
                if (!name) {
                    throw new Error(ERRS.ERR_OPTIONS_HAS_NO_ID);
                }
                var text = el.innerHTML;
                self._registerOptions(name, text);
            });
        };
        Bootstrap.prototype._processTemplates = function (root, app) {
            if (app === void 0) { app = null; }
            var self = this, templates = dom.queryAll(root, _TEMPLATE_SELECTOR);
            templates.forEach(function (el) {
                var name = el.getAttribute("id");
                if (!name) {
                    throw new Error(ERRS.ERR_TEMPLATE_HAS_NO_ID);
                }
                var html = el.innerHTML;
                self._processTemplate(name, html, app);
            });
        };
        Bootstrap.prototype._processHTMLTemplates = function () {
            this._processTemplates(doc);
        };
        Bootstrap.prototype._processTemplate = function (name, html, app) {
            var self = this, deferred = createDeferred(true), res = fastTrim(html);
            var loader = {
                fn_loader: function () { return deferred.promise(); }
            };
            self.templateLoader.registerTemplateLoader(!app ? name : (app.appName + "." + name), loader);
            deferred.resolve(res);
        };
        Bootstrap.prototype._createObjEvents = function () {
            return new _ObjectEvents(this);
        };
        Bootstrap.prototype._init = function () {
            var self = this;
            var promise = self.stylesLoader.whenAllLoaded().then(function () {
                if (self._bootState !== 0) {
                    throw new Error("Invalid operation: bootState !== BootstrapState.None");
                }
                self._bootState = 1;
                self._bindGlobalEvents();
                self._bootState = 2;
                self.objEvents.raise("initialize", {});
                self.objEvents.off("initialize");
                return delay(function () {
                    if (self.getIsStateDirty()) {
                        throw new Error("Bootstrap is in destroyed state");
                    }
                    self._processOptions(doc);
                    self._processHTMLTemplates();
                    self._bootState = 3;
                    self.objEvents.raiseProp("isReady");
                    return self;
                });
            });
            var res = promise.then(function (boot) {
                if (boot._bootState !== 3) {
                    throw new Error("Invalid operation: bootState !== BootstrapState.Ready");
                }
                boot.objEvents.raise("load", {});
                boot.objEvents.off("load");
                return boot;
            });
            return res;
        };
        Bootstrap.prototype._initialize = function () {
            var _this = this;
            var self = this;
            return self._init().then(function () {
                return self;
            }, function (err) {
                self._bootState = 4;
                ERROR.reThrow(err, _this.handleError(err, self));
            });
        };
        Bootstrap.prototype._registerApp = function (app) {
            if (!!this._app) {
                throw new Error("Application already registered");
            }
            this._app = app;
            ERROR.addHandler(app.appName, app);
        };
        Bootstrap.prototype._unregisterApp = function (app) {
            if (!this._app || this._app.appName !== app.appName) {
                throw new Error("Invalid operation");
            }
            try {
                ERROR.removeHandler(app.appName);
                this.templateLoader.unRegisterTemplateGroup(app.appName);
                this.templateLoader.unRegisterTemplateLoader(app.appName);
            }
            finally {
                this._app = null;
            }
        };
        Bootstrap.prototype._destroyApp = function () {
            var self = this, app = self._app;
            if (!!app && !app.getIsStateDirty()) {
                app.dispose();
            }
        };
        Bootstrap.prototype._registerObject = function (root, name, obj) {
            setValue(root.getExports(), name, obj, true);
        };
        Bootstrap.prototype._unregisterObject = function (root, name) {
            return removeValue(root.getExports(), name);
        };
        Bootstrap.prototype._getObject = function (root, name) {
            return getValue(root.getExports(), name);
        };
        Bootstrap.prototype._getConverter = function (name) {
            var name2 = "cnv." + name;
            var res = this._getObject(this, name2);
            if (!res) {
                throw new Error(format(ERRS.ERR_CONVERTER_NOTREGISTERED, name));
            }
            return res;
        };
        Bootstrap.prototype._waitLoaded = function (onLoad) {
            var self = this;
            self.init(function () {
                self.addOnLoad(function () {
                    setTimeout(function () {
                        try {
                            onLoad(self);
                        }
                        catch (err) {
                            ERROR.reThrow(err, self.handleError(err, self));
                        }
                    }, 0);
                });
            });
        };
        Bootstrap.prototype._registerOptions = function (name, options) {
            var name2 = "opt." + name;
            if (!this._getObject(this, name2)) {
                this._registerObject(this, name2, options);
            }
            else {
                throw new Error(format(ERRS.ERR_OPTIONS_ALREADY_REGISTERED, name));
            }
        };
        Bootstrap.prototype._getInternal = function () {
            return this._internal;
        };
        Bootstrap.prototype.addOnDisposed = function (handler, nmspace, context) {
            this.objEvents.addOnDisposed(handler, nmspace, context);
        };
        Bootstrap.prototype.offOnDisposed = function (nmspace) {
            this.objEvents.offOnDisposed(nmspace);
        };
        Bootstrap.prototype.addOnError = function (handler, nmspace, context) {
            this.objEvents.addOnError(handler, nmspace, context);
        };
        Bootstrap.prototype.offOnError = function (nmspace) {
            this.objEvents.offOnError(nmspace);
        };
        Bootstrap.prototype.addOnLoad = function (fn, nmspace, context) {
            this.objEvents.on("load", fn, nmspace, context);
        };
        Bootstrap.prototype.addOnUnLoad = function (fn, nmspace, context) {
            this.objEvents.on("unload", fn, nmspace, context);
        };
        Bootstrap.prototype.addOnInitialize = function (fn, nmspace, context) {
            this.objEvents.on("initialize", fn, nmspace, context);
        };
        Bootstrap.prototype.addModuleInit = function (fn) {
            if (this._moduleInits.filter(function (val) { return val === fn; }).length === 0) {
                this._moduleInits.push(fn);
                return true;
            }
            return false;
        };
        Bootstrap.prototype.getExports = function () {
            return this._exports;
        };
        Bootstrap.prototype.getApp = function () {
            return this._app;
        };
        Bootstrap.prototype.init = function (onInit) {
            var self = this;
            self.addOnInitialize(function () {
                setTimeout(function () {
                    try {
                        onInit(self);
                    }
                    catch (err) {
                        ERROR.reThrow(err, self.handleError(err, self));
                    }
                }, 0);
            });
        };
        Bootstrap.prototype.startApp = function (appFactory, onStartUp) {
            var self = this, deferred = createDeferred(), promise = deferred.promise();
            self._waitLoaded(function () {
                try {
                    var app = appFactory();
                    deferred.resolve(app.startUp(onStartUp));
                }
                catch (err) {
                    deferred.reject(err);
                }
            });
            var res = promise.then(function (app) {
                return app;
            }, function (err) {
                ERROR.reThrow(err, self.handleError(err, self));
            });
            return res;
        };
        Bootstrap.prototype.registerSvc = function (name, obj) {
            var name2 = "svc." + name;
            return this._registerObject(this, name2, obj);
        };
        Bootstrap.prototype.unregisterSvc = function (name) {
            var name2 = "svc." + name;
            return this._unregisterObject(this, name2);
        };
        Bootstrap.prototype.getSvc = function (name) {
            var name2 = "svc." + name, obj = this._getObject(this, name2);
            if (!obj) {
                throw new Error("The service: " + name + " is not registered");
            }
            var res = isFunc(obj) ? obj() : obj;
            if (!res) {
                throw new Error("The factory for service: " + name + " have not returned the service");
            }
            return res;
        };
        Bootstrap.prototype.registerConverter = function (name, obj) {
            var name2 = "cnv." + name;
            if (!this._getObject(this, name2)) {
                this._registerObject(this, name2, obj);
            }
            else {
                throw new Error(format(ERRS.ERR_OBJ_ALREADY_REGISTERED, name));
            }
        };
        Bootstrap.prototype.getOptions = function (name) {
            var name2 = "opt." + name;
            var res = this._getObject(this, name2);
            if (!res) {
                throw new Error(utils.str.format(ERRS.ERR_OPTIONS_NOTREGISTERED, name));
            }
            return res;
        };
        Bootstrap.prototype.registerElView = function (name, elViewType) {
            this._elViewRegister.registerElView(name, elViewType);
        };
        Bootstrap.prototype.getImagePath = function (imageName) {
            var images = this.defaults.imagesPath;
            return images + imageName;
        };
        Bootstrap.prototype.loadOwnStyle = function (name) {
            return this.stylesLoader.loadOwnStyle(name);
        };
        Bootstrap.prototype.toString = function () {
            return "JRIApp Bootstrap";
        };
        Object.defineProperty(Bootstrap.prototype, "stylesLoader", {
            get: function () {
                return _stylesLoader;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Bootstrap.prototype, "elViewRegister", {
            get: function () {
                return this._elViewRegister;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Bootstrap.prototype, "contentFactory", {
            get: function () {
                return this._contentFactory;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Bootstrap.prototype, "templateLoader", {
            get: function () {
                return this._templateLoader;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Bootstrap.prototype, "selectedControl", {
            get: function () {
                return this._selectedControl;
            },
            set: function (v) {
                if (this._selectedControl !== v) {
                    this._selectedControl = v;
                    this.objEvents.raiseProp("selectedControl");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Bootstrap.prototype, "defaults", {
            get: function () {
                return this._defaults;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Bootstrap.prototype, "isReady", {
            get: function () {
                return this._bootState === 3;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Bootstrap.prototype, "state", {
            get: function () {
                return this._bootState;
            },
            enumerable: true,
            configurable: true
        });
        return Bootstrap;
    }(jriapp_shared_10.BaseObject));
    exports.Bootstrap = Bootstrap;
    exports.bootstrap = new Bootstrap();
});
define("jriapp/utils/viewchecks", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function dummyIsElView(obj) {
        return false;
    }
    function dummyIsTemplateElView(obj) {
        return false;
    }
    var ViewChecks = (function () {
        function ViewChecks() {
        }
        ViewChecks.isElView = dummyIsElView;
        ViewChecks.isTemplateElView = dummyIsTemplateElView;
        ViewChecks.isDataForm = function () { return false; };
        ViewChecks.isInsideDataForm = function () { return false; };
        ViewChecks.isInNestedForm = function () { return false; };
        ViewChecks.getParentDataForm = function () { return null; };
        return ViewChecks;
    }());
    exports.ViewChecks = ViewChecks;
});
define("jriapp/converter", ["require", "exports", "jriapp_shared", "jriapp/bootstrap"], function (require, exports, jriapp_shared_11, bootstrap_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_11.Utils, _a = utils.check, isNt = _a.isNt, isNumber = _a.isNumber, _b = utils.str, format = _b.format, stripNonNumeric = _b.stripNonNumeric, formatNumber = _b.formatNumber, round = utils.core.round, boot = bootstrap_3.bootstrap, ERRS = jriapp_shared_11.LocaleERRS;
    exports.NUM_CONV = { None: 0, Integer: 1, Decimal: 2, Float: 3, SmallInt: 4 };
    var BaseConverter = (function () {
        function BaseConverter() {
        }
        BaseConverter.prototype.convertToSource = function (val, param, dataContext) {
            return val;
        };
        BaseConverter.prototype.convertToTarget = function (val, param, dataContext) {
            return (isNt(val)) ? null : val;
        };
        return BaseConverter;
    }());
    exports.BaseConverter = BaseConverter;
    exports.baseConverter = new BaseConverter();
    var DateConverter = (function () {
        function DateConverter() {
        }
        DateConverter.prototype.convertToSource = function (val, param, dataContext) {
            if (!val) {
                return null;
            }
            var defaults = boot.defaults, datepicker = boot.getSvc("IDatepicker");
            return (!!datepicker) ? datepicker.parseDate(val) : dateTimeConverter.convertToSource(val, defaults.dateFormat, dataContext);
        };
        DateConverter.prototype.convertToTarget = function (val, param, dataContext) {
            if (isNt(val)) {
                return "";
            }
            var defaults = boot.defaults, datepicker = boot.getSvc("IDatepicker");
            return (!!datepicker) ? datepicker.formatDate(val) : dateTimeConverter.convertToTarget(val, defaults.dateFormat, dataContext);
        };
        DateConverter.prototype.toString = function () {
            return "DateConverter";
        };
        return DateConverter;
    }());
    exports.DateConverter = DateConverter;
    var dateConverter = new DateConverter();
    var DateTimeConverter = (function () {
        function DateTimeConverter() {
        }
        DateTimeConverter.prototype.convertToSource = function (val, param, dataContext) {
            if (!val) {
                return null;
            }
            var m = moment(val, param);
            if (!m.isValid()) {
                throw new Error(format(ERRS.ERR_CONV_INVALID_DATE, val));
            }
            return m.toDate();
        };
        DateTimeConverter.prototype.convertToTarget = function (val, param, dataContext) {
            if (isNt(val)) {
                return "";
            }
            var m = moment(val);
            return m.format(param);
        };
        DateTimeConverter.prototype.toString = function () {
            return "DateTimeConverter";
        };
        return DateTimeConverter;
    }());
    exports.DateTimeConverter = DateTimeConverter;
    var dateTimeConverter = new DateTimeConverter();
    var NumberConverter = (function () {
        function NumberConverter() {
        }
        NumberConverter.prototype.convertToSource = function (val, param, dataContext) {
            if (isNt(val)) {
                return null;
            }
            var defaults = bootstrap_3.bootstrap.defaults, dp = defaults.decimalPoint, thousandSep = defaults.thousandSep;
            var prec = 4;
            var value = val.replace(thousandSep, "");
            value = value.replace(dp, ".");
            value = stripNonNumeric(value);
            if (value === "") {
                return null;
            }
            var num = null;
            switch (param) {
                case exports.NUM_CONV.SmallInt:
                    num = parseInt(value, 10);
                    break;
                case exports.NUM_CONV.Integer:
                    num = parseInt(value, 10);
                    break;
                case exports.NUM_CONV.Decimal:
                    prec = defaults.decPrecision;
                    num = round(parseFloat(value), prec);
                    break;
                case exports.NUM_CONV.Float:
                    num = parseFloat(value);
                    break;
                default:
                    num = Number(value);
                    break;
            }
            if (!isNumber(num)) {
                throw new Error(format(ERRS.ERR_CONV_INVALID_NUM, val));
            }
            return num;
        };
        NumberConverter.prototype.convertToTarget = function (val, param, dataContext) {
            if (isNt(val)) {
                return "";
            }
            var defaults = bootstrap_3.bootstrap.defaults, dp = defaults.decimalPoint, thousandSep = defaults.thousandSep;
            var prec;
            switch (param) {
                case exports.NUM_CONV.Integer:
                    prec = 0;
                    return formatNumber(val, prec, dp, thousandSep);
                case exports.NUM_CONV.Decimal:
                    prec = defaults.decPrecision;
                    return formatNumber(val, prec, dp, thousandSep);
                case exports.NUM_CONV.SmallInt:
                    prec = 0;
                    return formatNumber(val, prec, dp, "");
                case exports.NUM_CONV.Float:
                    return formatNumber(val, null, dp, thousandSep);
                default:
                    return formatNumber(val, null, dp, thousandSep);
            }
        };
        NumberConverter.prototype.toString = function () {
            return "NumberConverter";
        };
        return NumberConverter;
    }());
    exports.NumberConverter = NumberConverter;
    var numberConverter = new NumberConverter();
    var IntegerConverter = (function () {
        function IntegerConverter() {
        }
        IntegerConverter.prototype.convertToSource = function (val, param, dataContext) {
            return numberConverter.convertToSource(val, exports.NUM_CONV.Integer, dataContext);
        };
        IntegerConverter.prototype.convertToTarget = function (val, param, dataContext) {
            return numberConverter.convertToTarget(val, exports.NUM_CONV.Integer, dataContext);
        };
        IntegerConverter.prototype.toString = function () {
            return "IntegerConverter";
        };
        return IntegerConverter;
    }());
    exports.IntegerConverter = IntegerConverter;
    var integerConverter = new IntegerConverter();
    var SmallIntConverter = (function () {
        function SmallIntConverter() {
        }
        SmallIntConverter.prototype.convertToSource = function (val, param, dataContext) {
            return numberConverter.convertToSource(val, exports.NUM_CONV.SmallInt, dataContext);
        };
        SmallIntConverter.prototype.convertToTarget = function (val, param, dataContext) {
            return numberConverter.convertToTarget(val, exports.NUM_CONV.SmallInt, dataContext);
        };
        SmallIntConverter.prototype.toString = function () {
            return "SmallIntConverter";
        };
        return SmallIntConverter;
    }());
    exports.SmallIntConverter = SmallIntConverter;
    var smallIntConverter = new SmallIntConverter();
    var DecimalConverter = (function () {
        function DecimalConverter() {
        }
        DecimalConverter.prototype.convertToSource = function (val, param, dataContext) {
            return numberConverter.convertToSource(val, exports.NUM_CONV.Decimal, dataContext);
        };
        DecimalConverter.prototype.convertToTarget = function (val, param, dataContext) {
            return numberConverter.convertToTarget(val, exports.NUM_CONV.Decimal, dataContext);
        };
        DecimalConverter.prototype.toString = function () {
            return "DecimalConverter";
        };
        return DecimalConverter;
    }());
    exports.DecimalConverter = DecimalConverter;
    var decimalConverter = new DecimalConverter();
    var FloatConverter = (function () {
        function FloatConverter() {
        }
        FloatConverter.prototype.convertToSource = function (val, param, dataContext) {
            return numberConverter.convertToSource(val, exports.NUM_CONV.Float, dataContext);
        };
        FloatConverter.prototype.convertToTarget = function (val, param, dataContext) {
            return numberConverter.convertToTarget(val, exports.NUM_CONV.Float, dataContext);
        };
        FloatConverter.prototype.toString = function () {
            return "FloatConverter";
        };
        return FloatConverter;
    }());
    exports.FloatConverter = FloatConverter;
    var floatConverter = new FloatConverter();
    var NotConverter = (function () {
        function NotConverter() {
        }
        NotConverter.prototype.convertToSource = function (val, param, dataContext) {
            return !val;
        };
        NotConverter.prototype.convertToTarget = function (val, param, dataContext) {
            return !val;
        };
        return NotConverter;
    }());
    exports.NotConverter = NotConverter;
    boot.registerConverter("BaseConverter", exports.baseConverter);
    boot.registerConverter("dateConverter", dateConverter);
    boot.registerConverter("dateTimeConverter", dateTimeConverter);
    boot.registerConverter("numberConverter", numberConverter);
    boot.registerConverter("integerConverter", integerConverter);
    boot.registerConverter("smallIntConverter", smallIntConverter);
    boot.registerConverter("decimalConverter", decimalConverter);
    boot.registerConverter("floatConverter", floatConverter);
    boot.registerConverter("notConverter", new NotConverter());
});
define("jriapp/binding", ["require", "exports", "jriapp_shared", "jriapp/bootstrap"], function (require, exports, jriapp_shared_12, bootstrap_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_12.Utils, _a = utils.check, isString = _a.isString, isUndefined = _a.isUndefined, isNt = _a.isNt, _undefined = _a._undefined, isHasProp = _a.isHasProp, format = utils.str.format, _b = utils.core, getNewID = _b.getNewID, forEachProp = _b.forEachProp, sys = utils.sys, debug = utils.debug, log = utils.log, boot = bootstrap_4.bootstrap, ERRS = jriapp_shared_12.LocaleERRS;
    var resolvePath = sys.resolvePath, getPathParts = sys.getPathParts, getErrorNotification = sys.getErrorNotification, getProp = sys.getProp, setProp = sys.setProp;
    sys.isBinding = function (obj) {
        return (!!obj && obj instanceof Binding);
    };
    var bindModeMap = {
        OneTime: 0,
        OneWay: 1,
        TwoWay: 2,
        BackWay: 3
    };
    function fn_reportUnResolved(bindTo, root, path, propName) {
        if (!debug.isDebugging()) {
            return;
        }
        debug.checkStartDebugger();
        var msg = "Unresolved data binding for ";
        if (bindTo === 0) {
            msg += " Source: ";
        }
        else {
            msg += " Target: ";
        }
        msg += "'" + root + "'";
        msg += ", property: '" + propName + "'";
        msg += ", binding path: '" + path + "'";
        log.error(msg);
    }
    function fn_reportMaxRec(bindTo, src, tgt, spath, tpath) {
        if (!debug.isDebugging()) {
            return;
        }
        debug.checkStartDebugger();
        var msg = "Maximum recursion exceeded for ";
        if (bindTo === 0) {
            msg += "Updating Source value: ";
        }
        else {
            msg += "Updating Target value: ";
        }
        msg += " source:'" + src + "'";
        msg += ", target:'" + tgt + "'";
        msg += ", source path: '" + spath + "'";
        msg += ", target path: '" + tpath + "'";
        log.error(msg);
    }
    function getBindingOptions(bindInfo, defTarget, dataContext) {
        var bindingOpts = {
            targetPath: null,
            sourcePath: null,
            target: null,
            source: null,
            isSourceFixed: false,
            mode: 1,
            converter: null,
            param: null,
            isBind: false
        };
        var converter;
        var app = boot.getApp();
        if (isString(bindInfo.converter)) {
            converter = app.getConverter(bindInfo.converter);
        }
        else {
            converter = bindInfo.converter;
        }
        var fixedSource = bindInfo.source, fixedTarget = bindInfo.target;
        if (!bindInfo.sourcePath && !!bindInfo.to) {
            bindingOpts.sourcePath = bindInfo.to;
        }
        else if (!!bindInfo.sourcePath) {
            bindingOpts.sourcePath = bindInfo.sourcePath;
        }
        if (!!bindInfo.targetPath) {
            bindingOpts.targetPath = bindInfo.targetPath;
        }
        if (!!bindInfo.param) {
            bindingOpts.param = bindInfo.param;
            bindingOpts.isBind = bindInfo.isBind;
        }
        if (!!bindInfo.mode) {
            bindingOpts.mode = bindModeMap[bindInfo.mode];
        }
        if (!!converter) {
            bindingOpts.converter = converter;
        }
        if (!fixedTarget) {
            bindingOpts.target = defTarget;
        }
        else {
            if (isString(fixedTarget)) {
                if (fixedTarget === "this") {
                    bindingOpts.target = defTarget;
                }
                else {
                    bindingOpts.target = resolvePath(app, fixedTarget);
                }
            }
            else {
                bindingOpts.target = fixedTarget;
            }
        }
        if (!fixedSource) {
            bindingOpts.source = dataContext;
        }
        else {
            bindingOpts.isSourceFixed = true;
            if (isString(fixedSource)) {
                if (fixedSource === "this") {
                    bindingOpts.source = defTarget;
                }
                else {
                    bindingOpts.source = resolvePath(app, fixedSource);
                }
            }
            else {
                bindingOpts.source = fixedSource;
            }
        }
        return bindingOpts;
    }
    exports.getBindingOptions = getBindingOptions;
    var Binding = (function (_super) {
        __extends(Binding, _super);
        function Binding(options) {
            var _this = _super.call(this) || this;
            var opts = options;
            if (isString(opts.mode)) {
                opts.mode = bindModeMap[opts.mode];
            }
            if (!isString(opts.targetPath)) {
                debug.checkStartDebugger();
                throw new Error(format(ERRS.ERR_BIND_TGTPATH_INVALID, opts.targetPath));
            }
            if (isNt(opts.mode)) {
                debug.checkStartDebugger();
                throw new Error(format(ERRS.ERR_BIND_MODE_INVALID, opts.mode));
            }
            if (!opts.target) {
                throw new Error(ERRS.ERR_BIND_TARGET_EMPTY);
            }
            if (!sys.isBaseObj(opts.target)) {
                throw new Error(ERRS.ERR_BIND_TARGET_INVALID);
            }
            _this._state = null;
            _this._mode = opts.mode;
            _this._converter = !opts.converter ? null : opts.converter;
            _this._param = opts.param;
            _this._isBindParam = !!opts.isBind;
            _this._srcPath = getPathParts(opts.sourcePath);
            _this._tgtPath = getPathParts(opts.targetPath);
            if (_this._tgtPath.length < 1) {
                throw new Error(format(ERRS.ERR_BIND_TGTPATH_INVALID, opts.targetPath));
            }
            _this._srcFixed = (!!opts.isSourceFixed);
            _this._pathItems = {};
            _this._uniqueID = getNewID("bnd");
            _this._srcEnd = null;
            _this._tgtEnd = null;
            _this._source = null;
            _this._target = null;
            _this._umask = 0;
            _this._cntUtgt = 0;
            _this._cntUSrc = 0;
            _this._setTarget(opts.target);
            _this._setSource(opts.source);
            _this._update();
            var errNotif = getErrorNotification(_this._srcEnd);
            if (!!errNotif && errNotif.getIsHasErrors()) {
                _this._onSrcErrChanged(errNotif);
            }
            return _this;
        }
        Binding.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            var self = this;
            forEachProp(this._pathItems, function (key, old) {
                self._cleanUp(old);
            });
            this._pathItems = {};
            this._setSource(null);
            this._setTarget(null);
            this._state = null;
            this._converter = null;
            this._param = null;
            this._srcPath = null;
            this._tgtPath = null;
            this._srcEnd = null;
            this._tgtEnd = null;
            this._source = null;
            this._target = null;
            this._umask = 0;
            _super.prototype.dispose.call(this);
        };
        Binding.prototype._update = function () {
            var umask = this._umask, MAX_REC = 3;
            var flag = 0;
            this._umask = 0;
            if (this._mode === 3) {
                if (!!(umask & 1)) {
                    flag = 1;
                }
            }
            else {
                if (!!(umask & 2)) {
                    flag = 2;
                }
                else if (!!(umask & 1) && (this._mode === 2)) {
                    flag = 1;
                }
            }
            switch (flag) {
                case 1:
                    if (this._cntUtgt === 0) {
                        if (this._cntUSrc < MAX_REC) {
                            this._cntUSrc += 1;
                            try {
                                this.updateSource();
                            }
                            finally {
                                this._cntUSrc -= 1;
                            }
                        }
                        else {
                            fn_reportMaxRec(0, this._source, this._target, this._srcPath.join("."), this._tgtPath.join("."));
                        }
                    }
                    break;
                case 2:
                    if (this._cntUSrc === 0) {
                        if (this._cntUtgt < MAX_REC) {
                            this._cntUtgt += 1;
                            try {
                                this.updateTarget();
                            }
                            finally {
                                this._cntUtgt -= 1;
                            }
                        }
                        else {
                            fn_reportMaxRec(1, this._source, this._target, this._srcPath.join("."), this._tgtPath.join("."));
                        }
                    }
                    break;
            }
        };
        Binding.prototype._onSrcErrChanged = function (errNotif) {
            var errors = [];
            var tgt = this._tgtEnd, src = this._srcEnd, srcPath = this._srcPath;
            if (sys.isValidatable(tgt)) {
                if (!!src && srcPath.length > 0) {
                    var prop = srcPath[srcPath.length - 1];
                    errors = errNotif.getFieldErrors(prop);
                }
                tgt.validationErrors = errors;
            }
        };
        Binding.prototype._getTgtChangedFn = function (self, obj, prop, restPath, lvl) {
            return function () {
                var val = getProp(obj, prop);
                if (restPath.length > 0) {
                    self._setPathItem(null, 1, lvl, restPath);
                }
                self._parseTgt(val, restPath, lvl);
                self._update();
            };
        };
        Binding.prototype._getSrcChangedFn = function (self, obj, prop, restPath, lvl) {
            return function () {
                var val = getProp(obj, prop);
                if (restPath.length > 0) {
                    self._setPathItem(null, 0, lvl, restPath);
                }
                self._parseSrc(val, restPath, lvl);
                self._update();
            };
        };
        Binding.prototype._addOnPropChanged = function (obj, prop, fn) {
            obj.objEvents.onProp(prop, fn, this._uniqueID);
            if (prop !== "[*]" && sys.isPropBag(obj)) {
                obj.objEvents.onProp("[*]", fn, this._uniqueID);
            }
        };
        Binding.prototype._parseSrc = function (obj, path, lvl) {
            var self = this;
            self._srcEnd = null;
            if (sys.isBaseObj(obj) && obj.getIsStateDirty()) {
                return;
            }
            if (path.length === 0) {
                self._srcEnd = obj;
            }
            else {
                self._parseSrc2(obj, path, lvl);
            }
            if (self._mode === 3) {
                if (!!self._srcEnd) {
                    self._umask |= 1;
                }
            }
            else {
                if (!!self._tgtEnd) {
                    self._umask |= 2;
                }
            }
        };
        Binding.prototype._parseSrc2 = function (obj, path, lvl) {
            var self = this, isBaseObj = sys.isBaseObj(obj);
            if (isBaseObj) {
                if (obj.getIsStateDirty()) {
                    return;
                }
                self._setPathItem(obj, 0, lvl, path);
            }
            if (path.length > 1) {
                if (isBaseObj) {
                    var fnChange = self._getSrcChangedFn(self, obj, path[0], path.slice(1), lvl + 1);
                    self._addOnPropChanged(obj, path[0], fnChange);
                }
                if (!!obj) {
                    var nextObj = getProp(obj, path[0]);
                    if (!!nextObj) {
                        self._parseSrc2(nextObj, path.slice(1), lvl + 1);
                    }
                    else if (isUndefined(nextObj)) {
                        fn_reportUnResolved(0, self.source, self._srcPath.join("."), path[0]);
                    }
                }
                return;
            }
            if (!!obj && path.length === 1) {
                var isValidProp = (!debug.isDebugging() ? true : (isBaseObj ? obj.isHasProp(path[0]) : isHasProp(obj, path[0])));
                if (isValidProp) {
                    var updateOnChange = isBaseObj && (self._mode === 1 || self._mode === 2);
                    if (updateOnChange) {
                        var fnUpd = function () {
                            if (!!self._tgtEnd) {
                                self._umask |= 2;
                                self._update();
                            }
                        };
                        self._addOnPropChanged(obj, path[0], fnUpd);
                    }
                    var errNotif = getErrorNotification(obj);
                    if (!!errNotif) {
                        errNotif.addOnErrorsChanged(self._onSrcErrChanged, self._uniqueID, self);
                    }
                    self._srcEnd = obj;
                }
                else {
                    fn_reportUnResolved(0, self.source, self._srcPath.join("."), path[0]);
                }
            }
        };
        Binding.prototype._parseTgt = function (obj, path, lvl) {
            var self = this;
            self._tgtEnd = null;
            if (sys.isBaseObj(obj) && obj.getIsStateDirty()) {
                return;
            }
            if (path.length === 0) {
                self._tgtEnd = obj;
            }
            else {
                self._parseTgt2(obj, path, lvl);
            }
            if (self._mode === 3) {
                if (!!self._srcEnd) {
                    this._umask |= 1;
                }
            }
            else {
                if (!!self._tgtEnd) {
                    this._umask |= 2;
                }
            }
        };
        Binding.prototype._parseTgt2 = function (obj, path, lvl) {
            var self = this, isBaseObj = sys.isBaseObj(obj);
            if (isBaseObj) {
                if (obj.getIsStateDirty()) {
                    return;
                }
                self._setPathItem(obj, 1, lvl, path);
            }
            if (path.length > 1) {
                if (isBaseObj) {
                    var fnChange = self._getTgtChangedFn(self, obj, path[0], path.slice(1), lvl + 1);
                    self._addOnPropChanged(obj, path[0], fnChange);
                }
                if (!!obj) {
                    var nextObj = getProp(obj, path[0]);
                    if (!!nextObj) {
                        self._parseTgt2(nextObj, path.slice(1), lvl + 1);
                    }
                    else if (isUndefined(nextObj)) {
                        fn_reportUnResolved(1, self.target, self._tgtPath.join("."), path[0]);
                    }
                }
                return;
            }
            if (!!obj && path.length === 1) {
                var isValidProp = (!debug.isDebugging() ? true : (isBaseObj ? obj.isHasProp(path[0]) : isHasProp(obj, path[0])));
                if (isValidProp) {
                    var updateOnChange = isBaseObj && (self._mode === 2 || self._mode === 3);
                    if (updateOnChange) {
                        var fnUpd = function () {
                            if (!!self._srcEnd) {
                                self._umask |= 1;
                                self._update();
                            }
                        };
                        self._addOnPropChanged(obj, path[0], fnUpd);
                    }
                    self._tgtEnd = obj;
                }
                else {
                    fn_reportUnResolved(1, self.target, self._tgtPath.join("."), path[0]);
                }
            }
        };
        Binding.prototype._setPathItem = function (newObj, bindingTo, lvl, path) {
            var len = lvl + path.length;
            for (var i = lvl; i < len; i += 1) {
                var key = (bindingTo === 0) ? ("s" + i) : ((bindingTo === 1) ? ("t" + i) : null);
                if (!key) {
                    throw new Error(format(ERRS.ERR_PARAM_INVALID, "bindingTo", bindingTo));
                }
                var oldObj = this._pathItems[key];
                if (!!oldObj) {
                    this._cleanUp(oldObj);
                    delete this._pathItems[key];
                }
                if (!!newObj && i === lvl) {
                    this._pathItems[key] = newObj;
                }
            }
        };
        Binding.prototype._cleanUp = function (obj) {
            if (!!obj) {
                obj.objEvents.offNS(this._uniqueID);
                var errNotif = getErrorNotification(obj);
                if (!!errNotif) {
                    errNotif.offOnErrorsChanged(this._uniqueID);
                }
            }
        };
        Binding.prototype._setTarget = function (value) {
            if (!!this._state) {
                this._state.target = value;
                return false;
            }
            if (this._target !== value) {
                if (!!this._tgtEnd && !(this._mode === 3)) {
                    this._cntUtgt += 1;
                    try {
                        this.targetValue = null;
                    }
                    finally {
                        this._cntUtgt -= 1;
                        if (this._cntUtgt < 0) {
                            throw new Error("Invalid operation: this._cntUtgt = " + this._cntUtgt);
                        }
                    }
                }
                this._setPathItem(null, 1, 0, this._tgtPath);
                if (!!value && !sys.isBaseObj(value)) {
                    throw new Error(ERRS.ERR_BIND_TARGET_INVALID);
                }
                this._target = value;
                this._parseTgt(this._target, this._tgtPath, 0);
                if (!!this._target && !this._tgtEnd) {
                    throw new Error(format(ERRS.ERR_BIND_TGTPATH_INVALID, this._tgtPath.join(".")));
                }
                return true;
            }
            else {
                return false;
            }
        };
        Binding.prototype._setSource = function (value) {
            if (!!this._state) {
                this._state.source = value;
                return false;
            }
            if (this._source !== value) {
                if (!!this._srcEnd && (this._mode === 3)) {
                    this._cntUSrc += 1;
                    try {
                        this.sourceValue = null;
                    }
                    finally {
                        this._cntUSrc -= 1;
                        if (this._cntUSrc < 0) {
                            throw new Error("Invalid Operation: this._cntUSrc = " + this._cntUSrc);
                        }
                    }
                }
                this._setPathItem(null, 0, 0, this._srcPath);
                this._source = value;
                this._parseSrc(this._source, this._srcPath, 0);
                return true;
            }
            else {
                return false;
            }
        };
        Binding.prototype.updateTarget = function () {
            if (this.getIsStateDirty()) {
                return;
            }
            try {
                if (!this._converter) {
                    this.targetValue = this.sourceValue;
                }
                else {
                    this.targetValue = this._converter.convertToTarget(this.sourceValue, this.param, this.source);
                }
            }
            catch (ex) {
                utils.err.reThrow(ex, this.handleError(ex, this));
            }
        };
        Binding.prototype.updateSource = function () {
            if (this.getIsStateDirty()) {
                return;
            }
            try {
                if (!this._converter) {
                    this.sourceValue = this.targetValue;
                }
                else {
                    this.sourceValue = this._converter.convertToSource(this.targetValue, this.param, this.source);
                }
            }
            catch (ex) {
                if (!sys.isValidationError(ex) || !sys.isValidatable(this._tgtEnd)) {
                    utils.err.reThrow(ex, this.handleError(ex, this));
                }
            }
        };
        Binding.prototype.toString = function () {
            return "Binding";
        };
        Object.defineProperty(Binding.prototype, "uniqueID", {
            get: function () {
                return this._uniqueID;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Binding.prototype, "target", {
            get: function () {
                return this._target;
            },
            set: function (v) {
                if (this._setTarget(v)) {
                    this._update();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Binding.prototype, "source", {
            get: function () {
                return this._source;
            },
            set: function (v) {
                if (this._setSource(v)) {
                    this._update();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Binding.prototype, "targetPath", {
            get: function () {
                return this._tgtPath;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Binding.prototype, "sourcePath", {
            get: function () {
                return this._srcPath;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Binding.prototype, "sourceValue", {
            get: function () {
                var res = null;
                if (this._srcPath.length === 0) {
                    res = this._srcEnd;
                }
                else if (!!this._srcEnd) {
                    var prop = this._srcPath[this._srcPath.length - 1];
                    res = getProp(this._srcEnd, prop);
                }
                return res;
            },
            set: function (v) {
                if (this._srcPath.length === 0 || !this._srcEnd || v === _undefined) {
                    return;
                }
                var prop = this._srcPath[this._srcPath.length - 1];
                setProp(this._srcEnd, prop, v);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Binding.prototype, "targetValue", {
            get: function () {
                var res = null;
                if (this._tgtPath.length === 0) {
                    res = this._tgtEnd;
                }
                else if (!!this._tgtEnd) {
                    var prop = this._tgtPath[this._tgtPath.length - 1];
                    res = getProp(this._tgtEnd, prop);
                }
                return res;
            },
            set: function (v) {
                if (this._tgtPath.length === 0 || !this._tgtEnd || v === _undefined) {
                    return;
                }
                var prop = this._tgtPath[this._tgtPath.length - 1];
                setProp(this._tgtEnd, prop, v);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Binding.prototype, "isSourceFixed", {
            get: function () {
                return this._srcFixed;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Binding.prototype, "mode", {
            get: function () {
                return this._mode;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Binding.prototype, "converter", {
            get: function () {
                return this._converter;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Binding.prototype, "param", {
            get: function () {
                if (this._isBindParam) {
                    if (isNt(this._param)) {
                        return this._param;
                    }
                    var bindparts = this._param;
                    var source = this.source;
                    if (bindparts.length > 1) {
                        source = resolvePath(boot.getApp(), bindparts[1]);
                    }
                    return resolvePath(source, bindparts[0]);
                }
                else {
                    return this._param;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Binding.prototype, "isDisabled", {
            get: function () {
                return !!this._state;
            },
            set: function (v) {
                var s;
                v = !!v;
                if (this.isDisabled !== v) {
                    if (v) {
                        s = { source: this._source, target: this._target };
                        try {
                            this.target = null;
                            this.source = null;
                        }
                        finally {
                            this._state = s;
                        }
                    }
                    else {
                        s = this._state;
                        this._state = null;
                        this._setTarget(s.target);
                        this._setSource(s.source);
                        this._update();
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        return Binding;
    }(jriapp_shared_12.BaseObject));
    exports.Binding = Binding;
});
define("jriapp/template", ["require", "exports", "jriapp_shared", "jriapp/bootstrap", "jriapp/utils/viewchecks", "jriapp/utils/dom"], function (require, exports, jriapp_shared_13, bootstrap_5, viewchecks_1, dom_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_13.Utils, reject = utils.defer.reject, dom = dom_4.DomUtils, viewChecks = viewchecks_1.ViewChecks, doc = dom.document, _a = utils.check, isFunc = _a.isFunc, isThenable = _a.isThenable, format = utils.str.format, arrHelper = utils.arr, sys = utils.sys, boot = bootstrap_5.bootstrap, ERRS = jriapp_shared_13.LocaleERRS, ERROR = utils.err;
    var css;
    (function (css) {
        css["templateContainer"] = "ria-template-container";
        css["templateError"] = "ria-template-error";
    })(css = exports.css || (exports.css = {}));
    function createTemplate(dataContext, templEvents) {
        var options = {
            dataContext: dataContext,
            templEvents: templEvents
        };
        return new Template(options);
    }
    exports.createTemplate = createTemplate;
    var Template = (function (_super) {
        __extends(Template, _super);
        function Template(options) {
            var _this = _super.call(this) || this;
            _this._dataContext = options.dataContext;
            _this._templEvents = options.templEvents;
            _this._loadedElem = null;
            _this._lfTime = null;
            _this._templateID = null;
            _this._templElView = null;
            _this._el = doc.createElement("div");
            _this._el.className = "ria-template-container";
            return _this;
        }
        Template.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            this._unloadTemplate();
            if (!!this._el) {
                dom.removeNode(this._el);
                this._el = null;
            }
            this._dataContext = null;
            this._templEvents = null;
            _super.prototype.dispose.call(this);
        };
        Template.prototype._getBindings = function () {
            return !this._lfTime ? [] : this._lfTime.findAll(sys.isBinding);
        };
        Template.prototype._getTemplateElView = function () {
            return !this._lfTime ? null : this._lfTime.findFirst(viewChecks.isTemplateElView);
        };
        Template.prototype._loadAsync = function (name) {
            var self = this, fnLoader = this.app.getTemplateLoader(name);
            var promise;
            if (isFunc(fnLoader) && isThenable(promise = fnLoader())) {
                return promise.then(function (html) {
                    var elems = dom.fromHTML(html);
                    return elems[0];
                }).catch(function (err) {
                    if (!!err && !!err.message) {
                        throw err;
                    }
                    else {
                        throw new Error(format(ERRS.ERR_TEMPLATE_ID_INVALID, self.templateID));
                    }
                });
            }
            else {
                return reject(new Error(format(ERRS.ERR_TEMPLATE_ID_INVALID, self.templateID)));
            }
        };
        Template.prototype._loadTemplate = function () {
            var self = this, id = self.templateID, templateEl = self.el;
            try {
                if (!!self._loadedElem) {
                    self._unloadTemplate();
                }
                if (!!id) {
                    var loadPromise = self._loadAsync(id), bindPromise = loadPromise.then(function (loadedEl) {
                        return self._dataBind(templateEl, loadedEl);
                    });
                    bindPromise.catch(function (err) {
                        if (self.getIsStateDirty()) {
                            return;
                        }
                        self._onFail(templateEl, err);
                    });
                }
            }
            catch (ex) {
                self._onFail(templateEl, ex);
            }
        };
        Template.prototype._onLoading = function () {
            if (!!this._templEvents) {
                this._templEvents.templateLoading(this);
            }
        };
        Template.prototype._onLoaded = function (error) {
            this._templElView = this._getTemplateElView();
            if (!!this._templEvents) {
                this._templEvents.templateLoaded(this, error);
            }
            if (!!this._templElView) {
                this._templElView.templateLoaded(this, error);
            }
        };
        Template.prototype._unloadTemplate = function () {
            try {
                if (!!this._templEvents) {
                    this._templEvents.templateUnLoading(this);
                }
                if (!!this._templElView) {
                    this._templElView.templateUnLoading(this);
                }
            }
            finally {
                this._cleanUp();
            }
        };
        Template.prototype._dataBind = function (templateEl, loadedEl) {
            var self = this;
            if (self.getIsStateDirty()) {
                ERROR.abort();
            }
            if (!loadedEl) {
                throw new Error(format(ERRS.ERR_TEMPLATE_ID_INVALID, self.templateID));
            }
            if (!!self._loadedElem) {
                self._unloadTemplate();
            }
            dom.setClass([templateEl], "ria-template-error", true);
            self._loadedElem = loadedEl;
            self._onLoading();
            templateEl.appendChild(loadedEl);
            var promise = self.app._getInternal().bindTemplate(loadedEl, this.dataContext);
            return promise.then(function (lftm) {
                if (self.getIsStateDirty()) {
                    lftm.dispose();
                    ERROR.abort();
                }
                self._lfTime = lftm;
                self._updateBindingSource();
                self._onLoaded(null);
                return loadedEl;
            });
        };
        Template.prototype._onFail = function (templateEl, err) {
            var self = this;
            if (self.getIsStateDirty()) {
                return;
            }
            self._onLoaded(err);
            if (ERROR.checkIsAbort(err)) {
                return;
            }
            dom.setClass([templateEl], "ria-template-error", false);
            var ex;
            if (!!err) {
                if (!!err.message) {
                    ex = err;
                }
                else if (!!err.statusText) {
                    ex = new Error(err.statusText);
                }
                else {
                    ex = new Error("error: " + err);
                }
            }
            if (!ex) {
                ex = new Error(format(ERRS.ERR_TEMPLATE_ID_INVALID, self.templateID));
            }
            self.handleError(ex, self);
        };
        Template.prototype._updateBindingSource = function () {
            var bindings = this._getBindings(), len = bindings.length;
            for (var i = 0; i < len; i += 1) {
                var binding = bindings[i];
                if (!binding.isSourceFixed) {
                    binding.source = this.dataContext;
                }
            }
        };
        Template.prototype._cleanUp = function () {
            if (!!this._lfTime) {
                this._lfTime.dispose();
                this._lfTime = null;
            }
            this._templElView = null;
            if (!!this._loadedElem) {
                dom.removeNode(this._loadedElem);
                this._loadedElem = null;
            }
        };
        Template.prototype.findElByDataName = function (name) {
            return arrHelper.fromList(this._el.querySelectorAll(["*[", "data-name", '="', name, '"]'].join("")));
        };
        Template.prototype.findElViewsByDataName = function (name) {
            var els = this.findElByDataName(name), res = [], viewStore = boot.getApp().viewFactory.store;
            els.forEach(function (el) {
                var elView = viewStore.getElView(el);
                if (!!elView) {
                    res.push(elView);
                }
            });
            return res;
        };
        Template.prototype.toString = function () {
            return "ITemplate";
        };
        Object.defineProperty(Template.prototype, "loadedElem", {
            get: function () {
                return this._loadedElem;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Template.prototype, "dataContext", {
            get: function () {
                return this._dataContext;
            },
            set: function (v) {
                if (this._dataContext !== v) {
                    this._dataContext = v;
                    this._updateBindingSource();
                    this.objEvents.raiseProp("dataContext");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Template.prototype, "templateID", {
            get: function () {
                return this._templateID;
            },
            set: function (v) {
                if (this._templateID !== v) {
                    this._templateID = v;
                    this._loadTemplate();
                    this.objEvents.raiseProp("templateID");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Template.prototype, "el", {
            get: function () {
                return this._el;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Template.prototype, "app", {
            get: function () {
                return bootstrap_5.bootstrap.getApp();
            },
            enumerable: true,
            configurable: true
        });
        return Template;
    }(jriapp_shared_13.BaseObject));
});
define("jriapp/utils/lifetime", ["require", "exports", "jriapp_shared"], function (require, exports, jriapp_shared_14) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_14.Utils;
    var LifeTimeScope = (function (_super) {
        __extends(LifeTimeScope, _super);
        function LifeTimeScope() {
            var _this = _super.call(this) || this;
            _this._objs = [];
            return _this;
        }
        LifeTimeScope.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            this._objs.forEach(function (obj) {
                if (!obj.getIsStateDirty()) {
                    obj.dispose();
                }
            });
            this._objs = [];
            _super.prototype.dispose.call(this);
        };
        LifeTimeScope.prototype.addObj = function (b) {
            this._objs.push(b);
        };
        LifeTimeScope.prototype.removeObj = function (b) {
            utils.arr.remove(this._objs, b);
        };
        LifeTimeScope.prototype.getObjs = function () {
            return this._objs;
        };
        LifeTimeScope.prototype.findAll = function (predicate) {
            return this._objs.filter(predicate);
        };
        LifeTimeScope.prototype.findFirst = function (predicate) {
            var arr = this._objs, len = arr.length;
            for (var i = 0; i < len; i += 1) {
                if (predicate(arr[i])) {
                    return arr[i];
                }
            }
            return null;
        };
        LifeTimeScope.prototype.toString = function () {
            return "LifeTimeScope";
        };
        return LifeTimeScope;
    }(jriapp_shared_14.BaseObject));
    exports.LifeTimeScope = LifeTimeScope;
});
define("jriapp/utils/propwatcher", ["require", "exports", "jriapp_shared"], function (require, exports, jriapp_shared_15) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var coreUtils = jriapp_shared_15.Utils.core;
    var PropWatcher = (function (_super) {
        __extends(PropWatcher, _super);
        function PropWatcher() {
            var _this = _super.call(this) || this;
            _this._uniqueID = coreUtils.getNewID("prw");
            _this._objs = [];
            return _this;
        }
        PropWatcher.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            var self = this;
            this._objs.forEach(function (obj) {
                self.removeWatch(obj);
            });
            this._objs = [];
            _super.prototype.dispose.call(this);
        };
        PropWatcher.create = function () {
            return new PropWatcher();
        };
        PropWatcher.prototype.addPropWatch = function (obj, prop, fnOnChange) {
            var self = this;
            obj.objEvents.onProp(prop, function (s, a) {
                fnOnChange(a.property);
            }, self.uniqueID);
            if (self._objs.indexOf(obj) < 0) {
                self._objs.push(obj);
            }
        };
        PropWatcher.prototype.addWatch = function (obj, props, fnOnChange) {
            var self = this;
            obj.objEvents.onProp("*", function (s, a) {
                if (props.indexOf(a.property) > -1) {
                    fnOnChange(a.property);
                }
            }, self.uniqueID);
            if (self._objs.indexOf(obj) < 0) {
                self._objs.push(obj);
            }
        };
        PropWatcher.prototype.removeWatch = function (obj) {
            obj.objEvents.offNS(this.uniqueID);
        };
        PropWatcher.prototype.toString = function () {
            return "PropWatcher " + this._uniqueID;
        };
        Object.defineProperty(PropWatcher.prototype, "uniqueID", {
            get: function () {
                return this._uniqueID;
            },
            enumerable: true,
            configurable: true
        });
        return PropWatcher;
    }(jriapp_shared_15.BaseObject));
    exports.PropWatcher = PropWatcher;
});
define("jriapp/mvvm", ["require", "exports", "jriapp_shared"], function (require, exports, jriapp_shared_16) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var getNewID = jriapp_shared_16.Utils.core.getNewID;
    var CMD_EVENTS;
    (function (CMD_EVENTS) {
        CMD_EVENTS["can_execute_changed"] = "canExecute_changed";
    })(CMD_EVENTS || (CMD_EVENTS = {}));
    var Command = (function (_super) {
        __extends(Command, _super);
        function Command(fnAction, fnCanExecute) {
            var _this = _super.call(this) || this;
            _this._uniqueID = getNewID("cmd");
            _this._action = fnAction;
            _this._predicate = fnCanExecute;
            return _this;
        }
        Command.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            this._action = null;
            this._predicate = null;
            _super.prototype.dispose.call(this);
        };
        Command.prototype._canExecute = function (param) {
            var predicate = this._predicate;
            return !predicate ? true : predicate(param);
        };
        Command.prototype._execute = function (param) {
            var action = this._action;
            if (!!action) {
                action(param);
            }
        };
        Command.prototype.addOnCanExecuteChanged = function (fn, nmspace, context) {
            this.objEvents.on("canExecute_changed", fn, nmspace, context);
        };
        Command.prototype.offOnCanExecuteChanged = function (nmspace) {
            this.objEvents.off("canExecute_changed", nmspace);
        };
        Command.prototype.canExecute = function (param) {
            return this._canExecute(param);
        };
        Command.prototype.execute = function (param) {
            this._execute(param);
        };
        Command.prototype.raiseCanExecuteChanged = function () {
            this.objEvents.raise("canExecute_changed", {});
        };
        Command.prototype.toString = function () {
            return "Command";
        };
        Object.defineProperty(Command.prototype, "uniqueID", {
            get: function () {
                return this._uniqueID;
            },
            enumerable: true,
            configurable: true
        });
        return Command;
    }(jriapp_shared_16.BaseObject));
    exports.Command = Command;
    var BaseCommand = (function (_super) {
        __extends(BaseCommand, _super);
        function BaseCommand(owner) {
            var _this = _super.call(this, null, null) || this;
            _this._owner = owner;
            return _this;
        }
        BaseCommand.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            this._owner = null;
            _super.prototype.dispose.call(this);
        };
        BaseCommand.prototype._canExecute = function (param) {
            return this.isCanExecute(param);
        };
        BaseCommand.prototype._execute = function (param) {
            this.action(param);
        };
        Object.defineProperty(BaseCommand.prototype, "owner", {
            get: function () {
                return this._owner;
            },
            enumerable: true,
            configurable: true
        });
        return BaseCommand;
    }(Command));
    exports.BaseCommand = BaseCommand;
    var ViewModel = (function (_super) {
        __extends(ViewModel, _super);
        function ViewModel(app) {
            var _this = _super.call(this) || this;
            _this._app = app;
            _this._uniqueID = getNewID("vm");
            return _this;
        }
        ViewModel.prototype.addOnDisposed = function (handler, nmspace, context) {
            this.objEvents.addOnDisposed(handler, nmspace, context);
        };
        ViewModel.prototype.offOnDisposed = function (nmspace) {
            this.objEvents.offOnDisposed(nmspace);
        };
        ViewModel.prototype.addOnError = function (handler, nmspace, context) {
            this.objEvents.addOnError(handler, nmspace, context);
        };
        ViewModel.prototype.offOnError = function (nmspace) {
            this.objEvents.offOnError(nmspace);
        };
        ViewModel.prototype.toString = function () {
            return "ViewModel";
        };
        Object.defineProperty(ViewModel.prototype, "uniqueID", {
            get: function () {
                return this._uniqueID;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ViewModel.prototype, "app", {
            get: function () {
                return this._app;
            },
            enumerable: true,
            configurable: true
        });
        return ViewModel;
    }(jriapp_shared_16.BaseObject));
    exports.ViewModel = ViewModel;
});
define("jriapp/utils/mloader", ["require", "exports", "jriapp_shared", "jriapp/utils/sloader"], function (require, exports, jriapp_shared_17, sloader_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_17.Utils, forEachProp = utils.core.forEachProp, startsWith = utils.str.startsWith, _a = utils.defer, _reject = _a.reject, _resolve = _a.resolve, _whenAll = _a.whenAll, createDeferred = _a.createDeferred, arrHelper = utils.arr, CSSPrefix = "css!";
    var _moduleLoader = null;
    function create() {
        if (!_moduleLoader) {
            _moduleLoader = new ModuleLoader();
        }
        return _moduleLoader;
    }
    exports.create = create;
    var LOAD_STATE;
    (function (LOAD_STATE) {
        LOAD_STATE[LOAD_STATE["NONE"] = 0] = "NONE";
        LOAD_STATE[LOAD_STATE["LOADING"] = 1] = "LOADING";
        LOAD_STATE[LOAD_STATE["LOADED"] = 2] = "LOADED";
    })(LOAD_STATE || (LOAD_STATE = {}));
    function whenAll(loads) {
        if (!loads || loads.length === 0) {
            return _resolve(void 0, true);
        }
        if (loads.length === 1) {
            return loads[0].defered.promise();
        }
        var cnt = loads.length;
        var resolved = 0, err = null;
        for (var i = 0; i < cnt; i += 1) {
            if (loads[i].state === 2) {
                ++resolved;
                if (!!loads[i].err) {
                    err = loads[i].err;
                }
            }
        }
        if (resolved === cnt) {
            return !err ? _resolve(void 0, true) : _reject(err);
        }
        else {
            return _whenAll(loads.map(function (load) {
                return load.defered.promise();
            }));
        }
    }
    var ModuleLoader = (function () {
        function ModuleLoader() {
            this._loads = {};
            this._cssLoads = {};
        }
        ModuleLoader.prototype.load = function (names) {
            var self = this;
            var cssNames = names.filter(function (val) { return self.isCSS(val); }), cssLoads = self.loadCSS(cssNames), modNames = names.filter(function (val) { return !self.isCSS(val); }), forLoad = modNames.filter(function (val) {
                return !self._loads[val];
            });
            if (forLoad.length > 0) {
                forLoad.forEach(function (name) {
                    self._loads[name] = {
                        name: name,
                        err: null,
                        state: 1,
                        defered: createDeferred(true)
                    };
                });
                require(forLoad, function () {
                    forLoad.forEach(function (name) {
                        var load = self._loads[name];
                        load.state = 2;
                        load.defered.resolve();
                    });
                }, function (err) {
                    forLoad.forEach(function (name) {
                        var load = self._loads[name];
                        load.state = 2;
                        load.err = err;
                        load.defered.reject(utils.str.format("Error loading modules: {0}", err));
                    });
                });
            }
            var loads = arrHelper.merge([modNames.map(function (name) {
                    return self._loads[name];
                }), cssLoads]);
            return whenAll(loads);
        };
        ModuleLoader.prototype.whenAllLoaded = function () {
            var loads = [];
            forEachProp(this._loads, function (name, val) {
                loads.push(val);
            });
            return whenAll(loads);
        };
        ModuleLoader.prototype.loadCSS = function (names) {
            var self = this, forLoad = names.filter(function (val) {
                return !self._cssLoads[val];
            }), urls = forLoad.map(function (val) {
                return self.getUrl(val);
            });
            if (forLoad.length > 0) {
                var cssLoader = sloader_2.createCssLoader();
                forLoad.forEach(function (name) {
                    self._cssLoads[name] = {
                        name: name,
                        err: null,
                        state: 1,
                        defered: createDeferred(true)
                    };
                });
                cssLoader.loadStyles(urls).then(function () {
                    forLoad.forEach(function (name) {
                        var load = self._cssLoads[name];
                        load.state = 2;
                        load.defered.resolve();
                    });
                }, function (err) {
                    forLoad.forEach(function (name) {
                        var load = self._cssLoads[name];
                        load.state = 2;
                        load.err = err;
                        load.defered.reject(err);
                    });
                });
            }
            var loads = names.map(function (name) {
                return self._cssLoads[name];
            });
            return loads;
        };
        ModuleLoader.prototype.isCSS = function (name) {
            return !!name && startsWith(name, CSSPrefix);
        };
        ModuleLoader.prototype.getUrl = function (name) {
            if (this.isCSS(name)) {
                name = name.substr(CSSPrefix.length);
            }
            return require.toUrl(name);
        };
        return ModuleLoader;
    }());
});
define("jriapp/databindsvc", ["require", "exports", "jriapp_shared", "jriapp/bootstrap", "jriapp/utils/lifetime", "jriapp/utils/dom", "jriapp/utils/mloader", "jriapp/binding", "jriapp/utils/viewchecks", "jriapp/utils/parser"], function (require, exports, jriapp_shared_18, bootstrap_6, lifetime_1, dom_5, mloader_1, binding_1, viewchecks_2, parser_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_18.Utils, createDeferred = utils.defer.createDeferred, viewChecks = viewchecks_2.ViewChecks, dom = dom_5.DomUtils, _a = utils.str, startsWith = _a.startsWith, fastTrim = _a.fastTrim, boot = bootstrap_6.bootstrap, parser = parser_2.Parser, forEachProp = utils.core.forEachProp;
    function createDataBindSvc(root, elViewFactory) {
        return new DataBindingService(root, elViewFactory);
    }
    exports.createDataBindSvc = createDataBindSvc;
    function toBindable(el) {
        var attr;
        var allAttrs = el.attributes, res = {
            el: el,
            needToBind: false,
            dataForm: false,
            bindings: []
        };
        var n = allAttrs.length;
        var dataViewName, hasOptions = false;
        for (var i = 0; i < n; i++) {
            attr = allAttrs[i];
            if (startsWith(attr.name, "data-bind")) {
                res.bindings.push(attr.value);
            }
            if (attr.name === "data-view") {
                dataViewName = attr.value;
            }
            if (attr.name === "data-view-options") {
                hasOptions = true;
            }
        }
        if (dataViewName === "dataform") {
            res.dataForm = true;
        }
        res.needToBind = !!dataViewName || hasOptions || res.bindings.length > 0;
        return res.needToBind ? res : null;
    }
    function getBindables(scope) {
        var result = [], allElems = dom.queryAll(scope, "*");
        allElems.forEach(function (el) {
            var res = toBindable(el);
            if (!!res) {
                result.push(res);
            }
        });
        return result;
    }
    function getRequiredModules(el) {
        var attr = el.getAttribute("data-require");
        if (!attr) {
            return [];
        }
        var reqArr = attr.split(",");
        var hashMap = {};
        reqArr.forEach(function (name) {
            if (!name) {
                return;
            }
            name = fastTrim(name);
            if (!!name) {
                hashMap[name] = name;
            }
        });
        return Object.keys(hashMap);
    }
    function filterBindables(scope, bindElems) {
        var forms = bindElems.filter(function (bindElem) {
            return !!bindElem.dataForm;
        }).map(function (bindElem) {
            return bindElem.el;
        });
        if (forms.length === 0) {
            return bindElems;
        }
        return bindElems.filter(function (bindElem) {
            return !viewChecks.isInNestedForm(scope, forms, bindElem.el);
        });
    }
    var DataBindingService = (function (_super) {
        __extends(DataBindingService, _super);
        function DataBindingService(root, elViewFactory) {
            var _this = _super.call(this) || this;
            _this._root = root;
            _this._elViewFactory = elViewFactory;
            _this._objLifeTime = null;
            _this._mloader = mloader_1.create();
            return _this;
        }
        DataBindingService.prototype.dispose = function () {
            this._cleanUp();
            this._elViewFactory = null;
            this._mloader = null;
            _super.prototype.dispose.call(this);
        };
        DataBindingService.prototype._cleanUp = function () {
            if (!!this._objLifeTime) {
                this._objLifeTime.dispose();
                this._objLifeTime = null;
            }
        };
        DataBindingService.prototype._bindElView = function (args) {
            var self = this;
            args.lftm.addObj(args.elView);
            var bindings = args.bind.bindings;
            if (!!bindings && bindings.length > 0) {
                var bindInfos = parser.parseBindings(bindings), len = bindInfos.length;
                for (var j = 0; j < len; j += 1) {
                    var op = binding_1.getBindingOptions(bindInfos[j], args.elView, args.dataContext);
                    var binding = self.bind(op);
                    args.lftm.addObj(binding);
                }
            }
        };
        DataBindingService.prototype.bindTemplate = function (templateEl, dataContext) {
            var self = this, requiredModules = getRequiredModules(templateEl);
            var res;
            if (requiredModules.length > 0) {
                res = self._mloader.load(requiredModules).then(function () {
                    return self.bindElements({
                        scope: templateEl,
                        bind: 1,
                        dataContext: dataContext
                    });
                });
            }
            else {
                res = self.bindElements({
                    scope: templateEl,
                    bind: 1,
                    dataContext: dataContext
                });
            }
            res.catch(function (err) {
                utils.queue.enque(function () {
                    self.handleError(err, self);
                });
            });
            return res;
        };
        DataBindingService.prototype.bindElements = function (args) {
            var self = this, defer = createDeferred(true), scope = args.scope, lftm = new lifetime_1.LifeTimeScope();
            var bindElems;
            try {
                var rootBindEl = null;
                switch (args.bind) {
                    case 0:
                        bindElems = getBindables(scope);
                        break;
                    case 1:
                        rootBindEl = toBindable(scope);
                        if (!!rootBindEl && !!rootBindEl.dataForm) {
                            bindElems = [rootBindEl];
                        }
                        else {
                            bindElems = getBindables(scope);
                            if (!!rootBindEl) {
                                bindElems.push(rootBindEl);
                            }
                        }
                        break;
                    case 2:
                        bindElems = getBindables(scope);
                        break;
                    default:
                        throw new Error("Invalid Operation");
                }
                var bindables = filterBindables(scope, bindElems);
                var viewsArr = bindables.map(function (bindElem) {
                    var elView = self._elViewFactory.getOrCreateElView(bindElem.el, args.dataContext);
                    self._bindElView({
                        elView: elView,
                        bind: bindElem,
                        lftm: lftm,
                        dataContext: args.dataContext
                    });
                    return elView;
                }).filter(function (v) { return !!v.viewMounted; });
                var viewMap = utils.arr.toMap(viewsArr, function (v) { return v.uniqueID; });
                forEachProp(viewMap, function (n, v) { v.viewMounted(); });
                defer.resolve(lftm);
            }
            catch (err) {
                lftm.dispose();
                self.handleError(err, self);
                setTimeout(function () {
                    defer.reject(new jriapp_shared_18.DummyError(err));
                }, 0);
            }
            return defer.promise();
        };
        DataBindingService.prototype.setUpBindings = function () {
            var bindScope = this._root, dataContext = boot.getApp(), self = this;
            this._cleanUp();
            var promise = this.bindElements({
                scope: bindScope,
                bind: 0,
                dataContext: dataContext
            });
            return promise.then(function (lftm) {
                if (self.getIsStateDirty()) {
                    lftm.dispose();
                    return;
                }
                self._objLifeTime = lftm;
            });
        };
        DataBindingService.prototype.bind = function (opts) {
            return new binding_1.Binding(opts);
        };
        return DataBindingService;
    }(jriapp_shared_18.BaseObject));
});
define("jriapp/app", ["require", "exports", "jriapp_shared", "jriapp/bootstrap", "jriapp/utils/dom", "jriapp/elview", "jriapp/databindsvc"], function (require, exports, jriapp_shared_19, bootstrap_7, dom_6, elview_2, databindsvc_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_19.Utils, dom = dom_6.DomUtils, doc = dom.document, format = utils.str.format, _a = utils.check, isThenable = _a.isThenable, isFunc = _a.isFunc, boot = bootstrap_7.bootstrap, sys = utils.sys, ERRS = jriapp_shared_19.LocaleERRS, _b = utils.core, forEachProp = _b.forEachProp, getNewID = _b.getNewID, memoize = _b.memoize, extend = _b.extend, createDeferred = utils.defer.createDeferred;
    var APP_EVENTS;
    (function (APP_EVENTS) {
        APP_EVENTS["startup"] = "startup";
    })(APP_EVENTS || (APP_EVENTS = {}));
    var AppState;
    (function (AppState) {
        AppState[AppState["None"] = 0] = "None";
        AppState[AppState["Starting"] = 1] = "Starting";
        AppState[AppState["Started"] = 2] = "Started";
        AppState[AppState["Disposed"] = 3] = "Disposed";
        AppState[AppState["Error"] = 4] = "Error";
    })(AppState || (AppState = {}));
    var Application = (function (_super) {
        __extends(Application, _super);
        function Application(options) {
            var _this = _super.call(this) || this;
            if (!options) {
                options = {};
            }
            var self = _this, moduleInits = options.modulesInits || {}, appName = jriapp_shared_19.APP_NAME;
            _this._appName = appName;
            _this._options = options;
            if (!!boot.getApp()) {
                throw new Error(format(ERRS.ERR_APP_NAME_NOT_UNIQUE, appName));
            }
            _this._uniqueID = getNewID("app");
            _this._appState = 0;
            _this._moduleInits = moduleInits;
            _this._viewFactory = elview_2.createElViewFactory(boot.elViewRegister);
            _this._dataBindingService = databindsvc_1.createDataBindSvc(_this.appRoot, _this._viewFactory);
            _this._objMaps = [];
            _this._exports = {};
            _this._UC = {};
            _this._internal = {
                bindTemplate: function (templateEl, dataContext) {
                    return self._dataBindingService.bindTemplate(templateEl, dataContext);
                },
                bindElements: function (args) {
                    return self._dataBindingService.bindElements(args);
                }
            };
            boot._getInternal().registerApp(_this);
            return _this;
        }
        Application.prototype._cleanUpObjMaps = function () {
            var self = this;
            this._objMaps.forEach(function (objMap) {
                forEachProp(objMap, function (name) {
                    var obj = objMap[name];
                    if (sys.isBaseObj(obj)) {
                        if (!obj.getIsDisposed()) {
                            obj.objEvents.offNS(self.uniqueID);
                        }
                    }
                });
            });
            this._objMaps = [];
        };
        Application.prototype._initAppModules = function () {
            var self = this, keys = Object.keys(self._moduleInits);
            keys.forEach(function (key) {
                var initFn = self._moduleInits[key];
                initFn(self);
            });
        };
        Application.prototype.onStartUp = function () {
        };
        Application.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            var self = this;
            try {
                self._appState = 3;
                boot._getInternal().unregisterApp(self);
                self._cleanUpObjMaps();
                self._dataBindingService.dispose();
                self._dataBindingService = null;
                self._viewFactory.dispose();
                self._exports = {};
                self._moduleInits = {};
                self._UC = {};
                self._options = null;
                self._viewFactory = null;
            }
            finally {
                _super.prototype.dispose.call(this);
            }
        };
        Application.prototype._getInternal = function () {
            return this._internal;
        };
        Application.prototype.addOnDisposed = function (handler, nmspace, context) {
            this.objEvents.addOnDisposed(handler, nmspace, context);
        };
        Application.prototype.offOnDisposed = function (nmspace) {
            this.objEvents.offOnDisposed(nmspace);
        };
        Application.prototype.addOnError = function (handler, nmspace, context) {
            this.objEvents.addOnError(handler, nmspace, context);
        };
        Application.prototype.offOnError = function (nmspace) {
            this.objEvents.offOnError(nmspace);
        };
        Application.prototype.addOnStartUp = function (fn, nmspace, context) {
            this.objEvents.on("startup", fn, nmspace, context);
        };
        Application.prototype.offOnStartUp = function (nmspace) {
            this.objEvents.off("startup", nmspace);
        };
        Application.prototype.getExports = function () {
            return this._exports;
        };
        Application.prototype.bind = function (opts) {
            return this._dataBindingService.bind(opts);
        };
        Application.prototype.registerConverter = function (name, obj) {
            var name2 = "cnv." + name;
            if (!boot._getInternal().getObject(this, name2)) {
                boot._getInternal().registerObject(this, name2, obj);
            }
            else {
                throw new Error(format(ERRS.ERR_OBJ_ALREADY_REGISTERED, name));
            }
        };
        Application.prototype.getConverter = function (name) {
            var name2 = "cnv." + name;
            var res = boot._getInternal().getObject(this, name2);
            if (!res) {
                res = boot._getInternal().getObject(boot, name2);
            }
            if (!res) {
                throw new Error(format(ERRS.ERR_CONVERTER_NOTREGISTERED, name));
            }
            return res;
        };
        Application.prototype.registerSvc = function (name, obj) {
            var name2 = "svc." + name;
            return boot._getInternal().registerObject(this, name2, obj);
        };
        Application.prototype.getSvc = function (name) {
            var name2 = "svc." + name, internal = boot._getInternal();
            var obj = internal.getObject(this, name2);
            if (!obj) {
                obj = internal.getObject(boot, name2);
            }
            if (!obj) {
                throw new Error("The service: " + name + " is not registered");
            }
            var res = isFunc(obj) ? obj() : obj;
            if (!res) {
                throw new Error("The factory for service: " + name + " have not returned the service");
            }
            return res;
        };
        Application.prototype.registerElView = function (name, vwType) {
            this._viewFactory.register.registerElView(name, vwType);
        };
        Application.prototype.registerObject = function (name, obj) {
            var self = this, name2 = "obj." + name;
            if (sys.isBaseObj(obj)) {
                obj.objEvents.addOnDisposed(function () {
                    boot._getInternal().unregisterObject(self, name2);
                }, self.uniqueID);
            }
            var objMap = boot._getInternal().registerObject(this, name2, obj);
            if (this._objMaps.indexOf(objMap) < 0) {
                this._objMaps.push(objMap);
            }
        };
        Application.prototype.getObject = function (name) {
            var name2 = "obj." + name, res = boot._getInternal().getObject(this, name2);
            return res;
        };
        Application.prototype.startUp = function (onStartUp) {
            var self = this, deferred = createDeferred();
            if (this._appState !== 0) {
                return deferred.reject(new Error("Application can not be started when state != AppState.None"));
            }
            var fnStartApp = function () {
                try {
                    self._initAppModules();
                    var onStartupRes1 = self.onStartUp();
                    var setupPromise1 = void 0;
                    if (isThenable(onStartupRes1)) {
                        setupPromise1 = onStartupRes1;
                    }
                    else {
                        setupPromise1 = createDeferred().resolve();
                    }
                    var promise_1 = setupPromise1.then(function () {
                        self.objEvents.raise("startup", {});
                        var onStartupRes2 = (!!onStartUp) ? onStartUp.apply(self, [self]) : null;
                        var setupPromise2;
                        if (utils.check.isThenable(onStartupRes2)) {
                            setupPromise2 = onStartupRes2.then(function () {
                                return self._dataBindingService.setUpBindings();
                            }, function (err) {
                                deferred.reject(err);
                            });
                        }
                        else {
                            setupPromise2 = self._dataBindingService.setUpBindings();
                        }
                        return setupPromise2;
                    });
                    promise_1.then(function () {
                        deferred.resolve(self);
                    }, function (err) {
                        deferred.reject(err);
                    });
                }
                catch (ex) {
                    deferred.reject(ex);
                }
            };
            this._appState = 1;
            var promise = deferred.promise().then(function () {
                self._appState = 2;
                return self;
            }, function (err) {
                self._appState = 4;
                throw err;
            });
            try {
                if (!!onStartUp && !utils.check.isFunc(onStartUp)) {
                    throw new Error(ERRS.ERR_APP_SETUP_INVALID);
                }
                boot.templateLoader.waitForNotLoading(fnStartApp, null);
            }
            catch (ex) {
                deferred.reject(ex);
            }
            return promise;
        };
        Application.prototype.loadTemplates = function (url) {
            return this.loadTemplatesAsync(function () { return utils.http.getAjax(url); });
        };
        Application.prototype.loadTemplatesAsync = function (fnLoader) {
            return boot.templateLoader.loadTemplatesAsync(fnLoader, this);
        };
        Application.prototype.registerTemplateLoader = function (name, fnLoader) {
            boot.templateLoader.registerTemplateLoader(this.appName + "." + name, {
                fn_loader: fnLoader
            });
        };
        Application.prototype.registerTemplateById = function (name, templateId) {
            this.registerTemplateLoader(name, memoize(function () {
                var deferred = createDeferred(true), el = dom.queryOne(doc, "#" + templateId);
                if (!el) {
                    throw new Error(format(ERRS.ERR_TEMPLATE_ID_INVALID, templateId));
                }
                var str = el.innerHTML;
                deferred.resolve(str);
                return deferred.promise();
            }));
        };
        Application.prototype.getTemplateLoader = function (name) {
            var res = boot.templateLoader.getTemplateLoader(this.appName + "." + name);
            if (!res) {
                res = boot.templateLoader.getTemplateLoader(name);
                if (!res) {
                    return function () { return utils.defer.reject(new Error(format(ERRS.ERR_TEMPLATE_NOTREGISTERED, name))); };
                }
            }
            return res;
        };
        Application.prototype.registerTemplateGroup = function (name, group) {
            var group2 = extend({
                fn_loader: null,
                url: null,
                names: null,
                promise: null,
                app: this
            }, group);
            boot.templateLoader.registerTemplateGroup(this.appName + "." + name, group2);
        };
        Application.prototype.toString = function () {
            return "Application: " + this.appName;
        };
        Object.defineProperty(Application.prototype, "uniqueID", {
            get: function () {
                return this._uniqueID;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Application.prototype, "options", {
            get: function () {
                return this._options;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Application.prototype, "appName", {
            get: function () {
                return this._appName;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Application.prototype, "appRoot", {
            get: function () {
                return (!this._options || !this._options.appRoot) ? doc : this._options.appRoot;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Application.prototype, "viewFactory", {
            get: function () {
                return this._viewFactory;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Application.prototype, "UC", {
            get: function () {
                return this._UC;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Application.prototype, "app", {
            get: function () {
                return this;
            },
            enumerable: true,
            configurable: true
        });
        return Application;
    }(jriapp_shared_19.BaseObject));
    exports.Application = Application;
});
define("jriapp", ["require", "exports", "jriapp/bootstrap", "jriapp_shared", "jriapp_shared/collection/const", "jriapp_shared/collection/int", "jriapp_shared/utils/jsonbag", "jriapp_shared/utils/deferred", "jriapp/const", "jriapp/utils/dom", "jriapp/utils/viewchecks", "jriapp/converter", "jriapp/bootstrap", "jriapp/binding", "jriapp/template", "jriapp/utils/lifetime", "jriapp/utils/propwatcher", "jriapp/mvvm", "jriapp/app"], function (require, exports, bootstrap_8, jriapp_shared_20, const_1, int_3, jsonbag_1, deferred_2, const_2, dom_7, viewchecks_3, converter_1, bootstrap_9, binding_2, template_1, lifetime_2, propwatcher_1, mvvm_1, app_1) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    __export(jriapp_shared_20);
    __export(const_1);
    __export(int_3);
    __export(jsonbag_1);
    exports.Promise = deferred_2.Promise;
    exports.KEYS = const_2.KEYS;
    exports.BINDING_MODE = const_2.BINDING_MODE;
    exports.BindTo = const_2.BindTo;
    exports.SubscribeFlags = const_2.SubscribeFlags;
    exports.DOM = dom_7.DomUtils;
    exports.ViewChecks = viewchecks_3.ViewChecks;
    exports.BaseConverter = converter_1.BaseConverter;
    exports.bootstrap = bootstrap_9.bootstrap;
    exports.subscribeWeakMap = bootstrap_9.subscribeWeakMap;
    exports.selectableProviderWeakMap = bootstrap_9.selectableProviderWeakMap;
    exports.Binding = binding_2.Binding;
    exports.createTemplate = template_1.createTemplate;
    exports.LifeTimeScope = lifetime_2.LifeTimeScope;
    exports.PropWatcher = propwatcher_1.PropWatcher;
    exports.ViewModel = mvvm_1.ViewModel;
    exports.BaseCommand = mvvm_1.BaseCommand;
    exports.Command = mvvm_1.Command;
    exports.Application = app_1.Application;
    exports.VERSION = "2.16.6";
    bootstrap_8.Bootstrap._initFramework();
});
