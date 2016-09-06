var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "jriapp", "jriapp_db"], function (require, exports, RIAPP, dbMOD) {
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
                dbSetInfo: { "fieldInfos": null, "enablePaging": false, "pageSize": 25, "dbSetName": "Address" },
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
                dbSetInfo: { "fieldInfos": null, "enablePaging": false, "pageSize": 25, "dbSetName": "AddressInfo" },
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
                dbSetInfo: { "fieldInfos": null, "enablePaging": true, "pageSize": 25, "dbSetName": "Customer" },
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
                dbSetInfo: { "fieldInfos": null, "enablePaging": false, "pageSize": 25, "dbSetName": "CustomerAddress" },
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
    var LookUpProductDb = (function (_super) {
        __extends(LookUpProductDb, _super);
        function LookUpProductDb(dbContext) {
            var opts = {
                dbContext: dbContext,
                dbSetInfo: { "fieldInfos": null, "enablePaging": true, "pageSize": 25, "dbSetName": "LookUpProduct" },
                childAssoc: ([]),
                parentAssoc: ([])
            };
            opts.dbSetInfo.fieldInfos = ([{ "fieldName": "ProductID", "isPrimaryKey": 1, "dataType": 3, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "Name", "isPrimaryKey": 0, "dataType": 1, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }]);
            _super.call(this, opts);
            this._createEntityType();
        }
        LookUpProductDb.prototype._createEntityType = function () {
            this._entityType = (function (_super) {
                __extends(class_5, _super);
                function class_5(aspect) {
                    _super.call(this, aspect);
                }
                class_5.prototype.toString = function () {
                    return 'LookUpProductEntity';
                };
                Object.defineProperty(class_5.prototype, "ProductID", {
                    get: function () { return this._aspect._getFieldVal('ProductID'); },
                    set: function (v) { this._aspect._setFieldVal('ProductID', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_5.prototype, "Name", {
                    get: function () { return this._aspect._getFieldVal('Name'); },
                    set: function (v) { this._aspect._setFieldVal('Name', v); },
                    enumerable: true,
                    configurable: true
                });
                return class_5;
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
                dbSetInfo: { "fieldInfos": null, "enablePaging": true, "pageSize": 25, "dbSetName": "Product" },
                childAssoc: ([]),
                parentAssoc: ([{ "name": "OrdDetailsToProduct", "parentDbSetName": "Product", "childDbSetName": "SalesOrderDetail", "childToParentName": "Product", "parentToChildrenName": "SalesOrderDetails", "onDeleteAction": 0, "fieldRels": [{ "parentField": "ProductID", "childField": "ProductID" }] }])
            };
            opts.dbSetInfo.fieldInfos = ([{ "fieldName": "ProductID", "isPrimaryKey": 1, "dataType": 3, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 4, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "Name", "isPrimaryKey": 0, "dataType": 1, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 50, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "ProductNumber", "isPrimaryKey": 0, "dataType": 1, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 25, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "Color", "isPrimaryKey": 0, "dataType": 1, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 15, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "StandardCost", "isPrimaryKey": 0, "dataType": 4, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "ListPrice", "isPrimaryKey": 0, "dataType": 4, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "100,5000", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "Size", "isPrimaryKey": 0, "dataType": 1, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 5, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "Weight", "isPrimaryKey": 0, "dataType": 4, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 5, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "ProductCategoryID", "isPrimaryKey": 0, "dataType": 3, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 4, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "ProductModelID", "isPrimaryKey": 0, "dataType": 3, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 4, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "SellStartDate", "isPrimaryKey": 0, "dataType": 7, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "2000-01-01,2015-01-01", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "SellEndDate", "isPrimaryKey": 0, "dataType": 7, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "DiscontinuedDate", "isPrimaryKey": 0, "dataType": 7, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "rowguid", "isPrimaryKey": 0, "dataType": 9, "isNullable": false, "isReadOnly": true, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 16, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 4, "dependentOn": "", "nested": null }, { "fieldName": "ModifiedDate", "isPrimaryKey": 0, "dataType": 6, "isNullable": false, "isReadOnly": true, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "IsActive", "isPrimaryKey": 0, "dataType": 2, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 2, "dependentOn": "SellEndDate", "nested": null }, { "fieldName": "ThumbnailPhotoFileName", "isPrimaryKey": 0, "dataType": 1, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 256, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "SalesOrderDetails", "isPrimaryKey": 0, "dataType": 0, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 3, "dependentOn": "", "nested": null }]);
            _super.call(this, opts);
            this._createEntityType();
        }
        ProductDb.prototype._createEntityType = function () {
            this._entityType = (function (_super) {
                __extends(class_6, _super);
                function class_6(aspect) {
                    _super.call(this, aspect);
                }
                class_6.prototype.toString = function () {
                    return 'ProductEntity';
                };
                Object.defineProperty(class_6.prototype, "ProductID", {
                    get: function () { return this._aspect._getFieldVal('ProductID'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_6.prototype, "Name", {
                    get: function () { return this._aspect._getFieldVal('Name'); },
                    set: function (v) { this._aspect._setFieldVal('Name', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_6.prototype, "ProductNumber", {
                    get: function () { return this._aspect._getFieldVal('ProductNumber'); },
                    set: function (v) { this._aspect._setFieldVal('ProductNumber', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_6.prototype, "Color", {
                    get: function () { return this._aspect._getFieldVal('Color'); },
                    set: function (v) { this._aspect._setFieldVal('Color', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_6.prototype, "StandardCost", {
                    get: function () { return this._aspect._getFieldVal('StandardCost'); },
                    set: function (v) { this._aspect._setFieldVal('StandardCost', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_6.prototype, "ListPrice", {
                    get: function () { return this._aspect._getFieldVal('ListPrice'); },
                    set: function (v) { this._aspect._setFieldVal('ListPrice', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_6.prototype, "Size", {
                    get: function () { return this._aspect._getFieldVal('Size'); },
                    set: function (v) { this._aspect._setFieldVal('Size', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_6.prototype, "Weight", {
                    get: function () { return this._aspect._getFieldVal('Weight'); },
                    set: function (v) { this._aspect._setFieldVal('Weight', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_6.prototype, "ProductCategoryID", {
                    get: function () { return this._aspect._getFieldVal('ProductCategoryID'); },
                    set: function (v) { this._aspect._setFieldVal('ProductCategoryID', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_6.prototype, "ProductModelID", {
                    get: function () { return this._aspect._getFieldVal('ProductModelID'); },
                    set: function (v) { this._aspect._setFieldVal('ProductModelID', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_6.prototype, "SellStartDate", {
                    get: function () { return this._aspect._getFieldVal('SellStartDate'); },
                    set: function (v) { this._aspect._setFieldVal('SellStartDate', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_6.prototype, "SellEndDate", {
                    get: function () { return this._aspect._getFieldVal('SellEndDate'); },
                    set: function (v) { this._aspect._setFieldVal('SellEndDate', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_6.prototype, "DiscontinuedDate", {
                    get: function () { return this._aspect._getFieldVal('DiscontinuedDate'); },
                    set: function (v) { this._aspect._setFieldVal('DiscontinuedDate', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_6.prototype, "rowguid", {
                    get: function () { return this._aspect._getFieldVal('rowguid'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_6.prototype, "ModifiedDate", {
                    get: function () { return this._aspect._getFieldVal('ModifiedDate'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_6.prototype, "IsActive", {
                    get: function () { return this._aspect._getCalcFieldVal('IsActive'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_6.prototype, "ThumbnailPhotoFileName", {
                    get: function () { return this._aspect._getFieldVal('ThumbnailPhotoFileName'); },
                    set: function (v) { this._aspect._setFieldVal('ThumbnailPhotoFileName', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_6.prototype, "SalesOrderDetails", {
                    get: function () { return this._aspect._getNavFieldVal('SalesOrderDetails'); },
                    enumerable: true,
                    configurable: true
                });
                return class_6;
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
                dbSetInfo: { "fieldInfos": null, "enablePaging": false, "pageSize": 25, "dbSetName": "ProductCategory" },
                childAssoc: ([]),
                parentAssoc: ([])
            };
            opts.dbSetInfo.fieldInfos = ([{ "fieldName": "ProductCategoryID", "isPrimaryKey": 1, "dataType": 3, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 4, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "ParentProductCategoryID", "isPrimaryKey": 0, "dataType": 3, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 4, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "Name", "isPrimaryKey": 0, "dataType": 1, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 50, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "rowguid", "isPrimaryKey": 0, "dataType": 9, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 16, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 4, "dependentOn": "", "nested": null }, { "fieldName": "ModifiedDate", "isPrimaryKey": 0, "dataType": 6, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }]);
            _super.call(this, opts);
            this._createEntityType();
        }
        ProductCategoryDb.prototype._createEntityType = function () {
            this._entityType = (function (_super) {
                __extends(class_7, _super);
                function class_7(aspect) {
                    _super.call(this, aspect);
                }
                class_7.prototype.toString = function () {
                    return 'ProductCategoryEntity';
                };
                Object.defineProperty(class_7.prototype, "ProductCategoryID", {
                    get: function () { return this._aspect._getFieldVal('ProductCategoryID'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_7.prototype, "ParentProductCategoryID", {
                    get: function () { return this._aspect._getFieldVal('ParentProductCategoryID'); },
                    set: function (v) { this._aspect._setFieldVal('ParentProductCategoryID', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_7.prototype, "Name", {
                    get: function () { return this._aspect._getFieldVal('Name'); },
                    set: function (v) { this._aspect._setFieldVal('Name', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_7.prototype, "rowguid", {
                    get: function () { return this._aspect._getFieldVal('rowguid'); },
                    set: function (v) { this._aspect._setFieldVal('rowguid', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_7.prototype, "ModifiedDate", {
                    get: function () { return this._aspect._getFieldVal('ModifiedDate'); },
                    set: function (v) { this._aspect._setFieldVal('ModifiedDate', v); },
                    enumerable: true,
                    configurable: true
                });
                return class_7;
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
                dbSetInfo: { "fieldInfos": null, "enablePaging": false, "pageSize": 25, "dbSetName": "ProductModel" },
                childAssoc: ([]),
                parentAssoc: ([])
            };
            opts.dbSetInfo.fieldInfos = ([{ "fieldName": "ProductModelID", "isPrimaryKey": 1, "dataType": 3, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 4, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "Name", "isPrimaryKey": 0, "dataType": 1, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 50, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }]);
            _super.call(this, opts);
            this._createEntityType();
        }
        ProductModelDb.prototype._createEntityType = function () {
            this._entityType = (function (_super) {
                __extends(class_8, _super);
                function class_8(aspect) {
                    _super.call(this, aspect);
                }
                class_8.prototype.toString = function () {
                    return 'ProductModelEntity';
                };
                Object.defineProperty(class_8.prototype, "ProductModelID", {
                    get: function () { return this._aspect._getFieldVal('ProductModelID'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_8.prototype, "Name", {
                    get: function () { return this._aspect._getFieldVal('Name'); },
                    set: function (v) { this._aspect._setFieldVal('Name', v); },
                    enumerable: true,
                    configurable: true
                });
                return class_8;
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
                dbSetInfo: { "fieldInfos": null, "enablePaging": true, "pageSize": 25, "dbSetName": "SalesInfo" },
                childAssoc: ([]),
                parentAssoc: ([])
            };
            opts.dbSetInfo.fieldInfos = ([{ "fieldName": "SalesPerson", "isPrimaryKey": 1, "dataType": 1, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }]);
            _super.call(this, opts);
            this._createEntityType();
        }
        SalesInfoDb.prototype._createEntityType = function () {
            this._entityType = (function (_super) {
                __extends(class_9, _super);
                function class_9(aspect) {
                    _super.call(this, aspect);
                }
                class_9.prototype.toString = function () {
                    return 'SalesInfoEntity';
                };
                Object.defineProperty(class_9.prototype, "SalesPerson", {
                    get: function () { return this._aspect._getFieldVal('SalesPerson'); },
                    set: function (v) { this._aspect._setFieldVal('SalesPerson', v); },
                    enumerable: true,
                    configurable: true
                });
                return class_9;
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
                dbSetInfo: { "fieldInfos": null, "enablePaging": false, "pageSize": 25, "dbSetName": "SalesOrderDetail" },
                childAssoc: ([{ "name": "OrdDetailsToOrder", "parentDbSetName": "SalesOrderHeader", "childDbSetName": "SalesOrderDetail", "childToParentName": "SalesOrderHeader", "parentToChildrenName": "SalesOrderDetails", "onDeleteAction": 1, "fieldRels": [{ "parentField": "SalesOrderID", "childField": "SalesOrderID" }] }, { "name": "OrdDetailsToProduct", "parentDbSetName": "Product", "childDbSetName": "SalesOrderDetail", "childToParentName": "Product", "parentToChildrenName": "SalesOrderDetails", "onDeleteAction": 0, "fieldRels": [{ "parentField": "ProductID", "childField": "ProductID" }] }]),
                parentAssoc: ([])
            };
            opts.dbSetInfo.fieldInfos = ([{ "fieldName": "SalesOrderID", "isPrimaryKey": 1, "dataType": 3, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 4, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "SalesOrderDetailID", "isPrimaryKey": 2, "dataType": 3, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 4, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "OrderQty", "isPrimaryKey": 0, "dataType": 3, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 2, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "ProductID", "isPrimaryKey": 0, "dataType": 3, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 4, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "UnitPrice", "isPrimaryKey": 0, "dataType": 4, "isNullable": true, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "UnitPriceDiscount", "isPrimaryKey": 0, "dataType": 4, "isNullable": true, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "LineTotal", "isPrimaryKey": 0, "dataType": 4, "isNullable": false, "isReadOnly": true, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 17, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "rowguid", "isPrimaryKey": 0, "dataType": 9, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 16, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "ModifiedDate", "isPrimaryKey": 0, "dataType": 6, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "SalesOrderHeader", "isPrimaryKey": 0, "dataType": 0, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 3, "dependentOn": "SalesOrderID", "nested": null }, { "fieldName": "Product", "isPrimaryKey": 0, "dataType": 0, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 3, "dependentOn": "ProductID", "nested": null }]);
            _super.call(this, opts);
            this._createEntityType();
        }
        SalesOrderDetailDb.prototype._createEntityType = function () {
            this._entityType = (function (_super) {
                __extends(class_10, _super);
                function class_10(aspect) {
                    _super.call(this, aspect);
                }
                class_10.prototype.toString = function () {
                    return 'SalesOrderDetailEntity';
                };
                Object.defineProperty(class_10.prototype, "SalesOrderID", {
                    get: function () { return this._aspect._getFieldVal('SalesOrderID'); },
                    set: function (v) { this._aspect._setFieldVal('SalesOrderID', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_10.prototype, "SalesOrderDetailID", {
                    get: function () { return this._aspect._getFieldVal('SalesOrderDetailID'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_10.prototype, "OrderQty", {
                    get: function () { return this._aspect._getFieldVal('OrderQty'); },
                    set: function (v) { this._aspect._setFieldVal('OrderQty', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_10.prototype, "ProductID", {
                    get: function () { return this._aspect._getFieldVal('ProductID'); },
                    set: function (v) { this._aspect._setFieldVal('ProductID', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_10.prototype, "UnitPrice", {
                    get: function () { return this._aspect._getFieldVal('UnitPrice'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_10.prototype, "UnitPriceDiscount", {
                    get: function () { return this._aspect._getFieldVal('UnitPriceDiscount'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_10.prototype, "LineTotal", {
                    get: function () { return this._aspect._getFieldVal('LineTotal'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_10.prototype, "rowguid", {
                    get: function () { return this._aspect._getFieldVal('rowguid'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_10.prototype, "ModifiedDate", {
                    get: function () { return this._aspect._getFieldVal('ModifiedDate'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_10.prototype, "SalesOrderHeader", {
                    get: function () { return this._aspect._getNavFieldVal('SalesOrderHeader'); },
                    set: function (v) { this._aspect._setNavFieldVal('SalesOrderHeader', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_10.prototype, "Product", {
                    get: function () { return this._aspect._getNavFieldVal('Product'); },
                    set: function (v) { this._aspect._setNavFieldVal('Product', v); },
                    enumerable: true,
                    configurable: true
                });
                return class_10;
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
                dbSetInfo: { "fieldInfos": null, "enablePaging": false, "pageSize": 25, "dbSetName": "SalesOrderHeader" },
                childAssoc: ([{ "name": "OrdersToBillAddr", "parentDbSetName": "Address", "childDbSetName": "SalesOrderHeader", "childToParentName": "Address1", "parentToChildrenName": null, "onDeleteAction": 0, "fieldRels": [{ "parentField": "AddressID", "childField": "BillToAddressID" }] }, { "name": "OrdersToCustomer", "parentDbSetName": "Customer", "childDbSetName": "SalesOrderHeader", "childToParentName": "Customer", "parentToChildrenName": null, "onDeleteAction": 0, "fieldRels": [{ "parentField": "CustomerID", "childField": "CustomerID" }] }, { "name": "OrdersToShipAddr", "parentDbSetName": "Address", "childDbSetName": "SalesOrderHeader", "childToParentName": "Address", "parentToChildrenName": null, "onDeleteAction": 0, "fieldRels": [{ "parentField": "AddressID", "childField": "ShipToAddressID" }] }]),
                parentAssoc: ([{ "name": "OrdDetailsToOrder", "parentDbSetName": "SalesOrderHeader", "childDbSetName": "SalesOrderDetail", "childToParentName": "SalesOrderHeader", "parentToChildrenName": "SalesOrderDetails", "onDeleteAction": 1, "fieldRels": [{ "parentField": "SalesOrderID", "childField": "SalesOrderID" }] }])
            };
            opts.dbSetInfo.fieldInfos = ([{ "fieldName": "SalesOrderID", "isPrimaryKey": 1, "dataType": 3, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 4, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "RevisionNumber", "isPrimaryKey": 0, "dataType": 3, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "OrderDate", "isPrimaryKey": 0, "dataType": 7, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "DueDate", "isPrimaryKey": 0, "dataType": 7, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "ShipDate", "isPrimaryKey": 0, "dataType": 7, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "Status", "isPrimaryKey": 0, "dataType": 3, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "OnlineOrderFlag", "isPrimaryKey": 0, "dataType": 2, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "SalesOrderNumber", "isPrimaryKey": 0, "dataType": 1, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 25, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "PurchaseOrderNumber", "isPrimaryKey": 0, "dataType": 1, "isNullable": true, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 25, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "AccountNumber", "isPrimaryKey": 0, "dataType": 1, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 15, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "CustomerID", "isPrimaryKey": 0, "dataType": 3, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 4, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "ShipToAddressID", "isPrimaryKey": 0, "dataType": 3, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 4, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "BillToAddressID", "isPrimaryKey": 0, "dataType": 3, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 4, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "ShipMethod", "isPrimaryKey": 0, "dataType": 1, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 50, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "CreditCardApprovalCode", "isPrimaryKey": 0, "dataType": 1, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 15, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "SubTotal", "isPrimaryKey": 0, "dataType": 4, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "TaxAmt", "isPrimaryKey": 0, "dataType": 4, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "Freight", "isPrimaryKey": 0, "dataType": 4, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "TotalDue", "isPrimaryKey": 0, "dataType": 4, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "Comment", "isPrimaryKey": 0, "dataType": 1, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 0, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "rowguid", "isPrimaryKey": 0, "dataType": 9, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 16, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "ModifiedDate", "isPrimaryKey": 0, "dataType": 6, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "SalesOrderDetails", "isPrimaryKey": 0, "dataType": 0, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 3, "dependentOn": "", "nested": null }, { "fieldName": "Customer", "isPrimaryKey": 0, "dataType": 0, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 3, "dependentOn": "CustomerID", "nested": null }, { "fieldName": "Address", "isPrimaryKey": 0, "dataType": 0, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 3, "dependentOn": "ShipToAddressID", "nested": null }, { "fieldName": "Address1", "isPrimaryKey": 0, "dataType": 0, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 3, "dependentOn": "BillToAddressID", "nested": null }]);
            _super.call(this, opts);
            this._createEntityType();
        }
        SalesOrderHeaderDb.prototype._createEntityType = function () {
            this._entityType = (function (_super) {
                __extends(class_11, _super);
                function class_11(aspect) {
                    _super.call(this, aspect);
                }
                class_11.prototype.toString = function () {
                    return 'SalesOrderHeaderEntity';
                };
                Object.defineProperty(class_11.prototype, "SalesOrderID", {
                    get: function () { return this._aspect._getFieldVal('SalesOrderID'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_11.prototype, "RevisionNumber", {
                    get: function () { return this._aspect._getFieldVal('RevisionNumber'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_11.prototype, "OrderDate", {
                    get: function () { return this._aspect._getFieldVal('OrderDate'); },
                    set: function (v) { this._aspect._setFieldVal('OrderDate', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_11.prototype, "DueDate", {
                    get: function () { return this._aspect._getFieldVal('DueDate'); },
                    set: function (v) { this._aspect._setFieldVal('DueDate', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_11.prototype, "ShipDate", {
                    get: function () { return this._aspect._getFieldVal('ShipDate'); },
                    set: function (v) { this._aspect._setFieldVal('ShipDate', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_11.prototype, "Status", {
                    get: function () { return this._aspect._getFieldVal('Status'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_11.prototype, "OnlineOrderFlag", {
                    get: function () { return this._aspect._getFieldVal('OnlineOrderFlag'); },
                    set: function (v) { this._aspect._setFieldVal('OnlineOrderFlag', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_11.prototype, "SalesOrderNumber", {
                    get: function () { return this._aspect._getFieldVal('SalesOrderNumber'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_11.prototype, "PurchaseOrderNumber", {
                    get: function () { return this._aspect._getFieldVal('PurchaseOrderNumber'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_11.prototype, "AccountNumber", {
                    get: function () { return this._aspect._getFieldVal('AccountNumber'); },
                    set: function (v) { this._aspect._setFieldVal('AccountNumber', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_11.prototype, "CustomerID", {
                    get: function () { return this._aspect._getFieldVal('CustomerID'); },
                    set: function (v) { this._aspect._setFieldVal('CustomerID', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_11.prototype, "ShipToAddressID", {
                    get: function () { return this._aspect._getFieldVal('ShipToAddressID'); },
                    set: function (v) { this._aspect._setFieldVal('ShipToAddressID', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_11.prototype, "BillToAddressID", {
                    get: function () { return this._aspect._getFieldVal('BillToAddressID'); },
                    set: function (v) { this._aspect._setFieldVal('BillToAddressID', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_11.prototype, "ShipMethod", {
                    get: function () { return this._aspect._getFieldVal('ShipMethod'); },
                    set: function (v) { this._aspect._setFieldVal('ShipMethod', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_11.prototype, "CreditCardApprovalCode", {
                    get: function () { return this._aspect._getFieldVal('CreditCardApprovalCode'); },
                    set: function (v) { this._aspect._setFieldVal('CreditCardApprovalCode', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_11.prototype, "SubTotal", {
                    get: function () { return this._aspect._getFieldVal('SubTotal'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_11.prototype, "TaxAmt", {
                    get: function () { return this._aspect._getFieldVal('TaxAmt'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_11.prototype, "Freight", {
                    get: function () { return this._aspect._getFieldVal('Freight'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_11.prototype, "TotalDue", {
                    get: function () { return this._aspect._getFieldVal('TotalDue'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_11.prototype, "Comment", {
                    get: function () { return this._aspect._getFieldVal('Comment'); },
                    set: function (v) { this._aspect._setFieldVal('Comment', v); },
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
                Object.defineProperty(class_11.prototype, "SalesOrderDetails", {
                    get: function () { return this._aspect._getNavFieldVal('SalesOrderDetails'); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_11.prototype, "Customer", {
                    get: function () { return this._aspect._getNavFieldVal('Customer'); },
                    set: function (v) { this._aspect._setNavFieldVal('Customer', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_11.prototype, "Address", {
                    get: function () { return this._aspect._getNavFieldVal('Address'); },
                    set: function (v) { this._aspect._setNavFieldVal('Address', v); },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(class_11.prototype, "Address1", {
                    get: function () { return this._aspect._getNavFieldVal('Address1'); },
                    set: function (v) { this._aspect._setNavFieldVal('Address1', v); },
                    enumerable: true,
                    configurable: true
                });
                return class_11;
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
            this._dbSetNames = ["Address", "AddressInfo", "Customer", "CustomerAddress", "LookUpProduct", "Product", "ProductCategory", "ProductModel", "SalesInfo", "SalesOrderDetail", "SalesOrderHeader"];
            this._createDbSet("Address", AddressDb);
            this._createDbSet("AddressInfo", AddressInfoDb);
            this._createDbSet("Customer", CustomerDb);
            this._createDbSet("CustomerAddress", CustomerAddressDb);
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
            var methods = [{ "methodName": "TestComplexInvoke", "parameters": [{ "name": "info", "dataType": 0, "isArray": false, "isNullable": false, "dateConversion": 0, "ordinal": 0 }, { "name": "keys", "dataType": 0, "isArray": true, "isNullable": false, "dateConversion": 0, "ordinal": 1 }], "methodResult": false, "isQuery": false }, { "methodName": "TestInvoke", "parameters": [{ "name": "param1", "dataType": 10, "isArray": false, "isNullable": false, "dateConversion": 0, "ordinal": 0 }, { "name": "param2", "dataType": 1, "isArray": false, "isNullable": false, "dateConversion": 0, "ordinal": 1 }], "methodResult": true, "isQuery": false }];
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
