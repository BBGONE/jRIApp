/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { DomUtils } from "jriapp/utils/dom";
import { css } from "../const";
import { BaseCell, ICellOptions } from "./base";
import { Row } from "../rows/row";
import { ExpanderColumn } from "../columns/expander";

const dom = DomUtils;

export class ExpanderCell extends BaseCell<ExpanderColumn> {
    constructor(options: ICellOptions) {
        super(options);
        const self = this;
        this._click.add(() => {
            self._onCellClicked(self.row);
        });
        dom.addClass([this.td], css.rowCollapsed);
        dom.addClass([this.td], css.rowExpander);
    }
    protected _onCellClicked(row?: Row): void {
        const clickedRow: Row = row || this.row;
        if (!clickedRow) {
            return;
        }
        super._onCellClicked(clickedRow);
        clickedRow.isExpanded = !clickedRow.isExpanded;
    }
    toggleImage(): void {
        if (this.row.isExpanded) {
            dom.removeClass([this.td], css.rowCollapsed);
            dom.addClass([this.td], css.rowExpanded);
        } else {
            dom.removeClass([this.td], css.rowExpanded);
            dom.addClass([this.td], css.rowCollapsed);
        }
    }
    toString(): string {
        return "ExpanderCell";
    }
}
