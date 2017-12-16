/// <reference path="../../jriapp/jriapp_shared.d.ts" />
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
    export function addTextQuery(query: dbMOD.TDataQuery, fldName: string, val: any): dbMOD.TDataQuery;
    export interface IDLinkOptions extends RIAPP.IViewOptions {
        baseUri?: string;
    }
    export class DownloadLinkElView extends uiMOD.BaseElView {
        _baseUri: string;
        _id: string;
        constructor(options: IDLinkOptions);
        text: string;
        href: string;
        id: string;
    }
    export class FileImgElView extends uiMOD.BaseElView {
        private _baseUri;
        private _id;
        private _fileName;
        private _debounce;
        private _src;
        constructor(options: IDLinkOptions);
        dispose(): void;
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
        dispose(): void;
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
        private _$dropDown;
        private _loadTimeout;
        private _dataContext;
        private _isLoading;
        private _width;
        private _height;
        private _isOpen;
        private _lookupGrid;
        private _btnOk;
        private _btnCancel;
        private _dbContextName;
        private _minTextLength;
        templateLoading(template: RIAPP.ITemplate): void;
        templateLoaded(template: RIAPP.ITemplate, error?: any): void;
        templateUnLoading(template: RIAPP.ITemplate): void;
        constructor(options: IAutocompleteOptions);
        protected _createGridDataSource(): void;
        protected _getDbContext(): dbMOD.DbContext;
        protected _createTemplate(): RIAPP.ITemplate;
        protected _onTextChange(): void;
        protected _onKeyUp(text: string, keyCode: number): void;
        protected _onKeyPress(keyCode: number): boolean;
        protected _hideAsync(): RIAPP.IPromise<void>;
        protected _updateSelection(): void;
        protected _updatePosition(): void;
        protected _onShow(): void;
        protected _onHide(): void;
        protected _open(): void;
        protected _hide(): void;
        load(str: string): void;
        protected getDataContext(): RIAPP.IBaseObject;
        protected setDataContext(v: RIAPP.IBaseObject): void;
        dispose(): void;
        readonly fieldName: string;
        readonly templateId: string;
        readonly currentSelection: any;
        readonly template: RIAPP.ITemplate;
        dataContext: RIAPP.IBaseObject;
        readonly gridDataSource: RIAPP.ICollection<RIAPP.ICollectionItem>;
        value: string;
        readonly isLoading: boolean;
    }
    export function initModule(app: RIAPP.Application): void;
}
declare module "header" {
    import * as RIAPP from "jriapp";
    export let topPanel: string;
    export let contentPanel: string;
    export class HeaderVM extends RIAPP.ViewModel<RIAPP.IApplication> {
        private _$topPanel;
        private _$contentPanel;
        private _contentPanelHeight;
        private _expanderCommand;
        constructor(app: RIAPP.IApplication);
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
declare module "monthpicker" {
    import * as RIAPP from "jriapp";
    import * as uiMOD from "jriapp_ui";
    export class MonthPickerElView extends uiMOD.TextBoxElView {
        constructor(options: any);
        dispose(): void;
        toString(): string;
    }
    export function initModule(app: RIAPP.Application): void;
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
        getEventNames(): string[];
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
        dispose(): void;
        readonly es: sse.IEventSourceStatic;
        readonly openESCommand: RIAPP.ICommand;
        readonly closeESCommand: RIAPP.ICommand;
        readonly url: string;
        readonly baseUrl: string;
        readonly clientID: string;
    }
}
declare module "uploader" {
    import * as RIAPP from "jriapp_shared";
    export interface IAddHeadersArgs {
        xhr: XMLHttpRequest;
        promise: RIAPP.IPromise<any>;
    }
    export class Uploader extends RIAPP.BaseObject {
        private _uploadUrl;
        private _file;
        constructor(uploadUrl: string, file: File);
        addOnProgress(fn: (sender: Uploader, args: number) => void, nmspace?: string): void;
        addOnAddHeaders(fn: (sender: Uploader, args: IAddHeadersArgs) => void, nmspace?: string): void;
        uploadFile(): RIAPP.IPromise<string>;
        protected uploadFileChunk(file: File, chunk: Blob, part: number, total: number): RIAPP.IPromise<number>;
        readonly uploadUrl: string;
        readonly fileName: string;
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
        getEventNames(): string[];
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
        dispose(): void;
        readonly ws: WebSocket;
        readonly openWsCommand: RIAPP.ICommand;
        readonly closeWsCommand: RIAPP.ICommand;
        url: string;
        readonly clientID: string;
    }
}
