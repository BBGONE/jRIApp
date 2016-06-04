/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import * as coreMOD from "shared";
import { CoreUtils as coreUtils } from "../jriapp_utils/coreutils";

export function assign<T extends U, U extends coreMOD.IIndexer<any>>(target: T, source: U): T {
    return coreUtils.assignStrings(target, source);
}

export interface IErrors extends coreMOD.IIndexer<string> {
    ERR_OBJ_ALREADY_REGISTERED: string;
    ERR_APP_NEED_JQUERY: string;
    ERR_ASSERTION_FAILED: string;
    ERR_BINDING_CONTENT_NOT_FOUND: string;
    ERR_DBSET_READONLY: string;
    ERR_DBSET_INVALID_FIELDNAME: string;
    ERR_FIELD_READONLY: string;
    ERR_FIELD_ISNOT_NULLABLE: string;
    ERR_FIELD_WRONG_TYPE: string;
    ERR_FIELD_MAXLEN: string;
    ERR_FIELD_DATATYPE: string;
    ERR_FIELD_REGEX: string;
    ERR_FIELD_RANGE: string;
    ERR_EVENT_INVALID: string;
    ERR_EVENT_INVALID_FUNC: string;
    ERR_MODULE_NOT_REGISTERED: string;
    ERR_MODULE_ALREDY_REGISTERED: string;
    ERR_PROP_NAME_EMPTY: string;
    ERR_PROP_NAME_INVALID: string;
    ERR_GLOBAL_SINGLTON: string;
    ERR_TEMPLATE_ALREADY_REGISTERED: string;
    ERR_TEMPLATE_NOTREGISTERED: string;
    ERR_TEMPLATE_GROUP_NOTREGISTERED: string;
    ERR_TEMPLATE_HAS_NO_ID: string;
    ERR_CONVERTER_NOTREGISTERED: string;
    ERR_JQUERY_DATEPICKER_NOTFOUND: string;
    ERR_PARAM_INVALID: string;
    ERR_PARAM_INVALID_TYPE: string;
    ERR_KEY_IS_EMPTY: string;
    ERR_KEY_IS_NOTFOUND: string;
    ERR_ITEM_IS_ATTACHED: string;
    ERR_ITEM_IS_DETACHED: string;
    ERR_ITEM_IS_NOTFOUND: string;
    ERR_ITEM_NAME_COLLISION: string;
    ERR_DICTKEY_IS_NOTFOUND: string;
    ERR_DICTKEY_IS_EMPTY: string;
    ERR_CONV_INVALID_DATE: string;
    ERR_CONV_INVALID_NUM: string;
    ERR_QUERY_NAME_NOTFOUND: string;
    ERR_QUERY_BETWEEN: string;
    ERR_QUERY_OPERATOR_INVALID: string;
    ERR_OPER_REFRESH_INVALID: string;
    ERR_CALC_FIELD_DEFINE: string;
    ERR_CALC_FIELD_SELF_DEPEND: string;
    ERR_DOMAIN_CONTEXT_INITIALIZED: string;
    ERR_DOMAIN_CONTEXT_NOT_INITIALIZED: string;
    ERR_SVC_METH_PARAM_INVALID: string;
    ERR_DB_LOAD_NO_QUERY: string;
    ERR_DBSET_NAME_INVALID: string;
    ERR_APP_NAME_NOT_UNIQUE: string;
    ERR_ELVIEW_NOT_REGISTERED: string;
    ERR_ELVIEW_NOT_CREATED: string;
    ERR_BIND_TARGET_EMPTY: string;
    ERR_BIND_TGTPATH_INVALID: string;
    ERR_BIND_MODE_INVALID: string;
    ERR_BIND_TARGET_INVALID: string;
    ERR_APP_SETUP_INVALID: string;
    ERR_GRID_DATASRC_INVALID: string;
    ERR_COLLECTION_CHANGETYPE_INVALID: string;
    ERR_GRID_COLTYPE_INVALID: string;
    ERR_PAGER_DATASRC_INVALID: string;
    ERR_STACKPNL_DATASRC_INVALID: string;
    ERR_STACKPNL_TEMPLATE_INVALID: string;
    ERR_LISTBOX_DATASRC_INVALID: string;
    ERR_DATAFRM_DCTX_INVALID: string;
    ERR_DCTX_HAS_NO_FIELDINFO: string;
    ERR_TEMPLATE_ID_INVALID: string;
    ERR_ITEM_DELETED_BY_ANOTHER_USER: string;
    ERR_ACCESS_DENIED: string;
    ERR_CONCURRENCY: string;
    ERR_VALIDATION: string;
    ERR_SVC_VALIDATION: string;
    ERR_SVC_ERROR: string;
    ERR_UNEXPECTED_SVC_ERROR: string;
    ERR_ASSOC_NAME_INVALID: string;
    ERR_DATAVIEW_DATASRC_INVALID: string;
    ERR_DATAVIEW_FILTER_INVALID: string;
}

