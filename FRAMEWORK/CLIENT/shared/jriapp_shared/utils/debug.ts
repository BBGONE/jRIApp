import { DEBUG_LEVEL } from "../const";
import { DebugLevel } from "../int";

export class DEBUG {
    static checkStartDebugger() {
        if (DebugLevel === DEBUG_LEVEL.HIGH) {
            debugger;
        }
    }
    static isDebugging() {
        return DebugLevel > DEBUG_LEVEL.NONE;
    }
}