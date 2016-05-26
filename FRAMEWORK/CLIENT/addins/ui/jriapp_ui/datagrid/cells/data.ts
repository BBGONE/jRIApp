/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IContent } from "jriapp_core/shared";
import { ERRS } from "jriapp_core/lang";
import { contentFactories } from "jriapp_content/factory";
import { Utils as utils } from "jriapp_utils/utils";

import { css } from "../const";
import { BaseCell, ICellOptions } from "./base";
import { DataColumn } from "../columns/data";

const $ = utils.dom.$;

export class DataCell extends BaseCell<DataColumn> {
    private _content: IContent;
    private _stateCss: string;

    constructor(options: ICellOptions) {
        super(options);
        this._content = null;
        this._stateCss = null;

        this._click.interval = 350;
        this._click.add(() => {
            this._onCellClicked(this._row);
        }, () => {
            this._onDblClicked(this._row);
            });

        let $el = $(this._td);
        $el.addClass(css.dataCell);

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
        let self = this, app = this.grid.app;
        contentOptions.initContentFn = null;
        try {
            let contentType = contentFactories.getContentType(contentOptions);
            if (contentFactories.isExternallyCachable(contentType)) {
                contentOptions.initContentFn = this.column._getInitContentFn();
            }

            if (this.grid.isHasEditor) {
                //disable inrow editing if the grid has an editor
                contentOptions.readOnly = true;
            }

            this._content = new contentType({
                parentEl: this._td,
                contentOptions: contentOptions,
                dataContext: this.item,
                isEditing: this.item._aspect.isEditing,
                app: app
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
            let $el = $(this._td);
            if (!!this._stateCss)
                $el.removeClass(this._stateCss);
            this._stateCss = css;
            if (!!this._stateCss)
                $el.addClass(this._stateCss);
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