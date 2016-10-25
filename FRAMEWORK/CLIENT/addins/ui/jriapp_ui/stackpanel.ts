/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {DATA_ATTR, KEYS } from "jriapp_core/const";
import { IApplication, ITemplate, ITemplateEvents, ISelectable, IViewOptions, TEventHandler,
    ISelectableProvider, IBaseObject } from "jriapp_core/shared";
import { ERRS } from "jriapp_core/lang";
import { BaseObject } from "jriapp_core/object";
import { Utils as utils, ERROR } from "jriapp_utils/utils";
import { bootstrap } from "jriapp_core/bootstrap";
import { ICollection, ICollectionItem, ICollChangedArgs, COLL_CHANGE_TYPE, COLL_CHANGE_REASON, ITEM_STATUS } from "jriapp_collection/collection";
import { BaseElView } from "jriapp_elview/elview";

const dom = utils.dom, $ = dom.$, doc = dom.document, checks = utils.check, strUtils = utils.str, coreUtils = utils.core;

const css = {
    stackpanel: "ria-stackpanel",
    item: "ria-stackpanel-item",
    horizontal: "ria-horizontal-panel",
    currentItem: "ria-current-item"
};

const PROP_NAME = {
    dataSource: "dataSource",
    currentItem: "currentItem",
    panel: "panel",
    panelEvents: "panelEvents"
};

const VERTICAL = "vertical", HORIZONTAL = "horizontal";

export interface IStackPanelOptions {
    templateID: string;
    orientation?: "vertical" | "horizontal";
}

interface IMappedItem { el: HTMLElement; template: ITemplate; item: ICollectionItem }

export interface IStackPanelConstructorOptions extends IStackPanelOptions {
    app: IApplication;
    el: HTMLElement;
    dataSource: ICollection<ICollectionItem>;
}


const PNL_EVENTS = {
    item_clicked: "item_clicked"
};

export class StackPanel extends BaseObject implements ISelectableProvider, ITemplateEvents {
    private _$el: JQuery;
    private _objId: string;
    private _currentItem: ICollectionItem;
    private _itemMap: { [key: string]: IMappedItem; };
    private _options: IStackPanelConstructorOptions;
    private _selectable: ISelectable;
    private _item_tag: string;
    private _event_scope: string;
    private _isKeyNavigation: boolean;

