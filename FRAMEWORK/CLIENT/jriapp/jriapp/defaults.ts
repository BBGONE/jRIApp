/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { BaseObject, Utils } from "jriapp_shared";
import { ButtonCss } from "./int";

const utils = Utils, { endsWith } = utils.str;
export type TButtonCss = typeof ButtonCss;

export class Defaults extends BaseObject {
    private _imagesPath: string;
    private _dateFormat: string;
    private _dateTimeFormat: string;
    private _timeFormat: string;
    private _decimalPoint: string;
    private _thousandSep: string;
    private _decPrecision: number;

    constructor() {
        super();
        this._dateFormat = "DD.MM.YYYY";
        this._dateTimeFormat = "DD.MM.YYYY HH:mm:ss";
        this._timeFormat = "HH:mm:ss";
        this._imagesPath = "";
        this._decimalPoint = ",";
        this._thousandSep = " ";
        this._decPrecision = 2;
    }
    toString(): string {
        return "Defaults";
   }
    // uses moment.js format
    get dateFormat(): string {
        return this._dateFormat;
    }
    set dateFormat(v) {
        if (this._dateFormat !== v) {
            this._dateFormat = v;
            this.objEvents.raiseProp("dateFormat");
       }
   }
    // uses moment.js format
    get timeFormat(): string {
        return this._timeFormat;
    }
    set timeFormat(v) {
        if (this._timeFormat !== v) {
            this._timeFormat = v;
            this.objEvents.raiseProp("timeFormat");
       }
    }
    get dateTimeFormat(): string {
        return this._dateTimeFormat;
    }
    set dateTimeFormat(v) {
        if (this._dateTimeFormat !== v) {
            this._dateTimeFormat = v;
            this.objEvents.raiseProp("dateTimeFormat");
       }
   }
    // path to where application images are stored
    get imagesPath(): string {
        return this._imagesPath;
    }
    set imagesPath(v) {
        if (!v) {
            v = "";
        }
        if (this._imagesPath !== v) {
            if (!endsWith(v, "/")) {
                this._imagesPath = v + "/";
           } else {
                this._imagesPath = v;
           }
           this.objEvents.raiseProp("imagesPath");
       }
    }
    get decimalPoint(): string {
        return this._decimalPoint;
    }
    set decimalPoint(v) {
        if (this._decimalPoint !== v) {
            this._decimalPoint = v;
            this.objEvents.raiseProp("decimalPoint");
       }
    }
    get thousandSep(): string {
        return this._thousandSep;
    }
    set thousandSep(v) {
        if (this._thousandSep !== v) {
            this._thousandSep = v;
            this.objEvents.raiseProp("thousandSep");
       }
   }
    // money decimal presision: defaults to 2
    get decPrecision(): number {
        return this._decPrecision;
    }
    set decPrecision(v) {
        if (this._decPrecision !== v) {
            this._decPrecision = v;
            this.objEvents.raiseProp("decPrecision");
       }
    }
    get ButtonsCSS(): TButtonCss {
        return ButtonCss;
   }
}
