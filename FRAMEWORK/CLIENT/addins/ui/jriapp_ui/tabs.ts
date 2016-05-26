/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IViewOptions } from "jriapp_core/shared";
import { Utils as utils, ERROR } from "jriapp_utils/utils";
import { bootstrap } from "jriapp_core/bootstrap";
import { BaseElView } from "jriapp_elview/elview";

const coreUtils = utils.core;

const PROP_NAME = {
    tabIndex: "tabIndex",
    tabsEvents: "tabsEvents"
};

export interface ITabs {
    uniqueID: string;
    el: HTMLElement;
    tabIndex: number;
    isVisible: boolean;
    css: string;
}

export interface ITabsEvents {
    addTabs(tabs: ITabs): void;
    removeTabs(): void;
    onTabSelected(tabs: ITabs): void;
}

export class TabsElView extends BaseElView implements ITabs {
    private _tabOpts: any;
    private _tabsEvents: ITabsEvents;
    private _tabsCreated: boolean;

    constructor(options: IViewOptions) {
        super(options);
        this._tabOpts = options;
        this._tabsEvents = null;
        this._tabsCreated = false;
        this._createTabs();
    }
    protected _createTabs() {
        let $el = this.$el, self = this, tabOpts = {
            activate: function (e: any, tab: any) {
                if (!!self._tabsEvents) {
                    self._tabsEvents.onTabSelected(self);
               }
                self.raisePropertyChanged(PROP_NAME.tabIndex);
           }
       };
        tabOpts = coreUtils.extend(tabOpts, self._tabOpts);
        (<any>$el).tabs(tabOpts);
        setTimeout(() => {
            if (self.getIsDestroyCalled())
                return;
            self._tabsCreated = true;
            self._onTabsCreated();
            self.raisePropertyChanged(PROP_NAME.tabIndex);
       }, 0);
   }
    protected _destroyTabs() {
        let $el = this.$el;
        utils.dom.destroyJQueryPlugin($el, "tabs");
        this._tabsCreated = false;
        if (!!this._tabsEvents) {
            this._tabsEvents.removeTabs();
       }

   }
    protected _onTabsCreated() {
        let self = this, $el = self.$el;
        if (!!self._tabsEvents) {
            self._tabsEvents.addTabs(self);
       }
        if (!!self._tabsEvents) {
            self._tabsEvents.onTabSelected(self);
       }
   }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this._destroyTabs();
        this._tabsEvents = null;
        super.destroy();
   }
    toString() {
        return "TabsElView";
   }
    get tabsEvents() { return this._tabsEvents; }
    set tabsEvents(v) {
        let old = this._tabsEvents;
        if (v !== old) {
            if (!!old)
                old.removeTabs();
            this._tabsEvents = v;
            this.raisePropertyChanged(PROP_NAME.tabsEvents);
            if (this._tabsCreated) {
                this._onTabsCreated();
           }
       }
   }
    get tabIndex(): number {
        return (<any>this.$el).tabs("option", "active");
   }
    set tabIndex(v: number) {
        (<any>this.$el).tabs("option", "active", v);
   }
}

bootstrap.registerElView("tabs", TabsElView);