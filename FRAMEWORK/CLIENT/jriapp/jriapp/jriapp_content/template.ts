/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IContent, ITemplateEvents, IApplication, ITemplate, ITemplateInfo, IConstructorContentOptions }  from "../jriapp_core/shared";
import { BaseObject }  from "../jriapp_core/object";
import { ERRS } from "../jriapp_core/lang";
import { ERROR } from "../jriapp_utils/coreutils";
import { Utils as utils } from "../jriapp_utils/utils";

import { css } from "./int";

const coreUtils = utils.core, $ = utils.dom.$;

export class TemplateContent extends BaseObject implements IContent, ITemplateEvents {
    private _parentEl: HTMLElement;
    private _template: ITemplate;
    private _templateInfo: ITemplateInfo;
    private _isEditing: boolean;
    private _dataContext: any;
    private _app: IApplication;
    private _isDisabled: boolean;
    private _templateID: string;

    constructor(options: IConstructorContentOptions) {
        super();
        options = coreUtils.extend(
            {
                parentEl: null,
                contentOptions: null,
                dataContext: null,
                isEditing: false,
                app: null
            }, options);
        this._templateID = null;
        this._app = options.app;
        this._parentEl = options.parentEl;
        this._isEditing = options.isEditing;
        this._dataContext = options.dataContext;
        this._templateInfo = options.contentOptions.templateInfo;
        this._template = null;
        let $p = $(this._parentEl);
        $p.addClass(css.content);
        this.render();
    }
    handleError(error: any, source: any): boolean {
        let isHandled = super.handleError(error, source);
        if (!isHandled) {
            return this._app.handleError(error, source);
        }
        return isHandled;
    }
    templateLoading(template: ITemplate): void {
        //noop
    }
    templateLoaded(template: ITemplate, error?: any): void {
        //noop
    }
    templateUnLoading(template: ITemplate): void {
        this._parentEl.removeChild(template.el);
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
        let template = this.app.createTemplate(this._dataContext, this);
        template.templateID = this._templateID;
        return template;
    }
    protected render() {
        try {
            let id = this.getTemplateID();
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
    protected cleanUp() {
        if (!!this._template) {
            this._template.destroy();
            this._template = null;
            this._templateID = null;
        }
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        $(this._parentEl).removeClass(css.content);
        this.cleanUp();
        this._parentEl = null;
        this._dataContext = null;
        this._templateInfo = null;
        this._app = null;
        super.destroy();
    }
    toString() {
        return "TemplateContent";
    }
    get app() { return this._app; }
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
}