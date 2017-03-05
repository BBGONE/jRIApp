/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    Utils, IIndexer, BaseObject, IPropertyBag
} from "jriapp_shared";
import { ICommand } from "jriapp/mvvm";

const utils = Utils, strUtils = utils.str;
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
    _isHasProp(prop: string) {
        return true;
    }
   // implement IPropertyBag
    getProp(name: string): ICommand {
        if (!this._dic)
            return null;
        const eventName = strUtils.trimBrackets(name);
        const cmd = this._dic[eventName];
        return !cmd ? null : cmd;
    }
    setProp(name: string, command: ICommand): void {
        if (!this._dic && !!command)
            this._dic = {};
        if (!this._dic)
            return;
        const eventName = strUtils.trimBrackets(name), old = this._dic[eventName];
        if (!command && !!old) {
            delete this._dic[eventName];

            if (!!this._onChange) {
                this._onChange(this, {
                    name: eventName,
                    changeType: EVENT_CHANGE_TYPE.Deleted,
                    oldVal: old,
                    newVal: null
                });
                this.raisePropertyChanged(name);
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
            }
            else {
                this._onChange(this, {
                    name: eventName,
                    changeType: EVENT_CHANGE_TYPE.Updated,
                    oldVal: old,
                    newVal: command
                });
            }

            this.raisePropertyChanged(name);
        }
    }
    get isPropertyBag() {
        return true;
    }

    trigger(eventName: string, args?: any) {
        if (!this._dic)
            return;
        const command = this._dic[eventName];
        if (!command)
            return;
        args = args || {};
        if (command.canExecute(this, args))
            command.execute(this, args);
    }
    toString() {
        return "EventBag";
    }
    destroy() {
        if (!!this._dic) {
            this._dic = null;
        }
        this._onChange = null;
        super.destroy();
    }
}