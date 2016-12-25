/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    Utils, IIndexer, BasePropBag
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

//dispatches events through commands that can be attached by the data binding
export class EventBag extends BasePropBag {
    private _dic: IIndexer<ICommand>;
    private _onChange: (sender: EventBag, args: IEventChangedArgs) => void;

    constructor(onChange: (sender: EventBag, args: IEventChangedArgs) => void) {
        super();
        this._dic = null;
        this._onChange = onChange;
    }
   //implement IPropertyBag
    getProp(name: string): ICommand {
        if (!this._dic)
            return null;
        const cmd = this._dic[name];
        return !cmd ? null : cmd;
    }
    setProp(name: string, command: ICommand): void {
        if (!this._dic && !!command)
            this._dic = {};
        if (!this._dic)
            return;
        const old = this._dic[name];
        if (!command && !!old) {
            delete this._dic[name];

            if (!!this._onChange) {
                this._onChange(this, {
                    name: name,
                    changeType: EVENT_CHANGE_TYPE.Deleted,
                    oldVal: old,
                    newVal: null
                });
                this.onBagPropChanged(name);
            }
            return;
        }
        this._dic[name] = command;
        if (!!this._onChange) {

            if (!old) {
                this._onChange(this, {
                    name: name,
                    changeType: EVENT_CHANGE_TYPE.Added,
                    oldVal: null,
                    newVal: command
                });
            }
            else {
                this._onChange(this, {
                    name: name,
                    changeType: EVENT_CHANGE_TYPE.Updated,
                    oldVal: old,
                    newVal: command
                });
            }

            this.onBagPropChanged(name);
        }
    }
    trigger(name: string, args?: any) {
        if (!this._dic)
            return;
        let command = this._dic[name];
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