    constructor(options: IStackPanelConstructorOptions) {
        super();
        let self = this;
        options = <IStackPanelConstructorOptions>coreUtils.extend(
            {
                app: null,
                el: null,
                dataSource: null,
                templateID: null,
                orientation: VERTICAL
            }, options);

        if (!!options.dataSource && !checks.isCollection(options.dataSource))
            throw new Error(ERRS.ERR_STACKPNL_DATASRC_INVALID);
        if (!options.templateID)
            throw new Error(ERRS.ERR_STACKPNL_TEMPLATE_INVALID);
        this._options = options;
        this._$el = $(options.el);
        let eltag = options.el.tagName.toLowerCase();
        if (eltag === "ul" || eltag === "ol")
            this._item_tag = "li";
        else
            this._item_tag = "div";

        if (this.orientation === HORIZONTAL) {
            this._$el.addClass(css.horizontal);
        }

        this._objId = "pnl" + coreUtils.getNewID();
        this._isKeyNavigation = false;
        this._event_scope = [this._item_tag, "[", DATA_ATTR.DATA_EVENT_SCOPE, '="', this._objId, '"]'].join("");
        this._currentItem = null;
        this._$el.addClass(css.stackpanel);
        this._itemMap = {};
        this._selectable = {
            getContainerEl: () => {
                return self._getContainerEl();
            },
            getUniqueID: () => {
                return self.uniqueID;
            },
            onKeyDown: (key: number, event: Event) => {
                self._onKeyDown(key, event);
            },
            onKeyUp: (key: number, event: Event) => {
                self._onKeyUp(key, event);
            }
        };

        this._$el.on("click", this._event_scope,
            function (e) {
                e.stopPropagation();
                bootstrap.currentSelectable = self;
                let $el = $(this), mappedItem: IMappedItem = <any>$el.data("data");
                self._onItemClicked(mappedItem.el, mappedItem.item);
            });
        if (!!options.dataSource) {
            this._bindDS();
        }
        bootstrap._getInternal().trackSelectable(this);
    }
    protected _getEventNames() {
        let base_events = super._getEventNames();
        return [PNL_EVENTS.item_clicked].concat(base_events);
    }
    templateLoading(template: ITemplate): void {
        //noop
    }
    templateLoaded(template: ITemplate): void {
        //noop
    }
    templateUnLoading(template: ITemplate): void {
        //noop
    }
    addOnItemClicked(fn: TEventHandler<StackPanel, { item: ICollectionItem; }>, nmspace?: string, context?: IBaseObject) {
        this._addHandler(PNL_EVENTS.item_clicked, fn, nmspace, context);
    }
    removeOnItemClicked(nmspace?: string) {
        this._removeHandler(PNL_EVENTS.item_clicked, nmspace);
    }
    protected _getContainerEl() { return this._options.el; }
    protected _onKeyDown(key: number, event: Event) {
        let ds = this.dataSource, self = this;
        if (!ds)
            return;
        if (this.orientation === HORIZONTAL) {
            switch (key) {
                case KEYS.left:
                    event.preventDefault();
                    this._isKeyNavigation = true;
                    if (ds.movePrev(true)) {
                        self.scrollToItem(ds.currentItem, true);
                    }
                    break;
                case KEYS.right:
                    event.preventDefault();
                    this._isKeyNavigation = true;
                    if (ds.moveNext(true)) {
                        self.scrollToItem(ds.currentItem, false);
                    }
                    break;
            }
        }
        else {
            switch (key) {
                case KEYS.up:
                    event.preventDefault();
                    this._isKeyNavigation = true;
                    if (ds.movePrev(true)) {
                        self.scrollToItem(ds.currentItem, true);
                    }
                    break;
                case KEYS.down:
                    event.preventDefault();
                    this._isKeyNavigation = true;
                    if (ds.moveNext(true)) {
                        self.scrollToItem(ds.currentItem, false);
                    }
                    break;
            }
        }
        this._isKeyNavigation = false;
    }
    protected _onKeyUp(key: number, event: Event) {
    }
    protected _updateCurrent(item: ICollectionItem, withScroll: boolean) {
        let self = this, old = self._currentItem, mappedItem: IMappedItem;
        if (old !== item) {
            this._currentItem = item;
            if (!!old) {
                mappedItem = self._itemMap[old._key];
                if (!!mappedItem) {
                    $(mappedItem.el).removeClass(css.currentItem);
                }
            }
            if (!!item) {
                mappedItem = self._itemMap[item._key];
                if (!!mappedItem) {
                    $(mappedItem.el).addClass(css.currentItem);
                    if (withScroll && !this._isKeyNavigation)
                        this.scrollToCurrent(false);
                }
            }
            this.raisePropertyChanged(PROP_NAME.currentItem);
        }
    }
    protected _onDSCurrentChanged(sender: any, args: any): void {
        let ds = this.dataSource, cur = ds.currentItem;
        if (!cur)
            this._updateCurrent(null, false);
        else {
            this._updateCurrent(cur, true);
        }
    }
    protected _onDSCollectionChanged(sender: any, args: ICollChangedArgs<ICollectionItem>): void {
        let self = this, items = args.items;
        switch (args.changeType) {
            case COLL_CHANGE_TYPE.Reset:
                {
                    this._refresh();
                }
                break;
            case COLL_CHANGE_TYPE.Add:
                {
                    self._appendItems(args.items);
                }
                break;
            case COLL_CHANGE_TYPE.Remove:
                items.forEach(function (item) {
                    self._removeItem(item);
                });
                break;
            case COLL_CHANGE_TYPE.Remap:
                {
                    let mappedItem = self._itemMap[args.old_key];
                    if (!!mappedItem) {
                        delete self._itemMap[args.old_key];
                        self._itemMap[args.new_key] = mappedItem;
                    }
                }
                break;
            default:
                throw new Error(strUtils.format(ERRS.ERR_COLLECTION_CHANGETYPE_INVALID, args.changeType));
        }
    }
    protected _onItemStatusChanged(item: ICollectionItem, oldStatus: ITEM_STATUS) {
        let newStatus = item._aspect.status;
        let obj = this._itemMap[item._key];
        if (!obj)
            return;
        if (newStatus === ITEM_STATUS.Deleted) {
            $(obj.el).hide();
        }
        else if (oldStatus === ITEM_STATUS.Deleted) {
            $(obj.el).show();
        }
    }
    protected _createTemplate(item: ICollectionItem) {
        let template = this.app.createTemplate(item, this);
        template.templateID = this.templateID;
        return template;
    }
    protected _appendItems(newItems: ICollectionItem[]) {
        if (this.getIsDestroyCalled())
            return;
        let self = this;
        newItems.forEach(function (item) {
            //a row for item already exists
            if (!!self._itemMap[item._key])
                return;
            self._appendItem(item);
        });
    }
    protected _appendItem(item: ICollectionItem) {
        if (!item._key)
            return;
        let self = this, item_el = doc.createElement(this._item_tag), $item_el = $(item_el);

        dom.addClass([item_el], css.item);
        item_el.setAttribute(DATA_ATTR.DATA_EVENT_SCOPE, this.uniqueID);
        self._$el.append($item_el);
        let mappedItem: IMappedItem = { el: item_el, template: null, item: item };
        $item_el.data("data", mappedItem);
        self._itemMap[item._key] = mappedItem;
        mappedItem.template = self._createTemplate(item);
        mappedItem.el.appendChild(mappedItem.template.el);
    }
    protected _bindDS() {
        let self = this, ds = this.dataSource;
        if (!ds) return;
        ds.addOnCollChanged(self._onDSCollectionChanged, self._objId, self);
        ds.addOnCurrentChanged(self._onDSCurrentChanged, self._objId, self);
        ds.addOnStatusChanged(function (sender, args) {
            self._onItemStatusChanged(args.item, args.oldStatus);
        }, self._objId);
        this._refresh();
    }
    protected _unbindDS() {
        let self = this, ds = this.dataSource;
        if (!ds) return;
        ds.removeNSHandlers(self._objId);
    }
    protected _onItemClicked(div: HTMLElement, item: ICollectionItem) {
        this._updateCurrent(item, false);
        this.dataSource.currentItem = item;
        this.raiseEvent(PNL_EVENTS.item_clicked, { item: item });
    }
    protected _clearContent() {
        let self = this;
        self._$el.empty();
        coreUtils.forEachProp(self._itemMap, function (key) {
            self._removeItemByKey(key);
        });
    }
    protected _removeItemByKey(key: string) {
        let self = this, mappedItem = self._itemMap[key];
        if (!mappedItem)
            return;
        delete self._itemMap[key];
        mappedItem.template.destroy();
        mappedItem.template = null;
        $(mappedItem.el).removeData("data");
        $(mappedItem.el).remove();
    }
    protected _removeItem(item: ICollectionItem) {
        this._removeItemByKey(item._key);
    }
    protected _refresh() {
        let ds = this.dataSource, self = this;
        this._clearContent();
        if (!ds)
            return;
        ds.forEach(function (item) {
            self._appendItem(item);
        });
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        bootstrap._getInternal().untrackSelectable(this);
        this._unbindDS();
        this._clearContent();
        this._$el.off("click", this._event_scope);
        this._$el.removeClass(css.stackpanel);
        if (this.orientation === HORIZONTAL)
            this._$el.removeClass(css.horizontal);
        this._$el = null;
        this._currentItem = null;
        this._itemMap = {};
        this._options = <any>{};
        super.destroy();
    }
    getISelectable(): ISelectable {
        return this._selectable;
    }
    scrollToItem(item: ICollectionItem, isUp?: boolean) {
        if (!item)
            return;
        let mappedItem = this._itemMap[item._key];
        if (!mappedItem) {
            return;
        }
        //mappedItem.el.scrollIntoView(false);
        
        let isVert = this.orientation === VERTICAL, $item = $(mappedItem.el),
            viewPortSize = isVert ? this._$el.innerHeight() : this._$el.innerWidth(),
            itemSize = isVert ? $item.outerHeight() : $item.outerWidth(), currentPos = isVert ? this._$el.scrollTop() : this._$el.scrollLeft(),
            offsetDiff = isVert ? (currentPos + $item.offset().top - this._$el.offset().top) : (currentPos + $item.offset().left - this._$el.offset().left);

        let contentSize = Math.min(itemSize, viewPortSize);
        let offset = viewPortSize - contentSize;
        let pos = !isUp ? Math.floor(offsetDiff - offset + 1) : Math.floor(offsetDiff - 1);

        
        //console.log(strUtils.format("pos: {0} currentPos: {1} offsetDiff: {2} (offsetDiff - offset): {3} offset: {4} viewPortSize: {5} contentSize:{6} isUp: {7}",
            //pos, currentPos, offsetDiff, (offsetDiff - offset), offset, viewPortSize, contentSize, isUp));

        if (pos < 0)
            pos = 0;
        
        if ((currentPos < offsetDiff && currentPos > (offsetDiff - offset))) {
            return;
        }
        

        if (isVert)
            this._$el.scrollTop(pos);
        else
            this._$el.scrollLeft(pos);
        
    }
    scrollToCurrent(isUp?: boolean) {
        this.scrollToItem(this._currentItem, isUp);
    }
    focus() {
        this.scrollToCurrent(true);
        bootstrap.currentSelectable = this;
    }
    getDivElementByItem(item: ICollectionItem) {
        let mappedItem = this._itemMap[item._key];
        if (!mappedItem)
            return null;
        return mappedItem.el;
    }
    toString() {
        return "StackPanel";
    }
    get app() { return this._options.app; }
    get el() { return this._options.el; }
    get uniqueID() { return this._objId; }
    get orientation() { return this._options.orientation; }
    get templateID() { return this._options.templateID; }
    get dataSource() { return this._options.dataSource; }
    set dataSource(v) {
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
    get currentItem() { return this._currentItem; }
}

export interface IStackPanelViewOptions extends IStackPanelOptions, IViewOptions {
}

export interface IPanelEvents {
    onItemClicked(item: ICollectionItem): void;
}

export class StackPanelElView extends BaseElView {
    private _panel: StackPanel;
    private _panelEvents: IPanelEvents;

