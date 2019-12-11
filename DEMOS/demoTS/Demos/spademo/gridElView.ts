import * as RIAPP from "jriapp";
import * as uiMOD from "jriapp_ui";
import * as COMMON from "common";

export class GridElView extends uiMOD.DataGridElView {
    private _myGridEvents: COMMON.IGridEvents<RIAPP.ICollectionItem>;

    constructor(el: HTMLTableElement, options: uiMOD.IDataGridViewOptions) {
        super(el, options);
        const self = this, grid = self.grid;
        //example of binding to dataGrid events using strongly typed methods
        if (!!grid) {
            grid.addOnPageChanged(function (s, a) {
                self._onGridPageChanged();
            }, self.uniqueID);
            grid.addOnRowSelected(function (s, a) {
                self._onGridRowSelected(a.row);
            }, self.uniqueID);
            grid.addOnRowExpanded(function (s, a) {
                self._onGridRowExpanded(a.collapsedRow, a.expandedRow, a.isExpanded);
            }, self.uniqueID);
        }
    }
    protected _onGridPageChanged() {
        if (!!this._myGridEvents) {
            this._myGridEvents.onDataPageChanged();
        }
    }
    protected _onGridRowSelected(row: uiMOD.DataGridRow) {
        if (!!this._myGridEvents) {
            this._myGridEvents.onRowSelected(row.item);
        }
    }
    protected _onGridRowExpanded(oldRow: uiMOD.DataGridRow, row: uiMOD.DataGridRow, isExpanded: boolean) {
        if (!!this._myGridEvents) {
            if (isExpanded) {
                this._myGridEvents.onRowExpanded(row.item);
            }
            else {
                this._myGridEvents.onRowCollapsed(oldRow.item);
            }
        }
    }
    dispose() {
        if (this.getIsDisposed())
            return;
        this.setDisposing();
        if (!!this._myGridEvents) {
            this._myGridEvents.regFocusGridFunc(null);
        }
        this._myGridEvents = null;
        super.dispose();
    }
    get myGridEvents() { return this._myGridEvents; }
    set myGridEvents(v) {
        const self = this;
        if (this._myGridEvents !== v) {
            if (!!this._myGridEvents) {
                this._myGridEvents.regFocusGridFunc(null);
            }
            this._myGridEvents= v;
            this.objEvents.raiseProp('myGridEvents');
            //a new gridEvents object was set
            if (!!this._myGridEvents) {
                this._myGridEvents.regFocusGridFunc(() => {
                    if (!!self.grid) {
                        self.grid.focus();
                    }
                });
            }
        }
    }
}

export function initModule(app: RIAPP.Application) {
    app.registerElView('my_grid', GridElView);
}