export interface IPagerText extends coreMOD.IIndexer<string> {
    firstText: string;
    lastText: string;
    previousText: string;
    nextText: string;
    pageInfo: string;
    firstPageTip: string;
    prevPageTip: string;
    nextPageTip: string;
    lastPageTip: string;
    showingTip: string;
    showTip: string;
}

export interface IValidateText extends coreMOD.IIndexer<string> {
    errorInfo: string;
    errorField: string;
}

export interface IText extends coreMOD.IIndexer<string> {
    txtEdit: string;
    txtAddNew: string;
    txtDelete: string;
    txtCancel: string;
    txtOk: string;
    txtRefresh: string;
    txtAskDelete: string;
    txtSubmitting: string;
    txtSave: string;
    txtClose: string;
    txtField: string;
}

export interface ILocaleText extends coreMOD.IIndexer<any> {
    PAGER: IPagerText;
    VALIDATE: IValidateText;
    TEXT: IText;
}


let _ERRS: IErrors = {
    ERR_OBJ_ALREADY_REGISTERED: "an Object with the name: {0} is already registered and can not be overwritten",
    ERR_APP_NEED_JQUERY: "The project is dependent on JQuery",
    ERR_ASSERTION_FAILED: 'The Assertion "{0}" failed',
    ERR_BINDING_CONTENT_NOT_FOUND: "BindingContent is not found",
    ERR_DBSET_READONLY: "TDbSet: {0} is readOnly and can not be edited",
    ERR_DBSET_INVALID_FIELDNAME: "TDbSet: {0} has no field with the name: {1}",
    ERR_FIELD_READONLY: "Field is readOnly and can not be edited",
    ERR_FIELD_ISNOT_NULLABLE: "Field is not nullable and can not be set to null",
    ERR_FIELD_WRONG_TYPE: "Value {0} has wrong datatype. It should have {1} datatype.",
    ERR_FIELD_MAXLEN: "Value exceeds field maxlength: {0}",
    ERR_FIELD_DATATYPE: "Unknown field data type: {0}",
    ERR_FIELD_REGEX: "Value {0} can not be accepted as the right value for this field",
    ERR_FIELD_RANGE: "Value {0} is outside the allowed range {1} for this field",
    ERR_EVENT_INVALID: "Invalid event name: {0}",
    ERR_EVENT_INVALID_FUNC: "Invalid event function value",
    ERR_MODULE_NOT_REGISTERED: "Module: {0} is not registered",
    ERR_MODULE_ALREDY_REGISTERED: "Module: {0} is already registered",
    ERR_PROP_NAME_EMPTY: "Empty property name parameter",
    ERR_PROP_NAME_INVALID: 'The object does not have a property with a name: "{0}"',
    ERR_GLOBAL_SINGLTON: "There must be only one instance of Global object",
    ERR_TEMPLATE_ALREADY_REGISTERED: "TEMPLATE with the name: {0} is already registered",
    ERR_TEMPLATE_NOTREGISTERED: "TEMPLATE with the name: {0} is not registered",
    ERR_TEMPLATE_GROUP_NOTREGISTERED: "TEMPLATE's group: {0} is not registered",
    ERR_TEMPLATE_HAS_NO_ID: "TEMPLATE inside SCRIPT tag must have an ID attribute",
    ERR_CONVERTER_NOTREGISTERED: "Converter: {0} is not registered",
    ERR_JQUERY_DATEPICKER_NOTFOUND: "Application is dependent on JQuery.UI.datepicker. Please include it in the scripts.",
    ERR_PARAM_INVALID: "Parameter: {0} has invalid value: {1}",
    ERR_PARAM_INVALID_TYPE: "Parameter: {0} has invalid type. It must be {1}",
    ERR_KEY_IS_EMPTY: "Key value must not be empty",
    ERR_KEY_IS_NOTFOUND: "Can not find item with the key: {0}",
    ERR_ITEM_IS_ATTACHED: "Operation invalid, reason: Item already has been attached",
    ERR_ITEM_IS_DETACHED: "Operation invalid, reason: Item is detached",
    ERR_ITEM_IS_NOTFOUND: "Operation invalid, reason: Item is not found",
    ERR_ITEM_NAME_COLLISION: 'The "{0}" TDbSet\'s field name: "{1}" is invalid, because a property with that name already exists on the entity type.',
    ERR_DICTKEY_IS_NOTFOUND: "Dictionary keyName: {0} does not exist in item's properties",
    ERR_DICTKEY_IS_EMPTY: "Dictionary key property: {0} must be not empty",
    ERR_CONV_INVALID_DATE: "Cannot parse string value: {0} to a valid Date",
    ERR_CONV_INVALID_NUM: "Cannot parse string value: {0} to a valid Numeric",
    ERR_QUERY_NAME_NOTFOUND: "Can not find Query with the name: {0}",
    ERR_QUERY_BETWEEN: '"BETWEEN" Query operator expects two values',
    ERR_QUERY_OPERATOR_INVALID: "Invalid query operator {0}",
    ERR_OPER_REFRESH_INVALID: "Refresh operation can not be done with items in Detached or Added State",
    ERR_CALC_FIELD_DEFINE: 'Field: "{0}" definition error: Calculated fields can be dependent only on items fields',
    ERR_CALC_FIELD_SELF_DEPEND: 'Field: "{0}" definition error: Calculated fields can not be dependent on themselves',
    ERR_DOMAIN_CONTEXT_INITIALIZED: "DbContext already initialized",
    ERR_DOMAIN_CONTEXT_NOT_INITIALIZED: "DbContext is not initialized",
    ERR_SVC_METH_PARAM_INVALID: "Invalid parameter {0} value {1} for service method: {2} invocation",
    ERR_DB_LOAD_NO_QUERY: "Query parameter is not supplied",
    ERR_DBSET_NAME_INVALID: "Invalid dbSet Name: {0}",
    ERR_APP_NAME_NOT_UNIQUE: "Application instance with the name: {0} already exists",
    ERR_ELVIEW_NOT_REGISTERED: "Can not find registered element view with the name: {0}",
    ERR_ELVIEW_NOT_CREATED: "Can not create element view for element with Tag Name: {0}",
    ERR_BIND_TARGET_EMPTY: "Binding target is empty",
    ERR_BIND_TGTPATH_INVALID: "Binding targetPath has invalid value: {0}",
    ERR_BIND_MODE_INVALID: "Binding mode has invalid value: {0}",
    ERR_BIND_TARGET_INVALID: "Binding target must be a descendant of BaseObject",
    ERR_APP_SETUP_INVALID: "Application's setUp method parameter must be a valid function",
    ERR_GRID_DATASRC_INVALID: "DataGrid's datasource must be a descendant of Collection type",
    ERR_COLLECTION_CHANGETYPE_INVALID: "Invalid Collection change type value: {0}",
    ERR_GRID_COLTYPE_INVALID: "Invalid Column type type value: {0}",
    ERR_PAGER_DATASRC_INVALID: "Pager datasource must be a descendant of Collection type",
    ERR_STACKPNL_DATASRC_INVALID: "StackPanel datasource must be a descendant of Collection type",
    ERR_STACKPNL_TEMPLATE_INVALID: "StackPanel templateID is not provided in the options",
    ERR_LISTBOX_DATASRC_INVALID: "ListBox datasource must be a descendant of Collection type",
    ERR_DATAFRM_DCTX_INVALID: "DataForm's dataContext must be a descendant of BaseObject type",
    ERR_DCTX_HAS_NO_FIELDINFO: "DataContext has no getFieldInfo method",
    ERR_TEMPLATE_ID_INVALID: "Element can not be found by TemplateID: {0}",
    ERR_ITEM_DELETED_BY_ANOTHER_USER: "The record was deleted by another user",
    ERR_ACCESS_DENIED: "The access is denied. Please, ask administrator to assign user rights to your account.",
    ERR_CONCURRENCY: "The record has been modified by another user. Please, refresh record before editing.",
    ERR_VALIDATION: "Data validation error",
    ERR_SVC_VALIDATION: "Data validation error: {0}",
    ERR_SVC_ERROR: "Service error: {0}",
    ERR_UNEXPECTED_SVC_ERROR: "Unexpected service error: {0}",
    ERR_ASSOC_NAME_INVALID: "Invalid association name: {0}",
    ERR_DATAVIEW_DATASRC_INVALID: "TDataView datasource must not be null and should be descendant of Collection type",
    ERR_DATAVIEW_FILTER_INVALID: "TDataView fn_filter option must be valid function which accepts entity and returns boolean value"
}

let PAGER: IPagerText = {
    firstText: "<<",
    lastText: ">>",
    previousText: "<",
    nextText: ">",
    pageInfo: "Page {0} of {1}",
    firstPageTip: "to first page",
    prevPageTip: "back to page {0}",
    nextPageTip: "next to page {0}",
    lastPageTip: "last page",
    showingTip: "showing result {0} to {1} of {2}",
    showTip: "show result {0} to {1} of {2}"
};

let VALIDATE: IValidateText = {
    errorInfo: "Validation errors:",
    errorField: "field:"
};

let TEXT: IText = {
    txtEdit: "Edit",
    txtAddNew: "Add new",
    txtDelete: "Delete",
    txtCancel: "Cancel",
    txtOk: "Ok",
    txtRefresh: "Refresh",
    txtAskDelete: "Are you sure, you want to delete row?",
    txtSubmitting: "Submitting data ...",
    txtSave: "Save",
    txtClose: "Close",
    txtField: "Field"
};

let _STRS: ILocaleText = { PAGER: PAGER, VALIDATE: VALIDATE, TEXT: TEXT };

export let ERRS: IErrors = _ERRS;
export let STRS: ILocaleText = _STRS;