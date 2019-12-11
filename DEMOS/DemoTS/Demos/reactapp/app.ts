import * as RIAPP from "jriapp";

import { TestObject } from "./testobject";

const tabs: string[] = ["Description", "Reviews"];
const tabs2: string[] = ["tab1", "tab2", "tab3"];

export class DemoApplication extends RIAPP.Application {
    private _testObj: TestObject;
    private _activeTabName: string;
    private _activeTabName2: string;
    private _interval: any;

    constructor(options: RIAPP.IAppOptions) {
        super(options);
        this._testObj = null;
        this._interval = null;
        this._activeTabName = undefined;
        this._activeTabName2 = undefined;
    }
    onStartUp() {
        const self = this;
        this._testObj = new TestObject(this);

        //here we could process application's errors
        this.objEvents.addOnError(function (_s, args) {
            debugger;
            args.isHandled = true;
            alert(args.error.message);
        });

        this._interval = setInterval(function () {
            if (self.activeTabName === tabs[0])
                self.activeTabName = tabs[1];
            else
                self.activeTabName = tabs[0];

            /*
            if (self.activeTabName2 === tabs2[0])
                self.activeTabName2 = tabs2[1];
            else if (self.activeTabName2 === tabs2[1])
                self.activeTabName2 = tabs2[2];
            else
                self.activeTabName2 = tabs2[0];
            */
        }, 10000);

        super.onStartUp();
    }
    dispose() {
        if (this.getIsDisposed())
            return;
        if (!!this._interval) {
            clearInterval(this._interval);
            this._interval = null;
        }
        this.setDisposing();
    }

    get activeTabName(): string {
        return this._activeTabName;
    }
    set activeTabName(v: string) {
        if (this._activeTabName !== v) {
            this._activeTabName = v;
            this.objEvents.raiseProp("activeTabName");
        }
    }

    get activeTabName2(): string {
        return this._activeTabName2;
    }
    set activeTabName2(v: string) {
        if (this._activeTabName2 !== v) {
            this._activeTabName2 = v;
            this.objEvents.raiseProp("activeTabName2");
        }
    }
    get testObj() {
        return this._testObj;
    }
}