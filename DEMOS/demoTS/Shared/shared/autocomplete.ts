﻿import * as RIAPP from "jriapp";
import * as dbMOD from "jriapp_db";
import * as uiMOD from "jriapp_ui";
import * as COMMON from "./common";

let bootstrap = RIAPP.bootstrap, utils = RIAPP.Utils, $ = uiMOD.$, dom = RIAPP.DOM;

function findElemViewInTemplate(template: RIAPP.ITemplate, name: string) {
    //look by data-name attribute value
    let arr = template.findElViewsByDataName(name);
    if (!!arr && arr.length > 0)
        return arr[0];
    else
        return null;
}

function findElemInTemplate(template: RIAPP.ITemplate, name: string) {
    let arr = template.findElByDataName(name);
    if (!!arr && arr.length > 0)
        return arr[0];
    else
        return null;
}

export interface IAutocompleteOptions extends RIAPP.IViewOptions {
    dbContext: string;
    templateId: string;
    fieldName: string;
    dbSetName: string;
    queryName: string;
    minTextLength: number;
    width?: any;
    height?: any;
}

export class AutoCompleteElView extends uiMOD.InputElView implements RIAPP.ITemplateEvents {
    private _templateId: string;
    private _fieldName: string;
    private _dbSetName: string;
    private _queryName: string;
    private _template: RIAPP.ITemplate;
    protected _gridDataSource: RIAPP.ICollection<RIAPP.ICollectionItem>;
    private _prevText: string;
    private _selectedItem: RIAPP.ICollectionItem;
    private _$dropDown: JQuery;
    private _loadTimeout: any;
    private _dataContext: any;
    private _isLoading: boolean;
    private _width: any;
    private _height: any;
    private _$dlg: JQuery;
    private _isOpen: boolean;
    private _lookupGrid: uiMOD.DataGrid;
    private _btnOk: HTMLElement;
    private _btnCancel: HTMLElement;
    private _dbContextName: string;
    private _minTextLength: number;

