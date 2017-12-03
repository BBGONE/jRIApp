/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    Utils, BaseObject, LocaleERRS as ERRS, TEventHandler, Debounce
} from "jriapp_shared";
import { DomUtils } from "jriapp/utils/dom";
import {
    ITEM_STATUS, COLL_CHANGE_TYPE
} from "jriapp_shared/collection/const";
import {
    ICollection, ICollectionItem, ICollChangedArgs
} from "jriapp_shared/collection/int";
import { IViewOptions } from "jriapp/int";
import { bootstrap } from "jriapp/bootstrap";
import { BaseElView } from "./baseview";

const utils = Utils, dom = DomUtils, doc = dom.document, sys = utils.sys,
    checks = utils.check, coreUtils = utils.core, boot = bootstrap;

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
    emptyOptionText?: string;
}

export interface IListBoxConstructorOptions extends IListBoxOptions {
    el: HTMLSelectElement;
    dataSource: ICollection<ICollectionItem>;
}
export interface IMappedItem {
    item: ICollectionItem;
    op: HTMLOptionElement;
}

const enum PROP_NAME {
    dataSource = "dataSource",
    selectedItem = "selectedItem",
    selectedValue = "selectedValue",
    valuePath = "valuePath",
    textPath = "textPath",
    isEnabled = "isEnabled",
    listBox = "listBox",
    value = "value",
    textProvider = "textProvider",
    stateProvider = "stateProvider"
}

const enum LISTBOX_EVENTS {
    refreshed = "refreshed"
}

 function fn_Str(v: any): string {
    return (checks.isNt(v)) ? "" : ("" + v);
 }

export class ListBox extends BaseObject {
    private _el: HTMLSelectElement;
    private _objId: string;
    private _isRefreshing: boolean;
    private _selectedValue: any;
    private _keyMap: { [key: string]: IMappedItem; };
    private _valMap: { [val: string]: IMappedItem; };
    private _options: IListBoxConstructorOptions;
    private _fnState: (data: IMappedItem) => void;
    private _textProvider: IOptionTextProvider;
    private _stateProvider: IOptionStateProvider;
    private _savedVal: any;
    private _dsDebounce: Debounce;
    private _txtDebounce: Debounce;
    private _stDebounce: Debounce;
    private _changeDebounce: Debounce;
    private _fnCheckChanges: () => void;
    private _isDSFilled: boolean;

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
        if (!!options.dataSource && !sys.isCollection(options.dataSource)) {
            throw new Error(ERRS.ERR_LISTBOX_DATASRC_INVALID);
        }
        this._el = options.el;
        this._options = options;
        this._objId = coreUtils.getNewID("lst");
        this._isDSFilled = false;
        dom.events.on(this.el, "change", (e) => {
            e.stopPropagation();
            if (self._isRefreshing) {
                return;
            }
            self._onChanged();
        }, this._objId);
        this._textProvider = null;
        this._stateProvider = null;
        this._isRefreshing = false;
        this._selectedValue = null;
        this._dsDebounce = new Debounce();
        this._stDebounce = new Debounce();
        this._txtDebounce = new Debounce();
        this._changeDebounce = new Debounce();
        this._keyMap = {};
        this._valMap = {};
        this._savedVal = checks.undefined;
        this._fnState = (data: IMappedItem) => {
            if (!data || !data.item || data.item.getIsStateDirty()) {
                return;
            }
            const item = data.item, path = self.statePath,
                val = !path ? null : sys.resolvePath(item, path), spr = self._stateProvider;
            data.op.className = !spr ? "" : spr.getCSS(item, data.op.index, val);
        };

