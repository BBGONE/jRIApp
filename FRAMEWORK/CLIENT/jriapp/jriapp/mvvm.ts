/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import {
    BaseObject, Utils, IBaseObject, TEventHandler, TErrorHandler
} from "jriapp_shared";
import { IApplication } from "./int";

const { getNewID } = Utils.core;

export interface IExecutor<TParam = any> {
    execute: (param: TParam) => void;
}

export interface ICommand<TParam = any> extends IExecutor<TParam> {
    canExecute: (param: TParam) => boolean;
    raiseCanExecuteChanged: () => void;
    addOnCanExecuteChanged(fn: (sender: ICommand<TParam>, args: any) => void, nmspace?: string, context?: IBaseObject): void;
    offOnCanExecuteChanged(nmspace?: string): void;
}

const enum CMD_EVENTS {
    can_execute_changed = "canExecute_changed"
}

export type Action<TParam = any> = (param: TParam) => void;
export type Predicate<TParam = any> = (param: TParam) => boolean;

export class Command<TParam = any> extends BaseObject implements ICommand<TParam> {
    private _action: Action<TParam>;
    private _predicate: Predicate<TParam>;
    private _uniqueID: string;

    constructor(fnAction: Action<TParam>, fnCanExecute?: Predicate<TParam>) {
        super();
        this._uniqueID = getNewID("cmd");
        this._action = fnAction;
        this._predicate = fnCanExecute;
    }
    dispose(): void {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        this._action = null;
        this._predicate = null;
        super.dispose();
    }
    protected _canExecute(param: TParam): boolean {
        const predicate = this._predicate;
        return !predicate ? true : predicate(param);
    }
    protected _execute(param: TParam): void {
        const action = this._action;
        if (!!action) {
            action(param);
        }
    }
    addOnCanExecuteChanged(fn: (sender: this, args: any) => void, nmspace?: string, context?: IBaseObject): void {
        this.objEvents.on(CMD_EVENTS.can_execute_changed, fn, nmspace, context);
    }
    offOnCanExecuteChanged(nmspace?: string): void {
        this.objEvents.off(CMD_EVENTS.can_execute_changed, nmspace);
    }
    canExecute(param: TParam): boolean {
        return this._canExecute(param);
    }
    execute(param: TParam): void {
        this._execute(param);
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

export abstract class BaseCommand<TOwner, TParam = any> extends Command<TParam> {
    private _owner: TOwner;

    constructor(owner: TOwner) {
        super(null, null);
        this._owner = owner;
    }
    dispose(): void {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        this._owner = null;
        super.dispose();
    }
    // override
    protected _canExecute(param: TParam): boolean {
        return this.isCanExecute(param);
    }
    // override
    protected _execute(param: TParam): void {
        this.action(param);
    }
    protected abstract action(param: TParam): void;
    protected abstract isCanExecute(param: TParam): boolean;
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