import * as RIAPP from "jriapp";
import * as React from "react";
import { Provider } from 'react-redux';
import * as Redux from 'redux';
import { ReactElView, mergeOptions } from "../reactview";
import Pager, { Action, ActionTypes } from './connected-pager';
import { IPagerModel } from "./int";


export interface IPagerViewOptions extends RIAPP.IViewOptions
{
    visiblePages?: number;
    total?: number;
    current: number;
}

const reducer = (initialState: IPagerModel, state: IPagerModel, action: Redux.Action) => {
    switch (action.type) {
        case ActionTypes.CHANGE_TOTAL:
            return {
                ...state,
                total: (action as Action<number>).value
            };
        case ActionTypes.CHANGE_CURRENT:
            return {
                ...state,
                current: (action as Action<number>).value
            };
        case ActionTypes.CHANGE_VISIBLE_PAGES:
            return {
                ...state,
                visiblePages: (action as Action<number>).value
            };
        default:
            return state || initialState;
    }
};

/**
  Demo element view wich renders the Pager React component
 */
export class PagerElView extends ReactElView<IPagerModel> {
    constructor(el: HTMLElement, options: IPagerViewOptions) {
        const initialState = mergeOptions(options, { total: 20, current: 6, visiblePages: 7 } as IPagerModel);
        super(el, options, reducer.bind(null, initialState));
    }

    // override
    storeChanged(current: IPagerModel, previous: IPagerModel): boolean {
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
    getMarkup(): React.ReactElement {
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
        this.dispatch({ type: ActionTypes.CHANGE_TOTAL, value: v });
    }
    get current(): number {
        return this.state.current;
    }
    set current(v: number) {
        this.dispatch({ type: ActionTypes.CHANGE_CURRENT, value: v });
    }
    get visiblePages(): number {
        return this.state.visiblePages;
    }
    set visiblePages(v: number) {
        this.dispatch({ type: ActionTypes.CHANGE_VISIBLE_PAGES, value: v });
    }

    toString(): string {
        return "PagerElView";
    }
}

export function initModule(app: RIAPP.Application) {
    app.registerElView("pagerview", PagerElView);
}