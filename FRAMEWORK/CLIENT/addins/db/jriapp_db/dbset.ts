/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { FIELD_TYPE, DATE_CONVERSION, DATA_TYPE, SORT_ORDER } from "jriapp_core/const";
import {
    IIndexer, IFieldInfo, IValidationInfo, TEventHandler, IBaseObject,
    IPromise, TPriority
} from "jriapp_core/shared";
import { ERRS } from "jriapp_core/lang";
import { BaseObject } from "jriapp_core/object";
import { Debounce } from "jriapp_utils/debounce";
import { Utils } from "jriapp_utils/utils";
import {
    valueUtils, COLL_CHANGE_REASON, ITEM_STATUS, IInternalCollMethods, BaseCollection,
    fn_traverseField, fn_traverseFields, fn_getPropertyByName, COLL_CHANGE_TYPE, COLL_CHANGE_OPER
} from "jriapp";

const utils = Utils, checks = utils.check, strUtils = utils.str, coreUtils = utils.core, ERROR = utils.err;

import {
    IFieldName, IEntityItem, IEntityConstructor, IValueChange, IRowInfo, ITrackAssoc, IQueryResponse, IPermissions, IDbSetConstuctorOptions, IDbSetOptions,
    IAssociationInfo, IDbSetInfo, ICalcFieldImpl, INavFieldImpl, IQueryResult, IQueryRequest, IQueryParamInfo, IRowData,
    IDbSetLoadedArgs
} from "int";
import { PROP_NAME, REFRESH_MODE } from "const";
import { DataCache } from "datacache";
import { DataQuery } from "dataquery";
import { DbContext } from "dbcontext";
import { EntityAspect } from "entity_aspect";

export interface IFillFromServiceArgs {
    res: IQueryResponse;
    reason: COLL_CHANGE_REASON;
    query: DataQuery<IEntityItem>;
    onFillEnd: () => void;
}

export interface IFillFromCacheArgs {
    reason: COLL_CHANGE_REASON;
    query: DataQuery<IEntityItem>;
}

export interface IInternalDbSetMethods<TItem extends IEntityItem> extends IInternalCollMethods<TItem> {
    getCalcFieldVal(fieldName: string, item: IEntityItem): any;
    getNavFieldVal(fieldName: string, item: IEntityItem): any;
    setNavFieldVal(fieldName: string, item: IEntityItem, value: any): void;
    beforeLoad(query: DataQuery<TItem>, oldQuery: DataQuery<TItem>): void;
    updatePermissions(perms: IPermissions): void;
    getChildToParentNames(childFieldName: string): string[];
    fillFromService(info: IFillFromServiceArgs): IQueryResult<TItem>;
    fillFromCache(info: IFillFromCacheArgs): IQueryResult<TItem>;
    commitChanges(rows: IRowInfo[]): void;
    setItemInvalid(row: IRowInfo): TItem;
    getChanges(): IRowInfo[];
    getTrackAssocInfo(): ITrackAssoc[];
    addToChanged(item: TItem): void;
    removeFromChanged(key: string): void;
    onItemStatusChanged(item: TItem, oldStatus: ITEM_STATUS): void;
}

const DBSET_EVENTS = {
    loaded: "loaded"
};

export interface IDbSetConstructor<TItem extends IEntityItem> {
    new (dbContext: DbContext): DbSet<TItem, DbContext>;
}

export class DbSet<TItem extends IEntityItem, TDbContext extends DbContext> extends BaseCollection<TItem> {
    private _dbContext: TDbContext;
    private _isSubmitOnDelete: boolean;
    private _trackAssoc: { [name: string]: IAssociationInfo; };
    private _trackAssocMap: { [childFieldName: string]: string[]; };
    private _childAssocMap: { [fieldName: string]: IAssociationInfo; };
    private _parentAssocMap: { [fieldName: string]: IAssociationInfo; };
    private _changeCount: number;
    private _changeCache: { [key: string]: TItem; };
    protected _options: IDbSetOptions;
    protected _navfldMap: { [fieldName: string]: INavFieldImpl<TItem>; };
    protected _calcfldMap: { [fieldName: string]: ICalcFieldImpl<TItem>; };
    protected _itemsByKey: { [key: string]: TItem; };
    protected _entityType: IEntityConstructor<TItem>;
    protected _ignorePageChanged: boolean;
    protected _query: DataQuery<TItem>;
    private _pageDebounce: Debounce;

