/// <reference path="../thirdparty/jquery.d.ts" />
/// <reference path="../thirdparty/moment.d.ts" />
/// <reference path="../thirdparty/qtip2.d.ts" />
/// <reference path="../thirdparty/require.d.ts" />
/// <reference path="../built/jriapp_shared.d.ts" />

/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { Bootstrap } from "./jriapp/bootstrap";

export * from "jriapp_shared";
export {
    KEYS, BINDING_MODE, BindTo
} from "./jriapp/const";
export {
    IAppOptions, IApplication, TBindingMode, ITemplate, ITemplateEvents, IBinding, IBindingInfo,
    IBindingOptions, IConverter, IContentFactory, IDatepicker, IElView,
    ITooltipService, ISelectable, ISelectableProvider,
    ILifeTimeScope, ITemplateGroupInfo, ITemplateGroupInfoEx, ITemplateInfo, ITemplateLoaderInfo,
    IViewOptions
} from "./jriapp/shared";
export { JQueryUtils, $ } from "./jriapp/utils/jquery";
export { ViewChecks } from "./jriapp/utils/viewchecks";
export { BaseConverter } from "./jriapp/converter";
export { bootstrap } from "./jriapp/bootstrap";
export { Binding } from "./jriapp/binding";
export { Datepicker } from "./jriapp/datepicker";
export { createTemplate, ITemplateOptions } from "./jriapp/template";
export { LifeTimeScope } from "./jriapp/utils/lifetime";
export { PropWatcher } from "./jriapp/utils/propwatcher";
export {
    ViewModel, TemplateCommand,
    BaseCommand, Command, ICommand, TCommand
} from "./jriapp/mvvm";

export { Application } from "./jriapp/app";

export const VERSION = "1.0.7";

Bootstrap._initFramework();