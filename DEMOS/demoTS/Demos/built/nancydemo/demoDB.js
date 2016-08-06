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
    var ProductEntity = (function (_super) {
        __extends(ProductEntity, _super);
        function ProductEntity(aspect) {
            _super.call(this, aspect);
        }
        ProductEntity.prototype.toString = function () {
            return 'ProductEntity';
        };
        Object.defineProperty(ProductEntity.prototype, "ProductID", {
            get: function () { return this._aspect._getFieldVal('ProductID'); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductEntity.prototype, "Name", {
            get: function () { return this._aspect._getFieldVal('Name'); },
            set: function (v) { this._aspect._setFieldVal('Name', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductEntity.prototype, "ProductNumber", {
            get: function () { return this._aspect._getFieldVal('ProductNumber'); },
            set: function (v) { this._aspect._setFieldVal('ProductNumber', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductEntity.prototype, "Color", {
            get: function () { return this._aspect._getFieldVal('Color'); },
            set: function (v) { this._aspect._setFieldVal('Color', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductEntity.prototype, "StandardCost", {
            get: function () { return this._aspect._getFieldVal('StandardCost'); },
            set: function (v) { this._aspect._setFieldVal('StandardCost', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductEntity.prototype, "ListPrice", {
            get: function () { return this._aspect._getFieldVal('ListPrice'); },
            set: function (v) { this._aspect._setFieldVal('ListPrice', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductEntity.prototype, "Size", {
            get: function () { return this._aspect._getFieldVal('Size'); },
            set: function (v) { this._aspect._setFieldVal('Size', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductEntity.prototype, "Weight", {
            get: function () { return this._aspect._getFieldVal('Weight'); },
            set: function (v) { this._aspect._setFieldVal('Weight', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductEntity.prototype, "ProductCategoryID", {
            get: function () { return this._aspect._getFieldVal('ProductCategoryID'); },
            set: function (v) { this._aspect._setFieldVal('ProductCategoryID', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductEntity.prototype, "ProductModelID", {
            get: function () { return this._aspect._getFieldVal('ProductModelID'); },
            set: function (v) { this._aspect._setFieldVal('ProductModelID', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductEntity.prototype, "SellStartDate", {
            get: function () { return this._aspect._getFieldVal('SellStartDate'); },
            set: function (v) { this._aspect._setFieldVal('SellStartDate', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductEntity.prototype, "SellEndDate", {
            get: function () { return this._aspect._getFieldVal('SellEndDate'); },
            set: function (v) { this._aspect._setFieldVal('SellEndDate', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductEntity.prototype, "DiscontinuedDate", {
            get: function () { return this._aspect._getFieldVal('DiscontinuedDate'); },
            set: function (v) { this._aspect._setFieldVal('DiscontinuedDate', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductEntity.prototype, "rowguid", {
            get: function () { return this._aspect._getFieldVal('rowguid'); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductEntity.prototype, "ModifiedDate", {
            get: function () { return this._aspect._getFieldVal('ModifiedDate'); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductEntity.prototype, "IsActive", {
            get: function () { return this._aspect._getCalcFieldVal('IsActive'); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductEntity.prototype, "ThumbnailPhotoFileName", {
            get: function () { return this._aspect._getFieldVal('ThumbnailPhotoFileName'); },
            set: function (v) { this._aspect._setFieldVal('ThumbnailPhotoFileName', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductEntity.prototype, "SalesOrderDetails", {
            get: function () { return this._aspect._getNavFieldVal('SalesOrderDetails'); },
            enumerable: true,
            configurable: true
        });
        return ProductEntity;
    }(RIAPP.CollectionItem));
    exports.ProductEntity = ProductEntity;
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
            _super.call(this, opts, ProductEntity);
        }
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
    var ProductModelEntity = (function (_super) {
        __extends(ProductModelEntity, _super);
        function ProductModelEntity(aspect) {
            _super.call(this, aspect);
        }
        ProductModelEntity.prototype.toString = function () {
            return 'ProductModelEntity';
        };
        Object.defineProperty(ProductModelEntity.prototype, "ProductModelID", {
            get: function () { return this._aspect._getFieldVal('ProductModelID'); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductModelEntity.prototype, "Name", {
            get: function () { return this._aspect._getFieldVal('Name'); },
            set: function (v) { this._aspect._setFieldVal('Name', v); },
            enumerable: true,
            configurable: true
        });
        return ProductModelEntity;
    }(RIAPP.CollectionItem));
    exports.ProductModelEntity = ProductModelEntity;
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
            _super.call(this, opts, ProductModelEntity);
        }
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
    var SalesOrderHeaderEntity = (function (_super) {
        __extends(SalesOrderHeaderEntity, _super);
        function SalesOrderHeaderEntity(aspect) {
            _super.call(this, aspect);
        }
        SalesOrderHeaderEntity.prototype.toString = function () {
            return 'SalesOrderHeaderEntity';
        };
        Object.defineProperty(SalesOrderHeaderEntity.prototype, "SalesOrderID", {
            get: function () { return this._aspect._getFieldVal('SalesOrderID'); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SalesOrderHeaderEntity.prototype, "RevisionNumber", {
            get: function () { return this._aspect._getFieldVal('RevisionNumber'); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SalesOrderHeaderEntity.prototype, "OrderDate", {
            get: function () { return this._aspect._getFieldVal('OrderDate'); },
            set: function (v) { this._aspect._setFieldVal('OrderDate', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SalesOrderHeaderEntity.prototype, "DueDate", {
            get: function () { return this._aspect._getFieldVal('DueDate'); },
            set: function (v) { this._aspect._setFieldVal('DueDate', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SalesOrderHeaderEntity.prototype, "ShipDate", {
            get: function () { return this._aspect._getFieldVal('ShipDate'); },
            set: function (v) { this._aspect._setFieldVal('ShipDate', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SalesOrderHeaderEntity.prototype, "Status", {
            get: function () { return this._aspect._getFieldVal('Status'); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SalesOrderHeaderEntity.prototype, "OnlineOrderFlag", {
            get: function () { return this._aspect._getFieldVal('OnlineOrderFlag'); },
            set: function (v) { this._aspect._setFieldVal('OnlineOrderFlag', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SalesOrderHeaderEntity.prototype, "SalesOrderNumber", {
            get: function () { return this._aspect._getFieldVal('SalesOrderNumber'); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SalesOrderHeaderEntity.prototype, "PurchaseOrderNumber", {
            get: function () { return this._aspect._getFieldVal('PurchaseOrderNumber'); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SalesOrderHeaderEntity.prototype, "AccountNumber", {
            get: function () { return this._aspect._getFieldVal('AccountNumber'); },
            set: function (v) { this._aspect._setFieldVal('AccountNumber', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SalesOrderHeaderEntity.prototype, "CustomerID", {
            get: function () { return this._aspect._getFieldVal('CustomerID'); },
            set: function (v) { this._aspect._setFieldVal('CustomerID', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SalesOrderHeaderEntity.prototype, "ShipToAddressID", {
            get: function () { return this._aspect._getFieldVal('ShipToAddressID'); },
            set: function (v) { this._aspect._setFieldVal('ShipToAddressID', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SalesOrderHeaderEntity.prototype, "BillToAddressID", {
            get: function () { return this._aspect._getFieldVal('BillToAddressID'); },
            set: function (v) { this._aspect._setFieldVal('BillToAddressID', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SalesOrderHeaderEntity.prototype, "ShipMethod", {
            get: function () { return this._aspect._getFieldVal('ShipMethod'); },
            set: function (v) { this._aspect._setFieldVal('ShipMethod', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SalesOrderHeaderEntity.prototype, "CreditCardApprovalCode", {
            get: function () { return this._aspect._getFieldVal('CreditCardApprovalCode'); },
            set: function (v) { this._aspect._setFieldVal('CreditCardApprovalCode', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SalesOrderHeaderEntity.prototype, "SubTotal", {
            get: function () { return this._aspect._getFieldVal('SubTotal'); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SalesOrderHeaderEntity.prototype, "TaxAmt", {
            get: function () { return this._aspect._getFieldVal('TaxAmt'); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SalesOrderHeaderEntity.prototype, "Freight", {
            get: function () { return this._aspect._getFieldVal('Freight'); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SalesOrderHeaderEntity.prototype, "TotalDue", {
            get: function () { return this._aspect._getFieldVal('TotalDue'); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SalesOrderHeaderEntity.prototype, "Comment", {
            get: function () { return this._aspect._getFieldVal('Comment'); },
            set: function (v) { this._aspect._setFieldVal('Comment', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SalesOrderHeaderEntity.prototype, "rowguid", {
            get: function () { return this._aspect._getFieldVal('rowguid'); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SalesOrderHeaderEntity.prototype, "ModifiedDate", {
            get: function () { return this._aspect._getFieldVal('ModifiedDate'); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SalesOrderHeaderEntity.prototype, "SalesOrderDetails", {
            get: function () { return this._aspect._getNavFieldVal('SalesOrderDetails'); },
            enumerable: true,
            configurable: true
        });
        return SalesOrderHeaderEntity;
    }(RIAPP.CollectionItem));
    exports.SalesOrderHeaderEntity = SalesOrderHeaderEntity;
    var SalesOrderHeaderDb = (function (_super) {
        __extends(SalesOrderHeaderDb, _super);
        function SalesOrderHeaderDb(dbContext) {
            var opts = {
                dbContext: dbContext,
                dbSetInfo: { "fieldInfos": null, "enablePaging": false, "pageSize": 25, "dbSetName": "SalesOrderHeader" },
                childAssoc: ([]),
                parentAssoc: ([{ "name": "OrdDetailsToOrder", "parentDbSetName": "SalesOrderHeader", "childDbSetName": "SalesOrderDetail", "childToParentName": "SalesOrderHeader", "parentToChildrenName": "SalesOrderDetails", "onDeleteAction": 1, "fieldRels": [{ "parentField": "SalesOrderID", "childField": "SalesOrderID" }] }])
            };
            opts.dbSetInfo.fieldInfos = ([{ "fieldName": "SalesOrderID", "isPrimaryKey": 1, "dataType": 3, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 4, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "RevisionNumber", "isPrimaryKey": 0, "dataType": 3, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "OrderDate", "isPrimaryKey": 0, "dataType": 7, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "DueDate", "isPrimaryKey": 0, "dataType": 7, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "ShipDate", "isPrimaryKey": 0, "dataType": 7, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "Status", "isPrimaryKey": 0, "dataType": 3, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "OnlineOrderFlag", "isPrimaryKey": 0, "dataType": 2, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "SalesOrderNumber", "isPrimaryKey": 0, "dataType": 1, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 25, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "PurchaseOrderNumber", "isPrimaryKey": 0, "dataType": 1, "isNullable": true, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 25, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "AccountNumber", "isPrimaryKey": 0, "dataType": 1, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 15, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "CustomerID", "isPrimaryKey": 0, "dataType": 3, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 4, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "ShipToAddressID", "isPrimaryKey": 0, "dataType": 3, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 4, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "BillToAddressID", "isPrimaryKey": 0, "dataType": 3, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 4, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "ShipMethod", "isPrimaryKey": 0, "dataType": 1, "isNullable": false, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 50, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "CreditCardApprovalCode", "isPrimaryKey": 0, "dataType": 1, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 15, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "SubTotal", "isPrimaryKey": 0, "dataType": 4, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "TaxAmt", "isPrimaryKey": 0, "dataType": 4, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "Freight", "isPrimaryKey": 0, "dataType": 4, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "TotalDue", "isPrimaryKey": 0, "dataType": 4, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "Comment", "isPrimaryKey": 0, "dataType": 1, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 0, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "rowguid", "isPrimaryKey": 0, "dataType": 9, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 16, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "ModifiedDate", "isPrimaryKey": 0, "dataType": 6, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 8, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "SalesOrderDetails", "isPrimaryKey": 0, "dataType": 0, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 3, "dependentOn": "", "nested": null }]);
            _super.call(this, opts, SalesOrderHeaderEntity);
        }
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
    var SalesOrderDetailEntity = (function (_super) {
        __extends(SalesOrderDetailEntity, _super);
        function SalesOrderDetailEntity(aspect) {
            _super.call(this, aspect);
        }
        SalesOrderDetailEntity.prototype.toString = function () {
            return 'SalesOrderDetailEntity';
        };
        Object.defineProperty(SalesOrderDetailEntity.prototype, "SalesOrderID", {
            get: function () { return this._aspect._getFieldVal('SalesOrderID'); },
            set: function (v) { this._aspect._setFieldVal('SalesOrderID', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SalesOrderDetailEntity.prototype, "SalesOrderDetailID", {
            get: function () { return this._aspect._getFieldVal('SalesOrderDetailID'); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SalesOrderDetailEntity.prototype, "OrderQty", {
            get: function () { return this._aspect._getFieldVal('OrderQty'); },
            set: function (v) { this._aspect._setFieldVal('OrderQty', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SalesOrderDetailEntity.prototype, "ProductID", {
            get: function () { return this._aspect._getFieldVal('ProductID'); },
            set: function (v) { this._aspect._setFieldVal('ProductID', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SalesOrderDetailEntity.prototype, "UnitPrice", {
            get: function () { return this._aspect._getFieldVal('UnitPrice'); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SalesOrderDetailEntity.prototype, "UnitPriceDiscount", {
            get: function () { return this._aspect._getFieldVal('UnitPriceDiscount'); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SalesOrderDetailEntity.prototype, "LineTotal", {
            get: function () { return this._aspect._getFieldVal('LineTotal'); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SalesOrderDetailEntity.prototype, "rowguid", {
            get: function () { return this._aspect._getFieldVal('rowguid'); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SalesOrderDetailEntity.prototype, "ModifiedDate", {
            get: function () { return this._aspect._getFieldVal('ModifiedDate'); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SalesOrderDetailEntity.prototype, "SalesOrderHeader", {
            get: function () { return this._aspect._getNavFieldVal('SalesOrderHeader'); },
            set: function (v) { this._aspect._setNavFieldVal('SalesOrderHeader', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SalesOrderDetailEntity.prototype, "Product", {
            get: function () { return this._aspect._getNavFieldVal('Product'); },
            set: function (v) { this._aspect._setNavFieldVal('Product', v); },
            enumerable: true,
            configurable: true
        });
        return SalesOrderDetailEntity;
    }(RIAPP.CollectionItem));
    exports.SalesOrderDetailEntity = SalesOrderDetailEntity;
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
            _super.call(this, opts, SalesOrderDetailEntity);
        }
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
    var ProductCategoryEntity = (function (_super) {
        __extends(ProductCategoryEntity, _super);
        function ProductCategoryEntity(aspect) {
            _super.call(this, aspect);
        }
        ProductCategoryEntity.prototype.toString = function () {
            return 'ProductCategoryEntity';
        };
        Object.defineProperty(ProductCategoryEntity.prototype, "ProductCategoryID", {
            get: function () { return this._aspect._getFieldVal('ProductCategoryID'); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductCategoryEntity.prototype, "ParentProductCategoryID", {
            get: function () { return this._aspect._getFieldVal('ParentProductCategoryID'); },
            set: function (v) { this._aspect._setFieldVal('ParentProductCategoryID', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductCategoryEntity.prototype, "Name", {
            get: function () { return this._aspect._getFieldVal('Name'); },
            set: function (v) { this._aspect._setFieldVal('Name', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductCategoryEntity.prototype, "rowguid", {
            get: function () { return this._aspect._getFieldVal('rowguid'); },
            set: function (v) { this._aspect._setFieldVal('rowguid', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProductCategoryEntity.prototype, "ModifiedDate", {
            get: function () { return this._aspect._getFieldVal('ModifiedDate'); },
            set: function (v) { this._aspect._setFieldVal('ModifiedDate', v); },
            enumerable: true,
            configurable: true
        });
        return ProductCategoryEntity;
    }(RIAPP.CollectionItem));
    exports.ProductCategoryEntity = ProductCategoryEntity;
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
            _super.call(this, opts, ProductCategoryEntity);
        }
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
    var LookUpProductEntity = (function (_super) {
        __extends(LookUpProductEntity, _super);
        function LookUpProductEntity(aspect) {
            _super.call(this, aspect);
        }
        LookUpProductEntity.prototype.toString = function () {
            return 'LookUpProductEntity';
        };
        Object.defineProperty(LookUpProductEntity.prototype, "ProductID", {
            get: function () { return this._aspect._getFieldVal('ProductID'); },
            set: function (v) { this._aspect._setFieldVal('ProductID', v); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LookUpProductEntity.prototype, "Name", {
            get: function () { return this._aspect._getFieldVal('Name'); },
            set: function (v) { this._aspect._setFieldVal('Name', v); },
            enumerable: true,
            configurable: true
        });
        return LookUpProductEntity;
    }(RIAPP.CollectionItem));
    exports.LookUpProductEntity = LookUpProductEntity;
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
            _super.call(this, opts, LookUpProductEntity);
        }
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
    var DbSets = (function (_super) {
        __extends(DbSets, _super);
        function DbSets(dbContext) {
            _super.call(this, dbContext);
            this._dbSetNames = ["Product", "ProductModel", "SalesOrderHeader", "SalesOrderDetail", "ProductCategory", "LookUpProduct"];
            this._createDbSet("Product", ProductDb);
            this._createDbSet("ProductModel", ProductModelDb);
            this._createDbSet("SalesOrderHeader", SalesOrderHeaderDb);
            this._createDbSet("SalesOrderDetail", SalesOrderDetailDb);
            this._createDbSet("ProductCategory", ProductCategoryDb);
            this._createDbSet("LookUpProduct", LookUpProductDb);
        }
        Object.defineProperty(DbSets.prototype, "Product", {
            get: function () { return this.getDbSet("Product"); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DbSets.prototype, "ProductModel", {
            get: function () { return this.getDbSet("ProductModel"); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DbSets.prototype, "SalesOrderHeader", {
            get: function () { return this.getDbSet("SalesOrderHeader"); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DbSets.prototype, "SalesOrderDetail", {
            get: function () { return this.getDbSet("SalesOrderDetail"); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DbSets.prototype, "ProductCategory", {
            get: function () { return this.getDbSet("ProductCategory"); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DbSets.prototype, "LookUpProduct", {
            get: function () { return this.getDbSet("LookUpProduct"); },
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
            var associations = [{ "name": "OrdDetailsToOrder", "parentDbSetName": "SalesOrderHeader", "childDbSetName": "SalesOrderDetail", "childToParentName": "SalesOrderHeader", "parentToChildrenName": "SalesOrderDetails", "onDeleteAction": 1, "fieldRels": [{ "parentField": "SalesOrderID", "childField": "SalesOrderID" }] }, { "name": "OrdDetailsToProduct", "parentDbSetName": "Product", "childDbSetName": "SalesOrderDetail", "childToParentName": "Product", "parentToChildrenName": "SalesOrderDetails", "onDeleteAction": 0, "fieldRels": [{ "parentField": "ProductID", "childField": "ProductID" }] }];
            this._initAssociations(associations);
            var methods = [{ "methodName": "ReadProductLookUp", "parameters": [], "methodResult": true, "isQuery": true }, { "methodName": "ReadProductCategory", "parameters": [], "methodResult": true, "isQuery": true }, { "methodName": "ReadSalesOrderDetail", "parameters": [], "methodResult": true, "isQuery": true }, { "methodName": "TestComplexInvoke", "parameters": [{ "name": "info", "dataType": 0, "isArray": false, "isNullable": false, "dateConversion": 0, "ordinal": 0 }, { "name": "keys", "dataType": 0, "isArray": true, "isNullable": false, "dateConversion": 0, "ordinal": 1 }], "methodResult": false, "isQuery": false }, { "methodName": "TestInvoke", "parameters": [{ "name": "param1", "dataType": 10, "isArray": false, "isNullable": false, "dateConversion": 0, "ordinal": 0 }, { "name": "param2", "dataType": 1, "isArray": false, "isNullable": false, "dateConversion": 0, "ordinal": 1 }], "methodResult": true, "isQuery": false }, { "methodName": "ReadProductByIds", "parameters": [{ "name": "productIDs", "dataType": 3, "isArray": true, "isNullable": false, "dateConversion": 0, "ordinal": 0 }], "methodResult": true, "isQuery": true }, { "methodName": "ReadProduct", "parameters": [{ "name": "param1", "dataType": 3, "isArray": true, "isNullable": false, "dateConversion": 0, "ordinal": 0 }, { "name": "param2", "dataType": 1, "isArray": false, "isNullable": false, "dateConversion": 0, "ordinal": 1 }], "methodResult": true, "isQuery": true }, { "methodName": "ReadSalesOrderHeader", "parameters": [], "methodResult": true, "isQuery": true }, { "methodName": "ReadProductModel", "parameters": [], "methodResult": true, "isQuery": true }];
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
