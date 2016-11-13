/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
export enum DEBUG_LEVEL {
    NONE = 0, NORMAL = 1, HIGH = 2
}

export const APP_NAME = "app";

export const DUMY_ERROR = "DUMMY_ERROR";

export const TOOLTIP_SVC = "tooltipSVC";

export const STORE_KEY = {
    SVC: "svc.",
    CONVERTER: "cnv.",
    OBJECT: "obj."
};

export const DATA_ATTR = {
    EL_VIEW_KEY: "data-elvwkey",
    DATA_BIND: "data-bind",
    DATA_VIEW: "data-view",
    DATA_EVENT_SCOPE: "data-scope",
    DATA_ITEM_KEY: "data-key",
    DATA_CONTENT: "data-content",
    DATA_COLUMN: "data-column",
    DATA_NAME: "data-name",
    DATA_FORM: "data-form",
    DATA_REQUIRE: "data-require"
};

export const enum DATE_CONVERSION { None = 0, ServerLocalToClientLocal = 1, UtcToClientLocal = 2 }
export const enum DATA_TYPE {
    None = 0,
    String = 1,
    Bool = 2,
    Integer = 3,
    Decimal = 4,
    Float = 5,
    DateTime = 6,
    Date = 7,
    Time = 8,
    Guid = 9,
    Binary = 10
}
export const enum FIELD_TYPE { None = 0, ClientOnly = 1, Calculated = 2, Navigation = 3, RowTimeStamp = 4, Object = 5, ServerCalculated = 6 }
export const enum SORT_ORDER { ASC = 0, DESC = 1 }
export const enum FILTER_TYPE { Equals = 0, Between = 1, StartsWith = 2, EndsWith = 3, Contains = 4, Gt = 5, Lt = 6, GtEq = 7, LtEq = 8, NotEq = 9 }

export const enum KEYS {
    backspace = 8,
    tab = 9,
    enter = 13,
    esc = 27,
    space = 32,
    pageUp = 33,
    pageDown = 34,
    end = 35,
    home = 36,
    left = 37,
    up = 38,
    right = 39,
    down = 40,
    del = 127
}
export const ELVIEW_NM = { DataForm: "dataform" };
export const LOADER_GIF = { Small: "loader2.gif", Default: "loader.gif" };

export const enum BindTo {
    Source = 0, Target = 1
}

export const enum BINDING_MODE {
    OneTime = 0,
    OneWay = 1,
    TwoWay = 2,
    BackWay = 3
}