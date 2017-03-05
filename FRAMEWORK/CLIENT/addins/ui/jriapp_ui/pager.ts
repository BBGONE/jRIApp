/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    Utils, BaseObject, LocaleERRS as ERRS, LocaleSTRS as STRS, Debounce
} from "jriapp_shared";
import { DATA_ATTR } from "jriapp/const";
import { DomUtils } from "jriapp/utils/dom";
import { IViewOptions } from "jriapp/int";
import { BaseElView, fn_addToolTip } from "./baseview";
import { COLL_CHANGE_REASON, COLL_CHANGE_TYPE } from "jriapp_shared/collection/const";
import { ICollection, ICollectionItem } from "jriapp_shared/collection/int";
import { bootstrap } from "jriapp";

const utils = Utils, dom = DomUtils, doc = dom.document, sys = utils.sys,
    strUtils = utils.str, coreUtils = utils.core, boot = bootstrap;
const _STRS = STRS.PAGER;

const css = {
    pager: "ria-pager",
    info: "ria-pager-info",
    currentPage: "ria-pager-current-page",
    otherPage: "ria-pager-other-page"
};

export interface IPagerOptions {
    showTip?: boolean;
    showInfo?: boolean;
    showNumbers?: boolean;
    showFirstAndLast?: boolean;
    showPreviousAndNext?: boolean;
    useSlider?: boolean;
    hideOnSinglePage?: boolean;
    sliderSize?: number;
}

export interface IPagerConstructorOptions extends IPagerOptions {
    el: HTMLElement;
    dataSource: ICollection<ICollectionItem>;
}

const PROP_NAME = {
    dataSource: "dataSource",
    rowCount: "rowCount",
    currentPage: "currentPage",
    pager: "pager"
};

export class Pager extends BaseObject {
    private _el: HTMLElement;
    private _objId: string;
    private _options: IPagerConstructorOptions;
    private _rowsPerPage: number;
    private _rowCount: number;
    private _currentPage: number;
    private _pageDebounce: Debounce;
    private _dsDebounce: Debounce;
    // saves old display before making display: none
    private _display: string;

