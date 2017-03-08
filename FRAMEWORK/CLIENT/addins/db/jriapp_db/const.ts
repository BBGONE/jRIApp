/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
export const enum FLAGS { None = 0, Changed = 1, Setted = 2, Refreshed = 4 }
export const enum REFRESH_MODE { NONE = 0, RefreshCurrent = 1, MergeIntoCurrent = 2, CommitChanges = 3 }
export const enum DELETE_ACTION { NoAction = 0, Cascade = 1, SetNulls = 2 }
export const enum DATA_OPER { None, Submit, Query, Invoke, Refresh, Init }

export const PROP_NAME = {
    isHasChanges: "isHasChanges",
    isSubmitOnDelete: "isSubmitOnDelete",
    isInitialized: "isInitialized",
    isBusy: "isBusy",
    isSubmiting: "isSubmiting",
    isPagingEnabled: "isPagingEnabled",
    parentItem: "parentItem",
    totalCount: "totalCount",
    loadPageCount: "loadPageCount",
    isClearCacheOnEveryLoad: "isClearCacheOnEveryLoad",
    isRefreshing: "isRefreshing",
    requestCount: "requestCount",
    isLoading: "isLoading"
};
