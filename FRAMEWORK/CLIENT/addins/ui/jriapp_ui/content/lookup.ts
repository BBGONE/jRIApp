/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import {
    IBaseObject, LocaleERRS as ERRS, Utils
} from "jriapp_shared";
import { DomUtils } from "jriapp/utils/dom";
import { BINDING_MODE } from "jriapp/const";
import { IExternallyCachable, IBinding, IBindingOptions, IConstructorContentOptions, IConverter, IElView } from "jriapp/int";
import { ListBox } from "../listbox";
import { BasicContent, IContentView } from "./basic";

const utils = Utils, dom = DomUtils, doc = dom.document, strUtils = utils.str, coreUtils = utils.core,
    sys = utils.sys;

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

class LookupConverter implements IConverter {
    private _content: LookupContent;

    constructor(content: LookupContent) {
        this._content = content;
    }
    convertToSource(val: any, param: any, dataContext: any): number {
        return utils.check.undefined;
    }
    convertToTarget(val: any, param: any, dataContext: any): string {
        return this._content.getLookupText(val);
    }
    toString() {
        return "LookupConverter";
    }
}

export class LookupContent extends BasicContent implements IExternallyCachable {
    private _converter: LookupConverter;
    private _listBox: ListBox;
    private _isListBoxCachedExternally: boolean;
    private _spanBinding: IBinding;
    private _objId: string;

    constructor(options: IConstructorContentOptions) {
        if (options.contentOptions.name !== "lookup") {
            throw new Error(strUtils.format(ERRS.ERR_ASSERTION_FAILED, "contentOptions.name === 'lookup'"));
        }
        super(options);
        this._converter = new LookupConverter(this);
        this._listBox = null;
        this._spanBinding = null;
        this._isListBoxCachedExternally = false;
        this._objId = coreUtils.getNewID("lkup");
        if (!!this.options.initContentFn) {
            this.options.initContentFn(this);
        }
    }
    dispose(): void {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        if (!!this._listBox) {
            this._listBox.objEvents.offNS(this.uniqueID);
            if (!this._isListBoxCachedExternally && !this._listBox.getIsStateDirty()) {
                this._listBox.dispose();
            }
            this._listBox = null;
        }
        this._converter = null;
        super.dispose();
    }
    protected getListBox(): ListBox {
        if (!!this._listBox) {
            return this._listBox;
        }

        const lookUpOptions: ILookupOptions = this.options.options,
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
        if (!!this._spanBinding) {
            this._spanBinding.updateTarget();
        }
    }
    protected createListBox(lookUpOptions: ILookupOptions): ListBox {
        const el = doc.createElement("select"), options = {
            valuePath: lookUpOptions.valuePath,
            textPath: lookUpOptions.textPath,
            statePath: (!lookUpOptions.statePath) ? null : lookUpOptions.statePath,
            syncSetDatasource: true,
            dataSource: sys.resolvePath(this.app, lookUpOptions.dataSource)
        };
        el.setAttribute("size", "1");
        return new ListBox(el, options);
    }
    // override
    protected cleanUp() {
        super.cleanUp();
        this._spanBinding = null;
        if (!!this._listBox && this._isListBoxCachedExternally) {
            this._listBox.objEvents.offNS(this.uniqueID);
            this._listBox = null;
        }
    }
    protected bindToSpan(span: IElView): IBinding {
        const options: IBindingOptions = {
            target: span,
            source: this.dataContext,
            targetPath: "value",
            sourcePath: this.options.fieldName,
            isSourceFixed: false,
            mode: BINDING_MODE.OneWay,
            converter: this._converter,
            param: null,
            isEval: false
        };
        return this.app.bind(options);
    }
    protected bindToList(listBox: ListBox): IBinding {
        const options: IBindingOptions = {
            target: listBox,
            source: this.dataContext,
            targetPath: "selectedValue",
            sourcePath: this.options.fieldName,
            isSourceFixed: false,
            mode: BINDING_MODE.TwoWay,
            converter: null,
            param: null,
            isEval: false
        };
        return this.app.bind(options);
    }
    // override
    protected createdReadingView(): IContentView {
        const span = <IElView>super.createdReadingView();
        this.lfScope.addObj(span);
        this.lfScope.addObj(this.bindToSpan(span));
        return span;
    }
    // override
    protected createdEditingView(): IContentView {
        const listBox = this.getListBox();
        this.lfScope.addObj(this.bindToList(listBox));
        return listBox;
    }
    // override
    protected beforeCreateView(): boolean {
        this.cleanUp();
        return !!this.options.fieldName;
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
    getLookupText(val: any): string {
        const listBox = this.getListBox();
        return listBox.getText(val);
    }
    toString(): string {
        return "LookupContent";
    }
    get uniqueID(): string {
        return this._objId;
    }
}