    constructor(options: IStackPanelViewOptions) {
        super(options);
        this._panel = null;
        this._panelEvents = null;
        this._createPanel(<IStackPanelConstructorOptions>options);
    }
    private _createPanel(opts: IStackPanelConstructorOptions) {
        this._panel = new StackPanel(opts);
        this._panel.addOnItemClicked(function (sender, args) {
            let self: StackPanelElView = this;
            if (!!self._panelEvents) {
                self._panelEvents.onItemClicked(args.item);
            }
        }, this.uniqueID, this);
        this._panel.addOnDestroyed(function () {
            let self: StackPanelElView = this;
            self._panel = null;
            self.raisePropertyChanged(PROP_NAME.panel);
        }, this.uniqueID, this);
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        if (!!this._panel && !this._panel.getIsDestroyCalled()) {
            this._panel.destroy();
        }
        this._panelEvents = null;
        this._panel = null;
        super.destroy();
    }
    toString() {
        return "StackPanelElView";
    }
    get dataSource() {
        if (this.getIsDestroyCalled() || !this._panel)
            return checks.undefined;
        return this._panel.dataSource;
    }
    set dataSource(v) {
        if (this._isDestroyCalled)
            return;
        if (this.dataSource !== v) {
            this._panel.dataSource = v;
            this.raisePropertyChanged(PROP_NAME.dataSource);
        }
    }
    get panelEvents() { return this._panelEvents; }
    set panelEvents(v) {
        let old = this._panelEvents;
        if (v !== old) {
            this._panelEvents = v;
            this.raisePropertyChanged(PROP_NAME.panelEvents);
        }
    }
    get panel() { return this._panel; }
}

bootstrap.registerElView("stackpanel", StackPanelElView);
bootstrap.registerElView("ul", StackPanelElView);
bootstrap.registerElView("ol", StackPanelElView);

//Load Stylesheet for the bundle
bootstrap.loadOwnStyle("jriapp_ui");