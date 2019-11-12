import * as RIAPP from "jriapp";
import * as uiMOD from "jriapp_ui";

const bootstrap = RIAPP.bootstrap, utils = RIAPP.Utils, $ = uiMOD.$, dom = RIAPP.DOM;

function findElemViewInTemplate(template: RIAPP.ITemplate, name: string) {
    //look by data-name attribute value
    const arr = template.findElViewsByDataName(name);
    return (!!arr && arr.length > 0) ? arr[0] : null;
}

function findElemInTemplate(template: RIAPP.ITemplate, name: string) {
    const arr = template.findElByDataName(name);
    return (!!arr && arr.length > 0) ? arr[0] : null;
}

export interface IDropDownBoxOptions extends RIAPP.IViewOptions {
    templateId: string;
    valuePath: string;
    textPath: string;
    width?: any;
    height?: any;
}

export interface IDropDownBoxConstructorOptions extends IDropDownBoxOptions {
    dataSource?: RIAPP.ICollection<RIAPP.ICollectionItem>;
}

export class DropDownBoxElView extends uiMOD.InputElView implements RIAPP.ITemplateEvents {
    private _templateId: string;
    private _valuePath: string;
    private _textPath: string;
    private _width: any;
    private _height: any;
    private _template: RIAPP.ITemplate;
    protected _dataSource: RIAPP.ICollection<RIAPP.ICollectionItem>;
    private _$dropDown: JQuery;
    private _isOpen: boolean;
    private _grid: uiMOD.DataGrid;
    private _btnOk: HTMLElement;
    private _btnCancel: HTMLElement;
    private _selected1: RIAPP.IIndexer<{ val: any; text: string; }>;
    private _selected: RIAPP.IIndexer<{ val: any; text: string; }>;
    private _selectedCount: number;
    private _btn: HTMLButtonElement;

    templateLoading(template: RIAPP.ITemplate): void {
        //noop
    }
    templateLoaded(template: RIAPP.ITemplate, error?: any): void {
        if (this.getIsStateDirty() || error)
            return;
        const self = this, gridElView = <uiMOD.DataGridElView>findElemViewInTemplate(template, 'lookupGrid');
        if (!!gridElView) {
            this._grid = gridElView.grid;
        }
        this._btnOk = findElemInTemplate(template, 'btnOk');
        this._btnCancel = findElemInTemplate(template, 'btnCancel');
        $(this._btnOk).click(() => {
            self._updateSelection();
            self._hide();
        });
        $(this._btnCancel).click(() => {
            self._hide();
        });
    }
    templateUnLoading(template: RIAPP.ITemplate): void {
    }

