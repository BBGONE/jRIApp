﻿import * as RIAPP from "jriapp";
import * as uiMOD from "jriapp_ui";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { ReactElView } from "../reactview";
import { Temperature } from "./temp";
import { IModel } from "./int";

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

/**
  Demo element view wich renders the Temperature React component
 */
export class TempElView extends ReactElView {
    private _value: string;
    private _title: string;

    constructor(el: HTMLElement, options: ITempViewOptions) {
        super(el, options);
        this._value = options.value || "0";
        this._title = "";
    }
    // override
    watchChanges(): void {
        this.propWatcher.addWatch(this, ["value", "title"], () => {
            this.render();
        });
    }
    // override
    getMarkup(): any {
        const model = { value: this.value, title: this.title },
            styles = { spacer: spacerStyle, span: spanStyle },
            actions = { tempChanged: (temp: string) => { this.value = temp; } };

        return (<div>
            <Temperature model={model} styles={styles} actions={actions} />
        </div>);
    }
    get value(): string {
        return this._value;
    }
    set value(v: string) {
        if (this._value !== v) {
            this._value = v;
            this.objEvents.raiseProp("value");
        }
    }
    get title(): string {
        return this._title;
    }
    set title(v: string) {
        if (this._title !== v) {
            this._title = v;
            this.objEvents.raiseProp("title");
        }
    }
    toString(): string {
        return "TempElView";
    }
}

export function initModule(app: RIAPP.Application) {
    app.registerElView("tempview", TempElView);
}