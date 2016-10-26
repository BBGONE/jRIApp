/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { DATA_ATTR } from "jriapp_core/const";
import { Utils as utils } from "jriapp_utils/utils";

import { css, PROP_NAME } from "../const";
import { BaseColumn, ICellInfo } from "./base";
import { DataGrid } from "../datagrid";
import { RowSelectorCell } from "../cells/rowselector";

const dom = utils.dom, $ = dom.$, doc = dom.document, checks = utils.check;

export class RowSelectorColumn extends BaseColumn {
    private _$chk: JQuery;
    private _event_chk_scope: string;

    constructor(grid: DataGrid, options: ICellInfo) {
        super(grid, options);
        let self = this;
        this._event_chk_scope = ["input[", DATA_ATTR.DATA_EVENT_SCOPE, '="', this.uniqueID, '"]'].join("");
        dom.addClass(this.$col.toArray(), css.rowSelector);
        let label = doc.createElement("label");
        let chk = doc.createElement("input");
        chk.type = "checkbox";
        chk.checked = false;
        dom.addClass([chk], css.rowSelector);
        dom.addClass([label], css.rowSelector);
        label.appendChild(chk);
        label.appendChild(doc.createElement("span"));
        this.$col.append(label);
        this._$chk = $(chk);
        this._$chk.on("change", function (e) {
            e.stopPropagation();
            self.raisePropertyChanged(PROP_NAME.checked);
            self.grid.selectRows(this.checked);
        });
        //delegated event from the cells
        this.grid.$table.on("click", this._event_chk_scope, function (e) {
            e.stopPropagation();
            let chk = <HTMLInputElement>this, $chk = $(chk), cell = <RowSelectorCell>$chk.data("cell");
            if (!!cell && !cell.getIsDestroyCalled()) {
                cell.row.isSelected = cell.checked;
            }
        });
    }
    toString() {
        return "RowSelectorColumn";
    }
    get checked() {
        if (!!this._$chk && !!this._$chk.length) {
            let chk = <HTMLInputElement>this._$chk[0];
            return chk.checked;
        }
        return checks.undefined;
    }
    set checked(v) {
        let bv = !!v;
        if (!!this._$chk && !!this._$chk.length) {
            let chk = <HTMLInputElement>this._$chk[0];
            if (bv !== chk.checked) {
                chk.checked = bv;
                this.raisePropertyChanged(PROP_NAME.checked);
            }
        }
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this.grid.$table.off("click", this._event_chk_scope);
        this._$chk.off();
        this._$chk.remove();
        this._$chk = null;
        super.destroy();
    }
}