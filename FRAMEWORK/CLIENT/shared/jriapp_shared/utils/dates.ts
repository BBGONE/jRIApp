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

function dateToStr(dt: Date, format: string = "YYYYMMDD"): string {
    if (isNt(dt)) {
        return "";
    }
    return moment(dt).format(format);
}

function add(dt: Date, val: number, period: TIME_KIND): Date {
    return moment(dt).add(val, period).toDate();
}

export class DateUtils {
    static isValid(val: string, format: string = "YYYYMMDD"): boolean {
        if (!val) {
            return false;
        }

        const m = moment(val, format);
        return m.isValid();
    }
    static readonly strToDate: (val: string, format?: string) => Date = strToDate;
    static strToDatePartial(format?: string) {
        return (val: string) => strToDate(val, format);
    }
    static readonly dateToStr: (dt: Date, format?: string) => string = dateToStr;
    static dateToStrPartial(format?: string) {
        return (dt: Date) => dateToStr(dt, format);
    }
    static readonly add: (dt: Date, val: number, period: TIME_KIND) => Date = add;
    static addPartial1(period: TIME_KIND) {
        return (dt: Date, val: number) => add(dt, val, period);
    }
    static addPartial2(period: TIME_KIND) {
        return (val: number) => (dt: Date) => add(dt, val, period);
    }
    static addPartial3(period: TIME_KIND) {
        return (dt: Date) => (val: number) => add(dt, val, period);
    }
    static trim(dt: Date): Date {
        return moment(dt).startOf(TIME_KIND.DAY).toDate();
    }
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