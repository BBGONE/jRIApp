import * as RIAPP from "jriapp";
import * as uiMOD from "jriapp_ui";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { ReactElView, Action } from "../reactview";
import Pager from './pager';
import { IPagerModel, IPagerActions } from "./int";

export interface IPagerViewOptions extends RIAPP.IViewOptions
{
    visiblePages?: number;
    total?: number;
    current: number;
}

export const enum ActionTypes {
    CHANGE_TOTAL = "CHANGE_TOTAL",
    CHANGE_CURRENT = "CHANGE_CURRENT",
    CHANGE_VISIBLE_PAGES = "CHANGE_VISIBLE_PAGES"
}

let initialState = { total: 20, current: 6, visiblePages: 7 };

const reducer = (state: IPagerModel, action: Redux.Action) => {
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
        initialState.total = options.total || initialState.total;
        initialState.current = options.current || initialState.current;
        initialState.visiblePages = options.visiblePages || initialState.visiblePages;
        super(el, options, reducer);
    }

    // override
    stateChanged(current: IPagerModel, previous: IPagerModel): void {
        if (current.total !== previous.total) {
            this.objEvents.raiseProp("total");
            this.onModelChanged();
        }

        if (current.current !== previous.current) {
            this.objEvents.raiseProp("current");
            this.onModelChanged();
        }

        if (current.visiblePages !== previous.visiblePages) {
            this.objEvents.raiseProp("visiblePages");
            this.onModelChanged();
        }
    }
    // override
    getMarkup(): React.ReactElement {
         const { total = 20, current = 7, visiblePages = 6 } = this.state,
             actions: IPagerActions = {
                 pageChanged: (newPage: number) => { this.current = newPage; }
             };
       
        return (
            <Pager total={total} current={current} visiblePages={visiblePages}
                titles={{ first: '<|', last: '|>' }}
                onPageChanged={(newPage) => actions.pageChanged(newPage)}
            />
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