/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { Utils } from "jriapp_shared";
import { IViewOptions } from "jriapp/int";
import { DomUtils } from "jriapp/utils/dom";
import { ICommand } from "jriapp/mvvm";
import { BaseElView, cssStyles } from "./baseview";

const utils = Utils, dom = DomUtils, sys = utils.sys;

export interface ICommandViewOptions extends IViewOptions {
    preventDefault?: boolean;
    stopPropagation?: boolean;
}

const enum CommandFlags {
    PreventDefault = 0,
    StopPropagation = 1,
    Disabled= 2
}

export class CommandElView<TElement extends HTMLElement = HTMLElement> extends BaseElView<TElement> {
    private _command: ICommand;
    private _commandParam: any;
    private _flags: number;

    constructor(el: TElement, options: ICommandViewOptions) {
        super(el, options);
        this._command = null;
        this._commandParam = null;
        this._flags = 0;
        this._setFlag(!!options.preventDefault, CommandFlags.PreventDefault);
        this._setFlag(!!options.stopPropagation, CommandFlags.StopPropagation);
        const disabled = ("disabled" in el) && (<any>el).disabled;
        if (disabled) {
            this._setFlag(disabled, CommandFlags.Disabled);
        }
        dom.setClass([el], cssStyles.disabled, this.isEnabled);
    }
    private _getFlag(flag: CommandFlags): boolean {
        return !!(this._flags & (1 << flag));
    }
    private _setFlag(v: boolean, flag: CommandFlags) {
        if (v) {
            this._flags |= (1 << flag);
        } else {
            this._flags &= ~(1 << flag);
        }
    }
    private _onCanExecuteChanged(cmd: ICommand, args: any): void {
        this.isEnabled = cmd.canExecute(this, this._commandParam);
    }
    protected _onCommandChanged(): void {
        this.objEvents.raiseProp("command");
    }
    protected invokeCommand(args: any, isAsync: boolean): void {
        const self = this;
        args = args || this._commandParam || {};
        if (!!self.command && self.command.canExecute(self, args)) {
            if (isAsync) {
                utils.queue.enque(() => {
                    if (self.getIsStateDirty()) {
                        return;
                    }
                    // repeat the check after timeout
                    try {
                        if (!!self.command && self.command.canExecute(self, args)) {
                            self.command.execute(self, args);
                        }
                    } catch (ex) {
                        self.handleError(ex, self);
                    }
                });
            } else {
                self.command.execute(self, args);
            }
        }
    }
    dispose(): void {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        if (sys.isBaseObj(this._command)) {
            this._command.objEvents.offNS(this.uniqueID);
        }
        this.command = null;
        this._commandParam = null;
        super.dispose();
    }
    toString(): string {
        return "CommandElView";
    }
    get command(): ICommand {
        return this._command;
    }
    set command(v: ICommand) {
        const self = this;
        if (v !== this._command) {
            if (sys.isBaseObj(this._command)) {
                this._command.objEvents.offNS(this.uniqueID);
            }
            this._command = v;
            if (!!this._command) {
                this._command.addOnCanExecuteChanged(self._onCanExecuteChanged, this.uniqueID, self);
                self.isEnabled = this._command.canExecute(self, this.commandParam || {});
            } else {
                self.isEnabled = false;
            }
            this._onCommandChanged();
        }
    }
    get commandParam(): any {
        return this._commandParam;
    }
    set commandParam(v: any) {
        if (v !== this._commandParam) {
            this._commandParam = v;
            this.objEvents.raiseProp("commandParam");
        }
    }
    get isEnabled(): boolean {
        const el: any = this.el;
        if (("disabled" in this.el)) {
            return !el.disabled;
        } else {
            return !this._getFlag(CommandFlags.Disabled)
        }
    }
    set isEnabled(v: boolean) {
        const el: any = this.el;
        if (v !== this.isEnabled) {
            if (("disabled" in this.el)) {
                el.disabled = !v;
                this._setFlag(!v, CommandFlags.Disabled);
            } else {
                this._setFlag(!v, CommandFlags.Disabled);
            }
            dom.setClass([this.el], cssStyles.disabled, !!v);
            this.objEvents.raiseProp("isEnabled");
        }
    }
    get preventDefault(): boolean {
        return this._getFlag(CommandFlags.PreventDefault);
    }
    get stopPropagation(): boolean {
        return this._getFlag(CommandFlags.StopPropagation);
    }
}
