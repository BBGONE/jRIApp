import { bootstrap } from "../jriapp_core/bootstrap";
import { InputElView } from "./input";

export class HiddenElView extends InputElView {
    toString() {
        return "HiddenElView";
    }
}

bootstrap.registerElView("input:hidden", HiddenElView);