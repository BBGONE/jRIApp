import * as RIAPP from "jriapp";
import * as uiMOD from "jriapp_ui";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { ReactElView } from "../reactview";
import { PagerApp } from "./pagerapp";
import { IPagerModel } from "./int";

export interface IPagerViewOptions extends RIAPP.IViewOptions
{
    visiblePage?: number;
    total?: number;
    current: number;
}


/**
  Demo element view wich renders the Pager React component
 */
export class PagerElView extends ReactElView {
    private _total: number;
    private _current: number;
    private _visiblePage: number;

    constructor(el: HTMLElement, options: IPagerViewOptions) {
        super(el, options);
        this._total = options.total || 11;
        this._current = options.current || 7;
        this._visiblePage = options.visiblePage || 3;
    }
    // override
    watchChanges(): void {
        this.propWatcher.addWatch(this, ["total", "current","visiblePage"], () => {
            this.onModelChanged();
        });
    }
    // override
    getMarkup(): any {
        const model = { total: this.total, current: this.current, visiblePage: this.visiblePage },
            actions = { pageChanged: (newPage: number) => { this.current = newPage; } };

        return <PagerApp model={model} actions={actions} />;
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
    get visiblePage(): number {
        return this._visiblePage;
    }
    set visiblePage(v: number) {
        if (this._visiblePage !== v) {
            this._visiblePage = v;
            this.objEvents.raiseProp("visiblePage");
        }
    }
    toString(): string {
        return "PagerElView";
    }
}

export function initModule(app: RIAPP.Application) {
    app.registerElView("pagerview", PagerElView);
}