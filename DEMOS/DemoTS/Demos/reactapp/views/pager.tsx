import * as RIAPP from "jriapp";
import * as React from "react";
import { Provider } from 'react-redux';
import * as Redux from 'redux';
import { ReactElView, mergeOptions } from "./react";
import { IPagerState } from "../abstractions/pager";
import { propertyChanged, Action, ActionTypes } from "../actions/pager";
import Pager from '../components/connected-pager';


export interface IPagerViewOptions extends RIAPP.IViewOptions
{
    visiblePages?: number;
    total?: number;
    current: number;
}

const _reducer = (initialState: IPagerState, state: IPagerState, action: Redux.Action) => {
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
const reducer = (initialState: IPagerState) => (state: IPagerState, action: Redux.Action) => _reducer(initialState, state, action);
const defaults = { total: 20, current: 6, visiblePages: 7 } as IPagerState;
/**
  Demo element view wich renders the Pager React component
 */
export class PagerElView extends ReactElView<IPagerState> {
    constructor(el: HTMLElement, options: IPagerViewOptions) {
        const initialState = mergeOptions(options, defaults);
        super(el, options, reducer(initialState));
    }

    // override
    storeChanged(current: IPagerState, previous: IPagerState): boolean {
        // because we use a connected pager component
        // we don't need to rerender pager ourselves
        const shouldRerender = false;

        if (current.total !== previous.total) {
            this.objEvents.raiseProp("total");
        }

        if (current.current !== previous.current) {
            this.objEvents.raiseProp("current");
        }

        if (current.visiblePages !== previous.visiblePages) {
            this.objEvents.raiseProp("visiblePages");
        }

        return shouldRerender;
    }

    // override
    getMarkup(): JSX.Element {
        return (
            <Provider store={this.store}>
                <Pager titles={{ first: '<|', last: '|>' }} />
            </Provider>
        ); 
    }

    get total(): number {
        return this.state.total;
    }
    set total(v: number) {
        this.dispatch(propertyChanged("total", v));
    }
    get current(): number {
        return this.state.current;
    }
    set current(v: number) {
        this.dispatch(propertyChanged("current", v));
    }
    get visiblePages(): number {
        return this.state.visiblePages;
    }
    set visiblePages(v: number) {
        this.dispatch(propertyChanged("visiblePages", v));
    }

    toString(): string {
        return "PagerElView";
    }
}

export function initModule(app: RIAPP.Application) {
    app.registerElView("pagerview", PagerElView);
}