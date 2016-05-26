/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IContent, IBindingInfo, IContentOptions } from "jriapp_core/shared";
import { BoolContent } from "jriapp_content/bool";
import { Utils as utils } from "jriapp_utils/utils";

import { css, PROP_NAME } from "../const";
import { BaseCell, ICellOptions } from "./base";
import { RowSelectorColumn } from "../columns/rowselector";

const $ = utils.dom.$;

class RowSelectContent extends BoolContent {
    getIsCanBeEdited() {
        return true;
    }
    toString() {
        return "RowSelectContent";
    }
}

export class RowSelectorCell extends BaseCell<RowSelectorColumn> {
    private _content: IContent;

    constructor(options: ICellOptions) {
        super(options);
        this._content = null;
        let $el = $(this._td);
        $el.addClass(css.rowSelector);
        this._init();
    }
    protected _init() {
        let bindInfo: IBindingInfo = {
            target: null, source: null,
            targetPath: null, sourcePath: PROP_NAME.isSelected,
            mode: "TwoWay",
            converter: null, converterParam: null
        };
        let contentOpts: IContentOptions = {
            fieldName: PROP_NAME.isSelected,
            bindingInfo: bindInfo,
            displayInfo: null
        };
        this._content = new RowSelectContent({
            parentEl: this._td,
            contentOptions: contentOpts,
            dataContext: this.row,
            isEditing: true,
            app: this.grid.app
        });
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
        return "RowSelectorCell";
    }
}