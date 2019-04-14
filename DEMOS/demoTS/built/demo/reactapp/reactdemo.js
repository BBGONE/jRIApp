var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
define("testobject", ["require", "exports", "jriapp"], function (require, exports, RIAPP) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TestObject = (function (_super) {
        __extends(TestObject, _super);
        function TestObject(app) {
            var _this = _super.call(this, app) || this;
            _this._temperature = "0";
            _this._page = 1;
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
        Object.defineProperty(TestObject.prototype, "page", {
            get: function () {
                return this._page;
            },
            set: function (v) {
                if (this._page !== v) {
                    this._page = v;
                    this.objEvents.raiseProp("page");
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
define("views/reactview", ["require", "exports", "jriapp", "jriapp_ui", "react-dom", "redux"], function (require, exports, RIAPP, uiMOD, react_dom_1, Redux) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function mergeOptions(options, defaults) {
        var ret = {};
        Object.keys(defaults).forEach(function (key) {
            if (!RIAPP.Utils.check.isNt(options[key]))
                ret[key] = options[key];
            else
                ret[key] = defaults[key];
        });
        return ret;
    }
    exports.mergeOptions = mergeOptions;
    var ReactElView = (function (_super) {
        __extends(ReactElView, _super);
        function ReactElView(el, options, reducer) {
            var _this = _super.call(this, el, options) || this;
            _this._isRendering = false;
            _this._isDirty = false;
            _this._isMounted = false;
            _this._store = Redux.createStore(reducer);
            _this._state = _this._store.getState();
            _this._unsubscribe = _this._store.subscribe(function () {
                if (_this.getIsStateDirty())
                    return;
                var previous = _this._state;
                var current = _this._store.getState();
                _this._state = current;
                if (_this.storeChanged(current, previous)) {
                    _this._renderView();
                }
            });
            return _this;
        }
        ReactElView.prototype._render = function () {
            var _this = this;
            if (this.getIsStateDirty()) {
                return;
            }
            if (this._isRendering) {
                this._isDirty = true;
                return;
            }
            this._isRendering = true;
            this._isDirty = false;
            react_dom_1.render(this.getMarkup(), this.el, function () {
                _this._isRendering = false;
                if (_this._isDirty) {
                    _this._render();
                }
            });
        };
        ReactElView.prototype._renderView = function () {
            this._isDirty = true;
            if (this._isMounted) {
                this._render();
            }
        };
        ReactElView.prototype.viewMounted = function () {
            this._isMounted = true;
            this._renderView();
        };
        ReactElView.prototype.dispatch = function (action) {
            this._store.dispatch(action);
        };
        ReactElView.prototype.dispose = function () {
            if (this.getIsDisposed())
                return;
            this.setDisposing();
            this._isRendering = false;
            this._isDirty = false;
            this._isMounted = false;
            this._unsubscribe();
            react_dom_1.unmountComponentAtNode(this.el);
            _super.prototype.dispose.call(this);
        };
        Object.defineProperty(ReactElView.prototype, "store", {
            get: function () {
                return this._store;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ReactElView.prototype, "state", {
            get: function () {
                return this._state;
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
define("abstractions/temp", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("actions/temp-actions", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function propertyChanged(name, value) {
        return { type: "CHANGE_PROP", name: name, value: value };
    }
    exports.propertyChanged = propertyChanged;
});
define("views/tempview", ["require", "exports", "react", "views/reactview", "actions/temp-actions"], function (require, exports, React, reactview_1, temp_actions_1) {
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
    var _reducer = function (initialState, state, action) {
        var _a;
        switch (action.type) {
            case "CHANGE_PROP":
                return __assign({}, state, (_a = {}, _a[action.name] = action.value, _a));
            default:
                return state || initialState;
        }
    };
    var reducer = function (initialState) { return function (state, action) { return _reducer(initialState, state, action); }; };
    var defaults = { value: "0", title: "" };
    var TempElView = (function (_super) {
        __extends(TempElView, _super);
        function TempElView(el, options) {
            var _this = this;
            var initialState = reactview_1.mergeOptions(options, defaults);
            _this = _super.call(this, el, options, reducer(initialState)) || this;
            return _this;
        }
        TempElView.prototype.storeChanged = function (current, previous) {
            var shouldRerender = false;
            if (current.title !== previous.title) {
                this.objEvents.raiseProp("title");
                shouldRerender = true;
            }
            if (current.value !== previous.value) {
                this.objEvents.raiseProp("value");
                shouldRerender = true;
            }
            return shouldRerender;
        };
        TempElView.prototype.getMarkup = function () {
            var _this = this;
            var model = this.state, styles = { spacer: spacerStyle, span: spanStyle }, actions = { tempChanged: function (temp) { _this.value = temp; } };
            return (React.createElement("fieldset", null,
                React.createElement("legend", null, model.title ? model.title : 'This is a React component'),
                React.createElement("input", { value: model.value, onChange: function (e) { return actions.tempChanged(e.target.value); } }),
                React.createElement("span", { style: styles.spacer }, "You entered: "),
                React.createElement("span", { style: styles.span }, model.value)));
        };
        Object.defineProperty(TempElView.prototype, "value", {
            get: function () {
                return this.state.value;
            },
            set: function (v) {
                this.dispatch(temp_actions_1.propertyChanged("value", v));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TempElView.prototype, "title", {
            get: function () {
                return this.state.title;
            },
            set: function (v) {
                this.dispatch(temp_actions_1.propertyChanged("title", v));
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
define("abstractions/pager", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("actions/pager-actions", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function propertyChanged(name, value) {
        return { type: "CHANGE_PROP", name: name, value: value };
    }
    exports.propertyChanged = propertyChanged;
});
define("components/pager", ["require", "exports", "react"], function (require, exports, React) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var BASE_SHIFT = 0;
    var TITLE_SHIFT = 1;
    var TITLES = {
        first: 'First',
        prev: '\u00AB',
        prevSet: '...',
        nextSet: '...',
        next: '\u00BB',
        last: 'Last'
    };
    var Pager = (function (_super) {
        __extends(Pager, _super);
        function Pager(props) {
            var _this = _super.call(this, props) || this;
            _this.handleFirstPage = _this.handleFirstPage.bind(_this);
            _this.handlePreviousPage = _this.handlePreviousPage.bind(_this);
            _this.handleNextPage = _this.handleNextPage.bind(_this);
            _this.handleLastPage = _this.handleLastPage.bind(_this);
            _this.handleMorePrevPages = _this.handleMorePrevPages.bind(_this);
            _this.handleMoreNextPages = _this.handleMoreNextPages.bind(_this);
            _this.handlePageChanged = _this.handlePageChanged.bind(_this);
            return _this;
        }
        Pager.prototype.getTitles = function (key) {
            return this.props.titles[key] || TITLES[key];
        };
        Pager.prototype.calcBlocks = function () {
            var props = this.props;
            var total = props.total;
            var blockSize = props.visiblePages;
            var current = props.current + TITLE_SHIFT;
            var blocks = Math.ceil(total / blockSize);
            var currBlock = Math.ceil(current / blockSize) - TITLE_SHIFT;
            return {
                total: blocks,
                current: currBlock,
                size: blockSize,
            };
        };
        Pager.prototype.isPrevDisabled = function () {
            return this.props.current <= BASE_SHIFT;
        };
        Pager.prototype.isNextDisabled = function () {
            return this.props.current >= (this.props.total - TITLE_SHIFT);
        };
        Pager.prototype.isPrevMoreHidden = function () {
            var blocks = this.calcBlocks();
            return (blocks.total === TITLE_SHIFT) || (blocks.current === BASE_SHIFT);
        };
        Pager.prototype.isNextMoreHidden = function () {
            var blocks = this.calcBlocks();
            return (blocks.total === TITLE_SHIFT) || (blocks.current === (blocks.total - TITLE_SHIFT));
        };
        Pager.prototype.visibleRange = function () {
            var blocks = this.calcBlocks();
            var start = blocks.current * blocks.size;
            var delta = this.props.total - start;
            var end = start + ((delta > blocks.size) ? blocks.size : delta);
            return [start + TITLE_SHIFT, end + TITLE_SHIFT];
        };
        Pager.prototype.handleFirstPage = function () {
            if (!this.isPrevDisabled()) {
                this.handlePageChanged(BASE_SHIFT);
            }
        };
        Pager.prototype.handlePreviousPage = function () {
            if (!this.isPrevDisabled()) {
                this.handlePageChanged(this.props.current - TITLE_SHIFT);
            }
        };
        Pager.prototype.handleNextPage = function () {
            if (!this.isNextDisabled()) {
                this.handlePageChanged(this.props.current + TITLE_SHIFT);
            }
        };
        Pager.prototype.handleLastPage = function () {
            if (!this.isNextDisabled()) {
                this.handlePageChanged(this.props.total - TITLE_SHIFT);
            }
        };
        Pager.prototype.handleMorePrevPages = function () {
            var blocks = this.calcBlocks();
            this.handlePageChanged((blocks.current * blocks.size) - TITLE_SHIFT);
        };
        Pager.prototype.handleMoreNextPages = function () {
            var blocks = this.calcBlocks();
            this.handlePageChanged((blocks.current + TITLE_SHIFT) * blocks.size);
        };
        Pager.prototype.handlePageChanged = function (num) {
            var handler = this.props.onPageChanged;
            if (!!handler)
                handler(num);
        };
        Pager.prototype.renderPages = function (pair) {
            var _this = this;
            return range(pair[0], pair[1]).map(function (num, idx) {
                var current = num - TITLE_SHIFT;
                var onClick = _this.handlePageChanged.bind(_this, current);
                var isActive = (_this.props.current === current);
                return (React.createElement(Page, { key: idx, index: idx, isActive: isActive, className: "btn-numbered-page", onClick: onClick }, num));
            });
        };
        Pager.prototype.render = function () {
            var titles = this.getTitles.bind(this);
            var className = "pagination";
            if (this.props.className) {
                className += " " + this.props.className;
            }
            return (React.createElement("nav", null,
                React.createElement("ul", { className: className },
                    React.createElement(Page, { className: "btn-first-page", key: "btn-first-page", isDisabled: this.isPrevDisabled(), onClick: this.handleFirstPage }, titles('first')),
                    React.createElement(Page, { className: "btn-prev-page", key: "btn-prev-page", isDisabled: this.isPrevDisabled(), onClick: this.handlePreviousPage }, titles('prev')),
                    React.createElement(Page, { className: "btn-prev-more", key: "btn-prev-more", isHidden: this.isPrevMoreHidden(), onClick: this.handleMorePrevPages }, titles('prevSet')),
                    this.renderPages(this.visibleRange()),
                    React.createElement(Page, { className: "btn-next-more", key: "btn-next-more", isHidden: this.isNextMoreHidden(), onClick: this.handleMoreNextPages }, titles('nextSet')),
                    React.createElement(Page, { className: "btn-next-page", key: "btn-next-page", isDisabled: this.isNextDisabled(), onClick: this.handleNextPage }, titles('next')),
                    React.createElement(Page, { className: "btn-last-page", key: "btn-last-page", isDisabled: this.isNextDisabled(), onClick: this.handleLastPage }, titles('last')))));
        };
        return Pager;
    }(React.Component));
    var Page = function (props) {
        if (props.isHidden)
            return null;
        var baseCss = props.className ? props.className + " " : '';
        var fullCss = "" + baseCss + (props.isActive ? ' active' : '') + (props.isDisabled ? ' disabled' : '');
        return (React.createElement("li", { key: props.index, className: fullCss },
            React.createElement("a", { onClick: props.onClick }, props.children)));
    };
    function range(start, end) {
        var res = [];
        for (var i = start; i < end; i++) {
            res.push(i);
        }
        return res;
    }
    exports.default = Pager;
});
define("components/connected-pager", ["require", "exports", "react-redux", "actions/pager-actions", "components/pager"], function (require, exports, react_redux_1, pager_actions_1, pager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var mapStateToProps = function (storeData) {
        return storeData;
    };
    var mapDispatchToProps = function (dispatch) {
        return {
            onPageChanged: function (newPage) {
                dispatch(pager_actions_1.propertyChanged("current", newPage));
            }
        };
    };
    exports.default = react_redux_1.connect(mapStateToProps, mapDispatchToProps)(pager_1.default);
});
define("views/pagerview", ["require", "exports", "react", "react-redux", "views/reactview", "actions/pager-actions", "components/connected-pager"], function (require, exports, React, react_redux_2, reactview_2, pager_actions_2, connected_pager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var _reducer = function (initialState, state, action) {
        var _a;
        switch (action.type) {
            case "CHANGE_PROP":
                return __assign({}, state, (_a = {}, _a[action.name] = action.value, _a));
            default:
                return state || initialState;
        }
    };
    var reducer = function (initialState) { return function (state, action) { return _reducer(initialState, state, action); }; };
    var defaults = { total: 20, current: 6, visiblePages: 7 };
    var PagerElView = (function (_super) {
        __extends(PagerElView, _super);
        function PagerElView(el, options) {
            var _this = this;
            var initialState = reactview_2.mergeOptions(options, defaults);
            _this = _super.call(this, el, options, reducer(initialState)) || this;
            return _this;
        }
        PagerElView.prototype.storeChanged = function (current, previous) {
            var shouldRerender = false;
            if (current.total !== previous.total) {
                this.objEvents.raiseProp("total");
            }
            if (current.current !== previous.current) {
                this.objEvents.raiseProp("current");
            }
            if (current.visiblePages !== previous.visiblePages) {
                this.objEvents.raiseProp("visiblePages");
            }
            return shouldRerender;
        };
        PagerElView.prototype.getMarkup = function () {
            return (React.createElement(react_redux_2.Provider, { store: this.store },
                React.createElement(connected_pager_1.default, { titles: { first: '<|', last: '|>' } })));
        };
        Object.defineProperty(PagerElView.prototype, "total", {
            get: function () {
                return this.state.total;
            },
            set: function (v) {
                this.dispatch(pager_actions_2.propertyChanged("total", v));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PagerElView.prototype, "current", {
            get: function () {
                return this.state.current;
            },
            set: function (v) {
                this.dispatch(pager_actions_2.propertyChanged("current", v));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PagerElView.prototype, "visiblePages", {
            get: function () {
                return this.state.visiblePages;
            },
            set: function (v) {
                this.dispatch(pager_actions_2.propertyChanged("visiblePages", v));
            },
            enumerable: true,
            configurable: true
        });
        PagerElView.prototype.toString = function () {
            return "PagerElView";
        };
        return PagerElView;
    }(reactview_2.ReactElView));
    exports.PagerElView = PagerElView;
    function initModule(app) {
        app.registerElView("pagerview", PagerElView);
    }
    exports.initModule = initModule;
});
define("main", ["require", "exports", "jriapp", "app", "views/tempview", "views/pagerview"], function (require, exports, RIAPP, app_1, tempview_1, pagerview_1) {
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
            "tempview": tempview_1.initModule,
            "pagerview": pagerview_1.initModule
        });
        return bootstrap.startApp(function () {
            return new app_1.DemoApplication(options);
        });
    }
    exports.start = start;
});
