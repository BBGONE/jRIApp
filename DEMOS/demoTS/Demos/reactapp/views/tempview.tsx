import * as RIAPP from "jriapp";
import * as React from "react";
import * as Redux from 'redux';
import { ReactElView, mergeOptions } from "./reactview";
import { propertyChanged, Action, ActionTypes } from "../actions/temp-actions";
import { ITempActions, ITempModel } from "../abstractions/temp";

export interface ITempViewOptions extends RIAPP.IViewOptions
{
    value?: string;
}

const spacerStyle = {
    display: 'inline-block',
    marginLeft: '15px',
    marginRight: '5px'
};

const spanStyle = {
    color: 'blue'
};


const _reducer = (initialState: ITempModel, state: ITempModel, action: Redux.Action) => {
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
const reducer = (initialState: ITempModel) => (state: ITempModel, action: Redux.Action) => _reducer(initialState, state, action);
const defaults = { value: "0", title: "" } as ITempModel;

/**
  Demo element view wich renders the Temperature React component
 */
export class TempElView extends ReactElView<ITempModel> {
    constructor(el: HTMLElement, options: ITempViewOptions) {
        const initialState = mergeOptions(options, defaults);
        super(el, options, reducer(initialState));
    }
    // override
    storeChanged(current: ITempModel, previous: ITempModel): boolean {
        let shouldRerender = false;

        if (current.title !== previous.title) {
            this.objEvents.raiseProp("title");
            shouldRerender = true;
        }

        if (current.value !== previous.value) {
            this.objEvents.raiseProp("value");
            shouldRerender = true;
        }

        return shouldRerender;
    }
    // override
    getMarkup(): any {
        const model: ITempModel = this.state,
            styles = { spacer: spacerStyle, span: spanStyle },
            actions: ITempActions = { tempChanged: (temp: string) => { this.value = temp; } };

        return (
            <fieldset>
                <legend>{model.title ? model.title : 'This is a React component'}</legend>
                <input value={model.value} onChange={(e) => actions.tempChanged(e.target.value)} />
                <span style={styles.spacer}>You entered: </span>
                <span style={styles.span}>{model.value}</span>
            </fieldset>
        );
    }
    get value(): string {
        return this.state.value;
    }
    set value(v: string) {
        this.dispatch(propertyChanged("value", v));
    }
    get title(): string {
        return this.state.title;
    }
    set title(v: string) {
        this.dispatch(propertyChanged("title", v));
    }
    toString(): string {
        return "TempElView";
    }
}

export function initModule(app: RIAPP.Application) {
    app.registerElView("tempview", TempElView);
}