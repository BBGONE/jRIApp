/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { LocaleERRS as ERRS, LocaleSTRS as STRS, Utils } from "jriapp_shared";
import { $ } from "jriapp/utils/jquery";
import { DATA_ATTR, } from "jriapp/const";
import { ButtonCss } from "jriapp/int";
import { fn_addToolTip } from "../../baseview";

import { css, actionsSelector, txtMap, editSelector, deleteSelector  } from "../const";
import { BaseCell, ICellOptions } from "./base";
import { ActionsColumn } from "../columns/actions";

const utils = Utils, dom = utils.dom, strUtils = utils.str, checks = utils.check;

const _editImages = '<span data-role="row-action" data-name="img_ok" class="{0}"></span><span data-role="row-action" data-name="img_cancel" class="{1}"></span>';
const _viewImages = '<span data-role="row-action" data-name="img_edit" class="{0}"></span><span data-role="row-action" data-name="img_delete" class="{1}"></span>';
let editImages: string = checks.undefined, viewImages: string = checks.undefined;

export class ActionsCell extends BaseCell<ActionsColumn> {
    private _isEditing: boolean;

    constructor(options: ICellOptions) {
        super(options);
        this._isEditing = false;
        dom.addClass([this.td], [css.rowActions, css.nobr].join(" "));
        this._createButtons(this.row.isEditing);
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        const $td = $(this.td), $imgs = $td.find(actionsSelector);
        $imgs.each(function (index, img) {
            let $img = $(img);
            $img.removeData();
        });
        super.destroy();
    }
    private _setupImages($images: JQuery) {
        const self = this;
        $images.each(function (index: number, img: HTMLElement) {
            let $img = $(img);
            $img.data("cell", self);
            let name = $img.attr(DATA_ATTR.DATA_NAME);
            fn_addToolTip($img, STRS.TEXT[txtMap[name]]);
            $img.attr(DATA_ATTR.DATA_EVENT_SCOPE, self.column.uniqueID);
        });
    }
    protected get editImages() {
        if (!editImages)
            editImages = strUtils.format(_editImages, ButtonCss.OK, ButtonCss.Cancel);
        return editImages;
    }
    protected get viewImages() {
        if (!viewImages)
            viewImages = strUtils.format(_viewImages, ButtonCss.Edit, ButtonCss.Delete);
        return viewImages;
    }
    protected _createButtons(isEditing: boolean) {
        if (!this.td)
            return;

        const self = this, $td = $(this.td);
        let $newElems: JQuery;

        $td.empty();
        if (isEditing) {
            self._isEditing = true;
            $newElems = $(self.editImages);
            self._setupImages($newElems.filter(actionsSelector));
        }
        else {
            self._isEditing = false;
            $newElems = $(self.viewImages);
            if (!self.isCanEdit) {
                $newElems = $newElems.not(editSelector);
            }
            if (!self.isCanDelete) {
                $newElems = $newElems.not(deleteSelector);
            }
            self._setupImages($newElems.filter(actionsSelector));
        }
        $td.append($newElems);
    }
    update() {
        if (!this.row)
            return;
        if (this._isEditing !== this.row.isEditing) {
            this._createButtons(this.row.isEditing);
        }
    }
    toString() {
        return "ActionsCell";
    }
    get isCanEdit() { return this.grid.isCanEdit; }
    get isCanDelete() { return this.grid.isCanDelete; }
}