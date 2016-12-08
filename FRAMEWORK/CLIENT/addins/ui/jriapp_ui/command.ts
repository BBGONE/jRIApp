/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { Utils, IBaseObject } from "jriapp_shared";
import { IViewOptions } from "jriapp/int";
import { ICommand } from "jriapp/mvvm";
import { BaseElView, PROP_NAME, css } from "./baseview";

const utils = Utils, dom = utils.dom, checks = utils.check, sys = utils.sys;

export interface ICommandViewOptions extends IViewOptions {
    preventDefault?: boolean;
    stopPropagation?: boolean;
}

export class CommandElView extends BaseElView {
    private _command: ICommand;
    private _commandParam: any;
    private _preventDefault: boolean;
    private _stopPropagation: boolean;
    private _disabled: boolean;

    constructor(options: ICommandViewOptions) {
        super(options);
        this._command = null;
        this._commandParam = null;
        this._preventDefault = !!options.preventDefault;
        this._stopPropagation = !!options.stopPropagation;
        this._disabled = ("disabled" in this.el) ? checks.undefined : false;
        dom.setClass(this.$el.toArray(), css.disabled, this.isEnabled);
    }
    private _onCanExecuteChanged(cmd: ICommand, args: any) {
        this.isEnabled = cmd.canExecute(this, this._commandParam);
    }
    protected _onCommandChanged() {
        this.raisePropertyChanged(PROP_NAME.command);
    }
    protected invokeCommand(args: any, isAsync: boolean) {
        let self = this;
        args = args || this._commandParam || {};
        if (!!self.command && self.command.canExecute(self, args)) {
            if (isAsync) {
                setTimeout(function () {
                    if (self.getIsDestroyCalled())
                        return;
                    //repeat the check after timeout
                    try {
                        if (!!self.command && self.command.canExecute(self, args))
                            self.command.execute(self, args);
                    }
                    catch (ex) {
                        self.handleError(ex, self);
                    }
                }, 0);
            }
            else {
                self.command.execute(self, args);
            }
        }
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        if (sys.isBaseObj(this._command)) {
            (<IBaseObject><any>this._command).removeNSHandlers(this.uniqueID);
        }
        this.command = null;
        this._commandParam = null;
        super.destroy();
    }
    toString() {
        return "CommandElView";
    }
    get isEnabled() {
        let el: any = this.el;
        if (this._disabled === checks.undefined)
            return !el.disabled;
        else
            return !this._disabled;
    }
    set isEnabled(v: boolean) {
        let el: any = this.el;
        if (v !== this.isEnabled) {
            if (this._disabled === checks.undefined)
                el.disabled = !v;
            else
                this._disabled = !v;

            dom.setClass(this.$el.toArray(), css.disabled, !!v);
            this.raisePropertyChanged(PROP_NAME.isEnabled);
        }
    }
    get command() { return this._command; }
    set command(v) {
        let self = this;
        if (v !== this._command) {
            if (sys.isBaseObj(this._command)) {
                (<IBaseObject><any>this._command).removeNSHandlers(this.uniqueID);
            }
            this._command = v;
            if (!!this._command) {
                this._command.addOnCanExecuteChanged(self._onCanExecuteChanged, this.uniqueID, self);
                self.isEnabled = this._command.canExecute(self, this.commandParam || {});
            }
            else {
                self.isEnabled = false;
            }
            this._onCommandChanged();
        }
    }
    get commandParam() { return this._commandParam; }
    set commandParam(v) {
        if (v !== this._commandParam) {
            this._commandParam = v;
            this.raisePropertyChanged(PROP_NAME.commandParam);
        }
    }
    get preventDefault() {
        return this._preventDefault;
    }
    get stopPropagation() {
        return this._stopPropagation;
    }
}