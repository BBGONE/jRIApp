﻿/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import {
    Utils, IIndexer, BaseObject, IPropertyBag
} from "jriapp_shared";
import { ICommand } from "jriapp/mvvm";

const utils = Utils, { Indexer } = utils.core, { trimBrackets } = utils.str;
export const enum EVENT_CHANGE_TYPE { None = 0, Added = 1, Deleted = 2, Updated = 3 }

export interface IEventChangedArgs {
    name: string;
    changeType: EVENT_CHANGE_TYPE;
    oldVal: ICommand;
    newVal: ICommand;
}

// dispatches events through commands that can be attached by the data binding
export class EventBag extends BaseObject implements IPropertyBag {
    private _dic: IIndexer<ICommand>;
    private _onChange: (sender: EventBag, args: IEventChangedArgs) => void;

    constructor(onChange: (sender: EventBag, args: IEventChangedArgs) => void) {
        super();
        this._dic = null;
        this._onChange = onChange;
    }
    // override
    isHasProp(_prop: string): boolean {
        return true;
    }
    // implement IPropertyBag
    getProp(name: string): ICommand {
        if (!this._dic) {
            return null;
        }
        const eventName = trimBrackets(name), cmd = this._dic[eventName];
        return !cmd ? null : cmd;
    }
    setProp(name: string, command: ICommand): void {
        if (!this._dic && !!command) {
            this._dic = Indexer();
        }
        if (!this._dic) {
            return;
        }
        const eventName = trimBrackets(name), old = this._dic[eventName];
        if (!command && !!old) {
            delete this._dic[eventName];

            if (!!this._onChange) {
                this._onChange(this, {
                    name: eventName,
                    changeType: EVENT_CHANGE_TYPE.Deleted,
                    oldVal: old,
                    newVal: null
                });
                this.objEvents.raiseProp(<any>name);
            }
            return;
        }
        this._dic[eventName] = command;
        if (!!this._onChange) {
            if (!old) {
                this._onChange(this, {
                    name: eventName,
                    changeType: EVENT_CHANGE_TYPE.Added,
                    oldVal: null,
                    newVal: command
                });
            } else {
                this._onChange(this, {
                    name: eventName,
                    changeType: EVENT_CHANGE_TYPE.Updated,
                    oldVal: old,
                    newVal: command
                });
            }

            this.objEvents.raiseProp(<any>name);
        }
    }
    get isPropertyBag(): boolean {
        return true;
    }
    trigger(eventName: string, args?: any): boolean {
        if (!this._dic) {
            return false;
        }
        const command = this._dic[eventName];
        if (!command) {
            return false;
        }
        args = args || {};
        if (command.canExecute(args)) {
            command.execute(args);
            return true;
        } else {
            return false;
        }
    }
    toString() {
        return "EventBag";
    }
    dispose() {
        if (!!this._dic) {
            this._dic = null;
        }
        this._onChange = null;
        super.dispose();
    }
}
