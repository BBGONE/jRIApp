/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import {
    IBaseObject, LocaleERRS as ERRS, Utils
} from "jriapp_shared";
import { DomUtils } from "jriapp/utils/dom";
import { BINDING_MODE } from "jriapp/consts";
import { IExternallyCachable, IBinding, TBindingOptions, IConstructorContentOptions, IConverter, IElView } from "jriapp/int";
import { ListBoxElView } from "../listbox";
import { BasicContent, IContentView } from "./basic";

const utils = Utils, dom = DomUtils, doc = dom.document, { _undefined } = utils.check, { format } = utils.str,
    { getNewID } = utils.core, sys = utils.sys;

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
        return _undefined;
    }
    convertToTarget(val: any, param: any, dataContext: any): string {
        return this._content.getLookupText(val);
    }
    toString(): string {
        return "LookupConverter";
    }
}

export class LookupContent extends BasicContent implements IExternallyCachable {
    private _converter: LookupConverter;
    private _listBox: ListBoxElView;
    private _isListBoxCachedExternally: boolean;
    private _uniqueID: string;

    constructor(options: IConstructorContentOptions) {
        if (options.contentOptions.name !== "lookup") {
            throw new Error(format(ERRS.ERR_ASSERTION_FAILED, "contentOptions.name === 'lookup'"));
        }
        super(options);
        this._converter = new LookupConverter(this);
        this._listBox = null;
        this._isListBoxCachedExternally = false;
        this._uniqueID = getNewID("lkup");
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
    // override
    protected getConverter(isEdit: boolean): IConverter {
        return (!isEdit) ? this._converter : null;
    }
    protected getListBox(): ListBoxElView {
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
            this._listBox = <ListBoxElView>args1.result;
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
        const bindings = this.lfScope.getObjs().filter((obj) => sys.isBinding(obj)).map((obj) => <IBinding>obj);
        for (const binding of bindings)
        {
            if (binding.targetPath.length > 0 && binding.targetPath[0] === "value")
            {
                binding.updateTarget();
            }
        }
    }
    protected createListBox(lookUpOptions: ILookupOptions): ListBoxElView {
        const el = doc.createElement("select"), options = {
            valuePath: lookUpOptions.valuePath,
            textPath: lookUpOptions.textPath,
            statePath: (!lookUpOptions.statePath) ? null : lookUpOptions.statePath,
            syncSetDatasource: true,
            dataSource: sys.resolvePath(this.app, lookUpOptions.dataSource)
        };
        el.setAttribute("size", "1");
        return new ListBoxElView(el, options);
    }
    // override
    protected cleanUp() {
        super.cleanUp();
        if (!!this._listBox && this._isListBoxCachedExternally) {
            this._listBox.objEvents.offNS(this.uniqueID);
            this._listBox = null;
        }
    }
    protected bindToList(listBox: IElView): IBinding {
        const options: TBindingOptions = {
            target: listBox,
            source: this.dataContext,
            targetPath: "selectedValue",
            sourcePath: this.options.fieldName,
            isSourceFixed: false,
            mode: BINDING_MODE.TwoWay,
            converter: null,
            param: null,
            isBind: false
        };
        return this.app.bind(options);
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
        return this._uniqueID;
    }
}