/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */

export class LOGGER {
    static log(str: string): void {
        console.log(str);
    }
    static warn(str: string): void {
        console.warn(str);
    }
    static error(str: string): void {
        console.error(str);
    }
}
