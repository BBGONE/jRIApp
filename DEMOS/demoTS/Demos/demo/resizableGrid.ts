/// <reference path="../jriapp/jriapp.d.ts" />
import * as RIAPP from "jriapp";
import * as dbMOD from "jriapp_db";
import * as uiMOD from "jriapp_ui";
import * as COMMON from "./common";

var bootstrap = RIAPP.bootstrap, utils = RIAPP.Utils, $ = utils.dom.$;

var d = $(utils.dom.document); 	//window object
var h = $("head");			//head object
var drag: any = null;		//reference to the current grip that is being dragged

//common strings for packing
var ID = "id";
var PX = "px";
var SIGNATURE = "JColResizer";
var FLEX = "JCLRFlex";

let _gridsCount = 0;
let _created_grids: RIAPP.IIndexer<ResizableGrid> = {};

function _gridCreated(grid: ResizableGrid) {
    _created_grids[grid.uniqueID] = grid;
    _gridsCount += 1;
    if (_gridsCount === 1) {
        $(window).on('resize.' + SIGNATURE, onResize);
    }
}

function _gridDestroyed(grid: ResizableGrid) {
    delete _created_grids[grid.uniqueID];
    _gridsCount -= 1;
    if (_gridsCount === 0) {
        $(window).off('resize.' + SIGNATURE);
    }
    destroy(grid.grid);
}

//append required CSS rules  
h.append("<style type='text/css'>  .JColResizer{table-layout:fixed;} .JCLRgrips{ height:0px; position:relative;} .JCLRgrip{margin-left:-5px; position:absolute; z-index:5; } .JCLRgrip .JColResizer{position:absolute;background-color:red;filter:alpha(opacity=1);opacity:0;width:10px;height:100%;cursor: e-resize;top:0px} .JCLRLastGrip{position:absolute; width:1px; } .JCLRgripDrag{ border-left:1px dotted black;	} .JCLRFlex{width:auto!important;} .JCLRgrip.JCLRdisabledGrip .JColResizer{cursor:default; display:none;}</style>");

var init = function (grid: uiMOD.DataGrid, options: any) {
    let $table: any = grid.$table;
    let tb: HTMLTableElement = $table[0];
    $table.opt = options;                //each table has its own options available at anytime
    $table.mode = options.resizeMode;    //shortcuts
    $table.dc = $table.opt.disabledColumns;
    let style = window.getComputedStyle(tb, null);
    if ($table.opt.disable)
        return destroy($table);	//the user is asking to destroy a previously colResized table
    $table.p = $table.opt.postbackSafe; //short-cut to detect postback safe 		
    if ($table.opt.hoverCursor !== 'e-resize') h.append("<style type='text/css'>.JCLRgrip .JColResizer:hover{cursor:" + $table.opt.hoverCursor + "!important}</style>");  //if hoverCursor has been set, append the style
    //the grips container object is added. Signature class forces table rendering in fixed-layout mode to prevent column's min-width
    $table.addClass(SIGNATURE);
    let $gripContainer = $('<div class="JCLRgrips"/>');
    grid._getInternal().get$Header().before($gripContainer);
    $table.grips = []; //grip sarray
    $table.$columns = []; // columns aray
    $table.w = $table.width();
    $table.$gripContainer = $gripContainer;
    $table.f = $table.opt.fixed;	//t.$column and t.grip are arrays of columns and grips respectively
    				
    if (options.marginLeft) $table.$gripContainer.css("marginLeft", options.marginLeft);  	//if the table contains margins, it must be specified
    if (options.marginRight) $table.$gripContainer.css("marginRight", options.marginRight);  	//since there is no (direct) way to obtain margin values in its original units (%, em, ...)

    $table.cellspacing = parseInt(style.borderSpacing) || 2;	//table cellspacing (not even jQuery is fully cross-browser)
    $table.b = parseInt(style.borderLeftWidth) || 1;	//outer border width (again cross-browser issues)
    createGrips(grid);	//grips are created 
};

