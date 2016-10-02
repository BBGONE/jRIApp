/// <reference path="../jriapp/jriapp.d.ts" />
import * as RIAPP from "jriapp";
import * as dbMOD from "jriapp_db";
import * as uiMOD from "jriapp_ui";
import * as COMMON from "./common";

let bootstrap = RIAPP.bootstrap, utils = RIAPP.Utils, $ = utils.dom.$;

let $doc = $(utils.dom.document); 	//window object
let $head = $("head");			//head object
let $drag: JQuery = null;		//reference to the current grip that is being dragged

//common strings for packing
let ID = "id";
let PX = "px";
let SIGNATURE = "JColResizer";
let FLEX = "JCLRFlex";

interface ITableData {
    options: any;
    mode: string;
    dc: number[];
    fixed: boolean;
    w: number;
    $gripContainer: JQuery;
    cellspacing: number;
    borderW: number;
    len: number;
    columns: IColumnData[];
}

interface IColumnData {
    $column: JQuery;
    $grip: JQuery;
    w: number;
    locked: boolean;
}

interface IGripData {
    i: number;
    grid: uiMOD.DataGrid;
    last: boolean;
    w: number;
    ox: number;
    x: number;
    l: number;
}

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
$head.append("<style type='text/css'>  .JColResizer{table-layout:fixed;} .JCLRgrips{ height:0px; position:relative;} .JCLRgrip{margin-left:-5px; position:absolute; z-index:5; } .JCLRgrip .JColResizer{position:absolute;background-color:red;filter:alpha(opacity=1);opacity:0;width:10px;height:100%;cursor: e-resize;top:0px} .JCLRLastGrip{position:absolute; width:1px; } .JCLRgripDrag{ border-left:1px dotted black;	} .JCLRFlex{width:auto!important;} .JCLRgrip.JCLRdisabledGrip .JColResizer{cursor:default; display:none;}</style>");

let init = function (grid: uiMOD.DataGrid, options: any) {
    let $table: JQuery = grid.$table;
    let tb: HTMLTableElement = <any>$table[0];
    let style = window.getComputedStyle(tb, null);

    if (options.hoverCursor !== 'e-resize')
        $head.append("<style type='text/css'>.JCLRgrip .JColResizer:hover{cursor:" + options.hoverCursor + "!important}</style>"); 

    //the grips container object is added. Signature class forces table rendering in fixed-layout mode to prevent column's min-width
    $table.addClass(SIGNATURE);
    let $gripContainer = $('<div class="JCLRgrips"/>');
    grid._getInternal().get$Header().before($gripContainer);

    let data: ITableData = {
        options: options,
        mode: options.resizeMode,
        dc: options.disabledColumns,
        fixed: options.fixed,
        columns: [],
        w: $table.width(),
        $gripContainer: $gripContainer,
        cellspacing: parseInt(style.borderSpacing) || 2,
        borderW: parseInt(style.borderLeftWidth) || 1,
        len: 0
    };

    $table.data(SIGNATURE, data);
    				
    if (options.marginLeft) $gripContainer.css("marginLeft", options.marginLeft);  	//if the table contains margins, it must be specified
    if (options.marginRight) $gripContainer.css("marginRight", options.marginRight);  	//since there is no (direct) way to obtain margin values in its original units (%, em, ...)

    createGrips(grid);	//grips are created 
};

let destroy = function (grid: uiMOD.DataGrid) {
    let $table: JQuery = grid.$table;
    let data: ITableData = $table.data(SIGNATURE);
    if (!!data)
        data.$gripContainer.remove();	//class and grips are removed
    $table.removeData(SIGNATURE);
    $table.removeClass(SIGNATURE + " " + FLEX);
};

