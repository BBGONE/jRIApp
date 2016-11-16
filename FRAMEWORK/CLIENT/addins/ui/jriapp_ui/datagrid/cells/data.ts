/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { LocaleERRS as ERRS, Utils } from "jriapp_shared";
import { $ } from "jriapp/utils/jquery";
import { IContent } from "jriapp/shared";
import { bootstrap } from "jriapp/bootstrap";

import { css } from "../const";
import { BaseCell, ICellOptions } from "./base";
import { DataColumn } from "../columns/data";

const utils = Utils, dom = utils.dom, boot = bootstrap;

export class DataCell extends BaseCell<DataColumn> {
    private _content: IContent;
    private _stateCss: string;

    constructor(options: ICellOptions) {
        super(options);
        this._content = null;
        this._stateCss = null;
        let self = this;
        this._click.interval = 350;
        this._click.add(() => {
            self._onCellClicked(self.row);
        }, () => {
            self._onDblClicked(self.row);
        });
        //adds the class
        dom.addClass([this.td], css.dataCell);
        this._initContent();
    }
    //init cell's content
    protected _initContent() {
        let contentOptions = this.column.options.content;
        if (!contentOptions.fieldInfo && !!contentOptions.fieldName) {
            contentOptions.fieldInfo = this.item._aspect.getFieldInfo(contentOptions.fieldName);
            if (!contentOptions.fieldInfo) {
                throw new Error(utils.str.format(ERRS.ERR_DBSET_INVALID_FIELDNAME, "", contentOptions.fieldName));
            }
        }
        const self = this;
        contentOptions.initContentFn = null;
        try {
            let contentType = boot.contentFactory.getContentType(contentOptions);
            if (boot.contentFactory.isExternallyCachable(contentType)) {
                contentOptions.initContentFn = this.column._getInitContentFn();
            }

            if (this.grid.isHasEditor) {
                //disable inrow editing if the grid has an editor
                contentOptions.readOnly = true;
            }

            this._content = new contentType({
                parentEl: this.td,
                contentOptions: contentOptions,
                dataContext: this.item,
                isEditing: this.item._aspect.isEditing
            });
        }
        finally {
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
    _setState(css: string): void {
        if (this._stateCss !== css) {
            let arr: string[] = [];
            if (!!this._stateCss)
                arr.push("-" + this._stateCss);
            this._stateCss = css;
            if (!!this._stateCss)
                arr.push("+" + this._stateCss);
            dom.setClasses([this.td], arr);
        }
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        if (!!this._content) {
            this._content.destroy();
            this._content = null;
        }
        super.destroy();
    }
    toString() {
        return "DataCell";
    }
}