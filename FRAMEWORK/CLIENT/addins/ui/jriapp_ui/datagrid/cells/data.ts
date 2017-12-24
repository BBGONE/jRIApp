/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { DomUtils } from "jriapp/utils/dom";
import { IContent } from "jriapp/int";

import { css } from "../const";
import { BaseCell, ICellOptions } from "./base";
import { DataColumn } from "../columns/data";

const dom = DomUtils;

export class DataCell extends BaseCell<DataColumn> {
    private _content: IContent;

    constructor(options: ICellOptions) {
        super(options);
        const self = this;
        this._content = null;
        this._click.interval = 350;
        this._click.add(() => {
            self._onCellClicked(self.row);
        }, () => {
            self._onDblClicked(self.row);
        });
        // adds the class
        dom.addClass([this.td], css.dataCell);
        this._initContent();
    }
    // init cell's content
    protected _initContent() {
        const contentType = this.column.contentType;
        this._content = new contentType({
            parentEl: this.td,
            contentOptions: this.column.options.content,
            dataContext: this.item,
            isEditing: this.item._aspect.isEditing
        });
        this._content.render();
    }
    _beginEdit() {
        if (!this._content.isEditing) {
            this._content.isEditing = true;
        }
    }
    _endEdit(isCanceled: boolean) {
        if (this._content.isEditing) {
            this._content.isEditing = false;
        }
    }
    dispose() {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        if (!!this._content) {
            this._content.dispose();
            this._content = null;
        }
        super.dispose();
    }
    toString() {
        return "DataCell";
    }
}
