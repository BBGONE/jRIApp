var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "jriapp", "./demoDB", "./common"], function (require, exports, RIAPP, DEMODB, COMMON) {
    "use strict";
    var bootstrap = RIAPP.bootstrap, utils = RIAPP.Utils;
    var UppercaseConverter = (function (_super) {
        __extends(UppercaseConverter, _super);
        function UppercaseConverter() {
            _super.apply(this, arguments);
        }
        UppercaseConverter.prototype.convertToSource = function (val, param, dataContext) {
            if (utils.check.isString(val))
                return val.toLowerCase();
            else
                return val;
        };
        UppercaseConverter.prototype.convertToTarget = function (val, param, dataContext) {
            if (utils.check.isString(val))
                return val.toUpperCase();
            else
                return val;
        };
        return UppercaseConverter;
    }(RIAPP.BaseConverter));
    exports.UppercaseConverter = UppercaseConverter;
    var TestObject = (function (_super) {
        __extends(TestObject, _super);
        function TestObject(initPropValue) {
            _super.call(this);
            var self = this;
            this._testProperty1 = initPropValue;
            this._testProperty2 = null;
            this._testCommand = new RIAPP.Command(function (sender, args) {
                self._onTestCommandExecuted();
            }, self, function (sender, args) {
                return utils.check.isString(self.testProperty1) && self.testProperty1.length > 3;
            });
            this._month = new Date().getMonth() + 1;
            this._months = new DEMODB.KeyValDictionary();
            this._months.fillItems([{ key: 1, val: 'January' }, { key: 2, val: 'February' }, { key: 3, val: 'March' },
                { key: 4, val: 'April' }, { key: 5, val: 'May' }, { key: 6, val: 'June' },
                { key: 7, val: 'July' }, { key: 8, val: 'August' }, { key: 9, val: 'September' }, { key: 10, val: 'October' },
                { key: 11, val: 'November' }, { key: 12, val: 'December' }], true);
            this._format = 'PDF';
            this._formats = new DEMODB.StrKeyValDictionary();
            this._formats.fillItems([{ key: 'PDF', val: 'Acrobat Reader PDF' }, { key: 'WORD', val: 'MS Word DOC' }, { key: 'EXCEL', val: 'MS Excel XLS' }], true);
        }
        TestObject.prototype._onTestCommandExecuted = function () {
            alert(utils.str.format("testProperty1:{0}, format:{1}, month: {2}", this.testProperty1, this.format, this.month));
        };
        Object.defineProperty(TestObject.prototype, "testProperty1", {
            get: function () { return this._testProperty1; },
            set: function (v) {
                if (this._testProperty1 != v) {
                    this._testProperty1 = v;
                    this.raisePropertyChanged('testProperty1');
                    this._testCommand.raiseCanExecuteChanged();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TestObject.prototype, "testProperty2", {
            get: function () { return this._testProperty2; },
            set: function (v) {
                if (this._testProperty2 != v) {
                    this._testProperty2 = v;
                    this.raisePropertyChanged('testProperty2');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TestObject.prototype, "testCommand", {
            get: function () { return this._testCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TestObject.prototype, "testToolTip", {
            get: function () {
                return "Click the button to execute the command.<br/>" +
                    "P.S. <b>command is active when the testProperty length > 3</b>";
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TestObject.prototype, "format", {
            get: function () { return this._format; },
            set: function (v) {
                if (this._format !== v) {
                    this._format = v;
                    this.raisePropertyChanged('format');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TestObject.prototype, "formats", {
            get: function () { return this._formats; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TestObject.prototype, "month", {
            get: function () { return this._month; },
            set: function (v) {
                if (v !== this._month) {
                    this._month = v;
                    this.raisePropertyChanged('month');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TestObject.prototype, "months", {
            get: function () { return this._months; },
            enumerable: true,
            configurable: true
        });
        return TestObject;
    }(RIAPP.BaseObject));
    exports.TestObject = TestObject;
    var DemoApplication = (function (_super) {
        __extends(DemoApplication, _super);
        function DemoApplication(options) {
            _super.call(this, options);
            var self = this;
            this._errorVM = null;
            this._testObject = null;
        }
        DemoApplication.prototype.onStartUp = function () {
            var self = this;
            this._errorVM = new COMMON.ErrorViewModel(this);
            this._testObject = new TestObject('some initial text');
            this.addOnError(function (sender, data) {
                debugger;
                data.isHandled = true;
                self.errorVM.error = data.error;
                self.errorVM.showDialog();
            });
            _super.prototype.onStartUp.call(this);
        };
        DemoApplication.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            var self = this;
            try {
                self._errorVM.destroy();
                self._testObject.destroy();
                if (!!self.UC.createdBinding)
                    self.UC.createdBinding.destroy();
            }
            finally {
                _super.prototype.destroy.call(this);
            }
        };
        Object.defineProperty(DemoApplication.prototype, "errorVM", {
            get: function () { return this._errorVM; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DemoApplication.prototype, "TEXT", {
            get: function () { return RIAPP.LocaleSTRS.TEXT; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DemoApplication.prototype, "testObject", {
            get: function () { return this._testObject; },
            enumerable: true,
            configurable: true
        });
        return DemoApplication;
    }(RIAPP.Application));
    exports.DemoApplication = DemoApplication;
    bootstrap.addOnError(function (sender, args) {
        debugger;
        alert(args.error.message);
    });
    bootstrap.addOnUnResolvedBinding(function (s, args) {
        var msg = "unresolved databound property for";
        if (args.bindTo == 0) {
            msg += " Source: ";
        }
        else {
            msg += " Target: ";
        }
        msg += "'" + args.root + "'";
        msg += ", property: '" + args.propName + "'";
        msg += ", binding path: '" + args.path + "'";
        console.log(msg);
    });
    function initModule(app) {
        console.log("INIT MOdule");
        app.registerConverter('uppercaseConverter', new UppercaseConverter());
        return {};
    }
    ;
    exports.appOptions = {
        modulesInits: {
            "COMMON": COMMON.initModule,
            "BINDDEMO": initModule
        }
    };
});
