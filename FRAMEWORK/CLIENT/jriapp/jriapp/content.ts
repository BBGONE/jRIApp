﻿/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
   LocaleERRS
} from "jriapp_shared";
import {
    IContentFactory, IContentFactoryList, IConstructorContentOptions,
    TFactoryGetter, IContent, IContentOptions, IContentConstructor
} from "./shared";

const ERRS = LocaleERRS;

export function createContentFactoryList(): IContentFactoryList {
    return new FactoryList();
}

//the base content factory It is always the last in the chain of factories
class LastFactory implements IContentFactory {
    constructor() {
    }
    getContentType(options: IContentOptions): IContentConstructor {
        throw new Error(ERRS.ERR_BINDING_CONTENT_NOT_FOUND);
    }
    createContent(options: IConstructorContentOptions): IContent {
        throw new Error(ERRS.ERR_BINDING_CONTENT_NOT_FOUND);
    }
    isExternallyCachable(contentType: IContentConstructor): boolean {
        return false;
    }
}

class FactoryList implements IContentFactoryList {
    private _factory: IContentFactory;

    constructor() {
        this._factory = new LastFactory();
    }
    addFactory(factoryGetter: TFactoryGetter) {
        this._factory = factoryGetter(this._factory);
    }
    getContentType(options: IContentOptions): IContentConstructor {
        return this._factory.getContentType(options);
    }
    createContent(options: IConstructorContentOptions): IContent {
        return this._factory.createContent(options);
    }
    isExternallyCachable(contentType: IContentConstructor): boolean {
        return this._factory.isExternallyCachable(contentType);
    }
}