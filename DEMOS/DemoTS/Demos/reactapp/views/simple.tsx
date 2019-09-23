import * as RIAPP from "jriapp";
import * as React from "react";
import * as Redux from 'redux';
import { ReactElView, mergeOptions } from "./react";
import { propertyChanged, Action, ActionTypes } from "../actions/simple";
import { ISimpleActions, ISimpleState } from "../abstractions/simple";

export interface ISimpleViewOptions extends RIAPP.IViewOptions
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


const _reducer = (initialState: ISimpleState, state: ISimpleState, action: Redux.Action) => {
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
const reducer = (initialState: ISimpleState) => (state: ISimpleState, action: Redux.Action) => _reducer(initialState, state, action);
const defaults = { value: "0", title: "" } as ISimpleState;

/**
  Demo element view which renders a Simple React component
 */
export class SimpleElView extends ReactElView<ISimpleState> {
    constructor(el: HTMLElement, options: ISimpleViewOptions) {
        const initialState = mergeOptions(options, defaults);
        super(el, options, reducer(initialState));
    }
    // override
    storeChanged(current: ISimpleState, previous: ISimpleState): boolean {
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
    getMarkup(): JSX.Element {
        const model: ISimpleState = this.state,
            styles = { spacer: spacerStyle, span: spanStyle },
            actions: ISimpleActions = { tempChanged: (temp: string) => { this.value = temp; } };

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
        return "SimpleElView";
    }
}

export function initModule(app: RIAPP.Application) {
    app.registerElView("simpleview", SimpleElView);
}