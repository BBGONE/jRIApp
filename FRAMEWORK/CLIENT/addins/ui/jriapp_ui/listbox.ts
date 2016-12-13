/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    Utils, BaseObject, IBaseObject, LocaleERRS as ERRS, TEventHandler
} from "jriapp_shared";
import { $ } from "jriapp/utils/jquery";
import {
    ITEM_STATUS, COLL_CHANGE_TYPE
} from "jriapp_shared/collection/const";
import {
    ICollection, ICollectionItem, ICollChangedArgs
} from "jriapp_shared/collection/int";
import { IViewOptions } from "jriapp/int";
import { bootstrap } from "jriapp/bootstrap";
import { BaseElView } from "./baseview";

const utils = Utils, doc = utils.dom.document, sys = utils.sys,
    checks = utils.check, strUtils = utils.str, coreUtils = utils.core,
    boot = bootstrap, win = utils.dom.window;

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
    private _fn_state: (data: IMappedItem) => void;
    private _textProvider: IOptionTextProvider;
    private _stateProvider: IOptionStateProvider;

    constructor(options: IListBoxConstructorOptions) {
        super();
        const self = this;
        options = coreUtils.extend(
            {
                el: null,
                dataSource: null,
                valuePath: null,
                textPath: null,
                statePath: null
            }, options);
        if (!!options.dataSource && !sys.isCollection(options.dataSource))
            throw new Error(ERRS.ERR_LISTBOX_DATASRC_INVALID);
        this._$el = $(options.el);
        this._options = options;
        this._objId = coreUtils.getNewID("lst");
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
        this.tempValue = checks.undefined;
        const ds = this._options.dataSource;
        this._options.dataSource = null;
        this._fn_state = (data: IMappedItem) => {
            if (!data || !data.item || data.item.getIsDestroyCalled())
                return;
            const item = data.item, path = self.statePath,
                val = !path ? null : sys.resolvePath(item, path), spr = self._stateProvider;
            data.op.className = !spr ? "" : spr.getCSS(item, data.op.index, val);
        };
        this.dataSource = ds;
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this._unbindDS();
        this._$el.off("." + this._objId);
        this._clear(true);
        this._$el = null;
        this.tempValue = checks.undefined;
        this._selectedItem = null;
        this._prevSelected = null;
        this._savedValue = null;
        this._options = <any>{};
        this._textProvider = null;
        this._stateProvider = null;
        super.destroy();
    }
    protected _getEventNames() {
        const base_events = super._getEventNames();
        const events = Object.keys(LISTBOX_EVENTS).map((key, i, arr) => {
            return <string>(<any>LISTBOX_EVENTS)[key];
        });
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
        const v = this._getValue(item);
        if (checks.isNt(v))
            return "";
        return "" + v;
    }
    protected _getValue(item: ICollectionItem): any {
        if (!item) {
            return checks.undefined;
        }
        if (!!this._options.valuePath) {
            return sys.resolvePath(item, this._options.valuePath);
        }
        else {
            return checks.undefined;
        }
    }
    protected _getText(item: ICollectionItem, index: number): string {
        let res = "";
        if (!item)
            return res;

        if (!!this._options.textPath) {
            let t = sys.resolvePath(item, this._options.textPath);
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
        const self = this;
        let data: any;
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
        const self = this;
        let key: string, data: IMappedItem, oldVal: string, val: string;
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
    private _bindDS() {
        const self = this, ds = this.dataSource;
        if (!ds)
            return;
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
        const self = this, ds = this.dataSource;
        if (!ds)
            return;
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
        const selEl = this.el;
        text = this._getText(item, selEl.options.length);
        val = this._getStringValue(item);
        oOption = doc.createElement("option");
        oOption.text = text;
        oOption.value = key;
        const data: IMappedItem = { item: item, op: oOption };
        this._keyMap[key] = data;
        if (!!val) {
            this._valMap[val] = data;
        }
        if (!!first) {
            if (selEl.options.length < 2)
                selEl.add(oOption, null);
            else {
                let firstOp = <any>selEl.options[1];
                selEl.add(oOption, firstOp);
            }
        }
        else {
            selEl.add(oOption, null);
        }

        if (!!item) {
            if (!!this.statePath) {
                item.addOnPropertyChange(this.statePath, this._fn_state, this._objId);
            }
            this._fn_state(data);
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
        const self = this;
        if (self.getIsDestroyCalled())
            return;
        coreUtils.forEachProp(this._keyMap, (key) => {
            const data = self._keyMap[key];
            data.op.text = self._getText(data.item, data.op.index);
        });
    }
    private _resetState() {
        const self = this;
        if (self.getIsDestroyCalled())
            return;
        coreUtils.forEachProp(this._keyMap, (key) => {
            self._fn_state(self._keyMap[key]);
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
        const self = this;
        coreUtils.forEachProp(this._keyMap, (key) => {
            const data = self._keyMap[key];
            if (!!data.item) {
                data.item.removeNSHandlers(self._objId);
            }
        });
        this.el.options.length = 0;
        this._keyMap = {};
        this._valMap = {};
        this._prevSelected = null;
        if (!isDestroy) {
            this._addOption(null, false);
            this.selectedItem = null;
        }
        else {
            this.selectedItem = null;
        }
    }
    private _refresh(): void {
        const self = this, ds = this.dataSource, tmp = self.tempValue;
        let oldItem = this._selectedItem;
        this._isRefreshing = true;
        try {
            this.clear();
            if (!!ds) {
                ds.forEach(function (item) {
                    self._addOption(item, false);
                });

                if (!oldItem && !checks.isNt(tmp)) {
                    oldItem = self.findItemByValue(tmp);
                    self.selectedItem = oldItem;
                    self.tempValue = (!oldItem) ? tmp : checks.undefined;
                }
                else {
                    self.el.selectedIndex = self._findItemIndex(oldItem);
                    self.tempValue = checks.undefined;
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
        const data: IMappedItem = this._keyMap[item._key];
        return (!data)? 0: data.op.index;
    }
    protected _setIsEnabled(el: HTMLSelectElement, v: boolean) {
        el.disabled = !v;
    }
    protected _getIsEnabled(el: HTMLSelectElement) {
        return !el.disabled;
    }
    protected get tempValue() {
        return this._tempValue;
    }
    protected set tempValue(v) {
        if (this._tempValue !== v) {
            this._tempValue = v;
        }
    }
    clear() {
        this._clear(false);
    }
    findItemByValue(val: any): ICollectionItem {
        if (checks.isNt(val))
            return null;
        val = "" + val;
        const data: IMappedItem = this._valMap[val];
        return (!data) ? null : data.item;
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
            if (checks.isUndefined(this.tempValue) && !!this.dataSource) {
                this.tempValue = this.selectedValue;
            }

            this._unbindDS();

            this._options.dataSource = v;

            utils.queue.queueRequest(() => {
                if (this.getIsDestroyCalled())
                    return;
                this._bindDS();
                this._refresh();
                this.raisePropertyChanged(PROP_NAME.selectedItem);
                this.raisePropertyChanged(PROP_NAME.selectedValue);
            });

            this.raisePropertyChanged(PROP_NAME.dataSource);
        }
    }
    get selectedValue() {
        if (!!this.dataSource) {
            return this._getValue(this.selectedItem);
        }
        else {
            return checks.undefined;
        }
    }
    set selectedValue(v) {
        const self = this;
        if (!!this.dataSource) {
            if (this.selectedValue !== v) {
                const item = self.findItemByValue(v);
                self.selectedItem = item;
                if (!checks.isUndefined(v) && !item)
                    self.tempValue = v;
                else
                    self.tempValue = checks.undefined;
            }
        }
        else {
            if (this.tempValue !== v) {
                this._selectedItem = null;
                this.tempValue = v;
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
            utils.queue.queueRequest(() => {
                this._resetText();
            });
        }
    }
    get stateProvider() { return this._stateProvider; }
    set stateProvider(v: IOptionStateProvider) {
        if (v !== this._stateProvider) {
            this._stateProvider = v;
            this.raisePropertyChanged(PROP_NAME.stateProvider);
            utils.queue.queueRequest(() => {
                this._resetState();
            });
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
    get dataSource(): ICollection<ICollectionItem> {
        return this._listBox.dataSource;
    }
    set dataSource(v: ICollection<ICollectionItem>) {
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


boot.registerElView("select", ListBoxElView);