    constructor(options: IPagerConstructorOptions) {
        super();
        options = coreUtils.extend(
            {
                el: null,
                dataSource: null,
                showTip: true,
                showInfo: false,
                showNumbers: true,
                showFirstAndLast: true,
                showPreviousAndNext: false,
                useSlider: true,
                hideOnSinglePage: true,
                sliderSize: 25
            }, options);
        const self = this;
        this._display = null;
        if (!!options.dataSource && !sys.isCollection(options.dataSource))
            throw new Error(ERRS.ERR_PAGER_DATASRC_INVALID);
        this._options = options;
        this._el = options.el;
        dom.addClass([this._el], css.pager);
        this._objId = coreUtils.getNewID("pgr");
        this._rowsPerPage = 0;
        this._rowCount = 0;
        this._currentPage = 1;
        this._pageDebounce = new Debounce();
        this._dsDebounce = new Debounce();
        dom.events.on(this._el, "click", (e) => {
            e.preventDefault();
            const a = <HTMLElement>e.target, page = parseInt(a.getAttribute("data-page"), 10);
            self._pageDebounce.enque(() => {
                self.currentPage = page;
                self._dsDebounce.enque(() => {
                    if (!!self.dataSource) {
                        self.dataSource.pageIndex = page - 1;
                    }
                });
            });
        }, {
                nmspace: this._objId,
                // using delegation
                matchElement: (el) => {
                    const attr = el.getAttribute(DATA_ATTR.DATA_EVENT_SCOPE),
                        tag = el.tagName.toLowerCase();
                    return self._objId === attr && tag === "a";
                }
            });
        this._bindDS();
    }
    protected _createElement(tag: string): HTMLElement {
        return doc.createElement(tag);
    }
    protected render() {
        const el = this._el;
        let rowCount: number, currentPage: number, pageCount: number;
        this._clearContent();

        if (this.rowsPerPage <= 0) {
            return;
        }

        rowCount = this.rowCount;
        if (rowCount === 0) {
            return;
        }
        currentPage = this.currentPage;
        if (currentPage === 0) {
            return;
        }

        pageCount = this.pageCount;

        if (this.hideOnSinglePage && (pageCount === 1)) {
            this.isVisible = false;
        }
        else {
            this.isVisible = true;

            if (this.showInfo) {
                const span = this._createElement("span");
                const info = strUtils.format(_STRS.pageInfo, currentPage, pageCount);
                dom.addClass([span], css.info);
                span.textContent = info;
                span.appendChild(el);
            }

            if (this.showFirstAndLast && (currentPage !== 1)) {
                el.appendChild(this._createFirst());
            }

            if (this.showPreviousAndNext && (currentPage !== 1)) {
                el.appendChild(this._createPrevious());
            }

            if (this.showNumbers) {
                const sliderSize = this.sliderSize;
                let start = 1, end = pageCount, half: number, above: number, below: number;

                if (this.useSlider && (sliderSize > 0)) {
                    half = Math.floor(((sliderSize - 1) / 2));
                    above = (currentPage + half) + ((sliderSize - 1) % 2);
                    below = (currentPage - half);

                    if (below < 1) {
                        above += (1 - below);
                        below = 1;
                    }

                    if (above > pageCount) {
                        below -= (above - pageCount);

                        if (below < 1) {
                            below = 1;
                        }

                        above = pageCount;
                    }

                    start = below;
                    end = above;
                }

                for (let i = start; i <= end; i++) {
                    if (i === currentPage) {
                        el.appendChild(this._createCurrent());
                    }
                    else {
                        el.appendChild(this._createOther(i));
                    }
                }
            }

            if (this.showPreviousAndNext && (currentPage !== pageCount)) {
                el.appendChild(this._createNext());
            }

            if (this.showFirstAndLast && (currentPage !== pageCount)) {
                el.appendChild(this._createLast());
            }
        }
    }
    protected _onPageSizeChanged(ds: ICollection<ICollectionItem>) {
        this.rowsPerPage = ds.pageSize;
    }
    protected _onPageIndexChanged(ds: ICollection<ICollectionItem>) {
        this.currentPage = ds.pageIndex + 1;
    }
    protected _onTotalCountChanged(ds: ICollection<ICollectionItem>) {
        this.rowCount = ds.totalCount;
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this._pageDebounce.destroy();
        this._dsDebounce.destroy();
        this._unbindDS();
        this._clearContent();
        dom.events.offNS(this._el, this._objId);
        dom.removeClass([this.el], css.pager);
        this._el = null;
        this._options = <any>{};
        super.destroy();
    }
    protected _bindDS() {
        const self = this, ds = this.dataSource;
        if (!ds)
            return;
        ds.addOnCollChanged((sender, args) => {
            switch (args.changeType) {
                case COLL_CHANGE_TYPE.Reset:
                    {
                        if (args.reason !== COLL_CHANGE_REASON.PageChange) {
                            self._reset();
                        }
                    }
                    break;
            }
        }, self._objId);
        ds.addOnPageIndexChanged(self._onPageIndexChanged, self._objId, self);
        ds.addOnPageSizeChanged(self._onPageSizeChanged, self._objId, self);
        ds.addOnTotalCountChanged(self._onTotalCountChanged, self._objId, self);
        this._reset();
    }
    protected _unbindDS() {
        const self = this, ds = this.dataSource;
        if (!ds)
            return;
        ds.removeNSHandlers(self._objId);
    }
    protected _clearContent() {
        this._el.innerHTML = "";
    }
    protected _reset() {
        const ds = this.dataSource;
        if (!ds) {
            this._currentPage = 1;
            this._rowsPerPage = 100;
            this._rowCount = 0;
            this.render();
            return;
        }
        this._currentPage = ds.pageIndex + 1;
        this._rowsPerPage = ds.pageSize;
        this._rowCount = ds.totalCount;
        this.render();
    }
    protected _createLink(page: number, text: string, tip?: string) {
        const a = this._createElement("a");
        a.textContent = ("" + text);
        a.setAttribute("href", "javascript:void(0)");

        if (!!tip) {
            fn_addToolTip(a, tip);
        }
        a.setAttribute(DATA_ATTR.DATA_EVENT_SCOPE, this._objId);
        a.setAttribute("data-page", "" + page);
        return a;
    }
    protected _createFirst() {
        const span = this._createElement("span");
        let tip: string;

        if (this.showTip) {
            tip = _STRS.firstPageTip;
        }
        const a = this._createLink(1, _STRS.firstText, tip);
        dom.addClass([span], css.otherPage);
        span.appendChild(a);
        return span;
    }
    protected _createPrevious() {
        const span = this._createElement("span"), previousPage = this.currentPage - 1;
        let tip: string;

        if (this.showTip) {
            tip = strUtils.format(_STRS.prevPageTip, previousPage);
        }

        const a = this._createLink(previousPage, _STRS.previousText, tip);
        dom.addClass([span], css.otherPage);
        span.appendChild(a);
        return span;
    }
    protected _createCurrent() {
        const span = this._createElement("span"), currentPage = this.currentPage;

        span.textContent = ("" + currentPage);

        if (this.showTip) {
            fn_addToolTip(span, this._buildTip(currentPage));
        }
        dom.addClass([span], css.currentPage);
        return span;
    }
    protected _createOther(page: number) {
        const span = this._createElement("span");
        let tip: string;

        if (this.showTip) {
            tip = this._buildTip(page);
        }

        const a = this._createLink(page, "" + page, tip);
        dom.addClass([span], css.otherPage);
        span.appendChild(a);
        return span;
    }
    protected _createNext() {
        const span = this._createElement("span"), nextPage = this.currentPage + 1;
        let tip: string;

        if (this.showTip) {
            tip = strUtils.format(_STRS.nextPageTip, nextPage);
        }
        const a = this._createLink(nextPage, _STRS.nextText, tip);
        dom.addClass([span], css.otherPage);
        span.appendChild(a);
        return span;
    }
    protected _createLast() {
        const span = this._createElement("span");
        let tip: string;

        if (this.showTip) {
            tip = _STRS.lastPageTip;
        }
        const a = this._createLink(this.pageCount, _STRS.lastText, tip);
        dom.addClass([span], css.otherPage);
        span.appendChild(a);
        return span;
    }
    protected _buildTip(page: number) {
        const rowsPerPage = this.rowsPerPage, rowCount = this.rowCount,
            start = (((page - 1) * rowsPerPage) + 1),
            end = (page === this.pageCount) ? rowCount : (page * rowsPerPage);
        let tip = "";

        if (page === this.currentPage) {
            tip = strUtils.format(_STRS.showingTip, start, end, rowCount);
        }
        else {
            tip = strUtils.format(_STRS.showTip, start, end, rowCount);
        }
        return tip;
    }
    protected _setDataSource(v: ICollection<ICollectionItem>) {
        this._unbindDS();
        this._options.dataSource = v;
        this._bindDS();
    }
    toString() {
        return "Pager";
    }
    get el() { return this._options.el; }
    get dataSource(): ICollection<ICollectionItem> {
        return this._options.dataSource;
    }
    set dataSource(v: ICollection<ICollectionItem>) {
        if (v !== this.dataSource) {
            this._setDataSource(v);
            this.raisePropertyChanged(PROP_NAME.dataSource);
        }
    }
    get pageCount(): number {
        const rowCount = this.rowCount, rowsPerPage = this.rowsPerPage;
        let result: number;

        if ((rowCount === 0) || (rowsPerPage === 0)) {
            return 0;
        }

        if ((rowCount % rowsPerPage) === 0) {
            return (rowCount / rowsPerPage);
        }
        else {
            result = (rowCount / rowsPerPage);
            result = Math.floor(result) + 1;
            return result;
        }
    }
    get rowCount() { return this._rowCount; }
    set rowCount(v) {
        if (this._rowCount !== v) {
            this._rowCount = v;
            this.render();
            this.raisePropertyChanged(PROP_NAME.rowCount);
        }
    }
    get rowsPerPage() { return this._rowsPerPage; }
    set rowsPerPage(v) {
        if (this._rowsPerPage !== v) {
            this._rowsPerPage = v;
            this.render();
        }
    }
    get currentPage() { return this._currentPage; }
    set currentPage(v) {
        if (this._currentPage !== v) {
            this._currentPage = v;
            this.render();
            this.raisePropertyChanged(PROP_NAME.currentPage);
        }
    }
    get useSlider() { return this._options.useSlider; }
    set useSlider(v) {
        if (this.useSlider !== v) {
            this._options.useSlider = v;
            this.render();
        }
    }
    get sliderSize() { return this._options.sliderSize; }
    set sliderSize(v) {
        if (this.sliderSize !== v) {
            this._options.sliderSize = v;
            this.render();
        }
    }
    get hideOnSinglePage() { return this._options.hideOnSinglePage; }
    set hideOnSinglePage(v) {
        if (this.hideOnSinglePage !== v) {
            this._options.hideOnSinglePage = v;
            this.render();
        }
    }
    get showTip() { return this._options.showTip; }
    set showTip(v) {
        if (this.showTip !== v) {
            this._options.showTip = v;
            this.render();
        }
    }
    get showInfo() { return this._options.showInfo; }
    set showInfo(v) {
        if (this._options.showInfo !== v) {
            this._options.showInfo = v;
            this.render();
        }
    }
    get showFirstAndLast() { return this._options.showFirstAndLast; }
    set showFirstAndLast(v) {
        if (this.showFirstAndLast !== v) {
            this._options.showFirstAndLast = v;
            this.render();
        }
    }
    get showPreviousAndNext() { return this._options.showPreviousAndNext; }
    set showPreviousAndNext(v) {
        if (this.showPreviousAndNext !== v) {
            this._options.showPreviousAndNext = v;
            this.render();
        }
    }
    get showNumbers() { return this._options.showNumbers; }
    set showNumbers(v) {
        if (this.showNumbers !== v) {
            this._options.showNumbers = v;
            this.render();
        }
    }
    get isVisible() {
        const v = this.el.style.display;
        return !(v === "none");
    }
    set isVisible(v) {
        v = !!v;
        if (v !== this.isVisible) {
            if (!v) {
                this._display = this.el.style.display;
                // if saved display is none, then don't store it
                if (this._display === "none")
                    this._display = null;
                this.el.style.display = "none";
            }
            else {
                this.el.style.display = (!this._display ? "" : this._display);
            }
            this.raisePropertyChanged("isVisible");
        }
    }
}

export interface IPagerViewOptions extends IPagerOptions, IViewOptions {
}

export class PagerElView extends BaseElView {
    private _pager: Pager;

    constructor(options: IPagerViewOptions) {
        super(options);
        this._pager = new Pager(<IPagerConstructorOptions>options);
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        if (!this._pager.getIsDestroyCalled()) {
            this._pager.destroy();
        }
        super.destroy();
    }
    toString() {
        return "PagerElView";
    }
    get dataSource() {
        return this._pager.dataSource;
    }
    set dataSource(v) {
        if (this.dataSource !== v) {
            this._pager.dataSource = v;
            this.raisePropertyChanged(PROP_NAME.dataSource);
        }
    }
    get pager() { return this._pager; }
}

boot.registerElView("pager", PagerElView);