    constructor(opts: IDbSetConstuctorOptions) {
        super();
        let self = this, dbContext = opts.dbContext, dbSetInfo = opts.dbSetInfo, fieldInfos = dbSetInfo.fieldInfos;
        this._dbContext = <TDbContext>dbContext;
        this._options.dbSetName = dbSetInfo.dbSetName;
        this._options.enablePaging = dbSetInfo.enablePaging;
        this._options.pageSize = dbSetInfo.pageSize;
        this._query = null;
        this._entityType = null;
        this._isSubmitOnDelete = false;
        this._navfldMap = {};
        this._calcfldMap = {};
        this._fieldInfos = fieldInfos;
        this._pageDebounce = new Debounce(400);
        //association infos maped by name
        //we should track changes in navigation properties for this associations
        this._trackAssoc = {};
        //map childToParentName by childField as a key
        this._trackAssocMap = {};
        //map association infos by childToParent fieldname
        this._childAssocMap = {};
        //map association infos by parentToChildren fieldname
        this._parentAssocMap = {};

        this._changeCount = 0;
        this._changeCache = {};
        this._ignorePageChanged = false;
        fieldInfos.forEach(function (f) {
            self._fieldMap[f.fieldName] = f;
            fn_traverseField(f, (fld, fullName) => {
                fld.dependents = [];
                fld.fullName = fullName;
            });
        });
        fn_traverseFields(fieldInfos, (fld, fullName) => {
            if (fld.fieldType === FIELD_TYPE.Navigation) {
                //navigation fields can NOT be on nested fields
                coreUtils.setValue(self._navfldMap, fullName, self._doNavigationField(opts, fld), true);
            }
            else if (fld.fieldType === FIELD_TYPE.Calculated) {
                //calculated fields can be on nested fields
                coreUtils.setValue(self._calcfldMap, fullName, self._doCalculatedField(opts, fld), true);
            }
        });

        self._mapAssocFields();
        Object.freeze(this._perms);
        let internalObj = {
            getCalcFieldVal: (fieldName: string, item: TItem) => {
                return self._getCalcFieldVal(fieldName, item);
            },
            getNavFieldVal: (fieldName: string, item: TItem) => {
                return self._getNavFieldVal(fieldName, item);
            },
            setNavFieldVal: (fieldName: string, item: TItem, value: any) => {
                self._setNavFieldVal(fieldName, item, value);
            },
            beforeLoad: (query: DataQuery<TItem>, oldQuery: DataQuery<TItem>) => {
                self._beforeLoad(query, oldQuery);
            },
            updatePermissions: (perms: IPermissions) => {
                self._updatePermissions(perms);
            },
            getChildToParentNames: (childFieldName: string) => {
                return self._getChildToParentNames(childFieldName);
            },
            fillFromService: (info: IFillFromServiceArgs) => {
                return self._fillFromService(info);
            },
            fillFromCache: (info: IFillFromCacheArgs) => {
                return self._fillFromCache(info);
            },
            commitChanges: (rows: IRowInfo[]) => {
                self._commitChanges(rows);
            },
            setItemInvalid: (row: IRowInfo) => {
                return self._setItemInvalid(row);
            },
            getChanges: () => {
                return self._getChanges();
            },
            getTrackAssocInfo: () => {
                return self._getTrackAssocInfo();
            },
            addToChanged: (item: TItem) => {
                self._addToChanged(item);
            },
            removeFromChanged: (key: string) => {
                self._removeFromChanged(key);
            },
            onItemStatusChanged: (item: TItem, oldStatus: ITEM_STATUS) => {
                self._onItemStatusChanged(item, oldStatus);
            }
        };
        coreUtils.merge(internalObj, this._internal);
        this.dbContext.addOnPropertyChange(PROP_NAME.isSubmiting, (s, a) => {
            self.raisePropertyChanged(PROP_NAME.isBusy);
        }, this.dbSetName);
        this.addOnPropertyChange(PROP_NAME.isLoading, (s, a) => { self.raisePropertyChanged(PROP_NAME.isBusy); });
    }
    public handleError(error: any, source: any): boolean {
        if (!this._dbContext)
            return super.handleError(error, source);
        else
            return this._dbContext.handleError(error, source);
    }
    protected _getEventNames() {
        let base_events = super._getEventNames();
        return [DBSET_EVENTS.loaded].concat(base_events);
    }
    protected _mapAssocFields() {
        let trackAssoc = this._trackAssoc, assoc: IAssociationInfo, tasKeys = Object.keys(trackAssoc),
            frel: { childField: string; parentField: string; },
            trackAssocMap = this._trackAssocMap;
        for (let i = 0, len = tasKeys.length; i < len; i += 1) {
            assoc = trackAssoc[tasKeys[i]];
            for (let j = 0, len2 = assoc.fieldRels.length; j < len2; j += 1) {
                frel = assoc.fieldRels[j];
                if (!checks.isArray(trackAssocMap[frel.childField])) {
                    trackAssocMap[frel.childField] = [assoc.childToParentName];
                }
                else {
                    trackAssocMap[frel.childField].push(assoc.childToParentName);
                }
            }
        }
    }
    protected _doNavigationField(opts: IDbSetConstuctorOptions, fieldInfo: IFieldInfo): INavFieldImpl<TItem> {
        let self = this, isChild = true, result: INavFieldImpl<TItem> = { getFunc: (item) => { throw new Error("Function is not implemented"); }, setFunc: function (v: any) { throw new Error("Function is not implemented"); } };
        let assocs = opts.childAssoc.filter(function (a) {
            return a.childToParentName === fieldInfo.fieldName;
        });

        if (assocs.length === 0) {
            assocs = opts.parentAssoc.filter(function (a) {
                return a.parentToChildrenName === fieldInfo.fieldName;
            });
            isChild = false;
        }

        if (assocs.length !== 1)
            throw new Error(strUtils.format(ERRS.ERR_PARAM_INVALID_TYPE, "assocs", "Array"));
        let assocName = assocs[0].name;
        fieldInfo.isReadOnly = true;
        if (isChild) {
            fieldInfo.isReadOnly = false;
            self._childAssocMap[assocs[0].childToParentName] = assocs[0];
            assocs[0].fieldRels.forEach(function (frel) {
                let chf = self.getFieldInfo(frel.childField);
                if (!fieldInfo.isReadOnly && chf.isReadOnly) {
                    fieldInfo.isReadOnly = true;
                }
            });
            //this property should return parent
            result.getFunc = function (item: TItem) {
                let assoc = self.dbContext.getAssociation(assocName);
                return assoc.getParentItem(item);
            };

            if (!fieldInfo.isReadOnly) {
                //should track this association for new items parent - child relationship changes
                self._trackAssoc[assocName] = assocs[0];

                result.setFunc = function (v) {
                    let entity: TItem = this, i: number, len: number, assoc = self.dbContext.getAssociation(assocName);
                    if (!!v && !(v instanceof assoc.parentDS.entityType)) {
                        throw new Error(strUtils.format(ERRS.ERR_PARAM_INVALID_TYPE, "value", assoc.parentDS.dbSetName));
                    }
                    if (!!v && !!v._aspect && (<IEntityItem>v)._aspect.isNew) {
                        entity._aspect._setFieldVal(fieldInfo.fieldName, (<IEntityItem>v)._key);
                    }
                    else if (!!v) {
                        for (i = 0, len = assoc.childFldInfos.length; i < len; i += 1) {
                            (<any>entity)[assoc.childFldInfos[i].fieldName] = v[assoc.parentFldInfos[i].fieldName];
                        }
                    }
                    else {
                        let oldKey = entity._aspect._getFieldVal(fieldInfo.fieldName);
                        if (!!oldKey) {
                            entity._aspect._setFieldVal(fieldInfo.fieldName, null);
                        }
                        for (i = 0, len = assoc.childFldInfos.length; i < len; i += 1) {
                            (<any>entity)[assoc.childFldInfos[i].fieldName] = null;
                        }
                    }
                };
            }
        } //if (isChild)
        else {
            self._parentAssocMap[assocs[0].parentToChildrenName] = assocs[0];
            //returns items children
            result.getFunc = function (item: TItem) {
                return self.dbContext.getAssociation(assocName).getChildItems(item);
            };
        }
        return result;
    }
    protected _doCalculatedField(opts: IDbSetConstuctorOptions, fieldInfo: IFieldInfo): ICalcFieldImpl<TItem> {
        let self = this, result: ICalcFieldImpl<TItem> = { getFunc: (item) => { throw new Error(strUtils.format("Calculated field:'{0}' is not initialized", fieldInfo.fieldName)); } };
        function doDependences(info: IFieldInfo) {
            if (!info.dependentOn)
                return;
            let deps: string[] = info.dependentOn.split(",");
            deps.forEach(function (depOn) {
                let depOnFld = self.getFieldInfo(depOn);
                if (!depOnFld)
                    throw new Error(strUtils.format(ERRS.ERR_CALC_FIELD_DEFINE, depOn));
                if (info === depOnFld)
                    throw new Error(strUtils.format(ERRS.ERR_CALC_FIELD_SELF_DEPEND, depOn));
                if (depOnFld.dependents.indexOf(info.fullName) < 0) {
                    depOnFld.dependents.push(info.fullName);
                }
            });
        };
        fieldInfo.isReadOnly = true;
        if (!!fieldInfo.dependentOn) {
            doDependences(fieldInfo);
        }
        return result;
    }
    protected _refreshValues(path: string, item: IEntityItem, values: any[], names: IFieldName[], rm: REFRESH_MODE): void {
        let self = this;
        values.forEach(function (value, index) {
            let name: IFieldName = names[index], fieldName = path + name.n, fld = self.getFieldInfo(fieldName);
            if (!fld)
                throw new Error(strUtils.format(ERRS.ERR_DBSET_INVALID_FIELDNAME, self.dbSetName, fieldName));

            if (fld.fieldType === FIELD_TYPE.Object) {
                //for object fields the value should be an array of values - recursive processing
                self._refreshValues(fieldName + ".", item, <any[]>value, name.p, rm);
            }
            else {
                //for other fields the value is a string
                item._aspect._refreshValue(value, fieldName, rm);
            }
        });
    }
    protected _setCurrentItem(v: TItem) {
        if (!!v && !(v instanceof this._entityType)) {
            throw new Error(strUtils.format(ERRS.ERR_PARAM_INVALID_TYPE, "currentItem", this._options.dbSetName));
        }
        super._setCurrentItem(v);
    }
    protected _getNewKey(item: TItem) {
        //client's item ID
        let key = "clkey_" + this._newKey;
        this._newKey += 1;
        return key;
    }
    //override
    protected _createNew(): TItem {
        return this.createEntity(null, null);
    }
    protected _clearChangeCache() {
        let old = this._changeCount;
        this._changeCache = {};
        this._changeCount = 0;
        if (old !== this._changeCount)
            this.raisePropertyChanged(PROP_NAME.isHasChanges);
    }
    protected _onPageChanging() {
        let res = super._onPageChanging();
        if (!res) {
            return res;
        }
        if (this.isHasChanges) {
            this.rejectChanges();
        }
        return res;
    }
    protected _onPageChanged() {
        let self = this;
        this.cancelEdit();
        super._onPageChanged();
        if (this._ignorePageChanged)
            return;
        self.query.pageIndex = self.pageIndex;
        self._pageDebounce.enqueue(() => {
            self.dbContext._getInternal().load(self.query, COLL_CHANGE_REASON.PageChange);
        });
    }
    protected _onPageSizeChanged() {
        super._onPageSizeChanged();
        if (!!this._query)
            this._query.pageSize = this.pageSize;
    }
    protected _defineCalculatedField(fullName: string, getFunc: (item: TItem) => any) {
        let calcDef: ICalcFieldImpl<TItem> = coreUtils.getValue(this._calcfldMap, fullName);
        if (!calcDef) {
            throw new Error(strUtils.format(ERRS.ERR_PARAM_INVALID, "calculated fieldName", fullName));
        }
        calcDef.getFunc = getFunc;
    }
    protected _getStrValue(val: any, fieldInfo: IFieldInfo) {
        let dcnv = fieldInfo.dateConversion, stz = this.dbContext.serverTimezone;
        return valueUtils.stringifyValue(val, dcnv, fieldInfo.dataType, stz);
    }
    protected _getCalcFieldVal(fieldName: string, item: TItem): any {
        try {
            let val: ICalcFieldImpl<TItem> = coreUtils.getValue(this._calcfldMap, fieldName);
            return val.getFunc.call(item, item);
        }
        catch (err)
        {
            ERROR.reThrow(err, this.handleError(err, this));
        }
    }
    protected _getNavFieldVal(fieldName: string, item: TItem): any {
        let val: INavFieldImpl<TItem> = coreUtils.getValue(this._navfldMap, fieldName);
        return val.getFunc.call(item, item);
    }
    protected _setNavFieldVal(fieldName: string, item: TItem, value: any): void {
        let val: INavFieldImpl<TItem> = coreUtils.getValue(this._navfldMap, fieldName);
        val.setFunc.call(item, value);
    }
    protected _beforeLoad(query: DataQuery<TItem>, oldQuery: DataQuery<TItem>): void {
        if (!!query && oldQuery !== query) {
            this._query = query;
            this._query.pageIndex = 0;
        }

        if (!!oldQuery && oldQuery !== query) {
            oldQuery.destroy();
        }

        if (query.pageSize !== this.pageSize) {
            this._ignorePageChanged = true;
            try {
                this.pageIndex = 0;
                this.pageSize = query.pageSize;
            }
            finally {
                this._ignorePageChanged = false;
            }
        }

        if (query.pageIndex !== this.pageIndex) {
            this._ignorePageChanged = true;
            try {
                this.pageIndex = query.pageIndex;
            }
            finally {
                this._ignorePageChanged = false;
            }
        }

        if (!query.isCacheValid) {
            query._getInternal().clearCache();
        }
    }
    protected _updatePermissions(perms: IPermissions): void {
        this._perms = perms;
    }
    protected _getChildToParentNames(childFieldName: string): string[] { return this._trackAssocMap[childFieldName]; }
    protected _afterFill(result: IQueryResult<TItem>, isClearAll?: boolean) {
        const self = this;

        if (!checks.isNt(result.fetchedItems))
            this._onLoaded(result.fetchedItems);

        this._onCollectionChanged({
            changeType: !isClearAll ? COLL_CHANGE_TYPE.Add : COLL_CHANGE_TYPE.Reset,
            reason: result.reason,
            oper: COLL_CHANGE_OPER.Fill,
            items: result.newItems.items,
            pos: result.newItems.pos
        });

        this._onFillEnd({
            items: result.items,
            newItems: result.newItems.items,
            reason: result.reason
        });

        if (!!isClearAll) {
            self.moveFirst();
        }
    }
    protected _fillFromService(info: IFillFromServiceArgs): IQueryResult<TItem> {
        let self = this, res = info.res, fieldNames = res.names, rows = res.rows || [], rowCount = rows.length,
            newItems: TItem[] = [], positions: number[] = [], arr: TItem[] = [], fetchedItems: TItem[] = [],
            isPagingEnabled = this.isPagingEnabled, query = info.query, isClearAll = true, dataCache: DataCache, items: TItem[] = [];

        if (!!query && !query.getIsDestroyCalled()) {
            isClearAll = query.isClearPrevData;
            if (query.isClearCacheOnEveryLoad)
                query._getInternal().clearCache();
            if (isClearAll)
                this._clear(info.reason, COLL_CHANGE_OPER.Fill);
            query._getInternal().reindexCache();
            if (query.loadPageCount > 1 && isPagingEnabled) {
                dataCache = query._getInternal().getCache();
                if (query.isIncludeTotalCount && !checks.isNt(res.totalCount))
                    dataCache.totalCount = res.totalCount;
            }
        }

        fetchedItems = rows.map(function (row) {
            //row.key already a string value generated on server (no need to convert to string)
            let key = row.k;
            if (!key)
                throw new Error(ERRS.ERR_KEY_IS_EMPTY);

            let item = self._itemsByKey[key];
            if (!item) {
                if (!!dataCache) {
                    item = <TItem>dataCache.getItemByKey(key);
                }
            }
            if (!item) {
                item = self.createEntity(row, fieldNames);
            }
            else {
                self._refreshValues("", item, row.v, fieldNames, REFRESH_MODE.RefreshCurrent);
            }
            return item;
        });

        arr = fetchedItems;

        if (!!query && !query.getIsDestroyCalled()) {
            if (query.isIncludeTotalCount && !checks.isNt(res.totalCount)) {
                this.totalCount = res.totalCount;
            }

            if (query.loadPageCount > 1 && isPagingEnabled) {
                dataCache.fillCache(res.pageIndex, fetchedItems);
                let page = dataCache.getCachedPage(query.pageIndex);
                if (!page)
                    arr = [];
                else
                    arr = <TItem[]>page.items;
            }
        }

        arr.forEach(function (item) {
            let oldItem = self._itemsByKey[item._key];
            if (!oldItem) {
                self._items.push(item);
                positions.push(self._items.length - 1);
                self._itemsByKey[item._key] = item;
                newItems.push(item);
                items.push(item);
            }
            else {
                items.push(oldItem);
            }
        });

        if (newItems.length > 0) {
            this._onCountChanged();
        }

        let result: IQueryResult<TItem> = {
            newItems: {
                items: newItems,
                pos: positions
            },
            fetchedItems: fetchedItems,
            items: items,
            reason: info.reason,
            outOfBandData: info.res.extraInfo
        };

        info.onFillEnd();
        this._afterFill(result, isClearAll);
        return result;
    }
    protected _fillFromCache(info: IFillFromCacheArgs): IQueryResult<TItem> {
        let self = this, positions: number[] = [], items: TItem[] = [], query = info.query;
        if (!query)
            throw new Error(strUtils.format(ERRS.ERR_ASSERTION_FAILED, "query is not null"));
        if (query.getIsDestroyCalled())
            throw new Error(strUtils.format(ERRS.ERR_ASSERTION_FAILED, "query not destroyed"));
        let dataCache = query._getInternal().getCache(), cachedPage = dataCache.getCachedPage(query.pageIndex),
            arr = !cachedPage ? <TItem[]>[] : <TItem[]>cachedPage.items;


        this._clear(info.reason, COLL_CHANGE_OPER.Fill);
        this._items = arr;

        arr.forEach(function (item, index) {
            self._itemsByKey[item._key] = item;
            positions.push(index);
            items.push(item);
        });

        if (items.length > 0) {
            this._onCountChanged();
        }

        let result: IQueryResult<TItem> = {
            newItems: {
                items: items,
                pos: positions
            },
            fetchedItems: null,
            items: items,
            reason: info.reason,
            outOfBandData: null
        };

        this._afterFill(result, true);
        return result;
    }
    protected _commitChanges(rows: IRowInfo[]): void {
        let self = this;

        rows.forEach(function (rowInfo) {
            let key = rowInfo.clientKey, item: TItem = self._itemsByKey[key];
            if (!item) {
                throw new Error(strUtils.format(ERRS.ERR_KEY_IS_NOTFOUND, key));
            }
            let itemStatus = item._aspect.status;
            item._aspect._acceptChanges(rowInfo);
            if (itemStatus === ITEM_STATUS.Added) {
                //on insert
                delete self._itemsByKey[key];
                item._aspect._updateKeys(rowInfo.serverKey);
                self._itemsByKey[item._key] = item;
                self._onCollectionChanged({
                    changeType: COLL_CHANGE_TYPE.Remap,
                    reason: COLL_CHANGE_REASON.None,
                    oper: COLL_CHANGE_OPER.Commit,
                    items: [item],
                    old_key: key,
                    new_key: item._key
                });
            }
        });
    }
    protected _setItemInvalid(row: IRowInfo): TItem {
        let keyMap = this._itemsByKey, item: TItem = keyMap[row.clientKey];
        let errors: IIndexer<string[]> = {};
        row.invalid.forEach((err) => {
            if (!err.fieldName)
                err.fieldName = "*";
            if (checks.isArray(errors[err.fieldName])) {
                errors[err.fieldName].push(err.message);
            }
            else
                errors[err.fieldName] = [err.message];
        });
        let res: IValidationInfo[] = [];
        coreUtils.iterateIndexer(errors, (fieldName, err) => {
            res.push({ fieldName: fieldName, errors: err });
        });
        this._addErrors(item, res);
        return item;
    }
    protected _getChanges(): IRowInfo[] {
        let changes: IRowInfo[] = [];
        let csh = this._changeCache;
        coreUtils.forEachProp(csh, function (key) {
            let item = csh[key];
            changes.push(item._aspect._getRowInfo());
        });
        return changes;
    }
    protected _getTrackAssocInfo(): ITrackAssoc[] {
        let self = this, res: ITrackAssoc[] = [];
        let csh: { [key: string]: IEntityItem; } = this._changeCache, assocNames = Object.keys(self._trackAssoc);
        coreUtils.forEachProp(csh, function (key) {
            let item = csh[key];
            assocNames.forEach(function (assocName) {
                let assocInfo = self._trackAssoc[assocName],
                    parentKey = item._aspect._getFieldVal(assocInfo.childToParentName),
                    childKey = item._key;
                if (!!parentKey && !!childKey) {
                    res.push({ assocName: assocName, parentKey: parentKey, childKey: childKey });
                }
            });
        });
        return res;
    }
    protected _addToChanged(item: TItem): void {
        if (item._key === null)
            return;
        if (!this._changeCache[item._key]) {
            this._changeCache[item._key] = item;
            this._changeCount += 1;
            if (this._changeCount === 1)
                this.raisePropertyChanged(PROP_NAME.isHasChanges);
        }
    }
    protected _removeFromChanged(key: string): void {
        if (key === null)
            return;
        if (!!this._changeCache[key]) {
            delete this._changeCache[key];
            this._changeCount -= 1;
            if (this._changeCount === 0)
                this.raisePropertyChanged(PROP_NAME.isHasChanges);
        }
    }
    //occurs when item Status Changed (not used in simple collections)
    protected _onItemStatusChanged(item: TItem, oldStatus: ITEM_STATUS): void {
        super._onItemStatusChanged(item, oldStatus);
        if (item._aspect.isDeleted && this.isSubmitOnDelete) {
            this.dbContext.submitChanges();
        }
    }
    protected _onRemoved(item: TItem, pos: number): void {
        this._removeFromChanged(item._key);
        super._onRemoved(item, pos);
    }
    protected _onLoaded(items: TItem[]) {
        this.raiseEvent(DBSET_EVENTS.loaded, { items: items });
    }
    protected _destroyQuery(): void {
        let query = this._query;
        this._query = null;
        if (!!query) {
            query.destroy();
        }
    }
    protected _getPKFields(): IFieldInfo[] {
        let fieldInfos = this.getFieldInfos(), pkFlds: IFieldInfo[] = [];
        for (let i = 0, len = fieldInfos.length; i < len; i += 1) {
            let fld = fieldInfos[i];
            if (fld.isPrimaryKey > 0) {
                pkFlds.push(fld);
            }
        }

        pkFlds = pkFlds.sort((f1, f2) => {
            return f1.isPrimaryKey - f2.isPrimaryKey;
        });
        return pkFlds;
    }
    protected _getNames(): IFieldName[] {
        let self = this, fieldInfos = this.getFieldInfos(), names: IFieldName[] = [];
        fn_traverseFields(fieldInfos, (fld, fullName, arr) => {
            if (fld.fieldType === FIELD_TYPE.Object) {
                let res: any[] = [];
                arr.push({
                    n: fld.fieldName, p: res
                });
                return res;
            }
            else {
                let isOK = fld.fieldType === FIELD_TYPE.None || fld.fieldType === FIELD_TYPE.RowTimeStamp || fld.fieldType === FIELD_TYPE.ServerCalculated;
                if (isOK) {
                    arr.push({
                        n: fld.fieldName, p: null
                    });
                }
                return arr;
            }
        }, names);
        return names;
    }
    protected createEntity(row: IRowData, fieldNames: IFieldName[]) {
        let aspect = new EntityAspect<TItem, TDbContext>(this, row, fieldNames);
        let item = new this.entityType(aspect);
        aspect.item = item;
        if (!row)
            aspect.key = this._getNewKey(item);
        return item;
    }
    _getInternal(): IInternalDbSetMethods<TItem> {
        return <IInternalDbSetMethods<TItem>>this._internal;
    }
    addOnLoaded(fn: TEventHandler<DbSet<TItem, TDbContext>, IDbSetLoadedArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority) {
        this._addHandler(DBSET_EVENTS.loaded, fn, nmspace, context, priority);
    }
    removeOnLoaded(nmspace?: string) {
        this._removeHandler(DBSET_EVENTS.loaded, nmspace);
    }
    waitForNotBusy(callback: () => void, groupName: string) {
        this._waitQueue.enQueue({
            prop: PROP_NAME.isBusy,
            groupName: groupName,
            predicate: function (val: any) {
                return !val;
            },
            action: callback,
            actionArgs: [],
            lastWins: !!groupName
        });
    }
    getFieldInfo(fieldName: string): IFieldInfo {
        let assoc: IAssociationInfo, parentDB: DbSet<IEntityItem, DbContext>, parts = fieldName.split(".");
        let fld = this._fieldMap[parts[0]];
        if (parts.length === 1) {
            return fld;
        }

        if (fld.fieldType === FIELD_TYPE.Object) {
            for (let i = 1; i < parts.length; i += 1) {
                fld = fn_getPropertyByName(parts[i], fld.nested);
            }
            return fld;
        }
        else if (fld.fieldType === FIELD_TYPE.Navigation) {
            //for example Customer.Name
            assoc = this._childAssocMap[fld.fieldName];
            if (!!assoc) {
                parentDB = this.dbContext.getDbSet(assoc.parentDbSetName);
                return parentDB.getFieldInfo(parts.slice(1).join("."));
            }
        }

        throw new Error(strUtils.format(ERRS.ERR_DBSET_INVALID_FIELDNAME, this.dbSetName, fieldName));
    }
    sort(fieldNames: string[], sortOrder: SORT_ORDER): IPromise<any> {
        let self = this, query = self.query;
        if (!checks.isNt(query)) {
            query.clearSort();
            for (let i = 0; i < fieldNames.length; i += 1) {
                if (i === 0)
                    query.orderBy(fieldNames[i], sortOrder);
                else
                    query.thenBy(fieldNames[i], sortOrder);
            }

            query.isClearPrevData = true;
            query.pageIndex = 0;
            return self.dbContext._getInternal().load(query, COLL_CHANGE_REASON.Sorting);
        }
        else {
            return super.sort(fieldNames, sortOrder);
        }
    }
    fillData(data: {
        names: IFieldName[];
        rows: IRowData[];
    }, isAppendData?: boolean): IQueryResult<TItem> {
        const self = this, reason = COLL_CHANGE_REASON.None;
        let newItems: TItem[] = [], positions: number[] = [], items: TItem[] = [], query = this.query;
        let isClearAll = !isAppendData;
        if (isClearAll)
            self._clear(reason, COLL_CHANGE_OPER.Fill);

        let fetchedItems = data.rows.map(function (row) {
            //row.key already a string value generated on server (no need to convert to string)
            let key = row.k;
            if (!key)
                throw new Error(ERRS.ERR_KEY_IS_EMPTY);

            let item = self._itemsByKey[key];
            if (!item) {
                item = self.createEntity(row, data.names);
            }
            else {
                self._refreshValues("", item, row.v, data.names, REFRESH_MODE.RefreshCurrent);
            }
            return item;
        });

        fetchedItems.forEach(function (item) {
            let oldItem = self._itemsByKey[item._key];
            if (!oldItem) {
                self._items.push(item);
                positions.push(self._items.length - 1);
                self._itemsByKey[item._key] = item;
                newItems.push(item);
                items.push(item);
            }
            else {
                items.push(oldItem);
            }
        });

        if (newItems.length > 0) {
            this._onCountChanged();
        }

        this.totalCount = fetchedItems.length;

        let result: IQueryResult<TItem> = {
            newItems: {
                items: newItems,
                pos: positions
            },
            fetchedItems: fetchedItems,
            items: items,
            reason: COLL_CHANGE_REASON.None,
            outOfBandData: null
        };

        this._afterFill(result, isClearAll);
        return result;
    }
    //manually fill items for an array of objects
    fillItems<TObj>(data: TObj[], isAppend?: boolean): IQueryResult<TItem> {
        let self = this;
        let fieldInfos = this.getFieldInfos(), pkFlds = self._getPKFields();
        let fn_ProcessField = (data: IIndexer<any>, keys: string[], fld: IFieldInfo, name: string, arr: any[]) => {
            let isOK = fld.fieldType === FIELD_TYPE.None || fld.fieldType === FIELD_TYPE.RowTimeStamp || fld.fieldType === FIELD_TYPE.ServerCalculated;
            if (!isOK) {
                return;
            }

            try {
                let val = coreUtils.getValue(data, name);
                let strval = self._getStrValue(val, fld);

                if (fld.isPrimaryKey > 0) {
                    let keyIndex = pkFlds.indexOf(fld);
                    keys[keyIndex] = strval;
                }
                arr.push(strval);
            }
            catch (err) {
                self.handleError(err, self);
                ERROR.throwDummy(err);
            }
        };

        try {
            //obtain field names
            let names = self._getNames();
            //obtain rows
            let rows = data.map(function (dataItem: IIndexer<any>) {
                let row: IRowData = { k: null, v: [] };
                let keys: string[] = new Array<string>(pkFlds.length);

                fn_traverseFields(fieldInfos, (fld, fullName, arr) => {
                    if (fld.fieldType === FIELD_TYPE.Object) {
                        let res: any[] = [];
                        arr.push(res);
                        return res;
                    }
                    else {
                        fn_ProcessField(dataItem, keys, fld, fullName, arr);
                        return arr;
                    }
                }, row.v);

                row.k = keys.join(";");
                return row;
            });

            self._destroyQuery();
            return self.fillData({ names: names, rows: rows }, !!isAppend);
        }
        catch (err) {
            self.handleError(err, self);
            ERROR.throwDummy(err);
        }
    }
    acceptChanges() {
        let csh = this._changeCache;
        coreUtils.forEachProp(csh, function (key) {
            let item = csh[key];
            item._aspect.acceptChanges();
        });
        this._changeCount = 0;
    }
    rejectChanges() {
        let csh = this._changeCache;
        coreUtils.forEachProp(csh, function (key) {
            let item = csh[key];
            item._aspect.rejectChanges();
        });
    }
    deleteOnSubmit(item: TItem) {
        item._aspect.deleteOnSubmit();
    }
    clear() {
        this._destroyQuery();
        super.clear();
    }
    createQuery(name: string): DataQuery<TItem> {
        let queryInfo = this.dbContext._getInternal().getQueryInfo(name);
        if (!queryInfo) {
            throw new Error(strUtils.format(ERRS.ERR_QUERY_NAME_NOTFOUND, name));
        }
        return new DataQuery<TItem>(this, queryInfo);
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this._pageDebounce.destroy();
        this._pageDebounce = null;
        this.clear();
        let dbContext = this.dbContext;
        this._dbContext = null;
        if (!!dbContext) {
            dbContext.removeNSHandlers(this.dbSetName);
        }
        this._navfldMap = {};
        this._calcfldMap = {};
        super.destroy();
    }
    toString() {
        return this._options.dbSetName;
    }
    get items() { return this._items; }
    get dbContext(): TDbContext {
        return this._dbContext;
    }
    get dbSetName() { return this._options.dbSetName; }
    get entityType() { return this._entityType; }
    get query() { return this._query; }
    get isHasChanges(): boolean { return this._changeCount > 0; }
    get cacheSize(): number {
        let query = this._query, dataCache: DataCache;
        if (!!query && query.isCacheValid) {
            dataCache = query._getInternal().getCache();
            return dataCache.cacheSize;
        }
        return 0;
    }
    get isSubmitOnDelete(): boolean { return this._isSubmitOnDelete; }
    set isSubmitOnDelete(v: boolean) {
        if (this._isSubmitOnDelete !== v) {
            this._isSubmitOnDelete = !!v;
            this.raisePropertyChanged(PROP_NAME.isSubmitOnDelete);
        }
    }
    get isBusy() { return this.isLoading || this.dbContext.isSubmiting; }
}

export type TDbSet = DbSet<IEntityItem, DbContext>;