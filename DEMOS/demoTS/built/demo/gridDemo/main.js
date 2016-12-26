var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define("demo/demoDB", ["require", "exports", "jriapp", "jriapp_db"], function (require, exports, RIAPP, dbMOD) {
    "use strict";
    (function (TestEnum) {
        TestEnum[TestEnum["None"] = 0] = "None";
        TestEnum[TestEnum["OK"] = 1] = "OK";
        TestEnum[TestEnum["Error"] = 2] = "Error";
        TestEnum[TestEnum["Loading"] = 3] = "Loading";
    })(exports.TestEnum || (exports.TestEnum = {}));
    var TestEnum = exports.TestEnum;
    (function (TestEnum2) {
        TestEnum2[TestEnum2["None"] = 0] = "None";
        TestEnum2[TestEnum2["One"] = 1] = "One";
        TestEnum2[TestEnum2["Two"] = 2] = "Two";
        TestEnum2[TestEnum2["Three"] = 3] = "Three";
    })(exports.TestEnum2 || (exports.TestEnum2 = {}));
    var TestEnum2 = exports.TestEnum2;
    var TestModelListItem = (function (_super) {
        __extends(TestModelListItem, _super);
        function TestModelListItem() {
            _super.apply(this, arguments);
        }
        Object.defineProperty(TestModelListItem.prototype, "Key", {
            get: function () { return this._aspect._getProp('Key'); },
            set: function (v) { this._aspect._setProp('Key', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TestModelListItem.prototype, "SomeProperty1", {
            get: function () { return this._aspect._getProp('SomeProperty1'); },
            set: function (v) { this._aspect._setProp('SomeProperty1', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TestModelListItem.prototype, "SomeProperty2", {
            get: function () { return this._aspect._getProp('SomeProperty2'); },
            set: function (v) { this._aspect._setProp('SomeProperty2', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TestModelListItem.prototype, "SomeProperty3", {
            get: function () { return this._aspect._getProp('SomeProperty3'); },
            set: function (v) { this._aspect._setProp('SomeProperty3', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TestModelListItem.prototype, "MoreComplexProperty", {
            get: function () { return this._aspect._getProp('MoreComplexProperty'); },
            set: function (v) { this._aspect._setProp('MoreComplexProperty', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TestModelListItem.prototype, "EnumProperty", {
            get: function () { return this._aspect._getProp('EnumProperty'); },
            set: function (v) { this._aspect._setProp('EnumProperty', v); },
            enumerable: true,
            configurable: true
        });
        TestModelListItem.prototype.toString = function () {
            return 'TestModelListItem';
        };
        return TestModelListItem;
    }(RIAPP.CollectionItem));
    exports.TestModelListItem = TestModelListItem;
    var TestDictionary = (function (_super) {
        __extends(TestDictionary, _super);
        function TestDictionary() {
            _super.call(this, TestModelListItem, 'Key', [{ name: 'Key', dtype: 1 }, { name: 'SomeProperty1', dtype: 1 }, { name: 'SomeProperty2', dtype: 10 }, { name: 'SomeProperty3', dtype: 0 }, { name: 'MoreComplexProperty', dtype: 0 }, { name: 'EnumProperty', dtype: 0 }]);
        }
        TestDictionary.prototype.findItem = function (key) {
            return this.findByPK(RIAPP.Utils.arr.fromList(arguments));
        };
        TestDictionary.prototype.toString = function () {
            return 'TestDictionary';
        };
        return TestDictionary;
    }(RIAPP.BaseDictionary));
    exports.TestDictionary = TestDictionary;
    var TestList = (function (_super) {
        __extends(TestList, _super);
        function TestList() {
            _super.call(this, TestModelListItem, [{ name: 'Key', dtype: 1 }, { name: 'SomeProperty1', dtype: 1 }, { name: 'SomeProperty2', dtype: 10 }, { name: 'SomeProperty3', dtype: 0 }, { name: 'MoreComplexProperty', dtype: 0 }, { name: 'EnumProperty', dtype: 0 }]);
        }
        TestList.prototype.toString = function () {
            return 'TestList';
        };
        return TestList;
    }(RIAPP.BaseList));
    exports.TestList = TestList;
    var KeyValListItem = (function (_super) {
        __extends(KeyValListItem, _super);
        function KeyValListItem() {
            _super.apply(this, arguments);
        }
        Object.defineProperty(KeyValListItem.prototype, "key", {
            get: function () { return this._aspect._getProp('key'); },
            set: function (v) { this._aspect._setProp('key', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(KeyValListItem.prototype, "val", {
            get: function () { return this._aspect._getProp('val'); },
            set: function (v) { this._aspect._setProp('val', v); },
            enumerable: true,
            configurable: true
        });
        KeyValListItem.prototype.toString = function () {
            return 'KeyValListItem';
        };
        return KeyValListItem;
    }(RIAPP.CollectionItem));
    exports.KeyValListItem = KeyValListItem;
    var KeyValDictionary = (function (_super) {
        __extends(KeyValDictionary, _super);
        function KeyValDictionary() {
            _super.call(this, KeyValListItem, 'key', [{ name: 'key', dtype: 3 }, { name: 'val', dtype: 1 }]);
        }
        KeyValDictionary.prototype.findItem = function (key) {
            return this.findByPK(RIAPP.Utils.arr.fromList(arguments));
        };
        KeyValDictionary.prototype.toString = function () {
            return 'KeyValDictionary';
        };
        return KeyValDictionary;
    }(RIAPP.BaseDictionary));
    exports.KeyValDictionary = KeyValDictionary;
    var StrKeyValListItem = (function (_super) {
        __extends(StrKeyValListItem, _super);
        function StrKeyValListItem() {
            _super.apply(this, arguments);
        }
        Object.defineProperty(StrKeyValListItem.prototype, "key", {
            get: function () { return this._aspect._getProp('key'); },
            set: function (v) { this._aspect._setProp('key', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(StrKeyValListItem.prototype, "val", {
            get: function () { return this._aspect._getProp('val'); },
            set: function (v) { this._aspect._setProp('val', v); },
            enumerable: true,
            configurable: true
        });
        StrKeyValListItem.prototype.toString = function () {
            return 'StrKeyValListItem';
        };
        return StrKeyValListItem;
    }(RIAPP.CollectionItem));
    exports.StrKeyValListItem = StrKeyValListItem;
    var StrKeyValDictionary = (function (_super) {
        __extends(StrKeyValDictionary, _super);
        function StrKeyValDictionary() {
            _super.call(this, StrKeyValListItem, 'key', [{ name: 'key', dtype: 1 }, { name: 'val', dtype: 1 }]);
        }
        StrKeyValDictionary.prototype.findItem = function (key) {
            return this.findByPK(RIAPP.Utils.arr.fromList(arguments));
        };
        StrKeyValDictionary.prototype.toString = function () {
            return 'StrKeyValDictionary';
        };
        return StrKeyValDictionary;
    }(RIAPP.BaseDictionary));
    exports.StrKeyValDictionary = StrKeyValDictionary;
    var RadioValListItem = (function (_super) {
        __extends(RadioValListItem, _super);
        function RadioValListItem() {
            _super.apply(this, arguments);
        }
        Object.defineProperty(RadioValListItem.prototype, "key", {
            get: function () { return this._aspect._getProp('key'); },
            set: function (v) { this._aspect._setProp('key', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RadioValListItem.prototype, "value", {
            get: function () { return this._aspect._getProp('value'); },
            set: function (v) { this._aspect._setProp('value', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(RadioValListItem.prototype, "comment", {
            get: function () { return this._aspect._getProp('comment'); },
            set: function (v) { this._aspect._setProp('comment', v); },
            enumerable: true,
            configurable: true
        });
        RadioValListItem.prototype.toString = function () {
            return 'RadioValListItem';
        };
        return RadioValListItem;
    }(RIAPP.CollectionItem));
    exports.RadioValListItem = RadioValListItem;
    var RadioValDictionary = (function (_super) {
        __extends(RadioValDictionary, _super);
        function RadioValDictionary() {
            _super.call(this, RadioValListItem, 'key', [{ name: 'key', dtype: 1 }, { name: 'value', dtype: 1 }, { name: 'comment', dtype: 1 }]);
        }
        RadioValDictionary.prototype.findItem = function (key) {
            return this.findByPK(RIAPP.Utils.arr.fromList(arguments));
        };
        RadioValDictionary.prototype.toString = function () {
            return 'RadioValDictionary';
        };
        return RadioValDictionary;
    }(RIAPP.BaseDictionary));
    exports.RadioValDictionary = RadioValDictionary;
    var HistoryItemListItem = (function (_super) {
        __extends(HistoryItemListItem, _super);
        function HistoryItemListItem() {
            _super.apply(this, arguments);
        }
        Object.defineProperty(HistoryItemListItem.prototype, "radioValue", {
            get: function () { return this._aspect._getProp('radioValue'); },
            set: function (v) { this._aspect._setProp('radioValue', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(HistoryItemListItem.prototype, "time", {
            get: function () { return this._aspect._getProp('time'); },
            set: function (v) { this._aspect._setProp('time', v); },
            enumerable: true,
            configurable: true
        });
        HistoryItemListItem.prototype.toString = function () {
            return 'HistoryItemListItem';
        };
        return HistoryItemListItem;
    }(RIAPP.CollectionItem));
    exports.HistoryItemListItem = HistoryItemListItem;
    var HistoryList = (function (_super) {
        __extends(HistoryList, _super);
        function HistoryList() {
            _super.call(this, HistoryItemListItem, [{ name: 'radioValue', dtype: 1 }, { name: 'time', dtype: 6 }]);
        }
        HistoryList.prototype.toString = function () {
            return 'HistoryList';
        };
        return HistoryList;
    }(RIAPP.BaseList));
    exports.HistoryList = HistoryList;
    var Customer_ComplexProp1 = (function (_super) {
        __extends(Customer_ComplexProp1, _super);
        function Customer_ComplexProp1(name, parent) {
            _super.call(this, name, parent);
        }
        Object.defineProperty(Customer_ComplexProp1.prototype, "EmailAddress", {
            get: function () { return this.getValue('ComplexProp.ComplexProp.EmailAddress'); },
            set: function (v) { this.setValue('ComplexProp.ComplexProp.EmailAddress', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Customer_ComplexProp1.prototype, "Phone", {
            get: function () { return this.getValue('ComplexProp.ComplexProp.Phone'); },
            set: function (v) { this.setValue('ComplexProp.ComplexProp.Phone', v); },
            enumerable: true,
            configurable: true
        });
        Customer_ComplexProp1.prototype.toString = function () {
            return 'Customer_ComplexProp1';
        };
        return Customer_ComplexProp1;
    }(dbMOD.ChildComplexProperty));
    exports.Customer_ComplexProp1 = Customer_ComplexProp1;
    var Customer_ComplexProp = (function (_super) {
        __extends(Customer_ComplexProp, _super);
        function Customer_ComplexProp(name, owner) {
            _super.call(this, name, owner);
            this._ComplexProp = null;
        }
        Object.defineProperty(Customer_ComplexProp.prototype, "FirstName", {
            get: function () { return this.getValue('ComplexProp.FirstName'); },
            set: function (v) { this.setValue('ComplexProp.FirstName', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Customer_ComplexProp.prototype, "MiddleName", {
            get: function () { return this.getValue('ComplexProp.MiddleName'); },
            set: function (v) { this.setValue('ComplexProp.MiddleName', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Customer_ComplexProp.prototype, "LastName", {
            get: function () { return this.getValue('ComplexProp.LastName'); },
            set: function (v) { this.setValue('ComplexProp.LastName', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Customer_ComplexProp.prototype, "Name", {
            get: function () { return this.getEntity()._getCalcFieldVal('ComplexProp.Name'); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Customer_ComplexProp.prototype, "ComplexProp", {
            get: function () { if (!this._ComplexProp) {
                this._ComplexProp = new Customer_ComplexProp1('ComplexProp', this);
            } return this._ComplexProp; },
            enumerable: true,
            configurable: true
        });
        Customer_ComplexProp.prototype.toString = function () {
            return 'Customer_ComplexProp';
        };
        return Customer_ComplexProp;
    }(dbMOD.RootComplexProperty));
    exports.Customer_ComplexProp = Customer_ComplexProp;
    var AddressDb = (function (_super) {
        __extends(AddressDb, _super);
        function AddressDb(dbContext) {
            var opts = {
                dbContext: dbContext,
                dbSetInfo: { "fieldInfos": [], "enablePaging": false, "pageSize": 25, "dbSetName": "Address" },
                childAssoc: ([]),
                parentAssoc: ([{ "name": "CustAddrToAddress", "parentDbSetName": "Address", "childDbSetName": "CustomerAddress", "childToParentName": "Address", "parentToChildrenName": "CustomerAddresses", "onDeleteAction": 0, "fieldRels": [{ "parentField": "AddressID", "childField": "AddressID" }] }, { "name": "OrdersToBillAddr", "parentDbSetName": "Address", "childDbSetName": "SalesOrderHeader", "childToParentName": "Address1", "parentToChildrenName": null, "onDeleteAction": 0, "fieldRels": [{ "parentField": "AddressID", "childField": "BillToAddressID" }] }, { "name": "OrdersToShipAddr", "parentDbSetName": "Address", "childDbSetName": "SalesOrderHeader", "childToParentName": "Address", "parentToChildrenName": null, "onDeleteAction": 0, "fieldRels": [{ "parentField": "AddressID", "childField": "ShipToAddressID" }] }])
            };
            opts.dbSetInfo.fieldInfos = ([{ "fieldName": "AddressID", "isPrimaryKey": 1, "dataType": 3, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 4, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "AddressLine1", "isPrimaryKey": 0, "dataType": 1, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 60, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "AddressLine2", "isPrimaryKey": 0, "dataType": 1, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 60, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "City", "isPrimaryKey": 0, "dataType": 1, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 30, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "StateProvince", "isPrimaryKey": 0, "dataType": 1, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 50, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "CountryRegion", "isPrimaryKey": 0, "dataType": 1, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 50, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "PostalCode", "isPrimaryKey": 0, "dataType": 1, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 15, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "rowguid", "isPrimaryKey": 0, "dataType": 9, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 4, "dependentOn": "", "nested": null }, { "fieldName": "ModifiedDate", "isPrimaryKey": 0, "dataType": 6, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "CustomerAddresses", "isPrimaryKey": 0, "dataType": 0, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 3, "dependentOn": "", "nested": null }]);
            _super.call(this, opts);
            this._createEntityType();
        }
        AddressDb.prototype._createEntityType = function () {
            this._entityType = (function (_super) {
                __extends(class_1, _super);
                function class_1(aspect) {
                    _super.call(this, aspect);
                }
                class_1.prototype.toString = function () {
                    return 'AddressEntity';
                };
                Object.defineProperty(class_1.prototype, "AddressID", {
                    get: function () { return this._aspect._getFieldVal('AddressID'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_1.prototype, "AddressLine1", {
                    get: function () { return this._aspect._getFieldVal('AddressLine1'); },
                    set: function (v) { this._aspect._setFieldVal('AddressLine1', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_1.prototype, "AddressLine2", {
                    get: function () { return this._aspect._getFieldVal('AddressLine2'); },
                    set: function (v) { this._aspect._setFieldVal('AddressLine2', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_1.prototype, "City", {
                    get: function () { return this._aspect._getFieldVal('City'); },
                    set: function (v) { this._aspect._setFieldVal('City', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_1.prototype, "StateProvince", {
                    get: function () { return this._aspect._getFieldVal('StateProvince'); },
                    set: function (v) { this._aspect._setFieldVal('StateProvince', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_1.prototype, "CountryRegion", {
                    get: function () { return this._aspect._getFieldVal('CountryRegion'); },
                    set: function (v) { this._aspect._setFieldVal('CountryRegion', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_1.prototype, "PostalCode", {
                    get: function () { return this._aspect._getFieldVal('PostalCode'); },
                    set: function (v) { this._aspect._setFieldVal('PostalCode', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_1.prototype, "rowguid", {
                    get: function () { return this._aspect._getFieldVal('rowguid'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_1.prototype, "ModifiedDate", {
                    get: function () { return this._aspect._getFieldVal('ModifiedDate'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_1.prototype, "CustomerAddresses", {
                    get: function () { return this._aspect._getNavFieldVal('CustomerAddresses'); },
                    enumerable: true,
                    configurable: true
                });
                return class_1;
            }(RIAPP.CollectionItem));
        };
        AddressDb.prototype.findEntity = function (addressID) {
            return this.findByPK(RIAPP.Utils.arr.fromList(arguments));
        };
        AddressDb.prototype.toString = function () {
            return 'AddressDb';
        };
        AddressDb.prototype.createReadAddressByIdsQuery = function (args) {
            var query = this.createQuery('ReadAddressByIds');
            query.params = args;
            return query;
        };
        AddressDb.prototype.createReadAddressQuery = function () {
            return this.createQuery('ReadAddress');
        };
        return AddressDb;
    }(dbMOD.DbSet));
    exports.AddressDb = AddressDb;
    var AddressInfoDb = (function (_super) {
        __extends(AddressInfoDb, _super);
        function AddressInfoDb(dbContext) {
            var opts = {
                dbContext: dbContext,
                dbSetInfo: { "fieldInfos": [], "enablePaging": false, "pageSize": 25, "dbSetName": "AddressInfo" },
                childAssoc: ([]),
                parentAssoc: ([{ "name": "CustAddrToAddress2", "parentDbSetName": "AddressInfo", "childDbSetName": "CustomerAddress", "childToParentName": "AddressInfo", "parentToChildrenName": "CustomerAddresses", "onDeleteAction": 0, "fieldRels": [{ "parentField": "AddressID", "childField": "AddressID" }] }])
            };
            opts.dbSetInfo.fieldInfos = ([{ "fieldName": "AddressID", "isPrimaryKey": 1, "dataType": 3, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 4, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "AddressLine1", "isPrimaryKey": 0, "dataType": 1, "isNullable": true, "isReadOnly": true, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 200, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "City", "isPrimaryKey": 0, "dataType": 1, "isNullable": true, "isReadOnly": true, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 30, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "StateProvince", "isPrimaryKey": 0, "dataType": 1, "isNullable": true, "isReadOnly": true, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 50, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "CountryRegion", "isPrimaryKey": 0, "dataType": 1, "isNullable": true, "isReadOnly": true, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 50, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "CustomerAddresses", "isPrimaryKey": 0, "dataType": 0, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 3, "dependentOn": "", "nested": null }]);
            _super.call(this, opts);
            this._createEntityType();
        }
        AddressInfoDb.prototype._createEntityType = function () {
            this._entityType = (function (_super) {
                __extends(class_2, _super);
                function class_2(aspect) {
                    _super.call(this, aspect);
                }
                class_2.prototype.toString = function () {
                    return 'AddressInfoEntity';
                };
                Object.defineProperty(class_2.prototype, "AddressID", {
                    get: function () { return this._aspect._getFieldVal('AddressID'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_2.prototype, "AddressLine1", {
                    get: function () { return this._aspect._getFieldVal('AddressLine1'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_2.prototype, "City", {
                    get: function () { return this._aspect._getFieldVal('City'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_2.prototype, "StateProvince", {
                    get: function () { return this._aspect._getFieldVal('StateProvince'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_2.prototype, "CountryRegion", {
                    get: function () { return this._aspect._getFieldVal('CountryRegion'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_2.prototype, "CustomerAddresses", {
                    get: function () { return this._aspect._getNavFieldVal('CustomerAddresses'); },
                    enumerable: true,
                    configurable: true
                });
                return class_2;
            }(RIAPP.CollectionItem));
        };
        AddressInfoDb.prototype.findEntity = function (addressID) {
            return this.findByPK(RIAPP.Utils.arr.fromList(arguments));
        };
        AddressInfoDb.prototype.toString = function () {
            return 'AddressInfoDb';
        };
        AddressInfoDb.prototype.createReadAddressInfoQuery = function () {
            return this.createQuery('ReadAddressInfo');
        };
        return AddressInfoDb;
    }(dbMOD.DbSet));
    exports.AddressInfoDb = AddressInfoDb;
    var CustomerDb = (function (_super) {
        __extends(CustomerDb, _super);
        function CustomerDb(dbContext) {
            var opts = {
                dbContext: dbContext,
                dbSetInfo: { "fieldInfos": [], "enablePaging": true, "pageSize": 25, "dbSetName": "Customer" },
                childAssoc: ([]),
                parentAssoc: ([{ "name": "CustAddrToCustomer", "parentDbSetName": "Customer", "childDbSetName": "CustomerAddress", "childToParentName": "Customer", "parentToChildrenName": "CustomerAddresses", "onDeleteAction": 0, "fieldRels": [{ "parentField": "CustomerID", "childField": "CustomerID" }] }, { "name": "OrdersToCustomer", "parentDbSetName": "Customer", "childDbSetName": "SalesOrderHeader", "childToParentName": "Customer", "parentToChildrenName": null, "onDeleteAction": 0, "fieldRels": [{ "parentField": "CustomerID", "childField": "CustomerID" }] }])
            };
            opts.dbSetInfo.fieldInfos = ([{ "fieldName": "CustomerID", "isPrimaryKey": 1, "dataType": 3, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 4, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "NameStyle", "isPrimaryKey": 0, "dataType": 2, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "Title", "isPrimaryKey": 0, "dataType": 1, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "Suffix", "isPrimaryKey": 0, "dataType": 1, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 10, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "CompanyName", "isPrimaryKey": 0, "dataType": 1, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 128, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "SalesPerson", "isPrimaryKey": 0, "dataType": 1, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 256, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "PasswordHash", "isPrimaryKey": 0, "dataType": 1, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 128, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "PasswordSalt", "isPrimaryKey": 0, "dataType": 1, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 10, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "rowguid", "isPrimaryKey": 0, "dataType": 9, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 16, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 4, "dependentOn": "", "nested": null }, { "fieldName": "ModifiedDate", "isPrimaryKey": 0, "dataType": 6, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "ComplexProp", "isPrimaryKey": 0, "dataType": 0, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 5, "dependentOn": "", "nested": [{ "fieldName": "FirstName", "isPrimaryKey": 0, "dataType": 1, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 50, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "MiddleName", "isPrimaryKey": 0, "dataType": 1, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 50, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "LastName", "isPrimaryKey": 0, "dataType": 1, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 50, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "Name", "isPrimaryKey": 0, "dataType": 1, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 2, "dependentOn": "ComplexProp.FirstName,ComplexProp.MiddleName,ComplexProp.LastName", "nested": null }, { "fieldName": "ComplexProp", "isPrimaryKey": 0, "dataType": 0, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 5, "dependentOn": "", "nested": [{ "fieldName": "EmailAddress", "isPrimaryKey": 0, "dataType": 1, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 50, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "^[_a-z0-9-]+(\\.[_a-z0-9-]+)*@[a-z0-9-]+(\\.[a-z0-9-]+)*(\\.[a-z]{2,4})$", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "Phone", "isPrimaryKey": 0, "dataType": 1, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 25, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }] }] }, { "fieldName": "AddressCount", "isPrimaryKey": 0, "dataType": 3, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 6, "dependentOn": "", "nested": null }, { "fieldName": "CustomerAddresses", "isPrimaryKey": 0, "dataType": 0, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 3, "dependentOn": "", "nested": null }]);
            _super.call(this, opts);
            this._createEntityType();
        }
        CustomerDb.prototype._createEntityType = function () {
            this._entityType = (function (_super) {
                __extends(class_3, _super);
                function class_3(aspect) {
                    _super.call(this, aspect);
                    this._ComplexProp = null;
                }
                class_3.prototype.toString = function () {
                    return 'CustomerEntity';
                };
                Object.defineProperty(class_3.prototype, "CustomerID", {
                    get: function () { return this._aspect._getFieldVal('CustomerID'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_3.prototype, "NameStyle", {
                    get: function () { return this._aspect._getFieldVal('NameStyle'); },
                    set: function (v) { this._aspect._setFieldVal('NameStyle', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_3.prototype, "Title", {
                    get: function () { return this._aspect._getFieldVal('Title'); },
                    set: function (v) { this._aspect._setFieldVal('Title', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_3.prototype, "Suffix", {
                    get: function () { return this._aspect._getFieldVal('Suffix'); },
                    set: function (v) { this._aspect._setFieldVal('Suffix', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_3.prototype, "CompanyName", {
                    get: function () { return this._aspect._getFieldVal('CompanyName'); },
                    set: function (v) { this._aspect._setFieldVal('CompanyName', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_3.prototype, "SalesPerson", {
                    get: function () { return this._aspect._getFieldVal('SalesPerson'); },
                    set: function (v) { this._aspect._setFieldVal('SalesPerson', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_3.prototype, "PasswordHash", {
                    get: function () { return this._aspect._getFieldVal('PasswordHash'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_3.prototype, "PasswordSalt", {
                    get: function () { return this._aspect._getFieldVal('PasswordSalt'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_3.prototype, "rowguid", {
                    get: function () { return this._aspect._getFieldVal('rowguid'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_3.prototype, "ModifiedDate", {
                    get: function () { return this._aspect._getFieldVal('ModifiedDate'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_3.prototype, "ComplexProp", {
                    get: function () { if (!this._ComplexProp) {
                        this._ComplexProp = new Customer_ComplexProp('ComplexProp', this._aspect);
                    } return this._ComplexProp; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_3.prototype, "AddressCount", {
                    get: function () { return this._aspect._getFieldVal('AddressCount'); },
                    set: function (v) { this._aspect._setFieldVal('AddressCount', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_3.prototype, "CustomerAddresses", {
                    get: function () { return this._aspect._getNavFieldVal('CustomerAddresses'); },
                    enumerable: true,
                    configurable: true
                });
                return class_3;
            }(RIAPP.CollectionItem));
        };
        CustomerDb.prototype.findEntity = function (customerID) {
            return this.findByPK(RIAPP.Utils.arr.fromList(arguments));
        };
        CustomerDb.prototype.toString = function () {
            return 'CustomerDb';
        };
        CustomerDb.prototype.createReadCustomerQuery = function (args) {
            var query = this.createQuery('ReadCustomer');
            query.params = args;
            return query;
        };
        CustomerDb.prototype.defineComplexProp_NameField = function (getFunc) { this._defineCalculatedField('ComplexProp.Name', getFunc); };
        return CustomerDb;
    }(dbMOD.DbSet));
    exports.CustomerDb = CustomerDb;
    var CustomerAddressDb = (function (_super) {
        __extends(CustomerAddressDb, _super);
        function CustomerAddressDb(dbContext) {
            var opts = {
                dbContext: dbContext,
                dbSetInfo: { "fieldInfos": [], "enablePaging": false, "pageSize": 25, "dbSetName": "CustomerAddress" },
                childAssoc: ([{ "name": "CustAddrToAddress", "parentDbSetName": "Address", "childDbSetName": "CustomerAddress", "childToParentName": "Address", "parentToChildrenName": "CustomerAddresses", "onDeleteAction": 0, "fieldRels": [{ "parentField": "AddressID", "childField": "AddressID" }] }, { "name": "CustAddrToAddress2", "parentDbSetName": "AddressInfo", "childDbSetName": "CustomerAddress", "childToParentName": "AddressInfo", "parentToChildrenName": "CustomerAddresses", "onDeleteAction": 0, "fieldRels": [{ "parentField": "AddressID", "childField": "AddressID" }] }, { "name": "CustAddrToCustomer", "parentDbSetName": "Customer", "childDbSetName": "CustomerAddress", "childToParentName": "Customer", "parentToChildrenName": "CustomerAddresses", "onDeleteAction": 0, "fieldRels": [{ "parentField": "CustomerID", "childField": "CustomerID" }] }]),
                parentAssoc: ([])
            };
            opts.dbSetInfo.fieldInfos = ([{ "fieldName": "CustomerID", "isPrimaryKey": 1, "dataType": 3, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 4, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "AddressID", "isPrimaryKey": 2, "dataType": 3, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 4, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "AddressType", "isPrimaryKey": 0, "dataType": 1, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 50, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "rowguid", "isPrimaryKey": 0, "dataType": 9, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 16, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 4, "dependentOn": "", "nested": null }, { "fieldName": "ModifiedDate", "isPrimaryKey": 0, "dataType": 6, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "Customer", "isPrimaryKey": 0, "dataType": 0, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 3, "dependentOn": "CustomerID", "nested": null }, { "fieldName": "Address", "isPrimaryKey": 0, "dataType": 0, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 3, "dependentOn": "AddressID", "nested": null }, { "fieldName": "AddressInfo", "isPrimaryKey": 0, "dataType": 0, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 3, "dependentOn": "AddressID", "nested": null }]);
            _super.call(this, opts);
            this._createEntityType();
        }
        CustomerAddressDb.prototype._createEntityType = function () {
            this._entityType = (function (_super) {
                __extends(class_4, _super);
                function class_4(aspect) {
                    _super.call(this, aspect);
                }
                class_4.prototype.toString = function () {
                    return 'CustomerAddressEntity';
                };
                Object.defineProperty(class_4.prototype, "CustomerID", {
                    get: function () { return this._aspect._getFieldVal('CustomerID'); },
                    set: function (v) { this._aspect._setFieldVal('CustomerID', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_4.prototype, "AddressID", {
                    get: function () { return this._aspect._getFieldVal('AddressID'); },
                    set: function (v) { this._aspect._setFieldVal('AddressID', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_4.prototype, "AddressType", {
                    get: function () { return this._aspect._getFieldVal('AddressType'); },
                    set: function (v) { this._aspect._setFieldVal('AddressType', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_4.prototype, "rowguid", {
                    get: function () { return this._aspect._getFieldVal('rowguid'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_4.prototype, "ModifiedDate", {
                    get: function () { return this._aspect._getFieldVal('ModifiedDate'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_4.prototype, "Customer", {
                    get: function () { return this._aspect._getNavFieldVal('Customer'); },
                    set: function (v) { this._aspect._setNavFieldVal('Customer', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_4.prototype, "Address", {
                    get: function () { return this._aspect._getNavFieldVal('Address'); },
                    set: function (v) { this._aspect._setNavFieldVal('Address', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_4.prototype, "AddressInfo", {
                    get: function () { return this._aspect._getNavFieldVal('AddressInfo'); },
                    set: function (v) { this._aspect._setNavFieldVal('AddressInfo', v); },
                    enumerable: true,
                    configurable: true
                });
                return class_4;
            }(RIAPP.CollectionItem));
        };
        CustomerAddressDb.prototype.findEntity = function (customerID, addressID) {
            return this.findByPK(RIAPP.Utils.arr.fromList(arguments));
        };
        CustomerAddressDb.prototype.toString = function () {
            return 'CustomerAddressDb';
        };
        CustomerAddressDb.prototype.createReadAddressForCustomersQuery = function (args) {
            var query = this.createQuery('ReadAddressForCustomers');
            query.params = args;
            return query;
        };
        CustomerAddressDb.prototype.createReadCustomerAddressQuery = function () {
            return this.createQuery('ReadCustomerAddress');
        };
        return CustomerAddressDb;
    }(dbMOD.DbSet));
    exports.CustomerAddressDb = CustomerAddressDb;
    var CustomerJSONDb = (function (_super) {
        __extends(CustomerJSONDb, _super);
        function CustomerJSONDb(dbContext) {
            var opts = {
                dbContext: dbContext,
                dbSetInfo: { "fieldInfos": [], "enablePaging": true, "pageSize": 25, "dbSetName": "CustomerJSON" },
                childAssoc: ([]),
                parentAssoc: ([])
            };
            opts.dbSetInfo.fieldInfos = ([{ "fieldName": "CustomerID", "isPrimaryKey": 1, "dataType": 3, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 4, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "Data", "isPrimaryKey": 0, "dataType": 1, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": false, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "rowguid", "isPrimaryKey": 0, "dataType": 9, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 16, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 4, "dependentOn": "", "nested": null }, { "fieldName": "Customer", "isPrimaryKey": 0, "dataType": 0, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 2, "dependentOn": "Data", "nested": null }]);
            _super.call(this, opts);
            this._createEntityType();
        }
        CustomerJSONDb.prototype._createEntityType = function () {
            this._entityType = (function (_super) {
                __extends(class_5, _super);
                function class_5(aspect) {
                    _super.call(this, aspect);
                }
                class_5.prototype.toString = function () {
                    return 'CustomerJSONEntity';
                };
                Object.defineProperty(class_5.prototype, "CustomerID", {
                    get: function () { return this._aspect._getFieldVal('CustomerID'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_5.prototype, "Data", {
                    get: function () { return this._aspect._getFieldVal('Data'); },
                    set: function (v) { this._aspect._setFieldVal('Data', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_5.prototype, "rowguid", {
                    get: function () { return this._aspect._getFieldVal('rowguid'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_5.prototype, "Customer", {
                    get: function () { return this._aspect._getCalcFieldVal('Customer'); },
                    enumerable: true,
                    configurable: true
                });
                return class_5;
            }(RIAPP.CollectionItem));
        };
        CustomerJSONDb.prototype.findEntity = function (customerID) {
            return this.findByPK(RIAPP.Utils.arr.fromList(arguments));
        };
        CustomerJSONDb.prototype.toString = function () {
            return 'CustomerJSONDb';
        };
        CustomerJSONDb.prototype.createReadCustomerJSONQuery = function () {
            return this.createQuery('ReadCustomerJSON');
        };
        CustomerJSONDb.prototype.defineCustomerField = function (getFunc) { this._defineCalculatedField('Customer', getFunc); };
        return CustomerJSONDb;
    }(dbMOD.DbSet));
    exports.CustomerJSONDb = CustomerJSONDb;
    var LookUpProductDb = (function (_super) {
        __extends(LookUpProductDb, _super);
        function LookUpProductDb(dbContext) {
            var opts = {
                dbContext: dbContext,
                dbSetInfo: { "fieldInfos": [], "enablePaging": true, "pageSize": 25, "dbSetName": "LookUpProduct" },
                childAssoc: ([]),
                parentAssoc: ([])
            };
            opts.dbSetInfo.fieldInfos = ([{ "fieldName": "ProductID", "isPrimaryKey": 1, "dataType": 3, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "Name", "isPrimaryKey": 0, "dataType": 1, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }]);
            _super.call(this, opts);
            this._createEntityType();
        }
        LookUpProductDb.prototype._createEntityType = function () {
            this._entityType = (function (_super) {
                __extends(class_6, _super);
                function class_6(aspect) {
                    _super.call(this, aspect);
                }
                class_6.prototype.toString = function () {
                    return 'LookUpProductEntity';
                };
                Object.defineProperty(class_6.prototype, "ProductID", {
                    get: function () { return this._aspect._getFieldVal('ProductID'); },
                    set: function (v) { this._aspect._setFieldVal('ProductID', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_6.prototype, "Name", {
                    get: function () { return this._aspect._getFieldVal('Name'); },
                    set: function (v) { this._aspect._setFieldVal('Name', v); },
                    enumerable: true,
                    configurable: true
                });
                return class_6;
            }(RIAPP.CollectionItem));
        };
        LookUpProductDb.prototype.findEntity = function (productID) {
            return this.findByPK(RIAPP.Utils.arr.fromList(arguments));
        };
        LookUpProductDb.prototype.toString = function () {
            return 'LookUpProductDb';
        };
        LookUpProductDb.prototype.createReadProductLookUpQuery = function () {
            return this.createQuery('ReadProductLookUp');
        };
        return LookUpProductDb;
    }(dbMOD.DbSet));
    exports.LookUpProductDb = LookUpProductDb;
    var ProductDb = (function (_super) {
        __extends(ProductDb, _super);
        function ProductDb(dbContext) {
            var opts = {
                dbContext: dbContext,
                dbSetInfo: { "fieldInfos": [], "enablePaging": true, "pageSize": 25, "dbSetName": "Product" },
                childAssoc: ([]),
                parentAssoc: ([{ "name": "OrdDetailsToProduct", "parentDbSetName": "Product", "childDbSetName": "SalesOrderDetail", "childToParentName": "Product", "parentToChildrenName": "SalesOrderDetails", "onDeleteAction": 0, "fieldRels": [{ "parentField": "ProductID", "childField": "ProductID" }] }])
            };
            opts.dbSetInfo.fieldInfos = ([{ "fieldName": "ProductID", "isPrimaryKey": 1, "dataType": 3, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 4, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "Name", "isPrimaryKey": 0, "dataType": 1, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 50, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "ProductNumber", "isPrimaryKey": 0, "dataType": 1, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 25, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "Color", "isPrimaryKey": 0, "dataType": 1, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 15, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "StandardCost", "isPrimaryKey": 0, "dataType": 4, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "ListPrice", "isPrimaryKey": 0, "dataType": 4, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "100,5000", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "Size", "isPrimaryKey": 0, "dataType": 1, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 5, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "Weight", "isPrimaryKey": 0, "dataType": 4, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 5, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "ProductCategoryID", "isPrimaryKey": 0, "dataType": 3, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 4, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "ProductModelID", "isPrimaryKey": 0, "dataType": 3, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 4, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "SellStartDate", "isPrimaryKey": 0, "dataType": 7, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "2000-01-01,2015-01-01", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "SellEndDate", "isPrimaryKey": 0, "dataType": 7, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "DiscontinuedDate", "isPrimaryKey": 0, "dataType": 7, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "rowguid", "isPrimaryKey": 0, "dataType": 9, "isNullable": false, "isReadOnly": true, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 16, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 4, "dependentOn": "", "nested": null }, { "fieldName": "ModifiedDate", "isPrimaryKey": 0, "dataType": 6, "isNullable": false, "isReadOnly": true, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "IsActive", "isPrimaryKey": 0, "dataType": 2, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 2, "dependentOn": "SellEndDate", "nested": null }, { "fieldName": "ThumbnailPhotoFileName", "isPrimaryKey": 0, "dataType": 1, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 256, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "SalesOrderDetails", "isPrimaryKey": 0, "dataType": 0, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 3, "dependentOn": "", "nested": null }]);
            _super.call(this, opts);
            this._createEntityType();
        }
        ProductDb.prototype._createEntityType = function () {
            this._entityType = (function (_super) {
                __extends(class_7, _super);
                function class_7(aspect) {
                    _super.call(this, aspect);
                }
                class_7.prototype.toString = function () {
                    return 'ProductEntity';
                };
                Object.defineProperty(class_7.prototype, "ProductID", {
                    get: function () { return this._aspect._getFieldVal('ProductID'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_7.prototype, "Name", {
                    get: function () { return this._aspect._getFieldVal('Name'); },
                    set: function (v) { this._aspect._setFieldVal('Name', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_7.prototype, "ProductNumber", {
                    get: function () { return this._aspect._getFieldVal('ProductNumber'); },
                    set: function (v) { this._aspect._setFieldVal('ProductNumber', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_7.prototype, "Color", {
                    get: function () { return this._aspect._getFieldVal('Color'); },
                    set: function (v) { this._aspect._setFieldVal('Color', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_7.prototype, "StandardCost", {
                    get: function () { return this._aspect._getFieldVal('StandardCost'); },
                    set: function (v) { this._aspect._setFieldVal('StandardCost', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_7.prototype, "ListPrice", {
                    get: function () { return this._aspect._getFieldVal('ListPrice'); },
                    set: function (v) { this._aspect._setFieldVal('ListPrice', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_7.prototype, "Size", {
                    get: function () { return this._aspect._getFieldVal('Size'); },
                    set: function (v) { this._aspect._setFieldVal('Size', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_7.prototype, "Weight", {
                    get: function () { return this._aspect._getFieldVal('Weight'); },
                    set: function (v) { this._aspect._setFieldVal('Weight', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_7.prototype, "ProductCategoryID", {
                    get: function () { return this._aspect._getFieldVal('ProductCategoryID'); },
                    set: function (v) { this._aspect._setFieldVal('ProductCategoryID', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_7.prototype, "ProductModelID", {
                    get: function () { return this._aspect._getFieldVal('ProductModelID'); },
                    set: function (v) { this._aspect._setFieldVal('ProductModelID', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_7.prototype, "SellStartDate", {
                    get: function () { return this._aspect._getFieldVal('SellStartDate'); },
                    set: function (v) { this._aspect._setFieldVal('SellStartDate', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_7.prototype, "SellEndDate", {
                    get: function () { return this._aspect._getFieldVal('SellEndDate'); },
                    set: function (v) { this._aspect._setFieldVal('SellEndDate', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_7.prototype, "DiscontinuedDate", {
                    get: function () { return this._aspect._getFieldVal('DiscontinuedDate'); },
                    set: function (v) { this._aspect._setFieldVal('DiscontinuedDate', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_7.prototype, "rowguid", {
                    get: function () { return this._aspect._getFieldVal('rowguid'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_7.prototype, "ModifiedDate", {
                    get: function () { return this._aspect._getFieldVal('ModifiedDate'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_7.prototype, "IsActive", {
                    get: function () { return this._aspect._getCalcFieldVal('IsActive'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_7.prototype, "ThumbnailPhotoFileName", {
                    get: function () { return this._aspect._getFieldVal('ThumbnailPhotoFileName'); },
                    set: function (v) { this._aspect._setFieldVal('ThumbnailPhotoFileName', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_7.prototype, "SalesOrderDetails", {
                    get: function () { return this._aspect._getNavFieldVal('SalesOrderDetails'); },
                    enumerable: true,
                    configurable: true
                });
                return class_7;
            }(RIAPP.CollectionItem));
        };
        ProductDb.prototype.findEntity = function (productID) {
            return this.findByPK(RIAPP.Utils.arr.fromList(arguments));
        };
        ProductDb.prototype.toString = function () {
            return 'ProductDb';
        };
        ProductDb.prototype.createReadProductByIdsQuery = function (args) {
            var query = this.createQuery('ReadProductByIds');
            query.params = args;
            return query;
        };
        ProductDb.prototype.createReadProductQuery = function (args) {
            var query = this.createQuery('ReadProduct');
            query.params = args;
            return query;
        };
        ProductDb.prototype.defineIsActiveField = function (getFunc) { this._defineCalculatedField('IsActive', getFunc); };
        return ProductDb;
    }(dbMOD.DbSet));
    exports.ProductDb = ProductDb;
    var ProductCategoryDb = (function (_super) {
        __extends(ProductCategoryDb, _super);
        function ProductCategoryDb(dbContext) {
            var opts = {
                dbContext: dbContext,
                dbSetInfo: { "fieldInfos": [], "enablePaging": false, "pageSize": 25, "dbSetName": "ProductCategory" },
                childAssoc: ([]),
                parentAssoc: ([])
            };
            opts.dbSetInfo.fieldInfos = ([{ "fieldName": "ProductCategoryID", "isPrimaryKey": 1, "dataType": 3, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 4, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "ParentProductCategoryID", "isPrimaryKey": 0, "dataType": 3, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 4, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "Name", "isPrimaryKey": 0, "dataType": 1, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 50, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "rowguid", "isPrimaryKey": 0, "dataType": 9, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 16, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 4, "dependentOn": "", "nested": null }, { "fieldName": "ModifiedDate", "isPrimaryKey": 0, "dataType": 6, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }]);
            _super.call(this, opts);
            this._createEntityType();
        }
        ProductCategoryDb.prototype._createEntityType = function () {
            this._entityType = (function (_super) {
                __extends(class_8, _super);
                function class_8(aspect) {
                    _super.call(this, aspect);
                }
                class_8.prototype.toString = function () {
                    return 'ProductCategoryEntity';
                };
                Object.defineProperty(class_8.prototype, "ProductCategoryID", {
                    get: function () { return this._aspect._getFieldVal('ProductCategoryID'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_8.prototype, "ParentProductCategoryID", {
                    get: function () { return this._aspect._getFieldVal('ParentProductCategoryID'); },
                    set: function (v) { this._aspect._setFieldVal('ParentProductCategoryID', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_8.prototype, "Name", {
                    get: function () { return this._aspect._getFieldVal('Name'); },
                    set: function (v) { this._aspect._setFieldVal('Name', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_8.prototype, "rowguid", {
                    get: function () { return this._aspect._getFieldVal('rowguid'); },
                    set: function (v) { this._aspect._setFieldVal('rowguid', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_8.prototype, "ModifiedDate", {
                    get: function () { return this._aspect._getFieldVal('ModifiedDate'); },
                    set: function (v) { this._aspect._setFieldVal('ModifiedDate', v); },
                    enumerable: true,
                    configurable: true
                });
                return class_8;
            }(RIAPP.CollectionItem));
        };
        ProductCategoryDb.prototype.findEntity = function (productCategoryID) {
            return this.findByPK(RIAPP.Utils.arr.fromList(arguments));
        };
        ProductCategoryDb.prototype.toString = function () {
            return 'ProductCategoryDb';
        };
        ProductCategoryDb.prototype.createReadProductCategoryQuery = function () {
            return this.createQuery('ReadProductCategory');
        };
        return ProductCategoryDb;
    }(dbMOD.DbSet));
    exports.ProductCategoryDb = ProductCategoryDb;
    var ProductModelDb = (function (_super) {
        __extends(ProductModelDb, _super);
        function ProductModelDb(dbContext) {
            var opts = {
                dbContext: dbContext,
                dbSetInfo: { "fieldInfos": [], "enablePaging": false, "pageSize": 25, "dbSetName": "ProductModel" },
                childAssoc: ([]),
                parentAssoc: ([])
            };
            opts.dbSetInfo.fieldInfos = ([{ "fieldName": "ProductModelID", "isPrimaryKey": 1, "dataType": 3, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 4, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "Name", "isPrimaryKey": 0, "dataType": 1, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 50, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }]);
            _super.call(this, opts);
            this._createEntityType();
        }
        ProductModelDb.prototype._createEntityType = function () {
            this._entityType = (function (_super) {
                __extends(class_9, _super);
                function class_9(aspect) {
                    _super.call(this, aspect);
                }
                class_9.prototype.toString = function () {
                    return 'ProductModelEntity';
                };
                Object.defineProperty(class_9.prototype, "ProductModelID", {
                    get: function () { return this._aspect._getFieldVal('ProductModelID'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_9.prototype, "Name", {
                    get: function () { return this._aspect._getFieldVal('Name'); },
                    set: function (v) { this._aspect._setFieldVal('Name', v); },
                    enumerable: true,
                    configurable: true
                });
                return class_9;
            }(RIAPP.CollectionItem));
        };
        ProductModelDb.prototype.findEntity = function (productModelID) {
            return this.findByPK(RIAPP.Utils.arr.fromList(arguments));
        };
        ProductModelDb.prototype.toString = function () {
            return 'ProductModelDb';
        };
        ProductModelDb.prototype.createReadProductModelQuery = function () {
            return this.createQuery('ReadProductModel');
        };
        return ProductModelDb;
    }(dbMOD.DbSet));
    exports.ProductModelDb = ProductModelDb;
    var SalesInfoDb = (function (_super) {
        __extends(SalesInfoDb, _super);
        function SalesInfoDb(dbContext) {
            var opts = {
                dbContext: dbContext,
                dbSetInfo: { "fieldInfos": [], "enablePaging": true, "pageSize": 25, "dbSetName": "SalesInfo" },
                childAssoc: ([]),
                parentAssoc: ([])
            };
            opts.dbSetInfo.fieldInfos = ([{ "fieldName": "SalesPerson", "isPrimaryKey": 1, "dataType": 1, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }]);
            _super.call(this, opts);
            this._createEntityType();
        }
        SalesInfoDb.prototype._createEntityType = function () {
            this._entityType = (function (_super) {
                __extends(class_10, _super);
                function class_10(aspect) {
                    _super.call(this, aspect);
                }
                class_10.prototype.toString = function () {
                    return 'SalesInfoEntity';
                };
                Object.defineProperty(class_10.prototype, "SalesPerson", {
                    get: function () { return this._aspect._getFieldVal('SalesPerson'); },
                    set: function (v) { this._aspect._setFieldVal('SalesPerson', v); },
                    enumerable: true,
                    configurable: true
                });
                return class_10;
            }(RIAPP.CollectionItem));
        };
        SalesInfoDb.prototype.findEntity = function (salesPerson) {
            return this.findByPK(RIAPP.Utils.arr.fromList(arguments));
        };
        SalesInfoDb.prototype.toString = function () {
            return 'SalesInfoDb';
        };
        SalesInfoDb.prototype.createReadSalesInfoQuery = function () {
            return this.createQuery('ReadSalesInfo');
        };
        return SalesInfoDb;
    }(dbMOD.DbSet));
    exports.SalesInfoDb = SalesInfoDb;
    var SalesOrderDetailDb = (function (_super) {
        __extends(SalesOrderDetailDb, _super);
        function SalesOrderDetailDb(dbContext) {
            var opts = {
                dbContext: dbContext,
                dbSetInfo: { "fieldInfos": [], "enablePaging": false, "pageSize": 25, "dbSetName": "SalesOrderDetail" },
                childAssoc: ([{ "name": "OrdDetailsToOrder", "parentDbSetName": "SalesOrderHeader", "childDbSetName": "SalesOrderDetail", "childToParentName": "SalesOrderHeader", "parentToChildrenName": "SalesOrderDetails", "onDeleteAction": 1, "fieldRels": [{ "parentField": "SalesOrderID", "childField": "SalesOrderID" }] }, { "name": "OrdDetailsToProduct", "parentDbSetName": "Product", "childDbSetName": "SalesOrderDetail", "childToParentName": "Product", "parentToChildrenName": "SalesOrderDetails", "onDeleteAction": 0, "fieldRels": [{ "parentField": "ProductID", "childField": "ProductID" }] }]),
                parentAssoc: ([])
            };
            opts.dbSetInfo.fieldInfos = ([{ "fieldName": "SalesOrderID", "isPrimaryKey": 1, "dataType": 3, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 4, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "SalesOrderDetailID", "isPrimaryKey": 2, "dataType": 3, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 4, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "OrderQty", "isPrimaryKey": 0, "dataType": 3, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 2, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "ProductID", "isPrimaryKey": 0, "dataType": 3, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 4, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "UnitPrice", "isPrimaryKey": 0, "dataType": 4, "isNullable": true, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "UnitPriceDiscount", "isPrimaryKey": 0, "dataType": 4, "isNullable": true, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "LineTotal", "isPrimaryKey": 0, "dataType": 4, "isNullable": false, "isReadOnly": true, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 17, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "rowguid", "isPrimaryKey": 0, "dataType": 9, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 16, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "ModifiedDate", "isPrimaryKey": 0, "dataType": 6, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "SalesOrderHeader", "isPrimaryKey": 0, "dataType": 0, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 3, "dependentOn": "SalesOrderID", "nested": null }, { "fieldName": "Product", "isPrimaryKey": 0, "dataType": 0, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 3, "dependentOn": "ProductID", "nested": null }]);
            _super.call(this, opts);
            this._createEntityType();
        }
        SalesOrderDetailDb.prototype._createEntityType = function () {
            this._entityType = (function (_super) {
                __extends(class_11, _super);
                function class_11(aspect) {
                    _super.call(this, aspect);
                }
                class_11.prototype.toString = function () {
                    return 'SalesOrderDetailEntity';
                };
                Object.defineProperty(class_11.prototype, "SalesOrderID", {
                    get: function () { return this._aspect._getFieldVal('SalesOrderID'); },
                    set: function (v) { this._aspect._setFieldVal('SalesOrderID', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_11.prototype, "SalesOrderDetailID", {
                    get: function () { return this._aspect._getFieldVal('SalesOrderDetailID'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_11.prototype, "OrderQty", {
                    get: function () { return this._aspect._getFieldVal('OrderQty'); },
                    set: function (v) { this._aspect._setFieldVal('OrderQty', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_11.prototype, "ProductID", {
                    get: function () { return this._aspect._getFieldVal('ProductID'); },
                    set: function (v) { this._aspect._setFieldVal('ProductID', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_11.prototype, "UnitPrice", {
                    get: function () { return this._aspect._getFieldVal('UnitPrice'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_11.prototype, "UnitPriceDiscount", {
                    get: function () { return this._aspect._getFieldVal('UnitPriceDiscount'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_11.prototype, "LineTotal", {
                    get: function () { return this._aspect._getFieldVal('LineTotal'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_11.prototype, "rowguid", {
                    get: function () { return this._aspect._getFieldVal('rowguid'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_11.prototype, "ModifiedDate", {
                    get: function () { return this._aspect._getFieldVal('ModifiedDate'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_11.prototype, "SalesOrderHeader", {
                    get: function () { return this._aspect._getNavFieldVal('SalesOrderHeader'); },
                    set: function (v) { this._aspect._setNavFieldVal('SalesOrderHeader', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_11.prototype, "Product", {
                    get: function () { return this._aspect._getNavFieldVal('Product'); },
                    set: function (v) { this._aspect._setNavFieldVal('Product', v); },
                    enumerable: true,
                    configurable: true
                });
                return class_11;
            }(RIAPP.CollectionItem));
        };
        SalesOrderDetailDb.prototype.findEntity = function (salesOrderID, salesOrderDetailID) {
            return this.findByPK(RIAPP.Utils.arr.fromList(arguments));
        };
        SalesOrderDetailDb.prototype.toString = function () {
            return 'SalesOrderDetailDb';
        };
        SalesOrderDetailDb.prototype.createReadSalesOrderDetailQuery = function () {
            return this.createQuery('ReadSalesOrderDetail');
        };
        return SalesOrderDetailDb;
    }(dbMOD.DbSet));
    exports.SalesOrderDetailDb = SalesOrderDetailDb;
    var SalesOrderHeaderDb = (function (_super) {
        __extends(SalesOrderHeaderDb, _super);
        function SalesOrderHeaderDb(dbContext) {
            var opts = {
                dbContext: dbContext,
                dbSetInfo: { "fieldInfos": [], "enablePaging": false, "pageSize": 25, "dbSetName": "SalesOrderHeader" },
                childAssoc: ([{ "name": "OrdersToBillAddr", "parentDbSetName": "Address", "childDbSetName": "SalesOrderHeader", "childToParentName": "Address1", "parentToChildrenName": null, "onDeleteAction": 0, "fieldRels": [{ "parentField": "AddressID", "childField": "BillToAddressID" }] }, { "name": "OrdersToCustomer", "parentDbSetName": "Customer", "childDbSetName": "SalesOrderHeader", "childToParentName": "Customer", "parentToChildrenName": null, "onDeleteAction": 0, "fieldRels": [{ "parentField": "CustomerID", "childField": "CustomerID" }] }, { "name": "OrdersToShipAddr", "parentDbSetName": "Address", "childDbSetName": "SalesOrderHeader", "childToParentName": "Address", "parentToChildrenName": null, "onDeleteAction": 0, "fieldRels": [{ "parentField": "AddressID", "childField": "ShipToAddressID" }] }]),
                parentAssoc: ([{ "name": "OrdDetailsToOrder", "parentDbSetName": "SalesOrderHeader", "childDbSetName": "SalesOrderDetail", "childToParentName": "SalesOrderHeader", "parentToChildrenName": "SalesOrderDetails", "onDeleteAction": 1, "fieldRels": [{ "parentField": "SalesOrderID", "childField": "SalesOrderID" }] }])
            };
            opts.dbSetInfo.fieldInfos = ([{ "fieldName": "SalesOrderID", "isPrimaryKey": 1, "dataType": 3, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 4, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "RevisionNumber", "isPrimaryKey": 0, "dataType": 3, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "OrderDate", "isPrimaryKey": 0, "dataType": 7, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "DueDate", "isPrimaryKey": 0, "dataType": 7, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "ShipDate", "isPrimaryKey": 0, "dataType": 7, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "Status", "isPrimaryKey": 0, "dataType": 3, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "OnlineOrderFlag", "isPrimaryKey": 0, "dataType": 2, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "SalesOrderNumber", "isPrimaryKey": 0, "dataType": 1, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 25, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "PurchaseOrderNumber", "isPrimaryKey": 0, "dataType": 1, "isNullable": true, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 25, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "AccountNumber", "isPrimaryKey": 0, "dataType": 1, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 15, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "CustomerID", "isPrimaryKey": 0, "dataType": 3, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 4, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "ShipToAddressID", "isPrimaryKey": 0, "dataType": 3, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 4, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "BillToAddressID", "isPrimaryKey": 0, "dataType": 3, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 4, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "ShipMethod", "isPrimaryKey": 0, "dataType": 1, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 50, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "CreditCardApprovalCode", "isPrimaryKey": 0, "dataType": 1, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 15, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "SubTotal", "isPrimaryKey": 0, "dataType": 4, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "TaxAmt", "isPrimaryKey": 0, "dataType": 4, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "Freight", "isPrimaryKey": 0, "dataType": 4, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "TotalDue", "isPrimaryKey": 0, "dataType": 4, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "Comment", "isPrimaryKey": 0, "dataType": 1, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 0, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "rowguid", "isPrimaryKey": 0, "dataType": 9, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 16, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "ModifiedDate", "isPrimaryKey": 0, "dataType": 6, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "SalesOrderDetails", "isPrimaryKey": 0, "dataType": 0, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 3, "dependentOn": "", "nested": null }, { "fieldName": "Customer", "isPrimaryKey": 0, "dataType": 0, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 3, "dependentOn": "CustomerID", "nested": null }, { "fieldName": "Address", "isPrimaryKey": 0, "dataType": 0, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 3, "dependentOn": "ShipToAddressID", "nested": null }, { "fieldName": "Address1", "isPrimaryKey": 0, "dataType": 0, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 3, "dependentOn": "BillToAddressID", "nested": null }]);
            _super.call(this, opts);
            this._createEntityType();
        }
        SalesOrderHeaderDb.prototype._createEntityType = function () {
            this._entityType = (function (_super) {
                __extends(class_12, _super);
                function class_12(aspect) {
                    _super.call(this, aspect);
                }
                class_12.prototype.toString = function () {
                    return 'SalesOrderHeaderEntity';
                };
                Object.defineProperty(class_12.prototype, "SalesOrderID", {
                    get: function () { return this._aspect._getFieldVal('SalesOrderID'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_12.prototype, "RevisionNumber", {
                    get: function () { return this._aspect._getFieldVal('RevisionNumber'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_12.prototype, "OrderDate", {
                    get: function () { return this._aspect._getFieldVal('OrderDate'); },
                    set: function (v) { this._aspect._setFieldVal('OrderDate', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_12.prototype, "DueDate", {
                    get: function () { return this._aspect._getFieldVal('DueDate'); },
                    set: function (v) { this._aspect._setFieldVal('DueDate', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_12.prototype, "ShipDate", {
                    get: function () { return this._aspect._getFieldVal('ShipDate'); },
                    set: function (v) { this._aspect._setFieldVal('ShipDate', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_12.prototype, "Status", {
                    get: function () { return this._aspect._getFieldVal('Status'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_12.prototype, "OnlineOrderFlag", {
                    get: function () { return this._aspect._getFieldVal('OnlineOrderFlag'); },
                    set: function (v) { this._aspect._setFieldVal('OnlineOrderFlag', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_12.prototype, "SalesOrderNumber", {
                    get: function () { return this._aspect._getFieldVal('SalesOrderNumber'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_12.prototype, "PurchaseOrderNumber", {
                    get: function () { return this._aspect._getFieldVal('PurchaseOrderNumber'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_12.prototype, "AccountNumber", {
                    get: function () { return this._aspect._getFieldVal('AccountNumber'); },
                    set: function (v) { this._aspect._setFieldVal('AccountNumber', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_12.prototype, "CustomerID", {
                    get: function () { return this._aspect._getFieldVal('CustomerID'); },
                    set: function (v) { this._aspect._setFieldVal('CustomerID', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_12.prototype, "ShipToAddressID", {
                    get: function () { return this._aspect._getFieldVal('ShipToAddressID'); },
                    set: function (v) { this._aspect._setFieldVal('ShipToAddressID', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_12.prototype, "BillToAddressID", {
                    get: function () { return this._aspect._getFieldVal('BillToAddressID'); },
                    set: function (v) { this._aspect._setFieldVal('BillToAddressID', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_12.prototype, "ShipMethod", {
                    get: function () { return this._aspect._getFieldVal('ShipMethod'); },
                    set: function (v) { this._aspect._setFieldVal('ShipMethod', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_12.prototype, "CreditCardApprovalCode", {
                    get: function () { return this._aspect._getFieldVal('CreditCardApprovalCode'); },
                    set: function (v) { this._aspect._setFieldVal('CreditCardApprovalCode', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_12.prototype, "SubTotal", {
                    get: function () { return this._aspect._getFieldVal('SubTotal'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_12.prototype, "TaxAmt", {
                    get: function () { return this._aspect._getFieldVal('TaxAmt'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_12.prototype, "Freight", {
                    get: function () { return this._aspect._getFieldVal('Freight'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_12.prototype, "TotalDue", {
                    get: function () { return this._aspect._getFieldVal('TotalDue'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_12.prototype, "Comment", {
                    get: function () { return this._aspect._getFieldVal('Comment'); },
                    set: function (v) { this._aspect._setFieldVal('Comment', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_12.prototype, "rowguid", {
                    get: function () { return this._aspect._getFieldVal('rowguid'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_12.prototype, "ModifiedDate", {
                    get: function () { return this._aspect._getFieldVal('ModifiedDate'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_12.prototype, "SalesOrderDetails", {
                    get: function () { return this._aspect._getNavFieldVal('SalesOrderDetails'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_12.prototype, "Customer", {
                    get: function () { return this._aspect._getNavFieldVal('Customer'); },
                    set: function (v) { this._aspect._setNavFieldVal('Customer', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_12.prototype, "Address", {
                    get: function () { return this._aspect._getNavFieldVal('Address'); },
                    set: function (v) { this._aspect._setNavFieldVal('Address', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_12.prototype, "Address1", {
                    get: function () { return this._aspect._getNavFieldVal('Address1'); },
                    set: function (v) { this._aspect._setNavFieldVal('Address1', v); },
                    enumerable: true,
                    configurable: true
                });
                return class_12;
            }(RIAPP.CollectionItem));
        };
        SalesOrderHeaderDb.prototype.findEntity = function (salesOrderID) {
            return this.findByPK(RIAPP.Utils.arr.fromList(arguments));
        };
        SalesOrderHeaderDb.prototype.toString = function () {
            return 'SalesOrderHeaderDb';
        };
        SalesOrderHeaderDb.prototype.createReadSalesOrderHeaderQuery = function () {
            return this.createQuery('ReadSalesOrderHeader');
        };
        return SalesOrderHeaderDb;
    }(dbMOD.DbSet));
    exports.SalesOrderHeaderDb = SalesOrderHeaderDb;
    var DbSets = (function (_super) {
        __extends(DbSets, _super);
        function DbSets(dbContext) {
            _super.call(this, dbContext);
            this._createDbSet("Address", AddressDb);
            this._createDbSet("AddressInfo", AddressInfoDb);
            this._createDbSet("Customer", CustomerDb);
            this._createDbSet("CustomerAddress", CustomerAddressDb);
            this._createDbSet("CustomerJSON", CustomerJSONDb);
            this._createDbSet("LookUpProduct", LookUpProductDb);
            this._createDbSet("Product", ProductDb);
            this._createDbSet("ProductCategory", ProductCategoryDb);
            this._createDbSet("ProductModel", ProductModelDb);
            this._createDbSet("SalesInfo", SalesInfoDb);
            this._createDbSet("SalesOrderDetail", SalesOrderDetailDb);
            this._createDbSet("SalesOrderHeader", SalesOrderHeaderDb);
        }
        Object.defineProperty(DbSets.prototype, "Address", {
            get: function () { return this.getDbSet("Address"); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DbSets.prototype, "AddressInfo", {
            get: function () { return this.getDbSet("AddressInfo"); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DbSets.prototype, "Customer", {
            get: function () { return this.getDbSet("Customer"); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DbSets.prototype, "CustomerAddress", {
            get: function () { return this.getDbSet("CustomerAddress"); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DbSets.prototype, "CustomerJSON", {
            get: function () { return this.getDbSet("CustomerJSON"); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DbSets.prototype, "LookUpProduct", {
            get: function () { return this.getDbSet("LookUpProduct"); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DbSets.prototype, "Product", {
            get: function () { return this.getDbSet("Product"); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DbSets.prototype, "ProductCategory", {
            get: function () { return this.getDbSet("ProductCategory"); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DbSets.prototype, "ProductModel", {
            get: function () { return this.getDbSet("ProductModel"); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DbSets.prototype, "SalesInfo", {
            get: function () { return this.getDbSet("SalesInfo"); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DbSets.prototype, "SalesOrderDetail", {
            get: function () { return this.getDbSet("SalesOrderDetail"); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DbSets.prototype, "SalesOrderHeader", {
            get: function () { return this.getDbSet("SalesOrderHeader"); },
            enumerable: true,
            configurable: true
        });
        return DbSets;
    }(dbMOD.DbSets));
    exports.DbSets = DbSets;
    var DbContext = (function (_super) {
        __extends(DbContext, _super);
        function DbContext() {
            _super.apply(this, arguments);
        }
        DbContext.prototype._initDbSets = function () {
            _super.prototype._initDbSets.call(this);
            this._dbSets = new DbSets(this);
            var associations = [{ "name": "CustAddrToAddress", "parentDbSetName": "Address", "childDbSetName": "CustomerAddress", "childToParentName": "Address", "parentToChildrenName": "CustomerAddresses", "onDeleteAction": 0, "fieldRels": [{ "parentField": "AddressID", "childField": "AddressID" }] }, { "name": "CustAddrToAddress2", "parentDbSetName": "AddressInfo", "childDbSetName": "CustomerAddress", "childToParentName": "AddressInfo", "parentToChildrenName": "CustomerAddresses", "onDeleteAction": 0, "fieldRels": [{ "parentField": "AddressID", "childField": "AddressID" }] }, { "name": "CustAddrToCustomer", "parentDbSetName": "Customer", "childDbSetName": "CustomerAddress", "childToParentName": "Customer", "parentToChildrenName": "CustomerAddresses", "onDeleteAction": 0, "fieldRels": [{ "parentField": "CustomerID", "childField": "CustomerID" }] }, { "name": "OrdDetailsToOrder", "parentDbSetName": "SalesOrderHeader", "childDbSetName": "SalesOrderDetail", "childToParentName": "SalesOrderHeader", "parentToChildrenName": "SalesOrderDetails", "onDeleteAction": 1, "fieldRels": [{ "parentField": "SalesOrderID", "childField": "SalesOrderID" }] }, { "name": "OrdDetailsToProduct", "parentDbSetName": "Product", "childDbSetName": "SalesOrderDetail", "childToParentName": "Product", "parentToChildrenName": "SalesOrderDetails", "onDeleteAction": 0, "fieldRels": [{ "parentField": "ProductID", "childField": "ProductID" }] }, { "name": "OrdersToBillAddr", "parentDbSetName": "Address", "childDbSetName": "SalesOrderHeader", "childToParentName": "Address1", "parentToChildrenName": null, "onDeleteAction": 0, "fieldRels": [{ "parentField": "AddressID", "childField": "BillToAddressID" }] }, { "name": "OrdersToCustomer", "parentDbSetName": "Customer", "childDbSetName": "SalesOrderHeader", "childToParentName": "Customer", "parentToChildrenName": null, "onDeleteAction": 0, "fieldRels": [{ "parentField": "CustomerID", "childField": "CustomerID" }] }, { "name": "OrdersToShipAddr", "parentDbSetName": "Address", "childDbSetName": "SalesOrderHeader", "childToParentName": "Address", "parentToChildrenName": null, "onDeleteAction": 0, "fieldRels": [{ "parentField": "AddressID", "childField": "ShipToAddressID" }] }];
            this._initAssociations(associations);
            var methods = [{ "methodName": "ReadAddress", "parameters": [], "methodResult": true, "isQuery": true }, { "methodName": "ReadAddressByIds", "parameters": [{ "name": "addressIDs", "dataType": 3, "isArray": true, "isNullable": false, "dateConversion": 0, "ordinal": 0 }], "methodResult": true, "isQuery": true }, { "methodName": "ReadAddressForCustomers", "parameters": [{ "name": "custIDs", "dataType": 3, "isArray": true, "isNullable": false, "dateConversion": 0, "ordinal": 0 }], "methodResult": true, "isQuery": true }, { "methodName": "ReadAddressInfo", "parameters": [], "methodResult": true, "isQuery": true }, { "methodName": "ReadCustomer", "parameters": [{ "name": "includeNav", "dataType": 2, "isArray": false, "isNullable": true, "dateConversion": 0, "ordinal": 0 }], "methodResult": true, "isQuery": true }, { "methodName": "ReadCustomerAddress", "parameters": [], "methodResult": true, "isQuery": true }, { "methodName": "ReadCustomerJSON", "parameters": [], "methodResult": true, "isQuery": true }, { "methodName": "ReadProduct", "parameters": [{ "name": "param1", "dataType": 3, "isArray": true, "isNullable": false, "dateConversion": 0, "ordinal": 0 }, { "name": "param2", "dataType": 1, "isArray": false, "isNullable": false, "dateConversion": 0, "ordinal": 1 }], "methodResult": true, "isQuery": true }, { "methodName": "ReadProductByIds", "parameters": [{ "name": "productIDs", "dataType": 3, "isArray": true, "isNullable": false, "dateConversion": 0, "ordinal": 0 }], "methodResult": true, "isQuery": true }, { "methodName": "ReadProductCategory", "parameters": [], "methodResult": true, "isQuery": true }, { "methodName": "ReadProductLookUp", "parameters": [], "methodResult": true, "isQuery": true }, { "methodName": "ReadProductModel", "parameters": [], "methodResult": true, "isQuery": true }, { "methodName": "ReadSalesInfo", "parameters": [], "methodResult": true, "isQuery": true }, { "methodName": "ReadSalesOrderDetail", "parameters": [], "methodResult": true, "isQuery": true }, { "methodName": "ReadSalesOrderHeader", "parameters": [], "methodResult": true, "isQuery": true }, { "methodName": "TestComplexInvoke", "parameters": [{ "name": "info", "dataType": 0, "isArray": false, "isNullable": false, "dateConversion": 0, "ordinal": 0 }, { "name": "keys", "dataType": 0, "isArray": true, "isNullable": false, "dateConversion": 0, "ordinal": 1 }], "methodResult": false, "isQuery": false }, { "methodName": "TestInvoke", "parameters": [{ "name": "param1", "dataType": 10, "isArray": false, "isNullable": false, "dateConversion": 0, "ordinal": 0 }, { "name": "param2", "dataType": 1, "isArray": false, "isNullable": false, "dateConversion": 0, "ordinal": 1 }], "methodResult": true, "isQuery": false }];
            this._initMethods(methods);
        };
        Object.defineProperty(DbContext.prototype, "associations", {
            get: function () { return this._assoc; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DbContext.prototype, "dbSets", {
            get: function () { return this._dbSets; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DbContext.prototype, "serviceMethods", {
            get: function () { return this._svcMethods; },
            enumerable: true,
            configurable: true
        });
        return DbContext;
    }(dbMOD.DbContext));
    exports.DbContext = DbContext;
});
define("gridDemo/commands", ["require", "exports", "jriapp"], function (require, exports, RIAPP) {
    "use strict";
    var TestInvokeCommand = (function (_super) {
        __extends(TestInvokeCommand, _super);
        function TestInvokeCommand() {
            _super.apply(this, arguments);
        }
        TestInvokeCommand.prototype.Action = function (sender, param) {
            var self = this.thisObj;
            self.invokeResult = null;
            var promise = self.dbContext.serviceMethods.TestInvoke({ param1: [10, 11, 12, 13, 14], param2: param.Name });
            promise.then(function (res) {
                self.invokeResult = res;
                self.showDialog();
            }, function () {
            });
        };
        TestInvokeCommand.prototype.getIsCanExecute = function (sender, param) {
            var self = this.thisObj;
            return self.currentItem !== null;
        };
        return TestInvokeCommand;
    }(RIAPP.BaseCommand));
    exports.TestInvokeCommand = TestInvokeCommand;
    var ResetCommand = (function (_super) {
        __extends(ResetCommand, _super);
        function ResetCommand() {
            _super.apply(this, arguments);
        }
        ResetCommand.prototype.Action = function (sender, param) {
            this.thisObj.reset();
        };
        ResetCommand.prototype.getIsCanExecute = function (sender, param) {
            return true;
        };
        return ResetCommand;
    }(RIAPP.BaseCommand));
    exports.ResetCommand = ResetCommand;
});
define("gridDemo/filters", ["require", "exports", "jriapp", "jriapp_db", "demo/demoDB", "gridDemo/commands"], function (require, exports, RIAPP, dbMOD, DEMODB, commands_1) {
    "use strict";
    var utils = RIAPP.Utils, coreUtils = RIAPP.Utils.core, $ = RIAPP.$;
    var ProductsFilter = (function (_super) {
        __extends(ProductsFilter, _super);
        function ProductsFilter(app) {
            _super.call(this);
            var self = this;
            this._app = app;
            this._prodNumber = null;
            this._name = null;
            this._parentCategoryID = null;
            this._childCategoryID = null;
            this._selectedCategory = null;
            this._selectedModel = null;
            this._modelID = null;
            this._saleStart1 = null;
            this._saleStart2 = null;
            this._parentCategories = new dbMOD.DataView({
                dataSource: this.ProductCategories,
                fn_sort: function (a, b) { return a.ProductCategoryID - b.ProductCategoryID; },
                fn_filter: function (item) { return item.ParentProductCategoryID == null; }
            });
            this._childCategories = new dbMOD.DataView({
                dataSource: this.ProductCategories,
                fn_sort: function (a, b) { return a.ProductCategoryID - b.ProductCategoryID; },
                fn_filter: function (item) { return item.ParentProductCategoryID !== null && item.ParentProductCategoryID == self.parentCategoryID; }
            });
            this._sizes = new DEMODB.KeyValDictionary();
            this._sizes.fillItems([{ key: 0, val: 'EMPTY' }, { key: 1, val: 'NOT EMPTY' }, { key: 2, val: 'SMALL SIZE' }, { key: 3, val: 'BIG SIZE' }], true);
            this._size = null;
            this._resetCommand = new commands_1.ResetCommand(self);
        }
        ProductsFilter.prototype._loadCategories = function () {
            var query = this.ProductCategories.createReadProductCategoryQuery();
            query.orderBy('Name');
            return query.load();
        };
        ProductsFilter.prototype._loadProductModels = function () {
            var query = this.ProductModels.createReadProductModelQuery();
            query.orderBy('Name');
            return query.load();
        };
        ProductsFilter.prototype.load = function () {
            var promise1 = this._loadCategories(), promise2 = this._loadProductModels();
            return utils.defer.whenAll([promise1, promise2]);
        };
        ProductsFilter.prototype.reset = function () {
            this.parentCategoryID = null;
            this.childCategoryID = null;
            this.prodNumber = null;
            this.name = null;
            this.modelID = null;
            this.selectedModel = null;
            this.selectedCategory = null;
            this.saleStart1 = null;
            this.saleStart2 = null;
            this.size = null;
        };
        Object.defineProperty(ProductsFilter.prototype, "prodNumber", {
            get: function () { return this._prodNumber; },
            set: function (v) {
                if (this._prodNumber != v) {
                    this._prodNumber = v;
                    this.raisePropertyChanged('prodNumber');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductsFilter.prototype, "name", {
            get: function () { return this._name; },
            set: function (v) {
                if (this._name != v) {
                    this._name = v;
                    this.raisePropertyChanged('name');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductsFilter.prototype, "parentCategoryID", {
            get: function () { return this._parentCategoryID; },
            set: function (v) {
                if (this._parentCategoryID != v) {
                    this._parentCategoryID = v;
                    this.raisePropertyChanged('parentCategoryID');
                    this._childCategories.refresh();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductsFilter.prototype, "childCategoryID", {
            get: function () { return this._childCategoryID; },
            set: function (v) {
                if (this._childCategoryID != v) {
                    this._childCategoryID = v;
                    this.raisePropertyChanged('childCategoryID');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductsFilter.prototype, "modelID", {
            get: function () { return this._modelID; },
            set: function (v) {
                if (this._modelID != v) {
                    this._modelID = v;
                    this.raisePropertyChanged('modelID');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductsFilter.prototype, "saleStart1", {
            get: function () { return this._saleStart1; },
            set: function (v) {
                if (this._saleStart1 != v) {
                    this._saleStart1 = v;
                    this.raisePropertyChanged('saleStart1');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductsFilter.prototype, "saleStart2", {
            get: function () { return this._saleStart2; },
            set: function (v) {
                if (this._saleStart2 != v) {
                    this._saleStart2 = v;
                    this.raisePropertyChanged('saleStart2');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductsFilter.prototype, "dbSets", {
            get: function () { return this.dbContext.dbSets; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductsFilter.prototype, "ParentCategories", {
            get: function () { return this._parentCategories; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductsFilter.prototype, "ChildCategories", {
            get: function () { return this._childCategories; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductsFilter.prototype, "ProductModels", {
            get: function () { return this.dbSets.ProductModel; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductsFilter.prototype, "ProductCategories", {
            get: function () { return this.dbSets.ProductCategory; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductsFilter.prototype, "resetCommand", {
            get: function () { return this._resetCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductsFilter.prototype, "searchTextToolTip", {
            get: function () { return "Use placeholder <span style='font-size: larger'><b>%</b></span><br/> for searching by part of the value"; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductsFilter.prototype, "selectedCategory", {
            get: function () { return this._selectedCategory; },
            set: function (v) {
                if (this._selectedCategory != v) {
                    this._selectedCategory = v;
                    this.raisePropertyChanged('selectedCategory');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductsFilter.prototype, "selectedModel", {
            get: function () { return this._selectedModel; },
            set: function (v) {
                if (this._selectedModel != v) {
                    this._selectedModel = v;
                    this.raisePropertyChanged('selectedModel');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductsFilter.prototype, "sizes", {
            get: function () { return this._sizes; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductsFilter.prototype, "size", {
            get: function () { return this._size; },
            set: function (v) {
                if (this._size != v) {
                    this._size = v;
                    this.raisePropertyChanged('size');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductsFilter.prototype, "modelData", {
            set: function (data) { this.ProductModels.fillData(data); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductsFilter.prototype, "categoryData", {
            set: function (data) { this.ProductCategories.fillData(data); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductsFilter.prototype, "dbContext", {
            get: function () { return this._app.dbContext; },
            enumerable: true,
            configurable: true
        });
        return ProductsFilter;
    }(RIAPP.BaseObject));
    exports.ProductsFilter = ProductsFilter;
});
define("gridDemo/states", ["require", "exports"], function (require, exports) {
    "use strict";
    var RowStateProvider = (function () {
        function RowStateProvider() {
        }
        RowStateProvider.prototype.getCSS = function (item, val) {
            return (!val) ? 'rowInactive' : null;
        };
        return RowStateProvider;
    }());
    exports.RowStateProvider = RowStateProvider;
    var OptionTextProvider = (function () {
        function OptionTextProvider() {
        }
        OptionTextProvider.prototype.getText = function (item, itemIndex, text) {
            if (itemIndex > 0)
                return itemIndex + ') ' + text;
            else
                return text;
        };
        return OptionTextProvider;
    }());
    exports.OptionTextProvider = OptionTextProvider;
    var OptionStateProvider = (function () {
        function OptionStateProvider() {
        }
        OptionStateProvider.prototype.getCSS = function (item, itemIndex, val) {
            if (itemIndex % 2 == 0)
                return "gray-bgc";
            else
                return "white-bgc";
        };
        return OptionStateProvider;
    }());
    exports.OptionStateProvider = OptionStateProvider;
});
define("gridDemo/productVM", ["require", "exports", "jriapp", "jriapp_db", "jriapp_ui", "common", "gridDemo/filters", "gridDemo/commands", "gridDemo/states"], function (require, exports, RIAPP, dbMOD, uiMOD, COMMON, filters_1, commands_2, states_1) {
    "use strict";
    var utils = RIAPP.Utils, coreUtils = RIAPP.Utils.core, $ = RIAPP.$;
    var ProductViewModel = (function (_super) {
        __extends(ProductViewModel, _super);
        function ProductViewModel(app) {
            var _this = this;
            _super.call(this, app);
            var self = this;
            this._filter = new filters_1.ProductsFilter(app);
            this._dbSet = this.dbSets.Product;
            this._dataGrid = null;
            this._propWatcher = new RIAPP.PropWatcher();
            this._selected = {};
            this._selectedCount = 0;
            this._invokeResult = null;
            this._rowStateProvider = new states_1.RowStateProvider();
            this._optionTextProvider = new states_1.OptionTextProvider();
            this._optionStateProvider = new states_1.OptionStateProvider();
            var sodAssoc = self.dbContext.associations.getOrdDetailsToProduct();
            this._vwSalesOrderDet = new dbMOD.ChildDataView({
                association: sodAssoc,
                fn_sort: function (a, b) { return a.SalesOrderDetailID - b.SalesOrderDetailID; }
            });
            this._dbSet.addOnPropertyChange('currentItem', function (sender, data) {
                self._onCurrentChanged();
            }, self.uniqueID);
            this._dbSet.addOnItemDeleting(function (sender, args) {
                if (!confirm('Are you sure that you want to delete ' + args.item.Name + ' ?'))
                    args.isCancel = true;
            }, self.uniqueID);
            this._dbSet.addOnCleared(function (sender, args) {
                _this.dbContext.dbSets.SalesOrderDetail.clear();
            }, self.uniqueID);
            this._dbSet.addOnEndEdit(function (sender, args) {
                if (!args.isCanceled) {
                    self._testInvokeCommand.raiseCanExecuteChanged();
                }
            }, self.uniqueID);
            this._dbSet.addOnFill(function (sender, args) {
                if (args.reason === 2)
                    setTimeout(function () {
                        self._updateSelection();
                    }, 0);
            }, self.uniqueID);
            this._dbSet.isSubmitOnDelete = true;
            this._dbSet.addOnValidate(function (sender, args) {
                var item = args.item;
                if (!args.fieldName) {
                    if (!!item.SellEndDate) {
                        if (item.SellEndDate < item.SellStartDate) {
                            args.errors.push('End Date must be after Start Date');
                        }
                    }
                }
                else {
                    if (args.fieldName == "Weight") {
                        if (args.item.Weight > 20000) {
                            args.errors.push('Weight must be less than 20000');
                        }
                    }
                }
            }, self.uniqueID);
            this._addNewCommand = new RIAPP.TCommand(function (sender, param) {
                var item = self._dbSet.addNew();
            });
            this._loadCommand = new RIAPP.TCommand(function (sender, data, viewModel) {
                viewModel.load();
            }, self, null);
            this._testInvokeCommand = new commands_2.TestInvokeCommand(this);
            this._columnCommand = new RIAPP.TCommand(function (sender, cmdParam, viewModel) {
                var dataName = "";
                if (sender instanceof uiMOD.BaseElView) {
                    dataName = sender.dataName;
                }
                alert(utils.str.format("You clicked on \"{0}\", current ProductID is: {1}", dataName, (!cmdParam ? "Not selected" : cmdParam.ProductID)));
            }, self, function (sender, param, thisobj) {
                return !!self.currentItem;
            });
            this._propWatcher.addWatch(self, ['currentItem'], function (property) {
                self._testInvokeCommand.raiseCanExecuteChanged();
            });
            this._dialogVM = new uiMOD.DialogVM(app);
            var dialogOptions = {
                templateID: 'invokeResultTemplate',
                width: 600,
                height: 250,
                canCancel: false,
                title: 'Result of a service method invocation',
                fn_OnClose: function (dialog) {
                    self.invokeResult = null;
                }
            };
            this._dialogVM.createDialog('testDialog', dialogOptions);
        }
        ProductViewModel.prototype._addGrid = function (grid) {
            var self = this;
            if (!!this._dataGrid)
                this._removeGrid();
            this._dataGrid = grid;
            this._dataGrid.addOnPageChanged(function (s, args) {
                self.onDataPageChanged();
            }, this.uniqueID, this);
            this._dataGrid.addOnRowSelected(function (s, args) {
                self.onRowSelected(args.row);
            }, this.uniqueID, this);
            this._dataGrid.addOnRowExpanded(function (s, args) {
                if (args.isExpanded)
                    self.onRowExpanded(args.expandedRow);
                else
                    self.onRowCollapsed(args.collapsedRow);
            }, this.uniqueID, this);
            this._dataGrid.addOnCellDblClicked(function (s, args) {
                self.onCellDblClicked(args.cell);
            }, this.uniqueID, this);
        };
        ProductViewModel.prototype._removeGrid = function () {
            if (!this._dataGrid)
                return;
            this._dataGrid.removeNSHandlers(this.uniqueID);
            this._dataGrid = null;
        };
        ProductViewModel.prototype.addTabs = function (tabs) {
            console.log('tabs created');
        };
        ProductViewModel.prototype.removeTabs = function () {
            console.log('tabs destroyed');
        };
        ProductViewModel.prototype.onTabSelected = function (tabs) {
            console.log('tab selected: ' + tabs.tabIndex);
        };
        ProductViewModel.prototype.onDataPageChanged = function () {
            this._updateSelection();
        };
        ProductViewModel.prototype.onRowSelected = function (row) {
            this._productSelected(row.item, row.isSelected);
        };
        ProductViewModel.prototype.onRowExpanded = function (row) {
            this._vwSalesOrderDet.parentItem = this.currentItem;
        };
        ProductViewModel.prototype.onRowCollapsed = function (row) {
        };
        ProductViewModel.prototype.onCellDblClicked = function (cell) {
            alert("You double clicked " + cell.uniqueID);
        };
        ProductViewModel.prototype._onCurrentChanged = function () {
            this.raisePropertyChanged('currentItem');
            this._columnCommand.raiseCanExecuteChanged();
        };
        ProductViewModel.prototype._updateSelection = function () {
            var self = this, keys = self.selectedIDs, grid = self._dataGrid;
            keys.forEach(function (key) {
                var item = self.dbSet.getItemByKey(key);
                if (!!item) {
                    var row = grid.findRowByItem(item);
                    if (!!row)
                        row.isSelected = true;
                }
            });
        };
        ProductViewModel.prototype._clearSelection = function () {
            this._selected = {};
            this.selectedCount = 0;
        };
        ProductViewModel.prototype._productSelected = function (item, isSelected) {
            if (!item)
                return;
            if (isSelected) {
                if (!this._selected[item._key]) {
                    this._selected[item._key] = item;
                    this.selectedCount += 1;
                }
            }
            else {
                if (!!this._selected[item._key]) {
                    delete this._selected[item._key];
                    this.selectedCount -= 1;
                }
            }
        };
        ProductViewModel.prototype.load = function () {
            this._clearSelection();
            var query = this.dbSet.createReadProductQuery({ param1: [10, 11, 12, 13, 14], param2: 'Test' });
            query.pageSize = 50;
            COMMON.addTextQuery(query, 'ProductNumber', this._filter.prodNumber);
            COMMON.addTextQuery(query, 'Name', this._filter.name);
            if (!utils.check.isNt(this._filter.childCategoryID)) {
                query.where('ProductCategoryID', 0, [this._filter.childCategoryID]);
            }
            if (!utils.check.isNt(this._filter.modelID)) {
                query.where('ProductModelID', 0, [this._filter.modelID]);
            }
            if (!utils.check.isNt(this._filter.saleStart1) && !utils.check.isNt(this._filter.saleStart2)) {
                query.where('SellStartDate', 1, [this._filter.saleStart1, this._filter.saleStart2]);
            }
            else if (!utils.check.isNt(this._filter.saleStart1))
                query.where('SellStartDate', 7, [this._filter.saleStart1]);
            else if (!utils.check.isNt(this._filter.saleStart2))
                query.where('SellStartDate', 8, [this._filter.saleStart2]);
            switch (this.filter.size) {
                case 0:
                    query.where('Size', 0, [null]);
                    break;
                case 1:
                    query.where('Size', 9, [null]);
                    break;
                case 2:
                    query.where('Size', 2, ['S']);
                    break;
                case 3:
                    query.where('Size', 2, ['X']);
                    break;
                default:
                    break;
            }
            query.orderBy('Name').thenBy('SellStartDate', 1);
            return query.load();
        };
        ProductViewModel.prototype.showDialog = function (name) {
            this._dialogVM.showDialog(name || 'testDialog', this);
        };
        ProductViewModel.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            this._propWatcher.destroy();
            this._propWatcher = null;
            if (!!this._dbSet) {
                this._dbSet.removeNSHandlers(this.uniqueID);
            }
            if (!!this._dataGrid) {
                this._dataGrid.removeNSHandlers(this.uniqueID);
            }
            _super.prototype.destroy.call(this);
        };
        Object.defineProperty(ProductViewModel.prototype, "dbSet", {
            get: function () { return this._dbSet; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductViewModel.prototype, "testInvokeCommand", {
            get: function () { return this._testInvokeCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductViewModel.prototype, "addNewCommand", {
            get: function () { return this._addNewCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductViewModel.prototype, "dbContext", {
            get: function () { return this.app.dbContext; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductViewModel.prototype, "dbSets", {
            get: function () { return this.dbContext.dbSets; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductViewModel.prototype, "currentItem", {
            get: function () { return this._dbSet.currentItem; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductViewModel.prototype, "filter", {
            get: function () { return this._filter; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductViewModel.prototype, "loadCommand", {
            get: function () { return this._loadCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductViewModel.prototype, "columnCommand", {
            get: function () { return this._columnCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductViewModel.prototype, "selectedCount", {
            get: function () { return this._selectedCount; },
            set: function (v) {
                var old = this._selectedCount;
                if (old !== v) {
                    this._selectedCount = v;
                    this.raisePropertyChanged('selectedCount');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductViewModel.prototype, "selectedIDs", {
            get: function () { return Object.keys(this._selected); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductViewModel.prototype, "invokeResult", {
            get: function () { return this._invokeResult; },
            set: function (v) {
                var old = this._invokeResult;
                if (old !== v) {
                    this._invokeResult = v;
                    this.raisePropertyChanged('invokeResult');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductViewModel.prototype, "vwSalesOrderDet", {
            get: function () { return this._vwSalesOrderDet; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductViewModel.prototype, "rowStateProvider", {
            get: function () { return this._rowStateProvider; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductViewModel.prototype, "optionTextProvider", {
            get: function () { return this._optionTextProvider; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductViewModel.prototype, "optionStateProvider", {
            get: function () { return this._optionStateProvider; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductViewModel.prototype, "tabsEvents", {
            get: function () { return this; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductViewModel.prototype, "grid", {
            get: function () { return this._dataGrid; },
            set: function (v) {
                if (!!v)
                    this._addGrid(v);
                else
                    this._removeGrid();
            },
            enumerable: true,
            configurable: true
        });
        return ProductViewModel;
    }(RIAPP.ViewModel));
    exports.ProductViewModel = ProductViewModel;
});
define("gridDemo/baseUpload", ["require", "exports", "jriapp"], function (require, exports, RIAPP) {
    "use strict";
    var utils = RIAPP.Utils, coreUtils = RIAPP.Utils.core, $ = RIAPP.$;
    var BaseUploadVM = (function (_super) {
        __extends(BaseUploadVM, _super);
        function BaseUploadVM(url) {
            _super.call(this);
            var self = this;
            this._uploadUrl = url;
            this._formEl = null;
            this._fileEl = null;
            this._progressBar = null;
            this._percentageCalc = null;
            this._progressDiv = null;
            this._fileInfo = null;
            this._id = null;
            this._fileUploaded = false;
            this._initOk = this._initXhr();
            this._uploadCommand = new RIAPP.Command(function (sender, param) {
                try {
                    self.uploadFiles(self._fileEl.files);
                }
                catch (ex) {
                    self.handleError(ex, this);
                }
            }, self, function (sender, param) {
                return self._canUpload();
            });
        }
        BaseUploadVM.prototype._initXhr = function () {
            this.xhr = new XMLHttpRequest();
            if (!this.xhr.upload) {
                this.xhr = null;
                this.handleError('Browser dose not support HTML5 files upload interface', this);
                return false;
            }
            var self = this, xhr = this.xhr, upload = xhr.upload;
            upload.onloadstart = function (e) {
                self._progressBar.prop("max", 100);
                self._progressBar.prop("value", 0);
                self._percentageCalc.html("0%");
                self._progressDiv.show();
            };
            upload.onprogress = function (e) {
                var progressBar = $("#progressBar");
                var percentageDiv = $("#percentageCalc");
                if (!!e.lengthComputable) {
                    self._progressBar.prop("max", e.total);
                    self._progressBar.prop("value", e.loaded);
                    self._percentageCalc.html(Math.round(e.loaded / e.total * 100) + "%");
                }
            };
            upload.onload = function (e) {
                self.fileInfo = 'the File is uploaded';
                self._progressDiv.hide();
                self._onFileUploaded();
            };
            upload.onerror = function (e) {
                self.fileInfo = null;
                self._progressDiv.hide();
                self.handleError(new Error('File uploading error'), self);
            };
            xhr.onreadystatechange = function (e) {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 400) {
                        self.handleError(new Error(utils.str.format("File upload error: {0}", xhr.statusText)), self);
                    }
                }
            };
            return true;
        };
        BaseUploadVM.prototype._onFileUploaded = function () {
            this._fileUploaded = true;
        };
        BaseUploadVM.prototype.uploadFiles = function (fileList) {
            if (!!fileList) {
                for (var i = 0, l = fileList.length; i < l; i++) {
                    this.uploadFile(fileList[i]);
                }
            }
        };
        BaseUploadVM.prototype.uploadFile = function (file) {
            if (!this._initOk)
                return;
            var xhr = this.xhr;
            xhr.open("post", this._uploadUrl, true);
            xhr.setRequestHeader("Content-Type", "multipart/form-data");
            xhr.setRequestHeader("X-File-Name", file.name);
            xhr.setRequestHeader("X-File-Size", file.size.toString());
            xhr.setRequestHeader("X-File-Type", file.type);
            xhr.setRequestHeader("X-Data-ID", this._getDataID());
            xhr.send(file);
        };
        BaseUploadVM.prototype._onIDChanged = function () {
            this._uploadCommand.raiseCanExecuteChanged();
        };
        BaseUploadVM.prototype._canUpload = function () {
            return this._initOk && !!this._fileInfo && !utils.check.isNt(this.id);
        };
        BaseUploadVM.prototype._getDataID = function () {
            return this.id;
        };
        Object.defineProperty(BaseUploadVM.prototype, "fileInfo", {
            get: function () { return this._fileInfo; },
            set: function (v) {
                if (this._fileInfo !== v) {
                    this._fileInfo = v;
                    this.raisePropertyChanged('fileInfo');
                    this._uploadCommand.raiseCanExecuteChanged();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseUploadVM.prototype, "uploadCommand", {
            get: function () { return this._uploadCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BaseUploadVM.prototype, "id", {
            get: function () { return this._id; },
            set: function (v) {
                var old = this._id;
                if (old !== v) {
                    this._id = v;
                    this.raisePropertyChanged('id');
                    this._onIDChanged();
                }
            },
            enumerable: true,
            configurable: true
        });
        return BaseUploadVM;
    }(RIAPP.BaseObject));
    exports.BaseUploadVM = BaseUploadVM;
});
define("gridDemo/uploads", ["require", "exports", "jriapp", "jriapp_ui", "gridDemo/baseUpload"], function (require, exports, RIAPP, uiMOD, baseUpload_1) {
    "use strict";
    var utils = RIAPP.Utils, coreUtils = RIAPP.Utils.core, $ = RIAPP.$;
    var fn_getTemplateElement = function (template, name) {
        var t = template;
        var els = t.findElByDataName(name);
        if (els.length < 1)
            return null;
        return els[0];
    };
    var UploadThumbnailVM = (function (_super) {
        __extends(UploadThumbnailVM, _super);
        function UploadThumbnailVM(app, url) {
            _super.call(this, url);
            var self = this;
            this._product = null;
            this._dialogVM = new uiMOD.DialogVM(app);
            var dialogOptions = {
                templateID: 'uploadTemplate',
                width: 450,
                height: 250,
                title: 'Upload product thumbnail',
                fn_OnTemplateCreated: function (template) {
                    var dialog = this;
                    self._fileEl = fn_getTemplateElement(template, 'files-to-upload');
                    self._formEl = fn_getTemplateElement(template, 'uploadForm');
                    self._progressBar = $(fn_getTemplateElement(template, 'progressBar'));
                    self._percentageCalc = $(fn_getTemplateElement(template, 'percentageCalc'));
                    self._progressDiv = $(fn_getTemplateElement(template, 'progressDiv'));
                    self._progressDiv.hide();
                    $(self._fileEl).on('change', function (e) {
                        var fileEl = this;
                        e.stopPropagation();
                        var fileList = fileEl.files, txt = '';
                        self.fileInfo = null;
                        for (var i = 0, l = fileList.length; i < l; i++) {
                            txt += utils.str.format('<p>{0} ({1} KB)</p>', fileList[i].name, utils.str.formatNumber(fileList[i].size / 1024, 2, '.', ','));
                        }
                        self.fileInfo = txt;
                    });
                    var templEl = template.el, $fileEl = $(self._fileEl);
                    $fileEl.change(function (e) {
                        $('input[data-name="files-input"]', templEl).val($(this).val());
                    });
                    $('*[data-name="btn-input"]', templEl).click(function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        $fileEl.click();
                    });
                },
                fn_OnShow: function (dialog) {
                    self._formEl.reset();
                    self.fileInfo = null;
                    self._fileUploaded = false;
                },
                fn_OnClose: function (dialog) {
                    if (dialog.result == 'ok' && self._onDialogClose()) {
                        self.raiseEvent('files_uploaded', { id: self.id, product: self._product });
                    }
                }
            };
            this._dialogVM.createDialog('uploadDialog', dialogOptions);
            this._dialogCommand = new RIAPP.Command(function (sender, param) {
                try {
                    self._product = param;
                    self.id = self._product.ProductID.toString();
                    self._dialogVM.showDialog('uploadDialog', self);
                }
                catch (ex) {
                    self.handleError(ex, this);
                }
            }, self, function (sender, param) {
                return true;
            });
            this._templateCommand = new RIAPP.TemplateCommand(function (sender, param) {
                try {
                    var template = param.template, fileEl = $('input[data-name="files-to-upload"]', template.el);
                    if (fileEl.length == 0)
                        return;
                    if (param.isLoaded) {
                        fileEl.change(function (e) {
                            $('input[data-name="files-input"]', template.el).val($(this).val());
                        });
                        $('*[data-name="btn-input"]', template.el).click(function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            fileEl.click();
                        });
                    }
                    else {
                        fileEl.off('change');
                        $('*[data-name="btn-input"]', template.el).off('click');
                    }
                }
                catch (ex) {
                    self.handleError(ex, this);
                }
            }, self, function (sender, param) {
                return true;
            });
        }
        UploadThumbnailVM.prototype._getEventNames = function () {
            var base_events = _super.prototype._getEventNames.call(this);
            return ['files_uploaded'].concat(base_events);
        };
        UploadThumbnailVM.prototype.addOnFilesUploaded = function (fn, nmspace) {
            this.addHandler('files_uploaded', fn, nmspace);
        };
        UploadThumbnailVM.prototype.removeOnFilesUploaded = function (nmspace) {
            this.removeHandler('files_uploaded', nmspace);
        };
        UploadThumbnailVM.prototype._onDialogClose = function () {
            return this._fileUploaded;
        };
        Object.defineProperty(UploadThumbnailVM.prototype, "dialogCommand", {
            get: function () { return this._dialogCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(UploadThumbnailVM.prototype, "templateCommand", {
            get: function () { return this._templateCommand; },
            enumerable: true,
            configurable: true
        });
        UploadThumbnailVM.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            this._dialogVM.destroy();
            this._dialogVM = null;
            _super.prototype.destroy.call(this);
        };
        return UploadThumbnailVM;
    }(baseUpload_1.BaseUploadVM));
    exports.UploadThumbnailVM = UploadThumbnailVM;
});
define("gridDemo/app", ["require", "exports", "jriapp", "demo/demoDB", "common", "header", "ssevents", "websocket", "gridDemo/productVM", "gridDemo/uploads"], function (require, exports, RIAPP, DEMODB, COMMON, HEADER, SSEVENTS, WEBSOCK, productVM_1, uploads_1) {
    "use strict";
    var DemoApplication = (function (_super) {
        __extends(DemoApplication, _super);
        function DemoApplication(options) {
            _super.call(this, options);
            var self = this;
            this._dbContext = null;
            this._errorVM = null;
            this._headerVM = null;
            this._productVM = null;
            this._uploadVM = null;
            this._sseVM = null;
            this._websockVM = null;
        }
        DemoApplication.prototype.onStartUp = function () {
            var self = this, options = self.options;
            this._dbContext = new DEMODB.DbContext();
            this._dbContext.initialize({ serviceUrl: options.service_url, permissions: options.permissionInfo });
            function toText(str) {
                if (str === null)
                    return '';
                else
                    return str;
            }
            ;
            this._dbContext.dbSets.Product.defineIsActiveField(function (item) {
                return !item.SellEndDate;
            });
            this._errorVM = new COMMON.ErrorViewModel(this);
            this._headerVM = new HEADER.HeaderVM(this);
            this._productVM = new productVM_1.ProductViewModel(this);
            this._uploadVM = new uploads_1.UploadThumbnailVM(this, options.upload_thumb_url);
            function handleError(sender, data) {
                self._handleError(sender, data);
            }
            ;
            this.addOnError(handleError);
            this._dbContext.addOnError(handleError);
            if (!!options.sse_url && SSEVENTS.SSEventsVM.isSupported()) {
                this._sseVM = new SSEVENTS.SSEventsVM(options.sse_url, options.sse_clientID);
                this._sseVM.addOnMessage(function (s, a) { self._sseMessage = a.data.message; self.raisePropertyChanged('sseMessage'); });
                this._sseVM.addOnError(handleError);
            }
            if (WEBSOCK.WebSocketsVM.isSupported()) {
                this._websockVM = new WEBSOCK.WebSocketsVM(WEBSOCK.WebSocketsVM.createUrl(81, 'PollingService', false));
                this._websockVM.addOnMessage(this._onWebsockMsg, this.uniqueID, this);
                this._websockVM.addOnError(handleError);
            }
            this._uploadVM.addOnFilesUploaded(function (s, a) {
                a.product._aspect.refresh();
            });
            _super.prototype.onStartUp.call(this);
        };
        DemoApplication.prototype._handleError = function (sender, data) {
            debugger;
            data.isHandled = true;
            this.errorVM.error = data.error;
            this.errorVM.showDialog();
        };
        DemoApplication.prototype._onWebsockMsg = function (sender, args) {
            this._sseMessage = args.data.message;
            this.raisePropertyChanged('sseMessage');
        };
        DemoApplication.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            var self = this;
            try {
                self._errorVM.destroy();
                self._headerVM.destroy();
                self._productVM.destroy();
                self._uploadVM.destroy();
                self._dbContext.destroy();
                if (!!self._sseVM)
                    self._sseVM.destroy();
            }
            finally {
                _super.prototype.destroy.call(this);
            }
        };
        Object.defineProperty(DemoApplication.prototype, "options", {
            get: function () { return this._options; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DemoApplication.prototype, "dbContext", {
            get: function () { return this._dbContext; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DemoApplication.prototype, "errorVM", {
            get: function () { return this._errorVM; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DemoApplication.prototype, "headerVM", {
            get: function () { return this._headerVM; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DemoApplication.prototype, "productVM", {
            get: function () { return this._productVM; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DemoApplication.prototype, "uploadVM", {
            get: function () { return this._uploadVM; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DemoApplication.prototype, "sseMessage", {
            get: function () { return this._sseMessage; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DemoApplication.prototype, "sseVM", {
            get: function () { return this._sseVM; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DemoApplication.prototype, "websockVM", {
            get: function () { return this._websockVM; },
            enumerable: true,
            configurable: true
        });
        return DemoApplication;
    }(RIAPP.Application));
    exports.DemoApplication = DemoApplication;
});
define("gridDemo/resizableGrid", ["require", "exports", "jriapp", "jriapp_ui"], function (require, exports, RIAPP, uiMOD) {
    "use strict";
    var utils = RIAPP.Utils, $ = RIAPP.$;
    var $doc = $(RIAPP.DOM.document);
    var $head = $("head");
    var $drag = null;
    var ID = "id";
    var PX = "px";
    var SIGNATURE = "JColResizer";
    var FLEX = "JCLRFlex";
    var _gridsCount = 0;
    var _created_grids = {};
    function _gridCreated(grid) {
        _created_grids[grid.uniqueID] = grid;
        _gridsCount += 1;
        if (_gridsCount === 1) {
            $(window).on('resize.' + SIGNATURE, onResize);
        }
    }
    function _gridDestroyed(grid) {
        delete _created_grids[grid.uniqueID];
        _gridsCount -= 1;
        if (_gridsCount === 0) {
            $(window).off('resize.' + SIGNATURE);
        }
    }
    $head.append("<style type='text/css'>  .JColResizer{table-layout:fixed; box-sizing: border-box;} .JCLRgrips{ height:0px; position:relative; box-sizing: border-box;} .JCLRgrip{margin-left:-5px; position:absolute; z-index:5; box-sizing: border-box;} .JCLRgrip .JColResizer{position:absolute;background-color:red;filter:alpha(opacity=1);opacity:0;width:10px;height:100%;cursor: e-resize;top:0px; box-sizing: border-box;} .JCLRLastGrip{position:absolute; width:1px; box-sizing: border-box; } .JCLRgripDrag{ border-left:1px dotted black; box-sizing: border-box; } .JCLRFlex{ width:auto!important; } .JCLRgrip.JCLRdisabledGrip .JColResizer{cursor:default; display:none;}</style>");
    var onGripDrag = function (e) {
        if (!$drag)
            return;
        var gripData = $drag.data(SIGNATURE);
        var grid = gripData.grid;
        if (grid.getIsDestroyCalled())
            return;
        var data = grid.getResizeIfo();
        var $table = grid.grid.$table;
        var oe = e.originalEvent.touches;
        var ox = oe ? oe[0].pageX : e.pageX;
        var x = ox - gripData.ox + gripData.l;
        var mw = data.options.minWidth;
        var index = gripData.i;
        var colInfo = data.columns[index];
        var minLen = data.cellspacing * 1.5 + mw;
        var last = index == data.len - 1;
        var min = (index > 0) ? data.columns[index - 1].$grip[0].offsetLeft + data.cellspacing + mw : minLen;
        var max = Infinity;
        if (data.fixed) {
            if (last) {
                max = data.w - minLen;
            }
            else {
                max = data.columns[index + 1].$grip[0].offsetLeft - data.cellspacing - mw;
            }
        }
        x = Math.max(min, Math.min(max, x));
        gripData.x = x;
        $drag.css("left", x + PX);
        if (last) {
            gripData.w = colInfo.w + x - gripData.l;
        }
        if (!!data.options.liveDrag) {
            if (last) {
                colInfo.$column.css("width", gripData.w + PX);
                if (!data.fixed) {
                    $table.css('min-width', (data.w + x - gripData.l) + PX);
                }
                else {
                    data.w = $table[0].offsetWidth;
                }
            }
            else {
                grid.syncCols(index, false);
            }
            grid.syncGrips();
            var cb = data.options.onDrag;
            if (!!cb) {
                e.currentTarget = $table[0];
                cb(e);
            }
        }
        return false;
    };
    var onGripDragOver = function (e) {
        $doc.off('touchend.' + SIGNATURE + ' mouseup.' + SIGNATURE);
        $doc.off('touchmove.' + SIGNATURE + ' mousemove.' + SIGNATURE);
        $head.find('#dragCursor').remove();
        if (!$drag)
            return;
        var gripData = $drag.data(SIGNATURE);
        var grid = gripData.grid;
        if (grid.getIsDestroyCalled())
            return;
        var data = grid.getResizeIfo();
        var $table = grid.grid.$table;
        $drag.removeClass(data.options.draggingClass);
        if (!!(gripData.x - gripData.l)) {
            var cb = data.options.onResize;
            var index = gripData.i;
            var last = index == data.len - 1;
            var colInfo = data.columns[index];
            if (last) {
                colInfo.$column.css("width", gripData.w + PX);
                colInfo.w = gripData.w;
            }
            else {
                grid.syncCols(index, true);
            }
            if (!data.fixed)
                grid.applyBounds();
            grid.syncGrips();
            if (!!cb) {
                e.currentTarget = $table[0];
                cb(e);
            }
        }
        $drag = null;
    };
    var onGripMouseDown = function (e) {
        var $grip = $(this);
        var gripData = $grip.data(SIGNATURE);
        var grid = gripData.grid;
        if (grid.getIsDestroyCalled())
            return;
        var data = grid.getResizeIfo();
        var $table = grid.grid.$table;
        var touches = e.originalEvent.touches;
        gripData.ox = touches ? touches[0].pageX : e.pageX;
        gripData.l = $grip[0].offsetLeft;
        gripData.x = gripData.l;
        $doc.on('touchmove.' + SIGNATURE + ' mousemove.' + SIGNATURE, onGripDrag);
        $doc.on('touchend.' + SIGNATURE + ' mouseup.' + SIGNATURE, onGripDragOver);
        if ($head.find('#dragCursor').length == 0)
            $head.append("<style id='dragCursor' type='text/css'>*{cursor:" + data.options.dragCursor + "!important}</style>");
        $grip.addClass(data.options.draggingClass);
        $drag = $grip;
        var gripCol = data.columns[gripData.i];
        if (gripCol.locked) {
            for (var i = 0; i < data.len; i++) {
                var c = data.columns[i];
                c.locked = false;
                c.w = c.$column[0].offsetWidth;
            }
        }
        return false;
    };
    var onResize = function () {
        RIAPP.Utils.core.iterateIndexer(_created_grids, function (name, gridView) {
            gridView.syncGrips();
        });
    };
    var ResizableGrid = (function (_super) {
        __extends(ResizableGrid, _super);
        function ResizableGrid(options) {
            _super.call(this, options);
            var self = this, grid = self.grid;
            _gridCreated(this);
            var defaults = {
                resizeMode: 'overflow',
                draggingClass: 'JCLRgripDrag',
                gripInnerHtml: '',
                liveDrag: false,
                minWidth: 15,
                headerOnly: true,
                dragCursor: "e-resize",
                marginLeft: null,
                marginRight: null,
                disabledColumns: [],
                onDrag: null,
                onResize: null
            };
            this._resizeInfo = null;
            this._ds = grid.dataSource;
            var opts = utils.core.extend(defaults, options);
            self.init(opts);
            self.bindDS(this._ds);
            grid.addOnPropertyChange("dataSource", function (s, a) {
                self.unBindDS(self._ds);
                self.bindDS(grid.dataSource);
                self._ds = grid.dataSource;
            }, this.uniqueID);
            self.syncGrips();
        }
        ResizableGrid.prototype.bindDS = function (ds) {
            if (!ds)
                return;
            var self = this;
            ds.addOnCleared(function (s, a) { setTimeout(function () { self.syncGrips(); }, 0); }, this.uniqueID);
            ds.addOnFill(function (s, a) {
                setTimeout(function () { self.syncGrips(); }, 0);
            }, this.uniqueID);
        };
        ResizableGrid.prototype.unBindDS = function (ds) {
            if (!ds)
                return;
            ds.removeNSHandlers(this.uniqueID);
        };
        ResizableGrid.prototype.init = function (options) {
            var $table = this.grid.$table;
            var style = window.getComputedStyle($table[0], null);
            $table.addClass(SIGNATURE);
            var $gripContainer = $('<div class="JCLRgrips"/>');
            this.grid._getInternal().get$Header().before($gripContainer);
            this._resizeInfo = {
                options: options,
                mode: options.resizeMode,
                dc: options.disabledColumns,
                fixed: options.resizeMode === 'fit',
                columns: [],
                w: $table[0].offsetWidth,
                $gripContainer: $gripContainer,
                cellspacing: parseInt(style.borderSpacing) || 2,
                len: 0
            };
            if (options.marginLeft)
                $gripContainer.css("marginLeft", options.marginLeft);
            if (options.marginRight)
                $gripContainer.css("marginRight", options.marginRight);
            this.createGrips();
        };
        ResizableGrid.prototype.createGrips = function () {
            var $table = this.grid.$table, self = this;
            var $allTH = $(this.grid._tHeadCells).filter(":visible");
            var data = this._resizeInfo;
            data.len = $allTH.length;
            $allTH.each(function (index) {
                var $column = $(this);
                var isDisabled = data.dc.indexOf(index) != -1;
                var $grip = $(data.$gripContainer.append('<div class="JCLRgrip"></div>')[0].lastChild);
                $grip.append(isDisabled ? "" : data.options.gripInnerHtml).append('<div class="' + SIGNATURE + '"></div>');
                if (index == data.len - 1) {
                    $grip.addClass("JCLRLastGrip");
                    if (data.fixed)
                        $grip.empty();
                }
                $grip.on('touchstart mousedown', onGripMouseDown);
                if (!isDisabled) {
                    $grip.removeClass('JCLRdisabledGrip').bind('touchstart mousedown', onGripMouseDown);
                }
                else {
                    $grip.addClass('JCLRdisabledGrip');
                }
                var colInfo = { $column: $column, $grip: $grip, w: $column[0].offsetWidth, locked: false };
                data.columns.push(colInfo);
                $column.css("width", colInfo.w + PX).removeAttr("width");
                var gripData = { i: index, grid: self, last: index == data.len - 1, ox: 0, x: 0, l: 0, w: 0 };
                $grip.data(SIGNATURE, gripData);
            });
            if (!data.fixed) {
                $table.removeAttr('width').addClass(FLEX);
            }
            this.syncGrips();
        };
        ResizableGrid.prototype.syncGrips = function () {
            if (this.getIsDestroyCalled())
                return;
            var data = this._resizeInfo;
            data.$gripContainer.css("width", data.w + PX);
            var $table = this.grid.$table;
            var $header = this.grid._getInternal().get$Header();
            var $wrapper = this.grid._getInternal().get$Wrapper();
            var headerHeight = $header[0].offsetHeight;
            var tableHeight = $wrapper[0].offsetHeight;
            for (var i = 0; i < data.len; i++) {
                var colInfo = data.columns[i];
                colInfo.$grip.css({
                    left: (colInfo.$column[0].offsetLeft - $table[0].offsetLeft + colInfo.$column[0].offsetWidth + data.cellspacing / 2) + PX,
                    height: (data.options.headerOnly ? headerHeight : (headerHeight + tableHeight)) + PX
                });
            }
            this.grid.updateColumnsSize();
        };
        ResizableGrid.prototype.syncCols = function (i, isOver) {
            if (this.getIsDestroyCalled())
                return;
            var $table = this.grid.$table;
            var data = this._resizeInfo;
            var gripData = $drag.data(SIGNATURE);
            var inc = gripData.x - gripData.l;
            var c = data.columns[i];
            if (data.fixed) {
                var c2 = data.columns[i + 1];
                var w2 = c2.w - inc;
                c2.$column.css("width", w2 + PX);
                if (isOver) {
                    c2.w = c2.$column[0].offsetWidth;
                }
            }
            else {
                $table.css('min-width', (data.w + inc) + PX);
            }
            var w = c.w + inc;
            c.$column.css("width", w + PX);
            if (isOver) {
                c.w = c.$column[0].offsetWidth;
            }
        };
        ResizableGrid.prototype.applyBounds = function () {
            if (this.getIsDestroyCalled())
                return;
            var $table = this.grid.$table;
            var data = this._resizeInfo;
            var widths = $.map(data.columns, function (c) {
                return c.$column[0].offsetWidth;
            });
            data.w = $table[0].offsetWidth;
            $table.css("width", data.w + PX);
            $table.removeClass(FLEX);
            $.each(data.columns, function (i, c) {
                c.$column.css("width", widths[i] + PX);
            });
            $table.addClass(FLEX);
            $.each(data.columns, function (i, c) {
                c.w = c.$column[0].offsetWidth;
            });
            data.w = $table[0].offsetWidth;
            this.grid._getInternal().get$Wrapper().css("width", $table.outerWidth(true) + PX);
        };
        ResizableGrid.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            _gridDestroyed(this);
            this.unBindDS(this._ds);
            this._ds = null;
            var $table = this.grid.$table;
            var data = this._resizeInfo;
            if (!!data)
                data.$gripContainer.remove();
            $table.removeClass(SIGNATURE + " " + FLEX);
            this._resizeInfo = null;
            _super.prototype.destroy.call(this);
        };
        ResizableGrid.prototype.getResizeIfo = function () {
            return this._resizeInfo;
        };
        return ResizableGrid;
    }(uiMOD.DataGridElView));
    exports.ResizableGrid = ResizableGrid;
    function initModule(app) {
        app.registerElView('resizable_grid', ResizableGrid);
    }
    exports.initModule = initModule;
});
define("gridDemo/main", ["require", "exports", "jriapp", "common", "gridDemo/app", "gridDemo/resizableGrid"], function (require, exports, RIAPP, COMMON, app_1, ResizableGrid) {
    "use strict";
    var bootstrap = RIAPP.bootstrap, utils = RIAPP.Utils, coreUtils = RIAPP.Utils.core, $ = RIAPP.$;
    var styles = ["lsize", 'msize', 'ssize', 'nsize'];
    var SizeConverter = (function (_super) {
        __extends(SizeConverter, _super);
        function SizeConverter() {
            _super.apply(this, arguments);
        }
        SizeConverter.prototype.convertToSource = function (val, param, dataContext) {
            return undefined;
        };
        SizeConverter.prototype.convertToTarget = function (val, param, dataContext) {
            var size = "" + val, firstLetter;
            var res = undefined, found = false;
            if (!!val) {
                if (utils.check.isNumeric(size))
                    firstLetter = 'n';
                else
                    firstLetter = size.charAt(0).toLowerCase();
            }
            res = styles.map(function (style) {
                if (!found && !!firstLetter && utils.str.startsWith(style, firstLetter)) {
                    found = true;
                    return "+" + style;
                }
                else {
                    return "-" + style;
                }
            });
            return res;
        };
        return SizeConverter;
    }(RIAPP.BaseConverter));
    exports.SizeConverter = SizeConverter;
    bootstrap.addOnError(function (sender, args) {
        debugger;
        alert(args.error.message);
        args.isHandled = true;
    });
    function start(options) {
        options.modulesInits = {
            "COMMON": COMMON.initModule,
            "ResizableGrid": ResizableGrid.initModule
        };
        bootstrap.init(function (bootstrap) {
            var ButtonsCSS = bootstrap.defaults.ButtonsCSS;
            ButtonsCSS.Edit = 'icon icon-pencil';
            ButtonsCSS.Delete = 'icon icon-trash';
            ButtonsCSS.OK = 'icon icon-ok';
            ButtonsCSS.Cancel = 'icon icon-remove';
        });
        return bootstrap.startApp(function () {
            return new app_1.DemoApplication(options);
        }, function (app) {
            app.registerConverter('sizeConverter', new SizeConverter());
            app.loadTemplates(options.templates_url);
            app.registerTemplateLoader('productEditTemplate', coreUtils.memoize(function () {
                return utils.http.getAjax(options.productEditTemplate_url);
            }));
        }).then(function (app) {
            if (!!options.modelData && !!options.categoryData) {
                app.productVM.filter.modelData = options.modelData;
                app.productVM.filter.categoryData = options.categoryData;
            }
            else {
                return app.productVM.filter.load().then(function () {
                    return app.productVM.load().then(function (loadRes) { });
                });
            }
        });
    }
    exports.start = start;
});