var destroy = function (grid: uiMOD.DataGrid) {
    let $table: any = grid.$table;
    $table.removeClass(SIGNATURE + " " + FLEX).$gripContainer.remove();	//class and grips are removed
};

var createGrips = function (grid: uiMOD.DataGrid) {
    let $table: any = grid.$table;
    var allth = $(grid._tHeadCells);
    allth = allth.filter(":visible");			//filter invisible columns
    $table.cg = $table.find("col"); 	//a table can also contain a colgroup with col elements		
    $table.ln = allth.length;			//table length is stored	

    allth.each(function (th: any) {	//iterate through the table column headers			
        var $column: any = $(this); 						//jquery wrap for the current column		
        var dc: any = $table.dc.indexOf(th) != -1;   //is this a disabled column?
        var $grip: any = $($table.$gripContainer.append('<div class="JCLRgrip"></div>')[0].lastChild); //add the visual node to be used as grip

        $grip.append(dc ? "" : $table.opt.gripInnerHtml).append('<div class="' + SIGNATURE + '"></div>');
        if (th == $table.ln - 1) {  //if the current grip is the las one 
            $grip.addClass("JCLRLastGrip");    //add a different css class to stlye it in a different way if needed
            if ($table.f) $grip.html("");   //if the table resizing mode is set to fixed, the last grip is removed since table with can not change
        }

        $grip.bind('touchstart mousedown', onGripMouseDown); //bind the mousedown event to start dragging 

        if (!dc) {
            //if normal column bind the mousedown event to start dragging, if disabled then apply its css class
            $grip.removeClass('JCLRdisabledGrip').bind('touchstart mousedown', onGripMouseDown);
        } else {
            $grip.addClass('JCLRdisabledGrip');
        }

        //some values are stored in the grip's node data as shortcut
        $grip.grid = grid;
        $grip.i = th;
        $grip.$column = $column;
        $column.w = $column.width();

        $table.grips.push($grip);
        $table.$columns.push($column);			//the current grip and column are added to its table object
        $column.width($column.w).removeAttr("width");				//the width of the column is converted into pixel-based measurements
        $grip.data(SIGNATURE, { i: th, grid: grid, last: th == $table.ln - 1 });	 //grip index and its table name are stored in the HTML 												
    });

    $table.cg.removeAttr("width");	//remove the width attribute from elements in the colgroup 
    /*
    $table.find('td, th').not(allth).not('table th, table td').each(function () {
        $(this).removeAttr('width');	//the width attribute is removed from all table cells which are not nested in other tables and dont belong to the header
    });
    */
    if (!$table.f) {
        $table.removeAttr('width').addClass(FLEX); //if not fixed, let the table grow as needed
    }

    syncGrips(grid); 	//the grips are positioned according to the current table layout			
};


/**
 * Function that places each grip in the correct position according to the current table layout	 
 * @param {jQuery ref} t - table object
 */
var syncGrips = function (grid: uiMOD.DataGrid) {
    if (grid.getIsDestroyCalled())
        return;
    let $table: any = grid.$table;
    $table.$gripContainer.width($table.w);			//the grip's container width is updated				
    for (var i = 0; i < $table.ln; i++) {	//for each column
        var $column: JQuery = $table.$columns[i];
        let headerHeight = grid._getInternal().get$Header()[0].offsetHeight;
        let tableHeight = grid._getInternal().get$Wrapper()[0].offsetHeight;
        $table.grips[i].css({			//height and position of the grip is updated according to the table layout
            left: $column.offset().left - $table.offset().left + $column.outerWidth(false) + $table.cellspacing / 2 + PX,
            height: $table.opt.headerOnly ? headerHeight : (headerHeight + tableHeight)
        });
    }
    grid.updateColumnsSize();
};

/**
	* This function updates column's width according to the horizontal position increment of the grip being
	* dragged. The function can be called while dragging if liveDragging is enabled and also from the onGripDragOver
	* event handler to synchronize grip's position with their related columns.
	* @param {jQuery ref} t - table object
	* @param {number} i - index of the grip being dragged
	* @param {bool} isOver - to identify when the function is being called from the onGripDragOver event	
	*/
