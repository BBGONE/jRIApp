/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { BINDING_MODE } from "jriapp_core/const";
import { IBaseObject, TEventHandler, IExternallyCachable, IBinding, IConstructorContentOptions, IElViewStore,
    IContentFactory, IApplication, IContentConstructor, IContent, IContentOptions, IBindingOptions, IViewOptions } from "jriapp_core/shared";
import { ERRS } from "jriapp_core/lang";
import { BaseObject } from "jriapp_core/object";
import { bootstrap } from "jriapp_core/bootstrap";
import { parser } from "jriapp_core/parser";
import { Utils as utils, ERROR } from "jriapp_utils/utils";
import { ICollection, ICollectionItem, ICollChangedArgs, COLL_CHANGE_TYPE,
    COLL_CHANGE_REASON, ITEM_STATUS } from "jriapp_collection/collection";
import { BaseElView } from "jriapp_elview/elview";
import { SpanElView } from "jriapp_elview/span";
import { BasicContent } from "jriapp_content/basic";
import { contentFactories } from "jriapp_content/factory";

const $ = utils.dom.$, document = utils.dom.document, checks = utils.check, strUtils = utils.str, coreUtils = utils.core;

export interface IOptionStateProvider {
    getCSS(item: ICollectionItem, itemIndex: number, val: any): string;
}

export interface IOptionTextProvider {
    getText(item: ICollectionItem, itemIndex: number, text: string): string;
}

export interface IListBoxOptions {
    valuePath: string;
    textPath: string;
    statePath?: string;
}

export interface IListBoxConstructorOptions extends IListBoxOptions {
    app: IApplication;
    el: HTMLSelectElement;
    dataSource: ICollection<ICollectionItem>;
}
export interface IMappedItem {
    item: ICollectionItem;
    op: HTMLOptionElement;
}

const PROP_NAME = {
    dataSource: "dataSource",
    selectedItem: "selectedItem",
    selectedValue: "selectedValue",
    valuePath: "valuePath",
    textPath: "textPath",
    isEnabled: "isEnabled",
    listBox: "listBox",
    value: "value",
    textProvider: "textProvider",
    stateProvider: "stateProvider"
};

const LISTBOX_EVENTS = {
    refreshed: "refreshed"
};

export class ListBox extends BaseObject {
    private _$el: JQuery;
    private _objId: string;
    private _isRefreshing: boolean;
    private _selectedItem: ICollectionItem;
    private _prevSelected: ICollectionItem;
    private _keyMap: { [key: string]: IMappedItem; };
    private _valMap: { [val: string]: IMappedItem; };
    private _savedValue: string;
    private _tempValue: any;
    private _options: IListBoxConstructorOptions;
    private _fn_state: (item: IBaseObject, args?: any) => void;
    private _textProvider: IOptionTextProvider;
    private _stateProvider: IOptionStateProvider;

