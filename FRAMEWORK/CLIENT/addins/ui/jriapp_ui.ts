/// <reference path="../../built/jriapp.d.ts" />
/// <reference path="../../built/jriapp_shared.d.ts" />
/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { bootstrap } from "jriapp/bootstrap";
import { initContentFactory } from "./jriapp_ui/content/all";

export { DIALOG_ACTION, IDialogConstructorOptions, DataEditDialog, DialogVM } from "./jriapp_ui/dialog";
export { DynaContentElView, IDynaContentAnimation, IDynaContentOptions } from "./jriapp_ui/dynacontent";
export {
    DataGrid, DataGridCell, DataGridColumn, DataGridRow, DataGridElView, IDataGridViewOptions,
    ROW_POSITION, IRowStateProvider, findDataGrid, getDataGrids
} from "./jriapp_ui/datagrid/datagrid";
export * from "./jriapp_ui/pager";
export {
    ListBox, ListBoxElView, IListBoxViewOptions,
    IOptionStateProvider, IOptionTextProvider
} from "./jriapp_ui/listbox";
export * from "./jriapp_ui/stackpanel";
export * from "./jriapp_ui/tabs";
export { BaseElView, fn_addToolTip } from "./jriapp_ui/generic";
export { DataForm, DataFormElView } from "./jriapp_ui/dataform";
export { DatePickerElView } from "./jriapp_ui/datepicker";
export { AnchorElView, IAncorOptions } from "./jriapp_ui/anchor";
export { BlockElView } from "./jriapp_ui/block";
export { BusyElView, IBusyViewOptions } from "./jriapp_ui/busy";
export { ButtonElView } from "./jriapp_ui/button";
export { CheckBoxElView } from "./jriapp_ui/checkbox";
export { CheckBoxThreeStateElView } from "./jriapp_ui/checkbox3";
export { CommandElView } from "./jriapp_ui/command";
export { ExpanderElView, IExpanderOptions } from "./jriapp_ui/expander";
export { HiddenElView } from "./jriapp_ui/hidden";
export { ImgElView } from "./jriapp_ui/img";
export { InputElView } from "./jriapp_ui/input";
export { RadioElView } from "./jriapp_ui/radio";
export { SpanElView } from "./jriapp_ui/span";
export { TextAreaElView, ITextAreaOptions } from "./jriapp_ui/textarea";
export { TextBoxElView, ITextBoxOptions, TKeyPressArgs } from "./jriapp_ui/textbox";

export { DblClick } from "./jriapp_ui/utils/dblclick";
export * from "./jriapp_ui/content/all";

initContentFactory();

//Load Stylesheet for all the bundle
bootstrap.loadOwnStyle("jriapp_ui");
