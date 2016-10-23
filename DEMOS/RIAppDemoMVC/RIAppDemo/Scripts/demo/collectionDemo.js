var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "jriapp", "./demoDB", "common"], function (require, exports, RIAPP, DEMODB, COMMON) {
    "use strict";
    var bootstrap = RIAPP.bootstrap, utils = RIAPP.Utils, $ = utils.dom.$;
    var RadioValueConverter = (function (_super) {
        __extends(RadioValueConverter, _super);
        function RadioValueConverter() {
            _super.apply(this, arguments);
        }
        RadioValueConverter.prototype.convertToSource = function (val, param, dataContext) {
            return !!val ? param : undefined;
        };
        RadioValueConverter.prototype.convertToTarget = function (val, param, dataContext) {
            return (val == param) ? true : false;
        };
        return RadioValueConverter;
    }(RIAPP.BaseConverter));
    exports.RadioValueConverter = RadioValueConverter;
    var RadioDemoVM = (function (_super) {
        __extends(RadioDemoVM, _super);
        function RadioDemoVM(app) {
            _super.call(this, app);
            var self = this;
            this._radioValue = null;
            this._radioValues = new DEMODB.RadioValDictionary();
            this._radioValues.fillItems([{ key: 'radioValue1', value: 'This is some text value #1', comment: 'This is some comment for value #1' },
                { key: 'radioValue2', value: 'This is some text value #2', comment: 'This is some comment for value #2' },
                { key: 'radioValue3', value: 'This is some text value #3', comment: 'This is some comment for value #3' },
                { key: 'radioValue4', value: 'This is some text value #4', comment: 'This is some comment for value #4' }], false);
            this._testDict = new DEMODB.TestDictionary();
            this._testDict.fillItems([{ Key: 'one', SomeProperty1: 'some text one', SomeProperty2: [1, 2, 3], SomeProperty3: ['abc', 'fds'], MoreComplexProperty: null, EnumProperty: DEMODB.TestEnum.OK },
                { Key: 'two', SomeProperty1: 'some text two', SomeProperty2: [4, 5, 3], SomeProperty3: ['abc', 'fds'], MoreComplexProperty: null, EnumProperty: DEMODB.TestEnum.Error },
                { Key: 'thee', SomeProperty1: 'some text three', SomeProperty2: [6, 7, 8], SomeProperty3: ['abc', 'fds'], MoreComplexProperty: null, EnumProperty: DEMODB.TestEnum.OK },
                { Key: 'four', SomeProperty1: 'some text four', SomeProperty2: [2, 5, 7], SomeProperty3: ['abc', 'fds'], MoreComplexProperty: null, EnumProperty: DEMODB.TestEnum.OK }
            ], true);
        }
        RadioDemoVM.prototype._getEventNames = function () {
            var base_events = _super.prototype._getEventNames.call(this);
            return ['radio_value_changed'].concat(base_events);
        };
        RadioDemoVM.prototype._onRadioValueChanged = function () {
            this.raiseEvent('radio_value_changed', { value: this.radioValue });
        };
        Object.defineProperty(RadioDemoVM.prototype, "radioValue", {
            get: function () { return this._radioValue; },
            set: function (v) {
                if (this._radioValue !== v) {
                    this._radioValue = v;
                    this.raisePropertyChanged('radioValue');
                    this._onRadioValueChanged();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RadioDemoVM.prototype, "radioValues", {
            get: function () { return this._radioValues; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RadioDemoVM.prototype, "testDict", {
            get: function () { return this._testDict; },
            enumerable: true,
            configurable: true
        });
        return RadioDemoVM;
    }(RIAPP.ViewModel));
    exports.RadioDemoVM = RadioDemoVM;
    var RadioDemo2VM = (function (_super) {
        __extends(RadioDemo2VM, _super);
        function RadioDemo2VM(app, currentValue) {
            _super.call(this, app);
            var self = this;
            if (!!currentValue)
                this.radioValue = currentValue;
            this._historyList = new DEMODB.HistoryList();
            this._historyList.addOnPropertyChange('count', function (s, a) {
                self._clearListCommand.raiseCanExecuteChanged();
            }, this.uniqueID);
            this._clearListCommand = new RIAPP.Command(function (sender, param) {
                self.radioValue = null;
                self.clearList();
            }, self, function (sender, param) {
                return self._historyList.count > 0;
            });
        }
        RadioDemo2VM.prototype._onRadioValueChanged = function () {
            _super.prototype._onRadioValueChanged.call(this);
            var item = this._historyList.addNew();
            item.radioValue = this.radioValue;
            item.time = new Date();
            item._aspect.endEdit();
        };
        RadioDemo2VM.prototype.clearList = function () {
            this._historyList.clear();
        };
        Object.defineProperty(RadioDemo2VM.prototype, "historyList", {
            get: function () { return this._historyList; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RadioDemo2VM.prototype, "clearListCommand", {
            get: function () { return this._clearListCommand; },
            enumerable: true,
            configurable: true
        });
        return RadioDemo2VM;
    }(RadioDemoVM));
    exports.RadioDemo2VM = RadioDemo2VM;
    var DemoApplication = (function (_super) {
        __extends(DemoApplication, _super);
        function DemoApplication(options) {
            _super.call(this, options);
            var self = this;
            this._errorVM = null;
            this._demoVM = null;
        }
        DemoApplication.prototype.onStartUp = function () {
            var self = this;
            this._errorVM = new COMMON.ErrorViewModel(this);
            this._demoVM = new RadioDemo2VM(this);
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
                self._demoVM.destroy();
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
        Object.defineProperty(DemoApplication.prototype, "demoVM", {
            get: function () { return this._demoVM; },
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
    function initModule(app) {
        app.registerConverter('radioValueConverter', new RadioValueConverter());
    }
    ;
    exports.appOptions = {
        modulesInits: {
            "COMMON": COMMON.initModule,
            "COLLDEMO": initModule
        }
    };
});
