/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    IIndexer, Utils
} from "jriapp_shared";
import { IJRIAppConfig, Config as config } from "../int";

const utils = Utils, doc = utils.dom.document, head = doc.head || doc.getElementsByTagName("head")[0],
    arrHelper = utils.arr, strUtils = utils.str;
export const frameworkJS = config.frameworkJS || "jriapp.js";
const stylesDir = "css", imageDir = "img";


export interface IUrlParts {
    protocol: string;
    host: string;
    hostname: string;
    port: string;
    pathname: string;
    hash: string;
    search: string;
}

//private to the module function
function fn_getFrameworkPath(): string {
    let name = frameworkJS;
    let arr = arrHelper.fromList<HTMLScriptElement>(doc.scripts);

    for (let i = 0; i < arr.length; i += 1) {
        let script = arr[i];
        if (!!script.src) {
            let parts = PathHelper.getUrlParts(script.src);
            let pathName = strUtils.rtrim(parts.pathname, "/");
            if (!!parts.pathname) {
                pathName = pathName.toLowerCase();
                if (!!pathName && pathName.lastIndexOf(name) > -1) {
                    let url = script.src;
                    return PathHelper.getParentUrl(url);
                }
            }
        }
    }

    return null;
}

let _cache = <IIndexer<string>>{};

export class PathHelper {
    private static _anchor: HTMLAnchorElement = doc.createElement("a");
    static appendBust(url: string): string {
        let bust = config.bust;
        if (!bust)
            return url;
        return PathHelper.appendSearch(url, bust);
    }
    static appendSearch(url: string, search: string): string {
        search = strUtils.ltrim(search, "?");
        let parts = PathHelper.getUrlParts(url);
        let oldSearch = strUtils.ltrim(parts.search, "?");
        if (!!oldSearch && oldSearch.lastIndexOf(search) > -1)
            return url;

        if (!oldSearch)
            url = url + "?" + search;
        else
            url = url + "&" + search;

        return url;
    }
    static getNormalizedUrl(url: string): string {
        PathHelper._anchor.href = url;
        return PathHelper._anchor.href;
    }
    static getUrlParts(url: string): IUrlParts {
        let parser = PathHelper._anchor;
        parser.href = url;
        // IE doesn't populate all link properties when setting .href with a relative URL,
        // however .href will return an absolute URL which then can be used on itself
        // to populate these additional fields.
        if (!parser.host) {
            parser.href = parser.href;
        }
        return {
            protocol: parser.protocol,
            host: parser.host, // "www.example.com:4097"
            hostname: parser.hostname, // "www.example.com"
            port: parser.port,
            pathname: parser.pathname, // "/test.htm"
            hash: parser.hash, // "#hash"
            search: parser.search // "?search=test"
        };
    }
    static getParentUrl(url: string): string {
        let res = "";
        if (url.charAt(url.length - 1) === "/") {
            res = url.slice(0, url.lastIndexOf("/"));
            res = res.slice(0, res.lastIndexOf("/")) + "/";
        } else {
            res = url.slice(0, url.lastIndexOf("/")) + "/";
        }
        return res;
    }

    static getFrameworkPath(): string {
        let res = _cache["root"];
        if (!res) {
            //we have a provided jriapp root already in global variable
            if (!!config.frameworkPath) {
                res = config.frameworkPath;
            }

            //still no result
            if (!res) {
                res = fn_getFrameworkPath();
            }

            if (!!res) {
                _cache["root"] = res;
            }
        }

        if (!res)
            throw new Error(strUtils.format("Can not resolve {0} framework path", name));

        return res;
    }
    static getFrameworkCssPath() {
        let res = _cache["css"];
        if (!res) {
            res = PathHelper.getFrameworkPath() + [stylesDir, "/"].join("");
            _cache["css"] = res;
        }
        return res;
    }
    static getFrameworkImgPath() {
        let res = _cache["img"];
        if (!res) {
            res = PathHelper.getFrameworkPath() + [imageDir, "/"].join("");
            _cache["img"] = res;
        }
        return res;
    }
}