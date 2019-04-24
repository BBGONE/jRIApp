/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { StringUtils } from "./strutils";
import { Checks } from "./checks";
import { ERRS } from "../lang";

const { isNt } = Checks, { format: formatStr } = StringUtils;

export const enum DATES {
    TODAY = "today",
    TOMORROW = "tomorrow",
    YESTERDAY = "yesterday",
    ENDOFMONTH = "endofmonth"
}

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

function getDate(val: DATES = DATES.TODAY): Date {
    switch (val) {
        case DATES.TODAY:
            return moment().startOf('day').toDate();
        case DATES.TOMORROW:
            return moment().startOf('day').add(1, 'days').toDate();
        case DATES.YESTERDAY:
            return moment().startOf('day').subtract(1, 'days').toDate();
        case DATES.ENDOFMONTH:
            return moment().startOf('month').add(1, 'months').subtract(1, 'days').toDate();
        default:
            throw new Error(formatStr(ERRS.ERR_CONV_INVALID_DATE, val));
    }
}

function add(dt: Date, val: number, period: PERIOD): Date {
    return moment(dt).add(val, period).toDate();
}

export class DateUtils {
    static readonly strToDate: (val: string, format?: string) => Date = strToDate;
    static readonly dateToStr: (val: Date, format?: string) => string = dateToStr;
    static readonly getDate: (val: DATES | undefined) => Date = getDate;
    static readonly add: (dt: Date, val: number, period: PERIOD) => Date = add;
}