    constructor(options: IListBoxConstructorOptions) {
        super();
        let self = this;
        options = coreUtils.extend(
            {
                app: null,
                el: null,
                dataSource: null,
                valuePath: null,
                textPath: null,
                statePath: null
            }, options);
        if (!!options.dataSource && !checks.isCollection(options.dataSource))
            throw new Error(ERRS.ERR_LISTBOX_DATASRC_INVALID);
        this._$el = $(options.el);
        this._options = options;
        this._objId = "lst" + coreUtils.getNewID();
        this._$el.on("change." + this._objId, function (e) {
            e.stopPropagation();
            if (self._isRefreshing)
                return;
            self._onChanged();
        });
        this._textProvider = null;
        this._stateProvider = null;
        this._isRefreshing = false;
        this._selectedItem = null;
        this._prevSelected = null;
        this._keyMap = {};
        this._valMap = {};
        this._savedValue = checks.undefined;
        this._tempValue = checks.undefined;
        let ds = this._options.dataSource;
        this._options.dataSource = null;
        this.dataSource = ds;
        this._fn_state = (sender) => {
            let item = <ICollectionItem><any>sender;
            let data: IMappedItem = self._keyMap[item._key];
            if (!data)
                return;
            let css = self._onOptionStateChanged(data);
            data.op.className = css;
        };
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this._unbindDS();
        this._$el.off("." + this._objId);
        this._clear(true);
        this._$el = null;
        this._tempValue = checks.undefined;
        this._selectedItem = null;
        this._prevSelected = null;
        this._savedValue = null;
        this._options = <any>{};
        this._textProvider = null;
        this._stateProvider = null;
        super.destroy();
    }
    protected _getEventNames() {
        let base_events = super._getEventNames();
        let events = Object.keys(LISTBOX_EVENTS).map((key, i, arr) => { return <string>(<any>LISTBOX_EVENTS)[key]; });
        return events.concat(base_events);
    }
    addOnRefreshed(fn: TEventHandler<ListBox, {}>, nmspace?: string, context?: any) {
        this._addHandler(LISTBOX_EVENTS.refreshed, fn, nmspace, context);
    }
    removeOnRefreshed(nmspace?: string) {
        this._removeHandler(LISTBOX_EVENTS.refreshed, nmspace);
    }
    protected _onChanged() {
        let op: any = null, key: string, data: IMappedItem;
        if (this.el.selectedIndex >= 0) {
            op = this.el.options[this.el.selectedIndex];
            key = op.value;
            data = this._keyMap[key];
        }

        if (!data && !!this._selectedItem) {
            this.selectedItem = null;
        }
        else if (data.item !== this._selectedItem) {
            this.selectedItem = data.item;
        }
    }
    protected _getStringValue(item: ICollectionItem): string {
        let v = this._getValue(item);
        if (checks.isNt(v))
            return "";
        return "" + v;
    }
    protected _getValue(item: ICollectionItem): any {
        if (!item)
            return null;
        if (!!this._options.valuePath) {
            return parser.resolvePath(item, this._options.valuePath);
        }
        else
            return checks.undefined;
    }
    protected _getText(item: ICollectionItem, index: number): string {
        let res = "";
        if (!item)
            return res;

        if (!!this._options.textPath) {
            let t = parser.resolvePath(item, this._options.textPath);
            if (checks.isNt(t))
                return "";
            res = "" + t;
        }
        else {
            res = this._getStringValue(item);
        }

        if (!this._textProvider)
            return res;
        res = this._textProvider.getText(item, index, res);
        return res;
    }
    protected _onDSCollectionChanged(sender: any, args: ICollChangedArgs<ICollectionItem>) {
        let self = this, data: any;
        switch (args.changeType) {
            case COLL_CHANGE_TYPE.Reset:
                {
                    this._refresh();
                }
                break;
            case COLL_CHANGE_TYPE.Add:
                args.items.forEach(function (item) {
                    self._addOption(item, item._aspect.isNew);
                });
                break;
            case COLL_CHANGE_TYPE.Remove:
                args.items.forEach(function (item) {
                    self._removeOption(item);
                });
                if (!!self._textProvider)
                    self._resetText();
                break;
            case COLL_CHANGE_TYPE.Remap:
                {
                    data = self._keyMap[args.old_key];
                    if (!!data) {
                        delete self._keyMap[args.old_key];
                        self._keyMap[args.new_key] = data;
                        data.op.value = args.new_key;
                    }
                }
                break;
        }
    }
    protected _onEdit(item: ICollectionItem, isBegin: boolean, isCanceled: boolean) {
        let self = this, key: string, data: IMappedItem, oldVal: string, val: string;
        if (isBegin) {
            this._savedValue = this._getStringValue(item);
        }
        else {
            oldVal = this._savedValue;
            this._savedValue = checks.undefined;
            if (!isCanceled) {
                key = item._key;
                data = self._keyMap[key];
                if (!!data) {
                    data.op.text = self._getText(item, data.op.index);
                    val = this._getStringValue(item);
                    if (oldVal !== val) {
                        if (!!oldVal) {
                            delete self._valMap[oldVal];
                        }
                        if (!!val) {
                            self._valMap[val] = data;
                        }
                    }
                }
                else {
                    if (!!oldVal) {
                        delete self._valMap[oldVal];
                    }
                }
            }
        }
    }
    protected _onStatusChanged(item: ICollectionItem, oldStatus: ITEM_STATUS) {
        let newStatus = item._aspect.status;
        if (newStatus === ITEM_STATUS.Deleted) {
            this._removeOption(item);
            if (!!this._textProvider)
                this._resetText();
        }
    }
    protected _onCommitChanges(item: ICollectionItem, isBegin: boolean, isRejected: boolean, status: ITEM_STATUS) {
        let self = this, oldVal: any, val: any, data: any;
        if (isBegin) {
            if (isRejected && status === ITEM_STATUS.Added) {
                return;
            }
            else if (!isRejected && status === ITEM_STATUS.Deleted) {
                return;
            }

            this._savedValue = this._getStringValue(item);
        }
        else {
            oldVal = this._savedValue;
            this._savedValue = checks.undefined;

            if (isRejected && status === ITEM_STATUS.Deleted) {
                this._addOption(item, true);
                return;
            }
            val = this._getStringValue(item);
            data = self._keyMap[item._key];
            if (oldVal !== val) {
                if (oldVal !== "") {
                    delete self._valMap[oldVal];
                }
                if (!!data && val !== "") {
                    self._valMap[val] = data;
                }
            }
            if (!!data) {
                data.op.text = self._getText(item, data.op.index);
            }
        }
    }
    protected _onOptionStateChanged(data: IMappedItem): string {
        if (!this._stateProvider)
            return "";
        return this._stateProvider.getCSS(data.item, data.op.index, parser.resolvePath(data.item, this.statePath));
    }
    private _bindDS() {
        let self = this, ds = this.dataSource;
        if (!ds) return;
        ds.addOnCollChanged(self._onDSCollectionChanged, self._objId, self);
        ds.addOnBeginEdit(function (sender, args) {
            self._onEdit(args.item, true, false);
        }, self._objId);
        ds.addOnEndEdit(function (sender, args) {
            self._onEdit(args.item, false, args.isCanceled);
        }, self._objId);
        ds.addOnStatusChanged(function (sender, args) {
            self._onStatusChanged(args.item, args.oldStatus);
        }, self._objId);
        ds.addOnCommitChanges(function (sender, args) {
            self._onCommitChanges(args.item, args.isBegin, args.isRejected, args.status);
        }, self._objId);
    }
    private _unbindDS() {
        let self = this, ds = this.dataSource;
        if (!ds) return;
        ds.removeNSHandlers(self._objId);
    }
    private _addOption(item: ICollectionItem, first: boolean) {
        if (this._isDestroyCalled)
            return null;
        let oOption: HTMLOptionElement, key = "", val: string, text: string;
        if (!!item) {
            key = item._key;
        }
        if (!!this._keyMap[key]) {
            return null;
        }
        let selEl = this.el;
        text = this._getText(item, selEl.options.length);
        val = this._getStringValue(item);
        oOption = document.createElement("option");
        oOption.text = text;
        oOption.value = key;
        let data: IMappedItem = { item: item, op: oOption };
        this._keyMap[key] = data;
        if (!!val)
            this._valMap[val] = data;
        if (!!first) {
            if (selEl.options.length < 2)
                selEl.add(oOption, null);
            else {
                let firstOp = <any>selEl.options[1];
                selEl.add(oOption, firstOp);
            }
        }
        else
            selEl.add(oOption, null);
        if (!!this.statePath && !!item) {
            item.addOnPropertyChange(this.statePath, this._fn_state, this._objId, this);
            this._fn_state(<IBaseObject>item);
        }
        return oOption;
    }
    private _mapByValue() {
        let self = this;
        this._valMap = {};
        coreUtils.forEachProp(this._keyMap, (key) => {
            let data = self._keyMap[key], val = self._getStringValue(data.item);
            if (!!val)
                self._valMap[val] = data;
        });
    }
    private _resetText() {
        let self = this;
        coreUtils.forEachProp(this._keyMap, (key) => {
            let data = self._keyMap[key];
            data.op.text = self._getText(data.item, data.op.index);
        });
    }
    private _removeOption(item: ICollectionItem) {
        if (this._isDestroyCalled)
            return;
        let key = "", data: IMappedItem, val: string;
        if (!!item) {
            key = item._key;
            data = this._keyMap[key];
            if (!data) {
                return;
            }
            item.removeNSHandlers(this._objId);
            this.el.remove(data.op.index);
            val = this._getStringValue(item);
            delete this._keyMap[key];
            if (!!val)
                delete this._valMap[val];
            if (this._prevSelected === item) {
                this._prevSelected = null;
            }
            if (this.selectedItem === item) {
                this.selectedItem = this._prevSelected;
            }
        }
    }
    private _clear(isDestroy: boolean) {
        let self = this;
        coreUtils.forEachProp(this._keyMap, (key) => {
            let data = self._keyMap[key];
            if (!!data.item)
                data.item.removeNSHandlers(self._objId);
        });
        this.el.options.length = 0;
        this._keyMap = {};
        this._valMap = {};
        this._prevSelected = null;
        if (!isDestroy) {
            this._addOption(null, false);
            this.selectedItem = null;
        }
        else
            this.selectedItem = null;
    }
    private _refresh() {
        let self = this, ds = this.dataSource, oldItem = this._selectedItem, tmp = self._tempValue;
        this._isRefreshing = true;
        try {
            this.clear();
            if (!!ds) {
                ds.forEach(function (item) {
                    self._addOption(item, false);
                });
                if (checks.isUndefined(tmp)) {
                    self.el.selectedIndex = self._findItemIndex(oldItem);
                }
                else {
                    oldItem = self.findItemByValue(tmp);
                    self.selectedItem = oldItem;
                    if (!oldItem)
                        self._tempValue = tmp;
                    else
                        self._tempValue = checks.undefined;
                }
            }

        } finally {
            self._isRefreshing = false;
        }
        self._onChanged();
        this.raiseEvent(LISTBOX_EVENTS.refreshed, {});
    }
    private _findItemIndex(item: ICollectionItem) {
        if (!item || item.getIsDestroyCalled())
            return 0;
        let data: IMappedItem = this._keyMap[item._key];
        if (!data)
            return 0;
        return data.op.index;
    }
    protected _setIsEnabled(el: HTMLSelectElement, v: boolean) {
        el.disabled = !v;
    }
    protected _getIsEnabled(el: HTMLSelectElement) {
        return !el.disabled;
    }
    clear() {
        this._clear(false);
    }
    findItemByValue(val: any): ICollectionItem {
        if (checks.isNt(val))
            return null;
        val = "" + val;
        let data: IMappedItem = this._valMap[val];
        if (!data)
            return null;
        return data.item;
    }
    getTextByValue(val: any): string {
        if (checks.isNt(val))
            return "";
        val = "" + val;
        let data: IMappedItem = this._valMap[val];
        if (!data)
            return "";
        else
            return data.op.text;
    }
    toString() {
        return "ListBox";
    }
    get dataSource() { return this._options.dataSource; }
    set dataSource(v) {
        if (this.dataSource !== v) {
            if (!!this.dataSource) {
                this._tempValue = this.selectedValue;
                this._unbindDS();
            }
            this._options.dataSource = v;
            if (!!this.dataSource) {
                this._bindDS();
            }
            this._refresh();
            if (!!this.dataSource)
                this._tempValue = checks.undefined;
            this.raisePropertyChanged(PROP_NAME.dataSource);
            this.raisePropertyChanged(PROP_NAME.selectedItem);
            this.raisePropertyChanged(PROP_NAME.selectedValue);
        }
    }
    get selectedValue() {
        if (!!this.dataSource)
            return this._getValue(this.selectedItem);
        else
            return checks.undefined;
    }
    set selectedValue(v) {
        let self = this;
        if (!!this.dataSource) {
            if (this.selectedValue !== v) {
                let item = self.findItemByValue(v);
                self.selectedItem = item;
                if (!checks.isUndefined(v) && !item)
                    self._tempValue = v;
                else
                    self._tempValue = checks.undefined;
            }
        }
        else {
            if (this._tempValue !== v) {
                this._selectedItem = null;
                this._tempValue = v;
                this.raisePropertyChanged(PROP_NAME.selectedItem);
                this.raisePropertyChanged(PROP_NAME.selectedValue);
            }
        }
    }
    get selectedItem() {
        if (!!this.dataSource)
            return this._selectedItem;
        else
            return checks.undefined;
    }
    set selectedItem(v: ICollectionItem) {
        if (this._selectedItem !== v) {
            if (!!this._selectedItem) {
                this._prevSelected = this._selectedItem;
            }
            this._selectedItem = v;
            this.el.selectedIndex = this._findItemIndex(this._selectedItem);
            this.raisePropertyChanged(PROP_NAME.selectedItem);
            this.raisePropertyChanged(PROP_NAME.selectedValue);
        }
    }
    get valuePath() { return this._options.valuePath; }
    set valuePath(v: string) {
        if (v !== this.valuePath) {
            this._options.valuePath = v;
            this._mapByValue();
            this.raisePropertyChanged(PROP_NAME.valuePath);
        }
    }
    get textPath() { return this._options.textPath; }
    set textPath(v: string) {
        if (v !== this.textPath) {
            this._options.textPath = v;
            this._resetText();
            this.raisePropertyChanged(PROP_NAME.textPath);
        }
    }
    get statePath() { return this._options.statePath; }
    get isEnabled() { return this._getIsEnabled(this.el); }
    set isEnabled(v) {
        if (v !== this.isEnabled) {
            this._setIsEnabled(this.el, v);
            this.raisePropertyChanged(PROP_NAME.isEnabled);
        }
    }
    get textProvider() { return this._textProvider; }
    set textProvider(v: IOptionTextProvider) {
        if (v !== this._textProvider) {
            this._textProvider = v;
            this.raisePropertyChanged(PROP_NAME.textProvider);
            this._resetText();
        }
    }
    get stateProvider() { return this._stateProvider; }
    set stateProvider(v: IOptionStateProvider) {
        if (v !== this._stateProvider) {
            this._stateProvider = v;
            this.raisePropertyChanged(PROP_NAME.stateProvider);
        }
    }
    get el() { return this._options.el; }
}

