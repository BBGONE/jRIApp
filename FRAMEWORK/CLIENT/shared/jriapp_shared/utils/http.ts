/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { IDeferred, IAbortablePromise } from "./ideferred";
import { IIndexer } from "../int";
import { StringUtils } from "./strUtils";
import { DummyError } from "../errors";
import { CoreUtils } from "./coreutils";
import { AbortablePromise } from "./deferred";
import { AsyncUtils } from "./async";

const { forEach, merge, Indexer } = CoreUtils, { startsWith, format } = StringUtils, { createDeferred } = AsyncUtils;

export class HttpUtils {
    public static isStatusOK(status: string | number): boolean {
        const chk = "" + status;
        return chk.length === 3 && startsWith(chk, "2");
    }
    private static _getXMLRequest(url: string, method: string, deferred: IDeferred<string>, headers?: IIndexer<string>): XMLHttpRequest {
        const req = new XMLHttpRequest();
        req.open(method, url, true);
        req.responseType = "text";
        req.onload = function () {
            const status = "" + req.status;
            if (status === "200") {
                const res: string = req.response;
                deferred.resolve(res);
            } else {
                if (HttpUtils.isStatusOK(status)) {
                    deferred.reject(new DummyError(new Error(format('Status: "{0}" loading from URL: "{1}"', status, url))));
                } else {
                    deferred.reject(new Error(format('Error: "{0}" to load from URL: "{1}"', status, url)));
                }
            }
        };
        req.onerror = function () {
            deferred.reject(new Error(format('Error: "{0}" to load from URL: "{1}"', req.status, url)));
        };
        req.ontimeout = function () {
            deferred.reject(new Error(format('Error: "Request Timeout" to load from URL: "{0}"', url)));
        };
        req.onabort = function () {
            deferred.reject(new Error(format('HTTP Request Operation Aborted for URL: "{0}"', url)));
        };
        req.timeout = HttpUtils.ajaxTimeOut * 1000;
        let _headers = <IIndexer<string>>merge(HttpUtils.defaultHeaders);
        _headers = merge(headers, _headers);
        forEach(_headers, (name, val) => {
            req.setRequestHeader(name, val);
        });
        return req;
    }
    static postAjax(url: string, postData: string, headers?: IIndexer<string>): IAbortablePromise<string> {
        const _headers = <IIndexer<string>>merge(headers, { "Content-Type": "application/json; charset=utf-8" });
        const deferred = createDeferred<string>(),
            req = HttpUtils._getXMLRequest(url, "POST", deferred, _headers);
        req.send(postData);
        return new AbortablePromise(deferred, req);
    }
    static getAjax(url: string, headers?: IIndexer<string>): IAbortablePromise<string> {
        const deferred = createDeferred<string>(),
            req = HttpUtils._getXMLRequest(url, "GET", deferred, headers);
        req.send(null);
        return new AbortablePromise(deferred, req);
    }
    static defaultHeaders: IIndexer<string> = Indexer();
    static ajaxTimeOut: number = 600;
}
