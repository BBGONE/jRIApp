/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import * as constsMOD from "jriapp_core/const";
import { ITooltipService } from "jriapp_core/shared";
import { DomUtils } from "jriapp_utils/dom";

const dom = DomUtils, $ = dom.$, window = dom.window;

export const css = {
    toolTip: "qtip",
    toolTipError: "qtip-red"
};

export function createToolTipSvc(): ITooltipService {
    return new tooltipService();
}

class tooltipService implements ITooltipService {
    constructor() {
    }

    addToolTip($el: JQuery, tip: string, isError?: boolean, pos?: string): void {
        let options: QTip2.QTipOptions = {
            content: {
                text: tip
            },
            style: {
                classes: !!isError ? css.toolTipError : css.toolTip
            },
            position: {
                my: "top left",
                at: (!!pos) ? pos : "bottom right",
                viewport: $(window),
                adjust: {
                    method: "flip",
                    x: 0,
                    y: 0
                }
            },
            hide: {
                event: "unfocus click mouseleave",
                leave: true
            }
        };

        if (!!$el.data("qtip")) {
            if (!tip) {
                $el.qtip("destroy", true);
            }
            else
                $el.qtip("option", "content.text", tip);
        }
        else if (!!tip) {
            $el.qtip(options);
        }
    }
}