let createGrips = function (grid: uiMOD.DataGrid) {
    let $table: JQuery = grid.$table;
    let $allTH = $(grid._tHeadCells);
    $allTH = $allTH.filter(":visible");	
    let data: ITableData = $table.data(SIGNATURE);
    data.len = $allTH.length;	//table length is stored	

    $allTH.each(function (index: number) {	//iterate through the table column headers			
        let $column: JQuery = $(this); //jquery wrap for the current column		
        let isDisabled: boolean = data.dc.indexOf(index) != -1;   //is this a disabled column?
        let $grip: JQuery = $(data.$gripContainer.append('<div class="JCLRgrip"></div>')[0].lastChild); //add the visual node to be used as grip

        $grip.append(isDisabled ? "" : data.options.gripInnerHtml).append('<div class="' + SIGNATURE + '"></div>');
        if (index == data.len - 1) {  //if the current grip is the last one 
            $grip.addClass("JCLRLastGrip");    //add a different css class to stlye it in a different way if needed
            if (data.fixed)
                $grip.html("");   //if the table resizing mode is set to fixed, the last grip is removed since table with can not change
        }

        $grip.bind('touchstart mousedown', onGripMouseDown); //bind the mousedown event to start dragging 

        if (!isDisabled) {
            //if normal column bind the mousedown event to start dragging, if disabled then apply its css class
            $grip.removeClass('JCLRdisabledGrip').bind('touchstart mousedown', onGripMouseDown);
        } else {
            $grip.addClass('JCLRdisabledGrip');
        }

        let colInfo: IColumnData = { $column: $column, $grip: $grip, w: $column.width(), locked: false };
        //the current grip and column are added to its table object
        data.columns.push(colInfo);
        //the width of the column is converted into pixel-based measurements
        $column.width(colInfo.w).removeAttr("width");
        //grip index and its the grid are stored
        $grip.data(SIGNATURE, { i: index, grid: grid, last: index == data.len - 1, ox: 0, x:0, l:0, w:0 });
    });

     if (!data.fixed) {
        $table.removeAttr('width').addClass(FLEX); //if not fixed, let the table grow as needed
    }

    syncGrips(grid); 	//the grips are positioned according to the current table layout			
};


/**
 * Function that places each grip in the correct position according to the current table layout	 
*/
let syncGrips = function (grid: uiMOD.DataGrid) {
    if (grid.getIsDestroyCalled())
        return;
    let $table: JQuery = grid.$table;
    let data: ITableData = $table.data(SIGNATURE);
    data.$gripContainer.width(data.w);	//the grip's container width is updated

    for (let i = 0; i < data.len; i++) {	//for each column
        let colInfo = data.columns[i];
        let headerHeight = grid._getInternal().get$Header()[0].offsetHeight;
        let tableHeight = grid._getInternal().get$Wrapper()[0].offsetHeight;
        colInfo.$grip.css({			//height and position of the grip is updated according to the table layout
            left: colInfo.$column.offset().left - $table.offset().left + colInfo.$column.outerWidth(false) + data.cellspacing / 2 + PX,
            height: data.options.headerOnly ? headerHeight : (headerHeight + tableHeight)
        });
    }

    grid.updateColumnsSize();
};

/**
	* This function updates column's width according to the horizontal position increment of the grip being
	* dragged. The function can be called while dragging if liveDragging is enabled and also from the onGripDragOver
	* event handler to synchronize grip's position with their related columns.
	* @param {grid ref} grid - data grid object
	* @param {number} i - index of the grip being dragged
	* @param {bool} isOver - to identify when the function is being called from the onGripDragOver event	
*/
let syncCols = function (grid: uiMOD.DataGrid, i: number, isOver: boolean) {
    if (grid.getIsDestroyCalled())
        return;
    let $table: JQuery = grid.$table;
    let data: ITableData = $table.data(SIGNATURE);
    let gripData: IGripData = $drag.data(SIGNATURE);
    const inc = gripData.x - gripData.l;
    const c: IColumnData = data.columns[i], c2: IColumnData = data.columns[i + 1];

    const w = c.w + inc;
    const w2 = c2.w - inc;	//their new width is obtained	

    c.$column.width(w + PX);
    if (data.fixed) { //if fixed mode
        c2.$column.width(w2 + PX);
    }
    else if (data.options.overflow) {	//if overflow is set, incriment min-width to force overflow
        $table.css('min-width', data.w + inc);
    }

    if (isOver) {
        c.w = w;
        c2.w = data.fixed ? w2 : c2.w;
    }
};

/**
	* This function updates all columns width according to its real width. It must be taken into account that the 
	* sum of all columns can exceed the table width in some cases (if fixed is set to false and table has some kind 
	* of max-width).
*/
let applyBounds = function (grid: uiMOD.DataGrid) {
    if (grid.getIsDestroyCalled())
        return;
    let $table: JQuery = grid.$table;
    let data: ITableData = $table.data(SIGNATURE);

    const widths = $.map(data.columns, function (c) {			//obtain real widths
        return c.$column.width();
    });

    $table.width(data.w = $table.width()).removeClass(FLEX);	//prevent table width changes
    $.each(data.columns, function (i, c) {
        c.$column.width(widths[i]);
        c.w = widths[i];	//set column widths applying bounds (table's max-width)
    });

    $table.addClass(FLEX);	//allow table width changes
};

