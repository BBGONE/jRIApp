import * as RIAPP from "jriapp";
import * as uiMOD from "jriapp_ui";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { ReactElView } from "../reactview";
import Pager from './pager';
import { IPagerModel, IPagerActions } from "./int";

export interface IPagerViewOptions extends RIAPP.IViewOptions
{
    visiblePages?: number;
    total?: number;
    current: number;
}


/**
  Demo element view wich renders the Pager React component
 */
export class PagerElView extends ReactElView {
    private _total: number;
    private _current: number;
    private _visiblePages: number;

    constructor(el: HTMLElement, options: IPagerViewOptions) {
        super(el, options);
        this._total = options.total || 20;
        this._current = options.current || 7;
        this._visiblePages = options.visiblePages || 6;
    }
    // override
    watchChanges(): void {
        this.propWatcher.addWatch(this, ["total", "current","visiblePages"], () => {
            this.onModelChanged();
        });
    }
    // override
    getMarkup(): any {
        const model: IPagerModel = { total: this.total, current: this.current, visiblePages: this.visiblePages },
            actions: IPagerActions = { pageChanged: (newPage: number) => { this.current = newPage; } };

        return (
            <Pager
                total={model.total}
                current={model.current}
                visiblePages={model.visiblePages}
                titles={{ first: '<|', last: '|>' }}
                onPageChanged={(newPage) => actions.pageChanged(newPage)}
            />
        ); 
    }
    get total(): number {
        return this._total;
    }
    set total(v: number) {
        if (this._total !== v) {
            this._total = v;
            this.objEvents.raiseProp("total");
        }
    }
    get current(): number {
        return this._current;
    }
    set current(v: number) {
        if (this._current !== v) {
            this._current = v;
            this.objEvents.raiseProp("current");
        }
    }
    get visiblePages(): number {
        return this._visiblePages;
    }
    set visiblePages(v: number) {
        if (this._visiblePages !== v) {
            this._visiblePages = v;
            this.objEvents.raiseProp("visiblePages");
        }
    }
    toString(): string {
        return "PagerElView";
    }
}

export function initModule(app: RIAPP.Application) {
    app.registerElView("pagerview", PagerElView);
}