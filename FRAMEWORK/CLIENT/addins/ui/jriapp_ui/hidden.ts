/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { bootstrap } from "jriapp_core/bootstrap";
import { InputElView } from "./input";

export class HiddenElView extends InputElView {
    toString() {
        return "HiddenElView";
    }
}

bootstrap.registerElView("input:hidden", HiddenElView);