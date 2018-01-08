﻿/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { bootstrap } from "jriapp/bootstrap";
import { BaseElView } from "./baseview";

export class ImgElView extends BaseElView {
    toString(): string {
        return "ImgElView";
    }
    get src(): string {
        return (<HTMLImageElement>this.el).src;
    }
    set src(v: string) {
        const x = this.src;
        if (x !== v) {
            (<HTMLImageElement>this.el).src = v;
            this.objEvents.raiseProp("src");
        }
    }
}

bootstrap.registerElView("img", ImgElView);
