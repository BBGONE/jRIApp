import * as RIAPP from "jriapp";
import * as React from "react";
import * as Redux from 'redux';
import { ReactElView, mergeOptions } from "./react";
import { PropChangedAction, CommonActionTypes, propertyChanged } from "../actions/common";
import Tabs from "../components/tabs-old2";

export interface ITabsViewOptions extends RIAPP.IViewOptions
{
    activeTabName?: string;
}

interface IState {
    activeTabName: string;
}

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
const defaults = { activeTabName: "" } as IState;


export class TabsElView extends ReactElView<IState> {
    constructor(el: HTMLElement, options: ITabsViewOptions) {
        const initialState = mergeOptions(options, defaults);
        super(el, options, reducer(initialState));
    }
    // override
    storeChanged(current: IState, previous: IState): boolean {
        let shouldRerender = false;
        if (current.activeTabName !== previous.activeTabName) {
            this.objEvents.raiseProp("activeTabName");
            shouldRerender = true;
        }

        return shouldRerender;
    }
    // override
    getMarkup(): JSX.Element {
        return (
            <Tabs onClick={(name: string) => { this.activeTabName = name; }} activeName={this.activeTabName} >
                <Tabs.Tab  name="Description"  heading={() => "Description"}>
                    <p>This is a <b>traditional</b> React component without JRIApp templates.</p>
                    <p>It is incapsulated into an <b>Element View</b> to expose properties for databinding.</p>
                </Tabs.Tab>
                <Tabs.Tab name="Reviews" heading={() => "Reviews"}>
                    <p>
                        Look at its code - it's very complex in comparison with <b>the new templated</b> one and it has
                        difficult to follow logic inside react component implementation
                    </p>
                </Tabs.Tab>
            </Tabs> 
        );
    }
    get activeTabName(): string {
        return this.state.activeTabName;
    }
    set activeTabName(v: string) {
        this.dispatch(propertyChanged<string, IState>("activeTabName", v));
    }
    toString(): string {
        return "TabsElView";
    }
}

export function initModule(app: RIAPP.Application) {
    app.registerElView("tabs2view", TabsElView);
}