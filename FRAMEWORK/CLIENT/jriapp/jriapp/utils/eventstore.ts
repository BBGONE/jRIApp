/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import {
    BaseObject, Utils, IIndexer, IPropertyBag
} from "jriapp_shared";
import { ICommand } from "../mvvm";

const utils= Utils, PROP_BAG = utils.sys.PROP_BAG_NAME();
export const enum EVENT_CHANGE_TYPE { None = 0, Added = 1, Deleted = 2, Updated = 3 }

export interface IEventChangedArgs {
    name: string;
    changeType: EVENT_CHANGE_TYPE;
    oldVal: ICommand;
    newVal: ICommand;
}

//dispatches events through commands that can be attached by the data binding
export class EventStore extends BaseObject implements IPropertyBag {
    private _dic: IIndexer<ICommand>;
    private _onChange: (sender: EventStore, args: IEventChangedArgs) => void;

    constructor(onChange: (sender: EventStore, args: IEventChangedArgs) => void) {
        super();
        this._dic = null;
        this._onChange = onChange;
    }
    //override
    _isHasProp(prop: string) {
        return true;
    }
    //implement IPropertyBag
    getProp(name: string): ICommand {
        if (!this._dic)
            return null;
        let cmd = this._dic[name];
        if (!cmd)
            return null;
        return cmd;
    }
    setProp(name: string, command: ICommand): void {
        if (!this._dic && !!command)
            this._dic = {};
        if (!this._dic)
            return;
        let old = this._dic[name];
        if (!command && !!old) {
            delete this._dic[name];

            if (!!this._onChange) {
                this._onChange(this, {
                    name: name,
                    changeType: EVENT_CHANGE_TYPE.Deleted,
                    oldVal: old,
                    newVal: null
                });
                this.raisePropertyChanged(name);
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
            this.raisePropertyChanged(name);
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
        return PROP_BAG;
    }
    destroy() {
        if (!!this._dic) {
            this._dic = null;
        }
        this._onChange = null;
        super.destroy();
    }
}