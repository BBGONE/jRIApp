/// <reference path="../../thirdparty/qtip2.d.ts" />
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
import * as constsMOD from "../jriapp_core/const";
import { ITooltipService } from "../jriapp_core/shared";
import { DomUtils as dom } from "./dom";

const $ = dom.$, window = dom.window;

export const css = {
    toolTip: "qtip",
    toolTipError: "qtip-red"
};

export function create(): ITooltipService {
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