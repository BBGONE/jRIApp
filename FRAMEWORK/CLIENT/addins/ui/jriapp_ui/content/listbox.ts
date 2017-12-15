/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    IBaseObject, LocaleERRS as ERRS, Utils
} from "jriapp_shared";
import { DomUtils } from "jriapp/utils/dom";
import { BINDING_MODE } from "jriapp/const";
import { IExternallyCachable, IBinding, IBindingOptions, IConstructorContentOptions } from "jriapp/int";
import { ListBox } from "../listbox";
import { SpanElView } from "../span";
import { BasicContent, IContentView } from "./basic";

const utils = Utils, dom = DomUtils, doc = dom.document, strUtils = utils.str, coreUtils = utils.core,
    sys = utils.sys;

const enum PROP_NAME {
    dataSource= "dataSource",
    selectedItem= "selectedItem",
    selectedValue= "selectedValue",
    valuePath= "valuePath",
    textPath= "textPath",
    isEnabled= "isEnabled",
    listBox= "listBox",
    value= "value",
    textProvider= "textProvider",
    stateProvider= "stateProvider"
}

export interface ILookupOptions {
    dataSource: string;
    valuePath: string;
    textPath: string;
    statePath?: string;
}

const enum LOOKUP_EVENTS {
    obj_created = "object_created",
    obj_needed = "object_needed"
}

export type TObjCreatedArgs = {
    objectKey: string;
    result: IBaseObject;
    isCachedExternally: boolean;
};
export type TObjNeededArgs = {
    objectKey: string;
    result: IBaseObject;
};

export class LookupContent extends BasicContent implements IExternallyCachable {
    private _span: SpanElView;
    private _valBinding: IBinding;
    private _listBinding: IBinding;
    private _listBox: ListBox;
    private _isListBoxCachedExternally: boolean;
    private _value: any;
    private _objId: string;

