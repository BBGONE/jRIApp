/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { bootstrap } from "jriapp/bootstrap";
import { InputElView } from "./input";

export class HiddenElView extends InputElView<HTMLInputElement> {
    toString(): string {
        return "HiddenElView";
    }
}

bootstrap.registerElView("input:hidden", HiddenElView);