        const ds = this._options.dataSource;
        this._setDataSource(ds);
    }
    dispose() {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        this._dsDebounce.dispose();
        this._stDebounce.dispose();
        this._txtDebounce.dispose();
        this._changeDebounce.dispose();
        this._fnCheckChanges = null;
        this._unbindDS();
        dom.events.offNS(this._el, this._objId);
        this._clear();
        this._el = null;
        this._selectedValue = checks.undefined;
        this._savedVal = checks.undefined;
        this._options = <any>{};
        this._textProvider = null;
        this._stateProvider = null;
        this._isDSFilled = false;
        super.dispose();
    }
    addOnRefreshed(fn: TEventHandler<ListBox, {}>, nmspace?: string, context?: any) {
        this.objEvents.on(LISTBOX_EVENTS.refreshed, fn, nmspace, context);
    }
    offOnRefreshed(nmspace?: string) {
        this.objEvents.off(LISTBOX_EVENTS.refreshed, nmspace);
    }
    protected _onChanged() {
        const data: IMappedItem = this.getByIndex(this.selectedIndex);
        if (!data) {
            this.selectedValue = null;
            return;
        }

        const newVal = this._getValue(data.item);
        this.selectedValue = newVal;
    }
    protected _getValue(item: ICollectionItem): any {
        if (!item) {
            return null;
        }

        if (!!this._options.valuePath) {
            return sys.resolvePath(item, this._options.valuePath);
        } else {
            return null;
        }
    }
    protected _getText(item: ICollectionItem, index: number): string {
        let res = "";
        if (!item) {
            return res;
        }

        if (!!this._options.textPath) {
            const t = sys.resolvePath(item, this._options.textPath);
            res = fn_Str(t);
        } else {
            res = fn_Str(this._getValue(item));
        }

        return (!this._textProvider) ? res : this._textProvider.getText(item, index, res);
    }
    protected _onDSCollectionChanged(sender: any, args: ICollChangedArgs<ICollectionItem>) {
        const self = this;
        this.setChanges();
        try {
            switch (args.changeType) {
                case COLL_CHANGE_TYPE.Reset:
                    {
                        this._refresh();
                    }
                    break;
                case COLL_CHANGE_TYPE.Add:
                    {
                        args.items.forEach((item) => {
                            self._addOption(item, item._aspect.isNew);
                        });
                    }
                    break;
                case COLL_CHANGE_TYPE.Remove:
                    {
                        args.items.forEach((item) => {
                            self._removeOption(item);
                        });
                        if (!!self._textProvider) {
                            self._resetText();
                        }
                    }
                    break;
                case COLL_CHANGE_TYPE.Remap:
                    {
                        const data = self._keyMap[args.old_key];
                        if (!!data) {
                            delete self._keyMap[args.old_key];
                            self._keyMap[args.new_key] = data;
                            data.op.value = args.new_key;
                        }
                    }
                    break;
            }
        } finally {
            this.checkChanges();
        }
    }
    protected _onEdit(item: ICollectionItem, isBegin: boolean, isCanceled: boolean) {
        const self = this;
        if (isBegin) {
            this.setChanges();
            this._savedVal = this._getValue(item);
        } else {
            try {
                if (!isCanceled) {
                    const oldVal = this._savedVal;
                    this._savedVal = checks.undefined;
                    const key = item._key, data = self._keyMap[key];
                    if (!!data) {
                        data.op.text = self._getText(item, data.op.index);
                        const val = this._getValue(item);
                        if (oldVal !== val) {
                            if (!checks.isNt(oldVal)) {
                                delete self._valMap[fn_Str(oldVal)];
                            }
                            if (!checks.isNt(val)) {
                                self._valMap[fn_Str(val)] = data;
                            }
                        }
                    } else {
                        if (!checks.isNt(oldVal)) {
                            delete self._valMap[fn_Str(oldVal)];
                        }
                    }
                }
            } finally {
                this.checkChanges();
            }
        }
    }
    protected _onStatusChanged(item: ICollectionItem, oldStatus: ITEM_STATUS) {
        const newStatus = item._aspect.status;
        this.setChanges();
        if (newStatus === ITEM_STATUS.Deleted) {
            this._removeOption(item);
            if (!!this._textProvider) {
                // need to reset text due to the index changes
                this._resetText();
            }
        }
        this.checkChanges();
    }
    protected _onCommitChanges(item: ICollectionItem, isBegin: boolean, isRejected: boolean, status: ITEM_STATUS) {
        const self = this;
        if (isBegin) {
            this.setChanges();

            if (isRejected && status === ITEM_STATUS.Added) {
                return;
            } else if (!isRejected && status === ITEM_STATUS.Deleted) {
                return;
            }

            this._savedVal = this._getValue(item);
        } else {
            const oldVal = this._savedVal;
            this._savedVal = checks.undefined;
            // delete is rejected
            if (isRejected && status === ITEM_STATUS.Deleted) {
                this._addOption(item, true);
                this.checkChanges();
                return;
            }

            try {
                const val = this._getValue(item), data = self._keyMap[item._key];
                if (oldVal !== val) {
                    if (!checks.isNt(oldVal)) {
                        delete self._valMap[fn_Str(oldVal)];
                    }

                    if (!!data && !checks.isNt(val)) {
                        self._valMap[fn_Str(val)] = data;
                    }
                }

                if (!!data) {
                    data.op.text = self._getText(item, data.op.index);
                }
            } finally {
                this.checkChanges();
            }
        }
    }
    private _bindDS() {
        const self = this, ds = this.dataSource;
        if (!ds) {
            return;
        }
        ds.addOnCollChanged(self._onDSCollectionChanged, self._objId, self);
        ds.addOnBeginEdit((sender, args) => {
            self._onEdit(args.item, true, false);
        }, self._objId);
        ds.addOnEndEdit((sender, args) => {
            self._onEdit(args.item, false, args.isCanceled);
        }, self._objId);
        ds.addOnStatusChanged((sender, args) => {
            self._onStatusChanged(args.item, args.oldStatus);
        }, self._objId);
        ds.addOnCommitChanges((sender, args) => {
            self._onCommitChanges(args.item, args.isBegin, args.isRejected, args.status);
        }, self._objId);
    }
    private _unbindDS() {
        const self = this, ds = this.dataSource;
        if (!ds) {
            return;
        }
        ds.objEvents.offNS(self._objId);
    }
    private _addOption(item: ICollectionItem, first: boolean): IMappedItem {
        const key = !item ? "" : item._key;
        if (!!this._keyMap[key]) {
            return null;
        }

        const selEl = this.el;
        let text = "";
        if (!item) {
            if (checks.isString(this._options.emptyOptionText)) {
                text = this._options.emptyOptionText;
            }
        } else {
           text = this._getText(item, selEl.options.length);
        }
        const val = fn_Str(this._getValue(item));
        const oOption = doc.createElement("option");
        oOption.text = text;
        oOption.value = key;
        const data: IMappedItem = { item: item, op: oOption };
        this._keyMap[key] = data;
        if (!!val) {
            this._valMap[val] = data;
        }
        if (!!first) {
            if (selEl.options.length < 2) {
                selEl.add(oOption, null);
            } else {
                const firstOp = <any>selEl.options[1];
                selEl.add(oOption, firstOp);
            }
        } else {
            selEl.add(oOption, null);
        }

        if (!!item) {
            if (!!this.statePath) {
                item.objEvents.onProp(this.statePath, this._fnState, this._objId);
            }
            this._fnState(data);
        }

        return data;
    }
    private _mapByValue() {
        const self = this;
        this._valMap = {};
        coreUtils.forEachProp(this._keyMap, (key) => {
            const data = self._keyMap[key], val = fn_Str(self._getValue(data.item));
            if (!!val) {
                self._valMap[val] = data;
            }
        });
    }
    private _resetText() {
        const self = this;
        coreUtils.forEachProp(this._keyMap, (key) => {
            const data = self._keyMap[key];
            data.op.text = self._getText(data.item, data.op.index);
        });
    }
    private _resetState() {
        const self = this;
        coreUtils.forEachProp(this._keyMap, (key) => {
            self._fnState(self._keyMap[key]);
        });
    }
    private _removeOption(item: ICollectionItem) {
        if (!!item) {
            const key = item._key, data = this._keyMap[key];
            if (!data) {
                return;
            }

            item.objEvents.offNS(this._objId);
            this.el.remove(data.op.index);
            const val = fn_Str(this._getValue(item));
            delete this._keyMap[key];
            if (!!val) {
                delete this._valMap[val];
            }

            const curVal = this.getByIndex(this.selectedIndex);
            const v = (!curVal ? null : this._getValue(curVal.item));
            this._selectedValue = v;
            this.updateSelected(v);
        }
    }
    private _clear() {
        const self = this, keys = Object.keys(self._keyMap);
        keys.forEach((key) => {
            const data = self._keyMap[key];
            if (!!data && !!data.item) {
                data.item.objEvents.offNS(self._objId);
            }
        });
        this.el.options.length = 0;
        this._keyMap = {};
        this._valMap = {};
    }
    private _refresh(): void {
        const self = this, ds = this.dataSource;
        this.setChanges();
        this._isRefreshing = true;
        try {
            this._clear();
            this._addOption(null, false);
            let cnt = 0;
            if (!!ds) {
                ds.forEach((item) => {
                    self._addOption(item, false);
                    ++cnt;
                });
            }

            if (this._isDSFilled && !checks.isNt(this._selectedValue) && !this.getByValue(this._selectedValue)) {
                this.selectedValue = null;
            } else {
                self.updateSelected(this._selectedValue);
            }

            if (cnt > 0) {
                this._isDSFilled = true;
            }

        } finally {
            self._isRefreshing = false;
            this.checkChanges();
        }

        this.objEvents.raise(LISTBOX_EVENTS.refreshed, {});
    }
    protected getItemIndex(item: ICollectionItem) {
        if (!item || item.getIsStateDirty()) {
            return -1;
        }
        const data: IMappedItem = this._keyMap[item._key];
        return (!data) ? -1 : data.op.index;
    }
    protected getByValue(val: any): IMappedItem {
        if (checks.isNt(val)) {
            return null;
        }
        const key = fn_Str(val);
        const data: IMappedItem = this._valMap[key];
        return (!data) ? null : data;
    }
    protected getByIndex(index: number): IMappedItem {
        if (index >= 0 && index < this.el.length) {
            const op: HTMLOptionElement = <HTMLOptionElement>this.el.options[index], key = op.value;
            return this._keyMap[key];
        }
        return null;
    }
    protected updateSelected(v: any) {
        const data: IMappedItem = (checks.isNt(v) ? null : this.getByValue(v));
        const index = (!data ? 0 : data.op.index), oldRefreshing = this._isRefreshing;
        this._isRefreshing = true;
        try {
            this.selectedIndex = index;
        } finally {
            this._isRefreshing = oldRefreshing;
        }
    }
    protected setChanges(): void {
        // if already set then return
        if (!!this._fnCheckChanges) {
            return;
        }
        const self = this, prevVal = fn_Str(self.selectedValue), prevItem = self.selectedItem;
        this._fnCheckChanges = () => {
            // reset function
            self._fnCheckChanges = null;
            const newVal = fn_Str(self.selectedValue), newItem = self.selectedItem;
            if (prevVal !== newVal) {
                self.objEvents.raiseProp(PROP_NAME.selectedValue);
            }
            if (prevItem !== newItem) {
                self.objEvents.raiseProp(PROP_NAME.selectedItem);
            }
        };
    }
    protected checkChanges(): void {
        this._changeDebounce.enque(() => {
            const fn = this._fnCheckChanges;
            this._fnCheckChanges = null;
            if (!!fn) {
                fn();
            }
        });
    }
    protected _setIsEnabled(el: HTMLSelectElement, v: boolean) {
        el.disabled = !v;
    }
    protected _getIsEnabled(el: HTMLSelectElement) {
        return !el.disabled;
    }
    protected _setDataSource(v: ICollection<ICollectionItem>) {
        this._isDSFilled = false;
        this.setChanges();
        this._unbindDS();
        this._options.dataSource = v;
        this._dsDebounce.enque(() => {
            try {
                const ds = this._options.dataSource;
                this._txtDebounce.cancel();
                this._stDebounce.cancel();

                if (!!ds && !ds.getIsStateDirty()) {
                    this._bindDS();
                    this._refresh();
                } else {
                    this._clear();
                    this._addOption(null, false);
                }
            } finally {
                this.checkChanges();
            }
        });
    }
    protected get selectedIndex(): number {
        return (!this.el || this.el.length == 0) ? -1 : this.el.selectedIndex;
    }
    protected set selectedIndex(v: number) {
        if (!!this.el && this.el.length > v && this.selectedIndex !== v) {
            this.el.selectedIndex = v;
        }
    }
    getText(val: any): string {
        const data: IMappedItem = this.getByValue(val);
        return (!data) ? "" : data.op.text;
    }
    toString() {
        return "ListBox";
    }
    get dataSource() {
        return this._options.dataSource;
    }
    set dataSource(v) {
        if (this.dataSource !== v) {
            this._setDataSource(v);
            this.objEvents.raiseProp(PROP_NAME.dataSource);
        }
    }
    get selectedValue() {
        return (!checks.isNt(this._selectedValue) && !this.getByValue(this._selectedValue)) ? checks.undefined : this._selectedValue;
    }
    set selectedValue(v) {
        if (this._selectedValue !== v) {
            const oldItem = this.selectedItem;
            this._selectedValue = v;
            this.updateSelected(v);
            this._fnCheckChanges = null;
            this.objEvents.raiseProp(PROP_NAME.selectedValue);
            if (oldItem !== this.selectedItem) {
                this.objEvents.raiseProp(PROP_NAME.selectedItem);
            }
        }
    }
    get selectedItem() {
        const item: IMappedItem = this.getByValue(this._selectedValue);
        return (!item ? null : item.item);
    }
    set selectedItem(v: ICollectionItem) {
        const newVal = this._getValue(v), oldItem = this.selectedItem;
        if (this._selectedValue !== newVal) {
            this._selectedValue = newVal;
            const item = this.getByValue(newVal);
            this.selectedIndex = (!item ? 0 : item.op.index);
            this._fnCheckChanges = null;
            this.objEvents.raiseProp(PROP_NAME.selectedValue);
            if (oldItem !== this.selectedItem) {
                this.objEvents.raiseProp(PROP_NAME.selectedItem);
            }
        }
    }
    get valuePath() { return this._options.valuePath; }
    set valuePath(v: string) {
        if (v !== this.valuePath) {
            this._options.valuePath = v;
            this._mapByValue();
            this.objEvents.raiseProp(PROP_NAME.valuePath);
        }
    }
    get textPath() { return this._options.textPath; }
    set textPath(v: string) {
        if (v !== this.textPath) {
            this._options.textPath = v;
            this._resetText();
            this.objEvents.raiseProp(PROP_NAME.textPath);
        }
    }
    get statePath() { return this._options.statePath; }
    get isEnabled() { return this._getIsEnabled(this.el); }
    set isEnabled(v) {
        if (v !== this.isEnabled) {
            this._setIsEnabled(this.el, v);
            this.objEvents.raiseProp(PROP_NAME.isEnabled);
        }
    }
    get textProvider() { return this._textProvider; }
    set textProvider(v: IOptionTextProvider) {
        if (v !== this._textProvider) {
            this._textProvider = v;
            this._txtDebounce.enque(() => {
                this._resetText();
            });
            this.objEvents.raiseProp(PROP_NAME.textProvider);
        }
    }
    get stateProvider() { return this._stateProvider; }
    set stateProvider(v: IOptionStateProvider) {
        if (v !== this._stateProvider) {
            this._stateProvider = v;
            this._stDebounce.enque(() => {
                this._resetState();
            });
            this.objEvents.raiseProp(PROP_NAME.stateProvider);
        }
    }
    get el() { return this._el; }
}

