import * as RIAPP from "jriapp";
import * as uiMOD from "jriapp_ui";

const $ = uiMOD.$;

export let topPanel: string;
export let contentPanel: string;
topPanel = "#demoHeader";
contentPanel = "#demoContent";

export class HeaderVM extends RIAPP.ViewModel<RIAPP.IApplication> {
    _$topPanel: JQuery;
    _$contentPanel: JQuery;
    _contentPanelHeight: number;
    _expanderCommand: RIAPP.ICommand;

    constructor(app: RIAPP.IApplication) {
        super(app);
        let self = this;
        this._$topPanel = $(topPanel);
        this._$contentPanel = $(contentPanel);
        this._contentPanelHeight = 0;
        if (!!this._$contentPanel)
            this._contentPanelHeight = this._$contentPanel.height();

        this._expanderCommand = new RIAPP.Command(function (sender, param) {
            if (sender.isExpanded) {
                self.expand();
            }
            else
                self.collapse();
        }, self, null);

    }
    _getEventNames() {
        let base_events = super._getEventNames();
        return ['updateUI'].concat(base_events);
    }
    addOnUpdateUI(fn: (sender: HeaderVM, args: { isHandled: boolean; isUp: boolean; }) => void, namespace?: string) {
        this.addHandler('updateUI', fn, namespace);
    }
    expand() {
        let self = this;
        this._$topPanel.slideDown('fast', function () { self.updateUI(false); });
    }
    collapse() {
        let self = this;
        this._$topPanel.slideUp('fast', function () { self.updateUI(true); });
    }
    updateUI(isUp: boolean) {
        let args = { isHandled: false, isUp: isUp };
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