/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { LocaleSTRS as STRS, Utils } from "jriapp_shared";
import { DomUtils } from "jriapp/utils/dom";
import { DATA_ATTR, } from "jriapp/const";
import { ButtonCss } from "jriapp/int";
import { fn_addToolTip } from "../../baseview";

import { css, actionsSelector, txtMap } from "../const";
import { BaseCell, ICellOptions } from "./base";
import { ActionsColumn } from "../columns/actions";

const utils = Utils, dom = DomUtils, strUtils = utils.str; //, checks = utils.check;
export const editName = "img_edit", deleteName = "img_delete";
const _editBtnsHTML = ['<span data-role="row-action" data-name="img_ok" class="{0}"></span>','<span data-role="row-action" data-name="img_cancel" class="{1}"></span>'];
const _viewBtnsHTML = ['<span data-role="row-action" data-name="img_edit" class="{0}"></span>', '<span data-role="row-action" data-name="img_delete" class="{1}"></span>'];
let editBtnsHTML: string[] = null, viewBtnsHTML: string[] = null;

export class ActionsCell extends BaseCell<ActionsColumn> {
    private _isEditing: boolean;

    constructor(options: ICellOptions) {
        super(options);
        this._isEditing = false;
        dom.addClass([this.td], [css.rowActions, css.nobr].join(" "));
        this._createButtons(this.row.isEditing);
    }
    dispose(): void {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        this._cleanUp(this.td);
        super.dispose();
    }
    private _setupButtons(btns: Element[]): void {
        const self = this, isActionsToolTips = self.grid.options.isActionsToolTips;
        btns.forEach((el) => {
            dom.setData(el, "cell", self);
            const name = el.getAttribute(DATA_ATTR.DATA_NAME);
            if (isActionsToolTips) {
                fn_addToolTip(el, STRS.TEXT[txtMap[name]]);
            }
            el.setAttribute(DATA_ATTR.DATA_EVENT_SCOPE, self.column.uniqueID);
        });
    }
    private _cleanUp(td: HTMLTableCellElement): void {
        const self = this, btns = dom.queryAll<Element>(td, actionsSelector),
            isActionsToolTips = self.grid.options.isActionsToolTips;
        btns.forEach((el) => {
            dom.removeData(el);
            if (isActionsToolTips) {
                fn_addToolTip(el, null);
            }
        });
    }
    protected get editBtnsHTML(): string[] {
        if (!editBtnsHTML) {
            editBtnsHTML = _editBtnsHTML.map((str) => strUtils.format(str, ButtonCss.OK, ButtonCss.Cancel));
        }
        return editBtnsHTML;
    }
    protected get viewBtnsHTML(): string[] {
        if (!viewBtnsHTML) {
            viewBtnsHTML = _viewBtnsHTML.map((str) => strUtils.format(str, ButtonCss.Edit, ButtonCss.Delete));
        }
        return viewBtnsHTML;
    }
    protected _createButtons(isEditing: boolean): void {
        const self = this, td = this.td;
        this._cleanUp(td);
        td.innerHTML = "";
        let btns: HTMLElement[];
        if (isEditing) {
            self._isEditing = true;
            btns = self.editBtnsHTML.map((str) => dom.fromHTML(str)).map((arr) => arr[0]);
        } else {
            self._isEditing = false;
            // index== 0 -> edit, index==1 -> delete
            btns = self.viewBtnsHTML.map((str, index) => {
                if (!self.isCanEdit && index === 0) {
                    return null;
                } else if (!self.isCanDelete && index === 1) {
                    return null;
                } else {
                    return dom.fromHTML(str);
                }
            }).filter((arr) => !!arr).map((arr) => arr[0]);
        }
        self._setupButtons(btns);
        dom.append(td, btns);
    }
    update(): void {
        if (this._isEditing !== this.row.isEditing) {
            this._createButtons(this.row.isEditing);
        }
    }
    toString(): string {
        return "ActionsCell";
    }
    get isCanEdit(): boolean { return this.grid.isCanEdit; }
    get isCanDelete(): boolean { return this.grid.isCanDelete; }
}