/**
	 * Event handler used while dragging a grip. It checks if the next grip's position is valid and updates it. 
*/
let onGripDrag = function (e: JQueryEventObject) {
    if (!$drag)
        return;
    let gripData: IGripData = $drag.data(SIGNATURE);
    let grid: uiMOD.DataGrid = gripData.grid;
    if (grid.getIsDestroyCalled())
        return;
    let $table: JQuery = grid.$table;
    let data: ITableData = $table.data(SIGNATURE);
    let oe = (<any>e.originalEvent).touches;
    let ox = oe ? oe[0].pageX : e.pageX;    //original position (touch or mouse)
    let x = ox - gripData.ox + gripData.l;	//next position according to horizontal mouse position increment
    let mw = data.options.minWidth; //cell's min width
    const index = gripData.i;
    const colInfo = data.columns[index];

    let l: number = data.cellspacing * 1.5 + mw + data.borderW;
    let last = index == data.len - 1;  //check if it is the last column's grip (usually hidden)
    let min = (!!colInfo) ? data.columns[index - 1].$grip.position().left + data.cellspacing + mw : l;	//min position according to the contiguous cells
    let max = data.fixed ?
        (index == data.len - 1 ?
            (data.w - l) :
            (data.columns[index + 1].$grip.position().left - data.cellspacing - mw)) :  Infinity; 	//max position according to the contiguous cells 
    x = Math.max(min, Math.min(max, x));	//apply bounding		
    gripData.x = x;
    $drag.css("left", x + PX); 	//apply position increment	
    if (last) {	//if it is the last grip
        gripData.w = colInfo.w + x - gripData.l;
    }

    if (!!data.options.liveDrag) { 	//if liveDrag is enabled
        if (last) {
            colInfo.$column.width(gripData.w);
            if (!data.fixed && data.options.overflow) {	//if overflow is set, incriment min-width to force overflow
                $table.css('min-width', data.w + x - gripData.l);
            } else {
                data.w = $table.width();
            }
        } else {
            syncCols(grid, index, false); //columns are synchronized
        }

        syncGrips(grid);
        let cb = data.options.onDrag;	//check if there is an onDrag callback
        if (!!cb) { (<any>e).currentTarget = $table[0]; cb(e); }		//if any, it is fired			
    }
    return false; 	//prevent text selection while dragging				
};


/**
 * Event handler fired when the dragging is over, updating table layout
*/
let onGripDragOver = function (e: JQueryEventObject) {
    $doc.unbind('touchend.' + SIGNATURE + ' mouseup.' + SIGNATURE).unbind('touchmove.' + SIGNATURE + ' mousemove.' + SIGNATURE);
    $head.find('#dragCursor').remove();
    if (!$drag)
        return;
    let gripData: IGripData = $drag.data(SIGNATURE);
    let grid: uiMOD.DataGrid = gripData.grid;
    if (grid.getIsDestroyCalled())
        return;
    let $table: JQuery = grid.$table;
    let data: ITableData = $table.data(SIGNATURE);
    $drag.removeClass(data.options.draggingClass);	//remove the grip's dragging css-class

    if (!(gripData.x - gripData.l == 0)) {
        let cb = data.options.onResize; //get some values	
        let index = gripData.i;   //column index
        let last = index == data.len - 1;   //check if it is the last column's grip (usually hidden)
        let colInfo = data.columns[index];  //the column being dragged
        if (last) {
            colInfo.$column.width(gripData.w);
            colInfo.w = gripData.w;
        } else {
            syncCols(grid, index, true);	//the columns are updated
        }
        if (!data.fixed)
            applyBounds(grid);	//if not fixed mode, then apply bounds to obtain real width values
        syncGrips(grid);	//the grips are updated
        if (!!cb) { (<any>e).currentTarget = $table[0]; cb(e); }	//if there is a callback function, it is fired
    }

    $drag = null;   //since the grip's dragging is over									
};


/**
 * Event handler fired when the grip's dragging is about to start. Its main goal is to set up events 
 * and store some values used while dragging.
 */
let onGripMouseDown = function (e: JQueryEventObject) {
    let $grip = $(this);
    let gripData: IGripData = $grip.data(SIGNATURE);
    let grid: uiMOD.DataGrid = gripData.grid;
    if (grid.getIsDestroyCalled())
        return;
    let $table: JQuery = grid.$table;
    let data: ITableData = $table.data(SIGNATURE);
    let touches = (<any>e.originalEvent).touches;   //touch or mouse event?
    gripData.ox = touches ? touches[0].pageX : e.pageX;    //the initial position is kept
    gripData.l = $grip.position().left;
    gripData.x = gripData.l;
    //mousemove and mouseup events are bound
    $doc.bind('touchmove.' + SIGNATURE + ' mousemove.' + SIGNATURE, onGripDrag);
    $doc.bind('touchend.' + SIGNATURE + ' mouseup.' + SIGNATURE, onGripDragOver);
    //change the mouse cursor
    if ($head.find('#dragCursor').length == 0)
        $head.append("<style id='dragCursor' type='text/css'>*{cursor:" + data.options.dragCursor + "!important}</style>");
    $grip.addClass(data.options.draggingClass); 	//add the dragging class (to allow some visual feedback)				

    $drag = $grip; //the current grip is stored as the current dragging object
    let gripCol = data.columns[gripData.i];
    if (gripCol.locked) {
        for (let i = 0; i < data.len; i++)
        {
            //if the colum is locked (after browser resize), then c.w must be updated		
            let c = data.columns[i];
            c.locked = false;
            c.w = c.$column.width();
        } 	
    }
    return false; 	//prevent text selection
};

