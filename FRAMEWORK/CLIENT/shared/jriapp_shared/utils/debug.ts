import { DEBUG_LEVEL } from "../consts";
import { DebugLevel } from "../int";

export class DEBUG {
    static checkStartDebugger(): void {
        if (DebugLevel === DEBUG_LEVEL.HIGH) {
            debugger;
        }
    }
    static isDebugging(): boolean {
        return DebugLevel > DEBUG_LEVEL.NONE;
    }
}
