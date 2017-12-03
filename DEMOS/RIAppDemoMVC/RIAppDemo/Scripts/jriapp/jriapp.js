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
    exports.TOOLTIP_SVC = "tooltipSVC";
    exports.DATEPICKER_SVC = "IDatepicker";
    var STORE_KEY;
    (function (STORE_KEY) {
        STORE_KEY["SVC"] = "svc.";
        STORE_KEY["CONVERTER"] = "cnv.";
        STORE_KEY["OBJECT"] = "obj.";
    })(STORE_KEY = exports.STORE_KEY || (exports.STORE_KEY = {}));
    var DATA_ATTR;
    (function (DATA_ATTR) {
        DATA_ATTR["DATA_BIND"] = "data-bind";
        DATA_ATTR["DATA_VIEW"] = "data-view";
        DATA_ATTR["DATA_EVENT_SCOPE"] = "data-scope";
        DATA_ATTR["DATA_ITEM_KEY"] = "data-key";
        DATA_ATTR["DATA_CONTENT"] = "data-content";
        DATA_ATTR["DATA_COLUMN"] = "data-column";
        DATA_ATTR["DATA_NAME"] = "data-name";
        DATA_ATTR["DATA_FORM"] = "data-form";
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
    ;
    var LOADER_GIF;
    (function (LOADER_GIF) {
        LOADER_GIF["Small"] = "loader2.gif";
        LOADER_GIF["Default"] = "loader.gif";
    })(LOADER_GIF = exports.LOADER_GIF || (exports.LOADER_GIF = {}));
    var BindTo;
    (function (BindTo) {
        BindTo[BindTo["Source"] = 0] = "Source";
        BindTo[BindTo["Target"] = 1] = "Target";
    })(BindTo = exports.BindTo || (exports.BindTo = {}));
    var BINDING_MODE;
    (function (BINDING_MODE) {
        BINDING_MODE[BINDING_MODE["OneTime"] = 0] = "OneTime";
        BINDING_MODE[BINDING_MODE["OneWay"] = 1] = "OneWay";
        BINDING_MODE[BINDING_MODE["TwoWay"] = 2] = "TwoWay";
        BINDING_MODE[BINDING_MODE["BackWay"] = 3] = "BackWay";
    })(BINDING_MODE = exports.BINDING_MODE || (exports.BINDING_MODE = {}));
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
define("jriapp/utils/parser", ["require", "exports", "jriapp_shared"], function (require, exports, jriapp_shared_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var checks = jriapp_shared_1.Utils.check, strUtils = jriapp_shared_1.Utils.str, coreUtils = jriapp_shared_1.Utils.core, sys = jriapp_shared_1.Utils.sys;
    var trimOuterBracesRX = /^([{]){0,1}|([}]){0,1}$/g;
    var VAL_DELIMETER1 = ":", VAL_DELIMETER2 = "=", KEY_VAL_DELIMETER = ",";
    function trimOuterBraces(val) {
        return strUtils.trim(val.replace(trimOuterBracesRX, ""));
    }
    function isInsideBraces(str) {
        return (strUtils.startsWith(str, "{") && strUtils.endsWith(str, "}"));
    }
    var Parser = (function () {
        function Parser() {
        }
        Parser._checkKeyVal = function (kv) {
            if (kv.val === "" && strUtils.startsWith(kv.key, "this.")) {
                kv.val = kv.key.substr(5);
                kv.key = "targetPath";
            }
        };
        Parser._addKeyVal = function (kv, parts) {
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
        Parser._getKeyVals = function (val) {
            var self = Parser;
            var i, ch, literal, parts = [], kv = { key: "", val: "" }, isKey = true;
            var vd1 = VAL_DELIMETER1, vd2 = VAL_DELIMETER2, kvd = KEY_VAL_DELIMETER;
            for (i = 0; i < val.length; i += 1) {
                ch = val.charAt(i);
                if (ch === "'" || ch === '"') {
                    if (!literal) {
                        literal = ch;
                    }
                    else if (literal === ch) {
                        literal = null;
                    }
                }
                if (!literal && ch === "{" && !isKey) {
                    var bracePart = val.substr(i);
                    var braceParts = self.getBraceParts(bracePart, true);
                    if (braceParts.length > 0) {
                        bracePart = braceParts[0];
                        kv.val += bracePart;
                        i += bracePart.length - 1;
                    }
                    else {
                        throw new Error(strUtils.format(jriapp_shared_1.LocaleERRS.ERR_EXPR_BRACES_INVALID, bracePart));
                    }
                    continue;
                }
                if (!literal && ch === kvd) {
                    if (!!kv.key) {
                        self._addKeyVal(kv, parts);
                        kv = { key: "", val: "" };
                        isKey = true;
                    }
                }
                else if (!literal && (ch === vd1 || ch === vd2)) {
                    isKey = false;
                }
                else {
                    if (isKey) {
                        kv.key += ch;
                    }
                    else {
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
                return kv.val !== "";
            });
            return parts;
        };
        Parser.resolveSource = function (root, srcParts) {
            var self = Parser;
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
        };
        Parser.getBraceParts = function (val, firstOnly) {
            var i, s = "", ch, literal, cnt = 0;
            var parts = [];
            for (i = 0; i < val.length; i += 1) {
                ch = val.charAt(i);
                if (ch === "'" || ch === '"') {
                    if (!literal) {
                        literal = ch;
                    }
                    else if (literal === ch) {
                        literal = null;
                    }
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
                        if (firstOnly) {
                            return parts;
                        }
                    }
                }
                else {
                    if (cnt > 0) {
                        s += ch;
                    }
                }
            }
            return parts;
        };
        Parser.parseOption = function (part) {
            var self = Parser, res = {};
            part = strUtils.trim(part);
            if (isInsideBraces(part)) {
                part = trimOuterBraces(part);
            }
            var kvals = self._getKeyVals(part);
            kvals.forEach(function (kv) {
                var isString = checks.isString(kv.val);
                if (isString && isInsideBraces(kv.val)) {
                    res[kv.key] = self.parseOption(kv.val);
                }
                else {
                    if (isString) {
                        res[kv.key] = strUtils.trimQuotes(kv.val);
                    }
                    else {
                        res[kv.key] = kv.val;
                    }
                }
            });
            return res;
        };
        Parser.parseOptions = function (str) {
            var self = Parser, res = [];
            str = strUtils.trim(str);
            var parts = [str];
            if (isInsideBraces(str)) {
                parts = self.getBraceParts(str, false);
            }
            parts.forEach(function (part) {
                res.push(self.parseOption(part));
            });
            return res;
        };
        return Parser;
    }());
    exports.Parser = Parser;
});
define("jriapp/elview", ["require", "exports", "jriapp_shared", "jriapp/bootstrap", "jriapp/utils/parser"], function (require, exports, jriapp_shared_2, bootstrap_1, parser_1) {
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
        ElViewRegister.prototype.registerElView = function (name, vwType) {
            if (!bootstrap_1.bootstrap._getInternal().getObject(this, name)) {
                bootstrap_1.bootstrap._getInternal().registerObject(this, name, vwType);
            }
            else {
                throw new Error(utils.str.format(ERRS.ERR_OBJ_ALREADY_REGISTERED, name));
            }
        };
        ElViewRegister.prototype.getElViewType = function (name) {
            var res = bootstrap_1.bootstrap._getInternal().getObject(this, name);
            if (!res && !!this._next) {
                res = this._next.getElViewType(name);
            }
            return res;
        };
        ElViewRegister.prototype.dispose = function () {
            this._exports = {};
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
            var options = viewInfo.options, el = options.el;
            if (!!viewInfo.name) {
                viewType = this._register.getElViewType(viewInfo.name);
                if (!viewType) {
                    throw new Error(utils.str.format(ERRS.ERR_ELVIEW_NOT_REGISTERED, viewInfo.name));
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
                elView = new viewType(options);
            }
            catch (e) {
                this._store.setElView(el, null);
                throw e;
            }
            return elView;
        };
        ElViewFactory.prototype.getOrCreateElView = function (el) {
            var elView = this.store.getElView(el);
            if (!!elView) {
                return elView;
            }
            var info = this.getElementViewInfo(el);
            return this.createElView(info);
        };
        ElViewFactory.prototype.getElementViewInfo = function (el) {
            var viewName = null, vwOptions = null, attr, dataViewOpArr, dataViewOp;
            if (el.hasAttribute("data-view")) {
                attr = el.getAttribute("data-view");
                dataViewOpArr = parser.parseOptions(attr);
                if (!!dataViewOpArr && dataViewOpArr.length > 0) {
                    dataViewOp = dataViewOpArr[0];
                    if (!!dataViewOp.name && dataViewOp.name !== "default") {
                        viewName = dataViewOp.name;
                    }
                    vwOptions = dataViewOp.options;
                }
            }
            var options = utils.core.merge({ el: el }, vwOptions);
            return { name: viewName, options: options };
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
    var utils = jriapp_shared_4.Utils, strUtils = utils.str;
    var PROP_NAME;
    (function (PROP_NAME) {
        PROP_NAME["dateFormat"] = "dateFormat";
        PROP_NAME["timeFormat"] = "timeFormat";
        PROP_NAME["dateTimeFormat"] = "dateTimeFormat";
        PROP_NAME["datepicker"] = "datepicker";
        PROP_NAME["imagesPath"] = "imagesPath";
        PROP_NAME["decimalPoint"] = "decimalPoint";
        PROP_NAME["thousandSep"] = "thousandSep";
        PROP_NAME["decPrecision"] = "decPrecision";
    })(PROP_NAME || (PROP_NAME = {}));
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
            get: function () { return this._dateFormat; },
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
            get: function () { return this._timeFormat; },
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
            get: function () { return this._dateTimeFormat; },
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
            get: function () { return this._imagesPath; },
            set: function (v) {
                if (!v) {
                    v = "";
                }
                if (this._imagesPath !== v) {
                    if (!strUtils.endsWith(v, "/")) {
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
            get: function () { return this._decimalPoint; },
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
            get: function () { return this._thousandSep; },
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
            get: function () { return this._decPrecision; },
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
    var utils = jriapp_shared_5.Utils, checks = utils.check, coreUtils = utils.core, strUtils = utils.str, defer = utils.defer, ERRS = jriapp_shared_5.LocaleERRS, DEBUG = utils.debug, LOG = utils.log, http = utils.http;
    var PROP_NAME;
    (function (PROP_NAME) {
        PROP_NAME["isLoading"] = "isLoading";
    })(PROP_NAME || (PROP_NAME = {}));
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
            return coreUtils.getValue(this._templateGroups, name);
        };
        TemplateLoader.prototype._registerTemplateLoaderCore = function (name, loader) {
            coreUtils.setValue(this._templateLoaders, name, loader, false);
        };
        TemplateLoader.prototype._getTemplateLoaderCore = function (name) {
            return coreUtils.getValue(this._templateLoaders, name);
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
            coreUtils.removeValue(this._templateLoaders, name);
        };
        TemplateLoader.prototype.unRegisterTemplateGroup = function (name) {
            coreUtils.removeValue(this._templateGroups, name);
        };
        TemplateLoader.prototype.registerTemplateLoader = function (name, loader) {
            var self = this;
            loader = coreUtils.extend({
                fn_loader: null,
                groupName: null
            }, loader);
            if (!loader.groupName && !checks.isFunc(loader.fn_loader)) {
                throw new Error(strUtils.format(ERRS.ERR_ASSERTION_FAILED, "fn_loader is Function"));
            }
            var prevLoader = self._getTemplateLoaderCore(name);
            if (!!prevLoader) {
                if ((!prevLoader.fn_loader && !!prevLoader.groupName) && (!loader.groupName && !!loader.fn_loader)) {
                    return self._registerTemplateLoaderCore(name, loader);
                }
                throw new Error(strUtils.format(ERRS.ERR_TEMPLATE_ALREADY_REGISTERED, name));
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
                    throw new Error(strUtils.format(ERRS.ERR_TEMPLATE_GROUP_NOTREGISTERED, loader.groupName));
                }
                return function () {
                    if (!group_1.promise) {
                        group_1.promise = self.loadTemplatesAsync(group_1.fn_loader, group_1.app);
                    }
                    var deferred = defer.createDeferred(true);
                    group_1.promise.then(function () {
                        group_1.promise = null;
                        group_1.names.forEach(function (name) {
                            if (!!group_1.app) {
                                name = group_1.app.appName + "." + name;
                            }
                            var loader = self._getTemplateLoaderCore(name);
                            if (!loader || !loader.fn_loader) {
                                var error = strUtils.format(ERRS.ERR_TEMPLATE_NOTREGISTERED, name);
                                if (DEBUG.isDebugging()) {
                                    LOG.error(error);
                                }
                                throw new Error(error);
                            }
                        });
                        var loader = self._getTemplateLoaderCore(name);
                        if (!loader || !loader.fn_loader) {
                            var error = strUtils.format(ERRS.ERR_TEMPLATE_NOTREGISTERED, name);
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
            var self = this, group2 = coreUtils.extend({
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
            coreUtils.setValue(self._templateGroups, groupName, group2, true);
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
            this.loadTemplatesAsync(function () { return http.getAjax(url); }, null);
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
    var utils = jriapp_shared_6.Utils, checks = utils.check, arrHelper = utils.arr, strUtils = utils.str, debug = utils.debug, ERRS = jriapp_shared_6.LocaleERRS;
    var EventWrap = (function () {
        function EventWrap(ev, target) {
            this._ev = ev;
            this._target = target;
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
                return this._ev.cancelBubble;
            },
            set: function (v) {
                this._ev.cancelBubble = v;
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
        EventWrap.prototype.preventDefault = function () { this._ev.preventDefault(); };
        EventWrap.prototype.stopPropagation = function () { this._ev.stopPropagation(); };
        EventWrap.prototype.stopImmediatePropagation = function () { this._ev.stopImmediatePropagation(); };
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
                throw new Error(strUtils.format(ERRS.ERR_ASSERTION_FAILED, "ev is a valid object"));
            }
            if (!checks.isFunc(handler)) {
                throw new Error(ERRS.ERR_EVENT_INVALID_FUNC);
            }
            if (!name) {
                throw new Error(strUtils.format(ERRS.ERR_EVENT_INVALID, "[Empty]"));
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
        EventHelper.getDelegateListener = function (root, fnMatch, listener) {
            var res = function (event) {
                var target = event.target;
                while (!!target && target !== root) {
                    if (fnMatch(target)) {
                        var eventCopy = new EventWrap(event, target);
                        listener.apply(target, [eventCopy]);
                        return;
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
        return (!a) ? false : checks.isFunc(a.matchElement);
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
                if (checks.isString(args)) {
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
                if (checks.isNt(useCapture) || (useCapture === handler.useCapture)) {
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
    var arrHelper = jriapp_shared_7.Utils.arr, win = window, doc = win.document, queue = jriapp_shared_7.Utils.queue, hasClassList = (!!window.document.documentElement.classList), weakmap = jriapp_shared_7.createWeakMap();
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
            parent.insertBefore(node, refNode);
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
                arr[i] = arr[i].trim();
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
                var name = v.trim();
                if (!name) {
                    return;
                }
                var op = v.charAt(0);
                if (op == "+" || op == "-") {
                    name = v.substr(1).trim();
                }
                if (!name) {
                    return;
                }
                var arr = name.split(" ");
                for (var i = 0; i < arr.length; i += 1) {
                    var v2 = arr[i].trim();
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
                _arr[i] = _arr[i].trim();
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
    var utils = jriapp_shared_8.Utils, doc = dom_1.DomUtils.document, arrHelper = utils.arr, strUtils = utils.str;
    exports.frameworkJS = int_2.Config.frameworkJS || "jriapp.js";
    var stylesDir = "css", imageDir = "img";
    function fn_getFrameworkPath() {
        var name = exports.frameworkJS;
        var arr = arrHelper.fromList(doc.scripts);
        for (var i = 0; i < arr.length; i += 1) {
            var script = arr[i];
            if (!!script.src) {
                var parts = PathHelper.getUrlParts(script.src);
                var pathName = strUtils.rtrim(parts.pathname, "/");
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
            search = strUtils.ltrim(search, "?");
            var parts = PathHelper.getUrlParts(url);
            var oldSearch = strUtils.ltrim(parts.search, "?");
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
                throw new Error(strUtils.format("Can not resolve {0} framework path", name));
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
    var _async = async_1.AsyncUtils, utils = jriapp_shared_9.Utils, dom = dom_2.DomUtils, arrHelper = utils.arr, doc = dom.document, head = doc.head || doc.getElementsByTagName("head")[0];
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
            return _async.resolve(void 0, true);
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
        return (resolved === cnt) ? _async.resolve(void 0, true) : _async.whenAll(promises);
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
            var deferred = _async.createDeferred(true);
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
    var utils = jriapp_shared_10.Utils, dom = dom_3.DomUtils, win = dom.window, doc = win.document, _async = utils.defer, coreUtils = utils.core, strUtils = utils.str, ERROR = utils.err, ERRS = jriapp_shared_10.LocaleERRS;
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
    var _TEMPLATE_SELECTOR = 'script[type="text/html"]';
    var _stylesLoader = sloader_1.createCssLoader();
    var GLOB_EVENTS;
    (function (GLOB_EVENTS) {
        GLOB_EVENTS["load"] = "load";
        GLOB_EVENTS["unload"] = "unload";
        GLOB_EVENTS["initialized"] = "initialize";
    })(GLOB_EVENTS || (GLOB_EVENTS = {}));
    var PROP_NAME;
    (function (PROP_NAME) {
        PROP_NAME["curSelectable"] = "currentSelectable";
        PROP_NAME["isReady"] = "isReady";
    })(PROP_NAME || (PROP_NAME = {}));
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
            _this._appInst = null;
            _this._currentSelectable = null;
            _this._objId = coreUtils.getNewID("app");
            _this._exports = {};
            _this._moduleInits = [];
            _this._templateLoader = null;
            _this._templateLoader = new tloader_1.TemplateLoader();
            _this._templateLoader.addOnLoaded(function (s, a) {
                if (!s) {
                    throw new Error("Invalid operation");
                }
                self._onTemplateLoaded(a.html, a.app);
            });
            _this._templateLoader.objEvents.addOnError(function (s, a) {
                if (!s) {
                    throw new Error("Invalid operation");
                }
                return self.handleError(a.error, a.source);
            });
            _this._elViewRegister = elview_1.createElViewRegister(null);
            _this._contentFactory = content_1.createContentFactoryList();
            _this._internal = {
                initialize: function () {
                    return self._initialize();
                },
                trackSelectable: function (selectable) {
                    self._trackSelectable(selectable);
                },
                untrackSelectable: function (selectable) {
                    self._untrackSelectable(selectable);
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
        Bootstrap.prototype._bindGlobalEvents = function () {
            var self = this;
            dom.events.on(doc, "click", function (e) {
                e.stopPropagation();
                self.currentSelectable = null;
            }, this._objId);
            dom.events.on(doc, "keydown", function (e) {
                e.stopPropagation();
                if (!!self._currentSelectable) {
                    self._currentSelectable.getISelectable().onKeyDown(e.which, e);
                }
            }, this._objId);
            dom.events.on(doc, "keyup", function (e) {
                e.stopPropagation();
                if (!!self._currentSelectable) {
                    self._currentSelectable.getISelectable().onKeyUp(e.which, e);
                }
            }, this._objId);
            dom.events.on(win, "beforeunload", function () {
                self.objEvents.raise("unload", {});
            }, this._objId);
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
            this._processTemplates(divEl, app);
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
            var self = this, deferred = _async.createDeferred(true), res = strUtils.fastTrim(html);
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
                return _async.delay(function () {
                    if (self.getIsStateDirty()) {
                        throw new Error("Bootstrap is in destroyed state");
                    }
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
        Bootstrap.prototype._trackSelectable = function (selectable) {
            var self = this, isel = selectable.getISelectable(), el = isel.getContainerEl();
            dom.events.on(el, "click", function (e) {
                e.stopPropagation();
                var target = e.target;
                if (dom.isContained(target, el)) {
                    self.currentSelectable = selectable;
                }
            }, isel.getUniqueID());
        };
        Bootstrap.prototype._untrackSelectable = function (selectable) {
            var isel = selectable.getISelectable(), el = isel.getContainerEl();
            dom.events.off(el, "click", isel.getUniqueID());
            if (this.currentSelectable === selectable) {
                this.currentSelectable = null;
            }
        };
        Bootstrap.prototype._registerApp = function (app) {
            if (!!this._appInst) {
                throw new Error("Application already registered");
            }
            this._appInst = app;
            ERROR.addHandler(app.appName, app);
        };
        Bootstrap.prototype._unregisterApp = function (app) {
            if (!this._appInst || this._appInst.appName !== app.appName) {
                throw new Error("Invalid operation");
            }
            try {
                ERROR.removeHandler(app.appName);
                this.templateLoader.unRegisterTemplateGroup(app.appName);
                this.templateLoader.unRegisterTemplateLoader(app.appName);
            }
            finally {
                this._appInst = null;
            }
        };
        Bootstrap.prototype._destroyApp = function () {
            var self = this, app = self._appInst;
            if (!!app && !app.getIsStateDirty()) {
                app.dispose();
            }
        };
        Bootstrap.prototype._registerObject = function (root, name, obj) {
            coreUtils.setValue(root.getExports(), name, obj, true);
        };
        Bootstrap.prototype._unregisterObject = function (root, name) {
            return coreUtils.removeValue(root.getExports(), name);
        };
        Bootstrap.prototype._getObject = function (root, name) {
            return coreUtils.getValue(root.getExports(), name);
        };
        Bootstrap.prototype._getConverter = function (name) {
            var name2 = "cnv." + name;
            var res = this._getObject(this, name2);
            if (!res) {
                throw new Error(strUtils.format(ERRS.ERR_CONVERTER_NOTREGISTERED, name));
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
            return this._appInst;
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
            var self = this, deferred = _async.createDeferred(), promise = deferred.promise();
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
            dom.events.offNS(doc, this._objId);
            dom.events.offNS(win, this._objId);
            win.onerror = null;
            ERROR.removeHandler("*");
            this._bootState = 5;
            _super.prototype.dispose.call(this);
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
            var name2 = "svc." + name;
            return this._getObject(this, name2);
        };
        Bootstrap.prototype.registerConverter = function (name, obj) {
            var name2 = "cnv." + name;
            if (!this._getObject(this, name2)) {
                this._registerObject(this, name2, obj);
            }
            else {
                throw new Error(strUtils.format(ERRS.ERR_OBJ_ALREADY_REGISTERED, name));
            }
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
            get: function () { return _stylesLoader; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Bootstrap.prototype, "elViewRegister", {
            get: function () { return this._elViewRegister; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Bootstrap.prototype, "contentFactory", {
            get: function () { return this._contentFactory; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Bootstrap.prototype, "templateLoader", {
            get: function () { return this._templateLoader; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Bootstrap.prototype, "currentSelectable", {
            get: function () {
                return this._currentSelectable;
            },
            set: function (v) {
                if (this._currentSelectable !== v) {
                    this._currentSelectable = v;
                    this.objEvents.raiseProp("currentSelectable");
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
    var ViewChecks = (function () {
        function ViewChecks() {
        }
        ViewChecks.isElView = function () { return false; };
        ViewChecks.isTemplateElView = function () { return false; };
        ViewChecks.setIsInsideTemplate = function () { };
        ViewChecks.isDataForm = function () { return false; };
        ViewChecks.isInsideDataForm = function () { return false; };
        ViewChecks.isInNestedForm = function () { return false; };
        ViewChecks.getParentDataForm = function () { return null; };
        return ViewChecks;
    }());
    exports.ViewChecks = ViewChecks;
});
define("jriapp/converter", ["require", "exports", "jriapp_shared", "jriapp/bootstrap"], function (require, exports, jriapp_shared_11, bootstrap_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_11.Utils, checks = utils.check, strUtils = utils.str, coreUtils = utils.core, boot = bootstrap_2.bootstrap, ERRS = jriapp_shared_11.LocaleERRS;
    exports.NUM_CONV = { None: 0, Integer: 1, Decimal: 2, Float: 3, SmallInt: 4 };
    var BaseConverter = (function () {
        function BaseConverter() {
        }
        BaseConverter.prototype.convertToSource = function (val, param, dataContext) {
            return val;
        };
        BaseConverter.prototype.convertToTarget = function (val, param, dataContext) {
            return (checks.isNt(val)) ? null : val;
        };
        return BaseConverter;
    }());
    exports.BaseConverter = BaseConverter;
    ;
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
            if (checks.isNt(val)) {
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
    ;
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
                throw new Error(strUtils.format(ERRS.ERR_CONV_INVALID_DATE, val));
            }
            return m.toDate();
        };
        DateTimeConverter.prototype.convertToTarget = function (val, param, dataContext) {
            if (checks.isNt(val)) {
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
    ;
    var dateTimeConverter = new DateTimeConverter();
    var NumberConverter = (function () {
        function NumberConverter() {
        }
        NumberConverter.prototype.convertToSource = function (val, param, dataContext) {
            if (checks.isNt(val)) {
                return null;
            }
            var defaults = bootstrap_2.bootstrap.defaults, dp = defaults.decimalPoint, thousandSep = defaults.thousandSep;
            var prec = 4;
            var value = val.replace(thousandSep, "");
            value = value.replace(dp, ".");
            value = strUtils.stripNonNumeric(value);
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
                    num = coreUtils.round(parseFloat(value), prec);
                    break;
                case exports.NUM_CONV.Float:
                    num = parseFloat(value);
                    break;
                default:
                    num = Number(value);
                    break;
            }
            if (!checks.isNumber(num)) {
                throw new Error(strUtils.format(ERRS.ERR_CONV_INVALID_NUM, val));
            }
            return num;
        };
        NumberConverter.prototype.convertToTarget = function (val, param, dataContext) {
            if (checks.isNt(val)) {
                return "";
            }
            var defaults = bootstrap_2.bootstrap.defaults, dp = defaults.decimalPoint, thousandSep = defaults.thousandSep;
            var prec;
            switch (param) {
                case exports.NUM_CONV.Integer:
                    prec = 0;
                    return strUtils.formatNumber(val, prec, dp, thousandSep);
                case exports.NUM_CONV.Decimal:
                    prec = defaults.decPrecision;
                    return strUtils.formatNumber(val, prec, dp, thousandSep);
                case exports.NUM_CONV.SmallInt:
                    prec = 0;
                    return strUtils.formatNumber(val, prec, dp, "");
                case exports.NUM_CONV.Float:
                    return strUtils.formatNumber(val, null, dp, thousandSep);
                default:
                    return strUtils.formatNumber(val, null, dp, thousandSep);
            }
        };
        NumberConverter.prototype.toString = function () {
            return "NumberConverter";
        };
        return NumberConverter;
    }());
    exports.NumberConverter = NumberConverter;
    ;
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
    ;
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
    ;
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
    ;
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
    ;
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
define("jriapp/binding", ["require", "exports", "jriapp_shared", "jriapp/utils/viewchecks", "jriapp/utils/parser", "jriapp/bootstrap"], function (require, exports, jriapp_shared_12, viewchecks_1, parser_2, bootstrap_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_12.Utils, checks = utils.check, strUtils = utils.str, coreUtils = utils.core, sys = utils.sys, debug = utils.debug, log = utils.log, parser = parser_2.Parser, boot = bootstrap_3.bootstrap, ERRS = jriapp_shared_12.LocaleERRS, viewChecks = viewchecks_1.ViewChecks;
    sys.isBinding = function (obj) {
        return (!!obj && obj instanceof Binding);
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
    var bindModeMap = {
        OneTime: 0,
        OneWay: 1,
        TwoWay: 2,
        BackWay: 3
    };
    function getBindingOptions(bindInfo, defaultTarget, defaultSource) {
        var bindingOpts = {
            mode: 1,
            converterParam: null,
            converter: null,
            targetPath: null,
            sourcePath: null,
            target: null,
            source: null,
            isSourceFixed: false
        };
        var converter;
        var app = boot.getApp();
        if (checks.isString(bindInfo.converter)) {
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
        if (!!bindInfo.converterParam) {
            bindingOpts.converterParam = bindInfo.converterParam;
        }
        if (!!bindInfo.mode) {
            bindingOpts.mode = bindModeMap[bindInfo.mode];
        }
        if (!!converter) {
            bindingOpts.converter = converter;
        }
        if (!fixedTarget) {
            bindingOpts.target = defaultTarget;
        }
        else {
            if (checks.isString(fixedTarget)) {
                if (fixedTarget === "this") {
                    bindingOpts.target = defaultTarget;
                }
                else {
                    bindingOpts.target = parser.resolveSource(app, sys.getPathParts(fixedTarget));
                }
            }
            else {
                bindingOpts.target = fixedTarget;
            }
        }
        if (!fixedSource) {
            bindingOpts.source = defaultSource;
        }
        else {
            bindingOpts.isSourceFixed = true;
            if (checks.isString(fixedSource)) {
                if (fixedSource === "this") {
                    bindingOpts.source = defaultTarget;
                }
                else {
                    bindingOpts.source = parser.resolveSource(app, sys.getPathParts(fixedSource));
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
            var opts = coreUtils.extend({
                target: null, source: null,
                targetPath: null, sourcePath: null, mode: 1,
                converter: null, converterParam: null, isSourceFixed: false
            }, options);
            if (checks.isString(opts.mode)) {
                opts.mode = bindModeMap[opts.mode];
            }
            if (!checks.isString(opts.targetPath)) {
                debug.checkStartDebugger();
                throw new Error(strUtils.format(ERRS.ERR_BIND_TGTPATH_INVALID, opts.targetPath));
            }
            if (checks.isNt(opts.mode)) {
                debug.checkStartDebugger();
                throw new Error(strUtils.format(ERRS.ERR_BIND_MODE_INVALID, opts.mode));
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
            _this._converterParam = opts.converterParam;
            _this._srcPath = sys.getPathParts(opts.sourcePath);
            _this._tgtPath = sys.getPathParts(opts.targetPath);
            if (_this._tgtPath.length < 1) {
                throw new Error(strUtils.format(ERRS.ERR_BIND_TGTPATH_INVALID, opts.targetPath));
            }
            _this._srcFixed = (!!opts.isSourceFixed);
            _this._pathItems = {};
            _this._objId = coreUtils.getNewID("bnd");
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
            var errNotif = sys.getErrorNotification(_this._srcEnd);
            if (!!errNotif && errNotif.getIsHasErrors()) {
                _this._onSrcErrChanged(errNotif);
            }
            return _this;
        }
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
                                this._updateSource();
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
                                this._updateTarget();
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
            if (!!tgt && viewChecks.isElView(tgt)) {
                if (!!src && srcPath.length > 0) {
                    var prop = sys.isPropBag(errNotif) ? srcPath[srcPath.length - 1] : srcPath.join(".");
                    errors = errNotif.getFieldErrors(prop);
                }
                tgt.validationErrors = errors;
            }
        };
        Binding.prototype._getTgtChangedFn = function (self, obj, prop, restPath, lvl) {
            return function () {
                var val = sys.getProp(obj, prop);
                if (restPath.length > 0) {
                    self._setPathItem(null, 1, lvl, restPath);
                }
                self._parseTgt(val, restPath, lvl);
                self._update();
            };
        };
        Binding.prototype._getSrcChangedFn = function (self, obj, prop, restPath, lvl) {
            return function () {
                var val = sys.getProp(obj, prop);
                if (restPath.length > 0) {
                    self._setPathItem(null, 0, lvl, restPath);
                }
                self._parseSrc(val, restPath, lvl);
                self._update();
            };
        };
        Binding.prototype._addOnPropChanged = function (obj, prop, fn) {
            obj.objEvents.onProp(prop, fn, this._objId);
            if (prop !== "[*]" && sys.isPropBag(obj)) {
                obj.objEvents.onProp("[*]", fn, this._objId);
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
                    var nextObj = sys.getProp(obj, path[0]);
                    if (!!nextObj) {
                        self._parseSrc2(nextObj, path.slice(1), lvl + 1);
                    }
                    else if (checks.isUndefined(nextObj)) {
                        fn_reportUnResolved(0, self.source, self._srcPath.join("."), path[0]);
                    }
                }
                return;
            }
            if (!!obj && path.length === 1) {
                var isValidProp = (!debug.isDebugging() ? true : (isBaseObj ? obj.isHasProp(path[0]) : checks.isHasProp(obj, path[0])));
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
                    var errNotif = sys.getErrorNotification(obj);
                    if (!!errNotif) {
                        errNotif.addOnErrorsChanged(self._onSrcErrChanged, self._objId, self);
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
                    var nextObj = sys.getProp(obj, path[0]);
                    if (!!nextObj) {
                        self._parseTgt2(nextObj, path.slice(1), lvl + 1);
                    }
                    else if (checks.isUndefined(nextObj)) {
                        fn_reportUnResolved(1, self.target, self._tgtPath.join("."), path[0]);
                    }
                }
                return;
            }
            if (!!obj && path.length === 1) {
                var isValidProp = (!debug.isDebugging() ? true : (isBaseObj ? obj.isHasProp(path[0]) : checks.isHasProp(obj, path[0])));
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
                    throw new Error(strUtils.format(ERRS.ERR_PARAM_INVALID, "bindingTo", bindingTo));
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
                obj.objEvents.offNS(this._objId);
                var errNotif = sys.getErrorNotification(obj);
                if (!!errNotif) {
                    errNotif.offOnErrorsChanged(this._objId);
                }
            }
        };
        Binding.prototype._updateTarget = function () {
            if (this.getIsStateDirty()) {
                return;
            }
            try {
                if (!this._converter) {
                    this.targetValue = this.sourceValue;
                }
                else {
                    this.targetValue = this._converter.convertToTarget(this.sourceValue, this._converterParam, this._srcEnd);
                }
            }
            catch (ex) {
                utils.err.reThrow(ex, this.handleError(ex, this));
            }
        };
        Binding.prototype._updateSource = function () {
            if (this.getIsStateDirty()) {
                return;
            }
            try {
                if (!this._converter) {
                    this.sourceValue = this.targetValue;
                }
                else {
                    this.sourceValue = this._converter.convertToSource(this.targetValue, this._converterParam, this._srcEnd);
                }
            }
            catch (ex) {
                if (!sys.isValidationError(ex) || !viewChecks.isElView(this._tgtEnd)) {
                    utils.err.reThrow(ex, this.handleError(ex, this));
                }
            }
        };
        Binding.prototype._setTarget = function (value) {
            if (!!this._state) {
                this._state.target = value;
                return;
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
                    throw new Error(strUtils.format(ERRS.ERR_BIND_TGTPATH_INVALID, this._tgtPath.join(".")));
                }
            }
        };
        Binding.prototype._setSource = function (value) {
            if (!!this._state) {
                this._state.source = value;
                return;
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
                            throw new Error("Invalid operation: this._cntUSrc = " + this._cntUSrc);
                        }
                    }
                }
                this._setPathItem(null, 0, 0, this._srcPath);
                this._source = value;
                this._parseSrc(this._source, this._srcPath, 0);
            }
        };
        Binding.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            var self = this;
            coreUtils.forEachProp(this._pathItems, function (key, old) {
                self._cleanUp(old);
            });
            this._pathItems = {};
            this._setSource(null);
            this._setTarget(null);
            this._state = null;
            this._converter = null;
            this._converterParam = null;
            this._srcPath = null;
            this._tgtPath = null;
            this._srcEnd = null;
            this._tgtEnd = null;
            this._source = null;
            this._target = null;
            this._umask = 0;
            _super.prototype.dispose.call(this);
        };
        Binding.prototype.toString = function () {
            return "Binding";
        };
        Object.defineProperty(Binding.prototype, "uniqueID", {
            get: function () {
                return this._objId;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Binding.prototype, "target", {
            get: function () { return this._target; },
            set: function (v) {
                this._setTarget(v);
                this._update();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Binding.prototype, "source", {
            get: function () { return this._source; },
            set: function (v) {
                this._setSource(v);
                this._update();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Binding.prototype, "targetPath", {
            get: function () { return this._tgtPath; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Binding.prototype, "sourcePath", {
            get: function () { return this._srcPath; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Binding.prototype, "sourceValue", {
            get: function () {
                var res = null;
                if (this._srcPath.length === 0) {
                    res = this._srcEnd;
                }
                if (!!this._srcEnd) {
                    var prop = this._srcPath[this._srcPath.length - 1];
                    res = sys.getProp(this._srcEnd, prop);
                }
                return res;
            },
            set: function (v) {
                if (this._srcPath.length === 0 || !this._srcEnd || v === checks.undefined) {
                    return;
                }
                var prop = this._srcPath[this._srcPath.length - 1];
                sys.setProp(this._srcEnd, prop, v);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Binding.prototype, "targetValue", {
            get: function () {
                var res = null;
                if (!!this._tgtEnd) {
                    var prop = this._tgtPath[this._tgtPath.length - 1];
                    res = sys.getProp(this._tgtEnd, prop);
                }
                return res;
            },
            set: function (v) {
                if (this._tgtPath.length === 0 || !this._tgtEnd || v === checks.undefined) {
                    return;
                }
                var prop = this._tgtPath[this._tgtPath.length - 1];
                sys.setProp(this._tgtEnd, prop, v);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Binding.prototype, "mode", {
            get: function () { return this._mode; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Binding.prototype, "converter", {
            get: function () { return this._converter; },
            set: function (v) { this._converter = v; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Binding.prototype, "converterParam", {
            get: function () { return this._converterParam; },
            set: function (v) { this._converterParam = v; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Binding.prototype, "isSourceFixed", {
            get: function () { return this._srcFixed; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Binding.prototype, "isDisabled", {
            get: function () { return !!this._state; },
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
define("jriapp/template", ["require", "exports", "jriapp_shared", "jriapp/bootstrap", "jriapp/utils/viewchecks", "jriapp/utils/dom"], function (require, exports, jriapp_shared_13, bootstrap_4, viewchecks_2, dom_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_13.Utils, _async = utils.defer, dom = dom_4.DomUtils, viewChecks = viewchecks_2.ViewChecks, doc = dom.document, checks = utils.check, strUtils = utils.str, arrHelper = utils.arr, sys = utils.sys, boot = bootstrap_4.bootstrap, ERRS = jriapp_shared_13.LocaleERRS, ERROR = utils.err;
    var css;
    (function (css) {
        css["templateContainer"] = "ria-template-container";
        css["templateError"] = "ria-template-error";
    })(css = exports.css || (exports.css = {}));
    var PROP_NAME;
    (function (PROP_NAME) {
        PROP_NAME["dataContext"] = "dataContext";
        PROP_NAME["templateID"] = "templateID";
        PROP_NAME["template"] = "template";
        PROP_NAME["isEnabled"] = "isEnabled";
    })(PROP_NAME || (PROP_NAME = {}));
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
        Template.prototype._getBindings = function () {
            if (!this._lfTime) {
                return [];
            }
            var arr = this._lfTime.getObjs(), res = [], len = arr.length;
            for (var i = 0; i < len; i += 1) {
                if (sys.isBinding(arr[i])) {
                    res.push(arr[i]);
                }
            }
            return res;
        };
        Template.prototype._getElViews = function () {
            if (!this._lfTime) {
                return [];
            }
            var arr = this._lfTime.getObjs(), res = [], len = arr.length;
            for (var i = 0; i < len; i += 1) {
                if (viewChecks.isElView(arr[i])) {
                    res.push(arr[i]);
                }
            }
            return res;
        };
        Template.prototype._getTemplateElView = function () {
            if (!this._lfTime) {
                return null;
            }
            var arr = this._getElViews(), j = arr.length;
            for (var i = 0; i < j; i += 1) {
                if (viewChecks.isTemplateElView(arr[i])) {
                    return arr[i];
                }
            }
            return null;
        };
        Template.prototype._loadAsync = function (name) {
            var self = this, fnLoader = this.app.getTemplateLoader(name);
            var promise;
            if (checks.isFunc(fnLoader) && checks.isThenable(promise = fnLoader())) {
                return promise.then(function (html) {
                    var elems = dom.fromHTML(html);
                    return elems[0];
                }, function (err) {
                    if (!!err && !!err.message) {
                        throw err;
                    }
                    else {
                        throw new Error(strUtils.format(ERRS.ERR_TEMPLATE_ID_INVALID, self.templateID));
                    }
                });
            }
            else {
                var deferred = _async.createDeferred();
                return deferred.reject(new Error(strUtils.format(ERRS.ERR_TEMPLATE_ID_INVALID, self.templateID)));
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
                throw new Error(strUtils.format(ERRS.ERR_TEMPLATE_ID_INVALID, self.templateID));
            }
            if (!!self._loadedElem) {
                self._unloadTemplate();
            }
            dom.setClass([templateEl], "ria-template-error", true);
            self._loadedElem = loadedEl;
            self._onLoading();
            templateEl.appendChild(loadedEl);
            var promise = self.app._getInternal().bindTemplateElements(loadedEl);
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
                ex = new Error(strUtils.format(ERRS.ERR_TEMPLATE_ID_INVALID, self.templateID));
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
            get: function () { return this._dataContext; },
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
            get: function () { return this._templateID; },
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
            get: function () { return this._el; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Template.prototype, "app", {
            get: function () {
                return bootstrap_4.bootstrap.getApp();
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
        LifeTimeScope.create = function () {
            return new LifeTimeScope();
        };
        LifeTimeScope.prototype.addObj = function (b) {
            if (this._objs.indexOf(b) < 0) {
                this._objs.push(b);
            }
        };
        LifeTimeScope.prototype.removeObj = function (b) {
            utils.arr.remove(this._objs, b);
        };
        LifeTimeScope.prototype.getObjs = function () {
            return this._objs;
        };
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
            _this._objId = coreUtils.getNewID("prw");
            _this._objs = [];
            return _this;
        }
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
        PropWatcher.prototype.toString = function () {
            return "PropWatcher " + this._objId;
        };
        Object.defineProperty(PropWatcher.prototype, "uniqueID", {
            get: function () {
                return this._objId;
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
    var coreUtils = jriapp_shared_16.Utils.core;
    var CMD_EVENTS;
    (function (CMD_EVENTS) {
        CMD_EVENTS["can_execute_changed"] = "canExecute_changed";
    })(CMD_EVENTS || (CMD_EVENTS = {}));
    var TCommand = (function (_super) {
        __extends(TCommand, _super);
        function TCommand(fnAction, thisObj, fnCanExecute) {
            var _this = _super.call(this) || this;
            _this._objId = coreUtils.getNewID("cmd");
            _this._action = fnAction;
            _this._thisObj = thisObj;
            _this._predicate = fnCanExecute;
            return _this;
        }
        TCommand.prototype._canExecute = function (sender, param, context) {
            if (!this._predicate) {
                return true;
            }
            return this._predicate.apply(context, [sender, param]);
        };
        TCommand.prototype._execute = function (sender, param, context) {
            if (!!this._action) {
                this._action.apply(context, [sender, param]);
            }
        };
        TCommand.prototype.addOnCanExecuteChanged = function (fn, nmspace, context) {
            this.objEvents.on("canExecute_changed", fn, nmspace, context);
        };
        TCommand.prototype.offOnCanExecuteChanged = function (nmspace) {
            this.objEvents.off("canExecute_changed", nmspace);
        };
        TCommand.prototype.canExecute = function (sender, param) {
            return this._canExecute(sender, param, this._thisObj);
        };
        TCommand.prototype.execute = function (sender, param) {
            this._execute(sender, param, this._thisObj);
        };
        TCommand.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            this._action = null;
            this._thisObj = null;
            this._predicate = null;
            _super.prototype.dispose.call(this);
        };
        TCommand.prototype.raiseCanExecuteChanged = function () {
            this.objEvents.raise("canExecute_changed", {});
        };
        TCommand.prototype.toString = function () {
            return "Command";
        };
        Object.defineProperty(TCommand.prototype, "uniqueID", {
            get: function () {
                return this._objId;
            },
            enumerable: true,
            configurable: true
        });
        return TCommand;
    }(jriapp_shared_16.BaseObject));
    exports.TCommand = TCommand;
    var BaseCommand = (function (_super) {
        __extends(BaseCommand, _super);
        function BaseCommand(owner) {
            var _this = _super.call(this, null, null, null) || this;
            _this._action = _this.action;
            _this._predicate = _this.isCanExecute;
            _this._thisObj = _this;
            _this._owner = owner;
            return _this;
        }
        Object.defineProperty(BaseCommand.prototype, "owner", {
            get: function () {
                return this._owner;
            },
            enumerable: true,
            configurable: true
        });
        return BaseCommand;
    }(TCommand));
    exports.BaseCommand = BaseCommand;
    exports.Command = TCommand;
    var ViewModel = (function (_super) {
        __extends(ViewModel, _super);
        function ViewModel(app) {
            var _this = _super.call(this) || this;
            _this._app = app;
            _this._objId = coreUtils.getNewID("vm");
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
                return this._objId;
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
    var utils = jriapp_shared_17.Utils, coreUtils = utils.core, strUtils = utils.str, _async = utils.defer, arr = utils.arr, CSSPrefix = "css!";
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
            return _async.resolve(void 0, true);
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
            return !err ? _async.resolve(void 0, true) : _async.reject(err);
        }
        else {
            return _async.whenAll(loads.map(function (load) {
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
                        defered: _async.createDeferred(true)
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
            var loads = arr.merge([modNames.map(function (name) {
                    return self._loads[name];
                }), cssLoads]);
            return whenAll(loads);
        };
        ModuleLoader.prototype.whenAllLoaded = function () {
            var loads = [];
            coreUtils.forEachProp(this._loads, function (name, val) {
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
                        defered: _async.createDeferred(true)
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
            return !!name && strUtils.startsWith(name, CSSPrefix);
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
define("jriapp/databindsvc", ["require", "exports", "jriapp_shared", "jriapp/bootstrap", "jriapp/utils/lifetime", "jriapp/utils/dom", "jriapp/utils/mloader", "jriapp/binding", "jriapp/utils/viewchecks", "jriapp/utils/parser"], function (require, exports, jriapp_shared_18, bootstrap_5, lifetime_1, dom_5, mloader_1, binding_1, viewchecks_3, parser_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_18.Utils, _async = utils.defer, viewChecks = viewchecks_3.ViewChecks, dom = dom_5.DomUtils, doc = dom.document, strUtils = utils.str, boot = bootstrap_5.bootstrap, ERRS = jriapp_shared_18.LocaleERRS, parser = parser_3.Parser;
    function createDataBindSvc(root, elViewFactory) {
        return new DataBindingService(root, elViewFactory);
    }
    exports.createDataBindSvc = createDataBindSvc;
    function fn_toBindableElement(el) {
        var val, attr;
        var allAttrs = el.attributes, res = { el: el, dataView: null, dataForm: null, expressions: [] };
        var n = allAttrs.length;
        for (var i = 0; i < n; i++) {
            attr = allAttrs[i];
            if (strUtils.startsWith(attr.name, "data-bind")) {
                val = attr.value.trim();
                if (!val) {
                    throw new Error(strUtils.format(ERRS.ERR_PARAM_INVALID, attr.name, "empty"));
                }
                if (val[0] !== "{" && val[val.length - 1] !== "}") {
                    val = "{" + val + "}";
                }
                res.expressions.push(val);
            }
            if (strUtils.startsWith(attr.name, "data-form")) {
                res.dataForm = attr.value.trim();
            }
            if (strUtils.startsWith(attr.name, "data-view")) {
                res.dataView = attr.value.trim();
            }
        }
        return (!!res.dataView || res.expressions.length > 0) ? res : null;
    }
    function fn_getBindableElements(scope) {
        var result = [], allElems = dom.queryAll(scope, "*");
        allElems.forEach(function (el) {
            var res = fn_toBindableElement(el);
            if (!!res) {
                result.push(res);
            }
        });
        return result;
    }
    function fn_getRequiredModules(el) {
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
            name = strUtils.fastTrim(name);
            if (!!name) {
                hashMap[name] = name;
            }
        });
        return Object.keys(hashMap);
    }
    function fn_getDataFormElements(bindElems) {
        return bindElems.filter(function (bindElem) {
            return !!bindElem.dataForm;
        }).map(function (bindElem) {
            return bindElem.el;
        });
    }
    function fn_updDataFormAttr(bindElems) {
        bindElems.forEach(function (bindElem) {
            if (!bindElem.dataForm && viewChecks.isDataForm(bindElem.el)) {
                bindElem.el.setAttribute("data-form", "yes");
                bindElem.dataForm = "yes";
            }
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
        DataBindingService.prototype._cleanUp = function () {
            if (!!this._objLifeTime) {
                this._objLifeTime.dispose();
                this._objLifeTime = null;
            }
        };
        DataBindingService.prototype._bindElView = function (elView, bindElem, lftm, isInsideTemplate, defSource) {
            var self = this;
            lftm.addObj(elView);
            if (isInsideTemplate) {
                viewChecks.setIsInsideTemplate(elView);
            }
            var bindAttr = bindElem.expressions.join("");
            if (!!bindAttr) {
                var tempOpts = parser.parseOptions(bindAttr), len = tempOpts.length;
                for (var j = 0; j < len; j += 1) {
                    var info = tempOpts[j];
                    var op = binding_1.getBindingOptions(info, elView, defSource);
                    var binding = self.bind(op);
                    lftm.addObj(binding);
                }
            }
        };
        DataBindingService.prototype._bindTemplateElements = function (templateEl) {
            var self = this, defer = _async.createDeferred(true);
            var bindElems;
            try {
                var rootBindEl = fn_toBindableElement(templateEl), lftm_1 = new lifetime_1.LifeTimeScope();
                if (!!rootBindEl && !!rootBindEl.dataForm) {
                    bindElems = [rootBindEl];
                }
                else {
                    bindElems = fn_getBindableElements(templateEl);
                    if (!!rootBindEl) {
                        bindElems.push(rootBindEl);
                    }
                }
                fn_updDataFormAttr(bindElems);
                var forms_1 = fn_getDataFormElements(bindElems), needBinding = bindElems.filter(function (bindElem) {
                    return !viewChecks.isInNestedForm(templateEl, forms_1, bindElem.el);
                });
                needBinding.forEach(function (bindElem) {
                    var elView = self._elViewFactory.getOrCreateElView(bindElem.el);
                    self._bindElView(elView, bindElem, lftm_1, true, null);
                });
                defer.resolve(lftm_1);
            }
            catch (err) {
                self.handleError(err, self);
                setTimeout(function () {
                    defer.reject(new jriapp_shared_18.DummyError(err));
                }, 0);
            }
            return defer.promise();
        };
        DataBindingService.prototype.bindTemplateElements = function (templateEl) {
            var self = this, requiredModules = fn_getRequiredModules(templateEl);
            var res;
            if (requiredModules.length > 0) {
                res = self._mloader.load(requiredModules).then(function () {
                    return self._bindTemplateElements(templateEl);
                });
            }
            else {
                res = self._bindTemplateElements(templateEl);
            }
            res.catch(function (err) {
                utils.queue.enque(function () {
                    self.handleError(err, self);
                });
            });
            return res;
        };
        DataBindingService.prototype.bindElements = function (scope, defaultDataContext, isDataFormBind, isInsideTemplate) {
            var self = this, defer = _async.createDeferred(true);
            scope = scope || doc;
            try {
                var bindElems = fn_getBindableElements(scope), lftm_2 = new lifetime_1.LifeTimeScope();
                if (!isDataFormBind) {
                    fn_updDataFormAttr(bindElems);
                }
                var forms_2 = fn_getDataFormElements(bindElems), needBinding = bindElems.filter(function (bindElem) {
                    return !viewChecks.isInNestedForm(scope, forms_2, bindElem.el);
                });
                needBinding.forEach(function (bindElem) {
                    var elView = self._elViewFactory.getOrCreateElView(bindElem.el);
                    self._bindElView(elView, bindElem, lftm_2, isInsideTemplate, defaultDataContext);
                });
                defer.resolve(lftm_2);
            }
            catch (err) {
                self.handleError(err, self);
                setTimeout(function () {
                    defer.reject(new jriapp_shared_18.DummyError(err));
                }, 0);
            }
            return defer.promise();
        };
        DataBindingService.prototype.setUpBindings = function () {
            var defScope = this._root, defaultDataContext = boot.getApp(), self = this;
            this._cleanUp();
            var promise = this.bindElements(defScope, defaultDataContext, false, false);
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
        DataBindingService.prototype.dispose = function () {
            this._cleanUp();
            this._elViewFactory = null;
            this._mloader = null;
            _super.prototype.dispose.call(this);
        };
        return DataBindingService;
    }(jriapp_shared_18.BaseObject));
});
define("jriapp/app", ["require", "exports", "jriapp_shared", "jriapp/bootstrap", "jriapp/utils/dom", "jriapp/elview", "jriapp/databindsvc"], function (require, exports, jriapp_shared_19, bootstrap_6, dom_6, elview_2, databindsvc_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_19.Utils, dom = dom_6.DomUtils, doc = dom.document, boot = bootstrap_6.bootstrap, sys = utils.sys, ERRS = jriapp_shared_19.LocaleERRS;
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
                throw new Error(utils.str.format(ERRS.ERR_APP_NAME_NOT_UNIQUE, appName));
            }
            _this._objId = utils.core.getNewID("app");
            _this._appState = 0;
            _this._moduleInits = moduleInits;
            _this._viewFactory = elview_2.createElViewFactory(boot.elViewRegister);
            _this._dataBindingService = databindsvc_1.createDataBindSvc(_this.appRoot, _this._viewFactory);
            _this._objMaps = [];
            _this._exports = {};
            _this._UC = {};
            _this._internal = {
                bindTemplateElements: function (templateEl) {
                    return self._dataBindingService.bindTemplateElements(templateEl);
                },
                bindElements: function (scope, dctx, isDataFormBind, isInsideTemplate) {
                    return self._dataBindingService.bindElements(scope, dctx, isDataFormBind, isInsideTemplate);
                }
            };
            boot._getInternal().registerApp(_this);
            return _this;
        }
        Application.prototype._cleanUpObjMaps = function () {
            var self = this;
            this._objMaps.forEach(function (objMap) {
                utils.core.forEachProp(objMap, function (name) {
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
                throw new Error(utils.str.format(ERRS.ERR_OBJ_ALREADY_REGISTERED, name));
            }
        };
        Application.prototype.getConverter = function (name) {
            var name2 = "cnv." + name;
            var res = boot._getInternal().getObject(this, name2);
            if (!res) {
                res = boot._getInternal().getObject(boot, name2);
            }
            if (!res) {
                throw new Error(utils.str.format(ERRS.ERR_CONVERTER_NOTREGISTERED, name));
            }
            return res;
        };
        Application.prototype.registerSvc = function (name, obj) {
            var name2 = "svc." + name;
            return boot._getInternal().registerObject(this, name2, obj);
        };
        Application.prototype.getSvc = function (name) {
            var name2 = "svc." + name;
            var res = boot._getInternal().getObject(this, name2);
            if (!res) {
                res = boot._getInternal().getObject(boot, name2);
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
            var self = this, deferred = utils.defer.createDeferred();
            if (this._appState !== 0) {
                return deferred.reject(new Error("Application can not be started when state != AppState.None"));
            }
            var fnStartApp = function () {
                try {
                    self._initAppModules();
                    var onStartupRes1 = self.onStartUp();
                    var setupPromise1 = void 0;
                    if (utils.check.isThenable(onStartupRes1)) {
                        setupPromise1 = onStartupRes1;
                    }
                    else {
                        setupPromise1 = utils.defer.createDeferred().resolve();
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
            this.registerTemplateLoader(name, utils.core.memoize(function () {
                var deferred = utils.defer.createDeferred(true), el = dom.queryOne(doc, "#" + templateId);
                if (!el) {
                    throw new Error(utils.str.format(ERRS.ERR_TEMPLATE_ID_INVALID, templateId));
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
                    return function () { return utils.defer.reject(new Error(utils.str.format(ERRS.ERR_TEMPLATE_NOTREGISTERED, name))); };
                }
            }
            return res;
        };
        Application.prototype.registerTemplateGroup = function (name, group) {
            var group2 = utils.core.extend({
                fn_loader: null,
                url: null,
                names: null,
                promise: null,
                app: this
            }, group);
            boot.templateLoader.registerTemplateGroup(this.appName + "." + name, group2);
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
        Application.prototype.toString = function () {
            return "Application: " + this.appName;
        };
        Object.defineProperty(Application.prototype, "uniqueID", {
            get: function () { return this._objId; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Application.prototype, "options", {
            get: function () { return this._options; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Application.prototype, "appName", {
            get: function () { return this._appName; },
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
            get: function () { return this._UC; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Application.prototype, "app", {
            get: function () { return this; },
            enumerable: true,
            configurable: true
        });
        return Application;
    }(jriapp_shared_19.BaseObject));
    exports.Application = Application;
});
define("jriapp", ["require", "exports", "jriapp/bootstrap", "jriapp_shared", "jriapp_shared/collection/const", "jriapp_shared/collection/int", "jriapp_shared/utils/jsonbag", "jriapp_shared/utils/deferred", "jriapp/const", "jriapp/utils/dom", "jriapp/utils/viewchecks", "jriapp/converter", "jriapp/bootstrap", "jriapp/binding", "jriapp/template", "jriapp/utils/lifetime", "jriapp/utils/propwatcher", "jriapp/mvvm", "jriapp/app"], function (require, exports, bootstrap_7, jriapp_shared_20, const_1, int_3, jsonbag_1, deferred_2, const_2, dom_7, viewchecks_4, converter_1, bootstrap_8, binding_2, template_1, lifetime_2, propwatcher_1, mvvm_1, app_1) {
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
    exports.DOM = dom_7.DomUtils;
    exports.ViewChecks = viewchecks_4.ViewChecks;
    exports.BaseConverter = converter_1.BaseConverter;
    exports.bootstrap = bootstrap_8.bootstrap;
    exports.Binding = binding_2.Binding;
    exports.createTemplate = template_1.createTemplate;
    exports.LifeTimeScope = lifetime_2.LifeTimeScope;
    exports.PropWatcher = propwatcher_1.PropWatcher;
    exports.ViewModel = mvvm_1.ViewModel;
    exports.BaseCommand = mvvm_1.BaseCommand;
    exports.Command = mvvm_1.Command;
    exports.TCommand = mvvm_1.TCommand;
    exports.Application = app_1.Application;
    exports.VERSION = "2.4.1";
    bootstrap_7.Bootstrap._initFramework();
});
