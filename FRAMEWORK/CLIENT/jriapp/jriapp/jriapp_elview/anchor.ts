/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { IViewOptions } from "../jriapp_core/shared";
import { Utils as utils } from "../jriapp_utils/utils";
import { bootstrap } from "../jriapp_core/bootstrap";
import { css, PROP_NAME, IEventChangedArgs, EVENT_CHANGE_TYPE } from "./elview";
import { CommandElView } from "./command";
import { IButtonOptions } from "./button";
import { ICommand } from "../jriapp_core/mvvm";

const $ = utils.dom.$;

export interface IAncorOptions extends IButtonOptions {
    imageSrc?: string;
    glyph?: string;
}

export class AnchorElView extends CommandElView {
    private _imageSrc: string;
    private _glyph: string;
    private _image: HTMLImageElement;
    private _span: HTMLSpanElement;
    private _preventDefault: boolean;

    constructor(options: IAncorOptions) {
        super(options);
        let self = this, $el = this.$el;
        this._imageSrc = null;
        this._image = null;
        this._span = null;
        this._glyph = null;
        this._preventDefault = false;

        if (!!options.imageSrc)
            this.imageSrc = options.imageSrc;
        if (!!options.glyph)
            this.glyph = options.glyph;

        if (!!options.preventDefault)
            this._preventDefault = true;

        $el.addClass(css.commandLink);
        $el.on("click." + this.uniqueID, function (e) {
            self._onClick(e);
        });
    }
    protected _onClick(e: Event) {
        if (this._preventDefault)
            e.preventDefault();
        this.invokeCommand(null, true);
    }
    protected _updateImage(src: string) {
        let $a = this.$el, $img: JQuery, self = this;
        if (this._imageSrc === src)
            return;
        this._imageSrc = src;

        if (!!this._image && !src) {
            $(this._image).remove();
            this._image = null;
            return;
        }

        if (!!src) {
            if (!this._image) {
                $a.empty();
                $img = $(new Image()).mouseenter(
                    function (e) {
                        if (self.isEnabled)
                            $(this).css("opacity", 0.5);
                    }).mouseout(
                    function (e) {
                        if (self.isEnabled)
                            $(this).css("opacity", 1.0);
                    });

                $img.appendTo($a);
                this._image = <HTMLImageElement>$img.get(0);
            }

            this._image.src = src;
        }
    }
    protected _updateGlyph(glyph: string) {
        let $a = this.$el, $span: JQuery;

        if (this._glyph === glyph)
            return;
        let oldGlyph = this._glyph;
        this._glyph = glyph;

        if (!!oldGlyph && !glyph) {
            $(this._span).remove();
            return;
        }

        if (!!glyph) {
            if (!this._span) {
                $a.empty();
                this._span = utils.dom.document.createElement("span");
                $span = $(this._span);
                $span.appendTo($a);
            }
            else
                $span = $(this._span);

            if (!!oldGlyph) {
                $span.removeClass(oldGlyph);
            }
            $span.addClass(glyph);
        }
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this.$el.removeClass(css.commandLink);
        this.imageSrc = null;
        this.glyph = null;
        super.destroy();
    }
    toString() {
        return "AnchorElView";
    }
    get imageSrc() { return this._imageSrc; }
    set imageSrc(v) {
        let x = this._imageSrc;
        if (x !== v) {
            this._updateImage(v);
            this.raisePropertyChanged(PROP_NAME.imageSrc);
        }
    }
    get glyph() { return this._glyph; }
    set glyph(v) {
        let x = this._glyph;
        if (x !== v) {
            this._updateGlyph(v);
            this.raisePropertyChanged(PROP_NAME.glyph);
        }
    }
    get html() {
        return this.$el.html();
    }
    set html(v) {
        let x = this.$el.html();
        if (v === null)
            v = "";
        else
            v = "" + v;
        if (x !== v) {
            this.$el.html(v);
            this.raisePropertyChanged(PROP_NAME.html);
        }
    }
    get text() {
        return this.$el.text();
    }
    set text(v) {
        let x = this.$el.text();
        if (v === null)
            v = "";
        else
            v = "" + v;
        if (x !== v) {
            this.$el.text(v);
            this.raisePropertyChanged(PROP_NAME.text);
        }
    }
    get href(): string {
        return this.$el.prop("href");
    }
    set href(v) {
        let x = this.href;
        if (v === null)
            v = "";
        else
            v = "" + v;
        if (x !== v) {
            this.$el.prop("href", v);
            this.raisePropertyChanged(PROP_NAME.href);
        }
    }
    get preventDefault() {
        return this._preventDefault;
    }
    set preventDefault(v: boolean) {
        if (this._preventDefault !== v) {
            this._preventDefault = v;
            this.raisePropertyChanged(PROP_NAME.preventDefault);
        }
    }
}

bootstrap.registerElView("a", AnchorElView);
bootstrap.registerElView("abutton", AnchorElView);