    constructor(el: HTMLInputElement, options: IDropDownBoxConstructorOptions) {
        super(el, options);
        const self = this;
        this._templateId = options.templateId;
        if (!!options.dataSource && !utils.sys.isCollection(options.dataSource)) {
            throw new Error("Не задан источник данных");
        }

        this._template = null;
        this._valuePath = options.valuePath;
        this._textPath = options.textPath;
        this._dataSource = options.dataSource;

        this._selected = {};
        this._selectedCount = 0;
        this._selected1 = {};
        this._$dropDown = null;
        this._grid = null;
        this._btnOk = null;
        this._btnCancel = null;
        this._width = options.width || '250px';
        this._height = options.height || '330px';

        const $el = $(this.el);

        $el.on('click.' + this.uniqueID, function (e) {
            e.stopPropagation();
            self._onClick();
        });
        $el.on('keyup.' + this.uniqueID, function (e) {
            e.stopPropagation();
            self._onKeyPress(e.keyCode);
        });
        $el.on('keypress.' + this.uniqueID, function (e) {
            e.stopPropagation();
        });

        this._isOpen = false;
        const parentEl = dom.document.createElement("div");
        this._template = this._createTemplate(parentEl);
        this._$dropDown = $(parentEl);
        this._$dropDown.css({
            "position": "absolute",
            "z-index": "10000",
            "left": "-2000px",
            "top": "-1000px",
            "background-color": "white",
            "border": "1px solid gray",
            "width": this._width,
            "height": this._height
        });
        dom.document.body.appendChild(parentEl);

        const btn = dom.document.createElement("button");
        btn.innerHTML = "...";
        btn.type = "button";
        $el.after(btn);
        dom.addClass([btn], "btn lnkbtn btn-info");
        this._btn = btn;
        $(btn).on('click.' + this.uniqueID, function (e) {
            e.stopPropagation();
            self._onClick();
        });
        this._updateSelection();
    }
    viewMounted(): void {
        
    }
    protected _createTemplate(parentEl: HTMLElement): RIAPP.ITemplate {
        const t = RIAPP.createTemplate({ parentEl: parentEl, dataContext: this, templEvents: this });
        t.templateID = this._templateId;
        return t;
    }
    protected _onClick(): void {
        const self = this;
        if (!self._isOpen) {
            self._open();
        }
    }
    protected _onKeyPress(keyCode: number): boolean {
        if (keyCode === RIAPP.KEYS.enter) {
            this._updateSelection();
        }

        if (keyCode === RIAPP.KEYS.esc || keyCode === RIAPP.KEYS.tab || keyCode === RIAPP.KEYS.enter) {
            this._hideAsync();
            return true;
        }
        return false;
    }
    protected _hideAsync(): RIAPP.IPromise<void> {
        const self = this;
        return utils.defer.delay(() => {
            self._hide();
        }, 100);
    }
    protected _updatePosition() {
        (<any>this._$dropDown).position(<any>{
            my: "left top",
            at: "left bottom",
            of: $(this.el),
            offset: "0 0"
        });
    }
    protected _onShow() {
        this.objEvents.raise('show', {});
    }
    protected _onHide() {
        this.objEvents.raise('hide', {});
    }
    protected _open() {
        if (this._isOpen)
            return;
        const self = this;

        if (!!this._grid) {
            const dlg = this._$dropDown.get(0), txtEl = self.el;

            $(dom.document).on('mousedown.' + this.uniqueID, function (e) {
                if (!(dom.isContained(e.target, dlg) || dom.isContained(e.target, txtEl))) {
                    self._hideAsync();
                }
            });
          
            this._grid.addOnCellDblClicked(function (_s, a) {
                self._hide();
            }, this.uniqueID);

            this._grid.addOnRowSelected(function (_s, args) {
                self.onRowSelected(args.row);
            }, this.uniqueID, this);

            bootstrap.selectedControl = self._grid;

            $(dom.document).on('keyup.' + this.uniqueID, function (e) {
                if (bootstrap.selectedControl === self._grid) {
                    if (self._onKeyPress(e.which))
                        e.stopPropagation();
                }
            });
        }

        this._onOpen();
        this._updatePosition();
        this._isOpen = true;
        this._onShow();
    }
    protected _onOpen(): void {
        const self = this, ids = Object.keys(this._selected), grid = self._grid;
        // console.log("open " + ids.length);
        ids.forEach(function (id) {
            const item = self.dataSource.getItemByKey(id);

            let row;
            if (!!item) {
                row = grid.findRowByItem(item);
                if (!!row) {
                    row.isSelected = true;
                }
            }
        });
        this._selected1 = { ...this._selected };
    }
    protected _hide() {
        if (!this._isOpen)
            return;
        this._clear(false);
        
        $(dom.document).off('.' + this.uniqueID);
        if (!!this._grid) {
            this._grid.objEvents.offNS(this.uniqueID);
        }
        this._$dropDown.css({ left: "-2000px" });
        this._isOpen = false;
        this._onHide();
    }
    protected onRowSelected(row: uiMOD.DataGridRow): void {
        if (!!this._selected1) {
            this._selectItem(row.item, row.isSelected);
        }
    }
    private _selectItem(item: RIAPP.ICollectionItem, isSelected: boolean): void {
        const val = utils.core.getValue(item, this._valuePath);
        const text = utils.core.getValue(item, this._textPath);
        const selected = this._selected1;
        const obj = utils.core.getValue(selected, "" + val);

        if (isSelected) {
            if (!obj) {
                utils.core.setValue(selected, "" + val, { v: val, text: text });
            }
        }
        else {
            if (!!obj) {
                delete selected["" + val];
            }
        }
    }
    protected _updateSelection(): void {
        this._selected = { ...this._selected1 };
        this.selectedCount = Object.keys(this._selected).length;
        this.value = `Selected: ${this._selectedCount}`;
        this.objEvents.raiseProp("selected");
        this.objEvents.raiseProp("info");
    }
    dispose() {
        if (this.getIsDisposed())
            return;
        this.setDisposing();
        this._hide();
        $(this.el).off('.' + this.uniqueID);
        if (!!this._grid) {
            this._grid = null;
        }
        if (!!this._template) {
            this._template.dispose();
            this._template = null;
            this._$dropDown = null;
        }
        $(this._btn).remove();
        this._selected = {};
        this._selectedCount = 0;
        this._selected1 = {};
        this._dataSource = null;
        super.dispose();
    }
    private _clear(updateSelection: boolean) {
        this._selected1 = null;
        try {
            this._grid.selectRows(false);
        }
        finally {
            this._selected1 = {};
        }

        if (updateSelection) {
            this._updateSelection();
        }
    }
    get templateId() { return this._templateId; }
    get info(): string {
        if (this.selectedCount == 0)
            return "Nothing selected";
        let res: string[] = [];
        utils.core.forEach(this._selected, (k, v) => { res.push(v.text); });
        return res.sort().join(",");
    }
    get selected(): Array<number> {
        if (this.selectedCount == 0)
            return [];
        return Object.keys(this._selected).map((v) => parseInt(v));

    }
    set selected(v: Array<number> | null) {
        if (!v && this.selectedCount > 0) {
            this._clear(true);
        }
    }
    get template(): RIAPP.ITemplate { return this._template; }
    get dataSource(): RIAPP.ICollection<RIAPP.ICollectionItem> { return this._dataSource; }
    get value(): string {
        return (<HTMLInputElement>this.el).value;
    }
    set value(v) {
        const x = this.value, str = "" + v;
        v = (!v) ? "" : str;
        if (x !== v) {
            (<HTMLInputElement>this.el).value = v;
            this.objEvents.raiseProp("value");
        }
    }
    get selectedCount() { return this._selectedCount; }
    set selectedCount(v) {
        const old = this._selectedCount;
        if (old !== v) {
            this._selectedCount = v;
            this.objEvents.raiseProp('selectedCount');
        }
    }

}

//this function is executed when an application which uses this namespace is created
export function initModule(app: RIAPP.Application) {
    app.registerElView('dropdownbox', DropDownBoxElView);
}