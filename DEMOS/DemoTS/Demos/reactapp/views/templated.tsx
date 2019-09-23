import * as RIAPP from "jriapp";
import * as React from "react";
import * as Redux from 'redux';
import { ReactElView, mergeOptions } from "./react";
import { propertyChanged, Action, ActionTypes } from "../actions/templated";
import { ITemplatedState } from "../abstractions/templated";
import Template from "../components/template";

export interface ITemplatedViewOptions extends RIAPP.IViewOptions
{
    templateId?: string;
    keyName: string;
}

const rowStyle = {
    display: 'inline-block',
};

const _reducer = (initialState: ITemplatedState, state: ITemplatedState, action: Redux.Action) => {
    switch (action.type) {
        case ActionTypes.CHANGE_PROP:
            return {
                ...state,
                [(action as Action<any>).name]: (action as Action<any>).value
            };
        default:
            return state || initialState;
    }
};
const reducer = (initialState: ITemplatedState) => (state: ITemplatedState, action: Redux.Action) => _reducer(initialState, state, action);
const defaults = { templateId: "", keyName: "", selectedRow: null } as ITemplatedState;

/**
  Demo element view of a React component which renders the Template react components
 */
export class TemplatedElView extends ReactElView<ITemplatedState> {
    constructor(el: HTMLElement, options: ITemplatedViewOptions) {
        const initialState = mergeOptions(options, defaults);
        super(el, options, reducer(initialState));

        this._handleClick = this._handleClick.bind(this);
    }

    private _handleClick(row: any): void {
        this.selectedRow = row;
    }

    // override
    storeChanged(current: ITemplatedState, previous: ITemplatedState): boolean {
        let shouldRerender = false;

        if (current.templateId !== previous.templateId) {
            this.objEvents.raiseProp("templateId");
            shouldRerender = true;
        }

        if (current.rows !== previous.rows) {
            this.objEvents.raiseProp("rows");
            shouldRerender = true;
        }

        if (current.selectedRow !== previous.selectedRow) {
            this.objEvents.raiseProp("selectedRow");
            shouldRerender = true;
        }

        return shouldRerender;
    }
    // override
    getMarkup(): JSX.Element {
        const { keyName, templateId, rows, selectedRow } = this.state;

        return (
            <React.Fragment>
                {rows.map((row) => {
                    return (
                        <Template key={"" + row[keyName]} onClick={this._handleClick} className={(!!selectedRow && selectedRow[keyName] === row[keyName]) ? 'demo-row selected' : 'demo-row'} style={rowStyle} templateId={templateId} dataContext={row} />
                    );
                })}
            </React.Fragment>
        );
    }
    get templateId(): string {
        return this.state.templateId;
    }
    set templateId(v: string) {
        this.dispatch(propertyChanged("templateId", v));
    }
    get rows(): object[] {
        return this.state.rows;
    }
    set rows(v: object[]) {
        this.dispatch(propertyChanged("rows", v));
    }
    get keyName(): string {
        return this.state.keyName;
    }
    get selectedRow(): any {
        return this.state.selectedRow;
    }
    set selectedRow(v: any) {
        this.dispatch(propertyChanged("selectedRow", v));
    }
    toString(): string {
        return "TemplatedElView";
    }
}

export function initModule(app: RIAPP.Application) {
    app.registerElView("templatedview", TemplatedElView);
}