var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
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
            _this._debounce = new RIAPP.Debounce();
            return _this;
        }
        ReactElView.prototype.viewMounted = function () {
            this.render();
            this.watchChanges();
        };
        ReactElView.prototype.checkRender = function () {
            var _this = this;
            this._debounce.enque(function () {
                if (_this._isDirty) {
                    _this.render();
                }
            });
        };
        ReactElView.prototype.onModelChanged = function () {
            this._isDirty = true;
            this.checkRender();
        };
        ReactElView.prototype.render = function () {
            var _this = this;
            if (this.getIsStateDirty()) {
                return;
            }
            if (this._isRendering) {
                return;
            }
            this._isRendering = true;
            this._isDirty = false;
            ReactDOM.render(this.getMarkup(), this.el, function () {
                _this._isRendering = false;
                _this.checkRender();
            });
        };
        ReactElView.prototype.dispose = function () {
            if (this.getIsDisposed())
                return;
            this.setDisposing();
            this._propWatcher.dispose();
            this._debounce.dispose();
            this._isDirty = false;
            this._isRendering = false;
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
define("components/tempview", ["require", "exports", "react", "reactview"], function (require, exports, React, reactview_1) {
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
                _this.onModelChanged();
            });
        };
        TempElView.prototype.getMarkup = function () {
            var _this = this;
            var model = { value: this.value, title: this.title }, styles = { spacer: spacerStyle, span: spanStyle }, actions = { tempChanged: function (temp) { _this.value = temp; } };
            return (React.createElement("fieldset", null,
                React.createElement("legend", null, model.title ? model.title : 'This is a React component'),
                React.createElement("input", { value: model.value, onChange: function (e) { return actions.tempChanged(e.target.value); } }),
                React.createElement("span", { style: styles.spacer }, "You entered: "),
                React.createElement("span", { style: styles.span }, model.value)));
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
define("components/pagerview", ["require", "exports", "react", "reactview", "components/pager"], function (require, exports, React, reactview_2, pager_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var PagerElView = (function (_super) {
        __extends(PagerElView, _super);
        function PagerElView(el, options) {
            var _this = _super.call(this, el, options) || this;
            _this._total = options.total || 20;
            _this._current = options.current || 7;
            _this._visiblePages = options.visiblePages || 6;
            return _this;
        }
        PagerElView.prototype.watchChanges = function () {
            var _this = this;
            this.propWatcher.addWatch(this, ["total", "current", "visiblePages"], function () {
                _this.onModelChanged();
            });
        };
        PagerElView.prototype.getMarkup = function () {
            var _this = this;
            var model = { total: this.total, current: this.current, visiblePages: this.visiblePages }, actions = { pageChanged: function (newPage) { _this.current = newPage; } };
            return (React.createElement(pager_1.default, { total: model.total, current: model.current, visiblePages: model.visiblePages, titles: { first: '<|', last: '|>' }, onPageChanged: function (newPage) { return actions.pageChanged(newPage); } }));
        };
        Object.defineProperty(PagerElView.prototype, "total", {
            get: function () {
                return this._total;
            },
            set: function (v) {
                if (this._total !== v) {
                    this._total = v;
                    this.objEvents.raiseProp("total");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PagerElView.prototype, "current", {
            get: function () {
                return this._current;
            },
            set: function (v) {
                if (this._current !== v) {
                    this._current = v;
                    this.objEvents.raiseProp("current");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PagerElView.prototype, "visiblePages", {
            get: function () {
                return this._visiblePages;
            },
            set: function (v) {
                if (this._visiblePages !== v) {
                    this._visiblePages = v;
                    this.objEvents.raiseProp("visiblePages");
                }
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
define("main", ["require", "exports", "jriapp", "app", "components/tempview", "components/pagerview"], function (require, exports, RIAPP, app_1, tempview_1, pagerview_1) {
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
