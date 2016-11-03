/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import * as langMOD from "jriapp_core/lang";
import { BaseObject } from "jriapp_core/object";
import { Utils } from "jriapp_utils/utils";
import { PROP_NAME } from "const";
import { DataQuery } from "dataquery";
import { IEntityItem } from "int";

const utils = Utils, checks = utils.check, strUtils = utils.str;
export interface ICachedPage { items: IEntityItem[]; pageIndex: number; }

export class DataCache extends BaseObject {
    private _query: DataQuery<IEntityItem>;
    private _cache: ICachedPage[];
    private _totalCount: number;
    private _itemsByKey: { [key: string]: IEntityItem; };

    constructor(query: DataQuery<IEntityItem>) {
        super();
        this._query = query;
        this._cache = [];
        this._totalCount = 0;
        this._itemsByKey = {};
   }
    getCachedPage(pageIndex: number): ICachedPage {
        let res: ICachedPage[] = this._cache.filter(function (page: ICachedPage) {
            return page.pageIndex === pageIndex;
       });
        if (res.length === 0)
            return null;
        if (res.length !== 1)
            throw new Error(strUtils.format(langMOD.ERRS.ERR_ASSERTION_FAILED, "res.length === 1"));
        return res[0];
   }
    //reset items key index
    reindexCache() {
        let self = this, page: ICachedPage;
        this._itemsByKey = {};
        for (let i = 0; i < this._cache.length; i += 1) {
            page = this._cache[i];
            page.items.forEach(function (item) {
                if (!item.getIsDestroyCalled())
                    self._itemsByKey[item._key] = item;
           });
       }
   }
    getPrevCachedPageIndex(currentPageIndex: number) {
        let pageIndex = -1, cachePageIndex: number;
        for (let i = 0; i < this._cache.length; i += 1) {
            cachePageIndex = this._cache[i].pageIndex;
            if (cachePageIndex > pageIndex && cachePageIndex < currentPageIndex)
                pageIndex = cachePageIndex;
       }
        return pageIndex;
   }
    getNextRange(pageIndex: number) {
        let half = Math.floor(((this.loadPageCount - 1) / 2));
        let above = (pageIndex + half) + ((this.loadPageCount - 1) % 2);
        let below = (pageIndex - half), prev = this.getPrevCachedPageIndex(pageIndex);
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
        //once again check for previous cached range
        if (below <= prev) {
            above += (prev - below + 1);
            below += (prev - below + 1);
       }

        let cnt = above - below + 1;
        if (cnt < this.loadPageCount) {
            above += this.loadPageCount - cnt;
            cnt = above - below + 1;
       }
        let start = below;
        let end = above;
        return { start: start, end: end, cnt: cnt };
   }
    fillCache(start: number, items: IEntityItem[]) {
        let item: IEntityItem, keyMap = this._itemsByKey;
        let i: number, j: number, k: number, len = items.length, pageIndex: number, page: ICachedPage, pageSize = this.pageSize;
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
   }
    clear() {
        let i: number, j: number, items: IEntityItem[], item: IEntityItem, dbSet = this._query.dbSet;
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
   }
    clearCacheForPage(pageIndex: number) {
        let page: ICachedPage = this.getCachedPage(pageIndex), dbSet = this._query.dbSet;
        if (!page)
            return;
        let j: number, items: IEntityItem[], item: IEntityItem, index = this._cache.indexOf(page);
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
   }
    hasPage(pageIndex: number) {
        for (let i = 0; i < this._cache.length; i += 1) {
            if (this._cache[i].pageIndex === pageIndex)
                return true;
       }
        return false;
   }
    getItemByKey(key: string) {
        return this._itemsByKey[key];
   }
    getPageByItem(item: IEntityItem) {
        item = this._itemsByKey[item._key];
        if (!item)
            return -1;
        for (let i = 0; i < this._cache.length; i += 1) {
            if (this._cache[i].items.indexOf(item) > -1) {
                return this._cache[i].pageIndex;
           }
       }
        return -1;
   }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this.clear();
        super.destroy();
   }
    toString() {
        return "DataCache";
   }
    get _pageCount() {
        let rowCount = this.totalCount, rowPerPage = this.pageSize, result: number;

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
   }
    get pageSize() { return this._query.pageSize; }
    get loadPageCount() { return this._query.loadPageCount; }
    get totalCount() { return this._totalCount; }
    set totalCount(v: number) {
        if (checks.isNt(v))
            v = 0;
        if (v !== this._totalCount) {
            this._totalCount = v;
            this.raisePropertyChanged(PROP_NAME.totalCount);
       }
   }
    get cacheSize() { return this._cache.length; }
}