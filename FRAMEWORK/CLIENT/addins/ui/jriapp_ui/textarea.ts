/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { bootstrap } from "jriapp/bootstrap";
import { TextBoxElView, ITextBoxOptions } from "./textbox";


export interface ITextAreaOptions extends ITextBoxOptions {
     wrap?: string;
}

export class TextAreaElView extends TextBoxElView {
    constructor(options: ITextAreaOptions) {
        super(options);
        if (!!options.wrap) {
            this.wrap = options.wrap;
        }
    }
    toString(): string {
        return "TextAreaElView";
    }
    get wrap(): string {
        return (<HTMLTextAreaElement>this.el).wrap;
    }
    set wrap(v: string) {
        const x = this.wrap;
        if (x !== v) {
            (<HTMLTextAreaElement>this.el).wrap = v;
            this.objEvents.raiseProp("wrap");
        }
    }
}

bootstrap.registerElView("textarea", TextAreaElView);