var syncCols = function (grid: uiMOD.DataGrid, i: number, isOver: boolean) {
    if (grid.getIsDestroyCalled())
        return;
    let $table: any = grid.$table;
    var inc = drag.x - drag.l, c = $table.$columns[i], c2 = $table.$columns[i + 1];
    var w = c.w + inc; var w2 = c2.w - inc;	//their new width is obtained					
    c.width(w + PX);
    $table.cg.eq(i).width(w + PX);
    if ($table.f) { //if fixed mode
        c2.width(w2 + PX);
        $table.cg.eq(i + 1).width(w2 + PX);
    } else if ($table.opt.overflow) {				//if overflow is set, incriment min-width to force overflow
        $table.css('min-width', $table.w + inc);
    }
    if (isOver) {
        c.w = w;
        c2.w = $table.f ? w2 : c2.w;
    }
};

/**
	* This function updates all columns width according to its real width. It must be taken into account that the 
	* sum of all columns can exceed the table width in some cases (if fixed is set to false and table has some kind 
	* of max-width).
	* @param {jQuery ref} t - table object	
*/
var applyBounds = function (grid: uiMOD.DataGrid) {
    if (grid.getIsDestroyCalled())
        return;
    let $table: any = grid.$table;
    var w = $.map($table.$columns, function (c) {			//obtain real widths
        return c.width();
    });
    $table.width($table.w = $table.width()).removeClass(FLEX);	//prevent table width changes
    $.each($table.$columns, function (i, c) {
        c.width(w[i]).w = w[i];				//set column widths applying bounds (table's max-width)
    });
    $table.addClass(FLEX);						//allow table width changes
};

/**
	 * Event handler used while dragging a grip. It checks if the next grip's position is valid and updates it. 
	 * @param {event} e - mousemove event binded to the window object
*/
var onGripDrag = function (e: any) {
    if (!drag) return;
    let grid: uiMOD.DataGrid = drag.grid;
    if (grid.getIsDestroyCalled())
        return;
    var $table: any = grid.$table;
    var oe = e.originalEvent.touches;
    var ox = oe ? oe[0].pageX : e.pageX;    //original position (touch or mouse)
    var x = ox - drag.ox + drag.l;	        //next position according to horizontal mouse position increment
    var mw = $table.opt.minWidth, i = drag.i;	//cell's min width
    var l = $table.cellspacing * 1.5 + mw + $table.b;
    var last = i == $table.ln - 1;                 			//check if it is the last column's grip (usually hidden)
    var min = i ? $table.grips[i - 1].position().left + $table.cellspacing + mw : l;	//min position according to the contiguous cells
    var max = $table.f ? 	//fixed mode?
        i == $table.ln - 1 ?
            $table.w - l :
            $table.grips[i + 1].position().left - $table.cellspacing - mw :
        Infinity; 								//max position according to the contiguous cells 
    x = Math.max(min, Math.min(max, x));				//apply bounding		
    drag.x = x; drag.css("left", x + PX); 	//apply position increment	
    if (last) {									//if it is the last grip
        var c = $table.$columns[drag.i];					//width of the last column is obtained
        drag.w = c.w + x - drag.l;
    }
    if ($table.opt.liveDrag) { 			//if liveDrag is enabled
        if (last) {
            c.width(drag.w);
            if (!$table.f && $table.opt.overflow) {			//if overflow is set, incriment min-width to force overflow
                $table.css('min-width', $table.w + x - drag.l);
            } else {
                $table.w = $table.width();
            }
        } else {
            syncCols(grid, i, false); 			//columns are synchronized
        }
        syncGrips(grid);
        var cb = $table.opt.onDrag;							//check if there is an onDrag callback
        if (cb) { e.currentTarget = $table[0]; cb(e); }		//if any, it is fired			
    }
    return false; 	//prevent text selection while dragging				
};


/**
 * Event handler fired when the dragging is over, updating table layout
 * @param {event} e - grip's drag over event
 */
