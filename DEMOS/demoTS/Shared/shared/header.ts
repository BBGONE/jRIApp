﻿import * as RIAPP from "jriapp";
import * as uiMOD from "jriapp_ui";

const $ = uiMOD.$;

export let topPanel: string;
export let contentPanel: string;
topPanel = "#demoHeader";
contentPanel = "#demoContent";

export class HeaderVM extends RIAPP.ViewModel<RIAPP.IApplication> {
    private _$topPanel: JQuery;
    private _$contentPanel: JQuery;
    private _contentPanelHeight: number;
    private _expanderCommand: RIAPP.ICommand;

    constructor(app: RIAPP.IApplication) {
        super(app);
        const self = this;
        this._$topPanel = $(topPanel);
        this._$contentPanel = $(contentPanel);
        this._contentPanelHeight = 0;
        if (!!this._$contentPanel)
            this._contentPanelHeight = this._$contentPanel.height();

        //uses strongly typed "this"
        this._expanderCommand = new RIAPP.TCommand<any, HeaderVM>(function (sender: uiMOD.ExpanderElView, param) {
            if (sender.isExpanded) {
                this.expand();
            } else {
                this.collapse();
            }
        }, self);

    }
    _getEventNames() {
        const base_events = super._getEventNames();
        return ['updateUI'].concat(base_events);
    }
    addOnUpdateUI(fn: (sender: HeaderVM, args: { isHandled: boolean; isUp: boolean; }) => void, namespace?: string) {
        this.addHandler('updateUI', fn, namespace);
    }
    expand() {
        this._$topPanel.slideDown('fast', () => this.updateUI(false));
    }
    collapse() {
        this._$topPanel.slideUp('fast', () => this.updateUI(true));
    }
    updateUI(isUp: boolean) {
        const args = { isHandled: false, isUp: isUp };
        this.raiseEvent('updateUI', args);
        if (args.isHandled)
            return;
        if (!!this._$contentPanel) {
            if (isUp)
                this._$contentPanel.height(this._contentPanelHeight);
            else
                this._$contentPanel.height(this._contentPanelHeight - this._$topPanel.outerHeight());
        }
    }
    get expanderCommand(): RIAPP.ICommand { return this._expanderCommand; }
    get $contentPanel() { return this._$contentPanel; }
    get $topPanel() { return this._$topPanel; }
}