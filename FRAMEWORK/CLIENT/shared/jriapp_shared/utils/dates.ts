/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { StringUtils } from "./strutils";
import { Checks } from "./checks";
import { ERRS } from "../lang";

const { isNt } = Checks, { format: formatStr } = StringUtils;

export const enum PERIOD {
    YEAR = "year",
    MONTH = "month",
    WEEK = "week",
    DAY = "day",
    HOUR = "hour",
    MINUTE = "minute",
    SECOND = "second"
}

function strToDate(val: string, format: string = "YYYYMMDD"): Date {
    if (!val) {
        return null;
    }

    const m = moment(val, format);
    if (!m.isValid()) {
        throw new Error(formatStr(ERRS.ERR_CONV_INVALID_DATE, val));
    }
    return m.toDate();
}

function dateToStr(val: Date, format: string = "YYYYMMDD"): string {
    if (isNt(val)) {
        return "";
    }
    return moment(val).format(format);
}

function add(dt: Date, val: number, period: PERIOD): Date {
    return moment(dt).add(val, period).toDate();
}

function trim(dt: Date): Date {
    return moment(dt).startOf(PERIOD.DAY).toDate();
}

export class DateUtils {
    static readonly strToDate: (val: string, format?: string) => Date = strToDate;
    static readonly dateToStr: (val: Date, format?: string) => string = dateToStr;
    static readonly add: (dt: Date, val: number, period: PERIOD) => Date = add;
    static readonly trim: (dt: Date) => Date = trim;
    static today(): Date {
        return moment().startOf(PERIOD.DAY).toDate();
    }
    static yesterday(dt?: Date): Date {
        return moment(dt).startOf(PERIOD.DAY).add(-1, PERIOD.DAY).toDate();
    }
    static tomorrow(dt?: Date): Date {
        return moment(dt).startOf(PERIOD.DAY).add(1, PERIOD.DAY).toDate();
    }
    static startOfMonth(dt?: Date): Date {
        return moment(dt).startOf(PERIOD.MONTH).toDate();
    }
    static endOfMonth(dt?: Date): Date {
        return moment(dt).endOf(PERIOD.MONTH).toDate();
    }
    static startOfYear(dt?: Date): Date {
        return moment(dt).startOf(PERIOD.YEAR).toDate();
    }
    static endOfYear(dt?: Date): Date {
        return moment(dt).endOf(PERIOD.YEAR).toDate();
    }
}