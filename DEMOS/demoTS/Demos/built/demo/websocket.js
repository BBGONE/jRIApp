var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "jriapp"], function (require, exports, RIAPP) {
    "use strict";
    var bootstrap = RIAPP.bootstrap, utils = RIAPP.Utils;
    var WebSocketsVM = (function (_super) {
        __extends(WebSocketsVM, _super);
        function WebSocketsVM(url) {
            _super.call(this);
            var self = this;
            this._ws = null;
            this._clientID = null;
            this._deffered = null;
            this._url = url;
            this._openWsCommand = new RIAPP.TCommand(function (sender, data) {
                self.open().then(function () { }, function (res) {
                    self.handleError(res, self);
                });
            }, null, function () {
                return !self._ws;
            });
            this._closeWsCommand = new RIAPP.TCommand(function (sender, data) {
                self.close();
            }, null, function () {
                return !!self._ws;
            });
            bootstrap.addOnUnLoad(function (s, a) {
                self.close();
            });
        }
        WebSocketsVM.createUrl = function (port, svcName, isSSL) {
            svcName = !!svcName ? svcName : "PollingService";
            var url = (!isSSL ? "ws://" : "wss://") + window.location.host.split(":")[0] + ":" + port + "/" + svcName;
            return url;
        };
        WebSocketsVM.isSupported = function () {
            try {
                return !!WebSocket;
            }
            catch (e) {
                return false;
            }
        };
        WebSocketsVM.prototype._getEventNames = function () {
            var base_events = _super.prototype._getEventNames.call(this);
            return ['open', 'close', 'error', 'message'].concat(base_events);
        };
        WebSocketsVM.prototype._onWsOpen = function (event) {
        };
        WebSocketsVM.prototype._onWsClose = function (event) {
            this._ws = null;
            this._clientID = null;
            clearTimeout(this._timeOut);
            this._timeOut = null;
            this._ws = null;
            this._clientID = null;
            this._openWsCommand.raiseCanExecuteChanged();
            this._closeWsCommand.raiseCanExecuteChanged();
            if (!!this._deffered) {
                this._deffered.reject("Websocket closed");
                this._deffered = null;
            }
            this.raiseEvent('close', {});
        };
        WebSocketsVM.prototype._onWsError = function (event) {
            this.handleError("Websocket error", this);
            this.close();
        };
        WebSocketsVM.prototype._onMsg = function (event) {
            var res = JSON.parse(event.data);
            if (res.Tag == "connect") {
                clearTimeout(this._timeOut);
                this._timeOut = null;
                this._clientID = res.Payload.id;
                if (!!this._deffered) {
                    this._deffered.resolve(this._clientID);
                    this._deffered = null;
                }
            }
            else if (res.Tag == "closed") {
                this.close();
            }
            else if (res.Tag == "message") {
                this.raiseEvent('message', { message: event.data, data: res.Payload });
            }
            else
                console.log(event.data);
        };
        WebSocketsVM.prototype.addOnMessage = function (fn, nmspace, context) {
            this.addHandler('message', fn, nmspace, context);
        };
        WebSocketsVM.prototype.open = function () {
            var self = this;
            if (!!this._deffered)
                return this._deffered.promise();
            this._deffered = utils.defer.createDeferred();
            if (!!this._ws && !!this._clientID) {
                this._deffered.resolve(this._clientID);
                var promise = this._deffered.promise();
                this._deffered = null;
                return promise;
            }
            this._timeOut = setTimeout(function () {
                self._timeOut = null;
                if (!!self._deffered) {
                    self._deffered.reject("Websocket connection timeout: " + self._url);
                    self._deffered = null;
                    self.close();
                }
            }, 5000);
            if (!this._ws) {
                this._ws = new WebSocket(self.url);
                this._ws.onopen = function (e) { self._onWsOpen(e); };
                this._ws.onclose = function (e) { self._onWsClose(e); };
                this._ws.onmessage = function (e) { self._onMsg(e); };
                this._ws.onerror = function (e) { self._onWsError(e); };
                this._openWsCommand.raiseCanExecuteChanged();
                this._closeWsCommand.raiseCanExecuteChanged();
            }
            return this._deffered.promise();
        };
        WebSocketsVM.prototype.close = function () {
            clearTimeout(this._timeOut);
            this._timeOut = null;
            if (!!this._deffered) {
                this._deffered.reject("Websocket closed");
            }
            this._deffered = null;
            if (!!this._ws) {
                try {
                    this._ws.close();
                    this._ws = null;
                    this._clientID = null;
                    this._openWsCommand.raiseCanExecuteChanged();
                    this._closeWsCommand.raiseCanExecuteChanged();
                }
                catch (e) {
                    this._ws = null;
                    this._clientID = null;
                }
            }
        };
        WebSocketsVM.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            var self = this;
            try {
                self.close();
            }
            finally {
                _super.prototype.destroy.call(this);
            }
        };
        Object.defineProperty(WebSocketsVM.prototype, "ws", {
            get: function () { return this._ws; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WebSocketsVM.prototype, "openWsCommand", {
            get: function () { return this._openWsCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WebSocketsVM.prototype, "closeWsCommand", {
            get: function () { return this._closeWsCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WebSocketsVM.prototype, "url", {
            get: function () { return this._url; },
            set: function (v) { this._url = v; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(WebSocketsVM.prototype, "clientID", {
            get: function () { return this._clientID; },
            enumerable: true,
            configurable: true
        });
        return WebSocketsVM;
    }(RIAPP.BaseObject));
    exports.WebSocketsVM = WebSocketsVM;
});
