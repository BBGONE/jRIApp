/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { Utils as utils } from "jriapp_utils/utils";

import { css } from "../const";
import { BaseCell, ICellOptions } from "./base";
import { Row } from "../rows/row";
import { ExpanderColumn } from "../columns/expander";

const dom = utils.dom, $ = dom.$;

export class ExpanderCell extends BaseCell<ExpanderColumn> {
    constructor(options: ICellOptions) {
        super(options);
        this._click.add(() => {
            this._onCellClicked(this.row);
        });
        dom.addClass([this.td], css.rowCollapsed);
        dom.addClass([this.td], css.rowExpander);
    }
    protected _onCellClicked(row?: Row) {
        let clicked_row: Row = row || this.row;
        if (!clicked_row)
            return;
        super._onCellClicked(clicked_row);
        clicked_row.isExpanded = !clicked_row.isExpanded;
    }
    toggleImage() {
        if (this.row.isExpanded) {
            dom.removeClass([this.td], css.rowCollapsed);
            dom.addClass([this.td], css.rowExpanded);
        }
        else {
            dom.removeClass([this.td], css.rowExpanded);
            dom.addClass([this.td], css.rowCollapsed);
        }
    }
    toString() {
        return "ExpanderCell";
    }
}