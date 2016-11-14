/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { DATA_ATTR } from "jriapp_core/const";
import {
    ITemplate, ITemplateEvents, IElView, IViewOptions
} from "jriapp_core/shared";
import { Utils } from "jriapp_utils/utils";
import { bootstrap } from "jriapp_core/bootstrap";
import { CommandElView } from "./command";

const utils = Utils, sys = utils.sys, boot = bootstrap;

sys._isTemplateElView = (obj: any) => {
    return !!obj && obj instanceof TemplateElView;
};

const PROP_NAME = {
    template: "template",
    isEnabled: "isEnabled"
};

export interface ITemplateOptions {
    dataContext?: any;
    templEvents?: ITemplateEvents;
}

export class TemplateElView extends CommandElView implements ITemplateEvents {
    private _template: ITemplate;
    private _isEnabled: boolean;

    constructor(options: IViewOptions) {
        super(options);
        this._template = null;
        this._isEnabled = true;
    }
    templateLoading(template: ITemplate): void {
        //noop
    }
    templateLoaded(template: ITemplate, error?: any): void {
        if (!!error)
            return;
        let self = this;
        try {
            self._template = template;
            let args = { template: template, isLoaded: true };
            self.invokeCommand(args, false);
            this.raisePropertyChanged(PROP_NAME.template);
        }
        catch (ex) {
            utils.err.reThrow(ex, this.handleError(ex, this));
        }
    }
    templateUnLoading(template: ITemplate): void {
        let self = this;
        try {
            let args = { template: template, isLoaded: false };
            self.invokeCommand(args, false);
        }
        catch (ex) {
            this.handleError(ex, this);
        }
        finally {
            self._template = null;
        }
        this.raisePropertyChanged(PROP_NAME.template);
    }
    toString() {
        return "TemplateElView";
    }
    get isEnabled() { return this._isEnabled; }
    set isEnabled(v: boolean) {
        if (this._isEnabled !== v) {
            this._isEnabled = v;
            this.raisePropertyChanged(PROP_NAME.isEnabled);
        }
    }
    get template() {
        return this._template;
    }
};

boot.registerElView("template", TemplateElView);