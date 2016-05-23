/// <reference path="../../built/jriapp.d.ts" />
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
import { bootstrap } from  "jriapp_core/bootstrap";

export { DIALOG_ACTION, IDialogConstructorOptions, DataEditDialog, DialogVM } from "./jriapp_ui/dialog";
export { DynaContentElView, IDynaContentAnimation, IDynaContentOptions } from "./jriapp_ui/dynacontent";
export { DataGrid, DataGridCell, DataGridColumn, DataGridRow, DataGridElView, IDataGridViewOptions,
ROW_POSITION, IRowStateProvider } from "./jriapp_ui/datagrid/datagrid";
export * from "./jriapp_ui/pager";
export { ListBox, ListBoxElView, LookupContent, IListBoxViewOptions, IOptionStateProvider,
IOptionTextProvider } from "./jriapp_ui/listbox";
export * from "./jriapp_ui/stackpanel";
export * from "./jriapp_ui/tabs";

//Load Stylesheet for all the bundle
bootstrap.loadOwnStyle("jriapp_ui");
