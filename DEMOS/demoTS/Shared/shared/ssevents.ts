/// <reference path="../../jriapp/jriapp.d.ts" />
/// <reference path="../../thirdparty/sse.d.ts"/>
import * as RIAPP from "jriapp";

//server side events client
let bootstrap = RIAPP.bootstrap, utils = RIAPP.Utils;

export class SSEventsVM extends RIAPP.BaseObject {
    private _es: sse.IEventSourceStatic;
    private _baseUrl: string;
    private _url: string;
    private _closeClientUrl: string;
    private _postMsgUrl: string;
    private _clientID: string;
    private _openESCommand: RIAPP.ICommand;
    private _closeESCommand: RIAPP.ICommand;
    private _deffered: RIAPP.IDeferred<any>;
    private _timeOut: any;

    constructor(baseUrl: string, clientID: string) {
        super();
        let self = this;
        this._es = null;
        this._deffered = null;

        this._baseUrl = baseUrl;
        this._clientID = clientID;
        this._url = this._baseUrl + "?id=" + clientID;
        this._closeClientUrl = this._baseUrl + "/CloseClient?id=" + clientID;
        this._postMsgUrl = this._baseUrl + "/PostMessage";

        this._openESCommand = new RIAPP.Command(function (sender, data) {
            self.open().then(() => {
            }, (res) => {
                self.handleError(res, self);
            });
        }, null, () => {
            return !self._es;
        });
        this._closeESCommand = new RIAPP.TCommand(function (sender, data) {
            self.close();
        }, null, () => {
            return !!self._es;
        });

        bootstrap.addOnUnLoad(function (s, a) {
            self.close();
        });
    }
    static isSupported(): boolean {
        try {
            return !!EventSource;
        } catch (e) {
            return false;
        }
    }
    protected _getEventNames() {
        let base_events = super._getEventNames();
        return ['open', 'close', 'error', 'message'].concat(base_events);
    }
    private _onEsOpen(event:any) {
        clearTimeout(this._timeOut);
        this._timeOut = null;
        if (!!this._deffered) {
            this._deffered.resolve();
            this._deffered = null;
        }
    }
    private _onEsError(event:any) {
        this.handleError("EventSource error", this);
        this.close();
    }
    private _onMsg(event:any) {
        let data = JSON.parse(event.data);
        this.raiseEvent('message', { message: event.data, data: data });
    }
    private _close() {
        if (!!this._timeOut)
            clearTimeout(this._timeOut);
        this._timeOut = null;

        if (!!this._deffered) {
            this._deffered.reject({ message: "EventSource closed" });
        }
        this._deffered = null;

        if (!!this._es) {
            try {
                this._es.close();
                this._es = null;
                this._openESCommand.raiseCanExecuteChanged();
                this._closeESCommand.raiseCanExecuteChanged();
            }
            catch (e) {
                this._es = null;
            }
        }
    }
    addOnMessage(fn: (sender: any, args: { message: string; data: any; }) => void, namespace?: string) {
        this.addHandler('message', fn, namespace);
    }
    open(): RIAPP.IPromise<any> {
        let self = this;
        if (!!this._deffered)
            return this._deffered.promise();
        this._deffered = utils.defer.createDeferred<any>();
        this._timeOut = setTimeout(function () {
            self._timeOut = null;
            if (!!self._deffered) {
                self._deffered.reject({ message: "EventSource connect timeout!" });
                self._deffered = null;
                self._close();
            }
        }, 10000);
        if (!this._es) {
            this._es = new EventSource(self.url);
            this._es.addEventListener('message', function (e) {
                self._onMsg(e);
            }, false);
            this._es.addEventListener('open', function (e) {
                self._onEsOpen(e);
            }, false);
            this._es.addEventListener('error', function (e) {
                self._onEsError(e);
            }, false);
            this._openESCommand.raiseCanExecuteChanged();
            this._closeESCommand.raiseCanExecuteChanged();
        }
        return this._deffered.promise();
    }
    //gracefully close the sse client
    close() {
        let self = this, postData:any = null;
        if (!this._es)
            return;
        try {
            self._close();
        }
        finally {
            utils.http.postAjax(self._closeClientUrl, postData);
        }
    }
    //post message (to itself or another client)
    post(message: string, clientID?: string): RIAPP.IAbortablePromise<string> {
        let payload = { message: message };
        let self = this, postData = JSON.stringify({ payload: payload, clientID: !clientID ? self._clientID : clientID });
        let req_promise = utils.http.postAjax(self._postMsgUrl, postData);
        return req_promise;
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        let self = this;
        try {
            self.close();
        } finally {
            super.destroy();
        }
    }
    get es() { return this._es; }
    get openESCommand(): RIAPP.ICommand { return this._openESCommand; }
    get closeESCommand(): RIAPP.ICommand { return this._closeESCommand; }
    get url() { return this._url; }
    get baseUrl() { return this._baseUrl; }
    get clientID() { return this._clientID; }
}