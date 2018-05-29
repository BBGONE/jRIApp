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
define("testobject", ["require", "exports", "jriapp"], function (require, exports, RIAPP) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TestObject = (function (_super) {
        __extends(TestObject, _super);
        function TestObject(app) {
            var _this = _super.call(this, app) || this;
            _this._temperature = "0";
            return _this;
        }
        TestObject.prototype.dispose = function () {
            if (this.getIsDisposed()) {
                return;
            }
            this.setDisposing();
            _super.prototype.dispose.call(this);
        };
        Object.defineProperty(TestObject.prototype, "temperature", {
            get: function () {
                return this._temperature;
            },
            set: function (v) {
                if (this._temperature !== v) {
                    this._temperature = v;
                    this.objEvents.raiseProp("temperature");
                }
            },
            enumerable: true,
            configurable: true
        });
        return TestObject;
    }(RIAPP.ViewModel));
    exports.TestObject = TestObject;
});
define("app", ["require", "exports", "jriapp", "testobject"], function (require, exports, RIAPP, testobject_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DemoApplication = (function (_super) {
        __extends(DemoApplication, _super);
        function DemoApplication(options) {
            var _this = _super.call(this, options) || this;
            _this._testObj = null;
            return _this;
        }
        DemoApplication.prototype.onStartUp = function () {
            var self = this;
            this._testObj = new testobject_1.TestObject(this);
            this.objEvents.addOnError(function (_s, args) {
                debugger;
                args.isHandled = true;
                alert(args.error.message);
            });
            _super.prototype.onStartUp.call(this);
        };
        DemoApplication.prototype.dispose = function () {
            if (this.getIsDisposed())
                return;
            this.setDisposing();
        };
        Object.defineProperty(DemoApplication.prototype, "testObj", {
            get: function () {
                return this._testObj;
            },
            enumerable: true,
            configurable: true
        });
        return DemoApplication;
    }(RIAPP.Application));
    exports.DemoApplication = DemoApplication;
});
define("reactview", ["require", "exports", "jriapp", "jriapp_ui", "react-dom"], function (require, exports, RIAPP, uiMOD, ReactDOM) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ReactElView = (function (_super) {
        __extends(ReactElView, _super);
        function ReactElView() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._propWatcher = new RIAPP.PropWatcher();
            _this._isRendering = false;
            _this._isDirty = false;
            return _this;
        }
        ReactElView.prototype._onRendering = function () {
            this._isRendering = true;
            this._isDirty = false;
        };
        ReactElView.prototype._onRendered = function () {
            this._isRendering = false;
            if (this._isDirty) {
                this.render();
            }
        };
        ReactElView.prototype.viewMounted = function () {
            this.render();
            this.watchChanges();
        };
        ReactElView.prototype.render = function () {
            var _this = this;
            if (this.getIsStateDirty()) {
                return;
            }
            if (this._isRendering) {
                this._isDirty = true;
                return;
            }
            this._onRendering();
            ReactDOM.render(this.getMarkup(), this.el, function () { _this._onRendered(); });
        };
        ReactElView.prototype.dispose = function () {
            if (this.getIsDisposed())
                return;
            this.setDisposing();
            this._propWatcher.dispose();
            this._isDirty = false;
            ReactDOM.unmountComponentAtNode(this.el);
            _super.prototype.dispose.call(this);
        };
        Object.defineProperty(ReactElView.prototype, "propWatcher", {
            get: function () {
                return this._propWatcher;
            },
            enumerable: true,
            configurable: true
        });
        ReactElView.prototype.toString = function () {
            return "ReactElView";
        };
        return ReactElView;
    }(uiMOD.BaseElView));
    exports.ReactElView = ReactElView;
});
define("components/int", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("components/temp", ["require", "exports", "react"], function (require, exports, React) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Temperature = (function (_super) {
        __extends(Temperature, _super);
        function Temperature(props) {
            return _super.call(this, props) || this;
        }
        Temperature.prototype.componentWillUnmount = function () {
        };
        Temperature.prototype.render = function () {
            var model = this.props.model, styles = this.props.styles, actions = this.props.actions;
            return (React.createElement("fieldset", null,
                React.createElement("legend", null, model.title ? model.title : 'This is a React component'),
                React.createElement("input", { value: model.value, onChange: function (e) { return actions.tempChanged(e.target.value); } }),
                React.createElement("span", { style: styles.spacer }, "You entered: "),
                React.createElement("span", { style: styles.span }, model.value)));
        };
        return Temperature;
    }(React.Component));
    exports.Temperature = Temperature;
});
define("components/tempview", ["require", "exports", "react", "reactview", "components/temp"], function (require, exports, React, reactview_1, temp_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var spacerStyle = {
        display: 'inline-block',
        marginLeft: '15px',
        marginRight: '5px'
    };
    var spanStyle = {
        color: 'blue'
    };
    var TempElView = (function (_super) {
        __extends(TempElView, _super);
        function TempElView(el, options) {
            var _this = _super.call(this, el, options) || this;
            _this._value = options.value || "0";
            _this._title = "";
            return _this;
        }
        TempElView.prototype.watchChanges = function () {
            var _this = this;
            this.propWatcher.addWatch(this, ["value", "title"], function () {
                _this.render();
            });
        };
        TempElView.prototype.getMarkup = function () {
            var _this = this;
            var model = { value: this.value, title: this.title }, styles = { spacer: spacerStyle, span: spanStyle }, actions = { tempChanged: function (temp) { _this.value = temp; } };
            return (React.createElement("div", null,
                React.createElement(temp_1.Temperature, { model: model, styles: styles, actions: actions })));
        };
        Object.defineProperty(TempElView.prototype, "value", {
            get: function () {
                return this._value;
            },
            set: function (v) {
                if (this._value !== v) {
                    this._value = v;
                    this.objEvents.raiseProp("value");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TempElView.prototype, "title", {
            get: function () {
                return this._title;
            },
            set: function (v) {
                if (this._title !== v) {
                    this._title = v;
                    this.objEvents.raiseProp("title");
                }
            },
            enumerable: true,
            configurable: true
        });
        TempElView.prototype.toString = function () {
            return "TempElView";
        };
        return TempElView;
    }(reactview_1.ReactElView));
    exports.TempElView = TempElView;
    function initModule(app) {
        app.registerElView("tempview", TempElView);
    }
    exports.initModule = initModule;
});
define("main", ["require", "exports", "jriapp", "app", "components/tempview"], function (require, exports, RIAPP, app_1, tempview_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var bootstrap = RIAPP.bootstrap, utils = RIAPP.Utils;
    bootstrap.objEvents.addOnError(function (_s, args) {
        debugger;
        alert(args.error.message);
        args.isHandled = true;
    });
    function start(options) {
        options.modulesInits = utils.core.extend(options.modulesInits || {}, {
            "tempview": tempview_1.initModule
        });
        return bootstrap.startApp(function () {
            return new app_1.DemoApplication(options);
        });
    }
    exports.start = start;
});
