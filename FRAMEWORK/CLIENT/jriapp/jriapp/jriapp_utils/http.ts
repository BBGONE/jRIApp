/// <reference path="../jriapp_core/../../thirdparty/jquery.d.ts" />
/*
The MIT License (MIT)

Copyright(c) 2016 Maxim V.Tsapov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and / or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
import { IDeferred, IIndexer, DummyError } from "../jriapp_core/shared";
import { CoreUtils as coreUtils, StringUtils as strUtils } from "./coreutils";
import { AsyncUtils as defer, IAbortablePromise, AbortablePromise } from "./async";

export class HttpUtils {
    public static isStatusOK(status: string | number) {
        let chk = "" + status;
        return chk.length === 3 && strUtils.startsWith(chk, "2");
    }
    private static _getXMLRequest(url: string, method: string, deferred: IDeferred<string>, headers?: IIndexer<string>) {
        let req = new XMLHttpRequest();
        req.open(method, url, true);
        req.responseType = "text";
        req.onload = function (e) {
            let status = "" + this.status;
            if (status === "200") {
                let res: string = this.response;
                deferred.resolve(res);
            }
            else {
                if (HttpUtils.isStatusOK(status))
                    deferred.reject(new DummyError(new Error(strUtils.format('Status: "{0}" loading from URL: "{1}"', status, url))));
                else
                    deferred.reject(new Error(strUtils.format('Error: "{0}" to load from URL: "{1}"', status, url)));
            }
        };
        req.onerror = function (e: any) {
            deferred.reject(new Error(strUtils.format('Error: "{0}" to load from URL: "{1}"', this.status, url)));
        };
        req.ontimeout = function () {
            deferred.reject(new Error(strUtils.format('Error: "Request Timeout" to load from URL: "{0}"', url)));
        };
        req.onabort = function (e) {
            deferred.reject(new Error(strUtils.format('HTTP Request Operation Aborted for URL: "{0}"', url)));
        };
        req.timeout = HttpUtils.ajaxTimeOut * 1000;
        let _headers = <IIndexer<string>>coreUtils.merge(HttpUtils.defaultHeaders);
        _headers = coreUtils.merge(headers, _headers);
        coreUtils.iterateIndexer(_headers, (name, val) => {
            req.setRequestHeader(name, val);
        });
        return req;
    }
    static postAjax(url: string, postData: string, headers?: IIndexer<string>): IAbortablePromise<string> {
        let _headers = <IIndexer<string>>coreUtils.merge(headers, { "Content-Type": "application/json; charset=utf-8" });
        let deferred = defer.createDeferred<string>(), req = HttpUtils._getXMLRequest(url, "POST", deferred, _headers);
        req.send(postData);
        return new AbortablePromise(deferred, req);
    }
    static getAjax(url: string, headers?: IIndexer<string>): IAbortablePromise<string> {
        let deferred = defer.createDeferred<string>(), req = HttpUtils._getXMLRequest(url, "GET", deferred, headers);
        req.send(null);
        return new AbortablePromise(deferred, req);
    }
    static defaultHeaders: IIndexer<string> = {};
    static ajaxTimeOut: number = 600;
}