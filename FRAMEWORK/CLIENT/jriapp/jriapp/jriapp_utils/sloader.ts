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
import { IStylesLoader, IIndexer } from "../jriapp_core/shared";
import { Checks as checks } from "./checks";
import { StringUtils as strUtils } from "./strutils";
import { ArrayHelper } from "./arrhelper";
import { DomUtils as dom } from "./dom";
import { AsyncUtils as defer, IPromise, PromiseState, whenAll as asyncWhenAll } from "./async";
import { PathHelper } from "./path";

const resolvedPromise = defer.createSyncDeferred<void>().resolve();
const doc = dom.document, head = doc.head || doc.getElementsByTagName("head")[0];
let _stylesLoader: IStylesLoader = null;
export const frameworkCss = "jriapp.css";

export function create(): IStylesLoader {
    if (!_stylesLoader)
        _stylesLoader = new StylesLoader();
    return _stylesLoader;
}

function whenAll(promises: IPromise<any>[]): IPromise<any> {
    if (!promises)
        return resolvedPromise;
    if (promises.length === 1)
        return promises[0];
    let cnt = promises.length, resolved = 0;
    for (let i = 0; i < cnt; i += 1) {
        if (promises[i].state() === PromiseState.Resolved) {
            ++resolved;
        }
    }

    if (resolved === cnt) {
        return resolvedPromise;
    }
    else {
        return asyncWhenAll(promises);
    }
}

function createLink(url: string) {
    var link = doc.createElement("link");

    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = url;

    return link;
}

export interface IUrlParts {
    protocol: string;
    host: string;
    hostname: string;
    port: string;
    pathname: string;
    hash: string;
    search: string;
}

//load css styles on demand
class StylesLoader implements IStylesLoader {
    private _loadedCSS: IIndexer<IPromise<string>>;
    
    constructor() {
        this._loadedCSS = <IIndexer<IPromise<string>>>{};
    }
    private isStyleSheetLoaded(url: string): boolean {
        let testUrl = PathHelper.getUrlParts(url);
        let arr = ArrayHelper.fromList(doc.styleSheets);
        for (let i = 0; i < arr.length; i += 1) {
            let cssUrl = PathHelper.getUrlParts(arr[i].href);
            if (cssUrl.hostname === testUrl.hostname && cssUrl.pathname === testUrl.pathname) {
                return true;
            }
        }

        return false;
    }
    private loadByLink(url: string, fn_onload: (err: any) => void) {
        let link = createLink(url);
        link.onload = function () {
            fn_onload(null);
        };
        link.onerror = function () {
            fn_onload("Error loading: " + url);
        };
        head.appendChild(link);
    }
    private load(url: string, load: (err: any) => void): void {
        this.loadByLink(url, load);
    };
    private static ensureCssExt(name: string): string {
        return name.search(/\.(css|less|scss)$/i) === -1 ? name + ".css" : name;
    }
    loadStyle(url: string): IPromise<string> {
        url = PathHelper.appendBust(url);
        let cssUrl = PathHelper.getNormalizedUrl(url);

        //test if we already are loading this css file
        let cssPromise = this._loadedCSS[cssUrl];
        if (!!cssPromise) {
            return cssPromise;
        }
        let deferred = defer.createSyncDeferred<string>();
        cssPromise = deferred.promise();

        if (this.isStyleSheetLoaded(url)) {
            deferred.resolve(url);
            this._loadedCSS[cssUrl] = cssPromise;
            return cssPromise;
        }

        this.load(url, (err: any) => {
            if (!!err)
                deferred.reject(err);
            else
                deferred.resolve(url);
        });

        this._loadedCSS[cssUrl] = cssPromise;
        return cssPromise;
    }
    loadStyles(urls: string[]): IPromise<any> {
        let promises = <IPromise<string>[]>[];

        for (let i = 0; i < urls.length; i += 1) {
            promises.push(this.loadStyle(urls[i]));
        }
        return whenAll(promises);
    }
    loadOwnStyle(cssName?: string): IPromise<string> {
        cssName = cssName || frameworkCss;
        let cssUrl = PathHelper.getFrameworkCssPath() + StylesLoader.ensureCssExt(cssName);
        return this.loadStyle(cssUrl);
    }
    whenAllLoaded(): IPromise<any> {
        let obj = this._loadedCSS, names = Object.keys(obj), promises = <IPromise<any>[]>[];
        for (let i = 0; i < names.length; i += 1) {
            promises.push(obj[names[i]]);
        }
        return whenAll(promises);
    }
}