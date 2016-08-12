/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { DATE_CONVERSION, DATA_TYPE, SORT_ORDER } from "../jriapp_core/const";
import { IBaseObject, IErrorNotification, IEditable, ISubmittable, TEventHandler, IFieldInfo, TPropChangedHandler,
    IPromise, IValidationInfo } from "../jriapp_core/shared";

export const enum COLL_CHANGE_TYPE { Remove = 0, Add = 1, Reset = 2, Remap = 3 }
export const enum COLL_CHANGE_REASON { None = 0, PageChange = 1, Sorting = 2 }
export const enum COLL_CHANGE_OPER { None = 0, Fill = 1, Attach = 2, Remove = 3, Commit = 4, Sort = 5 }
export const enum ITEM_STATUS { None = 0, Added = 1, Updated = 2, Deleted = 3 }

export const PROP_NAME = {
    isEditing: "isEditing",
    currentItem: "currentItem",
    count: "count",
    totalCount: "totalCount",
    pageCount: "pageCount",
    pageSize: "pageSize",
    pageIndex: "pageIndex",
    isUpdating: "isUpdating",
    isLoading: "isLoading"
};
export const ITEM_EVENTS = {
    errors_changed: "errors_changed",
    destroyed: "destroyed"
};

export interface ICollectionOptions {
    enablePaging: boolean;
    pageSize: number;
}

export interface IPermissions {
    canAddRow: boolean;
    canEditRow: boolean;
    canDeleteRow: boolean;
    canRefreshRow: boolean;
}

export interface IItemAspect<TItem extends ICollectionItem> extends IBaseObject, IErrorNotification, IEditable, ISubmittable {
    getFieldInfo(fieldName: string): IFieldInfo;
    getFieldNames(): string[];
    getErrorString(): string;
    deleteItem(): boolean;
    _onAttaching(): void;
    _onAttach(): void;
    raiseErrorsChanged(args: any): void;
    readonly isCanSubmit: boolean;
    readonly status: ITEM_STATUS;
    readonly isNew: boolean;
    readonly isDeleted: boolean;
    readonly collection: ICollection<TItem>;
    readonly isUpdating: boolean;
    readonly isHasChanges: boolean;
    readonly isEditing: boolean;
    isCached: boolean;
    isDetached: boolean;
    key: string;
    item: TItem;
}

export interface ICollectionItem extends IBaseObject {
    readonly _aspect: IItemAspect<ICollectionItem>;
    _key: string;
}

export interface ICollChangedArgs<TItem extends ICollectionItem> {
    changeType: COLL_CHANGE_TYPE;
    reason: COLL_CHANGE_REASON;
    oper: COLL_CHANGE_OPER;
    items: TItem[];
    pos?: number[];
    old_key?: string;
    new_key?: string;
}

export interface ICollFillArgs<TItem extends ICollectionItem> {
    reason: COLL_CHANGE_REASON;
    items: TItem[];
    newItems: TItem[];
}

export interface ICollValidateArgs<TItem extends ICollectionItem> { item: TItem; fieldName: string; errors: string[]; }
export interface ICollItemStatusArgs<TItem extends ICollectionItem> { item: TItem; oldStatus: ITEM_STATUS; key: string; }
export interface ICollItemAddedArgs<TItem extends ICollectionItem> { item: TItem; isAddNewHandled: boolean; }
export interface ICommitChangesArgs<TItem extends ICollectionItem> { item: TItem; isBegin: boolean; isRejected: boolean; status: ITEM_STATUS; }
export interface ICollItemArgs<TItem extends ICollectionItem> { item: TItem; }
export interface IPageChangingArgs { page: number; isCancel: boolean; }
export interface ICancellableArgs<TItem extends ICollectionItem> { item: TItem; isCancel: boolean; }
export interface IItemAddedArgs<TItem extends ICollectionItem> { item: TItem; isAddNewHandled: boolean; }
export interface ICollEndEditArgs<TItem extends ICollectionItem> { item: TItem; isCanceled: boolean; }
export interface ICurrentChangingArgs<TItem extends ICollectionItem> { newCurrent: TItem; }

