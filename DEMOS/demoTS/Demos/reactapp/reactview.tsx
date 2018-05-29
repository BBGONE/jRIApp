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

    private _onRendering(): void {
        this._isRendering = true;
        this._isDirty = false;
    }
    private _onRendered(): void {
        this._isRendering = false;
        if (this._isDirty) {
            this.render();
        }
    }
    // if viewMounted method is present then it occurs after all the properties were databound
    viewMounted(): void {
        this.render();
        this.watchChanges();
    }
    abstract watchChanges();
    abstract getMarkup(): any;
    render(): void {
        if (this.getIsStateDirty()) {
            return;
        }
        if (this._isRendering) {
            this._isDirty = true;
            return;
        }
        this._onRendering();
        ReactDOM.render(this.getMarkup(), this.el,
            () => { this._onRendered(); }
        );
    }
    dispose(): void {
        if (this.getIsDisposed())
            return;
        this.setDisposing();
        this._propWatcher.dispose();
        this._isDirty = false;
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