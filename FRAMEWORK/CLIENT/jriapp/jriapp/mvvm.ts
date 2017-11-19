/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    BaseObject, Utils, IBaseObject
} from "jriapp_shared";
import { IApplication } from "./int";

const coreUtils = Utils.core;

export interface ITCommand<TParam> {
    canExecute: (sender: any, param: TParam) => boolean;
    execute: (sender: any, param: TParam) => void;
    raiseCanExecuteChanged: () => void;
    addOnCanExecuteChanged(fn: (sender: ITCommand<TParam>, args: any) => void, nmspace?: string, context?: IBaseObject): void;
    removeOnCanExecuteChanged(nmspace?: string): void;
}
export type ICommand = ITCommand<any>;

const CMD_EVENTS = {
    can_execute_changed: "canExecute_changed"
};

export type TAction<TParam, TThis> = (this: TThis, sender: any, param: TParam) => void;
export type Action = TAction<any, any>;
export type TPredicate<TParam, TThis> = (this: TThis, sender: any, param: TParam) => boolean;
export type Predicate = TPredicate<any, any>;

export class TCommand<TParam, TThis> extends BaseObject implements ITCommand<TParam> {
    protected _action: TAction<TParam, TThis>;
    protected _thisObj: TThis;
    protected _predicate: TPredicate<TParam, TThis>;
    private _objId: string;

    constructor(fnAction: TAction<TParam, TThis>, thisObj?: TThis, fnCanExecute?: TPredicate<TParam, TThis>) {
        super();
        this._objId = coreUtils.getNewID("cmd");
        this._action = fnAction;
        this._thisObj = thisObj;
        this._predicate = fnCanExecute;
    }
    _getEventNames() {
        const baseEvents = super._getEventNames();
        return [CMD_EVENTS.can_execute_changed].concat(baseEvents);
    }
    protected _canExecute(sender: any, param: TParam, context: any): boolean {
        if (!this._predicate) {
            return true;
        }
        return this._predicate.apply(context, [sender, param]);
    }
    protected _execute(sender: any, param: TParam, context: any) {
        if (!!this._action) {
            this._action.apply(context, [sender, param]);
        }
    }
    addOnCanExecuteChanged(fn: (sender: ITCommand<TParam>, args: any) => void, nmspace?: string, context?: IBaseObject) {
        this.addHandler(CMD_EVENTS.can_execute_changed, fn, nmspace, context);
    }
    removeOnCanExecuteChanged(nmspace?: string) {
        this.removeHandler(CMD_EVENTS.can_execute_changed, nmspace);
    }
    canExecute(sender: any, param: TParam): boolean {
        return this._canExecute(sender, param, this._thisObj);
    }
    execute(sender: any, param: TParam) {
        this._execute(sender, param, this._thisObj);
    }
    destroy() {
        if (this._isDestroyed) {
            return;
        }
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
}

export abstract class BaseCommand<TParam, TOwner> extends TCommand<TParam, any> {
    private _owner: TOwner;
 
    constructor(owner: TOwner) {
        super(null, null, null);
        this._action = this.action;
        this._predicate = this.isCanExecute;
        this._thisObj = this;
        this._owner = owner;
    }
    protected abstract action(sender: any, param: TParam): void;
    protected abstract isCanExecute(sender: any, param: TParam): boolean;
    get owner() {
        return this._owner;
    }
}

export type Command = TCommand<any, any>;
export const Command: new (fnAction: Action, thisObj?: any, fnCanExecute?: Predicate) => Command = TCommand;

export class ViewModel<TApp extends IApplication> extends BaseObject {
    private _objId: string;
    private _app: TApp;

    constructor(app: TApp) {
        super();
        this._app = app;
        this._objId = coreUtils.getNewID("vm");
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