export interface ICollectionEvents<TItem extends ICollectionItem> {
    addOnClearing(fn: TEventHandler<ICollection<TItem>, any>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
    removeOnClearing(nmspace?: string): void;
    addOnCleared(fn: TEventHandler<ICollection<TItem>, any>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
    removeOnCleared(nmspace?: string): void;
    addOnCollChanged(fn: TEventHandler<ICollection<TItem>, ICollChangedArgs<TItem>>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
    removeOnCollChanged(nmspace?: string): void;
    addOnFill(fn: TEventHandler<ICollection<TItem>, ICollFillArgs<TItem>>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
    removeOnFill(nmspace?: string): void;
    addOnValidate(fn: TEventHandler<ICollection<TItem>, ICollValidateArgs<TItem>>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
    removeOnValidate(nmspace?: string): void;
    addOnItemDeleting(fn: TEventHandler<ICollection<TItem>, ICancellableArgs<TItem>>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
    removeOnItemDeleting(nmspace?: string): void;
    addOnItemAdding(fn: TEventHandler<ICollection<TItem>, ICancellableArgs<TItem>>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
    removeOnItemAdding(nmspace?: string): void;
    addOnItemAdded(fn: TEventHandler<ICollection<TItem>, IItemAddedArgs<TItem>>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
    removeOnItemAdded(nmspace?: string): void;
    addOnCurrentChanging(fn: TEventHandler<ICollection<TItem>, ICurrentChangingArgs<TItem>>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
    removeOnCurrentChanging(nmspace?: string): void;
    addOnPageChanging(fn: TEventHandler<ICollection<TItem>, IPageChangingArgs>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
    removeOnPageChanging(nmspace?: string): void;
    addOnErrorsChanged(fn: TEventHandler<ICollection<TItem>, ICollItemArgs<TItem>>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
    removeOnErrorsChanged(nmspace?: string): void;
    addOnBeginEdit(fn: TEventHandler<ICollection<TItem>, ICollItemArgs<TItem>>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
    removeOnBeginEdit(nmspace?: string): void;
    addOnEndEdit(fn: TEventHandler<ICollection<TItem>, ICollEndEditArgs<TItem>>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
    removeOnEndEdit(nmspace?: string): void;
    addOnCommitChanges(fn: TEventHandler<ICollection<TItem>, ICommitChangesArgs<TItem>>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
    removeOnCommitChanges(nmspace?: string): void;
    addOnStatusChanged(fn: TEventHandler<ICollection<TItem>, ICollItemStatusArgs<TItem>>, nmspace?: string, context?: IBaseObject, prepend?: boolean): void;
    removeOnStatusChanged(nmspace?: string): void;
    addOnPageIndexChanged(handler: TPropChangedHandler, nmspace?: string, context?: IBaseObject): void;
    addOnPageSizeChanged(handler: TPropChangedHandler, nmspace?: string, context?: IBaseObject): void;
    addOnTotalCountChanged(handler: TPropChangedHandler, nmspace?: string, context?: IBaseObject): void;
    addOnCurrentChanged(handler: TPropChangedHandler, nmspace?: string, context?: IBaseObject): void;
}

export interface IEditableCollection<TItem extends ICollectionItem> {
    removeItem(item: TItem): void;
    cancelEdit(): void;
    endEdit(): void;
    addNew(): TItem;
    getItemsWithErrors(): TItem[];
    getIsHasErrors(): boolean;
    isEditing: boolean;
    isUpdating: boolean;
    permissions: IPermissions;
}

export interface ISimpleCollection<TItem extends ICollectionItem> extends IBaseObject {
    getFieldInfo(fieldName: string): IFieldInfo;
    getFieldNames(): string[];
    getFieldInfos(): IFieldInfo[];
    getItemByPos(pos: number): TItem;
    getItemByKey(key: string): TItem;
    findByPK(...vals: any[]): TItem;
    moveFirst(skipDeleted?: boolean): boolean;
    movePrev(skipDeleted?: boolean): boolean;
    moveNext(skipDeleted?: boolean): boolean;
    moveLast(skipDeleted?: boolean): boolean;
    goTo(pos: number): boolean;
    forEach(callback: (item: TItem) => void, thisObj?: any): void;
    sort(fieldNames: string[], sortOrder: SORT_ORDER): IPromise<any>;
    sortLocal(fieldNames: string[], sortOrder: SORT_ORDER): IPromise<any>;
    sortLocalByFunc(fn: (a: any, b: any) => number): IPromise<any>;
    clear(): void;
    items: TItem[];
    currentItem: TItem;
    count: number;
    totalCount: number;
    pageSize: number;
    pageIndex: number;
    pageCount: number;
    isPagingEnabled: boolean;
    isLoading: boolean;
}

export interface ICollection<TItem extends ICollectionItem> extends ISimpleCollection<TItem>, IEditableCollection<TItem>, ICollectionEvents<TItem> {
    options: ICollectionOptions;
}

export interface IValueUtils {
    valueToDate(val: string, dtcnv: DATE_CONVERSION, serverTZ: number): Date;
    dateToValue(dt: Date, dtcnv: DATE_CONVERSION, serverTZ: number): string;
    compareVals(v1: any, v2: any, dataType: DATA_TYPE): boolean;
    stringifyValue(v: any, dtcnv: DATE_CONVERSION, dataType: DATA_TYPE, serverTZ: number): string;
    parseValue(v: string, dataType: DATA_TYPE, dtcnv: DATE_CONVERSION, serverTZ: number): any;
}

export interface IPropInfo {
    name: string;
    dtype: number;
}

export interface IErrors {
    [fieldName: string]: string[];
}

export interface IErrorsList {
    [item_key: string]: IErrors;
}

export interface IInternalCollMethods<TItem extends ICollectionItem> {
    getEditingItem(): TItem;
    getStrValue(val: any, fieldInfo: IFieldInfo): string;
    onEditing(item: TItem, isBegin: boolean, isCanceled: boolean): void;
    onCommitChanges(item: TItem, isBegin: boolean, isRejected: boolean, status: ITEM_STATUS): void;
    validateItem(item: TItem): IValidationInfo;
    validateItemField(item: TItem, fieldName: string): IValidationInfo;
    addErrors(item: TItem, errors: IValidationInfo[]): void;
    addError(item: TItem, fieldName: string, errors: string[]): void;
    removeError(item: TItem, fieldName: string): void;
    removeAllErrors(item: TItem): void;
    getErrors(item: TItem): IErrors;
    onErrorsChanged(item: TItem): void;
    onItemDeleting(args: ICancellableArgs<TItem>): boolean;
}