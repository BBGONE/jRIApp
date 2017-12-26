﻿/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { bootstrap } from "jriapp/bootstrap";
import { SpanElView } from "./span";

const boot = bootstrap;

export class BlockElView extends SpanElView {
    toString() {
        return "BlockElView";
    }
    get width() {
        return this.el.offsetWidth;
    }
    set width(v) {
        const x = this.width;
        if (v !== x) {
            this.el.style.width = v + "px";
            this.objEvents.raiseProp("width");
        }
    }
    get height() {
        return this.el.offsetHeight;
    }
    set height(v) {
        const x = this.height;
        if (v !== x) {
            this.el.style.height = v + "px";
            this.objEvents.raiseProp("height");
        }
    }
}

boot.registerElView("block", BlockElView);
boot.registerElView("div", BlockElView);
boot.registerElView("section", BlockElView);
