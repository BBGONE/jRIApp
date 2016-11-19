var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define("jriapp_ui/content/int", ["require", "exports", "jriapp_shared"], function (require, exports, jriapp_shared_1) {
    "use strict";
    var utils = jriapp_shared_1.Utils, coreUtils = utils.core, checks = utils.check, parse = jriapp_shared_1.parser;
    exports.css = {
        content: "ria-content-field",
        required: "ria-required-field",
        checkbox: "ria-checkbox"
    };
    function parseContentAttr(content_attr) {
        var contentOptions = {
            name: null,
            templateInfo: null,
            bindingInfo: null,
            displayInfo: null,
            fieldName: null,
            options: null
        };
        var attr, temp_opts = parse.parseOptions(content_attr);
        if (temp_opts.length === 0)
            return contentOptions;
        attr = temp_opts[0];
        if (!attr.template && !!attr.fieldName) {
            var bindInfo = {
                target: null, source: null,
                targetPath: null, sourcePath: attr.fieldName,
                mode: "OneWay",
                converter: null, converterParam: null
            };
            contentOptions.bindingInfo = bindInfo;
            contentOptions.displayInfo = attr.css;
            contentOptions.fieldName = attr.fieldName;
            if (!!attr.name)
                contentOptions.name = attr.name;
            if (!!attr.options)
                contentOptions.options = attr.options;
            if (attr.readOnly !== checks.undefined)
                contentOptions.readOnly = coreUtils.parseBool(attr.readOnly);
        }
        else if (!!attr.template) {
            contentOptions.templateInfo = attr.template;
            delete attr.template;
        }
        return contentOptions;
    }
    exports.parseContentAttr = parseContentAttr;
});
define("jriapp_ui/content/basic", ["require", "exports", "jriapp_shared", "jriapp/bootstrap", "jriapp/binding", "jriapp/utils/lifetime", "jriapp_ui/content/int"], function (require, exports, jriapp_shared_2, bootstrap_1, binding_1, lifetime_1, int_1) {
    "use strict";
    var utils = jriapp_shared_2.Utils, dom = utils.dom, doc = dom.document, coreUtils = utils.core, checks = utils.check, boot = bootstrap_1.bootstrap, sys = utils.sys;
    var BasicContent = (function (_super) {
        __extends(BasicContent, _super);
        function BasicContent(options) {
            _super.call(this);
            options = coreUtils.extend({
                parentEl: null,
                contentOptions: null,
                dataContext: null,
                isEditing: false
            }, options);
            this._el = null;
            this._parentEl = options.parentEl;
            this._isEditing = !!options.isEditing;
            this._dataContext = options.dataContext;
            this._options = options.contentOptions;
            this._isReadOnly = !!this._options.readOnly;
            this._lfScope = null;
            this._target = null;
            dom.addClass([this._parentEl], int_1.css.content);
            this.init();
            this.render();
        }
        BasicContent.prototype.init = function () { };
        BasicContent.prototype.updateCss = function () {
            var displayInfo = this._options.displayInfo, el = this._parentEl, fieldInfo = this.getFieldInfo();
            if (this._isEditing && this.getIsCanBeEdited()) {
                if (!!displayInfo) {
                    if (!!displayInfo.editCss) {
                        dom.addClass([el], displayInfo.editCss);
                    }
                    if (!!displayInfo.displayCss) {
                        dom.removeClass([el], displayInfo.displayCss);
                    }
                }
                if (!!fieldInfo && !fieldInfo.isNullable) {
                    dom.addClass([el], int_1.css.required);
                }
            }
            else {
                if (!!displayInfo) {
                    if (!!displayInfo.displayCss) {
                        dom.addClass([el], displayInfo.displayCss);
                    }
                    if (!!displayInfo.editCss) {
                        dom.removeClass([el], displayInfo.editCss);
                    }
                }
                if (!!fieldInfo && !fieldInfo.isNullable) {
                    dom.removeClass([el], int_1.css.required);
                }
            }
        };
        BasicContent.prototype.getIsCanBeEdited = function () {
            if (this._isReadOnly)
                return false;
            var finf = this.getFieldInfo();
            if (!finf)
                return false;
            var editable = sys.getEditable(this._dataContext);
            return !!editable && !finf.isReadOnly && finf.fieldType !== 2;
        };
        BasicContent.prototype.createTargetElement = function () {
            var el, info = { name: null, options: null };
            if (this._isEditing && this.getIsCanBeEdited()) {
                el = doc.createElement("input");
                el.setAttribute("type", "text");
                info.options = this._options.options;
            }
            else {
                el = doc.createElement("span");
            }
            this.updateCss();
            this._el = el;
            return this.getElementView(this._el, info);
        };
        BasicContent.prototype.getBindingOption = function (bindingInfo, target, dataContext, targetPath) {
            var options = binding_1.getBindingOptions(bindingInfo, target, dataContext);
            if (this.isEditing && this.getIsCanBeEdited())
                options.mode = 2;
            else
                options.mode = 1;
            if (!!targetPath)
                options.targetPath = targetPath;
            return options;
        };
        BasicContent.prototype.getBindings = function () {
            if (!this._lfScope)
                return [];
            var arr = this._lfScope.getObjs(), res = [];
            for (var i = 0, len = arr.length; i < len; i += 1) {
                if (sys.isBinding(arr[i]))
                    res.push(arr[i]);
            }
            return res;
        };
        BasicContent.prototype.updateBindingSource = function () {
            var binding, bindings = this.getBindings();
            for (var i = 0, len = bindings.length; i < len; i += 1) {
                binding = bindings[i];
                if (!binding.isSourceFixed)
                    binding.source = this._dataContext;
            }
        };
        BasicContent.prototype.cleanUp = function () {
            if (!!this._lfScope) {
                this._lfScope.destroy();
                this._lfScope = null;
            }
            if (!!this._el) {
                dom.removeNode(this._el);
                this._el = null;
            }
            this._target = null;
        };
        BasicContent.prototype.getElementView = function (el, view_info) {
            var factory = boot.getApp().viewFactory, elView = factory.store.getElView(el);
            if (!!elView)
                return elView;
            view_info.options = coreUtils.merge({ el: el }, view_info.options);
            return factory.createElView(view_info);
        };
        BasicContent.prototype.getFieldInfo = function () {
            return this._options.fieldInfo;
        };
        BasicContent.prototype.render = function () {
            try {
                this.cleanUp();
                var bindingInfo = this._options.bindingInfo;
                if (!!bindingInfo) {
                    this._target = this.createTargetElement();
                    this._lfScope = new lifetime_1.LifeTimeScope();
                    if (!!this._target)
                        this._lfScope.addObj(this._target);
                    var options = this.getBindingOption(bindingInfo, this._target, this._dataContext, "value");
                    this._parentEl.appendChild(this._el);
                    this._lfScope.addObj(this.app.bind(options));
                }
            }
            catch (ex) {
                utils.err.reThrow(ex, this.handleError(ex, this));
            }
        };
        BasicContent.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            var displayInfo = this._options.displayInfo;
            dom.removeClass([this._parentEl], int_1.css.content);
            dom.removeClass([this._parentEl], int_1.css.required);
            if (!!displayInfo && !!displayInfo.displayCss) {
                dom.removeClass([this._parentEl], displayInfo.displayCss);
            }
            if (!!displayInfo && !!displayInfo.editCss) {
                dom.removeClass([this._parentEl], displayInfo.editCss);
            }
            this.cleanUp();
            this._parentEl = null;
            this._dataContext = null;
            this._options = null;
            _super.prototype.destroy.call(this);
        };
        BasicContent.prototype.toString = function () {
            return "BasicContent";
        };
        Object.defineProperty(BasicContent.prototype, "parentEl", {
            get: function () { return this._parentEl; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BasicContent.prototype, "target", {
            get: function () { return this._target; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BasicContent.prototype, "isEditing", {
            get: function () { return this._isEditing; },
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
            get: function () { return this._dataContext; },
            set: function (v) {
                if (this._dataContext !== v) {
                    this._dataContext = v;
                    this.updateBindingSource();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BasicContent.prototype, "app", {
            get: function () {
                return boot.getApp();
            },
            enumerable: true,
            configurable: true
        });
        return BasicContent;
    }(jriapp_shared_2.BaseObject));
    exports.BasicContent = BasicContent;
});
define("jriapp_ui/content/template", ["require", "exports", "jriapp_shared", "jriapp/bootstrap", "jriapp/template", "jriapp_ui/content/int"], function (require, exports, jriapp_shared_3, bootstrap_2, template_1, int_2) {
    "use strict";
    var utils = jriapp_shared_3.Utils, coreUtils = utils.core, dom = utils.dom, boot = bootstrap_2.bootstrap, ERROR = utils.err;
    var TemplateContent = (function (_super) {
        __extends(TemplateContent, _super);
        function TemplateContent(options) {
            _super.call(this);
            options = coreUtils.extend({
                parentEl: null,
                contentOptions: null,
                dataContext: null,
                isEditing: false,
                appName: null
            }, options);
            this._templateID = null;
            this._parentEl = options.parentEl;
            this._isEditing = options.isEditing;
            this._dataContext = options.dataContext;
            this._templateInfo = options.contentOptions.templateInfo;
            this._template = null;
            dom.addClass([this._parentEl], int_2.css.content);
            this.render();
        }
        TemplateContent.prototype.getTemplateID = function () {
            if (!this._templateInfo) {
                throw new Error(jriapp_shared_3.LocaleERRS.ERR_TEMPLATE_ID_INVALID);
            }
            var info = this._templateInfo, id = info.displayID;
            if (this._isEditing && !!info.editID) {
                id = info.editID;
            }
            if (!id) {
                id = info.editID;
            }
            if (!id)
                throw new Error(jriapp_shared_3.LocaleERRS.ERR_TEMPLATE_ID_INVALID);
            return id;
        };
        TemplateContent.prototype.createTemplate = function () {
            var template = template_1.createTemplate(this._dataContext);
            template.templateID = this._templateID;
            return template;
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
        TemplateContent.prototype.cleanUp = function () {
            if (!!this._template) {
                this._template.destroy();
                this._template = null;
                this._templateID = null;
            }
        };
        TemplateContent.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            dom.removeClass([this._parentEl], int_2.css.content);
            this.cleanUp();
            this._parentEl = null;
            this._dataContext = null;
            this._templateInfo = null;
            _super.prototype.destroy.call(this);
        };
        TemplateContent.prototype.toString = function () {
            return "TemplateContent";
        };
        Object.defineProperty(TemplateContent.prototype, "parentEl", {
            get: function () { return this._parentEl; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TemplateContent.prototype, "template", {
            get: function () { return this._template; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TemplateContent.prototype, "isEditing", {
            get: function () { return this._isEditing; },
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
            get: function () { return this._dataContext; },
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
            get: function () { return boot.getApp(); },
            enumerable: true,
            configurable: true
        });
        return TemplateContent;
    }(jriapp_shared_3.BaseObject));
    exports.TemplateContent = TemplateContent;
});
define("jriapp_ui/utils/eventbag", ["require", "exports", "jriapp_shared"], function (require, exports, jriapp_shared_4) {
    "use strict";
    var utils = jriapp_shared_4.Utils, PROP_BAG = utils.sys.PROP_BAG_NAME();
    (function (EVENT_CHANGE_TYPE) {
        EVENT_CHANGE_TYPE[EVENT_CHANGE_TYPE["None"] = 0] = "None";
        EVENT_CHANGE_TYPE[EVENT_CHANGE_TYPE["Added"] = 1] = "Added";
        EVENT_CHANGE_TYPE[EVENT_CHANGE_TYPE["Deleted"] = 2] = "Deleted";
        EVENT_CHANGE_TYPE[EVENT_CHANGE_TYPE["Updated"] = 3] = "Updated";
    })(exports.EVENT_CHANGE_TYPE || (exports.EVENT_CHANGE_TYPE = {}));
    var EVENT_CHANGE_TYPE = exports.EVENT_CHANGE_TYPE;
    var EventBag = (function (_super) {
        __extends(EventBag, _super);
        function EventBag(onChange) {
            _super.call(this);
            this._dic = null;
            this._onChange = onChange;
        }
        EventBag.prototype._isHasProp = function (prop) {
            return true;
        };
        EventBag.prototype.getProp = function (name) {
            if (!this._dic)
                return null;
            var cmd = this._dic[name];
            if (!cmd)
                return null;
            return cmd;
        };
        EventBag.prototype.setProp = function (name, command) {
            if (!this._dic && !!command)
                this._dic = {};
            if (!this._dic)
                return;
            var old = this._dic[name];
            if (!command && !!old) {
                delete this._dic[name];
                if (!!this._onChange) {
                    this._onChange(this, {
                        name: name,
                        changeType: 2,
                        oldVal: old,
                        newVal: null
                    });
                    this.raisePropertyChanged(name);
                }
                return;
            }
            this._dic[name] = command;
            if (!!this._onChange) {
                if (!old) {
                    this._onChange(this, {
                        name: name,
                        changeType: 1,
                        oldVal: null,
                        newVal: command
                    });
                }
                else {
                    this._onChange(this, {
                        name: name,
                        changeType: 3,
                        oldVal: old,
                        newVal: command
                    });
                }
                this.raisePropertyChanged(name);
            }
        };
        EventBag.prototype.trigger = function (name, args) {
            if (!this._dic)
                return;
            var command = this._dic[name];
            if (!command)
                return;
            args = args || {};
            if (command.canExecute(this, args))
                command.execute(this, args);
        };
        EventBag.prototype.toString = function () {
            return PROP_BAG;
        };
        EventBag.prototype.destroy = function () {
            if (!!this._dic) {
                this._dic = null;
            }
            this._onChange = null;
            _super.prototype.destroy.call(this);
        };
        return EventBag;
    }(jriapp_shared_4.BaseObject));
    exports.EventBag = EventBag;
});
define("jriapp_ui/utils/propbag", ["require", "exports", "jriapp_shared"], function (require, exports, jriapp_shared_5) {
    "use strict";
    var utils = jriapp_shared_5.Utils, checks = utils.check, dom = utils.dom, PROP_BAG = utils.sys.PROP_BAG_NAME();
    var PropertyBag = (function (_super) {
        __extends(PropertyBag, _super);
        function PropertyBag(el) {
            _super.call(this);
            this._el = el;
        }
        PropertyBag.prototype._isHasProp = function (prop) {
            return checks.isHasProp(this._el, prop);
        };
        PropertyBag.prototype.getProp = function (name) {
            return this._el[name];
        };
        PropertyBag.prototype.setProp = function (name, val) {
            var old = this._el[name];
            if (old !== val) {
                this._el[name] = val;
                this.raisePropertyChanged(name);
            }
        };
        PropertyBag.prototype.toString = function () {
            return PROP_BAG;
        };
        return PropertyBag;
    }(jriapp_shared_5.BaseObject));
    exports.PropertyBag = PropertyBag;
});
define("jriapp_ui/utils/cssbag", ["require", "exports", "jriapp_shared"], function (require, exports, jriapp_shared_6) {
    "use strict";
    var utils = jriapp_shared_6.Utils, checks = utils.check, dom = utils.dom, PROP_BAG = utils.sys.PROP_BAG_NAME();
    var CSSBag = (function (_super) {
        __extends(CSSBag, _super);
        function CSSBag(el) {
            _super.call(this);
            this._el = el;
        }
        CSSBag.prototype._isHasProp = function (prop) {
            return true;
        };
        CSSBag.prototype.getProp = function (name) {
            return checks.undefined;
        };
        CSSBag.prototype.setProp = function (name, val) {
            if (val === checks.undefined)
                return;
            if (name === "*") {
                if (!val) {
                    dom.removeClass([this._el], null);
                }
                else if (checks.isArray(val)) {
                    dom.setClasses([this._el], val);
                }
                else if (checks.isString(val)) {
                    dom.setClasses([this._el], val.split(" "));
                }
                return;
            }
            dom.setClass([this._el], name, !val);
        };
        CSSBag.prototype.toString = function () {
            return PROP_BAG;
        };
        return CSSBag;
    }(jriapp_shared_6.BaseObject));
    exports.CSSBag = CSSBag;
});
define("jriapp_ui/utils/tooltip", ["require", "exports", "jriapp_shared", "jriapp/utils/jquery"], function (require, exports, jriapp_shared_7, jquery_1) {
    "use strict";
    var window = jriapp_shared_7.Utils.dom.window;
    exports.css = {
        toolTip: "qtip",
        toolTipError: "qtip-red"
    };
    function createToolTipSvc() {
        return new tooltipService();
    }
    exports.createToolTipSvc = createToolTipSvc;
    var tooltipService = (function () {
        function tooltipService() {
        }
        tooltipService.prototype.addToolTip = function ($el, tip, isError, pos) {
            var options = {
                content: {
                    text: tip
                },
                style: {
                    classes: !!isError ? exports.css.toolTipError : exports.css.toolTip
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
                else
                    $el.qtip("option", "content.text", tip);
            }
            else if (!!tip) {
                $el.qtip(options);
            }
        };
        return tooltipService;
    }());
});
define("jriapp_ui/generic", ["require", "exports", "jriapp_shared", "jriapp/utils/jquery", "jriapp/utils/viewchecks", "jriapp/const", "jriapp/bootstrap", "jriapp_ui/utils/eventbag", "jriapp_ui/utils/propbag", "jriapp_ui/utils/cssbag", "jriapp_ui/utils/tooltip"], function (require, exports, jriapp_shared_8, jquery_2, viewchecks_1, const_1, bootstrap_3, eventbag_1, propbag_1, cssbag_1, tooltip_1) {
    "use strict";
    exports.EVENT_CHANGE_TYPE = eventbag_1.EVENT_CHANGE_TYPE;
    var utils = jriapp_shared_8.Utils, coreUtils = utils.core, dom = utils.dom, checks = utils.check, boot = bootstrap_3.bootstrap, viewChecks = viewchecks_1.ViewChecks;
    viewChecks.isElView = function (obj) {
        return !!obj && obj instanceof BaseElView;
    };
    boot.registerSvc(const_1.TOOLTIP_SVC, tooltip_1.createToolTipSvc());
    function fn_addToolTip($el, tip, isError, pos) {
        var svc = boot.getSvc(const_1.TOOLTIP_SVC);
        svc.addToolTip($el, tip, isError, pos);
    }
    exports.fn_addToolTip = fn_addToolTip;
    exports.css = {
        fieldError: "ria-field-error",
        commandLink: "ria-command-link",
        checkedNull: "ria-checked-null",
        disabled: "disabled",
        opacity: "opacity",
        color: "color",
        fontSize: "font-size"
    };
    exports.PROP_NAME = {
        isVisible: "isVisible",
        validationErrors: "validationErrors",
        toolTip: "toolTip",
        css: "css",
        isEnabled: "isEnabled",
        value: "value",
        command: "command",
        disabled: "disabled",
        commandParam: "commandParam",
        isBusy: "isBusy",
        delay: "delay",
        checked: "checked",
        color: "color",
        wrap: "wrap",
        text: "text",
        html: "html",
        preventDefault: "preventDefault",
        imageSrc: "imageSrc",
        glyph: "glyph",
        href: "href",
        fontSize: "fontSize",
        borderColor: "borderColor",
        borderStyle: "borderStyle",
        width: "width",
        height: "height",
        src: "src",
        click: "click"
    };
    var BaseElView = (function (_super) {
        __extends(BaseElView, _super);
        function BaseElView(options) {
            _super.call(this);
            var el = options.el;
            this._$el = jquery_2.$(el);
            this._toolTip = options.tip;
            this._eventStore = null;
            this._props = null;
            this._classes = null;
            this._display = null;
            this._css = options.css;
            this._objId = "elv" + coreUtils.getNewID();
            this._errors = null;
            if (!!this._css) {
                dom.addClass([el], this._css);
            }
            this._applyToolTip();
            this._getStore().setElView(el, this);
        }
        BaseElView.prototype._getStore = function () {
            return boot.getApp().viewFactory.store;
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
            if (this.getIsDestroyCalled())
                return;
            this.$el.on(name + "." + this.uniqueID, function (e) {
                e.stopPropagation();
                if (!!self._eventStore)
                    self._eventStore.trigger(name, e);
            });
        };
        BaseElView.prototype._onEventDeleted = function (name, oldVal) {
            this.$el.off(name + "." + this.uniqueID);
        };
        BaseElView.prototype._applyToolTip = function () {
            if (!!this._toolTip) {
                this._setToolTip(this.$el, this._toolTip);
            }
        };
        BaseElView.prototype._getErrorTipInfo = function (errors) {
            var tip = ["<b>", jriapp_shared_8.LocaleSTRS.VALIDATE.errorInfo, "</b>", "<br/>"];
            errors.forEach(function (info) {
                var res = "";
                info.errors.forEach(function (str) {
                    res = res + " " + str;
                });
                tip.push(res);
                res = "";
            });
            return tip.join("");
        };
        BaseElView.prototype._setFieldError = function (isError) {
            dom.setClass([this.el], exports.css.fieldError, !isError);
        };
        BaseElView.prototype._updateErrorUI = function (el, errors) {
            if (!el) {
                return;
            }
            var $el = this.$el;
            if (!!errors && errors.length > 0) {
                fn_addToolTip($el, this._getErrorTipInfo(errors), true);
                this._setFieldError(true);
            }
            else {
                this._setToolTip($el, this.toolTip);
                this._setFieldError(false);
            }
        };
        BaseElView.prototype._setToolTip = function ($el, tip, isError) {
            fn_addToolTip($el, tip, isError);
        };
        BaseElView.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            this._getStore().setElView(this.el, null);
            this._$el.off("." + this.uniqueID);
            this.validationErrors = null;
            this.toolTip = null;
            if (!!this._eventStore) {
                this._eventStore.destroy();
                this._eventStore = null;
            }
            if (!!this._props) {
                this._props.destroy();
                this._props = checks.undefined;
            }
            if (!!this._classes) {
                this._classes.destroy();
                this._classes = checks.undefined;
            }
            this._display = null;
            this._css = null;
            _super.prototype.destroy.call(this);
        };
        BaseElView.prototype.toString = function () {
            return "BaseElView";
        };
        Object.defineProperty(BaseElView.prototype, "$el", {
            get: function () {
                return this._$el;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseElView.prototype, "el", {
            get: function () {
                return this._$el[0];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseElView.prototype, "uniqueID", {
            get: function () { return this._objId; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseElView.prototype, "isVisible", {
            get: function () {
                var v = this.$el.css("display");
                return !(v === "none");
            },
            set: function (v) {
                v = !!v;
                if (v !== this.isVisible) {
                    if (!v) {
                        this._display = this.$el.css("display");
                        if (this._display === "none")
                            this._display = null;
                        this.$el.css("display", "none");
                    }
                    else {
                        if (!!this._display)
                            this.$el.css("display", this._display);
                        else
                            this.$el.css("display", "");
                    }
                    this.raisePropertyChanged(exports.PROP_NAME.isVisible);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseElView.prototype, "validationErrors", {
            get: function () { return this._errors; },
            set: function (v) {
                if (v !== this._errors) {
                    this._errors = v;
                    this.raisePropertyChanged(exports.PROP_NAME.validationErrors);
                    this._updateErrorUI(this.el, this._errors);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseElView.prototype, "dataName", {
            get: function () { return this._$el.attr(const_1.DATA_ATTR.DATA_NAME); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseElView.prototype, "toolTip", {
            get: function () { return this._toolTip; },
            set: function (v) {
                if (this._toolTip !== v) {
                    this._toolTip = v;
                    this._setToolTip(this.$el, v);
                    this.raisePropertyChanged(exports.PROP_NAME.toolTip);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseElView.prototype, "events", {
            get: function () {
                var _this = this;
                if (!this._eventStore) {
                    if (this.getIsDestroyCalled())
                        return null;
                    this._eventStore = new eventbag_1.EventBag(function (s, a) {
                        _this._onEventChanged(a);
                    });
                }
                return this._eventStore;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseElView.prototype, "props", {
            get: function () {
                if (!this._props) {
                    if (this.getIsDestroyCalled())
                        return checks.undefined;
                    this._props = new propbag_1.PropertyBag(this.el);
                }
                return this._props;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseElView.prototype, "classes", {
            get: function () {
                if (!this._classes) {
                    if (this.getIsDestroyCalled())
                        return checks.undefined;
                    this._classes = new cssbag_1.CSSBag(this.el);
                }
                return this._classes;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseElView.prototype, "css", {
            get: function () { return this._css; },
            set: function (v) {
                var arr = [];
                if (this._css !== v) {
                    if (!!this._css)
                        arr.push("-" + this._css);
                    this._css = v;
                    if (!!this._css)
                        arr.push("+" + this._css);
                    dom.setClasses(this._$el.toArray(), arr);
                    this.raisePropertyChanged(exports.PROP_NAME.css);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseElView.prototype, "app", {
            get: function () {
                return boot.getApp();
            },
            enumerable: true,
            configurable: true
        });
        return BaseElView;
    }(jriapp_shared_8.BaseObject));
    exports.BaseElView = BaseElView;
    boot.registerElView("generic", BaseElView);
});
define("jriapp_ui/input", ["require", "exports", "jriapp_ui/generic"], function (require, exports, generic_1) {
    "use strict";
    var InputElView = (function (_super) {
        __extends(InputElView, _super);
        function InputElView() {
            _super.apply(this, arguments);
        }
        InputElView.prototype.toString = function () {
            return "InputElView";
        };
        Object.defineProperty(InputElView.prototype, "isEnabled", {
            get: function () {
                var el = this.el;
                return !el.disabled;
            },
            set: function (v) {
                var el = this.el;
                if (v !== this.isEnabled) {
                    el.disabled = !v;
                    this.raisePropertyChanged(generic_1.PROP_NAME.isEnabled);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(InputElView.prototype, "value", {
            get: function () {
                return this.$el.val();
            },
            set: function (v) {
                var x = this.value;
                var str = "" + v;
                v = (v === null) ? "" : str;
                if (x !== v) {
                    this.$el.val(v);
                    this.raisePropertyChanged(generic_1.PROP_NAME.value);
                }
            },
            enumerable: true,
            configurable: true
        });
        return InputElView;
    }(generic_1.BaseElView));
    exports.InputElView = InputElView;
});
define("jriapp_ui/textbox", ["require", "exports", "jriapp/bootstrap", "jriapp_ui/generic", "jriapp_ui/input"], function (require, exports, bootstrap_4, generic_2, input_1) {
    "use strict";
    var TXTBOX_EVENTS = {
        keypress: "keypress"
    };
    var TextBoxElView = (function (_super) {
        __extends(TextBoxElView, _super);
        function TextBoxElView(options) {
            _super.call(this, options);
            var self = this;
            var $el = this.$el;
            $el.on("change." + this.uniqueID, function (e) {
                e.stopPropagation();
                self.raisePropertyChanged(generic_2.PROP_NAME.value);
            });
            $el.on("keypress." + this.uniqueID, function (e) {
                e.stopPropagation();
                var args = { keyCode: e.which, value: e.target.value, isCancel: false };
                self.raiseEvent(TXTBOX_EVENTS.keypress, args);
                if (args.isCancel)
                    e.preventDefault();
            });
            if (!!options.updateOnKeyUp) {
                $el.on("keyup." + this.uniqueID, function (e) {
                    e.stopPropagation();
                    self.raisePropertyChanged(generic_2.PROP_NAME.value);
                });
            }
        }
        TextBoxElView.prototype._getEventNames = function () {
            var base_events = _super.prototype._getEventNames.call(this);
            return [TXTBOX_EVENTS.keypress].concat(base_events);
        };
        TextBoxElView.prototype.addOnKeyPress = function (fn, nmspace) {
            this._addHandler(TXTBOX_EVENTS.keypress, fn, nmspace);
        };
        TextBoxElView.prototype.removeOnKeyPress = function (nmspace) {
            this._removeHandler(TXTBOX_EVENTS.keypress, nmspace);
        };
        TextBoxElView.prototype.toString = function () {
            return "TextBoxElView";
        };
        Object.defineProperty(TextBoxElView.prototype, "color", {
            get: function () {
                var $el = this.$el;
                return $el.css(generic_2.css.color);
            },
            set: function (v) {
                var $el = this.$el;
                var x = $el.css(generic_2.css.color);
                if (v !== x) {
                    $el.css(generic_2.css.color, v);
                    this.raisePropertyChanged(generic_2.PROP_NAME.color);
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
    var StringContent = (function (_super) {
        __extends(StringContent, _super);
        function StringContent() {
            _super.apply(this, arguments);
        }
        Object.defineProperty(StringContent.prototype, "_allowedKeys", {
            get: function () {
                if (!StringContent.__allowedKeys) {
                    StringContent.__allowedKeys = [0, 8, 127, 37, 39, 35, 36, 9, 27, 13];
                }
                return StringContent.__allowedKeys;
            },
            enumerable: true,
            configurable: true
        });
        StringContent.prototype.render = function () {
            _super.prototype.render.call(this);
            var self = this, fieldInfo = self.getFieldInfo();
            if (self._target instanceof textbox_1.TextBoxElView) {
                self._target.addOnKeyPress(function (sender, args) {
                    args.isCancel = !self.previewKeyPress(fieldInfo, args.keyCode, args.value);
                });
            }
        };
        StringContent.prototype.previewKeyPress = function (fieldInfo, keyCode, value) {
            if (this._allowedKeys.indexOf(keyCode) > -1)
                return true;
            return !(fieldInfo.maxLength > 0 && value.length >= fieldInfo.maxLength);
        };
        StringContent.prototype.toString = function () {
            return "StringContent";
        };
        StringContent.__allowedKeys = null;
        return StringContent;
    }(basic_1.BasicContent));
    exports.StringContent = StringContent;
});
define("jriapp_ui/textarea", ["require", "exports", "jriapp/bootstrap", "jriapp_ui/generic"], function (require, exports, bootstrap_5, generic_3) {
    "use strict";
    var TXTAREA_EVENTS = {
        keypress: "keypress"
    };
    var TextAreaElView = (function (_super) {
        __extends(TextAreaElView, _super);
        function TextAreaElView(options) {
            _super.call(this, options);
            var self = this;
            if (!!options.wrap) {
                this.wrap = options.wrap;
            }
            var $el = this.$el;
            $el.on("change." + this.uniqueID, function (e) {
                e.stopPropagation();
                self.raisePropertyChanged(generic_3.PROP_NAME.value);
            });
            $el.on("keypress." + this.uniqueID, function (e) {
                e.stopPropagation();
                var args = { keyCode: e.which, value: e.target.value, isCancel: false };
                self.raiseEvent(TXTAREA_EVENTS.keypress, args);
                if (args.isCancel)
                    e.preventDefault();
            });
            if (!!options.updateOnKeyUp) {
                $el.on("keyup." + this.uniqueID, function (e) {
                    e.stopPropagation();
                    self.raisePropertyChanged(generic_3.PROP_NAME.value);
                });
            }
        }
        TextAreaElView.prototype._getEventNames = function () {
            var base_events = _super.prototype._getEventNames.call(this);
            return [TXTAREA_EVENTS.keypress].concat(base_events);
        };
        TextAreaElView.prototype.addOnKeyPress = function (fn, nmspace) {
            this._addHandler(TXTAREA_EVENTS.keypress, fn, nmspace);
        };
        TextAreaElView.prototype.removeOnKeyPress = function (nmspace) {
            this._removeHandler(TXTAREA_EVENTS.keypress, nmspace);
        };
        TextAreaElView.prototype.toString = function () {
            return "TextAreaElView";
        };
        Object.defineProperty(TextAreaElView.prototype, "value", {
            get: function () {
                return this.$el.val();
            },
            set: function (v) {
                var x = this.$el.val();
                var str = "" + v;
                v = (v === null) ? "" : str;
                if (x !== v) {
                    this.$el.val(v);
                    this.raisePropertyChanged(generic_3.PROP_NAME.value);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextAreaElView.prototype, "isEnabled", {
            get: function () { return !this.$el.prop("disabled"); },
            set: function (v) {
                v = !!v;
                if (v !== this.isEnabled) {
                    this.$el.prop("disabled", !v);
                    this.raisePropertyChanged(generic_3.PROP_NAME.isEnabled);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TextAreaElView.prototype, "wrap", {
            get: function () {
                return this.$el.prop("wrap");
            },
            set: function (v) {
                var x = this.wrap;
                if (x !== v) {
                    this.$el.prop("wrap", v);
                    this.raisePropertyChanged(generic_3.PROP_NAME.wrap);
                }
            },
            enumerable: true,
            configurable: true
        });
        return TextAreaElView;
    }(generic_3.BaseElView));
    exports.TextAreaElView = TextAreaElView;
    bootstrap_5.bootstrap.registerElView("textarea", TextAreaElView);
});
define("jriapp_ui/content/multyline", ["require", "exports", "jriapp_shared", "jriapp_ui/textarea", "jriapp_ui/content/basic"], function (require, exports, jriapp_shared_9, textarea_1, basic_2) {
    "use strict";
    var utils = jriapp_shared_9.Utils, NAME = "multyline", strUtils = utils.str, dom = utils.dom, document = dom.document;
    var MultyLineContent = (function (_super) {
        __extends(MultyLineContent, _super);
        function MultyLineContent(options) {
            if (options.contentOptions.name !== NAME) {
                throw new Error(strUtils.format(jriapp_shared_9.LocaleERRS.ERR_ASSERTION_FAILED, strUtils.format("contentOptions.name === '{0}'", NAME)));
            }
            _super.call(this, options);
        }
        Object.defineProperty(MultyLineContent.prototype, "_allowedKeys", {
            get: function () {
                if (!MultyLineContent.__allowedKeys) {
                    MultyLineContent.__allowedKeys = [0, 8, 127, 37, 39, 35, 36, 9, 27, 13];
                }
                return MultyLineContent.__allowedKeys;
            },
            enumerable: true,
            configurable: true
        });
        MultyLineContent.prototype.createTargetElement = function () {
            var el, info = { name: null, options: null };
            if (this.isEditing && this.getIsCanBeEdited()) {
                el = document.createElement("textarea");
                info.options = this._options.options;
                info.name = null;
            }
            else {
                el = document.createElement("div");
            }
            this.updateCss();
            this._el = el;
            return this.getElementView(this._el, info);
        };
        MultyLineContent.prototype.render = function () {
            _super.prototype.render.call(this);
            var self = this, fieldInfo = self.getFieldInfo();
            if (self._target instanceof textarea_1.TextAreaElView) {
                self._target.addOnKeyPress(function (sender, args) {
                    args.isCancel = !self.previewKeyPress(fieldInfo, args.keyCode, args.value);
                });
            }
        };
        MultyLineContent.prototype.previewKeyPress = function (fieldInfo, keyCode, value) {
            if (this._allowedKeys.indexOf(keyCode) > -1)
                return true;
            return !(fieldInfo.maxLength > 0 && value.length >= fieldInfo.maxLength);
        };
        MultyLineContent.prototype.toString = function () {
            return "MultyLineContent";
        };
        MultyLineContent.__allowedKeys = null;
        return MultyLineContent;
    }(basic_2.BasicContent));
    exports.MultyLineContent = MultyLineContent;
});
define("jriapp_ui/checkbox", ["require", "exports", "jriapp_shared", "jriapp/bootstrap", "jriapp_ui/generic", "jriapp_ui/input"], function (require, exports, jriapp_shared_10, bootstrap_6, generic_4, input_2) {
    "use strict";
    var dom = jriapp_shared_10.Utils.dom, checks = jriapp_shared_10.Utils.check, boot = bootstrap_6.bootstrap;
    var CheckBoxElView = (function (_super) {
        __extends(CheckBoxElView, _super);
        function CheckBoxElView(options) {
            _super.call(this, options);
            var self = this;
            var chk = this.el;
            this._checked = null;
            chk.checked = false;
            this.$el.on("change." + this.uniqueID, function (e) {
                e.stopPropagation();
                if (self.checked !== this.checked)
                    self.checked = this.checked;
            });
            this._updateState();
        }
        CheckBoxElView.prototype._updateState = function () {
            dom.setClass(this.$el.toArray(), generic_4.css.checkedNull, !checks.isNt(this.checked));
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
                    this.raisePropertyChanged(generic_4.PROP_NAME.checked);
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
define("jriapp_ui/content/bool", ["require", "exports", "jriapp_shared", "jriapp/utils/lifetime", "jriapp_ui/checkbox", "jriapp_ui/content/int", "jriapp_ui/content/basic"], function (require, exports, jriapp_shared_11, lifetime_2, checkbox_1, int_3, basic_3) {
    "use strict";
    var dom = jriapp_shared_11.Utils.dom, doc = dom.document;
    var BoolContent = (function (_super) {
        __extends(BoolContent, _super);
        function BoolContent() {
            _super.apply(this, arguments);
        }
        BoolContent.prototype.init = function () {
            this._target = this.createTargetElement();
            var bindingInfo = this._options.bindingInfo;
            if (!!bindingInfo) {
                this.updateCss();
                this._lfScope = new lifetime_2.LifeTimeScope();
                var options = this.getBindingOption(bindingInfo, this._target, this._dataContext, "checked");
                options.mode = 2;
                this._lfScope.addObj(this.app.bind(options));
            }
        };
        BoolContent.prototype.cleanUp = function () {
        };
        BoolContent.prototype.createCheckBoxView = function () {
            var chk = document.createElement("input");
            chk.setAttribute("type", "checkbox");
            dom.addClass([chk], int_3.css.checkbox);
            var chbxView = new checkbox_1.CheckBoxElView({ el: chk });
            return chbxView;
        };
        BoolContent.prototype.createTargetElement = function () {
            var tgt = this._target;
            if (!tgt) {
                tgt = this.createCheckBoxView();
                this._el = tgt.el;
            }
            var label = doc.createElement("label");
            dom.addClass([label], int_3.css.checkbox);
            label.appendChild(this._el);
            label.appendChild(doc.createElement("span"));
            this._parentEl.appendChild(label);
            return tgt;
        };
        BoolContent.prototype.updateCss = function () {
            _super.prototype.updateCss.call(this);
            var el = this._el;
            if (this.isEditing && this.getIsCanBeEdited()) {
                el.disabled = false;
            }
            else {
                el.disabled = true;
            }
        };
        BoolContent.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            if (!!this._lfScope) {
                this._lfScope.destroy();
                this._lfScope = null;
            }
            if (!!this._target) {
                this._target.destroy();
                this._target = null;
            }
            _super.prototype.destroy.call(this);
        };
        BoolContent.prototype.render = function () {
            this.cleanUp();
            this.updateCss();
        };
        BoolContent.prototype.toString = function () {
            return "BoolContent";
        };
        return BoolContent;
    }(basic_3.BasicContent));
    exports.BoolContent = BoolContent;
});
define("jriapp_ui/content/number", ["require", "exports", "jriapp/bootstrap", "jriapp_ui/textbox", "jriapp_ui/content/basic"], function (require, exports, bootstrap_7, textbox_2, basic_4) {
    "use strict";
    var NumberContent = (function (_super) {
        __extends(NumberContent, _super);
        function NumberContent() {
            _super.apply(this, arguments);
        }
        Object.defineProperty(NumberContent.prototype, "_allowedKeys", {
            get: function () {
                if (!NumberContent.__allowedKeys) {
                    NumberContent.__allowedKeys = [0, 8, 127, 37, 39, 35, 36, 9, 27, 13];
                }
                return NumberContent.__allowedKeys;
            },
            enumerable: true,
            configurable: true
        });
        NumberContent.prototype.getBindingOption = function (bindingInfo, tgt, dctx, targetPath) {
            var options = _super.prototype.getBindingOption.call(this, bindingInfo, tgt, dctx, targetPath);
            var finf = this.getFieldInfo();
            switch (finf.dataType) {
                case 3:
                    options.converter = this.app.getConverter("integerConverter");
                    break;
                case 4:
                    options.converter = this.app.getConverter("decimalConverter");
                    break;
                default:
                    options.converter = this.app.getConverter("floatConverter");
                    break;
            }
            return options;
        };
        NumberContent.prototype.render = function () {
            _super.prototype.render.call(this);
            var self = this;
            if (self._target instanceof textbox_2.TextBoxElView) {
                self._target.addOnKeyPress(function (sender, args) {
                    args.isCancel = !self.previewKeyPress(args.keyCode, args.value);
                });
            }
        };
        NumberContent.prototype.previewKeyPress = function (keyCode, value) {
            var ch = String.fromCharCode(keyCode), digits = "1234567890", defaults = bootstrap_7.bootstrap.defaults, notAllowedChars = "~@#$%^&*()+=_";
            if (notAllowedChars.indexOf(ch) > -1)
                return false;
            if (this._allowedKeys.indexOf(keyCode) > -1)
                return true;
            if (ch === "-" && value.length === 0)
                return true;
            if (ch === defaults.decimalPoint) {
                if (value.length === 0)
                    return false;
                else
                    return value.indexOf(ch) < 0;
            }
            if (ch === defaults.thousandSep)
                return true;
            else
                return digits.indexOf(ch) > -1;
        };
        NumberContent.prototype.toString = function () {
            return "NumberContent";
        };
        NumberContent.__allowedKeys = null;
        return NumberContent;
    }(basic_4.BasicContent));
    exports.NumberContent = NumberContent;
});
define("jriapp_ui/content/date", ["require", "exports", "jriapp_shared", "jriapp_ui/content/basic"], function (require, exports, jriapp_shared_12, basic_5) {
    "use strict";
    var utils = jriapp_shared_12.Utils, strUtils = utils.str, doc = utils.dom.document;
    var NAME = "datepicker";
    var DateContent = (function (_super) {
        __extends(DateContent, _super);
        function DateContent(options) {
            if (options.contentOptions.name !== NAME) {
                throw new Error(strUtils.format(jriapp_shared_12.LocaleERRS.ERR_ASSERTION_FAILED, strUtils.format("contentOptions.name === '{0}'", NAME)));
            }
            _super.call(this, options);
        }
        DateContent.prototype.getBindingOption = function (bindingInfo, tgt, dctx, targetPath) {
            var options = _super.prototype.getBindingOption.call(this, bindingInfo, tgt, dctx, targetPath);
            options.converter = this.app.getConverter("dateConverter");
            return options;
        };
        DateContent.prototype.createTargetElement = function () {
            var el, info = { name: null, options: null };
            if (this.isEditing && this.getIsCanBeEdited()) {
                el = doc.createElement("input");
                el.setAttribute("type", "text");
                info.options = this._options.options;
                info.name = NAME;
            }
            else {
                el = doc.createElement("span");
            }
            this.updateCss();
            this._el = el;
            return this.getElementView(this._el, info);
        };
        DateContent.prototype.toString = function () {
            return "DateContent";
        };
        return DateContent;
    }(basic_5.BasicContent));
    exports.DateContent = DateContent;
});
define("jriapp_ui/content/datetime", ["require", "exports", "jriapp/bootstrap", "jriapp_ui/content/basic"], function (require, exports, bootstrap_8, basic_6) {
    "use strict";
    var DateTimeContent = (function (_super) {
        __extends(DateTimeContent, _super);
        function DateTimeContent() {
            _super.apply(this, arguments);
        }
        DateTimeContent.prototype.getBindingOption = function (bindingInfo, tgt, dctx, targetPath) {
            var options = _super.prototype.getBindingOption.call(this, bindingInfo, tgt, dctx, targetPath);
            options.converter = this.app.getConverter("dateTimeConverter");
            var finf = this.getFieldInfo(), defaults = bootstrap_8.bootstrap.defaults;
            switch (finf.dataType) {
                case 6:
                    options.converterParam = defaults.dateTimeFormat;
                    break;
                case 7:
                    options.converterParam = defaults.dateFormat;
                    break;
                case 8:
                    options.converterParam = defaults.timeFormat;
                    break;
                default:
                    options.converterParam = null;
                    break;
            }
            return options;
        };
        DateTimeContent.prototype.toString = function () {
            return "DateTimeContent";
        };
        return DateTimeContent;
    }(basic_6.BasicContent));
    exports.DateTimeContent = DateTimeContent;
});
define("jriapp_ui/listbox", ["require", "exports", "jriapp_shared", "jriapp/utils/jquery", "jriapp/bootstrap", "jriapp_ui/generic"], function (require, exports, jriapp_shared_13, jquery_3, bootstrap_9, generic_5) {
    "use strict";
    var utils = jriapp_shared_13.Utils, doc = utils.dom.document, sys = utils.sys, checks = utils.check, strUtils = utils.str, coreUtils = utils.core, boot = bootstrap_9.bootstrap, parse = jriapp_shared_13.parser;
    var PROP_NAME = {
        dataSource: "dataSource",
        selectedItem: "selectedItem",
        selectedValue: "selectedValue",
        valuePath: "valuePath",
        textPath: "textPath",
        isEnabled: "isEnabled",
        listBox: "listBox",
        value: "value",
        textProvider: "textProvider",
        stateProvider: "stateProvider"
    };
    var LISTBOX_EVENTS = {
        refreshed: "refreshed"
    };
    var ListBox = (function (_super) {
        __extends(ListBox, _super);
        function ListBox(options) {
            _super.call(this);
            var self = this;
            options = coreUtils.extend({
                el: null,
                dataSource: null,
                valuePath: null,
                textPath: null,
                statePath: null
            }, options);
            if (!!options.dataSource && !sys.isCollection(options.dataSource))
                throw new Error(jriapp_shared_13.LocaleERRS.ERR_LISTBOX_DATASRC_INVALID);
            this._$el = jquery_3.$(options.el);
            this._options = options;
            this._objId = "lst" + coreUtils.getNewID();
            this._$el.on("change." + this._objId, function (e) {
                e.stopPropagation();
                if (self._isRefreshing)
                    return;
                self._onChanged();
            });
            this._textProvider = null;
            this._stateProvider = null;
            this._isRefreshing = false;
            this._selectedItem = null;
            this._prevSelected = null;
            this._keyMap = {};
            this._valMap = {};
            this._savedValue = checks.undefined;
            this._tempValue = checks.undefined;
            var ds = this._options.dataSource;
            this._options.dataSource = null;
            this.dataSource = ds;
            this._fn_state = function (item) {
                if (!self._stateProvider)
                    return;
                var data = self._keyMap[item._key];
                if (!data)
                    return;
                var path = self.statePath, val = !path ? null : parse.resolvePath(item, path);
                data.op.className = self._stateProvider.getCSS(item, data.op.index, val);
            };
        }
        ListBox.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            this._unbindDS();
            this._$el.off("." + this._objId);
            this._clear(true);
            this._$el = null;
            this._tempValue = checks.undefined;
            this._selectedItem = null;
            this._prevSelected = null;
            this._savedValue = null;
            this._options = {};
            this._textProvider = null;
            this._stateProvider = null;
            _super.prototype.destroy.call(this);
        };
        ListBox.prototype._getEventNames = function () {
            var base_events = _super.prototype._getEventNames.call(this);
            var events = Object.keys(LISTBOX_EVENTS).map(function (key, i, arr) { return LISTBOX_EVENTS[key]; });
            return events.concat(base_events);
        };
        ListBox.prototype.addOnRefreshed = function (fn, nmspace, context) {
            this._addHandler(LISTBOX_EVENTS.refreshed, fn, nmspace, context);
        };
        ListBox.prototype.removeOnRefreshed = function (nmspace) {
            this._removeHandler(LISTBOX_EVENTS.refreshed, nmspace);
        };
        ListBox.prototype._onChanged = function () {
            var op = null, key, data;
            if (this.el.selectedIndex >= 0) {
                op = this.el.options[this.el.selectedIndex];
                key = op.value;
                data = this._keyMap[key];
            }
            if (!data && !!this._selectedItem) {
                this.selectedItem = null;
            }
            else if (data.item !== this._selectedItem) {
                this.selectedItem = data.item;
            }
        };
        ListBox.prototype._getStringValue = function (item) {
            var v = this._getValue(item);
            if (checks.isNt(v))
                return "";
            return "" + v;
        };
        ListBox.prototype._getValue = function (item) {
            if (!item)
                return null;
            if (!!this._options.valuePath) {
                return jriapp_shared_13.parser.resolvePath(item, this._options.valuePath);
            }
            else
                return checks.undefined;
        };
        ListBox.prototype._getText = function (item, index) {
            var res = "";
            if (!item)
                return res;
            if (!!this._options.textPath) {
                var t = jriapp_shared_13.parser.resolvePath(item, this._options.textPath);
                if (checks.isNt(t))
                    return "";
                res = "" + t;
            }
            else {
                res = this._getStringValue(item);
            }
            if (!this._textProvider)
                return res;
            res = this._textProvider.getText(item, index, res);
            return res;
        };
        ListBox.prototype._onDSCollectionChanged = function (sender, args) {
            var self = this, data;
            switch (args.changeType) {
                case 2:
                    {
                        this._refresh();
                    }
                    break;
                case 1:
                    args.items.forEach(function (item) {
                        self._addOption(item, item._aspect.isNew);
                    });
                    break;
                case 0:
                    args.items.forEach(function (item) {
                        self._removeOption(item);
                    });
                    if (!!self._textProvider)
                        self._resetText();
                    break;
                case 3:
                    {
                        data = self._keyMap[args.old_key];
                        if (!!data) {
                            delete self._keyMap[args.old_key];
                            self._keyMap[args.new_key] = data;
                            data.op.value = args.new_key;
                        }
                    }
                    break;
            }
        };
        ListBox.prototype._onEdit = function (item, isBegin, isCanceled) {
            var self = this, key, data, oldVal, val;
            if (isBegin) {
                this._savedValue = this._getStringValue(item);
            }
            else {
                oldVal = this._savedValue;
                this._savedValue = checks.undefined;
                if (!isCanceled) {
                    key = item._key;
                    data = self._keyMap[key];
                    if (!!data) {
                        data.op.text = self._getText(item, data.op.index);
                        val = this._getStringValue(item);
                        if (oldVal !== val) {
                            if (!!oldVal) {
                                delete self._valMap[oldVal];
                            }
                            if (!!val) {
                                self._valMap[val] = data;
                            }
                        }
                    }
                    else {
                        if (!!oldVal) {
                            delete self._valMap[oldVal];
                        }
                    }
                }
            }
        };
        ListBox.prototype._onStatusChanged = function (item, oldStatus) {
            var newStatus = item._aspect.status;
            if (newStatus === 3) {
                this._removeOption(item);
                if (!!this._textProvider)
                    this._resetText();
            }
        };
        ListBox.prototype._onCommitChanges = function (item, isBegin, isRejected, status) {
            var self = this, oldVal, val, data;
            if (isBegin) {
                if (isRejected && status === 1) {
                    return;
                }
                else if (!isRejected && status === 3) {
                    return;
                }
                this._savedValue = this._getStringValue(item);
            }
            else {
                oldVal = this._savedValue;
                this._savedValue = checks.undefined;
                if (isRejected && status === 3) {
                    this._addOption(item, true);
                    return;
                }
                val = this._getStringValue(item);
                data = self._keyMap[item._key];
                if (oldVal !== val) {
                    if (oldVal !== "") {
                        delete self._valMap[oldVal];
                    }
                    if (!!data && val !== "") {
                        self._valMap[val] = data;
                    }
                }
                if (!!data) {
                    data.op.text = self._getText(item, data.op.index);
                }
            }
        };
        ListBox.prototype._bindDS = function () {
            var self = this, ds = this.dataSource;
            if (!ds)
                return;
            ds.addOnCollChanged(self._onDSCollectionChanged, self._objId, self);
            ds.addOnBeginEdit(function (sender, args) {
                self._onEdit(args.item, true, false);
            }, self._objId);
            ds.addOnEndEdit(function (sender, args) {
                self._onEdit(args.item, false, args.isCanceled);
            }, self._objId);
            ds.addOnStatusChanged(function (sender, args) {
                self._onStatusChanged(args.item, args.oldStatus);
            }, self._objId);
            ds.addOnCommitChanges(function (sender, args) {
                self._onCommitChanges(args.item, args.isBegin, args.isRejected, args.status);
            }, self._objId);
        };
        ListBox.prototype._unbindDS = function () {
            var self = this, ds = this.dataSource;
            if (!ds)
                return;
            ds.removeNSHandlers(self._objId);
        };
        ListBox.prototype._addOption = function (item, first) {
            if (this._isDestroyCalled)
                return null;
            var oOption, key = "", val, text;
            if (!!item) {
                key = item._key;
            }
            if (!!this._keyMap[key]) {
                return null;
            }
            var selEl = this.el;
            text = this._getText(item, selEl.options.length);
            val = this._getStringValue(item);
            oOption = doc.createElement("option");
            oOption.text = text;
            oOption.value = key;
            var data = { item: item, op: oOption };
            this._keyMap[key] = data;
            if (!!val)
                this._valMap[val] = data;
            if (!!first) {
                if (selEl.options.length < 2)
                    selEl.add(oOption, null);
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
                    item.addOnPropertyChange(this.statePath, this._fn_state, this._objId);
                }
                this._fn_state(item);
            }
            return oOption;
        };
        ListBox.prototype._mapByValue = function () {
            var self = this;
            this._valMap = {};
            coreUtils.forEachProp(this._keyMap, function (key) {
                var data = self._keyMap[key], val = self._getStringValue(data.item);
                if (!!val)
                    self._valMap[val] = data;
            });
        };
        ListBox.prototype._resetText = function () {
            var self = this;
            coreUtils.forEachProp(this._keyMap, function (key) {
                var data = self._keyMap[key];
                data.op.text = self._getText(data.item, data.op.index);
            });
        };
        ListBox.prototype._removeOption = function (item) {
            if (this._isDestroyCalled)
                return;
            var key = "", data, val;
            if (!!item) {
                key = item._key;
                data = this._keyMap[key];
                if (!data) {
                    return;
                }
                item.removeNSHandlers(this._objId);
                this.el.remove(data.op.index);
                val = this._getStringValue(item);
                delete this._keyMap[key];
                if (!!val)
                    delete this._valMap[val];
                if (this._prevSelected === item) {
                    this._prevSelected = null;
                }
                if (this.selectedItem === item) {
                    this.selectedItem = this._prevSelected;
                }
            }
        };
        ListBox.prototype._clear = function (isDestroy) {
            var self = this;
            coreUtils.forEachProp(this._keyMap, function (key) {
                var data = self._keyMap[key];
                if (!!data.item)
                    data.item.removeNSHandlers(self._objId);
            });
            this.el.options.length = 0;
            this._keyMap = {};
            this._valMap = {};
            this._prevSelected = null;
            if (!isDestroy) {
                this._addOption(null, false);
                this.selectedItem = null;
            }
            else
                this.selectedItem = null;
        };
        ListBox.prototype._refresh = function () {
            var self = this, ds = this.dataSource, oldItem = this._selectedItem, tmp = self._tempValue;
            this._isRefreshing = true;
            try {
                this.clear();
                if (!!ds) {
                    ds.forEach(function (item) {
                        self._addOption(item, false);
                    });
                    if (checks.isUndefined(tmp)) {
                        self.el.selectedIndex = self._findItemIndex(oldItem);
                    }
                    else {
                        oldItem = self.findItemByValue(tmp);
                        self.selectedItem = oldItem;
                        if (!oldItem)
                            self._tempValue = tmp;
                        else
                            self._tempValue = checks.undefined;
                    }
                }
            }
            finally {
                self._isRefreshing = false;
            }
            self._onChanged();
            this.raiseEvent(LISTBOX_EVENTS.refreshed, {});
        };
        ListBox.prototype._findItemIndex = function (item) {
            if (!item || item.getIsDestroyCalled())
                return 0;
            var data = this._keyMap[item._key];
            if (!data)
                return 0;
            return data.op.index;
        };
        ListBox.prototype._setIsEnabled = function (el, v) {
            el.disabled = !v;
        };
        ListBox.prototype._getIsEnabled = function (el) {
            return !el.disabled;
        };
        ListBox.prototype.clear = function () {
            this._clear(false);
        };
        ListBox.prototype.findItemByValue = function (val) {
            if (checks.isNt(val))
                return null;
            val = "" + val;
            var data = this._valMap[val];
            if (!data)
                return null;
            return data.item;
        };
        ListBox.prototype.getTextByValue = function (val) {
            if (checks.isNt(val))
                return "";
            val = "" + val;
            var data = this._valMap[val];
            if (!data)
                return "";
            else
                return data.op.text;
        };
        ListBox.prototype.toString = function () {
            return "ListBox";
        };
        Object.defineProperty(ListBox.prototype, "dataSource", {
            get: function () { return this._options.dataSource; },
            set: function (v) {
                if (this.dataSource !== v) {
                    if (!!this.dataSource) {
                        this._tempValue = this.selectedValue;
                        this._unbindDS();
                    }
                    this._options.dataSource = v;
                    if (!!this.dataSource) {
                        this._bindDS();
                    }
                    this._refresh();
                    if (!!this.dataSource)
                        this._tempValue = checks.undefined;
                    this.raisePropertyChanged(PROP_NAME.dataSource);
                    this.raisePropertyChanged(PROP_NAME.selectedItem);
                    this.raisePropertyChanged(PROP_NAME.selectedValue);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBox.prototype, "selectedValue", {
            get: function () {
                if (!!this.dataSource)
                    return this._getValue(this.selectedItem);
                else
                    return checks.undefined;
            },
            set: function (v) {
                var self = this;
                if (!!this.dataSource) {
                    if (this.selectedValue !== v) {
                        var item = self.findItemByValue(v);
                        self.selectedItem = item;
                        if (!checks.isUndefined(v) && !item)
                            self._tempValue = v;
                        else
                            self._tempValue = checks.undefined;
                    }
                }
                else {
                    if (this._tempValue !== v) {
                        this._selectedItem = null;
                        this._tempValue = v;
                        this.raisePropertyChanged(PROP_NAME.selectedItem);
                        this.raisePropertyChanged(PROP_NAME.selectedValue);
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBox.prototype, "selectedItem", {
            get: function () {
                if (!!this.dataSource)
                    return this._selectedItem;
                else
                    return checks.undefined;
            },
            set: function (v) {
                if (this._selectedItem !== v) {
                    if (!!this._selectedItem) {
                        this._prevSelected = this._selectedItem;
                    }
                    this._selectedItem = v;
                    this.el.selectedIndex = this._findItemIndex(this._selectedItem);
                    this.raisePropertyChanged(PROP_NAME.selectedItem);
                    this.raisePropertyChanged(PROP_NAME.selectedValue);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBox.prototype, "valuePath", {
            get: function () { return this._options.valuePath; },
            set: function (v) {
                if (v !== this.valuePath) {
                    this._options.valuePath = v;
                    this._mapByValue();
                    this.raisePropertyChanged(PROP_NAME.valuePath);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBox.prototype, "textPath", {
            get: function () { return this._options.textPath; },
            set: function (v) {
                if (v !== this.textPath) {
                    this._options.textPath = v;
                    this._resetText();
                    this.raisePropertyChanged(PROP_NAME.textPath);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBox.prototype, "statePath", {
            get: function () { return this._options.statePath; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBox.prototype, "isEnabled", {
            get: function () { return this._getIsEnabled(this.el); },
            set: function (v) {
                if (v !== this.isEnabled) {
                    this._setIsEnabled(this.el, v);
                    this.raisePropertyChanged(PROP_NAME.isEnabled);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBox.prototype, "textProvider", {
            get: function () { return this._textProvider; },
            set: function (v) {
                if (v !== this._textProvider) {
                    this._textProvider = v;
                    this.raisePropertyChanged(PROP_NAME.textProvider);
                    this._resetText();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBox.prototype, "stateProvider", {
            get: function () { return this._stateProvider; },
            set: function (v) {
                if (v !== this._stateProvider) {
                    this._stateProvider = v;
                    this.raisePropertyChanged(PROP_NAME.stateProvider);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBox.prototype, "el", {
            get: function () { return this._options.el; },
            enumerable: true,
            configurable: true
        });
        return ListBox;
    }(jriapp_shared_13.BaseObject));
    exports.ListBox = ListBox;
    var ListBoxElView = (function (_super) {
        __extends(ListBoxElView, _super);
        function ListBoxElView(options) {
            _super.call(this, options);
            var self = this;
            self._listBox = new ListBox(options);
            self._listBox.addOnDestroyed(function () {
                self._listBox = null;
                self.raisePropertyChanged(PROP_NAME.listBox);
            }, this.uniqueID);
            self._listBox.addOnPropertyChange("*", function (sender, args) {
                switch (args.property) {
                    case PROP_NAME.dataSource:
                    case PROP_NAME.isEnabled:
                    case PROP_NAME.selectedValue:
                    case PROP_NAME.selectedItem:
                    case PROP_NAME.valuePath:
                    case PROP_NAME.textPath:
                    case PROP_NAME.textProvider:
                    case PROP_NAME.stateProvider:
                        self.raisePropertyChanged(args.property);
                        break;
                }
            }, self.uniqueID);
        }
        ListBoxElView.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            if (!!this._listBox && !this._listBox.getIsDestroyCalled()) {
                this._listBox.destroy();
            }
            this._listBox = null;
            _super.prototype.destroy.call(this);
        };
        ListBoxElView.prototype.toString = function () {
            return "ListBoxElView";
        };
        Object.defineProperty(ListBoxElView.prototype, "isEnabled", {
            get: function () { return !this.$el.prop("disabled"); },
            set: function (v) {
                v = !!v;
                if (v !== this.isEnabled) {
                    this.$el.prop("disabled", !v);
                    this.raisePropertyChanged(PROP_NAME.isEnabled);
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
                if (this.getIsDestroyCalled())
                    return checks.undefined;
                return this._listBox.selectedValue;
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
                if (this.getIsDestroyCalled())
                    return checks.undefined;
                return this._listBox.selectedItem;
            },
            set: function (v) {
                this._listBox.selectedItem = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBoxElView.prototype, "valuePath", {
            get: function () { return this._listBox.valuePath; },
            set: function (v) {
                this._listBox.valuePath = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBoxElView.prototype, "textPath", {
            get: function () { return this._listBox.textPath; },
            set: function (v) {
                this._listBox.textPath = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBoxElView.prototype, "textProvider", {
            get: function () { return this._listBox.textProvider; },
            set: function (v) {
                this._listBox.textProvider = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBoxElView.prototype, "stateProvider", {
            get: function () { return this._listBox.stateProvider; },
            set: function (v) {
                this._listBox.stateProvider = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListBoxElView.prototype, "listBox", {
            get: function () { return this._listBox; },
            enumerable: true,
            configurable: true
        });
        return ListBoxElView;
    }(generic_5.BaseElView));
    exports.ListBoxElView = ListBoxElView;
    boot.registerElView("select", ListBoxElView);
});
define("jriapp_ui/span", ["require", "exports", "jriapp/bootstrap", "jriapp_ui/generic"], function (require, exports, bootstrap_10, generic_6) {
    "use strict";
    var SpanElView = (function (_super) {
        __extends(SpanElView, _super);
        function SpanElView() {
            _super.apply(this, arguments);
        }
        SpanElView.prototype.toString = function () {
            return "SpanElView";
        };
        Object.defineProperty(SpanElView.prototype, "text", {
            get: function () { return this.$el.text(); },
            set: function (v) {
                var $el = this.$el, x = $el.text();
                var str = "" + v;
                v = v === null ? "" : str;
                if (x !== v) {
                    $el.text(v);
                    this.raisePropertyChanged(generic_6.PROP_NAME.text);
                    this.raisePropertyChanged(generic_6.PROP_NAME.value);
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
            get: function () { return this.$el.html(); },
            set: function (v) {
                var x = this.$el.html();
                var str = "" + v;
                v = v === null ? "" : str;
                if (x !== v) {
                    this.$el.html(v);
                    this.raisePropertyChanged(generic_6.PROP_NAME.html);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SpanElView.prototype, "color", {
            get: function () {
                var $el = this.$el;
                return $el.css(generic_6.css.color);
            },
            set: function (v) {
                var $el = this.$el;
                var x = $el.css(generic_6.css.color);
                if (v !== x) {
                    $el.css(generic_6.css.color, v);
                    this.raisePropertyChanged(generic_6.PROP_NAME.color);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SpanElView.prototype, "fontSize", {
            get: function () {
                var $el = this.$el;
                return $el.css(generic_6.css.fontSize);
            },
            set: function (v) {
                var $el = this.$el;
                var x = $el.css(generic_6.css.fontSize);
                if (v !== x) {
                    $el.css(generic_6.css.fontSize, v);
                    this.raisePropertyChanged(generic_6.PROP_NAME.fontSize);
                }
            },
            enumerable: true,
            configurable: true
        });
        return SpanElView;
    }(generic_6.BaseElView));
    exports.SpanElView = SpanElView;
    bootstrap_10.bootstrap.registerElView("span", SpanElView);
});
define("jriapp_ui/content/listbox", ["require", "exports", "jriapp_shared", "jriapp/bootstrap", "jriapp_ui/listbox", "jriapp_ui/span", "jriapp_ui/content/basic"], function (require, exports, jriapp_shared_14, bootstrap_11, listbox_1, span_1, basic_7) {
    "use strict";
    var utils = jriapp_shared_14.Utils, dom = utils.dom, doc = dom.document, checks = utils.check, strUtils = utils.str, coreUtils = utils.core;
    var PROP_NAME = {
        dataSource: "dataSource",
        selectedItem: "selectedItem",
        selectedValue: "selectedValue",
        valuePath: "valuePath",
        textPath: "textPath",
        isEnabled: "isEnabled",
        listBox: "listBox",
        value: "value",
        textProvider: "textProvider",
        stateProvider: "stateProvider"
    };
    var LOOKUP_EVENTS = {
        obj_created: "object_created",
        obj_needed: "object_needed"
    };
    var LookupContent = (function (_super) {
        __extends(LookupContent, _super);
        function LookupContent(options) {
            if (options.contentOptions.name !== "lookup") {
                throw new Error(strUtils.format(jriapp_shared_14.LocaleERRS.ERR_ASSERTION_FAILED, "contentOptions.name === 'lookup'"));
            }
            _super.call(this, options);
            this._spanView = null;
            this._listBoxElView = null;
            this._isListBoxCachedExternally = false;
            this._valBinding = null;
            this._listBinding = null;
            this._value = null;
            this._objId = "lku" + coreUtils.getNewID();
        }
        LookupContent.prototype.init = function () {
            if (!!this._options.initContentFn) {
                this._options.initContentFn(this);
            }
        };
        LookupContent.prototype._getEventNames = function () {
            var base_events = _super.prototype._getEventNames.call(this);
            return [LOOKUP_EVENTS.obj_created, LOOKUP_EVENTS.obj_needed].concat(base_events);
        };
        LookupContent.prototype.addOnObjectCreated = function (fn, nmspace) {
            this._addHandler(LOOKUP_EVENTS.obj_created, fn, nmspace);
        };
        LookupContent.prototype.removeOnObjectCreated = function (nmspace) {
            this._removeHandler(LOOKUP_EVENTS.obj_created, nmspace);
        };
        LookupContent.prototype.addOnObjectNeeded = function (fn, nmspace) {
            this._addHandler(LOOKUP_EVENTS.obj_needed, fn, nmspace);
        };
        LookupContent.prototype.removeOnObjectNeeded = function (nmspace) {
            this._removeHandler(LOOKUP_EVENTS.obj_needed, nmspace);
        };
        LookupContent.prototype.getListBoxElView = function () {
            if (!!this._listBoxElView)
                return this._listBoxElView;
            var lookUpOptions = this._options.options, objectKey = "listBoxElView";
            var args1 = { objectKey: objectKey, object: null };
            this.raiseEvent(LOOKUP_EVENTS.obj_needed, args1);
            if (!!args1.object) {
                this._isListBoxCachedExternally = true;
                this._listBoxElView = args1.object;
            }
            if (!!this._listBoxElView) {
                this._listBoxElView.listBox.addOnRefreshed(this.onListRefreshed, this.uniqueID, this);
                return this._listBoxElView;
            }
            var listBoxElView = this.createListBoxElView(lookUpOptions);
            var args2 = { objectKey: objectKey, object: listBoxElView, isCachedExternally: false };
            this.raiseEvent(LOOKUP_EVENTS.obj_created, args2);
            this._isListBoxCachedExternally = args2.isCachedExternally;
            this._listBoxElView = listBoxElView;
            this._listBoxElView.listBox.addOnRefreshed(this.onListRefreshed, this.uniqueID, this);
            return this._listBoxElView;
        };
        LookupContent.prototype.onListRefreshed = function () {
            this.updateTextValue();
        };
        LookupContent.prototype.createListBoxElView = function (lookUpOptions) {
            var options = {
                valuePath: lookUpOptions.valuePath,
                textPath: lookUpOptions.textPath,
                statePath: (!lookUpOptions.statePath) ? null : lookUpOptions.statePath,
                el: doc.createElement("select")
            }, el = options.el, dataSource = jriapp_shared_14.parser.resolvePath(this.app, lookUpOptions.dataSource);
            el.setAttribute("size", "1");
            var elView = new listbox_1.ListBoxElView(options);
            elView.dataSource = dataSource;
            return elView;
        };
        LookupContent.prototype.updateTextValue = function () {
            var spanView = this.getSpanView();
            spanView.value = this.getLookupText();
        };
        LookupContent.prototype.getLookupText = function () {
            var listBoxView = this.getListBoxElView();
            return listBoxView.listBox.getTextByValue(this.value);
        };
        LookupContent.prototype.getSpanView = function () {
            if (!!this._spanView) {
                return this._spanView;
            }
            var el = doc.createElement("span"), displayInfo = this._options.displayInfo;
            if (!!displayInfo && !!displayInfo.displayCss) {
                dom.addClass([el], displayInfo.displayCss);
            }
            var spanView = new span_1.SpanElView({ el: el });
            this._spanView = spanView;
            return this._spanView;
        };
        LookupContent.prototype.render = function () {
            this.cleanUp();
            this.createTargetElement();
            this._parentEl.appendChild(this._el);
        };
        LookupContent.prototype.createTargetElement = function () {
            var tgt, el, selectView, spanView;
            if (this.isEditing && this.getIsCanBeEdited()) {
                selectView = this.getListBoxElView();
                this._listBinding = this.bindToList(selectView);
                tgt = selectView;
            }
            else {
                spanView = this.getSpanView();
                this._valBinding = this.bindToValue();
                tgt = spanView;
            }
            this._el = tgt.el;
            this.updateCss();
            return tgt;
        };
        LookupContent.prototype.cleanUp = function () {
            if (!!this._el) {
                dom.removeNode(this._el);
                this._el = null;
            }
            if (!!this._listBinding) {
                this._listBinding.destroy();
                this._listBinding = null;
            }
            if (!!this._valBinding) {
                this._valBinding.destroy();
                this._valBinding = null;
            }
            if (!!this._listBoxElView && this._isListBoxCachedExternally) {
                if (!this._listBoxElView.getIsDestroyCalled())
                    this._listBoxElView.listBox.removeOnRefreshed(this.uniqueID);
                this._listBoxElView = null;
            }
        };
        LookupContent.prototype.updateBindingSource = function () {
            if (!!this._valBinding) {
                this._valBinding.source = this._dataContext;
            }
            if (!!this._listBinding) {
                this._listBinding.source = this._dataContext;
            }
        };
        LookupContent.prototype.bindToValue = function () {
            if (!this._options.fieldName)
                return null;
            var options = {
                target: this, source: this._dataContext,
                targetPath: PROP_NAME.value, sourcePath: this._options.fieldName,
                mode: 1,
                converter: null, converterParam: null, isSourceFixed: false
            };
            return this.app.bind(options);
        };
        LookupContent.prototype.bindToList = function (selectView) {
            if (!this._options.fieldName)
                return null;
            var options = {
                target: selectView, source: this._dataContext,
                targetPath: PROP_NAME.selectedValue, sourcePath: this._options.fieldName,
                mode: 2,
                converter: null, converterParam: null, isSourceFixed: false
            };
            return this.app.bind(options);
        };
        LookupContent.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            this.cleanUp();
            if (!!this._listBoxElView && !this._listBoxElView.getIsDestroyCalled()) {
                this._listBoxElView.listBox.removeOnRefreshed(this.uniqueID);
                if (!this._isListBoxCachedExternally)
                    this._listBoxElView.destroy();
            }
            this._listBoxElView = null;
            if (!!this._spanView) {
                this._spanView.destroy();
            }
            this._spanView = null;
            _super.prototype.destroy.call(this);
        };
        LookupContent.prototype.toString = function () {
            return "LookupContent";
        };
        Object.defineProperty(LookupContent.prototype, "value", {
            get: function () { return this._value; },
            set: function (v) {
                if (this._value !== v) {
                    this._value = v;
                    this.raisePropertyChanged(PROP_NAME.value);
                }
                this.updateTextValue();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LookupContent.prototype, "uniqueID", {
            get: function () { return this._objId; },
            enumerable: true,
            configurable: true
        });
        return LookupContent;
    }(basic_7.BasicContent));
    exports.LookupContent = LookupContent;
    var ContentFactory = (function () {
        function ContentFactory(nextFactory) {
            this._nextFactory = nextFactory;
        }
        ContentFactory.prototype.getContentType = function (options) {
            if (options.name === "lookup") {
                return LookupContent;
            }
            if (!this._nextFactory) {
                throw new Error(jriapp_shared_14.LocaleERRS.ERR_BINDING_CONTENT_NOT_FOUND);
            }
            else {
                return this._nextFactory.getContentType(options);
            }
        };
        ContentFactory.prototype.createContent = function (options) {
            var contentType = this.getContentType(options);
            return new contentType(options);
        };
        ContentFactory.prototype.isExternallyCachable = function (contentType) {
            if (LookupContent === contentType)
                return true;
            if (!this._nextFactory)
                return false;
            return this._nextFactory.isExternallyCachable(contentType);
        };
        return ContentFactory;
    }());
    function initContentFactory() {
        bootstrap_11.bootstrap.contentFactory.addFactory(function (nextFactory) {
            return new ContentFactory(nextFactory);
        });
    }
    exports.initContentFactory = initContentFactory;
});
define("jriapp_ui/content/all", ["require", "exports", "jriapp_shared", "jriapp/bootstrap", "jriapp_ui/content/basic", "jriapp_ui/content/template", "jriapp_ui/content/string", "jriapp_ui/content/multyline", "jriapp_ui/content/bool", "jriapp_ui/content/number", "jriapp_ui/content/date", "jriapp_ui/content/datetime", "jriapp_ui/content/listbox", "jriapp_ui/content/int", "jriapp_ui/content/basic", "jriapp_ui/content/template", "jriapp_ui/content/string", "jriapp_ui/content/multyline", "jriapp_ui/content/bool", "jriapp_ui/content/number", "jriapp_ui/content/date", "jriapp_ui/content/datetime", "jriapp_ui/content/listbox"], function (require, exports, jriapp_shared_15, bootstrap_12, basic_8, template_2, string_1, multyline_1, bool_1, number_1, date_1, datetime_1, listbox_2, int_4, basic_9, template_3, string_2, multyline_2, bool_2, number_2, date_2, datetime_2, listbox_3) {
    "use strict";
    exports.contentCSS = int_4.css;
    exports.BasicContent = basic_9.BasicContent;
    exports.TemplateContent = template_3.TemplateContent;
    exports.StringContent = string_2.StringContent;
    exports.MultyLineContent = multyline_2.MultyLineContent;
    exports.BoolContent = bool_2.BoolContent;
    exports.NumberContent = number_2.NumberContent;
    exports.DateContent = date_2.DateContent;
    exports.DateTimeContent = datetime_2.DateTimeContent;
    exports.LookupContent = listbox_3.LookupContent;
    var utils = jriapp_shared_15.Utils, strUtils = utils.str;
    var ContentFactory = (function () {
        function ContentFactory(nextFactory) {
            this._nextFactory = nextFactory;
        }
        ContentFactory.prototype.getContentType = function (options) {
            if (!!options.templateInfo) {
                return template_2.TemplateContent;
            }
            if (!options.bindingInfo) {
                throw new Error(strUtils.format(jriapp_shared_15.LocaleERRS.ERR_PARAM_INVALID, "options", "bindingInfo"));
            }
            var fieldInfo = options.fieldInfo;
            var res;
            switch (fieldInfo.dataType) {
                case 0:
                    res = basic_8.BasicContent;
                    break;
                case 1:
                    if (options.name === "multyline")
                        res = multyline_1.MultyLineContent;
                    else
                        res = string_1.StringContent;
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
                    if (options.name === "datepicker")
                        res = date_1.DateContent;
                    else
                        res = datetime_1.DateTimeContent;
                    break;
                case 9:
                case 10:
                    res = basic_8.BasicContent;
                    break;
                default:
                    throw new Error(strUtils.format(jriapp_shared_15.LocaleERRS.ERR_FIELD_DATATYPE, fieldInfo.dataType));
            }
            if (!res) {
                if (!this._nextFactory)
                    throw new Error(jriapp_shared_15.LocaleERRS.ERR_BINDING_CONTENT_NOT_FOUND);
                else
                    return this._nextFactory.getContentType(options);
            }
            else {
                return res;
            }
        };
        ContentFactory.prototype.createContent = function (options) {
            var contentType = this.getContentType(options.contentOptions);
            return new contentType(options);
        };
        ContentFactory.prototype.isExternallyCachable = function (contentType) {
            if (!this._nextFactory)
                return false;
            return this._nextFactory.isExternallyCachable(contentType);
        };
        return ContentFactory;
    }());
    function initContentFactory() {
        bootstrap_12.bootstrap.contentFactory.addFactory(function (nextFactory) {
            return new ContentFactory(nextFactory);
        });
        listbox_2.initContentFactory();
    }
    exports.initContentFactory = initContentFactory;
});
define("jriapp_ui/dialog", ["require", "exports", "jriapp_shared", "jriapp/utils/jquery", "jriapp/template", "jriapp/bootstrap", "jriapp/mvvm"], function (require, exports, jriapp_shared_16, jquery_4, template_4, bootstrap_13, mvvm_1) {
    "use strict";
    var utils = jriapp_shared_16.Utils, checks = utils.check, strUtils = utils.str, coreUtils = utils.core, sys = utils.sys, doc = utils.dom.document, ERROR = utils.err, boot = bootstrap_13.bootstrap;
    (function (DIALOG_ACTION) {
        DIALOG_ACTION[DIALOG_ACTION["Default"] = 0] = "Default";
        DIALOG_ACTION[DIALOG_ACTION["StayOpen"] = 1] = "StayOpen";
    })(exports.DIALOG_ACTION || (exports.DIALOG_ACTION = {}));
    var DIALOG_ACTION = exports.DIALOG_ACTION;
    ;
    var DLG_EVENTS = {
        close: "close",
        refresh: "refresh"
    };
    var PROP_NAME = {
        dataContext: "dataContext",
        isSubmitOnOK: "isSubmitOnOK",
        width: "width",
        height: "height",
        title: "title",
        canRefresh: "canRefresh",
        canCancel: "canCancel"
    };
    var DataEditDialog = (function (_super) {
        __extends(DataEditDialog, _super);
        function DataEditDialog(options) {
            _super.call(this);
            var self = this;
            options = coreUtils.extend({
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
            this._objId = "dlg" + coreUtils.getNewID();
            this._dataContext = options.dataContext;
            this._templateID = options.templateID;
            this._submitOnOK = options.submitOnOK;
            this._canRefresh = options.canRefresh;
            this._canCancel = options.canCancel;
            this._fn_OnClose = options.fn_OnClose;
            this._fn_OnOK = options.fn_OnOK;
            this._fn_OnShow = options.fn_OnShow;
            this._fn_OnCancel = options.fn_OnCancel;
            this._fn_OnTemplateCreated = options.fn_OnTemplateCreated;
            this._fn_OnTemplateDestroy = options.fn_OnTemplateDestroy;
            this._editable = null;
            this._template = null;
            this._$dlgEl = null;
            this._result = null;
            this._currentSelectable = null;
            this._fn_submitOnOK = function () {
                var submittable = sys.getSubmittable(self._dataContext);
                if (!submittable || !submittable.isCanSubmit) {
                    return utils.defer.createDeferred().resolve();
                }
                return submittable.submitChanges();
            };
            this._updateIsEditable();
            this._options = {
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
            this._deferred = utils.defer.createDeferred();
            this._createDialog();
        }
        DataEditDialog.prototype.addOnClose = function (fn, nmspace, context) {
            this._addHandler(DLG_EVENTS.close, fn, nmspace, context);
        };
        DataEditDialog.prototype.removeOnClose = function (nmspace) {
            this._removeHandler(DLG_EVENTS.close, nmspace);
        };
        DataEditDialog.prototype.addOnRefresh = function (fn, nmspace, context) {
            this._addHandler(DLG_EVENTS.refresh, fn, nmspace, context);
        };
        DataEditDialog.prototype.removeOnRefresh = function (nmspace) {
            this._removeHandler(DLG_EVENTS.refresh, nmspace);
        };
        DataEditDialog.prototype._updateIsEditable = function () {
            this._editable = sys.getEditable(this._dataContext);
        };
        DataEditDialog.prototype._createDialog = function () {
            try {
                this._template = this._createTemplate();
                this._$dlgEl = jquery_4.$(this._template.el);
                doc.body.appendChild(this._template.el);
                this._$dlgEl.dialog(this._options);
            }
            catch (ex) {
                ERROR.reThrow(ex, this.handleError(ex, this));
            }
        };
        DataEditDialog.prototype._getEventNames = function () {
            var base_events = _super.prototype._getEventNames.call(this);
            return [DLG_EVENTS.close, DLG_EVENTS.refresh].concat(base_events);
        };
        DataEditDialog.prototype.templateLoading = function (template) {
        };
        DataEditDialog.prototype.templateLoaded = function (template, error) {
            if (this.getIsDestroyCalled() || !!error) {
                if (!!this._deferred)
                    this._deferred.reject(error);
                return;
            }
            if (!!this._fn_OnTemplateCreated) {
                this._fn_OnTemplateCreated(template);
            }
            this._deferred.resolve(template);
        };
        DataEditDialog.prototype.templateUnLoading = function (template) {
            if (!!this._fn_OnTemplateDestroy) {
                this._fn_OnTemplateDestroy(template);
            }
        };
        DataEditDialog.prototype._createTemplate = function () {
            var template = template_4.createTemplate(null, this);
            template.templateID = this._templateID;
            return template;
        };
        DataEditDialog.prototype._destroyTemplate = function () {
            if (!!this._template)
                this._template.destroy();
        };
        DataEditDialog.prototype._getButtons = function () {
            var self = this, buttons = [
                {
                    'id': self._objId + "Refresh",
                    'text': jriapp_shared_16.LocaleSTRS.TEXT.txtRefresh,
                    'class': "btn btn-info",
                    'click': function () {
                        self._onRefresh();
                    }
                },
                {
                    'id': self._objId + "Ok",
                    'text': jriapp_shared_16.LocaleSTRS.TEXT.txtOk,
                    'class': "btn btn-info",
                    'click': function () {
                        self._onOk();
                    }
                },
                {
                    'id': self._objId + "Cancel",
                    'text': jriapp_shared_16.LocaleSTRS.TEXT.txtCancel,
                    'class': "btn btn-info",
                    'click': function () {
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
            return jquery_4.$("#" + this._objId + "Ok");
        };
        DataEditDialog.prototype._getCancelButton = function () {
            return jquery_4.$("#" + this._objId + "Cancel");
        };
        DataEditDialog.prototype._getRefreshButton = function () {
            return jquery_4.$("#" + this._objId + "Refresh");
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
            var self = this, canCommit, action = 0;
            if (!!this._fn_OnOK) {
                action = this._fn_OnOK(this);
            }
            if (action === 1)
                return;
            if (!this._dataContext) {
                self.hide();
                return;
            }
            if (!!this._editable)
                canCommit = this._editable.endEdit();
            else
                canCommit = true;
            if (canCommit) {
                if (this._submitOnOK) {
                    this._disableButtons(true);
                    var title_1 = this.title;
                    this.title = jriapp_shared_16.LocaleSTRS.TEXT.txtSubmitting;
                    var promise = this._fn_submitOnOK();
                    promise.always(function () {
                        self._disableButtons(false);
                        self.title = title_1;
                    });
                    promise.then(function () {
                        self._result = "ok";
                        self.hide();
                    }, function () {
                        if (!!self._editable) {
                            if (!self._editable.beginEdit()) {
                                self._result = "cancel";
                                self.hide();
                            }
                        }
                    });
                }
                else {
                    self._result = "ok";
                    self.hide();
                }
            }
        };
        DataEditDialog.prototype._onCancel = function () {
            var action = 0;
            if (!!this._fn_OnCancel) {
                action = this._fn_OnCancel(this);
            }
            if (action === 1)
                return;
            if (!!this._editable)
                this._editable.cancelEdit();
            this._result = "cancel";
            this.hide();
        };
        DataEditDialog.prototype._onRefresh = function () {
            var args = { isHandled: false };
            this.raiseEvent(DLG_EVENTS.refresh, args);
            if (args.isHandled)
                return;
            var dctx = this._dataContext;
            if (!!dctx) {
                if (checks.isFunc(dctx.refresh)) {
                    dctx.refresh();
                }
                else if (!!dctx._aspect && checks.isFunc(dctx._aspect.refresh)) {
                    dctx._aspect.refresh();
                }
            }
        };
        DataEditDialog.prototype._onClose = function () {
            try {
                if (this._result !== "ok" && !!this._dataContext) {
                    if (!!this._editable) {
                        this._editable.cancelEdit();
                    }
                }
                if (!!this._fn_OnClose)
                    this._fn_OnClose(this);
                this.raiseEvent(DLG_EVENTS.close, {});
            }
            finally {
                this._template.dataContext = null;
            }
            var csel = this._currentSelectable;
            this._currentSelectable = null;
            setTimeout(function () { boot.currentSelectable = csel; csel = null; }, 0);
        };
        DataEditDialog.prototype._onShow = function () {
            this._currentSelectable = boot.currentSelectable;
            if (!!this._fn_OnShow) {
                this._fn_OnShow(this);
            }
        };
        DataEditDialog.prototype.show = function () {
            var self = this;
            if (self.getIsDestroyCalled())
                return utils.defer.createDeferred().reject();
            self._result = null;
            return this._deferred.promise().then(function (template) {
                if (self.getIsDestroyCalled() || !self._$dlgEl) {
                    ERROR.abort();
                }
                self._$dlgEl.dialog("option", "buttons", self._getButtons());
                template.dataContext = self._dataContext;
                self._onShow();
                self._$dlgEl.dialog("open");
            }).then(function () {
                return self;
            }, function (err) {
                if (!self.getIsDestroyCalled())
                    self.handleError(err, self);
                ERROR.abort();
            });
        };
        DataEditDialog.prototype.hide = function () {
            var self = this;
            if (!this._$dlgEl)
                return;
            self._$dlgEl.dialog("close");
        };
        DataEditDialog.prototype.getOption = function (name) {
            if (!this._$dlgEl)
                return checks.undefined;
            return this._$dlgEl.dialog("option", name);
        };
        DataEditDialog.prototype.setOption = function (name, value) {
            var self = this;
            self._$dlgEl.dialog("option", name, value);
        };
        DataEditDialog.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            this.hide();
            this._destroyTemplate();
            this._$dlgEl = null;
            this._template = null;
            this._dataContext = null;
            this._fn_submitOnOK = null;
            this._editable = null;
            _super.prototype.destroy.call(this);
        };
        Object.defineProperty(DataEditDialog.prototype, "dataContext", {
            get: function () { return this._dataContext; },
            set: function (v) {
                if (v !== this._dataContext) {
                    this._dataContext = v;
                    this._updateIsEditable();
                    this.raisePropertyChanged(PROP_NAME.dataContext);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataEditDialog.prototype, "result", {
            get: function () { return this._result; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataEditDialog.prototype, "template", {
            get: function () { return this._template; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataEditDialog.prototype, "isSubmitOnOK", {
            get: function () { return this._submitOnOK; },
            set: function (v) {
                if (this._submitOnOK !== v) {
                    this._submitOnOK = v;
                    this.raisePropertyChanged(PROP_NAME.isSubmitOnOK);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataEditDialog.prototype, "width", {
            get: function () { return this.getOption("width"); },
            set: function (v) {
                var x = this.getOption("width");
                if (v !== x) {
                    this.setOption("width", v);
                    this.raisePropertyChanged(PROP_NAME.width);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataEditDialog.prototype, "height", {
            get: function () { return this.getOption("height"); },
            set: function (v) {
                var x = this.getOption("height");
                if (v !== x) {
                    this.setOption("height", v);
                    this.raisePropertyChanged(PROP_NAME.height);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataEditDialog.prototype, "title", {
            get: function () { return this.getOption("title"); },
            set: function (v) {
                var x = this.getOption("title");
                if (v !== x) {
                    this.setOption("title", v);
                    this.raisePropertyChanged(PROP_NAME.title);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataEditDialog.prototype, "canRefresh", {
            get: function () { return this._canRefresh; },
            set: function (v) {
                var x = this._canRefresh;
                if (v !== x) {
                    this._canRefresh = v;
                    this.raisePropertyChanged(PROP_NAME.canRefresh);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataEditDialog.prototype, "canCancel", {
            get: function () { return this._canCancel; },
            set: function (v) {
                var x = this._canCancel;
                if (v !== x) {
                    this._canCancel = v;
                    this.raisePropertyChanged(PROP_NAME.canCancel);
                }
            },
            enumerable: true,
            configurable: true
        });
        return DataEditDialog;
    }(jriapp_shared_16.BaseObject));
    exports.DataEditDialog = DataEditDialog;
    var DialogVM = (function (_super) {
        __extends(DialogVM, _super);
        function DialogVM(app) {
            _super.call(this, app);
            this._factories = {};
            this._dialogs = {};
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
            if (!dlg)
                throw new Error(strUtils.format("Invalid DataEditDialog name:  {0}", name));
            dlg.dataContext = dataContext;
            setTimeout(function () {
                dlg.show();
            }, 0);
            return dlg;
        };
        DialogVM.prototype.getDialog = function (name) {
            var factory = this._factories[name];
            if (!factory)
                return null;
            return factory();
        };
        DialogVM.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            var self = this, keys = Object.keys(this._dialogs);
            keys.forEach(function (key) {
                self._dialogs[key].destroy();
            });
            this._factories = {};
            this._dialogs = {};
            _super.prototype.destroy.call(this);
        };
        return DialogVM;
    }(mvvm_1.ViewModel));
    exports.DialogVM = DialogVM;
});
define("jriapp_ui/dynacontent", ["require", "exports", "jriapp_shared", "jriapp/template", "jriapp/bootstrap", "jriapp_ui/generic"], function (require, exports, jriapp_shared_17, template_5, bootstrap_14, generic_7) {
    "use strict";
    var utils = jriapp_shared_17.Utils, checks = utils.check, strUtils = utils.str, coreUtils = utils.core, sys = utils.sys, dom = utils.dom;
    var PROP_NAME = {
        template: "template",
        templateID: "templateID",
        dataContext: "dataContext",
        animation: "animation"
    };
    var DynaContentElView = (function (_super) {
        __extends(DynaContentElView, _super);
        function DynaContentElView(options) {
            _super.call(this, options);
            this._dataContext = null;
            this._prevTemplateID = null;
            this._templateID = null;
            this._template = null;
            this._animation = null;
        }
        DynaContentElView.prototype.templateLoading = function (template) {
            if (this.getIsDestroyCalled())
                return;
            var isFirstShow = !this._prevTemplateID, canShow = !!this._animation && (this._animation.isAnimateFirstShow || (!this._animation.isAnimateFirstShow && !isFirstShow));
            if (canShow) {
                this._animation.beforeShow(template, isFirstShow);
            }
        };
        DynaContentElView.prototype.templateLoaded = function (template, error) {
            if (this.getIsDestroyCalled())
                return;
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
                if (!newName && !!this._template) {
                    if (!!this._animation && !!this._template.loadedElem) {
                        this._animation.stop();
                        this._animation.beforeHide(this._template);
                        this._animation.hide(this._template).always(function () {
                            if (self.getIsDestroyCalled())
                                return;
                            self._template.destroy();
                            self._template = null;
                            self.raisePropertyChanged(PROP_NAME.template);
                        });
                    }
                    else {
                        self._template.destroy();
                        self._template = null;
                        self.raisePropertyChanged(PROP_NAME.template);
                    }
                    return;
                }
            }
            catch (ex) {
                utils.err.reThrow(ex, this.handleError(ex, this));
            }
            try {
                if (!this._template) {
                    this._template = template_5.createTemplate(this._dataContext, this);
                    this._template.templateID = newName;
                    self.raisePropertyChanged(PROP_NAME.template);
                    return;
                }
                if (!!this._animation && !!this._template.loadedElem) {
                    this._animation.stop();
                    this._animation.beforeHide(this._template);
                    this._animation.hide(this._template).always(function () {
                        if (self.getIsDestroyCalled())
                            return;
                        self._template.templateID = newName;
                    });
                }
                else
                    self._template.templateID = newName;
            }
            catch (ex) {
                utils.err.reThrow(ex, this.handleError(ex, this));
            }
        };
        DynaContentElView.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            var a = this._animation;
            this._animation = null;
            var t = this._template;
            this._template = null;
            if (sys.isBaseObj(a)) {
                a.destroy();
            }
            if (!!t) {
                t.destroy();
            }
            this._dataContext = null;
            _super.prototype.destroy.call(this);
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
                var old = this._templateID;
                if (old !== v) {
                    this._prevTemplateID = this._templateID;
                    this._templateID = v;
                    this._templateChanging(old, v);
                    this.raisePropertyChanged(PROP_NAME.templateID);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DynaContentElView.prototype, "dataContext", {
            get: function () { return this._dataContext; },
            set: function (v) {
                if (this._dataContext !== v) {
                    this._dataContext = v;
                    if (!!this._template) {
                        this._template.dataContext = this._dataContext;
                    }
                    this.raisePropertyChanged(PROP_NAME.dataContext);
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
                    this.raisePropertyChanged(PROP_NAME.animation);
                }
            },
            enumerable: true,
            configurable: true
        });
        return DynaContentElView;
    }(generic_7.BaseElView));
    exports.DynaContentElView = DynaContentElView;
    bootstrap_14.bootstrap.registerElView("dynacontent", DynaContentElView);
});
define("jriapp_ui/utils/dblclick", ["require", "exports"], function (require, exports) {
    "use strict";
    var DblClick = (function () {
        function DblClick(interval) {
            if (interval === void 0) { interval = 0; }
            this._isDestroyed = false;
            this._timer = null;
            this._interval = !interval ? 0 : interval;
            this._fn_OnClick = null;
            this._fn_OnDblClick = null;
        }
        DblClick.prototype.click = function () {
            var self = this;
            if (!!this._timer) {
                clearTimeout(this._timer);
                this._timer = null;
                if (!!this._fn_OnDblClick)
                    this._fn_OnDblClick();
                else if (!!this._fn_OnClick)
                    this._fn_OnClick();
            }
            else {
                if (!!this._fn_OnClick) {
                    this._timer = setTimeout(function () {
                        self._timer = null;
                        if (!!self._fn_OnClick)
                            self._fn_OnClick();
                    }, self._interval);
                }
            }
        };
        DblClick.prototype.add = function (fn_OnClick, fn_OnDblClick) {
            if (this._isDestroyed)
                return;
            this._fn_OnClick = fn_OnClick;
            this._fn_OnDblClick = fn_OnDblClick;
        };
        DblClick.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyed = true;
            clearTimeout(this._timer);
            this._timer = null;
            this._fn_OnClick = null;
            this._fn_OnDblClick = null;
        };
        DblClick.prototype.getIsDestroyed = function () {
            return this._isDestroyed;
        };
        DblClick.prototype.getIsDestroyCalled = function () {
            return this._isDestroyed;
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
define("jriapp_ui/datagrid/const", ["require", "exports"], function (require, exports) {
    "use strict";
    exports.COLUMN_TYPE = {
        DATA: "data",
        ROW_EXPANDER: "row_expander",
        ROW_ACTIONS: "row_actions",
        ROW_SELECTOR: "row_selector"
    };
    (function (ROW_POSITION) {
        ROW_POSITION[ROW_POSITION["Up"] = 0] = "Up";
        ROW_POSITION[ROW_POSITION["Bottom"] = 1] = "Bottom";
        ROW_POSITION[ROW_POSITION["Details"] = 2] = "Details";
    })(exports.ROW_POSITION || (exports.ROW_POSITION = {}));
    var ROW_POSITION = exports.ROW_POSITION;
    (function (ROW_ACTION) {
        ROW_ACTION[ROW_ACTION["OK"] = 0] = "OK";
        ROW_ACTION[ROW_ACTION["EDIT"] = 1] = "EDIT";
        ROW_ACTION[ROW_ACTION["CANCEL"] = 2] = "CANCEL";
        ROW_ACTION[ROW_ACTION["DELETE"] = 3] = "DELETE";
    })(exports.ROW_ACTION || (exports.ROW_ACTION = {}));
    var ROW_ACTION = exports.ROW_ACTION;
    exports.css = {
        container: "ria-table-container",
        dataTable: "ria-data-table",
        columnInfo: "ria-col-info",
        column: "ria-col-ex",
        headerDiv: "ria-table-header",
        wrapDiv: "ria-table-wrap",
        dataColumn: "ria-data-column",
        dataCell: "ria-data-cell",
        rowCollapsed: "ria-row-collapsed",
        rowExpanded: "ria-row-expanded",
        rowExpander: "ria-row-expander",
        columnSelected: "ria-col-selected",
        rowActions: "ria-row-actions",
        rowDetails: "ria-row-details",
        rowSelector: "ria-row-selector",
        rowHighlight: "ria-row-highlight",
        rowDeleted: "ria-row-deleted",
        rowError: "ria-row-error",
        fillVSpace: "ria-fill-vspace",
        nobr: "ria-nobr",
        colSortable: "ria-sortable",
        colSortAsc: "ria-sort-asc",
        colSortDesc: "ria-sort-desc"
    };
    exports.actionsSelector = 'span[data-role="row-action"]';
    exports.editSelector = '*[data-name="img_edit"]';
    exports.deleteSelector = '*[data-name="img_delete"]';
    exports.txtMap = {
        img_ok: "txtOk",
        img_cancel: "txtCancel",
        img_edit: "txtEdit",
        img_delete: "txtDelete"
    };
    exports.PROP_NAME = {
        isCurrent: "isCurrent",
        isSelected: "isSelected",
        sortOrder: "sortOrder",
        checked: "checked",
        editingRow: "editingRow",
        dataSource: "dataSource",
        currentRow: "currentRow",
        grid: "grid",
        animation: "animation",
        stateProvider: "stateProvider"
    };
});
define("jriapp_ui/datagrid/animation", ["require", "exports", "jriapp_shared"], function (require, exports, jriapp_shared_18) {
    "use strict";
    var DefaultAnimation = (function (_super) {
        __extends(DefaultAnimation, _super);
        function DefaultAnimation() {
            _super.call(this);
            this._$el = null;
        }
        DefaultAnimation.prototype.beforeShow = function (el) {
            this.stop();
            this._$el = $(el);
            this._$el.hide();
        };
        DefaultAnimation.prototype.show = function (onEnd) {
            this._$el.slideDown(400, onEnd);
        };
        DefaultAnimation.prototype.beforeHide = function (el) {
            this.stop();
            this._$el = $(el);
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
        DefaultAnimation.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            try {
                this.stop();
            }
            finally {
                _super.prototype.destroy.call(this);
            }
        };
        return DefaultAnimation;
    }(jriapp_shared_18.BaseObject));
    exports.DefaultAnimation = DefaultAnimation;
});
define("jriapp_ui/datagrid/columns/base", ["require", "exports", "jriapp_shared", "jriapp/utils/jquery", "jriapp/const", "jriapp/template", "jriapp_ui/generic", "jriapp/bootstrap", "jriapp_ui/datagrid/const"], function (require, exports, jriapp_shared_19, jquery_5, const_2, template_6, generic_8, bootstrap_15, const_3) {
    "use strict";
    var utils = jriapp_shared_19.Utils, dom = utils.dom, doc = dom.document, boot = bootstrap_15.bootstrap;
    var BaseColumn = (function (_super) {
        __extends(BaseColumn, _super);
        function BaseColumn(grid, options) {
            _super.call(this);
            var self = this;
            this._grid = grid;
            this._th = options.th;
            this._options = options.colInfo;
            this._isSelected = false;
            this._objId = "col" + utils.core.getNewID();
            this._event_scope = ["td[", const_2.DATA_ATTR.DATA_EVENT_SCOPE, '="', this._objId, '"]'].join("");
            var col = doc.createElement("div");
            var $col = jquery_5.$(col);
            this._col = col;
            dom.addClass([col], const_3.css.column);
            if (!!this._options.colCellCss) {
                dom.addClass([col], this._options.colCellCss);
            }
            this._grid._getInternal().get$Header().append(col);
            $col.on("click", function (e) {
                e.stopPropagation();
                boot.currentSelectable = grid;
                grid._getInternal().setCurrentColumn(self);
                self._onColumnClicked();
            });
            this.grid.$table.on("click", this._event_scope, function (e) {
                e.stopPropagation();
                var $td = jquery_5.$(this), cell = $td.data("cell");
                if (!!cell) {
                    boot.currentSelectable = grid;
                    grid._getInternal().setCurrentColumn(self);
                    cell.click();
                }
            });
            if (!!this._options.width) {
                this._th.style.width = this._options.width;
            }
            if (!!this._options.templateID) {
                this._template = template_6.createTemplate(null, this);
                this._template.templateID = this._options.templateID;
                $col.append(this._template.el);
            }
            else if (!!this._options.title) {
                $col.html(this._options.title);
            }
            if (!!this._options.tip) {
                generic_8.fn_addToolTip($col, this._options.tip, false, "bottom center");
            }
        }
        BaseColumn.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            this.grid.$table.off("click", this._event_scope);
            if (!!this._options.tip) {
                generic_8.fn_addToolTip(jquery_5.$(this._col), null);
            }
            if (!!this._template) {
                this._template.destroy();
                this._template = null;
            }
            var $col = jquery_5.$(this._col);
            $col.off();
            $col.empty();
            this._col = null;
            this._th = null;
            this._grid = null;
            this._options = null;
            _super.prototype.destroy.call(this);
        };
        BaseColumn.prototype.templateLoading = function (template) {
        };
        BaseColumn.prototype.templateLoaded = function (template, error) {
        };
        BaseColumn.prototype.templateUnLoading = function (template) {
        };
        BaseColumn.prototype.scrollIntoView = function (isUp) {
            if (this.getIsDestroyCalled())
                return;
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
            get: function () { return this._objId; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseColumn.prototype, "width", {
            get: function () { return this._th.offsetWidth; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseColumn.prototype, "th", {
            get: function () { return this._th; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseColumn.prototype, "col", {
            get: function () { return this._col; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseColumn.prototype, "grid", {
            get: function () { return this._grid; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseColumn.prototype, "options", {
            get: function () { return this._options; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseColumn.prototype, "title", {
            get: function () { return this._options.title; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseColumn.prototype, "isSelected", {
            get: function () { return this._isSelected; },
            set: function (v) {
                if (!!this._col && this._isSelected !== v) {
                    this._isSelected = v;
                    dom.setClass([this._col], const_3.css.columnSelected, !this._isSelected);
                }
            },
            enumerable: true,
            configurable: true
        });
        return BaseColumn;
    }(jriapp_shared_19.BaseObject));
    exports.BaseColumn = BaseColumn;
});
define("jriapp_ui/datagrid/columns/expander", ["require", "exports", "jriapp_shared", "jriapp_ui/datagrid/const", "jriapp_ui/datagrid/columns/base"], function (require, exports, jriapp_shared_20, const_4, base_1) {
    "use strict";
    var dom = jriapp_shared_20.Utils.dom;
    var ExpanderColumn = (function (_super) {
        __extends(ExpanderColumn, _super);
        function ExpanderColumn(grid, options) {
            _super.call(this, grid, options);
            dom.addClass([this.col], const_4.css.rowExpander);
        }
        ExpanderColumn.prototype.toString = function () {
            return "ExpanderColumn";
        };
        return ExpanderColumn;
    }(base_1.BaseColumn));
    exports.ExpanderColumn = ExpanderColumn;
});
define("jriapp_ui/datagrid/cells/expander", ["require", "exports", "jriapp_shared", "jriapp_ui/datagrid/const", "jriapp_ui/datagrid/cells/base"], function (require, exports, jriapp_shared_21, const_5, base_2) {
    "use strict";
    var dom = jriapp_shared_21.Utils.dom;
    var ExpanderCell = (function (_super) {
        __extends(ExpanderCell, _super);
        function ExpanderCell(options) {
            _super.call(this, options);
            var self = this;
            this._click.add(function () {
                self._onCellClicked(self.row);
            });
            dom.addClass([this.td], const_5.css.rowCollapsed);
            dom.addClass([this.td], const_5.css.rowExpander);
        }
        ExpanderCell.prototype._onCellClicked = function (row) {
            var clicked_row = row || this.row;
            if (!clicked_row)
                return;
            _super.prototype._onCellClicked.call(this, clicked_row);
            clicked_row.isExpanded = !clicked_row.isExpanded;
        };
        ExpanderCell.prototype.toggleImage = function () {
            if (this.row.isExpanded) {
                dom.removeClass([this.td], const_5.css.rowCollapsed);
                dom.addClass([this.td], const_5.css.rowExpanded);
            }
            else {
                dom.removeClass([this.td], const_5.css.rowExpanded);
                dom.addClass([this.td], const_5.css.rowCollapsed);
            }
        };
        ExpanderCell.prototype.toString = function () {
            return "ExpanderCell";
        };
        return ExpanderCell;
    }(base_2.BaseCell));
    exports.ExpanderCell = ExpanderCell;
});
define("jriapp_ui/datagrid/columns/data", ["require", "exports", "jriapp_shared", "jriapp_ui/datagrid/const", "jriapp_ui/datagrid/columns/base"], function (require, exports, jriapp_shared_22, const_6, base_3) {
    "use strict";
    var utils = jriapp_shared_22.Utils, dom = utils.dom;
    var DataColumn = (function (_super) {
        __extends(DataColumn, _super);
        function DataColumn(grid, options) {
            _super.call(this, grid, options);
            this._objCache = {};
            var colClass = const_6.css.dataColumn;
            this._sortOrder = null;
            if (this.isSortable) {
                colClass += (" " + const_6.css.colSortable);
            }
            dom.addClass([this.col], colClass);
        }
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
                    self._cacheObject(args.objectKey, args.object);
                    args.isCachedExternally = !!self._getCachedObject(args.objectKey);
                });
                content.addOnObjectNeeded(function (sender, args) {
                    args.object = self._getCachedObject(args.objectKey);
                });
            };
        };
        DataColumn.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            var self = this;
            utils.core.forEachProp(self._objCache, function (key) {
                self._objCache[key].destroy();
            });
            self._objCache = null;
            _super.prototype.destroy.call(this);
        };
        DataColumn.prototype.toString = function () {
            return "DataColumn";
        };
        Object.defineProperty(DataColumn.prototype, "isSortable", {
            get: function () { return !!(this.options.sortable); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataColumn.prototype, "sortMemberName", {
            get: function () { return this.options.sortMemberName; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataColumn.prototype, "sortOrder", {
            get: function () { return this._sortOrder; },
            set: function (v) {
                if (this._sortOrder !== v) {
                    this._sortOrder = v;
                    var styles = [(v === 0 ? "+" : "-") + const_6.css.colSortAsc, (v === 1 ? "+" : "-") + const_6.css.colSortDesc];
                    dom.setClasses([this.col], styles);
                    this.raisePropertyChanged(const_6.PROP_NAME.sortOrder);
                }
            },
            enumerable: true,
            configurable: true
        });
        return DataColumn;
    }(base_3.BaseColumn));
    exports.DataColumn = DataColumn;
});
define("jriapp_ui/datagrid/cells/data", ["require", "exports", "jriapp_shared", "jriapp/bootstrap", "jriapp_ui/datagrid/const", "jriapp_ui/datagrid/cells/base"], function (require, exports, jriapp_shared_23, bootstrap_16, const_7, base_4) {
    "use strict";
    var utils = jriapp_shared_23.Utils, dom = utils.dom, boot = bootstrap_16.bootstrap;
    var DataCell = (function (_super) {
        __extends(DataCell, _super);
        function DataCell(options) {
            _super.call(this, options);
            var self = this;
            this._content = null;
            this._click.interval = 350;
            this._click.add(function () {
                self._onCellClicked(self.row);
            }, function () {
                self._onDblClicked(self.row);
            });
            dom.addClass([this.td], const_7.css.dataCell);
            this._initContent();
        }
        DataCell.prototype._initContent = function () {
            var contentOptions = this.column.options.content;
            if (!contentOptions.fieldInfo && !!contentOptions.fieldName) {
                contentOptions.fieldInfo = this.item._aspect.getFieldInfo(contentOptions.fieldName);
                if (!contentOptions.fieldInfo) {
                    throw new Error(utils.str.format(jriapp_shared_23.LocaleERRS.ERR_DBSET_INVALID_FIELDNAME, "", contentOptions.fieldName));
                }
            }
            var self = this;
            contentOptions.initContentFn = null;
            try {
                var contentType = boot.contentFactory.getContentType(contentOptions);
                if (boot.contentFactory.isExternallyCachable(contentType)) {
                    contentOptions.initContentFn = this.column._getInitContentFn();
                }
                if (this.grid.isHasEditor) {
                    contentOptions.readOnly = true;
                }
                this._content = new contentType({
                    parentEl: this.td,
                    contentOptions: contentOptions,
                    dataContext: this.item,
                    isEditing: this.item._aspect.isEditing
                });
            }
            finally {
                delete contentOptions.initContentFn;
            }
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
        DataCell.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            if (!!this._content) {
                this._content.destroy();
                this._content = null;
            }
            _super.prototype.destroy.call(this);
        };
        DataCell.prototype.toString = function () {
            return "DataCell";
        };
        return DataCell;
    }(base_4.BaseCell));
    exports.DataCell = DataCell;
});
define("jriapp_ui/datagrid/columns/actions", ["require", "exports", "jriapp_shared", "jriapp/const", "jriapp/utils/jquery", "jriapp_ui/datagrid/const", "jriapp_ui/datagrid/columns/base"], function (require, exports, jriapp_shared_24, const_8, jquery_6, const_9, base_5) {
    "use strict";
    var dom = jriapp_shared_24.Utils.dom;
    var ActionsColumn = (function (_super) {
        __extends(ActionsColumn, _super);
        function ActionsColumn(grid, options) {
            _super.call(this, grid, options);
            var self = this, opts = this.options;
            this._event_act_scope = ["span[", const_8.DATA_ATTR.DATA_EVENT_SCOPE, '="', this.uniqueID, '"]'].join("");
            dom.addClass([this.col], const_9.css.rowActions);
            var $table = this.grid.$table;
            $table.on("click", this._event_act_scope, function (e) {
                e.stopPropagation();
                var $img = jquery_6.$(this), name = $img.attr(const_8.DATA_ATTR.DATA_NAME), cell = $img.data("cell");
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
            });
            this.grid.addOnRowAction(function (sender, args) {
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
            }, this.uniqueID);
        }
        ActionsColumn.prototype._onOk = function (cell) {
            if (!cell.row)
                return;
            cell.row.endEdit();
            cell.update();
        };
        ActionsColumn.prototype._onCancel = function (cell) {
            if (!cell.row)
                return;
            cell.row.cancelEdit();
            cell.update();
        };
        ActionsColumn.prototype._onDelete = function (cell) {
            if (!cell.row)
                return;
            cell.row.deleteRow();
        };
        ActionsColumn.prototype._onEdit = function (cell) {
            if (!cell.row)
                return;
            cell.row.beginEdit();
            cell.update();
            this.grid.showEditDialog();
        };
        ActionsColumn.prototype.toString = function () {
            return "ActionsColumn";
        };
        ActionsColumn.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            var $table = this.grid.$table;
            $table.off("click", this._event_act_scope);
            this.grid.removeNSHandlers(this.uniqueID);
            _super.prototype.destroy.call(this);
        };
        return ActionsColumn;
    }(base_5.BaseColumn));
    exports.ActionsColumn = ActionsColumn;
});
define("jriapp_ui/datagrid/cells/actions", ["require", "exports", "jriapp_shared", "jriapp/utils/jquery", "jriapp/const", "jriapp/shared", "jriapp_ui/generic", "jriapp_ui/datagrid/const", "jriapp_ui/datagrid/cells/base"], function (require, exports, jriapp_shared_25, jquery_7, const_10, shared_1, generic_9, const_11, base_6) {
    "use strict";
    var utils = jriapp_shared_25.Utils, dom = utils.dom, strUtils = utils.str, checks = utils.check;
    var _editImages = '<span data-role="row-action" data-name="img_ok" class="{0}"></span><span data-role="row-action" data-name="img_cancel" class="{1}"></span>';
    var _viewImages = '<span data-role="row-action" data-name="img_edit" class="{0}"></span><span data-role="row-action" data-name="img_delete" class="{1}"></span>';
    var editImages = checks.undefined, viewImages = checks.undefined;
    var ActionsCell = (function (_super) {
        __extends(ActionsCell, _super);
        function ActionsCell(options) {
            _super.call(this, options);
            this._isEditing = false;
            dom.addClass([this.td], [const_11.css.rowActions, const_11.css.nobr].join(" "));
            this._createButtons(this.row.isEditing);
        }
        ActionsCell.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            var $td = jquery_7.$(this.td), $imgs = $td.find(const_11.actionsSelector);
            $imgs.each(function (index, img) {
                var $img = jquery_7.$(img);
                $img.removeData();
            });
            _super.prototype.destroy.call(this);
        };
        ActionsCell.prototype._setupImages = function ($images) {
            var self = this;
            $images.each(function (index, img) {
                var $img = jquery_7.$(img);
                $img.data("cell", self);
                var name = $img.attr(const_10.DATA_ATTR.DATA_NAME);
                generic_9.fn_addToolTip($img, jriapp_shared_25.LocaleSTRS.TEXT[const_11.txtMap[name]]);
                $img.attr(const_10.DATA_ATTR.DATA_EVENT_SCOPE, self.column.uniqueID);
            });
        };
        Object.defineProperty(ActionsCell.prototype, "editImages", {
            get: function () {
                if (!editImages)
                    editImages = strUtils.format(_editImages, shared_1.ButtonCss.OK, shared_1.ButtonCss.Cancel);
                return editImages;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ActionsCell.prototype, "viewImages", {
            get: function () {
                if (!viewImages)
                    viewImages = strUtils.format(_viewImages, shared_1.ButtonCss.Edit, shared_1.ButtonCss.Delete);
                return viewImages;
            },
            enumerable: true,
            configurable: true
        });
        ActionsCell.prototype._createButtons = function (isEditing) {
            if (!this.td)
                return;
            var self = this, $td = jquery_7.$(this.td);
            var $newElems;
            $td.empty();
            if (isEditing) {
                self._isEditing = true;
                $newElems = jquery_7.$(self.editImages);
                self._setupImages($newElems.filter(const_11.actionsSelector));
            }
            else {
                self._isEditing = false;
                $newElems = jquery_7.$(self.viewImages);
                if (!self.isCanEdit) {
                    $newElems = $newElems.not(const_11.editSelector);
                }
                if (!self.isCanDelete) {
                    $newElems = $newElems.not(const_11.deleteSelector);
                }
                self._setupImages($newElems.filter(const_11.actionsSelector));
            }
            $td.append($newElems);
        };
        ActionsCell.prototype.update = function () {
            if (!this.row)
                return;
            if (this._isEditing !== this.row.isEditing) {
                this._createButtons(this.row.isEditing);
            }
        };
        ActionsCell.prototype.toString = function () {
            return "ActionsCell";
        };
        Object.defineProperty(ActionsCell.prototype, "isCanEdit", {
            get: function () { return this.grid.isCanEdit; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ActionsCell.prototype, "isCanDelete", {
            get: function () { return this.grid.isCanDelete; },
            enumerable: true,
            configurable: true
        });
        return ActionsCell;
    }(base_6.BaseCell));
    exports.ActionsCell = ActionsCell;
});
define("jriapp_ui/datagrid/columns/rowselector", ["require", "exports", "jriapp_shared", "jriapp/utils/jquery", "jriapp/const", "jriapp_ui/datagrid/const", "jriapp_ui/datagrid/columns/base"], function (require, exports, jriapp_shared_26, jquery_8, const_12, const_13, base_7) {
    "use strict";
    var utils = jriapp_shared_26.Utils, dom = utils.dom, doc = dom.document, checks = utils.check;
    var RowSelectorColumn = (function (_super) {
        __extends(RowSelectorColumn, _super);
        function RowSelectorColumn(grid, options) {
            var _this = this;
            _super.call(this, grid, options);
            var self = this;
            this._event_chk_scope = ["input[", const_12.DATA_ATTR.DATA_EVENT_SCOPE, '="', this.uniqueID, '"]'].join("");
            dom.addClass([this.col], const_13.css.rowSelector);
            var label = doc.createElement("label");
            var chk = doc.createElement("input");
            chk.type = "checkbox";
            chk.checked = false;
            chk.className = const_13.css.rowSelector;
            label.className = const_13.css.rowSelector;
            label.appendChild(chk);
            label.appendChild(doc.createElement("span"));
            this.col.appendChild(label);
            this._chk = chk;
            jquery_8.$(chk).on("change", function (e) {
                e.stopPropagation();
                self.raisePropertyChanged(const_13.PROP_NAME.checked);
                self.grid.selectRows(_this.checked);
            });
            this.grid.$table.on("click", this._event_chk_scope, function (e) {
                e.stopPropagation();
                var chk = this, $chk = jquery_8.$(chk), cell = $chk.data("cell");
                if (!!cell && !cell.getIsDestroyCalled()) {
                    cell.row.isSelected = cell.checked;
                }
            });
        }
        RowSelectorColumn.prototype.toString = function () {
            return "RowSelectorColumn";
        };
        Object.defineProperty(RowSelectorColumn.prototype, "checked", {
            get: function () {
                if (!!this._chk) {
                    return this._chk.checked;
                }
                return checks.undefined;
            },
            set: function (v) {
                var bv = !!v, chk = this._chk;
                if (!!chk) {
                    if (bv !== chk.checked) {
                        chk.checked = bv;
                        this.raisePropertyChanged(const_13.PROP_NAME.checked);
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        RowSelectorColumn.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            this.grid.$table.off("click", this._event_chk_scope);
            jquery_8.$(this._chk).off();
            this._chk = null;
            _super.prototype.destroy.call(this);
        };
        return RowSelectorColumn;
    }(base_7.BaseColumn));
    exports.RowSelectorColumn = RowSelectorColumn;
});
define("jriapp_ui/datagrid/cells/rowselector", ["require", "exports", "jriapp_shared", "jriapp/utils/jquery", "jriapp/const", "jriapp_ui/datagrid/const", "jriapp_ui/datagrid/cells/base"], function (require, exports, jriapp_shared_27, jquery_9, const_14, const_15, base_8) {
    "use strict";
    var dom = jriapp_shared_27.Utils.dom, doc = dom.document;
    var RowSelectorCell = (function (_super) {
        __extends(RowSelectorCell, _super);
        function RowSelectorCell(options) {
            _super.call(this, options);
            dom.addClass([this.td], const_15.css.rowSelector);
            var label = doc.createElement("label");
            var chk = doc.createElement("input");
            chk.type = "checkbox";
            chk.checked = false;
            chk.className = const_15.css.rowSelector;
            label.className = const_15.css.rowSelector;
            chk.setAttribute(const_14.DATA_ATTR.DATA_EVENT_SCOPE, this.column.uniqueID);
            label.appendChild(chk);
            label.appendChild(doc.createElement("span"));
            this.td.appendChild(label);
            this._$chk = jquery_9.$(chk);
            this._$chk.data("cell", this);
        }
        Object.defineProperty(RowSelectorCell.prototype, "checked", {
            get: function () {
                if (!!this._$chk && !!this._$chk.length) {
                    var chk = this._$chk[0];
                    return chk.checked;
                }
                return void 0;
            },
            set: function (v) {
                var bv = !!v;
                if (!!this._$chk && !!this._$chk.length) {
                    var chk = this._$chk[0];
                    if (bv !== chk.checked) {
                        chk.checked = bv;
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        RowSelectorCell.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            this._$chk.removeData();
            this._$chk = null;
            _super.prototype.destroy.call(this);
        };
        RowSelectorCell.prototype.toString = function () {
            return "RowSelectorCell";
        };
        return RowSelectorCell;
    }(base_8.BaseCell));
    exports.RowSelectorCell = RowSelectorCell;
});
define("jriapp_ui/datagrid/rows/row", ["require", "exports", "jriapp_shared", "jriapp/utils/jquery", "jriapp_ui/datagrid/const", "jriapp_ui/datagrid/cells/expander", "jriapp_ui/datagrid/cells/data", "jriapp_ui/datagrid/cells/actions", "jriapp_ui/datagrid/cells/rowselector", "jriapp_ui/datagrid/columns/expander", "jriapp_ui/datagrid/columns/actions", "jriapp_ui/datagrid/columns/rowselector"], function (require, exports, jriapp_shared_28, jquery_10, const_16, expander_1, data_1, actions_1, rowselector_1, expander_2, actions_2, rowselector_2) {
    "use strict";
    var utils = jriapp_shared_28.Utils, dom = utils.dom, doc = dom.document, parse = jriapp_shared_28.parser;
    var fn_state = function (row) {
        var path = row.grid.options.rowStateField, val = (!row.item || !path) ? null : parse.resolvePath(row.item, path), css = row.grid._getInternal().onRowStateChanged(row, val);
        row._setState(css);
    };
    var Row = (function (_super) {
        __extends(Row, _super);
        function Row(grid, options) {
            _super.call(this);
            var self = this, item = options.item, tr = options.tr;
            this._grid = grid;
            this._$tr = jquery_10.$(tr);
            this._item = item;
            this._cells = [];
            this._objId = "rw" + utils.core.getNewID();
            this._expanderCell = null;
            this._actionsCell = null;
            this._rowSelectorCell = null;
            this._isDeleted = false;
            this._isSelected = false;
            this._isDetached = false;
            this._stateCss = null;
            this._isDeleted = item._aspect.isDeleted;
            if (this._isDeleted) {
                dom.addClass([tr], const_16.css.rowDeleted);
            }
            this._createCells();
            if (!!this._item) {
                if (!!this.isHasStateField) {
                    this._item.addOnPropertyChange(this._grid.options.rowStateField, function (s, a) {
                        fn_state(self);
                    }, this._objId);
                }
                fn_state(self);
            }
        }
        Row.prototype._createCells = function () {
            var self = this, cols = self.columns, len = cols.length;
            for (var i = 0; i < len; i += 1) {
                self._cells.push(self._createCell(cols[i], i));
            }
        };
        Row.prototype._createCell = function (col, num) {
            var self = this, td = doc.createElement("td"), cell;
            if (col instanceof expander_2.ExpanderColumn) {
                this._expanderCell = new expander_1.ExpanderCell({ row: self, td: td, column: col, num: num });
                cell = this._expanderCell;
            }
            else if (col instanceof actions_2.ActionsColumn) {
                this._actionsCell = new actions_1.ActionsCell({ row: self, td: td, column: col, num: num });
                cell = this._actionsCell;
            }
            else if (col instanceof rowselector_2.RowSelectorColumn) {
                this._rowSelectorCell = new rowselector_1.RowSelectorCell({ row: self, td: td, column: col, num: num });
                cell = this._rowSelectorCell;
            }
            else {
                cell = new data_1.DataCell({ row: self, td: td, column: col, num: num });
            }
            return cell;
        };
        Row.prototype._setState = function (css) {
            if (this._stateCss !== css) {
                var arr = [];
                if (!!this._stateCss)
                    arr.push("-" + this._stateCss);
                this._stateCss = css;
                if (!!this._stateCss)
                    arr.push("+" + this._stateCss);
                dom.setClasses([this.tr], arr);
            }
        };
        Row.prototype._onBeginEdit = function () {
            var self = this;
            self._cells.forEach(function (cell) {
                if (cell instanceof data_1.DataCell) {
                    cell._beginEdit();
                }
            });
            if (!!this._actionsCell)
                this._actionsCell.update();
        };
        Row.prototype._onEndEdit = function (isCanceled) {
            var self = this;
            self._cells.forEach(function (cell) {
                if (cell instanceof data_1.DataCell) {
                    cell._endEdit(isCanceled);
                }
            });
            if (!!this._actionsCell)
                this._actionsCell.update();
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
        Row.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            var grid = this._grid;
            if (!!grid) {
                if (!this._isDetached) {
                    grid._getInternal().removeRow(this);
                }
                this._$tr.remove();
                var cells = this._cells, len = cells.length;
                for (var i = 0; i < len; i += 1) {
                    cells[i].destroy();
                }
                this._cells = [];
            }
            this._item.removeNSHandlers(this._objId);
            this._item = null;
            this._expanderCell = null;
            this._$tr = null;
            this._grid = null;
            _super.prototype.destroy.call(this);
        };
        Row.prototype.deleteRow = function () {
            this._item._aspect.deleteItem();
        };
        Row.prototype.updateErrorState = function () {
            var hasErrors = this._item._aspect.getIsHasErrors();
            dom.setClass(this._$tr.toArray(), const_16.css.rowError, !hasErrors);
        };
        Row.prototype.scrollIntoView = function (animate, pos) {
            this.grid.scrollToRow({ row: this, animate: animate, pos: pos });
        };
        Row.prototype.toString = function () {
            return "Row";
        };
        Object.defineProperty(Row.prototype, "offset", {
            get: function () {
                return this.$tr.offset();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "height", {
            get: function () {
                return this.$tr.outerHeight();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "width", {
            get: function () {
                return this.$tr.outerWidth();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "tr", {
            get: function () { return this._$tr[0]; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "$tr", {
            get: function () { return this._$tr; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "grid", {
            get: function () { return this._grid; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "item", {
            get: function () { return this._item; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "cells", {
            get: function () { return this._cells; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "columns", {
            get: function () { return this._grid.columns; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "uniqueID", {
            get: function () { return this._objId; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "itemKey", {
            get: function () {
                if (!this._item)
                    return null;
                return this._item._key;
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
            get: function () { return this._isSelected; },
            set: function (v) {
                if (this._isSelected !== v) {
                    this._isSelected = v;
                    if (!!this._rowSelectorCell) {
                        this._rowSelectorCell.checked = this._isSelected;
                    }
                    this.raisePropertyChanged(const_16.PROP_NAME.isSelected);
                    this.grid._getInternal().onRowSelectionChanged(this);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "isExpanded", {
            get: function () { return this.grid._getInternal().isRowExpanded(this); },
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
            get: function () { return this._expanderCell; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "actionsCell", {
            get: function () { return this._actionsCell; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "isDeleted", {
            get: function () {
                if (this._isDestroyCalled)
                    return true;
                return this._isDeleted;
            },
            set: function (v) {
                if (this._isDestroyCalled)
                    return;
                if (this._isDeleted !== v) {
                    this._isDeleted = v;
                    if (this._isDeleted) {
                        this.isExpanded = false;
                    }
                    dom.setClass(this._$tr.toArray(), const_16.css.rowDeleted, !this._isDeleted);
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
            get: function () { return !!this._item && this._item._aspect.isEditing; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Row.prototype, "isHasStateField", {
            get: function () { return !!this._grid.options.rowStateField; },
            enumerable: true,
            configurable: true
        });
        return Row;
    }(jriapp_shared_28.BaseObject));
    exports.Row = Row;
});
define("jriapp_ui/datagrid/cells/base", ["require", "exports", "jriapp_shared", "jriapp/utils/jquery", "jriapp/const", "jriapp_ui/utils/dblclick"], function (require, exports, jriapp_shared_29, jquery_11, const_17, dblclick_1) {
    "use strict";
    var utils = jriapp_shared_29.Utils, dom = utils.dom;
    var BaseCell = (function (_super) {
        __extends(BaseCell, _super);
        function BaseCell(options) {
            _super.call(this);
            options = utils.core.extend({
                row: null,
                td: null,
                column: null,
                num: 0
            }, options);
            this._row = options.row;
            this._td = options.td;
            this._column = options.column;
            this._num = options.num;
            this._td.setAttribute(const_17.DATA_ATTR.DATA_EVENT_SCOPE, this._column.uniqueID);
            jquery_11.$(this._td).data("cell", this);
            if (!!this._column.options.rowCellCss) {
                dom.addClass([this._td], this._column.options.rowCellCss);
            }
            this._click = new dblclick_1.DblClick();
            this._row.tr.appendChild(this._td);
        }
        BaseCell.prototype._onCellClicked = function (row) {
        };
        BaseCell.prototype._onDblClicked = function (row) {
            this.grid._getInternal().onCellDblClicked(this);
        };
        BaseCell.prototype.click = function () {
            this.grid.currentRow = this._row;
            this._click.click();
        };
        BaseCell.prototype.scrollIntoView = function () {
            this.row.scrollIntoView();
        };
        BaseCell.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            if (!!this._click) {
                this._click.destroy();
                this._click = null;
            }
            var $td = jquery_11.$(this._td);
            $td.removeData();
            $td.off();
            $td.empty();
            this._row = null;
            this._td = null;
            this._column = null;
            _super.prototype.destroy.call(this);
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
            get: function () { return this._row.grid; },
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
    }(jriapp_shared_29.BaseObject));
    exports.BaseCell = BaseCell;
});
define("jriapp_ui/datagrid/rows/details", ["require", "exports", "jriapp_shared", "jriapp/utils/jquery", "jriapp_ui/datagrid/const", "jriapp_ui/datagrid/cells/details"], function (require, exports, jriapp_shared_30, jquery_12, const_18, details_1) {
    "use strict";
    var utils = jriapp_shared_30.Utils, checks = utils.check, strUtils = utils.str, coreUtils = utils.core, arrHelper = utils.arr, dom = utils.dom, document = dom.document;
    var DetailsRow = (function (_super) {
        __extends(DetailsRow, _super);
        function DetailsRow(options) {
            _super.call(this);
            var self = this, tr = options.tr;
            this._grid = options.grid;
            this._$tr = jquery_12.$(tr);
            this._item = null;
            this._cell = null;
            this._parentRow = null;
            this._isFirstShow = true;
            this._objId = "drw" + coreUtils.getNewID();
            this._createCell(options.details_id);
            dom.addClass([tr], const_18.css.rowDetails);
            this._grid.addOnRowExpanded(function (sender, args) {
                if (!args.isExpanded && !!args.collapsedRow)
                    self._setParentRow(null);
            }, this._objId);
        }
        DetailsRow.prototype._createCell = function (details_id) {
            var td = document.createElement("td");
            this._cell = new details_1.DetailsCell({ row: this, td: td, details_id: details_id });
        };
        DetailsRow.prototype._setParentRow = function (row) {
            var self = this;
            this._item = null;
            this._cell.item = null;
            dom.removeNode(this.tr);
            if (!row || row.getIsDestroyCalled()) {
                this._parentRow = null;
                return;
            }
            this._parentRow = row;
            this._item = row.item;
            this._cell.item = this._item;
            if (this._isFirstShow)
                this._initShow();
            dom.insertAfter(this.tr, row.tr);
            this._show(function () {
                var parentRow = self._parentRow;
                if (!parentRow || parentRow.getIsDestroyCalled())
                    return;
                if (self.grid.options.isUseScrollIntoDetails)
                    parentRow.scrollIntoView(true, 2);
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
        DetailsRow.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            this._grid.removeNSHandlers(this._objId);
            if (!!this._cell) {
                this._cell.destroy();
                this._cell = null;
            }
            this._$tr.remove();
            this._item = null;
            this._$tr = null;
            this._grid = null;
            _super.prototype.destroy.call(this);
        };
        DetailsRow.prototype.toString = function () {
            return "DetailsRow";
        };
        Object.defineProperty(DetailsRow.prototype, "offset", {
            get: function () {
                return this.$tr.offset();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DetailsRow.prototype, "height", {
            get: function () {
                return this.$tr.outerHeight();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DetailsRow.prototype, "width", {
            get: function () {
                return this.$tr.outerWidth();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DetailsRow.prototype, "tr", {
            get: function () { return this._$tr[0]; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DetailsRow.prototype, "$tr", {
            get: function () { return this._$tr; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DetailsRow.prototype, "grid", {
            get: function () { return this._grid; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DetailsRow.prototype, "item", {
            get: function () { return this._item; },
            set: function (v) {
                if (this._item !== v) {
                    this._item = v;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DetailsRow.prototype, "cell", {
            get: function () { return this._cell; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DetailsRow.prototype, "uniqueID", {
            get: function () { return this._objId; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DetailsRow.prototype, "itemKey", {
            get: function () {
                if (!this._item)
                    return null;
                return this._item._key;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DetailsRow.prototype, "parentRow", {
            get: function () { return this._parentRow; },
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
    }(jriapp_shared_30.BaseObject));
    exports.DetailsRow = DetailsRow;
});
define("jriapp_ui/datagrid/cells/details", ["require", "exports", "jriapp_shared", "jriapp/template"], function (require, exports, jriapp_shared_31, template_7) {
    "use strict";
    var DetailsCell = (function (_super) {
        __extends(DetailsCell, _super);
        function DetailsCell(options) {
            _super.call(this);
            this._row = options.row;
            this._td = options.td;
            if (!options.details_id)
                return;
            this._td.colSpan = this.grid.columns.length;
            this._row.tr.appendChild(this._td);
            this._template = template_7.createTemplate(null, null);
            this._template.templateID = options.details_id;
            this._td.appendChild(this._template.el);
        }
        DetailsCell.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            if (!!this._template) {
                this._template.destroy();
                this._template = null;
            }
            this._row = null;
            this._td = null;
            _super.prototype.destroy.call(this);
        };
        DetailsCell.prototype.toString = function () {
            return "DetailsCell";
        };
        Object.defineProperty(DetailsCell.prototype, "td", {
            get: function () { return this._td; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DetailsCell.prototype, "row", {
            get: function () { return this._row; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DetailsCell.prototype, "grid", {
            get: function () { return this._row.grid; },
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
            get: function () { return this._template; },
            enumerable: true,
            configurable: true
        });
        return DetailsCell;
    }(jriapp_shared_31.BaseObject));
    exports.DetailsCell = DetailsCell;
});
define("jriapp_ui/datagrid/rows/fillspace", ["require", "exports", "jriapp_shared", "jriapp/utils/jquery", "jriapp_ui/datagrid/const", "jriapp_ui/datagrid/cells/fillspace"], function (require, exports, jriapp_shared_32, jquery_13, const_19, fillspace_1) {
    "use strict";
    var dom = jriapp_shared_32.Utils.dom;
    var FillSpaceRow = (function (_super) {
        __extends(FillSpaceRow, _super);
        function FillSpaceRow(options) {
            _super.call(this);
            var self = this, tr = options.tr;
            this._grid = options.grid;
            this._$tr = jquery_13.$(tr);
            this._cell = null;
            this._createCell();
            dom.addClass([tr], const_19.css.fillVSpace);
        }
        FillSpaceRow.prototype._createCell = function () {
            var td = document.createElement("td");
            this._cell = new fillspace_1.FillSpaceCell({ row: this, td: td });
        };
        FillSpaceRow.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            if (!!this._cell) {
                this._cell.destroy();
                this._cell = null;
            }
            this._$tr.remove();
            this._$tr = null;
            this._grid = null;
            _super.prototype.destroy.call(this);
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
            get: function () { return this._$tr[0]; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FillSpaceRow.prototype, "$tr", {
            get: function () { return this._$tr; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FillSpaceRow.prototype, "grid", {
            get: function () { return this._grid; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FillSpaceRow.prototype, "cell", {
            get: function () { return this._cell; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FillSpaceRow.prototype, "height", {
            get: function () { return this._cell.height; },
            set: function (v) { this._cell.height = v; },
            enumerable: true,
            configurable: true
        });
        return FillSpaceRow;
    }(jriapp_shared_32.BaseObject));
    exports.FillSpaceRow = FillSpaceRow;
});
define("jriapp_ui/datagrid/cells/fillspace", ["require", "exports", "jriapp_shared", "jriapp_ui/datagrid/const"], function (require, exports, jriapp_shared_33, const_20) {
    "use strict";
    var dom = jriapp_shared_33.Utils.dom, doc = dom.document;
    var FillSpaceCell = (function (_super) {
        __extends(FillSpaceCell, _super);
        function FillSpaceCell(options) {
            _super.call(this);
            this._row = options.row;
            this._td = options.td;
            this._td.colSpan = this.grid.columns.length;
            this._row.tr.appendChild(this._td);
            this._div = doc.createElement("div");
            this._div.className = const_20.css.fillVSpace;
            this._td.appendChild(this._div);
        }
        FillSpaceCell.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            this._row = null;
            this._td = null;
            this._div = null;
            _super.prototype.destroy.call(this);
        };
        FillSpaceCell.prototype.toString = function () {
            return "FillSpaceCell";
        };
        Object.defineProperty(FillSpaceCell.prototype, "td", {
            get: function () { return this._td; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FillSpaceCell.prototype, "row", {
            get: function () { return this._row; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FillSpaceCell.prototype, "grid", {
            get: function () { return this._row.grid; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FillSpaceCell.prototype, "div", {
            get: function () { return this._div; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(FillSpaceCell.prototype, "height", {
            get: function () { return this._div.offsetHeight; },
            set: function (v) { this._div.style.height = (!v ? 0 : v) + "px"; },
            enumerable: true,
            configurable: true
        });
        return FillSpaceCell;
    }(jriapp_shared_33.BaseObject));
    exports.FillSpaceCell = FillSpaceCell;
});
define("jriapp_ui/datagrid/datagrid", ["require", "exports", "jriapp_shared", "jriapp/utils/jquery", "jriapp/const", "jriapp/bootstrap", "jriapp_ui/generic", "jriapp_ui/content/int", "jriapp_ui/dialog", "jriapp_ui/datagrid/const", "jriapp_ui/datagrid/animation", "jriapp_ui/datagrid/rows/row", "jriapp_ui/datagrid/rows/details", "jriapp_ui/datagrid/rows/fillspace", "jriapp_ui/datagrid/columns/expander", "jriapp_ui/datagrid/columns/data", "jriapp_ui/datagrid/columns/actions", "jriapp_ui/datagrid/columns/rowselector", "jriapp_ui/datagrid/rows/row", "jriapp_ui/datagrid/columns/base", "jriapp_ui/datagrid/const", "jriapp_ui/datagrid/animation"], function (require, exports, jriapp_shared_34, jquery_14, const_21, bootstrap_17, generic_10, int_5, dialog_1, const_22, animation_1, row_1, details_2, fillspace_2, expander_3, data_2, actions_3, rowselector_3, row_2, base_9, const_23, animation_2) {
    "use strict";
    exports.DataGridRow = row_2.Row;
    exports.DataGridColumn = base_9.BaseColumn;
    exports.ROW_POSITION = const_23.ROW_POSITION;
    exports.COLUMN_TYPE = const_23.COLUMN_TYPE;
    exports.ROW_ACTION = const_23.ROW_ACTION;
    exports.DefaultAnimation = animation_2.DefaultAnimation;
    var utils = jriapp_shared_34.Utils, checks = utils.check, strUtils = utils.str, coreUtils = utils.core, ERROR = utils.err, sys = utils.sys, dom = utils.dom, parse = jriapp_shared_34.parser, doc = dom.document, win = dom.window, boot = bootstrap_17.bootstrap;
    var _columnWidthInterval, _gridsCount = 0;
    var _created_grids = {};
    function getDataGrids() {
        var keys = Object.keys(_created_grids);
        var res = [];
        for (var i = 0; i < keys.length; i += 1) {
            var grid = _created_grids[keys[i]];
            res.push(grid);
        }
        return res;
    }
    exports.getDataGrids = getDataGrids;
    function findDataGrid(gridName) {
        var keys = Object.keys(_created_grids);
        for (var i = 0; i < keys.length; i += 1) {
            var grid = _created_grids[keys[i]];
            if (grid.$table.attr(const_21.DATA_ATTR.DATA_NAME) === gridName)
                return grid;
        }
        return null;
    }
    exports.findDataGrid = findDataGrid;
    function updateWidth() {
        _checkGridWidth();
        _columnWidthInterval = dom.window.requestAnimationFrame(updateWidth);
    }
    function _gridCreated(grid) {
        _created_grids[grid.uniqueID] = grid;
        _gridsCount += 1;
        if (_gridsCount === 1) {
            _columnWidthInterval = win.requestAnimationFrame(updateWidth);
        }
    }
    function _gridDestroyed(grid) {
        delete _created_grids[grid.uniqueID];
        _gridsCount -= 1;
        if (_gridsCount === 0) {
            win.cancelAnimationFrame(_columnWidthInterval);
        }
    }
    function _checkGridWidth() {
        coreUtils.forEachProp(_created_grids, function (id) {
            var grid = _created_grids[id];
            if (grid.getIsDestroyCalled())
                return;
            grid._getInternal().columnWidthCheck();
        });
    }
    var GRID_EVENTS = {
        row_expanded: "row_expanded",
        row_selected: "row_selected",
        page_changed: "page_changed",
        row_state_changed: "row_state_changed",
        cell_dblclicked: "cell_dblclicked",
        row_action: "row_action"
    };
    var DataGrid = (function (_super) {
        __extends(DataGrid, _super);
        function DataGrid(options) {
            _super.call(this);
            var self = this;
            options = coreUtils.merge(options, {
                el: null,
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
                isPrependAllRows: false
            });
            if (!!options.dataSource && !sys.isCollection(options.dataSource))
                throw new Error(jriapp_shared_34.LocaleERRS.ERR_GRID_DATASRC_INVALID);
            this._options = options;
            var table = this._options.el, $table = jquery_14.$(table);
            this._$table = $table;
            dom.addClass([table], const_22.css.dataTable);
            this._name = $table.attr(const_21.DATA_ATTR.DATA_NAME);
            this._objId = "grd" + coreUtils.getNewID();
            this._rowMap = {};
            this._rows = [];
            this._columns = [];
            this._expandedRow = null;
            this._details = null;
            this._fillSpace = null;
            this._expanderCol = null;
            this._actionsCol = null;
            this._rowSelectorCol = null;
            this._currentColumn = null;
            this._editingRow = null;
            this._dialog = null;
            this._$header = null;
            this._$wrapper = null;
            this._$contaner = null;
            this._wrapTable();
            this._scrollDebounce = new jriapp_shared_34.Debounce();
            this._selectable = {
                getContainerEl: function () {
                    return self._$contaner[0];
                },
                getUniqueID: function () {
                    return self.uniqueID;
                },
                onKeyDown: function (key, event) {
                    self._onKeyDown(key, event);
                },
                onKeyUp: function (key, event) {
                    self._onKeyUp(key, event);
                }
            };
            var tw = table.offsetWidth;
            this._internal = {
                isRowExpanded: function (row) {
                    return self._isRowExpanded(row);
                },
                get$Header: function () {
                    return self._$header;
                },
                get$Container: function () {
                    return self._$contaner;
                },
                get$Wrapper: function () {
                    return self._$wrapper;
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
                    if (self.getIsDestroyCalled())
                        return;
                    var tw2 = table.offsetWidth;
                    if (tw !== tw2) {
                        tw = tw2;
                        self.updateColumnsSize();
                    }
                }
            };
            this._createColumns();
            this._bindDS();
            boot._getInternal().trackSelectable(this);
            _gridCreated(this);
        }
        DataGrid.prototype._getEventNames = function () {
            var base_events = _super.prototype._getEventNames.call(this);
            var events = Object.keys(GRID_EVENTS).map(function (key, i, arr) { return GRID_EVENTS[key]; });
            return events.concat(base_events);
        };
        DataGrid.prototype.addOnRowExpanded = function (fn, nmspace, context) {
            this._addHandler(GRID_EVENTS.row_expanded, fn, nmspace, context);
        };
        DataGrid.prototype.removeOnRowExpanded = function (nmspace) {
            this._removeHandler(GRID_EVENTS.row_expanded, nmspace);
        };
        DataGrid.prototype.addOnRowSelected = function (fn, nmspace, context) {
            this._addHandler(GRID_EVENTS.row_selected, fn, nmspace, context);
        };
        DataGrid.prototype.removeOnRowSelected = function (nmspace) {
            this._removeHandler(GRID_EVENTS.row_selected, nmspace);
        };
        DataGrid.prototype.addOnPageChanged = function (fn, nmspace, context) {
            this._addHandler(GRID_EVENTS.page_changed, fn, nmspace, context);
        };
        DataGrid.prototype.removeOnPageChanged = function (nmspace) {
            this._removeHandler(GRID_EVENTS.page_changed, nmspace);
        };
        DataGrid.prototype.addOnRowStateChanged = function (fn, nmspace, context) {
            this._addHandler(GRID_EVENTS.row_state_changed, fn, nmspace, context);
        };
        DataGrid.prototype.removeOnRowStateChanged = function (nmspace) {
            this._removeHandler(GRID_EVENTS.row_state_changed, nmspace);
        };
        DataGrid.prototype.addOnCellDblClicked = function (fn, nmspace, context) {
            this._addHandler(GRID_EVENTS.cell_dblclicked, fn, nmspace, context);
        };
        DataGrid.prototype.removeOnCellDblClicked = function (nmspace) {
            this._removeHandler(GRID_EVENTS.cell_dblclicked, nmspace);
        };
        DataGrid.prototype.addOnRowAction = function (fn, nmspace, context) {
            this._addHandler(GRID_EVENTS.row_action, fn, nmspace, context);
        };
        DataGrid.prototype.removeOnRowAction = function (nmspace) {
            this._removeHandler(GRID_EVENTS.row_action, nmspace);
        };
        DataGrid.prototype._onKeyDown = function (key, event) {
            var ds = this.dataSource, self = this;
            if (!ds)
                return;
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
                    if (ds.pageIndex > 0)
                        ds.pageIndex = ds.pageIndex - 1;
                    break;
                case 33:
                    event.preventDefault();
                    ds.pageIndex = ds.pageIndex + 1;
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
                    if (!!this._rowSelectorCol && !!currentRow && (!currentRow.isExpanded && !currentRow.isEditing))
                        event.preventDefault();
                    break;
            }
        };
        DataGrid.prototype._onKeyUp = function (key, event) {
            var ds = this.dataSource;
            if (!ds)
                return;
            var currentRow = this.currentRow;
            switch (key) {
                case 13:
                    if (!!currentRow && !!this._actionsCol) {
                        event.preventDefault();
                        if (currentRow.isEditing) {
                            this.raiseEvent(GRID_EVENTS.row_action, { row: currentRow, action: 0 });
                        }
                        else {
                            this.raiseEvent(GRID_EVENTS.row_action, { row: currentRow, action: 1 });
                        }
                    }
                    break;
                case 27:
                    if (!!currentRow && !!this._actionsCol) {
                        if (currentRow.isEditing) {
                            event.preventDefault();
                            this.raiseEvent(GRID_EVENTS.row_action, { row: currentRow, action: 2 });
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
            if (!!this._currentColumn)
                this._currentColumn.isSelected = false;
            this._currentColumn = column;
            if (!!this._currentColumn)
                this._currentColumn.isSelected = true;
        };
        DataGrid.prototype._onRowStateChanged = function (row, val) {
            var args = { row: row, val: val, css: null };
            this.raiseEvent(GRID_EVENTS.row_state_changed, args);
            return args.css;
        };
        DataGrid.prototype._onCellDblClicked = function (cell) {
            var args = { cell: cell };
            this.raiseEvent(GRID_EVENTS.cell_dblclicked, args);
        };
        DataGrid.prototype._onRowSelectionChanged = function (row) {
            this.raiseEvent(GRID_EVENTS.row_selected, { row: row });
        };
        DataGrid.prototype._resetColumnsSort = function () {
            this.columns.forEach(function (col) {
                if (col instanceof data_2.DataColumn) {
                    col.sortOrder = null;
                }
            });
        };
        DataGrid.prototype._getLastRow = function () {
            if (this._rows.length === 0)
                return null;
            var i = this._rows.length - 1, row = this._rows[i];
            while (row.isDeleted && i > 0) {
                i -= 1;
                row = this._rows[i];
            }
            if (row.isDeleted)
                return null;
            else
                return row;
        };
        DataGrid.prototype._removeRow = function (row) {
            if (this._isRowExpanded(row)) {
                this.collapseDetails();
            }
            if (this._rows.length === 0)
                return;
            var rowkey = row.itemKey, i = utils.arr.remove(this._rows, row);
            try {
                if (i > -1) {
                    if (!row.getIsDestroyCalled()) {
                        row.destroy();
                    }
                }
            }
            finally {
                if (!!this._rowMap[rowkey])
                    delete this._rowMap[rowkey];
            }
        };
        DataGrid.prototype._expandDetails = function (parentRow, expanded) {
            if (!this._options.details)
                return;
            if (!this._details) {
                this._details = this._createDetails();
                this._fillSpace = this._createFillSpace();
            }
            var old = this._expandedRow;
            if (old === parentRow) {
                if (!!old && expanded)
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
            if (old !== parentRow) {
                if (!!old)
                    old.expanderCell.toggleImage();
            }
            this.raiseEvent(GRID_EVENTS.row_expanded, { collapsedRow: old, expandedRow: parentRow, isExpanded: expanded });
        };
        DataGrid.prototype._parseColumnAttr = function (column_attr, content_attr) {
            var defaultOp = {
                "type": const_22.COLUMN_TYPE.DATA,
                title: null,
                sortable: false,
                sortMemberName: null,
                content: null
            };
            var options;
            var temp_opts = parse.parseOptions(column_attr);
            if (temp_opts.length > 0)
                options = coreUtils.extend(defaultOp, temp_opts[0]);
            else
                options = defaultOp;
            if (!!content_attr) {
                options.content = int_5.parseContentAttr(content_attr);
                if (!options.sortMemberName && !!options.content.fieldName)
                    options.sortMemberName = options.content.fieldName;
            }
            return options;
        };
        DataGrid.prototype._findUndeleted = function (row, isUp) {
            if (!row)
                return null;
            if (!row.isDeleted)
                return row;
            var delIndex = this.rows.indexOf(row), i = delIndex, len = this.rows.length;
            if (!isUp) {
                i -= 1;
                if (i >= 0)
                    row = this.rows[i];
                while (i >= 0 && row.isDeleted) {
                    i -= 1;
                    if (i >= 0)
                        row = this.rows[i];
                }
                if (row.isDeleted)
                    row = null;
            }
            else {
                i += 1;
                if (i < len)
                    row = this.rows[i];
                while (i < len && row.isDeleted) {
                    i += 1;
                    if (i < len)
                        row = this.rows[i];
                }
                if (row.isDeleted)
                    row = null;
            }
            return row;
        };
        DataGrid.prototype._onDSCurrentChanged = function (prevCurrent, newCurrent) {
            if (prevCurrent !== newCurrent) {
                var oldRow = !prevCurrent ? null : this._rowMap[prevCurrent._key];
                var newRow = !newCurrent ? null : this._rowMap[newCurrent._key];
                if (!!oldRow) {
                    oldRow.raisePropertyChanged(const_22.PROP_NAME.isCurrent);
                    dom.removeClass([oldRow.tr], const_22.css.rowHighlight);
                }
                if (!!newRow) {
                    newRow.raisePropertyChanged(const_22.PROP_NAME.isCurrent);
                    dom.addClass([newRow.tr], const_22.css.rowHighlight);
                }
            }
        };
        DataGrid.prototype._onDSCollectionChanged = function (sender, args) {
            var self = this, row, items = args.items;
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
                        items.forEach(function (item) {
                            var row = self._rowMap[item._key];
                            if (!!row) {
                                self._removeRow(row);
                            }
                        });
                        self._updateTableDisplay();
                    }
                    break;
                case 3:
                    {
                        row = self._rowMap[args.old_key];
                        if (!!row) {
                            delete self._rowMap[args.old_key];
                            self._rowMap[args.new_key] = row;
                        }
                    }
                    break;
                default:
                    throw new Error(strUtils.format(jriapp_shared_34.LocaleERRS.ERR_COLLECTION_CHANGETYPE_INVALID, args.changeType));
            }
        };
        DataGrid.prototype._updateTableDisplay = function () {
            if (!this.dataSource || this.dataSource.count === 0)
                this.$table.css("visibility", "hidden");
            else
                this.$table.css("visibility", "visible");
        };
        DataGrid.prototype._onPageChanged = function () {
            if (!!this._rowSelectorCol) {
                this._rowSelectorCol.checked = false;
            }
            this.raiseEvent(GRID_EVENTS.page_changed, {});
        };
        DataGrid.prototype._onItemEdit = function (item, isBegin, isCanceled) {
            var row = this._rowMap[item._key];
            if (!row)
                return;
            if (isBegin) {
                row._onBeginEdit();
                this._editingRow = row;
            }
            else {
                row._onEndEdit(isCanceled);
                this._editingRow = null;
            }
            this.raisePropertyChanged(const_22.PROP_NAME.editingRow);
        };
        DataGrid.prototype._onItemAdded = function (sender, args) {
            var item = args.item, row = this._rowMap[item._key];
            if (!row)
                return;
            this.scrollToCurrent();
            if (this._options.isHandleAddNew && !args.isAddNewHandled) {
                args.isAddNewHandled = this.showEditDialog();
            }
        };
        DataGrid.prototype._onItemStatusChanged = function (item, oldStatus) {
            var newStatus = item._aspect.status, ds = this.dataSource;
            var row = this._rowMap[item._key];
            if (!row)
                return;
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
            if (!row)
                return;
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
            var fn_updateCurrent = function () {
                var coll = _this.dataSource, cur = !coll ? null : coll.currentItem;
                self._onDSCurrentChanged(oldCurrent, coll.currentItem);
                oldCurrent = coll.currentItem;
            };
            ds.addOnCollChanged(self._onDSCollectionChanged, self._objId, self);
            ds.addOnCurrentChanged(function () {
                fn_updateCurrent();
            }, self._objId, self);
            ds.addOnBeginEdit(function (sender, args) {
                self._onItemEdit(args.item, true, false);
            }, self._objId);
            ds.addOnEndEdit(function (sender, args) {
                self._onItemEdit(args.item, false, args.isCanceled);
            }, self._objId);
            ds.addOnErrorsChanged(self._onDSErrorsChanged, self._objId, self);
            ds.addOnStatusChanged(function (sender, args) {
                self._onItemStatusChanged(args.item, args.oldStatus);
            }, self._objId);
            ds.addOnItemAdded(self._onItemAdded, self._objId, self);
            ds.addOnItemAdding(function (s, a) {
                self.collapseDetails();
            }, self._objId);
            this._refresh(false);
            fn_updateCurrent();
        };
        DataGrid.prototype._unbindDS = function () {
            var self = this, ds = this.dataSource;
            this._updateTableDisplay();
            if (!ds)
                return;
            ds.removeNSHandlers(self._objId);
        };
        DataGrid.prototype._clearGrid = function () {
            if (this._rows.length === 0)
                return;
            this.collapseDetails();
            var self = this, tbody = self._tBodyEl, newTbody = doc.createElement("tbody");
            this.table.replaceChild(newTbody, tbody);
            var rows = this._rows;
            this._rows = [];
            this._rowMap = {};
            rows.forEach(function (row) {
                row.isDetached = true;
                row.destroy();
            });
        };
        DataGrid.prototype._wrapTable = function () {
            var self = this, options = this._options;
            var wrapper = doc.createElement("div"), container = doc.createElement("div"), header = doc.createElement("div");
            dom.addClass([wrapper], const_22.css.wrapDiv);
            dom.addClass([container], const_22.css.container);
            dom.addClass([header], const_22.css.headerDiv);
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
            dom.addClass([this._tHeadRow], const_22.css.columnInfo);
            this._$wrapper = jquery_14.$(wrapper);
            this._$header = jquery_14.$(header);
            this._$contaner = jquery_14.$(container);
        };
        DataGrid.prototype._unWrapTable = function () {
            if (!this._$header)
                return;
            this._$header.remove();
            this._$header = null;
            dom.unwrap(this.table);
            dom.unwrap(this.table);
            this._$wrapper = null;
            this._$contaner = null;
        };
        DataGrid.prototype._createColumns = function () {
            var self = this, headCells = this._tHeadCells, cellInfos = [];
            var cnt = headCells.length;
            for (var i = 0; i < cnt; i += 1) {
                var th = headCells[i], attr = this._parseColumnAttr(th.getAttribute(const_21.DATA_ATTR.DATA_COLUMN), th.getAttribute(const_21.DATA_ATTR.DATA_CONTENT));
                cellInfos.push({ th: th, colInfo: attr });
            }
            cellInfos.forEach(function (cellInfo) {
                var col = self._createColumn(cellInfo);
                if (!!col)
                    self._columns.push(col);
            });
            self.updateColumnsSize();
        };
        DataGrid.prototype._createColumn = function (cellInfo) {
            var col;
            switch (cellInfo.colInfo.type) {
                case const_22.COLUMN_TYPE.ROW_EXPANDER:
                    if (!this._expanderCol) {
                        col = new expander_3.ExpanderColumn(this, cellInfo);
                        this._expanderCol = col;
                    }
                    break;
                case const_22.COLUMN_TYPE.ROW_ACTIONS:
                    if (!this._actionsCol) {
                        col = new actions_3.ActionsColumn(this, cellInfo);
                        this._actionsCol = col;
                    }
                    break;
                case const_22.COLUMN_TYPE.ROW_SELECTOR:
                    if (!this._rowSelectorCol) {
                        col = new rowselector_3.RowSelectorColumn(this, cellInfo);
                        this._rowSelectorCol = col;
                    }
                    break;
                case const_22.COLUMN_TYPE.DATA:
                    col = new data_2.DataColumn(this, cellInfo);
                    break;
                default:
                    throw new Error(strUtils.format(jriapp_shared_34.LocaleERRS.ERR_GRID_COLTYPE_INVALID, cellInfo.colInfo.type));
            }
            return col;
        };
        DataGrid.prototype._appendItems = function (newItems) {
            if (this.getIsDestroyCalled())
                return;
            var self = this, tbody = this._tBodyEl;
            var item = null;
            for (var i = 0, k = newItems.length; i < k; i += 1) {
                item = newItems[i];
                if (!self._rowMap[item._key]) {
                    var isPrepend = self.options.isPrependAllRows || (self.options.isPrependNewRows && item._aspect.isNew);
                    self._createRowForItem(tbody, item, isPrepend);
                }
            }
            self.updateColumnsSize();
        };
        DataGrid.prototype._refresh = function (isPageChanged) {
            var self = this, ds = this.dataSource;
            if (self.getIsDestroyCalled())
                return;
            self._clearGrid();
            if (!ds)
                return;
            var docFr = doc.createDocumentFragment(), oldTbody = this._tBodyEl, newTbody = doc.createElement("tbody");
            ds.items.forEach(function (item, index) {
                self._createRowForItem(docFr, item, false);
            });
            newTbody.appendChild(docFr);
            self.table.replaceChild(newTbody, oldTbody);
            if (isPageChanged) {
                self._onPageChanged();
            }
            this._scrollDebounce.enqueue(function () {
                if (self.getIsDestroyCalled())
                    return;
                if (self.isUseScrollInto)
                    self.scrollToCurrent();
            });
            self.updateColumnsSize();
            self._updateTableDisplay();
        };
        DataGrid.prototype._createRowForItem = function (parent, item, prepend) {
            var self = this, tr = doc.createElement("tr");
            var gridRow = new row_1.Row(self, { tr: tr, item: item });
            self._rowMap[item._key] = gridRow;
            self._rows.push(gridRow);
            if (!prepend) {
                parent.appendChild(gridRow.tr);
            }
            else {
                if (!parent.firstChild)
                    parent.appendChild(gridRow.tr);
                else
                    parent.insertBefore(gridRow.tr, parent.firstChild);
            }
            return gridRow;
        };
        DataGrid.prototype._createDetails = function () {
            var details_id = this._options.details.templateID, tr = doc.createElement("tr");
            return new details_2.DetailsRow({ grid: this, tr: tr, details_id: details_id });
        };
        DataGrid.prototype._createFillSpace = function () {
            var tr = doc.createElement("tr");
            return new fillspace_2.FillSpaceRow({ grid: this, tr: tr });
        };
        DataGrid.prototype._getInternal = function () {
            return this._internal;
        };
        DataGrid.prototype.updateColumnsSize = function () {
            if (this.getIsDestroyCalled())
                return;
            var width = 0, $header = this._$header;
            this._columns.forEach(function (col) {
                width += col.width;
            });
            $header.css("width", width);
            this._columns.forEach(function (col) {
                col.updateWidth();
            });
        };
        DataGrid.prototype.getISelectable = function () {
            return this._selectable;
        };
        DataGrid.prototype.sortByColumn = function (column) {
            var self = this, ds = this.dataSource;
            if (!ds)
                return;
            var sorts = column.sortMemberName.split(";");
            var promise = ds.sort(sorts, column.sortOrder);
        };
        DataGrid.prototype.selectRows = function (isSelect) {
            this._rows.forEach(function (row) {
                if (row.isDeleted)
                    return;
                row.isSelected = isSelect;
            });
        };
        DataGrid.prototype.findRowByItem = function (item) {
            var row = this._rowMap[item._key];
            if (!row)
                return null;
            return row;
        };
        DataGrid.prototype.collapseDetails = function () {
            if (!this._details)
                return;
            var old = this._expandedRow;
            if (!!old) {
                this._expandDetails(old, false);
            }
        };
        DataGrid.prototype.getSelectedRows = function () {
            var res = [];
            this._rows.forEach(function (row) {
                if (row.isDeleted)
                    return;
                if (row.isSelected) {
                    res.push(row);
                }
            });
            return res;
        };
        DataGrid.prototype.showEditDialog = function () {
            if (!this.isHasEditor || !this._editingRow)
                return false;
            var dialogOptions, item = this._editingRow.item;
            if (!item._aspect.isEditing)
                item._aspect.beginEdit();
            if (!this._dialog) {
                dialogOptions = coreUtils.extend({
                    dataContext: item,
                    templateID: null
                }, this._options.editor);
                this._dialog = new dialog_1.DataEditDialog(dialogOptions);
            }
            else
                this._dialog.dataContext = item;
            this._dialog.canRefresh = !!this.dataSource.permissions.canRefreshRow && !item._aspect.isNew;
            this._dialog.show();
            return true;
        };
        DataGrid.prototype.scrollToRow = function (args) {
            if (!args || !args.row)
                return;
            var row = args.row;
            if (!!this._fillSpace) {
                this._fillSpace.height = 0;
            }
            var animate = !!args.animate, alignBottom = (args.pos === 1), viewPortHeight = this._$wrapper.innerHeight(), rowHeight = row.height, currentScrollTop = this._$wrapper.scrollTop(), offsetDiff = currentScrollTop + row.offset.top - this._$wrapper.offset().top;
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
            var yPos = offsetDiff;
            if (alignBottom)
                yPos -= yOffset;
            var maxScrollTop = this.$table.outerHeight() - viewPortHeight + 1, deltaY = 0;
            if (yPos < 0) {
                yPos = 0;
            }
            else if (yPos > maxScrollTop) {
                deltaY = yPos - maxScrollTop;
            }
            if (!!this._fillSpace) {
                this._fillSpace.height = deltaY;
            }
            if ((args.pos !== 2) && (currentScrollTop < offsetDiff && currentScrollTop > (offsetDiff - yOffset)))
                return;
            if (animate) {
                this._$wrapper.animate({
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
                this._$wrapper.scrollTop(yPos);
            }
        };
        DataGrid.prototype.scrollToCurrent = function (pos, animate) {
            this.scrollToRow({ row: this.currentRow, animate: animate, pos: pos });
        };
        DataGrid.prototype.focus = function () {
            this.scrollToCurrent(0);
            boot.currentSelectable = this;
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
        DataGrid.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            this._clearGrid();
            _gridDestroyed(this);
            boot._getInternal().untrackSelectable(this);
            this._scrollDebounce.destroy();
            if (!!this._details) {
                this._details.destroy();
                this._details = null;
            }
            if (!!this._fillSpace) {
                this._fillSpace.destroy();
                this._fillSpace = null;
            }
            if (this._options.animation) {
                this._options.animation.stop();
                this._options.animation = null;
            }
            if (!!this._dialog) {
                this._dialog.destroy();
                this._dialog = null;
            }
            this.dataSource = null;
            this._unWrapTable();
            dom.removeClass(this._$table.toArray(), const_22.css.dataTable);
            dom.removeClass([this._tHeadRow], const_22.css.columnInfo);
            this._$table = null;
            this._options = {};
            this._selectable = null;
            this._internal = null;
            _super.prototype.destroy.call(this);
        };
        Object.defineProperty(DataGrid.prototype, "$table", {
            get: function () {
                return this._$table;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "table", {
            get: function () {
                return this._$table[0];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "options", {
            get: function () { return this._options; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "_tBodyEl", {
            get: function () { return this.table.tBodies[0]; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "_tHeadEl", {
            get: function () { return this.table.tHead; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "_tFootEl", {
            get: function () { return this.table.tFoot; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "_tHeadRow", {
            get: function () {
                if (!this._tHeadEl)
                    return null;
                var trs = this._tHeadEl.rows;
                if (trs.length === 0)
                    return null;
                return trs[0];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "_tHeadCells", {
            get: function () {
                var row = this._tHeadRow;
                if (!row)
                    return [];
                return utils.arr.fromList(row.cells);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "uniqueID", {
            get: function () { return this._objId; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "name", {
            get: function () { return this._name; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "dataSource", {
            get: function () { return this._options.dataSource; },
            set: function (v) {
                if (v === this.dataSource)
                    return;
                if (!!this.dataSource) {
                    this._unbindDS();
                }
                this._clearGrid();
                this._options.dataSource = v;
                if (!!this.dataSource)
                    this._bindDS();
                this.raisePropertyChanged(const_22.PROP_NAME.dataSource);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "rows", {
            get: function () { return this._rows; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "columns", {
            get: function () { return this._columns; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "currentItem", {
            get: function () {
                var ds = this.dataSource;
                if (!ds)
                    return null;
                return ds.currentItem;
            },
            set: function (item) {
                var ds = this.dataSource;
                if (!ds)
                    return;
                ds.currentItem = item;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "currentRow", {
            get: function () {
                var cur = this.currentItem;
                if (!cur)
                    return null;
                return this._rowMap[cur._key];
            },
            set: function (row) {
                if (!!row && !row.getIsDestroyCalled()) {
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
            get: function () { return this._editingRow; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "isHasEditor", {
            get: function () {
                return (this._options.editor && this._options.editor.templateID);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "isCanEdit", {
            get: function () {
                if (this._options.isCanEdit !== null)
                    return this._options.isCanEdit;
                var ds = this.dataSource;
                return !!ds && ds.permissions.canEditRow;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGrid.prototype, "isCanDelete", {
            get: function () {
                if (this._options.isCanDelete !== null)
                    return this._options.isCanDelete;
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
            get: function () { return this._options.isUseScrollInto; },
            set: function (v) { this._options.isUseScrollInto = v; },
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
    }(jriapp_shared_34.BaseObject));
    exports.DataGrid = DataGrid;
    var DataGridElView = (function (_super) {
        __extends(DataGridElView, _super);
        function DataGridElView(options) {
            _super.call(this, options);
            this._stateProvider = null;
            this._grid = null;
            this._options = options;
            this._createGrid();
        }
        DataGridElView.prototype.toString = function () {
            return "DataGridElView";
        };
        DataGridElView.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            if (!!this._grid && !this._grid.getIsDestroyCalled()) {
                this._grid.destroy();
            }
            this._grid = null;
            this._stateProvider = null;
            _super.prototype.destroy.call(this);
        };
        DataGridElView.prototype._createGrid = function () {
            var options = coreUtils.extend({
                el: this.el,
                dataSource: null,
                animation: null
            }, this._options);
            this._grid = new DataGrid(options);
            this._bindGridEvents();
        };
        DataGridElView.prototype._bindGridEvents = function () {
            if (!this._grid)
                return;
            this._grid.addOnRowStateChanged(function (s, args) {
                var self = this;
                if (!!self._stateProvider) {
                    args.css = self._stateProvider.getCSS(args.row.item, args.val);
                }
            }, this.uniqueID, this);
            this._grid.addOnDestroyed(function (s, args) {
                var self = this;
                self._grid = null;
                self.raisePropertyChanged(const_22.PROP_NAME.grid);
            }, this.uniqueID, this);
        };
        Object.defineProperty(DataGridElView.prototype, "dataSource", {
            get: function () {
                if (this.getIsDestroyCalled())
                    return checks.undefined;
                return this.grid.dataSource;
            },
            set: function (v) {
                if (this.getIsDestroyCalled())
                    return;
                if (this.dataSource !== v) {
                    this.grid.dataSource = v;
                    this.raisePropertyChanged(const_22.PROP_NAME.dataSource);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGridElView.prototype, "grid", {
            get: function () { return this._grid; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGridElView.prototype, "stateProvider", {
            get: function () { return this._stateProvider; },
            set: function (v) {
                if (v !== this._stateProvider) {
                    this._stateProvider = v;
                    this.raisePropertyChanged(const_22.PROP_NAME.stateProvider);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataGridElView.prototype, "animation", {
            get: function () {
                if (this.getIsDestroyCalled())
                    return checks.undefined;
                return this._grid.options.animation;
            },
            set: function (v) {
                if (this._isDestroyCalled)
                    return;
                if (this.animation !== v) {
                    this._grid.options.animation = v;
                    this.raisePropertyChanged(const_22.PROP_NAME.animation);
                }
            },
            enumerable: true,
            configurable: true
        });
        return DataGridElView;
    }(generic_10.BaseElView));
    exports.DataGridElView = DataGridElView;
    boot.registerElView("table", DataGridElView);
    boot.registerElView("datagrid", DataGridElView);
});
define("jriapp_ui/pager", ["require", "exports", "jriapp_shared", "jriapp/utils/jquery", "jriapp_ui/generic", "jriapp"], function (require, exports, jriapp_shared_35, jquery_15, generic_11, jriapp_1) {
    "use strict";
    var utils = jriapp_shared_35.Utils, dom = utils.dom, doc = dom.document, sys = utils.sys, checks = utils.check, strUtils = utils.str, coreUtils = utils.core, ERROR = utils.err, boot = jriapp_1.bootstrap;
    var _STRS = jriapp_shared_35.LocaleSTRS.PAGER;
    var css = {
        pager: "ria-pager",
        info: "ria-pager-info",
        currentPage: "ria-pager-current-page",
        otherPage: "ria-pager-other-page"
    };
    var PROP_NAME = {
        dataSource: "dataSource",
        rowCount: "rowCount",
        currentPage: "currentPage",
        pager: "pager"
    };
    var Pager = (function (_super) {
        __extends(Pager, _super);
        function Pager(options) {
            _super.call(this);
            options = coreUtils.extend({
                el: null,
                dataSource: null,
                showTip: true,
                showInfo: false,
                showNumbers: true,
                showFirstAndLast: true,
                showPreviousAndNext: false,
                useSlider: true,
                hideOnSinglePage: true,
                sliderSize: 25
            }, options);
            if (!!options.dataSource && !sys.isCollection(options.dataSource))
                throw new Error(jriapp_shared_35.LocaleERRS.ERR_PAGER_DATASRC_INVALID);
            this._options = options;
            this._$el = jquery_15.$(options.el);
            dom.addClass([options.el], css.pager);
            this._objId = "pgr" + coreUtils.getNewID();
            this._rowsPerPage = 0;
            this._rowCount = 0;
            this._currentPage = 1;
            this._renderDebounce = new jriapp_shared_35.Debounce(50);
            if (!!this._options.dataSource) {
                this._bindDS();
            }
        }
        Pager.prototype._createElement = function (tag) {
            return jquery_15.$(doc.createElement(tag));
        };
        Pager.prototype._render = function () {
            var $el = this._$el, rowCount, currentPage, pageCount;
            this._clearContent();
            if (this.rowsPerPage <= 0) {
                return;
            }
            rowCount = this.rowCount;
            if (rowCount === 0) {
                return;
            }
            currentPage = this.currentPage;
            if (currentPage === 0) {
                return;
            }
            pageCount = this.pageCount;
            if (this.hideOnSinglePage && (pageCount === 1)) {
                $el.hide();
            }
            else {
                $el.show();
                if (this.showInfo) {
                    var $span = this._createElement("span");
                    var info = strUtils.format(_STRS.pageInfo, currentPage, pageCount);
                    dom.addClass($span.toArray(), css.info);
                    $span.text(info);
                    $span.appendTo($el);
                }
                if (this.showFirstAndLast && (currentPage !== 1)) {
                    $el.append(this._createFirst());
                }
                if (this.showPreviousAndNext && (currentPage !== 1)) {
                    $el.append(this._createPrevious());
                }
                if (this.showNumbers) {
                    var start = 1, end = pageCount, sliderSize = this.sliderSize, half = void 0, above = void 0, below = void 0;
                    if (this.useSlider && (sliderSize > 0)) {
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
                    for (var i = start; i <= end; i++) {
                        if (i === currentPage) {
                            $el.append(this._createCurrent());
                        }
                        else {
                            $el.append(this._createOther(i));
                        }
                    }
                }
                if (this.showPreviousAndNext && (currentPage !== pageCount)) {
                    $el.append(this._createNext());
                }
                if (this.showFirstAndLast && (currentPage !== pageCount)) {
                    $el.append(this._createLast());
                }
            }
        };
        Pager.prototype.render = function () {
            var _this = this;
            this._renderDebounce.enqueue(function () { _this._render(); });
        };
        Pager.prototype._setDSPageIndex = function (page) {
            this.dataSource.pageIndex = page - 1;
        };
        Pager.prototype._onPageSizeChanged = function (ds, args) {
            this.rowsPerPage = ds.pageSize;
        };
        Pager.prototype._onPageIndexChanged = function (ds, args) {
            this.currentPage = ds.pageIndex + 1;
        };
        Pager.prototype._onTotalCountChanged = function (ds, args) {
            this.rowCount = ds.totalCount;
        };
        Pager.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            this._renderDebounce.destroy();
            this._renderDebounce = null;
            this._unbindDS();
            this._clearContent();
            dom.removeClass([this.el], css.pager);
            this._$el = null;
            this._options = {};
            _super.prototype.destroy.call(this);
        };
        Pager.prototype._bindDS = function () {
            var self = this, ds = this.dataSource;
            if (!ds)
                return;
            ds.addOnCollChanged(function (s, args) {
                switch (args.changeType) {
                    case 2:
                        {
                            if (args.reason !== 1) {
                                self._reset();
                            }
                        }
                        break;
                }
            }, self._objId);
            ds.addOnPageIndexChanged(self._onPageIndexChanged, self._objId, self);
            ds.addOnPageSizeChanged(self._onPageSizeChanged, self._objId, self);
            ds.addOnTotalCountChanged(self._onTotalCountChanged, self._objId, self);
            this._reset();
        };
        Pager.prototype._unbindDS = function () {
            var self = this, ds = this.dataSource;
            if (!ds)
                return;
            ds.removeNSHandlers(self._objId);
        };
        Pager.prototype._clearContent = function () {
            this._$el.empty();
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
        Pager.prototype._createLink = function (page, text, tip) {
            var $a = this._createElement("a"), self = this;
            $a.text("" + text);
            $a.attr("href", "javascript:void(0)");
            if (!!tip) {
                generic_11.fn_addToolTip($a, tip);
            }
            $a.click(function (e) {
                e.preventDefault();
                self._setDSPageIndex(page);
                self.currentPage = page;
            });
            return $a;
        };
        Pager.prototype._createFirst = function () {
            var $span = this._createElement("span"), tip, $a;
            if (this.showTip) {
                tip = _STRS.firstPageTip;
            }
            $a = this._createLink(1, _STRS.firstText, tip);
            dom.addClass($span.toArray(), css.otherPage);
            $span.append($a);
            return $span;
        };
        Pager.prototype._createPrevious = function () {
            var $span = this._createElement("span"), previousPage = this.currentPage - 1, tip, $a;
            if (this.showTip) {
                tip = strUtils.format(_STRS.prevPageTip, previousPage);
            }
            $a = this._createLink(previousPage, _STRS.previousText, tip);
            dom.addClass($span.toArray(), css.otherPage);
            $span.append($a);
            return $span;
        };
        Pager.prototype._createCurrent = function () {
            var $span = this._createElement("span"), currentPage = this.currentPage;
            $span.text("" + currentPage);
            if (this.showTip) {
                generic_11.fn_addToolTip($span, this._buildTip(currentPage));
            }
            dom.addClass($span.toArray(), css.currentPage);
            return $span;
        };
        Pager.prototype._createOther = function (page) {
            var $span = this._createElement("span"), tip, $a;
            if (this.showTip) {
                tip = this._buildTip(page);
            }
            $a = this._createLink(page, "" + page, tip);
            dom.addClass($span.toArray(), css.otherPage);
            $span.append($a);
            return $span;
        };
        Pager.prototype._createNext = function () {
            var $span = this._createElement("span"), nextPage = this.currentPage + 1, tip, $a;
            if (this.showTip) {
                tip = strUtils.format(_STRS.nextPageTip, nextPage);
            }
            $a = this._createLink(nextPage, _STRS.nextText, tip);
            dom.addClass($span.toArray(), css.otherPage);
            $span.append($a);
            return $span;
        };
        Pager.prototype._createLast = function () {
            var $span = this._createElement("span"), tip, a;
            if (this.showTip) {
                tip = _STRS.lastPageTip;
            }
            a = this._createLink(this.pageCount, _STRS.lastText, tip);
            dom.addClass($span.toArray(), css.otherPage);
            $span.append(a);
            return $span;
        };
        Pager.prototype._buildTip = function (page) {
            var rowsPerPage = this.rowsPerPage, rowCount = this.rowCount, start = (((page - 1) * rowsPerPage) + 1), end = (page === this.pageCount) ? rowCount : (page * rowsPerPage), tip = "";
            if (page === this.currentPage) {
                tip = strUtils.format(_STRS.showingTip, start, end, rowCount);
            }
            else {
                tip = strUtils.format(_STRS.showTip, start, end, rowCount);
            }
            return tip;
        };
        Pager.prototype.toString = function () {
            return "Pager";
        };
        Object.defineProperty(Pager.prototype, "el", {
            get: function () { return this._options.el; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Pager.prototype, "dataSource", {
            get: function () {
                return this._options.dataSource;
            },
            set: function (v) {
                if (v === this.dataSource)
                    return;
                if (!!this.dataSource) {
                    this._unbindDS();
                }
                this._options.dataSource = v;
                if (!!this.dataSource)
                    this._bindDS();
                this.raisePropertyChanged(PROP_NAME.dataSource);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Pager.prototype, "pageCount", {
            get: function () {
                var rowCount = this.rowCount, rowsPerPage = this.rowsPerPage, result;
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
            get: function () { return this._rowCount; },
            set: function (v) {
                if (this._rowCount !== v) {
                    this._rowCount = v;
                    this.render();
                    this.raisePropertyChanged(PROP_NAME.rowCount);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Pager.prototype, "rowsPerPage", {
            get: function () { return this._rowsPerPage; },
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
            get: function () { return this._currentPage; },
            set: function (v) {
                if (this._currentPage !== v) {
                    this._currentPage = v;
                    this.render();
                    this.raisePropertyChanged(PROP_NAME.currentPage);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Pager.prototype, "useSlider", {
            get: function () { return this._options.useSlider; },
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
            get: function () { return this._options.sliderSize; },
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
            get: function () { return this._options.hideOnSinglePage; },
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
            get: function () { return this._options.showTip; },
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
            get: function () { return this._options.showInfo; },
            set: function (v) {
                if (this._options.showInfo !== v) {
                    this._options.showInfo = v;
                    this.render();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Pager.prototype, "showFirstAndLast", {
            get: function () { return this._options.showFirstAndLast; },
            set: function (v) {
                if (this.showFirstAndLast !== v) {
                    this._options.showFirstAndLast = v;
                    this.render();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Pager.prototype, "showPreviousAndNext", {
            get: function () { return this._options.showPreviousAndNext; },
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
            get: function () { return this._options.showNumbers; },
            set: function (v) {
                if (this.showNumbers !== v) {
                    this._options.showNumbers = v;
                    this.render();
                }
            },
            enumerable: true,
            configurable: true
        });
        return Pager;
    }(jriapp_shared_35.BaseObject));
    exports.Pager = Pager;
    var PagerElView = (function (_super) {
        __extends(PagerElView, _super);
        function PagerElView(options) {
            _super.call(this, options);
            var self = this;
            this._pager = null;
            this._pager = new Pager(options);
            this._pager.addOnDestroyed(function () {
                self._pager = null;
                self.raisePropertyChanged(PROP_NAME.pager);
            });
        }
        PagerElView.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            if (!!this._pager && !this._pager.getIsDestroyCalled()) {
                this._pager.destroy();
            }
            this._pager = null;
            _super.prototype.destroy.call(this);
        };
        PagerElView.prototype.toString = function () {
            return "PagerElView";
        };
        Object.defineProperty(PagerElView.prototype, "dataSource", {
            get: function () {
                if (this.getIsDestroyCalled())
                    return checks.undefined;
                return this._pager.dataSource;
            },
            set: function (v) {
                if (this.getIsDestroyCalled())
                    return;
                if (this.dataSource !== v) {
                    this._pager.dataSource = v;
                    this.raisePropertyChanged(PROP_NAME.dataSource);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PagerElView.prototype, "pager", {
            get: function () { return this._pager; },
            enumerable: true,
            configurable: true
        });
        return PagerElView;
    }(generic_11.BaseElView));
    exports.PagerElView = PagerElView;
    boot.registerElView("pager", PagerElView);
});
define("jriapp_ui/stackpanel", ["require", "exports", "jriapp_shared", "jriapp/utils/jquery", "jriapp/const", "jriapp/template", "jriapp_ui/generic", "jriapp"], function (require, exports, jriapp_shared_36, jquery_16, const_24, template_8, generic_12, jriapp_2) {
    "use strict";
    var utils = jriapp_shared_36.Utils, dom = utils.dom, doc = dom.document, sys = utils.sys, checks = utils.check, strUtils = utils.str, coreUtils = utils.core, boot = jriapp_2.bootstrap;
    var css = {
        stackpanel: "ria-stackpanel",
        item: "ria-stackpanel-item",
        horizontal: "ria-horizontal-panel",
        currentItem: "ria-current-item"
    };
    var PROP_NAME = {
        dataSource: "dataSource",
        currentItem: "currentItem",
        panel: "panel",
        panelEvents: "panelEvents"
    };
    var VERTICAL = "vertical", HORIZONTAL = "horizontal";
    var PNL_EVENTS = {
        item_clicked: "item_clicked"
    };
    var StackPanel = (function (_super) {
        __extends(StackPanel, _super);
        function StackPanel(options) {
            _super.call(this);
            var self = this;
            options = coreUtils.extend({
                el: null,
                dataSource: null,
                templateID: null,
                orientation: VERTICAL
            }, options);
            if (!!options.dataSource && !sys.isCollection(options.dataSource))
                throw new Error(jriapp_shared_36.LocaleERRS.ERR_STACKPNL_DATASRC_INVALID);
            if (!options.templateID)
                throw new Error(jriapp_shared_36.LocaleERRS.ERR_STACKPNL_TEMPLATE_INVALID);
            this._options = options;
            this._$el = jquery_16.$(options.el);
            dom.addClass([options.el], css.stackpanel);
            var eltag = options.el.tagName.toLowerCase();
            if (eltag === "ul" || eltag === "ol")
                this._item_tag = "li";
            else
                this._item_tag = "div";
            if (this.orientation === HORIZONTAL) {
                dom.addClass([options.el], css.horizontal);
            }
            this._objId = "pnl" + coreUtils.getNewID();
            this._isKeyNavigation = false;
            this._event_scope = [this._item_tag, "[", const_24.DATA_ATTR.DATA_EVENT_SCOPE, '="', this._objId, '"]'].join("");
            this._currentItem = null;
            this._itemMap = {};
            this._selectable = {
                getContainerEl: function () {
                    return self._getContainerEl();
                },
                getUniqueID: function () {
                    return self.uniqueID;
                },
                onKeyDown: function (key, event) {
                    self._onKeyDown(key, event);
                },
                onKeyUp: function (key, event) {
                    self._onKeyUp(key, event);
                }
            };
            this._$el.on("click", this._event_scope, function (e) {
                e.stopPropagation();
                boot.currentSelectable = self;
                var $el = jquery_16.$(this), mappedItem = $el.data("data");
                self._onItemClicked(mappedItem.el, mappedItem.item);
            });
            if (!!options.dataSource) {
                this._bindDS();
            }
            boot._getInternal().trackSelectable(this);
        }
        StackPanel.prototype._getEventNames = function () {
            var base_events = _super.prototype._getEventNames.call(this);
            return [PNL_EVENTS.item_clicked].concat(base_events);
        };
        StackPanel.prototype.addOnItemClicked = function (fn, nmspace, context) {
            this._addHandler(PNL_EVENTS.item_clicked, fn, nmspace, context);
        };
        StackPanel.prototype.removeOnItemClicked = function (nmspace) {
            this._removeHandler(PNL_EVENTS.item_clicked, nmspace);
        };
        StackPanel.prototype._getContainerEl = function () { return this._options.el; };
        StackPanel.prototype._onKeyDown = function (key, event) {
            var ds = this.dataSource, self = this;
            if (!ds)
                return;
            if (this.orientation === HORIZONTAL) {
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
            var self = this, old = self._currentItem, mappedItem;
            if (old !== item) {
                this._currentItem = item;
                if (!!old) {
                    mappedItem = self._itemMap[old._key];
                    if (!!mappedItem) {
                        dom.removeClass([mappedItem.el], css.currentItem);
                    }
                }
                if (!!item) {
                    mappedItem = self._itemMap[item._key];
                    if (!!mappedItem) {
                        dom.addClass([mappedItem.el], css.currentItem);
                        if (withScroll && !this._isKeyNavigation)
                            this.scrollToCurrent(false);
                    }
                }
                this.raisePropertyChanged(PROP_NAME.currentItem);
            }
        };
        StackPanel.prototype._onDSCurrentChanged = function (sender, args) {
            var ds = this.dataSource, cur = ds.currentItem;
            if (!cur)
                this._updateCurrent(null, false);
            else {
                this._updateCurrent(cur, true);
            }
        };
        StackPanel.prototype._onDSCollectionChanged = function (sender, args) {
            var self = this, items = args.items;
            switch (args.changeType) {
                case 2:
                    {
                        this._refresh();
                    }
                    break;
                case 1:
                    {
                        self._appendItems(args.items);
                    }
                    break;
                case 0:
                    items.forEach(function (item) {
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
                    throw new Error(strUtils.format(jriapp_shared_36.LocaleERRS.ERR_COLLECTION_CHANGETYPE_INVALID, args.changeType));
            }
        };
        StackPanel.prototype._onItemStatusChanged = function (item, oldStatus) {
            var newStatus = item._aspect.status;
            var obj = this._itemMap[item._key];
            if (!obj)
                return;
            if (newStatus === 3) {
                jquery_16.$(obj.el).hide();
            }
            else if (oldStatus === 3) {
                jquery_16.$(obj.el).show();
            }
        };
        StackPanel.prototype._createTemplate = function (item) {
            var template = template_8.createTemplate(item, null);
            template.templateID = this.templateID;
            return template;
        };
        StackPanel.prototype._appendItems = function (newItems) {
            if (this.getIsDestroyCalled())
                return;
            var self = this;
            newItems.forEach(function (item) {
                if (!!self._itemMap[item._key])
                    return;
                self._appendItem(item);
            });
        };
        StackPanel.prototype._appendItem = function (item) {
            if (!item._key)
                return;
            var self = this, item_el = doc.createElement(this._item_tag), $item_el = jquery_16.$(item_el);
            dom.addClass([item_el], css.item);
            item_el.setAttribute(const_24.DATA_ATTR.DATA_EVENT_SCOPE, this.uniqueID);
            self._$el.append($item_el);
            var mappedItem = { el: item_el, template: null, item: item };
            $item_el.data("data", mappedItem);
            self._itemMap[item._key] = mappedItem;
            mappedItem.template = self._createTemplate(item);
            mappedItem.el.appendChild(mappedItem.template.el);
        };
        StackPanel.prototype._bindDS = function () {
            var self = this, ds = this.dataSource;
            if (!ds)
                return;
            ds.addOnCollChanged(self._onDSCollectionChanged, self._objId, self);
            ds.addOnCurrentChanged(self._onDSCurrentChanged, self._objId, self);
            ds.addOnStatusChanged(function (sender, args) {
                self._onItemStatusChanged(args.item, args.oldStatus);
            }, self._objId);
            this._refresh();
        };
        StackPanel.prototype._unbindDS = function () {
            var self = this, ds = this.dataSource;
            if (!ds)
                return;
            ds.removeNSHandlers(self._objId);
        };
        StackPanel.prototype._onItemClicked = function (div, item) {
            this._updateCurrent(item, false);
            this.dataSource.currentItem = item;
            this.raiseEvent(PNL_EVENTS.item_clicked, { item: item });
        };
        StackPanel.prototype._clearContent = function () {
            var self = this;
            self._$el.empty();
            coreUtils.forEachProp(self._itemMap, function (key) {
                self._removeItemByKey(key);
            });
        };
        StackPanel.prototype._removeItemByKey = function (key) {
            var self = this, mappedItem = self._itemMap[key];
            if (!mappedItem)
                return;
            delete self._itemMap[key];
            mappedItem.template.destroy();
            mappedItem.template = null;
            jquery_16.$(mappedItem.el).remove();
        };
        StackPanel.prototype._removeItem = function (item) {
            this._removeItemByKey(item._key);
        };
        StackPanel.prototype._refresh = function () {
            var ds = this.dataSource, self = this;
            this._clearContent();
            if (!ds)
                return;
            ds.forEach(function (item) {
                self._appendItem(item);
            });
        };
        StackPanel.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            boot._getInternal().untrackSelectable(this);
            this._unbindDS();
            this._clearContent();
            dom.removeClass([this.el], css.stackpanel);
            if (this.orientation === HORIZONTAL) {
                dom.removeClass([this.el], css.horizontal);
            }
            this._$el.off("click", this._event_scope);
            this._$el = null;
            this._currentItem = null;
            this._itemMap = {};
            this._options = {};
            _super.prototype.destroy.call(this);
        };
        StackPanel.prototype.getISelectable = function () {
            return this._selectable;
        };
        StackPanel.prototype.scrollToItem = function (item, isUp) {
            if (!item)
                return;
            var mappedItem = this._itemMap[item._key];
            if (!mappedItem) {
                return;
            }
            var isVert = this.orientation === VERTICAL, $item = jquery_16.$(mappedItem.el), viewPortSize = isVert ? this._$el.innerHeight() : this._$el.innerWidth(), itemSize = isVert ? $item.outerHeight() : $item.outerWidth(), currentPos = isVert ? this._$el.scrollTop() : this._$el.scrollLeft(), offsetDiff = isVert ? (currentPos + $item.offset().top - this._$el.offset().top) : (currentPos + $item.offset().left - this._$el.offset().left);
            var contentSize = Math.min(itemSize, viewPortSize);
            var offset = viewPortSize - contentSize;
            var pos = !isUp ? Math.floor(offsetDiff - offset + 1) : Math.floor(offsetDiff - 1);
            if (pos < 0)
                pos = 0;
            if ((currentPos < offsetDiff && currentPos > (offsetDiff - offset))) {
                return;
            }
            if (isVert)
                this._$el.scrollTop(pos);
            else
                this._$el.scrollLeft(pos);
        };
        StackPanel.prototype.scrollToCurrent = function (isUp) {
            this.scrollToItem(this._currentItem, isUp);
        };
        StackPanel.prototype.focus = function () {
            this.scrollToCurrent(true);
            boot.currentSelectable = this;
        };
        StackPanel.prototype.getDivElementByItem = function (item) {
            var mappedItem = this._itemMap[item._key];
            if (!mappedItem)
                return null;
            return mappedItem.el;
        };
        StackPanel.prototype.toString = function () {
            return "StackPanel";
        };
        Object.defineProperty(StackPanel.prototype, "el", {
            get: function () { return this._options.el; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(StackPanel.prototype, "uniqueID", {
            get: function () { return this._objId; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(StackPanel.prototype, "orientation", {
            get: function () { return this._options.orientation; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(StackPanel.prototype, "templateID", {
            get: function () { return this._options.templateID; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(StackPanel.prototype, "dataSource", {
            get: function () { return this._options.dataSource; },
            set: function (v) {
                if (v === this.dataSource)
                    return;
                if (!!this.dataSource) {
                    this._unbindDS();
                }
                this._options.dataSource = v;
                if (!!this.dataSource)
                    this._bindDS();
                this.raisePropertyChanged(PROP_NAME.dataSource);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(StackPanel.prototype, "currentItem", {
            get: function () { return this._currentItem; },
            enumerable: true,
            configurable: true
        });
        return StackPanel;
    }(jriapp_shared_36.BaseObject));
    exports.StackPanel = StackPanel;
    var StackPanelElView = (function (_super) {
        __extends(StackPanelElView, _super);
        function StackPanelElView(options) {
            _super.call(this, options);
            this._panel = null;
            this._panelEvents = null;
            this._createPanel(options);
        }
        StackPanelElView.prototype._createPanel = function (opts) {
            this._panel = new StackPanel(opts);
            this._panel.addOnItemClicked(function (sender, args) {
                var self = this;
                if (!!self._panelEvents) {
                    self._panelEvents.onItemClicked(args.item);
                }
            }, this.uniqueID, this);
            this._panel.addOnDestroyed(function () {
                var self = this;
                self._panel = null;
                self.raisePropertyChanged(PROP_NAME.panel);
            }, this.uniqueID, this);
        };
        StackPanelElView.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            if (!!this._panel && !this._panel.getIsDestroyCalled()) {
                this._panel.destroy();
            }
            this._panelEvents = null;
            this._panel = null;
            _super.prototype.destroy.call(this);
        };
        StackPanelElView.prototype.toString = function () {
            return "StackPanelElView";
        };
        Object.defineProperty(StackPanelElView.prototype, "dataSource", {
            get: function () {
                if (this.getIsDestroyCalled() || !this._panel)
                    return checks.undefined;
                return this._panel.dataSource;
            },
            set: function (v) {
                if (this.dataSource !== v) {
                    this._panel.dataSource = v;
                    this.raisePropertyChanged(PROP_NAME.dataSource);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(StackPanelElView.prototype, "panelEvents", {
            get: function () { return this._panelEvents; },
            set: function (v) {
                var old = this._panelEvents;
                if (v !== old) {
                    this._panelEvents = v;
                    this.raisePropertyChanged(PROP_NAME.panelEvents);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(StackPanelElView.prototype, "panel", {
            get: function () { return this._panel; },
            enumerable: true,
            configurable: true
        });
        return StackPanelElView;
    }(generic_12.BaseElView));
    exports.StackPanelElView = StackPanelElView;
    boot.registerElView("stackpanel", StackPanelElView);
    boot.registerElView("ul", StackPanelElView);
    boot.registerElView("ol", StackPanelElView);
});
define("jriapp_ui/tabs", ["require", "exports", "jriapp_shared", "jriapp/utils/jquery", "jriapp/bootstrap", "jriapp_ui/generic"], function (require, exports, jriapp_shared_37, jquery_17, bootstrap_18, generic_13) {
    "use strict";
    var utils = jriapp_shared_37.Utils, coreUtils = utils.core;
    var PROP_NAME = {
        tabIndex: "tabIndex",
        tabsEvents: "tabsEvents"
    };
    var TabsElView = (function (_super) {
        __extends(TabsElView, _super);
        function TabsElView(options) {
            _super.call(this, options);
            this._tabOpts = options;
            this._tabsEvents = null;
            this._tabsCreated = false;
            this._createTabs();
        }
        TabsElView.prototype._createTabs = function () {
            var $el = this.$el, self = this, tabOpts = {
                activate: function (e, tab) {
                    if (!!self._tabsEvents) {
                        self._tabsEvents.onTabSelected(self);
                    }
                    self.raisePropertyChanged(PROP_NAME.tabIndex);
                }
            };
            tabOpts = coreUtils.extend(tabOpts, self._tabOpts);
            $el.tabs(tabOpts);
            setTimeout(function () {
                if (self.getIsDestroyCalled())
                    return;
                self._tabsCreated = true;
                self._onTabsCreated();
                self.raisePropertyChanged(PROP_NAME.tabIndex);
            }, 0);
        };
        TabsElView.prototype._destroyTabs = function () {
            var $el = this.$el;
            jquery_17.JQueryUtils.destroy$Plugin($el, "tabs");
            this._tabsCreated = false;
            if (!!this._tabsEvents) {
                this._tabsEvents.removeTabs();
            }
        };
        TabsElView.prototype._onTabsCreated = function () {
            var self = this, $el = self.$el;
            if (!!self._tabsEvents) {
                self._tabsEvents.addTabs(self);
            }
            if (!!self._tabsEvents) {
                self._tabsEvents.onTabSelected(self);
            }
        };
        TabsElView.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            this._destroyTabs();
            this._tabsEvents = null;
            _super.prototype.destroy.call(this);
        };
        TabsElView.prototype.toString = function () {
            return "TabsElView";
        };
        Object.defineProperty(TabsElView.prototype, "tabsEvents", {
            get: function () { return this._tabsEvents; },
            set: function (v) {
                var old = this._tabsEvents;
                if (v !== old) {
                    if (!!old)
                        old.removeTabs();
                    this._tabsEvents = v;
                    this.raisePropertyChanged(PROP_NAME.tabsEvents);
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
                return this.$el.tabs("option", "active");
            },
            set: function (v) {
                this.$el.tabs("option", "active", v);
            },
            enumerable: true,
            configurable: true
        });
        return TabsElView;
    }(generic_13.BaseElView));
    exports.TabsElView = TabsElView;
    bootstrap_18.bootstrap.registerElView("tabs", TabsElView);
});
define("jriapp_ui/command", ["require", "exports", "jriapp_shared", "jriapp_ui/generic"], function (require, exports, jriapp_shared_38, generic_14) {
    "use strict";
    var utils = jriapp_shared_38.Utils, dom = utils.dom, checks = utils.check, sys = utils.sys;
    var CommandElView = (function (_super) {
        __extends(CommandElView, _super);
        function CommandElView(options) {
            _super.call(this, options);
            this._command = null;
            this._commandParam = null;
            this._preventDefault = !!options.preventDefault;
            this._stopPropagation = !!options.stopPropagation;
            this._disabled = ("disabled" in this.el) ? checks.undefined : false;
            dom.setClass(this.$el.toArray(), generic_14.css.disabled, this.isEnabled);
        }
        CommandElView.prototype._onCanExecuteChanged = function (cmd, args) {
            this.isEnabled = cmd.canExecute(this, this._commandParam);
        };
        CommandElView.prototype._onCommandChanged = function () {
            this.raisePropertyChanged(generic_14.PROP_NAME.command);
        };
        CommandElView.prototype.invokeCommand = function (args, isAsync) {
            var self = this;
            args = args || this._commandParam || {};
            if (!!self.command && self.command.canExecute(self, args)) {
                if (isAsync) {
                    setTimeout(function () {
                        if (self.getIsDestroyCalled())
                            return;
                        try {
                            if (!!self.command && self.command.canExecute(self, args))
                                self.command.execute(self, args);
                        }
                        catch (ex) {
                            self.handleError(ex, self);
                        }
                    }, 0);
                }
                else {
                    self.command.execute(self, args);
                }
            }
        };
        CommandElView.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            if (sys.isBaseObj(this._command)) {
                this._command.removeNSHandlers(this.uniqueID);
            }
            this.command = null;
            this._commandParam = null;
            _super.prototype.destroy.call(this);
        };
        CommandElView.prototype.toString = function () {
            return "CommandElView";
        };
        Object.defineProperty(CommandElView.prototype, "isEnabled", {
            get: function () {
                var el = this.el;
                if (this._disabled === checks.undefined)
                    return !el.disabled;
                else
                    return !this._disabled;
            },
            set: function (v) {
                var el = this.el;
                if (v !== this.isEnabled) {
                    if (this._disabled === checks.undefined)
                        el.disabled = !v;
                    else
                        this._disabled = !v;
                    dom.setClass(this.$el.toArray(), generic_14.css.disabled, !!v);
                    this.raisePropertyChanged(generic_14.PROP_NAME.isEnabled);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CommandElView.prototype, "command", {
            get: function () { return this._command; },
            set: function (v) {
                var self = this;
                if (v !== this._command) {
                    if (sys.isBaseObj(this._command)) {
                        this._command.removeNSHandlers(this.uniqueID);
                    }
                    this._command = v;
                    if (!!this._command) {
                        this._command.addOnCanExecuteChanged(self._onCanExecuteChanged, this.uniqueID, self);
                        self.isEnabled = this._command.canExecute(self, this.commandParam || {});
                    }
                    else {
                        self.isEnabled = false;
                    }
                    this._onCommandChanged();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CommandElView.prototype, "commandParam", {
            get: function () { return this._commandParam; },
            set: function (v) {
                if (v !== this._commandParam) {
                    this._commandParam = v;
                    this.raisePropertyChanged(generic_14.PROP_NAME.commandParam);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CommandElView.prototype, "preventDefault", {
            get: function () {
                return this._preventDefault;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CommandElView.prototype, "stopPropagation", {
            get: function () {
                return this._stopPropagation;
            },
            enumerable: true,
            configurable: true
        });
        return CommandElView;
    }(generic_14.BaseElView));
    exports.CommandElView = CommandElView;
});
define("jriapp_ui/template", ["require", "exports", "jriapp_shared", "jriapp/utils/viewchecks", "jriapp/bootstrap", "jriapp_ui/command"], function (require, exports, jriapp_shared_39, viewchecks_2, bootstrap_19, command_1) {
    "use strict";
    var utils = jriapp_shared_39.Utils, viewChecks = viewchecks_2.ViewChecks, boot = bootstrap_19.bootstrap;
    viewChecks.isTemplateElView = function (obj) {
        return !!obj && obj instanceof TemplateElView;
    };
    var PROP_NAME = {
        template: "template",
        isEnabled: "isEnabled"
    };
    var TemplateElView = (function (_super) {
        __extends(TemplateElView, _super);
        function TemplateElView(options) {
            _super.call(this, options);
            this._template = null;
            this._isEnabled = true;
        }
        TemplateElView.prototype.templateLoading = function (template) {
        };
        TemplateElView.prototype.templateLoaded = function (template, error) {
            if (!!error)
                return;
            var self = this;
            try {
                self._template = template;
                var args = { template: template, isLoaded: true };
                self.invokeCommand(args, false);
                this.raisePropertyChanged(PROP_NAME.template);
            }
            catch (ex) {
                utils.err.reThrow(ex, this.handleError(ex, this));
            }
        };
        TemplateElView.prototype.templateUnLoading = function (template) {
            var self = this;
            try {
                var args = { template: template, isLoaded: false };
                self.invokeCommand(args, false);
            }
            catch (ex) {
                this.handleError(ex, this);
            }
            finally {
                self._template = null;
            }
            this.raisePropertyChanged(PROP_NAME.template);
        };
        TemplateElView.prototype.toString = function () {
            return "TemplateElView";
        };
        Object.defineProperty(TemplateElView.prototype, "isEnabled", {
            get: function () { return this._isEnabled; },
            set: function (v) {
                if (this._isEnabled !== v) {
                    this._isEnabled = v;
                    this.raisePropertyChanged(PROP_NAME.isEnabled);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TemplateElView.prototype, "template", {
            get: function () {
                return this._template;
            },
            enumerable: true,
            configurable: true
        });
        return TemplateElView;
    }(command_1.CommandElView));
    exports.TemplateElView = TemplateElView;
    ;
    boot.registerElView("template", TemplateElView);
});
define("jriapp_ui/dataform", ["require", "exports", "jriapp_shared", "jriapp/utils/jquery", "jriapp/const", "jriapp/utils/viewchecks", "jriapp/bootstrap", "jriapp_ui/generic", "jriapp_ui/content/int"], function (require, exports, jriapp_shared_40, jquery_18, const_25, viewchecks_3, bootstrap_20, generic_15, int_6) {
    "use strict";
    var utils = jriapp_shared_40.Utils, dom = jriapp_shared_40.Utils.dom, doc = dom.document, checks = utils.check, coreUtils = utils.core, strUtils = utils.str, sys = utils.sys, parse = jriapp_shared_40.parser, boot = bootstrap_20.bootstrap, viewChecks = viewchecks_3.ViewChecks;
    exports.css = {
        dataform: "ria-dataform",
        error: "ria-form-error"
    };
    viewChecks.setIsInsideTemplate = function (elView) {
        if (!!elView && elView instanceof DataFormElView) {
            elView.form.isInsideTemplate = true;
        }
    };
    viewChecks.isDataForm = function (el) {
        if (!el) {
            return false;
        }
        if (el.hasAttribute(const_25.DATA_ATTR.DATA_FORM)) {
            return true;
        }
        else {
            var attr = el.getAttribute(const_25.DATA_ATTR.DATA_VIEW);
            if (!attr) {
                return false;
            }
            var opts = parse.parseOptions(attr);
            return (opts.length > 0 && opts[0].name === const_25.ELVIEW_NM.DataForm);
        }
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
        var i, oNode, len = forms.length;
        if (len === 0) {
            return false;
        }
        oNode = el.parentElement;
        while (!!oNode) {
            for (i = 0; i < len; i += 1) {
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
        if (!el)
            return null;
        var parent = el.parentElement, attr, opts;
        if (!!parent) {
            if (parent === rootForm)
                return rootForm;
            if (viewChecks.isDataForm(parent)) {
                return parent;
            }
            else
                return viewChecks.getParentDataForm(rootForm, parent);
        }
        return null;
    };
    function getFieldInfo(obj, fieldName) {
        if (!obj)
            return null;
        if (!!obj._aspect && checks.isFunc(obj._aspect.getFieldInfo)) {
            return obj._aspect.getFieldInfo(fieldName);
        }
        else if (checks.isFunc(obj.getFieldInfo)) {
            return obj.getFieldInfo(fieldName);
        }
        else
            return null;
    }
    var PROP_NAME = {
        dataContext: "dataContext",
        isEditing: "isEditing",
        validationErrors: "validationErrors",
        form: "form"
    };
    var DataForm = (function (_super) {
        __extends(DataForm, _super);
        function DataForm(options) {
            _super.call(this);
            var self = this, parent;
            this._el = options.el;
            this._$el = jquery_18.$(this._el);
            this._objId = "frm" + coreUtils.getNewID();
            this._dataContext = null;
            dom.addClass([this._el], exports.css.dataform);
            this._isEditing = false;
            this._content = [];
            this._lfTime = null;
            this._contentCreated = false;
            this._editable = null;
            this._errNotification = null;
            this._parentDataForm = null;
            this._errors = null;
            this._contentPromise = null;
            parent = viewChecks.getParentDataForm(null, this._el);
            if (!!parent) {
                self._parentDataForm = this.app.viewFactory.getOrCreateElView(parent);
                self._parentDataForm.addOnDestroyed(function (sender, args) {
                    if (!self._isDestroyCalled)
                        self.destroy();
                }, self._objId);
            }
        }
        DataForm.prototype._getBindings = function () {
            if (!this._lfTime)
                return [];
            var arr = this._lfTime.getObjs(), res = [];
            for (var i = 0, len = arr.length; i < len; i += 1) {
                if (sys.isBinding(arr[i]))
                    res.push(arr[i]);
            }
            return res;
        };
        DataForm.prototype._getElViews = function () {
            if (!this._lfTime)
                return [];
            var arr = this._lfTime.getObjs(), res = [];
            for (var i = 0, len = arr.length; i < len; i += 1) {
                if (viewChecks.isElView(arr[i]))
                    res.push(arr[i]);
            }
            return res;
        };
        DataForm.prototype._createContent = function () {
            var dctx = this._dataContext, self = this;
            if (!dctx) {
                return;
            }
            var contentElements = coreUtils.arr.fromList(this._el.querySelectorAll(DataForm._DATA_CONTENT_SELECTOR)), isEditing = this.isEditing;
            var forms = coreUtils.arr.fromList(this._el.querySelectorAll(DataForm._DATA_FORM_SELECTOR));
            contentElements.forEach(function (el) {
                if (viewChecks.isInNestedForm(self._el, forms, el))
                    return;
                var attr = el.getAttribute(const_25.DATA_ATTR.DATA_CONTENT), op = int_6.parseContentAttr(attr);
                if (!!op.fieldName && !op.fieldInfo) {
                    op.fieldInfo = getFieldInfo(dctx, op.fieldName);
                    if (!op.fieldInfo) {
                        throw new Error(strUtils.format(jriapp_shared_40.LocaleERRS.ERR_DBSET_INVALID_FIELDNAME, "", op.fieldName));
                    }
                }
                var contentType = boot.contentFactory.getContentType(op);
                var content = new contentType({ parentEl: el, contentOptions: op, dataContext: dctx, isEditing: isEditing });
                self._content.push(content);
            });
            var promise = self.app._getInternal().bindElements(this._el, dctx, true, this.isInsideTemplate);
            return promise.then(function (lftm) {
                if (self.getIsDestroyCalled()) {
                    lftm.destroy();
                    return;
                }
                self._lfTime = lftm;
                var bindings = self._getBindings();
                bindings.forEach(function (binding) {
                    if (!binding.isSourceFixed)
                        binding.source = dctx;
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
                    if (!binding.isSourceFixed)
                        binding.source = dctx;
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
                            if (self.getIsDestroyCalled())
                                return;
                            self._updateCreatedContent();
                        }, function (err) {
                            if (self.getIsDestroyCalled())
                                return;
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
        DataForm.prototype._onDSErrorsChanged = function (sender, args) {
            if (!!this._errNotification)
                this.validationErrors = this._errNotification.getAllErrors();
        };
        DataForm.prototype._onIsEditingChanged = function (sender, args) {
            this.isEditing = this._editable.isEditing;
        };
        DataForm.prototype._bindDS = function () {
            var dataContext = this._dataContext, self = this;
            if (!dataContext)
                return;
            if (!!dataContext) {
                this._editable = sys.getEditable(dataContext);
                this._errNotification = sys.getErrorNotification(dataContext);
            }
            dataContext.addOnDestroyed(function (s, a) {
                self.dataContext = null;
            }, self._objId);
            if (!!this._editable) {
                this._editable.addOnPropertyChange(PROP_NAME.isEditing, self._onIsEditingChanged, self._objId, self);
            }
            if (!!this._errNotification) {
                this._errNotification.addOnErrorsChanged(self._onDSErrorsChanged, self._objId, self);
            }
        };
        DataForm.prototype._unbindDS = function () {
            var dataContext = this._dataContext;
            this.validationErrors = null;
            if (!!dataContext && !dataContext.getIsDestroyCalled()) {
                dataContext.removeNSHandlers(this._objId);
                if (!!this._editable) {
                    this._editable.removeNSHandlers(this._objId);
                }
                if (!!this._errNotification) {
                    this._errNotification.removeOnErrorsChanged(this._objId);
                }
            }
            this._editable = null;
            this._errNotification = null;
        };
        DataForm.prototype._clearContent = function () {
            this._content.forEach(function (content) {
                content.destroy();
            });
            this._content = [];
            if (!!this._lfTime) {
                this._lfTime.destroy();
                this._lfTime = null;
            }
            this._contentCreated = false;
        };
        DataForm.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            this._clearContent();
            dom.removeClass([this.el], exports.css.dataform);
            this._el = null;
            this._$el = null;
            this._unbindDS();
            var parentDataForm = this._parentDataForm;
            this._parentDataForm = null;
            if (!!parentDataForm && !parentDataForm.getIsDestroyCalled()) {
                parentDataForm.removeNSHandlers(this._objId);
            }
            this._dataContext = null;
            this._contentCreated = false;
            this._contentPromise = null;
            _super.prototype.destroy.call(this);
        };
        DataForm.prototype.toString = function () {
            return "DataForm";
        };
        Object.defineProperty(DataForm.prototype, "app", {
            get: function () { return boot.getApp(); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataForm.prototype, "el", {
            get: function () { return this._el; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataForm.prototype, "dataContext", {
            get: function () { return this._dataContext; },
            set: function (v) {
                try {
                    if (v === this._dataContext)
                        return;
                    if (!!v && !sys.isBaseObj(v)) {
                        throw new Error(jriapp_shared_40.LocaleERRS.ERR_DATAFRM_DCTX_INVALID);
                    }
                    this._unbindDS();
                    this._dataContext = v;
                    this._bindDS();
                    this._updateContent();
                    this.raisePropertyChanged(PROP_NAME.dataContext);
                    if (!!this._dataContext) {
                        if (!!this._editable && this._isEditing !== this._editable.isEditing) {
                            this.isEditing = this._editable.isEditing;
                        }
                        if (!!this._errNotification) {
                            this._onDSErrorsChanged();
                        }
                    }
                }
                catch (ex) {
                    utils.err.reThrow(ex, this.handleError(ex, this));
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataForm.prototype, "isEditing", {
            get: function () { return this._isEditing; },
            set: function (v) {
                var dataContext = this._dataContext;
                if (!dataContext)
                    return;
                var isEditing = this._isEditing, editable;
                if (!!this._editable)
                    editable = this._editable;
                if (!editable && v !== isEditing) {
                    this._isEditing = v;
                    this._updateContent();
                    this.raisePropertyChanged(PROP_NAME.isEditing);
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
                    this.raisePropertyChanged(PROP_NAME.isEditing);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataForm.prototype, "validationErrors", {
            get: function () { return this._errors; },
            set: function (v) {
                if (v !== this._errors) {
                    this._errors = v;
                    this.raisePropertyChanged(PROP_NAME.validationErrors);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataForm.prototype, "isInsideTemplate", {
            get: function () { return this._isInsideTemplate; },
            set: function (v) {
                this._isInsideTemplate = v;
            },
            enumerable: true,
            configurable: true
        });
        DataForm._DATA_FORM_SELECTOR = ["*[", const_25.DATA_ATTR.DATA_FORM, "]"].join("");
        DataForm._DATA_CONTENT_SELECTOR = ["*[", const_25.DATA_ATTR.DATA_CONTENT, "]:not([", const_25.DATA_ATTR.DATA_COLUMN, "])"].join("");
        return DataForm;
    }(jriapp_shared_40.BaseObject));
    exports.DataForm = DataForm;
    var DataFormElView = (function (_super) {
        __extends(DataFormElView, _super);
        function DataFormElView(options) {
            _super.call(this, options);
            var self = this;
            this._form = new DataForm(options);
            this._form.addOnDestroyed(function () {
                self._form = null;
                self.raisePropertyChanged(PROP_NAME.form);
            });
            this._form.addOnPropertyChange("*", function (form, args) {
                switch (args.property) {
                    case PROP_NAME.validationErrors:
                        self.validationErrors = form.validationErrors;
                        break;
                    case PROP_NAME.dataContext:
                        self.raisePropertyChanged(args.property);
                        break;
                }
            }, this.uniqueID);
        }
        DataFormElView.prototype._getErrorTipInfo = function (errors) {
            var tip = ["<b>", jriapp_shared_40.LocaleSTRS.VALIDATE.errorInfo, "</b>", "<ul>"];
            errors.forEach(function (info) {
                var fieldName = info.fieldName, res = "";
                if (!!fieldName) {
                    res = jriapp_shared_40.LocaleSTRS.VALIDATE.errorField + " " + fieldName;
                }
                info.errors.forEach(function (str) {
                    if (!!res)
                        res = res + " -> " + str;
                    else
                        res = str;
                });
                tip.push("<li>" + res + "</li>");
                res = "";
            });
            tip.push("</ul>");
            return tip.join("");
        };
        DataFormElView.prototype._updateErrorUI = function (el, errors) {
            if (!el) {
                return;
            }
            var $el = this.$el;
            if (!!errors && errors.length > 0) {
                var $img = jquery_18.$("<div data-name=\"error_info\" class=\"" + exports.css.error + "\" />");
                $el.prepend($img);
                generic_15.fn_addToolTip($img, this._getErrorTipInfo(errors), true);
                this._setFieldError(true);
            }
            else {
                $el.children('div[data-name="error_info"]').remove();
                this._setFieldError(false);
            }
        };
        DataFormElView.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            if (!!this._form && !this._form.getIsDestroyCalled()) {
                this._form.destroy();
            }
            this._form = null;
            _super.prototype.destroy.call(this);
        };
        DataFormElView.prototype.toString = function () {
            return "DataFormElView";
        };
        Object.defineProperty(DataFormElView.prototype, "dataContext", {
            get: function () {
                if (this._isDestroyCalled)
                    return null;
                return this._form.dataContext;
            },
            set: function (v) {
                if (this._isDestroyCalled)
                    return;
                if (this.dataContext !== v) {
                    this._form.dataContext = v;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataFormElView.prototype, "form", {
            get: function () { return this._form; },
            enumerable: true,
            configurable: true
        });
        return DataFormElView;
    }(generic_15.BaseElView));
    exports.DataFormElView = DataFormElView;
    boot.registerElView(const_25.ELVIEW_NM.DataForm, DataFormElView);
});
define("jriapp_ui/datepicker", ["require", "exports", "jriapp/bootstrap", "jriapp_ui/textbox"], function (require, exports, bootstrap_21, textbox_3) {
    "use strict";
    var boot = bootstrap_21.bootstrap;
    var PROP_NAME = {
        dateFormat: "dateFormat",
        datepickerRegion: "datepickerRegion"
    };
    var DatePickerElView = (function (_super) {
        __extends(DatePickerElView, _super);
        function DatePickerElView(options) {
            _super.call(this, options);
            var $el = this.$el;
            boot.defaults.datepicker.attachTo($el, options.datepicker);
        }
        DatePickerElView.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            var $el = this.$el;
            boot.defaults.datepicker.detachFrom($el);
            _super.prototype.destroy.call(this);
        };
        DatePickerElView.prototype.toString = function () {
            return "DatePickerElView";
        };
        return DatePickerElView;
    }(textbox_3.TextBoxElView));
    exports.DatePickerElView = DatePickerElView;
    boot.registerElView("datepicker", DatePickerElView);
});
define("jriapp_ui/anchor", ["require", "exports", "jriapp_shared", "jriapp/bootstrap", "jriapp_ui/generic", "jriapp_ui/command"], function (require, exports, jriapp_shared_41, bootstrap_22, generic_16, command_2) {
    "use strict";
    var dom = jriapp_shared_41.Utils.dom, boot = bootstrap_22.bootstrap;
    var AnchorElView = (function (_super) {
        __extends(AnchorElView, _super);
        function AnchorElView(options) {
            _super.call(this, options);
            var self = this;
            this._imageSrc = null;
            this._image = null;
            this._span = null;
            this._glyph = null;
            if (!!options.imageSrc)
                this.imageSrc = options.imageSrc;
            if (!!options.glyph)
                this.glyph = options.glyph;
            dom.addClass([this.el], generic_16.css.commandLink);
            this.$el.on("click." + this.uniqueID, function (e) {
                self._onClick(e);
            });
        }
        AnchorElView.prototype._onClick = function (e) {
            if (this.stopPropagation)
                e.stopPropagation();
            if (this.preventDefault)
                e.preventDefault();
            this.invokeCommand(null, true);
        };
        AnchorElView.prototype._updateImage = function (src) {
            var $a = this.$el, self = this;
            if (this._imageSrc === src)
                return;
            this._imageSrc = src;
            if (!!this._image && !src) {
                dom.removeNode(this._image);
                this._image = null;
                return;
            }
            if (!!src) {
                if (!this._image) {
                    $a.empty();
                    this._image = new Image();
                    $a[0].appendChild(this._image);
                }
                this._image.src = src;
            }
        };
        AnchorElView.prototype._updateGlyph = function (glyph) {
            var $a = this.$el;
            if (this._glyph === glyph)
                return;
            var oldGlyph = this._glyph;
            this._glyph = glyph;
            if (!!oldGlyph && !glyph) {
                dom.removeNode(this._span);
                return;
            }
            if (!!glyph) {
                if (!this._span) {
                    $a.empty();
                    this._span = dom.document.createElement("span");
                    $a[0].appendChild(this._span);
                }
                if (!!oldGlyph) {
                    dom.removeClass([this._span], oldGlyph);
                }
                dom.addClass([this._span], glyph);
            }
        };
        AnchorElView.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            dom.removeClass([this.el], generic_16.css.commandLink);
            this.imageSrc = null;
            this.glyph = null;
            _super.prototype.destroy.call(this);
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
                    this.raisePropertyChanged(generic_16.PROP_NAME.imageSrc);
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
                    this.raisePropertyChanged(generic_16.PROP_NAME.glyph);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnchorElView.prototype, "html", {
            get: function () {
                return this.$el.html();
            },
            set: function (v) {
                var x = this.$el.html();
                if (v === null)
                    v = "";
                else
                    v = "" + v;
                if (x !== v) {
                    this.$el.html(v);
                    this.raisePropertyChanged(generic_16.PROP_NAME.html);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnchorElView.prototype, "text", {
            get: function () {
                return this.$el.text();
            },
            set: function (v) {
                var x = this.$el.text();
                if (v === null)
                    v = "";
                else
                    v = "" + v;
                if (x !== v) {
                    this.$el.text(v);
                    this.raisePropertyChanged(generic_16.PROP_NAME.text);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AnchorElView.prototype, "href", {
            get: function () {
                return this.$el.prop("href");
            },
            set: function (v) {
                var x = this.href;
                if (v === null)
                    v = "";
                else
                    v = "" + v;
                if (x !== v) {
                    this.$el.prop("href", v);
                    this.raisePropertyChanged(generic_16.PROP_NAME.href);
                }
            },
            enumerable: true,
            configurable: true
        });
        return AnchorElView;
    }(command_2.CommandElView));
    exports.AnchorElView = AnchorElView;
    boot.registerElView("a", AnchorElView);
    boot.registerElView("abutton", AnchorElView);
});
define("jriapp_ui/block", ["require", "exports", "jriapp/bootstrap", "jriapp_ui/generic", "jriapp_ui/span"], function (require, exports, bootstrap_23, generic_17, span_2) {
    "use strict";
    var boot = bootstrap_23.bootstrap;
    var BlockElView = (function (_super) {
        __extends(BlockElView, _super);
        function BlockElView() {
            _super.apply(this, arguments);
        }
        BlockElView.prototype.toString = function () {
            return "BlockElView";
        };
        Object.defineProperty(BlockElView.prototype, "width", {
            get: function () {
                var $el = this.$el;
                return $el.width();
            },
            set: function (v) {
                var $el = this.$el;
                var x = $el.width();
                if (v !== x) {
                    $el.width(v);
                    this.raisePropertyChanged(generic_17.PROP_NAME.width);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BlockElView.prototype, "height", {
            get: function () {
                var $el = this.$el;
                return $el.height();
            },
            set: function (v) {
                var $el = this.$el;
                var x = $el.height();
                if (v !== x) {
                    $el.height(v);
                    this.raisePropertyChanged(generic_17.PROP_NAME.height);
                }
            },
            enumerable: true,
            configurable: true
        });
        return BlockElView;
    }(span_2.SpanElView));
    exports.BlockElView = BlockElView;
    boot.registerElView("block", BlockElView);
    boot.registerElView("div", BlockElView);
    boot.registerElView("section", BlockElView);
});
define("jriapp_ui/busy", ["require", "exports", "jriapp_shared", "jriapp/utils/jquery", "jriapp/const", "jriapp/bootstrap", "jriapp_ui/generic"], function (require, exports, jriapp_shared_42, jquery_19, const_26, bootstrap_24, generic_18) {
    "use strict";
    var checks = jriapp_shared_42.Utils.check, boot = bootstrap_24.bootstrap;
    var BusyElView = (function (_super) {
        __extends(BusyElView, _super);
        function BusyElView(options) {
            _super.call(this, options);
            var img;
            if (!!options.img)
                img = options.img;
            else
                img = const_26.LOADER_GIF.Default;
            this._delay = 400;
            this._timeOut = null;
            if (!checks.isNt(options.delay))
                this._delay = parseInt("" + options.delay);
            this._loaderPath = bootstrap_24.bootstrap.getImagePath(img);
            this._$loader = jquery_19.$(new Image());
            this._$loader.css({ position: "absolute", display: "none", zIndex: "10000" });
            this._$loader.prop("src", this._loaderPath);
            this._$loader.appendTo(this.el);
            this._isBusy = false;
        }
        BusyElView.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            if (!!this._timeOut) {
                clearTimeout(this._timeOut);
                this._timeOut = null;
            }
            this._$loader.remove();
            this._$loader = null;
            _super.prototype.destroy.call(this);
        };
        BusyElView.prototype.toString = function () {
            return "BusyElView";
        };
        Object.defineProperty(BusyElView.prototype, "isBusy", {
            get: function () { return this._isBusy; },
            set: function (v) {
                var self = this, fn = function () {
                    self._timeOut = null;
                    self._$loader.show();
                    self._$loader.position({
                        "of": jquery_19.$(self.el)
                    });
                };
                if (v !== self._isBusy) {
                    self._isBusy = v;
                    if (self._isBusy) {
                        if (!!self._timeOut) {
                            clearTimeout(self._timeOut);
                            self._timeOut = null;
                        }
                        if (self._delay > 0) {
                            self._timeOut = setTimeout(fn, self._delay);
                        }
                        else
                            fn();
                    }
                    else {
                        if (!!self._timeOut) {
                            clearTimeout(self._timeOut);
                            self._timeOut = null;
                        }
                        else
                            self._$loader.hide();
                    }
                    self.raisePropertyChanged(generic_18.PROP_NAME.isBusy);
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
                    this.raisePropertyChanged(generic_18.PROP_NAME.delay);
                }
            },
            enumerable: true,
            configurable: true
        });
        return BusyElView;
    }(generic_18.BaseElView));
    exports.BusyElView = BusyElView;
    boot.registerElView("busy", BusyElView);
    boot.registerElView("busy_indicator", BusyElView);
});
define("jriapp_ui/button", ["require", "exports", "jriapp/bootstrap", "jriapp_ui/generic", "jriapp_ui/command"], function (require, exports, bootstrap_25, generic_19, command_3) {
    "use strict";
    var boot = bootstrap_25.bootstrap;
    var ButtonElView = (function (_super) {
        __extends(ButtonElView, _super);
        function ButtonElView(options) {
            _super.call(this, options);
            var self = this;
            this.$el.on("click." + this.uniqueID, function (e) {
                self._onClick(e);
            });
        }
        ButtonElView.prototype._onClick = function (e) {
            if (this.stopPropagation)
                e.stopPropagation();
            if (this.preventDefault)
                e.preventDefault();
            this.invokeCommand(null, true);
        };
        ButtonElView.prototype.toString = function () {
            return "ButtonElView";
        };
        Object.defineProperty(ButtonElView.prototype, "value", {
            get: function () {
                return this.$el.val();
            },
            set: function (v) {
                var x = this.$el.val();
                if (v === null)
                    v = "";
                else
                    v = "" + v;
                if (x !== v) {
                    this.$el.val(v);
                    this.raisePropertyChanged(generic_19.PROP_NAME.value);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ButtonElView.prototype, "text", {
            get: function () {
                return this.$el.text();
            },
            set: function (v) {
                var x = this.$el.text();
                if (v === null)
                    v = "";
                else
                    v = "" + v;
                if (x !== v) {
                    this.$el.text(v);
                    this.raisePropertyChanged(generic_19.PROP_NAME.text);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ButtonElView.prototype, "html", {
            get: function () {
                return this.$el.html();
            },
            set: function (v) {
                var x = this.$el.html();
                if (v === null)
                    v = "";
                else
                    v = "" + v;
                if (x !== v) {
                    this.$el.html(v);
                    this.raisePropertyChanged(generic_19.PROP_NAME.html);
                }
            },
            enumerable: true,
            configurable: true
        });
        return ButtonElView;
    }(command_3.CommandElView));
    exports.ButtonElView = ButtonElView;
    boot.registerElView("input:button", ButtonElView);
    boot.registerElView("input:submit", ButtonElView);
    boot.registerElView("button", ButtonElView);
});
define("jriapp_ui/checkbox3", ["require", "exports", "jriapp_shared", "jriapp/bootstrap", "jriapp_ui/input", "jriapp_ui/generic"], function (require, exports, jriapp_shared_43, bootstrap_26, input_3, generic_20) {
    "use strict";
    var checks = jriapp_shared_43.Utils.check, dom = jriapp_shared_43.Utils.dom, boot = bootstrap_26.bootstrap;
    var CheckBoxThreeStateElView = (function (_super) {
        __extends(CheckBoxThreeStateElView, _super);
        function CheckBoxThreeStateElView(options) {
            _super.call(this, options);
            var self = this;
            var chk = this.el;
            this._checked = null;
            chk.checked = false;
            chk.indeterminate = this._checked === null;
            this.$el.on("click." + this.uniqueID, function (e) {
                e.stopPropagation();
                if (self.checked === null)
                    self.checked = true;
                else
                    self.checked = !self.checked ? null : false;
            });
            this._updateState();
        }
        CheckBoxThreeStateElView.prototype._updateState = function () {
            dom.setClass(this.$el.toArray(), generic_20.css.checkedNull, !checks.isNt(this.checked));
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
                    this.raisePropertyChanged(generic_20.PROP_NAME.checked);
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
define("jriapp_ui/expander", ["require", "exports", "jriapp/bootstrap", "jriapp_ui/anchor"], function (require, exports, bootstrap_27, anchor_1) {
    "use strict";
    exports.PROP_NAME = {
        isExpanded: "isExpanded"
    };
    var COLLAPSE_IMG = "collapse.jpg", EXPAND_IMG = "expand.jpg";
    var ExpanderElView = (function (_super) {
        __extends(ExpanderElView, _super);
        function ExpanderElView(options) {
            var expandedsrc = options.expandedsrc || bootstrap_27.bootstrap.getImagePath(COLLAPSE_IMG);
            var collapsedsrc = options.collapsedsrc || bootstrap_27.bootstrap.getImagePath(EXPAND_IMG);
            var isExpanded = !!options.isExpanded;
            options.imageSrc = null;
            _super.call(this, options);
            this._expandedsrc = expandedsrc;
            this._collapsedsrc = collapsedsrc;
            this.isExpanded = isExpanded;
        }
        ExpanderElView.prototype.refresh = function () {
            if (this.getIsDestroyCalled())
                return;
            this.imageSrc = this._isExpanded ? this._expandedsrc : this._collapsedsrc;
        };
        ExpanderElView.prototype._onCommandChanged = function () {
            _super.prototype._onCommandChanged.call(this);
            this.invokeCommand();
        };
        ExpanderElView.prototype._onClick = function (e) {
            if (this.preventDefault)
                e.preventDefault();
            this.isExpanded = !this.isExpanded;
        };
        ExpanderElView.prototype.invokeCommand = function () {
            this.refresh();
            _super.prototype.invokeCommand.call(this, null, true);
        };
        ExpanderElView.prototype.toString = function () {
            return "ExpanderElView";
        };
        Object.defineProperty(ExpanderElView.prototype, "isExpanded", {
            get: function () { return this._isExpanded; },
            set: function (v) {
                if (this._isExpanded !== v) {
                    this._isExpanded = v;
                    this.invokeCommand();
                    this.raisePropertyChanged(exports.PROP_NAME.isExpanded);
                }
            },
            enumerable: true,
            configurable: true
        });
        return ExpanderElView;
    }(anchor_1.AnchorElView));
    exports.ExpanderElView = ExpanderElView;
    bootstrap_27.bootstrap.registerElView("expander", ExpanderElView);
});
define("jriapp_ui/hidden", ["require", "exports", "jriapp/bootstrap", "jriapp_ui/input"], function (require, exports, bootstrap_28, input_4) {
    "use strict";
    var HiddenElView = (function (_super) {
        __extends(HiddenElView, _super);
        function HiddenElView() {
            _super.apply(this, arguments);
        }
        HiddenElView.prototype.toString = function () {
            return "HiddenElView";
        };
        return HiddenElView;
    }(input_4.InputElView));
    exports.HiddenElView = HiddenElView;
    bootstrap_28.bootstrap.registerElView("input:hidden", HiddenElView);
});
define("jriapp_ui/img", ["require", "exports", "jriapp/bootstrap", "jriapp_ui/generic"], function (require, exports, bootstrap_29, generic_21) {
    "use strict";
    var ImgElView = (function (_super) {
        __extends(ImgElView, _super);
        function ImgElView(options) {
            _super.call(this, options);
        }
        ImgElView.prototype.toString = function () {
            return "ImgElView";
        };
        Object.defineProperty(ImgElView.prototype, "src", {
            get: function () { return this.$el.prop("src"); },
            set: function (v) {
                var x = this.src;
                if (x !== v) {
                    this.$el.prop("src", v);
                    this.raisePropertyChanged(generic_21.PROP_NAME.src);
                }
            },
            enumerable: true,
            configurable: true
        });
        return ImgElView;
    }(generic_21.BaseElView));
    exports.ImgElView = ImgElView;
    bootstrap_29.bootstrap.registerElView("img", ImgElView);
});
define("jriapp_ui/radio", ["require", "exports", "jriapp_shared", "jriapp/bootstrap", "jriapp_ui/generic", "jriapp_ui/checkbox"], function (require, exports, jriapp_shared_44, bootstrap_30, generic_22, checkbox_2) {
    "use strict";
    var checks = jriapp_shared_44.Utils.check;
    var RadioElView = (function (_super) {
        __extends(RadioElView, _super);
        function RadioElView() {
            _super.apply(this, arguments);
        }
        RadioElView.prototype.toString = function () {
            return "RadioElView";
        };
        Object.defineProperty(RadioElView.prototype, "value", {
            get: function () { return this.$el.val(); },
            set: function (v) {
                var strv = checks.isNt(v) ? "" : ("" + v);
                if (strv !== this.$el.val()) {
                    this.$el.val(strv);
                    this.raisePropertyChanged(generic_22.PROP_NAME.value);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RadioElView.prototype, "name", {
            get: function () { return this.$el.prop("name"); },
            enumerable: true,
            configurable: true
        });
        return RadioElView;
    }(checkbox_2.CheckBoxElView));
    exports.RadioElView = RadioElView;
    bootstrap_30.bootstrap.registerElView("input:radio", RadioElView);
});
define("jriapp_ui", ["require", "exports", "jriapp/bootstrap", "jriapp_ui/content/all", "jriapp_ui/dialog", "jriapp_ui/dynacontent", "jriapp_ui/datagrid/datagrid", "jriapp_ui/pager", "jriapp_ui/listbox", "jriapp_ui/stackpanel", "jriapp_ui/tabs", "jriapp_ui/generic", "jriapp_ui/template", "jriapp_ui/dataform", "jriapp_ui/datepicker", "jriapp_ui/anchor", "jriapp_ui/block", "jriapp_ui/busy", "jriapp_ui/button", "jriapp_ui/checkbox", "jriapp_ui/checkbox3", "jriapp_ui/command", "jriapp_ui/expander", "jriapp_ui/hidden", "jriapp_ui/img", "jriapp_ui/input", "jriapp_ui/radio", "jriapp_ui/span", "jriapp_ui/textarea", "jriapp_ui/textbox", "jriapp_ui/utils/dblclick", "jriapp_ui/content/all"], function (require, exports, bootstrap_31, all_1, dialog_2, dynacontent_1, datagrid_1, pager_1, listbox_4, stackpanel_1, tabs_1, generic_23, template_9, dataform_1, datepicker_1, anchor_2, block_1, busy_1, button_1, checkbox_3, checkbox3_1, command_4, expander_4, hidden_1, img_1, input_5, radio_1, span_3, textarea_2, textbox_4, dblclick_2, all_2) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
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
    exports.ListBox = listbox_4.ListBox;
    exports.ListBoxElView = listbox_4.ListBoxElView;
    __export(stackpanel_1);
    __export(tabs_1);
    exports.BaseElView = generic_23.BaseElView;
    exports.fn_addToolTip = generic_23.fn_addToolTip;
    exports.TemplateElView = template_9.TemplateElView;
    exports.DataForm = dataform_1.DataForm;
    exports.DataFormElView = dataform_1.DataFormElView;
    exports.DatePickerElView = datepicker_1.DatePickerElView;
    exports.AnchorElView = anchor_2.AnchorElView;
    exports.BlockElView = block_1.BlockElView;
    exports.BusyElView = busy_1.BusyElView;
    exports.ButtonElView = button_1.ButtonElView;
    exports.CheckBoxElView = checkbox_3.CheckBoxElView;
    exports.CheckBoxThreeStateElView = checkbox3_1.CheckBoxThreeStateElView;
    exports.CommandElView = command_4.CommandElView;
    exports.ExpanderElView = expander_4.ExpanderElView;
    exports.HiddenElView = hidden_1.HiddenElView;
    exports.ImgElView = img_1.ImgElView;
    exports.InputElView = input_5.InputElView;
    exports.RadioElView = radio_1.RadioElView;
    exports.SpanElView = span_3.SpanElView;
    exports.TextAreaElView = textarea_2.TextAreaElView;
    exports.TextBoxElView = textbox_4.TextBoxElView;
    exports.DblClick = dblclick_2.DblClick;
    __export(all_2);
    all_1.initContentFactory();
    bootstrap_31.bootstrap.loadOwnStyle("jriapp_ui");
});
