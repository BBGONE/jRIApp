/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import * as constsMOD from "const";
import * as coreMOD from "shared";
import { BaseObject } from "object";
import { Checks } from "../jriapp_utils/checks";
import { StringUtils } from "../jriapp_utils/strUtils";

const checks = Checks, strUtils = StringUtils;

const PROP_NAME = {
    dateFormat: "dateFormat",
    timeFormat: "timeFormat",
    dateTimeFormat: "dateTimeFormat",
    datepicker: "datepicker",
    imagesPath: "imagesPath",
    decimalPoint: "decimalPoint",
    thousandSep: "thousandSep",
    decPrecision: "decPrecision"
};

export class Defaults extends BaseObject {
    private _imagesPath: string;
    private _dateFormat: string;
    private _dateTimeFormat: string;
    private _timeFormat: string;
    private _decimalPoint: string;
    private _thousandSep: string;
    private _decPrecision: number;
    private _svcStore: coreMOD.ISvcStore;

    constructor(typeStore: coreMOD.ISvcStore) {
        super();
        this._svcStore = typeStore;
        this._dateFormat = "DD.MM.YYYY";
        this._dateTimeFormat = "DD.MM.YYYY HH:mm:ss";
        this._timeFormat = "HH:mm:ss";
        this._imagesPath = "";
        this._decimalPoint = ",";
        this._thousandSep = " ";
        this._decPrecision = 2;
   }
    toString() {
        return "Defaults";
   }
    //uses moment.js format
    get dateFormat() { return this._dateFormat; }
    set dateFormat(v) {
        if (this._dateFormat !== v) {
            this._dateFormat = v;
            this.raisePropertyChanged(PROP_NAME.dateFormat);
       }
   }
    //uses moment.js format
    get timeFormat() { return this._timeFormat; }
    set timeFormat(v) {
        if (this._timeFormat !== v) {
            this._timeFormat = v;
            this.raisePropertyChanged(PROP_NAME.timeFormat);
       }
   }
    get dateTimeFormat() { return this._dateTimeFormat; }
    set dateTimeFormat(v) {
        if (this._dateTimeFormat !== v) {
            this._dateTimeFormat = v;
            this.raisePropertyChanged(PROP_NAME.dateTimeFormat);
       }
   }
    get datepicker() { return <coreMOD.IDatepicker>this._svcStore.getSvc("IDatepicker"); }
    //path to where application images are stored
    get imagesPath() { return this._imagesPath; }
    set imagesPath(v) {
        if (!v)
            v = "";
        if (this._imagesPath !== v) {
            if (!strUtils.endsWith(v, "/")) {
                this._imagesPath = v + "/";
           }
            else
                this._imagesPath = v;
            this.raisePropertyChanged(PROP_NAME.imagesPath);
       }
   }
    get decimalPoint() { return this._decimalPoint; }
    set decimalPoint(v) {
        if (this._decimalPoint !== v) {
            this._decimalPoint = v;
            this.raisePropertyChanged(PROP_NAME.decimalPoint);
       }
   }
    get thousandSep() { return this._thousandSep; }
    set thousandSep(v) {
        if (this._thousandSep !== v) {
            this._thousandSep = v;
            this.raisePropertyChanged(PROP_NAME.thousandSep);
       }
   }
    //money decimal presision: defaults to 2
    get decPrecision() { return this._decPrecision; }
    set decPrecision(v) {
        if (this._decPrecision !== v) {
            this._decPrecision = v;
            this.raisePropertyChanged(PROP_NAME.decPrecision);
       }
   }

    get ButtonsCSS() {
        return coreMOD.ButtonCss;
   }
}