    constructor(options: IConstructorContentOptions) {
        if (options.contentOptions.name !== "lookup") {
            throw new Error(strUtils.format(ERRS.ERR_ASSERTION_FAILED, "contentOptions.name === 'lookup'"));
        }
        super(options);
        this._span = null;
        this._listBox = null;
        this._isListBoxCachedExternally = false;
        this._valBinding = null;
        this._listBinding = null;
        this._value = null;
        this._objId = coreUtils.getNewID("lkup");
        if (!!this._options.initContentFn) {
            this._options.initContentFn(this);
        }
    }
    addOnObjectCreated(fn: (sender: LookupContent, args: TObjCreatedArgs) => void, nmspace?: string) {
        this.objEvents.on(LOOKUP_EVENTS.obj_created, fn, nmspace);
    }
    offOnObjectCreated(nmspace?: string) {
        this.objEvents.off(LOOKUP_EVENTS.obj_created, nmspace);
    }
    addOnObjectNeeded(fn: (sender: LookupContent, args: TObjNeededArgs) => void, nmspace?: string) {
        this.objEvents.on(LOOKUP_EVENTS.obj_needed, fn, nmspace);
    }
    offOnObjectNeeded(nmspace?: string) {
        this.objEvents.off(LOOKUP_EVENTS.obj_needed, nmspace);
    }
    protected getListBox(): ListBox {
        if (!!this._listBox) {
            return this._listBox;
        }

        const lookUpOptions: ILookupOptions = this._options.options,
            objectKey = "listBox";

        const args1: TObjNeededArgs = {
            objectKey: objectKey,
            result: null
        };
        // try get externally externally cached listBox
        this.objEvents.raise(LOOKUP_EVENTS.obj_needed, args1);
        if (!!args1.result) {
            this._isListBoxCachedExternally = true;
            this._listBox = <ListBox>args1.result;
        }
        if (!!this._listBox) {
            this._listBox.addOnRefreshed(this.onListRefreshed, this.uniqueID, this);
            return this._listBox;
        }
        // IF NO ELEMENT VIEW in THE CACHE - proceed creating new ElView
        const listBox = this.createListBox(lookUpOptions);
        const args2: TObjCreatedArgs = {
            objectKey: objectKey,
            result: listBox,
            isCachedExternally: false
        };
        // this allows to cache listBox externally
        this.objEvents.raise(LOOKUP_EVENTS.obj_created, args2);
        this._isListBoxCachedExternally = args2.isCachedExternally;
        this._listBox = listBox;
        this._listBox.addOnRefreshed(this.onListRefreshed, this.uniqueID, this);
        return this._listBox;
    }
    protected onListRefreshed(): void {
        this.updateTextValue();
    }
    protected createListBox(lookUpOptions: ILookupOptions): ListBox {
        const options = {
            valuePath: lookUpOptions.valuePath,
            textPath: lookUpOptions.textPath,
            statePath: (!lookUpOptions.statePath) ? null : lookUpOptions.statePath,
            el: doc.createElement("select"),
            syncSetDatasource: true,
            dataSource: sys.resolvePath(this.app, lookUpOptions.dataSource)
        }, el = options.el;
        el.setAttribute("size", "1");
        return new ListBox(options);
    }
    protected updateTextValue(): void {
        const span = this.getSpan();
        span.value = this.getLookupText();
    }
    protected getLookupText(): string {
        const listBox = this.getListBox();
        return listBox.getText(this.value);
    }
    protected getSpan(): SpanElView {
        if (!!this._span) {
            return this._span;
        }
        const el = doc.createElement("span"), displayInfo = this._options.displayInfo;
        if (!!displayInfo && !!displayInfo.displayCss) {
            dom.addClass([el], displayInfo.displayCss);
        }
        const spanView = new SpanElView({ el: el });
        this._span = spanView;
        return this._span;
    }
    protected createTargetElement(): IContentView {
        let tgt: IContentView, listBox: ListBox, spanView: SpanElView;
        if (this.isEditing && this.getIsCanBeEdited()) {
            listBox = this.getListBox();
            this._listBinding = this.bindToList(listBox);
            tgt = listBox;
        } else {
            spanView = this.getSpan();
            this._valBinding = this.bindToValue();
            tgt = spanView;
        }
        this._el = tgt.el;
        this.updateCss();
        return tgt;
    }
    protected cleanUp() {
        if (!!this._el) {
            dom.removeNode(this._el);
            this._el = null;
        }
        if (!!this._listBinding) {
            this._listBinding.dispose();
            this._listBinding = null;
        }
        if (!!this._valBinding) {
            this._valBinding.dispose();
            this._valBinding = null;
        }

        if (!!this._listBox && this._isListBoxCachedExternally) {
            this._listBox.objEvents.offNS(this.uniqueID);
            this._listBox = null;
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
        if (!this._options.fieldName) {
            return null;
        }

        const options: IBindingOptions = {
            target: this,
            source: this._dataContext,
            targetPath: PROP_NAME.value,
            sourcePath: this._options.fieldName,
            isSourceFixed: false,
            mode: BINDING_MODE.OneWay,
            converter: null,
            param: null,
            isEval: false
        };
        return this.app.bind(options);
    }
    protected bindToList(listBox: ListBox) {
        if (!this._options.fieldName) {
            return null;
        }

        const options: IBindingOptions = {
            target: listBox,
            source: this._dataContext,
            targetPath: PROP_NAME.selectedValue,
            sourcePath: this._options.fieldName,
            isSourceFixed: false,
            mode: BINDING_MODE.TwoWay,
            converter: null,
            param: null,
            isEval: false
        };
        return this.app.bind(options);
    }
    render(): void {
        this.cleanUp();
        this.createTargetElement();
        this._parentEl.appendChild(this._el);
    }
    dispose(): void {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        this.cleanUp();
        if (!!this._listBox) {
            this._listBox.objEvents.offNS(this.uniqueID);
            if (!this._isListBoxCachedExternally && !this._listBox.getIsStateDirty()) {
                this._listBox.dispose();
            }
            this._listBox = null;
        }
        if (!!this._span) {
            this._span.dispose();
            this._span = null;
        }
        super.dispose();
    }
    toString(): string {
        return "LookupContent";
    }
    get value(): any {
        return this._value;
    }
    set value(v) {
        if (this._value !== v) {
            this._value = v;
            this.objEvents.raiseProp(PROP_NAME.value);
        }
        this.updateTextValue();
    }
    get uniqueID(): string {
        return this._objId;
    }
}
