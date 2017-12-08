﻿/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
export const TOOLTIP_SVC = "tooltipSVC";
export const DATEPICKER_SVC = "IDatepicker";

export const enum STORE_KEY {
    SVC = "svc.",
    CONVERTER = "cnv.",
    OBJECT = "obj."
}

export const enum DATA_ATTR {
    DATA_BIND = "data-bind",
    DATA_VIEW = "data-view",
    DATA_EVENT_SCOPE = "data-scope",
    DATA_ITEM_KEY = "data-key",
    DATA_CONTENT = "data-content",
    DATA_COLUMN = "data-column",
    DATA_NAME = "data-name",
    DATA_FORM = "data-form",
    DATA_REQUIRE = "data-require"
}

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

export const enum ELVIEW_NM { DataForm = "dataform" };
export const enum LOADER_GIF { Small = "loader2.gif", Default = "loader.gif" }

export const enum BindTo {
    Source = 0, Target = 1
}

export const enum BINDING_MODE {
    OneTime = 0,
    OneWay = 1,
    TwoWay = 2,
    BackWay = 3
}

export const enum SubscribeFlags {
    delegationOn = 0,
    click = 1,
    change = 2,
    keypress = 3,
    keydown = 4,
    keyup = 5
}
