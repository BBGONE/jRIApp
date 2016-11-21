/// <reference path="jriapp.d.ts" />
/// <reference path="jriapp_shared.d.ts" />
declare module "jriapp_ui/content/int" {
    import { IContentOptions, ITemplateInfo } from "jriapp/shared";
    export const css: {
        content: string;
        required: string;
        checkbox: string;
    };
    export interface IDataContentAttr {
        fieldName?: string;
        readOnly?: boolean;
        css?: {
            displayCss: string;
            editCss: string;
        };
        template?: ITemplateInfo;
        name?: string;
        options?: any;
    }
    export function parseContentAttr(content_attr: string): IContentOptions;
}
declare module "jriapp_ui/content/basic" {
    import { IBaseObject, IFieldInfo, BaseObject } from "jriapp_shared";
    import { IApplication, IContent, IContentOptions, IConstructorContentOptions, ILifeTimeScope, IElView, IViewOptions, IBindingInfo, IBindingOptions } from "jriapp/shared";
    import { Binding } from "jriapp/binding";
    export class BasicContent extends BaseObject implements IContent {
        protected _parentEl: HTMLElement;
        protected _el: HTMLElement;
        protected _options: IContentOptions;
        protected _isReadOnly: boolean;
        private _isEditing;
        protected _dataContext: any;
        protected _lfScope: ILifeTimeScope;
        protected _target: IElView;
        constructor(options: IConstructorContentOptions);
        protected updateCss(): void;
        protected getIsCanBeEdited(): boolean;
        protected createTargetElement(): IElView;
        protected getBindingOption(bindingInfo: IBindingInfo, target: IBaseObject, dataContext: any, targetPath: string): IBindingOptions;
        protected getBindings(): Binding[];
        protected updateBindingSource(): void;
        protected cleanUp(): void;
        protected getElementView(el: HTMLElement, view_info: {
            name: string;
            options: IViewOptions;
        }): IElView;
        protected getFieldInfo(): IFieldInfo;
        render(): void;
        destroy(): void;
        toString(): string;
        readonly parentEl: HTMLElement;
        readonly target: IElView;
        isEditing: boolean;
        dataContext: any;
        readonly app: IApplication;
    }
}
declare module "jriapp_ui/content/template" {
    import { BaseObject } from "jriapp_shared";
    import { IContent, IApplication, ITemplate, IConstructorContentOptions } from "jriapp/shared";
    export class TemplateContent extends BaseObject implements IContent {
        private _parentEl;
        private _template;
        private _templateInfo;
        private _isEditing;
        private _dataContext;
        private _isDisabled;
        private _templateID;
        constructor(options: IConstructorContentOptions);
        private getTemplateID();
        private createTemplate();
        protected cleanUp(): void;
        render(): void;
        destroy(): void;
        toString(): string;
        readonly parentEl: HTMLElement;
        readonly template: ITemplate;
        isEditing: boolean;
        dataContext: any;
        readonly app: IApplication;
    }
}
declare module "jriapp_ui/utils/eventbag" {
    import { BaseObject, IPropertyBag } from "jriapp_shared";
    import { ICommand } from "jriapp/mvvm";
    export const enum EVENT_CHANGE_TYPE {
        None = 0,
        Added = 1,
        Deleted = 2,
        Updated = 3,
    }
    export interface IEventChangedArgs {
        name: string;
        changeType: EVENT_CHANGE_TYPE;
        oldVal: ICommand;
        newVal: ICommand;
    }
    export class EventBag extends BaseObject implements IPropertyBag {
        private _dic;
        private _onChange;
        constructor(onChange: (sender: EventBag, args: IEventChangedArgs) => void);
        _isHasProp(prop: string): boolean;
        getProp(name: string): ICommand;
        setProp(name: string, command: ICommand): void;
        trigger(name: string, args?: any): void;
        toString(): string;
        destroy(): void;
    }
}
declare module "jriapp_ui/utils/propbag" {
    import { BaseObject, IPropertyBag } from "jriapp_shared";
    export class PropertyBag extends BaseObject implements IPropertyBag {
        private _el;
        constructor(el: HTMLElement);
        _isHasProp(prop: string): boolean;
        getProp(name: string): any;
        setProp(name: string, val: any): void;
        toString(): string;
    }
}
declare module "jriapp_ui/utils/cssbag" {
    import { BaseObject, IPropertyBag } from "jriapp_shared";
    export class CSSBag extends BaseObject implements IPropertyBag {
        private _el;
        constructor(el: Element);
        _isHasProp(prop: string): boolean;
        getProp(name: string): any;
        setProp(name: string, val: any): void;
        toString(): string;
    }
}
declare module "jriapp_ui/utils/tooltip" {
    import { ITooltipService } from "jriapp/shared";
    export const css: {
        toolTip: string;
        toolTipError: string;
    };
    export function createToolTipSvc(): ITooltipService;
}
declare module "jriapp_ui/generic" {
    import { BaseObject, IPropertyBag, IValidationInfo } from "jriapp_shared";
    import { IElView, IApplication, IViewOptions } from "jriapp/shared";
    import { ICommand } from "jriapp/mvvm";
    import { EVENT_CHANGE_TYPE, IEventChangedArgs } from "jriapp_ui/utils/eventbag";
    export { IEventChangedArgs, EVENT_CHANGE_TYPE };
    export function fn_addToolTip($el: JQuery, tip: string, isError?: boolean, pos?: string): void;
    export const css: {
        fieldError: string;
        commandLink: string;
        checkedNull: string;
        disabled: string;
        opacity: string;
        color: string;
        fontSize: string;
    };
    export const PROP_NAME: {
        isVisible: string;
        validationErrors: string;
        toolTip: string;
        css: string;
        isEnabled: string;
        value: string;
        command: string;
        disabled: string;
        commandParam: string;
        isBusy: string;
        delay: string;
        checked: string;
        color: string;
        wrap: string;
        text: string;
        html: string;
        preventDefault: string;
        imageSrc: string;
        glyph: string;
        href: string;
        fontSize: string;
        borderColor: string;
        borderStyle: string;
        width: string;
        height: string;
        src: string;
        click: string;
    };
    export class BaseElView extends BaseObject implements IElView {
        private _objId;
        private _$el;
        protected _errors: IValidationInfo[];
        protected _toolTip: string;
        private _eventStore;
        private _props;
        private _classes;
        private _display;
        private _css;
        constructor(options: IViewOptions);
        private _getStore();
        protected _onEventChanged(args: IEventChangedArgs): void;
        protected _onEventAdded(name: string, newVal: ICommand): void;
        protected _onEventDeleted(name: string, oldVal: ICommand): void;
        protected _applyToolTip(): void;
        protected _getErrorTipInfo(errors: IValidationInfo[]): string;
        protected _setFieldError(isError: boolean): void;
        protected _updateErrorUI(el: HTMLElement, errors: IValidationInfo[]): void;
        protected _setToolTip($el: JQuery, tip: string, isError?: boolean): void;
        destroy(): void;
        toString(): string;
        readonly $el: JQuery;
        readonly el: HTMLElement;
        readonly uniqueID: string;
        isVisible: boolean;
        validationErrors: IValidationInfo[];
        readonly dataName: string;
        toolTip: string;
        readonly events: IPropertyBag;
        readonly props: IPropertyBag;
        readonly classes: IPropertyBag;
        css: string;
        readonly app: IApplication;
    }
}
declare module "jriapp_ui/input" {
    import { BaseElView } from "jriapp_ui/generic";
    export class InputElView extends BaseElView {
        toString(): string;
        isEnabled: boolean;
        value: string;
    }
}
declare module "jriapp_ui/textbox" {
    import { IViewOptions } from "jriapp/shared";
    import { InputElView } from "jriapp_ui/input";
    export interface ITextBoxOptions extends IViewOptions {
        updateOnKeyUp?: boolean;
    }
    export type TKeyPressArgs = {
        keyCode: number;
        value: string;
        isCancel: boolean;
    };
    export class TextBoxElView extends InputElView {
        constructor(options: ITextBoxOptions);
        protected _getEventNames(): string[];
        addOnKeyPress(fn: (sender: TextBoxElView, args: TKeyPressArgs) => void, nmspace?: string): void;
        removeOnKeyPress(nmspace?: string): void;
        toString(): string;
        color: string;
    }
}
declare module "jriapp_ui/content/string" {
    import { IFieldInfo } from "jriapp_shared";
    import { BasicContent } from "jriapp_ui/content/basic";
    export class StringContent extends BasicContent {
        static __allowedKeys: number[];
        private readonly _allowedKeys;
        protected previewKeyPress(fieldInfo: IFieldInfo, keyCode: number, value: string): boolean;
        render(): void;
        toString(): string;
    }
}
declare module "jriapp_ui/textarea" {
    import { ITextBoxOptions, TKeyPressArgs } from "jriapp_ui/textbox";
    import { BaseElView } from "jriapp_ui/generic";
    export interface ITextAreaOptions extends ITextBoxOptions {
        wrap?: string;
    }
    export class TextAreaElView extends BaseElView {
        constructor(options: ITextAreaOptions);
        protected _getEventNames(): string[];
        addOnKeyPress(fn: (sender: TextAreaElView, args: TKeyPressArgs) => void, nmspace?: string): void;
        removeOnKeyPress(nmspace?: string): void;
        toString(): string;
        value: string;
        isEnabled: boolean;
        wrap: any;
    }
}
declare module "jriapp_ui/content/multyline" {
    import { IFieldInfo } from "jriapp_shared";
    import { IElView, IConstructorContentOptions } from "jriapp/shared";
    import { BasicContent } from "jriapp_ui/content/basic";
    export class MultyLineContent extends BasicContent {
        static __allowedKeys: number[];
        private readonly _allowedKeys;
        constructor(options: IConstructorContentOptions);
        protected createTargetElement(): IElView;
        protected previewKeyPress(fieldInfo: IFieldInfo, keyCode: number, value: string): boolean;
        render(): void;
        toString(): string;
    }
}
declare module "jriapp_ui/checkbox" {
    import { IViewOptions } from "jriapp/shared";
    import { InputElView } from "jriapp_ui/input";
    export class CheckBoxElView extends InputElView {
        private _checked;
        constructor(options: IViewOptions);
        protected _updateState(): void;
        toString(): string;
        checked: boolean;
    }
}
declare module "jriapp_ui/content/bool" {
    import { IElView, IConstructorContentOptions } from "jriapp/shared";
    import { CheckBoxElView } from "jriapp_ui/checkbox";
    import { BasicContent } from "jriapp_ui/content/basic";
    export class BoolContent extends BasicContent {
        constructor(options: IConstructorContentOptions);
        protected cleanUp(): void;
        protected createCheckBoxView(): CheckBoxElView;
        protected createTargetElement(): IElView;
        protected updateCss(): void;
        render(): void;
        destroy(): void;
        toString(): string;
    }
}
declare module "jriapp_ui/content/number" {
    import { IBaseObject } from "jriapp_shared";
    import { IBindingOptions, IBindingInfo } from "jriapp/shared";
    import { BasicContent } from "jriapp_ui/content/basic";
    export class NumberContent extends BasicContent {
        static __allowedKeys: number[];
        private readonly _allowedKeys;
        protected getBindingOption(bindingInfo: IBindingInfo, tgt: IBaseObject, dctx: any, targetPath: string): IBindingOptions;
        protected previewKeyPress(keyCode: number, value: string): boolean;
        render(): void;
        toString(): string;
    }
}
declare module "jriapp_ui/content/date" {
    import { IBaseObject } from "jriapp_shared";
    import { IConstructorContentOptions, IBindingInfo, IBindingOptions, IElView } from "jriapp/shared";
    import { BasicContent } from "jriapp_ui/content/basic";
    export class DateContent extends BasicContent {
        constructor(options: IConstructorContentOptions);
        protected getBindingOption(bindingInfo: IBindingInfo, tgt: IBaseObject, dctx: any, targetPath: string): IBindingOptions;
        protected createTargetElement(): IElView;
        toString(): string;
    }
}
declare module "jriapp_ui/content/datetime" {
    import { IBaseObject } from "jriapp_shared";
    import { IBindingInfo, IBindingOptions } from "jriapp/shared";
    import { BasicContent } from "jriapp_ui/content/basic";
    export class DateTimeContent extends BasicContent {
        protected getBindingOption(bindingInfo: IBindingInfo, tgt: IBaseObject, dctx: any, targetPath: string): IBindingOptions;
        toString(): string;
    }
}
declare module "jriapp_ui/listbox" {
    import { BaseObject, TEventHandler } from "jriapp_shared";
    import { ICollection, ICollectionItem, ICollChangedArgs, ITEM_STATUS } from "jriapp_shared/collection/int";
    import { IViewOptions } from "jriapp/shared";
    import { BaseElView } from "jriapp_ui/generic";
    export interface IOptionStateProvider {
        getCSS(item: ICollectionItem, itemIndex: number, val: any): string;
    }
    export interface IOptionTextProvider {
        getText(item: ICollectionItem, itemIndex: number, text: string): string;
    }
    export interface IListBoxOptions {
        valuePath: string;
        textPath: string;
        statePath?: string;
    }
    export interface IListBoxConstructorOptions extends IListBoxOptions {
        el: HTMLSelectElement;
        dataSource: ICollection<ICollectionItem>;
    }
    export interface IMappedItem {
        item: ICollectionItem;
        op: HTMLOptionElement;
    }
    export class ListBox extends BaseObject {
        private _$el;
        private _objId;
        private _isRefreshing;
        private _selectedItem;
        private _prevSelected;
        private _keyMap;
        private _valMap;
        private _savedValue;
        private _tempValue;
        private _options;
        private _fn_state;
        private _textProvider;
        private _stateProvider;
        constructor(options: IListBoxConstructorOptions);
        destroy(): void;
        protected _getEventNames(): string[];
        addOnRefreshed(fn: TEventHandler<ListBox, {}>, nmspace?: string, context?: any): void;
        removeOnRefreshed(nmspace?: string): void;
        protected _onChanged(): void;
        protected _getStringValue(item: ICollectionItem): string;
        protected _getValue(item: ICollectionItem): any;
        protected _getText(item: ICollectionItem, index: number): string;
        protected _onDSCollectionChanged(sender: any, args: ICollChangedArgs<ICollectionItem>): void;
        protected _onEdit(item: ICollectionItem, isBegin: boolean, isCanceled: boolean): void;
        protected _onStatusChanged(item: ICollectionItem, oldStatus: ITEM_STATUS): void;
        protected _onCommitChanges(item: ICollectionItem, isBegin: boolean, isRejected: boolean, status: ITEM_STATUS): void;
        private _bindDS();
        private _unbindDS();
        private _addOption(item, first);
        private _mapByValue();
        private _resetText();
        private _removeOption(item);
        private _clear(isDestroy);
        private _refresh();
        private _findItemIndex(item);
        protected _setIsEnabled(el: HTMLSelectElement, v: boolean): void;
        protected _getIsEnabled(el: HTMLSelectElement): boolean;
        clear(): void;
        findItemByValue(val: any): ICollectionItem;
        getTextByValue(val: any): string;
        toString(): string;
        dataSource: ICollection<ICollectionItem>;
        selectedValue: any;
        selectedItem: ICollectionItem;
        valuePath: string;
        textPath: string;
        readonly statePath: string;
        isEnabled: boolean;
        textProvider: IOptionTextProvider;
        stateProvider: IOptionStateProvider;
        readonly el: HTMLSelectElement;
    }
    export interface IListBoxViewOptions extends IListBoxOptions, IViewOptions {
    }
    export class ListBoxElView extends BaseElView {
        private _listBox;
        constructor(options: IListBoxViewOptions);
        destroy(): void;
        toString(): string;
        isEnabled: boolean;
        dataSource: ICollection<ICollectionItem>;
        selectedValue: any;
        selectedItem: ICollectionItem;
        valuePath: string;
        textPath: string;
        textProvider: IOptionTextProvider;
        stateProvider: IOptionStateProvider;
        readonly listBox: ListBox;
    }
}
declare module "jriapp_ui/span" {
    import { BaseElView } from "jriapp_ui/generic";
    export class SpanElView extends BaseElView {
        toString(): string;
        text: string;
        value: string;
        html: string;
        color: string;
        fontSize: string;
    }
}
declare module "jriapp_ui/content/listbox" {
    import { IBaseObject } from "jriapp_shared";
    import { IExternallyCachable, IBinding, IConstructorContentOptions, IElView } from "jriapp/shared";
    import { ListBoxElView } from "jriapp_ui/listbox";
    import { SpanElView } from "jriapp_ui/span";
    import { BasicContent } from "jriapp_ui/content/basic";
    export interface ILookupOptions {
        dataSource: string;
        valuePath: string;
        textPath: string;
        statePath?: string;
    }
    export type TObjCreatedArgs = {
        objectKey: string;
        object: IBaseObject;
        isCachedExternally: boolean;
    };
    export type TObjNeededArgs = {
        objectKey: string;
        object: IBaseObject;
    };
    export class LookupContent extends BasicContent implements IExternallyCachable {
        private _spanView;
        private _valBinding;
        private _listBinding;
        private _listBoxElView;
        private _isListBoxCachedExternally;
        private _value;
        private _objId;
        constructor(options: IConstructorContentOptions);
        protected _getEventNames(): string[];
        addOnObjectCreated(fn: (sender: any, args: TObjCreatedArgs) => void, nmspace?: string): void;
        removeOnObjectCreated(nmspace?: string): void;
        addOnObjectNeeded(fn: (sender: any, args: TObjNeededArgs) => void, nmspace?: string): void;
        removeOnObjectNeeded(nmspace?: string): void;
        protected getListBoxElView(): ListBoxElView;
        protected onListRefreshed(): void;
        protected createListBoxElView(lookUpOptions: ILookupOptions): ListBoxElView;
        protected updateTextValue(): void;
        protected getLookupText(): string;
        protected getSpanView(): SpanElView;
        protected createTargetElement(): IElView;
        protected cleanUp(): void;
        protected updateBindingSource(): void;
        protected bindToValue(): IBinding;
        protected bindToList(selectView: ListBoxElView): IBinding;
        render(): void;
        destroy(): void;
        toString(): string;
        value: any;
        readonly uniqueID: string;
    }
}
declare module "jriapp_ui/content/factory" {
    export function initContentFactory(): void;
}
declare module "jriapp_ui/dialog" {
    import { IBaseObject, TEventHandler, IPromise, BaseObject } from "jriapp_shared";
    import { ITemplate, ITemplateEvents, IApplication } from "jriapp/shared";
    import { ViewModel } from "jriapp/mvvm";
    export const enum DIALOG_ACTION {
        Default = 0,
        StayOpen = 1,
    }
    export interface IDialogConstructorOptions {
        dataContext?: any;
        templateID: string;
        width?: any;
        height?: any;
        title?: string;
        submitOnOK?: boolean;
        canRefresh?: boolean;
        canCancel?: boolean;
        fn_OnClose?: (dialog: DataEditDialog) => void;
        fn_OnOK?: (dialog: DataEditDialog) => DIALOG_ACTION;
        fn_OnShow?: (dialog: DataEditDialog) => void;
        fn_OnCancel?: (dialog: DataEditDialog) => DIALOG_ACTION;
        fn_OnTemplateCreated?: (template: ITemplate) => void;
        fn_OnTemplateDestroy?: (template: ITemplate) => void;
    }
    export interface IButton {
        id: string;
        text: string;
        'class': string;
        click: () => void;
    }
    export class DataEditDialog extends BaseObject implements ITemplateEvents {
        private _objId;
        private _dataContext;
        private _templateID;
        private _submitOnOK;
        private _canRefresh;
        private _canCancel;
        private _fn_OnClose;
        private _fn_OnOK;
        private _fn_OnShow;
        private _fn_OnCancel;
        private _fn_OnTemplateCreated;
        private _fn_OnTemplateDestroy;
        private _editable;
        private _template;
        private _$dlgEl;
        private _result;
        private _options;
        private _fn_submitOnOK;
        private _currentSelectable;
        private _deferred;
        constructor(options: IDialogConstructorOptions);
        addOnClose(fn: TEventHandler<DataEditDialog, any>, nmspace?: string, context?: IBaseObject): void;
        removeOnClose(nmspace?: string): void;
        addOnRefresh(fn: TEventHandler<DataEditDialog, {
            isHandled: boolean;
        }>, nmspace?: string, context?: IBaseObject): void;
        removeOnRefresh(nmspace?: string): void;
        protected _updateIsEditable(): void;
        protected _createDialog(): void;
        protected _getEventNames(): string[];
        templateLoading(template: ITemplate): void;
        templateLoaded(template: ITemplate, error?: any): void;
        templateUnLoading(template: ITemplate): void;
        protected _createTemplate(): ITemplate;
        protected _destroyTemplate(): void;
        protected _getButtons(): IButton[];
        protected _getOkButton(): JQuery;
        protected _getCancelButton(): JQuery;
        protected _getRefreshButton(): JQuery;
        protected _getAllButtons(): JQuery[];
        protected _disableButtons(isDisable: boolean): void;
        protected _onOk(): void;
        protected _onCancel(): void;
        protected _onRefresh(): void;
        protected _onClose(): void;
        protected _onShow(): void;
        show(): IPromise<DataEditDialog>;
        hide(): void;
        getOption(name: string): any;
        setOption(name: string, value: any): void;
        destroy(): void;
        dataContext: any;
        readonly result: "ok" | "cancel";
        readonly template: ITemplate;
        isSubmitOnOK: boolean;
        width: any;
        height: any;
        title: any;
        canRefresh: boolean;
        canCancel: boolean;
    }
    export class DialogVM extends ViewModel<IApplication> {
        private _factories;
        private _dialogs;
        constructor(app: IApplication);
        createDialog(name: string, options: IDialogConstructorOptions): () => DataEditDialog;
        showDialog(name: string, dataContext: any): DataEditDialog;
        getDialog(name: string): DataEditDialog;
        destroy(): void;
    }
}
declare module "jriapp_ui/dynacontent" {
    import { IVoidPromise } from "jriapp_shared";
    import { ITemplate, ITemplateEvents, IViewOptions } from "jriapp/shared";
    import { BaseElView } from "jriapp_ui/generic";
    export interface IDynaContentAnimation {
        beforeShow(template: ITemplate, isFirstShow: boolean): void;
        show(template: ITemplate, isFirstShow: boolean): IVoidPromise;
        beforeHide(template: ITemplate): void;
        hide(template: ITemplate): IVoidPromise;
        stop(): void;
        isAnimateFirstShow: boolean;
    }
    export interface IDynaContentOptions extends IViewOptions {
        animate?: string;
    }
    export class DynaContentElView extends BaseElView implements ITemplateEvents {
        private _dataContext;
        private _prevTemplateID;
        private _templateID;
        private _template;
        private _animation;
        private _debounce;
        constructor(options: IDynaContentOptions);
        templateLoading(template: ITemplate): void;
        templateLoaded(template: ITemplate, error?: any): void;
        templateUnLoading(template: ITemplate): void;
        private _templateChanging(oldName, newName);
        destroy(): void;
        readonly template: ITemplate;
        templateID: string;
        dataContext: any;
        animation: IDynaContentAnimation;
    }
}
declare module "jriapp_ui/utils/dblclick" {
    import { IDisposable } from "jriapp_shared";
    export class DblClick implements IDisposable {
        private _isDestroyed;
        private _timer;
        private _interval;
        private _fn_OnClick;
        private _fn_OnDblClick;
        constructor(interval?: number);
        click(): void;
        add(fn_OnClick: () => any, fn_OnDblClick?: () => any): void;
        destroy(): void;
        getIsDestroyed(): boolean;
        getIsDestroyCalled(): boolean;
        interval: number;
    }
}
declare module "jriapp_ui/datagrid/const" {
    import { IIndexer } from "jriapp_shared";
    export const COLUMN_TYPE: {
        DATA: string;
        ROW_EXPANDER: string;
        ROW_ACTIONS: string;
        ROW_SELECTOR: string;
    };
    export const enum ROW_POSITION {
        Up = 0,
        Bottom = 1,
        Details = 2,
    }
    export const enum ROW_ACTION {
        OK = 0,
        EDIT = 1,
        CANCEL = 2,
        DELETE = 3,
    }
    export const css: {
        container: string;
        dataTable: string;
        columnInfo: string;
        column: string;
        headerDiv: string;
        wrapDiv: string;
        dataColumn: string;
        dataCell: string;
        rowCollapsed: string;
        rowExpanded: string;
        rowExpander: string;
        columnSelected: string;
        rowActions: string;
        rowDetails: string;
        rowSelector: string;
        rowHighlight: string;
        rowDeleted: string;
        rowError: string;
        fillVSpace: string;
        nobr: string;
        colSortable: string;
        colSortAsc: string;
        colSortDesc: string;
    };
    export const actionsSelector: string;
    export const editSelector: string;
    export const deleteSelector: string;
    export const txtMap: IIndexer<string>;
    export const PROP_NAME: {
        isCurrent: string;
        isSelected: string;
        sortOrder: string;
        checked: string;
        editingRow: string;
        dataSource: string;
        currentRow: string;
        grid: string;
        animation: string;
        stateProvider: string;
    };
}
declare module "jriapp_ui/datagrid/animation" {
    import { BaseObject } from "jriapp_shared";
    export interface IDataGridAnimation {
        beforeShow(el: HTMLElement): void;
        show(onEnd: () => void): void;
        beforeHide(el: HTMLElement): void;
        hide(onEnd: () => void): void;
        stop(): void;
    }
    export class DefaultAnimation extends BaseObject implements IDataGridAnimation {
        private _$el;
        constructor();
        beforeShow(el: HTMLElement): void;
        show(onEnd: () => void): void;
        beforeHide(el: HTMLElement): void;
        hide(onEnd: () => void): void;
        stop(): void;
        destroy(): void;
    }
}
declare module "jriapp_ui/datagrid/columns/base" {
    import { BaseObject } from "jriapp_shared";
    import { IContentOptions, ITemplateEvents, ITemplate } from "jriapp/shared";
    import { DataGrid } from "jriapp_ui/datagrid/datagrid";
    export interface IColumnInfo {
        "type"?: string;
        title?: string;
        sortable?: boolean;
        sortMemberName?: string;
        colCellCss?: string;
        rowCellCss?: string;
        width?: any;
        content?: IContentOptions;
        tip?: string;
        templateID?: string;
    }
    export interface ICellInfo {
        th: HTMLTableHeaderCellElement;
        colInfo: IColumnInfo;
    }
    export class BaseColumn extends BaseObject implements ITemplateEvents {
        private _grid;
        private _th;
        private _options;
        private _isSelected;
        private _objId;
        private _col;
        private _event_scope;
        private _template;
        constructor(grid: DataGrid, options: ICellInfo);
        destroy(): void;
        templateLoading(template: ITemplate): void;
        templateLoaded(template: ITemplate, error?: any): void;
        templateUnLoading(template: ITemplate): void;
        scrollIntoView(isUp: boolean): void;
        updateWidth(): void;
        protected _onColumnClicked(): void;
        toString(): string;
        readonly uniqueID: string;
        readonly width: number;
        readonly th: HTMLTableHeaderCellElement;
        readonly col: HTMLDivElement;
        readonly grid: DataGrid;
        readonly options: IColumnInfo;
        readonly title: string;
        isSelected: boolean;
    }
}
declare module "jriapp_ui/datagrid/columns/expander" {
    import { BaseColumn, ICellInfo } from "jriapp_ui/datagrid/columns/base";
    import { DataGrid } from "jriapp_ui/datagrid/datagrid";
    export class ExpanderColumn extends BaseColumn {
        constructor(grid: DataGrid, options: ICellInfo);
        toString(): string;
    }
}
declare module "jriapp_ui/datagrid/cells/expander" {
    import { BaseCell, ICellOptions } from "jriapp_ui/datagrid/cells/base";
    import { Row } from "jriapp_ui/datagrid/rows/row";
    import { ExpanderColumn } from "jriapp_ui/datagrid/columns/expander";
    export class ExpanderCell extends BaseCell<ExpanderColumn> {
        constructor(options: ICellOptions);
        protected _onCellClicked(row?: Row): void;
        toggleImage(): void;
        toString(): string;
    }
}
declare module "jriapp_ui/datagrid/columns/data" {
    import { IBaseObject } from "jriapp_shared";
    import { SORT_ORDER } from "jriapp_shared/const";
    import { IExternallyCachable } from "jriapp/shared";
    import { BaseColumn, ICellInfo } from "jriapp_ui/datagrid/columns/base";
    import { DataGrid } from "jriapp_ui/datagrid/datagrid";
    export class DataColumn extends BaseColumn {
        private _sortOrder;
        private _objCache;
        constructor(grid: DataGrid, options: ICellInfo);
        protected _onColumnClicked(): void;
        protected _cacheObject(key: string, obj: IBaseObject): void;
        protected _getCachedObject(key: string): IBaseObject;
        _getInitContentFn(): (content: IExternallyCachable) => void;
        destroy(): void;
        toString(): string;
        readonly isSortable: boolean;
        readonly sortMemberName: string;
        sortOrder: SORT_ORDER;
    }
}
declare module "jriapp_ui/datagrid/cells/data" {
    import { BaseCell, ICellOptions } from "jriapp_ui/datagrid/cells/base";
    import { DataColumn } from "jriapp_ui/datagrid/columns/data";
    export class DataCell extends BaseCell<DataColumn> {
        private _content;
        constructor(options: ICellOptions);
        protected _initContent(): void;
        _beginEdit(): void;
        _endEdit(isCanceled: boolean): void;
        destroy(): void;
        toString(): string;
    }
}
declare module "jriapp_ui/datagrid/columns/actions" {
    import { IColumnInfo, BaseColumn, ICellInfo } from "jriapp_ui/datagrid/columns/base";
    import { ActionsCell } from "jriapp_ui/datagrid/cells/actions";
    import { DataGrid } from "jriapp_ui/datagrid/datagrid";
    export interface IActionsColumnInfo extends IColumnInfo {
    }
    export class ActionsColumn extends BaseColumn {
        private _event_act_scope;
        constructor(grid: DataGrid, options: ICellInfo);
        protected _onOk(cell: ActionsCell): void;
        protected _onCancel(cell: ActionsCell): void;
        protected _onDelete(cell: ActionsCell): void;
        protected _onEdit(cell: ActionsCell): void;
        toString(): string;
        destroy(): void;
    }
}
declare module "jriapp_ui/datagrid/cells/actions" {
    import { BaseCell, ICellOptions } from "jriapp_ui/datagrid/cells/base";
    import { ActionsColumn } from "jriapp_ui/datagrid/columns/actions";
    export class ActionsCell extends BaseCell<ActionsColumn> {
        private _isEditing;
        constructor(options: ICellOptions);
        destroy(): void;
        private _setupImages($images);
        protected readonly editImages: string;
        protected readonly viewImages: string;
        protected _createButtons(isEditing: boolean): void;
        update(): void;
        toString(): string;
        readonly isCanEdit: boolean;
        readonly isCanDelete: boolean;
    }
}
declare module "jriapp_ui/datagrid/columns/rowselector" {
    import { BaseColumn, ICellInfo } from "jriapp_ui/datagrid/columns/base";
    import { DataGrid } from "jriapp_ui/datagrid/datagrid";
    export class RowSelectorColumn extends BaseColumn {
        private _chk;
        private _event_chk_scope;
        constructor(grid: DataGrid, options: ICellInfo);
        toString(): string;
        checked: any;
        destroy(): void;
    }
}
declare module "jriapp_ui/datagrid/cells/rowselector" {
    import { BaseCell, ICellOptions } from "jriapp_ui/datagrid/cells/base";
    import { RowSelectorColumn } from "jriapp_ui/datagrid/columns/rowselector";
    export class RowSelectorCell extends BaseCell<RowSelectorColumn> {
        private _$chk;
        constructor(options: ICellOptions);
        checked: boolean;
        destroy(): void;
        toString(): string;
    }
}
declare module "jriapp_ui/datagrid/rows/row" {
    import { BaseObject } from "jriapp_shared";
    import { ICollectionItem } from "jriapp_shared/collection/int";
    import { ROW_POSITION } from "jriapp_ui/datagrid/const";
    import { BaseCell } from "jriapp_ui/datagrid/cells/base";
    import { ExpanderCell } from "jriapp_ui/datagrid/cells/expander";
    import { ActionsCell } from "jriapp_ui/datagrid/cells/actions";
    import { BaseColumn } from "jriapp_ui/datagrid/columns/base";
    import { DataGrid } from "jriapp_ui/datagrid/datagrid";
    export class Row extends BaseObject {
        private _grid;
        private _$tr;
        private _item;
        private _cells;
        private _objId;
        private _expanderCell;
        private _actionsCell;
        private _rowSelectorCell;
        private _isDeleted;
        private _isSelected;
        private _isDetached;
        private _stateCss;
        constructor(grid: DataGrid, options: {
            tr: HTMLTableRowElement;
            item: ICollectionItem;
        });
        private _createCells();
        private _createCell(col, num);
        _setState(css: string): void;
        _onBeginEdit(): void;
        _onEndEdit(isCanceled: boolean): void;
        beginEdit(): boolean;
        endEdit(): boolean;
        cancelEdit(): boolean;
        destroy(): void;
        deleteRow(): void;
        updateErrorState(): void;
        scrollIntoView(animate?: boolean, pos?: ROW_POSITION): void;
        toString(): string;
        readonly offset: JQueryCoordinates;
        readonly height: number;
        readonly width: number;
        readonly tr: HTMLElement;
        readonly $tr: JQuery;
        readonly grid: DataGrid;
        readonly item: ICollectionItem;
        readonly cells: BaseCell<BaseColumn>[];
        readonly columns: BaseColumn[];
        readonly uniqueID: string;
        readonly itemKey: string;
        readonly isCurrent: boolean;
        isSelected: boolean;
        isExpanded: boolean;
        readonly expanderCell: ExpanderCell;
        readonly actionsCell: ActionsCell;
        isDeleted: boolean;
        isDetached: boolean;
        readonly isEditing: boolean;
        readonly isHasStateField: boolean;
    }
}
declare module "jriapp_ui/datagrid/cells/base" {
    import { BaseObject } from "jriapp_shared";
    import { ICollectionItem } from "jriapp_shared/collection/int";
    import { DblClick } from "jriapp_ui/utils/dblclick";
    import { Row } from "jriapp_ui/datagrid/rows/row";
    import { BaseColumn } from "jriapp_ui/datagrid/columns/base";
    import { DataGrid } from "jriapp_ui/datagrid/datagrid";
    export interface ICellOptions {
        row: Row;
        td: HTMLTableCellElement;
        column: BaseColumn;
        num: number;
    }
    export class BaseCell<TColumn extends BaseColumn> extends BaseObject {
        private _row;
        private _td;
        private _column;
        protected _click: DblClick;
        private _num;
        constructor(options: ICellOptions);
        protected _onCellClicked(row?: Row): void;
        protected _onDblClicked(row?: Row): void;
        click(): void;
        scrollIntoView(): void;
        destroy(): void;
        toString(): string;
        readonly td: HTMLTableCellElement;
        readonly row: Row;
        readonly column: TColumn;
        readonly grid: DataGrid;
        readonly item: ICollectionItem;
        readonly uniqueID: string;
        readonly num: number;
    }
}
declare module "jriapp_ui/datagrid/rows/details" {
    import { BaseObject } from "jriapp_shared";
    import { ICollectionItem } from "jriapp_shared/collection/int";
    import { Row } from "jriapp_ui/datagrid/rows/row";
    import { DetailsCell } from "jriapp_ui/datagrid/cells/details";
    import { DataGrid } from "jriapp_ui/datagrid/datagrid";
    export class DetailsRow extends BaseObject {
        private _grid;
        private _$tr;
        private _item;
        private _cell;
        private _parentRow;
        private _objId;
        private _isFirstShow;
        constructor(options: {
            grid: DataGrid;
            tr: HTMLTableRowElement;
            details_id: string;
        });
        private _createCell(details_id);
        protected _setParentRow(row: Row): void;
        private _initShow();
        private _show(onEnd);
        private _hide(onEnd);
        destroy(): void;
        toString(): string;
        readonly offset: JQueryCoordinates;
        readonly height: number;
        readonly width: number;
        readonly tr: HTMLElement;
        readonly $tr: JQuery;
        readonly grid: DataGrid;
        item: ICollectionItem;
        readonly cell: DetailsCell;
        readonly uniqueID: string;
        readonly itemKey: string;
        parentRow: Row;
    }
}
declare module "jriapp_ui/datagrid/cells/details" {
    import { BaseObject } from "jriapp_shared";
    import { ITemplate } from "jriapp/shared";
    import { ICollectionItem } from "jriapp_shared/collection/int";
    import { DetailsRow } from "jriapp_ui/datagrid/rows/details";
    import { DataGrid } from "jriapp_ui/datagrid/datagrid";
    export class DetailsCell extends BaseObject {
        private _row;
        private _td;
        private _template;
        constructor(options: {
            row: DetailsRow;
            td: HTMLTableCellElement;
            details_id: string;
        });
        destroy(): void;
        toString(): string;
        readonly td: HTMLTableCellElement;
        readonly row: DetailsRow;
        readonly grid: DataGrid;
        item: ICollectionItem;
        readonly template: ITemplate;
    }
}
declare module "jriapp_ui/datagrid/rows/fillspace" {
    import { BaseObject } from "jriapp_shared";
    import { FillSpaceCell } from "jriapp_ui/datagrid/cells/fillspace";
    import { DataGrid } from "jriapp_ui/datagrid/datagrid";
    export class FillSpaceRow extends BaseObject {
        private _grid;
        private _$tr;
        private _cell;
        constructor(options: {
            grid: DataGrid;
            tr: HTMLTableRowElement;
        });
        private _createCell();
        destroy(): void;
        toString(): string;
        attach(): void;
        detach(): void;
        readonly tr: HTMLElement;
        readonly $tr: JQuery;
        readonly grid: DataGrid;
        readonly cell: FillSpaceCell;
        height: number;
    }
}
declare module "jriapp_ui/datagrid/cells/fillspace" {
    import { BaseObject } from "jriapp_shared";
    import { FillSpaceRow } from "jriapp_ui/datagrid/rows/fillspace";
    import { DataGrid } from "jriapp_ui/datagrid/datagrid";
    export class FillSpaceCell extends BaseObject {
        private _row;
        private _td;
        private _div;
        constructor(options: {
            row: FillSpaceRow;
            td: HTMLTableCellElement;
        });
        destroy(): void;
        toString(): string;
        readonly td: HTMLTableCellElement;
        readonly row: FillSpaceRow;
        readonly grid: DataGrid;
        readonly div: HTMLElement;
        height: number;
    }
}
declare module "jriapp_ui/datagrid/datagrid" {
    import { TEventHandler, BaseObject } from "jriapp_shared";
    import { ISelectableProvider, ISelectable, IViewOptions } from "jriapp/shared";
    import { ICollectionItem, ICollChangedArgs, ICollItemArgs, ICollection, ICollItemAddedArgs, ITEM_STATUS } from "jriapp_shared/collection/int";
    import { BaseElView } from "jriapp_ui/generic";
    import { IDialogConstructorOptions } from "jriapp_ui/dialog";
    import { ROW_POSITION, ROW_ACTION } from "jriapp_ui/datagrid/const";
    import { IDataGridAnimation } from "jriapp_ui/datagrid/animation";
    import { BaseCell } from "jriapp_ui/datagrid/cells/base";
    import { Row } from "jriapp_ui/datagrid/rows/row";
    import { DetailsRow } from "jriapp_ui/datagrid/rows/details";
    import { FillSpaceRow } from "jriapp_ui/datagrid/rows/fillspace";
    import { BaseColumn, IColumnInfo, ICellInfo } from "jriapp_ui/datagrid/columns/base";
    import { DataColumn } from "jriapp_ui/datagrid/columns/data";
    export type DataGridCell = BaseCell<BaseColumn>;
    export { Row as DataGridRow } from "jriapp_ui/datagrid/rows/row";
    export { BaseColumn as DataGridColumn } from "jriapp_ui/datagrid/columns/base";
    export { ROW_POSITION, COLUMN_TYPE, ROW_ACTION } from "jriapp_ui/datagrid/const";
    export { IDataGridAnimation, DefaultAnimation } from "jriapp_ui/datagrid/animation";
    export function getDataGrids(): DataGrid[];
    export function findDataGrid(gridName: string): DataGrid;
    export interface IRowStateProvider {
        getCSS(item: ICollectionItem, val: any): string;
    }
    export interface IDataGridOptions {
        isUseScrollInto: boolean;
        isUseScrollIntoDetails: boolean;
        containerCss: string;
        wrapCss: string;
        headerCss: string;
        rowStateField: string;
        isCanEdit: boolean;
        isCanDelete: boolean;
        isHandleAddNew: boolean;
        details?: {
            templateID: string;
        };
        editor?: IDialogConstructorOptions;
        isPrependNewRows?: boolean;
        isPrependAllRows?: boolean;
    }
    export interface IDataGridConstructorOptions extends IDataGridOptions {
        el: HTMLTableElement;
        dataSource: ICollection<ICollectionItem>;
        animation: IDataGridAnimation;
    }
    export interface IInternalDataGridMethods {
        isRowExpanded(row: Row): boolean;
        get$Header(): JQuery;
        get$Container(): JQuery;
        get$Wrapper(): JQuery;
        setCurrentColumn(column: BaseColumn): void;
        onRowStateChanged(row: Row, val: any): string;
        onCellDblClicked(cell: BaseCell<BaseColumn>): void;
        onRowSelectionChanged(row: Row): void;
        resetColumnsSort(): void;
        getLastRow(): Row;
        removeRow(row: Row): void;
        expandDetails(parentRow: Row, expanded: boolean): void;
        columnWidthCheck: () => void;
    }
    export class DataGrid extends BaseObject implements ISelectableProvider {
        private _options;
        private _$table;
        private _name;
        private _objId;
        private _rowMap;
        private _rows;
        private _columns;
        private _expandedRow;
        private _details;
        private _fillSpace;
        private _expanderCol;
        private _actionsCol;
        private _rowSelectorCol;
        private _currentColumn;
        private _editingRow;
        private _dialog;
        private _$header;
        private _$wrapper;
        private _$contaner;
        private _internal;
        private _selectable;
        private _scrollDebounce;
        constructor(options: IDataGridConstructorOptions);
        protected _getEventNames(): string[];
        addOnRowExpanded(fn: TEventHandler<DataGrid, {
            collapsedRow: Row;
            expandedRow: Row;
            isExpanded: boolean;
        }>, nmspace?: string, context?: any): void;
        removeOnRowExpanded(nmspace?: string): void;
        addOnRowSelected(fn: TEventHandler<DataGrid, {
            row: Row;
        }>, nmspace?: string, context?: any): void;
        removeOnRowSelected(nmspace?: string): void;
        addOnPageChanged(fn: TEventHandler<DataGrid, any>, nmspace?: string, context?: any): void;
        removeOnPageChanged(nmspace?: string): void;
        addOnRowStateChanged(fn: TEventHandler<DataGrid, {
            row: Row;
            val: any;
            css: string;
        }>, nmspace?: string, context?: any): void;
        removeOnRowStateChanged(nmspace?: string): void;
        addOnCellDblClicked(fn: TEventHandler<DataGrid, {
            cell: BaseCell<BaseColumn>;
        }>, nmspace?: string, context?: any): void;
        removeOnCellDblClicked(nmspace?: string): void;
        addOnRowAction(fn: TEventHandler<DataGrid, {
            row: Row;
            action: ROW_ACTION;
        }>, nmspace?: string, context?: any): void;
        removeOnRowAction(nmspace?: string): void;
        protected _onKeyDown(key: number, event: Event): void;
        protected _onKeyUp(key: number, event: Event): void;
        protected _isRowExpanded(row: Row): boolean;
        protected _setCurrentColumn(column: BaseColumn): void;
        protected _onRowStateChanged(row: Row, val: any): string;
        protected _onCellDblClicked(cell: BaseCell<BaseColumn>): void;
        protected _onRowSelectionChanged(row: Row): void;
        protected _resetColumnsSort(): void;
        protected _getLastRow(): Row;
        protected _removeRow(row: Row): void;
        protected _expandDetails(parentRow: Row, expanded: boolean): void;
        protected _parseColumnAttr(column_attr: string, content_attr: string): IColumnInfo;
        protected _findUndeleted(row: Row, isUp: boolean): Row;
        protected _onDSCurrentChanged(prevCurrent: ICollectionItem, newCurrent: ICollectionItem): void;
        protected _onDSCollectionChanged(sender: any, args: ICollChangedArgs<ICollectionItem>): void;
        protected _updateTableDisplay(): void;
        protected _onPageChanged(): void;
        protected _onItemEdit(item: ICollectionItem, isBegin: boolean, isCanceled: boolean): void;
        protected _onItemAdded(sender: any, args: ICollItemAddedArgs<ICollectionItem>): void;
        protected _onItemStatusChanged(item: ICollectionItem, oldStatus: ITEM_STATUS): void;
        protected _onDSErrorsChanged(sender: any, args: ICollItemArgs<ICollectionItem>): void;
        protected _bindDS(): void;
        protected _unbindDS(): void;
        protected _clearGrid(): void;
        protected _wrapTable(): void;
        protected _unWrapTable(): void;
        protected _createColumns(): void;
        protected _createColumn(cellInfo: ICellInfo): BaseColumn;
        protected _appendItems(newItems: ICollectionItem[]): void;
        protected _refresh(isPageChanged: boolean): void;
        protected _createRowForItem(parent: Node, item: ICollectionItem, prepend?: boolean): Row;
        protected _createDetails(): DetailsRow;
        protected _createFillSpace(): FillSpaceRow;
        _getInternal(): IInternalDataGridMethods;
        updateColumnsSize(): void;
        getISelectable(): ISelectable;
        sortByColumn(column: DataColumn): void;
        selectRows(isSelect: boolean): void;
        findRowByItem(item: ICollectionItem): Row;
        collapseDetails(): void;
        getSelectedRows(): Row[];
        showEditDialog(): boolean;
        scrollToRow(args: {
            row: Row;
            animate?: boolean;
            pos?: ROW_POSITION;
        }): void;
        scrollToCurrent(pos?: ROW_POSITION, animate?: boolean): void;
        focus(): void;
        addNew(): void;
        destroy(): void;
        readonly $table: JQuery;
        readonly table: HTMLTableElement;
        readonly options: IDataGridConstructorOptions;
        readonly _tBodyEl: HTMLTableSectionElement;
        readonly _tHeadEl: HTMLTableSectionElement;
        readonly _tFootEl: HTMLTableSectionElement;
        readonly _tHeadRow: HTMLTableRowElement;
        readonly _tHeadCells: HTMLTableHeaderCellElement[];
        readonly uniqueID: string;
        readonly name: string;
        dataSource: ICollection<ICollectionItem>;
        readonly rows: Row[];
        readonly columns: BaseColumn[];
        currentItem: ICollectionItem;
        currentRow: Row;
        readonly editingRow: Row;
        readonly isHasEditor: string;
        readonly isCanEdit: boolean;
        readonly isCanDelete: boolean;
        readonly isCanAddNew: boolean;
        isUseScrollInto: boolean;
        readonly animation: IDataGridAnimation;
    }
    export interface IDataGridViewOptions extends IDataGridOptions, IViewOptions {
    }
    export class DataGridElView extends BaseElView {
        private _grid;
        private _options;
        private _stateProvider;
        constructor(options: IDataGridViewOptions);
        toString(): string;
        destroy(): void;
        private _createGrid();
        private _bindGridEvents();
        dataSource: any;
        readonly grid: DataGrid;
        stateProvider: IRowStateProvider;
        animation: any;
    }
}
declare module "jriapp_ui/pager" {
    import { BaseObject } from "jriapp_shared";
    import { IViewOptions } from "jriapp/shared";
    import { BaseElView } from "jriapp_ui/generic";
    import { ICollection, ICollectionItem } from "jriapp_shared/collection/int";
    export interface IPagerOptions {
        showTip?: boolean;
        showInfo?: boolean;
        showNumbers?: boolean;
        showFirstAndLast?: boolean;
        showPreviousAndNext?: boolean;
        useSlider?: boolean;
        hideOnSinglePage?: boolean;
        sliderSize?: number;
    }
    export interface IPagerConstructorOptions extends IPagerOptions {
        el: HTMLElement;
        dataSource: ICollection<ICollectionItem>;
    }
    export class Pager extends BaseObject {
        private _$el;
        private _objId;
        private _options;
        private _rowsPerPage;
        private _rowCount;
        private _currentPage;
        private _renderDebounce;
        constructor(options: IPagerConstructorOptions);
        protected _createElement(tag: string): JQuery;
        protected _render(): void;
        protected render(): void;
        protected _setDSPageIndex(page: number): void;
        protected _onPageSizeChanged(ds: ICollection<ICollectionItem>, args?: any): void;
        protected _onPageIndexChanged(ds: ICollection<ICollectionItem>, args?: any): void;
        protected _onTotalCountChanged(ds: ICollection<ICollectionItem>, args?: any): void;
        destroy(): void;
        protected _bindDS(): void;
        protected _unbindDS(): void;
        protected _clearContent(): void;
        protected _reset(): void;
        protected _createLink(page: number, text: string, tip?: string): JQuery;
        protected _createFirst(): JQuery;
        protected _createPrevious(): JQuery;
        protected _createCurrent(): JQuery;
        protected _createOther(page: number): JQuery;
        protected _createNext(): JQuery;
        protected _createLast(): JQuery;
        protected _buildTip(page: number): string;
        toString(): string;
        readonly el: HTMLElement;
        dataSource: ICollection<ICollectionItem>;
        readonly pageCount: number;
        rowCount: number;
        rowsPerPage: number;
        currentPage: number;
        useSlider: boolean;
        sliderSize: number;
        hideOnSinglePage: boolean;
        showTip: boolean;
        showInfo: boolean;
        showFirstAndLast: boolean;
        showPreviousAndNext: boolean;
        showNumbers: boolean;
    }
    export interface IPagerViewOptions extends IPagerOptions, IViewOptions {
    }
    export class PagerElView extends BaseElView {
        private _pager;
        constructor(options: IPagerViewOptions);
        destroy(): void;
        toString(): string;
        dataSource: any;
        readonly pager: Pager;
    }
}
declare module "jriapp_ui/stackpanel" {
    import { BaseObject, IBaseObject, TEventHandler } from "jriapp_shared";
    import { ITemplate, ISelectable, IViewOptions, ISelectableProvider } from "jriapp/shared";
    import { BaseElView } from "jriapp_ui/generic";
    import { ICollection, ICollectionItem, ICollChangedArgs, ITEM_STATUS } from "jriapp_shared/collection/int";
    export interface IStackPanelOptions {
        templateID: string;
        orientation?: "vertical" | "horizontal";
    }
    export interface IStackPanelConstructorOptions extends IStackPanelOptions {
        el: HTMLElement;
        dataSource: ICollection<ICollectionItem>;
    }
    export class StackPanel extends BaseObject implements ISelectableProvider {
        private _$el;
        private _objId;
        private _currentItem;
        private _itemMap;
        private _options;
        private _selectable;
        private _item_tag;
        private _event_scope;
        private _isKeyNavigation;
        constructor(options: IStackPanelConstructorOptions);
        protected _getEventNames(): string[];
        addOnItemClicked(fn: TEventHandler<StackPanel, {
            item: ICollectionItem;
        }>, nmspace?: string, context?: IBaseObject): void;
        removeOnItemClicked(nmspace?: string): void;
        protected _getContainerEl(): HTMLElement;
        protected _onKeyDown(key: number, event: Event): void;
        protected _onKeyUp(key: number, event: Event): void;
        protected _updateCurrent(item: ICollectionItem, withScroll: boolean): void;
        protected _onDSCurrentChanged(sender: any, args: any): void;
        protected _onDSCollectionChanged(sender: any, args: ICollChangedArgs<ICollectionItem>): void;
        protected _onItemStatusChanged(item: ICollectionItem, oldStatus: ITEM_STATUS): void;
        protected _createTemplate(item: ICollectionItem): ITemplate;
        protected _appendItems(newItems: ICollectionItem[]): void;
        protected _appendItem(item: ICollectionItem): void;
        protected _bindDS(): void;
        protected _unbindDS(): void;
        protected _onItemClicked(div: HTMLElement, item: ICollectionItem): void;
        protected _clearContent(): void;
        protected _removeItemByKey(key: string): void;
        protected _removeItem(item: ICollectionItem): void;
        protected _refresh(): void;
        destroy(): void;
        getISelectable(): ISelectable;
        scrollToItem(item: ICollectionItem, isUp?: boolean): void;
        scrollToCurrent(isUp?: boolean): void;
        focus(): void;
        getDivElementByItem(item: ICollectionItem): HTMLElement;
        toString(): string;
        readonly el: HTMLElement;
        readonly uniqueID: string;
        readonly orientation: "vertical" | "horizontal";
        readonly templateID: string;
        dataSource: ICollection<ICollectionItem>;
        readonly currentItem: ICollectionItem;
    }
    export interface IStackPanelViewOptions extends IStackPanelOptions, IViewOptions {
    }
    export interface IPanelEvents {
        onItemClicked(item: ICollectionItem): void;
    }
    export class StackPanelElView extends BaseElView {
        private _panel;
        private _panelEvents;
        constructor(options: IStackPanelViewOptions);
        private _createPanel(opts);
        destroy(): void;
        toString(): string;
        dataSource: ICollection<ICollectionItem>;
        panelEvents: IPanelEvents;
        readonly panel: StackPanel;
    }
}
declare module "jriapp_ui/tabs" {
    import { IViewOptions } from "jriapp/shared";
    import { BaseElView } from "jriapp_ui/generic";
    export interface ITabs {
        readonly uniqueID: string;
        readonly el: HTMLElement;
        readonly $el: JQuery;
        tabIndex: number;
        isVisible: boolean;
        dataName: string;
        css: string;
    }
    export interface ITabsEvents {
        addTabs(tabs: ITabs): void;
        removeTabs(): void;
        onTabSelected(tabs: ITabs): void;
    }
    export class TabsElView extends BaseElView implements ITabs {
        private _tabOpts;
        private _tabsEvents;
        private _tabsCreated;
        constructor(options: IViewOptions);
        protected _createTabs(): void;
        protected _destroyTabs(): void;
        protected _onTabsCreated(): void;
        destroy(): void;
        toString(): string;
        tabsEvents: ITabsEvents;
        tabIndex: number;
    }
}
declare module "jriapp_ui/command" {
    import { IViewOptions } from "jriapp/shared";
    import { ICommand } from "jriapp/mvvm";
    import { BaseElView } from "jriapp_ui/generic";
    export interface ICommandViewOptions extends IViewOptions {
        preventDefault?: boolean;
        stopPropagation?: boolean;
    }
    export class CommandElView extends BaseElView {
        private _command;
        private _commandParam;
        private _preventDefault;
        private _stopPropagation;
        private _disabled;
        constructor(options: ICommandViewOptions);
        private _onCanExecuteChanged(cmd, args);
        protected _onCommandChanged(): void;
        protected invokeCommand(args: any, isAsync: boolean): void;
        destroy(): void;
        toString(): string;
        isEnabled: boolean;
        command: ICommand;
        commandParam: any;
        readonly preventDefault: boolean;
        readonly stopPropagation: boolean;
    }
}
declare module "jriapp_ui/template" {
    import { ITemplate, ITemplateEvents, IViewOptions } from "jriapp/shared";
    import { CommandElView } from "jriapp_ui/command";
    export interface ITemplateOptions {
        dataContext?: any;
        templEvents?: ITemplateEvents;
    }
    export class TemplateElView extends CommandElView implements ITemplateEvents {
        private _template;
        private _isEnabled;
        constructor(options: IViewOptions);
        templateLoading(template: ITemplate): void;
        templateLoaded(template: ITemplate, error?: any): void;
        templateUnLoading(template: ITemplate): void;
        toString(): string;
        isEnabled: boolean;
        readonly template: ITemplate;
    }
}
declare module "jriapp_ui/dataform" {
    import { IBaseObject, IValidationInfo, BaseObject } from "jriapp_shared";
    import { IApplication, IViewOptions } from "jriapp/shared";
    import { BaseElView } from "jriapp_ui/generic";
    export const css: {
        dataform: string;
        error: string;
    };
    export class DataForm extends BaseObject {
        private static _DATA_FORM_SELECTOR;
        private static _DATA_CONTENT_SELECTOR;
        private _el;
        private _$el;
        private _objId;
        private _dataContext;
        private _isEditing;
        private _content;
        private _lfTime;
        private _contentCreated;
        private _editable;
        private _errNotification;
        private _parentDataForm;
        private _errors;
        private _isInsideTemplate;
        private _contentPromise;
        constructor(options: IViewOptions);
        private _getBindings();
        private _getElViews();
        private _createContent();
        private _updateCreatedContent();
        private _updateContent();
        private _onDSErrorsChanged(sender?, args?);
        _onIsEditingChanged(sender: any, args: any): void;
        private _bindDS();
        private _unbindDS();
        private _clearContent();
        destroy(): void;
        toString(): string;
        readonly app: IApplication;
        readonly el: HTMLElement;
        dataContext: IBaseObject;
        isEditing: boolean;
        validationErrors: IValidationInfo[];
        isInsideTemplate: boolean;
    }
    export class DataFormElView extends BaseElView {
        private _form;
        constructor(options: IViewOptions);
        protected _getErrorTipInfo(errors: IValidationInfo[]): string;
        protected _updateErrorUI(el: HTMLElement, errors: IValidationInfo[]): void;
        destroy(): void;
        toString(): string;
        dataContext: IBaseObject;
        readonly form: DataForm;
    }
}
declare module "jriapp_ui/datepicker" {
    import { TextBoxElView, ITextBoxOptions } from "jriapp_ui/textbox";
    export interface IDatePickerOptions extends ITextBoxOptions {
        datepicker?: any;
    }
    export class DatePickerElView extends TextBoxElView {
        constructor(options: IDatePickerOptions);
        destroy(): void;
        toString(): string;
    }
}
declare module "jriapp_ui/anchor" {
    import { IViewOptions } from "jriapp/shared";
    import { CommandElView } from "jriapp_ui/command";
    export interface IAncorOptions extends IViewOptions {
        imageSrc?: string;
        glyph?: string;
    }
    export class AnchorElView extends CommandElView {
        private _imageSrc;
        private _glyph;
        private _image;
        private _span;
        constructor(options: IAncorOptions);
        protected _onClick(e: Event): void;
        protected _updateImage(src: string): void;
        protected _updateGlyph(glyph: string): void;
        destroy(): void;
        toString(): string;
        imageSrc: string;
        glyph: string;
        html: string;
        text: string;
        href: string;
    }
}
declare module "jriapp_ui/block" {
    import { SpanElView } from "jriapp_ui/span";
    export class BlockElView extends SpanElView {
        toString(): string;
        width: number;
        height: number;
    }
}
declare module "jriapp_ui/busy" {
    import { IViewOptions } from "jriapp/shared";
    import { BaseElView } from "jriapp_ui/generic";
    export interface IBusyViewOptions extends IViewOptions {
        img?: string;
        delay?: number | string;
    }
    export class BusyElView extends BaseElView {
        private _delay;
        private _timeOut;
        private _loaderPath;
        private _$loader;
        private _isBusy;
        constructor(options: IBusyViewOptions);
        destroy(): void;
        toString(): string;
        isBusy: boolean;
        delay: number;
    }
}
declare module "jriapp_ui/button" {
    import { IViewOptions } from "jriapp/shared";
    import { CommandElView } from "jriapp_ui/command";
    export class ButtonElView extends CommandElView {
        constructor(options: IViewOptions);
        protected _onClick(e: Event): void;
        toString(): string;
        value: string;
        text: string;
        html: string;
    }
}
declare module "jriapp_ui/checkbox3" {
    import { IViewOptions } from "jriapp/shared";
    import { InputElView } from "jriapp_ui/input";
    export class CheckBoxThreeStateElView extends InputElView {
        private _checked;
        constructor(options: IViewOptions);
        protected _updateState(): void;
        toString(): string;
        checked: boolean;
    }
}
declare module "jriapp_ui/expander" {
    import { AnchorElView, IAncorOptions } from "jriapp_ui/anchor";
    export interface IExpanderOptions extends IAncorOptions {
        expandedsrc?: string;
        collapsedsrc?: string;
        isExpanded?: boolean;
    }
    export const PROP_NAME: {
        isExpanded: string;
    };
    export class ExpanderElView extends AnchorElView {
        private _expandedsrc;
        private _collapsedsrc;
        private _isExpanded;
        constructor(options: IExpanderOptions);
        protected refresh(): void;
        protected _onCommandChanged(): void;
        protected _onClick(e: any): void;
        invokeCommand(): void;
        toString(): string;
        isExpanded: boolean;
    }
}
declare module "jriapp_ui/hidden" {
    import { InputElView } from "jriapp_ui/input";
    export class HiddenElView extends InputElView {
        toString(): string;
    }
}
declare module "jriapp_ui/img" {
    import { IViewOptions } from "jriapp/shared";
    import { BaseElView } from "jriapp_ui/generic";
    export class ImgElView extends BaseElView {
        constructor(options: IViewOptions);
        toString(): string;
        src: string;
    }
}
declare module "jriapp_ui/radio" {
    import { CheckBoxElView } from "jriapp_ui/checkbox";
    export class RadioElView extends CheckBoxElView {
        toString(): string;
        value: string;
        readonly name: string;
    }
}
declare module "jriapp_ui/content/all" {
    export { css as contentCSS } from "jriapp_ui/content/int";
    export { BasicContent } from "jriapp_ui/content/basic";
    export { TemplateContent } from "jriapp_ui/content/template";
    export { StringContent } from "jriapp_ui/content/string";
    export { MultyLineContent } from "jriapp_ui/content/multyline";
    export { BoolContent } from "jriapp_ui/content/bool";
    export { NumberContent } from "jriapp_ui/content/number";
    export { DateContent } from "jriapp_ui/content/date";
    export { DateTimeContent } from "jriapp_ui/content/datetime";
    export { LookupContent } from "jriapp_ui/content/listbox";
}
declare module "jriapp_ui" {
    export { DIALOG_ACTION, IDialogConstructorOptions, DataEditDialog, DialogVM } from "jriapp_ui/dialog";
    export { DynaContentElView, IDynaContentAnimation, IDynaContentOptions } from "jriapp_ui/dynacontent";
    export { DataGrid, DataGridCell, DataGridColumn, DataGridRow, DataGridElView, IDataGridViewOptions, ROW_POSITION, IRowStateProvider, findDataGrid, getDataGrids } from "jriapp_ui/datagrid/datagrid";
    export * from "jriapp_ui/pager";
    export { ListBox, ListBoxElView, IListBoxViewOptions, IOptionStateProvider, IOptionTextProvider } from "jriapp_ui/listbox";
    export * from "jriapp_ui/stackpanel";
    export * from "jriapp_ui/tabs";
    export { BaseElView, fn_addToolTip } from "jriapp_ui/generic";
    export { TemplateElView } from "jriapp_ui/template";
    export { DataForm, DataFormElView } from "jriapp_ui/dataform";
    export { DatePickerElView } from "jriapp_ui/datepicker";
    export { AnchorElView, IAncorOptions } from "jriapp_ui/anchor";
    export { BlockElView } from "jriapp_ui/block";
    export { BusyElView, IBusyViewOptions } from "jriapp_ui/busy";
    export { ButtonElView } from "jriapp_ui/button";
    export { CheckBoxElView } from "jriapp_ui/checkbox";
    export { CheckBoxThreeStateElView } from "jriapp_ui/checkbox3";
    export { CommandElView } from "jriapp_ui/command";
    export { ExpanderElView, IExpanderOptions } from "jriapp_ui/expander";
    export { HiddenElView } from "jriapp_ui/hidden";
    export { ImgElView } from "jriapp_ui/img";
    export { InputElView } from "jriapp_ui/input";
    export { RadioElView } from "jriapp_ui/radio";
    export { SpanElView } from "jriapp_ui/span";
    export { TextAreaElView, ITextAreaOptions } from "jriapp_ui/textarea";
    export { TextBoxElView, ITextBoxOptions, TKeyPressArgs } from "jriapp_ui/textbox";
    export { DblClick } from "jriapp_ui/utils/dblclick";
    export * from "jriapp_ui/content/all";
}
