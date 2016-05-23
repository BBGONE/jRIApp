/// <reference path="../thirdparty/jquery.d.ts" />
/// <reference path="../thirdparty/moment.d.ts" />
/// <reference path="../thirdparty/qtip2.d.ts" />
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
export { Debounce, DblClick, DEBUG, ERROR } from "./jriapp_utils/coreutils";
export { bootstrap } from "./jriapp_core/bootstrap";
export { contentFactories } from "./jriapp_content/factory";
export { Binding } from "./jriapp_core/binding";
export * from "./jriapp_core/datepicker";
export { DataForm, DataFormElView } from "./jriapp_core/dataform";
export { create as createTemplate, TemplateElView, ITemplateOptions } from "./jriapp_core/template";
export * from "./jriapp_elview/all";
export { Utils, PropWatcher, WaitQueue, IWaitQueueItem } from "./jriapp_utils/utils";
export * from "./jriapp_core/mvvm";
export { BaseCollection, BaseDictionary, BaseList, ICollection, ICollectionItem, IItemAspect, IListItem,
ITEM_STATUS, CollectionItem, ItemAspect, ListItemAspect, IPermissions, ValidationError, COLL_CHANGE_OPER,
COLL_CHANGE_REASON, COLL_CHANGE_TYPE } from "./jriapp_collection/collection";
export { Application } from "./jriapp_core/app";

export const VERSION = "0.9.51";

Bootstrap._initFramework();