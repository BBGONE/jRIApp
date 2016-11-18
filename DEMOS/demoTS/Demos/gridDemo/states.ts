import * as RIAPP from "jriapp";
import * as uiMOD from "jriapp_ui";

export class RowStateProvider implements uiMOD.IRowStateProvider {
    getCSS(item: RIAPP.ICollectionItem, val: any): string {
        return (!val) ? 'rowInactive' : null;
    }
}

export class OptionTextProvider implements uiMOD.IOptionTextProvider {
    getText(item: RIAPP.ICollectionItem, itemIndex: number, text: string): string {
        if (itemIndex > 0)
            return itemIndex + ') ' + text;
        else
            return text;
    }
}

export class OptionStateProvider implements uiMOD.IOptionStateProvider {
    getCSS(item: RIAPP.ICollectionItem, itemIndex: number, val: any): string {
        //var name: string = val;
        if (itemIndex % 2 == 0)
            return "gray-bgc";
        else
            return "white-bgc";
    }
}
