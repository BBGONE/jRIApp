/*
The MIT License (MIT)

Copyright(c) 2016 Maxim V.Tsapov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and / or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
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