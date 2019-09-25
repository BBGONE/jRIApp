import * as RIAPP from "jriapp";
import { ITabContent } from "./abstractions/tabs";

const demoRows: { num: number, someVal: string }[] = [{ num: 1, someVal: "someVal1" }, { num: 2, someVal: "someVal2" }, { num: 3, someVal: "someVal3" }, { num: 4, someVal: "someVal4" }, { num: 5, someVal: "someVal5" }];

const demoTabs: ITabContent[] = [{
    name: "tab1", heading: {
        templateId: "tabHeadingTemplate",
        dataContext: { text: "heading tab1" }
    },
    content: {
        templateId: "tabContentTemplate1",
        dataContext: { text: "content tab1", info: "this text is taken from info property", description: "<em>this is displayed in template</em>" }
    }
},
{
    name: "tab2", heading: {
        templateId: "tabHeadingTemplate",
        dataContext: { text: "heading tab2" }
    },
    content: {
        templateId: "tabContentTemplate2",
            dataContext: {
                text: "content tab2", otherData: {
                    subj: "Cloud Computing / Networking & Server",
                    title: "Pro PowerShell for Amazon Web Services, 2nd Edition"
                }, description: "<em>this is displayed in template</em>" }
    }
},
{
    name: "tab3", heading: {
        templateId: "tabHeadingTemplate",
        dataContext: { text: "heading tab3" }
    },
    content: {
        templateId: "tabContentTemplate3",
        dataContext: {
            text: "content tab3", details: {
                cover: "Paperback", pages: 616
            }, description: "<em>this is displayed in template</em>"
        }
    }
}];

export class TestObject extends RIAPP.ViewModel<RIAPP.Application> {
    private _testValue: string;
    private _page: number;
    private _rows: object[];
    private _tabs: ITabContent[];
    private _reverseCommand: RIAPP.ICommand;
    private _selectedRow: object;

    constructor(app: RIAPP.Application) {
        super(app);
        this._testValue = "0";
        this._page = 1;
        this._rows = demoRows;
        this._reverseCommand = new RIAPP.Command(() => {
            this.rows = [...this._rows].reverse();
        });
        this._selectedRow = null;
        this._tabs = demoTabs;
    }
    dispose(): void {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        super.dispose();
    }
    get testValue(): string {
        return this._testValue;
    }
    set testValue(v: string) {
        if (this._testValue !== v) {
            this._testValue = v;
            this.objEvents.raiseProp("testValue");
        }
    }

    get rows(): object[] {
        return this._rows;
    }
    set rows(v: object[]) {
        if (this._rows !== v) {
            this._rows = v;
            this.objEvents.raiseProp("rows");
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

    get reverseCommand() { return this._reverseCommand; }

    get selectedRow(): object {
        return this._selectedRow;
    }
    set selectedRow(v: object) {
        if (this._selectedRow !== v) {
            this._selectedRow = v;
            this.objEvents.raiseProp("selectedRow");
        }
    }


    get tabs(): ITabContent[] {
        return this._tabs;
    }
}