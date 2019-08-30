declare module "jriapp_ui/int" {
    import { IValidationInfo } from "jriapp_shared";
    import { IViewErrorsService } from "jriapp/int";
    export interface IFormErrorsService {
        setFormErrors(el: HTMLElement, errors: IValidationInfo[]): void;
    }
    export interface IUIErrorsService extends IViewErrorsService, IFormErrorsService {
    }
    export const enum cssStyles {
        fieldError = "ria-field-error",
        content = "ria-content-field",
        required = "ria-required-field",
        editMode = "ria-edit-mode",
        checkbox = "ria-checkbox",
        commandLink = "ria-command-link",
        checkedNull = "ria-checked-null",
        dataform = "ria-dataform",
        error = "ria-form-error",
        disabled = "disabled",
        opacity = "opacity",
        color = "color",
        fontSize = "font-size"
    }
}
declare module "jriapp_ui/content/basic" {
    import { IBaseObject, BaseObject } from "jriapp_shared";
    import { IFieldInfo } from "jriapp_shared/collection/int";
    import { IContent, IContentOptions, IConstructorContentOptions, ILifeTimeScope, IViewOptions, TBindingOptions, IApplication, IConverter, IElView } from "jriapp/int";
    import { Binding } from "jriapp/binding";
    export interface IContentView extends IBaseObject {
        readonly el: HTMLElement;
    }
    export function getView(el: HTMLElement, name: string, options: IViewOptions): IElView;
    export function getBindingOption(isEdit: boolean, fieldName: string, target: IBaseObject, dataContext: any, targetPath: string, converter?: IConverter, param?: any): TBindingOptions;
    export class BasicContent extends BaseObject implements IContent {
        private _parentEl;
        private _options;
        private _isReadOnly;
        private _isEditing;
        private _dataContext;
        private _lfScope;
        private _view;
        protected _el: HTMLElement;
        constructor(options: IConstructorContentOptions);
        dispose(): void;
        protected updateCss(): void;
        protected getIsCanBeEdited(): boolean;
        protected getBindings(): Binding[];
        protected updateBindingSource(): void;
        protected cleanUp(): void;
        protected getFieldInfo(): IFieldInfo;
        protected getParam(isEdit: boolean): any;
        protected getConverter(isEdit: boolean): IConverter;
        protected getViewName(isEdit: boolean): string;
        protected createdEditingView(): IContentView;
        protected createdReadingView(): IContentView;
        protected beforeCreateView(): boolean;
        protected createView(): void;
        protected afterCreateView(): void;
        render(): void;
        toString(): string;
        protected readonly lfScope: ILifeTimeScope;
        readonly parentEl: HTMLElement;
        readonly el: HTMLElement;
        readonly view: IContentView;
        isEditing: boolean;
        dataContext: any;
        readonly isReadOnly: boolean;
        readonly options: IContentOptions;
        readonly app: IApplication;
    }
}
declare module "jriapp_ui/content/template" {
    import { BaseObject } from "jriapp_shared";
    import { IContent, IApplication, ITemplate, IConstructorContentOptions } from "jriapp/int";
    export class TemplateContent extends BaseObject implements IContent {
        private _parentEl;
        private _template;
        private _templateInfo;
        private _isEditing;
        private _dataContext;
        private _templateID;
        private readonly _options;
        constructor(options: IConstructorContentOptions);
        dispose(): void;
        protected updateCss(): void;
        private getTemplateID;
        private createTemplate;
        protected cleanUp(): void;
        render(): void;
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
        Updated = 3
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
        isHasProp(prop: string): boolean;
        getProp(name: string): ICommand;
        setProp(name: string, command: ICommand): void;
        readonly isPropertyBag: boolean;
        trigger(eventName: string, args?: any): boolean;
        toString(): string;
        dispose(): void;
    }
}
declare module "jriapp_ui/utils/propbag" {
    import { BaseObject, IPropertyBag } from "jriapp_shared";
    export class PropertyBag extends BaseObject implements IPropertyBag {
        private _el;
        constructor(el: HTMLElement);
        isHasProp(prop: string): boolean;
        getProp(name: string): any;
        setProp(name: string, val: any): void;
        readonly isPropertyBag: boolean;
        toString(): string;
    }
}
declare module "jriapp_ui/utils/cssbag" {
    import { BaseObject, IPropertyBag } from "jriapp_shared";
    export class CSSBag extends BaseObject implements IPropertyBag {
        private _el;
        constructor(el: Element);
        isHasProp(prop: string): boolean;
        getProp(name: string): any;
        setProp(name: string, val: any): void;
        readonly isPropertyBag: boolean;
        toString(): string;
    }
}
declare module "jriapp_ui/baseview" {
    import { BaseObject, IPropertyBag, IValidationInfo, IValidatable } from "jriapp_shared";
    import { SubscribeFlags } from "jriapp/consts";
    import { IElView, IApplication, IViewOptions, ISubscriber } from "jriapp/int";
    import { ICommand } from "jriapp/mvvm";
    import { EVENT_CHANGE_TYPE, IEventChangedArgs } from "jriapp_ui/utils/eventbag";
    export { IEventChangedArgs, EVENT_CHANGE_TYPE };
    export function addToolTip(el: Element, tip: string, isError?: boolean, pos?: string): void;
    export class BaseElView<TElement extends HTMLElement = HTMLElement> extends BaseObject implements IElView, ISubscriber, IValidatable {
        private _uniqueID;
        private _el;
        private _subscribeFlags;
        private _viewState;
        constructor(el: TElement, options?: IViewOptions);
        dispose(): void;
        private _getStore;
        protected _onEventChanged(args: IEventChangedArgs): void;
        protected _onEventAdded(name: string, newVal: ICommand): void;
        protected _onEventDeleted(name: string, oldVal: ICommand): void;
        protected _applyToolTip(): void;
        protected _setIsSubcribed(flag: SubscribeFlags): void;
        protected _setErrors(el: HTMLElement, errors: IValidationInfo[]): void;
        isSubscribed(flag: SubscribeFlags): boolean;
        toString(): string;
        readonly el: TElement;
        readonly uniqueID: string;
        isVisible: boolean;
        validationErrors: IValidationInfo[];
        readonly dataName: string;
        toolTip: string;
        readonly events: IPropertyBag;
        readonly props: IPropertyBag;
        readonly classes: IPropertyBag;
        readonly isDelegationOn: boolean;
        css: string;
        readonly app: IApplication;
    }
}
declare module "jriapp_ui/input" {
    import { BaseElView } from "jriapp_ui/baseview";
    export class InputElView<TElement extends HTMLInputElement | HTMLTextAreaElement = HTMLInputElement> extends BaseElView<TElement> {
        toString(): string;
        isEnabled: boolean;
        value: string;
    }
}
declare module "jriapp_ui/textbox" {
    import { IViewOptions } from "jriapp/int";
    import { InputElView } from "jriapp_ui/input";
    export interface ITextBoxOptions extends IViewOptions {
        updateOnKeyUp?: boolean;
    }
    export type TKeyPressArgs = {
        keyCode: number;
        value: string;
        isCancel: boolean;
    };
    export class TextBoxElView<TElement extends HTMLInputElement | HTMLTextAreaElement = HTMLInputElement> extends InputElView<TElement> {
        constructor(el: TElement, options: ITextBoxOptions);
        handle_change(e: Event): boolean;
        handle_keypress(e: KeyboardEvent): boolean;
        handle_keyup(e: KeyboardEvent): void;
        addOnKeyPress(fn: (sender: TextBoxElView<TElement>, args: TKeyPressArgs) => void, nmspace?: string): void;
        offOnKeyPress(nmspace?: string): void;
        toString(): string;
        color: string;
    }
}
declare module "jriapp_ui/content/string" {
    import { IFieldInfo } from "jriapp_shared/collection/int";
    import { BasicContent } from "jriapp_ui/content/basic";
    export class StringContent extends BasicContent {
        static _allowedKeys: number[];
        private readonly allowedKeys;
        protected createView(): void;
        protected previewKeyPress(fieldInfo: IFieldInfo, keyCode: number, value: string): boolean;
        toString(): string;
    }
}
declare module "jriapp_ui/textarea" {
    import { TextBoxElView, ITextBoxOptions } from "jriapp_ui/textbox";
    export interface ITextAreaOptions extends ITextBoxOptions {
        wrap?: string;
    }
    export class TextAreaElView extends TextBoxElView<HTMLTextAreaElement> {
        constructor(el: HTMLTextAreaElement, options: ITextAreaOptions);
        toString(): string;
        wrap: string;
    }
}
declare module "jriapp_ui/content/multyline" {
    import { IFieldInfo } from "jriapp_shared/collection/int";
    import { IConstructorContentOptions } from "jriapp/int";
    import { BasicContent, IContentView } from "jriapp_ui/content/basic";
    export class MultyLineContent extends BasicContent {
        static _allowedKeys: number[];
        private readonly allowedKeys;
        constructor(options: IConstructorContentOptions);
        protected createdEditingView(): IContentView;
        protected createdReadingView(): IContentView;
        protected createView(): void;
        protected previewKeyPress(fieldInfo: IFieldInfo, keyCode: number, value: string): boolean;
        toString(): string;
    }
}
declare module "jriapp_ui/content/bool" {
    import { IConstructorContentOptions } from "jriapp/int";
    import { BasicContent, IContentView } from "jriapp_ui/content/basic";
    export class BoolContent extends BasicContent {
        private _label;
        constructor(options: IConstructorContentOptions);
        dispose(): void;
        protected createCheckBoxView(): IContentView;
        protected createdEditingView(): IContentView;
        protected createdReadingView(): IContentView;
        protected beforeCreateView(): boolean;
        protected afterCreateView(): void;
        protected updateCss(): void;
        toString(): string;
    }
}
declare module "jriapp_ui/content/number" {
    import { IConverter } from "jriapp/int";
    import { BasicContent } from "jriapp_ui/content/basic";
    export class NumberContent extends BasicContent {
        static _allowedKeys: number[];
        private readonly allowedKeys;
        protected getConverter(isEdit: boolean): IConverter;
        protected createView(): void;
        protected previewKeyPress(keyCode: number, value: string): boolean;
        toString(): string;
    }
}
declare module "jriapp_ui/content/date" {
    import { IConstructorContentOptions, IConverter } from "jriapp/int";
    import { BasicContent } from "jriapp_ui/content/basic";
    export class DateContent extends BasicContent {
        constructor(options: IConstructorContentOptions);
        protected getConverter(isEdit: boolean): IConverter;
        protected getViewName(isEdit: boolean): string;
        toString(): string;
    }
}
declare module "jriapp_ui/content/datetime" {
    import { IConverter } from "jriapp/int";
    import { BasicContent } from "jriapp_ui/content/basic";
    export class DateTimeContent extends BasicContent {
        protected getParam(isEdit: boolean): any;
        protected getConverter(isEdit: boolean): IConverter;
        toString(): string;
    }
}
declare module "jriapp_ui/listbox" {
    import { BaseObject, TEventHandler } from "jriapp_shared";
    import { ITEM_STATUS } from "jriapp_shared/collection/const";
    import { ICollection, ICollectionItem, ICollChangedArgs } from "jriapp_shared/collection/int";
    import { SubscribeFlags } from "jriapp/consts";
    import { IViewOptions, ISubscriber } from "jriapp/int";
    import { BaseElView } from "jriapp_ui/baseview";
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
        emptyOptionText?: string;
        syncSetDatasource?: boolean;
        nodelegate?: boolean;
    }
    export interface IListBoxConstructorOptions extends IListBoxOptions {
        dataSource?: ICollection<ICollectionItem>;
    }
    export interface IMappedItem {
        item: ICollectionItem;
        op: HTMLOptionElement;
    }
    export class ListBox extends BaseObject implements ISubscriber {
        private _el;
        private _uniqueID;
        private _isRefreshing;
        private _selectedValue;
        private _keyMap;
        private _valMap;
        private _options;
        private _fnState;
        private _textProvider;
        private _stateProvider;
        private _savedVal;
        private _dsDebounce;
        private _txtDebounce;
        private _stDebounce;
        private _changeDebounce;
        private _fnCheckSelected;
        private _isDSFilled;
        constructor(el: HTMLSelectElement, options: IListBoxConstructorOptions);
        dispose(): void;
        private _bindDS;
        private _unbindDS;
        private _addOption;
        private _mapByValue;
        private _resetText;
        private _resetState;
        private _removeOption;
        private _clear;
        private _refresh;
        protected _onSelectedChanged(): void;
        protected _getValue(item: ICollectionItem): any;
        protected _getText(item: ICollectionItem, index: number): string;
        protected _onDSCollectionChanged(sender: any, args: ICollChangedArgs<ICollectionItem>): void;
        protected _onEdit(item: ICollectionItem, isBegin: boolean, isCanceled: boolean): void;
        protected _onStatusChanged(item: ICollectionItem, oldStatus: ITEM_STATUS): void;
        protected _onCommitChanges(item: ICollectionItem, isBegin: boolean, isRejected: boolean, status: ITEM_STATUS): void;
        protected getItemIndex(item: ICollectionItem): number;
        protected getByValue(val: any): IMappedItem;
        protected getByIndex(index: number): IMappedItem;
        protected updateSelected(v: any): void;
        protected beginTrackSelected(): void;
        protected endTrackSelected(): void;
        protected setIsEnabled(el: HTMLSelectElement, v: boolean): void;
        protected getIsEnabled(el: HTMLSelectElement): boolean;
        protected setDataSource(v: ICollection<ICollectionItem>): void;
        protected selectedIndex: number;
        isSubscribed(flag: SubscribeFlags): boolean;
        handle_change(e: Event): boolean;
        addOnRefreshed(fn: TEventHandler<ListBox, {}>, nmspace?: string, context?: any): void;
        offOnRefreshed(nmspace?: string): void;
        getText(val: any): string;
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
        constructor(el: HTMLSelectElement, options: IListBoxViewOptions);
        dispose(): void;
        toString(): string;
        addOnRefreshed(fn: TEventHandler<ListBox, {}>, nmspace?: string, context?: any): void;
        offOnRefreshed(nmspace?: string): void;
        getText(val: any): string;
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
declare module "jriapp_ui/content/lookup" {
    import { IBaseObject } from "jriapp_shared";
    import { IExternallyCachable, IBinding, IConstructorContentOptions, IConverter, IElView } from "jriapp/int";
    import { ListBoxElView } from "jriapp_ui/listbox";
    import { BasicContent, IContentView } from "jriapp_ui/content/basic";
    export interface ILookupOptions {
        dataSource: string;
        valuePath: string;
        textPath: string;
        statePath?: string;
    }
    export type TObjCreatedArgs = {
        objectKey: string;
        result: IBaseObject;
        isCachedExternally: boolean;
    };
    export type TObjNeededArgs = {
        objectKey: string;
        result: IBaseObject;
    };
    export class LookupContent extends BasicContent implements IExternallyCachable {
        private _converter;
        private _listBox;
        private _isListBoxCachedExternally;
        private _uniqueID;
        constructor(options: IConstructorContentOptions);
        dispose(): void;
        protected getConverter(isEdit: boolean): IConverter;
        protected getListBox(): ListBoxElView;
        protected onListRefreshed(): void;
        protected createListBox(lookUpOptions: ILookupOptions): ListBoxElView;
        protected cleanUp(): void;
        protected bindToList(listBox: IElView): IBinding;
        protected createdEditingView(): IContentView;
        protected beforeCreateView(): boolean;
        addOnObjectCreated(fn: (sender: LookupContent, args: TObjCreatedArgs) => void, nmspace?: string): void;
        offOnObjectCreated(nmspace?: string): void;
        addOnObjectNeeded(fn: (sender: LookupContent, args: TObjNeededArgs) => void, nmspace?: string): void;
        offOnObjectNeeded(nmspace?: string): void;
        getLookupText(val: any): string;
        toString(): string;
        readonly uniqueID: string;
    }
}
declare module "jriapp_ui/content/factory" {
    export function initContentFactory(): void;
}
declare module "jriapp_ui/utils/jquery" {
    export const $: JQueryStatic;
    export class JQueryUtils {
        static $: JQueryStatic;
        static dispose$Plugin($el: JQuery, name: string): void;
    }
}
declare module "jriapp_ui/utils/tooltip" {
    import { ITooltipService } from "jriapp/int";
    export const enum css {
        toolTip = "qtip",
        toolTipError = "qtip-red"
    }
    export function createToolTipSvc(): ITooltipService;
}
declare module "jriapp_ui/utils/datepicker" {
    import { IDatepicker } from "jriapp";
    export function createDatepickerSvc(): IDatepicker;
}
declare module "jriapp_ui/utils/errors" {
    import { IUIErrorsService } from "jriapp_ui/int";
    export function createUIErrorsSvc(): IUIErrorsService;
}
declare module "jriapp_ui/dialog" {
    import { IBaseObject, TEventHandler, IPromise, BaseObject } from "jriapp_shared";
    import { ITemplate, ITemplateEvents, IApplication } from "jriapp/int";
    import { ViewModel } from "jriapp/mvvm";
    export const enum DIALOG_ACTION {
        Default = 0,
        StayOpen = 1
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
        "class": string;
        click: () => void;
    }
    export type TResult = "ok" | "cancel";
    export class DataEditDialog extends BaseObject implements ITemplateEvents {
        private _uniqueID;
        private _dataContext;
        private _templateID;
        private _submitOnOK;
        private _canRefresh;
        private _canCancel;
        private _fnOnClose;
        private _fnOnOK;
        private _fnOnShow;
        private _fnOnCancel;
        private _fnOnTemplateCreated;
        private _fnOnTemplateDestroy;
        private _template;
        private _$dlgEl;
        private _result;
        private _options;
        private _submitInfo;
        private _selectedControl;
        private _deferredTemplate;
        constructor(options: IDialogConstructorOptions);
        addOnClose(fn: TEventHandler<DataEditDialog, any>, nmspace?: string, context?: IBaseObject): void;
        offOnClose(nmspace?: string): void;
        addOnRefresh(fn: TEventHandler<DataEditDialog, {
            isHandled: boolean;
        }>, nmspace?: string, context?: IBaseObject): void;
        offOnRefresh(nmspace?: string): void;
        protected _createDialog(): void;
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
        dispose(): void;
        dataContext: any;
        readonly result: TResult;
        readonly template: ITemplate;
        isSubmitOnOK: boolean;
        width: any;
        height: any;
        title: string;
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
        dispose(): void;
    }
}
declare module "jriapp_ui/dynacontent" {
    import { IVoidPromise } from "jriapp_shared";
    import { ITemplate, ITemplateEvents, IViewOptions } from "jriapp/int";
    import { BaseElView } from "jriapp_ui/baseview";
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
        private _tDebounce;
        private _dsDebounce;
        constructor(el: HTMLElement, options: IDynaContentOptions);
        templateLoading(template: ITemplate): void;
        templateLoaded(template: ITemplate, error?: any): void;
        templateUnLoading(template: ITemplate): void;
        private _templateChanging;
        dispose(): void;
        readonly template: ITemplate;
        templateID: string;
        dataContext: any;
        animation: IDynaContentAnimation;
    }
}
declare module "jriapp_ui/content/int" {
    import { IContentOptions, ITemplateInfo } from "jriapp/int";
    export interface IDataContentAttr {
        fieldName?: string;
        readOnly?: boolean;
        css?: {
            readCss: string;
            editCss: string;
        };
        template?: ITemplateInfo;
        name?: string;
        options?: any;
    }
    export function parseContentAttr(contentAttr: string): IContentOptions;
}
declare module "jriapp_ui/datagrid/consts" {
    import { IIndexer } from "jriapp_shared";
    export const enum COLUMN_TYPE {
        DATA = "data",
        ROW_EXPANDER = "row_expander",
        ROW_ACTIONS = "row_actions",
        ROW_SELECTOR = "row_selector"
    }
    export const enum ROW_POSITION {
        Up = 0,
        Bottom = 1,
        Details = 2
    }
    export const enum ROW_ACTION {
        OK = 0,
        EDIT = 1,
        CANCEL = 2,
        DELETE = 3
    }
    export const enum css {
        container = "ria-table-container",
        dataTable = "ria-data-table",
        columnInfo = "ria-col-info",
        column = "ria-col-ex",
        headerDiv = "ria-table-header",
        wrapDiv = "ria-table-wrap",
        dataColumn = "ria-data-column",
        dataCell = "ria-data-cell",
        rowCollapsed = "ria-row-collapsed",
        rowExpanded = "ria-row-expanded",
        rowExpander = "ria-row-expander",
        columnSelected = "ria-col-selected",
        rowActions = "ria-row-actions",
        rowDetails = "ria-row-details",
        rowSelector = "ria-row-selector",
        rowHighlight = "ria-row-highlight",
        rowDeleted = "ria-row-deleted",
        rowError = "ria-row-error",
        fillVSpace = "ria-fill-vspace",
        nobr = "ria-nobr",
        colSortable = "ria-sortable",
        colSortAsc = "ria-sort-asc",
        colSortDesc = "ria-sort-desc"
    }
    export const txtMap: IIndexer<string>;
    export const enum PROP_NAME {
        isCurrent = "isCurrent",
        isSelected = "isSelected",
        sortOrder = "sortOrder",
        checked = "checked",
        editingRow = "editingRow",
        dataSource = "dataSource",
        currentRow = "currentRow",
        grid = "grid",
        animation = "animation",
        stateProvider = "stateProvider"
    }
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
        dispose(): void;
        beforeShow(el: HTMLElement): void;
        show(onEnd: () => void): void;
        beforeHide(el: HTMLElement): void;
        hide(onEnd: () => void): void;
        stop(): void;
    }
}
declare module "jriapp_ui/utils/dblclick" {
    import { IDisposable } from "jriapp_shared";
    export class DblClick implements IDisposable {
        private _isDisposed;
        private _timer;
        private _interval;
        private _fnOnClick;
        private _fnOnDblClick;
        constructor(interval?: number);
        click(): void;
        add(fnOnClick: () => any, fnOnDblClick?: () => any): void;
        dispose(): void;
        getIsDisposed(): boolean;
        interval: number;
    }
}
declare module "jriapp_ui/datagrid/columns/base" {
    import { BaseObject } from "jriapp_shared";
    import { IContentOptions, ITemplateEvents, ITemplate } from "jriapp/int";
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
        private _uniqueID;
        private _col;
        private _template;
        constructor(grid: DataGrid, options: ICellInfo);
        dispose(): void;
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
    import { SORT_ORDER } from "jriapp_shared/collection/const";
    import { IExternallyCachable, IContentConstructor } from "jriapp/int";
    import { BaseColumn, ICellInfo } from "jriapp_ui/datagrid/columns/base";
    import { DataGrid } from "jriapp_ui/datagrid/datagrid";
    export class DataColumn extends BaseColumn {
        private _sortOrder;
        private _objCache;
        private _contentType;
        constructor(grid: DataGrid, options: ICellInfo);
        dispose(): void;
        protected _onColumnClicked(): void;
        protected _cacheObject(key: string, obj: IBaseObject): void;
        protected _getCachedObject(key: string): IBaseObject;
        protected _getInitContentFn(): (content: IExternallyCachable) => void;
        updateContentOptions(): void;
        toString(): string;
        readonly contentType: IContentConstructor;
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
        dispose(): void;
        protected _initContent(): void;
        _beginEdit(): void;
        _endEdit(isCanceled: boolean): void;
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
        constructor(grid: DataGrid, options: ICellInfo);
        dispose(): void;
        protected _onOk(cell: ActionsCell): void;
        protected _onCancel(cell: ActionsCell): void;
        protected _onDelete(cell: ActionsCell): void;
        protected _onEdit(cell: ActionsCell): void;
        toString(): string;
    }
}
declare module "jriapp_ui/datagrid/cells/actions" {
    import { BaseCell, ICellOptions } from "jriapp_ui/datagrid/cells/base";
    import { ActionsColumn } from "jriapp_ui/datagrid/columns/actions";
    export const editName = "img_edit", deleteName = "img_delete";
    export class ActionsCell extends BaseCell<ActionsColumn> {
        private _isEditing;
        constructor(options: ICellOptions);
        dispose(): void;
        private _setupButtons;
        private _cleanUp;
        protected readonly editBtnsHTML: string[];
        protected readonly viewBtnsHTML: string[];
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
        constructor(grid: DataGrid, options: ICellInfo);
        dispose(): void;
        toString(): string;
        checked: boolean;
    }
}
declare module "jriapp_ui/datagrid/cells/rowselector" {
    import { BaseCell, ICellOptions } from "jriapp_ui/datagrid/cells/base";
    import { RowSelectorColumn } from "jriapp_ui/datagrid/columns/rowselector";
    export class RowSelectorCell extends BaseCell<RowSelectorColumn> {
        private _chk;
        constructor(options: ICellOptions);
        dispose(): void;
        checked: boolean;
        toString(): string;
    }
}
declare module "jriapp_ui/datagrid/rows/row" {
    import { BaseObject } from "jriapp_shared";
    import { ICollectionItem } from "jriapp_shared/collection/int";
    import { ROW_POSITION } from "jriapp_ui/datagrid/consts";
    import { BaseCell } from "jriapp_ui/datagrid/cells/base";
    import { ExpanderCell } from "jriapp_ui/datagrid/cells/expander";
    import { ActionsCell } from "jriapp_ui/datagrid/cells/actions";
    import { BaseColumn } from "jriapp_ui/datagrid/columns/base";
    import { DataGrid } from "jriapp_ui/datagrid/datagrid";
    export class Row extends BaseObject {
        private _grid;
        private _tr;
        private _item;
        private _cells;
        private _uniqueID;
        private _expanderCell;
        private _actionsCell;
        private _rowSelectorCell;
        private _isDeleted;
        private _isSelected;
        private _isDetached;
        private _stateCss;
        constructor(grid: DataGrid, options: {
            item: ICollectionItem;
        });
        dispose(): void;
        private _createCells;
        private _createCell;
        protected _loadDOM(): void;
        protected _unloadDOM(): void;
        _setState(css: string): void;
        _onBeginEdit(): void;
        _onEndEdit(isCanceled: boolean): void;
        beginEdit(): boolean;
        endEdit(): boolean;
        cancelEdit(): boolean;
        deleteRow(): boolean;
        updateErrorState(): void;
        updateUIState(): void;
        scrollIntoView(animate?: boolean, pos?: ROW_POSITION): void;
        toString(): string;
        readonly rect: ClientRect;
        readonly height: number;
        readonly width: number;
        readonly tr: HTMLTableRowElement;
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
    import { SubscribeFlags } from "jriapp/consts";
    import { ISubscriber } from "jriapp/int";
    import { DblClick } from "jriapp_ui/utils/dblclick";
    import { Row } from "jriapp_ui/datagrid/rows/row";
    import { BaseColumn } from "jriapp_ui/datagrid/columns/base";
    import { DataGrid } from "jriapp_ui/datagrid/datagrid";
    export interface ICellOptions {
        row: Row;
        column: BaseColumn;
        num: number;
    }
    export class BaseCell<TColumn extends BaseColumn> extends BaseObject implements ISubscriber {
        private _row;
        private _td;
        private _column;
        protected _click: DblClick;
        private _num;
        constructor(options: ICellOptions);
        protected _onCellClicked(row?: Row): void;
        protected _onDblClicked(row?: Row): void;
        isSubscribed(flag: SubscribeFlags): boolean;
        handle_click(e: Event): void;
        click(): void;
        scrollIntoView(): void;
        dispose(): void;
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
declare module "jriapp_ui/datagrid/cells/details" {
    import { BaseObject } from "jriapp_shared";
    import { ITemplate } from "jriapp/int";
    import { ICollectionItem } from "jriapp_shared/collection/int";
    import { DetailsRow } from "jriapp_ui/datagrid/rows/details";
    import { DataGrid } from "jriapp_ui/datagrid/datagrid";
    export class DetailsCell extends BaseObject {
        private _row;
        private _td;
        private _template;
        constructor(options: {
            row: DetailsRow;
            details_id: string;
        });
        dispose(): void;
        toString(): string;
        readonly td: HTMLTableCellElement;
        readonly row: DetailsRow;
        readonly grid: DataGrid;
        item: ICollectionItem;
        readonly template: ITemplate;
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
        private _tr;
        private _item;
        private _cell;
        private _parentRow;
        private _uniqueID;
        private _isFirstShow;
        constructor(options: {
            grid: DataGrid;
            details_id: string;
        });
        dispose(): void;
        private _createCell;
        protected _setParentRow(row: Row): void;
        private _initShow;
        private _show;
        private _hide;
        toString(): string;
        readonly rect: ClientRect;
        readonly height: number;
        readonly width: number;
        readonly tr: HTMLTableRowElement;
        readonly grid: DataGrid;
        item: ICollectionItem;
        readonly cell: DetailsCell;
        readonly uniqueID: string;
        readonly itemKey: string;
        parentRow: Row;
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
        });
        dispose(): void;
        toString(): string;
        readonly td: HTMLTableCellElement;
        readonly row: FillSpaceRow;
        readonly grid: DataGrid;
        readonly div: HTMLElement;
        height: number;
    }
}
declare module "jriapp_ui/datagrid/rows/fillspace" {
    import { BaseObject } from "jriapp_shared";
    import { FillSpaceCell } from "jriapp_ui/datagrid/cells/fillspace";
    import { DataGrid } from "jriapp_ui/datagrid/datagrid";
    export class FillSpaceRow extends BaseObject {
        private _grid;
        private _tr;
        private _cell;
        constructor(options: {
            grid: DataGrid;
        });
        dispose(): void;
        private _createCell;
        toString(): string;
        attach(): void;
        detach(): void;
        readonly tr: HTMLTableRowElement;
        readonly grid: DataGrid;
        readonly cell: FillSpaceCell;
        height: number;
    }
}
declare module "jriapp_ui/datagrid/datagrid" {
    import { TEventHandler, BaseObject, IPromise, IValidationInfo } from "jriapp_shared";
    import { ISelectableProvider, ISelectable, IViewOptions } from "jriapp/int";
    import { ITEM_STATUS } from "jriapp_shared/collection/const";
    import { ICollectionItem, ICollChangedArgs, ICollItemArgs, ICollection, ICollItemAddedArgs } from "jriapp_shared/collection/int";
    import { BaseElView } from "jriapp_ui/baseview";
    import { IDialogConstructorOptions } from "jriapp_ui/dialog";
    import { ROW_POSITION, ROW_ACTION } from "jriapp_ui/datagrid/consts";
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
    export { ROW_POSITION, COLUMN_TYPE, ROW_ACTION } from "jriapp_ui/datagrid/consts";
    export { IDataGridAnimation, DefaultAnimation } from "jriapp_ui/datagrid/animation";
    export function getDataGrids(): DataGrid[];
    export function findDataGrid(gridName: string): DataGrid;
    export interface IRowStateProvider {
        getCSS(item: ICollectionItem, val: any): string;
    }
    export interface IDataGridOptions {
        dataSource?: ICollection<ICollectionItem>;
        animation?: IDataGridAnimation;
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
        isActionsToolTips?: boolean;
        syncSetDatasource?: boolean;
    }
    export interface IInternalDataGridMethods {
        isRowExpanded(row: Row): boolean;
        getHeader(): HTMLElement;
        getContainer(): HTMLElement;
        getWrapper(): HTMLElement;
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
        private _table;
        private _name;
        private _uniqueID;
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
        private _header;
        private _wrapper;
        private _contaner;
        private _internal;
        private _selectable;
        private _scrollDebounce;
        private _dsDebounce;
        private _pageDebounce;
        private _updateCurrent;
        constructor(table: HTMLTableElement, options: IDataGridOptions);
        dispose(): void;
        protected _updateContentOptions(): void;
        protected _onKeyDown(key: number, event: Event): void;
        protected _onKeyUp(key: number, event: Event): void;
        protected _isRowExpanded(row: Row): boolean;
        protected _setCurrentColumn(column: BaseColumn): void;
        protected _onRowStateChanged(row: Row, val: any): string;
        protected _onCellDblClicked(cell: BaseCell<BaseColumn>): void;
        protected _onRowSelectionChanged(row: Row): void;
        protected _resetColumnsSort(): void;
        protected _getLastRow(): Row;
        protected _removeRow(row: Row): number;
        protected _expandDetails(parentRow: Row, expanded: boolean): void;
        protected _parseColumnAttr(columnAttr: string, contentAttr: string): IColumnInfo;
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
        protected _addNodeToParent(parent: Node, node: Node, prepend: boolean): void;
        protected _createRowForItem(parent: Node, item: ICollectionItem, prepend: boolean): Row;
        protected _createDetails(): DetailsRow;
        protected _createFillSpace(): FillSpaceRow;
        protected _scrollTo(yPos: number, animate: boolean): void;
        protected setDataSource(v: ICollection<ICollectionItem>): void;
        _getInternal(): IInternalDataGridMethods;
        updateColumnsSize(): void;
        sortByColumn(column: DataColumn): IPromise<any>;
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
        addOnRowExpanded(fn: TEventHandler<DataGrid, {
            collapsedRow: Row;
            expandedRow: Row;
            isExpanded: boolean;
        }>, nmspace?: string, context?: any): void;
        offOnRowExpanded(nmspace?: string): void;
        addOnRowSelected(fn: TEventHandler<DataGrid, {
            row: Row;
        }>, nmspace?: string, context?: any): void;
        offOnRowSelected(nmspace?: string): void;
        addOnPageChanged(fn: TEventHandler<DataGrid, any>, nmspace?: string, context?: any): void;
        offOnPageChanged(nmspace?: string): void;
        addOnRowStateChanged(fn: TEventHandler<DataGrid, {
            row: Row;
            val: any;
            css: string;
        }>, nmspace?: string, context?: any): void;
        offOnRowStateChanged(nmspace?: string): void;
        addOnCellDblClicked(fn: TEventHandler<DataGrid, {
            cell: BaseCell<BaseColumn>;
        }>, nmspace?: string, context?: any): void;
        offOnCellDblClicked(nmspace?: string): void;
        addOnRowAction(fn: TEventHandler<DataGrid, {
            row: Row;
            action: ROW_ACTION;
        }>, nmspace?: string, context?: any): void;
        offOnRowAction(nmspace?: string): void;
        readonly selectable: ISelectable;
        readonly table: HTMLTableElement;
        readonly options: IDataGridOptions;
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
        readonly isHasEditor: boolean;
        readonly isCanEdit: boolean;
        readonly isCanDelete: boolean;
        readonly isCanAddNew: boolean;
        isUseScrollInto: boolean;
        readonly animation: IDataGridAnimation;
    }
    export interface IDataGridViewOptions extends IDataGridOptions, IViewOptions {
    }
    export class DataGridElView extends BaseElView implements ISelectableProvider {
        private _grid;
        private _stateProvider;
        private _stateDebounce;
        constructor(table: HTMLTableElement, options: IDataGridViewOptions);
        toString(): string;
        dispose(): void;
        private _bindGridEvents;
        protected _setErrors(el: HTMLElement, errors: IValidationInfo[]): void;
        dataSource: ICollection<ICollectionItem>;
        readonly grid: DataGrid;
        stateProvider: IRowStateProvider;
        animation: IDataGridAnimation;
        readonly selectable: ISelectable;
    }
}
declare module "jriapp_ui/pager" {
    import { BaseObject, IValidationInfo } from "jriapp_shared";
    import { IViewOptions, ISelectable, ISelectableProvider } from "jriapp/int";
    import { BaseElView } from "jriapp_ui/baseview";
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
        dataSource?: ICollection<ICollectionItem>;
    }
    export class Pager extends BaseObject implements ISelectableProvider {
        private _el;
        private _uniqueID;
        private _options;
        private _rowsPerPage;
        private _rowCount;
        private _currentPage;
        private _pageDebounce;
        private _dsDebounce;
        private _display;
        private _toolTips;
        private _parentControl;
        constructor(el: HTMLElement, options: IPagerOptions);
        dispose(): void;
        protected _addToolTip(el: Element, tip: string): void;
        protected _createElement(tag: string): HTMLElement;
        protected _clearContent(): void;
        protected render(): void;
        protected _onPageSizeChanged(ds: ICollection<ICollectionItem>): void;
        protected _onPageIndexChanged(ds: ICollection<ICollectionItem>): void;
        protected _onTotalCountChanged(ds: ICollection<ICollectionItem>): void;
        protected _bindDS(): void;
        protected _unbindDS(): void;
        protected _reset(): void;
        protected _createLink(text: string): HTMLElement;
        private _addScope;
        protected _createFirst(): HTMLElement;
        protected _createPrevious(): HTMLElement;
        protected _createCurrent(): HTMLElement;
        protected _createInterval(): HTMLElement;
        protected _createOther(page: number): HTMLElement;
        protected _createNext(): HTMLElement;
        protected _createLast(): HTMLElement;
        protected _buildTip(page: number): string;
        protected setDataSource(v: ICollection<ICollectionItem>): void;
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
        showPreviousAndNext: boolean;
        showNumbers: boolean;
        isVisible: boolean;
        readonly selectable: ISelectable;
        parentControl: ISelectableProvider;
    }
    export interface IPagerViewOptions extends IPagerOptions, IViewOptions {
    }
    export class PagerElView extends BaseElView implements ISelectableProvider {
        private _pager;
        constructor(el: HTMLElement, options: IPagerViewOptions);
        dispose(): void;
        protected _setErrors(el: HTMLElement, errors: IValidationInfo[]): void;
        toString(): string;
        dataSource: ICollection<ICollectionItem>;
        readonly pager: Pager;
        readonly selectable: ISelectable;
        parentControl: ISelectableProvider;
    }
}
declare module "jriapp_ui/stackpanel" {
    import { BaseObject, IBaseObject, TEventHandler } from "jriapp_shared";
    import { ITemplate, ISelectable, IViewOptions, ISelectableProvider } from "jriapp/int";
    import { BaseElView } from "jriapp_ui/baseview";
    import { ITEM_STATUS } from "jriapp_shared/collection/const";
    import { ICollection, ICollectionItem, ICollChangedArgs } from "jriapp_shared/collection/int";
    export type TOrientation = "vertical" | "horizontal";
    export interface IStackPanelOptions {
        templateID: string;
        orientation?: TOrientation;
        syncSetDatasource?: boolean;
    }
    export interface IStackPanelConstructorOptions extends IStackPanelOptions {
        dataSource?: ICollection<ICollectionItem>;
    }
    export class StackPanel extends BaseObject implements ISelectableProvider {
        private _el;
        private _uniqueID;
        private _currentItem;
        private _itemMap;
        private _options;
        private _selectable;
        private _itemTag;
        private _isKeyNavigation;
        private _debounce;
        constructor(el: HTMLElement, options: IStackPanelConstructorOptions);
        dispose(): void;
        protected _onKeyDown(key: number, event: Event): void;
        protected _onKeyUp(key: number, event: Event): void;
        protected _updateCurrent(item: ICollectionItem, withScroll: boolean): void;
        protected _onDSCurrentChanged(): void;
        protected _onDSCollectionChanged(sender: any, args: ICollChangedArgs<ICollectionItem>): void;
        protected _onItemStatusChanged(item: ICollectionItem, oldStatus: ITEM_STATUS): void;
        protected _createTemplate(item: ICollectionItem, parentEl: HTMLElement): ITemplate;
        protected _appendItems(newItems: ICollectionItem[]): void;
        protected _appendItem(parent: Node, item: ICollectionItem): void;
        protected _bindDS(): void;
        protected _unbindDS(): void;
        protected _onItemClicked(div: HTMLElement, item: ICollectionItem): void;
        protected _clearContent(): void;
        protected _removeItemByKey(key: string): void;
        protected _removeItem(item: ICollectionItem): void;
        protected _refresh(): void;
        protected setDataSource(v: ICollection<ICollectionItem>): void;
        addOnItemClicked(fn: TEventHandler<StackPanel, {
            item: ICollectionItem;
        }>, nmspace?: string, context?: IBaseObject): void;
        offOnItemClicked(nmspace?: string): void;
        getDivElementByItem(item: ICollectionItem): HTMLElement;
        scrollToItem(item: ICollectionItem, isUp?: boolean): void;
        scrollToCurrent(isUp?: boolean): void;
        focus(): void;
        toString(): string;
        readonly selectable: ISelectable;
        readonly el: HTMLElement;
        readonly uniqueID: string;
        readonly orientation: TOrientation;
        readonly templateID: string;
        dataSource: ICollection<ICollectionItem>;
        readonly currentItem: ICollectionItem;
    }
    export interface IStackPanelViewOptions extends IStackPanelOptions, IViewOptions {
    }
    export interface IPanelEvents {
        onItemClicked(item: ICollectionItem): void;
    }
    export class StackPanelElView extends BaseElView implements ISelectableProvider {
        private _panel;
        private _panelEvents;
        constructor(el: HTMLElement, options: IStackPanelViewOptions);
        dispose(): void;
        toString(): string;
        dataSource: ICollection<ICollectionItem>;
        panelEvents: IPanelEvents;
        readonly panel: StackPanel;
        readonly selectable: ISelectable;
    }
}
declare module "jriapp_ui/tabs" {
    import { IViewOptions } from "jriapp/int";
    import { BaseElView } from "jriapp_ui/baseview";
    export interface ITabs {
        readonly uniqueID: string;
        readonly el: HTMLElement;
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
        constructor(el: HTMLElement, options: IViewOptions);
        protected _createTabs(): void;
        protected _destroyTabs(): void;
        protected _onTabsCreated(): void;
        dispose(): void;
        toString(): string;
        tabsEvents: ITabsEvents;
        tabIndex: number;
    }
}
declare module "jriapp_ui/template" {
    import { ITemplate, ITemplateEvents, IViewOptions } from "jriapp/int";
    import { IExecutor } from "jriapp/mvvm";
    import { BaseElView } from "jriapp_ui/baseview";
    export interface ITemplateOptions {
        dataContext?: any;
        templEvents?: ITemplateEvents;
    }
    export type TemplateCommandParam = {
        template: ITemplate;
        isLoaded: boolean;
    };
    export class TemplateElView extends BaseElView implements ITemplateEvents {
        private _command;
        constructor(el: HTMLElement, options: IViewOptions);
        private invokeCommand;
        templateLoading(template: ITemplate): void;
        templateLoaded(template: ITemplate, error?: any): void;
        templateUnLoading(template: ITemplate): void;
        toString(): string;
        command: IExecutor;
    }
}
declare module "jriapp_ui/dataform" {
    import { IBaseObject, IValidationInfo, BaseObject } from "jriapp_shared";
    import { IViewOptions, IApplication } from "jriapp/int";
    import { IFormErrorsService } from "jriapp_ui/int";
    import { BaseElView } from "jriapp_ui/baseview";
    export interface IFormOptions {
        formErrorsService?: IFormErrorsService;
    }
    export class DataForm extends BaseObject {
        private static _DATA_FORM_SELECTOR;
        private static _DATA_CONTENT_SELECTOR;
        private _el;
        private _uniqueID;
        private _dataContext;
        private _errorsService;
        private _isEditing;
        private _content;
        private _lfTime;
        private _contentCreated;
        private _editable;
        private _errNotification;
        private _parentDataForm;
        private _contentPromise;
        constructor(el: HTMLElement, options: IFormOptions);
        dispose(): void;
        private _getBindings;
        private _createContent;
        private _updateCreatedContent;
        private _updateContent;
        private _onDSErrorsChanged;
        private _bindDS;
        private _unbindDS;
        private _clearContent;
        protected _setErrors(errors: IValidationInfo[]): void;
        protected _onIsEditingChanged(): void;
        toString(): string;
        readonly app: IApplication;
        readonly el: HTMLElement;
        dataContext: IBaseObject;
        isEditing: boolean;
    }
    export interface IFormViewOptions extends IFormOptions, IViewOptions {
    }
    export class DataFormElView extends BaseElView {
        private _form;
        constructor(el: HTMLElement, options: IFormViewOptions);
        dispose(): void;
        protected _setErrors(el: HTMLElement, errors: IValidationInfo[]): void;
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
        constructor(el: HTMLInputElement, options: IDatePickerOptions);
        dispose(): void;
        toString(): string;
    }
}
declare module "jriapp_ui/command" {
    import { IViewOptions } from "jriapp/int";
    import { ICommand } from "jriapp/mvvm";
    import { BaseElView } from "jriapp_ui/baseview";
    export interface ICommandViewOptions extends IViewOptions {
        preventDefault?: boolean;
        stopPropagation?: boolean;
    }
    export class CommandElView<TElement extends HTMLElement = HTMLElement> extends BaseElView<TElement> {
        private _command;
        private _commandParam;
        private _commandFlags;
        private _debounce;
        constructor(el: TElement, options: ICommandViewOptions);
        dispose(): void;
        private _getCommandFlag;
        private _setCommandFlag;
        private _onCanExecuteChanged;
        protected _getCommandParam(): any;
        protected _onCommandChanged(): void;
        protected invokeCommand(): void;
        viewMounted(): void;
        toString(): string;
        command: ICommand;
        commandParam: any;
        isEnabled: boolean;
        readonly preventDefault: boolean;
        readonly stopPropagation: boolean;
    }
}
declare module "jriapp_ui/anchor" {
    import { CommandElView, ICommandViewOptions } from "jriapp_ui/command";
    export interface IAncorOptions extends ICommandViewOptions {
        imageSrc?: string;
        glyph?: string;
    }
    export class AnchorElView extends CommandElView<HTMLAnchorElement> {
        private _imageSrc;
        private _glyph;
        private _image;
        private _span;
        constructor(el: HTMLAnchorElement, options: IAncorOptions);
        dispose(): void;
        handle_click(e: Event): boolean;
        protected onClick(): void;
        protected _updateImage(src: string): void;
        protected _updateGlyph(glyph: string): void;
        toString(): string;
        imageSrc: string;
        glyph: string;
        html: string;
        text: string;
        href: string;
    }
}
declare module "jriapp_ui/span" {
    import { BaseElView } from "jriapp_ui/baseview";
    export class SpanElView extends BaseElView {
        toString(): string;
        text: string;
        value: string;
        html: string;
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
    import { IViewOptions } from "jriapp/int";
    import { BaseElView } from "jriapp_ui/baseview";
    export interface IBusyViewOptions extends IViewOptions {
        img?: string;
        delay?: number | string;
    }
    export class BusyElView extends BaseElView {
        private _delay;
        private _timeOut;
        private _loaderPath;
        private _img;
        private _isBusy;
        constructor(el: HTMLElement, options: IBusyViewOptions);
        dispose(): void;
        toString(): string;
        isBusy: boolean;
        delay: number;
    }
}
declare module "jriapp_ui/button" {
    import { CommandElView, ICommandViewOptions } from "jriapp_ui/command";
    export class ButtonElView extends CommandElView<HTMLButtonElement | HTMLInputElement> {
        private _isButton;
        constructor(el: HTMLButtonElement | HTMLInputElement, options: ICommandViewOptions);
        handle_click(e: Event): boolean;
        onClick(): void;
        toString(): string;
        value: string;
        text: string;
        html: string;
    }
}
declare module "jriapp_ui/checkbox" {
    import { IValidationInfo } from "jriapp_shared";
    import { IViewOptions } from "jriapp/int";
    import { InputElView } from "jriapp_ui/input";
    export class CheckBoxElView extends InputElView<HTMLInputElement> {
        private _checked;
        constructor(chk: HTMLInputElement, options?: IViewOptions);
        handle_change(e: Event): boolean;
        protected _updateState(): void;
        protected _setErrors(el: HTMLElement, errors: IValidationInfo[]): void;
        toString(): string;
        checked: boolean;
    }
}
declare module "jriapp_ui/checkbox3" {
    import { IValidationInfo } from "jriapp_shared";
    import { IViewOptions } from "jriapp/int";
    import { InputElView } from "jriapp_ui/input";
    export class CheckBoxThreeStateElView extends InputElView<HTMLInputElement> {
        private _checked;
        constructor(chk: HTMLInputElement, options?: IViewOptions);
        handle_change(e: Event): boolean;
        protected _updateState(): void;
        protected _setErrors(el: HTMLElement, errors: IValidationInfo[]): void;
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
    export const enum PROP_NAME {
        isExpanded = "isExpanded"
    }
    export class ExpanderElView extends AnchorElView {
        private _expandedsrc;
        private _collapsedsrc;
        private _isExpanded;
        constructor(el: HTMLAnchorElement, options: IExpanderOptions);
        protected refresh(): void;
        protected _onCommandChanged(): void;
        protected onClick(): void;
        protected _getCommandParam(): any;
        invokeCommand(): void;
        toString(): string;
        isExpanded: boolean;
    }
}
declare module "jriapp_ui/hidden" {
    import { InputElView } from "jriapp_ui/input";
    export class HiddenElView extends InputElView<HTMLInputElement> {
        toString(): string;
    }
}
declare module "jriapp_ui/img" {
    import { BaseElView } from "jriapp_ui/baseview";
    export class ImgElView extends BaseElView<HTMLImageElement> {
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
    export { BasicContent } from "jriapp_ui/content/basic";
    export { TemplateContent } from "jriapp_ui/content/template";
    export { StringContent } from "jriapp_ui/content/string";
    export { MultyLineContent } from "jriapp_ui/content/multyline";
    export { BoolContent } from "jriapp_ui/content/bool";
    export { NumberContent } from "jriapp_ui/content/number";
    export { DateContent } from "jriapp_ui/content/date";
    export { DateTimeContent } from "jriapp_ui/content/datetime";
    export { LookupContent } from "jriapp_ui/content/lookup";
}
declare module "jriapp_ui" {
    export { DIALOG_ACTION, IDialogConstructorOptions, DataEditDialog, DialogVM } from "jriapp_ui/dialog";
    export { DynaContentElView, IDynaContentAnimation, IDynaContentOptions } from "jriapp_ui/dynacontent";
    export { DataGrid, DataGridCell, DataGridColumn, DataGridRow, DataGridElView, IDataGridViewOptions, ROW_POSITION, IRowStateProvider, findDataGrid, getDataGrids } from "jriapp_ui/datagrid/datagrid";
    export * from "jriapp_ui/pager";
    export { ListBox, ListBoxElView, IListBoxViewOptions, IOptionStateProvider, IOptionTextProvider } from "jriapp_ui/listbox";
    export * from "jriapp_ui/stackpanel";
    export * from "jriapp_ui/tabs";
    export { BaseElView, addToolTip } from "jriapp_ui/baseview";
    export { TemplateElView, TemplateCommandParam } from "jriapp_ui/template";
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
    export { JQueryUtils, $ } from "jriapp_ui/utils/jquery";
    export * from "jriapp_ui/content/all";
}
