/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { LocaleSTRS as STRS, Utils } from "jriapp_shared";
import { DomUtils } from "jriapp/utils/dom";
import { DATA_ATTR, } from "jriapp/const";
import { ButtonCss } from "jriapp/int";
import { fn_addToolTip } from "../../baseview";

import { css, actionsSelector, txtMap } from "../const";
import { BaseCell, ICellOptions } from "./base";
import { ActionsColumn } from "../columns/actions";

const utils = Utils, dom = DomUtils, strUtils = utils.str, checks = utils.check;
export const editName = "img_edit", deleteName = "img_delete";
const _editBtnsHTML = '<span data-role="row-action" data-name="img_ok" class="{0}"></span><span data-role="row-action" data-name="img_cancel" class="{1}"></span>';
const _viewBtnsHTML = '<span data-role="row-action" data-name="img_edit" class="{0}"></span><span data-role="row-action" data-name="img_delete" class="{1}"></span>';
let editBtnsHTML: string = checks.undefined, viewBtnsHTML: string = checks.undefined;

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
        const td = this.td, btns = dom.queryAll<HTMLElement>(td, actionsSelector);
        btns.forEach((img) => {
            dom.removeData(img);
        });
        super.destroy();
    }
    private _setupButtons(buttons: HTMLElement[]) {
        const self = this;
        buttons.forEach((btn) => {
            dom.setData(btn, "cell", self);
            const name = btn.getAttribute(DATA_ATTR.DATA_NAME);
            fn_addToolTip(btn, STRS.TEXT[txtMap[name]]);
            btn.setAttribute(DATA_ATTR.DATA_EVENT_SCOPE, self.column.uniqueID);
        });
    }
    protected get editBtnsHTML() {
        if (!editBtnsHTML)
            editBtnsHTML = strUtils.format(_editBtnsHTML, ButtonCss.OK, ButtonCss.Cancel);
        return editBtnsHTML;
    }
    protected get viewBtnsHTML() {
        if (!viewBtnsHTML)
            viewBtnsHTML = strUtils.format(_viewBtnsHTML, ButtonCss.Edit, ButtonCss.Delete);
        return viewBtnsHTML;
    }
    protected _createButtons(isEditing: boolean) {
        if (!this.td)
            return;

        const self = this, td = this.td;
        td.innerHTML = "";

        if (isEditing) {
            self._isEditing = true;
            const editBtns = dom.fromHTML(self.editBtnsHTML);
            self._setupButtons(editBtns);
            dom.append(td, editBtns);
        }
        else {
            self._isEditing = false;
            let viewBtns = dom.fromHTML(self.viewBtnsHTML);
            if (!self.isCanEdit || !self.isCanDelete) {
                viewBtns = viewBtns.filter((el) => {
                    const attr = el.getAttribute(DATA_ATTR.DATA_NAME);
                    if (!self.isCanEdit && (editName === attr)) {
                        return false;
                    }
                    if (!self.isCanDelete && (deleteName === attr)) {
                        return false;
                    }
                    return true;
                });
            }
            self._setupButtons(viewBtns);
            dom.append(td, viewBtns);
        }
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