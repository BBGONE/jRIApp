﻿/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    BaseObject, LocaleERRS as ERRS, Utils, IIndexer
} from "jriapp_shared";
import { PROP_NAME } from "./const";
import { DataQuery } from "./dataquery";
import { IEntityItem, ICachedPage } from "./int";

const utils = Utils, checks = utils.check, strUtils = utils.str, coreUtils = utils.core;

export class DataCache extends BaseObject {
    private _query: DataQuery<IEntityItem>;
    private _pages: IIndexer<ICachedPage>;
    private _itemsByKey: { [key: string]: IEntityItem; };
    private _totalCount: number;
    
    constructor(query: DataQuery<IEntityItem>) {
        super();
        this._query = query;
        this._pages = {};
        this._itemsByKey = {};
        this._totalCount = 0;
    }
    //reset items key index
    reindex() {
        let keyMap: { [key: string]: IEntityItem; } = {};
        coreUtils.forEachProp(this._pages, (index, page) => {
            page.items.forEach(function (item) {
                keyMap[item._key] = item;
                item._aspect._setIsCached(true);
            });
        });
        this._itemsByKey = keyMap;
    }
    getPrevPageIndex(currentPageIndex: number) {
        let pageIndex = -1;
        coreUtils.forEachProp(this._pages, (index, page) => {
            let cachePageIndex = page.pageIndex;
            if (cachePageIndex > pageIndex && cachePageIndex < currentPageIndex)
                pageIndex = cachePageIndex;
        });
        return pageIndex;
    }
    getNextRange(pageIndex: number) {
        let half = Math.floor(((this.loadPageCount - 1) / 2));
        let above = (pageIndex + half) + ((this.loadPageCount - 1) % 2);
        let below = (pageIndex - half), prev = this.getPrevPageIndex(pageIndex);
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
    clear() {
        const dbSet = this._query.dbSet;
        coreUtils.forEachProp(this._pages, (index, page) => {
            let items = page.items;
            for (let j = 0; j < items.length; j += 1) {
                let item = items[j];
                item._aspect._setIsCached(false);
                if (!dbSet.getItemByKey(item._key))
                    item.destroy();
            }
        });
        this._pages = {};
        this._itemsByKey = {};
    }
    getPage(pageIndex: number): ICachedPage {
        return this._pages[pageIndex];
    }
    getPageItems(pageIndex: number): IEntityItem[] {
        const page = this.getPage(pageIndex);
        if (!page)
            return [];
        return page.items;
    }
    setPageItems(pageIndex: number, items: IEntityItem[]) {
        this.deletePage(pageIndex);
        //create new page
        const page = { items: items, pageIndex: pageIndex };
        this._pages[pageIndex] = page;

        let keyMap = this._itemsByKey;
        for (let j = 0, len = items.length; j < len; j += 1) {
            let item = items[j];
            keyMap[item._key] = item;
            item._aspect._setIsCached(true);
        }
    }
    fill(startIndex: number, items: IEntityItem[]) {
        const len = items.length, pageSize = this.pageSize;
        for (let i = 0; i < this.loadPageCount; i += 1) {
            let pageItems: IEntityItem[] = [], pgstart = (i * pageSize);
            if (pgstart >= len)
                break;
            for (let j = 0; j < pageSize; j += 1) {
                let k = pgstart + j;
                if (k < len) {
                    pageItems.push(items[k]);
                }
                else {
                    break;
                }
            }
            this.setPageItems(startIndex + i, pageItems);
        }
    }
    deletePage(pageIndex: number) {
        const page: ICachedPage = this.getPage(pageIndex);
        if (!page)
            return;
        const items = page.items;
        for (let j = 0; j < items.length; j += 1) {
            let item = items[j];
            item._aspect._setIsCached(false);
            delete this._itemsByKey[item._key];
        }
        delete this._pages[pageIndex];
    }
    hasPage(pageIndex: number) {
        return !!this.getPage(pageIndex);
    }
    getItemByKey(key: string) {
        return this._itemsByKey[key];
    }
    getPageByItem(item: IEntityItem) {
        let test = this._itemsByKey[item._key];
        if (!test)
            return -1;
        const indexes = Object.keys(this._pages);
        for (let i = 0; i < indexes.length; i += 1) {
            let page = this._pages[indexes[i]];
            if (page.items.indexOf(item) > -1) {
                return page.pageIndex;
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
        let rowCount = this.totalCount, rowPerPage = this.pageSize, result: number = 0;

        if ((rowCount === 0) || (rowPerPage === 0)) {
            return result;
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
    get cacheSize() {
        let indexes = Object.keys(this._pages);
        return indexes.length;
    }
}