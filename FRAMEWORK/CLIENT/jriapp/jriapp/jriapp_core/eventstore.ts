import { IIndexer } from "./shared";
import { ICommand } from "./mvvm";
import { BaseObject }  from "./object";
import { SysChecks } from "../jriapp_utils/syschecks";

export const enum EVENT_CHANGE_TYPE { None = 0, Added = 1, Deleted = 2, Updated = 3 }

SysChecks._isEventStore = function (obj: any): boolean {
    return !!obj && obj instanceof EventStore;
}

export interface IEventChangedArgs {
    name: string;
    changeType: EVENT_CHANGE_TYPE;
    oldVal: ICommand;
    newVal: ICommand;
}

export interface IEventStore {
    getCommand(name: string): ICommand;
    setCommand(name: string, command: ICommand): void;
}

export class EventStore extends BaseObject implements IEventStore {
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
    getCommand(name: string): ICommand {
        if (!this._dic)
            return null;
        let cmd = this._dic[name];
        if (!cmd)
            return null;
        return cmd;
    }
    setCommand(name: string, command: ICommand) {
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
    destroy() {
        if (!!this._dic) {
            this._dic = null;
        }
        this._onChange = null;
        super.destroy();
    }
}