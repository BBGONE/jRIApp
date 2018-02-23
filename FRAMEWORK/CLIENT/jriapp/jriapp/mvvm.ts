/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import {
    BaseObject, Utils, IBaseObject, TEventHandler, TErrorHandler
} from "jriapp_shared";
import { IApplication } from "./int";

const { getNewID } = Utils.core;

export interface ICommand<TParam = any> {
    canExecute: (sender: any, param: TParam) => boolean;
    execute: (sender: any, param: TParam) => void;
    raiseCanExecuteChanged: () => void;
    addOnCanExecuteChanged(fn: (sender: ICommand<TParam>, args: any) => void, nmspace?: string, context?: IBaseObject): void;
    offOnCanExecuteChanged(nmspace?: string): void;
}

const enum CMD_EVENTS {
    can_execute_changed = "canExecute_changed"
}

export type Action<TParam = any, TThis = any> = (this: TThis, sender: any, param: TParam) => void;
export type Predicate<TParam = any, TThis = any> = (this: TThis, sender: any, param: TParam) => boolean;

export class Command<TParam = any, TContext = any> extends BaseObject implements ICommand<TParam> {
    private _action: Action<TParam, TContext>;
    private _context: TContext;
    private _predicate: Predicate<TParam, TContext>;
    private _uniqueID: string;

    constructor(fnAction: Action<TParam, TContext>, context?: TContext, fnCanExecute?: Predicate<TParam, TContext>) {
        super();
        this._uniqueID = getNewID("cmd");
        this._action = fnAction;
        this._context = context;
        this._predicate = fnCanExecute;
    }
    dispose(): void {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        this._action = null;
        this._context = null;
        this._predicate = null;
        super.dispose();
    }
    protected _canExecute(sender: any, param: TParam): boolean {
        const predicate = this._getPredicate(), context = this._getContext();
        return !predicate ? true : predicate.apply(context, [sender, param]);
    }
    protected _execute(sender: any, param: TParam): void {
        const action = this._getAction(), context = this._getContext();
        if (!!action) {
            action.apply(context, [sender, param]);
        }
    }
    protected _getAction(): Action<TParam, TContext> {
        return this._action;
    }
    protected _getPredicate(): Predicate<TParam, TContext> {
        return this._predicate;
    }
    protected _getContext(): TContext {
        return this._context;
    }
    addOnCanExecuteChanged(fn: (sender: ICommand<TParam>, args: any) => void, nmspace?: string, context?: IBaseObject): void {
        this.objEvents.on(CMD_EVENTS.can_execute_changed, fn, nmspace, context);
    }
    offOnCanExecuteChanged(nmspace?: string): void {
        this.objEvents.off(CMD_EVENTS.can_execute_changed, nmspace);
    }
    canExecute(sender: any, param: TParam): boolean {
        return this._canExecute(sender, param);
    }
    execute(sender: any, param: TParam): void {
        this._execute(sender, param);
    }
    raiseCanExecuteChanged(): void {
        this.objEvents.raise(CMD_EVENTS.can_execute_changed, {});
    }
    toString(): string {
        return "Command";
    }
    get uniqueID(): string {
        return this._uniqueID;
    }
}

export abstract class BaseCommand<TParam = any, TOwner = any> extends Command<TParam, any> {
    private _owner: TOwner;

    constructor(owner: TOwner) {
        super(null, null, null);
        this._owner = owner;
    }
    // override
    protected _getAction(): Action<TParam, BaseCommand> {
        return this.action;
    }
    // override
    protected _getPredicate(): Predicate<TParam, BaseCommand> {
        return this.isCanExecute;
    }
    // override
    protected _getContext(): this {
        return this;
    }
    protected abstract action(sender: any, param: TParam): void;
    protected abstract isCanExecute(sender: any, param: TParam): boolean;
    get owner(): TOwner {
        return this._owner;
    }
}

export class ViewModel<TApp extends IApplication = IApplication> extends BaseObject {
    private _uniqueID: string;
    private _app: TApp;

    constructor(app: TApp) {
        super();
        this._app = app;
        this._uniqueID = getNewID("vm");
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
    toString(): string {
        return "ViewModel";
    }
    get uniqueID(): string {
        return this._uniqueID;
    }
    get app(): TApp {
        return this._app;
    }
}