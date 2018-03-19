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
define("jriapp_ui/int", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var cssStyles;
    (function (cssStyles) {
        cssStyles["fieldError"] = "ria-field-error";
        cssStyles["content"] = "ria-content-field";
        cssStyles["required"] = "ria-required-field";
        cssStyles["checkbox"] = "ria-checkbox";
        cssStyles["commandLink"] = "ria-command-link";
        cssStyles["checkedNull"] = "ria-checked-null";
        cssStyles["dataform"] = "ria-dataform";
        cssStyles["error"] = "ria-form-error";
        cssStyles["disabled"] = "disabled";
        cssStyles["opacity"] = "opacity";
        cssStyles["color"] = "color";
        cssStyles["fontSize"] = "font-size";
    })(cssStyles = exports.cssStyles || (exports.cssStyles = {}));
});
define("jriapp_ui/content/basic", ["require", "exports", "jriapp_shared", "jriapp/utils/dom", "jriapp/bootstrap", "jriapp/binding", "jriapp/utils/lifetime"], function (require, exports, jriapp_shared_1, dom_1, bootstrap_1, binding_1, lifetime_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_1.Utils, dom = dom_1.DomUtils, doc = dom.document, extend = utils.core.extend, boot = bootstrap_1.bootstrap, sys = utils.sys;
    function getView(el, name, options) {
        var factory = boot.app.viewFactory, elView = factory.store.getElView(el);
        if (!!elView) {
            return elView;
        }
        var viewInfo = {
            el: el,
            name: name,
            options: options || {}
        };
        return factory.createElView(viewInfo);
    }
    exports.getView = getView;
    function getBindingOption(isEdit, fieldName, target, dataContext, targetPath, converter, param) {
        if (converter === void 0) { converter = null; }
        if (param === void 0) { param = null; }
        var bindInfo = {
            target: null,
            source: null,
            targetPath: null,
            sourcePath: fieldName,
            mode: isEdit ? "TwoWay" : "OneWay",
            converter: null,
            param: null,
            isBind: false
        };
        var options = binding_1.getBindingOptions(bindInfo, target, dataContext);
        if (!!targetPath) {
            options.targetPath = targetPath;
        }
        options.converter = converter;
        options.param = param;
        return options;
    }
    exports.getBindingOption = getBindingOption;
    var BasicContent = (function (_super) {
        __extends(BasicContent, _super);
        function BasicContent(options) {
            var _this = _super.call(this) || this;
            options = extend({
                parentEl: null,
                contentOptions: null,
                dataContext: null,
                isEditing: false
            }, options);
            _this._el = null;
            _this._parentEl = options.parentEl;
            _this._isEditing = !!options.isEditing;
            _this._dataContext = options.dataContext;
            _this._options = options.contentOptions;
            _this._isReadOnly = !!_this._options.readOnly;
            _this._lfScope = null;
            _this._view = null;
            dom.addClass([_this._parentEl], "ria-content-field");
            return _this;
        }
        BasicContent.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            var displayInfo = this._options.css;
            dom.removeClass([this._parentEl], "ria-content-field");
            dom.removeClass([this._parentEl], "ria-required-field");
            if (!!displayInfo && !!displayInfo.readCss) {
                dom.removeClass([this._parentEl], displayInfo.readCss);
            }
            if (!!displayInfo && !!displayInfo.editCss) {
                dom.removeClass([this._parentEl], displayInfo.editCss);
            }
            this.cleanUp();
            this._parentEl = null;
            this._dataContext = null;
            this._options = null;
            _super.prototype.dispose.call(this);
        };
        BasicContent.prototype.updateCss = function () {
            var displayInfo = this._options.css, parentEl = this._parentEl, fieldInfo = this.getFieldInfo();
            if (this._isEditing && this.getIsCanBeEdited()) {
                if (!!displayInfo) {
                    if (!!displayInfo.editCss) {
                        dom.addClass([parentEl], displayInfo.editCss);
                    }
                    if (!!displayInfo.readCss) {
                        dom.removeClass([parentEl], displayInfo.readCss);
                    }
                }
                if (!!fieldInfo && !fieldInfo.isNullable) {
                    dom.addClass([parentEl], "ria-required-field");
                }
            }
            else {
                if (!!displayInfo) {
                    if (!!displayInfo.readCss) {
                        dom.addClass([parentEl], displayInfo.readCss);
                    }
                    if (!!displayInfo.editCss) {
                        dom.removeClass([parentEl], displayInfo.editCss);
                    }
                }
                if (!!fieldInfo && !fieldInfo.isNullable) {
                    dom.removeClass([parentEl], "ria-required-field");
                }
            }
        };
        BasicContent.prototype.getIsCanBeEdited = function () {
            if (this._isReadOnly) {
                return false;
            }
            var finf = this.getFieldInfo();
            if (!finf) {
                return false;
            }
            var editable = sys.getEditable(this._dataContext);
            return !!editable && !finf.isReadOnly && finf.fieldType !== 2;
        };
        BasicContent.prototype.getBindings = function () {
            if (!this._lfScope) {
                return [];
            }
            var arr = this._lfScope.getObjs(), res = [], len = arr.length;
            for (var i = 0; i < len; i += 1) {
                if (sys.isBinding(arr[i])) {
                    res.push(arr[i]);
                }
            }
            return res;
        };
        BasicContent.prototype.updateBindingSource = function () {
            var bindings = this.getBindings(), len = bindings.length;
            for (var i = 0; i < len; i += 1) {
                var binding = bindings[i];
                if (!binding.isSourceFixed) {
                    binding.source = this._dataContext;
                }
            }
        };
        BasicContent.prototype.cleanUp = function () {
            if (!!this._lfScope) {
                this._lfScope.dispose();
                this._lfScope = null;
            }
            if (!!this._el) {
                dom.removeNode(this._el);
                this._el = null;
            }
            this._view = null;
        };
        BasicContent.prototype.getFieldInfo = function () {
            return this._options.fieldInfo;
        };
        BasicContent.prototype.getParam = function (isEdit) {
            return null;
        };
        BasicContent.prototype.getConverter = function (isEdit) {
            return null;
        };
        BasicContent.prototype.getViewName = function (isEdit) {
            return null;
        };
        BasicContent.prototype.createdEditingView = function () {
            var name = this.getViewName(true), el = doc.createElement("input"), options = this._options.options;
            el.setAttribute("type", "text");
            if (!!options && !!options.placeholder) {
                el.setAttribute("placeholder", options.placeholder);
            }
            var view = getView(el, name, options);
            if (!!view) {
                this.lfScope.addObj(view);
            }
            var bindOption = getBindingOption(true, this.options.fieldName, view, this.dataContext, "value", this.getConverter(true), this.getParam(true));
            this._lfScope.addObj(this.app.bind(bindOption));
            return view;
        };
        BasicContent.prototype.createdReadingView = function () {
            var name = this.getViewName(false), el = doc.createElement("span");
            var view = getView(el, name, {});
            if (!!view) {
                this.lfScope.addObj(view);
            }
            var bindOption = getBindingOption(false, this.options.fieldName, view, this.dataContext, "value", this.getConverter(false), this.getParam(false));
            this._lfScope.addObj(this.app.bind(bindOption));
            return view;
        };
        BasicContent.prototype.beforeCreateView = function () {
            this.cleanUp();
            return !!this._options.fieldName;
        };
        BasicContent.prototype.createView = function () {
            var view = null;
            if (this._isEditing && this.getIsCanBeEdited()) {
                view = this.createdEditingView();
            }
            else {
                view = this.createdReadingView();
            }
            this._el = view.el;
            this._view = view;
            this.updateCss();
        };
        BasicContent.prototype.afterCreateView = function () {
            this._parentEl.appendChild(this._el);
        };
        BasicContent.prototype.render = function () {
            if (this.beforeCreateView()) {
                try {
                    this.createView();
                    this.afterCreateView();
                }
                catch (ex) {
                    utils.err.reThrow(ex, this.handleError(ex, this));
                }
            }
        };
        BasicContent.prototype.toString = function () {
            return "BasicContent";
        };
        Object.defineProperty(BasicContent.prototype, "lfScope", {
            get: function () {
                if (!this._lfScope) {
                    this._lfScope = new lifetime_1.LifeTimeScope();
                }
                return this._lfScope;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BasicContent.prototype, "parentEl", {
            get: function () {
                return this._parentEl;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BasicContent.prototype, "el", {
            get: function () {
                return this._el;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BasicContent.prototype, "view", {
            get: function () {
                return this._view;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BasicContent.prototype, "isEditing", {
            get: function () {
                return this._isEditing;
            },
            set: function (v) {
                if (this._isEditing !== v) {
                    this._isEditing = v;
                    this.render();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BasicContent.prototype, "dataContext", {
            get: function () {
                return this._dataContext;
            },
            set: function (v) {
                if (this._dataContext !== v) {
                    this._dataContext = v;
                    this.updateBindingSource();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BasicContent.prototype, "isReadOnly", {
            get: function () {
                return this._isReadOnly;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BasicContent.prototype, "options", {
            get: function () {
                return this._options;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BasicContent.prototype, "app", {
            get: function () {
                return boot.app;
            },
            enumerable: true,
            configurable: true
        });
        return BasicContent;
    }(jriapp_shared_1.BaseObject));
    exports.BasicContent = BasicContent;
});
define("jriapp_ui/content/template", ["require", "exports", "jriapp_shared", "jriapp/utils/dom", "jriapp/bootstrap", "jriapp/template"], function (require, exports, jriapp_shared_2, dom_2, bootstrap_2, template_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_2.Utils, extend = utils.core.extend, dom = dom_2.DomUtils, boot = bootstrap_2.bootstrap, ERROR = utils.err;
    var TemplateContent = (function (_super) {
        __extends(TemplateContent, _super);
        function TemplateContent(options) {
            var _this = _super.call(this) || this;
            options = extend({
                parentEl: null,
                contentOptions: null,
                dataContext: null,
                isEditing: false,
                appName: null
            }, options);
            _this._templateID = null;
            _this._parentEl = options.parentEl;
            _this._isEditing = options.isEditing;
            _this._dataContext = options.dataContext;
            _this._templateInfo = options.contentOptions.template;
            _this._template = null;
            dom.addClass([_this._parentEl], "ria-content-field");
            return _this;
        }
        TemplateContent.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            dom.removeClass([this._parentEl], "ria-content-field");
            this.cleanUp();
            this._parentEl = null;
            this._dataContext = null;
            this._templateInfo = null;
            _super.prototype.dispose.call(this);
        };
        TemplateContent.prototype.getTemplateID = function () {
            if (!this._templateInfo) {
                throw new Error(jriapp_shared_2.LocaleERRS.ERR_TEMPLATE_ID_INVALID);
            }
            var info = this._templateInfo;
            var id = info.readID;
            if (this._isEditing && !!info.editID) {
                id = info.editID;
            }
            if (!id) {
                id = info.editID;
            }
            if (!id) {
                throw new Error(jriapp_shared_2.LocaleERRS.ERR_TEMPLATE_ID_INVALID);
            }
            return id;
        };
        TemplateContent.prototype.createTemplate = function () {
            var template = template_1.createTemplate(this._dataContext);
            template.templateID = this._templateID;
            return template;
        };
        TemplateContent.prototype.cleanUp = function () {
            if (!!this._template) {
                this._template.dispose();
                this._template = null;
                this._templateID = null;
            }
        };
        TemplateContent.prototype.render = function () {
            try {
                var id = this.getTemplateID();
                if (this._templateID !== id) {
                    this.cleanUp();
                    this._templateID = id;
                    this._template = this.createTemplate();
                    this._parentEl.appendChild(this._template.el);
                }
            }
            catch (ex) {
                ERROR.reThrow(ex, this.handleError(ex, this));
            }
        };
        TemplateContent.prototype.toString = function () {
            return "TemplateContent";
        };
        Object.defineProperty(TemplateContent.prototype, "parentEl", {
            get: function () {
                return this._parentEl;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TemplateContent.prototype, "template", {
            get: function () {
                return this._template;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TemplateContent.prototype, "isEditing", {
            get: function () {
                return this._isEditing;
            },
            set: function (v) {
                if (this._isEditing !== v) {
                    this._isEditing = v;
                    this.render();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TemplateContent.prototype, "dataContext", {
            get: function () {
                return this._dataContext;
            },
            set: function (v) {
                if (this._dataContext !== v) {
                    this._dataContext = v;
                    if (!!this._template) {
                        this._template.dataContext = this._dataContext;
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TemplateContent.prototype, "app", {
            get: function () {
                return boot.app;
            },
            enumerable: true,
            configurable: true
        });
        return TemplateContent;
    }(jriapp_shared_2.BaseObject));
    exports.TemplateContent = TemplateContent;
});
define("jriapp_ui/utils/eventbag", ["require", "exports", "jriapp_shared"], function (require, exports, jriapp_shared_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_3.Utils, trimBrackets = utils.str.trimBrackets;
    var EVENT_CHANGE_TYPE;
    (function (EVENT_CHANGE_TYPE) {
        EVENT_CHANGE_TYPE[EVENT_CHANGE_TYPE["None"] = 0] = "None";
        EVENT_CHANGE_TYPE[EVENT_CHANGE_TYPE["Added"] = 1] = "Added";
        EVENT_CHANGE_TYPE[EVENT_CHANGE_TYPE["Deleted"] = 2] = "Deleted";
        EVENT_CHANGE_TYPE[EVENT_CHANGE_TYPE["Updated"] = 3] = "Updated";
    })(EVENT_CHANGE_TYPE = exports.EVENT_CHANGE_TYPE || (exports.EVENT_CHANGE_TYPE = {}));
    var EventBag = (function (_super) {
        __extends(EventBag, _super);
        function EventBag(onChange) {
            var _this = _super.call(this) || this;
            _this._dic = null;
            _this._onChange = onChange;
            return _this;
        }
        EventBag.prototype.isHasProp = function (prop) {
            return true;
        };
        EventBag.prototype.getProp = function (name) {
            if (!this._dic) {
                return null;
            }
            var eventName = trimBrackets(name), cmd = this._dic[eventName];
            return !cmd ? null : cmd;
        };
        EventBag.prototype.setProp = function (name, command) {
            if (!this._dic && !!command) {
                this._dic = {};
            }
            if (!this._dic) {
                return;
            }
            var eventName = trimBrackets(name), old = this._dic[eventName];
            if (!command && !!old) {
                delete this._dic[eventName];
                if (!!this._onChange) {
                    this._onChange(this, {
                        name: eventName,
                        changeType: 2,
                        oldVal: old,
                        newVal: null
                    });
                    this.objEvents.raiseProp(name);
                }
                return;
            }
            this._dic[eventName] = command;
            if (!!this._onChange) {
                if (!old) {
                    this._onChange(this, {
                        name: eventName,
                        changeType: 1,
                        oldVal: null,
                        newVal: command
                    });
                }
                else {
                    this._onChange(this, {
                        name: eventName,
                        changeType: 3,
                        oldVal: old,
                        newVal: command
                    });
                }
                this.objEvents.raiseProp(name);
            }
        };
        Object.defineProperty(EventBag.prototype, "isPropertyBag", {
            get: function () {
                return true;
            },
            enumerable: true,
            configurable: true
        });
        EventBag.prototype.trigger = function (eventName, args) {
            if (!this._dic) {
                return false;
            }
            var command = this._dic[eventName];
            if (!command) {
                return false;
            }
            args = args || {};
            if (command.canExecute(args)) {
                command.execute(args);
                return true;
            }
            else {
                return false;
            }
        };
        EventBag.prototype.toString = function () {
            return "EventBag";
        };
        EventBag.prototype.dispose = function () {
            if (!!this._dic) {
                this._dic = null;
            }
            this._onChange = null;
            _super.prototype.dispose.call(this);
        };
        return EventBag;
    }(jriapp_shared_3.BaseObject));
    exports.EventBag = EventBag;
});
define("jriapp_ui/utils/propbag", ["require", "exports", "jriapp_shared"], function (require, exports, jriapp_shared_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_4.Utils, trimBrackets = utils.str.trimBrackets;
    var PropertyBag = (function (_super) {
        __extends(PropertyBag, _super);
        function PropertyBag(el) {
            var _this = _super.call(this) || this;
            _this._el = el;
            return _this;
        }
        PropertyBag.prototype.isHasProp = function (prop) {
            var propName = trimBrackets(prop);
            return (propName in this._el);
        };
        PropertyBag.prototype.getProp = function (name) {
            var propName = trimBrackets(name);
            return this._el[propName];
        };
        PropertyBag.prototype.setProp = function (name, val) {
            var propName = trimBrackets(name);
            var old = this._el[propName];
            if (old !== val) {
                this._el[propName] = val;
                this.objEvents.raiseProp(name);
            }
        };
        Object.defineProperty(PropertyBag.prototype, "isPropertyBag", {
            get: function () {
                return true;
            },
            enumerable: true,
            configurable: true
        });
        PropertyBag.prototype.toString = function () {
            return "PropertyBag";
        };
        return PropertyBag;
    }(jriapp_shared_4.BaseObject));
    exports.PropertyBag = PropertyBag;
});
define("jriapp_ui/utils/cssbag", ["require", "exports", "jriapp_shared", "jriapp/utils/dom"], function (require, exports, jriapp_shared_5, dom_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_5.Utils, _a = utils.check, _undefined = _a._undefined, isArray = _a.isArray, isString = _a.isString, dom = dom_3.DomUtils, trimBrackets = utils.str.trimBrackets;
    var CSSBag = (function (_super) {
        __extends(CSSBag, _super);
        function CSSBag(el) {
            var _this = _super.call(this) || this;
            _this._el = el;
            return _this;
        }
        CSSBag.prototype.isHasProp = function (prop) {
            return true;
        };
        CSSBag.prototype.getProp = function (name) {
            return _undefined;
        };
        CSSBag.prototype.setProp = function (name, val) {
            if (val === _undefined) {
                return;
            }
            var cssName = trimBrackets(name);
            if (cssName === "*") {
                if (!val) {
                    dom.removeClass([this._el], null);
                }
                else if (isArray(val)) {
                    dom.setClasses([this._el], val);
                }
                else if (isString(val)) {
                    dom.setClasses([this._el], val.split(" "));
                }
                return;
            }
            dom.setClass([this._el], cssName, !val);
        };
        Object.defineProperty(CSSBag.prototype, "isPropertyBag", {
            get: function () {
                return true;
            },
            enumerable: true,
            configurable: true
        });
        CSSBag.prototype.toString = function () {
            return "CSSBag";
        };
        return CSSBag;
    }(jriapp_shared_5.BaseObject));
    exports.CSSBag = CSSBag;
});
define("jriapp_ui/baseview", ["require", "exports", "jriapp_shared", "jriapp/utils/dom", "jriapp/utils/viewchecks", "jriapp/bootstrap", "jriapp_ui/utils/eventbag", "jriapp_ui/utils/propbag", "jriapp_ui/utils/cssbag"], function (require, exports, jriapp_shared_6, dom_4, viewchecks_1, bootstrap_3, eventbag_1, propbag_1, cssbag_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_6.Utils, getNewID = utils.core.getNewID, dom = dom_4.DomUtils, _undefined = utils.check._undefined, boot = bootstrap_3.bootstrap, viewChecks = viewchecks_1.ViewChecks, subscribeMap = bootstrap_3.subscribeWeakMap;
    viewChecks.isElView = function (obj) {
        return !!obj && obj instanceof BaseElView;
    };
    function addToolTip(el, tip, isError, pos) {
        var svc = boot.getSvc("ITooltipService");
        svc.addToolTip(el, tip, isError, pos);
    }
    exports.addToolTip = addToolTip;
    function getErrorsService() {
        return boot.getSvc("IUIErrorsService");
    }
    var BaseElView = (function (_super) {
        __extends(BaseElView, _super);
        function BaseElView(el, options) {
            var _this = _super.call(this) || this;
            _this._el = el;
            options = options || {};
            var state = {
                tip: !options.tip ? null : options.tip,
                css: !options.css ? null : options.css,
                errorsService: !options.errorsService ? null : options.errorsService,
                _eventBag: null,
                _propBag: null,
                _classBag: null,
                _display: null,
                _errors: null
            };
            _this._uniqueID = getNewID("elv");
            _this._viewState = state;
            _this._subscribeFlags = !options.nodelegate ? 1 : 0;
            if (!!state.css) {
                dom.addClass([el], state.css);
            }
            _this._applyToolTip();
            _this._getStore().setElView(el, _this);
            return _this;
        }
        BaseElView.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            try {
                dom.events.offNS(this.el, this.uniqueID);
                this.validationErrors = null;
                addToolTip(this.el, null);
                if (this._subscribeFlags !== 0) {
                    subscribeMap.delete(this.el);
                    this._subscribeFlags = 0;
                }
                if (!!this._viewState._eventBag) {
                    this._viewState._eventBag.dispose();
                }
                if (!!this._viewState._propBag) {
                    this._viewState._propBag.dispose();
                }
                if (!!this._viewState._classBag) {
                    this._viewState._classBag.dispose();
                }
                this._viewState = {};
            }
            finally {
                this._getStore().setElView(this.el, null);
                _super.prototype.dispose.call(this);
            }
        };
        BaseElView.prototype._getStore = function () {
            return this.app.viewFactory.store;
        };
        BaseElView.prototype._onEventChanged = function (args) {
            switch (args.changeType) {
                case 1:
                    this._onEventAdded(args.name, args.newVal);
                    break;
                case 2:
                    this._onEventDeleted(args.name, args.oldVal);
                    break;
            }
        };
        BaseElView.prototype._onEventAdded = function (name, newVal) {
            var self = this;
            if (this.getIsStateDirty()) {
                return;
            }
            dom.events.on(this.el, name, function (e) {
                if (!!self._viewState._eventBag) {
                    self._viewState._eventBag.trigger(name, e);
                }
            }, this.uniqueID);
        };
        BaseElView.prototype._onEventDeleted = function (name, oldVal) {
            dom.events.off(this.el, name, this.uniqueID);
        };
        BaseElView.prototype._applyToolTip = function () {
            if (!!this.toolTip) {
                addToolTip(this.el, this.toolTip);
            }
        };
        BaseElView.prototype._setIsSubcribed = function (flag) {
            this._subscribeFlags |= (1 << flag);
        };
        BaseElView.prototype._setErrors = function (el, errors) {
            this._viewState._errors = errors;
            var errSvc = !this._viewState.errorsService ? getErrorsService() : this._viewState.errorsService;
            errSvc.setErrors(el, errors, this.toolTip);
        };
        BaseElView.prototype.isSubscribed = function (flag) {
            return !!(this._subscribeFlags & (1 << flag));
        };
        BaseElView.prototype.toString = function () {
            return "BaseElView";
        };
        Object.defineProperty(BaseElView.prototype, "el", {
            get: function () {
                return this._el;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseElView.prototype, "uniqueID", {
            get: function () {
                return this._uniqueID;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseElView.prototype, "isVisible", {
            get: function () {
                var v = this.el.style.display;
                return !(v === "none");
            },
            set: function (v) {
                v = !!v;
                if (v !== this.isVisible) {
                    if (!v) {
                        this._viewState._display = this.el.style.display;
                        if (this._viewState._display === "none") {
                            this._viewState._display = null;
                        }
                        this.el.style.display = "none";
                    }
                    else {
                        this.el.style.display = (!this._viewState._display ? "" : this._viewState._display);
                    }
                    this.objEvents.raiseProp("isVisible");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseElView.prototype, "validationErrors", {
            get: function () {
                return this._viewState._errors;
            },
            set: function (v) {
                if (!this.getIsDisposed() && this._viewState._errors !== v) {
                    this._setErrors(this.el, v);
                    this.objEvents.raiseProp("validationErrors");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseElView.prototype, "dataName", {
            get: function () {
                return this._el.getAttribute("data-name");
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseElView.prototype, "toolTip", {
            get: function () {
                return this._viewState.tip;
            },
            set: function (v) {
                if (this.toolTip !== v) {
                    this._viewState.tip = v;
                    addToolTip(this.el, v);
                    this.objEvents.raiseProp("toolTip");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseElView.prototype, "events", {
            get: function () {
                var _this = this;
                if (!this._viewState._eventBag) {
                    if (this.getIsStateDirty()) {
                        return _undefined;
                    }
                    this._viewState._eventBag = new eventbag_1.EventBag(function (s, a) {
                        _this._onEventChanged(a);
                    });
                }
                return this._viewState._eventBag;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseElView.prototype, "props", {
            get: function () {
                if (!this._viewState._propBag) {
                    if (this.getIsStateDirty()) {
                        return _undefined;
                    }
                    this._viewState._propBag = new propbag_1.PropertyBag(this.el);
                }
                return this._viewState._propBag;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseElView.prototype, "classes", {
            get: function () {
                if (!this._viewState._classBag) {
                    if (this.getIsStateDirty()) {
                        return _undefined;
                    }
                    this._viewState._classBag = new cssbag_1.CSSBag(this.el);
                }
                return this._viewState._classBag;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseElView.prototype, "isDelegationOn", {
            get: function () {
                return !!(this._subscribeFlags & (1 << 0));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseElView.prototype, "css", {
            get: function () {
                return this._viewState.css;
            },
            set: function (v) {
                var arr = [];
                if (this.css !== v) {
                    if (!!this.css) {
                        arr.push("-" + this.css);
                    }
                    this._viewState.css = v;
                    if (!!this.css) {
                        arr.push("+" + this.css);
                    }
                    dom.setClasses([this._el], arr);
                    this.objEvents.raiseProp("css");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseElView.prototype, "app", {
            get: function () {
                return boot.app;
            },
            enumerable: true,
            configurable: true
        });
        return BaseElView;
    }(jriapp_shared_6.BaseObject));
    exports.BaseElView = BaseElView;
    boot.registerElView("generic", BaseElView);
    boot.registerElView("baseview", BaseElView);
});
define("jriapp_ui/input", ["require", "exports", "jriapp_ui/baseview"], function (require, exports, baseview_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var InputElView = (function (_super) {
        __extends(InputElView, _super);
        function InputElView() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        InputElView.prototype.toString = function () {
            return "InputElView";
        };
        Object.defineProperty(InputElView.prototype, "isEnabled", {
            get: function () {
                return this.el.disabled;
            },
            set: function (v) {
                v = !v;
                var el = this.el;
                if (v !== !this.isEnabled) {
                    el.disabled = v;
                    this.objEvents.raiseProp("isEnabled");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(InputElView.prototype, "value", {
            get: function () {
                return this.el.value;
            },
            set: function (v) {
                var x = this.value, str = "" + v;
                v = (!v) ? "" : str;
                if (x !== v) {
                    this.el.value = v;
                    this.objEvents.raiseProp("value");
                }
            },
            enumerable: true,
            configurable: true
        });
        return InputElView;
    }(baseview_1.BaseElView));
    exports.InputElView = InputElView;
});
define("jriapp_ui/textbox", ["require", "exports", "jriapp/utils/dom", "jriapp/bootstrap", "jriapp_ui/input"], function (require, exports, dom_5, bootstrap_4, input_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dom = dom_5.DomUtils, subscribeMap = bootstrap_4.subscribeWeakMap;
    var TXTBOX_EVENTS;
    (function (TXTBOX_EVENTS) {
        TXTBOX_EVENTS["keypress"] = "keypress";
    })(TXTBOX_EVENTS || (TXTBOX_EVENTS = {}));
    var TextBoxElView = (function (_super) {
        __extends(TextBoxElView, _super);
        function TextBoxElView(el, options) {
            var _this = _super.call(this, el, options) || this;
            var self = _this;
            if (_this.isDelegationOn) {
                subscribeMap.set(el, _this);
                _this._setIsSubcribed(2);
                _this._setIsSubcribed(3);
                if (!!options.updateOnKeyUp) {
                    _this._setIsSubcribed(5);
                }
            }
            else {
                dom.events.on(el, "change", function (e) {
                    e.stopPropagation();
                    self.handle_change(e);
                }, _this.uniqueID);
                dom.events.on(el, "keypress", function (e) {
                    self.handle_keypress(e);
                }, _this.uniqueID);
                if (!!options.updateOnKeyUp) {
                    dom.events.on(el, "keyup", function (e) {
                        self.handle_keyup(e);
                    }, _this.uniqueID);
                }
            }
            return _this;
        }
        TextBoxElView.prototype.handle_change = function (e) {
            this.objEvents.raiseProp("value");
            return true;
        };
        TextBoxElView.prototype.handle_keypress = function (e) {
            var args = {
                keyCode: e.which,
                value: e.target.value,
                isCancel: false
            };
            this.objEvents.raise("keypress", args);
            if (args.isCancel) {
                e.preventDefault();
            }
            return true;
        };
        TextBoxElView.prototype.handle_keyup = function (e) {
            this.objEvents.raiseProp("value");
        };
        TextBoxElView.prototype.addOnKeyPress = function (fn, nmspace) {
            this.objEvents.on("keypress", fn, nmspace);
        };
        TextBoxElView.prototype.offOnKeyPress = function (nmspace) {
            this.objEvents.off("keypress", nmspace);
        };
        TextBoxElView.prototype.toString = function () {
            return "TextBoxElView";
        };
        Object.defineProperty(TextBoxElView.prototype, "color", {
            get: function () {
                return this.el.style.color;
            },
            set: function (v) {
                var x = this.el.style.color;
                if (v !== x) {
                    this.el.style.color = v;
                    this.objEvents.raiseProp("color");
                }
            },
            enumerable: true,
            configurable: true
        });
        return TextBoxElView;
    }(input_1.InputElView));
    exports.TextBoxElView = TextBoxElView;
    bootstrap_4.bootstrap.registerElView("input:text", TextBoxElView);
});
define("jriapp_ui/content/string", ["require", "exports", "jriapp_ui/textbox", "jriapp_ui/content/basic"], function (require, exports, textbox_1, basic_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var StringContent = (function (_super) {
        __extends(StringContent, _super);
        function StringContent() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(StringContent.prototype, "allowedKeys", {
            get: function () {
                if (!StringContent._allowedKeys) {
                    StringContent._allowedKeys = [0, 8, 127, 37, 39, 35, 36, 9, 27, 13];
                }
                return StringContent._allowedKeys;
            },
            enumerable: true,
            configurable: true
        });
        StringContent.prototype.createView = function () {
            _super.prototype.createView.call(this);
            var self = this, fieldInfo = self.getFieldInfo();
            if (self.view instanceof textbox_1.TextBoxElView) {
                self.view.addOnKeyPress(function (sender, args) {
                    args.isCancel = !self.previewKeyPress(fieldInfo, args.keyCode, args.value);
                });
            }
        };
        StringContent.prototype.previewKeyPress = function (fieldInfo, keyCode, value) {
            if (this.allowedKeys.indexOf(keyCode) > -1) {
                return true;
            }
            return !(fieldInfo.maxLength > 0 && value.length >= fieldInfo.maxLength);
        };
        StringContent.prototype.toString = function () {
            return "StringContent";
        };
        StringContent._allowedKeys = null;
        return StringContent;
    }(basic_1.BasicContent));
    exports.StringContent = StringContent;
});
define("jriapp_ui/textarea", ["require", "exports", "jriapp/bootstrap", "jriapp_ui/textbox"], function (require, exports, bootstrap_5, textbox_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TextAreaElView = (function (_super) {
        __extends(TextAreaElView, _super);
        function TextAreaElView(el, options) {
            var _this = _super.call(this, el, options) || this;
            if (!!options.wrap) {
                el.wrap = options.wrap;
            }
            return _this;
        }
        TextAreaElView.prototype.toString = function () {
            return "TextAreaElView";
        };
        Object.defineProperty(TextAreaElView.prototype, "wrap", {
            get: function () {
                return this.el.wrap;
            },
            set: function (v) {
                var x = this.wrap;
                if (x !== v) {
                    this.el.wrap = v;
                    this.objEvents.raiseProp("wrap");
                }
            },
            enumerable: true,
            configurable: true
        });
        return TextAreaElView;
    }(textbox_2.TextBoxElView));
    exports.TextAreaElView = TextAreaElView;
    bootstrap_5.bootstrap.registerElView("textarea", TextAreaElView);
});
define("jriapp_ui/content/multyline", ["require", "exports", "jriapp_shared", "jriapp/utils/dom", "jriapp_ui/textarea", "jriapp_ui/content/basic"], function (require, exports, jriapp_shared_7, dom_6, textarea_1, basic_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_7.Utils, NAME = "multyline", format = utils.str.format, dom = dom_6.DomUtils, doc = dom.document;
    var MultyLineContent = (function (_super) {
        __extends(MultyLineContent, _super);
        function MultyLineContent(options) {
            var _this = this;
            if (options.contentOptions.name !== NAME) {
                throw new Error(format(jriapp_shared_7.LocaleERRS.ERR_ASSERTION_FAILED, "contentOptions.name === '" + NAME + "'"));
            }
            _this = _super.call(this, options) || this;
            return _this;
        }
        Object.defineProperty(MultyLineContent.prototype, "allowedKeys", {
            get: function () {
                if (!MultyLineContent._allowedKeys) {
                    MultyLineContent._allowedKeys = [0, 8, 127, 37, 39, 35, 36, 9, 27, 13];
                }
                return MultyLineContent._allowedKeys;
            },
            enumerable: true,
            configurable: true
        });
        MultyLineContent.prototype.createdEditingView = function () {
            var name = this.getViewName(true), el = doc.createElement("textarea"), options = this.options.options;
            var view = basic_2.getView(el, name, options);
            if (!!view) {
                this.lfScope.addObj(view);
            }
            var bindOption = basic_2.getBindingOption(true, this.options.fieldName, view, this.dataContext, "value", this.getConverter(true), this.getParam(true));
            this.lfScope.addObj(this.app.bind(bindOption));
            return view;
        };
        MultyLineContent.prototype.createdReadingView = function () {
            var name = this.getViewName(false), el = doc.createElement("div");
            var view = basic_2.getView(el, name, {});
            if (!!view) {
                this.lfScope.addObj(view);
            }
            var bindOption = basic_2.getBindingOption(false, this.options.fieldName, view, this.dataContext, "value", this.getConverter(false), this.getParam(false));
            this.lfScope.addObj(this.app.bind(bindOption));
            return view;
        };
        MultyLineContent.prototype.createView = function () {
            _super.prototype.createView.call(this);
            var self = this, fieldInfo = self.getFieldInfo();
            if (self.view instanceof textarea_1.TextAreaElView) {
                self.view.addOnKeyPress(function (sender, args) {
                    args.isCancel = !self.previewKeyPress(fieldInfo, args.keyCode, args.value);
                });
            }
        };
        MultyLineContent.prototype.previewKeyPress = function (fieldInfo, keyCode, value) {
            if (this.allowedKeys.indexOf(keyCode) > -1) {
                return true;
            }
            return !(fieldInfo.maxLength > 0 && value.length >= fieldInfo.maxLength);
        };
        MultyLineContent.prototype.toString = function () {
            return "MultyLineContent";
        };
        MultyLineContent._allowedKeys = null;
        return MultyLineContent;
    }(basic_2.BasicContent));
    exports.MultyLineContent = MultyLineContent;
});
define("jriapp_ui/content/bool", ["require", "exports", "jriapp/utils/dom", "jriapp_ui/content/basic"], function (require, exports, dom_7, basic_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dom = dom_7.DomUtils, doc = dom.document;
    var BoolContent = (function (_super) {
        __extends(BoolContent, _super);
        function BoolContent(options) {
            var _this = _super.call(this, options) || this;
            _this._label = null;
            return _this;
        }
        BoolContent.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            _super.prototype.dispose.call(this);
            if (!!this._label) {
                dom.removeNode(this._label);
                this._label = null;
            }
        };
        BoolContent.prototype.createCheckBoxView = function () {
            var finf = this.getFieldInfo(), isNullable = !finf ? false : finf.isNullable;
            var chk = document.createElement("input");
            chk.setAttribute("type", "checkbox");
            dom.addClass([chk], "ria-checkbox");
            var view = isNullable ? basic_3.getView(chk, "checkbox3", {}) : basic_3.getView(chk, "checkbox", {});
            if (!!view) {
                this.lfScope.addObj(view);
            }
            var label = doc.createElement("label");
            dom.addClass([label], "ria-checkbox");
            label.appendChild(view.el);
            label.appendChild(doc.createElement("span"));
            this._label = label;
            var options = basic_3.getBindingOption(true, this.options.fieldName, view, this.dataContext, "checked");
            this.lfScope.addObj(this.app.bind(options));
            return view;
        };
        BoolContent.prototype.createdEditingView = function () {
            return this.createCheckBoxView();
        };
        BoolContent.prototype.createdReadingView = function () {
            return this.createCheckBoxView();
        };
        BoolContent.prototype.beforeCreateView = function () {
            var res = !this.view && !!this.options.fieldName;
            if (!!this.view) {
                this.updateCss();
            }
            return res;
        };
        BoolContent.prototype.afterCreateView = function () {
            this.parentEl.appendChild(this._label);
        };
        BoolContent.prototype.updateCss = function () {
            _super.prototype.updateCss.call(this);
            var el = this.el;
            if (this.isEditing && this.getIsCanBeEdited()) {
                el.disabled = false;
            }
            else {
                el.disabled = true;
            }
        };
        BoolContent.prototype.toString = function () {
            return "BoolContent";
        };
        return BoolContent;
    }(basic_3.BasicContent));
    exports.BoolContent = BoolContent;
});
define("jriapp_ui/content/number", ["require", "exports", "jriapp/bootstrap", "jriapp_ui/textbox", "jriapp_ui/content/basic"], function (require, exports, bootstrap_6, textbox_3, basic_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var NumberContent = (function (_super) {
        __extends(NumberContent, _super);
        function NumberContent() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(NumberContent.prototype, "allowedKeys", {
            get: function () {
                if (!NumberContent._allowedKeys) {
                    NumberContent._allowedKeys = [0, 8, 127, 37, 39, 35, 36, 9, 27, 13];
                }
                return NumberContent._allowedKeys;
            },
            enumerable: true,
            configurable: true
        });
        NumberContent.prototype.getConverter = function (isEdit) {
            var finf = this.getFieldInfo();
            switch (finf.dataType) {
                case 3:
                    return this.app.getConverter("integerConverter");
                case 4:
                    return this.app.getConverter("decimalConverter");
                default:
                    return this.app.getConverter("floatConverter");
            }
        };
        NumberContent.prototype.createView = function () {
            _super.prototype.createView.call(this);
            var self = this;
            if (self.view instanceof textbox_3.TextBoxElView) {
                self.view.addOnKeyPress(function (sender, args) {
                    args.isCancel = !self.previewKeyPress(args.keyCode, args.value);
                });
            }
        };
        NumberContent.prototype.previewKeyPress = function (keyCode, value) {
            var ch = String.fromCharCode(keyCode), digits = "1234567890", defaults = bootstrap_6.bootstrap.defaults, notAllowedChars = "~@#$%^&*()+=_";
            if (notAllowedChars.indexOf(ch) > -1) {
                return false;
            }
            if (this.allowedKeys.indexOf(keyCode) > -1) {
                return true;
            }
            if (ch === "-" && value.length === 0) {
                return true;
            }
            if (ch === defaults.decimalPoint) {
                return (value.length === 0) ? false : value.indexOf(ch) < 0;
            }
            return (ch === defaults.thousandSep) ? true : digits.indexOf(ch) > -1;
        };
        NumberContent.prototype.toString = function () {
            return "NumberContent";
        };
        NumberContent._allowedKeys = null;
        return NumberContent;
    }(basic_4.BasicContent));
    exports.NumberContent = NumberContent;
});
define("jriapp_ui/content/date", ["require", "exports", "jriapp_shared", "jriapp_ui/content/basic"], function (require, exports, jriapp_shared_8, basic_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_8.Utils, format = utils.str.format;
    var NAME = "datepicker";
    var DateContent = (function (_super) {
        __extends(DateContent, _super);
        function DateContent(options) {
            var _this = this;
            if (options.contentOptions.name !== NAME) {
                throw new Error(format(jriapp_shared_8.LocaleERRS.ERR_ASSERTION_FAILED, "contentOptions.name === '" + NAME + "'"));
            }
            _this = _super.call(this, options) || this;
            return _this;
        }
        DateContent.prototype.getConverter = function (isEdit) {
            return this.app.getConverter("dateConverter");
        };
        DateContent.prototype.getViewName = function (isEdit) {
            return isEdit ? NAME : null;
        };
        DateContent.prototype.toString = function () {
            return "DateContent";
        };
        return DateContent;
    }(basic_5.BasicContent));
    exports.DateContent = DateContent;
});
define("jriapp_ui/content/datetime", ["require", "exports", "jriapp/bootstrap", "jriapp_ui/content/basic"], function (require, exports, bootstrap_7, basic_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DateTimeContent = (function (_super) {
        __extends(DateTimeContent, _super);
        function DateTimeContent() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        DateTimeContent.prototype.getParam = function (isEdit) {
            var finf = this.getFieldInfo(), defaults = bootstrap_7.bootstrap.defaults;
            switch (finf.dataType) {
                case 6:
                    return defaults.dateTimeFormat;
                case 7:
                    return defaults.dateFormat;
                case 8:
                    return defaults.timeFormat;
                default:
                    return null;
            }
        };
        DateTimeContent.prototype.getConverter = function (isEdit) {
            return this.app.getConverter("dateTimeConverter");
        };
        DateTimeContent.prototype.toString = function () {
            return "DateTimeContent";
        };
        return DateTimeContent;
    }(basic_6.BasicContent));
    exports.DateTimeContent = DateTimeContent;
});
define("jriapp_ui/listbox", ["require", "exports", "jriapp_shared", "jriapp/utils/dom", "jriapp/bootstrap", "jriapp_ui/baseview"], function (require, exports, jriapp_shared_9, dom_8, bootstrap_8, baseview_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_9.Utils, dom = dom_8.DomUtils, doc = dom.document, sys = utils.sys, _a = utils.check, _undefined = _a._undefined, isString = _a.isString, isNt = _a.isNt, _b = utils.core, forEachProp = _b.forEachProp, extend = _b.extend, getNewID = _b.getNewID, boot = bootstrap_8.bootstrap, subscribeMap = bootstrap_8.subscribeWeakMap;
    var LISTBOX_EVENTS;
    (function (LISTBOX_EVENTS) {
        LISTBOX_EVENTS["refreshed"] = "refreshed";
    })(LISTBOX_EVENTS || (LISTBOX_EVENTS = {}));
    function fn_Str(v) {
        return (isNt(v)) ? "" : ("" + v);
    }
    var ListBox = (function (_super) {
        __extends(ListBox, _super);
        function ListBox(el, options) {
            var _this = _super.call(this) || this;
            var self = _this;
            options = extend({
                dataSource: null,
                valuePath: null,
                textPath: null,
                statePath: null,
                syncSetDatasource: false,
                nodelegate: false
            }, options);
            if (!!options.dataSource && !sys.isCollection(options.dataSource)) {
                throw new Error(jriapp_shared_9.LocaleERRS.ERR_LISTBOX_DATASRC_INVALID);
            }
            _this._el = el;
            _this._options = options;
            _this._uniqueID = getNewID("lst");
            _this._isDSFilled = false;
            _this._textProvider = null;
            _this._stateProvider = null;
            _this._isRefreshing = false;
            _this._selectedValue = null;
            _this._dsDebounce = new jriapp_shared_9.Debounce();
            _this._stDebounce = new jriapp_shared_9.Debounce();
            _this._txtDebounce = new jriapp_shared_9.Debounce();
            _this._changeDebounce = new jriapp_shared_9.Debounce();
            _this._keyMap = {};
            _this._valMap = {};
            _this._savedVal = _undefined;
            _this._fnState = function (data) {
                if (!data || !data.item || data.item.getIsStateDirty()) {
                    return;
                }
                var item = data.item, path = self.statePath, val = !path ? null : sys.resolvePath(item, path), spr = self._stateProvider;
                data.op.className = !spr ? "" : spr.getCSS(item, data.op.index, val);
            };
            if (!_this._options.nodelegate) {
                subscribeMap.set(el, _this);
            }
            else {
                dom.events.on(el, "change", function (e) { return _this.handle_change(e); }, _this._uniqueID);
            }
            var ds = _this._options.dataSource;
            _this.setDataSource(ds);
            return _this;
        }
        ListBox.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            if (!this._options.nodelegate) {
                subscribeMap.delete(this._el);
            }
            dom.events.offNS(this._el, this._uniqueID);
            this._dsDebounce.dispose();
            this._stDebounce.dispose();
            this._txtDebounce.dispose();
            this._changeDebounce.dispose();
            this._fnCheckSelected = null;
            this._unbindDS();
            this._clear();
            this._el = null;
            this._selectedValue = _undefined;
            this._savedVal = _undefined;
            this._options = {};
            this._textProvider = null;
            this._stateProvider = null;
            this._isDSFilled = false;
            _super.prototype.dispose.call(this);
        };
        ListBox.prototype._bindDS = function () {
            var self = this, ds = this.dataSource;
            if (!ds) {
                return;
            }
            ds.addOnCollChanged(self._onDSCollectionChanged, self._uniqueID, self);
            ds.addOnBeginEdit(function (sender, args) {
                self._onEdit(args.item, true, false);
            }, self._uniqueID);
            ds.addOnEndEdit(function (sender, args) {
                self._onEdit(args.item, false, args.isCanceled);
            }, self._uniqueID);
            ds.addOnStatusChanged(function (sender, args) {
                self._onStatusChanged(args.item, args.oldStatus);
            }, self._uniqueID);
            ds.addOnCommitChanges(function (sender, args) {
                self._onCommitChanges(args.item, args.isBegin, args.isRejected, args.status);
            }, self._uniqueID);
        };
        ListBox.prototype._unbindDS = function () {
            var self = this, ds = this.dataSource;
            if (!ds) {
                return;
            }
            ds.objEvents.offNS(self._uniqueID);
        };
        ListBox.prototype._addOption = function (item, first) {
            var key = !item ? "" : item._key;
            if (!!this._keyMap[key]) {
                return null;
            }
            var selEl = this.el;
            var text = "";
            if (!item) {
                if (isString(this._options.emptyOptionText)) {
                    text = this._options.emptyOptionText;
                }
            }
            else {
                text = this._getText(item, selEl.options.length);
            }
            var val = fn_Str(this._getValue(item));
            var oOption = doc.createElement("option");
            oOption.text = text;
            oOption.value = key;
            var data = { item: item, op: oOption };
            this._keyMap[key] = data;
            if (!!val) {
                this._valMap[val] = data;
            }
            if (!!first) {
                if (selEl.options.length < 2) {
                    selEl.add(oOption, null);
                }
                else {
                    var firstOp = selEl.options[1];
                    selEl.add(oOption, firstOp);
                }
            }
            else {
                selEl.add(oOption, null);
            }
            if (!!item) {
                if (!!this.statePath) {
                    item.objEvents.onProp(this.statePath, this._fnState, this._uniqueID);
                }
                this._fnState(data);
            }
            return data;
        };
        ListBox.prototype._mapByValue = function () {
            var self = this;
            this._valMap = {};
            forEachProp(this._keyMap, function (key) {
                var data = self._keyMap[key], val = fn_Str(self._getValue(data.item));
                if (!!val) {
                    self._valMap[val] = data;
                }
            });
        };
        ListBox.prototype._resetText = function () {
            var self = this;
            forEachProp(this._keyMap, function (key) {
                var data = self._keyMap[key];
                data.op.text = self._getText(data.item, data.op.index);
            });
        };
        ListBox.prototype._resetState = function () {
            var self = this;
            forEachProp(this._keyMap, function (key) {
                self._fnState(self._keyMap[key]);
            });
        };
        ListBox.prototype._removeOption = function (item) {
            if (!!item) {
                var key = item._key, data = this._keyMap[key];
                if (!data) {
                    return;
                }
                item.objEvents.offNS(this._uniqueID);
                this.el.remove(data.op.index);
                var val = fn_Str(this._getValue(item));
                delete this._keyMap[key];
                if (!!val) {
                    delete this._valMap[val];
                }
                var curVal = this.getByIndex(this.selectedIndex);
                var v = (!curVal ? null : this._getValue(curVal.item));
                this._selectedValue = v;
                this.updateSelected(v);
            }
        };
        ListBox.prototype._clear = function () {
            var self = this, keys = Object.keys(self._keyMap);
            keys.forEach(function (key) {
                var data = self._keyMap[key];
                if (!!data && !!data.item) {
                    data.item.objEvents.offNS(self._uniqueID);
                }
            });
            this.el.options.length = 0;
            this._keyMap = {};
            this._valMap = {};
        };
        ListBox.prototype._refresh = function () {
            var self = this, ds = this.dataSource;
            this.beginTrackSelected();
            this._isRefreshing = true;
            try {
                this._clear();
                this._addOption(null, false);
                var cnt_1 = 0;
                if (!!ds) {
                    ds.forEach(function (item) {
                        self._addOption(item, false);
                        ++cnt_1;
                    });
                }
                if (this._isDSFilled && !isNt(this._selectedValue) && !this.getByValue(this._selectedValue)) {
                    this.selectedValue = null;
                }
                else {
                    self.updateSelected(this._selectedValue);
                }
                if (cnt_1 > 0) {
                    this._isDSFilled = true;
                }
            }
            finally {
                self._isRefreshing = false;
                this.endTrackSelected();
            }
            this.objEvents.raise("refreshed", {});
        };
        ListBox.prototype._onSelectedChanged = function () {
            var data = this.getByIndex(this.selectedIndex);
            if (!data) {
                this.selectedValue = null;
                return;
            }
            var newVal = this._getValue(data.item);
            this.selectedValue = newVal;
        };
        ListBox.prototype._getValue = function (item) {
            if (!item) {
                return null;
            }
            if (!!this._options.valuePath) {
                return sys.resolvePath(item, this._options.valuePath);
            }
            else {
                return null;
            }
        };
        ListBox.prototype._getText = function (item, index) {
            var res = "";
            if (!item) {
                return res;
            }
            if (!!this._options.textPath) {
                var t = sys.resolvePath(item, this._options.textPath);
                res = fn_Str(t);
            }
            else {
                res = fn_Str(this._getValue(item));
            }
            return (!this._textProvider) ? res : this._textProvider.getText(item, index, res);
        };
        ListBox.prototype._onDSCollectionChanged = function (sender, args) {
            var self = this;
            this.beginTrackSelected();
            try {
                switch (args.changeType) {
                    case 2:
                        {
                            this._refresh();
                        }
                        break;
                    case 1:
                        {
                            args.items.forEach(function (item) {
                                self._addOption(item, item._aspect.isNew);
                            });
                        }
                        break;
                    case 0:
                        {
                            args.items.forEach(function (item) {
                                self._removeOption(item);
                            });
                            if (!!self._textProvider) {
                                self._resetText();
                            }
                        }
                        break;
                    case 3:
                        {
                            var data = self._keyMap[args.old_key];
                            if (!!data) {
                                delete self._keyMap[args.old_key];
                                self._keyMap[args.new_key] = data;
                                data.op.value = args.new_key;
                            }
                        }
                        break;
                }
            }
            finally {
                this.endTrackSelected();
            }
        };
        ListBox.prototype._onEdit = function (item, isBegin, isCanceled) {
            var self = this;
            if (isBegin) {
                this.beginTrackSelected();
                this._savedVal = this._getValue(item);
            }
            else {
                try {
                    if (!isCanceled) {
                        var oldVal = this._savedVal;
                        this._savedVal = _undefined;
                        var key = item._key, data = self._keyMap[key];
                        if (!!data) {
                            data.op.text = self._getText(item, data.op.index);
                            var val = this._getValue(item);
                            if (oldVal !== val) {
                                if (!isNt(oldVal)) {
                                    delete self._valMap[fn_Str(oldVal)];
                                }
                                if (!isNt(val)) {
                                    self._valMap[fn_Str(val)] = data;
                                }
                            }
                        }
                        else {
                            if (!isNt(oldVal)) {
                                delete self._valMap[fn_Str(oldVal)];
                            }
                        }
                    }
                }
                finally {
                    this.endTrackSelected();
                }
            }
        };
        ListBox.prototype._onStatusChanged = function (item, oldStatus) {
            var newStatus = item._aspect.status;
            this.beginTrackSelected();
            if (newStatus === 3) {
                this._removeOption(item);
                if (!!this._textProvider) {
                    this._resetText();
                }
            }
            this.endTrackSelected();
        };
        ListBox.prototype._onCommitChanges = function (item, isBegin, isRejected, status) {
            var self = this;
            if (isBegin) {
                this.beginTrackSelected();
                if (isRejected && status === 1) {
                    return;
                }
                else if (!isRejected && status === 3) {
                    return;
                }
                this._savedVal = this._getValue(item);
            }
            else {
                var oldVal = this._savedVal;
                this._savedVal = _undefined;
                if (isRejected && status === 3) {
                    this._addOption(item, true);
                    this.endTrackSelected();
                    return;
                }
                try {
                    var val = this._getValue(item), data = self._keyMap[item._key];
                    if (oldVal !== val) {
                        if (!isNt(oldVal)) {
                            delete self._valMap[fn_Str(oldVal)];
                        }
                        if (!!data && !isNt(val)) {
                            self._valMap[fn_Str(val)] = data;
                        }
                    }
                    if (!!data) {
                        data.op.text = self._getText(item, data.op.index);
                    }
                }
                finally {
                    this.endTrackSelected();
                }
            }
        };
        ListBox.prototype.getItemIndex = function (item) {
            if (!item || item.getIsStateDirty()) {
                return -1;
            }
            var data = this._keyMap[item._key];
            return (!data) ? -1 : data.op.index;
        };
        ListBox.prototype.getByValue = function (val) {
            if (isNt(val)) {
                return null;
            }
            var key = fn_Str(val);
            var data = this._valMap[key];
            return (!data) ? null : data;
        };
        ListBox.prototype.getByIndex = function (index) {
            if (index >= 0 && index < this.el.length) {
                var op = this.el.options[index], key = op.value;
                return this._keyMap[key];
            }
            return null;
        };
        ListBox.prototype.updateSelected = function (v) {
            var data = (isNt(v) ? null : this.getByValue(v));
            var index = (!data ? 0 : data.op.index), oldRefreshing = this._isRefreshing;
            this._isRefreshing = true;
            try {
                this.selectedIndex = index;
            }
            finally {
                this._isRefreshing = oldRefreshing;
            }
        };
        ListBox.prototype.beginTrackSelected = function () {
            if (!!this._fnCheckSelected) {
                return;
            }
            var self = this, prevVal = fn_Str(self.selectedValue), prevItem = self.selectedItem;
            this._fnCheckSelected = function () {
                self._fnCheckSelected = null;
                var newVal = fn_Str(self.selectedValue), newItem = self.selectedItem;
                if (prevVal !== newVal) {
                    self.objEvents.raiseProp("selectedValue");
                }
                if (prevItem !== newItem) {
                    self.objEvents.raiseProp("selectedItem");
                }
            };
        };
        ListBox.prototype.endTrackSelected = function () {
            var _this = this;
            this._changeDebounce.enque(function () {
                var fn = _this._fnCheckSelected;
                _this._fnCheckSelected = null;
                if (!!fn) {
                    fn();
                }
            });
        };
        ListBox.prototype.setIsEnabled = function (el, v) {
            el.disabled = !v;
        };
        ListBox.prototype.getIsEnabled = function (el) {
            return !el.disabled;
        };
        ListBox.prototype.setDataSource = function (v) {
            var _this = this;
            this._isDSFilled = false;
            this.beginTrackSelected();
            this._unbindDS();
            this._options.dataSource = v;
            var fn_init = function () {
                try {
                    var ds = _this._options.dataSource;
                    _this._txtDebounce.cancel();
                    _this._stDebounce.cancel();
                    if (!!ds && !ds.getIsStateDirty()) {
                        _this._bindDS();
                        _this._refresh();
                    }
                    else {
                        _this._clear();
                        _this._addOption(null, false);
                    }
                }
                finally {
                    _this.endTrackSelected();
                }
            };
            if (!!this._options.syncSetDatasource) {
                fn_init();
            }
            else {
                this._dsDebounce.enque(fn_init);
            }
        };
        Object.defineProperty(ListBox.prototype, "selectedIndex", {
            get: function () {
                return (!this.el || this.el.length == 0) ? -1 : this.el.selectedIndex;
            },
            set: function (v) {
                if (!!this.el && this.el.length > v && this.selectedIndex !== v) {
                    this.el.selectedIndex = v;
                }
            },
            enumerable: true,
            configurable: true
        });
        ListBox.prototype.isSubscribed = function (flag) {
            return !this._options.nodelegate && flag === 2;
        };
        ListBox.prototype.handle_change = function (e) {
            if (this._isRefreshing) {
                return true;
            }
            this._onSelectedChanged();
            return true;
        };
        ListBox.prototype.addOnRefreshed = function (fn, nmspace, context) {
            this.objEvents.on("refreshed", fn, nmspace, context);
        };
        ListBox.prototype.offOnRefreshed = function (nmspace) {
            this.objEvents.off("refreshed", nmspace);
        };
        ListBox.prototype.getText = function (val) {
            var data = this.getByValue(val);
            return (!data) ? "" : data.op.text;
        };
        ListBox.prototype.toString = function () {
            return "ListBox";
        };
        Object.defineProperty(ListBox.prototype, "dataSource", {
            get: function () {
                return this._options.dataSource;
            },
            set: function (v) {
                if (this.dataSource !== v) {
                    this.setDataSource(v);
                    this.objEvents.raiseProp("dataSource");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBox.prototype, "selectedValue", {
            get: function () {
                return (!isNt(this._selectedValue) && !this.getByValue(this._selectedValue)) ? _undefined : this._selectedValue;
            },
            set: function (v) {
                if (this._selectedValue !== v) {
                    var oldItem = this.selectedItem;
                    this._selectedValue = v;
                    this.updateSelected(v);
                    this._fnCheckSelected = null;
                    this.objEvents.raiseProp("selectedValue");
                    if (oldItem !== this.selectedItem) {
                        this.objEvents.raiseProp("selectedItem");
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBox.prototype, "selectedItem", {
            get: function () {
                var item = this.getByValue(this._selectedValue);
                return (!item ? null : item.item);
            },
            set: function (v) {
                var newVal = this._getValue(v), oldItem = this.selectedItem;
                if (this._selectedValue !== newVal) {
                    this._selectedValue = newVal;
                    var item = this.getByValue(newVal);
                    this.selectedIndex = (!item ? 0 : item.op.index);
                    this._fnCheckSelected = null;
                    this.objEvents.raiseProp("selectedValue");
                    if (oldItem !== this.selectedItem) {
                        this.objEvents.raiseProp("selectedItem");
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBox.prototype, "valuePath", {
            get: function () {
                return this._options.valuePath;
            },
            set: function (v) {
                if (v !== this.valuePath) {
                    this._options.valuePath = v;
                    this._mapByValue();
                    this.objEvents.raiseProp("valuePath");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBox.prototype, "textPath", {
            get: function () {
                return this._options.textPath;
            },
            set: function (v) {
                if (v !== this.textPath) {
                    this._options.textPath = v;
                    this._resetText();
                    this.objEvents.raiseProp("textPath");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBox.prototype, "statePath", {
            get: function () {
                return this._options.statePath;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBox.prototype, "isEnabled", {
            get: function () {
                return this.getIsEnabled(this.el);
            },
            set: function (v) {
                if (v !== this.isEnabled) {
                    this.setIsEnabled(this.el, v);
                    this.objEvents.raiseProp("isEnabled");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBox.prototype, "textProvider", {
            get: function () {
                return this._textProvider;
            },
            set: function (v) {
                var _this = this;
                if (v !== this._textProvider) {
                    this._textProvider = v;
                    this._txtDebounce.enque(function () {
                        _this._resetText();
                    });
                    this.objEvents.raiseProp("textProvider");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBox.prototype, "stateProvider", {
            get: function () {
                return this._stateProvider;
            },
            set: function (v) {
                var _this = this;
                if (v !== this._stateProvider) {
                    this._stateProvider = v;
                    this._stDebounce.enque(function () {
                        _this._resetState();
                    });
                    this.objEvents.raiseProp("stateProvider");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBox.prototype, "el", {
            get: function () {
                return this._el;
            },
            enumerable: true,
            configurable: true
        });
        return ListBox;
    }(jriapp_shared_9.BaseObject));
    exports.ListBox = ListBox;
    var ListBoxElView = (function (_super) {
        __extends(ListBoxElView, _super);
        function ListBoxElView(el, options) {
            var _this = _super.call(this, el, options) || this;
            var self = _this;
            self._listBox = new ListBox(el, options);
            self._listBox.objEvents.onProp("*", function (sender, args) {
                switch (args.property) {
                    case "dataSource":
                    case "isEnabled":
                    case "selectedValue":
                    case "selectedItem":
                    case "valuePath":
                    case "textPath":
                    case "textProvider":
                    case "stateProvider":
                        self.objEvents.raiseProp(args.property);
                        break;
                }
            }, self.uniqueID);
            return _this;
        }
        ListBoxElView.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            if (!this._listBox.getIsStateDirty()) {
                this._listBox.dispose();
            }
            _super.prototype.dispose.call(this);
        };
        ListBoxElView.prototype.toString = function () {
            return "ListBoxElView";
        };
        ListBoxElView.prototype.addOnRefreshed = function (fn, nmspace, context) {
            this._listBox.objEvents.on("refreshed", fn, nmspace, context);
        };
        ListBoxElView.prototype.offOnRefreshed = function (nmspace) {
            this._listBox.objEvents.off("refreshed", nmspace);
        };
        ListBoxElView.prototype.getText = function (val) {
            return this._listBox.getText(val);
        };
        Object.defineProperty(ListBoxElView.prototype, "isEnabled", {
            get: function () {
                return !this.el.disabled;
            },
            set: function (v) {
                v = !v;
                if (v !== !this.isEnabled) {
                    this.el.disabled = v;
                    this.objEvents.raiseProp("isEnabled");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBoxElView.prototype, "dataSource", {
            get: function () {
                return this._listBox.dataSource;
            },
            set: function (v) {
                var self = this;
                if (self.dataSource !== v) {
                    self._listBox.dataSource = v;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBoxElView.prototype, "selectedValue", {
            get: function () {
                return (this.getIsStateDirty()) ? _undefined : this._listBox.selectedValue;
            },
            set: function (v) {
                if (this._listBox.selectedValue !== v) {
                    this._listBox.selectedValue = v;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBoxElView.prototype, "selectedItem", {
            get: function () {
                return (this.getIsStateDirty()) ? _undefined : this._listBox.selectedItem;
            },
            set: function (v) {
                this._listBox.selectedItem = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBoxElView.prototype, "valuePath", {
            get: function () {
                return this._listBox.valuePath;
            },
            set: function (v) {
                this._listBox.valuePath = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBoxElView.prototype, "textPath", {
            get: function () {
                return this._listBox.textPath;
            },
            set: function (v) {
                this._listBox.textPath = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBoxElView.prototype, "textProvider", {
            get: function () {
                return this._listBox.textProvider;
            },
            set: function (v) {
                this._listBox.textProvider = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBoxElView.prototype, "stateProvider", {
            get: function () {
                return this._listBox.stateProvider;
            },
            set: function (v) {
                this._listBox.stateProvider = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBoxElView.prototype, "listBox", {
            get: function () {
                return this._listBox;
            },
            enumerable: true,
            configurable: true
        });
        return ListBoxElView;
    }(baseview_2.BaseElView));
    exports.ListBoxElView = ListBoxElView;
    boot.registerElView("select", ListBoxElView);
});
define("jriapp_ui/content/lookup", ["require", "exports", "jriapp_shared", "jriapp/utils/dom", "jriapp_ui/listbox", "jriapp_ui/content/basic"], function (require, exports, jriapp_shared_10, dom_9, listbox_1, basic_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_10.Utils, dom = dom_9.DomUtils, doc = dom.document, _undefined = utils.check._undefined, format = utils.str.format, getNewID = utils.core.getNewID, sys = utils.sys;
    var LOOKUP_EVENTS;
    (function (LOOKUP_EVENTS) {
        LOOKUP_EVENTS["obj_created"] = "object_created";
        LOOKUP_EVENTS["obj_needed"] = "object_needed";
    })(LOOKUP_EVENTS || (LOOKUP_EVENTS = {}));
    var LookupConverter = (function () {
        function LookupConverter(content) {
            this._content = content;
        }
        LookupConverter.prototype.convertToSource = function (val, param, dataContext) {
            return _undefined;
        };
        LookupConverter.prototype.convertToTarget = function (val, param, dataContext) {
            return this._content.getLookupText(val);
        };
        LookupConverter.prototype.toString = function () {
            return "LookupConverter";
        };
        return LookupConverter;
    }());
    var LookupContent = (function (_super) {
        __extends(LookupContent, _super);
        function LookupContent(options) {
            var _this = this;
            if (options.contentOptions.name !== "lookup") {
                throw new Error(format(jriapp_shared_10.LocaleERRS.ERR_ASSERTION_FAILED, "contentOptions.name === 'lookup'"));
            }
            _this = _super.call(this, options) || this;
            _this._converter = new LookupConverter(_this);
            _this._listBox = null;
            _this._isListBoxCachedExternally = false;
            _this._uniqueID = getNewID("lkup");
            if (!!_this.options.initContentFn) {
                _this.options.initContentFn(_this);
            }
            return _this;
        }
        LookupContent.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            if (!!this._listBox) {
                this._listBox.objEvents.offNS(this.uniqueID);
                if (!this._isListBoxCachedExternally && !this._listBox.getIsStateDirty()) {
                    this._listBox.dispose();
                }
                this._listBox = null;
            }
            this._converter = null;
            _super.prototype.dispose.call(this);
        };
        LookupContent.prototype.getConverter = function (isEdit) {
            return (!isEdit) ? this._converter : null;
        };
        LookupContent.prototype.getListBox = function () {
            if (!!this._listBox) {
                return this._listBox;
            }
            var lookUpOptions = this.options.options, objectKey = "listBox";
            var args1 = {
                objectKey: objectKey,
                result: null
            };
            this.objEvents.raise("object_needed", args1);
            if (!!args1.result) {
                this._isListBoxCachedExternally = true;
                this._listBox = args1.result;
            }
            if (!!this._listBox) {
                this._listBox.addOnRefreshed(this.onListRefreshed, this.uniqueID, this);
                return this._listBox;
            }
            var listBox = this.createListBox(lookUpOptions);
            var args2 = {
                objectKey: objectKey,
                result: listBox,
                isCachedExternally: false
            };
            this.objEvents.raise("object_created", args2);
            this._isListBoxCachedExternally = args2.isCachedExternally;
            this._listBox = listBox;
            this._listBox.addOnRefreshed(this.onListRefreshed, this.uniqueID, this);
            return this._listBox;
        };
        LookupContent.prototype.onListRefreshed = function () {
            var bindings = this.lfScope.getObjs().filter(function (obj) { return sys.isBinding(obj); }).map(function (obj) { return obj; });
            bindings.forEach(function (binding) {
                if (binding.targetPath.length > 0 && binding.targetPath[0] === "value") {
                    binding.updateTarget();
                }
            });
        };
        LookupContent.prototype.createListBox = function (lookUpOptions) {
            var el = doc.createElement("select"), options = {
                valuePath: lookUpOptions.valuePath,
                textPath: lookUpOptions.textPath,
                statePath: (!lookUpOptions.statePath) ? null : lookUpOptions.statePath,
                syncSetDatasource: true,
                dataSource: sys.resolvePath(this.app, lookUpOptions.dataSource)
            };
            el.setAttribute("size", "1");
            return new listbox_1.ListBoxElView(el, options);
        };
        LookupContent.prototype.cleanUp = function () {
            _super.prototype.cleanUp.call(this);
            if (!!this._listBox && this._isListBoxCachedExternally) {
                this._listBox.objEvents.offNS(this.uniqueID);
                this._listBox = null;
            }
        };
        LookupContent.prototype.bindToList = function (listBox) {
            var options = {
                target: listBox,
                source: this.dataContext,
                targetPath: "selectedValue",
                sourcePath: this.options.fieldName,
                isSourceFixed: false,
                mode: 2,
                converter: null,
                param: null,
                isBind: false
            };
            return this.app.bind(options);
        };
        LookupContent.prototype.createdEditingView = function () {
            var listBox = this.getListBox();
            this.lfScope.addObj(this.bindToList(listBox));
            return listBox;
        };
        LookupContent.prototype.beforeCreateView = function () {
            this.cleanUp();
            return !!this.options.fieldName;
        };
        LookupContent.prototype.addOnObjectCreated = function (fn, nmspace) {
            this.objEvents.on("object_created", fn, nmspace);
        };
        LookupContent.prototype.offOnObjectCreated = function (nmspace) {
            this.objEvents.off("object_created", nmspace);
        };
        LookupContent.prototype.addOnObjectNeeded = function (fn, nmspace) {
            this.objEvents.on("object_needed", fn, nmspace);
        };
        LookupContent.prototype.offOnObjectNeeded = function (nmspace) {
            this.objEvents.off("object_needed", nmspace);
        };
        LookupContent.prototype.getLookupText = function (val) {
            var listBox = this.getListBox();
            return listBox.getText(val);
        };
        LookupContent.prototype.toString = function () {
            return "LookupContent";
        };
        Object.defineProperty(LookupContent.prototype, "uniqueID", {
            get: function () {
                return this._uniqueID;
            },
            enumerable: true,
            configurable: true
        });
        return LookupContent;
    }(basic_7.BasicContent));
    exports.LookupContent = LookupContent;
});
define("jriapp_ui/content/factory", ["require", "exports", "jriapp_shared", "jriapp_ui/content/basic", "jriapp_ui/content/template", "jriapp_ui/content/string", "jriapp_ui/content/multyline", "jriapp_ui/content/bool", "jriapp_ui/content/number", "jriapp_ui/content/date", "jriapp_ui/content/datetime", "jriapp_ui/content/lookup", "jriapp/bootstrap"], function (require, exports, jriapp_shared_11, basic_8, template_2, string_1, multyline_1, bool_1, number_1, date_1, datetime_1, lookup_1, bootstrap_9) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_11.Utils, format = utils.str.format;
    var factoryInstance;
    var ContentFactory = (function () {
        function ContentFactory(nextFactory) {
            this._nextFactory = nextFactory;
        }
        ContentFactory.prototype.getContentType = function (options) {
            if (!!options.template) {
                return template_2.TemplateContent;
            }
            if (!options.fieldName) {
                throw new Error(format(jriapp_shared_11.LocaleERRS.ERR_PARAM_INVALID, "options", "fieldName"));
            }
            if (options.name === "lookup") {
                return lookup_1.LookupContent;
            }
            var fieldInfo = options.fieldInfo;
            var res;
            switch (fieldInfo.dataType) {
                case 0:
                    res = basic_8.BasicContent;
                    break;
                case 1:
                    res = (options.name === "multyline") ? multyline_1.MultyLineContent : string_1.StringContent;
                    break;
                case 2:
                    res = bool_1.BoolContent;
                    break;
                case 3:
                    res = number_1.NumberContent;
                    break;
                case 4:
                case 5:
                    res = number_1.NumberContent;
                    break;
                case 6:
                case 8:
                    res = datetime_1.DateTimeContent;
                    break;
                case 7:
                    res = (options.name === "datepicker") ? date_1.DateContent : datetime_1.DateTimeContent;
                    break;
                case 9:
                case 10:
                    res = basic_8.BasicContent;
                    break;
                default:
                    throw new Error(format(jriapp_shared_11.LocaleERRS.ERR_FIELD_DATATYPE, fieldInfo.dataType));
            }
            if (!res) {
                if (!this._nextFactory) {
                    throw new Error(jriapp_shared_11.LocaleERRS.ERR_BINDING_CONTENT_NOT_FOUND);
                }
                else {
                    return this._nextFactory.getContentType(options);
                }
            }
            else {
                return res;
            }
        };
        ContentFactory.prototype.isExternallyCachable = function (contentType) {
            if (lookup_1.LookupContent === contentType) {
                return true;
            }
            if (!this._nextFactory) {
                return false;
            }
            return this._nextFactory.isExternallyCachable(contentType);
        };
        return ContentFactory;
    }());
    function initContentFactory() {
        if (!factoryInstance) {
            factoryInstance = new ContentFactory();
            bootstrap_9.bootstrap.contentFactory.addFactory(function (nextFactory) {
                return factoryInstance;
            });
        }
    }
    exports.initContentFactory = initContentFactory;
});
define("jriapp_ui/utils/jquery", ["require", "exports", "jriapp_shared"], function (require, exports, jriapp_shared_12) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    if (!("jQuery" in window)) {
        throw new Error(jriapp_shared_12.LocaleERRS.ERR_APP_NEED_JQUERY);
    }
    exports.$ = jQuery;
    var JQueryUtils = (function () {
        function JQueryUtils() {
        }
        JQueryUtils.dispose$Plugin = function ($el, name) {
            var plugin = $el.data(name);
            if (!!plugin) {
                $el[name]("destroy");
            }
        };
        JQueryUtils.$ = jQuery;
        return JQueryUtils;
    }());
    exports.JQueryUtils = JQueryUtils;
});
define("jriapp_ui/utils/tooltip", ["require", "exports", "jriapp_ui/utils/jquery", "jriapp/utils/dom"], function (require, exports, jquery_1, dom_10) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var window = dom_10.DomUtils.window;
    var css;
    (function (css) {
        css["toolTip"] = "qtip";
        css["toolTipError"] = "qtip-red";
    })(css = exports.css || (exports.css = {}));
    function createToolTipSvc() {
        return new TooltipService();
    }
    exports.createToolTipSvc = createToolTipSvc;
    var TooltipService = (function () {
        function TooltipService() {
        }
        TooltipService.prototype.addToolTip = function (el, tip, isError, pos) {
            var $el = jquery_1.$(el), options = {
                content: {
                    text: tip
                },
                style: {
                    classes: !!isError ? "qtip-red" : "qtip"
                },
                position: {
                    my: "top left",
                    at: (!!pos) ? pos : "bottom right",
                    viewport: jquery_1.$(window),
                    adjust: {
                        method: "flip",
                        x: 0,
                        y: 0
                    }
                },
                hide: {
                    event: "unfocus click mouseleave",
                    leave: true
                }
            };
            if (!!$el.data("qtip")) {
                if (!tip) {
                    $el.qtip("destroy", true);
                }
                else {
                    $el.qtip("option", "content.text", tip);
                }
            }
            else if (!!tip) {
                $el.qtip(options);
            }
        };
        return TooltipService;
    }());
});
define("jriapp_ui/utils/datepicker", ["require", "exports", "jriapp_shared", "jriapp_ui/utils/jquery"], function (require, exports, jriapp_shared_13, jquery_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ERRS = jriapp_shared_13.LocaleERRS;
    function createDatepickerSvc() {
        return new Datepicker();
    }
    exports.createDatepickerSvc = createDatepickerSvc;
    var Datepicker = (function (_super) {
        __extends(Datepicker, _super);
        function Datepicker() {
            var _this = _super.call(this) || this;
            _this._dateFormat = null;
            _this._datepickerRegion = "";
            if (!jquery_2.$.datepicker) {
                throw new Error(ERRS.ERR_JQUERY_DATEPICKER_NOTFOUND);
            }
            _this.dateFormat = "dd.mm.yy";
            return _this;
        }
        Datepicker.prototype.toString = function () {
            return "Datepicker";
        };
        Datepicker.prototype.attachTo = function (el, options, onSelect) {
            var $el = jquery_2.$(el);
            if (!!options) {
                $el.datepicker(options);
            }
            else {
                $el.datepicker();
            }
            if (!!onSelect) {
                $el.datepicker("option", "onSelect", function (dateText) {
                    onSelect(dateText);
                });
            }
        };
        Datepicker.prototype.detachFrom = function (el) {
            jquery_2.JQueryUtils.dispose$Plugin(jquery_2.$(el), "datepicker");
        };
        Datepicker.prototype.parseDate = function (str) {
            return this.datePickerFn.parseDate(this.dateFormat, str);
        };
        Datepicker.prototype.formatDate = function (date) {
            return this.datePickerFn.formatDate(this.dateFormat, date);
        };
        Object.defineProperty(Datepicker.prototype, "dateFormat", {
            get: function () {
                if (!this._dateFormat) {
                    var regional = this.datePickerFn.regional[this._datepickerRegion];
                    return regional.dateFormat;
                }
                else {
                    return this._dateFormat;
                }
            },
            set: function (v) {
                if (this.dateFormat !== v) {
                    this._dateFormat = v;
                    var regional = this.datePickerFn.regional[this._datepickerRegion];
                    if (!!this._dateFormat) {
                        regional.dateFormat = this._dateFormat;
                        this.datePickerFn.setDefaults(regional);
                    }
                    this.objEvents.raiseProp("dateFormat");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Datepicker.prototype, "datepickerRegion", {
            get: function () { return this._datepickerRegion; },
            set: function (v) {
                if (!v) {
                    v = "";
                }
                var oldDateFormat = this.dateFormat;
                if (this._datepickerRegion !== v) {
                    var regional = this.datePickerFn.regional[v];
                    if (!!regional) {
                        this._datepickerRegion = v;
                        regional.dateFormat = oldDateFormat;
                        this.datePickerFn.setDefaults(regional);
                        this.objEvents.raiseProp("datepickerRegion");
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Datepicker.prototype, "datePickerFn", {
            get: function () {
                return jquery_2.$.datepicker;
            },
            enumerable: true,
            configurable: true
        });
        return Datepicker;
    }(jriapp_shared_13.BaseObject));
});
define("jriapp_ui/utils/errors", ["require", "exports", "jriapp_shared", "jriapp/bootstrap", "jriapp/utils/dom"], function (require, exports, jriapp_shared_14, bootstrap_10, dom_11) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var boot = bootstrap_10.bootstrap, dom = dom_11.DomUtils, formMap = jriapp_shared_14.createWeakMap();
    function addToolTip(el, tip, isError, pos) {
        var svc = boot.getSvc("ITooltipService");
        svc.addToolTip(el, tip, isError, pos);
    }
    function getErrorTipInfo(errors) {
        var tip = ["<b>", jriapp_shared_14.LocaleSTRS.VALIDATE.errorInfo, "</b>", "<br/>"];
        errors.forEach(function (info) {
            var res = "";
            info.errors.forEach(function (str) {
                res = res + " " + str;
            });
            tip.push(res);
            res = "";
        });
        return tip.join("");
    }
    function getFormErrorTipInfo(errors) {
        var tip = ["<b>", jriapp_shared_14.LocaleSTRS.VALIDATE.errorInfo, "</b>", "<ul>"];
        errors.forEach(function (info) {
            var fieldName = info.fieldName;
            var res = "";
            if (!!fieldName) {
                res = jriapp_shared_14.LocaleSTRS.VALIDATE.errorField + " " + fieldName;
            }
            info.errors.forEach(function (str) {
                if (!!res) {
                    res = res + " -> " + str;
                }
                else {
                    res = str;
                }
            });
            tip.push("<li>" + res + "</li>");
            res = "";
        });
        tip.push("</ul>");
        return tip.join("");
    }
    function setError(el, isError) {
        dom.setClass([el], "ria-field-error", !isError);
    }
    function addError(el) {
        setError(el, true);
    }
    function removeError(el) {
        setError(el, false);
    }
    var UIErrorsService = (function () {
        function UIErrorsService() {
        }
        UIErrorsService.prototype.setErrors = function (el, errors, toolTip) {
            if (!!errors && errors.length > 0) {
                addToolTip(el, getErrorTipInfo(errors), true);
                addError(el);
            }
            else {
                addToolTip(el, toolTip);
                removeError(el);
            }
        };
        UIErrorsService.prototype.setFormErrors = function (el, errors) {
            var gliph = formMap.get(el);
            if (!!errors && errors.length > 0) {
                if (!gliph) {
                    gliph = dom.fromHTML("<div data-name=\"error_info\" class=\"" + "ria-form-error" + "\" />")[0];
                    dom.prepend(el, gliph);
                    formMap.set(el, gliph);
                }
                addToolTip(gliph, getFormErrorTipInfo(errors), true);
                addError(el);
            }
            else {
                if (!!gliph) {
                    addToolTip(gliph, null);
                    formMap.delete(el);
                    dom.removeNode(gliph);
                }
                removeError(el);
            }
        };
        return UIErrorsService;
    }());
    function createUIErrorsSvc() {
        return new UIErrorsService();
    }
    exports.createUIErrorsSvc = createUIErrorsSvc;
});
define("jriapp_ui/dialog", ["require", "exports", "jriapp_shared", "jriapp_ui/utils/jquery", "jriapp/utils/dom", "jriapp/template", "jriapp/bootstrap", "jriapp/mvvm"], function (require, exports, jriapp_shared_15, jquery_3, dom_12, template_3, bootstrap_11, mvvm_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_15.Utils, _a = utils.check, _undefined = _a._undefined, isFunc = _a.isFunc, format = utils.str.format, _b = utils.core, extend = _b.extend, getNewID = _b.getNewID, sys = utils.sys, _async = utils.defer, doc = dom_12.DomUtils.document, ERROR = utils.err, boot = bootstrap_11.bootstrap;
    var DIALOG_ACTION;
    (function (DIALOG_ACTION) {
        DIALOG_ACTION[DIALOG_ACTION["Default"] = 0] = "Default";
        DIALOG_ACTION[DIALOG_ACTION["StayOpen"] = 1] = "StayOpen";
    })(DIALOG_ACTION = exports.DIALOG_ACTION || (exports.DIALOG_ACTION = {}));
    ;
    var DLG_EVENTS;
    (function (DLG_EVENTS) {
        DLG_EVENTS["close"] = "close";
        DLG_EVENTS["refresh"] = "refresh";
    })(DLG_EVENTS || (DLG_EVENTS = {}));
    var SubmitInfo = (function () {
        function SubmitInfo(dataContext) {
            this._dataContext = dataContext;
            this._submitError = false;
            this._editable = sys.getEditable(this._dataContext);
        }
        SubmitInfo.prototype.submit = function () {
            var self = this, submittable = sys.getSubmittable(this._dataContext);
            if (!submittable || !submittable.isCanSubmit) {
                return _async.resolve();
            }
            var promise = submittable.submitChanges();
            promise.then(function () {
                self._submitError = false;
            }).catch(function () {
                self._submitError = true;
            });
            return promise;
        };
        SubmitInfo.prototype.reject = function () {
            var submittable = sys.getSubmittable(this._dataContext);
            if (!!submittable) {
                submittable.rejectChanges();
            }
            this._submitError = false;
        };
        SubmitInfo.prototype.cancel = function () {
            if (!!this._editable) {
                this._editable.cancelEdit();
            }
            if (!!this._submitError) {
                this.reject();
            }
        };
        SubmitInfo.prototype.endEdit = function () {
            return (!!this._editable && this._editable.isEditing) ? this._editable.endEdit() : true;
        };
        SubmitInfo.prototype.beginEdit = function () {
            return (!!this._editable) ? (this._editable.isEditing || this._editable.beginEdit()) : false;
        };
        Object.defineProperty(SubmitInfo.prototype, "dataContext", {
            get: function () { return this._dataContext; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SubmitInfo.prototype, "submitError", {
            get: function () { return this._submitError; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SubmitInfo.prototype, "editable", {
            get: function () {
                return this._editable;
            },
            enumerable: true,
            configurable: true
        });
        return SubmitInfo;
    }());
    var DataEditDialog = (function (_super) {
        __extends(DataEditDialog, _super);
        function DataEditDialog(options) {
            var _this = _super.call(this) || this;
            var self = _this;
            options = extend({
                dataContext: null,
                templateID: null,
                width: 500,
                height: 350,
                title: "Data edit dialog",
                submitOnOK: false,
                canRefresh: false,
                canCancel: true,
                fn_OnClose: null,
                fn_OnOK: null,
                fn_OnShow: null,
                fn_OnCancel: null,
                fn_OnTemplateCreated: null,
                fn_OnTemplateDestroy: null
            }, options);
            _this._uniqueID = getNewID("dlg");
            _this._dataContext = options.dataContext;
            _this._templateID = options.templateID;
            _this._submitOnOK = options.submitOnOK;
            _this._canRefresh = options.canRefresh;
            _this._canCancel = options.canCancel;
            _this._fnOnClose = options.fn_OnClose;
            _this._fnOnOK = options.fn_OnOK;
            _this._fnOnShow = options.fn_OnShow;
            _this._fnOnCancel = options.fn_OnCancel;
            _this._fnOnTemplateCreated = options.fn_OnTemplateCreated;
            _this._fnOnTemplateDestroy = options.fn_OnTemplateDestroy;
            _this._template = null;
            _this._$dlgEl = null;
            _this._result = null;
            _this._selectedControl = null;
            _this._submitInfo = null;
            _this._options = {
                width: options.width,
                height: options.height,
                title: options.title,
                autoOpen: false,
                modal: true,
                close: function (event, ui) {
                    self._onClose();
                },
                buttons: self._getButtons()
            };
            _this._deferredTemplate = utils.defer.createDeferred();
            _this._createDialog();
            return _this;
        }
        DataEditDialog.prototype.addOnClose = function (fn, nmspace, context) {
            this.objEvents.on("close", fn, nmspace, context);
        };
        DataEditDialog.prototype.offOnClose = function (nmspace) {
            this.objEvents.off("close", nmspace);
        };
        DataEditDialog.prototype.addOnRefresh = function (fn, nmspace, context) {
            this.objEvents.on("refresh", fn, nmspace, context);
        };
        DataEditDialog.prototype.offOnRefresh = function (nmspace) {
            this.objEvents.off("refresh", nmspace);
        };
        DataEditDialog.prototype._createDialog = function () {
            try {
                this._template = this._createTemplate();
                this._$dlgEl = jquery_3.$(this._template.el);
                doc.body.appendChild(this._template.el);
                this._$dlgEl.dialog(this._options);
            }
            catch (ex) {
                ERROR.reThrow(ex, this.handleError(ex, this));
            }
        };
        DataEditDialog.prototype.templateLoading = function (template) {
        };
        DataEditDialog.prototype.templateLoaded = function (template, error) {
            if (this.getIsStateDirty() || !!error) {
                if (!!this._deferredTemplate) {
                    this._deferredTemplate.reject(error);
                }
                return;
            }
            if (!!this._fnOnTemplateCreated) {
                this._fnOnTemplateCreated(template);
            }
            this._deferredTemplate.resolve(template);
        };
        DataEditDialog.prototype.templateUnLoading = function (template) {
            if (!!this._fnOnTemplateDestroy) {
                this._fnOnTemplateDestroy(template);
            }
        };
        DataEditDialog.prototype._createTemplate = function () {
            var template = template_3.createTemplate(null, this);
            template.templateID = this._templateID;
            return template;
        };
        DataEditDialog.prototype._destroyTemplate = function () {
            if (!!this._template) {
                this._template.dispose();
            }
        };
        DataEditDialog.prototype._getButtons = function () {
            var self = this, buttons = [
                {
                    "id": self._uniqueID + "_Refresh",
                    "text": jriapp_shared_15.LocaleSTRS.TEXT.txtRefresh,
                    "class": "btn btn-info",
                    "click": function () {
                        self._onRefresh();
                    }
                },
                {
                    "id": self._uniqueID + "_Ok",
                    "text": jriapp_shared_15.LocaleSTRS.TEXT.txtOk,
                    "class": "btn btn-info",
                    "click": function () {
                        self._onOk();
                    }
                },
                {
                    "id": self._uniqueID + "_Cancel",
                    "text": jriapp_shared_15.LocaleSTRS.TEXT.txtCancel,
                    "class": "btn btn-info",
                    "click": function () {
                        self._onCancel();
                    }
                }
            ];
            if (!this.canRefresh) {
                buttons.shift();
            }
            if (!this.canCancel) {
                buttons.pop();
            }
            return buttons;
        };
        DataEditDialog.prototype._getOkButton = function () {
            return jquery_3.$("#" + this._uniqueID + "_Ok");
        };
        DataEditDialog.prototype._getCancelButton = function () {
            return jquery_3.$("#" + this._uniqueID + "_Cancel");
        };
        DataEditDialog.prototype._getRefreshButton = function () {
            return jquery_3.$("#" + this._uniqueID + "_Refresh");
        };
        DataEditDialog.prototype._getAllButtons = function () {
            return [this._getOkButton(), this._getCancelButton(), this._getRefreshButton()];
        };
        DataEditDialog.prototype._disableButtons = function (isDisable) {
            var btns = this._getAllButtons();
            btns.forEach(function ($btn) {
                $btn.prop("disabled", !!isDisable);
            });
        };
        DataEditDialog.prototype._onOk = function () {
            var self = this, action = (!!this._fnOnOK) ? this._fnOnOK(this) : 0;
            if (action === 1) {
                return;
            }
            if (!this._dataContext) {
                self.hide();
                return;
            }
            var canCommit = this._submitInfo.endEdit();
            if (!canCommit) {
                return;
            }
            if (this._submitOnOK) {
                this._disableButtons(true);
                var title_1 = this.title;
                this.title = jriapp_shared_15.LocaleSTRS.TEXT.txtSubmitting;
                var promise = this._submitInfo.submit();
                promise.always(function () {
                    self._disableButtons(false);
                    self.title = title_1;
                });
                promise.then(function () {
                    self._result = "ok";
                    self.hide();
                }).catch(function () {
                    if (!self._submitInfo.beginEdit()) {
                        self._result = "cancel";
                        self.hide();
                    }
                });
            }
            else {
                self._result = "ok";
                self.hide();
            }
        };
        DataEditDialog.prototype._onCancel = function () {
            var action = (!!this._fnOnCancel) ? this._fnOnCancel(this) : 0;
            if (action === 1) {
                return;
            }
            this._submitInfo.cancel();
            this._result = "cancel";
            this.hide();
        };
        DataEditDialog.prototype._onRefresh = function () {
            var args = { isHandled: false };
            this.objEvents.raise("refresh", args);
            if (args.isHandled) {
                return;
            }
            var dctx = this._dataContext;
            if (!!dctx) {
                if (isFunc(dctx.refresh)) {
                    dctx.refresh();
                }
                else if (!!dctx._aspect && isFunc(dctx._aspect.refresh)) {
                    dctx._aspect.refresh();
                }
            }
        };
        DataEditDialog.prototype._onClose = function () {
            try {
                if (this._result !== "ok" && !!this._submitInfo) {
                    this._submitInfo.cancel();
                }
                if (!!this._fnOnClose) {
                    this._fnOnClose(this);
                }
                this.objEvents.raise("close", {});
            }
            finally {
                this._template.dataContext = null;
                this._submitInfo = null;
            }
            var csel = this._selectedControl;
            this._selectedControl = null;
            utils.queue.enque(function () { boot.selectedControl = csel; csel = null; });
        };
        DataEditDialog.prototype._onShow = function () {
            this._selectedControl = boot.selectedControl;
            this._submitInfo = new SubmitInfo(this.dataContext);
            if (!!this._fnOnShow) {
                this._fnOnShow(this);
            }
        };
        DataEditDialog.prototype.show = function () {
            var self = this;
            if (self.getIsStateDirty()) {
                return utils.defer.createDeferred().reject();
            }
            self._result = null;
            return this._deferredTemplate.promise().then(function (template) {
                if (self.getIsStateDirty() || !self._$dlgEl) {
                    ERROR.abort();
                }
                self._$dlgEl.dialog("option", "buttons", self._getButtons());
                template.dataContext = self._dataContext;
                self._onShow();
                self._$dlgEl.dialog("open");
            }).then(function () {
                return self;
            }, function (err) {
                if (!self.getIsStateDirty()) {
                    self.handleError(err, self);
                }
                ERROR.abort();
            });
        };
        DataEditDialog.prototype.hide = function () {
            var self = this;
            if (!this._$dlgEl) {
                return;
            }
            self._$dlgEl.dialog("close");
        };
        DataEditDialog.prototype.getOption = function (name) {
            if (!this._$dlgEl) {
                return _undefined;
            }
            return this._$dlgEl.dialog("option", name);
        };
        DataEditDialog.prototype.setOption = function (name, value) {
            var self = this;
            self._$dlgEl.dialog("option", name, value);
        };
        DataEditDialog.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            this.hide();
            this._destroyTemplate();
            this._$dlgEl = null;
            this._template = null;
            this._dataContext = null;
            this._submitInfo = null;
            _super.prototype.dispose.call(this);
        };
        Object.defineProperty(DataEditDialog.prototype, "dataContext", {
            get: function () {
                return this._dataContext;
            },
            set: function (v) {
                if (v !== this._dataContext) {
                    this._dataContext = v;
                    this._submitInfo = new SubmitInfo(this._dataContext);
                    this.objEvents.raiseProp("dataContext");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataEditDialog.prototype, "result", {
            get: function () {
                return this._result;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataEditDialog.prototype, "template", {
            get: function () {
                return this._template;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataEditDialog.prototype, "isSubmitOnOK", {
            get: function () {
                return this._submitOnOK;
            },
            set: function (v) {
                if (this._submitOnOK !== v) {
                    this._submitOnOK = v;
                    this.objEvents.raiseProp("isSubmitOnOK");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataEditDialog.prototype, "width", {
            get: function () {
                return this.getOption("width");
            },
            set: function (v) {
                var x = this.getOption("width");
                if (v !== x) {
                    this.setOption("width", v);
                    this.objEvents.raiseProp("width");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataEditDialog.prototype, "height", {
            get: function () {
                return this.getOption("height");
            },
            set: function (v) {
                var x = this.getOption("height");
                if (v !== x) {
                    this.setOption("height", v);
                    this.objEvents.raiseProp("height");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataEditDialog.prototype, "title", {
            get: function () {
                return this.getOption("title");
            },
            set: function (v) {
                var x = this.getOption("title");
                if (v !== x) {
                    this.setOption("title", v);
                    this.objEvents.raiseProp("title");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataEditDialog.prototype, "canRefresh", {
            get: function () {
                return this._canRefresh;
            },
            set: function (v) {
                var x = this._canRefresh;
                if (v !== x) {
                    this._canRefresh = v;
                    this.objEvents.raiseProp("canRefresh");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataEditDialog.prototype, "canCancel", {
            get: function () {
                return this._canCancel;
            },
            set: function (v) {
                var x = this._canCancel;
                if (v !== x) {
                    this._canCancel = v;
                    this.objEvents.raiseProp("canCancel");
                }
            },
            enumerable: true,
            configurable: true
        });
        return DataEditDialog;
    }(jriapp_shared_15.BaseObject));
    exports.DataEditDialog = DataEditDialog;
    var DialogVM = (function (_super) {
        __extends(DialogVM, _super);
        function DialogVM(app) {
            var _this = _super.call(this, app) || this;
            _this._factories = {};
            _this._dialogs = {};
            return _this;
        }
        DialogVM.prototype.createDialog = function (name, options) {
            var self = this;
            this._factories[name] = function () {
                var dialog = self._dialogs[name];
                if (!dialog) {
                    dialog = new DataEditDialog(options);
                    self._dialogs[name] = dialog;
                }
                return dialog;
            };
            return this._factories[name];
        };
        DialogVM.prototype.showDialog = function (name, dataContext) {
            var dlg = this.getDialog(name);
            if (!dlg) {
                throw new Error(format("Invalid DataEditDialog name:  {0}", name));
            }
            dlg.dataContext = dataContext;
            setTimeout(function () {
                dlg.show();
            }, 0);
            return dlg;
        };
        DialogVM.prototype.getDialog = function (name) {
            var factory = this._factories[name];
            if (!factory) {
                return null;
            }
            return factory();
        };
        DialogVM.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            var self = this, keys = Object.keys(this._dialogs);
            keys.forEach(function (key) {
                self._dialogs[key].dispose();
            });
            this._factories = {};
            this._dialogs = {};
            _super.prototype.dispose.call(this);
        };
        return DialogVM;
    }(mvvm_1.ViewModel));
    exports.DialogVM = DialogVM;
});
define("jriapp_ui/dynacontent", ["require", "exports", "jriapp_shared", "jriapp/utils/dom", "jriapp/template", "jriapp/bootstrap", "jriapp_ui/baseview"], function (require, exports, jriapp_shared_16, dom_13, template_4, bootstrap_12, baseview_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_16.Utils, sys = utils.sys, dom = dom_13.DomUtils;
    var DynaContentElView = (function (_super) {
        __extends(DynaContentElView, _super);
        function DynaContentElView(el, options) {
            var _this = _super.call(this, el, options) || this;
            _this._dataContext = null;
            _this._prevTemplateID = null;
            _this._templateID = null;
            _this._template = null;
            _this._animation = null;
            _this._tDebounce = new jriapp_shared_16.Debounce();
            _this._dsDebounce = new jriapp_shared_16.Debounce();
            return _this;
        }
        DynaContentElView.prototype.templateLoading = function (template) {
            if (this.getIsStateDirty()) {
                return;
            }
            var isFirstShow = !this._prevTemplateID, canShow = !!this._animation && (this._animation.isAnimateFirstShow || (!this._animation.isAnimateFirstShow && !isFirstShow));
            if (canShow) {
                this._animation.beforeShow(template, isFirstShow);
            }
        };
        DynaContentElView.prototype.templateLoaded = function (template, error) {
            if (this.getIsStateDirty()) {
                return;
            }
            if (!dom.isContained(template.el, this.el)) {
                this.el.appendChild(template.el);
            }
            var isFirstShow = !this._prevTemplateID, canShow = !!this._animation && (this._animation.isAnimateFirstShow || (!this._animation.isAnimateFirstShow && !isFirstShow));
            if (canShow) {
                this._animation.show(template, isFirstShow);
            }
        };
        DynaContentElView.prototype.templateUnLoading = function (template) {
        };
        DynaContentElView.prototype._templateChanging = function (oldName, newName) {
            var self = this;
            try {
                if (!newName && !!self._template) {
                    if (!!self._animation && self._template.isLoaded) {
                        self._animation.stop();
                        self._animation.beforeHide(self._template);
                        self._animation.hide(self._template).always(function () {
                            if (self.getIsStateDirty()) {
                                return;
                            }
                            self._template.dispose();
                            self._template = null;
                            self.objEvents.raiseProp("template");
                        });
                    }
                    else {
                        self._template.dispose();
                        self._template = null;
                        self.objEvents.raiseProp("template");
                    }
                    return;
                }
                if (!self._template) {
                    self._template = template_4.createTemplate(self._dataContext, self);
                    self._template.templateID = newName;
                    self.objEvents.raiseProp("template");
                    return;
                }
                if (!!self._animation && self._template.isLoaded) {
                    self._animation.stop();
                    self._animation.beforeHide(self._template);
                    self._animation.hide(self._template).always(function () {
                        if (self.getIsStateDirty()) {
                            return;
                        }
                        self._template.templateID = newName;
                    });
                }
                else {
                    self._template.templateID = newName;
                }
            }
            catch (ex) {
                utils.err.reThrow(ex, self.handleError(ex, self));
            }
        };
        DynaContentElView.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            this._tDebounce.dispose();
            this._dsDebounce.dispose();
            var a = this._animation;
            this._animation = null;
            var t = this._template;
            this._template = null;
            if (sys.isBaseObj(a)) {
                a.dispose();
            }
            if (!!t) {
                t.dispose();
            }
            this._dataContext = null;
            _super.prototype.dispose.call(this);
        };
        Object.defineProperty(DynaContentElView.prototype, "template", {
            get: function () { return this._template; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DynaContentElView.prototype, "templateID", {
            get: function () {
                return this._templateID;
            },
            set: function (v) {
                var self = this, old = self._templateID;
                if (old !== v) {
                    this._prevTemplateID = old;
                    this._templateID = v;
                    this._tDebounce.enque(function () {
                        self._templateChanging(old, v);
                    });
                    this.objEvents.raiseProp("templateID");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DynaContentElView.prototype, "dataContext", {
            get: function () { return this._dataContext; },
            set: function (v) {
                var _this = this;
                if (this._dataContext !== v) {
                    this._dataContext = v;
                    this._dsDebounce.enque(function () {
                        var ds = _this._dataContext;
                        if (!!_this._template) {
                            _this._template.dataContext = ds;
                        }
                    });
                    this.objEvents.raiseProp("dataContext");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DynaContentElView.prototype, "animation", {
            get: function () { return this._animation; },
            set: function (v) {
                if (this._animation !== v) {
                    this._animation = v;
                    this.objEvents.raiseProp("animation");
                }
            },
            enumerable: true,
            configurable: true
        });
        return DynaContentElView;
    }(baseview_3.BaseElView));
    exports.DynaContentElView = DynaContentElView;
    bootstrap_12.bootstrap.registerElView("dynacontent", DynaContentElView);
});
define("jriapp_ui/content/int", ["require", "exports", "jriapp_shared", "jriapp/utils/parser"], function (require, exports, jriapp_shared_17, parser_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_17.Utils, parseBool = utils.core.parseBool, _undefined = utils.check._undefined, parser = parser_1.Parser;
    function parseContentAttr(contentAttr) {
        var contentOptions = {
            name: null,
            readOnly: false,
            initContentFn: null,
            fieldInfo: null,
            css: null,
            template: null,
            fieldName: null,
            options: null
        };
        var tempOpts = parser.parseOptions(contentAttr);
        if (tempOpts.length === 0) {
            return contentOptions;
        }
        var attr = tempOpts[0];
        if (!attr.template && !!attr.fieldName) {
            contentOptions.css = attr.css;
            contentOptions.fieldName = attr.fieldName;
            if (!!attr.name) {
                contentOptions.name = attr.name;
            }
            if (!!attr.options) {
                contentOptions.options = attr.options;
            }
            if (attr.readOnly !== _undefined) {
                contentOptions.readOnly = parseBool(attr.readOnly);
            }
        }
        else if (!!attr.template) {
            contentOptions.template = attr.template;
            attr.template = null;
        }
        return contentOptions;
    }
    exports.parseContentAttr = parseContentAttr;
});
define("jriapp_ui/datagrid/const", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var COLUMN_TYPE;
    (function (COLUMN_TYPE) {
        COLUMN_TYPE["DATA"] = "data";
        COLUMN_TYPE["ROW_EXPANDER"] = "row_expander";
        COLUMN_TYPE["ROW_ACTIONS"] = "row_actions";
        COLUMN_TYPE["ROW_SELECTOR"] = "row_selector";
    })(COLUMN_TYPE = exports.COLUMN_TYPE || (exports.COLUMN_TYPE = {}));
    var ROW_POSITION;
    (function (ROW_POSITION) {
        ROW_POSITION[ROW_POSITION["Up"] = 0] = "Up";
        ROW_POSITION[ROW_POSITION["Bottom"] = 1] = "Bottom";
        ROW_POSITION[ROW_POSITION["Details"] = 2] = "Details";
    })(ROW_POSITION = exports.ROW_POSITION || (exports.ROW_POSITION = {}));
    var ROW_ACTION;
    (function (ROW_ACTION) {
        ROW_ACTION[ROW_ACTION["OK"] = 0] = "OK";
        ROW_ACTION[ROW_ACTION["EDIT"] = 1] = "EDIT";
        ROW_ACTION[ROW_ACTION["CANCEL"] = 2] = "CANCEL";
        ROW_ACTION[ROW_ACTION["DELETE"] = 3] = "DELETE";
    })(ROW_ACTION = exports.ROW_ACTION || (exports.ROW_ACTION = {}));
    var css;
    (function (css) {
        css["container"] = "ria-table-container";
        css["dataTable"] = "ria-data-table";
        css["columnInfo"] = "ria-col-info";
        css["column"] = "ria-col-ex";
        css["headerDiv"] = "ria-table-header";
        css["wrapDiv"] = "ria-table-wrap";
        css["dataColumn"] = "ria-data-column";
        css["dataCell"] = "ria-data-cell";
        css["rowCollapsed"] = "ria-row-collapsed";
        css["rowExpanded"] = "ria-row-expanded";
        css["rowExpander"] = "ria-row-expander";
        css["columnSelected"] = "ria-col-selected";
        css["rowActions"] = "ria-row-actions";
        css["rowDetails"] = "ria-row-details";
        css["rowSelector"] = "ria-row-selector";
        css["rowHighlight"] = "ria-row-highlight";
        css["rowDeleted"] = "ria-row-deleted";
        css["rowError"] = "ria-row-error";
        css["fillVSpace"] = "ria-fill-vspace";
        css["nobr"] = "ria-nobr";
        css["colSortable"] = "ria-sortable";
        css["colSortAsc"] = "ria-sort-asc";
        css["colSortDesc"] = "ria-sort-desc";
    })(css = exports.css || (exports.css = {}));
    exports.txtMap = {
        img_ok: "txtOk",
        img_cancel: "txtCancel",
        img_edit: "txtEdit",
        img_delete: "txtDelete"
    };
    var PROP_NAME;
    (function (PROP_NAME) {
        PROP_NAME["isCurrent"] = "isCurrent";
        PROP_NAME["isSelected"] = "isSelected";
        PROP_NAME["sortOrder"] = "sortOrder";
        PROP_NAME["checked"] = "checked";
        PROP_NAME["editingRow"] = "editingRow";
        PROP_NAME["dataSource"] = "dataSource";
        PROP_NAME["currentRow"] = "currentRow";
        PROP_NAME["grid"] = "grid";
        PROP_NAME["animation"] = "animation";
        PROP_NAME["stateProvider"] = "stateProvider";
    })(PROP_NAME = exports.PROP_NAME || (exports.PROP_NAME = {}));
});
define("jriapp_ui/datagrid/animation", ["require", "exports", "jriapp_shared", "jriapp_ui/utils/jquery"], function (require, exports, jriapp_shared_18, jquery_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DefaultAnimation = (function (_super) {
        __extends(DefaultAnimation, _super);
        function DefaultAnimation() {
            var _this = _super.call(this) || this;
            _this._$el = null;
            return _this;
        }
        DefaultAnimation.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            try {
                this.stop();
            }
            finally {
                _super.prototype.dispose.call(this);
            }
        };
        DefaultAnimation.prototype.beforeShow = function (el) {
            this.stop();
            this._$el = jquery_4.$(el);
            this._$el.hide();
        };
        DefaultAnimation.prototype.show = function (onEnd) {
            this._$el.slideDown(400, onEnd);
        };
        DefaultAnimation.prototype.beforeHide = function (el) {
            this.stop();
            this._$el = jquery_4.$(el);
        };
        DefaultAnimation.prototype.hide = function (onEnd) {
            this._$el.slideUp(400, onEnd);
        };
        DefaultAnimation.prototype.stop = function () {
            if (!!this._$el) {
                this._$el.finish();
                this._$el = null;
            }
        };
        return DefaultAnimation;
    }(jriapp_shared_18.BaseObject));
    exports.DefaultAnimation = DefaultAnimation;
});
define("jriapp_ui/utils/dblclick", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DblClick = (function () {
        function DblClick(interval) {
            if (interval === void 0) { interval = 0; }
            this._isDisposed = false;
            this._timer = null;
            this._interval = !interval ? 0 : interval;
            this._fnOnClick = null;
            this._fnOnDblClick = null;
        }
        DblClick.prototype.click = function () {
            var self = this;
            if (!!this._timer) {
                clearTimeout(this._timer);
                this._timer = null;
                if (!!this._fnOnDblClick) {
                    this._fnOnDblClick();
                }
                else if (!!this._fnOnClick) {
                    this._fnOnClick();
                }
            }
            else {
                if (!!this._fnOnClick) {
                    this._timer = setTimeout(function () {
                        self._timer = null;
                        if (!!self._fnOnClick) {
                            self._fnOnClick();
                        }
                    }, self._interval);
                }
            }
        };
        DblClick.prototype.add = function (fnOnClick, fnOnDblClick) {
            if (this.getIsDisposed()) {
                return;
            }
            this._fnOnClick = fnOnClick;
            this._fnOnDblClick = fnOnDblClick;
        };
        DblClick.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this._isDisposed = true;
            clearTimeout(this._timer);
            this._timer = null;
            this._fnOnClick = null;
            this._fnOnDblClick = null;
        };
        DblClick.prototype.getIsDisposed = function () {
            return this._isDisposed;
        };
        Object.defineProperty(DblClick.prototype, "interval", {
            get: function () {
                return this._interval;
            },
            set: function (v) {
                this._interval = v;
            },
            enumerable: true,
            configurable: true
        });
        return DblClick;
    }());
    exports.DblClick = DblClick;
});
define("jriapp_ui/datagrid/columns/base", ["require", "exports", "jriapp_shared", "jriapp/utils/dom", "jriapp/template", "jriapp_ui/baseview", "jriapp/bootstrap"], function (require, exports, jriapp_shared_19, dom_14, template_5, baseview_4, bootstrap_13) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_19.Utils, dom = dom_14.DomUtils, doc = dom.document, getNewID = utils.core.getNewID;
    var BaseColumn = (function (_super) {
        __extends(BaseColumn, _super);
        function BaseColumn(grid, options) {
            var _this = _super.call(this) || this;
            var self = _this;
            _this._grid = grid;
            _this._th = options.th;
            _this._options = options.colInfo;
            _this._isSelected = false;
            _this._uniqueID = getNewID("th");
            var col = doc.createElement("div");
            _this._col = col;
            dom.addClass([col], "ria-col-ex");
            if (!!_this._options.colCellCss) {
                dom.addClass([col], _this._options.colCellCss);
            }
            _this._grid._getInternal().getHeader().appendChild(col);
            bootstrap_13.selectableProviderWeakMap.set(_this._col, _this._grid);
            dom.events.on(_this._col, "click", function (e) {
                grid._getInternal().setCurrentColumn(self);
                self._onColumnClicked();
            }, _this.uniqueID);
            if (!!_this._options.width) {
                _this._th.style.width = _this._options.width;
            }
            if (!!_this._options.templateID) {
                _this._template = template_5.createTemplate(null, _this);
                _this._template.templateID = _this._options.templateID;
                dom.append(col, [_this._template.el]);
            }
            else if (!!_this._options.title) {
                col.innerHTML = _this._options.title;
            }
            if (!!_this._options.tip) {
                baseview_4.addToolTip(col, _this._options.tip, false, "bottom center");
            }
            return _this;
        }
        BaseColumn.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            bootstrap_13.selectableProviderWeakMap.delete(this._col);
            dom.events.offNS(this.grid.table, this.uniqueID);
            if (!!this._options.tip) {
                baseview_4.addToolTip(this._col, null);
            }
            if (!!this._template) {
                this._template.dispose();
                this._template = null;
            }
            dom.events.offNS(this._col, this.uniqueID);
            this._col = null;
            this._th = null;
            this._grid = null;
            this._options = null;
            _super.prototype.dispose.call(this);
        };
        BaseColumn.prototype.templateLoading = function (template) {
        };
        BaseColumn.prototype.templateLoaded = function (template, error) {
        };
        BaseColumn.prototype.templateUnLoading = function (template) {
        };
        BaseColumn.prototype.scrollIntoView = function (isUp) {
            if (this.getIsStateDirty()) {
                return;
            }
            this._col.scrollIntoView(!!isUp);
        };
        BaseColumn.prototype.updateWidth = function () {
            this._col.style.width = this._th.offsetWidth + "px";
        };
        BaseColumn.prototype._onColumnClicked = function () {
        };
        BaseColumn.prototype.toString = function () {
            return "BaseColumn";
        };
        Object.defineProperty(BaseColumn.prototype, "uniqueID", {
            get: function () {
                return this._uniqueID;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseColumn.prototype, "width", {
            get: function () {
                return this._th.offsetWidth;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseColumn.prototype, "th", {
            get: function () {
                return this._th;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseColumn.prototype, "col", {
            get: function () {
                return this._col;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseColumn.prototype, "grid", {
            get: function () {
                return this._grid;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseColumn.prototype, "options", {
            get: function () {
                return this._options;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseColumn.prototype, "title", {
            get: function () {
                return this._options.title;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseColumn.prototype, "isSelected", {
            get: function () {
                return this._isSelected;
            },
            set: function (v) {
                if (!!this._col && this._isSelected !== v) {
                    this._isSelected = v;
                    dom.setClass([this._col], "ria-col-selected", !this._isSelected);
                }
            },
            enumerable: true,
            configurable: true
        });
        return BaseColumn;
    }(jriapp_shared_19.BaseObject));
    exports.BaseColumn = BaseColumn;
});
define("jriapp_ui/datagrid/columns/expander", ["require", "exports", "jriapp/utils/dom", "jriapp_ui/datagrid/columns/base"], function (require, exports, dom_15, base_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dom = dom_15.DomUtils;
    var ExpanderColumn = (function (_super) {
        __extends(ExpanderColumn, _super);
        function ExpanderColumn(grid, options) {
            var _this = _super.call(this, grid, options) || this;
            dom.addClass([_this.col], "ria-row-expander");
            return _this;
        }
        ExpanderColumn.prototype.toString = function () {
            return "ExpanderColumn";
        };
        return ExpanderColumn;
    }(base_1.BaseColumn));
    exports.ExpanderColumn = ExpanderColumn;
});
define("jriapp_ui/datagrid/cells/expander", ["require", "exports", "jriapp/utils/dom", "jriapp_ui/datagrid/cells/base"], function (require, exports, dom_16, base_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dom = dom_16.DomUtils;
    var ExpanderCell = (function (_super) {
        __extends(ExpanderCell, _super);
        function ExpanderCell(options) {
            var _this = _super.call(this, options) || this;
            var self = _this;
            _this._click.add(function () {
                self._onCellClicked(self.row);
            });
            dom.addClass([_this.td], "ria-row-collapsed");
            dom.addClass([_this.td], "ria-row-expander");
            return _this;
        }
        ExpanderCell.prototype._onCellClicked = function (row) {
            var clickedRow = row || this.row;
            if (!clickedRow) {
                return;
            }
            _super.prototype._onCellClicked.call(this, clickedRow);
            clickedRow.isExpanded = !clickedRow.isExpanded;
        };
        ExpanderCell.prototype.toggleImage = function () {
            if (this.row.isExpanded) {
                dom.removeClass([this.td], "ria-row-collapsed");
                dom.addClass([this.td], "ria-row-expanded");
            }
            else {
                dom.removeClass([this.td], "ria-row-expanded");
                dom.addClass([this.td], "ria-row-collapsed");
            }
        };
        ExpanderCell.prototype.toString = function () {
            return "ExpanderCell";
        };
        return ExpanderCell;
    }(base_2.BaseCell));
    exports.ExpanderCell = ExpanderCell;
});
define("jriapp_ui/datagrid/columns/data", ["require", "exports", "jriapp_shared", "jriapp/utils/dom", "jriapp/bootstrap", "jriapp_ui/datagrid/columns/base"], function (require, exports, jriapp_shared_20, dom_17, bootstrap_14, base_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_20.Utils, dom = dom_17.DomUtils, boot = bootstrap_14.bootstrap;
    var DataColumn = (function (_super) {
        __extends(DataColumn, _super);
        function DataColumn(grid, options) {
            var _this = _super.call(this, grid, options) || this;
            _this._objCache = {};
            _this._contentType = null;
            var colClass = "ria-data-column";
            _this._sortOrder = null;
            if (_this.isSortable) {
                colClass += (" " + "ria-sortable");
            }
            dom.addClass([_this.col], colClass);
            return _this;
        }
        DataColumn.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            var self = this;
            this._contentType = null;
            utils.core.forEachProp(self._objCache, function (key) {
                self._objCache[key].dispose();
            });
            self._objCache = null;
            _super.prototype.dispose.call(this);
        };
        DataColumn.prototype._onColumnClicked = function () {
            if (this.isSortable && !!this.sortMemberName) {
                var sortOrd = this._sortOrder;
                this.grid._getInternal().resetColumnsSort();
                this.sortOrder = (sortOrd === 0) ? 1 : 0;
                this.grid.sortByColumn(this);
            }
        };
        DataColumn.prototype._cacheObject = function (key, obj) {
            this._objCache[key] = obj;
        };
        DataColumn.prototype._getCachedObject = function (key) {
            return this._objCache[key];
        };
        DataColumn.prototype._getInitContentFn = function () {
            var self = this;
            return function (content) {
                content.addOnObjectCreated(function (sender, args) {
                    self._cacheObject(args.objectKey, args.result);
                    args.isCachedExternally = !!self._getCachedObject(args.objectKey);
                });
                content.addOnObjectNeeded(function (sender, args) {
                    args.result = self._getCachedObject(args.objectKey);
                });
            };
        };
        DataColumn.prototype.updateContentOptions = function () {
            var contentOptions = this.options.content;
            if (!!contentOptions.fieldName) {
                contentOptions.fieldInfo = this.grid.dataSource.getFieldInfo(contentOptions.fieldName);
                if (!contentOptions.fieldInfo) {
                    throw new Error(utils.str.format(jriapp_shared_20.LocaleERRS.ERR_DBSET_INVALID_FIELDNAME, "", contentOptions.fieldName));
                }
            }
            this._contentType = boot.contentFactory.getContentType(contentOptions);
            if (boot.contentFactory.isExternallyCachable(this._contentType)) {
                contentOptions.initContentFn = this._getInitContentFn();
            }
            if (this.grid.isHasEditor) {
                contentOptions.readOnly = true;
            }
        };
        DataColumn.prototype.toString = function () {
            return "DataColumn";
        };
        Object.defineProperty(DataColumn.prototype, "contentType", {
            get: function () {
                return this._contentType;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataColumn.prototype, "isSortable", {
            get: function () {
                return !!(this.options.sortable);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataColumn.prototype, "sortMemberName", {
            get: function () {
                return this.options.sortMemberName;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataColumn.prototype, "sortOrder", {
            get: function () {
                return this._sortOrder;
            },
            set: function (v) {
                if (this._sortOrder !== v) {
                    this._sortOrder = v;
                    var styles = [(v === 0 ? "+" : "-") + "ria-sort-asc", (v === 1 ? "+" : "-") + "ria-sort-desc"];
                    dom.setClasses([this.col], styles);
                    this.objEvents.raiseProp("sortOrder");
                }
            },
            enumerable: true,
            configurable: true
        });
        return DataColumn;
    }(base_3.BaseColumn));
    exports.DataColumn = DataColumn;
});
define("jriapp_ui/datagrid/cells/data", ["require", "exports", "jriapp/utils/dom", "jriapp_ui/datagrid/cells/base"], function (require, exports, dom_18, base_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dom = dom_18.DomUtils;
    var DataCell = (function (_super) {
        __extends(DataCell, _super);
        function DataCell(options) {
            var _this = _super.call(this, options) || this;
            var self = _this;
            _this._content = null;
            _this._click.interval = 350;
            _this._click.add(function () {
                self._onCellClicked(self.row);
            }, function () {
                self._onDblClicked(self.row);
            });
            dom.addClass([_this.td], "ria-data-cell");
            _this._initContent();
            return _this;
        }
        DataCell.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            if (!!this._content) {
                this._content.dispose();
                this._content = null;
            }
            _super.prototype.dispose.call(this);
        };
        DataCell.prototype._initContent = function () {
            var contentType = this.column.contentType;
            this._content = new contentType({
                parentEl: this.td,
                contentOptions: this.column.options.content,
                dataContext: this.item,
                isEditing: this.item._aspect.isEditing
            });
            this._content.render();
        };
        DataCell.prototype._beginEdit = function () {
            if (!this._content.isEditing) {
                this._content.isEditing = true;
            }
        };
        DataCell.prototype._endEdit = function (isCanceled) {
            if (this._content.isEditing) {
                this._content.isEditing = false;
            }
        };
        DataCell.prototype.toString = function () {
            return "DataCell";
        };
        return DataCell;
    }(base_4.BaseCell));
    exports.DataCell = DataCell;
});
define("jriapp_ui/datagrid/columns/actions", ["require", "exports", "jriapp/utils/dom", "jriapp_ui/datagrid/columns/base"], function (require, exports, dom_19, base_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dom = dom_19.DomUtils;
    var ActionsColumn = (function (_super) {
        __extends(ActionsColumn, _super);
        function ActionsColumn(grid, options) {
            var _this = _super.call(this, grid, options) || this;
            var self = _this;
            dom.addClass([_this.col], "ria-row-actions");
            dom.events.on(_this.grid.table, "click", function (e) {
                var btn = e.target, name = btn.getAttribute("data-name"), cell = dom.getData(btn, "cell");
                self.grid.currentRow = cell.row;
                switch (name) {
                    case "img_ok":
                        self._onOk(cell);
                        break;
                    case "img_cancel":
                        self._onCancel(cell);
                        break;
                    case "img_edit":
                        self._onEdit(cell);
                        break;
                    case "img_delete":
                        self._onDelete(cell);
                        break;
                }
            }, {
                nmspace: _this.uniqueID,
                matchElement: function (el) {
                    var attr = el.getAttribute("data-scope"), tag = el.tagName.toLowerCase();
                    return self.uniqueID === attr && tag === "span";
                }
            });
            _this.grid.addOnRowAction(function (sender, args) {
                switch (args.action) {
                    case 0:
                        self._onOk(args.row.actionsCell);
                        break;
                    case 1:
                        self._onEdit(args.row.actionsCell);
                        break;
                    case 2:
                        self._onCancel(args.row.actionsCell);
                        break;
                    case 3:
                        self._onDelete(args.row.actionsCell);
                        break;
                }
            }, _this.uniqueID);
            return _this;
        }
        ActionsColumn.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            dom.events.offNS(this.grid.table, this.uniqueID);
            this.grid.objEvents.offNS(this.uniqueID);
            _super.prototype.dispose.call(this);
        };
        ActionsColumn.prototype._onOk = function (cell) {
            if (!cell.row) {
                return;
            }
            cell.row.endEdit();
            cell.update();
        };
        ActionsColumn.prototype._onCancel = function (cell) {
            if (!cell.row) {
                return;
            }
            cell.row.cancelEdit();
            cell.update();
        };
        ActionsColumn.prototype._onDelete = function (cell) {
            if (!cell.row) {
                return;
            }
            cell.row.deleteRow();
        };
        ActionsColumn.prototype._onEdit = function (cell) {
            if (!cell.row) {
                return;
            }
            cell.row.beginEdit();
            cell.update();
            this.grid.showEditDialog();
        };
        ActionsColumn.prototype.toString = function () {
            return "ActionsColumn";
        };
        return ActionsColumn;
    }(base_5.BaseColumn));
    exports.ActionsColumn = ActionsColumn;
});
define("jriapp_ui/datagrid/cells/actions", ["require", "exports", "jriapp_shared", "jriapp/utils/dom", "jriapp/int", "jriapp_ui/baseview", "jriapp_ui/datagrid/const", "jriapp_ui/datagrid/cells/base"], function (require, exports, jriapp_shared_21, dom_20, int_1, baseview_5, const_1, base_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_21.Utils, dom = dom_20.DomUtils, format = utils.str.format;
    exports.editName = "img_edit", exports.deleteName = "img_delete";
    var actionsSelector = 'span[data-role="row-action"]';
    var _editBtnsHTML = ['<span data-role="row-action" data-name="img_ok" class="{0}"></span>', '<span data-role="row-action" data-name="img_cancel" class="{1}"></span>'];
    var _viewBtnsHTML = ['<span data-role="row-action" data-name="img_edit" class="{0}"></span>', '<span data-role="row-action" data-name="img_delete" class="{1}"></span>'];
    var editBtnsHTML = null, viewBtnsHTML = null;
    var ActionsCell = (function (_super) {
        __extends(ActionsCell, _super);
        function ActionsCell(options) {
            var _this = _super.call(this, options) || this;
            _this._isEditing = false;
            dom.addClass([_this.td], ["ria-row-actions", "ria-nobr"].join(" "));
            _this._createButtons(_this.row.isEditing);
            return _this;
        }
        ActionsCell.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            this._cleanUp(this.td);
            _super.prototype.dispose.call(this);
        };
        ActionsCell.prototype._setupButtons = function (btns) {
            var self = this, isActionsToolTips = self.grid.options.isActionsToolTips;
            btns.forEach(function (btn) {
                dom.setData(btn, "cell", self);
                var name = btn.getAttribute("data-name");
                if (isActionsToolTips) {
                    baseview_5.addToolTip(btn, jriapp_shared_21.LocaleSTRS.TEXT[const_1.txtMap[name]]);
                }
                btn.setAttribute("data-scope", self.column.uniqueID);
            });
        };
        ActionsCell.prototype._cleanUp = function (td) {
            var self = this, btns = dom.queryAll(td, actionsSelector), isActionsToolTips = self.grid.options.isActionsToolTips;
            btns.forEach(function (el) {
                dom.removeData(el);
                if (isActionsToolTips) {
                    baseview_5.addToolTip(el, null);
                }
            });
        };
        Object.defineProperty(ActionsCell.prototype, "editBtnsHTML", {
            get: function () {
                if (!editBtnsHTML) {
                    editBtnsHTML = _editBtnsHTML.map(function (str) { return format(str, int_1.ButtonCss.OK, int_1.ButtonCss.Cancel); });
                }
                return editBtnsHTML;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ActionsCell.prototype, "viewBtnsHTML", {
            get: function () {
                if (!viewBtnsHTML) {
                    viewBtnsHTML = _viewBtnsHTML.map(function (str) { return format(str, int_1.ButtonCss.Edit, int_1.ButtonCss.Delete); });
                }
                return viewBtnsHTML;
            },
            enumerable: true,
            configurable: true
        });
        ActionsCell.prototype._createButtons = function (isEditing) {
            var self = this, td = this.td;
            this._cleanUp(td);
            td.innerHTML = "";
            var btns;
            if (isEditing) {
                self._isEditing = true;
                btns = self.editBtnsHTML.map(function (str) { return dom.fromHTML(str); }).map(function (arr) { return arr[0]; });
            }
            else {
                self._isEditing = false;
                btns = self.viewBtnsHTML.map(function (str, index) {
                    if (!self.isCanEdit && index === 0) {
                        return null;
                    }
                    else if (!self.isCanDelete && index === 1) {
                        return null;
                    }
                    else {
                        return dom.fromHTML(str);
                    }
                }).filter(function (arr) { return !!arr; }).map(function (arr) { return arr[0]; });
            }
            self._setupButtons(btns);
            dom.append(td, btns);
        };
        ActionsCell.prototype.update = function () {
            if (!this.getIsStateDirty() && this._isEditing !== this.row.isEditing) {
                this._createButtons(this.row.isEditing);
            }
        };
        ActionsCell.prototype.toString = function () {
            return "ActionsCell";
        };
        Object.defineProperty(ActionsCell.prototype, "isCanEdit", {
            get: function () {
                return this.grid.isCanEdit;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ActionsCell.prototype, "isCanDelete", {
            get: function () {
                return this.grid.isCanDelete;
            },
            enumerable: true,
            configurable: true
        });
        return ActionsCell;
    }(base_6.BaseCell));
    exports.ActionsCell = ActionsCell;
});
define("jriapp_ui/datagrid/columns/rowselector", ["require", "exports", "jriapp_shared", "jriapp/utils/dom", "jriapp_ui/datagrid/columns/base"], function (require, exports, jriapp_shared_22, dom_21, base_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_22.Utils, dom = dom_21.DomUtils, doc = dom.document, _undefined = utils.check._undefined;
    var RowSelectorColumn = (function (_super) {
        __extends(RowSelectorColumn, _super);
        function RowSelectorColumn(grid, options) {
            var _this = _super.call(this, grid, options) || this;
            var self = _this;
            dom.addClass([_this.col], "ria-row-selector");
            var label = doc.createElement("label");
            var chk = doc.createElement("input");
            chk.type = "checkbox";
            chk.checked = false;
            chk.className = "ria-row-selector";
            label.className = "ria-row-selector";
            label.appendChild(chk);
            label.appendChild(doc.createElement("span"));
            _this.col.appendChild(label);
            _this._chk = chk;
            dom.events.on(chk, "change", function (e) {
                e.stopPropagation();
                self.objEvents.raiseProp("checked");
                self.grid.selectRows(chk.checked);
            }, _this.uniqueID);
            dom.events.on(_this.grid.table, "click", function (e) {
                var chk = e.target, cell = dom.getData(chk, "cell");
                if (!!cell && !cell.getIsStateDirty()) {
                    cell.row.isSelected = cell.checked;
                }
            }, {
                nmspace: _this.uniqueID,
                matchElement: function (el) {
                    var attr = el.getAttribute("data-scope"), tag = el.tagName.toLowerCase();
                    return self.uniqueID === attr && tag === "input";
                }
            });
            return _this;
        }
        RowSelectorColumn.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            dom.events.offNS(this._chk, this.uniqueID);
            dom.events.offNS(this.grid.table, this.uniqueID);
            _super.prototype.dispose.call(this);
        };
        RowSelectorColumn.prototype.toString = function () {
            return "RowSelectorColumn";
        };
        Object.defineProperty(RowSelectorColumn.prototype, "checked", {
            get: function () {
                if (!!this._chk) {
                    return this._chk.checked;
                }
                return _undefined;
            },
            set: function (v) {
                var bv = !!v, chk = this._chk;
                if (bv !== chk.checked) {
                    chk.checked = bv;
                    this.objEvents.raiseProp("checked");
                }
            },
            enumerable: true,
            configurable: true
        });
        return RowSelectorColumn;
    }(base_7.BaseColumn));
    exports.RowSelectorColumn = RowSelectorColumn;
});
define("jriapp_ui/datagrid/cells/rowselector", ["require", "exports", "jriapp/utils/dom", "jriapp_ui/datagrid/cells/base"], function (require, exports, dom_22, base_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dom = dom_22.DomUtils, doc = dom.document;
    var RowSelectorCell = (function (_super) {
        __extends(RowSelectorCell, _super);
        function RowSelectorCell(options) {
            var _this = _super.call(this, options) || this;
            dom.addClass([_this.td], "ria-row-selector");
            var label = doc.createElement("label");
            var chk = doc.createElement("input");
            chk.type = "checkbox";
            chk.checked = false;
            chk.className = "ria-row-selector";
            label.className = "ria-row-selector";
            chk.setAttribute("data-scope", _this.column.uniqueID);
            label.appendChild(chk);
            label.appendChild(doc.createElement("span"));
            _this.td.appendChild(label);
            _this._chk = chk;
            dom.setData(chk, "cell", _this);
            return _this;
        }
        RowSelectorCell.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            dom.removeData(this._chk);
            _super.prototype.dispose.call(this);
        };
        Object.defineProperty(RowSelectorCell.prototype, "checked", {
            get: function () {
                return this._chk.checked;
            },
            set: function (v) {
                var bv = !!v;
                if (bv !== this._chk.checked) {
                    this._chk.checked = bv;
                }
            },
            enumerable: true,
            configurable: true
        });
        RowSelectorCell.prototype.toString = function () {
            return "RowSelectorCell";
        };
        return RowSelectorCell;
    }(base_8.BaseCell));
    exports.RowSelectorCell = RowSelectorCell;
});
define("jriapp_ui/datagrid/rows/row", ["require", "exports", "jriapp_shared", "jriapp/utils/dom", "jriapp_ui/datagrid/cells/expander", "jriapp_ui/datagrid/cells/data", "jriapp_ui/datagrid/cells/actions", "jriapp_ui/datagrid/cells/rowselector", "jriapp_ui/datagrid/columns/expander", "jriapp_ui/datagrid/columns/actions", "jriapp_ui/datagrid/columns/rowselector"], function (require, exports, jriapp_shared_23, dom_23, expander_1, data_1, actions_1, rowselector_1, expander_2, actions_2, rowselector_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_23.Utils, dom = dom_23.DomUtils, doc = dom.document, sys = utils.sys, getNewID = utils.core.getNewID;
    function fnState(row) {
        var path = row.grid.options.rowStateField, val = (!row.item || !path) ? null : sys.resolvePath(row.item, path), css = row.grid._getInternal().onRowStateChanged(row, val);
        row._setState(css);
    }
    var Row = (function (_super) {
        __extends(Row, _super);
        function Row(grid, options) {
            var _this = _super.call(this) || this;
            var item = options.item;
            _this._grid = grid;
            _this._tr = null;
            _this._item = item;
            _this._cells = [];
            _this._uniqueID = getNewID("tr");
            _this._expanderCell = null;
            _this._actionsCell = null;
            _this._rowSelectorCell = null;
            _this._isDeleted = false;
            _this._isSelected = false;
            _this._isDetached = false;
            _this._stateCss = null;
            _this._isDeleted = item._aspect.isDeleted;
            _this._loadDOM();
            return _this;
        }
        Row.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            var grid = this._grid;
            if (!!grid) {
                if (!this._isDetached) {
                    grid._getInternal().removeRow(this);
                }
            }
            this._unloadDOM();
            this._item = null;
            this._grid = null;
            _super.prototype.dispose.call(this);
        };
        Row.prototype._createCells = function () {
            var self = this, cols = self.columns, len = cols.length;
            for (var i = 0; i < len; i += 1) {
                self._cells.push(self._createCell(cols[i], i));
            }
        };
        Row.prototype._createCell = function (col, num) {
            var self = this;
            var cell;
            if (col instanceof expander_2.ExpanderColumn) {
                this._expanderCell = new expander_1.ExpanderCell({ row: self, column: col, num: num });
                cell = this._expanderCell;
            }
            else if (col instanceof actions_2.ActionsColumn) {
                this._actionsCell = new actions_1.ActionsCell({ row: self, column: col, num: num });
                cell = this._actionsCell;
            }
            else if (col instanceof rowselector_2.RowSelectorColumn) {
                this._rowSelectorCell = new rowselector_1.RowSelectorCell({ row: self, column: col, num: num });
                cell = this._rowSelectorCell;
            }
            else {
                cell = new data_1.DataCell({ row: self, column: col, num: num });
            }
            return cell;
        };
        Row.prototype._loadDOM = function () {
            if (!!this._tr) {
                return;
            }
            var self = this, tr = doc.createElement("tr");
            this._tr = tr;
            if (this._isDeleted) {
                dom.addClass([tr], "ria-row-deleted");
            }
            this._createCells();
            if (!!this._item) {
                if (!!this.isHasStateField) {
                    this._item.objEvents.onProp(this._grid.options.rowStateField, function () {
                        fnState(self);
                    }, this._uniqueID);
                }
                fnState(self);
            }
        };
        Row.prototype._unloadDOM = function () {
            if (!this._tr) {
                return;
            }
            this._item.objEvents.offNS(this._uniqueID);
            dom.removeNode(this._tr);
            var cells = this._cells, len = cells.length;
            for (var i = 0; i < len; i += 1) {
                cells[i].dispose();
            }
            this._cells = [];
            this._expanderCell = null;
            this._rowSelectorCell = null;
            this._actionsCell = null;
            this._tr = null;
        };
        Row.prototype._setState = function (css) {
            if (this._stateCss !== css) {
                var arr = [];
                if (!!this._stateCss) {
                    arr.push("-" + this._stateCss);
                }
                this._stateCss = css;
                if (!!this._stateCss) {
                    arr.push("+" + this._stateCss);
                }
                dom.setClasses([this.tr], arr);
            }
        };
        Row.prototype._onBeginEdit = function () {
            this._cells.forEach(function (cell) {
                if (cell instanceof data_1.DataCell) {
                    cell._beginEdit();
                }
            });
            if (!!this._actionsCell) {
                this._actionsCell.update();
            }
        };
        Row.prototype._onEndEdit = function (isCanceled) {
            this._cells.forEach(function (cell) {
                if (cell instanceof data_1.DataCell) {
                    cell._endEdit(isCanceled);
                }
            });
            if (!!this._actionsCell) {
                this._actionsCell.update();
            }
        };
        Row.prototype.beginEdit = function () {
            return this._item._aspect.beginEdit();
        };
        Row.prototype.endEdit = function () {
            return this._item._aspect.endEdit();
        };
        Row.prototype.cancelEdit = function () {
            return this._item._aspect.cancelEdit();
        };
        Row.prototype.deleteRow = function () {
            return this._item._aspect.deleteItem();
        };
        Row.prototype.updateErrorState = function () {
            var hasErrors = this._item._aspect.getIsHasErrors();
            dom.setClass([this._tr], "ria-row-error", !hasErrors);
        };
        Row.prototype.updateUIState = function () {
            fnState(this);
        };
        Row.prototype.scrollIntoView = function (animate, pos) {
            this.grid.scrollToRow({ row: this, animate: animate, pos: pos });
        };
        Row.prototype.toString = function () {
            return "Row";
        };
        Object.defineProperty(Row.prototype, "rect", {
            get: function () {
                return this.tr.getBoundingClientRect();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "height", {
            get: function () {
                return this.tr.offsetHeight;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "width", {
            get: function () {
                return this.tr.offsetWidth;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "tr", {
            get: function () {
                return this._tr;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "grid", {
            get: function () {
                return this._grid;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "item", {
            get: function () {
                return this._item;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "cells", {
            get: function () {
                return this._cells;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "columns", {
            get: function () {
                return this._grid.columns;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "uniqueID", {
            get: function () {
                return this._uniqueID;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "itemKey", {
            get: function () {
                return (!this._item) ? null : this._item._key;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "isCurrent", {
            get: function () {
                return this.grid.currentItem === this.item;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "isSelected", {
            get: function () {
                return this._isSelected;
            },
            set: function (v) {
                if (this._isSelected !== v) {
                    this._isSelected = v;
                    if (!!this._rowSelectorCell) {
                        this._rowSelectorCell.checked = this._isSelected;
                    }
                    this.objEvents.raiseProp("isSelected");
                    this.grid._getInternal().onRowSelectionChanged(this);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "isExpanded", {
            get: function () {
                return this.grid._getInternal().isRowExpanded(this);
            },
            set: function (v) {
                if (v !== this.isExpanded) {
                    if (!v && this.isExpanded) {
                        this.grid._getInternal().expandDetails(this, false);
                    }
                    else if (v) {
                        this.grid._getInternal().expandDetails(this, true);
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "expanderCell", {
            get: function () {
                return this._expanderCell;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "actionsCell", {
            get: function () {
                return this._actionsCell;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "isDeleted", {
            get: function () {
                return this._isDeleted;
            },
            set: function (v) {
                if (this._isDeleted !== v) {
                    this._isDeleted = v;
                    if (this._isDeleted) {
                        this.isExpanded = false;
                    }
                    dom.setClass([this._tr], "ria-row-deleted", !this._isDeleted);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "isDetached", {
            get: function () {
                return this._isDetached;
            },
            set: function (v) {
                this._isDetached = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "isEditing", {
            get: function () {
                return !!this._item && this._item._aspect.isEditing;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "isHasStateField", {
            get: function () {
                return !!this._grid.options.rowStateField;
            },
            enumerable: true,
            configurable: true
        });
        return Row;
    }(jriapp_shared_23.BaseObject));
    exports.Row = Row;
});
define("jriapp_ui/datagrid/cells/base", ["require", "exports", "jriapp_shared", "jriapp/utils/dom", "jriapp/bootstrap", "jriapp_ui/utils/dblclick"], function (require, exports, jriapp_shared_24, dom_24, bootstrap_15, dblclick_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_24.Utils, dom = dom_24.DomUtils, doc = dom.document, subscribeMap = bootstrap_15.subscribeWeakMap;
    var BaseCell = (function (_super) {
        __extends(BaseCell, _super);
        function BaseCell(options) {
            var _this = _super.call(this) || this;
            options = utils.core.extend({
                row: null,
                column: null,
                num: 0
            }, options);
            _this._row = options.row;
            _this._td = doc.createElement("td");
            subscribeMap.set(_this._td, _this);
            _this._column = options.column;
            _this._num = options.num;
            if (!!_this._column.options.rowCellCss) {
                dom.addClass([_this._td], _this._column.options.rowCellCss);
            }
            _this._click = new dblclick_1.DblClick();
            _this._row.tr.appendChild(_this._td);
            return _this;
        }
        BaseCell.prototype._onCellClicked = function (row) {
        };
        BaseCell.prototype._onDblClicked = function (row) {
            this.grid._getInternal().onCellDblClicked(this);
        };
        BaseCell.prototype.isSubscribed = function (flag) {
            return flag === 1;
        };
        BaseCell.prototype.handle_click = function (e) {
            this.grid._getInternal().setCurrentColumn(this.column);
            this.click();
        };
        BaseCell.prototype.click = function () {
            this.grid.currentRow = this._row;
            this._click.click();
        };
        BaseCell.prototype.scrollIntoView = function () {
            this.row.scrollIntoView();
        };
        BaseCell.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            subscribeMap.delete(this._td);
            if (!!this._click) {
                this._click.dispose();
                this._click = null;
            }
            dom.removeData(this._td);
            _super.prototype.dispose.call(this);
        };
        BaseCell.prototype.toString = function () {
            return "BaseCell";
        };
        Object.defineProperty(BaseCell.prototype, "td", {
            get: function () { return this._td; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseCell.prototype, "row", {
            get: function () { return this._row; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseCell.prototype, "column", {
            get: function () { return this._column; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseCell.prototype, "grid", {
            get: function () {
                return this._row.grid;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseCell.prototype, "item", {
            get: function () { return this._row.item; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseCell.prototype, "uniqueID", {
            get: function () { return this._row.uniqueID + "_" + this._num; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseCell.prototype, "num", {
            get: function () { return this._num; },
            enumerable: true,
            configurable: true
        });
        return BaseCell;
    }(jriapp_shared_24.BaseObject));
    exports.BaseCell = BaseCell;
});
define("jriapp_ui/datagrid/cells/details", ["require", "exports", "jriapp_shared", "jriapp/template", "jriapp/utils/dom"], function (require, exports, jriapp_shared_25, template_6, dom_25) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dom = dom_25.DomUtils, doc = dom.document;
    var DetailsCell = (function (_super) {
        __extends(DetailsCell, _super);
        function DetailsCell(options) {
            var _this = _super.call(this) || this;
            _this._row = options.row;
            _this._td = doc.createElement("td");
            _this._td.colSpan = _this.grid.columns.length;
            if (!options.details_id) {
                return _this;
            }
            _this._row.tr.appendChild(_this._td);
            _this._template = template_6.createTemplate(null, null);
            _this._template.templateID = options.details_id;
            _this._td.appendChild(_this._template.el);
            return _this;
        }
        DetailsCell.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            if (!!this._template) {
                this._template.dispose();
                this._template = null;
            }
            this._row = null;
            this._td = null;
            _super.prototype.dispose.call(this);
        };
        DetailsCell.prototype.toString = function () {
            return "DetailsCell";
        };
        Object.defineProperty(DetailsCell.prototype, "td", {
            get: function () {
                return this._td;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DetailsCell.prototype, "row", {
            get: function () {
                return this._row;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DetailsCell.prototype, "grid", {
            get: function () {
                return this._row.grid;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DetailsCell.prototype, "item", {
            get: function () {
                return this._template.dataContext;
            },
            set: function (v) {
                this._template.dataContext = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DetailsCell.prototype, "template", {
            get: function () {
                return this._template;
            },
            enumerable: true,
            configurable: true
        });
        return DetailsCell;
    }(jriapp_shared_25.BaseObject));
    exports.DetailsCell = DetailsCell;
});
define("jriapp_ui/datagrid/rows/details", ["require", "exports", "jriapp_shared", "jriapp/utils/dom", "jriapp_ui/datagrid/cells/details"], function (require, exports, jriapp_shared_26, dom_26, details_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_26.Utils, coreUtils = utils.core, dom = dom_26.DomUtils, doc = dom.document, getNewID = coreUtils.getNewID;
    var DetailsRow = (function (_super) {
        __extends(DetailsRow, _super);
        function DetailsRow(options) {
            var _this = _super.call(this) || this;
            var self = _this, tr = doc.createElement("tr");
            _this._grid = options.grid;
            _this._tr = tr;
            _this._item = null;
            _this._cell = null;
            _this._parentRow = null;
            _this._isFirstShow = true;
            _this._uniqueID = getNewID("drow");
            _this._createCell(options.details_id);
            dom.addClass([tr], "ria-row-details");
            _this._grid.addOnRowExpanded(function (sender, args) {
                if (!args.isExpanded && !!args.collapsedRow) {
                    self._setParentRow(null);
                }
            }, _this._uniqueID);
            return _this;
        }
        DetailsRow.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            this._grid.objEvents.offNS(this._uniqueID);
            if (!!this._cell) {
                this._cell.dispose();
                this._cell = null;
            }
            dom.removeNode(this._tr);
            this._item = null;
            this._tr = null;
            this._grid = null;
            _super.prototype.dispose.call(this);
        };
        DetailsRow.prototype._createCell = function (detailsId) {
            this._cell = new details_1.DetailsCell({ row: this, details_id: detailsId });
        };
        DetailsRow.prototype._setParentRow = function (row) {
            var self = this;
            this._item = null;
            this._cell.item = null;
            dom.removeNode(this.tr);
            if (!row || row.getIsStateDirty()) {
                this._parentRow = null;
                return;
            }
            this._parentRow = row;
            this._item = row.item;
            this._cell.item = this._item;
            if (this._isFirstShow) {
                this._initShow();
            }
            dom.insertAfter(this.tr, row.tr);
            this._show(function () {
                var parentRow = self._parentRow;
                if (!parentRow || parentRow.getIsStateDirty()) {
                    return;
                }
                if (self.grid.options.isUseScrollIntoDetails) {
                    parentRow.scrollIntoView(true, 2);
                }
            });
        };
        DetailsRow.prototype._initShow = function () {
            var animation = this._grid.animation;
            animation.beforeShow(this._cell.template.el);
        };
        DetailsRow.prototype._show = function (onEnd) {
            var animation = this._grid.animation;
            this._isFirstShow = false;
            animation.beforeShow(this._cell.template.el);
            animation.show(onEnd);
        };
        DetailsRow.prototype._hide = function (onEnd) {
            var animation = this._grid.animation;
            animation.beforeHide(this._cell.template.el);
            animation.hide(onEnd);
        };
        DetailsRow.prototype.toString = function () {
            return "DetailsRow";
        };
        Object.defineProperty(DetailsRow.prototype, "rect", {
            get: function () {
                return this.tr.getBoundingClientRect();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DetailsRow.prototype, "height", {
            get: function () {
                return this.tr.offsetHeight;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DetailsRow.prototype, "width", {
            get: function () {
                return this.tr.offsetHeight;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DetailsRow.prototype, "tr", {
            get: function () {
                return this._tr;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DetailsRow.prototype, "grid", {
            get: function () {
                return this._grid;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DetailsRow.prototype, "item", {
            get: function () {
                return this._item;
            },
            set: function (v) {
                if (this._item !== v) {
                    this._item = v;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DetailsRow.prototype, "cell", {
            get: function () {
                return this._cell;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DetailsRow.prototype, "uniqueID", {
            get: function () {
                return this._uniqueID;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DetailsRow.prototype, "itemKey", {
            get: function () {
                return (!this._item) ? null : this._item._key;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DetailsRow.prototype, "parentRow", {
            get: function () {
                return this._parentRow;
            },
            set: function (v) {
                var self = this;
                if (v !== this._parentRow) {
                    if (!!self._parentRow) {
                        self._hide(function () {
                            self._setParentRow(v);
                        });
                    }
                    else {
                        self._setParentRow(v);
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        return DetailsRow;
    }(jriapp_shared_26.BaseObject));
    exports.DetailsRow = DetailsRow;
});
define("jriapp_ui/datagrid/cells/fillspace", ["require", "exports", "jriapp_shared", "jriapp/utils/dom"], function (require, exports, jriapp_shared_27, dom_27) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dom = dom_27.DomUtils, doc = dom.document;
    var FillSpaceCell = (function (_super) {
        __extends(FillSpaceCell, _super);
        function FillSpaceCell(options) {
            var _this = _super.call(this) || this;
            _this._row = options.row;
            _this._td = document.createElement("td");
            _this._td.colSpan = _this.grid.columns.length;
            _this._row.tr.appendChild(_this._td);
            _this._div = doc.createElement("div");
            _this._div.className = "ria-fill-vspace";
            _this._td.appendChild(_this._div);
            return _this;
        }
        FillSpaceCell.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            this._row = null;
            this._td = null;
            this._div = null;
            _super.prototype.dispose.call(this);
        };
        FillSpaceCell.prototype.toString = function () {
            return "FillSpaceCell";
        };
        Object.defineProperty(FillSpaceCell.prototype, "td", {
            get: function () {
                return this._td;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FillSpaceCell.prototype, "row", {
            get: function () {
                return this._row;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FillSpaceCell.prototype, "grid", {
            get: function () {
                return this._row.grid;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FillSpaceCell.prototype, "div", {
            get: function () {
                return this._div;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FillSpaceCell.prototype, "height", {
            get: function () {
                return this._div.offsetHeight;
            },
            set: function (v) {
                this._div.style.height = (!v ? 0 : v) + "px";
            },
            enumerable: true,
            configurable: true
        });
        return FillSpaceCell;
    }(jriapp_shared_27.BaseObject));
    exports.FillSpaceCell = FillSpaceCell;
});
define("jriapp_ui/datagrid/rows/fillspace", ["require", "exports", "jriapp_shared", "jriapp/utils/dom", "jriapp_ui/datagrid/cells/fillspace"], function (require, exports, jriapp_shared_28, dom_28, fillspace_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dom = dom_28.DomUtils, doc = dom.document;
    var FillSpaceRow = (function (_super) {
        __extends(FillSpaceRow, _super);
        function FillSpaceRow(options) {
            var _this = _super.call(this) || this;
            var tr = doc.createElement("tr");
            _this._grid = options.grid;
            _this._tr = tr;
            _this._cell = null;
            _this._createCell();
            dom.addClass([tr], "ria-fill-vspace");
            return _this;
        }
        FillSpaceRow.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            if (!!this._cell) {
                this._cell.dispose();
                this._cell = null;
            }
            dom.removeNode(this.tr);
            this._tr = null;
            this._grid = null;
            _super.prototype.dispose.call(this);
        };
        FillSpaceRow.prototype._createCell = function () {
            this._cell = new fillspace_1.FillSpaceCell({ row: this });
        };
        FillSpaceRow.prototype.toString = function () {
            return "FillSpaceRow";
        };
        FillSpaceRow.prototype.attach = function () {
            this._grid._tBodyEl.appendChild(this.tr);
        };
        FillSpaceRow.prototype.detach = function () {
            dom.removeNode(this.tr);
        };
        Object.defineProperty(FillSpaceRow.prototype, "tr", {
            get: function () {
                return this._tr;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FillSpaceRow.prototype, "grid", {
            get: function () {
                return this._grid;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FillSpaceRow.prototype, "cell", {
            get: function () {
                return this._cell;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FillSpaceRow.prototype, "height", {
            get: function () {
                return this._cell.height;
            },
            set: function (v) {
                this._cell.height = v;
            },
            enumerable: true,
            configurable: true
        });
        return FillSpaceRow;
    }(jriapp_shared_28.BaseObject));
    exports.FillSpaceRow = FillSpaceRow;
});
define("jriapp_ui/datagrid/datagrid", ["require", "exports", "jriapp_shared", "jriapp/utils/dom", "jriapp/utils/parser", "jriapp/bootstrap", "jriapp_ui/baseview", "jriapp_ui/content/int", "jriapp_ui/dialog", "jriapp_ui/datagrid/animation", "jriapp_ui/datagrid/rows/row", "jriapp_ui/datagrid/rows/details", "jriapp_ui/datagrid/rows/fillspace", "jriapp_ui/datagrid/columns/expander", "jriapp_ui/datagrid/columns/data", "jriapp_ui/datagrid/columns/actions", "jriapp_ui/datagrid/columns/rowselector", "jriapp_ui/datagrid/rows/row", "jriapp_ui/datagrid/columns/base", "jriapp_ui/datagrid/const", "jriapp_ui/datagrid/animation", "jriapp_ui/utils/jquery"], function (require, exports, jriapp_shared_29, dom_29, parser_2, bootstrap_16, baseview_6, int_2, dialog_1, animation_1, row_1, details_2, fillspace_2, expander_3, data_2, actions_3, rowselector_3, row_2, base_9, const_2, animation_2, jquery_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DataGridRow = row_2.Row;
    exports.DataGridColumn = base_9.BaseColumn;
    exports.ROW_POSITION = const_2.ROW_POSITION;
    exports.COLUMN_TYPE = const_2.COLUMN_TYPE;
    exports.ROW_ACTION = const_2.ROW_ACTION;
    exports.DefaultAnimation = animation_2.DefaultAnimation;
    var utils = jriapp_shared_29.Utils, format = utils.str.format, _a = utils.core, forEachProp = _a.forEachProp, merge = _a.merge, getNewID = _a.getNewID, extend = _a.extend, ERROR = utils.err, sys = utils.sys, dom = dom_29.DomUtils, parser = parser_2.Parser, doc = dom.document, win = dom.window, boot = bootstrap_16.bootstrap;
    var _columnWidthInterval, _gridsCount = 0;
    var _createdGrids = {};
    function getDataGrids() {
        var keys = Object.keys(_createdGrids), res = [];
        for (var i = 0; i < keys.length; i += 1) {
            var grid = _createdGrids[keys[i]];
            res.push(grid);
        }
        return res;
    }
    exports.getDataGrids = getDataGrids;
    function findDataGrid(gridName) {
        var keys = Object.keys(_createdGrids);
        for (var i = 0; i < keys.length; i += 1) {
            var grid = _createdGrids[keys[i]];
            if (!!grid.table && grid.table.getAttribute("data-name") === gridName) {
                return grid;
            }
        }
        return null;
    }
    exports.findDataGrid = findDataGrid;
    function updateWidth() {
        _checkGridWidth();
        _columnWidthInterval = win.requestAnimationFrame(updateWidth);
    }
    function _gridCreated(grid) {
        _createdGrids[grid.uniqueID] = grid;
        _gridsCount += 1;
        if (_gridsCount === 1) {
            _columnWidthInterval = win.requestAnimationFrame(updateWidth);
        }
    }
    function _gridDestroyed(grid) {
        delete _createdGrids[grid.uniqueID];
        _gridsCount -= 1;
        if (_gridsCount === 0) {
            win.cancelAnimationFrame(_columnWidthInterval);
        }
    }
    function _checkGridWidth() {
        forEachProp(_createdGrids, function (id) {
            var grid = _createdGrids[id];
            if (grid.getIsStateDirty()) {
                return;
            }
            grid._getInternal().columnWidthCheck();
        });
    }
    var GRID_EVENTS;
    (function (GRID_EVENTS) {
        GRID_EVENTS["row_expanded"] = "row_expanded";
        GRID_EVENTS["row_selected"] = "row_selected";
        GRID_EVENTS["page_changed"] = "page_changed";
        GRID_EVENTS["row_state_changed"] = "row_state_changed";
        GRID_EVENTS["cell_dblclicked"] = "cell_dblclicked";
        GRID_EVENTS["row_action"] = "row_action";
    })(GRID_EVENTS || (GRID_EVENTS = {}));
    var DataGrid = (function (_super) {
        __extends(DataGrid, _super);
        function DataGrid(table, options) {
            var _this = _super.call(this) || this;
            var self = _this;
            options = merge(options, {
                dataSource: null,
                animation: null,
                isUseScrollInto: true,
                isUseScrollIntoDetails: true,
                containerCss: null,
                wrapCss: null,
                headerCss: null,
                rowStateField: null,
                isCanEdit: null,
                isCanDelete: null,
                isHandleAddNew: false,
                isPrependNewRows: false,
                isPrependAllRows: false,
                isActionsToolTips: false,
                syncSetDatasource: false
            });
            if (!!options.dataSource && !sys.isCollection(options.dataSource)) {
                throw new Error(jriapp_shared_29.LocaleERRS.ERR_GRID_DATASRC_INVALID);
            }
            _this._options = options;
            _this._table = table;
            dom.addClass([table], "ria-data-table");
            _this._name = table.getAttribute("data-name");
            _this._uniqueID = getNewID("grd");
            _this._rowMap = {};
            _this._rows = [];
            _this._columns = [];
            _this._expandedRow = null;
            _this._details = null;
            _this._fillSpace = null;
            _this._expanderCol = null;
            _this._actionsCol = null;
            _this._rowSelectorCol = null;
            _this._currentColumn = null;
            _this._editingRow = null;
            _this._dialog = null;
            _this._header = null;
            _this._wrapper = null;
            _this._contaner = null;
            _this._wrapTable();
            _this._scrollDebounce = new jriapp_shared_29.Debounce();
            _this._dsDebounce = new jriapp_shared_29.Debounce();
            _this._pageDebounce = new jriapp_shared_29.Debounce();
            _this._selectable = {
                onKeyDown: function (key, event) {
                    self._onKeyDown(key, event);
                },
                onKeyUp: function (key, event) {
                    self._onKeyUp(key, event);
                }
            };
            _this._updateCurrent = function () { };
            var tw = table.offsetWidth;
            _this._internal = {
                isRowExpanded: function (row) {
                    return self._isRowExpanded(row);
                },
                getHeader: function () {
                    return self._header;
                },
                getContainer: function () {
                    return self._contaner;
                },
                getWrapper: function () {
                    return self._wrapper;
                },
                setCurrentColumn: function (column) {
                    self._setCurrentColumn(column);
                },
                onRowStateChanged: function (row, val) {
                    return self._onRowStateChanged(row, val);
                },
                onCellDblClicked: function (cell) {
                    self._onCellDblClicked(cell);
                },
                onRowSelectionChanged: function (row) {
                    self._onRowSelectionChanged(row);
                },
                resetColumnsSort: function () {
                    self._resetColumnsSort();
                },
                getLastRow: function () {
                    return self._getLastRow();
                },
                removeRow: function (row) {
                    self._removeRow(row);
                },
                expandDetails: function (parentRow, expanded) {
                    self._expandDetails(parentRow, expanded);
                },
                columnWidthCheck: function () {
                    if (self.getIsStateDirty()) {
                        return;
                    }
                    var tw2 = table.offsetWidth;
                    if (tw !== tw2) {
                        tw = tw2;
                        self.updateColumnsSize();
                    }
                }
            };
            _this._createColumns();
            bootstrap_16.selectableProviderWeakMap.set(table, _this);
            _gridCreated(_this);
            var ds = _this._options.dataSource;
            _this.setDataSource(ds);
            return _this;
        }
        DataGrid.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            bootstrap_16.selectableProviderWeakMap.delete(this._table);
            this._scrollDebounce.dispose();
            this._dsDebounce.dispose();
            this._pageDebounce.dispose();
            this._updateCurrent = function () { };
            this._clearGrid();
            this._unbindDS();
            _gridDestroyed(this);
            if (!!this._details) {
                this._details.dispose();
                this._details = null;
            }
            if (!!this._fillSpace) {
                this._fillSpace.dispose();
                this._fillSpace = null;
            }
            if (this._options.animation) {
                this._options.animation.stop();
                this._options.animation = null;
            }
            if (!!this._dialog) {
                this._dialog.dispose();
                this._dialog = null;
            }
            this._unWrapTable();
            dom.removeClass([this._table], "ria-data-table");
            dom.removeClass([this._tHeadRow], "ria-col-info");
            this._columns.forEach(function (col) { col.dispose(); });
            this._columns = [];
            this._table = null;
            this._options = {};
            this._selectable = null;
            this._internal = null;
            _super.prototype.dispose.call(this);
        };
        DataGrid.prototype._updateContentOptions = function () {
            this.columns.filter(function (column) { return column instanceof data_2.DataColumn; }).forEach(function (column) {
                column.updateContentOptions();
            });
        };
        DataGrid.prototype._onKeyDown = function (key, event) {
            var ds = this.dataSource, self = this;
            if (!ds) {
                return;
            }
            var currentRow = this.currentRow;
            switch (key) {
                case 38:
                    event.preventDefault();
                    if (ds.movePrev(true)) {
                        if (self.isUseScrollInto) {
                            self.scrollToCurrent(0);
                        }
                    }
                    break;
                case 40:
                    event.preventDefault();
                    if (ds.moveNext(true)) {
                        if (self.isUseScrollInto) {
                            self.scrollToCurrent(1);
                        }
                    }
                    break;
                case 34:
                    event.preventDefault();
                    this._pageDebounce.enque(function () {
                        if (ds.pageIndex > 0) {
                            ds.pageIndex = ds.pageIndex - 1;
                        }
                    });
                    break;
                case 33:
                    event.preventDefault();
                    this._pageDebounce.enque(function () {
                        ds.pageIndex = ds.pageIndex + 1;
                    });
                    break;
                case 13:
                    if (!!currentRow && !!this._actionsCol) {
                        event.preventDefault();
                    }
                    break;
                case 27:
                    if (!!currentRow && !!this._actionsCol) {
                        if (currentRow.isEditing) {
                            event.preventDefault();
                        }
                    }
                    break;
                case 32:
                    if (!!this._rowSelectorCol && !!currentRow && (!currentRow.isExpanded && !currentRow.isEditing)) {
                        event.preventDefault();
                    }
                    break;
            }
        };
        DataGrid.prototype._onKeyUp = function (key, event) {
            var ds = this.dataSource;
            if (!ds) {
                return;
            }
            var currentRow = this.currentRow;
            switch (key) {
                case 13:
                    if (!!currentRow && !!this._actionsCol) {
                        event.preventDefault();
                        if (currentRow.isEditing) {
                            this.objEvents.raise("row_action", { row: currentRow, action: 0 });
                        }
                        else {
                            this.objEvents.raise("row_action", { row: currentRow, action: 1 });
                        }
                    }
                    break;
                case 27:
                    if (!!currentRow && !!this._actionsCol) {
                        if (currentRow.isEditing) {
                            event.preventDefault();
                            this.objEvents.raise("row_action", { row: currentRow, action: 2 });
                        }
                    }
                    break;
                case 32:
                    if (!!this._rowSelectorCol && !!currentRow && (!currentRow.isExpanded && !currentRow.isEditing)) {
                        event.preventDefault();
                        currentRow.isSelected = !currentRow.isSelected;
                    }
                    break;
            }
        };
        DataGrid.prototype._isRowExpanded = function (row) {
            return this._expandedRow === row;
        };
        DataGrid.prototype._setCurrentColumn = function (column) {
            if (!!this._currentColumn) {
                this._currentColumn.isSelected = false;
            }
            this._currentColumn = column;
            if (!!this._currentColumn) {
                this._currentColumn.isSelected = true;
            }
        };
        DataGrid.prototype._onRowStateChanged = function (row, val) {
            var args = { row: row, val: val, css: null };
            this.objEvents.raise("row_state_changed", args);
            return args.css;
        };
        DataGrid.prototype._onCellDblClicked = function (cell) {
            var args = { cell: cell };
            this.objEvents.raise("cell_dblclicked", args);
        };
        DataGrid.prototype._onRowSelectionChanged = function (row) {
            this.objEvents.raise("row_selected", { row: row });
        };
        DataGrid.prototype._resetColumnsSort = function () {
            this.columns.forEach(function (col) {
                if (col instanceof data_2.DataColumn) {
                    col.sortOrder = null;
                }
            });
        };
        DataGrid.prototype._getLastRow = function () {
            if (this._rows.length === 0) {
                return null;
            }
            var i = this._rows.length - 1, row = this._rows[i];
            while (row.isDeleted && i > 0) {
                i -= 1;
                row = this._rows[i];
            }
            return (row.isDeleted) ? null : row;
        };
        DataGrid.prototype._removeRow = function (row) {
            if (this._isRowExpanded(row)) {
                this.collapseDetails();
            }
            if (this._rows.length === 0) {
                return -1;
            }
            var rowkey = row.itemKey, i = utils.arr.remove(this._rows, row);
            try {
                if (i > -1) {
                    if (!row.getIsStateDirty()) {
                        row.dispose();
                    }
                }
            }
            finally {
                if (!!this._rowMap[rowkey]) {
                    delete this._rowMap[rowkey];
                }
            }
            return i;
        };
        DataGrid.prototype._expandDetails = function (parentRow, expanded) {
            if (!this._options.details) {
                return;
            }
            if (!this._details) {
                this._details = this._createDetails();
                this._fillSpace = this._createFillSpace();
            }
            var old = this._expandedRow;
            if (old === parentRow && (!!old && expanded)) {
                return;
            }
            this._expandedRow = null;
            this._details.parentRow = null;
            if (expanded) {
                this._expandedRow = parentRow;
                this._details.parentRow = parentRow;
                this._expandedRow.expanderCell.toggleImage();
                this._fillSpace.attach();
            }
            else {
                this._expandedRow = null;
                this._details.parentRow = null;
                if (!!old) {
                    old.expanderCell.toggleImage();
                }
                this._fillSpace.detach();
                this._fillSpace.height = 0;
            }
            if (old !== parentRow && !!old) {
                old.expanderCell.toggleImage();
            }
            this.objEvents.raise("row_expanded", { collapsedRow: old, expandedRow: parentRow, isExpanded: expanded });
        };
        DataGrid.prototype._parseColumnAttr = function (columnAttr, contentAttr) {
            var defaultOp = {
                "type": "data",
                title: null,
                sortable: false,
                sortMemberName: null,
                content: null
            };
            var options;
            var tempOpts = parser.parseOptions(columnAttr);
            if (tempOpts.length > 0) {
                options = extend(defaultOp, tempOpts[0]);
            }
            else {
                options = defaultOp;
            }
            if (!!contentAttr) {
                options.content = int_2.parseContentAttr(contentAttr);
                if (!options.sortMemberName && !!options.content.fieldName) {
                    options.sortMemberName = options.content.fieldName;
                }
            }
            return options;
        };
        DataGrid.prototype._findUndeleted = function (row, isUp) {
            if (!row) {
                return null;
            }
            if (!row.isDeleted) {
                return row;
            }
            var delIndex = this.rows.indexOf(row), len = this.rows.length;
            var i = delIndex;
            if (!isUp) {
                i -= 1;
                if (i >= 0) {
                    row = this.rows[i];
                }
                while (i >= 0 && row.isDeleted) {
                    i -= 1;
                    if (i >= 0) {
                        row = this.rows[i];
                    }
                }
                if (row.isDeleted) {
                    row = null;
                }
            }
            else {
                i += 1;
                if (i < len) {
                    row = this.rows[i];
                }
                while (i < len && row.isDeleted) {
                    i += 1;
                    if (i < len) {
                        row = this.rows[i];
                    }
                }
                if (row.isDeleted) {
                    row = null;
                }
            }
            return row;
        };
        DataGrid.prototype._onDSCurrentChanged = function (prevCurrent, newCurrent) {
            if (prevCurrent !== newCurrent) {
                var oldRow = !prevCurrent ? null : this._rowMap[prevCurrent._key];
                var newRow = !newCurrent ? null : this._rowMap[newCurrent._key];
                if (!!oldRow) {
                    oldRow.objEvents.raiseProp("isCurrent");
                    dom.removeClass([oldRow.tr], "ria-row-highlight");
                }
                if (!!newRow) {
                    newRow.objEvents.raiseProp("isCurrent");
                    dom.addClass([newRow.tr], "ria-row-highlight");
                }
            }
        };
        DataGrid.prototype._onDSCollectionChanged = function (sender, args) {
            var self = this;
            switch (args.changeType) {
                case 2:
                    {
                        if (args.reason === 0) {
                            self._resetColumnsSort();
                        }
                        self._refresh(args.reason === 1);
                    }
                    break;
                case 1:
                    {
                        self._appendItems(args.items);
                        self._updateTableDisplay();
                    }
                    break;
                case 0:
                    {
                        var rowpos_1 = -1;
                        args.items.forEach(function (item) {
                            var row = self._rowMap[item._key];
                            if (!!row) {
                                rowpos_1 = self._removeRow(row);
                            }
                        });
                        var rowlen = this._rows.length;
                        if (rowpos_1 > -1 && rowlen > 0) {
                            if (rowpos_1 < rowlen) {
                                this.currentRow = this._rows[rowpos_1];
                            }
                            else {
                                this.currentRow = this._rows[rowlen - 1];
                            }
                        }
                        self._updateTableDisplay();
                    }
                    break;
                case 3:
                    {
                        var row = self._rowMap[args.old_key];
                        if (!!row) {
                            delete self._rowMap[args.old_key];
                            self._rowMap[args.new_key] = row;
                        }
                    }
                    break;
                default:
                    throw new Error(format(jriapp_shared_29.LocaleERRS.ERR_COLLECTION_CHANGETYPE_INVALID, args.changeType));
            }
        };
        DataGrid.prototype._updateTableDisplay = function () {
            if (!this._table) {
                return;
            }
            if (!this.dataSource || this.dataSource.count === 0) {
                this._table.style.visibility = "hidden";
            }
            else {
                this._table.style.visibility = "visible";
            }
        };
        DataGrid.prototype._onPageChanged = function () {
            if (!!this._rowSelectorCol) {
                this._rowSelectorCol.checked = false;
            }
            this.objEvents.raise("page_changed", {});
        };
        DataGrid.prototype._onItemEdit = function (item, isBegin, isCanceled) {
            var row = this._rowMap[item._key];
            if (!row) {
                return;
            }
            if (isBegin) {
                row._onBeginEdit();
                this._editingRow = row;
            }
            else {
                row._onEndEdit(isCanceled);
                this._editingRow = null;
            }
            this.objEvents.raiseProp("editingRow");
        };
        DataGrid.prototype._onItemAdded = function (sender, args) {
            var item = args.item, row = this._rowMap[item._key];
            if (!row) {
                return;
            }
            this.scrollToCurrent();
            if (this._options.isHandleAddNew && !args.isAddNewHandled) {
                args.isAddNewHandled = this.showEditDialog();
            }
        };
        DataGrid.prototype._onItemStatusChanged = function (item, oldStatus) {
            var newStatus = item._aspect.status, ds = this.dataSource, row = this._rowMap[item._key];
            if (!row) {
                return;
            }
            if (newStatus === 3) {
                row.isDeleted = true;
                var row2 = this._findUndeleted(row, true);
                if (!row2) {
                    row2 = this._findUndeleted(row, false);
                }
                if (!!row2) {
                    ds.currentItem = row2.item;
                }
            }
            else if (oldStatus === 3) {
                row.isDeleted = false;
            }
        };
        DataGrid.prototype._onDSErrorsChanged = function (sender, args) {
            var row = this._rowMap[args.item._key];
            if (!row) {
                return;
            }
            row.updateErrorState();
        };
        DataGrid.prototype._bindDS = function () {
            var _this = this;
            var self = this, ds = this.dataSource;
            if (!ds) {
                this._updateTableDisplay();
                return;
            }
            var oldCurrent = null;
            this._updateCurrent = function () {
                var coll = _this.dataSource;
                self._onDSCurrentChanged(oldCurrent, coll.currentItem);
                oldCurrent = coll.currentItem;
            };
            ds.addOnCollChanged(self._onDSCollectionChanged, self._uniqueID, self);
            ds.addOnCurrentChanged(function () {
                self._updateCurrent();
            }, self._uniqueID, self);
            ds.addOnBeginEdit(function (sender, args) {
                self._onItemEdit(args.item, true, false);
            }, self._uniqueID);
            ds.addOnEndEdit(function (sender, args) {
                self._onItemEdit(args.item, false, args.isCanceled);
            }, self._uniqueID);
            ds.addOnErrorsChanged(self._onDSErrorsChanged, self._uniqueID, self);
            ds.addOnStatusChanged(function (sender, args) {
                self._onItemStatusChanged(args.item, args.oldStatus);
            }, self._uniqueID);
            ds.addOnItemAdded(self._onItemAdded, self._uniqueID, self);
            ds.addOnItemAdding(function (s, a) {
                self.collapseDetails();
            }, self._uniqueID);
        };
        DataGrid.prototype._unbindDS = function () {
            var self = this, ds = this.dataSource;
            this._updateTableDisplay();
            if (!ds) {
                return;
            }
            ds.objEvents.offNS(self._uniqueID);
        };
        DataGrid.prototype._clearGrid = function () {
            if (this._rows.length === 0) {
                return;
            }
            this.collapseDetails();
            var self = this, tbody = self._tBodyEl, newTbody = doc.createElement("tbody");
            this.table.replaceChild(newTbody, tbody);
            var rows = this._rows;
            this._rows = [];
            this._rowMap = {};
            rows.forEach(function (row) {
                row.isDetached = true;
                row.dispose();
            });
        };
        DataGrid.prototype._wrapTable = function () {
            var options = this._options;
            var wrapper = doc.createElement("div"), container = doc.createElement("div"), header = doc.createElement("div");
            dom.addClass([wrapper], "ria-table-wrap");
            dom.addClass([container], "ria-table-container");
            dom.addClass([header], "ria-table-header");
            if (options.wrapCss) {
                dom.addClass([wrapper], options.wrapCss);
            }
            if (options.containerCss) {
                dom.addClass([container], options.containerCss);
            }
            if (options.headerCss) {
                dom.addClass([header], options.headerCss);
            }
            dom.wrap(this.table, wrapper);
            dom.wrap(wrapper, container);
            dom.insertBefore(header, wrapper);
            dom.addClass([this._tHeadRow], "ria-col-info");
            this._wrapper = wrapper;
            this._header = header;
            this._contaner = container;
            bootstrap_16.selectableProviderWeakMap.set(this._contaner, this);
        };
        DataGrid.prototype._unWrapTable = function () {
            if (!this._header) {
                return;
            }
            bootstrap_16.selectableProviderWeakMap.delete(this._contaner);
            this._header.remove();
            this._header = null;
            dom.unwrap(this.table);
            dom.unwrap(this.table);
            this._wrapper = null;
            this._contaner = null;
        };
        DataGrid.prototype._createColumns = function () {
            var self = this, headCells = this._tHeadCells, cellInfos = [];
            var cnt = headCells.length;
            for (var i = 0; i < cnt; i += 1) {
                var th = headCells[i], attr = this._parseColumnAttr(th.getAttribute("data-column"), th.getAttribute("data-content"));
                cellInfos.push({ th: th, colInfo: attr });
            }
            cellInfos.forEach(function (cellInfo) {
                var col = self._createColumn(cellInfo);
                if (!!col) {
                    self._columns.push(col);
                }
            });
            self.updateColumnsSize();
        };
        DataGrid.prototype._createColumn = function (cellInfo) {
            var col;
            switch (cellInfo.colInfo.type) {
                case "row_expander":
                    if (!this._expanderCol) {
                        col = new expander_3.ExpanderColumn(this, cellInfo);
                        this._expanderCol = col;
                    }
                    break;
                case "row_actions":
                    if (!this._actionsCol) {
                        col = new actions_3.ActionsColumn(this, cellInfo);
                        this._actionsCol = col;
                    }
                    break;
                case "row_selector":
                    if (!this._rowSelectorCol) {
                        col = new rowselector_3.RowSelectorColumn(this, cellInfo);
                        this._rowSelectorCol = col;
                    }
                    break;
                case "data":
                    col = new data_2.DataColumn(this, cellInfo);
                    break;
                default:
                    throw new Error(format(jriapp_shared_29.LocaleERRS.ERR_GRID_COLTYPE_INVALID, cellInfo.colInfo.type));
            }
            return col;
        };
        DataGrid.prototype._appendItems = function (newItems) {
            var self = this, tbody = this._tBodyEl;
            var isPrepend = self.options.isPrependAllRows;
            var isPrependNew = self.options.isPrependNewRows;
            if (newItems.length === 1) {
                var item = newItems[0];
                if (!self._rowMap[item._key]) {
                    isPrepend = isPrepend || (isPrependNew && item._aspect.isNew);
                    self._createRowForItem(tbody, item, isPrepend);
                }
            }
            else {
                var docFr = doc.createDocumentFragment(), k = newItems.length;
                for (var i = 0; i < k; i += 1) {
                    var item = newItems[i];
                    if (!self._rowMap[item._key]) {
                        self._createRowForItem(docFr, item, (isPrependNew && item._aspect.isNew));
                    }
                }
                self._addNodeToParent(tbody, docFr, isPrepend);
            }
            self.updateColumnsSize();
        };
        DataGrid.prototype._refresh = function (isPageChanged) {
            var self = this, ds = this.dataSource;
            if (!ds || self.getIsStateDirty()) {
                return;
            }
            this._clearGrid();
            var docFr = doc.createDocumentFragment(), oldTbody = this._tBodyEl, newTbody = doc.createElement("tbody");
            ds.items.forEach(function (item, index) {
                self._createRowForItem(docFr, item, false);
            });
            newTbody.appendChild(docFr);
            self.table.replaceChild(newTbody, oldTbody);
            if (isPageChanged) {
                self._onPageChanged();
            }
            if (self.isUseScrollInto) {
                self.scrollToCurrent();
            }
            self.updateColumnsSize();
            self._updateTableDisplay();
            self._updateCurrent();
        };
        DataGrid.prototype._addNodeToParent = function (parent, node, prepend) {
            if (!prepend) {
                dom.append(parent, [node]);
            }
            else {
                dom.prepend(parent, node);
            }
        };
        DataGrid.prototype._createRowForItem = function (parent, item, prepend) {
            var self = this, gridRow = new row_1.Row(self, { item: item });
            self._rowMap[item._key] = gridRow;
            if (!prepend) {
                self._rows.push(gridRow);
            }
            else {
                self._rows.unshift(gridRow);
            }
            self._addNodeToParent(parent, gridRow.tr, prepend);
            return gridRow;
        };
        DataGrid.prototype._createDetails = function () {
            var detailsId = this._options.details.templateID;
            return new details_2.DetailsRow({ grid: this, details_id: detailsId });
        };
        DataGrid.prototype._createFillSpace = function () {
            return new fillspace_2.FillSpaceRow({ grid: this });
        };
        DataGrid.prototype._scrollTo = function (yPos, animate) {
            if (animate) {
                jquery_5.$(this._wrapper).animate({
                    scrollTop: yPos
                }, {
                    duration: 500,
                    specialEasing: {
                        width: "linear",
                        height: "easeOutBounce"
                    }
                });
            }
            else {
                this._wrapper.scrollTop = yPos;
            }
        };
        DataGrid.prototype.setDataSource = function (v) {
            var _this = this;
            this._unbindDS();
            this._options.dataSource = v;
            var fn_init = function () {
                var ds = _this._options.dataSource;
                if (!!ds && !ds.getIsStateDirty()) {
                    _this._updateContentOptions();
                    _this._bindDS();
                    _this._refresh(false);
                }
                else {
                    _this._clearGrid();
                }
            };
            if (!!this._options.syncSetDatasource) {
                fn_init();
            }
            else {
                this._dsDebounce.enque(fn_init);
            }
        };
        DataGrid.prototype._getInternal = function () {
            return this._internal;
        };
        DataGrid.prototype.updateColumnsSize = function () {
            if (this.getIsStateDirty()) {
                return;
            }
            var width = 0;
            var header = this._header;
            this._columns.forEach(function (col) {
                width += col.width;
            });
            header.style.width = (width + "px");
            this._columns.forEach(function (col) {
                col.updateWidth();
            });
        };
        DataGrid.prototype.sortByColumn = function (column) {
            var ds = this.dataSource;
            if (!ds) {
                return utils.defer.reject("DataGrid's datasource is not set");
            }
            var sorts = column.sortMemberName.split(";");
            var promise = ds.sort(sorts, column.sortOrder);
            return promise;
        };
        DataGrid.prototype.selectRows = function (isSelect) {
            this._rows.forEach(function (row) {
                if (row.isDeleted) {
                    return;
                }
                row.isSelected = isSelect;
            });
        };
        DataGrid.prototype.findRowByItem = function (item) {
            var row = this._rowMap[item._key];
            return (!row) ? null : row;
        };
        DataGrid.prototype.collapseDetails = function () {
            if (!this._details) {
                return;
            }
            var old = this._expandedRow;
            if (!!old) {
                this._expandDetails(old, false);
            }
        };
        DataGrid.prototype.getSelectedRows = function () {
            var res = [];
            this._rows.forEach(function (row) {
                if (row.isDeleted) {
                    return;
                }
                if (row.isSelected) {
                    res.push(row);
                }
            });
            return res;
        };
        DataGrid.prototype.showEditDialog = function () {
            if (!this.isHasEditor || !this._editingRow) {
                return false;
            }
            var dialogOptions;
            var item = this._editingRow.item;
            if (!item._aspect.isEditing) {
                item._aspect.beginEdit();
            }
            if (!this._dialog) {
                dialogOptions = extend({
                    dataContext: item,
                    templateID: null
                }, this._options.editor);
                this._dialog = new dialog_1.DataEditDialog(dialogOptions);
            }
            else {
                this._dialog.dataContext = item;
            }
            this._dialog.canRefresh = !!this.dataSource.permissions.canRefreshRow && !item._aspect.isNew;
            this._dialog.show();
            return true;
        };
        DataGrid.prototype.scrollToRow = function (args) {
            if (!args || !args.row) {
                return;
            }
            var row = args.row, viewport = this._wrapper;
            if (!!this._fillSpace) {
                this._fillSpace.height = 0;
            }
            var animate = !!args.animate, alignBottom = (args.pos === 1), viewPortHeight = viewport.clientHeight, viewportRect = viewport.getBoundingClientRect(), rowHeight = row.height, currentScrollTop = viewport.scrollTop;
            var offsetDiff = currentScrollTop + row.rect.top - viewportRect.top;
            if (alignBottom) {
                offsetDiff = Math.floor(offsetDiff + 1);
            }
            else {
                offsetDiff = Math.floor(offsetDiff - 1);
            }
            var contentHeight = rowHeight;
            if (row.isExpanded) {
                contentHeight = contentHeight + this._details.height;
            }
            contentHeight = Math.min(viewPortHeight, contentHeight);
            var yOffset = viewPortHeight - contentHeight;
            var yPos = offsetDiff, deltaY = 0;
            if (alignBottom) {
                yPos -= yOffset;
            }
            var maxScrollTop = this.table.offsetHeight - viewPortHeight + 1;
            if (yPos < 0) {
                yPos = 0;
            }
            else if (yPos > maxScrollTop) {
                deltaY = yPos - maxScrollTop;
            }
            if (!!this._fillSpace) {
                this._fillSpace.height = deltaY;
            }
            if ((args.pos !== 2) && (currentScrollTop < offsetDiff && currentScrollTop > (offsetDiff - yOffset))) {
                return;
            }
            this._scrollTo(yPos, animate);
        };
        DataGrid.prototype.scrollToCurrent = function (pos, animate) {
            var _this = this;
            this._scrollDebounce.enque(function () {
                _this.scrollToRow({ row: _this.currentRow, animate: animate, pos: pos });
            });
        };
        DataGrid.prototype.focus = function () {
            this.scrollToCurrent(0);
            boot.selectedControl = this;
        };
        DataGrid.prototype.addNew = function () {
            var ds = this.dataSource;
            try {
                ds.addNew();
                this.showEditDialog();
            }
            catch (ex) {
                ERROR.reThrow(ex, this.handleError(ex, this));
            }
        };
        DataGrid.prototype.addOnRowExpanded = function (fn, nmspace, context) {
            this.objEvents.on("row_expanded", fn, nmspace, context);
        };
        DataGrid.prototype.offOnRowExpanded = function (nmspace) {
            this.objEvents.off("row_expanded", nmspace);
        };
        DataGrid.prototype.addOnRowSelected = function (fn, nmspace, context) {
            this.objEvents.on("row_selected", fn, nmspace, context);
        };
        DataGrid.prototype.offOnRowSelected = function (nmspace) {
            this.objEvents.off("row_selected", nmspace);
        };
        DataGrid.prototype.addOnPageChanged = function (fn, nmspace, context) {
            this.objEvents.on("page_changed", fn, nmspace, context);
        };
        DataGrid.prototype.offOnPageChanged = function (nmspace) {
            this.objEvents.off("page_changed", nmspace);
        };
        DataGrid.prototype.addOnRowStateChanged = function (fn, nmspace, context) {
            this.objEvents.on("row_state_changed", fn, nmspace, context);
        };
        DataGrid.prototype.offOnRowStateChanged = function (nmspace) {
            this.objEvents.off("row_state_changed", nmspace);
        };
        DataGrid.prototype.addOnCellDblClicked = function (fn, nmspace, context) {
            this.objEvents.on("cell_dblclicked", fn, nmspace, context);
        };
        DataGrid.prototype.offOnCellDblClicked = function (nmspace) {
            this.objEvents.off("cell_dblclicked", nmspace);
        };
        DataGrid.prototype.addOnRowAction = function (fn, nmspace, context) {
            this.objEvents.on("row_action", fn, nmspace, context);
        };
        DataGrid.prototype.offOnRowAction = function (nmspace) {
            this.objEvents.off("row_action", nmspace);
        };
        Object.defineProperty(DataGrid.prototype, "selectable", {
            get: function () {
                return this._selectable;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "table", {
            get: function () {
                return this._table;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "options", {
            get: function () {
                return this._options;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "_tBodyEl", {
            get: function () {
                return this.table.tBodies[0];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "_tHeadEl", {
            get: function () {
                return this.table.tHead;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "_tFootEl", {
            get: function () {
                return this.table.tFoot;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "_tHeadRow", {
            get: function () {
                if (!this._tHeadEl) {
                    return null;
                }
                var trs = this._tHeadEl.rows;
                if (trs.length === 0) {
                    return null;
                }
                return trs[0];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "_tHeadCells", {
            get: function () {
                var row = this._tHeadRow;
                return (!row) ? [] : utils.arr.fromList(row.cells);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "uniqueID", {
            get: function () {
                return this._uniqueID;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "name", {
            get: function () {
                return this._name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "dataSource", {
            get: function () {
                return this._options.dataSource;
            },
            set: function (v) {
                if (v !== this.dataSource) {
                    this.setDataSource(v);
                    this.objEvents.raiseProp("dataSource");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "rows", {
            get: function () {
                return this._rows;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "columns", {
            get: function () {
                return this._columns;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "currentItem", {
            get: function () {
                var ds = this.dataSource;
                return (!ds) ? null : ds.currentItem;
            },
            set: function (item) {
                var ds = this.dataSource;
                if (!ds) {
                    return;
                }
                ds.currentItem = item;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "currentRow", {
            get: function () {
                var cur = this.currentItem;
                return (!cur) ? null : this._rowMap[cur._key];
            },
            set: function (row) {
                if (!!row && !row.getIsStateDirty()) {
                    if (row.item !== this.currentItem) {
                        this.currentItem = row.item;
                    }
                }
                else {
                    this.currentItem = null;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "editingRow", {
            get: function () {
                return this._editingRow;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "isHasEditor", {
            get: function () {
                return (!!this._options.editor && !!this._options.editor.templateID);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "isCanEdit", {
            get: function () {
                if (this._options.isCanEdit !== null) {
                    return this._options.isCanEdit;
                }
                var ds = this.dataSource;
                return !!ds && ds.permissions.canEditRow;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "isCanDelete", {
            get: function () {
                if (this._options.isCanDelete !== null) {
                    return this._options.isCanDelete;
                }
                var ds = this.dataSource;
                return !!ds && ds.permissions.canDeleteRow;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "isCanAddNew", {
            get: function () {
                var ds = this.dataSource;
                return !!ds && ds.permissions.canAddRow;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "isUseScrollInto", {
            get: function () {
                return this._options.isUseScrollInto;
            },
            set: function (v) {
                this._options.isUseScrollInto = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "animation", {
            get: function () {
                if (!this.options.animation) {
                    this.options.animation = new animation_1.DefaultAnimation();
                }
                return this.options.animation;
            },
            enumerable: true,
            configurable: true
        });
        return DataGrid;
    }(jriapp_shared_29.BaseObject));
    exports.DataGrid = DataGrid;
    var DataGridElView = (function (_super) {
        __extends(DataGridElView, _super);
        function DataGridElView(table, options) {
            var _this = _super.call(this, table, options) || this;
            _this._stateProvider = null;
            _this._stateDebounce = new jriapp_shared_29.Debounce();
            _this._grid = new DataGrid(table, options);
            _this._bindGridEvents();
            return _this;
        }
        DataGridElView.prototype.toString = function () {
            return "DataGridElView";
        };
        DataGridElView.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            this._stateDebounce.dispose();
            if (!this._grid.getIsStateDirty()) {
                this._grid.dispose();
            }
            this._stateProvider = null;
            _super.prototype.dispose.call(this);
        };
        DataGridElView.prototype._bindGridEvents = function () {
            var self = this;
            this._grid.addOnRowStateChanged(function (sender, args) {
                if (!!self._stateProvider) {
                    args.css = self._stateProvider.getCSS(args.row.item, args.val);
                }
            }, this.uniqueID);
            self._grid.objEvents.onProp("*", function (sender, args) {
                switch (args.property) {
                    case "dataSource":
                        self.objEvents.raiseProp(args.property);
                        break;
                }
            }, self.uniqueID);
        };
        DataGridElView.prototype._setErrors = function (el, errors) {
        };
        Object.defineProperty(DataGridElView.prototype, "dataSource", {
            get: function () {
                return this.grid.dataSource;
            },
            set: function (v) {
                this.grid.dataSource = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGridElView.prototype, "grid", {
            get: function () {
                return this._grid;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGridElView.prototype, "stateProvider", {
            get: function () {
                return this._stateProvider;
            },
            set: function (v) {
                var _this = this;
                if (v !== this._stateProvider) {
                    this._stateProvider = v;
                    this._stateDebounce.enque(function () {
                        if (!_this._grid || _this._grid.getIsStateDirty()) {
                            return;
                        }
                        _this._grid.rows.forEach(function (row) {
                            row.updateUIState();
                        });
                    });
                    this.objEvents.raiseProp("stateProvider");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGridElView.prototype, "animation", {
            get: function () {
                return this._grid.options.animation;
            },
            set: function (v) {
                if (this.animation !== v) {
                    this._grid.options.animation = v;
                    this.objEvents.raiseProp("animation");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGridElView.prototype, "selectable", {
            get: function () {
                return this._grid.selectable;
            },
            enumerable: true,
            configurable: true
        });
        return DataGridElView;
    }(baseview_6.BaseElView));
    exports.DataGridElView = DataGridElView;
    boot.registerElView("table", DataGridElView);
    boot.registerElView("datagrid", DataGridElView);
});
define("jriapp_ui/pager", ["require", "exports", "jriapp_shared", "jriapp/utils/dom", "jriapp_ui/baseview", "jriapp_ui/baseview", "jriapp/bootstrap"], function (require, exports, jriapp_shared_30, dom_30, baseview_7, baseview_8, bootstrap_17) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_30.Utils, dom = dom_30.DomUtils, doc = dom.document, sys = utils.sys, format = utils.str.format, _a = utils.core, getNewID = _a.getNewID, extend = _a.extend, boot = bootstrap_17.bootstrap;
    var _STRS = jriapp_shared_30.LocaleSTRS.PAGER;
    var css;
    (function (css) {
        css["interval"] = "ria-pager-interval";
        css["pager"] = "ria-pager";
        css["info"] = "ria-pager-info";
        css["page"] = "ria-pager-page";
        css["currentPage"] = "ria-pager-current-page";
        css["otherPage"] = "ria-pager-other-page";
    })(css || (css = {}));
    function _removeToolTips(toolTips) {
        toolTips.forEach(function (el) {
            baseview_7.addToolTip(el, null);
        });
    }
    var Pager = (function (_super) {
        __extends(Pager, _super);
        function Pager(el, options) {
            var _this = _super.call(this) || this;
            options = extend({
                dataSource: null,
                showTip: true,
                showInfo: false,
                showNumbers: true,
                showPreviousAndNext: false,
                useSlider: true,
                hideOnSinglePage: true,
                sliderSize: 10
            }, options);
            var self = _this;
            _this._display = null;
            if (!!options.dataSource && !sys.isCollection(options.dataSource)) {
                throw new Error(jriapp_shared_30.LocaleERRS.ERR_PAGER_DATASRC_INVALID);
            }
            _this._options = options;
            options.sliderSize = options.sliderSize < 3 ? 3 : options.sliderSize;
            _this._el = el;
            _this._uniqueID = getNewID("pgr");
            _this._rowsPerPage = 0;
            _this._rowCount = 0;
            _this._currentPage = 1;
            _this._toolTips = [];
            _this._pageDebounce = new jriapp_shared_30.Debounce();
            _this._dsDebounce = new jriapp_shared_30.Debounce();
            dom.events.on(el, "click", function (e) {
                e.preventDefault();
                var a = e.target, page = parseInt(a.getAttribute("data-page"), 10);
                self._pageDebounce.enque(function () {
                    self.currentPage = page;
                    self._dsDebounce.enque(function () {
                        if (!!self.dataSource) {
                            self.dataSource.pageIndex = page - 1;
                        }
                    });
                });
            }, {
                nmspace: _this._uniqueID,
                matchElement: function (el) {
                    var attr = el.getAttribute("data-scope");
                    return self._uniqueID === attr;
                }
            });
            _this._bindDS();
            bootstrap_17.selectableProviderWeakMap.set(el, _this);
            return _this;
        }
        Pager.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            bootstrap_17.selectableProviderWeakMap.delete(this._el);
            this.parentControl = null;
            this._pageDebounce.dispose();
            this._dsDebounce.dispose();
            this._unbindDS();
            this._clearContent();
            dom.events.offNS(this._el, this._uniqueID);
            this._el = null;
            this._options = {};
            _super.prototype.dispose.call(this);
        };
        Pager.prototype._addToolTip = function (el, tip) {
            baseview_7.addToolTip(el, tip);
            if (!!tip) {
                this._toolTips.push(el);
            }
        };
        Pager.prototype._createElement = function (tag) {
            return doc.createElement(tag);
        };
        Pager.prototype._clearContent = function () {
            this._el.innerHTML = "";
            _removeToolTips(this._toolTips);
            this._toolTips = [];
        };
        Pager.prototype.render = function () {
            var div = doc.createElement("div"), docFr = doc.createDocumentFragment(), oldToolTips = this._toolTips;
            this._toolTips = [];
            dom.addClass([div], "ria-pager");
            if (this.rowsPerPage <= 0) {
                return;
            }
            var rowCount = this.rowCount, currentPage = this.currentPage, pageCount = this.pageCount;
            if (rowCount > 0) {
                if (this.showPreviousAndNext && !(this.hideOnSinglePage && (pageCount === 1))) {
                    docFr.appendChild(this._createFirst());
                    docFr.appendChild(this._createPrevious());
                    docFr.appendChild(this._createCurrent());
                    docFr.appendChild(this._createNext());
                    docFr.appendChild(this._createLast());
                }
                if (this.showNumbers && currentPage > 0 && !(this.hideOnSinglePage && (pageCount === 1))) {
                    var sliderSize = this.sliderSize;
                    var start = 1, end = pageCount, half = void 0, above = void 0, below = void 0;
                    if (this.useSlider && (sliderSize > 0) && (sliderSize < (pageCount - 3))) {
                        half = Math.floor(((sliderSize - 1) / 2));
                        above = (currentPage + half) + ((sliderSize - 1) % 2);
                        below = (currentPage - half);
                        if (below < 1) {
                            above += (1 - below);
                            below = 1;
                        }
                        if (above > pageCount) {
                            below -= (above - pageCount);
                            if (below < 1) {
                                below = 1;
                            }
                            above = pageCount;
                        }
                        start = below;
                        end = above;
                    }
                    var _start = start === 1 ? 2 : start;
                    var _end = end === pageCount ? end - 1 : end;
                    if (1 === currentPage) {
                        docFr.appendChild(this._createCurrent());
                    }
                    else {
                        docFr.appendChild(this._createOther(1));
                    }
                    if (_start > 2) {
                        if (_start === 3) {
                            docFr.appendChild(this._createOther(2));
                        }
                        else {
                            docFr.appendChild(this._createInterval());
                        }
                    }
                    for (var i = _start; i <= _end; i++) {
                        if (i === currentPage) {
                            docFr.appendChild(this._createCurrent());
                        }
                        else {
                            docFr.appendChild(this._createOther(i));
                        }
                    }
                    if (_end < (pageCount - 1)) {
                        if (_end === (pageCount - 2)) {
                            docFr.appendChild(this._createOther(pageCount - 1));
                        }
                        else {
                            docFr.appendChild(this._createInterval());
                        }
                    }
                    if (pageCount === currentPage) {
                        docFr.appendChild(this._createCurrent());
                    }
                    else {
                        docFr.appendChild(this._createOther(pageCount));
                    }
                }
            }
            if (this.showInfo && rowCount > 0 && currentPage > 0) {
                var rowsPerPage = this.rowsPerPage, start = rowCount === 0 ? 0 : (((currentPage - 1) * rowsPerPage) + 1), end = rowCount === 0 ? 0 : ((currentPage === pageCount) ? rowCount : (currentPage * rowsPerPage));
                var span = this._createElement("span");
                var info = format(_STRS.pageInfo, start, end, rowCount);
                dom.addClass([span], "ria-pager-info");
                span.innerHTML = info;
                var spacer = this._createElement("span");
                spacer.innerHTML = "&nbsp;&nbsp;";
                docFr.appendChild(spacer);
                docFr.appendChild(span);
            }
            div.appendChild(docFr);
            var old = this._el.firstChild;
            if (!old) {
                this._el.appendChild(div);
            }
            else {
                this._el.replaceChild(div, this._el.firstChild);
            }
            _removeToolTips(oldToolTips);
        };
        Pager.prototype._onPageSizeChanged = function (ds) {
            this.rowsPerPage = ds.pageSize;
        };
        Pager.prototype._onPageIndexChanged = function (ds) {
            this.currentPage = ds.pageIndex + 1;
        };
        Pager.prototype._onTotalCountChanged = function (ds) {
            this.rowCount = ds.totalCount;
        };
        Pager.prototype._bindDS = function () {
            var self = this, ds = this.dataSource;
            if (!ds) {
                return;
            }
            ds.addOnCollChanged(function (sender, args) {
                switch (args.changeType) {
                    case 2:
                        {
                            if (args.reason !== 1) {
                                self._reset();
                            }
                        }
                        break;
                }
            }, self._uniqueID);
            ds.addOnPageIndexChanged(self._onPageIndexChanged, self._uniqueID, self);
            ds.addOnPageSizeChanged(self._onPageSizeChanged, self._uniqueID, self);
            ds.addOnTotalCountChanged(self._onTotalCountChanged, self._uniqueID, self);
            this._reset();
        };
        Pager.prototype._unbindDS = function () {
            var self = this, ds = this.dataSource;
            if (!ds) {
                return;
            }
            ds.objEvents.offNS(self._uniqueID);
        };
        Pager.prototype._reset = function () {
            var ds = this.dataSource;
            if (!ds) {
                this._currentPage = 1;
                this._rowsPerPage = 100;
                this._rowCount = 0;
                this.render();
                return;
            }
            this._currentPage = ds.pageIndex + 1;
            this._rowsPerPage = ds.pageSize;
            this._rowCount = ds.totalCount;
            this.render();
        };
        Pager.prototype._createLink = function (text) {
            var a = this._createElement("a");
            a.textContent = ("" + text);
            a.setAttribute("href", "javascript:void(0)");
            return a;
        };
        Pager.prototype._addScope = function (el, page) {
            el.setAttribute("data-scope", this._uniqueID);
            el.setAttribute("data-page", "" + page);
        };
        Pager.prototype._createFirst = function () {
            var span = this._createElement("span");
            if (this.showTip) {
                var tip = _STRS.firstPageTip;
                this._addToolTip(span, tip);
            }
            var a = this._createLink(_STRS.firstText);
            dom.addClass([span], "ria-pager-page");
            dom.addClass([span], "ria-pager-other-page");
            span.appendChild(a);
            this._addScope(span, 1);
            return span;
        };
        Pager.prototype._createPrevious = function () {
            var span = this._createElement("span");
            var previousPage = this.currentPage - 1;
            if (previousPage < 1) {
                previousPage = 1;
            }
            if (this.showTip) {
                var tip = format(_STRS.prevPageTip, previousPage);
                this._addToolTip(span, tip);
            }
            var a = this._createLink(_STRS.previousText);
            dom.addClass([span], "ria-pager-page");
            dom.addClass([span], "ria-pager-other-page");
            span.appendChild(a);
            this._addScope(span, previousPage);
            return span;
        };
        Pager.prototype._createCurrent = function () {
            var span = this._createElement("span"), currentPage = this.currentPage;
            span.textContent = ("" + currentPage);
            if (this.showTip) {
                this._addToolTip(span, this._buildTip(currentPage));
            }
            dom.addClass([span], "ria-pager-page");
            dom.addClass([span], "ria-pager-current-page");
            return span;
        };
        Pager.prototype._createInterval = function () {
            var span = this._createElement("span");
            dom.addClass([span], "ria-pager-interval");
            span.textContent = ("...");
            return span;
        };
        Pager.prototype._createOther = function (page) {
            var span = this._createElement("span");
            if (this.showTip) {
                var tip = this._buildTip(page);
                this._addToolTip(span, tip);
            }
            var a = this._createLink("" + page);
            dom.addClass([span], "ria-pager-page");
            dom.addClass([span], "ria-pager-other-page");
            span.appendChild(a);
            this._addScope(span, page);
            return span;
        };
        Pager.prototype._createNext = function () {
            var span = this._createElement("span"), pageCount = this.pageCount;
            var nextPage = this.currentPage + 1;
            if (nextPage > pageCount) {
                nextPage = pageCount;
            }
            if (this.showTip) {
                var tip = format(_STRS.nextPageTip, nextPage);
                this._addToolTip(span, tip);
            }
            var a = this._createLink(_STRS.nextText);
            dom.addClass([span], "ria-pager-page");
            dom.addClass([span], "ria-pager-other-page");
            span.appendChild(a);
            this._addScope(span, nextPage);
            return span;
        };
        Pager.prototype._createLast = function () {
            var span = this._createElement("span");
            if (this.showTip) {
                var tip = _STRS.lastPageTip;
                this._addToolTip(span, tip);
            }
            var a = this._createLink(_STRS.lastText);
            dom.addClass([span], "ria-pager-page");
            dom.addClass([span], "ria-pager-other-page");
            span.appendChild(a);
            this._addScope(span, this.pageCount);
            return span;
        };
        Pager.prototype._buildTip = function (page) {
            var rowsPerPage = this.rowsPerPage, rowCount = this.rowCount, start = (((page - 1) * rowsPerPage) + 1), end = (page === this.pageCount) ? rowCount : (page * rowsPerPage);
            var tip = "";
            if (page === this.currentPage) {
                tip = format(_STRS.showingTip, start, end, rowCount);
            }
            else {
                tip = format(_STRS.showTip, start, end, rowCount);
            }
            return tip;
        };
        Pager.prototype.setDataSource = function (v) {
            this._unbindDS();
            this._options.dataSource = v;
            this._bindDS();
        };
        Pager.prototype.toString = function () {
            return "Pager";
        };
        Object.defineProperty(Pager.prototype, "el", {
            get: function () {
                return this._el;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Pager.prototype, "dataSource", {
            get: function () {
                return this._options.dataSource;
            },
            set: function (v) {
                if (v !== this.dataSource) {
                    this.setDataSource(v);
                    this.objEvents.raiseProp("dataSource");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Pager.prototype, "pageCount", {
            get: function () {
                var rowCount = this.rowCount, rowsPerPage = this.rowsPerPage;
                var result;
                if ((rowCount === 0) || (rowsPerPage === 0)) {
                    return 0;
                }
                if ((rowCount % rowsPerPage) === 0) {
                    return (rowCount / rowsPerPage);
                }
                else {
                    result = (rowCount / rowsPerPage);
                    result = Math.floor(result) + 1;
                    return result;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Pager.prototype, "rowCount", {
            get: function () {
                return this._rowCount;
            },
            set: function (v) {
                if (this._rowCount !== v) {
                    this._rowCount = v;
                    this.render();
                    this.objEvents.raiseProp("rowCount");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Pager.prototype, "rowsPerPage", {
            get: function () {
                return this._rowsPerPage;
            },
            set: function (v) {
                if (this._rowsPerPage !== v) {
                    this._rowsPerPage = v;
                    this.render();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Pager.prototype, "currentPage", {
            get: function () {
                return this._currentPage;
            },
            set: function (v) {
                if (this._currentPage !== v) {
                    this._currentPage = v;
                    this.render();
                    this.objEvents.raiseProp("currentPage");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Pager.prototype, "useSlider", {
            get: function () {
                return this._options.useSlider;
            },
            set: function (v) {
                if (this.useSlider !== v) {
                    this._options.useSlider = v;
                    this.render();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Pager.prototype, "sliderSize", {
            get: function () {
                return this._options.sliderSize;
            },
            set: function (v) {
                if (this.sliderSize !== v) {
                    this._options.sliderSize = v;
                    this.render();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Pager.prototype, "hideOnSinglePage", {
            get: function () {
                return this._options.hideOnSinglePage;
            },
            set: function (v) {
                if (this.hideOnSinglePage !== v) {
                    this._options.hideOnSinglePage = v;
                    this.render();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Pager.prototype, "showTip", {
            get: function () {
                return this._options.showTip;
            },
            set: function (v) {
                if (this.showTip !== v) {
                    this._options.showTip = v;
                    this.render();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Pager.prototype, "showInfo", {
            get: function () {
                return this._options.showInfo;
            },
            set: function (v) {
                if (this._options.showInfo !== v) {
                    this._options.showInfo = v;
                    this.render();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Pager.prototype, "showPreviousAndNext", {
            get: function () {
                return this._options.showPreviousAndNext;
            },
            set: function (v) {
                if (this.showPreviousAndNext !== v) {
                    this._options.showPreviousAndNext = v;
                    this.render();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Pager.prototype, "showNumbers", {
            get: function () {
                return this._options.showNumbers;
            },
            set: function (v) {
                if (this.showNumbers !== v) {
                    this._options.showNumbers = v;
                    this.render();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Pager.prototype, "isVisible", {
            get: function () {
                var v = this.el.style.display;
                return !(v === "none");
            },
            set: function (v) {
                v = !!v;
                if (v !== this.isVisible) {
                    if (!v) {
                        this._display = this.el.style.display;
                        if (this._display === "none") {
                            this._display = null;
                        }
                        this.el.style.display = "none";
                    }
                    else {
                        this.el.style.display = (!this._display ? "" : this._display);
                    }
                    this.objEvents.raiseProp("isVisible");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Pager.prototype, "selectable", {
            get: function () {
                return !this._parentControl ? null : this._parentControl.selectable;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Pager.prototype, "parentControl", {
            get: function () {
                return this._parentControl;
            },
            set: function (v) {
                if (this._parentControl !== v) {
                    this._parentControl = v;
                    this.objEvents.raiseProp("parentControl");
                }
            },
            enumerable: true,
            configurable: true
        });
        return Pager;
    }(jriapp_shared_30.BaseObject));
    exports.Pager = Pager;
    var PagerElView = (function (_super) {
        __extends(PagerElView, _super);
        function PagerElView(el, options) {
            var _this = _super.call(this, el, options) || this;
            var self = _this;
            _this._pager = new Pager(el, options);
            self._pager.objEvents.onProp("*", function (sender, args) {
                switch (args.property) {
                    case "dataSource":
                    case "parentControl":
                        self.objEvents.raiseProp(args.property);
                        break;
                }
            }, self.uniqueID);
            return _this;
        }
        PagerElView.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            if (!this._pager.getIsStateDirty()) {
                this._pager.dispose();
            }
            _super.prototype.dispose.call(this);
        };
        PagerElView.prototype._setErrors = function (el, errors) {
        };
        PagerElView.prototype.toString = function () {
            return "PagerElView";
        };
        Object.defineProperty(PagerElView.prototype, "dataSource", {
            get: function () {
                return this._pager.dataSource;
            },
            set: function (v) {
                this._pager.dataSource = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PagerElView.prototype, "pager", {
            get: function () {
                return this._pager;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PagerElView.prototype, "selectable", {
            get: function () {
                return this._pager.selectable;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PagerElView.prototype, "parentControl", {
            get: function () {
                return this._pager.parentControl;
            },
            set: function (v) {
                this._pager.parentControl = v;
            },
            enumerable: true,
            configurable: true
        });
        return PagerElView;
    }(baseview_8.BaseElView));
    exports.PagerElView = PagerElView;
    boot.registerElView("pager", PagerElView);
});
define("jriapp_ui/stackpanel", ["require", "exports", "jriapp_shared", "jriapp/utils/dom", "jriapp/template", "jriapp_ui/baseview", "jriapp/bootstrap"], function (require, exports, jriapp_shared_31, dom_31, template_7, baseview_9, bootstrap_18) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_31.Utils, dom = dom_31.DomUtils, doc = dom.document, sys = utils.sys, format = utils.str.format, _a = utils.core, getNewID = _a.getNewID, extend = _a.extend, boot = bootstrap_18.bootstrap;
    var css;
    (function (css) {
        css["stackpanel"] = "ria-stackpanel";
        css["item"] = "ria-stackpanel-item";
        css["horizontal"] = "ria-horizontal-panel";
        css["currentItem"] = "ria-current-item";
        css["itemDeleted"] = "ria-item-deleted";
    })(css || (css = {}));
    var ORIENTATION;
    (function (ORIENTATION) {
        ORIENTATION["VERTICAL"] = "vertical";
        ORIENTATION["HORIZONTAL"] = "horizontal";
    })(ORIENTATION || (ORIENTATION = {}));
    var PNL_EVENTS;
    (function (PNL_EVENTS) {
        PNL_EVENTS["item_clicked"] = "item_clicked";
    })(PNL_EVENTS || (PNL_EVENTS = {}));
    var StackPanel = (function (_super) {
        __extends(StackPanel, _super);
        function StackPanel(el, options) {
            var _this = _super.call(this) || this;
            var self = _this;
            options = extend({
                el: null,
                dataSource: null,
                templateID: null,
                orientation: "vertical",
                syncSetDatasource: false
            }, options);
            if (!!options.dataSource && !sys.isCollection(options.dataSource)) {
                throw new Error(jriapp_shared_31.LocaleERRS.ERR_STACKPNL_DATASRC_INVALID);
            }
            if (!options.templateID) {
                throw new Error(jriapp_shared_31.LocaleERRS.ERR_STACKPNL_TEMPLATE_INVALID);
            }
            _this._options = options;
            _this._el = el;
            dom.addClass([el], "ria-stackpanel");
            var eltag = el.tagName.toLowerCase();
            _this._itemTag = (eltag === "ul" || eltag === "ol") ? "li" : "div";
            if (_this.orientation === "horizontal") {
                dom.addClass([el], "ria-horizontal-panel");
            }
            _this._debounce = new jriapp_shared_31.Debounce();
            _this._uniqueID = getNewID("pnl");
            _this._isKeyNavigation = false;
            _this._currentItem = null;
            _this._itemMap = {};
            _this._selectable = {
                onKeyDown: function (key, event) {
                    self._onKeyDown(key, event);
                },
                onKeyUp: function (key, event) {
                    self._onKeyUp(key, event);
                }
            };
            dom.events.on(el, "click", function (e) {
                var el = e.target, mappedItem = dom.getData(el, "data");
                self._onItemClicked(mappedItem.el, mappedItem.item);
            }, {
                nmspace: _this.uniqueID,
                matchElement: function (el) {
                    var attr = el.getAttribute("data-scope"), tag = el.tagName.toLowerCase();
                    return self.uniqueID === attr && tag === self._itemTag;
                }
            });
            bootstrap_18.selectableProviderWeakMap.set(el, _this);
            var ds = _this._options.dataSource;
            _this.setDataSource(ds);
            return _this;
        }
        StackPanel.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            bootstrap_18.selectableProviderWeakMap.delete(this._el);
            this._debounce.dispose();
            this._unbindDS();
            this._clearContent();
            dom.removeClass([this._el], "ria-stackpanel");
            if (this.orientation === "horizontal") {
                dom.removeClass([this.el], "ria-horizontal-panel");
            }
            dom.events.offNS(this._el, this.uniqueID);
            this._currentItem = null;
            this._itemMap = {};
            this._options = {};
            _super.prototype.dispose.call(this);
        };
        StackPanel.prototype._onKeyDown = function (key, event) {
            var ds = this.dataSource, self = this;
            if (!ds) {
                return;
            }
            if (this.orientation === "horizontal") {
                switch (key) {
                    case 37:
                        event.preventDefault();
                        this._isKeyNavigation = true;
                        if (ds.movePrev(true)) {
                            self.scrollToItem(ds.currentItem, true);
                        }
                        break;
                    case 39:
                        event.preventDefault();
                        this._isKeyNavigation = true;
                        if (ds.moveNext(true)) {
                            self.scrollToItem(ds.currentItem, false);
                        }
                        break;
                }
            }
            else {
                switch (key) {
                    case 38:
                        event.preventDefault();
                        this._isKeyNavigation = true;
                        if (ds.movePrev(true)) {
                            self.scrollToItem(ds.currentItem, true);
                        }
                        break;
                    case 40:
                        event.preventDefault();
                        this._isKeyNavigation = true;
                        if (ds.moveNext(true)) {
                            self.scrollToItem(ds.currentItem, false);
                        }
                        break;
                }
            }
            this._isKeyNavigation = false;
        };
        StackPanel.prototype._onKeyUp = function (key, event) {
        };
        StackPanel.prototype._updateCurrent = function (item, withScroll) {
            var self = this, old = self._currentItem;
            var mappedItem;
            if (old !== item) {
                this._currentItem = item;
                if (!!old) {
                    mappedItem = self._itemMap[old._key];
                    if (!!mappedItem) {
                        dom.removeClass([mappedItem.el], "ria-current-item");
                    }
                }
                if (!!item) {
                    mappedItem = self._itemMap[item._key];
                    if (!!mappedItem) {
                        dom.addClass([mappedItem.el], "ria-current-item");
                        if (withScroll && !this._isKeyNavigation) {
                            this.scrollToCurrent(false);
                        }
                    }
                }
                this.objEvents.raiseProp("currentItem");
            }
        };
        StackPanel.prototype._onDSCurrentChanged = function () {
            var ds = this.dataSource, cur = ds.currentItem;
            this._updateCurrent(cur, !!cur);
        };
        StackPanel.prototype._onDSCollectionChanged = function (sender, args) {
            var self = this;
            switch (args.changeType) {
                case 2:
                    {
                        self._refresh();
                    }
                    break;
                case 1:
                    {
                        self._appendItems(args.items);
                    }
                    break;
                case 0:
                    args.items.forEach(function (item) {
                        self._removeItem(item);
                    });
                    break;
                case 3:
                    {
                        var mappedItem = self._itemMap[args.old_key];
                        if (!!mappedItem) {
                            delete self._itemMap[args.old_key];
                            self._itemMap[args.new_key] = mappedItem;
                        }
                    }
                    break;
                default:
                    throw new Error(format(jriapp_shared_31.LocaleERRS.ERR_COLLECTION_CHANGETYPE_INVALID, args.changeType));
            }
        };
        StackPanel.prototype._onItemStatusChanged = function (item, oldStatus) {
            var newStatus = item._aspect.status, obj = this._itemMap[item._key];
            if (!obj) {
                return;
            }
            if (newStatus === 3) {
                dom.addClass([obj.el], "ria-item-deleted");
            }
            else if (oldStatus === 3) {
                dom.removeClass([obj.el], "ria-item-deleted");
            }
        };
        StackPanel.prototype._createTemplate = function (item) {
            var template = template_7.createTemplate(item, null);
            template.templateID = this.templateID;
            return template;
        };
        StackPanel.prototype._appendItems = function (newItems) {
            var self = this, docFr = doc.createDocumentFragment();
            newItems.forEach(function (item) {
                if (!!self._itemMap[item._key]) {
                    return;
                }
                self._appendItem(docFr, item);
            });
            self.el.appendChild(docFr);
        };
        StackPanel.prototype._appendItem = function (parent, item) {
            var self = this, itemElem = doc.createElement(this._itemTag);
            dom.addClass([itemElem], "ria-stackpanel-item");
            itemElem.setAttribute("data-scope", this.uniqueID);
            parent.appendChild(itemElem);
            var mappedItem = { el: itemElem, template: null, item: item };
            dom.setData(itemElem, "data", mappedItem);
            self._itemMap[item._key] = mappedItem;
            mappedItem.template = self._createTemplate(item);
            mappedItem.el.appendChild(mappedItem.template.el);
        };
        StackPanel.prototype._bindDS = function () {
            var self = this, ds = this.dataSource;
            if (!ds) {
                return;
            }
            ds.addOnCollChanged(self._onDSCollectionChanged, self._uniqueID, self);
            ds.addOnCurrentChanged(self._onDSCurrentChanged, self._uniqueID, self);
            ds.addOnStatusChanged(function (sender, args) {
                self._onItemStatusChanged(args.item, args.oldStatus);
            }, self._uniqueID);
        };
        StackPanel.prototype._unbindDS = function () {
            var self = this, ds = this.dataSource;
            if (!ds) {
                return;
            }
            ds.objEvents.offNS(self._uniqueID);
        };
        StackPanel.prototype._onItemClicked = function (div, item) {
            this._updateCurrent(item, false);
            this.dataSource.currentItem = item;
            this.objEvents.raise("item_clicked", { item: item });
        };
        StackPanel.prototype._clearContent = function () {
            var self = this, keys = Object.keys(self._itemMap);
            if (keys.length === 0) {
                return;
            }
            self._el.innerHTML = "";
            keys.forEach(function (key) {
                self._removeItemByKey(key);
            });
        };
        StackPanel.prototype._removeItemByKey = function (key) {
            var self = this, mappedItem = self._itemMap[key];
            if (!mappedItem) {
                return;
            }
            delete self._itemMap[key];
            mappedItem.template.dispose();
            mappedItem.template = null;
            dom.removeNode(mappedItem.el);
        };
        StackPanel.prototype._removeItem = function (item) {
            this._removeItemByKey(item._key);
        };
        StackPanel.prototype._refresh = function () {
            var ds = this.dataSource, self = this;
            this._clearContent();
            if (!ds) {
                return;
            }
            var docFr = doc.createDocumentFragment();
            ds.forEach(function (item) {
                self._appendItem(docFr, item);
            });
            self.el.appendChild(docFr);
        };
        StackPanel.prototype.setDataSource = function (v) {
            var _this = this;
            this._unbindDS();
            this._options.dataSource = v;
            var fn_init = function () {
                var ds = _this._options.dataSource;
                if (!!ds && !ds.getIsStateDirty()) {
                    _this._bindDS();
                    _this._refresh();
                }
                else {
                    _this._clearContent();
                }
            };
            if (!!this._options.syncSetDatasource) {
                fn_init();
            }
            else {
                this._debounce.enque(fn_init);
            }
        };
        StackPanel.prototype.addOnItemClicked = function (fn, nmspace, context) {
            this.objEvents.on("item_clicked", fn, nmspace, context);
        };
        StackPanel.prototype.offOnItemClicked = function (nmspace) {
            this.objEvents.off("item_clicked", nmspace);
        };
        StackPanel.prototype.getDivElementByItem = function (item) {
            var mappedItem = this._itemMap[item._key];
            return (!mappedItem) ? null : mappedItem.el;
        };
        StackPanel.prototype.scrollToItem = function (item, isUp) {
            if (!item) {
                return;
            }
            var mappedItem = this._itemMap[item._key];
            if (!mappedItem) {
                return;
            }
            var isVert = this.orientation === "vertical", pnl = mappedItem.el, viewport = this._el, viewportRect = viewport.getBoundingClientRect(), pnlRect = pnl.getBoundingClientRect(), viewPortSize = isVert ? viewport.clientHeight : viewport.clientWidth, itemSize = isVert ? pnl.offsetHeight : pnl.offsetWidth, currentPos = isVert ? viewport.scrollTop : viewport.scrollLeft, offsetDiff = isVert ? (currentPos + pnlRect.top - viewportRect.top) : (currentPos + pnlRect.left - viewportRect.left);
            var contentSize = Math.min(itemSize, viewPortSize);
            var offset = viewPortSize - contentSize;
            var pos = !isUp ? Math.floor(offsetDiff - offset + 1) : Math.floor(offsetDiff - 1);
            if (pos < 0) {
                pos = 0;
            }
            if ((currentPos < offsetDiff && currentPos > (offsetDiff - offset))) {
                return;
            }
            if (isVert) {
                this._el.scrollTop = pos;
            }
            else {
                this._el.scrollLeft = pos;
            }
        };
        StackPanel.prototype.scrollToCurrent = function (isUp) {
            this.scrollToItem(this._currentItem, isUp);
        };
        StackPanel.prototype.focus = function () {
            this.scrollToCurrent(true);
            boot.selectedControl = this;
        };
        StackPanel.prototype.toString = function () {
            return "StackPanel";
        };
        Object.defineProperty(StackPanel.prototype, "selectable", {
            get: function () {
                return this._selectable;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(StackPanel.prototype, "el", {
            get: function () {
                return this._el;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(StackPanel.prototype, "uniqueID", {
            get: function () {
                return this._uniqueID;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(StackPanel.prototype, "orientation", {
            get: function () {
                return this._options.orientation;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(StackPanel.prototype, "templateID", {
            get: function () {
                return this._options.templateID;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(StackPanel.prototype, "dataSource", {
            get: function () {
                return this._options.dataSource;
            },
            set: function (v) {
                if (v !== this.dataSource) {
                    this.setDataSource(v);
                    this.objEvents.raiseProp("dataSource");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(StackPanel.prototype, "currentItem", {
            get: function () {
                return this._currentItem;
            },
            enumerable: true,
            configurable: true
        });
        return StackPanel;
    }(jriapp_shared_31.BaseObject));
    exports.StackPanel = StackPanel;
    var StackPanelElView = (function (_super) {
        __extends(StackPanelElView, _super);
        function StackPanelElView(el, options) {
            var _this = _super.call(this, el, options) || this;
            var self = _this;
            _this._panelEvents = null;
            _this._panel = new StackPanel(el, options);
            _this._panel.addOnItemClicked(function (sender, args) {
                if (!!self._panelEvents) {
                    self._panelEvents.onItemClicked(args.item);
                }
            }, _this.uniqueID);
            _this._panel.objEvents.onProp("*", function (sender, args) {
                switch (args.property) {
                    case "dataSource":
                        self.objEvents.raiseProp(args.property);
                        break;
                }
            }, self.uniqueID);
            return _this;
        }
        StackPanelElView.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            if (!this._panel.getIsStateDirty()) {
                this._panel.dispose();
            }
            this._panelEvents = null;
            _super.prototype.dispose.call(this);
        };
        StackPanelElView.prototype.toString = function () {
            return "StackPanelElView";
        };
        Object.defineProperty(StackPanelElView.prototype, "dataSource", {
            get: function () {
                return this._panel.dataSource;
            },
            set: function (v) {
                this._panel.dataSource = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(StackPanelElView.prototype, "panelEvents", {
            get: function () {
                return this._panelEvents;
            },
            set: function (v) {
                var old = this._panelEvents;
                if (v !== old) {
                    this._panelEvents = v;
                    this.objEvents.raiseProp("panelEvents");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(StackPanelElView.prototype, "panel", {
            get: function () {
                return this._panel;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(StackPanelElView.prototype, "selectable", {
            get: function () {
                return this._panel.selectable;
            },
            enumerable: true,
            configurable: true
        });
        return StackPanelElView;
    }(baseview_9.BaseElView));
    exports.StackPanelElView = StackPanelElView;
    boot.registerElView("stackpanel", StackPanelElView);
    boot.registerElView("ul", StackPanelElView);
    boot.registerElView("ol", StackPanelElView);
});
define("jriapp_ui/tabs", ["require", "exports", "jriapp_shared", "jriapp_ui/utils/jquery", "jriapp/bootstrap", "jriapp_ui/baseview"], function (require, exports, jriapp_shared_32, jquery_6, bootstrap_19, baseview_10) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_32.Utils, coreUtils = utils.core;
    var TabsElView = (function (_super) {
        __extends(TabsElView, _super);
        function TabsElView(el, options) {
            var _this = _super.call(this, el, options) || this;
            _this._tabOpts = options;
            _this._tabsEvents = null;
            _this._tabsCreated = false;
            _this._createTabs();
            return _this;
        }
        TabsElView.prototype._createTabs = function () {
            var $el = jquery_6.$(this.el), self = this;
            var tabOpts = {
                activate: function () {
                    if (!!self._tabsEvents) {
                        self._tabsEvents.onTabSelected(self);
                    }
                    self.objEvents.raiseProp("tabIndex");
                }
            };
            tabOpts = coreUtils.extend(tabOpts, self._tabOpts);
            $el.tabs(tabOpts);
            utils.queue.enque(function () {
                if (self.getIsStateDirty()) {
                    return;
                }
                self._tabsCreated = true;
                self._onTabsCreated();
                self.objEvents.raiseProp("tabIndex");
            });
        };
        TabsElView.prototype._destroyTabs = function () {
            var $el = jquery_6.$(this.el);
            jquery_6.JQueryUtils.dispose$Plugin($el, "tabs");
            this._tabsCreated = false;
            if (!!this._tabsEvents) {
                this._tabsEvents.removeTabs();
            }
        };
        TabsElView.prototype._onTabsCreated = function () {
            var self = this;
            if (!!self._tabsEvents) {
                self._tabsEvents.addTabs(self);
            }
            if (!!self._tabsEvents) {
                self._tabsEvents.onTabSelected(self);
            }
        };
        TabsElView.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            this._destroyTabs();
            this._tabsEvents = null;
            _super.prototype.dispose.call(this);
        };
        TabsElView.prototype.toString = function () {
            return "TabsElView";
        };
        Object.defineProperty(TabsElView.prototype, "tabsEvents", {
            get: function () { return this._tabsEvents; },
            set: function (v) {
                var old = this._tabsEvents;
                if (v !== old) {
                    if (!!old) {
                        old.removeTabs();
                    }
                    this._tabsEvents = v;
                    this.objEvents.raiseProp("tabsEvents");
                    if (this._tabsCreated) {
                        this._onTabsCreated();
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TabsElView.prototype, "tabIndex", {
            get: function () {
                var $el = jquery_6.$(this.el);
                return $el.tabs("option", "active");
            },
            set: function (v) {
                var $el = jquery_6.$(this.el);
                $el.tabs("option", "active", v);
            },
            enumerable: true,
            configurable: true
        });
        return TabsElView;
    }(baseview_10.BaseElView));
    exports.TabsElView = TabsElView;
    bootstrap_19.bootstrap.registerElView("tabs", TabsElView);
});
define("jriapp_ui/template", ["require", "exports", "jriapp_shared", "jriapp/utils/viewchecks", "jriapp/bootstrap", "jriapp_ui/baseview"], function (require, exports, jriapp_shared_33, viewchecks_2, bootstrap_20, baseview_11) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_33.Utils, viewChecks = viewchecks_2.ViewChecks, boot = bootstrap_20.bootstrap, ERROR = utils.err;
    viewChecks.isTemplateElView = function (obj) {
        return !!obj && obj instanceof TemplateElView;
    };
    var TemplateElView = (function (_super) {
        __extends(TemplateElView, _super);
        function TemplateElView(el, options) {
            var _this = _super.call(this, el, options) || this;
            _this._command = null;
            return _this;
        }
        TemplateElView.prototype.invokeCommand = function (args) {
            var cmd = this._command;
            if (!!cmd) {
                cmd.execute(args);
            }
        };
        TemplateElView.prototype.templateLoading = function (template) {
        };
        TemplateElView.prototype.templateLoaded = function (template, error) {
            if (!!error) {
                return;
            }
            var self = this;
            try {
                var args = { template: template, isLoaded: true };
                self.invokeCommand(args);
            }
            catch (ex) {
                ERROR.reThrow(ex, this.handleError(ex, this));
            }
        };
        TemplateElView.prototype.templateUnLoading = function (template) {
            var self = this;
            try {
                var args = { template: template, isLoaded: false };
                self.invokeCommand(args);
            }
            catch (ex) {
                this.handleError(ex, this);
            }
        };
        TemplateElView.prototype.toString = function () {
            return "TemplateElView";
        };
        Object.defineProperty(TemplateElView.prototype, "command", {
            get: function () {
                return this._command;
            },
            set: function (v) {
                if (v !== this._command) {
                    this._command = v;
                    this.objEvents.raiseProp("command");
                }
            },
            enumerable: true,
            configurable: true
        });
        return TemplateElView;
    }(baseview_11.BaseElView));
    exports.TemplateElView = TemplateElView;
    ;
    boot.registerElView("template", TemplateElView);
});
define("jriapp_ui/dataform", ["require", "exports", "jriapp_shared", "jriapp/utils/dom", "jriapp/utils/viewchecks", "jriapp/bootstrap", "jriapp_ui/baseview", "jriapp_ui/content/int"], function (require, exports, jriapp_shared_34, dom_32, viewchecks_3, bootstrap_21, baseview_12, int_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_34.Utils, dom = dom_32.DomUtils, isFunc = utils.check.isFunc, getNewID = utils.core.getNewID, format = utils.str.format, sys = utils.sys, boot = bootstrap_21.bootstrap, viewChecks = viewchecks_3.ViewChecks, _reject = utils.defer.reject;
    viewChecks.isDataForm = function (el) {
        if (!el) {
            return false;
        }
        var attr = el.getAttribute("data-view");
        return (!attr) ? false : (attr === "dataform");
    };
    viewChecks.isInsideDataForm = function (el) {
        if (!el) {
            return false;
        }
        var parent = el.parentElement;
        if (!!parent) {
            if (!viewChecks.isDataForm(parent)) {
                return viewChecks.isInsideDataForm(parent);
            }
            else {
                return true;
            }
        }
        return false;
    };
    viewChecks.isInNestedForm = function (root, forms, el) {
        var len = forms.length;
        if (len === 0) {
            return false;
        }
        var oNode = el.parentElement;
        while (!!oNode) {
            for (var i = 0; i < len; i += 1) {
                if (oNode === forms[i]) {
                    return true;
                }
            }
            if (!!root && oNode === root) {
                return false;
            }
            oNode = oNode.parentElement;
        }
        return false;
    };
    viewChecks.getParentDataForm = function (rootForm, el) {
        if (!el) {
            return null;
        }
        var parent = el.parentElement;
        if (!!parent) {
            if (parent === rootForm) {
                return rootForm;
            }
            if (viewChecks.isDataForm(parent)) {
                return parent;
            }
            else {
                return viewChecks.getParentDataForm(rootForm, parent);
            }
        }
        return null;
    };
    function getFieldInfo(obj, fieldName) {
        if (!obj) {
            return null;
        }
        if (!!obj._aspect && isFunc(obj._aspect.getFieldInfo)) {
            return obj._aspect.getFieldInfo(fieldName);
        }
        else if (isFunc(obj.getFieldInfo)) {
            return obj.getFieldInfo(fieldName);
        }
        else {
            return null;
        }
    }
    function getErrorsService() {
        return boot.getSvc("IUIErrorsService");
    }
    var DataForm = (function (_super) {
        __extends(DataForm, _super);
        function DataForm(el, options) {
            var _this = _super.call(this) || this;
            var self = _this;
            _this._el = el;
            _this._uniqueID = getNewID("frm");
            _this._dataContext = null;
            _this._errorsService = !options.formErrorsService ? getErrorsService() : options.formErrorsService;
            dom.addClass([el], "ria-dataform");
            _this._isEditing = false;
            _this._content = [];
            _this._lfTime = null;
            _this._contentCreated = false;
            _this._editable = null;
            _this._errNotification = null;
            _this._parentDataForm = null;
            _this._contentPromise = null;
            var parent = viewChecks.getParentDataForm(null, el);
            if (!!parent) {
                self._parentDataForm = _this.app.viewFactory.getElView(parent);
                self._parentDataForm.objEvents.addOnDisposed(function () {
                    if (!self.getIsStateDirty()) {
                        self.dispose();
                    }
                }, self._uniqueID);
            }
            return _this;
        }
        DataForm.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            this._setErrors(null);
            this._clearContent();
            dom.removeClass([this.el], "ria-dataform");
            this._unbindDS();
            var parentDataForm = this._parentDataForm;
            this._parentDataForm = null;
            if (!!parentDataForm && !parentDataForm.getIsStateDirty()) {
                parentDataForm.objEvents.offNS(this._uniqueID);
            }
            this._dataContext = null;
            this._errorsService = null;
            this._contentCreated = false;
            this._contentPromise = null;
            this._el = null;
            _super.prototype.dispose.call(this);
        };
        DataForm.prototype._getBindings = function () {
            return !this._lfTime ? [] : this._lfTime.findAll(sys.isBinding);
        };
        DataForm.prototype._createContent = function () {
            var dctx = this._dataContext, self = this;
            if (!dctx) {
                return _reject("DataForm's DataContext is not set");
            }
            var contentElements = utils.arr.fromList(this._el.querySelectorAll(DataForm._DATA_CONTENT_SELECTOR)), isEditing = this.isEditing;
            var forms = utils.arr.fromList(this._el.querySelectorAll(DataForm._DATA_FORM_SELECTOR));
            contentElements.forEach(function (el) {
                if (viewChecks.isInNestedForm(self._el, forms, el)) {
                    return;
                }
                var attr = el.getAttribute("data-content"), op = int_3.parseContentAttr(attr);
                if (!!op.fieldName && !op.fieldInfo) {
                    op.fieldInfo = getFieldInfo(dctx, op.fieldName);
                    if (!op.fieldInfo) {
                        throw new Error(format(jriapp_shared_34.LocaleERRS.ERR_DBSET_INVALID_FIELDNAME, "", op.fieldName));
                    }
                }
                var contentType = boot.contentFactory.getContentType(op);
                var content = new contentType({ parentEl: el, contentOptions: op, dataContext: dctx, isEditing: isEditing });
                self._content.push(content);
                content.render();
            });
            var promise = self.app._getInternal().bindElements({
                scope: this._el,
                bind: 2,
                dataContext: dctx
            });
            return promise.then(function (lftm) {
                if (self.getIsStateDirty()) {
                    lftm.dispose();
                    return;
                }
                self._lfTime = lftm;
                var bindings = self._getBindings();
                bindings.forEach(function (binding) {
                    if (!binding.isSourceFixed) {
                        binding.source = dctx;
                    }
                });
                self._contentCreated = true;
            });
        };
        DataForm.prototype._updateCreatedContent = function () {
            var dctx = this._dataContext, self = this;
            try {
                this._content.forEach(function (content) {
                    content.dataContext = dctx;
                    content.isEditing = self.isEditing;
                });
                var bindings = this._getBindings();
                bindings.forEach(function (binding) {
                    if (!binding.isSourceFixed) {
                        binding.source = dctx;
                    }
                });
            }
            catch (ex) {
                utils.err.reThrow(ex, this.handleError(ex, this));
            }
        };
        DataForm.prototype._updateContent = function () {
            var self = this;
            try {
                if (self._contentCreated) {
                    self._updateCreatedContent();
                }
                else {
                    if (!!self._contentPromise) {
                        self._contentPromise.then(function () {
                            if (self.getIsStateDirty()) {
                                return;
                            }
                            self._updateCreatedContent();
                        }, function (err) {
                            if (self.getIsStateDirty()) {
                                return;
                            }
                            self.handleError(err, self);
                        });
                    }
                    else {
                        self._contentPromise = self._createContent();
                    }
                }
            }
            catch (ex) {
                utils.err.reThrow(ex, self.handleError(ex, self));
            }
        };
        DataForm.prototype._onDSErrorsChanged = function () {
            if (!!this._errNotification) {
                var errors = this._errNotification.getAllErrors();
                this._setErrors(errors);
            }
        };
        DataForm.prototype._bindDS = function () {
            var dataContext = this._dataContext, self = this;
            if (!dataContext) {
                return;
            }
            if (!!dataContext) {
                this._editable = sys.getEditable(dataContext);
                this._errNotification = sys.getErrorNotification(dataContext);
            }
            dataContext.objEvents.addOnDisposed(function () {
                self.dataContext = null;
            }, self._uniqueID);
            if (!!this._editable) {
                this._editable.objEvents.onProp("isEditing", self._onIsEditingChanged, self._uniqueID, self);
            }
            if (!!this._errNotification) {
                this._errNotification.addOnErrorsChanged(self._onDSErrorsChanged, self._uniqueID, self);
            }
        };
        DataForm.prototype._unbindDS = function () {
            var dataContext = this._dataContext;
            this._setErrors(null);
            if (!!dataContext && !dataContext.getIsStateDirty()) {
                dataContext.objEvents.offNS(this._uniqueID);
                if (!!this._editable) {
                    this._editable.objEvents.offNS(this._uniqueID);
                }
                if (!!this._errNotification) {
                    this._errNotification.offOnErrorsChanged(this._uniqueID);
                }
            }
            this._editable = null;
            this._errNotification = null;
        };
        DataForm.prototype._clearContent = function () {
            this._content.forEach(function (content) {
                content.dispose();
            });
            this._content = [];
            if (!!this._lfTime) {
                this._lfTime.dispose();
                this._lfTime = null;
            }
            this._contentCreated = false;
        };
        DataForm.prototype._setErrors = function (errors) {
            this._errorsService.setFormErrors(this.el, errors);
        };
        DataForm.prototype._onIsEditingChanged = function () {
            this.isEditing = this._editable.isEditing;
        };
        DataForm.prototype.toString = function () {
            return "DataForm";
        };
        Object.defineProperty(DataForm.prototype, "app", {
            get: function () {
                return boot.app;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataForm.prototype, "el", {
            get: function () {
                return this._el;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataForm.prototype, "dataContext", {
            get: function () {
                return this._dataContext;
            },
            set: function (v) {
                if (v === this._dataContext) {
                    return;
                }
                if (!!v && !sys.isBaseObj(v)) {
                    throw new Error(jriapp_shared_34.LocaleERRS.ERR_DATAFRM_DCTX_INVALID);
                }
                this._unbindDS();
                this._dataContext = v;
                this._bindDS();
                this._updateContent();
                if (!!this._dataContext) {
                    if (!!this._editable && this._isEditing !== this._editable.isEditing) {
                        this.isEditing = this._editable.isEditing;
                    }
                    if (!!this._errNotification) {
                        this._onDSErrorsChanged();
                    }
                }
                this.objEvents.raiseProp("dataContext");
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataForm.prototype, "isEditing", {
            get: function () {
                return this._isEditing;
            },
            set: function (v) {
                var dataContext = this._dataContext;
                if (!dataContext) {
                    return;
                }
                var isEditing = this._isEditing;
                var editable;
                if (!!this._editable) {
                    editable = this._editable;
                }
                if (!editable && v !== isEditing) {
                    this._isEditing = v;
                    this._updateContent();
                    this.objEvents.raiseProp("isEditing");
                    return;
                }
                if (v !== isEditing && !!editable) {
                    try {
                        if (v) {
                            editable.beginEdit();
                        }
                        else {
                            editable.endEdit();
                        }
                    }
                    catch (ex) {
                        utils.err.reThrow(ex, this.handleError(ex, dataContext));
                    }
                }
                if (!!editable && editable.isEditing !== isEditing) {
                    this._isEditing = editable.isEditing;
                    this._updateContent();
                    this.objEvents.raiseProp("isEditing");
                }
            },
            enumerable: true,
            configurable: true
        });
        DataForm._DATA_FORM_SELECTOR = ["*[", "data-view", "='", "dataform", "']"].join("");
        DataForm._DATA_CONTENT_SELECTOR = ["*[", "data-content", "]:not([", "data-column", "])"].join("");
        return DataForm;
    }(jriapp_shared_34.BaseObject));
    exports.DataForm = DataForm;
    var DataFormElView = (function (_super) {
        __extends(DataFormElView, _super);
        function DataFormElView(el, options) {
            var _this = _super.call(this, el, options) || this;
            var self = _this;
            _this._form = new DataForm(el, options);
            _this._form.objEvents.onProp("dataContext", function (form, args) {
                self.objEvents.raiseProp("dataContext");
            }, _this.uniqueID);
            return _this;
        }
        DataFormElView.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            if (!this._form.getIsStateDirty()) {
                this._form.dispose();
            }
            _super.prototype.dispose.call(this);
        };
        DataFormElView.prototype._setErrors = function (el, errors) {
        };
        DataFormElView.prototype.toString = function () {
            return "DataFormElView";
        };
        Object.defineProperty(DataFormElView.prototype, "dataContext", {
            get: function () {
                return this._form.dataContext;
            },
            set: function (v) {
                if (this.dataContext !== v) {
                    this._form.dataContext = v;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataFormElView.prototype, "form", {
            get: function () {
                return this._form;
            },
            enumerable: true,
            configurable: true
        });
        return DataFormElView;
    }(baseview_12.BaseElView));
    exports.DataFormElView = DataFormElView;
    boot.registerElView("dataform", DataFormElView);
});
define("jriapp_ui/datepicker", ["require", "exports", "jriapp/bootstrap", "jriapp_ui/textbox"], function (require, exports, bootstrap_22, textbox_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var boot = bootstrap_22.bootstrap;
    var DatePickerElView = (function (_super) {
        __extends(DatePickerElView, _super);
        function DatePickerElView(el, options) {
            var _this = _super.call(this, el, options) || this;
            var datepicker = boot.getSvc("IDatepicker");
            if (!datepicker) {
                throw new Error("IDatepicker service is not registered");
            }
            datepicker.attachTo(el, options.datepicker, function (datetext) {
                el.value = datetext;
                _this.objEvents.raiseProp("value");
            });
            return _this;
        }
        DatePickerElView.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            var datepicker = boot.getSvc("IDatepicker");
            if (!datepicker) {
                throw new Error("IDatepicker service is not registered");
            }
            datepicker.detachFrom(this.el);
            _super.prototype.dispose.call(this);
        };
        DatePickerElView.prototype.toString = function () {
            return "DatePickerElView";
        };
        return DatePickerElView;
    }(textbox_4.TextBoxElView));
    exports.DatePickerElView = DatePickerElView;
    boot.registerElView("datepicker", DatePickerElView);
});
define("jriapp_ui/command", ["require", "exports", "jriapp_shared", "jriapp/utils/dom", "jriapp_ui/baseview"], function (require, exports, jriapp_shared_35, dom_33, baseview_13) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var utils = jriapp_shared_35.Utils, dom = dom_33.DomUtils;
    var CommandFlags;
    (function (CommandFlags) {
        CommandFlags[CommandFlags["PreventDefault"] = 0] = "PreventDefault";
        CommandFlags[CommandFlags["StopPropagation"] = 1] = "StopPropagation";
        CommandFlags[CommandFlags["Disabled"] = 2] = "Disabled";
    })(CommandFlags || (CommandFlags = {}));
    var CommandElView = (function (_super) {
        __extends(CommandElView, _super);
        function CommandElView(el, options) {
            var _this = _super.call(this, el, options) || this;
            _this._command = null;
            _this._commandParam = null;
            _this._commandFlags = 0;
            _this._debounce = new jriapp_shared_35.Debounce();
            _this._setCommandFlag(!!options.preventDefault, 0);
            _this._setCommandFlag(!!options.stopPropagation, 1);
            var disabled = ("disabled" in el) && el.disabled;
            if (disabled) {
                _this._setCommandFlag(disabled, 2);
            }
            dom.setClass([el], "disabled", _this.isEnabled);
            return _this;
        }
        CommandElView.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            this._debounce.dispose();
            if (!!this._command) {
                this._command.offOnCanExecuteChanged(this.uniqueID);
            }
            this._command = null;
            this._commandParam = null;
            _super.prototype.dispose.call(this);
        };
        CommandElView.prototype._getCommandFlag = function (flag) {
            return !!(this._commandFlags & (1 << flag));
        };
        CommandElView.prototype._setCommandFlag = function (v, flag) {
            if (v) {
                this._commandFlags |= (1 << flag);
            }
            else {
                this._commandFlags &= ~(1 << flag);
            }
        };
        CommandElView.prototype._onCanExecuteChanged = function (cmd, args) {
            this.isEnabled = cmd.canExecute(this._getCommandParam());
        };
        CommandElView.prototype._getCommandParam = function () {
            return this._commandParam;
        };
        CommandElView.prototype._onCommandChanged = function () {
            if (!!this._command) {
                this.isEnabled = this._command.canExecute(this._getCommandParam());
            }
        };
        CommandElView.prototype.invokeCommand = function () {
            var self = this;
            if (!!self.command && self.isEnabled) {
                utils.queue.enque(function () {
                    if (self.getIsStateDirty()) {
                        return;
                    }
                    try {
                        if (!!self.command && self.isEnabled) {
                            self.command.execute(self._getCommandParam());
                        }
                    }
                    catch (ex) {
                        self.handleError(ex, self);
                    }
                });
            }
        };
        CommandElView.prototype.viewMounted = function () {
            var _this = this;
            this._debounce.enque(function () {
                _this._onCommandChanged();
            });
        };
        CommandElView.prototype.toString = function () {
            return "CommandElView";
        };
        Object.defineProperty(CommandElView.prototype, "command", {
            get: function () {
                return this._command;
            },
            set: function (v) {
                var _this = this;
                if (v !== this._command) {
                    if (!!this._command) {
                        this._command.offOnCanExecuteChanged(this.uniqueID);
                    }
                    this._command = v;
                    if (!!this._command) {
                        this._command.addOnCanExecuteChanged(this._onCanExecuteChanged, this.uniqueID, this);
                    }
                    this._debounce.enque(function () {
                        _this._onCommandChanged();
                    });
                    this.objEvents.raiseProp("command");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CommandElView.prototype, "commandParam", {
            get: function () {
                return this._commandParam;
            },
            set: function (v) {
                var _this = this;
                if (v !== this._commandParam) {
                    this._commandParam = v;
                    this._debounce.enque(function () {
                        _this._onCommandChanged();
                    });
                    this.objEvents.raiseProp("commandParam");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CommandElView.prototype, "isEnabled", {
            get: function () {
                var el = this.el;
                if (("disabled" in this.el)) {
                    return !el.disabled;
                }
                else {
                    return !this._getCommandFlag(2);
                }
            },
            set: function (v) {
                var el = this.el;
                if (v !== this.isEnabled) {
                    if (("disabled" in this.el)) {
                        el.disabled = !v;
                        this._setCommandFlag(!v, 2);
                    }
                    else {
                        this._setCommandFlag(!v, 2);
                    }
                    dom.setClass([this.el], "disabled", !!v);
                    this.objEvents.raiseProp("isEnabled");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CommandElView.prototype, "preventDefault", {
            get: function () {
                return this._getCommandFlag(0);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CommandElView.prototype, "stopPropagation", {
            get: function () {
                return this._getCommandFlag(1);
            },
            enumerable: true,
            configurable: true
        });
        return CommandElView;
    }(baseview_13.BaseElView));
    exports.CommandElView = CommandElView;
});
define("jriapp_ui/anchor", ["require", "exports", "jriapp/utils/dom", "jriapp/bootstrap", "jriapp_ui/command"], function (require, exports, dom_34, bootstrap_23, command_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dom = dom_34.DomUtils, boot = bootstrap_23.bootstrap, subscribeMap = bootstrap_23.subscribeWeakMap;
    var AnchorElView = (function (_super) {
        __extends(AnchorElView, _super);
        function AnchorElView(el, options) {
            var _this = _super.call(this, el, options) || this;
            var self = _this;
            _this._imageSrc = null;
            _this._image = null;
            _this._span = null;
            _this._glyph = null;
            if (!!options.imageSrc) {
                _this.imageSrc = options.imageSrc;
            }
            if (!!options.glyph) {
                _this.glyph = options.glyph;
            }
            dom.addClass([el], "ria-command-link");
            if (_this.isDelegationOn) {
                subscribeMap.set(el, _this);
                _this._setIsSubcribed(1);
            }
            else {
                dom.events.on(el, "click", function (e) {
                    self.handle_click(e);
                }, _this.uniqueID);
            }
            return _this;
        }
        AnchorElView.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            dom.removeClass([this.el], "ria-command-link");
            this.imageSrc = null;
            this.glyph = null;
            _super.prototype.dispose.call(this);
        };
        AnchorElView.prototype.handle_click = function (e) {
            if (this.stopPropagation) {
                e.stopPropagation();
            }
            if (this.preventDefault) {
                e.preventDefault();
            }
            this.onClick();
            return this.stopPropagation;
        };
        AnchorElView.prototype.onClick = function () {
            this.invokeCommand();
        };
        AnchorElView.prototype._updateImage = function (src) {
            var el = this.el;
            if (this._imageSrc === src) {
                return;
            }
            this._imageSrc = src;
            if (!!this._image && !src) {
                dom.removeNode(this._image);
                this._image = null;
                return;
            }
            if (!!src) {
                if (!this._image) {
                    el.innerHTML = "";
                    this._image = new Image();
                    el.appendChild(this._image);
                }
                this._image.src = src;
            }
        };
        AnchorElView.prototype._updateGlyph = function (glyph) {
            var el = this.el;
            if (this._glyph === glyph) {
                return;
            }
            var oldGlyph = this._glyph;
            this._glyph = glyph;
            if (!!oldGlyph && !glyph) {
                dom.removeNode(this._span);
                return;
            }
            if (!!glyph) {
                if (!this._span) {
                    el.innerHTML = "";
                    this._span = dom.document.createElement("span");
                    el.appendChild(this._span);
                }
                if (!!oldGlyph) {
                    dom.removeClass([this._span], oldGlyph);
                }
                dom.addClass([this._span], glyph);
            }
        };
        AnchorElView.prototype.toString = function () {
            return "AnchorElView";
        };
        Object.defineProperty(AnchorElView.prototype, "imageSrc", {
            get: function () { return this._imageSrc; },
            set: function (v) {
                var x = this._imageSrc;
                if (x !== v) {
                    this._updateImage(v);
                    this.objEvents.raiseProp("imageSrc");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnchorElView.prototype, "glyph", {
            get: function () { return this._glyph; },
            set: function (v) {
                var x = this._glyph;
                if (x !== v) {
                    this._updateGlyph(v);
                    this.objEvents.raiseProp("glyph");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnchorElView.prototype, "html", {
            get: function () {
                return this.el.innerHTML;
            },
            set: function (v) {
                var x = this.el.innerHTML;
                v = (!v) ? "" : ("" + v);
                if (x !== v) {
                    this.el.innerHTML = v;
                    this.objEvents.raiseProp("html");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnchorElView.prototype, "text", {
            get: function () {
                return this.el.textContent;
            },
            set: function (v) {
                var x = this.el.textContent;
                v = (!v) ? "" : ("" + v);
                if (x !== v) {
                    this.el.textContent = v;
                    this.objEvents.raiseProp("text");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnchorElView.prototype, "href", {
            get: function () {
                return this.el.href;
            },
            set: function (v) {
                var x = this.href;
                v = (!v) ? "" : ("" + v);
                if (x !== v) {
                    this.el.href = v;
                    this.objEvents.raiseProp("href");
                }
            },
            enumerable: true,
            configurable: true
        });
        return AnchorElView;
    }(command_1.CommandElView));
    exports.AnchorElView = AnchorElView;
    boot.registerElView("a", AnchorElView);
    boot.registerElView("abutton", AnchorElView);
});
define("jriapp_ui/span", ["require", "exports", "jriapp/bootstrap", "jriapp_ui/baseview"], function (require, exports, bootstrap_24, baseview_14) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SpanElView = (function (_super) {
        __extends(SpanElView, _super);
        function SpanElView() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        SpanElView.prototype.toString = function () {
            return "SpanElView";
        };
        Object.defineProperty(SpanElView.prototype, "text", {
            get: function () {
                return this.el.textContent;
            },
            set: function (v) {
                var el = this.el, x = el.textContent, str = "" + v;
                v = (v === null ? "" : str);
                if (x !== v) {
                    el.textContent = v;
                    this.objEvents.raiseProp("text");
                    this.objEvents.raiseProp("value");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SpanElView.prototype, "value", {
            get: function () {
                return this.text;
            },
            set: function (v) {
                this.text = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SpanElView.prototype, "html", {
            get: function () {
                return this.el.innerHTML;
            },
            set: function (v) {
                var el = this.el, x = this.el.innerHTML, str = "" + v;
                v = v === null ? "" : str;
                if (x !== v) {
                    el.innerHTML = v;
                    this.objEvents.raiseProp("html");
                }
            },
            enumerable: true,
            configurable: true
        });
        return SpanElView;
    }(baseview_14.BaseElView));
    exports.SpanElView = SpanElView;
    bootstrap_24.bootstrap.registerElView("span", SpanElView);
});
define("jriapp_ui/block", ["require", "exports", "jriapp/bootstrap", "jriapp_ui/span"], function (require, exports, bootstrap_25, span_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var boot = bootstrap_25.bootstrap;
    var BlockElView = (function (_super) {
        __extends(BlockElView, _super);
        function BlockElView() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        BlockElView.prototype.toString = function () {
            return "BlockElView";
        };
        Object.defineProperty(BlockElView.prototype, "width", {
            get: function () {
                return this.el.offsetWidth;
            },
            set: function (v) {
                var x = this.width;
                if (v !== x) {
                    this.el.style.width = v + "px";
                    this.objEvents.raiseProp("width");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BlockElView.prototype, "height", {
            get: function () {
                return this.el.offsetHeight;
            },
            set: function (v) {
                var x = this.height;
                if (v !== x) {
                    this.el.style.height = v + "px";
                    this.objEvents.raiseProp("height");
                }
            },
            enumerable: true,
            configurable: true
        });
        return BlockElView;
    }(span_1.SpanElView));
    exports.BlockElView = BlockElView;
    boot.registerElView("block", BlockElView);
    boot.registerElView("div", BlockElView);
    boot.registerElView("section", BlockElView);
});
define("jriapp_ui/busy", ["require", "exports", "jriapp_shared", "jriapp_ui/utils/jquery", "jriapp/bootstrap", "jriapp/utils/dom", "jriapp_ui/baseview"], function (require, exports, jriapp_shared_36, jquery_7, bootstrap_26, dom_35, baseview_15) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var isNt = jriapp_shared_36.Utils.check.isNt, boot = bootstrap_26.bootstrap, dom = dom_35.DomUtils;
    var BusyElView = (function (_super) {
        __extends(BusyElView, _super);
        function BusyElView(el, options) {
            var _this = _super.call(this, el, options) || this;
            var img;
            if (!!options.img) {
                img = options.img;
            }
            else {
                img = "loader.gif";
            }
            _this._delay = 400;
            _this._timeOut = null;
            if (!isNt(options.delay)) {
                _this._delay = parseInt("" + options.delay);
            }
            _this._loaderPath = bootstrap_26.bootstrap.getImagePath(img);
            _this._img = new Image();
            _this._img.style.position = "absolute";
            _this._img.style.display = "none";
            _this._img.style.zIndex = "10000";
            _this._img.src = _this._loaderPath;
            _this.el.appendChild(_this._img);
            _this._isBusy = false;
            return _this;
        }
        BusyElView.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            if (!!this._timeOut) {
                clearTimeout(this._timeOut);
                this._timeOut = null;
            }
            dom.removeNode(this._img);
            _super.prototype.dispose.call(this);
        };
        BusyElView.prototype.toString = function () {
            return "BusyElView";
        };
        Object.defineProperty(BusyElView.prototype, "isBusy", {
            get: function () { return this._isBusy; },
            set: function (v) {
                var self = this, fn = function () {
                    self._timeOut = null;
                    self._img.style.display = "";
                    jquery_7.$(self._img).position({
                        "of": jquery_7.$(self.el)
                    });
                };
                if (v !== self._isBusy) {
                    self._isBusy = v;
                    if (self._isBusy) {
                        if (!!self._timeOut) {
                            clearTimeout(self._timeOut);
                            self._timeOut = null;
                        }
                        self._timeOut = setTimeout(fn, self._delay);
                    }
                    else {
                        if (!!self._timeOut) {
                            clearTimeout(self._timeOut);
                            self._timeOut = null;
                        }
                        else {
                            self._img.style.display = "none";
                        }
                    }
                    self.objEvents.raiseProp("isBusy");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BusyElView.prototype, "delay", {
            get: function () { return this._delay; },
            set: function (v) {
                if (v !== this._delay) {
                    this._delay = v;
                    this.objEvents.raiseProp("delay");
                }
            },
            enumerable: true,
            configurable: true
        });
        return BusyElView;
    }(baseview_15.BaseElView));
    exports.BusyElView = BusyElView;
    boot.registerElView("busy", BusyElView);
    boot.registerElView("busy_indicator", BusyElView);
});
define("jriapp_ui/button", ["require", "exports", "jriapp/utils/dom", "jriapp/bootstrap", "jriapp_ui/command"], function (require, exports, dom_36, bootstrap_27, command_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var boot = bootstrap_27.bootstrap, dom = dom_36.DomUtils, subscribeMap = bootstrap_27.subscribeWeakMap;
    var ButtonElView = (function (_super) {
        __extends(ButtonElView, _super);
        function ButtonElView(el, options) {
            var _this = _super.call(this, el, options) || this;
            var self = _this;
            _this._isButton = _this.el.tagName.toLowerCase() === "button";
            if (_this.isDelegationOn) {
                subscribeMap.set(el, _this);
                _this._setIsSubcribed(1);
            }
            else {
                dom.events.on(el, "click", function (e) {
                    self.handle_click(e);
                }, _this.uniqueID);
            }
            return _this;
        }
        ButtonElView.prototype.handle_click = function (e) {
            if (this.stopPropagation) {
                e.stopPropagation();
            }
            if (this.preventDefault) {
                e.preventDefault();
            }
            this.onClick();
            return this.stopPropagation;
        };
        ButtonElView.prototype.onClick = function () {
            this.invokeCommand();
        };
        ButtonElView.prototype.toString = function () {
            return "ButtonElView";
        };
        Object.defineProperty(ButtonElView.prototype, "value", {
            get: function () {
                return this._isButton ? this.el.textContent : this.el.value;
            },
            set: function (v) {
                var x = this.value;
                v = (!v) ? "" : ("" + v);
                if (x !== v) {
                    if (this._isButton) {
                        this.el.textContent = v;
                    }
                    else {
                        this.el.value = v;
                    }
                    this.objEvents.raiseProp("value");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ButtonElView.prototype, "text", {
            get: function () {
                return this.el.textContent;
            },
            set: function (v) {
                var x = this.el.textContent;
                v = (!v) ? "" : ("" + v);
                if (x !== v) {
                    this.el.textContent = v;
                    this.objEvents.raiseProp("text");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ButtonElView.prototype, "html", {
            get: function () {
                return this._isButton ? this.el.innerHTML : this.el.value;
            },
            set: function (v) {
                var x = this.html;
                v = (!v) ? "" : ("" + v);
                if (x !== v) {
                    if (this._isButton) {
                        this.el.innerHTML = v;
                    }
                    else {
                        this.el.value = v;
                    }
                    this.objEvents.raiseProp("html");
                }
            },
            enumerable: true,
            configurable: true
        });
        return ButtonElView;
    }(command_2.CommandElView));
    exports.ButtonElView = ButtonElView;
    boot.registerElView("input:button", ButtonElView);
    boot.registerElView("input:submit", ButtonElView);
    boot.registerElView("button", ButtonElView);
});
define("jriapp_ui/checkbox", ["require", "exports", "jriapp_shared", "jriapp/utils/dom", "jriapp/bootstrap", "jriapp_ui/input"], function (require, exports, jriapp_shared_37, dom_37, bootstrap_28, input_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var dom = dom_37.DomUtils, isNt = jriapp_shared_37.Utils.check.isNt, boot = bootstrap_28.bootstrap, subscribeMap = bootstrap_28.subscribeWeakMap;
    var CheckBoxElView = (function (_super) {
        __extends(CheckBoxElView, _super);
        function CheckBoxElView(chk, options) {
            var _this = _super.call(this, chk, options) || this;
            var self = _this;
            _this._checked = null;
            chk.checked = false;
            if (_this.isDelegationOn) {
                subscribeMap.set(_this.el, _this);
                _this._setIsSubcribed(2);
            }
            else {
                dom.events.on(_this.el, "change", function (e) {
                    e.stopPropagation();
                    self.handle_change(e);
                }, _this.uniqueID);
            }
            _this._updateState();
            return _this;
        }
        CheckBoxElView.prototype.handle_change = function (e) {
            var chk = this.el;
            if (this.checked !== chk.checked) {
                this.checked = chk.checked;
            }
            return true;
        };
        CheckBoxElView.prototype._updateState = function () {
            dom.setClass([this.el], "ria-checked-null", !isNt(this.checked));
        };
        CheckBoxElView.prototype._setErrors = function (el, errors) {
            var parent = el.parentElement;
            var mainEl = (!!parent && parent.tagName.toLowerCase() === "label") ? parent : el;
            _super.prototype._setErrors.call(this, mainEl, errors);
        };
        CheckBoxElView.prototype.toString = function () {
            return "CheckBoxElView";
        };
        Object.defineProperty(CheckBoxElView.prototype, "checked", {
            get: function () {
                return this._checked;
            },
            set: function (v) {
                if (this._checked !== v) {
                    this._checked = v;
                    var chk = this.el;
                    chk.checked = !!v;
                    this._updateState();
                    this.objEvents.raiseProp("checked");
                }
            },
            enumerable: true,
            configurable: true
        });
        return CheckBoxElView;
    }(input_2.InputElView));
    exports.CheckBoxElView = CheckBoxElView;
    boot.registerElView("input:checkbox", CheckBoxElView);
    boot.registerElView("checkbox", CheckBoxElView);
});
define("jriapp_ui/checkbox3", ["require", "exports", "jriapp_shared", "jriapp/utils/dom", "jriapp/bootstrap", "jriapp_ui/input"], function (require, exports, jriapp_shared_38, dom_38, bootstrap_29, input_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var isNt = jriapp_shared_38.Utils.check.isNt, dom = dom_38.DomUtils, boot = bootstrap_29.bootstrap, subscribeMap = bootstrap_29.subscribeWeakMap;
    var CheckBoxThreeStateElView = (function (_super) {
        __extends(CheckBoxThreeStateElView, _super);
        function CheckBoxThreeStateElView(chk, options) {
            var _this = _super.call(this, chk, options) || this;
            var self = _this;
            _this._checked = null;
            chk.checked = false;
            chk.indeterminate = _this._checked === null;
            if (_this.isDelegationOn) {
                subscribeMap.set(_this.el, _this);
                _this._setIsSubcribed(2);
            }
            else {
                dom.events.on(_this.el, "change", function (e) {
                    e.stopPropagation();
                    self.handle_change(e);
                }, _this.uniqueID);
            }
            _this._updateState();
            return _this;
        }
        CheckBoxThreeStateElView.prototype.handle_change = function (e) {
            if (this.checked === null) {
                this.checked = true;
            }
            else {
                this.checked = !this.checked ? null : false;
            }
            return true;
        };
        CheckBoxThreeStateElView.prototype._updateState = function () {
            dom.setClass([this.el], "ria-checked-null", !isNt(this.checked));
        };
        CheckBoxThreeStateElView.prototype._setErrors = function (el, errors) {
            var parent = el.parentElement;
            var mainEl = (!!parent && parent.tagName.toLowerCase() === "label") ? parent : el;
            _super.prototype._setErrors.call(this, mainEl, errors);
        };
        CheckBoxThreeStateElView.prototype.toString = function () {
            return "CheckBoxThreeStateElView";
        };
        Object.defineProperty(CheckBoxThreeStateElView.prototype, "checked", {
            get: function () {
                return this._checked;
            },
            set: function (v) {
                if (this._checked !== v) {
                    this._checked = v;
                    var chk = this.el;
                    chk.checked = !!v;
                    chk.indeterminate = this._checked === null;
                    this._updateState();
                    this.objEvents.raiseProp("checked");
                }
            },
            enumerable: true,
            configurable: true
        });
        return CheckBoxThreeStateElView;
    }(input_3.InputElView));
    exports.CheckBoxThreeStateElView = CheckBoxThreeStateElView;
    boot.registerElView("threeState", CheckBoxThreeStateElView);
    boot.registerElView("checkbox3", CheckBoxThreeStateElView);
});
define("jriapp_ui/expander", ["require", "exports", "jriapp/bootstrap", "jriapp_ui/anchor"], function (require, exports, bootstrap_30, anchor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var PROP_NAME;
    (function (PROP_NAME) {
        PROP_NAME["isExpanded"] = "isExpanded";
    })(PROP_NAME = exports.PROP_NAME || (exports.PROP_NAME = {}));
    var COLLAPSE_IMG = "collapse.jpg", EXPAND_IMG = "expand.jpg";
    var ExpanderElView = (function (_super) {
        __extends(ExpanderElView, _super);
        function ExpanderElView(el, options) {
            var _this = this;
            var expandedsrc = options.expandedsrc || bootstrap_30.bootstrap.getImagePath(COLLAPSE_IMG);
            var collapsedsrc = options.collapsedsrc || bootstrap_30.bootstrap.getImagePath(EXPAND_IMG);
            var isExpanded = !!options.isExpanded;
            options.imageSrc = null;
            _this = _super.call(this, el, options) || this;
            _this._expandedsrc = expandedsrc;
            _this._collapsedsrc = collapsedsrc;
            _this.isExpanded = isExpanded;
            return _this;
        }
        ExpanderElView.prototype.refresh = function () {
            if (this.getIsStateDirty()) {
                return;
            }
            this.imageSrc = this._isExpanded ? this._expandedsrc : this._collapsedsrc;
        };
        ExpanderElView.prototype._onCommandChanged = function () {
            _super.prototype._onCommandChanged.call(this);
            this.invokeCommand();
        };
        ExpanderElView.prototype.onClick = function () {
            this.isExpanded = !this.isExpanded;
        };
        ExpanderElView.prototype._getCommandParam = function () {
            return { isExpanded: this.isExpanded };
        };
        ExpanderElView.prototype.invokeCommand = function () {
            this.refresh();
            _super.prototype.invokeCommand.call(this);
        };
        ExpanderElView.prototype.toString = function () {
            return "ExpanderElView";
        };
        Object.defineProperty(ExpanderElView.prototype, "isExpanded", {
            get: function () {
                return this._isExpanded;
            },
            set: function (v) {
                if (this._isExpanded !== v) {
                    this._isExpanded = v;
                    this.invokeCommand();
                    this.objEvents.raiseProp("isExpanded");
                }
            },
            enumerable: true,
            configurable: true
        });
        return ExpanderElView;
    }(anchor_1.AnchorElView));
    exports.ExpanderElView = ExpanderElView;
    bootstrap_30.bootstrap.registerElView("expander", ExpanderElView);
});
define("jriapp_ui/hidden", ["require", "exports", "jriapp/bootstrap", "jriapp_ui/input"], function (require, exports, bootstrap_31, input_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var HiddenElView = (function (_super) {
        __extends(HiddenElView, _super);
        function HiddenElView() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        HiddenElView.prototype.toString = function () {
            return "HiddenElView";
        };
        return HiddenElView;
    }(input_4.InputElView));
    exports.HiddenElView = HiddenElView;
    bootstrap_31.bootstrap.registerElView("input:hidden", HiddenElView);
});
define("jriapp_ui/img", ["require", "exports", "jriapp/bootstrap", "jriapp_ui/baseview"], function (require, exports, bootstrap_32, baseview_16) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ImgElView = (function (_super) {
        __extends(ImgElView, _super);
        function ImgElView() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ImgElView.prototype.toString = function () {
            return "ImgElView";
        };
        Object.defineProperty(ImgElView.prototype, "src", {
            get: function () {
                return this.el.src;
            },
            set: function (v) {
                var x = this.src;
                if (x !== v) {
                    this.el.src = v;
                    this.objEvents.raiseProp("src");
                }
            },
            enumerable: true,
            configurable: true
        });
        return ImgElView;
    }(baseview_16.BaseElView));
    exports.ImgElView = ImgElView;
    bootstrap_32.bootstrap.registerElView("img", ImgElView);
});
define("jriapp_ui/radio", ["require", "exports", "jriapp_shared", "jriapp/bootstrap", "jriapp_ui/checkbox"], function (require, exports, jriapp_shared_39, bootstrap_33, checkbox_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var isNt = jriapp_shared_39.Utils.check.isNt;
    var RadioElView = (function (_super) {
        __extends(RadioElView, _super);
        function RadioElView() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        RadioElView.prototype.toString = function () {
            return "RadioElView";
        };
        Object.defineProperty(RadioElView.prototype, "value", {
            get: function () {
                return this.el.value;
            },
            set: function (v) {
                var strv = isNt(v) ? "" : ("" + v);
                if (strv !== this.value) {
                    this.el.value = strv;
                    this.objEvents.raiseProp("value");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RadioElView.prototype, "name", {
            get: function () {
                return this.el.name;
            },
            enumerable: true,
            configurable: true
        });
        return RadioElView;
    }(checkbox_1.CheckBoxElView));
    exports.RadioElView = RadioElView;
    bootstrap_33.bootstrap.registerElView("input:radio", RadioElView);
});
define("jriapp_ui/content/all", ["require", "exports", "jriapp_ui/content/basic", "jriapp_ui/content/template", "jriapp_ui/content/string", "jriapp_ui/content/multyline", "jriapp_ui/content/bool", "jriapp_ui/content/number", "jriapp_ui/content/date", "jriapp_ui/content/datetime", "jriapp_ui/content/lookup"], function (require, exports, basic_9, template_8, string_2, multyline_2, bool_2, number_2, date_2, datetime_2, lookup_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BasicContent = basic_9.BasicContent;
    exports.TemplateContent = template_8.TemplateContent;
    exports.StringContent = string_2.StringContent;
    exports.MultyLineContent = multyline_2.MultyLineContent;
    exports.BoolContent = bool_2.BoolContent;
    exports.NumberContent = number_2.NumberContent;
    exports.DateContent = date_2.DateContent;
    exports.DateTimeContent = datetime_2.DateTimeContent;
    exports.LookupContent = lookup_2.LookupContent;
});
define("jriapp_ui", ["require", "exports", "jriapp/bootstrap", "jriapp_ui/content/factory", "jriapp_ui/utils/tooltip", "jriapp_ui/utils/datepicker", "jriapp_ui/utils/errors", "jriapp_ui/dialog", "jriapp_ui/dynacontent", "jriapp_ui/datagrid/datagrid", "jriapp_ui/pager", "jriapp_ui/listbox", "jriapp_ui/stackpanel", "jriapp_ui/tabs", "jriapp_ui/baseview", "jriapp_ui/template", "jriapp_ui/dataform", "jriapp_ui/datepicker", "jriapp_ui/anchor", "jriapp_ui/block", "jriapp_ui/busy", "jriapp_ui/button", "jriapp_ui/checkbox", "jriapp_ui/checkbox3", "jriapp_ui/command", "jriapp_ui/expander", "jriapp_ui/hidden", "jriapp_ui/img", "jriapp_ui/input", "jriapp_ui/radio", "jriapp_ui/span", "jriapp_ui/textarea", "jriapp_ui/textbox", "jriapp_ui/utils/dblclick", "jriapp_ui/utils/jquery", "jriapp_ui/content/all"], function (require, exports, bootstrap_34, factory_1, tooltip_1, datepicker_1, errors_1, dialog_2, dynacontent_1, datagrid_1, pager_1, listbox_2, stackpanel_1, tabs_1, baseview_17, template_9, dataform_1, datepicker_2, anchor_2, block_1, busy_1, button_1, checkbox_2, checkbox3_1, command_3, expander_4, hidden_1, img_1, input_5, radio_1, span_2, textarea_2, textbox_5, dblclick_2, jquery_8, all_1) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DIALOG_ACTION = dialog_2.DIALOG_ACTION;
    exports.DataEditDialog = dialog_2.DataEditDialog;
    exports.DialogVM = dialog_2.DialogVM;
    exports.DynaContentElView = dynacontent_1.DynaContentElView;
    exports.DataGrid = datagrid_1.DataGrid;
    exports.DataGridColumn = datagrid_1.DataGridColumn;
    exports.DataGridRow = datagrid_1.DataGridRow;
    exports.DataGridElView = datagrid_1.DataGridElView;
    exports.ROW_POSITION = datagrid_1.ROW_POSITION;
    exports.findDataGrid = datagrid_1.findDataGrid;
    exports.getDataGrids = datagrid_1.getDataGrids;
    __export(pager_1);
    exports.ListBox = listbox_2.ListBox;
    exports.ListBoxElView = listbox_2.ListBoxElView;
    __export(stackpanel_1);
    __export(tabs_1);
    exports.BaseElView = baseview_17.BaseElView;
    exports.addToolTip = baseview_17.addToolTip;
    exports.TemplateElView = template_9.TemplateElView;
    exports.DataForm = dataform_1.DataForm;
    exports.DataFormElView = dataform_1.DataFormElView;
    exports.DatePickerElView = datepicker_2.DatePickerElView;
    exports.AnchorElView = anchor_2.AnchorElView;
    exports.BlockElView = block_1.BlockElView;
    exports.BusyElView = busy_1.BusyElView;
    exports.ButtonElView = button_1.ButtonElView;
    exports.CheckBoxElView = checkbox_2.CheckBoxElView;
    exports.CheckBoxThreeStateElView = checkbox3_1.CheckBoxThreeStateElView;
    exports.CommandElView = command_3.CommandElView;
    exports.ExpanderElView = expander_4.ExpanderElView;
    exports.HiddenElView = hidden_1.HiddenElView;
    exports.ImgElView = img_1.ImgElView;
    exports.InputElView = input_5.InputElView;
    exports.RadioElView = radio_1.RadioElView;
    exports.SpanElView = span_2.SpanElView;
    exports.TextAreaElView = textarea_2.TextAreaElView;
    exports.TextBoxElView = textbox_5.TextBoxElView;
    exports.DblClick = dblclick_2.DblClick;
    exports.JQueryUtils = jquery_8.JQueryUtils;
    exports.$ = jquery_8.$;
    __export(all_1);
    var boot = bootstrap_34.bootstrap;
    factory_1.initContentFactory();
    boot.registerSvc("ITooltipService", tooltip_1.createToolTipSvc());
    boot.registerSvc("IDatepicker", datepicker_1.createDatepickerSvc());
    boot.registerSvc("IUIErrorsService", errors_1.createUIErrorsSvc());
    boot.loadOwnStyle("jriapp_ui");
});
