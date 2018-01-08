/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import {
    Utils, BaseObject, LocaleERRS as ERRS, LocaleSTRS as STRS, Debounce
} from "jriapp_shared";
import { DATA_ATTR } from "jriapp/const";
import { DomUtils } from "jriapp/utils/dom";
import { IViewOptions, ISelectable, ISelectableProvider } from "jriapp/int";
import { BaseElView, fn_addToolTip } from "./baseview";
import { COLL_CHANGE_REASON, COLL_CHANGE_TYPE } from "jriapp_shared/collection/const";
import { ICollection, ICollectionItem } from "jriapp_shared/collection/int";
import { bootstrap, selectableProviderWeakMap } from "jriapp/bootstrap";

const utils = Utils, dom = DomUtils, doc = dom.document, sys = utils.sys,
    strUtils = utils.str, { getNewID, extend } = utils.core, boot = bootstrap;
const _STRS = STRS.PAGER;

const enum css {
    interval = "ria-pager-interval",
    pager = "ria-pager",
    info = "ria-pager-info",
    page = "ria-pager-page",
    currentPage = "ria-pager-current-page",
    otherPage = "ria-pager-other-page"
}

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
    dataSource?: ICollection<ICollectionItem>;
}

function _removeToolTips(toolTips: Element[]): void {
    toolTips.forEach((el) => {
        fn_addToolTip(el, null);
    });
}

export class Pager extends BaseObject implements ISelectableProvider {
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
    //an array of elements to which the toolTips are added
    private _toolTips: Element[];
    private _parentControl: ISelectableProvider;

