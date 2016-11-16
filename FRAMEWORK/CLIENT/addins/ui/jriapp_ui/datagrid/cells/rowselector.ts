/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { Utils } from "jriapp_shared";
import { $ } from "jriapp/utils/jquery";
import { DATA_ATTR } from "jriapp/const";
import { IContent, IBindingInfo, IContentOptions } from "jriapp/shared";
import { BoolContent } from "../../content/bool";

import { css, PROP_NAME } from "../const";
import { BaseCell, ICellOptions } from "./base";
import { RowSelectorColumn } from "../columns/rowselector";

const dom = Utils.dom, doc = dom.document;

export class RowSelectorCell extends BaseCell<RowSelectorColumn> {
    private _$chk: JQuery;

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
        this._$chk = $(chk);
        this._$chk.data("cell", this);
    }
    get checked() {
        if (!!this._$chk && !!this._$chk.length) {
            let chk = <HTMLInputElement>this._$chk[0];
            return chk.checked;
        }
        return void 0;
    }
    set checked(v) {
        let bv = !!v;
        if (!!this._$chk && !!this._$chk.length) {
            let chk = <HTMLInputElement>this._$chk[0];
            if (bv !== chk.checked) {
                chk.checked = bv;
            }
        }
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this._$chk.removeData();
        this._$chk = null;
        super.destroy();
    }
    toString() {
        return "RowSelectorCell";
    }
}