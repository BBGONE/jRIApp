/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { StringUtils } from "./strutils";
import { Checks } from "./checks";
import { ERRS } from "../lang";

const { isNt } = Checks, { format: formatStr } = StringUtils;

export const enum TIME_KIND {
    YEAR = "year",
    MONTH = "month",
    WEEK = "week",
    DAY = "day",
    HOUR = "hour",
    MINUTE = "minute",
    SECOND = "second"
}

export type TIME_RANGE = TIME_KIND.YEAR | TIME_KIND.MONTH | TIME_KIND.WEEK | TIME_KIND.DAY;

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

function add(dt: Date, val: number, period: TIME_KIND): Date {
    return moment(dt).add(val, period).toDate();
}

function trim(dt: Date): Date {
    return moment(dt).startOf(TIME_KIND.DAY).toDate();
}

export class DateUtils {
    static readonly strToDate: (val: string, format?: string) => Date = strToDate;
    static readonly dateToStr: (val: Date, format?: string) => string = dateToStr;
    static readonly add: (dt: Date, val: number, period: TIME_KIND) => Date = add;
    static readonly trim: (dt: Date) => Date = trim;
    static today(): Date {
        return moment().startOf(TIME_KIND.DAY).toDate();
    }
    static now(): Date {
        return new Date();
    }
    static yesterday(dt?: Date): Date {
        return moment(dt).startOf(TIME_KIND.DAY).add(-1, TIME_KIND.DAY).toDate();
    }
    static tomorrow(dt?: Date): Date {
        return moment(dt).startOf(TIME_KIND.DAY).add(1, TIME_KIND.DAY).toDate();
    }
    static startOf(period: TIME_RANGE, dt?: Date): Date {
        return moment(dt).startOf(period).toDate();
    }
    static endOf(period: TIME_RANGE, dt?: Date): Date {
        return moment(dt).endOf(period).toDate();
    }
}