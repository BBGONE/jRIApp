import * as RIAPP from "jriapp";

export class TestObject extends RIAPP.ViewModel<RIAPP.Application> {
    private _temperature: string;

    constructor(app: RIAPP.Application) {
        super(app);
        this._temperature = "0";
    }
    dispose(): void {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        super.dispose();
    }
    get temperature(): string {
        return this._temperature;
    }
    set temperature(v: string) {
        if (this._temperature !== v) {
            this._temperature = v;
            this.objEvents.raiseProp("temperature");
        }
    }
}