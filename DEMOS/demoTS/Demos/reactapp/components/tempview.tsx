import * as RIAPP from "jriapp";
import * as uiMOD from "jriapp_ui";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { ReactElView, Action } from "../reactview";
import { ITempModel, ITempActions } from "./int";

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

export const enum ActionTypes {
    CHANGE_VALUE = "CHANGE_VALUE",
    CHANGE_TITLE = "CHANGE_TITLE"
}

let initialState = { value: "0", title: "" };

const reducer = (state: ITempModel, action: Redux.Action) => {
    switch (action.type) {
        case ActionTypes.CHANGE_VALUE:
            return {
                ...state,
                value: (action as Action<string>).value
            };
        case ActionTypes.CHANGE_TITLE:
            return {
                ...state,
                title: (action as Action<string>).value
            };
        default:
            return state || initialState;
    }
};

/**
  Demo element view wich renders the Temperature React component
 */
export class TempElView extends ReactElView<ITempModel> {
    constructor(el: HTMLElement, options: ITempViewOptions) {
        initialState.value = options.value || initialState.value;
        super(el, options, reducer);
    }
    // override
    isViewShouldRender(current: ITempModel, previous: ITempModel): boolean {
        let res = false;

        if (current.title !== previous.title) {
            this.objEvents.raiseProp("title");
            res = true;
        }

        if (current.value !== previous.value) {
            this.objEvents.raiseProp("value");
            res = true;
        }

        return res;
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
        this.dispatch({ type: ActionTypes.CHANGE_VALUE, value: v });
    }
    get title(): string {
        return this.state.title;
    }
    set title(v: string) {
        this.dispatch({ type: ActionTypes.CHANGE_TITLE, value: v });
    }
    toString(): string {
        return "TempElView";
    }
}

export function initModule(app: RIAPP.Application) {
    app.registerElView("tempview", TempElView);
}