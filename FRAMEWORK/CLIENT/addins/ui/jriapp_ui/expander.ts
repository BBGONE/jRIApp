/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { bootstrap } from "jriapp/bootstrap";
import { AnchorElView, IAncorOptions } from "./anchor";

export interface IExpanderOptions extends IAncorOptions {
    expandedsrc?: string;
    collapsedsrc?: string;
    isExpanded?: boolean;
}

export const enum PROP_NAME {
    isExpanded = "isExpanded"
}

const COLLAPSE_IMG = "collapse.jpg", EXPAND_IMG = "expand.jpg";
// const COLLAPSE_IMG = "icon icon-arrow-up", EXPAND_IMG = "icon  icon-arrow-down";

export class ExpanderElView extends AnchorElView {
    private _expandedsrc: string;
    private _collapsedsrc: string;
    private _isExpanded: boolean;

    constructor(options: IExpanderOptions) {
        const expandedsrc = options.expandedsrc || bootstrap.getImagePath(COLLAPSE_IMG);
        const collapsedsrc = options.collapsedsrc || bootstrap.getImagePath(EXPAND_IMG);
        const isExpanded = !!options.isExpanded;
        options.imageSrc = null;
        super(options);
        this._expandedsrc = expandedsrc;
        this._collapsedsrc = collapsedsrc;
        this.isExpanded = isExpanded;
    }
    protected refresh(): void {
        if (this.getIsStateDirty()) {
            return;
        }
        this.imageSrc = this._isExpanded ? this._expandedsrc : this._collapsedsrc;
        // this.glyph = this._isExpanded ? this._expandedsrc : this._collapsedsrc;
    }
    protected _onCommandChanged() {
        super._onCommandChanged();
        this.invokeCommand();
    }
    protected onClick() {
        this.isExpanded = !this.isExpanded;
    }
    // override
    invokeCommand() {
        this.refresh();
        super.invokeCommand(null, true);
    }
    toString() {
        return "ExpanderElView";
    }
    get isExpanded() { return this._isExpanded; }
    set isExpanded(v) {
        if (this._isExpanded !== v) {
            this._isExpanded = v;
            this.invokeCommand();
            this.objEvents.raiseProp("isExpanded");
        }
    }
}

bootstrap.registerElView("expander", ExpanderElView);
