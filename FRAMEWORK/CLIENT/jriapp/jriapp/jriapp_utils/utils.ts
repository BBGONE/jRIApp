/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { CoreUtils, ERROR, DEBUG, LOG } from "./coreutils";
import { SysUtils } from "./sysutils";
import { AsyncUtils } from "./async";
import { HttpUtils } from "./http";
import { StringUtils } from "./strutils";
import { Checks } from "./checks";
import { ArrayHelper } from "./arrhelper";
import { DomUtils } from "./dom";

export class Utils {
    static check = Checks;
    static str = StringUtils;
    static arr = ArrayHelper;
    static http = HttpUtils;
    static core = CoreUtils;
    static defer = AsyncUtils;
    static err = ERROR;
    static log = LOG;
    static debug = DEBUG;
    static sys = SysUtils;
    static dom = DomUtils;
}