let checkResize = function (grid: uiMOD.DataGrid) {
    if (grid.getIsDestroyCalled())
        return;

    let $table: JQuery = grid.$table;
    let data: ITableData = $table.data(SIGNATURE);
    let mw = 0;
    $table.removeClass(SIGNATURE);   //firefox doesn't like layout-fixed in some cases

    if (data.fixed) {                  //in fixed mode
        data.w = $table.width();        //its new width is kept
        for (let i = 0; i < data.len; i++)
            mw += data.columns[i].w;

        //cell rendering is not as trivial as it might seem, and it is slightly different for
        //each browser. In the beginning i had a big switch for each browser, but since the code
        //was extremely ugly now I use a different approach with several re-flows. This works 
        //pretty well but it's a bit slower. For now, lets keep things simple...   
        for (let i = 0; i < data.len; i++) {
            let col = data.columns[i];
            col.$column.css("width", Math.round(1000 * (<any>col).w / mw) / 10 + "%");
            //col.locked locks the column, telling us that its c.w is outdated									
            col.locked = true;
        }
    } else {     //in non fixed-sized tables
        applyBounds(grid);  //apply the new bounds 
    }

    $table.addClass(SIGNATURE);
    syncGrips(grid);
};

/**
 * Event handler fired when the browser is resized. The main purpose of this function is to update
 * table layout according to the browser's size synchronizing related grips 
 */
let onResize = function () {
    RIAPP.Utils.core.iterateIndexer(_created_grids, (name, gridView) => {
        let grid = gridView.grid;
        checkResize(grid);
    });
};

export class ResizableGrid extends uiMOD.DataGridElView {
    private _ds: RIAPP.ICollection<RIAPP.ICollectionItem>;

    constructor(options: uiMOD.IDataGridViewOptions) {
        super(options);
        let self = this, grid = self.grid;
        _gridCreated(this);
        let defaults = {
            resizeMode: 'fit',                    //mode can be 'fit', 'flex' or 'overflow'
            draggingClass: 'JCLRgripDrag',	//css-class used when a grip is being dragged (for visual feedback purposes)
            gripInnerHtml: '',				//if it is required to use a custom grip it can be done using some custom HTML				
            liveDrag: false,				//enables table-layout updating while dragging	
            minWidth: 15, 					//minimum width value in pixels allowed for a column 
            headerOnly: false,				//specifies that the size of the the column resizing anchors will be bounded to the size of the first row 
            hoverCursor: "e-resize",  		//cursor to be used on grip hover
            dragCursor: "e-resize",  		//cursor to be used while dragging
            flush: false, 					//when postbakSafe is enabled, and it is required to prevent layout restoration after postback, 'flush' will remove its associated layout data 
            marginLeft: <string>null,				//in case the table contains any margins, colResizable needs to know the values used, e.grip. "10%", "15em", "5px" ...
            marginRight: <string>null, 				//in case the table contains any margins, colResizable needs to know the values used, e.grip. "10%", "15em", "5px" ...
            disable: false,					//disables all the enhancements performed in a previously colResized table	
            partialRefresh: false,			//can be used in combination with postbackSafe when the table is inside of an updatePanel,
            disabledColumns: <any[]>[],     //column indexes to be excluded

            //events:
            onDrag: <(e: JQueryEventObject) => void>null, //callback function to be fired during the column resizing process if liveDrag is enabled
            onResize: <(e: JQueryEventObject) => void>null				//callback function fired when the dragging process is over
        }

        let opts = $.extend(defaults, options);

        //since now there are 3 different ways of resizing columns, I changed the external interface to make it clear
        //calling it 'resizeMode' but also to remove the "fixed" attribute which was confusing for many people
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
        let self = this;
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
        this.unBindDS(this._ds);
        this._ds = null;
        super.destroy();
    }
}

export function initModule(app: RIAPP.Application) {
    app.registerElView('resizable_grid', ResizableGrid);
}