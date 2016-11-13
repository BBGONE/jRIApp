/// <reference path="../../thirdparty/jquery.d.ts" />
/// <reference path="../../thirdparty/moment.d.ts" />
/// <reference path="../../thirdparty/qtip2.d.ts" />
/// <reference path="../../thirdparty/require.d.ts" />
/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { Bootstrap } from "./jriapp_core/bootstrap";

export { DEBUG_LEVEL, DATE_CONVERSION, FIELD_TYPE, DATA_TYPE, SORT_ORDER, FILTER_TYPE,
KEYS, BINDING_MODE, BindTo } from "./jriapp_core/const";
export { TEventHandler, TErrorArgs, TErrorHandler, TPropChangedHandler, IDisposable, IIndexer,
IBaseObject, IAppOptions, IApplication, TBindingMode, BaseError, ITemplate, ITemplateEvents, IAbortable,
IBinding, IBindingInfo, IBindingOptions, IConverter, IContentFactory, IDatepicker, IDeferred, IElView,
IThenable, IVoidPromise, IPromise, ITooltipService, IEditable, ISubmittable, ISelectable, ISelectableProvider,
IAbortablePromise, IErrorHandler, IFieldInfo, ILifeTimeScope, ITemplateGroupInfo,
ITemplateGroupInfoEx, ITemplateInfo, ITemplateLoaderInfo, IValidationInfo, ITaskQueue, IViewOptions } from "./jriapp_core/shared";
export { SysChecks } from "./jriapp_utils/syschecks";
export { STRS as LocaleSTRS, ERRS as LocaleERRS } from "./jriapp_core/lang";
export { BaseConverter } from "./jriapp_core/converter";
export { BaseObject } from "./jriapp_core/object";
export { Debounce } from "./jriapp_utils/debounce";
export { DblClick } from "./jriapp_utils/dblclick";
export { DEBUG, ERROR } from "./jriapp_utils/coreutils";
export { bootstrap } from "./jriapp_core/bootstrap";
export { contentFactories } from "./jriapp_content/factory";
export { Binding } from "./jriapp_core/binding";
export * from "./jriapp_core/datepicker";
export { DataForm, DataFormElView } from "./jriapp_core/dataform";
export { createTemplate, TemplateElView, ITemplateOptions } from "./jriapp_core/template";
export * from "./jriapp_elview/all";
export { LifeTimeScope } from "./jriapp_utils/lifetime";
export { PropWatcher } from "./jriapp_utils/propwatcher";
export { WaitQueue, IWaitQueueItem } from "./jriapp_utils/waitqueue";
export { Utils } from "./jriapp_utils/utils";
export * from "./jriapp_core/mvvm";

export {
    ICollection, ICollectionItem, IValueUtils, IEditableCollection,  IItemAspect, IPermissions, ISimpleCollection,
    COLL_CHANGE_OPER, COLL_CHANGE_REASON, COLL_CHANGE_TYPE, ITEM_STATUS
} from "./jriapp_collection/int";
export { BaseCollection } from "./jriapp_collection/collection";
export { CollectionItem } from "./jriapp_collection/item";
export { ItemAspect } from "./jriapp_collection/aspect";
export { ListItemAspect, IListItem, BaseList, IListItemAspectConstructor, IListItemConstructor } from "./jriapp_collection/list";
export { BaseDictionary } from "./jriapp_collection/dictionary";
export { ValidationError } from "./jriapp_collection/validation";
export { Application } from "./jriapp_core/app";

export const VERSION = "0.9.93.1";

Bootstrap._initFramework();