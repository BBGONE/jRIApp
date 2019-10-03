/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { Bootstrap } from "./jriapp/bootstrap";

export * from "jriapp_shared";
export * from "jriapp_shared/collection/const";
export * from "jriapp_shared/collection/int";
export * from "jriapp_shared/utils/jsonbag";
export { Promise } from "jriapp_shared/utils/deferred";
export { KEYS, BINDING_MODE, BindTo, SubscribeFlags } from "./jriapp/consts";
export {
    IAppOptions, IApplication, TBindingMode, ITemplate, ITemplateEvents, IBinding, TBindingInfo,
    TBindingOptions, IConverter, IContentFactory, IDatepicker, IElView,
    ITooltipService, ISelectable, ISelectableProvider,
    ILifeTimeScope, ITemplateGroupInfo, ITemplateInfo, IViewOptions, ISubscriber
} from "./jriapp/int";
export { DomUtils as DOM } from "./jriapp/utils/dom";
export { ViewChecks } from "./jriapp/utils/viewchecks";
export { BaseConverter } from "./jriapp/converter";
export { bootstrap, subscribeWeakMap, selectableProviderWeakMap } from "./jriapp/bootstrap";
export { Binding } from "./jriapp/binding";
export { createTemplate, ITemplateOptions } from "./jriapp/template";
export { LifeTimeScope } from "./jriapp/utils/lifetime";
export { PropWatcher } from "./jriapp/utils/propwatcher";
export { ViewModel, BaseCommand, Command, ICommand } from "./jriapp/mvvm";

export { Application } from "./jriapp/app";

export const VERSION = "2.25.6";

Bootstrap._initFramework();
