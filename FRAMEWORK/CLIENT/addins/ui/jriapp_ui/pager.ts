/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    Utils, BaseObject, IBaseObject, LocaleERRS as ERRS, LocaleSTRS as STRS
} from "jriapp_shared";
import { $ } from "jriapp/utils/jquery";
import { IApplication, IViewOptions } from "jriapp/int";
import { BaseElView, fn_addToolTip } from "./baseview";
import {
    COLL_CHANGE_REASON, ITEM_STATUS, COLL_CHANGE_TYPE
} from "jriapp_shared/collection/const";
import {
    ICollection, ICollectionItem, ICollChangedArgs
} from "jriapp_shared/collection/int";
import { bootstrap } from "jriapp";

const utils = Utils, dom = utils.dom, doc = dom.document, sys = utils.sys,
    checks = utils.check, strUtils = utils.str, coreUtils = utils.core,
    ERROR = utils.err, boot = bootstrap, win = dom.window;
let _STRS = STRS.PAGER;

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
    private _$el: JQuery;
    private _objId: string;
    private _options: IPagerConstructorOptions;
    private _rowsPerPage: number;
    private _rowCount: number;
    private _currentPage: number;

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
        if (!!options.dataSource && !sys.isCollection(options.dataSource))
            throw new Error(ERRS.ERR_PAGER_DATASRC_INVALID);
        this._options = options;
        this._$el = $(options.el);
        dom.addClass([options.el], css.pager);
        this._objId = coreUtils.getNewID("pgr");
        this._rowsPerPage = 0;
        this._rowCount = 0;
        this._currentPage = 1;
        if (!!this._options.dataSource) {
            this._bindDS();
        }
    }
    protected _createElement(tag: string) {
        return $(doc.createElement(tag));
    }
    protected _render() {
        let $el = this._$el, rowCount: number, currentPage: number, pageCount: number;
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
            $el.hide();
        }
        else {
            $el.show();

            if (this.showInfo) {
                let $span = this._createElement("span");
                let info = strUtils.format(_STRS.pageInfo, currentPage, pageCount);
                dom.addClass($span.toArray(), css.info);
                $span.text(info);
                $span.appendTo($el);
            }

            if (this.showFirstAndLast && (currentPage !== 1)) {
                $el.append(this._createFirst());
            }

            if (this.showPreviousAndNext && (currentPage !== 1)) {
                $el.append(this._createPrevious());
            }

            if (this.showNumbers) {
                let start = 1, end = pageCount, sliderSize = this.sliderSize, half: number, above: number, below: number;

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
                        $el.append(this._createCurrent());
                    }
                    else {
                        $el.append(this._createOther(i));
                    }
                }
            }

            if (this.showPreviousAndNext && (currentPage !== pageCount)) {
                $el.append(this._createNext());
            }

            if (this.showFirstAndLast && (currentPage !== pageCount)) {
                $el.append(this._createLast());
            }
        }
    }
    protected render() {
        win.requestAnimationFrame(() => {
            this._render();
        });
    }
    protected _setDSPageIndex(page: number) {
        this.dataSource.pageIndex = page - 1;
    }
    protected _onPageSizeChanged(ds: ICollection<ICollectionItem>, args?: any) {
        this.rowsPerPage = ds.pageSize;
    }
    protected _onPageIndexChanged(ds: ICollection<ICollectionItem>, args?: any) {
        this.currentPage = ds.pageIndex + 1;
    }
    protected _onTotalCountChanged(ds: ICollection<ICollectionItem>, args?: any) {
        this.rowCount = ds.totalCount;
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this._unbindDS();
        this._clearContent();
        dom.removeClass([this.el], css.pager);
        this._$el = null;
        this._options = <any>{};
        super.destroy();
    }
    protected _bindDS() {
        let self = this, ds = this.dataSource;
        if (!ds) return;
        ds.addOnCollChanged((s, args) => {
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
        let self = this, ds = this.dataSource;
        if (!ds) return;
        ds.removeNSHandlers(self._objId);
    }
    protected _clearContent() {
        this._$el.empty();
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
        let $a = this._createElement("a"), self = this;
        $a.text("" + text);
        $a.attr("href", "javascript:void(0)");

        if (!!tip) {
            fn_addToolTip($a, tip);
        }
        $a.click(function (e) {
            e.preventDefault();
            self._setDSPageIndex(page);
            self.currentPage = page;
        });

        return $a;
    }
    protected _createFirst() {
        let $span = this._createElement("span"), tip: string, $a: JQuery;

        if (this.showTip) {
            tip = _STRS.firstPageTip;
        }
        $a = this._createLink(1, _STRS.firstText, tip);
        dom.addClass($span.toArray(), css.otherPage);
        $span.append($a);
        return $span;
    }
    protected _createPrevious() {
        let $span = this._createElement("span"), previousPage = this.currentPage - 1, tip: string, $a: JQuery;

        if (this.showTip) {
            tip = strUtils.format(_STRS.prevPageTip, previousPage);
        }

        $a = this._createLink(previousPage, _STRS.previousText, tip);
        dom.addClass($span.toArray(), css.otherPage);
        $span.append($a);
        return $span;
    }
    protected _createCurrent() {
        let $span = this._createElement("span"), currentPage = this.currentPage;

        $span.text("" + currentPage);

        if (this.showTip) {
            fn_addToolTip($span, this._buildTip(currentPage));
        }
        dom.addClass($span.toArray(), css.currentPage);
        return $span;
    }
    protected _createOther(page: number) {
        let $span = this._createElement("span"), tip: string, $a: JQuery;

        if (this.showTip) {
            tip = this._buildTip(page);
        }

        $a = this._createLink(page, "" + page, tip);
        dom.addClass($span.toArray(), css.otherPage);
        $span.append($a);
        return $span;
    }
    protected _createNext() {
        let $span = this._createElement("span"), nextPage = this.currentPage + 1, tip: string, $a: JQuery;

        if (this.showTip) {
            tip = strUtils.format(_STRS.nextPageTip, nextPage);
        }
        $a = this._createLink(nextPage, _STRS.nextText, tip);
        dom.addClass($span.toArray(), css.otherPage);
        $span.append($a);
        return $span;
    }
    protected _createLast() {
        let $span = this._createElement("span"), tip: string, a: any;

        if (this.showTip) {
            tip = _STRS.lastPageTip;
        }
        a = this._createLink(this.pageCount, _STRS.lastText, tip);
        dom.addClass($span.toArray(), css.otherPage);
        $span.append(a);
        return $span;
    }
    protected _buildTip(page: number) {
        let rowsPerPage = this.rowsPerPage, rowCount = this.rowCount,
            start = (((page - 1) * rowsPerPage) + 1),
            end = (page === this.pageCount) ? rowCount : (page * rowsPerPage), tip = "";

        if (page === this.currentPage) {
            tip = strUtils.format(_STRS.showingTip, start, end, rowCount);
        }
        else {
            tip = strUtils.format(_STRS.showTip, start, end, rowCount);
        }
        return tip;
    }
    toString() {
        return "Pager";
    }
    get el() { return this._options.el; }
    get dataSource(): ICollection<ICollectionItem> {
        return this._options.dataSource;
    }
    set dataSource(v: ICollection<ICollectionItem>) {
        if (v === this.dataSource)
            return;
        if (!!this.dataSource) {
            this._unbindDS();
        }
        this._options.dataSource = v;
        if (!!this.dataSource)
            this._bindDS();
        this.raisePropertyChanged(PROP_NAME.dataSource);
    }
    get pageCount(): number {
        let rowCount = this.rowCount, rowsPerPage = this.rowsPerPage, result: number;

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
}

export interface IPagerViewOptions extends IPagerOptions, IViewOptions {
}

export class PagerElView extends BaseElView {
    private _pager: Pager;

    constructor(options: IPagerViewOptions) {
        super(options);
        const self = this;
        this._pager = null;

        this._pager = new Pager(<IPagerConstructorOptions>options);
        this._pager.addOnDestroyed(function () {
            self._pager = null;
            self.raisePropertyChanged(PROP_NAME.pager);
        });
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        if (!!this._pager && !this._pager.getIsDestroyCalled()) {
            this._pager.destroy();
        }
        this._pager = null;
        super.destroy();
    }
    toString() {
        return "PagerElView";
    }
    get dataSource() {
        if (this.getIsDestroyCalled())
            return checks.undefined;
        return this._pager.dataSource;
    }
    set dataSource(v) {
        if (this.getIsDestroyCalled())
            return;
        if (this.dataSource !== v) {
            this._pager.dataSource = v;
            this.raisePropertyChanged(PROP_NAME.dataSource);
        }
    }
    get pager() { return this._pager; }
}

boot.registerElView("pager", PagerElView);