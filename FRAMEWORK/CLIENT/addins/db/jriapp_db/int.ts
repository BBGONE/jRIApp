/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import {
    DATE_CONVERSION, FILTER_TYPE, DATA_TYPE, SORT_ORDER, COLL_CHANGE_REASON
} from "jriapp_shared/collection/const";
import {
    ICollectionItem, IPermissions as ICollPermissions, IFieldInfo
} from "jriapp_shared/collection/int";
import { DELETE_ACTION } from "./const";
import { EntityAspect } from "./entity_aspect";
import { DbContext } from "./dbcontext";

export interface IFieldName {
    n: string; // field's name
    p: IFieldName[]; // for object field contains its properties, for others is null
}

export interface IEntityItem extends ICollectionItem {
    readonly _aspect: EntityAspect<IEntityItem, any, DbContext>;
}

export interface IKV {
    key: string;
    val: any;
}

export interface ICachedPage {
    keys: string[];
    pageIndex: number;
}

export interface IQueryParamInfo {
    readonly dataType: DATA_TYPE;
    readonly dateConversion: DATE_CONVERSION;
    readonly isArray: boolean;
    readonly isNullable: boolean;
    readonly name: string;
    readonly ordinal: number;
}

export interface IQueryInfo {
    isQuery: boolean;
    methodName: string;
    methodResult: boolean;
    parameters: IQueryParamInfo[];
}

export interface IValueChange {
    val: any;
    orig: any;
    fieldName: string;
    flags: number;
    nested: IValueChange[];
}

export interface IValidationErrorInfo {
    fieldName: string;
    message: string;
}

export interface IRowInfo {
    values: IValueChange[];
    changeType: number;
    serverKey: string;
    clientKey: string;
    error: string;
    invalid?: IValidationErrorInfo[];
}

export interface IPermissions extends ICollPermissions {
    dbSetName: string;
}

export interface IPermissionsInfo {
    serverTimezone: number;
    permissions: IPermissions[];
}

export interface IParamInfo {
    parameters: { name: string; value: any; }[];
}

export interface IErrorInfo {
    name: string;
    message: string;
}

export interface ISubset {
    names: IFieldName[];
    rows: IRowData[];
    dbSetName: string;
}

export interface IInvokeRequest {
    methodName: string;
    paramInfo: IParamInfo;
}

export interface IInvokeResponse {
    result: any;
    error: IErrorInfo;
}

export interface IRefreshRequest {
    dbSetName: string;
    rowInfo: IRowInfo;
}

export interface IRefreshResponse {
    dbSetName: string;
    rowInfo: IRowInfo;
    error: { name: string; message: string; };
}

export interface IDbSetConstuctorOptions {
    dbContext: DbContext;
    dbSetInfo: IDbSetInfo;
    childAssoc: IAssociationInfo[];
    parentAssoc: IAssociationInfo[];
}

export interface IDbSetLoadedArgs<TObj> {
    vals: TObj[];
}

export interface IAssocConstructorOptions {
    dbContext: DbContext;
    parentName: string;
    childName: string;
    onDeleteAction: DELETE_ACTION;
    parentKeyFields: string[];
    childKeyFields: string[];
    parentToChildrenName: string;
    childToParentName: string;
    name: string;
}

export interface IAssociationInfo {
    childDbSetName: string;
    childToParentName: string;
    name: string;
    onDeleteAction: number;
    parentDbSetName: string;
    parentToChildrenName: string;
    fieldRels: { childField: string; parentField: string; }[];
}

export interface IDbSetInfo {
    dbSetName: string;
    enablePaging: boolean;
    pageSize: number;
    fieldInfos: IFieldInfo[];
}

export interface IMetadata {
    associations: IAssociationInfo[];
    dbSets: IDbSetInfo[];
    methods: IQueryInfo[];
    serverTimezone: number;
}

export interface ITrackAssoc {
    assocName: string;
    parentKey: string;
    childKey: string;
}

export interface IChangeRequest {
    dbSets: { dbSetName: string; rows: IRowInfo[]; }[];
    trackAssocs: ITrackAssoc[];
}

export interface IChangeResponse {
    dbSets: { dbSetName: string; rows: IRowInfo[]; }[];
    error: { name: string; message: string; };
    subsets: ISubset[] | null | undefined;
}

export interface IFilterInfo {
    filterItems: { fieldName: string; kind: FILTER_TYPE; values: any[]; }[];
}

export interface ISortInfo {
    sortItems: { fieldName: string; sortOrder: SORT_ORDER; }[];
}

export interface IQueryRequest {
    dbSetName: string;
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    isIncludeTotalCount: boolean;
    filterInfo: IFilterInfo;
    sortInfo: ISortInfo;
    paramInfo: IParamInfo;
    queryName: string;
}

export interface IRowData {
    k: string; v: any[]; // key and values
}

export interface IQueryItems<TItem extends IEntityItem> {
    items: TItem[];
    pos: number[];
}

export interface IQueryResult<TItem extends IEntityItem> {
    fetchedItems: TItem[];
    items: TItem[];
    newItems: IQueryItems<TItem>;
    reason: COLL_CHANGE_REASON;
    outOfBandData: any;
}

export interface IQueryResponse {
    names: IFieldName[];
    rows: IRowData[];
    dbSetName: string;
    pageIndex: number;
    pageCount: number;
    totalCount: number;
    extraInfo: any;
    error: IErrorInfo;
    subsets: ISubset[] | null | undefined;
}


export interface ICalcFieldImpl<TItem extends IEntityItem> {
    getFunc: (item: TItem) => any;
}

export interface INavFieldImpl<TItem extends IEntityItem> {
    getFunc: (item: TItem) => any;
    setFunc: (v: any, item: TItem) => void;
}
