import * as RIAPP from "jriapp";
import * as dbMOD from "jriapp_db";
import * as uiMOD from "jriapp_ui";

import * as DEMODB from "../demo/demoDB";
import { ResetCommand } from "./commands";
import { DemoApplication } from "./app";

var utils = RIAPP.Utils, coreUtils = RIAPP.Utils.core, $ = utils.dom.$;

export class ProductsFilter extends RIAPP.BaseObject {
    private _prodNumber: any;
    private _name: string;
    private _parentCategoryID: number;
    private _childCategoryID: number;
    private _selectedCategory: DEMODB.ProductCategory;
    private _selectedModel: DEMODB.ProductModel;
    private _modelID: number;
    private _parentCategories: dbMOD.DataView<DEMODB.ProductCategory>;
    private _childCategories: dbMOD.DataView<DEMODB.ProductCategory>;
    private _resetCommand: ResetCommand;
    private _app: DemoApplication;
    private _saleStart1: Date;
    private _saleStart2: Date;
    private _sizes: DEMODB.KeyValDictionary;
    private _size: number;

    constructor(app: DemoApplication) {
        super();
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
        //filters top level product categories
        this._parentCategories = new dbMOD.DataView<DEMODB.ProductCategory>(
            {
                dataSource: this.ProductCategories,
                fn_sort: function (a, b) { return a.ProductCategoryID - b.ProductCategoryID; },
                fn_filter: function (item) { return item.ParentProductCategoryID == null; }
            });


        //filters product categories which have parent category
        this._childCategories = new dbMOD.DataView<DEMODB.ProductCategory>(
            {
                dataSource: this.ProductCategories,
                fn_sort: function (a, b) { return a.ProductCategoryID - b.ProductCategoryID; },
                fn_filter: function (item) { return item.ParentProductCategoryID !== null && item.ParentProductCategoryID == self.parentCategoryID; }
            });
        this._sizes = new DEMODB.KeyValDictionary();
        this._sizes.fillItems([{ key: 0, val: 'EMPTY' }, { key: 1, val: 'NOT EMPTY' }, { key: 2, val: 'SMALL SIZE' }, { key: 3, val: 'BIG SIZE' }], true);
        this._size = null;
        this._resetCommand = new ResetCommand(self);
    }
    _loadCategories() {
        var query = this.ProductCategories.createReadProductCategoryQuery();
        query.orderBy('Name');
        //returns a promise
        return query.load();
    }
    //returns a promise
    _loadProductModels() {
        var query = this.ProductModels.createReadProductModelQuery();
        query.orderBy('Name');
        //returns promise
        return query.load();
    }
    //returns a promise
    load() {
        //load two dbsets simultaneously
        var promise1 = this._loadCategories(), promise2 = this._loadProductModels();
        return utils.defer.whenAll<any>([promise1, promise2]);
    }
    reset() {
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
    }
    get prodNumber() { return this._prodNumber; }
    set prodNumber(v) {
        if (this._prodNumber != v) {
            this._prodNumber = v;
            this.raisePropertyChanged('prodNumber');
        }
    }
    get name() { return this._name; }
    set name(v) {
        if (this._name != v) {
            this._name = v;
            this.raisePropertyChanged('name');
        }
    }
    get parentCategoryID() { return this._parentCategoryID; }
    set parentCategoryID(v) {
        if (this._parentCategoryID != v) {
            this._parentCategoryID = v;
            this.raisePropertyChanged('parentCategoryID');
            this._childCategories.refresh();
        }
    }
    get childCategoryID() { return this._childCategoryID; }
    set childCategoryID(v) {
        if (this._childCategoryID != v) {
            this._childCategoryID = v;
            this.raisePropertyChanged('childCategoryID');
        }
    }
    get modelID() { return this._modelID; }
    set modelID(v) {
        if (this._modelID != v) {
            this._modelID = v;
            this.raisePropertyChanged('modelID');
        }
    }
    get saleStart1() { return this._saleStart1; }
    set saleStart1(v) {
        if (this._saleStart1 != v) {
            this._saleStart1 = v;
            this.raisePropertyChanged('saleStart1');
        }
    }
    get saleStart2() { return this._saleStart2; }
    set saleStart2(v) {
        if (this._saleStart2 != v) {
            this._saleStart2 = v;
            this.raisePropertyChanged('saleStart2');
        }
    }
    get dbSets() { return this.dbContext.dbSets; }
    get ParentCategories() { return this._parentCategories; }
    get ChildCategories() { return this._childCategories; }
    get ProductModels() { return this.dbSets.ProductModel; }
    get ProductCategories() { return this.dbSets.ProductCategory; }
    get resetCommand() { return this._resetCommand; }
    get searchTextToolTip() { return "Use placeholder <span style='font-size: larger'><b>%</b></span><br/> for searching by part of the value"; }
    get selectedCategory() { return this._selectedCategory; }
    set selectedCategory(v) {
        if (this._selectedCategory != v) {
            this._selectedCategory = v;
            this.raisePropertyChanged('selectedCategory');
        }
    }
    get selectedModel() { return this._selectedModel; }
    set selectedModel(v) {
        if (this._selectedModel != v) {
            this._selectedModel = v;
            this.raisePropertyChanged('selectedModel');
        }
    }
    get sizes() { return this._sizes; }
    get size() { return this._size; }
    set size(v) {
        if (this._size != v) {
            this._size = v;
            this.raisePropertyChanged('size');
        }
    }
    set modelData(data: {
        names: dbMOD.IFieldName[];
        rows: dbMOD.IRowData[];
    }) { this.ProductModels.fillData(data); }
    set categoryData(data: {
        names: dbMOD.IFieldName[];
        rows: dbMOD.IRowData[];
    }) { this.ProductCategories.fillData(data); }
    get dbContext() { return this._app.dbContext; }
}