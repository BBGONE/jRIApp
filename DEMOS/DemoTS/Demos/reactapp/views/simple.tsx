﻿import * as RIAPP from "jriapp";
import * as React from "react";
import * as Redux from 'redux';
import { ReactElView, mergeOptions } from "./react";
import { PropChangedAction, CommonActionTypes, propertyChanged } from "../actions/common";

export interface IState {
    value: string;
    title?: string;
}

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


const _reducer = (initialState: IState, state: IState, action: Redux.Action) => {
    switch (action.type) {
        case CommonActionTypes.CHANGE_PROP:
            return {
                ...state,
                [(action as PropChangedAction).name]: (action as PropChangedAction).value
            };
        default:
            return state || initialState;
    }
};
const reducer = (initialState: IState) => (state: IState, action: Redux.Action) => _reducer(initialState, state, action);
const defaults = { value: "0", title: "" } as IState;

/**
  Demo element view which renders a Simple React component
 */
export class SimpleElView extends ReactElView<IState> {
    constructor(el: HTMLElement, options: ISimpleViewOptions) {
        const initialState = mergeOptions(options, defaults);
        super(el, options, reducer(initialState));
    }
    // override
    storeChanged(current: IState, previous: IState): boolean {
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
        const model: IState = this.state,
            styles = { spacer: spacerStyle, span: spanStyle };

        return (
            <fieldset>
                <legend>{model.title ? model.title : 'This is a React component'}</legend>
                <input value={model.value} onChange={(e) => { this.value = e.target.value; }} />
                <span style={styles.spacer}>You entered: </span>
                <span style={styles.span}>{model.value}</span>
            </fieldset>
        );
    }
    get value(): string {
        return this.state.value;
    }
    set value(v: string) {
        this.dispatch(propertyChanged<string, IState>("value", v));
    }
    get title(): string {
        return this.state.title;
    }
    set title(v: string) {
        this.dispatch(propertyChanged<string, IState>("title", v));
    }
    toString(): string {
        return "SimpleElView";
    }
}

export function initModule(app: RIAPP.Application) {
    app.registerElView("simpleview", SimpleElView);
}