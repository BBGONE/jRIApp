import * as RIAPP from "jriapp";
import * as uiMOD from "jriapp_ui";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Temperature } from "./temp";
import { IReactView } from "./int";

export interface IReactViewOptions extends RIAPP.IViewOptions
{
    value?: string;
}

export class ReactElView extends uiMOD.BaseElView implements IReactView {
    private _value: string;

    constructor(el: HTMLElement, options: IReactViewOptions) {
        super(el, options);
        this._value = options.value || "25";
    }
    // if present then occurs after all properties were databound
    viewMounted(): void {
       this.render();
    }
    protected render() {
        const self = this;
        ReactDOM.render(
            <div>
                <Temperature model={self} />
            </div>,
            self.el
        );
    }
    dispose() {
        if (this.getIsDisposed())
            return;
        this.setDisposing();
        ReactDOM.unmountComponentAtNode(this.el);
        super.dispose();
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
    toString() {
        return "ReactElView";
    }
}

export function initModule(app: RIAPP.Application) {
    //console.log("INIT reactDemo Module");
    app.registerElView("react", ReactElView);
}