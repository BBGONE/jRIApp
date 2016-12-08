/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    BaseObject, Utils, IErrorHandler, IBaseObject
} from "jriapp_shared";
import { ITemplate, IApplication } from "./int";

const coreUtils = Utils.core;

export interface ICommand {
    canExecute: (sender: any, param: any) => boolean;
    execute: (sender: any, param: any) => void;
    raiseCanExecuteChanged: () => void;
    addOnCanExecuteChanged(fn: (sender: ICommand, args: {}) => void, nmspace?: string, context?: IBaseObject): void;
    removeOnCanExecuteChanged(nmspace?: string): void;
}

const CMD_EVENTS = {
    can_execute_changed: "canExecute_changed"
};

export type TAction<TParam, TThis> = (sender: any, param: TParam, thisObj: TThis) => void;
export type TPredicate<TParam, TThis> = (sender: any, param: TParam, thisObj: TThis) => boolean;

export class TCommand<TParam, TThis> extends BaseObject implements ICommand {
    protected _action: TAction<TParam, TThis>;
    protected _thisObj: TThis;
    protected _predicate: TPredicate<TParam, TThis>;
    private _objId: string;

    constructor(fn_action: TAction<TParam, TThis>, thisObj?: TThis, fn_canExecute?: TPredicate<TParam, TThis>) {
        super();
        this._objId = coreUtils.getNewID();
        this._action = fn_action;
        this._thisObj = !thisObj ? null : thisObj;
        this._predicate = !fn_canExecute ? null : fn_canExecute;
    }
    protected _getEventNames() {
        let base_events = super._getEventNames();
        return [CMD_EVENTS.can_execute_changed].concat(base_events);
    }
    protected _canExecute(sender: any, param: TParam, context: any): boolean {
        if (!this._predicate)
            return true;
        return this._predicate.apply(context, [sender, param, this._thisObj]);
    }
    protected _execute(sender: any, param: TParam, context: any) {
        if (!!this._action) {
            this._action.apply(context, [sender, param, this._thisObj]);
        }
    }
    addOnCanExecuteChanged(fn: (sender: ICommand, args: any) => void, nmspace?: string, context?: IBaseObject) {
        this._addHandler(CMD_EVENTS.can_execute_changed, fn, nmspace, context);
    }
    removeOnCanExecuteChanged(nmspace?: string) {
        this._removeHandler(CMD_EVENTS.can_execute_changed, nmspace);
    }
    canExecute(sender: any, param: TParam): boolean {
        return this._canExecute(sender, param, this._thisObj || this);
    }
    execute(sender: any, param: TParam) {
        this._execute(sender, param, this._thisObj || this);
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this._action = null;
        this._thisObj = null;
        this._predicate = null;
        super.destroy();
    }
    raiseCanExecuteChanged() {
        this.raiseEvent(CMD_EVENTS.can_execute_changed, {});
    }
    toString() {
        return "Command";
    }
    get uniqueID() {
        return this._objId;
    }
    get thisObj() {
        return this._thisObj;
    }
}

export abstract class BaseCommand<TParam, TThis> extends TCommand<TParam, TThis>
{
    constructor(thisObj: TThis) {
        super(null, thisObj, null);
        this._action = this.Action;
        this._predicate = this.getIsCanExecute;
    }
    canExecute(sender: any, param: TParam): boolean {
        return this._canExecute(sender, param, this);
    }
    execute(sender: any, param: TParam) {
        this._execute(sender, param, this);
    }
    protected abstract Action(sender: any, param: TParam): void;
    protected abstract getIsCanExecute(sender: any, param: TParam): boolean;
}

export type Command = TCommand<any, any>;
export const Command: new (fn_action: TAction<any, any>, thisObj?: any, fn_canExecute?: TPredicate<any, any>) => Command = TCommand;

//for strongly typed parameters
export type TemplateCommand = TCommand<{ template: ITemplate; isLoaded: boolean; }, any>;
export const TemplateCommand: new (fn_action: TAction<{ template: ITemplate; isLoaded: boolean; }, any>, thisObj?: any, fn_canExecute?: TPredicate<{ template: ITemplate; isLoaded: boolean; }, any>) => TemplateCommand = TCommand;

export class ViewModel<TApp extends IApplication> extends BaseObject {
    private _objId: string;
    private _app: TApp;

    constructor(app: TApp) {
        super();
        this._app = app;
        this._objId = coreUtils.getNewID();
    }
    toString() {
        return "ViewModel";
    }
    destroy() {
        this._app = null;
        super.destroy();
    }
    get uniqueID() {
        return this._objId;
    }
    get app(): TApp {
        return this._app;
    }
}