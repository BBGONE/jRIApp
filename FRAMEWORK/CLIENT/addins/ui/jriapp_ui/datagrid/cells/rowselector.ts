/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { Utils } from "jriapp_shared";
import { $ } from "jriapp/utils/jquery";
import { DomUtils } from "jriapp/utils/dom";
import { DATA_ATTR } from "jriapp/const";
import { IContent, IBindingInfo, IContentOptions } from "jriapp/int";
import { BoolContent } from "../../content/bool";

import { css, PROP_NAME } from "../const";
import { BaseCell, ICellOptions } from "./base";
import { RowSelectorColumn } from "../columns/rowselector";

const dom = DomUtils, doc = dom.document;

export class RowSelectorCell extends BaseCell<RowSelectorColumn> {
    private _chk: HTMLInputElement;

    constructor(options: ICellOptions) {
        super(options);
        dom.addClass([this.td], css.rowSelector);
        const label = doc.createElement("label");
        const chk = doc.createElement("input");
        chk.type = "checkbox";
        chk.checked = false;
        chk.className = css.rowSelector;
        label.className = css.rowSelector;
        chk.setAttribute(DATA_ATTR.DATA_EVENT_SCOPE, this.column.uniqueID);
        label.appendChild(chk);
        label.appendChild(doc.createElement("span"));
        this.td.appendChild(label);
        this._chk = chk;
        dom.setData(chk, "cell", this);
    }
    get checked() {
        return this._chk.checked;
    }
    set checked(v) {
        const bv = !!v;
        if (bv !== this._chk.checked) {
            this._chk.checked = bv;
        }
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        dom.removeData(this._chk);
        super.destroy();
    }
    toString() {
        return "RowSelectorCell";
    }
}