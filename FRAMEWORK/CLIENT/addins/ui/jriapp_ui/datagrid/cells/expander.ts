/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { Utils as utils } from "jriapp_utils/utils";

import { css } from "../const";
import { BaseCell, ICellOptions } from "./base";
import { Row } from "../rows/row";
import { ExpanderColumn } from "../columns/expander";

const $ = utils.dom.$;

export class ExpanderCell extends BaseCell<ExpanderColumn> {
    constructor(options: ICellOptions) {
        super(options);
        this._click.add(() => {
            this._onCellClicked(this._row);
        });
        let $el = $(this._td);
        $el.addClass(css.rowCollapsed);
        $el.addClass(css.rowExpander);
    }
    protected _onCellClicked(row?: Row) {
        let clicked_row: Row = row || this._row;
        if (!clicked_row)
            return;
        super._onCellClicked(clicked_row);
        clicked_row.isExpanded = !clicked_row.isExpanded;
    }
    toggleImage() {
        let $el = $(this.td);
        if (this._row.isExpanded) {
            $el.removeClass(css.rowCollapsed);
            $el.addClass(css.rowExpanded);
        }
        else {
            $el.removeClass(css.rowExpanded);
            $el.addClass(css.rowCollapsed);
        }
    }
    toString() {
        return "ExpanderCell";
    }
}