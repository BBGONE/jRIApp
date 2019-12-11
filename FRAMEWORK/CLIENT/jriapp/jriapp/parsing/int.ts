/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
export const getRX = /^get[(].+[)]$/g, spaceRX = /^\s+$/;

export const enum TOKEN {
    DELIMETER1 = ":",
    DELIMETER2 = "=",
    COMMA = ",",
    THIS = "this.",
    PARAM = "param",
    TARGET_PATH = "targetPath",
    BIND = "bind",
    GET = "get",
    DATE = "date",
    INJECT = "inject"
}

export const enum TAG {
    NONE = "",
    LITERAL = "0",
    BIND = "1",
    GET = "2",
    DATE = "3",
    INJECT ="4",
    BRACE = "5",
    INDEXER = "6"
}

export const enum PARSE_TYPE {
    NONE = 0,
    BINDING = 1,
    VIEW = 2
}

export const enum DATES {
    NOW = "now",
    TODAY = "today",
    TOMORROW = "tomorrow",
    YESTERDAY = "yesterday"
}

export const THIS_LEN = TOKEN.THIS.length;

export interface IKeyVal {
    tag?: TAG;
    key: string;
    val: any;
}
