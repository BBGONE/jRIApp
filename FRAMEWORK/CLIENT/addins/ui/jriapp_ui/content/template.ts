/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { BaseObject, LocaleERRS as ERRS, Utils } from "jriapp_shared";
import {
    IContent, IApplication, ITemplate, ITemplateInfo, IConstructorContentOptions
} from "jriapp/int";
import { DomUtils } from "jriapp/utils/dom";
import { bootstrap } from "jriapp/bootstrap";
import { createTemplate } from "jriapp/template";

import { css } from "./int";

const utils = Utils, coreUtils = utils.core, dom = DomUtils, boot = bootstrap, ERROR = utils.err;

export class TemplateContent extends BaseObject implements IContent {
    private _parentEl: HTMLElement;
    private _template: ITemplate;
    private _templateInfo: ITemplateInfo;
    private _isEditing: boolean;
    private _dataContext: any;
    private _templateID: string;

    constructor(options: IConstructorContentOptions) {
        super();
        options = coreUtils.extend(
            {
                parentEl: null,
                contentOptions: null,
                dataContext: null,
                isEditing: false,
                appName: null
            }, options);
        this._templateID = null;
        this._parentEl = options.parentEl;
        this._isEditing = options.isEditing;
        this._dataContext = options.dataContext;
        this._templateInfo = options.contentOptions.templateInfo;
        this._template = null;
        dom.addClass([this._parentEl], css.content);
    }
    private getTemplateID() {
        if (!this._templateInfo) {
            throw new Error(ERRS.ERR_TEMPLATE_ID_INVALID);
        }
        let info = this._templateInfo, id = info.displayID;
        if (this._isEditing && !!info.editID) {
            id = info.editID;
        }

        if (!id) {
            id = info.editID;
        }

        if (!id)
            throw new Error(ERRS.ERR_TEMPLATE_ID_INVALID);
        return id;
    }
    private createTemplate(): ITemplate {
        const template = createTemplate(this._dataContext);
        template.templateID = this._templateID;
        return template;
    }
    protected cleanUp() {
        if (!!this._template) {
            this._template.destroy();
            this._template = null;
            this._templateID = null;
        }
    }
    render() {
        try {
            const id = this.getTemplateID();
            if (this._templateID !== id) {
                this.cleanUp();
                this._templateID = id;
                this._template = this.createTemplate();
                this._parentEl.appendChild(this._template.el);
            }
        } catch (ex) {
            ERROR.reThrow(ex, this.handleError(ex, this));
        }
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        dom.removeClass([this._parentEl], css.content);
        this.cleanUp();
        this._parentEl = null;
        this._dataContext = null;
        this._templateInfo = null;
        super.destroy();
    }
    toString() {
        return "TemplateContent";
    }
    get parentEl() { return this._parentEl; }
    get template() { return this._template; }
    get isEditing() { return this._isEditing; }
    set isEditing(v) {
        if (this._isEditing !== v) {
            this._isEditing = v;
            this.render();
        }
    }
    get dataContext() { return this._dataContext; }
    set dataContext(v) {
        if (this._dataContext !== v) {
            this._dataContext = v;
            if (!!this._template) {
                this._template.dataContext = this._dataContext;
            }
        }
    }
    get app(): IApplication { return boot.getApp(); }
}