export interface IListBoxViewOptions extends IListBoxOptions, IViewOptions {
}

export class ListBoxElView extends BaseElView {
    private _listBox: ListBox;
 
    constructor(options: IListBoxViewOptions) {
        super(options);
        let self = this;
        self._listBox = new ListBox(<IListBoxConstructorOptions>options);
        self._listBox.addOnDestroyed(function () {
            self._listBox = null;
            self.raisePropertyChanged(PROP_NAME.listBox);
        }, this.uniqueID);
        self._listBox.addOnPropertyChange("*", function (sender, args) {
            switch (args.property) {
                case PROP_NAME.dataSource:
                case PROP_NAME.isEnabled:
                case PROP_NAME.selectedValue:
                case PROP_NAME.selectedItem:
                case PROP_NAME.valuePath:
                case PROP_NAME.textPath:
                case PROP_NAME.textProvider:
                case PROP_NAME.stateProvider:
                    self.raisePropertyChanged(args.property);
                    break;
            }
        }, self.uniqueID);
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        if (!!this._listBox && !this._listBox.getIsDestroyCalled()) {
            this._listBox.destroy();
        }
        this._listBox = null;
        super.destroy();
    }
    toString() {
        return "ListBoxElView";
    }
    get isEnabled() { return !this.$el.prop("disabled"); }
    set isEnabled(v: boolean) {
        v = !!v;
        if (v !== this.isEnabled) {
            this.$el.prop("disabled", !v);
            this.raisePropertyChanged(PROP_NAME.isEnabled);
        }
    }
    get dataSource() {
        if (this.getIsDestroyCalled())
            return checks.undefined;
        return this._listBox.dataSource;
    }
    set dataSource(v) {
        let self = this;
        if (self.dataSource !== v) {
            self._listBox.dataSource = v;
        }
    }
    get selectedValue() {
        if (this.getIsDestroyCalled())
            return checks.undefined;
        return this._listBox.selectedValue;
    }
    set selectedValue(v) {
        if (this._listBox.selectedValue !== v) {
            this._listBox.selectedValue = v;
        }
    }
    get selectedItem() {
        if (this.getIsDestroyCalled())
            return checks.undefined;
        return this._listBox.selectedItem;
    }
    set selectedItem(v: ICollectionItem) {
        this._listBox.selectedItem = v;
    }
    get valuePath() { return this._listBox.valuePath; }
    set valuePath(v: string) {
        this._listBox.valuePath = v;
    }
    get textPath() { return this._listBox.textPath; }
    set textPath(v: string) {
        this._listBox.textPath = v;
    }
    get textProvider() { return this._listBox.textProvider; }
    set textProvider(v: IOptionTextProvider) {
        this._listBox.textProvider = v;
    }
    get stateProvider() { return this._listBox.stateProvider; }
    set stateProvider(v: IOptionStateProvider) {
        this._listBox.stateProvider = v;
    }
    get listBox() { return this._listBox; }
}


