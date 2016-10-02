var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "jriapp", "jriapp_ui"], function (require, exports, RIAPP, uiMOD) {
    "use strict";
    var bootstrap = RIAPP.bootstrap, utils = RIAPP.Utils, $ = utils.dom.$;
    var d = $(utils.dom.document);
    var h = $("head");
    var drag = null;
    var ID = "id";
    var PX = "px";
    var SIGNATURE = "JColResizer";
    var FLEX = "JCLRFlex";
    var _gridsCount = 0;
    var _created_grids = {};
    function _gridCreated(grid) {
        _created_grids[grid.uniqueID] = grid;
        _gridsCount += 1;
        if (_gridsCount === 1) {
            $(window).on('resize.' + SIGNATURE, onResize);
        }
    }
    function _gridDestroyed(grid) {
        delete _created_grids[grid.uniqueID];
        _gridsCount -= 1;
        if (_gridsCount === 0) {
            $(window).off('resize.' + SIGNATURE);
        }
        destroy(grid.grid);
    }
    h.append("<style type='text/css'>  .JColResizer{table-layout:fixed;} .JCLRgrips{ height:0px; position:relative;} .JCLRgrip{margin-left:-5px; position:absolute; z-index:5; } .JCLRgrip .JColResizer{position:absolute;background-color:red;filter:alpha(opacity=1);opacity:0;width:10px;height:100%;cursor: e-resize;top:0px} .JCLRLastGrip{position:absolute; width:1px; } .JCLRgripDrag{ border-left:1px dotted black;	} .JCLRFlex{width:auto!important;} .JCLRgrip.JCLRdisabledGrip .JColResizer{cursor:default; display:none;}</style>");
    var init = function (grid, options) {
        var $table = grid.$table;
        var tb = $table[0];
        $table.opt = options;
        $table.mode = options.resizeMode;
        $table.dc = $table.opt.disabledColumns;
        var style = window.getComputedStyle(tb, null);
        if ($table.opt.disable)
            return destroy($table);
        $table.p = $table.opt.postbackSafe;
        if ($table.opt.hoverCursor !== 'e-resize')
            h.append("<style type='text/css'>.JCLRgrip .JColResizer:hover{cursor:" + $table.opt.hoverCursor + "!important}</style>");
        $table.addClass(SIGNATURE);
        var $gripContainer = $('<div class="JCLRgrips"/>');
        grid._getInternal().get$Header().before($gripContainer);
        $table.grips = [];
        $table.$columns = [];
        $table.w = $table.width();
        $table.$gripContainer = $gripContainer;
        $table.f = $table.opt.fixed;
        if (options.marginLeft)
            $table.$gripContainer.css("marginLeft", options.marginLeft);
        if (options.marginRight)
            $table.$gripContainer.css("marginRight", options.marginRight);
        $table.cellspacing = parseInt(style.borderSpacing) || 2;
        $table.b = parseInt(style.borderLeftWidth) || 1;
        createGrips(grid);
    };
    var destroy = function (grid) {
        var $table = grid.$table;
        $table.removeClass(SIGNATURE + " " + FLEX).$gripContainer.remove();
    };
    var createGrips = function (grid) {
        var $table = grid.$table;
        var allth = $(grid._tHeadCells);
        allth = allth.filter(":visible");
        $table.cg = $table.find("col");
        $table.ln = allth.length;
        allth.each(function (th) {
            var $column = $(this);
            var dc = $table.dc.indexOf(th) != -1;
            var $grip = $($table.$gripContainer.append('<div class="JCLRgrip"></div>')[0].lastChild);
            $grip.append(dc ? "" : $table.opt.gripInnerHtml).append('<div class="' + SIGNATURE + '"></div>');
            if (th == $table.ln - 1) {
                $grip.addClass("JCLRLastGrip");
                if ($table.f)
                    $grip.html("");
            }
            $grip.bind('touchstart mousedown', onGripMouseDown);
            if (!dc) {
                $grip.removeClass('JCLRdisabledGrip').bind('touchstart mousedown', onGripMouseDown);
            }
            else {
                $grip.addClass('JCLRdisabledGrip');
            }
            $grip.grid = grid;
            $grip.i = th;
            $grip.$column = $column;
            $column.w = $column.width();
            $table.grips.push($grip);
            $table.$columns.push($column);
            $column.width($column.w).removeAttr("width");
            $grip.data(SIGNATURE, { i: th, grid: grid, last: th == $table.ln - 1 });
        });
        $table.cg.removeAttr("width");
        if (!$table.f) {
            $table.removeAttr('width').addClass(FLEX);
        }
        syncGrips(grid);
    };
    var syncGrips = function (grid) {
        if (grid.getIsDestroyCalled())
            return;
        var $table = grid.$table;
        $table.$gripContainer.width($table.w);
        for (var i = 0; i < $table.ln; i++) {
            var $column = $table.$columns[i];
            var headerHeight = grid._getInternal().get$Header()[0].offsetHeight;
            var tableHeight = grid._getInternal().get$Wrapper()[0].offsetHeight;
            $table.grips[i].css({
                left: $column.offset().left - $table.offset().left + $column.outerWidth(false) + $table.cellspacing / 2 + PX,
                height: $table.opt.headerOnly ? headerHeight : (headerHeight + tableHeight)
            });
        }
        grid.updateColumnsSize();
    };
    var syncCols = function (grid, i, isOver) {
        if (grid.getIsDestroyCalled())
            return;
        var $table = grid.$table;
        var inc = drag.x - drag.l, c = $table.$columns[i], c2 = $table.$columns[i + 1];
        var w = c.w + inc;
        var w2 = c2.w - inc;
        c.width(w + PX);
        $table.cg.eq(i).width(w + PX);
        if ($table.f) {
            c2.width(w2 + PX);
            $table.cg.eq(i + 1).width(w2 + PX);
        }
        else if ($table.opt.overflow) {
            $table.css('min-width', $table.w + inc);
        }
        if (isOver) {
            c.w = w;
            c2.w = $table.f ? w2 : c2.w;
        }
    };
    var applyBounds = function (grid) {
        if (grid.getIsDestroyCalled())
            return;
        var $table = grid.$table;
        var w = $.map($table.$columns, function (c) {
            return c.width();
        });
        $table.width($table.w = $table.width()).removeClass(FLEX);
        $.each($table.$columns, function (i, c) {
            c.width(w[i]).w = w[i];
        });
        $table.addClass(FLEX);
    };
    var onGripDrag = function (e) {
        if (!drag)
            return;
        var grid = drag.grid;
        if (grid.getIsDestroyCalled())
            return;
        var $table = grid.$table;
        var oe = e.originalEvent.touches;
        var ox = oe ? oe[0].pageX : e.pageX;
        var x = ox - drag.ox + drag.l;
        var mw = $table.opt.minWidth, i = drag.i;
        var l = $table.cellspacing * 1.5 + mw + $table.b;
        var last = i == $table.ln - 1;
        var min = i ? $table.grips[i - 1].position().left + $table.cellspacing + mw : l;
        var max = $table.f ?
            i == $table.ln - 1 ?
                $table.w - l :
                $table.grips[i + 1].position().left - $table.cellspacing - mw :
            Infinity;
        x = Math.max(min, Math.min(max, x));
        drag.x = x;
        drag.css("left", x + PX);
        if (last) {
            var c = $table.$columns[drag.i];
            drag.w = c.w + x - drag.l;
        }
        if ($table.opt.liveDrag) {
            if (last) {
                c.width(drag.w);
                if (!$table.f && $table.opt.overflow) {
                    $table.css('min-width', $table.w + x - drag.l);
                }
                else {
                    $table.w = $table.width();
                }
            }
            else {
                syncCols(grid, i, false);
            }
            syncGrips(grid);
            var cb = $table.opt.onDrag;
            if (cb) {
                e.currentTarget = $table[0];
                cb(e);
            }
        }
        return false;
    };
    var onGripDragOver = function (e) {
        d.unbind('touchend.' + SIGNATURE + ' mouseup.' + SIGNATURE).unbind('touchmove.' + SIGNATURE + ' mousemove.' + SIGNATURE);
        $("head :last-child").remove();
        if (!drag)
            return;
        var grid = drag.grid;
        if (grid.getIsDestroyCalled())
            return;
        var $table = grid.$table;
        drag.removeClass($table.opt.draggingClass);
        if (!(drag.x - drag.l == 0)) {
            var cb = $table.opt.onResize;
            var i = drag.i;
            var last = i == $table.ln - 1;
            var c = $table.grips[i].$column;
            if (last) {
                c.width(drag.w);
                c.w = drag.w;
            }
            else {
                syncCols(grid, i, true);
            }
            if (!$table.f)
                applyBounds($table);
            syncGrips(grid);
            if (cb) {
                e.currentTarget = $table[0];
                cb(e);
            }
        }
        drag = null;
    };
    var onGripMouseDown = function (e) {
        var o = $(this).data(SIGNATURE);
        var grid = o.grid;
        if (grid.getIsDestroyCalled())
            return;
        var $table = grid.$table, $grip = $table.grips[o.i];
        var oe = e.originalEvent.touches;
        $grip.ox = oe ? oe[0].pageX : e.pageX;
        $grip.l = $grip.position().left;
        $grip.x = $grip.l;
        d.bind('touchmove.' + SIGNATURE + ' mousemove.' + SIGNATURE, onGripDrag).bind('touchend.' + SIGNATURE + ' mouseup.' + SIGNATURE, onGripDragOver);
        h.append("<style type='text/css'>*{cursor:" + $table.opt.dragCursor + "!important}</style>");
        $grip.addClass($table.opt.draggingClass);
        drag = $grip;
        if ($table.$columns[o.i].l) {
            for (var i = 0, c; i < $table.ln; i++) {
                c = $table.$columns[i];
                c.l = false;
                c.w = c.width();
            }
        }
        return false;
    };
    var checkResize = function (grid) {
        if (grid.getIsDestroyCalled())
            return;
        var $table = grid.$table;
        var i, mw = 0;
        $table.removeClass(SIGNATURE);
        if ($table.f) {
            $table.w = $table.width();
            for (i = 0; i < $table.ln; i++)
                mw += $table.$columns[i].w;
            for (i = 0; i < $table.ln; i++)
                $table.$columns[i].css("width", Math.round(1000 * $table.$columns[i].w / mw) / 10 + "%").l = true;
        }
        else {
            applyBounds(grid);
        }
        $table.addClass(SIGNATURE);
        syncGrips(grid);
    };
    var onResize = function () {
        RIAPP.Utils.core.iterateIndexer(_created_grids, function (name, gridView) {
            var grid = gridView.grid;
            checkResize(grid);
        });
    };
    var ResizableGrid = (function (_super) {
        __extends(ResizableGrid, _super);
        function ResizableGrid(options) {
            _super.call(this, options);
            var self = this, grid = self.grid;
            _gridCreated(this);
            var defaults = {
                resizeMode: 'fit',
                draggingClass: 'JCLRgripDrag',
                gripInnerHtml: '',
                liveDrag: false,
                minWidth: 15,
                headerOnly: false,
                hoverCursor: "e-resize",
                dragCursor: "e-resize",
                postbackSafe: false,
                flush: false,
                marginLeft: null,
                marginRight: null,
                disable: false,
                partialRefresh: false,
                disabledColumns: [],
                onDrag: null,
                onResize: null
            };
            var opts = $.extend(defaults, options);
            opts.fixed = true;
            opts.overflow = false;
            switch (opts.resizeMode) {
                case 'flex':
                    opts.fixed = false;
                    break;
                case 'overflow':
                    opts.fixed = false;
                    opts.overflow = true;
                    break;
            }
            this._ds = grid.dataSource;
            init(grid, opts);
            self.bindDS(grid.dataSource);
            grid.addOnPropertyChange("dataSource", function (s, a) {
                self.unBindDS(self._ds);
                self.bindDS(grid.dataSource);
                self._ds = grid.dataSource;
            }, this.uniqueID);
            setTimeout(function () { checkResize(grid); }, 0);
        }
        ResizableGrid.prototype.bindDS = function (ds) {
            if (!ds)
                return;
            var self = this;
            ds.addOnCleared(function (s, a) { setTimeout(function () { syncGrips(self.grid); }, 0); }, this.uniqueID);
            ds.addOnFill(function (s, a) {
                setTimeout(function () { syncGrips(self.grid); }, 0);
            }, this.uniqueID);
        };
        ResizableGrid.prototype.unBindDS = function (ds) {
            if (!ds)
                return;
            ds.removeNSHandlers(this.uniqueID);
        };
        ResizableGrid.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            _gridDestroyed(this);
            _super.prototype.destroy.call(this);
        };
        return ResizableGrid;
    }(uiMOD.DataGridElView));
    exports.ResizableGrid = ResizableGrid;
    function initModule(app) {
        app.registerElView('resizable_grid', ResizableGrid);
    }
    exports.initModule = initModule;
});
