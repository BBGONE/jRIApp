/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { Utils } from "jriapp_utils/utils";

import { css } from "../const";
import { BaseColumn, ICellInfo } from "./base";
import { DataGrid } from "../datagrid";

const utils = Utils, dom = utils.dom, $ = dom.$;

export class ExpanderColumn extends BaseColumn {
    constructor(grid: DataGrid, options: ICellInfo) {
        super(grid, options);

        dom.addClass([this.col], css.rowExpander);
    }
    toString() {
        return "ExpanderColumn";
    }
}