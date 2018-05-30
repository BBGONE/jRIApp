import * as RIAPP from "jriapp";

export class TestObject extends RIAPP.ViewModel<RIAPP.Application> {
    private _temperature: string;
    private _page: number;

    constructor(app: RIAPP.Application) {
        super(app);
        this._temperature = "0";
        this._page = 1;
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

    get page(): number {
        return this._page;
    }
    set page(v: number) {
        if (this._page !== v) {
            this._page = v;
            this.objEvents.raiseProp("page");
        }
    }
}