var onGripDragOver = function (e: any) {
    d.unbind('touchend.' + SIGNATURE + ' mouseup.' + SIGNATURE).unbind('touchmove.' + SIGNATURE + ' mousemove.' + SIGNATURE);
    $("head :last-child").remove(); 				//remove the dragging cursor style	
    if (!drag) return;
    let grid: uiMOD.DataGrid = drag.grid;
    if (grid.getIsDestroyCalled())
        return;
    var $table: any = grid.$table;
    drag.removeClass($table.opt.draggingClass);		//remove the grip's dragging css-class

    if (!(drag.x - drag.l == 0)) {
        var cb = $table.opt.onResize; 	    //get some values	
        var i = drag.i;                 //column index
        var last = i == $table.ln - 1;         //check if it is the last column's grip (usually hidden)
        var c = $table.grips[i].$column;               //the column being dragged
        if (last) {
            c.width(drag.w);
            c.w = drag.w;
        } else {
            syncCols(grid, i, true);	//the columns are updated
        }
        if (!$table.f) applyBounds($table);	//if not fixed mode, then apply bounds to obtain real width values
        syncGrips(grid);				//the grips are updated
        if (cb) { e.currentTarget = $table[0]; cb(e); }	//if there is a callback function, it is fired
    }
    drag = null;   //since the grip's dragging is over									
};


/**
 * Event handler fired when the grip's dragging is about to start. Its main goal is to set up events 
 * and store some values used while dragging.
 * @param {event} e - grip's mousedown event
 */
var onGripMouseDown = function (e: any) {
    var o = $(this).data(SIGNATURE);
    let grid: uiMOD.DataGrid = o.grid;
    if (grid.getIsDestroyCalled())
        return;
    var $table: any = grid.$table, $grip = $table.grips[o.i];			//shortcuts for the table and grip objects
    var oe = e.originalEvent.touches;         //touch or mouse event?
    $grip.ox = oe ? oe[0].pageX : e.pageX;    //the initial position is kept
    $grip.l = $grip.position().left;
    $grip.x = $grip.l;

    d.bind('touchmove.' + SIGNATURE + ' mousemove.' + SIGNATURE, onGripDrag).bind('touchend.' + SIGNATURE + ' mouseup.' + SIGNATURE, onGripDragOver);	//mousemove and mouseup events are bound
    h.append("<style type='text/css'>*{cursor:" + $table.opt.dragCursor + "!important}</style>"); 	//change the mouse cursor
    $grip.addClass($table.opt.draggingClass); 	//add the dragging class (to allow some visual feedback)				

    drag = $grip; //the current grip is stored as the current dragging object
    if ($table.$columns[o.i].l) {
        for (var i = 0, c: any; i < $table.ln; i++)
        {
            c = $table.$columns[i];
            c.l = false;
            c.w = c.width();
        } 	//if the colum is locked (after browser resize), then c.w must be updated		
    }
    return false; 	//prevent text selection
};

var checkResize = function (grid: uiMOD.DataGrid) {
    if (grid.getIsDestroyCalled())
        return;

    var $table: any = grid.$table;
    var i: number, mw = 0;
    $table.removeClass(SIGNATURE);   //firefox doesn't like layout-fixed in some cases
    if ($table.f) {                  //in fixed mode
        $table.w = $table.width();        //its new width is kept
        for (i = 0; i < $table.ln; i++) mw += $table.$columns[i].w;
        //cell rendering is not as trivial as it might seem, and it is slightly different for
        //each browser. In the beginning i had a big switch for each browser, but since the code
        //was extremely ugly now I use a different approach with several re-flows. This works 
        //pretty well but it's a bit slower. For now, lets keep things simple...   
        for (i = 0; i < $table.ln; i++) $table.$columns[i].css("width", Math.round(1000 * $table.$columns[i].w / mw) / 10 + "%").l = true;
        //c.l locks the column, telling us that its c.w is outdated									
    } else {     //in non fixed-sized tables
        applyBounds(grid);         //apply the new bounds 
    }
    $table.addClass(SIGNATURE);
    syncGrips(grid);
};