export interface IListBoxViewOptions extends IListBoxOptions, IViewOptions {
}

export class ListBoxElView extends BaseElView {
    private _listBox: ListBox;

    constructor(options: IListBoxViewOptions) {
        super(options);
        const self = this;
        self._listBox = new ListBox(<IListBoxConstructorOptions>options);
        self._listBox.objEvents.onProp("*", (sender, args) => {
            switch (args.property) {
                case PROP_NAME.dataSource:
                case PROP_NAME.isEnabled:
                case PROP_NAME.selectedValue:
                case PROP_NAME.selectedItem:
                case PROP_NAME.valuePath:
                case PROP_NAME.textPath:
                case PROP_NAME.textProvider:
                case PROP_NAME.stateProvider:
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
        if (!this._listBox.getIsStateDirty()) {
            this._listBox.dispose();
        }
        super.dispose();
    }
    toString() {
        return "ListBoxElView";
    }
    get isEnabled() { return !(<HTMLSelectElement>this.el).disabled; }
    set isEnabled(v: boolean) {
        v = !v;
        if (v !== !this.isEnabled) {
            (<HTMLSelectElement>this.el).disabled = v;
            this.objEvents.raiseProp(PROP_NAME.isEnabled);
        }
    }
    get dataSource(): ICollection<ICollectionItem> {
        return this._listBox.dataSource;
    }
    set dataSource(v: ICollection<ICollectionItem>) {
        const self = this;
        if (self.dataSource !== v) {
            self._listBox.dataSource = v;
        }
    }
    get selectedValue() {
        return (this.getIsStateDirty()) ? checks.undefined : this._listBox.selectedValue;
    }
    set selectedValue(v) {
        if (this._listBox.selectedValue !== v) {
            this._listBox.selectedValue = v;
        }
    }
    get selectedItem() {
        return (this.getIsStateDirty()) ? checks.undefined : this._listBox.selectedItem;
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
