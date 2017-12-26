/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { BaseObject, Utils, IIndexer } from "jriapp_shared";
import { TDataQuery } from "./dataquery";
import { IEntityItem, ICachedPage, IKV } from "./int";

const utils = Utils, checks = utils.check, coreUtils = utils.core;


export class DataCache extends BaseObject {
    private _query: TDataQuery;
    private _pages: IIndexer<ICachedPage>;
    private _itemsByKey: { [key: string]: IKV; };
    private _totalCount: number;

    constructor(query: TDataQuery) {
        super();
        this._query = query;
        this._pages = {};
        this._itemsByKey = {};
        this._totalCount = 0;
    }
    private _getPrevPageIndex(currentPageIndex: number) {
        let pageIndex = -1;
        coreUtils.forEachProp(this._pages, (index, page) => {
            const cachePageIndex = page.pageIndex;
            if (cachePageIndex > pageIndex && cachePageIndex < currentPageIndex) {
                pageIndex = cachePageIndex;
            }
        });
        return pageIndex;
    }
    getNextRange(pageIndex: number) {
        const half = Math.floor(((this.loadPageCount - 1) / 2));
        let above = (pageIndex + half) + ((this.loadPageCount - 1) % 2);
        let below = (pageIndex - half);
        const prev = this._getPrevPageIndex(pageIndex);
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
        // once again check for previous cached range
        if (below <= prev) {
            above += (prev - below + 1);
            below += (prev - below + 1);
        }

        let cnt = above - below + 1;
        if (cnt < this.loadPageCount) {
            above += this.loadPageCount - cnt;
            cnt = above - below + 1;
        }
        const start = below;
        const end = above;
        return { start: start, end: end, cnt: cnt };
    }
    clear() {
        this._pages = {};
        this._itemsByKey = {};
    }
    getPage(pageIndex: number): ICachedPage {
        return this._pages[pageIndex];
    }
    getPageItems(pageIndex: number): IEntityItem[] {
        const page = this.getPage(pageIndex);
        if (!page) {
            return [];
        }
        const dbSet = this._query.dbSet, keyMap = this._itemsByKey;
        const res = page.keys.map((key) => {
            const kv = keyMap[key];
            return (!kv) ? <IEntityItem>null : dbSet.createEntityFromObj(kv.val, kv.key);
        }).filter((item) => { return !!item; });
        return res;
    }
    setPageItems(pageIndex: number, items: IEntityItem[]) {
        this.deletePage(pageIndex);
        if (items.length === 0) {
            return;
        }
        const kvs = items.map((item) => { return { key: item._key, val: item._aspect.vals }; });
        // create new page
        const page: ICachedPage = { keys: kvs.map((kv) => kv.key), pageIndex: pageIndex };
        this._pages[pageIndex] = page;
        const keyMap = this._itemsByKey, len = kvs.length;
        for (let j = 0; j < len; j += 1) {
            const kv = kvs[j];
            keyMap[kv.key] = kv;
        }
    }
    fill(startIndex: number, items: IEntityItem[]) {
        const len = items.length, pageSize = this.pageSize;
        for (let i = 0; i < this.loadPageCount; i += 1) {
            const pageItems: IEntityItem[] = [], pgstart = (i * pageSize);
            if (pgstart >= len) {
                break;
            }
            for (let j = 0; j < pageSize; j += 1) {
                const k = pgstart + j;
                if (k < len) {
                    pageItems.push(items[k]);
                } else {
                    break;
                }
            }
            this.setPageItems(startIndex + i, pageItems);
        }
    }
    deletePage(pageIndex: number) {
        const page: ICachedPage = this.getPage(pageIndex);
        if (!page) {
            return;
        }
        const keys = page.keys;
        for (let j = 0; j < keys.length; j += 1) {
            delete this._itemsByKey[keys[j]];
        }
        delete this._pages[pageIndex];
    }
    hasPage(pageIndex: number): boolean {
        return !!this.getPage(pageIndex);
    }
    getItemByKey(key: string): IEntityItem {
        const kv = this._itemsByKey[key];
        if (!kv) {
            return null;
        }
        return this._query.dbSet.createEntityFromObj(kv.val, kv.key);
    }
    dispose() {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        this.clear();
        super.dispose();
    }
    toString() {
        return "DataCache";
    }
    get _pageCount() {
        const rowCount = this.totalCount, rowPerPage = this.pageSize;
        let result: number = 0;

        if ((rowCount === 0) || (rowPerPage === 0)) {
            return result;
        }

        if ((rowCount % rowPerPage) === 0) {
            result = (rowCount / rowPerPage);
        } else {
            result = (rowCount / rowPerPage);
            result = Math.floor(result) + 1;
        }
        return result;
    }
    get pageSize() { return this._query.pageSize; }
    get loadPageCount() { return this._query.loadPageCount; }
    get totalCount() { return this._totalCount; }
    set totalCount(v: number) {
        if (checks.isNt(v)) {
            v = 0;
        }
        if (v !== this._totalCount) {
            this._totalCount = v;
            this.objEvents.raiseProp("totalCount");
        }
    }
    get cacheSize() {
        const indexes = Object.keys(this._pages);
        return indexes.length;
    }
}
