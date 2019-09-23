import * as RIAPP from "jriapp";
import * as uiMOD from "jriapp_ui";
import { render as renderReact, unmountComponentAtNode } from "react-dom";
import * as Redux from "redux";

export type Action = any;

export function mergeOptions<T, D>(options: T, defaults: D): D {
    const ret: any = {};
    Object.keys(defaults).forEach(key => {
        if (!RIAPP.Utils.check.isNt((options as any)[key]))
            ret[key] = (options as any)[key];
        else
            ret[key] = (defaults as any)[key];
    })
    return ret;
}

/**
    Base abstract class for rendering a React component
*/
export abstract class ReactElView<S> extends uiMOD.BaseElView {
    private _isRendering = false;
    private _store: Redux.Store<S>;
    private _state: S;
    private _unsubscribe: Redux.Unsubscribe;
    private _isDirty = false;
    private _isMounted = false;

    constructor(el: HTMLElement, options: RIAPP.IViewOptions, reducer: Redux.Reducer<S>) {
        super(el, options);
        this._store = Redux.createStore(reducer);
        this._state = this._store.getState();
        this._unsubscribe = this._store.subscribe(() => {
            if (this.getIsStateDirty())
                return;
            const previous = this._state;
            const current = this._store.getState();
            this._state = current;
            if (this.storeChanged(current, previous)) {
                this._renderView();
            }
        });
    }

    abstract storeChanged(current: S, previous: S): boolean;
    abstract getMarkup(): JSX.Element;

    private _render(): void {
        if (this.getIsStateDirty()) {
            return;
        }

        if (this._isRendering) {
            this._isDirty = true;
            return;
        }

        this._isRendering = true;
        this._isDirty = false;

        renderReact(this.getMarkup(),
            this.el,
            () => {
                this._isRendering = false
                if (this._isDirty) {
                    this._render();
                }
            }
        );
    }

    private _renderView(): void {
        this._isDirty = true;
        if (this._isMounted) {
            this._render();
        }
    }

    // if viewMounted method is present then it is called after all the properties are databound
    viewMounted(): void {
        this._isMounted = true;
        this._renderView();
    }

    protected dispatch(action: Action): void {
        this._store.dispatch(action);
    }

    dispose(): void {
        if (this.getIsDisposed())
            return;
        this.setDisposing();
        this._isRendering = false;
        this._isDirty = false;
        this._isMounted = false;
        this._unsubscribe();
        unmountComponentAtNode(this.el);
        super.dispose();
    }

    protected get store(): Redux.Store<S> {
        return this._store;
    }
    protected get state(): S {
        return this._state;
    }
    toString() {
        return "ReactElView";
    }
}