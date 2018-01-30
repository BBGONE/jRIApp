/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { DomUtils } from "jriapp/utils/dom";
import { css } from "../const";
import { BaseColumn, ICellInfo } from "./base";
import { DataGrid } from "../datagrid";

const dom = DomUtils;

export class ExpanderColumn extends BaseColumn {
    constructor(grid: DataGrid, options: ICellInfo) {
        super(grid, options);
        dom.addClass([this.col], css.rowExpander);
    }
    toString(): string {
        return "ExpanderColumn";
    }
}