/**
 * Event handler fired when the browser is resized. The main purpose of this function is to update
 * table layout according to the browser's size synchronizing related grips 
 */
var onResize = function () {
    RIAPP.Utils.core.iterateIndexer(_created_grids, (name, gridView) => {
        let grid = gridView.grid;
        checkResize(grid);
    });
};

export class ResizableGrid extends uiMOD.DataGridElView {
    private _ds: RIAPP.ICollection<RIAPP.ICollectionItem>;

    constructor(options: uiMOD.IDataGridViewOptions) {
        super(options);
        var self = this, grid = self.grid;
        _gridCreated(this);
        var defaults = {

            //attributes:

            resizeMode: 'fit',                    //mode can be 'fit', 'flex' or 'overflow'
            draggingClass: 'JCLRgripDrag',	//css-class used when a grip is being dragged (for visual feedback purposes)
            gripInnerHtml: '',				//if it is required to use a custom grip it can be done using some custom HTML				
            liveDrag: false,				//enables table-layout updating while dragging	
            minWidth: 15, 					//minimum width value in pixels allowed for a column 
            headerOnly: false,				//specifies that the size of the the column resizing anchors will be bounded to the size of the first row 
            hoverCursor: "e-resize",  		//cursor to be used on grip hover
            dragCursor: "e-resize",  		//cursor to be used while dragging
            postbackSafe: false, 			//when it is enabled, table layout can persist after postback or page refresh. It requires browsers with sessionStorage support (it can be emulated with sessionStorage.js). 
            flush: false, 					//when postbakSafe is enabled, and it is required to prevent layout restoration after postback, 'flush' will remove its associated layout data 
            marginLeft: <string>null,				//in case the table contains any margins, colResizable needs to know the values used, e.grip. "10%", "15em", "5px" ...
            marginRight: <string>null, 				//in case the table contains any margins, colResizable needs to know the values used, e.grip. "10%", "15em", "5px" ...
            disable: false,					//disables all the enhancements performed in a previously colResized table	
            partialRefresh: false,			//can be used in combination with postbackSafe when the table is inside of an updatePanel,
            disabledColumns: <any[]>[],            //column indexes to be excluded

            //events:
            onDrag: <any>null, 				//callback function to be fired during the column resizing process if liveDrag is enabled
            onResize: <any>null				//callback function fired when the dragging process is over
        }
        var opts = $.extend(defaults, options);

        //since now there are 3 different ways of resizing columns, I changed the external interface to make it clear
        //calling it 'resizeMode' but also to remove the "fixed" attribute which was confusing for many people
        opts.fixed = true;
        opts.overflow = false;
        switch (opts.resizeMode) {
            case 'flex': opts.fixed = false; break;
            case 'overflow': opts.fixed = false; opts.overflow = true; break;
        }
        this._ds = grid.dataSource;
        init(grid, opts);
        self.bindDS(grid.dataSource);

        grid.addOnPropertyChange("dataSource", (s, a) => {
            self.unBindDS(self._ds);
            self.bindDS(grid.dataSource);
            self._ds = grid.dataSource;
        }, this.uniqueID);
        setTimeout(() => { checkResize(grid); }, 0);
    }
    private bindDS(ds: RIAPP.ICollection<RIAPP.ICollectionItem>) {
        if (!ds)
            return;
        var self = this;
        ds.addOnCleared((s, a) => { setTimeout(() => { syncGrips(self.grid); }, 0); }, this.uniqueID);
        ds.addOnFill((s, a) => {
            setTimeout(() => { syncGrips(self.grid); }, 0);
        }, this.uniqueID);
    }
    private unBindDS(ds: RIAPP.ICollection<RIAPP.ICollectionItem>) {
        if (!ds)
            return;
        ds.removeNSHandlers(this.uniqueID);
    }

    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        _gridDestroyed(this);
        super.destroy();
    }
}

export function initModule(app: RIAPP.Application) {
    app.registerElView('resizable_grid', ResizableGrid);
}