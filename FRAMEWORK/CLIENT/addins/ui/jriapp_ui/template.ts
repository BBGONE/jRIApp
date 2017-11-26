/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { Utils } from "jriapp_shared";
import { ITemplate, ITemplateEvents, IViewOptions } from "jriapp/int";
import { TCommand } from "jriapp/mvvm";
import { ViewChecks } from "jriapp/utils/viewchecks";
import { bootstrap } from "jriapp/bootstrap";
import { CommandElView } from "./command";

const utils = Utils, viewChecks = ViewChecks, boot = bootstrap, ERROR = utils.err;

viewChecks.isTemplateElView = (obj: any) => {
    return !!obj && obj instanceof TemplateElView;
};

const enum PROP_NAME {
    template = "template",
    isEnabled = "isEnabled"
}

export interface ITemplateOptions {
    dataContext?: any;
    templEvents?: ITemplateEvents;
}

// for strongly typed parameters
export type TemplateCommandParam = { template: ITemplate; isLoaded: boolean; };
export class TemplateCommand<TThis> extends TCommand<TemplateCommandParam, TThis>
{
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
        // noop
    }
    templateLoaded(template: ITemplate, error?: any): void {
        if (!!error) {
            return;
        }
        const self = this;
        try {
            self._template = template;
            const args: TemplateCommandParam = { template: template, isLoaded: true };
            self.invokeCommand(args, false);
            this.objEvents.raiseProp(PROP_NAME.template);
        } catch (ex) {
            ERROR.reThrow(ex, this.handleError(ex, this));
        }
    }
    templateUnLoading(template: ITemplate): void {
        const self = this;
        try {
            const args: TemplateCommandParam = { template: template, isLoaded: false };
            self.invokeCommand(args, false);
        } catch (ex) {
            this.handleError(ex, this);
        } finally {
            self._template = null;
        }
        this.objEvents.raiseProp(PROP_NAME.template);
    }
    toString(): string {
        return "TemplateElView";
    }
    get isEnabled(): boolean { return this._isEnabled; }
    set isEnabled(v: boolean) {
        if (this._isEnabled !== v) {
            this._isEnabled = v;
            this.objEvents.raiseProp(PROP_NAME.isEnabled);
        }
    }
    get template(): ITemplate {
        return this._template;
    }
};

boot.registerElView("template", TemplateElView);