    templateLoading(template: RIAPP.ITemplate): void {
        //noop
    }
    templateLoaded(template: RIAPP.ITemplate, error?: any): void {
        if (this.getIsDestroyCalled() || error)
            return;
        const self = this, gridElView = <uiMOD.DataGridElView>findElemViewInTemplate(template, 'lookupGrid');
        if (!!gridElView) {
            this._lookupGrid = gridElView.grid;
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
    constructor(options: IAutocompleteOptions) {
        super(options);
        const self = this;
        this._templateId = options.templateId;
        this._fieldName = options.fieldName;
        this._dbSetName = options.dbSetName;
        this._queryName = options.queryName;
        this._dbContextName = options.dbContext;
        this._minTextLength = (!!options.minTextLength) ? options.minTextLength : 1;
        this._template = null;
        this._gridDataSource = null;
        this._prevText = null;
        this._selectedItem = null;
        this._template = null;
        this._$dropDown = null;
        this._loadTimeout = null;
        this._dataContext = null;
        this._isLoading = false;
        this._lookupGrid = null;
        this._btnOk = null;
        this._btnCancel = null;
        this._width = options.width || '200px';
        this._height = options.height || '330px';
        this._$dlg = null;
        const $el = $(this.el);

        $el.on('change.' + this.uniqueID, function (e) {
            e.stopPropagation();
            self._onTextChange();
            self.raisePropertyChanged('value');
        });
        $el.on('keyup.' + this.uniqueID, function (e) {
            e.stopPropagation();
            self._onKeyUp((<any>e.target).value, e.keyCode);
            self._onKeyPress(e.keyCode);
        });
        $el.on('keypress.' + this.uniqueID, function (e) {
            e.stopPropagation();
        });

        this._isOpen = false;
        this._createGridDataSource();
        this._template = this._createTemplate();
        this._$dropDown = $(dom.document.createElement("div"));
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
        this._$dropDown.append(this._template.el);
        this._template.el.style.height = '100%';
        this._template.el.style.width = '100%';

        dom.document.body.appendChild(this._$dropDown.get(0));
    }
    protected _createGridDataSource() {
        this._gridDataSource = this._getDbContext().getDbSet(this._dbSetName);
        if (!this._gridDataSource) {
            throw new Error(utils.str.format('dbContext does not contain dbSet with the name: {0}', this._dbSetName))
        }
    }
    protected _getDbContext(): dbMOD.DbContext {
        const dbContext = this.app.getObject<dbMOD.DbContext>(this._dbContextName);
        if (!dbContext) {
            throw new Error(utils.str.format('dbContext with the name: {0} is not registered', this._dbContextName))
        }
        return dbContext;
    }
    protected _getEventNames() {
        const base_events = super._getEventNames();
        return ['hide', 'show'].concat(base_events);
    }
    protected _createTemplate(): RIAPP.ITemplate {
        const t = RIAPP.createTemplate(this, this);
        t.templateID = this._templateId;
        return t;
    }
    protected _onTextChange() {
    }
    protected _onKeyUp(text: string, keyCode: number) {
        const self = this;
        clearTimeout(this._loadTimeout);
        if (!!text && text.length >= self._minTextLength) {
            this._loadTimeout = setTimeout(function () {
                if (self.getIsDestroyCalled()) {
                    return;
                }

                if (self._prevText != text) {
                    self._prevText = text;
                    if (!((keyCode === RIAPP.KEYS.esc) || (keyCode == RIAPP.KEYS.enter))) {
                        if (!self._isOpen) {
                            self._open();
                        }
                        self.load(text);
                    }
                }
            }, 500);
        } else {
            self.gridDataSource.clear();
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
    protected _updateSelection() {
        this.value = this.currentSelection;
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
        this.raiseEvent('show', {});
    }
    protected _onHide() {
        this.raiseEvent('hide', {});
        this.raisePropertyChanged("value");
    }
    protected _open() {
        if (this._isOpen)
            return;
        const self = this, $dlg = $(this.el).closest(".ui-dialog"), txtEl = self.el;

        this._$dlg = $dlg;
        const ns = "dialogdrag." + this.uniqueID;
        
        $dlg.on(ns, null, (event) => {
            if (!self._isOpen)
                return null;
            self._updatePosition();
            return null;
        });

        this._updatePosition();

        if (!!this._lookupGrid) {
            this._lookupGrid.addOnCellDblClicked(function (s, a) {
                self._updateSelection();
                self._hide();
            }, this.uniqueID);

            bootstrap.currentSelectable = self._lookupGrid;

            $(dom.document).on('keyup.' + this.uniqueID, function (e) {
                if (bootstrap.currentSelectable === self._lookupGrid) {
                    if (self._onKeyPress(e.which))
                        e.stopPropagation();
                }
            });

            $(dom.document).on('mousedown.' + this.uniqueID, function (e) {
                if (dom.isContained(e.target, $dlg.get(0)) || dom.isContained(e.target, txtEl)) {
                    self._hideAsync();
                }
            });
        }
        this._isOpen = true;
        this._onShow();
    }
    protected _hide() {
        if (!this._isOpen)
            return;
        $(dom.document).off('.' + this.uniqueID);
        this._$dlg.off('.' + this.uniqueID);
        if (!!this._lookupGrid) {
            this._lookupGrid.removeNSHandlers(this.uniqueID);
        }
        this._$dropDown.css({ left: "-2000px" });
        this._isOpen = false;
        this._onHide();
    }
    load(str: string) {
        const self = this, query = (<dbMOD.TDbSet>this.gridDataSource).createQuery(this._queryName);
        query.pageSize = 50;
        query.isClearPrevData = true;
        COMMON.addTextQuery(query, this._fieldName, str + '%');
        query.orderBy(this._fieldName);
        this._isLoading = true;
        this.raisePropertyChanged('isLoading');
        query.load().always(function (res) {
            self._isLoading = false;
            self.raisePropertyChanged('isLoading');
        });
    }
    protected getDataContext(): RIAPP.IBaseObject {
        return this._dataContext;
    }
    protected setDataContext(v: RIAPP.IBaseObject) {
        const old: RIAPP.IBaseObject = this._dataContext;
        if (this._dataContext !== v) {
            if (!!old) {
                old.removeNSHandlers(this.uniqueID);
            }
            this._dataContext = v;
            this.raisePropertyChanged('dataContext');
            if (!this._dataContext) {
                this._hideAsync();
            }
        }
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this._hide();
        $(this.el).off('.' + this.uniqueID);
        if (!!this._lookupGrid) {
            this._lookupGrid = null;
        }
        if (!!this._template) {
            this._template.destroy();
            this._template = null;
            this._$dropDown = null;
        }
        this._gridDataSource = null;
        this._dataContext = null;
        super.destroy();
    }
    //field name for lookup in dbSet
    get fieldName() { return this._fieldName; }
    get templateId() { return this._templateId; }
    get currentSelection(): any {
        if (this._gridDataSource.currentItem) {
            return (<any>this._gridDataSource.currentItem)[this._fieldName];
        } else {
            return null;
        }
    }
    //template instance of drop down area (which contains datagrid) under textbox
    get template(): RIAPP.ITemplate { return this._template; }
    //Entity which is databound to the textbox
    get dataContext(): RIAPP.IBaseObject { return this.getDataContext(); }
    set dataContext(v) {
        this.setDataContext(v);
    }
    //dbSet for a datagrid's dataSource (for lookup values)
    get gridDataSource(): RIAPP.ICollection<RIAPP.ICollectionItem> { return this._gridDataSource; }
    get value(): string {
        return (<HTMLInputElement>this.el).value;
    }
    set value(v) {
        const x = this.value, str = "" + v;
        v = (!v) ? "" : str;
        if (x !== v) {
            (<HTMLInputElement>this.el).value = v;
            this._prevText = v;
            this.raisePropertyChanged("value");
        }
    }
    get isLoading() {
        return this._isLoading;
    }
}

//this function is executed when an application which uses this namespace is created
export function initModule(app: RIAPP.Application) {
    app.registerElView('autocomplete', AutoCompleteElView);
};