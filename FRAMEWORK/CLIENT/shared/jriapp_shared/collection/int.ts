﻿/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import {
    DATE_CONVERSION, DATA_TYPE, SORT_ORDER, FIELD_TYPE, COLL_CHANGE_OPER,
    COLL_CHANGE_REASON, COLL_CHANGE_TYPE, ITEM_STATUS
} from "./const";
import { IPromise } from "../utils/ideferred";
import {
    IBaseObject, IErrorNotification, IEditable, ISubmittable, TEventHandler, TPropChangedHandler,
    IValidationInfo, TPriority, IIndexer
} from "../int";

export const PROP_NAME = {
    isEditing: "isEditing",
    currentItem: "currentItem",
    count: "count",
    totalCount: "totalCount",
    pageCount: "pageCount",
    pageSize: "pageSize",
    pageIndex: "pageIndex",
    isUpdating: "isUpdating",
    isLoading: "isLoading",
    isRefreshing: "isRefreshing"
};

export const enum ITEM_EVENTS {
    errors_changed = "errors_changed",
    destroyed = "destroyed"
}

// Collection interfaces
export interface IFieldInfo {
    fieldName: string;
    isPrimaryKey: number;
    dataType: DATA_TYPE;
    isNullable: boolean;
    isReadOnly: boolean;
    isAutoGenerated: boolean;
    isNeedOriginal: boolean;
    maxLength: number;
    dateConversion: DATE_CONVERSION;
    allowClientDefault: boolean;
    range: string;
    regex: string;
    fieldType: FIELD_TYPE;
    dependentOn: string;
    nested: IFieldInfo[];
    dependents?: string[];
    fullName?: string;
}

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

export interface IItemAspect<TItem extends ICollectionItem, TObj> extends IBaseObject, IErrorNotification, IEditable, ISubmittable {
    getFieldInfo(fieldName: string): IFieldInfo;
    getFieldNames(): string[];
    getErrorString(): string;
    deleteItem(): boolean;
    _setKey(v: string): void;
    _setIsAttached(v: boolean): void;
    raiseErrorsChanged(): void;
    readonly vals: TObj;
    readonly item: TItem;
    readonly key: string;
    readonly coll: ICollection<TItem>;
    readonly status: ITEM_STATUS;
    readonly isUpdating: boolean;
    readonly isEditing: boolean;
    readonly isCanSubmit: boolean;
    readonly isHasChanges: boolean;
    readonly isNew: boolean;
    readonly isDeleted: boolean;
    readonly isEdited: boolean;
    readonly isDetached: boolean;
}

export interface ICollectionItem extends IBaseObject {
    readonly _aspect: IItemAspect<ICollectionItem, any>;
    readonly _key: string;
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

export interface ICollValidateFieldArgs<TItem extends ICollectionItem> {
    readonly item: TItem;
    readonly fieldName: string;
    errors: string[];
}
export interface ICollValidateItemArgs<TItem extends ICollectionItem> {
    readonly item: TItem;
    result: IValidationInfo[];
}
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
    addOnClearing(fn: TEventHandler<ICollection<TItem>, any>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
    offOnClearing(nmspace?: string): void;
    addOnCleared(fn: TEventHandler<ICollection<TItem>, any>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
    offOnCleared(nmspace?: string): void;
    addOnCollChanged(fn: TEventHandler<ICollection<TItem>, ICollChangedArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
    offOnCollChanged(nmspace?: string): void;
    addOnFill(fn: TEventHandler<ICollection<TItem>, ICollFillArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
    offOnFill(nmspace?: string): void;
    addOnValidateField(fn: TEventHandler<ICollection<TItem>, ICollValidateFieldArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
    offOnValidateField(nmspace?: string): void;
    addOnItemDeleting(fn: TEventHandler<ICollection<TItem>, ICancellableArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
    offOnItemDeleting(nmspace?: string): void;
    addOnItemAdding(fn: TEventHandler<ICollection<TItem>, ICancellableArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
    offOnItemAdding(nmspace?: string): void;
    addOnItemAdded(fn: TEventHandler<ICollection<TItem>, IItemAddedArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
    offOnItemAdded(nmspace?: string): void;
    addOnCurrentChanging(fn: TEventHandler<ICollection<TItem>, ICurrentChangingArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
    offOnCurrentChanging(nmspace?: string): void;
    addOnPageChanging(fn: TEventHandler<ICollection<TItem>, IPageChangingArgs>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
    offOnPageChanging(nmspace?: string): void;
    addOnErrorsChanged(fn: TEventHandler<ICollection<TItem>, ICollItemArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
    offOnErrorsChanged(nmspace?: string): void;
    addOnBeginEdit(fn: TEventHandler<ICollection<TItem>, ICollItemArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
    offOnBeginEdit(nmspace?: string): void;
    addOnEndEdit(fn: TEventHandler<ICollection<TItem>, ICollEndEditArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
    offOnEndEdit(nmspace?: string): void;
    addOnCommitChanges(fn: TEventHandler<ICollection<TItem>, ICommitChangesArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
    offOnCommitChanges(nmspace?: string): void;
    addOnStatusChanged(fn: TEventHandler<ICollection<TItem>, ICollItemStatusArgs<TItem>>, nmspace?: string, context?: IBaseObject, priority?: TPriority): void;
    offOnStatusChanged(nmspace?: string): void;
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
    isEditing: boolean;
    isUpdating: boolean;
    permissions: IPermissions;
}

export interface ISimpleCollection<TItem extends ICollectionItem> extends IBaseObject {
    getFieldNames(): string[];
    getFieldInfo(fieldName: string): IFieldInfo;
    getFieldInfos(): IFieldInfo[];
    getFieldMap(): IIndexer<IFieldInfo>;
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
    readonly options: ICollectionOptions;
    readonly uniqueID: string;
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
    [itemKey: string]: IErrors;
}

export interface IInternalCollMethods<TItem extends ICollectionItem> {
    setIsLoading(v: boolean): void;
    getEditingItem(): TItem;
    getStrValue(val: any, fieldInfo: IFieldInfo): string;
    onBeforeEditing(item: TItem, isBegin: boolean, isCanceled: boolean): void;
    onEditing(item: TItem, isBegin: boolean, isCanceled: boolean): void;
    onCommitChanges(item: TItem, isBegin: boolean, isRejected: boolean, status: ITEM_STATUS): void;
    onItemDeleting(args: ICancellableArgs<TItem>): boolean;
    onErrorsChanged(args: ICollItemArgs<TItem>): void;
    validateItemField(args: ICollValidateFieldArgs<TItem>): IValidationInfo;
    validateItem(args: ICollValidateItemArgs<TItem>): IValidationInfo[];
}
