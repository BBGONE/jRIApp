/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import {
    BaseObject, Utils, IBaseObject, TEventHandler, TErrorHandler
} from "jriapp_shared";
import { IApplication } from "./int";

const coreUtils = Utils.core;

export interface ITCommand<TParam> {
    canExecute: (sender: any, param: TParam) => boolean;
    execute: (sender: any, param: TParam) => void;
    raiseCanExecuteChanged: () => void;
    addOnCanExecuteChanged(fn: (sender: ITCommand<TParam>, args: any) => void, nmspace?: string, context?: IBaseObject): void;
    offOnCanExecuteChanged(nmspace?: string): void;
}
export type ICommand = ITCommand<any>;

const enum CMD_EVENTS {
    can_execute_changed = "canExecute_changed"
}

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
        this.objEvents.on(CMD_EVENTS.can_execute_changed, fn, nmspace, context);
    }
    offOnCanExecuteChanged(nmspace?: string) {
        this.objEvents.off(CMD_EVENTS.can_execute_changed, nmspace);
    }
    canExecute(sender: any, param: TParam): boolean {
        return this._canExecute(sender, param, this._thisObj);
    }
    execute(sender: any, param: TParam) {
        this._execute(sender, param, this._thisObj);
    }
    dispose() {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        this._action = null;
        this._thisObj = null;
        this._predicate = null;
        super.dispose();
    }
    raiseCanExecuteChanged() {
        this.objEvents.raise(CMD_EVENTS.can_execute_changed, {});
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
    addOnDisposed(handler: TEventHandler<ViewModel<TApp>, any>, nmspace?: string, context?: object): void {
        this.objEvents.addOnDisposed(handler, nmspace, context);
    }
    offOnDisposed(nmspace?: string): void {
        this.objEvents.offOnDisposed(nmspace);
    }
    addOnError(handler: TErrorHandler<ViewModel<TApp>>, nmspace?: string, context?: object): void {
        this.objEvents.addOnError(handler, nmspace, context);
    }
    offOnError(nmspace?: string): void {
        this.objEvents.offOnError(nmspace);
    }
    toString() {
        return "ViewModel";
    }
    get uniqueID() {
        return this._objId;
    }
    get app(): TApp {
        return this._app;
    }
}