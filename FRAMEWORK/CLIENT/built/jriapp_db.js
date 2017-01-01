var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define("jriapp_db/const", ["require", "exports"], function (require, exports) {
    "use strict";
    (function (FLAGS) {
        FLAGS[FLAGS["None"] = 0] = "None";
        FLAGS[FLAGS["Changed"] = 1] = "Changed";
        FLAGS[FLAGS["Setted"] = 2] = "Setted";
        FLAGS[FLAGS["Refreshed"] = 4] = "Refreshed";
    })(exports.FLAGS || (exports.FLAGS = {}));
    var FLAGS = exports.FLAGS;
    (function (REFRESH_MODE) {
        REFRESH_MODE[REFRESH_MODE["NONE"] = 0] = "NONE";
        REFRESH_MODE[REFRESH_MODE["RefreshCurrent"] = 1] = "RefreshCurrent";
        REFRESH_MODE[REFRESH_MODE["MergeIntoCurrent"] = 2] = "MergeIntoCurrent";
        REFRESH_MODE[REFRESH_MODE["CommitChanges"] = 3] = "CommitChanges";
    })(exports.REFRESH_MODE || (exports.REFRESH_MODE = {}));
    var REFRESH_MODE = exports.REFRESH_MODE;
    (function (DELETE_ACTION) {
        DELETE_ACTION[DELETE_ACTION["NoAction"] = 0] = "NoAction";
        DELETE_ACTION[DELETE_ACTION["Cascade"] = 1] = "Cascade";
        DELETE_ACTION[DELETE_ACTION["SetNulls"] = 2] = "SetNulls";
    })(exports.DELETE_ACTION || (exports.DELETE_ACTION = {}));
    var DELETE_ACTION = exports.DELETE_ACTION;
    (function (DATA_OPER) {
        DATA_OPER[DATA_OPER["None"] = 0] = "None";
        DATA_OPER[DATA_OPER["Submit"] = 1] = "Submit";
        DATA_OPER[DATA_OPER["Query"] = 2] = "Query";
        DATA_OPER[DATA_OPER["Invoke"] = 3] = "Invoke";
        DATA_OPER[DATA_OPER["Refresh"] = 4] = "Refresh";
        DATA_OPER[DATA_OPER["Init"] = 5] = "Init";
    })(exports.DATA_OPER || (exports.DATA_OPER = {}));
    var DATA_OPER = exports.DATA_OPER;
    exports.PROP_NAME = {
        isHasChanges: "isHasChanges",
        isSubmitOnDelete: "isSubmitOnDelete",
        isInitialized: "isInitialized",
        isBusy: "isBusy",
        isSubmiting: "isSubmiting",
        isPagingEnabled: "isPagingEnabled",
        parentItem: "parentItem",
        totalCount: "totalCount",
        loadPageCount: "loadPageCount",
        isClearCacheOnEveryLoad: "isClearCacheOnEveryLoad",
        isRefreshing: "isRefreshing",
        requestCount: "requestCount",
        isLoading: "isLoading"
    };
});
define("jriapp_db/dataquery", ["require", "exports", "jriapp_shared", "jriapp_shared/collection/utils", "jriapp_db/const", "jriapp_db/datacache"], function (require, exports, jriapp_shared_1, utils_1, const_1, datacache_1) {
    "use strict";
    var utils = jriapp_shared_1.Utils, checks = utils.check, strUtils = utils.str, coreUtils = utils.core, arrHelper = utils.arr, valUtils = utils_1.valueUtils;
    var DataQuery = (function (_super) {
        __extends(DataQuery, _super);
        function DataQuery(dbSet, queryInfo) {
            _super.call(this);
            var self = this;
            this._dbSet = dbSet;
            this.__queryInfo = queryInfo;
            this._filterInfo = { filterItems: [] };
            this._sortInfo = { sortItems: [] };
            this._isIncludeTotalCount = true;
            this._isClearPrevData = true;
            this._pageSize = dbSet.pageSize;
            this._pageIndex = dbSet.pageIndex;
            this._params = {};
            this._loadPageCount = 1;
            this._isClearCacheOnEveryLoad = true;
            this._dataCache = null;
            this._cacheInvalidated = false;
            this._isPagingEnabled = dbSet.isPagingEnabled;
            this._internal = {
                clearCache: function () {
                    self._clearCache();
                },
                getCache: function () {
                    return self._getCache();
                },
                reindexCache: function () {
                    self._reindexCache();
                },
                isPageCached: function (pageIndex) {
                    return self._isPageCached(pageIndex);
                },
                getQueryInfo: function () {
                    return self.__queryInfo;
                }
            };
        }
        DataQuery.prototype._addSort = function (fieldName, sortOrder) {
            var ord = 0;
            if (!checks.isNt(sortOrder))
                ord = sortOrder;
            var sortItem = { fieldName: fieldName, sortOrder: ord };
            this._sortInfo.sortItems.push(sortItem);
            this._cacheInvalidated = true;
        };
        DataQuery.prototype._addFilterItem = function (fieldName, operand, value, checkFieldName) {
            if (checkFieldName === void 0) { checkFieldName = true; }
            var fkind = 0, vals = [], stz = this.serverTimezone;
            if (!checks.isArray(value))
                vals = [value];
            else
                vals = value;
            var tmpVals = arrHelper.clone(vals);
            var fld = this.getFieldInfo(fieldName);
            if (!fld && checkFieldName)
                throw new Error(strUtils.format(jriapp_shared_1.LocaleERRS.ERR_DBSET_INVALID_FIELDNAME, this.dbSetName, fieldName));
            if (!!fld) {
                vals = tmpVals.map(function (v) {
                    return valUtils.stringifyValue(v, fld.dateConversion, fld.dataType, stz);
                });
            }
            else {
                vals = tmpVals.map(function (v) {
                    return valUtils.stringifyValue(v, 0, checks.isDate(v) ? 7 : 0, stz);
                });
            }
            switch (operand) {
                case 0:
                case 9:
                case 2:
                case 3:
                case 4:
                case 5:
                case 7:
                case 6:
                case 8:
                    fkind = operand;
                    break;
                case 1:
                    fkind = operand;
                    if (value.length !== 2)
                        throw new Error(jriapp_shared_1.LocaleERRS.ERR_QUERY_BETWEEN);
                    break;
                default:
                    throw new Error(strUtils.format(jriapp_shared_1.LocaleERRS.ERR_QUERY_OPERATOR_INVALID, operand));
            }
            var filterItem = { fieldName: fieldName, kind: fkind, values: vals };
            this._filterInfo.filterItems.push(filterItem);
            this._cacheInvalidated = true;
        };
        DataQuery.prototype._resetCacheInvalidated = function () {
            this._cacheInvalidated = false;
        };
        DataQuery.prototype._clearCache = function () {
            if (!!this._dataCache) {
                this._dataCache.destroy();
                this._dataCache = null;
            }
            this._resetCacheInvalidated();
        };
        DataQuery.prototype._getCache = function () {
            if (!this._dataCache) {
                this._dataCache = new datacache_1.DataCache(this);
            }
            return this._dataCache;
        };
        DataQuery.prototype._reindexCache = function () {
            if (!this._dataCache) {
                return;
            }
            this._dataCache.reindexCache();
        };
        DataQuery.prototype._isPageCached = function (pageIndex) {
            if (!this._dataCache) {
                return false;
            }
            return this._dataCache.hasPage(pageIndex);
        };
        DataQuery.prototype._getInternal = function () {
            return this._internal;
        };
        DataQuery.prototype.where = function (fieldName, operand, value, checkFieldName) {
            if (checkFieldName === void 0) { checkFieldName = true; }
            this._addFilterItem(fieldName, operand, value, checkFieldName);
            return this;
        };
        DataQuery.prototype.and = function (fieldName, operand, value, checkFieldName) {
            if (checkFieldName === void 0) { checkFieldName = true; }
            this._addFilterItem(fieldName, operand, value, checkFieldName);
            return this;
        };
        DataQuery.prototype.orderBy = function (fieldName, sortOrder) {
            this._addSort(fieldName, sortOrder);
            return this;
        };
        DataQuery.prototype.thenBy = function (fieldName, sortOrder) {
            this._addSort(fieldName, sortOrder);
            return this;
        };
        DataQuery.prototype.clearSort = function () {
            this._sortInfo.sortItems = [];
            this._cacheInvalidated = true;
            return this;
        };
        DataQuery.prototype.clearFilter = function () {
            this._filterInfo.filterItems = [];
            this._cacheInvalidated = true;
            return this;
        };
        DataQuery.prototype.clearParams = function () {
            this._params = {};
            this._cacheInvalidated = true;
            return this;
        };
        DataQuery.prototype.getFieldInfo = function (fieldName) {
            return this._dbSet.getFieldInfo(fieldName);
        };
        DataQuery.prototype.getFieldNames = function () {
            return this._dbSet.getFieldNames();
        };
        DataQuery.prototype.load = function () {
            return this.dbSet.dbContext.load(this);
        };
        DataQuery.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            this._clearCache();
            _super.prototype.destroy.call(this);
        };
        DataQuery.prototype.toString = function () {
            return "DataQuery";
        };
        Object.defineProperty(DataQuery.prototype, "serverTimezone", {
            get: function () { return this._dbSet.dbContext.serverTimezone; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataQuery.prototype, "entityType", {
            get: function () { return this._dbSet.entityType; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataQuery.prototype, "dbSet", {
            get: function () { return this._dbSet; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataQuery.prototype, "dbSetName", {
            get: function () { return this._dbSet.dbSetName; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataQuery.prototype, "queryName", {
            get: function () { return this.__queryInfo.methodName; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataQuery.prototype, "filterInfo", {
            get: function () { return this._filterInfo; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataQuery.prototype, "sortInfo", {
            get: function () { return this._sortInfo; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataQuery.prototype, "isIncludeTotalCount", {
            get: function () { return this._isIncludeTotalCount; },
            set: function (v) { this._isIncludeTotalCount = v; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataQuery.prototype, "isClearPrevData", {
            get: function () { return this._isClearPrevData; },
            set: function (v) { this._isClearPrevData = v; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataQuery.prototype, "pageSize", {
            get: function () { return this._pageSize; },
            set: function (v) {
                if (this._pageSize !== v) {
                    this._pageSize = v;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataQuery.prototype, "pageIndex", {
            get: function () { return this._pageIndex; },
            set: function (v) {
                if (this._pageIndex !== v) {
                    this._pageIndex = v;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataQuery.prototype, "params", {
            get: function () { return this._params; },
            set: function (v) {
                if (this._params !== v) {
                    this._params = v;
                    this._cacheInvalidated = true;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataQuery.prototype, "isPagingEnabled", {
            get: function () { return this._isPagingEnabled; },
            set: function (v) {
                this._isPagingEnabled = v;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataQuery.prototype, "loadPageCount", {
            get: function () { return this._loadPageCount; },
            set: function (v) {
                if (v < 1) {
                    v = 1;
                }
                if (this._loadPageCount !== v) {
                    this._loadPageCount = v;
                    if (v === 1) {
                        this._clearCache();
                    }
                    this.raisePropertyChanged(const_1.PROP_NAME.loadPageCount);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataQuery.prototype, "isClearCacheOnEveryLoad", {
            get: function () { return this._isClearCacheOnEveryLoad; },
            set: function (v) {
                if (this._isClearCacheOnEveryLoad !== v) {
                    this._isClearCacheOnEveryLoad = v;
                    this.raisePropertyChanged(const_1.PROP_NAME.isClearCacheOnEveryLoad);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataQuery.prototype, "isCacheValid", {
            get: function () { return !!this._dataCache && !this._cacheInvalidated; },
            enumerable: true,
            configurable: true
        });
        return DataQuery;
    }(jriapp_shared_1.BaseObject));
    exports.DataQuery = DataQuery;
});
define("jriapp_db/datacache", ["require", "exports", "jriapp_shared", "jriapp_db/const"], function (require, exports, jriapp_shared_2, const_2) {
    "use strict";
    var utils = jriapp_shared_2.Utils, checks = utils.check, strUtils = utils.str;
    var DataCache = (function (_super) {
        __extends(DataCache, _super);
        function DataCache(query) {
            _super.call(this);
            this._query = query;
            this._cache = [];
            this._totalCount = 0;
            this._itemsByKey = {};
        }
        DataCache.prototype.getCachedPage = function (pageIndex) {
            var res = this._cache.filter(function (page) {
                return page.pageIndex === pageIndex;
            });
            if (res.length === 0)
                return null;
            if (res.length !== 1)
                throw new Error(strUtils.format(jriapp_shared_2.LocaleERRS.ERR_ASSERTION_FAILED, "res.length === 1"));
            return res[0];
        };
        DataCache.prototype.reindexCache = function () {
            var self = this, page;
            this._itemsByKey = {};
            for (var i = 0; i < this._cache.length; i += 1) {
                page = this._cache[i];
                page.items.forEach(function (item) {
                    if (!item.getIsDestroyCalled())
                        self._itemsByKey[item._key] = item;
                });
            }
        };
        DataCache.prototype.getPrevCachedPageIndex = function (currentPageIndex) {
            var pageIndex = -1, cachePageIndex;
            for (var i = 0; i < this._cache.length; i += 1) {
                cachePageIndex = this._cache[i].pageIndex;
                if (cachePageIndex > pageIndex && cachePageIndex < currentPageIndex)
                    pageIndex = cachePageIndex;
            }
            return pageIndex;
        };
        DataCache.prototype.getNextRange = function (pageIndex) {
            var half = Math.floor(((this.loadPageCount - 1) / 2));
            var above = (pageIndex + half) + ((this.loadPageCount - 1) % 2);
            var below = (pageIndex - half), prev = this.getPrevCachedPageIndex(pageIndex);
            if (below < 0) {
                above += (0 - below);
                below = 0;
            }
            if (below <= prev) {
                above += (prev - below + 1);
                below += (prev - below + 1);
            }
            if (this._pageCount > this.loadPageCount && above > (this._pageCount - 1)) {
                below -= (above - (this._pageCount - 1));
                if (below < 0) {
                    below = 0;
                }
                above = this._pageCount - 1;
            }
            if (below <= prev) {
                above += (prev - below + 1);
                below += (prev - below + 1);
            }
            var cnt = above - below + 1;
            if (cnt < this.loadPageCount) {
                above += this.loadPageCount - cnt;
                cnt = above - below + 1;
            }
            var start = below;
            var end = above;
            return { start: start, end: end, cnt: cnt };
        };
        DataCache.prototype.fillCache = function (start, items) {
            var item, keyMap = this._itemsByKey;
            var i, j, k, len = items.length, pageIndex, page, pageSize = this.pageSize;
            for (i = 0; i < this.loadPageCount; i += 1) {
                pageIndex = start + i;
                page = this.getCachedPage(pageIndex);
                if (!page) {
                    page = { items: [], pageIndex: pageIndex };
                    this._cache.push(page);
                }
                for (j = 0; j < pageSize; j += 1) {
                    k = (i * pageSize) + j;
                    if (k < len) {
                        item = items[k];
                        if (!!keyMap[item._key]) {
                            continue;
                        }
                        page.items.push(item);
                        keyMap[item._key] = item;
                        item._aspect._setIsCached(true);
                    }
                    else {
                        return;
                    }
                }
            }
        };
        DataCache.prototype.clear = function () {
            var i, j, items, item, dbSet = this._query.dbSet;
            for (i = 0; i < this._cache.length; i += 1) {
                items = this._cache[i].items;
                for (j = 0; j < items.length; j += 1) {
                    item = items[j];
                    if (!!item) {
                        item._aspect._setIsCached(false);
                        if (!!item._key && !dbSet.getItemByKey(item._key))
                            item.destroy();
                    }
                }
            }
            this._cache = [];
            this._itemsByKey = {};
        };
        DataCache.prototype.clearCacheForPage = function (pageIndex) {
            var page = this.getCachedPage(pageIndex), dbSet = this._query.dbSet;
            if (!page)
                return;
            var j, items, item, index = this._cache.indexOf(page);
            items = page.items;
            for (j = 0; j < items.length; j += 1) {
                item = items[j];
                if (!!item) {
                    item._aspect._setIsCached(false);
                    if (!!item._key) {
                        delete this._itemsByKey[item._key];
                        if (!dbSet.getItemByKey(item._key))
                            item.destroy();
                    }
                }
            }
            this._cache.splice(index, 1);
        };
        DataCache.prototype.hasPage = function (pageIndex) {
            for (var i = 0; i < this._cache.length; i += 1) {
                if (this._cache[i].pageIndex === pageIndex)
                    return true;
            }
            return false;
        };
        DataCache.prototype.getItemByKey = function (key) {
            return this._itemsByKey[key];
        };
        DataCache.prototype.getPageByItem = function (item) {
            item = this._itemsByKey[item._key];
            if (!item)
                return -1;
            for (var i = 0; i < this._cache.length; i += 1) {
                if (this._cache[i].items.indexOf(item) > -1) {
                    return this._cache[i].pageIndex;
                }
            }
            return -1;
        };
        DataCache.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            this.clear();
            _super.prototype.destroy.call(this);
        };
        DataCache.prototype.toString = function () {
            return "DataCache";
        };
        Object.defineProperty(DataCache.prototype, "_pageCount", {
            get: function () {
                var rowCount = this.totalCount, rowPerPage = this.pageSize, result;
                if ((rowCount === 0) || (rowPerPage === 0)) {
                    return 0;
                }
                if ((rowCount % rowPerPage) === 0) {
                    result = (rowCount / rowPerPage);
                }
                else {
                    result = (rowCount / rowPerPage);
                    result = Math.floor(result) + 1;
                }
                return result;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataCache.prototype, "pageSize", {
            get: function () { return this._query.pageSize; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataCache.prototype, "loadPageCount", {
            get: function () { return this._query.loadPageCount; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataCache.prototype, "totalCount", {
            get: function () { return this._totalCount; },
            set: function (v) {
                if (checks.isNt(v))
                    v = 0;
                if (v !== this._totalCount) {
                    this._totalCount = v;
                    this.raisePropertyChanged(const_2.PROP_NAME.totalCount);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataCache.prototype, "cacheSize", {
            get: function () { return this._cache.length; },
            enumerable: true,
            configurable: true
        });
        return DataCache;
    }(jriapp_shared_2.BaseObject));
    exports.DataCache = DataCache;
});
define("jriapp_db/dbset", ["require", "exports", "jriapp_shared", "jriapp_shared/collection/base", "jriapp_shared/collection/utils", "jriapp_db/const", "jriapp_db/dataquery", "jriapp_db/entity_aspect"], function (require, exports, jriapp_shared_3, base_1, utils_2, const_3, dataquery_1, entity_aspect_1) {
    "use strict";
    var utils = jriapp_shared_3.Utils, checks = utils.check, strUtils = utils.str, coreUtils = utils.core, ERROR = utils.err, valUtils = utils_2.valueUtils;
    var DBSET_EVENTS = {
        loaded: "loaded"
    };
    var DbSet = (function (_super) {
        __extends(DbSet, _super);
        function DbSet(opts) {
            _super.call(this);
            var self = this, dbContext = opts.dbContext, dbSetInfo = opts.dbSetInfo, fieldInfos = dbSetInfo.fieldInfos;
            this._dbContext = dbContext;
            this._dbSetName = dbSetInfo.dbSetName;
            this._options.enablePaging = dbSetInfo.enablePaging;
            this._options.pageSize = dbSetInfo.pageSize;
            this._query = null;
            this._entityType = null;
            this._isSubmitOnDelete = false;
            this._navfldMap = {};
            this._calcfldMap = {};
            this._fieldInfos = fieldInfos;
            this._pageDebounce = new jriapp_shared_3.Debounce(400);
            this._trackAssoc = {};
            this._trackAssocMap = {};
            this._childAssocMap = {};
            this._parentAssocMap = {};
            this._changeCount = 0;
            this._changeCache = {};
            this._ignorePageChanged = false;
            fieldInfos.forEach(function (f) {
                self._fieldMap[f.fieldName] = f;
                utils_2.fn_traverseField(f, function (fld, fullName) {
                    fld.dependents = [];
                    fld.fullName = fullName;
                });
            });
            utils_2.fn_traverseFields(fieldInfos, function (fld, fullName) {
                if (fld.fieldType === 3) {
                    coreUtils.setValue(self._navfldMap, fullName, self._doNavigationField(opts, fld), true);
                }
                else if (fld.fieldType === 2) {
                    coreUtils.setValue(self._calcfldMap, fullName, self._doCalculatedField(opts, fld), true);
                }
            });
            self._mapAssocFields();
            Object.freeze(this._perms);
            var internalObj = {
                getCalcFieldVal: function (fieldName, item) {
                    return self._getCalcFieldVal(fieldName, item);
                },
                getNavFieldVal: function (fieldName, item) {
                    return self._getNavFieldVal(fieldName, item);
                },
                setNavFieldVal: function (fieldName, item, value) {
                    self._setNavFieldVal(fieldName, item, value);
                },
                beforeLoad: function (query, oldQuery) {
                    self._beforeLoad(query, oldQuery);
                },
                updatePermissions: function (perms) {
                    self._updatePermissions(perms);
                },
                getChildToParentNames: function (childFieldName) {
                    return self._getChildToParentNames(childFieldName);
                },
                fillFromService: function (info) {
                    return self._fillFromService(info);
                },
                fillFromCache: function (info) {
                    return self._fillFromCache(info);
                },
                commitChanges: function (rows) {
                    self._commitChanges(rows);
                },
                setItemInvalid: function (row) {
                    return self._setItemInvalid(row);
                },
                getChanges: function () {
                    return self._getChanges();
                },
                getTrackAssocInfo: function () {
                    return self._getTrackAssocInfo();
                },
                addToChanged: function (item) {
                    self._addToChanged(item);
                },
                removeFromChanged: function (key) {
                    self._removeFromChanged(key);
                },
                onItemStatusChanged: function (item, oldStatus) {
                    self._onItemStatusChanged(item, oldStatus);
                }
            };
            coreUtils.merge(internalObj, this._internal);
            this.dbContext.addOnPropertyChange(const_3.PROP_NAME.isSubmiting, function (s, a) {
                self.raisePropertyChanged(const_3.PROP_NAME.isBusy);
            }, this.dbSetName);
            this.addOnPropertyChange(const_3.PROP_NAME.isLoading, function (s, a) { self.raisePropertyChanged(const_3.PROP_NAME.isBusy); });
        }
        DbSet.prototype.handleError = function (error, source) {
            if (!this._dbContext)
                return _super.prototype.handleError.call(this, error, source);
            else
                return this._dbContext.handleError(error, source);
        };
        DbSet.prototype._getEventNames = function () {
            var base_events = _super.prototype._getEventNames.call(this);
            return [DBSET_EVENTS.loaded].concat(base_events);
        };
        DbSet.prototype._mapAssocFields = function () {
            var trackAssoc = this._trackAssoc, assoc, tasKeys = Object.keys(trackAssoc), frel, trackAssocMap = this._trackAssocMap;
            for (var i = 0, len = tasKeys.length; i < len; i += 1) {
                assoc = trackAssoc[tasKeys[i]];
                for (var j = 0, len2 = assoc.fieldRels.length; j < len2; j += 1) {
                    frel = assoc.fieldRels[j];
                    if (!checks.isArray(trackAssocMap[frel.childField])) {
                        trackAssocMap[frel.childField] = [assoc.childToParentName];
                    }
                    else {
                        trackAssocMap[frel.childField].push(assoc.childToParentName);
                    }
                }
            }
        };
        DbSet.prototype._doNavigationField = function (opts, fieldInfo) {
            var self = this, isChild = true, result = { getFunc: function (item) { throw new Error("Function is not implemented"); }, setFunc: function (v) { throw new Error("Function is not implemented"); } };
            var assocs = opts.childAssoc.filter(function (a) {
                return a.childToParentName === fieldInfo.fieldName;
            });
            if (assocs.length === 0) {
                assocs = opts.parentAssoc.filter(function (a) {
                    return a.parentToChildrenName === fieldInfo.fieldName;
                });
                isChild = false;
            }
            if (assocs.length !== 1)
                throw new Error(strUtils.format(jriapp_shared_3.LocaleERRS.ERR_PARAM_INVALID_TYPE, "assocs", "Array"));
            var assocName = assocs[0].name;
            fieldInfo.isReadOnly = true;
            if (isChild) {
                fieldInfo.isReadOnly = false;
                self._childAssocMap[assocs[0].childToParentName] = assocs[0];
                assocs[0].fieldRels.forEach(function (frel) {
                    var chf = self.getFieldInfo(frel.childField);
                    if (!fieldInfo.isReadOnly && chf.isReadOnly) {
                        fieldInfo.isReadOnly = true;
                    }
                });
                result.getFunc = function (item) {
                    var assoc = self.dbContext.getAssociation(assocName);
                    return assoc.getParentItem(item);
                };
                if (!fieldInfo.isReadOnly) {
                    self._trackAssoc[assocName] = assocs[0];
                    result.setFunc = function (v) {
                        var entity = this, i, len, assoc = self.dbContext.getAssociation(assocName);
                        if (!!v && !(v instanceof assoc.parentDS.entityType)) {
                            throw new Error(strUtils.format(jriapp_shared_3.LocaleERRS.ERR_PARAM_INVALID_TYPE, "value", assoc.parentDS.dbSetName));
                        }
                        if (!!v && !!v._aspect && v._aspect.isNew) {
                            entity._aspect._setFieldVal(fieldInfo.fieldName, v._key);
                        }
                        else if (!!v) {
                            for (i = 0, len = assoc.childFldInfos.length; i < len; i += 1) {
                                entity[assoc.childFldInfos[i].fieldName] = v[assoc.parentFldInfos[i].fieldName];
                            }
                        }
                        else {
                            var oldKey = entity._aspect._getFieldVal(fieldInfo.fieldName);
                            if (!!oldKey) {
                                entity._aspect._setFieldVal(fieldInfo.fieldName, null);
                            }
                            for (i = 0, len = assoc.childFldInfos.length; i < len; i += 1) {
                                entity[assoc.childFldInfos[i].fieldName] = null;
                            }
                        }
                    };
                }
            }
            else {
                self._parentAssocMap[assocs[0].parentToChildrenName] = assocs[0];
                result.getFunc = function (item) {
                    return self.dbContext.getAssociation(assocName).getChildItems(item);
                };
            }
            return result;
        };
        DbSet.prototype._doCalculatedField = function (opts, fieldInfo) {
            var self = this, result = { getFunc: function (item) { throw new Error(strUtils.format("Calculated field:'{0}' is not initialized", fieldInfo.fieldName)); } };
            function doDependences(info) {
                if (!info.dependentOn)
                    return;
                var deps = info.dependentOn.split(",");
                deps.forEach(function (depOn) {
                    var depOnFld = self.getFieldInfo(depOn);
                    if (!depOnFld)
                        throw new Error(strUtils.format(jriapp_shared_3.LocaleERRS.ERR_CALC_FIELD_DEFINE, depOn));
                    if (info === depOnFld)
                        throw new Error(strUtils.format(jriapp_shared_3.LocaleERRS.ERR_CALC_FIELD_SELF_DEPEND, depOn));
                    if (depOnFld.dependents.indexOf(info.fullName) < 0) {
                        depOnFld.dependents.push(info.fullName);
                    }
                });
            }
            ;
            fieldInfo.isReadOnly = true;
            if (!!fieldInfo.dependentOn) {
                doDependences(fieldInfo);
            }
            return result;
        };
        DbSet.prototype._refreshValues = function (path, item, values, names, rm) {
            var self = this;
            values.forEach(function (value, index) {
                var name = names[index], fieldName = path + name.n, fld = self.getFieldInfo(fieldName);
                if (!fld)
                    throw new Error(strUtils.format(jriapp_shared_3.LocaleERRS.ERR_DBSET_INVALID_FIELDNAME, self.dbSetName, fieldName));
                if (fld.fieldType === 5) {
                    self._refreshValues(fieldName + ".", item, value, name.p, rm);
                }
                else {
                    item._aspect._refreshValue(value, fieldName, rm);
                }
            });
        };
        DbSet.prototype._setCurrentItem = function (v) {
            if (!!v && !(v instanceof this._entityType)) {
                throw new Error(strUtils.format(jriapp_shared_3.LocaleERRS.ERR_PARAM_INVALID_TYPE, "currentItem", this.dbSetName));
            }
            _super.prototype._setCurrentItem.call(this, v);
        };
        DbSet.prototype._getNewKey = function (item) {
            var key = "clkey_" + this._newKey;
            this._newKey += 1;
            return key;
        };
        DbSet.prototype._createNew = function () {
            return this.createEntity(null, null);
        };
        DbSet.prototype._clearChangeCache = function () {
            var old = this._changeCount;
            this._changeCache = {};
            this._changeCount = 0;
            if (old !== this._changeCount)
                this.raisePropertyChanged(const_3.PROP_NAME.isHasChanges);
        };
        DbSet.prototype._onPageChanging = function () {
            var res = _super.prototype._onPageChanging.call(this);
            if (!res) {
                return res;
            }
            if (this.isHasChanges) {
                this.rejectChanges();
            }
            return res;
        };
        DbSet.prototype._onPageChanged = function () {
            var self = this;
            this.cancelEdit();
            _super.prototype._onPageChanged.call(this);
            if (this._ignorePageChanged)
                return;
            self.query.pageIndex = self.pageIndex;
            self._pageDebounce.enque(function () {
                self.dbContext._getInternal().load(self.query, 1);
            });
        };
        DbSet.prototype._onPageSizeChanged = function () {
            _super.prototype._onPageSizeChanged.call(this);
            if (!!this._query)
                this._query.pageSize = this.pageSize;
        };
        DbSet.prototype._defineCalculatedField = function (fullName, getFunc) {
            var calcDef = coreUtils.getValue(this._calcfldMap, fullName);
            if (!calcDef) {
                throw new Error(strUtils.format(jriapp_shared_3.LocaleERRS.ERR_PARAM_INVALID, "calculated fieldName", fullName));
            }
            calcDef.getFunc = getFunc;
        };
        DbSet.prototype._getStrValue = function (val, fieldInfo) {
            var dcnv = fieldInfo.dateConversion, stz = this.dbContext.serverTimezone;
            return valUtils.stringifyValue(val, dcnv, fieldInfo.dataType, stz);
        };
        DbSet.prototype._getCalcFieldVal = function (fieldName, item) {
            try {
                var val = coreUtils.getValue(this._calcfldMap, fieldName);
                return val.getFunc.call(item, item);
            }
            catch (err) {
                ERROR.reThrow(err, this.handleError(err, this));
            }
        };
        DbSet.prototype._getNavFieldVal = function (fieldName, item) {
            var val = coreUtils.getValue(this._navfldMap, fieldName);
            return val.getFunc.call(item, item);
        };
        DbSet.prototype._setNavFieldVal = function (fieldName, item, value) {
            var val = coreUtils.getValue(this._navfldMap, fieldName);
            val.setFunc.call(item, value);
        };
        DbSet.prototype._beforeLoad = function (query, oldQuery) {
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
        };
        DbSet.prototype._updatePermissions = function (perms) {
            this._perms = perms;
        };
        DbSet.prototype._getChildToParentNames = function (childFieldName) { return this._trackAssocMap[childFieldName]; };
        DbSet.prototype._afterFill = function (result, isClearAll) {
            var self = this;
            if (!checks.isNt(result.fetchedItems))
                this._onLoaded(result.fetchedItems);
            this._onCollectionChanged({
                changeType: !isClearAll ? 1 : 2,
                reason: result.reason,
                oper: 1,
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
        };
        DbSet.prototype._fillFromService = function (info) {
            var self = this, res = info.res, fieldNames = res.names, rows = res.rows || [], rowCount = rows.length, newItems = [], positions = [], arr = [], fetchedItems = [], isPagingEnabled = this.isPagingEnabled, query = info.query, isClearAll = true, dataCache, items = [];
            if (!!query && !query.getIsDestroyCalled()) {
                isClearAll = query.isClearPrevData;
                if (query.isClearCacheOnEveryLoad)
                    query._getInternal().clearCache();
                if (isClearAll)
                    this._clear(info.reason, 1);
                query._getInternal().reindexCache();
                if (query.loadPageCount > 1 && isPagingEnabled) {
                    dataCache = query._getInternal().getCache();
                    if (query.isIncludeTotalCount && !checks.isNt(res.totalCount))
                        dataCache.totalCount = res.totalCount;
                }
            }
            fetchedItems = rows.map(function (row) {
                var key = row.k;
                if (!key)
                    throw new Error(jriapp_shared_3.LocaleERRS.ERR_KEY_IS_EMPTY);
                var item = self._itemsByKey[key];
                if (!item) {
                    if (!!dataCache) {
                        item = dataCache.getItemByKey(key);
                    }
                }
                if (!item) {
                    item = self.createEntity(row, fieldNames);
                }
                else {
                    self._refreshValues("", item, row.v, fieldNames, 1);
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
                    var page = dataCache.getCachedPage(query.pageIndex);
                    if (!page)
                        arr = [];
                    else
                        arr = page.items;
                }
            }
            arr.forEach(function (item) {
                var oldItem = self._itemsByKey[item._key];
                if (!oldItem) {
                    self._items.push(item);
                    positions.push(self._items.length - 1);
                    self._itemsByKey[item._key] = item;
                    newItems.push(item);
                    items.push(item);
                    item._aspect._setIsDetached(false);
                }
                else {
                    items.push(oldItem);
                }
            });
            if (newItems.length > 0) {
                this._onCountChanged();
            }
            var result = {
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
        };
        DbSet.prototype._fillFromCache = function (info) {
            var self = this, positions = [], items = [], query = info.query;
            if (!query)
                throw new Error(strUtils.format(jriapp_shared_3.LocaleERRS.ERR_ASSERTION_FAILED, "query is not null"));
            if (query.getIsDestroyCalled())
                throw new Error(strUtils.format(jriapp_shared_3.LocaleERRS.ERR_ASSERTION_FAILED, "query not destroyed"));
            var dataCache = query._getInternal().getCache(), cachedPage = dataCache.getCachedPage(query.pageIndex), arr = !cachedPage ? [] : cachedPage.items;
            this._clear(info.reason, 1);
            this._items = arr;
            arr.forEach(function (item, index) {
                self._itemsByKey[item._key] = item;
                positions.push(index);
                items.push(item);
                item._aspect._setIsDetached(false);
            });
            if (items.length > 0) {
                this._onCountChanged();
            }
            var result = {
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
        };
        DbSet.prototype._commitChanges = function (rows) {
            var self = this;
            rows.forEach(function (rowInfo) {
                var key = rowInfo.clientKey, item = self._itemsByKey[key];
                if (!item) {
                    throw new Error(strUtils.format(jriapp_shared_3.LocaleERRS.ERR_KEY_IS_NOTFOUND, key));
                }
                var itemStatus = item._aspect.status;
                item._aspect._acceptChanges(rowInfo);
                if (itemStatus === 1) {
                    delete self._itemsByKey[key];
                    item._aspect._updateKeys(rowInfo.serverKey);
                    self._itemsByKey[item._key] = item;
                    self._onCollectionChanged({
                        changeType: 3,
                        reason: 0,
                        oper: 4,
                        items: [item],
                        old_key: key,
                        new_key: item._key
                    });
                }
            });
        };
        DbSet.prototype._setItemInvalid = function (row) {
            var keyMap = this._itemsByKey, item = keyMap[row.clientKey], errors = {};
            row.invalid.forEach(function (err) {
                if (!err.fieldName)
                    err.fieldName = "*";
                if (checks.isArray(errors[err.fieldName])) {
                    errors[err.fieldName].push(err.message);
                }
                else {
                    errors[err.fieldName] = [err.message];
                }
            });
            var res = [];
            coreUtils.forEachProp(errors, function (fieldName, err) {
                res.push({ fieldName: fieldName, errors: err });
            });
            this._addErrors(item, res);
            return item;
        };
        DbSet.prototype._getChanges = function () {
            var changes = [], csh = this._changeCache;
            coreUtils.forEachProp(csh, function (key, item) {
                changes.push(item._aspect._getRowInfo());
            });
            return changes;
        };
        DbSet.prototype._getTrackAssocInfo = function () {
            var self = this, res = [], csh = this._changeCache, trackAssoc = self._trackAssoc;
            coreUtils.forEachProp(csh, function (key, item) {
                coreUtils.forEachProp(trackAssoc, function (assocName, assocInfo) {
                    var parentKey = item._aspect._getFieldVal(assocInfo.childToParentName), childKey = item._key;
                    if (!!parentKey && !!childKey) {
                        res.push({ assocName: assocName, parentKey: parentKey, childKey: childKey });
                    }
                });
            });
            return res;
        };
        DbSet.prototype._addToChanged = function (item) {
            if (!item._key)
                return;
            if (!this._changeCache[item._key]) {
                this._changeCache[item._key] = item;
                this._changeCount += 1;
                if (this._changeCount === 1)
                    this.raisePropertyChanged(const_3.PROP_NAME.isHasChanges);
            }
        };
        DbSet.prototype._removeFromChanged = function (key) {
            if (!key)
                return;
            if (!!this._changeCache[key]) {
                delete this._changeCache[key];
                this._changeCount -= 1;
                if (this._changeCount === 0)
                    this.raisePropertyChanged(const_3.PROP_NAME.isHasChanges);
            }
        };
        DbSet.prototype._onItemStatusChanged = function (item, oldStatus) {
            _super.prototype._onItemStatusChanged.call(this, item, oldStatus);
            if (item._aspect.isDeleted && this.isSubmitOnDelete) {
                this.dbContext.submitChanges();
            }
        };
        DbSet.prototype._onRemoved = function (item, pos) {
            this._removeFromChanged(item._key);
            _super.prototype._onRemoved.call(this, item, pos);
        };
        DbSet.prototype._onLoaded = function (items) {
            this.raiseEvent(DBSET_EVENTS.loaded, { items: items });
        };
        DbSet.prototype._destroyQuery = function () {
            var query = this._query;
            this._query = null;
            if (!!query) {
                query.destroy();
            }
        };
        DbSet.prototype._getPKFields = function () {
            var fieldInfos = this.getFieldInfos(), pkFlds = [];
            for (var i = 0, len = fieldInfos.length; i < len; i += 1) {
                var fld = fieldInfos[i];
                if (fld.isPrimaryKey > 0) {
                    pkFlds.push(fld);
                }
            }
            return pkFlds.sort(function (f1, f2) {
                return f1.isPrimaryKey - f2.isPrimaryKey;
            });
        };
        DbSet.prototype._getNames = function () {
            var self = this, fieldInfos = this.getFieldInfos(), names = [];
            utils_2.fn_traverseFields(fieldInfos, function (fld, fullName, arr) {
                if (fld.fieldType === 5) {
                    var res = [];
                    arr.push({
                        n: fld.fieldName, p: res
                    });
                    return res;
                }
                else {
                    var isOK = fld.fieldType === 0 || fld.fieldType === 4 || fld.fieldType === 6;
                    if (isOK) {
                        arr.push({
                            n: fld.fieldName, p: null
                        });
                    }
                    return arr;
                }
            }, names);
            return names;
        };
        DbSet.prototype.createEntity = function (row, fieldNames) {
            var aspect = new entity_aspect_1.EntityAspect(this, row, fieldNames);
            var item = new this.entityType(aspect);
            aspect.item = item;
            if (!row)
                aspect.key = this._getNewKey(item);
            return item;
        };
        DbSet.prototype._getInternal = function () {
            return this._internal;
        };
        DbSet.prototype.addOnLoaded = function (fn, nmspace, context, priority) {
            this._addHandler(DBSET_EVENTS.loaded, fn, nmspace, context, priority);
        };
        DbSet.prototype.removeOnLoaded = function (nmspace) {
            this._removeHandler(DBSET_EVENTS.loaded, nmspace);
        };
        DbSet.prototype.waitForNotBusy = function (callback, groupName) {
            this._waitQueue.enQueue({
                prop: const_3.PROP_NAME.isBusy,
                groupName: groupName,
                predicate: function (val) {
                    return !val;
                },
                action: callback,
                actionArgs: [],
                lastWins: !!groupName
            });
        };
        DbSet.prototype.getFieldInfo = function (fieldName) {
            var assoc, parentDB, parts = fieldName.split(".");
            var fld = this._fieldMap[parts[0]];
            if (parts.length === 1) {
                return fld;
            }
            if (fld.fieldType === 5) {
                for (var i = 1; i < parts.length; i += 1) {
                    fld = utils_2.fn_getPropertyByName(parts[i], fld.nested);
                }
                return fld;
            }
            else if (fld.fieldType === 3) {
                assoc = this._childAssocMap[fld.fieldName];
                if (!!assoc) {
                    parentDB = this.dbContext.getDbSet(assoc.parentDbSetName);
                    return parentDB.getFieldInfo(parts.slice(1).join("."));
                }
            }
            throw new Error(strUtils.format(jriapp_shared_3.LocaleERRS.ERR_DBSET_INVALID_FIELDNAME, this.dbSetName, fieldName));
        };
        DbSet.prototype.sort = function (fieldNames, sortOrder) {
            var self = this, query = self.query;
            if (!checks.isNt(query)) {
                query.clearSort();
                for (var i = 0; i < fieldNames.length; i += 1) {
                    if (i === 0)
                        query.orderBy(fieldNames[i], sortOrder);
                    else
                        query.thenBy(fieldNames[i], sortOrder);
                }
                query.isClearPrevData = true;
                query.pageIndex = 0;
                return self.dbContext._getInternal().load(query, 2);
            }
            else {
                return _super.prototype.sort.call(this, fieldNames, sortOrder);
            }
        };
        DbSet.prototype.fillData = function (data, isAppendData) {
            var self = this, reason = 0;
            var newItems = [], positions = [], items = [], query = this.query;
            var isClearAll = !isAppendData;
            if (isClearAll)
                self._clear(reason, 1);
            var fetchedItems = data.rows.map(function (row) {
                var key = row.k;
                if (!key)
                    throw new Error(jriapp_shared_3.LocaleERRS.ERR_KEY_IS_EMPTY);
                var item = self._itemsByKey[key];
                if (!item) {
                    item = self.createEntity(row, data.names);
                }
                else {
                    self._refreshValues("", item, row.v, data.names, 1);
                }
                return item;
            });
            fetchedItems.forEach(function (item) {
                var oldItem = self._itemsByKey[item._key];
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
            var result = {
                newItems: {
                    items: newItems,
                    pos: positions
                },
                fetchedItems: fetchedItems,
                items: items,
                reason: 0,
                outOfBandData: null
            };
            this._afterFill(result, isClearAll);
            return result;
        };
        DbSet.prototype.fillItems = function (data, isAppend) {
            var self = this;
            var fieldInfos = this.getFieldInfos(), pkFlds = self._getPKFields();
            var fn_ProcessField = function (data, keys, fld, name, arr) {
                var isOK = fld.fieldType === 0 || fld.fieldType === 4 || fld.fieldType === 6;
                if (!isOK) {
                    return;
                }
                try {
                    var val = coreUtils.getValue(data, name);
                    var strval = self._getStrValue(val, fld);
                    if (fld.isPrimaryKey > 0) {
                        var keyIndex = pkFlds.indexOf(fld);
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
                var names = self._getNames();
                var rows = data.map(function (dataItem) {
                    var row = { k: null, v: [] };
                    var keys = new Array(pkFlds.length);
                    utils_2.fn_traverseFields(fieldInfos, function (fld, fullName, arr) {
                        if (fld.fieldType === 5) {
                            var res = [];
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
        };
        DbSet.prototype.acceptChanges = function () {
            var csh = this._changeCache;
            coreUtils.forEachProp(csh, function (key) {
                var item = csh[key];
                item._aspect.acceptChanges();
            });
            this._changeCount = 0;
        };
        DbSet.prototype.rejectChanges = function () {
            var csh = this._changeCache;
            coreUtils.forEachProp(csh, function (key) {
                var item = csh[key];
                item._aspect.rejectChanges();
            });
        };
        DbSet.prototype.deleteOnSubmit = function (item) {
            item._aspect.deleteOnSubmit();
        };
        DbSet.prototype.clear = function () {
            this._destroyQuery();
            _super.prototype.clear.call(this);
        };
        DbSet.prototype.createQuery = function (name) {
            var queryInfo = this.dbContext._getInternal().getQueryInfo(name);
            if (!queryInfo) {
                throw new Error(strUtils.format(jriapp_shared_3.LocaleERRS.ERR_QUERY_NAME_NOTFOUND, name));
            }
            return new dataquery_1.DataQuery(this, queryInfo);
        };
        DbSet.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            this._pageDebounce.destroy();
            this._pageDebounce = null;
            this.clear();
            var dbContext = this.dbContext;
            this._dbContext = null;
            if (!!dbContext) {
                dbContext.removeNSHandlers(this.dbSetName);
            }
            this._navfldMap = {};
            this._calcfldMap = {};
            _super.prototype.destroy.call(this);
        };
        DbSet.prototype.toString = function () {
            return this.dbSetName;
        };
        Object.defineProperty(DbSet.prototype, "items", {
            get: function () { return this._items; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DbSet.prototype, "dbContext", {
            get: function () {
                return this._dbContext;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DbSet.prototype, "dbSetName", {
            get: function () { return this._dbSetName; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DbSet.prototype, "entityType", {
            get: function () { return this._entityType; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DbSet.prototype, "query", {
            get: function () { return this._query; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DbSet.prototype, "isHasChanges", {
            get: function () { return this._changeCount > 0; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DbSet.prototype, "cacheSize", {
            get: function () {
                var query = this._query, dataCache;
                if (!!query && query.isCacheValid) {
                    dataCache = query._getInternal().getCache();
                    return dataCache.cacheSize;
                }
                return 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DbSet.prototype, "isSubmitOnDelete", {
            get: function () { return this._isSubmitOnDelete; },
            set: function (v) {
                if (this._isSubmitOnDelete !== v) {
                    this._isSubmitOnDelete = !!v;
                    this.raisePropertyChanged(const_3.PROP_NAME.isSubmitOnDelete);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DbSet.prototype, "isBusy", {
            get: function () { return this.isLoading || this.dbContext.isSubmiting; },
            enumerable: true,
            configurable: true
        });
        return DbSet;
    }(base_1.BaseCollection));
    exports.DbSet = DbSet;
});
define("jriapp_db/dbsets", ["require", "exports", "jriapp_shared", "jriapp_db/const"], function (require, exports, jriapp_shared_4, const_4) {
    "use strict";
    var utils = jriapp_shared_4.Utils, strUtils = utils.str;
    var DbSets = (function (_super) {
        __extends(DbSets, _super);
        function DbSets(dbContext) {
            _super.call(this);
            this._dbContext = dbContext;
            this._arrDbSets = [];
            this._dbSets = {};
        }
        DbSets.prototype._dbSetCreated = function (dbSet) {
            var self = this;
            this._arrDbSets.push(dbSet);
            dbSet.addOnPropertyChange(const_4.PROP_NAME.isHasChanges, function (sender, args) {
                self._dbContext._getInternal().onDbSetHasChangesChanged(sender);
            });
        };
        DbSets.prototype._createDbSet = function (name, dbSetType) {
            var self = this, dbContext = this._dbContext;
            if (!!self._dbSets[name])
                throw new Error(utils.str.format("DbSet: {0} is already created", name));
            self._dbSets[name] = new jriapp_shared_4.Lazy(function () {
                var res = new dbSetType(dbContext);
                self._dbSetCreated(res);
                return res;
            });
        };
        Object.defineProperty(DbSets.prototype, "dbSetNames", {
            get: function () {
                return Object.keys(this._dbSets);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DbSets.prototype, "arrDbSets", {
            get: function () {
                return this._arrDbSets;
            },
            enumerable: true,
            configurable: true
        });
        DbSets.prototype.getDbSet = function (name) {
            var res = this._dbSets[name];
            if (!res)
                throw new Error(strUtils.format(jriapp_shared_4.LocaleERRS.ERR_DBSET_NAME_INVALID, name));
            return res.Value;
        };
        DbSets.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            this._arrDbSets.forEach(function (dbSet) {
                dbSet.destroy();
            });
            this._arrDbSets = [];
            this._dbSets = null;
            this._dbContext = null;
            _super.prototype.destroy.call(this);
        };
        return DbSets;
    }(jriapp_shared_4.BaseObject));
    exports.DbSets = DbSets;
});
define("jriapp_db/association", ["require", "exports", "jriapp_shared"], function (require, exports, jriapp_shared_5) {
    "use strict";
    var utils = jriapp_shared_5.Utils, checks = utils.check, strUtils = utils.str, coreUtils = utils.core, arrHelper = utils.arr;
    var Association = (function (_super) {
        __extends(Association, _super);
        function Association(options) {
            _super.call(this);
            var self = this;
            this._objId = coreUtils.getNewID("ass");
            var opts = coreUtils.extend({
                dbContext: null,
                parentName: "",
                childName: "",
                parentKeyFields: [],
                childKeyFields: [],
                parentToChildrenName: null,
                childToParentName: null,
                name: this._objId,
                onDeleteAction: 0
            }, options);
            this._name = opts.name;
            this._dbContext = opts.dbContext;
            this._onDeleteAction = opts.onDeleteAction;
            this._parentDS = opts.dbContext.getDbSet(opts.parentName);
            this._childDS = opts.dbContext.getDbSet(opts.childName);
            this._parentFldInfos = opts.parentKeyFields.map(function (name) {
                return self._parentDS.getFieldInfo(name);
            });
            this._childFldInfos = opts.childKeyFields.map(function (name) {
                return self._childDS.getFieldInfo(name);
            });
            this._parentToChildrenName = opts.parentToChildrenName;
            this._childToParentName = opts.childToParentName;
            this._parentMap = {};
            this._childMap = {};
            this._bindParentDS();
            var changed1 = this._mapParentItems(this._parentDS.items);
            this._bindChildDS();
            var changed2 = this._mapChildren(this._childDS.items);
            this._saveParentFKey = null;
            this._saveChildFKey = null;
            this._debounce = new jriapp_shared_5.Debounce();
            this._changed = {};
            this._notifyBound = self._notify.bind(self);
            self._notifyParentChanged(changed1);
            self._notifyChildrenChanged(changed2);
        }
        Association.prototype.handleError = function (error, source) {
            if (!this._dbContext)
                return _super.prototype.handleError.call(this, error, source);
            else
                return this._dbContext.handleError(error, source);
        };
        Association.prototype._bindParentDS = function () {
            var self = this, ds = this._parentDS;
            if (!ds)
                return;
            ds.addOnCollChanged(function (sender, args) {
                self._onParentCollChanged(args);
            }, self._objId, null, 2);
            ds.addOnBeginEdit(function (sender, args) {
                self._onParentEdit(args.item, true, false);
            }, self._objId, null, 2);
            ds.addOnEndEdit(function (sender, args) {
                self._onParentEdit(args.item, false, args.isCanceled);
            }, self._objId, null, 2);
            ds.addOnItemDeleting(function (sender, args) {
            }, self._objId, null, 2);
            ds.addOnStatusChanged(function (sender, args) {
                self._onParentStatusChanged(args.item, args.oldStatus);
            }, self._objId, null, 2);
            ds.addOnCommitChanges(function (sender, args) {
                self._onParentCommitChanges(args.item, args.isBegin, args.isRejected, args.status);
            }, self._objId, null, 2);
        };
        Association.prototype._bindChildDS = function () {
            var self = this, ds = this._childDS;
            if (!ds)
                return;
            ds.addOnCollChanged(function (sender, args) {
                self._onChildCollChanged(args);
            }, self._objId, null, 2);
            ds.addOnBeginEdit(function (sender, args) {
                self._onChildEdit(args.item, true, false);
            }, self._objId, null, 2);
            ds.addOnEndEdit(function (sender, args) {
                self._onChildEdit(args.item, false, args.isCanceled);
            }, self._objId, null, 2);
            ds.addOnStatusChanged(function (sender, args) {
                self._onChildStatusChanged(args.item, args.oldStatus);
            }, self._objId, null, 2);
            ds.addOnCommitChanges(function (sender, args) {
                self._onChildCommitChanges(args.item, args.isBegin, args.isRejected, args.status);
            }, self._objId, null, 2);
        };
        Association.prototype._onParentCollChanged = function (args) {
            var self = this, item, changed = [], changedKeys = {};
            switch (args.changeType) {
                case 2:
                    changed = self.refreshParentMap();
                    break;
                case 1:
                    changed = self._mapParentItems(args.items);
                    break;
                case 0:
                    args.items.forEach(function (item) {
                        var key = self._unMapParentItem(item);
                        if (!!key) {
                            changedKeys[key] = null;
                        }
                    });
                    changed = Object.keys(changedKeys);
                    break;
                case 3:
                    {
                        if (!!args.old_key) {
                            item = this._parentMap[args.old_key];
                            if (!!item) {
                                delete this._parentMap[args.old_key];
                                changed = this._mapParentItems([item]);
                            }
                        }
                    }
                    break;
                default:
                    throw new Error(strUtils.format(jriapp_shared_5.LocaleERRS.ERR_COLLECTION_CHANGETYPE_INVALID, args.changeType));
            }
            self._notifyParentChanged(changed);
        };
        Association.prototype._onParentEdit = function (item, isBegin, isCanceled) {
            var self = this;
            if (isBegin) {
                self._storeParentFKey(item);
            }
            else {
                if (!isCanceled)
                    self._checkParentFKey(item);
                else
                    self._saveParentFKey = null;
            }
        };
        Association.prototype._onParentCommitChanges = function (item, isBegin, isRejected, status) {
            var self = this, fkey;
            if (isBegin) {
                if (isRejected && status === 1) {
                    fkey = this._unMapParentItem(item);
                    if (!!fkey)
                        self._notifyParentChanged([fkey]);
                    return;
                }
                else if (!isRejected && status === 3) {
                    fkey = this._unMapParentItem(item);
                    if (!!fkey)
                        self._notifyParentChanged([fkey]);
                    return;
                }
                self._storeParentFKey(item);
            }
            else {
                self._checkParentFKey(item);
            }
        };
        Association.prototype._storeParentFKey = function (item) {
            var self = this, fkey = self.getParentFKey(item);
            if (fkey !== null && !!self._parentMap[fkey]) {
                self._saveParentFKey = fkey;
            }
        };
        Association.prototype._checkParentFKey = function (item) {
            var self = this, fkey, savedKey = self._saveParentFKey;
            self._saveParentFKey = null;
            fkey = self.getParentFKey(item);
            if (fkey !== savedKey) {
                if (!!savedKey) {
                    self._notifyChildrenChanged([savedKey]);
                    self._notifyParentChanged([savedKey]);
                    delete self._parentMap[savedKey];
                }
                if (!!fkey) {
                    self._mapParentItems([item]);
                    self._notifyChildrenChanged([fkey]);
                    self._notifyParentChanged([fkey]);
                }
            }
        };
        Association.prototype._onParentStatusChanged = function (item, oldStatus) {
            var self = this, newStatus = item._aspect.status, fkey = null;
            var children;
            if (newStatus === 3) {
                children = self.getChildItems(item);
                fkey = this._unMapParentItem(item);
                switch (self.onDeleteAction) {
                    case 0:
                        break;
                    case 1:
                        children.forEach(function (child) {
                            child._aspect.deleteItem();
                        });
                        break;
                    case 2:
                        children.forEach(function (child) {
                            var isEdit = child._aspect.isEditing;
                            if (!isEdit)
                                child._aspect.beginEdit();
                            try {
                                self._childFldInfos.forEach(function (f) {
                                    child[f.fieldName] = null;
                                });
                                if (!isEdit)
                                    child._aspect.endEdit();
                            }
                            finally {
                                if (!isEdit)
                                    child._aspect.cancelEdit();
                            }
                        });
                        break;
                }
                if (!!fkey) {
                    self._notifyParentChanged([fkey]);
                }
            }
        };
        Association.prototype._onChildCollChanged = function (args) {
            var self = this, item, items = args.items, changed = [], changedKeys = {};
            switch (args.changeType) {
                case 2:
                    changed = self.refreshChildMap();
                    break;
                case 1:
                    changed = self._mapChildren(items);
                    break;
                case 0:
                    items.forEach(function (item) {
                        var key = self._unMapChildItem(item);
                        if (!!key) {
                            changedKeys[key] = null;
                        }
                    });
                    changed = Object.keys(changedKeys);
                    break;
                case 3:
                    {
                        if (!!args.old_key) {
                            item = items[0];
                            if (!!item) {
                                var parentKey = item._aspect._getFieldVal(this._childToParentName);
                                if (!!parentKey) {
                                    delete this._childMap[parentKey];
                                    item._aspect._clearFieldVal(this._childToParentName);
                                }
                                changed = this._mapChildren([item]);
                            }
                        }
                    }
                    break;
                default:
                    throw new Error(strUtils.format(jriapp_shared_5.LocaleERRS.ERR_COLLECTION_CHANGETYPE_INVALID, args.changeType));
            }
            self._notifyChildrenChanged(changed);
        };
        Association.prototype._notifyChildrenChanged = function (changed) {
            this._notifyChanged([], changed);
        };
        Association.prototype._notifyParentChanged = function (changed) {
            this._notifyChanged(changed, []);
        };
        Association.prototype._notifyChanged = function (changed_pkeys, changed_ckeys) {
            var self = this;
            if (changed_pkeys.length > 0 || changed_ckeys.length > 0) {
                changed_pkeys.forEach(function (key) {
                    var res = self._changed[key] || { children: {}, parent: null };
                    var arr = self._childMap[key];
                    if (!!arr) {
                        for (var i = 0; i < arr.length; i += 1) {
                            res.children[arr[i]._key] = arr[i];
                        }
                    }
                    self._changed[key] = res;
                });
                changed_ckeys.forEach(function (key) {
                    var res = self._changed[key] || { children: {}, parent: null };
                    var item = self._parentMap[key];
                    if (!!item) {
                        res.parent = item;
                    }
                    self._changed[key] = res;
                });
                this._debounce.enque(this._notifyBound);
            }
        };
        Association.prototype._notify = function () {
            var self = this, changed = self._changed;
            self._changed = {};
            try {
                var fkeys = Object.keys(changed);
                for (var k = 0; k < fkeys.length; k += 1) {
                    var fkey = fkeys[k], map = changed[fkey];
                    self._onParentChanged(fkey, map.children);
                    if (!!map.parent) {
                        self._onChildrenChanged(fkey, map.parent);
                    }
                }
            }
            catch (err) {
                self.handleError(err, self);
            }
        };
        Association.prototype._onChildEdit = function (item, isBegin, isCanceled) {
            var self = this;
            if (isBegin) {
                self._storeChildFKey(item);
            }
            else {
                if (!isCanceled)
                    self._checkChildFKey(item);
                else {
                    self._saveChildFKey = null;
                }
            }
        };
        Association.prototype._onChildCommitChanges = function (item, isBegin, isRejected, status) {
            var self = this, fkey;
            if (isBegin) {
                if (isRejected && status === 1) {
                    fkey = this._unMapChildItem(item);
                    if (!!fkey)
                        self._notifyChildrenChanged([fkey]);
                    return;
                }
                else if (!isRejected && status === 3) {
                    fkey = self._unMapChildItem(item);
                    if (!!fkey)
                        self._notifyChildrenChanged([fkey]);
                    return;
                }
                self._storeChildFKey(item);
            }
            else {
                self._checkChildFKey(item);
            }
        };
        Association.prototype._storeChildFKey = function (item) {
            var self = this, fkey = self.getChildFKey(item), arr;
            if (!!fkey) {
                arr = self._childMap[fkey];
                if (!!arr && arr.indexOf(item) > -1) {
                    self._saveChildFKey = fkey;
                }
            }
        };
        Association.prototype._checkChildFKey = function (item) {
            var self = this, savedKey = self._saveChildFKey, fkey, arr;
            self._saveChildFKey = null;
            fkey = self.getChildFKey(item);
            if (fkey !== savedKey) {
                if (!!savedKey) {
                    self._notifyParentChanged([savedKey]);
                    self._notifyChildrenChanged([savedKey]);
                    arr = self._childMap[savedKey];
                    arrHelper.remove(arr, item);
                    if (arr.length === 0) {
                        delete self._childMap[savedKey];
                    }
                }
                if (!!fkey) {
                    self._mapChildren([item]);
                    self._notifyParentChanged([fkey]);
                    self._notifyChildrenChanged([fkey]);
                }
            }
        };
        Association.prototype._onChildStatusChanged = function (item, oldStatus) {
            var self = this, newStatus = item._aspect.status, fkey = self.getChildFKey(item);
            if (!fkey)
                return;
            if (newStatus === 3) {
                fkey = self._unMapChildItem(item);
                if (!!fkey)
                    self._notifyChildrenChanged([fkey]);
            }
        };
        Association.prototype._getItemKey = function (finf, ds, item) {
            var arr = [], val, strval, internal = ds._getInternal();
            for (var i = 0, len = finf.length; i < len; i += 1) {
                val = item[finf[i].fieldName];
                strval = internal.getStrValue(val, finf[i]);
                if (strval === null)
                    return null;
                arr.push(strval);
            }
            return arr.join(";");
        };
        Association.prototype._resetChildMap = function () {
            var self = this, fkeys = Object.keys(this._childMap);
            this._childMap = {};
            self._notifyChildrenChanged(fkeys);
        };
        Association.prototype._resetParentMap = function () {
            var self = this, fkeys = Object.keys(this._parentMap);
            this._parentMap = {};
            self._notifyParentChanged(fkeys);
        };
        Association.prototype._unMapChildItem = function (item) {
            var fkey, arr, idx, changedKey = null;
            fkey = this.getChildFKey(item);
            if (!!fkey) {
                arr = this._childMap[fkey];
                if (!!arr) {
                    idx = arrHelper.remove(arr, item);
                    if (idx > -1) {
                        if (arr.length === 0)
                            delete this._childMap[fkey];
                        changedKey = fkey;
                    }
                }
            }
            return changedKey;
        };
        Association.prototype._unMapParentItem = function (item) {
            var fkey, changedKey = null;
            fkey = this.getParentFKey(item);
            if (!!fkey && !!this._parentMap[fkey]) {
                delete this._parentMap[fkey];
                changedKey = fkey;
            }
            return changedKey;
        };
        Association.prototype._mapParentItems = function (items) {
            var item, fkey, status, old, chngedKeys = {};
            for (var i = 0, len = items.length; i < len; i += 1) {
                item = items[i];
                status = item._aspect.status;
                if (status === 3)
                    continue;
                fkey = this.getParentFKey(item);
                if (!!fkey) {
                    old = this._parentMap[fkey];
                    if (old !== item) {
                        this._parentMap[fkey] = item;
                        chngedKeys[fkey] = null;
                    }
                }
            }
            return Object.keys(chngedKeys);
        };
        Association.prototype._onChildrenChanged = function (fkey, parent) {
            if (!!fkey && !!this._parentToChildrenName && !parent.getIsDestroyCalled()) {
                parent.raisePropertyChanged(this._parentToChildrenName);
            }
        };
        Association.prototype._onParentChanged = function (fkey, map) {
            var self = this, item;
            if (!!fkey && !!this._childToParentName) {
                var keys = Object.keys(map);
                for (var k = 0; k < keys.length; k += 1) {
                    item = map[keys[k]];
                    if (!item.getIsDestroyCalled())
                        item.raisePropertyChanged(self._childToParentName);
                }
            }
        };
        Association.prototype._mapChildren = function (items) {
            var item, fkey, arr, status, chngedKeys = {};
            for (var i = 0, len = items.length; i < len; i += 1) {
                item = items[i];
                status = item._aspect.status;
                if (status === 3)
                    continue;
                fkey = this.getChildFKey(item);
                if (!!fkey) {
                    arr = this._childMap[fkey];
                    if (!arr) {
                        arr = [];
                        this._childMap[fkey] = arr;
                    }
                    if (arr.indexOf(item) < 0) {
                        arr.push(item);
                        if (!chngedKeys[fkey])
                            chngedKeys[fkey] = null;
                    }
                }
            }
            return Object.keys(chngedKeys);
        };
        Association.prototype._unbindParentDS = function () {
            var self = this, ds = this.parentDS;
            if (!ds)
                return;
            ds.removeNSHandlers(self._objId);
        };
        Association.prototype._unbindChildDS = function () {
            var self = this, ds = this.childDS;
            if (!ds)
                return;
            ds.removeNSHandlers(self._objId);
        };
        Association.prototype.refreshParentMap = function () {
            this._resetParentMap();
            return this._mapParentItems(this._parentDS.items);
        };
        Association.prototype.refreshChildMap = function () {
            this._resetChildMap();
            return this._mapChildren(this._childDS.items);
        };
        Association.prototype.getParentFKey = function (item) {
            if (!!item && item._aspect.isNew)
                return item._key;
            return this._getItemKey(this._parentFldInfos, this._parentDS, item);
        };
        Association.prototype.getChildFKey = function (item) {
            if (!!item && !!this._childToParentName) {
                var parentKey = item._aspect._getFieldVal(this._childToParentName);
                if (!!parentKey) {
                    return parentKey;
                }
            }
            return this._getItemKey(this._childFldInfos, this._childDS, item);
        };
        Association.prototype.isParentChild = function (parent, child) {
            if (!parent || !child)
                return false;
            var fkey1 = this.getParentFKey(parent);
            if (!fkey1)
                return false;
            var fkey2 = this.getChildFKey(child);
            if (!fkey2)
                return false;
            return fkey1 === fkey2;
        };
        Association.prototype.getChildItems = function (parent) {
            if (!parent)
                return [];
            try {
                var fkey = this.getParentFKey(parent), arr = this._childMap[fkey];
                if (!arr)
                    return [];
                return arr;
            }
            catch (err) {
                utils.err.reThrow(err, this.handleError(err, this));
            }
        };
        Association.prototype.getParentItem = function (item) {
            if (!item)
                return null;
            try {
                var fkey = this.getChildFKey(item);
                var obj = this._parentMap[fkey];
                if (!!obj)
                    return obj;
                else
                    return null;
            }
            catch (err) {
                utils.err.reThrow(err, this.handleError(err, this));
            }
        };
        Association.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            this._debounce.destroy();
            this._debounce = null;
            this._changed = {};
            this._unbindParentDS();
            this._unbindChildDS();
            this._parentMap = null;
            this._childMap = null;
            this._parentFldInfos = null;
            this._childFldInfos = null;
            _super.prototype.destroy.call(this);
        };
        Association.prototype.toString = function () {
            return this._name;
        };
        Object.defineProperty(Association.prototype, "name", {
            get: function () { return this._name; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Association.prototype, "parentToChildrenName", {
            get: function () { return this._parentToChildrenName; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Association.prototype, "childToParentName", {
            get: function () { return this._childToParentName; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Association.prototype, "parentDS", {
            get: function () { return this._parentDS; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Association.prototype, "childDS", {
            get: function () { return this._childDS; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Association.prototype, "parentFldInfos", {
            get: function () { return this._parentFldInfos; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Association.prototype, "childFldInfos", {
            get: function () { return this._childFldInfos; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Association.prototype, "onDeleteAction", {
            get: function () { return this._onDeleteAction; },
            enumerable: true,
            configurable: true
        });
        return Association;
    }(jriapp_shared_5.BaseObject));
    exports.Association = Association;
});
define("jriapp_db/error", ["require", "exports", "jriapp_shared"], function (require, exports, jriapp_shared_6) {
    "use strict";
    var strUtils = jriapp_shared_6.Utils.str;
    var DataOperationError = (function (_super) {
        __extends(DataOperationError, _super);
        function DataOperationError(originalError, operationName) {
            var message;
            if (originalError instanceof Error)
                message = originalError.message;
            else if (originalError instanceof jriapp_shared_6.BaseError)
                message = originalError.message;
            if (!message)
                message = "" + originalError;
            _super.call(this, message);
            this._origError = originalError;
            this._operationName = operationName;
        }
        Object.defineProperty(DataOperationError.prototype, "operationName", {
            get: function () { return this._operationName; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataOperationError.prototype, "origError", {
            get: function () {
                return this._origError;
            },
            enumerable: true,
            configurable: true
        });
        return DataOperationError;
    }(jriapp_shared_6.BaseError));
    exports.DataOperationError = DataOperationError;
    var AccessDeniedError = (function (_super) {
        __extends(AccessDeniedError, _super);
        function AccessDeniedError() {
            _super.apply(this, arguments);
        }
        return AccessDeniedError;
    }(DataOperationError));
    exports.AccessDeniedError = AccessDeniedError;
    var ConcurrencyError = (function (_super) {
        __extends(ConcurrencyError, _super);
        function ConcurrencyError() {
            _super.apply(this, arguments);
        }
        return ConcurrencyError;
    }(DataOperationError));
    exports.ConcurrencyError = ConcurrencyError;
    var SvcValidationError = (function (_super) {
        __extends(SvcValidationError, _super);
        function SvcValidationError() {
            _super.apply(this, arguments);
        }
        return SvcValidationError;
    }(DataOperationError));
    exports.SvcValidationError = SvcValidationError;
    var SubmitError = (function (_super) {
        __extends(SubmitError, _super);
        function SubmitError(origError, allSubmitted, notValidated) {
            var message = origError.message || ("" + origError);
            _super.call(this, origError, 1);
            this._origError = origError;
            this._allSubmitted = allSubmitted || [];
            this._notValidated = notValidated || [];
            if (this._notValidated.length > 0) {
                var res_1 = [message + ":"];
                this._notValidated.forEach(function (item) {
                    res_1.push(strUtils.format("item key:{0} errors:{1}", item._key, item._aspect.getErrorString()));
                });
                message = res_1.join("\r\n");
            }
        }
        Object.defineProperty(SubmitError.prototype, "allSubmitted", {
            get: function () { return this._allSubmitted; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SubmitError.prototype, "notValidated", {
            get: function () { return this._notValidated; },
            enumerable: true,
            configurable: true
        });
        return SubmitError;
    }(DataOperationError));
    exports.SubmitError = SubmitError;
});
define("jriapp_db/dbcontext", ["require", "exports", "jriapp_shared", "jriapp_shared/collection/utils", "jriapp_db/const", "jriapp_db/association", "jriapp_db/error"], function (require, exports, jriapp_shared_7, utils_3, const_5, association_1, error_1) {
    "use strict";
    var utils = jriapp_shared_7.Utils, http = utils.http, checks = utils.check, strUtils = utils.str, coreUtils = utils.core, ERROR = utils.err, valUtils = utils_3.valueUtils, _async = utils.defer;
    var DATA_SVC_METH = {
        Invoke: "invoke",
        Query: "query",
        Permissions: "permissions",
        Submit: "save",
        Refresh: "refresh"
    };
    function __checkError(svcError, oper) {
        if (!svcError)
            return;
        if (ERROR.checkIsDummy(svcError))
            return;
        switch (svcError.name) {
            case "AccessDeniedException":
                throw new error_1.AccessDeniedError(jriapp_shared_7.LocaleERRS.ERR_ACCESS_DENIED, oper);
            case "ConcurrencyException":
                throw new error_1.ConcurrencyError(jriapp_shared_7.LocaleERRS.ERR_CONCURRENCY, oper);
            case "ValidationException":
                throw new error_1.SvcValidationError(strUtils.format(jriapp_shared_7.LocaleERRS.ERR_SVC_VALIDATION, svcError.message), oper);
            case "DomainServiceException":
                throw new error_1.DataOperationError(strUtils.format(jriapp_shared_7.LocaleERRS.ERR_SVC_ERROR, svcError.message), oper);
            default:
                throw new error_1.DataOperationError(strUtils.format(jriapp_shared_7.LocaleERRS.ERR_UNEXPECTED_SVC_ERROR, svcError.message), oper);
        }
    }
    var DBCTX_EVENTS = {
        submit_err: "submit_error"
    };
    var DbContext = (function (_super) {
        __extends(DbContext, _super);
        function DbContext() {
            _super.call(this);
            var self = this;
            this._initState = null;
            this._requestHeaders = {};
            this._requests = [];
            this._dbSets = null;
            this._svcMethods = {};
            this._assoc = {};
            this._arrAssoc = [];
            this._queryInf = {};
            this._serviceUrl = null;
            this._isSubmiting = false;
            this._isHasChanges = false;
            this._pendingSubmit = null;
            this._serverTimezone = coreUtils.get_timeZoneOffset();
            this._waitQueue = new jriapp_shared_7.WaitQueue(this);
            this._internal = {
                onItemRefreshed: function (res, item) {
                    self._onItemRefreshed(res, item);
                },
                refreshItem: function (item) {
                    return self._refreshItem(item);
                },
                getQueryInfo: function (name) {
                    return self._getQueryInfo(name);
                },
                onDbSetHasChangesChanged: function (eSet) {
                    self._onDbSetHasChangesChanged(eSet);
                },
                load: function (query, reason) {
                    return self._load(query, reason);
                }
            };
            this.addOnPropertyChange(const_5.PROP_NAME.isSubmiting, function (s, a) { self.raisePropertyChanged(const_5.PROP_NAME.isBusy); });
        }
        DbContext.prototype._getEventNames = function () {
            var base_events = _super.prototype._getEventNames.call(this);
            return [DBCTX_EVENTS.submit_err].concat(base_events);
        };
        DbContext.prototype._initDbSets = function () {
            if (this.isInitialized)
                throw new Error(jriapp_shared_7.LocaleERRS.ERR_DOMAIN_CONTEXT_INITIALIZED);
        };
        DbContext.prototype._initAssociations = function (associations) {
            var self = this;
            associations.forEach(function (assoc) {
                self._initAssociation(assoc);
            });
        };
        DbContext.prototype._initMethods = function (methods) {
            var self = this;
            methods.forEach(function (info) {
                if (info.isQuery)
                    self._queryInf[info.methodName] = info;
                else {
                    self._initMethod(info);
                }
            });
        };
        DbContext.prototype._updatePermissions = function (info) {
            var self = this;
            this._serverTimezone = info.serverTimezone;
            info.permissions.forEach(function (perms) {
                self.getDbSet(perms.dbSetName)._getInternal().updatePermissions(perms);
            });
        };
        DbContext.prototype._initAssociation = function (assoc) {
            var self = this, options = {
                dbContext: self,
                parentName: assoc.parentDbSetName,
                childName: assoc.childDbSetName,
                onDeleteAction: assoc.onDeleteAction,
                parentKeyFields: assoc.fieldRels.map(function (f) {
                    return f.parentField;
                }),
                childKeyFields: assoc.fieldRels.map(function (f) {
                    return f.childField;
                }),
                parentToChildrenName: assoc.parentToChildrenName,
                childToParentName: assoc.childToParentName,
                name: assoc.name
            }, name = "get" + assoc.name;
            var lazy = new jriapp_shared_7.Lazy(function () {
                var res = new association_1.Association(options);
                self._arrAssoc.push(res);
                return res;
            });
            this._assoc[name] = function () { return lazy.Value; };
        };
        DbContext.prototype._initMethod = function (methodInfo) {
            var self = this;
            this._svcMethods[methodInfo.methodName] = function (args) {
                var deferred = _async.createDeferred(), callback = function (res) {
                    if (!res.error) {
                        deferred.resolve(res.result);
                    }
                    else {
                        deferred.reject();
                    }
                };
                try {
                    var data = self._getMethodParams(methodInfo, args);
                    self._invokeMethod(methodInfo, data, callback);
                }
                catch (ex) {
                    if (!ERROR.checkIsDummy(ex)) {
                        self.handleError(ex, self);
                        callback({ result: null, error: ex });
                    }
                }
                return deferred.promise();
            };
        };
        DbContext.prototype._addRequestPromise = function (req, operType, name) {
            var self = this, item = { req: req, operType: operType, name: name }, cnt = self._requests.length, _isBusy = cnt > 0;
            self._requests.push(item);
            req.always(function () {
                utils.arr.remove(self._requests, item);
                self.raisePropertyChanged(const_5.PROP_NAME.requestCount);
                if (self._requests.length === 0)
                    self.raisePropertyChanged(const_5.PROP_NAME.isBusy);
            });
            if (cnt !== self._requests.length)
                self.raisePropertyChanged(const_5.PROP_NAME.requestCount);
            if (_isBusy !== (self._requests.length > 0))
                self.raisePropertyChanged(const_5.PROP_NAME.isBusy);
        };
        DbContext.prototype._tryAbortRequest = function (operType, name) {
            var reqs = this._requests.filter(function (req) { return req.operType === operType && req.name === name; });
            reqs.forEach(function (r) { r.req.abort(); });
        };
        DbContext.prototype._getMethodParams = function (methodInfo, args) {
            var self = this, methodName = methodInfo.methodName, data = { methodName: methodName, paramInfo: { parameters: [] } };
            var i, parameterInfos = methodInfo.parameters, len = parameterInfos.length, pinfo, val, value;
            if (!args)
                args = {};
            for (i = 0; i < len; i += 1) {
                pinfo = parameterInfos[i];
                val = args[pinfo.name];
                if (!pinfo.isNullable && !pinfo.isArray && !(pinfo.dataType === 1 || pinfo.dataType === 10) && checks.isNt(val)) {
                    throw new Error(strUtils.format(jriapp_shared_7.LocaleERRS.ERR_SVC_METH_PARAM_INVALID, pinfo.name, val, methodInfo.methodName));
                }
                if (checks.isFunc(val)) {
                    throw new Error(strUtils.format(jriapp_shared_7.LocaleERRS.ERR_SVC_METH_PARAM_INVALID, pinfo.name, val, methodInfo.methodName));
                }
                if (pinfo.isArray && !checks.isNt(val) && !checks.isArray(val)) {
                    val = [val];
                }
                value = null;
                if (pinfo.dataType === 10 && checks.isArray(val)) {
                    value = JSON.stringify(val);
                }
                else if (checks.isArray(val)) {
                    var arr = new Array(val.length);
                    for (var k = 0; k < val.length; k += 1) {
                        arr[k] = valUtils.stringifyValue(val[k], pinfo.dateConversion, pinfo.dataType, self.serverTimezone);
                    }
                    value = JSON.stringify(arr);
                }
                else
                    value = valUtils.stringifyValue(val, pinfo.dateConversion, pinfo.dataType, self.serverTimezone);
                data.paramInfo.parameters.push({ name: pinfo.name, value: value });
            }
            return data;
        };
        DbContext.prototype._invokeMethod = function (methodInfo, data, callback) {
            var self = this, operType = 3, postData, invokeUrl;
            var fn_onComplete = function (res) {
                if (self.getIsDestroyCalled())
                    return;
                try {
                    if (!res)
                        throw new Error(strUtils.format(jriapp_shared_7.LocaleERRS.ERR_UNEXPECTED_SVC_ERROR, "operation result is empty"));
                    __checkError(res.error, operType);
                    callback({ result: res.result, error: null });
                }
                catch (ex) {
                    if (ERROR.checkIsDummy(ex)) {
                        return;
                    }
                    self._onDataOperError(ex, operType);
                    callback({ result: null, error: ex });
                }
            };
            try {
                postData = JSON.stringify(data);
                invokeUrl = this._getUrl(DATA_SVC_METH.Invoke);
                var req_promise = http.postAjax(invokeUrl, postData, self.requestHeaders);
                self._addRequestPromise(req_promise, operType);
                req_promise.then(function (res) {
                    return _async.parseJSON(res);
                }).then(function (res) {
                    fn_onComplete(res);
                }, function (err) {
                    fn_onComplete({ result: null, error: err });
                });
            }
            catch (ex) {
                if (ERROR.checkIsDummy(ex)) {
                    ERROR.throwDummy(ex);
                }
                this._onDataOperError(ex, operType);
                callback({ result: null, error: ex });
                ERROR.throwDummy(ex);
            }
        };
        DbContext.prototype._loadFromCache = function (query, reason) {
            var self = this, defer = _async.createDeferred();
            setTimeout(function () {
                if (self.getIsDestroyCalled()) {
                    defer.reject(new jriapp_shared_7.AbortError());
                    return;
                }
                var operType = 2, dbSet = query.dbSet, queryRes;
                try {
                    queryRes = dbSet._getInternal().fillFromCache({ reason: reason, query: query });
                    defer.resolve(queryRes);
                }
                catch (ex) {
                    defer.reject(ex);
                }
            }, 0);
            return defer.promise();
        };
        DbContext.prototype._loadSubsets = function (res, isClearAll) {
            var self = this, isHasSubsets = checks.isArray(res.subsets) && res.subsets.length > 0;
            if (!isHasSubsets)
                return;
            res.subsets.forEach(function (subset) {
                var dbSet = self.getDbSet(subset.dbSetName);
                dbSet.fillData(subset, !isClearAll);
            });
        };
        DbContext.prototype._onLoaded = function (res, query, reason) {
            var self = this, defer = _async.createDeferred();
            setTimeout(function () {
                if (self.getIsDestroyCalled()) {
                    defer.reject(new jriapp_shared_7.AbortError());
                    return;
                }
                var operType = 2, dbSetName, dbSet, loadRes;
                try {
                    if (checks.isNt(res))
                        throw new Error(strUtils.format(jriapp_shared_7.LocaleERRS.ERR_UNEXPECTED_SVC_ERROR, "null result"));
                    dbSetName = res.dbSetName;
                    dbSet = self.getDbSet(dbSetName);
                    if (checks.isNt(dbSet))
                        throw new Error(strUtils.format(jriapp_shared_7.LocaleERRS.ERR_DBSET_NAME_INVALID, dbSetName));
                    __checkError(res.error, operType);
                    var isClearAll_1 = (!!query && query.isClearPrevData);
                    loadRes = dbSet._getInternal().fillFromService({
                        res: res,
                        reason: reason,
                        query: query,
                        onFillEnd: function () { self._loadSubsets(res, isClearAll_1); }
                    });
                    defer.resolve(loadRes);
                }
                catch (ex) {
                    defer.reject(ex);
                }
            }, 0);
            return defer.promise();
        };
        DbContext.prototype._dataSaved = function (res) {
            var self = this, submitted = [], notvalid = [];
            try {
                try {
                    __checkError(res.error, 1);
                }
                catch (ex) {
                    res.dbSets.forEach(function (jsDB) {
                        var eSet = self._dbSets.getDbSet(jsDB.dbSetName);
                        jsDB.rows.forEach(function (row) {
                            var item = eSet.getItemByKey(row.clientKey);
                            if (!item) {
                                throw new Error(strUtils.format(jriapp_shared_7.LocaleERRS.ERR_KEY_IS_NOTFOUND, row.clientKey));
                            }
                            submitted.push(item);
                            if (!!row.invalid) {
                                eSet._getInternal().setItemInvalid(row);
                                notvalid.push(item);
                            }
                        });
                    });
                    throw new error_1.SubmitError(ex, submitted, notvalid);
                }
                res.dbSets.forEach(function (jsDB) {
                    self._dbSets.getDbSet(jsDB.dbSetName)._getInternal().commitChanges(jsDB.rows);
                });
            }
            catch (ex) {
                if (ERROR.checkIsDummy(ex)) {
                    ERROR.throwDummy(ex);
                }
                this._onSubmitError(ex);
                ERROR.throwDummy(ex);
            }
        };
        DbContext.prototype._getChanges = function () {
            var changeSet = { dbSets: [], error: null, trackAssocs: [] };
            this._dbSets.arrDbSets.forEach(function (eSet) {
                eSet.endEdit();
                var changes = eSet._getInternal().getChanges();
                if (changes.length === 0)
                    return;
                var trackAssoc = eSet._getInternal().getTrackAssocInfo();
                var jsDB = { dbSetName: eSet.dbSetName, rows: changes };
                changeSet.dbSets.push(jsDB);
                changeSet.trackAssocs = changeSet.trackAssocs.concat(trackAssoc);
            });
            return changeSet;
        };
        DbContext.prototype._getUrl = function (action) {
            var loadUrl = this.serviceUrl;
            if (!strUtils.endsWith(loadUrl, "/"))
                loadUrl = loadUrl + "/";
            loadUrl = loadUrl + [action, ""].join("/");
            return loadUrl;
        };
        DbContext.prototype._onDataOperError = function (ex, oper) {
            if (ERROR.checkIsDummy(ex))
                return true;
            var er;
            if (ex instanceof error_1.DataOperationError)
                er = ex;
            else
                er = new error_1.DataOperationError(ex, oper);
            return this.handleError(er, this);
        };
        DbContext.prototype._onSubmitError = function (error) {
            var args = { error: error, isHandled: false };
            this.raiseEvent(DBCTX_EVENTS.submit_err, args);
            if (!args.isHandled) {
                this.rejectChanges();
                this._onDataOperError(error, 1);
            }
        };
        DbContext.prototype.waitForNotBusy = function (callback) {
            this._waitQueue.enQueue({
                prop: const_5.PROP_NAME.isBusy,
                groupName: null,
                predicate: function (val) {
                    return !val;
                },
                action: callback,
                actionArgs: []
            });
        };
        DbContext.prototype.waitForNotSubmiting = function (callback) {
            this._waitQueue.enQueue({
                prop: const_5.PROP_NAME.isSubmiting,
                predicate: function (val) {
                    return !val;
                },
                action: callback,
                actionArgs: [],
                groupName: "submit",
                lastWins: true
            });
        };
        DbContext.prototype._loadInternal = function (context) {
            var self = this, oldQuery = context.dbSet.query, loadPageCount = context.loadPageCount, isPagingEnabled = context.isPagingEnabled;
            var range, pageCount = 1, pageIndex = context.pageIndex;
            context.fn_onStart();
            context.query.pageIndex = pageIndex;
            context.dbSet._getInternal().beforeLoad(context.query, oldQuery);
            pageIndex = context.query.pageIndex;
            if (loadPageCount > 1 && isPagingEnabled) {
                if (context.query._getInternal().isPageCached(pageIndex)) {
                    var loadPromise = self._loadFromCache(context.query, context.reason);
                    loadPromise.then(function (loadRes) {
                        if (self.getIsDestroyCalled())
                            return;
                        context.fn_onOK(loadRes);
                    }, function (err) {
                        if (self.getIsDestroyCalled())
                            return;
                        context.fn_onErr(err);
                    });
                    return;
                }
                else {
                    range = context.query._getInternal().getCache().getNextRange(pageIndex);
                    pageIndex = range.start;
                    pageCount = range.cnt;
                }
            }
            var requestInfo = {
                dbSetName: context.dbSetName,
                pageIndex: context.query.isPagingEnabled ? pageIndex : -1,
                pageSize: context.query.pageSize,
                pageCount: pageCount,
                isIncludeTotalCount: context.query.isIncludeTotalCount,
                filterInfo: context.query.filterInfo,
                sortInfo: context.query.sortInfo,
                paramInfo: self._getMethodParams(context.query._getInternal().getQueryInfo(), context.query.params).paramInfo,
                queryName: context.query.queryName
            };
            var req_promise = http.postAjax(self._getUrl(DATA_SVC_METH.Query), JSON.stringify(requestInfo), self.requestHeaders);
            self._addRequestPromise(req_promise, 2, requestInfo.dbSetName);
            req_promise.then(function (res) {
                return _async.parseJSON(res);
            }).then(function (response) {
                return self._onLoaded(response, context.query, context.reason);
            }).then(function (loadRes) {
                if (self.getIsDestroyCalled())
                    return;
                context.fn_onOK(loadRes);
            }, function (err) {
                if (self.getIsDestroyCalled())
                    return;
                context.fn_onErr(err);
            });
        };
        DbContext.prototype._onItemRefreshed = function (res, item) {
            var operType = 4;
            try {
                __checkError(res.error, operType);
                if (!res.rowInfo) {
                    item._aspect.dbSet.removeItem(item);
                    item.destroy();
                    throw new Error(jriapp_shared_7.LocaleERRS.ERR_ITEM_DELETED_BY_ANOTHER_USER);
                }
                else
                    item._aspect._refreshValues(res.rowInfo, 2);
            }
            catch (ex) {
                if (ERROR.checkIsDummy(ex)) {
                    ERROR.throwDummy(ex);
                }
                this._onDataOperError(ex, operType);
                ERROR.throwDummy(ex);
            }
        };
        DbContext.prototype._loadRefresh = function (args) {
            var self = this;
            var operType = 4;
            args.fn_onStart();
            try {
                var request = {
                    dbSetName: args.item._aspect.dbSetName,
                    rowInfo: args.item._aspect._getRowInfo(),
                    error: null
                };
                args.item._aspect._checkCanRefresh();
                var url = self._getUrl(DATA_SVC_METH.Refresh), req_promise = http.postAjax(url, JSON.stringify(request), self.requestHeaders);
                self._addRequestPromise(req_promise, operType);
                req_promise.then(function (res) {
                    return _async.parseJSON(res);
                }).then(function (res) {
                    if (self.getIsDestroyCalled())
                        return;
                    args.fn_onOK(res);
                }, function (err) {
                    if (self.getIsDestroyCalled())
                        return;
                    args.fn_onErr(err);
                });
            }
            catch (ex) {
                args.fn_onErr(ex);
            }
        };
        DbContext.prototype._refreshItem = function (item) {
            var self = this, deferred = _async.createDeferred();
            var context = {
                item: item,
                dbSet: item._aspect.dbSet,
                fn_onStart: function () {
                    context.item._aspect.isRefreshing = true;
                    context.dbSet._setIsLoading(true);
                },
                fn_onEnd: function () {
                    context.dbSet._setIsLoading(false);
                    context.item._aspect.isRefreshing = false;
                },
                fn_onErr: function (ex) {
                    try {
                        context.fn_onEnd();
                        self._onDataOperError(ex, 4);
                    }
                    finally {
                        deferred.reject();
                    }
                },
                fn_onOK: function (res) {
                    try {
                        self._onItemRefreshed(res, item);
                        context.fn_onEnd();
                    }
                    finally {
                        deferred.resolve(item);
                    }
                }
            };
            context.dbSet.waitForNotBusy(function () { return self._loadRefresh(context); }, item._key);
            return deferred.promise();
        };
        DbContext.prototype._getQueryInfo = function (name) {
            return this._queryInf[name];
        };
        DbContext.prototype._onDbSetHasChangesChanged = function (eSet) {
            var old = this._isHasChanges, test;
            this._isHasChanges = false;
            if (eSet.isHasChanges) {
                this._isHasChanges = true;
            }
            else {
                for (var i = 0, len = this._dbSets.arrDbSets.length; i < len; i += 1) {
                    test = this._dbSets.arrDbSets[i];
                    if (test.isHasChanges) {
                        this._isHasChanges = true;
                        break;
                    }
                }
            }
            if (this._isHasChanges !== old) {
                this.raisePropertyChanged(const_5.PROP_NAME.isHasChanges);
            }
        };
        DbContext.prototype._load = function (query, reason) {
            if (!query) {
                throw new Error(jriapp_shared_7.LocaleERRS.ERR_DB_LOAD_NO_QUERY);
            }
            var self = this, deferred = _async.createDeferred();
            var context = {
                query: query,
                reason: reason,
                loadPageCount: query.loadPageCount,
                pageIndex: query.pageIndex,
                isPagingEnabled: query.isPagingEnabled,
                dbSetName: query.dbSetName,
                dbSet: self.getDbSet(query.dbSetName),
                fn_onStart: function () {
                    context.dbSet._setIsLoading(true);
                },
                fn_onEnd: function () {
                    context.dbSet._setIsLoading(false);
                },
                fn_onOK: function (res) {
                    try {
                        context.fn_onEnd();
                    }
                    finally {
                        deferred.resolve(res);
                    }
                },
                fn_onErr: function (ex) {
                    try {
                        context.fn_onEnd();
                        self._onDataOperError(ex, 2);
                    }
                    finally {
                        deferred.reject();
                    }
                }
            };
            if (query.isClearPrevData)
                self._tryAbortRequest(2, context.dbSetName);
            context.dbSet.waitForNotBusy(function () {
                try {
                    self._loadInternal(context);
                }
                catch (err) {
                    context.fn_onErr(err);
                }
            }, query.isClearPrevData ? context.dbSetName : null);
            return deferred.promise();
        };
        DbContext.prototype._submitChanges = function (args) {
            var self = this, changeSet;
            args.fn_onStart();
            changeSet = self._getChanges();
            if (changeSet.dbSets.length === 0) {
                args.fn_onOk();
                return;
            }
            var req_promise = http.postAjax(self._getUrl(DATA_SVC_METH.Submit), JSON.stringify(changeSet), self.requestHeaders);
            self._addRequestPromise(req_promise, 1);
            req_promise.then(function (res) {
                return _async.parseJSON(res);
            }).then(function (res) {
                if (self.getIsDestroyCalled())
                    return;
                self._dataSaved(res);
            }).then(function () {
                if (self.getIsDestroyCalled())
                    return;
                args.fn_onOk();
            }, function (er) {
                if (self.getIsDestroyCalled())
                    return;
                args.fn_onErr(er);
            });
        };
        DbContext.prototype._getInternal = function () {
            return this._internal;
        };
        DbContext.prototype.initialize = function (options) {
            if (!!this._initState) {
                return this._initState;
            }
            var self = this, operType = 5, deferred = _async.createDeferred();
            this._initState = deferred.promise();
            this._initState.then(function () {
                if (self.getIsDestroyCalled())
                    return;
                self.raisePropertyChanged(const_5.PROP_NAME.isInitialized);
            }, function (err) {
                if (self.getIsDestroyCalled())
                    return;
                self._onDataOperError(err, operType);
            });
            var opts = coreUtils.merge(options, {
                serviceUrl: null,
                permissions: null
            }), loadUrl;
            try {
                if (!checks.isString(opts.serviceUrl)) {
                    throw new Error(strUtils.format(jriapp_shared_7.LocaleERRS.ERR_PARAM_INVALID, "serviceUrl", opts.serviceUrl));
                }
                this._serviceUrl = opts.serviceUrl;
                this._initDbSets();
                if (!!opts.permissions) {
                    self._updatePermissions(opts.permissions);
                    deferred.resolve();
                    return this._initState;
                }
                loadUrl = this._getUrl(DATA_SVC_METH.Permissions);
            }
            catch (ex) {
                return deferred.reject(ex);
            }
            var ajax_promise = http.getAjax(loadUrl, self.requestHeaders);
            var res_promise = ajax_promise.then(function (permissions) {
                if (self.getIsDestroyCalled())
                    return;
                self._updatePermissions(JSON.parse(permissions));
            });
            deferred.resolve(res_promise);
            this._addRequestPromise(ajax_promise, operType);
            return this._initState;
        };
        DbContext.prototype.addOnSubmitError = function (fn, nmspace, context) {
            this._addHandler(DBCTX_EVENTS.submit_err, fn, nmspace, context);
        };
        DbContext.prototype.removeOnSubmitError = function (nmspace) {
            this._removeHandler(DBCTX_EVENTS.submit_err, nmspace);
        };
        DbContext.prototype.getDbSet = function (name) {
            return this._dbSets.getDbSet(name);
        };
        DbContext.prototype.getAssociation = function (name) {
            var name2 = "get" + name, fn = this._assoc[name2];
            if (!fn)
                throw new Error(strUtils.format(jriapp_shared_7.LocaleERRS.ERR_ASSOC_NAME_INVALID, name));
            return fn();
        };
        DbContext.prototype.submitChanges = function () {
            var self = this;
            if (!!this._pendingSubmit) {
                return this._pendingSubmit.promise;
            }
            var deferred = _async.createDeferred(), submitState = { promise: deferred.promise() };
            this._pendingSubmit = submitState;
            var context = {
                fn_onStart: function () {
                    if (!self._isSubmiting) {
                        self._isSubmiting = true;
                        self.raisePropertyChanged(const_5.PROP_NAME.isSubmiting);
                    }
                    self._pendingSubmit = null;
                },
                fn_onEnd: function () {
                    if (self._isSubmiting) {
                        self._isSubmiting = false;
                        self.raisePropertyChanged(const_5.PROP_NAME.isSubmiting);
                    }
                },
                fn_onErr: function (ex) {
                    try {
                        context.fn_onEnd();
                        self._onSubmitError(ex);
                    }
                    finally {
                        deferred.reject();
                    }
                },
                fn_onOk: function () {
                    try {
                        context.fn_onEnd();
                    }
                    finally {
                        deferred.resolve();
                    }
                }
            };
            self.waitForNotBusy(function () {
                try {
                    self._submitChanges(context);
                }
                catch (err) {
                    context.fn_onErr(err);
                }
            });
            return submitState.promise;
        };
        DbContext.prototype.load = function (query) {
            return this._load(query, 0);
        };
        DbContext.prototype.acceptChanges = function () {
            this._dbSets.arrDbSets.forEach(function (eSet) {
                eSet.acceptChanges();
            });
        };
        DbContext.prototype.rejectChanges = function () {
            this._dbSets.arrDbSets.forEach(function (eSet) {
                eSet.rejectChanges();
            });
        };
        DbContext.prototype.abortRequests = function (reason, operType) {
            if (checks.isNt(operType))
                operType = 0;
            var arr = this._requests.filter(function (a) {
                return operType === 0 ? true : (a.operType === operType);
            });
            for (var i = 0; i < arr.length; i += 1) {
                var item = arr[i];
                item.req.abort(reason);
            }
        };
        DbContext.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            this.abortRequests();
            this._waitQueue.destroy();
            this._waitQueue = null;
            this._arrAssoc.forEach(function (assoc) {
                assoc.destroy();
            });
            this._arrAssoc = [];
            this._assoc = {};
            this._dbSets.destroy();
            this._dbSets = null;
            this._svcMethods = {};
            this._queryInf = {};
            this._serviceUrl = null;
            this._initState = null;
            this._isSubmiting = false;
            this._isHasChanges = false;
            _super.prototype.destroy.call(this);
        };
        Object.defineProperty(DbContext.prototype, "serviceUrl", {
            get: function () { return this._serviceUrl; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DbContext.prototype, "isInitialized", {
            get: function () { return !!this._initState && this._initState.state() === 2; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DbContext.prototype, "isBusy", {
            get: function () { return (this.requestCount > 0) || this.isSubmiting; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DbContext.prototype, "isSubmiting", {
            get: function () { return this._isSubmiting; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DbContext.prototype, "serverTimezone", {
            get: function () { return this._serverTimezone; },
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
        Object.defineProperty(DbContext.prototype, "isHasChanges", {
            get: function () { return this._isHasChanges; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DbContext.prototype, "requestCount", {
            get: function () { return this._requests.length; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DbContext.prototype, "requestHeaders", {
            get: function () { return this._requestHeaders; },
            set: function (v) { this._requestHeaders = v; },
            enumerable: true,
            configurable: true
        });
        return DbContext;
    }(jriapp_shared_7.BaseObject));
    exports.DbContext = DbContext;
});
define("jriapp_db/entity_aspect", ["require", "exports", "jriapp_shared", "jriapp_shared/collection/utils", "jriapp_shared/collection/validation", "jriapp_shared/collection/aspect", "jriapp_db/const", "jriapp_db/error"], function (require, exports, jriapp_shared_8, utils_4, validation_1, aspect_1, const_6, error_2) {
    "use strict";
    var utils = jriapp_shared_8.Utils, checks = utils.check, strUtils = utils.str, coreUtils = utils.core, valUtils = utils_4.valueUtils, sys = utils.sys;
    var ENTITYASPECT_EVENTS = {
        destroyed: "destroyed"
    };
    function fn_isNotSubmittable(fieldInfo) {
        return (fieldInfo.fieldType === 1 || fieldInfo.fieldType === 3 || fieldInfo.fieldType === 2 || fieldInfo.fieldType === 6);
    }
    function fn_traverseChanges(val, fn) {
        function _fn_traverseChanges(name, val, fn) {
            if (!!val.nested && val.nested.length > 0) {
                var prop = void 0, i = void 0, len = val.nested.length;
                for (i = 0; i < len; i += 1) {
                    prop = val.nested[i];
                    if (!!prop.nested && prop.nested.length > 0) {
                        _fn_traverseChanges(name + "." + prop.fieldName, prop, fn);
                    }
                    else {
                        fn(name + "." + prop.fieldName, prop);
                    }
                }
            }
            else {
                fn(name, val);
            }
        }
        _fn_traverseChanges(val.fieldName, val, fn);
    }
    var EntityAspect = (function (_super) {
        __extends(EntityAspect, _super);
        function EntityAspect(dbSet, row, names) {
            _super.call(this, dbSet);
            var self = this;
            this._srvKey = null;
            this._isRefreshing = false;
            this._origVals = null;
            this._savedStatus = null;
            var fieldInfos = this.dbSet.getFieldInfos();
            utils_4.fn_traverseFields(fieldInfos, function (fld, fullName) {
                if (fld.fieldType === 5)
                    coreUtils.setValue(self._vals, fullName, {}, false);
                else
                    coreUtils.setValue(self._vals, fullName, null, false);
            });
            this._initRowInfo(row, names);
        }
        EntityAspect.prototype._initRowInfo = function (row, names) {
            if (!row)
                return;
            this._srvKey = row.k;
            this.key = row.k;
            this._processValues("", row.v, names);
        };
        EntityAspect.prototype._processValues = function (path, values, names) {
            var self = this, stz = self.serverTimezone;
            values.forEach(function (value, index) {
                var name = names[index], fieldName = path + name.n, fld = self.dbSet.getFieldInfo(fieldName), val;
                if (!fld)
                    throw new Error(strUtils.format(jriapp_shared_8.LocaleERRS.ERR_DBSET_INVALID_FIELDNAME, self.dbSetName, fieldName));
                if (fld.fieldType === 5) {
                    self._processValues(fieldName + ".", value, name.p);
                }
                else {
                    val = valUtils.parseValue(value, fld.dataType, fld.dateConversion, stz);
                    coreUtils.setValue(self._vals, fieldName, val, false);
                }
            });
        };
        EntityAspect.prototype._onFieldChanged = function (fieldName, fieldInfo) {
            var self = this;
            if (this._isDestroyCalled)
                return;
            self.item.raisePropertyChanged(fieldName);
            if (!!fieldInfo.dependents && fieldInfo.dependents.length > 0) {
                fieldInfo.dependents.forEach(function (d) {
                    self.item.raisePropertyChanged(d);
                });
            }
        };
        EntityAspect.prototype._getValueChange = function (fullName, fieldInfo, changedOnly) {
            var self = this, dbSet = self.dbSet, res, i, len, tmp;
            if (fn_isNotSubmittable(fieldInfo))
                return null;
            if (fieldInfo.fieldType === 5) {
                res = { fieldName: fieldInfo.fieldName, val: null, orig: null, flags: 0, nested: [] };
                len = fieldInfo.nested.length;
                for (i = 0; i < len; i += 1) {
                    tmp = self._getValueChange(fullName + "." + fieldInfo.nested[i].fieldName, fieldInfo.nested[i], changedOnly);
                    if (!!tmp) {
                        res.nested.push(tmp);
                    }
                }
            }
            else {
                var newVal = dbSet._getInternal().getStrValue(coreUtils.getValue(self._vals, fullName), fieldInfo), oldV = self._origVals === null ? newVal : dbSet._getInternal().getStrValue(coreUtils.getValue(self._origVals, fullName), fieldInfo), isChanged = (oldV !== newVal);
                if (isChanged)
                    res = {
                        fieldName: fieldInfo.fieldName,
                        val: newVal,
                        orig: oldV,
                        flags: (1 | 2),
                        nested: null
                    };
                else if (fieldInfo.isPrimaryKey > 0 || fieldInfo.fieldType === 4 || fieldInfo.isNeedOriginal)
                    res = {
                        fieldName: fieldInfo.fieldName,
                        val: newVal,
                        orig: oldV,
                        flags: 2,
                        nested: null
                    };
                else
                    res = {
                        fieldName: fieldInfo.fieldName,
                        val: null,
                        orig: null,
                        flags: 0,
                        nested: null
                    };
            }
            if (changedOnly) {
                if (fieldInfo.fieldType === 5) {
                    if (res.nested.length > 0)
                        return res;
                    else
                        return null;
                }
                else if ((res.flags & 1) === 1)
                    return res;
                else
                    return null;
            }
            else {
                return res;
            }
        };
        EntityAspect.prototype._getValueChanges = function (changedOnly) {
            var self = this, flds = this.dbSet.getFieldInfos();
            var res = flds.map(function (fld) {
                return self._getValueChange(fld.fieldName, fld, changedOnly);
            });
            var res2 = res.filter(function (vc) {
                return !!vc;
            });
            return res2;
        };
        EntityAspect.prototype._fldChanging = function (fieldName, fieldInfo, oldV, newV) {
            if (!this._origVals) {
                this._origVals = coreUtils.clone(this._vals);
            }
            return true;
        };
        EntityAspect.prototype._skipValidate = function (fieldInfo, val) {
            var childToParentNames = this.dbSet._getInternal().getChildToParentNames(fieldInfo.fieldName), res = false;
            if (!!childToParentNames && val === null) {
                for (var i = 0, len = childToParentNames.length; i < len; i += 1) {
                    res = !!this._getFieldVal(childToParentNames[i]);
                    if (res)
                        break;
                }
            }
            return res;
        };
        EntityAspect.prototype._beginEdit = function () {
            if (!_super.prototype._beginEdit.call(this))
                return false;
            this._savedStatus = this.status;
            return true;
        };
        EntityAspect.prototype._endEdit = function () {
            if (!_super.prototype._endEdit.call(this))
                return false;
            this._savedStatus = null;
            return true;
        };
        EntityAspect.prototype._cancelEdit = function () {
            if (!this.isEditing)
                return false;
            var self = this, changes = this._getValueChanges(true), isNew = this.isNew, dbSet = this.dbSet;
            this._vals = this._saveVals;
            this._saveVals = null;
            this.setStatus(this._savedStatus);
            this._savedStatus = null;
            dbSet._getInternal().removeAllErrors(this.item);
            changes.forEach(function (v) {
                var fld = self.dbSet.getFieldInfo(v.fieldName);
                if (!fld)
                    throw new Error(strUtils.format(jriapp_shared_8.LocaleERRS.ERR_DBSET_INVALID_FIELDNAME, self.dbSetName, v.fieldName));
                self._onFieldChanged(v.fieldName, fld);
            });
            return true;
        };
        EntityAspect.prototype.getDbSet = function () {
            return this.dbSet;
        };
        EntityAspect.prototype.setStatus = function (v) {
            if (this._status !== v) {
                var oldStatus = this._status;
                this._status = v;
                if (v !== 0)
                    this.dbSet._getInternal().addToChanged(this.item);
                else
                    this.dbSet._getInternal().removeFromChanged(this.key);
                this.dbSet._getInternal().onItemStatusChanged(this.item, oldStatus);
            }
        };
        EntityAspect.prototype.getSrvKey = function () { return this._srvKey; };
        EntityAspect.prototype._updateKeys = function (srvKey) {
            this._srvKey = srvKey;
            this.key = srvKey;
        };
        EntityAspect.prototype._checkCanRefresh = function () {
            if (this.key === null || this.status === 1) {
                throw new Error(jriapp_shared_8.LocaleERRS.ERR_OPER_REFRESH_INVALID);
            }
        };
        EntityAspect.prototype._refreshValue = function (val, fullName, refreshMode) {
            var self = this, fld = self.dbSet.getFieldInfo(fullName);
            if (!fld)
                throw new Error(strUtils.format(jriapp_shared_8.LocaleERRS.ERR_DBSET_INVALID_FIELDNAME, self.dbSetName, fullName));
            var stz = self.serverTimezone, newVal, oldVal, oldValOrig, dataType = fld.dataType, dcnv = fld.dateConversion;
            newVal = valUtils.parseValue(val, dataType, dcnv, stz);
            oldVal = coreUtils.getValue(self._vals, fullName);
            switch (refreshMode) {
                case 3:
                    {
                        if (!valUtils.compareVals(newVal, oldVal, dataType)) {
                            coreUtils.setValue(self._vals, fullName, newVal, false);
                            self._onFieldChanged(fullName, fld);
                        }
                    }
                    break;
                case 1:
                    {
                        if (!!self._origVals) {
                            coreUtils.setValue(self._origVals, fullName, newVal, false);
                        }
                        if (!!self._saveVals) {
                            coreUtils.setValue(self._saveVals, fullName, newVal, false);
                        }
                        if (!valUtils.compareVals(newVal, oldVal, dataType)) {
                            coreUtils.setValue(self._vals, fullName, newVal, false);
                            self._onFieldChanged(fullName, fld);
                        }
                    }
                    break;
                case 2:
                    {
                        if (!!self._origVals) {
                            oldValOrig = coreUtils.getValue(self._origVals, fullName);
                            coreUtils.setValue(self._origVals, fullName, newVal, false);
                        }
                        if (oldValOrig === checks.undefined || valUtils.compareVals(oldValOrig, oldVal, dataType)) {
                            if (!valUtils.compareVals(newVal, oldVal, dataType)) {
                                coreUtils.setValue(self._vals, fullName, newVal, false);
                                self._onFieldChanged(fullName, fld);
                            }
                        }
                    }
                    break;
                default:
                    throw new Error(strUtils.format(jriapp_shared_8.LocaleERRS.ERR_PARAM_INVALID, "refreshMode", refreshMode));
            }
        };
        EntityAspect.prototype._refreshValues = function (rowInfo, refreshMode) {
            var self = this, oldStatus = this.status;
            if (!this._isDestroyed) {
                if (!refreshMode) {
                    refreshMode = 1;
                }
                rowInfo.values.forEach(function (val) {
                    fn_traverseChanges(val, function (fullName, vc) {
                        if (!((vc.flags & 4) === 4))
                            return;
                        self._refreshValue(vc.val, fullName, refreshMode);
                    });
                });
                if (oldStatus === 2) {
                    var changes = this._getValueChanges(true);
                    if (changes.length === 0) {
                        this._origVals = null;
                        this.setStatus(0);
                    }
                }
            }
        };
        EntityAspect.prototype._getRowInfo = function () {
            var res = {
                values: this._getValueChanges(false),
                changeType: this.status,
                serverKey: this.getSrvKey(),
                clientKey: this.key,
                error: null
            };
            return res;
        };
        EntityAspect.prototype._getCalcFieldVal = function (fieldName) {
            return this.dbSet._getInternal().getCalcFieldVal(fieldName, this.item);
        };
        EntityAspect.prototype._getNavFieldVal = function (fieldName) {
            return this.dbSet._getInternal().getNavFieldVal(fieldName, this.item);
        };
        EntityAspect.prototype._setNavFieldVal = function (fieldName, value) {
            var dbSet = this.dbSet;
            dbSet._getInternal().setNavFieldVal(fieldName, this.item, value);
        };
        EntityAspect.prototype._clearFieldVal = function (fieldName) {
            coreUtils.setValue(this._vals, fieldName, null, false);
        };
        EntityAspect.prototype._getFieldVal = function (fieldName) {
            if (this._isDestroyCalled)
                return null;
            return coreUtils.getValue(this._vals, fieldName);
        };
        EntityAspect.prototype._setFieldVal = function (fieldName, val) {
            var validation_error, error, dbSetName = this.dbSetName, dbSet = this.dbSet, oldV = this._getFieldVal(fieldName), newV = val, fieldInfo = this.getFieldInfo(fieldName), res = false;
            if (!fieldInfo)
                throw new Error(strUtils.format(jriapp_shared_8.LocaleERRS.ERR_DBSET_INVALID_FIELDNAME, dbSetName, fieldName));
            if (!this.isEditing && !this.isUpdating)
                this.beginEdit();
            try {
                newV = this._checkVal(fieldInfo, newV);
                if (oldV !== newV) {
                    if (this._fldChanging(fieldName, fieldInfo, oldV, newV)) {
                        coreUtils.setValue(this._vals, fieldName, newV, false);
                        if (!(fieldInfo.fieldType === 1 || fieldInfo.fieldType === 6)) {
                            switch (this.status) {
                                case 0:
                                    this.setStatus(2);
                                    break;
                            }
                        }
                        this._onFieldChanged(fieldName, fieldInfo);
                        res = true;
                    }
                }
                dbSet._getInternal().removeError(this.item, fieldName);
                validation_error = this._validateField(fieldName);
                if (!!validation_error) {
                    throw new validation_1.ValidationError([validation_error], this);
                }
            }
            catch (ex) {
                if (sys.isValidationError(ex)) {
                    error = ex;
                }
                else {
                    error = new validation_1.ValidationError([
                        { fieldName: fieldName, errors: [ex.message] }
                    ], this);
                }
                dbSet._getInternal().addError(this.item, fieldName, error.errors[0].errors);
                throw error;
            }
            return res;
        };
        EntityAspect.prototype._acceptChanges = function (rowInfo) {
            if (this.getIsDestroyed())
                return;
            var oldStatus = this.status, dbSet = this.dbSet, internal = dbSet._getInternal();
            if (oldStatus !== 0) {
                internal.onCommitChanges(this.item, true, false, oldStatus);
                if (oldStatus === 3) {
                    if (!this.getIsDestroyCalled())
                        this.destroy();
                    return;
                }
                this._origVals = null;
                if (!!this._saveVals)
                    this._saveVals = coreUtils.clone(this._vals);
                this.setStatus(0);
                internal.removeAllErrors(this.item);
                if (!!rowInfo) {
                    this._refreshValues(rowInfo, 3);
                }
                internal.onCommitChanges(this.item, false, false, oldStatus);
            }
        };
        EntityAspect.prototype._onAttaching = function () {
            _super.prototype._onAttaching.call(this);
            this._status = 1;
        };
        EntityAspect.prototype._onAttach = function () {
            _super.prototype._onAttach.call(this);
            if (this.key === null)
                throw new Error(jriapp_shared_8.LocaleERRS.ERR_ITEM_IS_DETACHED);
            this.dbSet._getInternal().addToChanged(this.item);
        };
        EntityAspect.prototype.deleteItem = function () {
            return this.deleteOnSubmit();
        };
        EntityAspect.prototype.deleteOnSubmit = function () {
            if (this.getIsDestroyCalled())
                return false;
            var oldStatus = this.status, dbSet = this.dbSet;
            var args = { item: this.item, isCancel: false };
            dbSet._getInternal().onItemDeleting(args);
            if (args.isCancel) {
                return false;
            }
            if (oldStatus === 1) {
                dbSet.removeItem(this.item);
            }
            else {
                this.setStatus(3);
            }
            return true;
        };
        EntityAspect.prototype.acceptChanges = function () {
            this._acceptChanges(null);
        };
        EntityAspect.prototype.rejectChanges = function () {
            if (this.getIsDestroyed())
                return;
            var self = this, oldStatus = self.status, dbSet = self.dbSet, internal = dbSet._getInternal();
            if (oldStatus !== 0) {
                internal.onCommitChanges(self.item, true, true, oldStatus);
                if (oldStatus === 1) {
                    if (!this.getIsDestroyCalled())
                        this.destroy();
                    return;
                }
                var changes = self._getValueChanges(true);
                if (!!self._origVals) {
                    self._vals = coreUtils.clone(self._origVals);
                    self._origVals = null;
                    if (!!self._saveVals) {
                        self._saveVals = coreUtils.clone(self._vals);
                    }
                }
                self.setStatus(0);
                internal.removeAllErrors(this.item);
                changes.forEach(function (v) {
                    fn_traverseChanges(v, function (fullName, vc) {
                        self._onFieldChanged(fullName, dbSet.getFieldInfo(fullName));
                    });
                });
                internal.onCommitChanges(this.item, false, true, oldStatus);
            }
        };
        EntityAspect.prototype.submitChanges = function () {
            function removeHandler() {
                dbxt.removeOnSubmitError(uniqueID);
            }
            var dbxt = this.dbSet.dbContext, uniqueID = coreUtils.uuid();
            dbxt.addOnSubmitError(function (sender, args) {
                if (args.error instanceof error_2.SubmitError) {
                    var submitErr = args.error;
                    if (submitErr.notValidated.length > 0) {
                        args.isHandled = true;
                    }
                }
            }, uniqueID);
            var promise = dbxt.submitChanges();
            promise.then(removeHandler, removeHandler);
            return promise;
        };
        EntityAspect.prototype.refresh = function () {
            var dbxt = this.dbSet.dbContext;
            return dbxt._getInternal().refreshItem(this.item);
        };
        EntityAspect.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            this.cancelEdit();
            if (!this.isCached) {
                this.rejectChanges();
            }
            _super.prototype.destroy.call(this);
        };
        EntityAspect.prototype.toString = function () {
            return this.dbSetName + "EntityAspect";
        };
        Object.defineProperty(EntityAspect.prototype, "entityType", {
            get: function () { return this.dbSet.entityType; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EntityAspect.prototype, "isCanSubmit", {
            get: function () { return true; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EntityAspect.prototype, "isNew", {
            get: function () { return this._status === 1; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EntityAspect.prototype, "isDeleted", {
            get: function () { return this._status === 3; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EntityAspect.prototype, "dbSetName", {
            get: function () { return this.dbSet.dbSetName; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EntityAspect.prototype, "serverTimezone", {
            get: function () { return this.dbSet.dbContext.serverTimezone; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EntityAspect.prototype, "dbSet", {
            get: function () { return this.collection; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(EntityAspect.prototype, "isRefreshing", {
            get: function () { return this._isRefreshing; },
            set: function (v) {
                if (this._isRefreshing !== v) {
                    this._isRefreshing = v;
                    this.raisePropertyChanged(const_6.PROP_NAME.isRefreshing);
                }
            },
            enumerable: true,
            configurable: true
        });
        return EntityAspect;
    }(aspect_1.ItemAspect));
    exports.EntityAspect = EntityAspect;
});
define("jriapp_db/int", ["require", "exports"], function (require, exports) {
    "use strict";
});
define("jriapp_db/dataview", ["require", "exports", "jriapp_shared", "jriapp_shared/collection/base", "jriapp_db/const"], function (require, exports, jriapp_shared_9, base_2, const_7) {
    "use strict";
    var utils = jriapp_shared_9.Utils, _async = utils.defer, checks = utils.check, strUtils = utils.str, coreUtils = utils.core, arrHelper = utils.arr, ERROR = utils.err, sys = utils.sys;
    var VIEW_EVENTS = {
        refreshed: "view_refreshed"
    };
    var DataView = (function (_super) {
        __extends(DataView, _super);
        function DataView(options) {
            _super.call(this);
            var opts = coreUtils.extend({
                dataSource: null,
                fn_filter: null,
                fn_sort: null,
                fn_itemsProvider: null
            }, options);
            if (!sys.isCollection(opts.dataSource))
                throw new Error(jriapp_shared_9.LocaleERRS.ERR_DATAVIEW_DATASRC_INVALID);
            if (!!opts.fn_filter && !checks.isFunc(opts.fn_filter))
                throw new Error(jriapp_shared_9.LocaleERRS.ERR_DATAVIEW_FILTER_INVALID);
            this._refreshDebounce = new jriapp_shared_9.Debounce();
            this._objId = coreUtils.getNewID("dvw");
            this._dataSource = opts.dataSource;
            this._fn_filter = !opts.fn_filter ? null : opts.fn_filter;
            this._fn_sort = opts.fn_sort;
            this._fn_itemsProvider = opts.fn_itemsProvider;
            this._isAddingNew = false;
            var self = this, ds = this._dataSource;
            ds.getFieldNames().forEach(function (name) {
                self._fieldMap[name] = ds.getFieldInfo(name);
            });
            this._bindDS();
        }
        DataView.prototype._getEventNames = function () {
            var base_events = _super.prototype._getEventNames.call(this);
            return [VIEW_EVENTS.refreshed].concat(base_events);
        };
        DataView.prototype._destroyItems = function () {
        };
        DataView.prototype.addOnViewRefreshed = function (fn, nmspace) {
            this._addHandler(VIEW_EVENTS.refreshed, fn, nmspace);
        };
        DataView.prototype.removeOnViewRefreshed = function (nmspace) {
            this._removeHandler(VIEW_EVENTS.refreshed, nmspace);
        };
        DataView.prototype._filterForPaging = function (items) {
            var skip = 0, take = 0, pos = -1, cnt = -1, result = [];
            skip = this.pageSize * this.pageIndex;
            take = this.pageSize;
            items.forEach(function (item) {
                cnt += 1;
                if (cnt < skip) {
                    return;
                }
                pos += 1;
                if (pos < take) {
                    result.push(item);
                }
            });
            return result;
        };
        DataView.prototype._onViewRefreshed = function (args) {
            this.raiseEvent(VIEW_EVENTS.refreshed, args);
        };
        DataView.prototype._refresh = function (reason) {
            if (this.getIsDestroyCalled())
                return;
            try {
                var items = void 0;
                var ds = this._dataSource;
                if (!ds || ds.getIsDestroyCalled()) {
                    this.clear();
                    this._onViewRefreshed({});
                    return;
                }
                if (!!this._fn_itemsProvider) {
                    items = this._fn_itemsProvider(ds);
                }
                else {
                    items = ds.items;
                }
                if (!!this._fn_filter) {
                    items = items.filter(this._fn_filter);
                }
                if (!!this._fn_sort) {
                    items = items.sort(this._fn_sort);
                }
                this._fillItems({ items: items, reason: reason, clear: true, isAppend: false });
                this._onViewRefreshed({});
            }
            catch (ex) {
                ERROR.reThrow(ex, this.handleError(ex, this));
            }
        };
        DataView.prototype._fillItems = function (data) {
            data = coreUtils.extend({
                items: [],
                reason: 0,
                clear: true,
                isAppend: false
            }, data);
            var self = this, arr, newItems = [], positions = [], items = [];
            var isClearAll = !!data.clear;
            if (!!isClearAll) {
                this._clear(data.reason, 1);
            }
            if (this.isPagingEnabled && !data.isAppend) {
                arr = this._filterForPaging(data.items);
            }
            else {
                arr = data.items;
            }
            arr.forEach(function (item) {
                var oldItem = self._itemsByKey[item._key];
                if (!oldItem) {
                    self._itemsByKey[item._key] = item;
                    newItems.push(item);
                    positions.push(self._items.length - 1);
                    self._items.push(item);
                    items.push(item);
                }
                else {
                    items.push(oldItem);
                }
            });
            if (newItems.length > 0) {
                this._onCountChanged();
            }
            if (isClearAll) {
                this.totalCount = data.items.length;
            }
            else {
                this.totalCount = this.totalCount + newItems.length;
            }
            this._onCollectionChanged({
                changeType: 2,
                reason: data.reason,
                oper: 1,
                items: newItems,
                pos: positions
            });
            this._onFillEnd({
                items: items,
                newItems: newItems,
                reason: data.reason
            });
            if (isClearAll) {
                this.moveFirst();
            }
            return newItems;
        };
        DataView.prototype._onDSCollectionChanged = function (sender, args) {
            var self = this, item, items = args.items;
            switch (args.changeType) {
                case 2:
                    this._refresh(0);
                    break;
                case 1:
                    {
                        if (!this._isAddingNew) {
                            if (!!self._fn_filter) {
                                items = items.filter(self._fn_filter);
                            }
                            if (items.length > 0) {
                                self.appendItems(items);
                            }
                        }
                    }
                    break;
                case 0:
                    {
                        items.forEach(function (item) {
                            var key = item._key;
                            item = self._itemsByKey[key];
                            if (!!item) {
                                self.removeItem(item);
                            }
                        });
                    }
                    break;
                case 3:
                    {
                        item = self._itemsByKey[args.old_key];
                        if (!!item) {
                            delete self._itemsByKey[args.old_key];
                            self._itemsByKey[args.new_key] = item;
                            this._onCollectionChanged(args);
                        }
                    }
                    break;
                default:
                    throw new Error(strUtils.format(jriapp_shared_9.LocaleERRS.ERR_COLLECTION_CHANGETYPE_INVALID, args.changeType));
            }
        };
        DataView.prototype._onDSStatusChanged = function (sender, args) {
            var self = this, item = args.item, key = args.key, oldStatus = args.oldStatus, isOk, canFilter = !!self._fn_filter;
            if (!!self._itemsByKey[key]) {
                self._onItemStatusChanged(item, oldStatus);
                if (canFilter) {
                    isOk = self._fn_filter(item);
                    if (!isOk) {
                        self.removeItem(item);
                    }
                }
            }
            else {
                if (canFilter) {
                    isOk = self._fn_filter(item);
                    if (isOk) {
                        self.appendItems([item]);
                    }
                }
            }
        };
        DataView.prototype._bindDS = function () {
            var self = this, ds = this._dataSource;
            if (!ds)
                return;
            ds.addOnCollChanged(self._onDSCollectionChanged, self._objId, self, 1);
            ds.addOnBeginEdit(function (sender, args) {
                if (!!self._itemsByKey[args.item._key]) {
                    self._onEditing(args.item, true, false);
                }
            }, self._objId, null, 1);
            ds.addOnEndEdit(function (sender, args) {
                var isOk, item = args.item, canFilter = !!self._fn_filter;
                if (!!self._itemsByKey[item._key]) {
                    self._onEditing(item, false, args.isCanceled);
                    if (!args.isCanceled && canFilter) {
                        isOk = self._fn_filter(item);
                        if (!isOk)
                            self.removeItem(item);
                    }
                }
                else {
                    if (!args.isCanceled && canFilter) {
                        isOk = self._fn_filter(item);
                        if (isOk) {
                            self.appendItems([item]);
                        }
                    }
                }
            }, self._objId, null, 1);
            ds.addOnErrorsChanged(function (sender, args) {
                if (!!self._itemsByKey[args.item._key]) {
                    self._onErrorsChanged(args.item);
                }
            }, self._objId, null, 1);
            ds.addOnStatusChanged(self._onDSStatusChanged, self._objId, self, 1);
            ds.addOnItemDeleting(function (sender, args) {
                if (!!self._itemsByKey[args.item._key]) {
                    self._onItemDeleting(args);
                }
            }, self._objId, null, 1);
            ds.addOnItemAdded(function (sender, args) {
                if (self._isAddingNew) {
                    if (!self._itemsByKey[args.item._key]) {
                        self._attach(args.item);
                    }
                    self.currentItem = args.item;
                    self._onEditing(args.item, true, false);
                    self._onItemAdded(args.item);
                }
            }, self._objId, null, 1);
            ds.addOnItemAdding(function (sender, args) {
                if (self._isAddingNew) {
                    self._onItemAdding(args.item);
                }
            }, self._objId, null, 1);
        };
        DataView.prototype._unbindDS = function () {
            var self = this, ds = this._dataSource;
            if (!ds)
                return;
            ds.removeNSHandlers(self._objId);
        };
        DataView.prototype._checkCurrentChanging = function (newCurrent) {
            var ds = this._dataSource, item;
            try {
                item = ds._getInternal().getEditingItem();
                if (!!item && newCurrent !== item)
                    ds.endEdit();
            }
            catch (ex) {
                ds.cancelEdit();
                ERROR.reThrow(ex, this.handleError(ex, this));
            }
        };
        DataView.prototype._onPageChanged = function () {
            this._refresh(1);
        };
        DataView.prototype._clear = function (reason, oper) {
            _super.prototype._clear.call(this, reason, oper);
            if (reason !== 1)
                this.pageIndex = 0;
        };
        DataView.prototype._getStrValue = function (val, fieldInfo) {
            return this._dataSource._getInternal().getStrValue(val, fieldInfo);
        };
        DataView.prototype._getErrors = function (item) {
            return this._dataSource._getInternal().getErrors(item);
        };
        DataView.prototype.getItemsWithErrors = function () {
            var ds = this._dataSource;
            return ds.getItemsWithErrors();
        };
        DataView.prototype.appendItems = function (items) {
            if (this._isDestroyCalled)
                return [];
            return this._fillItems({ items: items, reason: 0, clear: false, isAppend: true });
        };
        DataView.prototype.addNew = function () {
            var item;
            this._isAddingNew = true;
            try {
                item = this._dataSource.addNew();
            }
            finally {
                this._isAddingNew = false;
            }
            return item;
        };
        DataView.prototype.removeItem = function (item) {
            if (item._key === null) {
                throw new Error(jriapp_shared_9.LocaleERRS.ERR_ITEM_IS_DETACHED);
            }
            if (!this._itemsByKey[item._key])
                return;
            var oldPos = arrHelper.remove(this._items, item);
            if (oldPos < 0) {
                throw new Error(jriapp_shared_9.LocaleERRS.ERR_ITEM_IS_NOTFOUND);
            }
            delete this._itemsByKey[item._key];
            delete this._errors[item._key];
            this.totalCount = this.totalCount - 1;
            this._onRemoved(item, oldPos);
            var test = this.getItemByPos(oldPos), curPos = this._currentPos;
            if (curPos === oldPos) {
                if (!test) {
                    this._currentPos = curPos - 1;
                }
                this._onCurrentChanged();
            }
            if (curPos > oldPos) {
                this._currentPos = curPos - 1;
                this._onCurrentChanged();
            }
        };
        DataView.prototype.sortLocal = function (fieldNames, sortOrder) {
            var _this = this;
            return _async.delay(function () { _this.fn_sort = _this._getSortFn(fieldNames, sortOrder); });
        };
        DataView.prototype.getIsHasErrors = function () {
            return this._dataSource.getIsHasErrors();
        };
        DataView.prototype.clear = function () {
            this._clear(0, 0);
            this.totalCount = 0;
        };
        DataView.prototype.refresh = function () {
            var _this = this;
            this._refreshDebounce.enque(function () {
                _this._refresh(0);
            });
        };
        DataView.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            this._refreshDebounce.destroy();
            this._refreshDebounce = null;
            this._unbindDS();
            this._dataSource = null;
            this._fn_filter = null;
            this._fn_sort = null;
            _super.prototype.destroy.call(this);
        };
        Object.defineProperty(DataView.prototype, "dataSource", {
            get: function () { return this._dataSource; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataView.prototype, "isPagingEnabled", {
            get: function () { return this._options.enablePaging; },
            set: function (v) {
                if (this._options.enablePaging !== v) {
                    this._options.enablePaging = v;
                    this.raisePropertyChanged(const_7.PROP_NAME.isPagingEnabled);
                    this._refresh(0);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataView.prototype, "permissions", {
            get: function () { return this._dataSource.permissions; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataView.prototype, "fn_filter", {
            get: function () { return this._fn_filter; },
            set: function (v) {
                if (this._fn_filter !== v) {
                    this._fn_filter = v;
                    this._refresh(0);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataView.prototype, "fn_sort", {
            get: function () { return this._fn_sort; },
            set: function (v) {
                if (this._fn_sort !== v) {
                    this._fn_sort = v;
                    this._refresh(2);
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataView.prototype, "fn_itemsProvider", {
            get: function () { return this._fn_itemsProvider; },
            set: function (v) {
                if (this._fn_itemsProvider !== v) {
                    this._fn_itemsProvider = v;
                    this._refresh(0);
                }
            },
            enumerable: true,
            configurable: true
        });
        return DataView;
    }(base_2.BaseCollection));
    exports.DataView = DataView;
});
define("jriapp_db/child_dataview", ["require", "exports", "jriapp_shared", "jriapp_db/const", "jriapp_db/dataview"], function (require, exports, jriapp_shared_10, const_8, dataview_1) {
    "use strict";
    var utils = jriapp_shared_10.Utils, checks = utils.check, strUtils = utils.str, coreUtils = utils.core;
    var ChildDataView = (function (_super) {
        __extends(ChildDataView, _super);
        function ChildDataView(options) {
            var parentItem = !options.parentItem ? null : options.parentItem, assoc = options.association, opts = coreUtils.extend({}, options), oldFilter = opts.fn_filter;
            opts.dataSource = assoc.childDS;
            opts.fn_itemsProvider = function (ds) {
                if (!parentItem) {
                    return [];
                }
                return assoc.getChildItems(parentItem);
            };
            opts.fn_filter = function (item) {
                var isPC = assoc.isParentChild(parentItem, item);
                return isPC && (!oldFilter ? true : oldFilter(item));
            };
            _super.call(this, opts);
            var self = this;
            this._getParent = function () {
                if (self.getIsDestroyCalled())
                    return null;
                return parentItem;
            };
            this._setParent = function (v) {
                if (parentItem !== v) {
                    parentItem = v;
                    self.raisePropertyChanged(const_8.PROP_NAME.parentItem);
                }
                if (self.getIsDestroyCalled())
                    return;
                if (self.items.length > 0) {
                    self.clear();
                    self._onViewRefreshed({});
                }
                self._parentDebounce.enque(function () {
                    self._refresh(0);
                });
            };
            this._parentDebounce = new jriapp_shared_10.Debounce(350);
            this._association = assoc;
            if (!!parentItem) {
                var queue = utils.defer.getTaskQueue();
                queue.enque(function () {
                    self._refresh(0);
                });
            }
        }
        ChildDataView.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            this._setParent(null);
            this._parentDebounce.destroy();
            this._parentDebounce = null;
            this._association = null;
            _super.prototype.destroy.call(this);
        };
        ChildDataView.prototype.toString = function () {
            if (!!this._association)
                return "ChildDataView for " + this._association.toString();
            return "ChildDataView";
        };
        Object.defineProperty(ChildDataView.prototype, "parentItem", {
            get: function () {
                return this._getParent();
            },
            set: function (v) {
                this._setParent(v);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ChildDataView.prototype, "association", {
            get: function () { return this._association; },
            enumerable: true,
            configurable: true
        });
        return ChildDataView;
    }(dataview_1.DataView));
    exports.ChildDataView = ChildDataView;
});
define("jriapp_db/complexprop", ["require", "exports", "jriapp_shared"], function (require, exports, jriapp_shared_11) {
    "use strict";
    var utils = jriapp_shared_11.Utils, checks = utils.check, strUtils = utils.str;
    var BaseComplexProperty = (function (_super) {
        __extends(BaseComplexProperty, _super);
        function BaseComplexProperty(name) {
            _super.call(this);
            this._name = name;
        }
        BaseComplexProperty.prototype._getFullPath = function (path) {
            throw new Error("Not Implemented");
        };
        BaseComplexProperty.prototype.getName = function () {
            return this._name;
        };
        BaseComplexProperty.prototype.setValue = function (fullName, value) {
            throw new Error("Not Implemented");
        };
        BaseComplexProperty.prototype.getValue = function (fullName) {
            throw new Error("Not Implemented");
        };
        BaseComplexProperty.prototype.getFieldInfo = function () {
            throw new Error("Not Implemented");
        };
        BaseComplexProperty.prototype.getProperties = function () {
            throw new Error("Not Implemented");
        };
        BaseComplexProperty.prototype.getFullPath = function (name) {
            throw new Error("Not Implemented");
        };
        BaseComplexProperty.prototype.getEntity = function () {
            throw new Error("Not Implemented");
        };
        BaseComplexProperty.prototype.getPropertyByName = function (name) {
            var arrProps = this.getProperties().filter(function (f) { return f.fieldName === name; });
            if (!arrProps || arrProps.length !== 1)
                throw new Error(strUtils.format(jriapp_shared_11.LocaleERRS.ERR_ASSERTION_FAILED, "arrProps.length === 1"));
            return arrProps[0];
        };
        BaseComplexProperty.prototype.getIsHasErrors = function () {
            return this.getEntity().getIsHasErrors();
        };
        BaseComplexProperty.prototype.addOnErrorsChanged = function (fn, nmspace, context) {
            this.getEntity().addOnErrorsChanged(fn, nmspace, context);
        };
        BaseComplexProperty.prototype.removeOnErrorsChanged = function (nmspace) {
            this.getEntity().removeOnErrorsChanged(nmspace);
        };
        BaseComplexProperty.prototype.getFieldErrors = function (fieldName) {
            var fullName = this.getFullPath(fieldName);
            return this.getEntity().getFieldErrors(fullName);
        };
        BaseComplexProperty.prototype.getAllErrors = function () {
            return this.getEntity().getAllErrors();
        };
        BaseComplexProperty.prototype.getIErrorNotification = function () {
            return this;
        };
        return BaseComplexProperty;
    }(jriapp_shared_11.BaseObject));
    exports.BaseComplexProperty = BaseComplexProperty;
    var RootComplexProperty = (function (_super) {
        __extends(RootComplexProperty, _super);
        function RootComplexProperty(name, owner) {
            _super.call(this, name);
            this._entity = owner;
        }
        RootComplexProperty.prototype._getFullPath = function (path) {
            return this.getName() + "." + path;
        };
        RootComplexProperty.prototype.setValue = function (fullName, value) {
            this._entity._setFieldVal(fullName, value);
        };
        RootComplexProperty.prototype.getValue = function (fullName) {
            return this._entity._getFieldVal(fullName);
        };
        RootComplexProperty.prototype.getFieldInfo = function () {
            return this._entity.getFieldInfo(this.getName());
        };
        RootComplexProperty.prototype.getProperties = function () {
            return this.getFieldInfo().nested;
        };
        RootComplexProperty.prototype.getEntity = function () {
            return this._entity;
        };
        RootComplexProperty.prototype.getFullPath = function (name) {
            return this.getName() + "." + name;
        };
        return RootComplexProperty;
    }(BaseComplexProperty));
    exports.RootComplexProperty = RootComplexProperty;
    var ChildComplexProperty = (function (_super) {
        __extends(ChildComplexProperty, _super);
        function ChildComplexProperty(name, parent) {
            _super.call(this, name);
            this._parent = parent;
        }
        ChildComplexProperty.prototype._getFullPath = function (path) {
            return this._parent._getFullPath(this.getName() + "." + path);
        };
        ChildComplexProperty.prototype.setValue = function (fullName, value) {
            this.getEntity()._setFieldVal(fullName, value);
        };
        ChildComplexProperty.prototype.getValue = function (fullName) {
            return this.getEntity()._getFieldVal(fullName);
        };
        ChildComplexProperty.prototype.getFieldInfo = function () {
            var name = this.getName();
            return this._parent.getPropertyByName(name);
        };
        ChildComplexProperty.prototype.getProperties = function () {
            return this.getFieldInfo().nested;
        };
        ChildComplexProperty.prototype.getParent = function () {
            return this._parent;
        };
        ChildComplexProperty.prototype.getRootProperty = function () {
            var parent = this._parent;
            while (!!parent && (parent instanceof ChildComplexProperty)) {
                parent = parent.getParent();
            }
            if (!parent || !(parent instanceof RootComplexProperty))
                throw new Error(strUtils.format(jriapp_shared_11.LocaleERRS.ERR_ASSERTION_FAILED, "parent instanceof RootComplexProperty"));
            return parent;
        };
        ChildComplexProperty.prototype.getFullPath = function (name) {
            return this._parent._getFullPath(this.getName() + "." + name);
        };
        ChildComplexProperty.prototype.getEntity = function () {
            return this.getRootProperty().getEntity();
        };
        return ChildComplexProperty;
    }(BaseComplexProperty));
    exports.ChildComplexProperty = ChildComplexProperty;
});
define("jriapp_db", ["require", "exports", "jriapp_db/dbset", "jriapp_db/dataview", "jriapp_db/child_dataview", "jriapp_db/association", "jriapp_db/const", "jriapp_db/dbcontext", "jriapp_db/dbsets", "jriapp_db/dataquery", "jriapp_db/entity_aspect", "jriapp_db/error", "jriapp_db/complexprop"], function (require, exports, dbset_1, dataview_2, child_dataview_1, association_2, const_9, dbcontext_1, dbsets_1, dataquery_2, entity_aspect_2, error_3, complexprop_1) {
    "use strict";
    function __export(m) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    }
    exports.DbSet = dbset_1.DbSet;
    __export(dataview_2);
    __export(child_dataview_1);
    __export(association_2);
    exports.REFRESH_MODE = const_9.REFRESH_MODE;
    exports.DELETE_ACTION = const_9.DELETE_ACTION;
    exports.DATA_OPER = const_9.DATA_OPER;
    exports.FLAGS = const_9.FLAGS;
    __export(dbcontext_1);
    __export(dbsets_1);
    __export(dataquery_2);
    __export(entity_aspect_2);
    __export(error_3);
    __export(complexprop_1);
});
