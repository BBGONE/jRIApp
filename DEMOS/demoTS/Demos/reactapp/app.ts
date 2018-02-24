import * as RIAPP from "jriapp";

import { TestObject } from "./testobject";


export class DemoApplication extends RIAPP.Application {
    private _testObj: TestObject;

    constructor(options: RIAPP.IAppOptions) {
        super(options);
        this._testObj = null;
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

        super.onStartUp();
    }
    dispose() {
        if (this.getIsDisposed())
            return;
        this.setDisposing();
    }

    get testObj() {
        return this._testObj;
    }
}