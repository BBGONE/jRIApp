import { IViewOptions, IBaseObject } from "../jriapp_core/shared";
import { Checks as checks } from "../jriapp_utils/coreutils";
import { ICommand } from "../jriapp_core/mvvm";
import { Utils as utils } from "../jriapp_utils/utils";
import { BaseElView, PROP_NAME, css } from "./elview";

export class CommandElView extends BaseElView {
    private _command: ICommand;
    private _commandParam: any;

    constructor(options: IViewOptions) {
        super(options);
        this._command = null;
        this._commandParam = null;

        if (!this.isEnabled) {
            this.$el.addClass("disabled");
        }
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
        if (checks.isBaseObject(this._command)) {
            (<IBaseObject><any>this._command).removeNSHandlers(this.uniqueID);
        }
        this.command = null;
        this._commandParam = null;
        super.destroy();
    }
    toString() {
        return "CommandElView";
    }
    get isEnabled() { return !(this.$el.prop(PROP_NAME.disabled)); }
    set isEnabled(v: boolean) {
        if (v !== this.isEnabled) {
            this.$el.prop(PROP_NAME.disabled, !v);
            if (!v)
                this.$el.addClass(css.disabled);
            else
                this.$el.removeClass(css.disabled);
            this.raisePropertyChanged(PROP_NAME.isEnabled);
        }
    }
    get command() { return this._command; }
    set command(v) {
        let self = this;
        if (v !== this._command) {
            if (checks.isBaseObject(this._command)) {
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
}