/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { DATA_ATTR, } from "jriapp_core/const";
import { ERRS, STRS } from "jriapp_core/lang";
import { ButtonCss } from "jriapp_core/shared";
import { fn_addToolTip } from "jriapp_elview/elview";
import { Utils as utils } from "jriapp_utils/utils";


import { css, actionsSelector, txtMap, editSelector, deleteSelector  } from "../const";
import { BaseCell, ICellOptions } from "./base";
import { ActionsColumn } from "../columns/actions";

const dom = utils.dom, $ = dom.$, strUtils = utils.str;

const _editImages = '<span data-role="row-action" data-name="img_ok" class="{0}"></span><span data-role="row-action" data-name="img_cancel" class="{1}"></span>';
const _viewImages = '<span data-role="row-action" data-name="img_edit" class="{0}"></span><span data-role="row-action" data-name="img_delete" class="{1}"></span>';
let editImages: string = undefined, viewImages: string = undefined;

export class ActionsCell extends BaseCell<ActionsColumn> {
    constructor(options: ICellOptions) {
        super(options);
        dom.addClass([this._td], [css.rowActions, css.nobr].join(" "));
        this._createButtons(this._row.isEditing);
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        let $el = $(this._td);
        let $imgs = $el.find(actionsSelector);
        $imgs.each(function (index, img) {
            let $img = $(img);
            $img.removeData();
        });
        super.destroy();
    }
    private _setupImages($images: JQuery) {
        let self = this;
        $images.each(function (index: number, img: HTMLElement) {
            let $img = $(img);
            $img.data("cell", self);
            let name = $img.attr(DATA_ATTR.DATA_NAME);
            fn_addToolTip($img, STRS.TEXT[txtMap[name]]);
            $img.attr(DATA_ATTR.DATA_EVENT_SCOPE, self._column.uniqueID);
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
        if (!this._td)
            return;

        let self = this, $el = $(this._td), $newElems: JQuery;

        $el.empty();
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
        $el.append($newElems);
    }
    update() {
        if (!this._row)
            return;
        if (this._isEditing !== this._row.isEditing) {
            this._createButtons(this._row.isEditing);
        }
    }
    toString() {
        return "ActionsCell";
    }
    get isCanEdit() { return this.grid.isCanEdit; }
    get isCanDelete() { return this.grid.isCanDelete; }
}