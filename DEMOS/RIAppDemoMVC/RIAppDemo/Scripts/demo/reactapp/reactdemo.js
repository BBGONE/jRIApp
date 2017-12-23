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
            this.objEvents.addOnError(function (sender, args) {
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
            var _this = _super.call(this, props) || this;
            _this._model = _this.props.model;
            _this._model.objEvents.onProp("value", function (s, a) {
                _this.forceUpdate();
            }, "tempreact");
            _this._spacerStyle = {
                display: 'inline-block',
                marginLeft: '15px',
                marginRight: '5px'
            };
            _this._spanStyle = {
                color: 'blue'
            };
            return _this;
        }
        Temperature.prototype.componentWillUnmount = function () {
            this._model.objEvents.offNS("tempreact");
            this._model = null;
        };
        Temperature.prototype.render = function () {
            var model = this.model;
            return (React.createElement("fieldset", null,
                React.createElement("legend", null, "This a React component"),
                React.createElement("input", { value: model.value, onChange: function (e) { return model.value = e.target.value; } }),
                React.createElement("span", { style: this._spacerStyle }, "You entered: "),
                React.createElement("span", { style: this._spanStyle }, model.value)));
        };
        Object.defineProperty(Temperature.prototype, "model", {
            get: function () {
                return this._model;
            },
            enumerable: true,
            configurable: true
        });
        return Temperature;
    }(React.Component));
    exports.Temperature = Temperature;
});
define("components/reactview", ["require", "exports", "jriapp_ui", "react", "react-dom", "components/temp"], function (require, exports, uiMOD, React, ReactDOM, temp_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ReactElView = (function (_super) {
        __extends(ReactElView, _super);
        function ReactElView(options) {
            var _this = _super.call(this, options) || this;
            _this._value = options.value || "25";
            return _this;
        }
        ReactElView.prototype.viewMounted = function () {
            this.render();
        };
        ReactElView.prototype.render = function () {
            var self = this;
            ReactDOM.render(React.createElement("div", null,
                React.createElement(temp_1.Temperature, { model: self })), self.el);
        };
        ReactElView.prototype.dispose = function () {
            if (this.getIsDisposed())
                return;
            this.setDisposing();
            ReactDOM.unmountComponentAtNode(this.el);
            _super.prototype.dispose.call(this);
        };
        Object.defineProperty(ReactElView.prototype, "value", {
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
        ReactElView.prototype.toString = function () {
            return "ReactElView";
        };
        return ReactElView;
    }(uiMOD.BaseElView));
    exports.ReactElView = ReactElView;
    function initModule(app) {
        app.registerElView("react", ReactElView);
    }
    exports.initModule = initModule;
});
define("main", ["require", "exports", "jriapp", "app", "components/reactview"], function (require, exports, RIAPP, app_1, reactview_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var bootstrap = RIAPP.bootstrap, utils = RIAPP.Utils;
    bootstrap.objEvents.addOnError(function (sender, args) {
        debugger;
        alert(args.error.message);
        args.isHandled = true;
    });
    function start(options) {
        options.modulesInits = utils.core.extend(options.modulesInits || {}, {
            "reactview": reactview_1.initModule
        });
        return bootstrap.startApp(function () {
            return new app_1.DemoApplication(options);
        });
    }
    exports.start = start;
});
