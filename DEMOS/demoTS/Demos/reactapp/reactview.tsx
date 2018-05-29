import * as RIAPP from "jriapp";
import * as uiMOD from "jriapp_ui";
import * as React from "react";
import * as ReactDOM from "react-dom";

/**
    Base abstract class for rendering a React component
*/
export abstract class ReactElView extends uiMOD.BaseElView {
    private _propWatcher = new RIAPP.PropWatcher();
    private _isRendering = false;
    private _isDirty = false;
    private _debounce = new RIAPP.Debounce();

    abstract watchChanges();
    abstract getMarkup(): any;
    // if viewMounted method is present then it is called after all the properties are databound
    viewMounted(): void {
        this.render();
        this.watchChanges();
    }
    protected onModelChanged(): void {
        this._isDirty = true;
        this._debounce.enque(() => {
            this.render();
        });
    }
    render(): void {
        if (this.getIsStateDirty()) {
            return;
        }
        if (this._isRendering) {
            return;
        }
        this._isRendering = true;
        this._isDirty = false;
        ReactDOM.render(this.getMarkup(), this.el,
            () => {
                this._isRendering = false;
                if (this._isDirty) {
                    this.render();
                }
            }
        );
    }
    dispose(): void {
        if (this.getIsDisposed())
            return;
        this.setDisposing();
        this._propWatcher.dispose();
        this._debounce.dispose();
        this._isDirty = false;
        this._isRendering = false;
        ReactDOM.unmountComponentAtNode(this.el);
        super.dispose();
    }
    get propWatcher(): RIAPP.PropWatcher {
        return this._propWatcher;
    }
    toString() {
        return "ReactElView";
    }
}