    constructor(el: HTMLElement, options: IPagerConstructorOptions) {
        super();
        options = extend(
            {
                dataSource: null,
                showTip: true,
                showInfo: false,
                showNumbers: true,
                showPreviousAndNext: false,
                useSlider: true,
                hideOnSinglePage: true,
                sliderSize: 10
            }, options);
        const self = this;
        this._display = null;
        if (!!options.dataSource && !sys.isCollection(options.dataSource)) {
            throw new Error(ERRS.ERR_PAGER_DATASRC_INVALID);
        }
        this._options = options;
        //no use to have a sliderSize < 3
        options.sliderSize = options.sliderSize < 3 ? 3 : options.sliderSize;

        this._el = el;
        this._objId = getNewID("pgr");
        this._rowsPerPage = 0;
        this._rowCount = 0;
        this._currentPage = 1;
        this._toolTips = [];
        this._pageDebounce = new Debounce();
        this._dsDebounce = new Debounce();

        dom.events.on(el, "click", (e) => {
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
                matchElement: (el: Element) => {
                    const attr = el.getAttribute(DATA_ATTR.DATA_EVENT_SCOPE);
                    return self._objId === attr;
                }
            });

        this._bindDS();
        selectableProviderWeakMap.set(el, this);
    }
    dispose() {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        selectableProviderWeakMap.delete(this._el);
        this.parentControl = null;
        this._pageDebounce.dispose();
        this._dsDebounce.dispose();
        this._unbindDS();
        this._clearContent();
        dom.events.offNS(this._el, this._objId);
        this._el = null;
        this._options = <any>{};
        super.dispose();
    }
    protected _addToolTip(el: Element, tip: string) {
        fn_addToolTip(el, tip);
        if (!!tip) {
            this._toolTips.push(el);
        }
    }
    protected _createElement(tag: string): HTMLElement {
        return doc.createElement(tag);
    }
    protected _clearContent(): void {
        this._el.innerHTML = "";
        _removeToolTips(this._toolTips);
        this._toolTips = [];
    }
    protected render(): void {
        const div = doc.createElement("div"), docFr = doc.createDocumentFragment(), oldToolTips = this._toolTips;
        this._toolTips = [];
        dom.addClass([div], css.pager);

        if (this.rowsPerPage <= 0) {
            return;
        }

        const rowCount = this.rowCount, currentPage = this.currentPage,
            pageCount = this.pageCount;

        if (rowCount > 0) {
            if (this.showPreviousAndNext && !(this.hideOnSinglePage && (pageCount === 1))) {
                docFr.appendChild(this._createFirst());
                docFr.appendChild(this._createPrevious());
                docFr.appendChild(this._createCurrent());
                docFr.appendChild(this._createNext());
                docFr.appendChild(this._createLast());
            }

            if (this.showNumbers && currentPage > 0 && !(this.hideOnSinglePage && (pageCount === 1))) {
                const sliderSize = this.sliderSize;
                let start = 1, end = pageCount, half: number, above: number, below: number;

                if (this.useSlider && (sliderSize > 0) && (sliderSize < (pageCount - 3))) {
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
                let _start = start === 1 ? 2 : start;
                let _end = end === pageCount ? end - 1 : end;

                if (1 === currentPage) {
                    docFr.appendChild(this._createCurrent());
                } else {
                    docFr.appendChild(this._createOther(1));
                }

                if (_start > 2) {
                    if (_start === 3) {
                        docFr.appendChild(this._createOther(2));
                    } else {
                        docFr.appendChild(this._createInterval());
                    }
                }

                for (let i = _start; i <= _end; i++) {
                    if (i === currentPage) {
                        docFr.appendChild(this._createCurrent());
                    } else {
                        docFr.appendChild(this._createOther(i));
                    }
                }

                if (_end < (pageCount - 1)) {
                    if (_end === (pageCount - 2)) {
                        docFr.appendChild(this._createOther(pageCount - 1));
                    } else {
                        docFr.appendChild(this._createInterval());
                    }
                }

                if (pageCount === currentPage) {
                    docFr.appendChild(this._createCurrent());
                } else {
                    docFr.appendChild(this._createOther(pageCount));
                }
            } // if (this.showNumbers)
        }

        if (this.showInfo && rowCount > 0 && currentPage > 0) {
            const rowsPerPage = this.rowsPerPage,
                start = rowCount === 0 ? 0 : (((currentPage - 1) * rowsPerPage) + 1),
                end = rowCount === 0 ? 0 : ((currentPage === pageCount) ? rowCount : (currentPage * rowsPerPage));

            const span = this._createElement("span");
            const info = strUtils.format(_STRS.pageInfo, start, end, rowCount);
            dom.addClass([span], css.info);
            span.innerHTML = info;
            const spacer = this._createElement("span");
            spacer.innerHTML = "&nbsp;&nbsp;";
            docFr.appendChild(spacer);
            docFr.appendChild(span);
        }
        div.appendChild(docFr);

        const old = this._el.firstChild;
        if (!old) {
            this._el.appendChild(div);
        } else {
            this._el.replaceChild(div, this._el.firstChild);
        }
        _removeToolTips(oldToolTips);
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
    protected _bindDS() {
        const self = this, ds = this.dataSource;
        if (!ds) {
            return;
        }
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
        if (!ds) {
            return;
        }
        ds.objEvents.offNS(self._objId);
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
    protected _createLink(text: string) {
        const a = this._createElement("a");
        a.textContent = ("" + text);
        a.setAttribute("href", "javascript:void(0)");
        return a;
    }
    private _addScope(el: Element, page: number): void {
        el.setAttribute(DATA_ATTR.DATA_EVENT_SCOPE, this._objId);
        el.setAttribute("data-page", "" + page);
    }
    protected _createFirst() {
        const span = this._createElement("span");

        if (this.showTip) {
            const tip = _STRS.firstPageTip;
            this._addToolTip(span, tip);
        }
        const a = this._createLink(_STRS.firstText);
        dom.addClass([span], css.page);
        dom.addClass([span], css.otherPage);
        span.appendChild(a);
        this._addScope(span, 1);
        return span;
    }
    protected _createPrevious() {
        const span = this._createElement("span");
        let previousPage = this.currentPage - 1;
        if (previousPage < 1) {
            previousPage = 1;
        }
        if (this.showTip) {
            const tip = strUtils.format(_STRS.prevPageTip, previousPage);
            this._addToolTip(span, tip);
        }
        const a = this._createLink(_STRS.previousText);
        dom.addClass([span], css.page);
        dom.addClass([span], css.otherPage);
        span.appendChild(a);
        this._addScope(span, previousPage);
        return span;
    }
    protected _createCurrent() {
        const span = this._createElement("span"), currentPage = this.currentPage;

        span.textContent = ("" + currentPage);

        if (this.showTip) {
            this._addToolTip(span, this._buildTip(currentPage));
        }
        dom.addClass([span], css.page);
        dom.addClass([span], css.currentPage);
        return span;
    }
    protected _createInterval() {
        const span = this._createElement("span");
        dom.addClass([span], css.interval);
        span.textContent = ("...");
        return span;
    }
    protected _createOther(page: number) {
        const span = this._createElement("span");

        if (this.showTip) {
            const tip = this._buildTip(page);
            this._addToolTip(span, tip);
        }

        const a = this._createLink("" + page);
        dom.addClass([span], css.page);
        dom.addClass([span], css.otherPage);
        span.appendChild(a);
        this._addScope(span, page);
        return span;
    }
    protected _createNext() {
        const span = this._createElement("span"), pageCount = this.pageCount;
        let nextPage = this.currentPage + 1;
        if (nextPage > pageCount) {
            nextPage = pageCount;
        }
        if (this.showTip) {
            const tip = strUtils.format(_STRS.nextPageTip, nextPage);
            this._addToolTip(span, tip);
        }
        const a = this._createLink(_STRS.nextText);
        dom.addClass([span], css.page);
        dom.addClass([span], css.otherPage);
        span.appendChild(a);
        this._addScope(span, nextPage);
        return span;
    }
    protected _createLast() {
        const span = this._createElement("span");

        if (this.showTip) {
            const tip = _STRS.lastPageTip;
            this._addToolTip(span, tip);
        }
        const a = this._createLink(_STRS.lastText);
        dom.addClass([span], css.page);
        dom.addClass([span], css.otherPage);
        span.appendChild(a);
        this._addScope(span, this.pageCount);
        return span;
    }
    protected _buildTip(page: number) {
        const rowsPerPage = this.rowsPerPage, rowCount = this.rowCount,
            start = (((page - 1) * rowsPerPage) + 1),
            end = (page === this.pageCount) ? rowCount : (page * rowsPerPage);
        let tip = "";

        if (page === this.currentPage) {
            tip = strUtils.format(_STRS.showingTip, start, end, rowCount);
        } else {
            tip = strUtils.format(_STRS.showTip, start, end, rowCount);
        }
        return tip;
    }
    protected setDataSource(v: ICollection<ICollectionItem>) {
        this._unbindDS();
        this._options.dataSource = v;
        this._bindDS();
    }
    toString(): string {
        return "Pager";
    }
    get el(): HTMLElement {
        return this._el;
    }
    get dataSource(): ICollection<ICollectionItem> {
        return this._options.dataSource;
    }
    set dataSource(v: ICollection<ICollectionItem>) {
        if (v !== this.dataSource) {
            this.setDataSource(v);
            this.objEvents.raiseProp("dataSource");
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
        } else {
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
            this.objEvents.raiseProp("rowCount");
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
            this.objEvents.raiseProp("currentPage");
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
                if (this._display === "none") {
                    this._display = null;
                }
                this.el.style.display = "none";
            } else {
                this.el.style.display = (!this._display ? "" : this._display);
            }
            this.objEvents.raiseProp("isVisible");
        }
    }
    get selectable(): ISelectable {
        return !this._parentControl ? null : this._parentControl.selectable;
    }
    get parentControl() {
        return this._parentControl;
    }
    set parentControl(v) {
        if (this._parentControl !== v) {
            this._parentControl = v;
            this.objEvents.raiseProp("parentControl");
        }
    }
}

export interface IPagerViewOptions extends IPagerOptions, IViewOptions {
}

export class PagerElView extends BaseElView implements ISelectableProvider {
    private _pager: Pager;

    constructor(el: HTMLElement, options: IPagerViewOptions) {
        super(el, options);
        const self = this;
        this._pager = new Pager(el, <IPagerConstructorOptions>options);
        self._pager.objEvents.onProp("*", (sender, args) => {
            switch (args.property) {
                case "dataSource":
                case "parentControl":
                    self.objEvents.raiseProp(args.property);
                    break;
            }
        }, self.uniqueID);
    }
    dispose() {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        if (!this._pager.getIsStateDirty()) {
            this._pager.dispose();
        }
        super.dispose();
    }
    toString() {
        return "PagerElView";
    }
    get dataSource() {
        return this._pager.dataSource;
    }
    set dataSource(v) {
        this._pager.dataSource = v;
    }
    get pager() {
        return this._pager;
    }
    get selectable(): ISelectable {
        return this._pager.selectable;
    }
    get parentControl() {
        return this._pager.parentControl;
    }
    set parentControl(v) {
        this._pager.parentControl = v;
    }
}

boot.registerElView("pager", PagerElView);
