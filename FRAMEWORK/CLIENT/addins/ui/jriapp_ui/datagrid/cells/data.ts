/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { LocaleERRS as ERRS, Utils } from "jriapp_shared";
import { DomUtils } from "jriapp/utils/dom";
import { IContent } from "jriapp/int";
import { bootstrap } from "jriapp/bootstrap";

import { css } from "../const";
import { BaseCell, ICellOptions } from "./base";
import { DataColumn } from "../columns/data";

const utils = Utils, dom = DomUtils, boot = bootstrap;

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
        const contentOptions = this.column.options.content;
        if (!contentOptions.fieldInfo && !!contentOptions.fieldName) {
            contentOptions.fieldInfo = this.item._aspect.getFieldInfo(contentOptions.fieldName);
            if (!contentOptions.fieldInfo) {
                throw new Error(utils.str.format(ERRS.ERR_DBSET_INVALID_FIELDNAME, "", contentOptions.fieldName));
            }
        }
        contentOptions.initContentFn = null;
        try {
            const contentType = boot.contentFactory.getContentType(contentOptions);
            if (boot.contentFactory.isExternallyCachable(contentType)) {
                contentOptions.initContentFn = this.column._getInitContentFn();
            }

            if (this.grid.isHasEditor) {
                // disable inrow editing if the grid has an editor
                contentOptions.readOnly = true;
            }

            this._content = new contentType({
                parentEl: this.td,
                contentOptions: contentOptions,
                dataContext: this.item,
                isEditing: this.item._aspect.isEditing
            });
            this._content.render();
        } finally {
            delete contentOptions.initContentFn;
        }
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
