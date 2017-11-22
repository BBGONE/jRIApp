/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { Utils } from "jriapp_shared";
import { DomUtils } from "jriapp/utils/dom";
import { DATA_ATTR } from "jriapp/const";

import { css, PROP_NAME } from "../const";
import { BaseColumn, ICellInfo } from "./base";
import { DataGrid } from "../datagrid";
import { RowSelectorCell } from "../cells/rowselector";

const utils = Utils, dom = DomUtils, doc = dom.document, checks = utils.check;

export class RowSelectorColumn extends BaseColumn {
    private _chk: HTMLInputElement;

    constructor(grid: DataGrid, options: ICellInfo) {
        super(grid, options);
        const self = this;
        dom.addClass([this.col], css.rowSelector);
        const label = doc.createElement("label");
        const chk = doc.createElement("input");
        chk.type = "checkbox";
        chk.checked = false;
        chk.className = css.rowSelector;
        label.className = css.rowSelector;
        label.appendChild(chk);
        label.appendChild(doc.createElement("span"));
        this.col.appendChild(label);
        this._chk = chk;
        dom.events.on(chk, "change", (e) => {
            e.stopPropagation();
            self.objEvents.raiseProp(PROP_NAME.checked);
            self.grid.selectRows(chk.checked);
        }, this.uniqueID);

        // delegated click event from the cell's checkbox
        dom.events.on(this.grid.table, "click", (e) => {
            e.stopPropagation();
            const chk = <HTMLInputElement>e.target, cell = <RowSelectorCell>dom.getData(chk, "cell");
            if (!!cell && !cell.getIsDisposing()) {
                cell.row.isSelected = cell.checked;
            }
        }, {
                nmspace: this.uniqueID,
                // using delegation
                matchElement: (el: Element) => {
                    const attr = el.getAttribute(DATA_ATTR.DATA_EVENT_SCOPE),
                        tag = el.tagName.toLowerCase();
                    return self.uniqueID === attr && tag === "input";
                }
            });
    }
    toString() {
        return "RowSelectorColumn";
    }
    get checked() {
        if (!!this._chk) {
            return this._chk.checked;
        }
        return checks.undefined;
    }
    set checked(v) {
        const bv = !!v, chk = this._chk;
        if (bv !== chk.checked) {
            chk.checked = bv;
            this.objEvents.raiseProp(PROP_NAME.checked);
        }
    }
    dispose() {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        dom.events.offNS(this._chk, this.uniqueID);
        dom.events.offNS(this.grid.table, this.uniqueID);
        super.dispose();
    }
}
