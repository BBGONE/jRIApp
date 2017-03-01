/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { Utils } from "jriapp_shared";
import { ITemplate, ITemplateEvents, IViewOptions } from "jriapp/int";
import { ViewChecks } from "jriapp/utils/viewchecks";
import { bootstrap } from "jriapp/bootstrap";
import { CommandElView } from "./command";

const utils = Utils, viewChecks = ViewChecks, boot = bootstrap;

viewChecks.isTemplateElView = (obj: any) => {
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
    toString(): string {
        return "TemplateElView";
    }
    get isEnabled(): boolean { return this._isEnabled; }
    set isEnabled(v: boolean) {
        if (this._isEnabled !== v) {
            this._isEnabled = v;
            this.raisePropertyChanged(PROP_NAME.isEnabled);
        }
    }
    get template(): ITemplate {
        return this._template;
    }
};

boot.registerElView("template", TemplateElView);