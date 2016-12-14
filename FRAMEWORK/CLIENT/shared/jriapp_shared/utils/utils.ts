/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { CoreUtils } from "./coreutils";
import { DEBUG } from "./debug";
import { ERROR } from "./error";
import { LOGGER } from "./logger";
import { SysUtils } from "./sysutils";
import { AsyncUtils } from "./async";
import { HttpUtils } from "./http";
import { StringUtils } from "./strutils";
import { Checks } from "./checks";
import { ArrayHelper } from "./arrhelper";
import { DomUtils } from "./dom";
import { createQueue, IQueue } from "./queue";

export class Utils {
    static readonly check = Checks;
    static readonly str = StringUtils;
    static readonly arr = ArrayHelper;
    static readonly http = HttpUtils;
    static readonly core = CoreUtils;
    static readonly defer = AsyncUtils;
    static readonly err = ERROR;
    static readonly log = LOGGER;
    static readonly debug = DEBUG;
    static readonly sys = SysUtils;
    static readonly dom = DomUtils;
    static readonly queue: IQueue = createQueue(0);
}
