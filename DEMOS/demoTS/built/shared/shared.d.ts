/// <reference path="../../jriapp/jriapp.d.ts" />
/// <reference path="../../jriapp/jriapp_ui.d.ts" />
/// <reference path="../../jriapp/jriapp_db.d.ts" />
/// <reference path="../../thirdparty/sse.d.ts" />
declare module "common" {
    import * as RIAPP from "jriapp";
    import * as dbMOD from "jriapp_db";
    import * as uiMOD from "jriapp_ui";
    export interface IGridEvents<TItem extends RIAPP.ICollectionItem> {
        regFocusGridFunc(doFocus: () => void): void;
        onDataPageChanged(): void;
        onRowSelected(item: TItem): void;
        onRowExpanded(item: TItem): void;
        onRowCollapsed(item: TItem): void;
    }
    export function addTextQuery(query: dbMOD.TDataQuery, fldName: string, val: any): dbMOD.DataQuery<dbMOD.IEntityItem>;
    export interface IDLinkOptions extends RIAPP.IViewOptions {
        baseUri?: string;
    }
    export class DownloadLinkElView extends uiMOD.BaseElView {
        _baseUri: string;
        _id: string;
        constructor(options: IDLinkOptions);
        text: string;
        href: any;
        id: string;
    }
    export class FileImgElView extends uiMOD.BaseElView {
        private _baseUri;
        private _id;
        private _fileName;
        private _debounce;
        private _src;
        constructor(options: IDLinkOptions);
        destroy(): void;
        reloadImg(): void;
        fileName: string;
        src: string;
        id: string;
    }
    export class ErrorViewModel extends RIAPP.ViewModel<RIAPP.IApplication> {
        _error: any;
        _errors: any[];
        _message: string;
        _title: string;
        _dialogVM: uiMOD.DialogVM;
        constructor(app: RIAPP.IApplication);
        showDialog(): void;
        destroy(): void;
        error: any;
        title: string;
        message: string;
        readonly errorCount: number;
    }
    export function initModule(app: RIAPP.Application): void;
}
declare module "autocomplete" {
    import * as RIAPP from "jriapp";
    import * as dbMOD from "jriapp_db";
    import * as uiMOD from "jriapp_ui";
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
        private _templateId;
        private _fieldName;
        private _dbSetName;
        private _queryName;
        private _template;
        protected _gridDataSource: RIAPP.ICollection<RIAPP.ICollectionItem>;
        private _prevText;
        private _selectedItem;
        private _$dropDown;
        private _loadTimeout;
        protected _dataContext: RIAPP.IBaseObject;
        private _isLoading;
        private _width;
        private _height;
        private _$dlg;
        private _isOpen;
        private _lookupGrid;
        private _btnOk;
        private _btnCancel;
        private _dbContextName;
        private _minTextLength;
        constructor(options: IAutocompleteOptions);
        templateLoading(template: RIAPP.ITemplate): void;
        templateLoaded(template: RIAPP.ITemplate, error?: any): void;
        templateUnLoading(template: RIAPP.ITemplate): void;
        protected _createGridDataSource(): void;
        protected _getDbContext(): dbMOD.DbContext;
        protected _getEventNames(): string[];
        protected _createTemplate(): RIAPP.ITemplate;
        protected _onTextChange(): void;
        protected _onKeyUp(text: string): void;
        protected _onKeyPress(keyCode: number): void;
        protected _hideAsync(): void;
        protected _updateSelection(): void;
        protected _updatePosition(): void;
        protected _onShow(): void;
        protected _onHide(): void;
        protected _open(): void;
        protected _hide(): void;
        load(str: string): void;
        destroy(): void;
        readonly fieldName: string;
        readonly templateId: string;
        readonly currentSelection: any;
        readonly template: RIAPP.ITemplate;
        dataContext: RIAPP.IBaseObject;
        readonly gridDataSource: RIAPP.ICollection<RIAPP.ICollectionItem>;
        value: any;
        readonly isLoading: boolean;
    }
    export function initModule(app: RIAPP.Application): void;
}
declare module "header" {
    import * as RIAPP from "jriapp";
    export var topPanel: string;
    export var contentPanel: string;
    export class HeaderVM extends RIAPP.ViewModel<RIAPP.IApplication> {
        _$topPanel: JQuery;
        _$contentPanel: JQuery;
        _contentPanelHeight: number;
        _expanderCommand: RIAPP.ICommand;
        constructor(app: RIAPP.IApplication);
        _getEventNames(): string[];
        addOnUpdateUI(fn: (sender: HeaderVM, args: {
            isHandled: boolean;
            isUp: boolean;
        }) => void, namespace?: string): void;
        expand(): void;
        collapse(): void;
        updateUI(isUp: boolean): void;
        readonly expanderCommand: RIAPP.ICommand;
        readonly $contentPanel: JQuery;
        readonly $topPanel: JQuery;
    }
}
declare module "ssevents" {
    import * as RIAPP from "jriapp";
    export class SSEventsVM extends RIAPP.BaseObject {
        private _es;
        private _baseUrl;
        private _url;
        private _closeClientUrl;
        private _postMsgUrl;
        private _clientID;
        private _openESCommand;
        private _closeESCommand;
        private _deffered;
        private _timeOut;
        constructor(baseUrl: string, clientID: string);
        static isSupported(): boolean;
        protected _getEventNames(): string[];
        private _onEsOpen(event);
        private _onEsError(event);
        private _onMsg(event);
        private _close();
        addOnMessage(fn: (sender: any, args: {
            message: string;
            data: any;
        }) => void, namespace?: string): void;
        open(): RIAPP.IPromise<any>;
        close(): void;
        post(message: string, clientID?: string): RIAPP.IAbortablePromise<string>;
        destroy(): void;
        readonly es: sse.IEventSourceStatic;
        readonly openESCommand: RIAPP.ICommand;
        readonly closeESCommand: RIAPP.ICommand;
        readonly url: string;
        readonly baseUrl: string;
        readonly clientID: string;
    }
}
declare module "websocket" {
    import * as RIAPP from "jriapp";
    export class WebSocketsVM extends RIAPP.BaseObject {
        private _ws;
        private _clientID;
        private _url;
        private _openWsCommand;
        private _closeWsCommand;
        private _deffered;
        private _timeOut;
        static createUrl(port: number, svcName?: string, isSSL?: boolean): string;
        constructor(url: string);
        static isSupported(): boolean;
        protected _getEventNames(): string[];
        protected _onWsOpen(event: any): void;
        protected _onWsClose(event: any): void;
        protected _onWsError(event: any): void;
        protected _onMsg(event: any): void;
        addOnMessage(fn: (sender: WebSocketsVM, args: {
            message: string;
            data: any;
        }) => void, nmspace?: string, context?: any): void;
        open(): RIAPP.IPromise<any>;
        close(): void;
        destroy(): void;
        readonly ws: WebSocket;
        readonly openWsCommand: RIAPP.ICommand;
        readonly closeWsCommand: RIAPP.ICommand;
        url: string;
        readonly clientID: string;
    }
}
