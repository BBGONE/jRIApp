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

export const enum COLL_CHANGE_TYPE { Remove = 0, Add = 1, Reset = 2, Remap = 3 }
export const enum COLL_CHANGE_REASON { None = 0, PageChange = 1, Sorting = 2, Refresh = 3 }
export const enum COLL_CHANGE_OPER { None = 0, Fill = 1, AddNew = 2, Remove = 3, Commit = 4, Sort = 5 }
export const enum ITEM_STATUS { None = 0, Added = 1, Updated = 2, Deleted = 3 }
export const enum VALS_VERSION { Current = 0, Temporary = 1, Original= 2 }
