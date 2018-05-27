import * as RIAPP from "jriapp";
import * as uiMOD from "jriapp_ui";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Temperature } from "./temp";
import { IModel } from "./int";

export interface IReactViewOptions extends RIAPP.IViewOptions
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

export class ReactElView extends uiMOD.BaseElView {
    private _value: string;
    private _title: string;
    private _watchChanges = new RIAPP.PropWatcher();
    private _debounce = new RIAPP.Debounce();

    constructor(el: HTMLElement, options: IReactViewOptions) {
        super(el, options);
        this._value = options.value || "0";
        this._title = "";
    }
    // if viewMounted method is present then it occurs after all the properties were databound
    viewMounted(): void {
        this.render();
        this._watchChanges.addWatch(this, ["value", "title"], () => { this._debounce.enque(() => this.render()) });
    }
    protected render() {
        const self = this,
            model = { value: self.value, title: self.title },
            styles = { spacer: spacerStyle, span: spanStyle },
            actions = { tempChanged: (temp: string) => { this.value = temp; } };

        ReactDOM.render(
            <div>
                <Temperature model={model} styles={styles} actions={actions}  />
            </div>,
            self.el
        );
    }
    dispose() {
        if (this.getIsDisposed())
            return;
        this.setDisposing();
        this._debounce.dispose();
        this._watchChanges.dispose();
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
    get title(): string {
        return this._title;
    }
    set title(v: string) {
        if (this._title !== v) {
            this._title = v;
            this.objEvents.raiseProp("title");
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