export interface ILookupOptions {
    dataSource: string;
    valuePath: string;
    textPath: string;
    statePath?: string;
}

let LOOKUP_EVENTS = {
    obj_created: "object_created",
    obj_needed: "object_needed"
};
export type TObjCreatedArgs = { objectKey: string; object: IBaseObject; isCachedExternally: boolean; };
export type TObjNeededArgs = { objectKey: string; object: IBaseObject; };

export class LookupContent extends BasicContent implements IExternallyCachable {
    private _spanView: SpanElView;
    private _valBinding: IBinding;
    private _listBinding: IBinding;
    private _listBoxElView: ListBoxElView;
    private _isListBoxCachedExternally: boolean;
    private _value: any;
    private _objId: string;

    constructor(options: IConstructorContentOptions) {
        if (options.contentOptions.name !== "lookup") {
            throw new Error(strUtils.format(ERRS.ERR_ASSERTION_FAILED, "contentOptions.name === 'lookup'"));
        }
        super(options);
        this._spanView = null;
        this._listBoxElView = null;
        this._isListBoxCachedExternally = false;
        this._valBinding = null;
        this._listBinding = null;
        this._value = null;
        this._objId = "lku" + coreUtils.getNewID();
    }
    protected init() {
        if (!!this._options.initContentFn) {
            this._options.initContentFn(this);
        }
    }
    protected _getEventNames() {
        let base_events = super._getEventNames();
        return [LOOKUP_EVENTS.obj_created, LOOKUP_EVENTS.obj_needed].concat(base_events);
    }
    addOnObjectCreated(fn: (sender: any, args: TObjCreatedArgs) => void, nmspace?: string) {
        this._addHandler(LOOKUP_EVENTS.obj_created, fn, nmspace);
    }
    removeOnObjectCreated(nmspace?: string) {
        this._removeHandler(LOOKUP_EVENTS.obj_created, nmspace);
    }
    addOnObjectNeeded(fn: (sender: any, args: TObjNeededArgs) => void, nmspace?: string) {
        this._addHandler(LOOKUP_EVENTS.obj_needed, fn, nmspace);
    }
    removeOnObjectNeeded(nmspace?: string) {
        this._removeHandler(LOOKUP_EVENTS.obj_needed, nmspace);
    }
    protected getListBoxElView(): ListBoxElView {
        if (!!this._listBoxElView)
            return this._listBoxElView;
        const lookUpOptions: ILookupOptions = this._options.options, objectKey = "listBoxElView";

        let args1: TObjNeededArgs = { objectKey: objectKey, object: null };
        //try get externally externally cached listBox
        this.raiseEvent(LOOKUP_EVENTS.obj_needed, args1);
        if (!!args1.object) {
            this._isListBoxCachedExternally = true;
            this._listBoxElView = <ListBoxElView>args1.object;
        }
        if (!!this._listBoxElView) {
            this._listBoxElView.listBox.addOnRefreshed(this.onListRefreshed, this.uniqueID, this);
            return this._listBoxElView;
        }
        //IF NO ELEMENT VIEW in THE CACHE - proceed creating new ElView
        let listBoxElView = this.createListBoxElView(lookUpOptions);
        let args2: TObjCreatedArgs = { objectKey: objectKey, object: listBoxElView, isCachedExternally: false };
        //this allows to cache listBox externally
        this.raiseEvent(LOOKUP_EVENTS.obj_created, args2);
        this._isListBoxCachedExternally = args2.isCachedExternally;
        this._listBoxElView = listBoxElView;
        this._listBoxElView.listBox.addOnRefreshed(this.onListRefreshed, this.uniqueID, this);
        return this._listBoxElView;
    }
    protected onListRefreshed(): void {
        this.updateTextValue();
    }
    protected createListBoxElView(lookUpOptions: ILookupOptions): ListBoxElView {
        let options = {
            valuePath: lookUpOptions.valuePath,
            textPath: lookUpOptions.textPath,
            statePath: (!lookUpOptions.statePath) ? null : lookUpOptions.statePath,
            app: this.app,
            el: document.createElement("select")
        }, el = options.el, dataSource = parser.resolvePath(this.app, lookUpOptions.dataSource);
        el.setAttribute("size", "1");
        let elView = new ListBoxElView(options);
        elView.dataSource = dataSource;
        return elView;
    }
    protected updateTextValue() {
        let spanView = this.getSpanView();
        spanView.value = this.getLookupText();
    }
    protected getLookupText() {
        let listBoxView = this.getListBoxElView();
        return listBoxView.listBox.getTextByValue(this.value);
    }
    protected getSpanView() {
        if (!!this._spanView) {
            return this._spanView;
        }
        let el = document.createElement("span"), displayInfo = this._options.displayInfo;
        if (!!displayInfo && !!displayInfo.displayCss) {
            utils.dom.addClass([el], displayInfo.displayCss);
        }
        let spanView = new SpanElView({ app: this.app, el: el });
        this._spanView = spanView;
        return this._spanView;
    }
    protected render() {
        this.cleanUp();
        this.createTargetElement();
        this._parentEl.appendChild(this._el);
    }
    protected createTargetElement(): BaseElView {
        let tgt: BaseElView, el: HTMLElement, selectView: ListBoxElView, spanView: SpanElView;
        if (this.isEditing && this.getIsCanBeEdited()) {
            selectView = this.getListBoxElView();
            this._listBinding = this.bindToList(selectView);
            tgt = selectView;
        }
        else {
            spanView = this.getSpanView();
            this._valBinding = this.bindToValue();
            tgt = spanView;
        }
        this._el = tgt.el;
        this.updateCss();
        return tgt;
    }
    protected cleanUp() {
        if (!!this._el) {
            utils.dom.removeNode(this._el);
            this._el = null;
        }
        if (!!this._listBinding) {
            this._listBinding.destroy();
            this._listBinding = null;
        }
        if (!!this._valBinding) {
            this._valBinding.destroy();
            this._valBinding = null;
        }

        if (!!this._listBoxElView && this._isListBoxCachedExternally) {
            if (!this._listBoxElView.getIsDestroyCalled())
                this._listBoxElView.listBox.removeOnRefreshed(this.uniqueID);
            this._listBoxElView = null;
        }
    }
    protected updateBindingSource() {
        if (!!this._valBinding) {
            this._valBinding.source = this._dataContext;
        }
        if (!!this._listBinding) {
            this._listBinding.source = this._dataContext;
        }
    }
    protected bindToValue() {
        if (!this._options.fieldName)
            return null;

        let options: IBindingOptions = {
            target: this, source: this._dataContext,
            targetPath: PROP_NAME.value, sourcePath: this._options.fieldName,
            mode: BINDING_MODE.OneWay,
            converter: null, converterParam: null, isSourceFixed: false
        };
        return this.app.bind(options);
    }
    protected bindToList(selectView: ListBoxElView) {
        if (!this._options.fieldName)
            return null;

        let options: IBindingOptions = {
            target: selectView, source: this._dataContext,
            targetPath: PROP_NAME.selectedValue, sourcePath: this._options.fieldName,
            mode: BINDING_MODE.TwoWay,
            converter: null, converterParam: null, isSourceFixed: false
        };
        return this.app.bind(options);
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this.cleanUp();
        if (!!this._listBoxElView && !this._listBoxElView.getIsDestroyCalled()) {
            this._listBoxElView.listBox.removeOnRefreshed(this.uniqueID);
            if (!this._isListBoxCachedExternally)
                this._listBoxElView.destroy();
        }
        this._listBoxElView = null;
        if (!!this._spanView) {
            this._spanView.destroy();
        }
        this._spanView = null;
        super.destroy();
    }
    toString() {
        return "LookupContent";
    }
    get value() { return this._value; }
    set value(v) {
        if (this._value !== v) {
            this._value = v;
            this.raisePropertyChanged(PROP_NAME.value);
        }
        this.updateTextValue();
    }
    get uniqueID() { return this._objId; }
}

export class ContentFactory implements IContentFactory {
    private _nextFactory: IContentFactory;

    constructor(nextFactory?: IContentFactory) {
        this._nextFactory = nextFactory;
    }

    getContentType(options: IContentOptions): IContentConstructor {
        if (options.name === "lookup") {
            return LookupContent;
        }

        if (!this._nextFactory)
            throw new Error(ERRS.ERR_BINDING_CONTENT_NOT_FOUND);
        else
            return this._nextFactory.getContentType(options);
    }
    createContent(options: IConstructorContentOptions): IContent {
        let contentType = this.getContentType(options);
        return new contentType(options);
    }
    isExternallyCachable(contentType: IContentConstructor): boolean {
        if (LookupContent === contentType)
            return true;
        return this._nextFactory.isExternallyCachable(contentType);
    }
}

contentFactories.addFactory((nextFactory?: IContentFactory) => {
    return new ContentFactory(nextFactory);
});
bootstrap.registerElView("select", ListBoxElView);