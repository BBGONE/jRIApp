/*
The MIT License (MIT)

Copyright(c) 2016 Maxim V.Tsapov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and / or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
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