import * as RIAPP from "jriapp";
import * as uiMOD from "jriapp_ui";

const $ = uiMOD.$;

export class MonthPickerElView extends uiMOD.TextBoxElView {
    constructor(options: any) {
        super(options);
        const self = this, $el: any = $(this.el);
        $el.MonthPicker({
            OnAfterChooseMonth: function (selectedDate: any) {
                self.objEvents.raiseProp("value");
            },
            Button: "<button class='btn lnkbtn btn-info'>...</button>"
        });
    }
    dispose() {
        if (this.getIsDisposed())
            return;
        this.setDisposing();
        const $el = $(this.el);
        uiMOD.JQueryUtils.dispose$Plugin($el, "MonthPicker");
        super.dispose();
    }
    toString() {
        return "MonthPickerElView";
    }
}

//this function is executed when an application which uses this namespace is created
export function initModule(app: RIAPP.Application) {
    app.registerElView("monthpicker", MonthPickerElView);
}