import { Utils as utils } from "jriapp_utils/utils";

import { css, PROP_NAME } from "../const";
import { BaseColumn, ICellInfo } from "./base";
import { DataGrid } from "../datagrid";

const $ = utils.dom.$;

export class RowSelectorColumn extends BaseColumn {
    private _val: boolean;
    private _$chk: JQuery;

    constructor(grid: DataGrid, options: ICellInfo) {
        super(grid, options);
        let self = this;
        this._val = false;
        this.$col.addClass(css.rowSelector);
        let $chk = $('<input type="checkbox"/>');
        this.$col.append($chk);
        this._$chk = $chk;
        $chk.click(function (e) {
            e.stopPropagation();
            self._onCheckBoxClicked(this.checked);
        });
        $chk.on("change", function (e) {
            e.stopPropagation();
            self.checked = this.checked;
        });
    }
    protected _onCheckBoxClicked(isChecked: boolean) {
        this.grid.selectRows(isChecked);
    }
    toString() {
        return "RowSelectorColumn";
    }
    get checked() { return this._val; }
    set checked(v) {
        let $el = this._$chk;
        if (v !== null)
            v = !!v;
        if (v !== this._val) {
            this._val = v;
            if (!!$el)
                $el.prop("checked", !!this._val);
            this.raisePropertyChanged(PROP_NAME.checked);
        }
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this._$chk.off();
        this._$chk.remove();
        this._$chk = null;
        super.destroy();
    }
}