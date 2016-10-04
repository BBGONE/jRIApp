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

interface IResizeInfo {
    options: IOptions;
    mode: string;
    dc: number[];
    fixed: boolean;
    overflow: boolean;
    w: number;
    $gripContainer: JQuery;
    cellspacing: number;
    borderW: number;
    len: number;
    columns: IColumnInfo[];
}

interface IColumnInfo {
    $column: JQuery;
    $grip: JQuery;
    w: number;
    locked: boolean;
}

interface IGripData {
    i: number;
    grid: ResizableGrid;
    last: boolean;
    w: number;
    ox: number; //original x
    x: number; // x
    l: number; //left
}

interface IOptions {
    resizeMode: 'fit' | 'flex' | 'overflow';
    draggingClass: string;
    gripInnerHtml: string;
    liveDrag: boolean;
    minWidth: number;
    headerOnly: boolean;
    //hoverCursor: string;
    dragCursor: string;
    marginLeft: string;
    marginRight: string;
    disabledColumns: number[];  //column indexes to be excluded
    //events:
    onDrag: (e: JQueryEventObject) => void; //callback function to be fired during the column resizing process if liveDrag is enabled
    onResize: (e: JQueryEventObject) => void;	//callback function fired when the dragging process is over
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
}

//append required CSS rules  
$head.append("<style type='text/css'>  .JColResizer{table-layout:fixed;} .JCLRgrips{ height:0px; position:relative;} .JCLRgrip{margin-left:-5px; position:absolute; z-index:5; } .JCLRgrip .JColResizer{position:absolute;background-color:red;filter:alpha(opacity=1);opacity:0;width:10px;height:100%;cursor: e-resize;top:0px} .JCLRLastGrip{position:absolute; width:1px; } .JCLRgripDrag{ border-left:1px dotted black;	} .JCLRFlex{width:auto!important;} .JCLRgrip.JCLRdisabledGrip .JColResizer{cursor:default; display:none;}</style>");


/**
	 * Event handler used while dragging a grip. It checks if the next grip's position is valid and updates it. 
*/
let onGripDrag = function (e: JQueryEventObject) {
    if (!$drag)
        return;
    let gripData: IGripData = $drag.data(SIGNATURE);
    let grid: ResizableGrid = gripData.grid;
    if (grid.getIsDestroyCalled())
        return;
    let data: IResizeInfo = grid.getResizeIfo();
    let $table: JQuery = grid.grid.$table;
    let oe = (<any>e.originalEvent).touches;
    //original position (touch or mouse)
    let ox = oe ? oe[0].pageX : e.pageX;
    //next position according to horizontal mouse position increment
    let x = ox - gripData.ox + gripData.l;	
    let mw = data.options.minWidth; //cell's min width
    const index = gripData.i;
    const colInfo = data.columns[index];

    let l: number = data.cellspacing * 1.5 + mw + data.borderW;
    let last = index == data.len - 1;  //check if it is the last column's grip (usually hidden)
    //min position according to the contiguous cells
    let min = (index > 0) ? data.columns[index - 1].$grip.position().left + data.cellspacing + mw : l;	
    //max position according to the contiguous cells 
    let max = Infinity;
    if (data.fixed) {
        if (index == data.len - 1) {
            max = data.w - l;
        }
        else {
            max = data.columns[index + 1].$grip.position().left - data.cellspacing - mw;
        }
    }

    x = Math.max(min, Math.min(max, x));	//apply bounding		
    gripData.x = x;
    $drag.css("left", x + PX); 	//apply position increment	
    if (last) {	//if it is the last grip
        gripData.w = colInfo.w + x - gripData.l;
    }

    if (!!data.options.liveDrag) { 	//if liveDrag is enabled
        if (last) {
            colInfo.$column.width(gripData.w);
            if (!data.fixed && data.overflow) {	//if overflow is set, incriment min-width to force overflow
                $table.css('min-width', data.w + x - gripData.l);
            } else {
                data.w = $table.width();
            }
        } else {
            grid.syncCols(index, false); //columns are synchronized
        }

        grid.syncGrips();
        let cb = data.options.onDrag;	//check if there is an onDrag callback
        if (!!cb) { (<any>e).currentTarget = $table[0]; cb(e); }		//if any, it is fired			
    }
    return false; 	//prevent text selection while dragging				
};


/**
 * Event handler fired when the dragging is over, updating table layout
*/
let onGripDragOver = function (e: JQueryEventObject) {
    $doc.off('touchend.' + SIGNATURE + ' mouseup.' + SIGNATURE);
    $doc.off('touchmove.' + SIGNATURE + ' mousemove.' + SIGNATURE);
    $head.find('#dragCursor').remove();
    if (!$drag)
        return;
    let gripData: IGripData = $drag.data(SIGNATURE);
    let grid: ResizableGrid = gripData.grid;
    if (grid.getIsDestroyCalled())
        return;
    let data: IResizeInfo = grid.getResizeIfo();
    let $table: JQuery = grid.grid.$table;
    //remove the grip's dragging css-class
    $drag.removeClass(data.options.draggingClass);

    if (!!(gripData.x - gripData.l)) {
        let cb = data.options.onResize; //get some values	
        let index = gripData.i;   //column index
        let last = index == data.len - 1;   //check if it is the last column's grip (usually hidden)
        let colInfo = data.columns[index];  //the column being dragged
        if (last) {
            colInfo.$column.width(gripData.w);
            colInfo.w = gripData.w;
        } else {
            grid.syncCols(index, true);	//the columns are updated
        }
        if (data.overflow)
            grid.applyBounds();
        grid.syncGrips();	//the grips are updated
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
    let grid: ResizableGrid = gripData.grid;
    if (grid.getIsDestroyCalled())
        return;
    let data: IResizeInfo = grid.getResizeIfo();
    let $table: JQuery = grid.grid.$table;
    let touches = (<any>e.originalEvent).touches;   //touch or mouse event?
    gripData.ox = touches ? touches[0].pageX : e.pageX;    //the initial position is kept
    gripData.l = $grip.position().left;
    gripData.x = gripData.l;
    //mousemove and mouseup events are bound
    $doc.on('touchmove.' + SIGNATURE + ' mousemove.' + SIGNATURE, onGripDrag);
    $doc.on('touchend.' + SIGNATURE + ' mouseup.' + SIGNATURE, onGripDragOver);
    //change the mouse cursor
    if ($head.find('#dragCursor').length == 0)
        $head.append("<style id='dragCursor' type='text/css'>*{cursor:" + data.options.dragCursor + "!important}</style>");

    $grip.addClass(data.options.draggingClass);

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

/**
 * Event handler fired when the browser is resized. The main purpose of this function is to update
 * table layout according to the browser's size synchronizing related grips 
 */
let onResize = function () {
    RIAPP.Utils.core.iterateIndexer(_created_grids, (name, gridView) => {
        gridView.checkResize();
    });
};

export class ResizableGrid extends uiMOD.DataGridElView {
    private _ds: RIAPP.ICollection<RIAPP.ICollectionItem>;
    private _resizeInfo: IResizeInfo;

    constructor(options: uiMOD.IDataGridViewOptions) {
        super(options);
        let self = this, grid = self.grid;
        _gridCreated(this);
        let defaults: IOptions = {
            resizeMode: <'fit' | 'flex' | 'overflow'>'overflow',  //mode can be 'fit', 'flex' or 'overflow'
            draggingClass: 'JCLRgripDrag',	//css-class used when a grip is being dragged (for visual feedback purposes)
            gripInnerHtml: '',				//if it is required to use a custom grip it can be done using some custom HTML				
            liveDrag: false,				//enables table-layout updating while dragging	
            minWidth: 15, 					//minimum width value in pixels allowed for a column 
            headerOnly: false,				//specifies that the size of the the column resizing anchors will be bounded to the size of the first row 
            //hoverCursor: "e-resize",  		//cursor to be used on grip hover
            dragCursor: "e-resize",  		//cursor to be used while dragging
            marginLeft: <string>null,		//in case the table contains any margins, colResizable needs to know the values used, e.grip. "10%", "15em", "5px" ...
            marginRight: <string>null, 		//in case the table contains any margins, colResizable needs to know the values used, e.grip. "10%", "15em", "5px" ...
            disabledColumns: <number[]>[],  //column indexes to be excluded
            //events:
            onDrag: <(e: JQueryEventObject) => void>null, //callback function to be fired during the column resizing process if liveDrag is enabled
            onResize: <(e: JQueryEventObject) => void>null	//callback function fired when the dragging process is over
        }

        this._resizeInfo = null;
        this._ds = grid.dataSource;

        let opts: IOptions = <IOptions>utils.core.extend(defaults, options);
        self.init(opts);
        self.bindDS(this._ds);

        grid.addOnPropertyChange("dataSource", (s, a) => {
            self.unBindDS(self._ds);
            self.bindDS(grid.dataSource);
            self._ds = grid.dataSource;
        }, this.uniqueID);
        setTimeout(() => { self.checkResize(); }, 0);
    }
    private bindDS(ds: RIAPP.ICollection<RIAPP.ICollectionItem>) {
        if (!ds)
            return;
        let self = this;
        ds.addOnCleared((s, a) => { setTimeout(() => { self.syncGrips(); }, 0); }, this.uniqueID);
        ds.addOnFill((s, a) => {
            setTimeout(() => { self.syncGrips(); }, 0);
        }, this.uniqueID);
    }
    private unBindDS(ds: RIAPP.ICollection<RIAPP.ICollectionItem>) {
        if (!ds)
            return;
        ds.removeNSHandlers(this.uniqueID);
    }
    protected init(options: IOptions) {
        const $table: JQuery = this.grid.$table;
        let style = window.getComputedStyle($table[0], null);

         /*
        if (options.hoverCursor !== 'e-resize') {
            $head.append("<style id='' type='text/css'>.JCLRgrip .JColResizer:hover{cursor:" + options.hoverCursor + "!important}</style>");
        }
        */

        //the grips container object is added. 
        //Signature class forces table rendering in fixed - layout mode to prevent column's min-width
        $table.addClass(SIGNATURE);
        let $gripContainer = $('<div class="JCLRgrips"/>');
        this.grid._getInternal().get$Header().before($gripContainer);

        this._resizeInfo = {
            options: options,
            mode: options.resizeMode,
            dc: options.disabledColumns,
            fixed: true,
            overflow: false,
            columns: <IColumnInfo[]>[],
            w: $table.width(),
            $gripContainer: $gripContainer,
            cellspacing: parseInt(style.borderSpacing) || 2,
            borderW: parseInt(style.borderLeftWidth) || 1,
            len: 0
        };

        switch (options.resizeMode) {
            case 'flex':
                this._resizeInfo.fixed = false;
                break;
            case 'overflow':
                this._resizeInfo.fixed = false;
                this._resizeInfo.overflow = true;
                break;
        }
        if (options.marginLeft) $gripContainer.css("marginLeft", options.marginLeft);  	//if the table contains margins, it must be specified
        if (options.marginRight) $gripContainer.css("marginRight", options.marginRight);  	//since there is no (direct) way to obtain margin values in its original units (%, em, ...)

        this.createGrips();	 
    }
    protected createGrips() {
        const $table: JQuery = this.grid.$table, self = this;
        const $allTH = $(this.grid._tHeadCells).filter(":visible")
        const data: IResizeInfo = this._resizeInfo;
        data.len = $allTH.length;	//table length is stored	

        $allTH.each(function (index: number) {	//iterate through the table column headers			
            let $column: JQuery = $(this); //jquery wrap for the current column		
            let isDisabled: boolean = data.dc.indexOf(index) != -1;   //is this a disabled column?
            //add the visual node to be used as grip
            let $grip: JQuery = $(data.$gripContainer.append('<div class="JCLRgrip"></div>')[0].lastChild);

            $grip.append(isDisabled ? "" : data.options.gripInnerHtml).append('<div class="' + SIGNATURE + '"></div>');
            if (index == data.len - 1) {  //if the current grip is the last one 
                $grip.addClass("JCLRLastGrip");    //add a different css class to stlye it in a different way if needed
                if (data.fixed)
                    $grip.empty();   //if the table resizing mode is set to fixed, the last grip is removed since table width can not change
            }

            $grip.on('touchstart mousedown', onGripMouseDown); //bind the mousedown event to start dragging 

            if (!isDisabled) {
                //if normal column bind the mousedown event to start dragging, if disabled then apply its css class
                $grip.removeClass('JCLRdisabledGrip').bind('touchstart mousedown', onGripMouseDown);
            } else {
                $grip.addClass('JCLRdisabledGrip');
            }

            let colInfo: IColumnInfo = { $column: $column, $grip: $grip, w: $column.width(), locked: false };
            //the current grip and column are added to its table object
            data.columns.push(colInfo);
            //the width of the column is converted into pixel-based measurements
            $column.width(colInfo.w).removeAttr("width");
            //grip index and its the grid are stored
            const gripData: IGripData = { i: index, grid: self, last: index == data.len - 1, ox: 0, x: 0, l: 0, w: 0 };
            $grip.data(SIGNATURE, gripData);
        });

        if (!data.fixed) {
            $table.removeAttr('width').addClass(FLEX); //if not fixed, let the table grow as needed
        }
        //the grips are positioned according to the current table layout
        this.syncGrips();			
    }
    /**
       * Function that places each grip in the correct position according to the current table layout	 
    */
    syncGrips() {
        if (this.getIsDestroyCalled())
            return;
        const $table: JQuery = this.grid.$table;
        const data: IResizeInfo = this._resizeInfo;
        data.$gripContainer.width(data.w);	//the grip's container width is updated

        for (let i = 0; i < data.len; i++) {	//for each column
            let colInfo = data.columns[i];
            let headerHeight = this.grid._getInternal().get$Header()[0].offsetHeight;
            let tableHeight = this.grid._getInternal().get$Wrapper()[0].offsetHeight;
            //height and position of the grip is updated according to the table layout
            colInfo.$grip.css({
                left: colInfo.$column.offset().left - $table.offset().left + colInfo.$column.outerWidth(false) + data.cellspacing / 2 + PX,
                height: data.options.headerOnly ? headerHeight : (headerHeight + tableHeight)
            });
        }

        this.grid.updateColumnsSize();
    }
    /**
	* This function updates column's width according to the horizontal position increment of the grip being
	* dragged. The function can be called while dragging if liveDragging is enabled and also from the onGripDragOver
	* event handler to synchronize grip's position with their related columns.
	* @param {number} i - index of the grip being dragged
	* @param {bool} isOver - to identify when the function is being called from the onGripDragOver event	
    */
    syncCols(i: number, isOver: boolean) {
        if (this.getIsDestroyCalled())
            return;
        const $table: JQuery = this.grid.$table;
        const data: IResizeInfo = this._resizeInfo;
        const gripData: IGripData = $drag.data(SIGNATURE);
        const inc = gripData.x - gripData.l;
        const c: IColumnInfo = data.columns[i];
  
        if (data.fixed) { //if fixed mode
            const c2: IColumnInfo = data.columns[i + 1];
            const w2 = c2.w - inc;	
            c2.$column.width(w2 + PX);
            if (isOver) {
               c2.w = w2;
            }
        }
        else if (data.overflow) {	//if overflow is set, incriment min-width to force overflow
            $table.css('min-width', data.w + inc);
        }
        
        const w = c.w + inc;
        c.$column.width(w + PX);
        if (isOver) {
            c.w = w;
        }
    }
    /**
	* This function updates all columns width according to its real width. It must be taken into account that the 
	* sum of all columns can exceed the table width in some cases (if fixed is set to false and table has some kind 
	* of max-width).
    */
    applyBounds() {
        if (this.getIsDestroyCalled())
            return;
        const $table: JQuery = this.grid.$table;
        const data: IResizeInfo = this._resizeInfo;
        const widths = $.map(data.columns, function (c) {			//obtain real widths
            return c.$column.width();
        });

        data.w = $table.width();
        $table.width(data.w);
        $table.removeClass(FLEX);	//prevent table width changes

        $.each(data.columns, function (i, c) {
            c.$column.width(widths[i]);
            c.w = widths[i];	//set column widths applying bounds (table's max-width)
        });

        $table.addClass(FLEX);	//allow table width changes

        this.grid._getInternal().get$Wrapper().width($table.outerWidth());
    }
    checkResize() {
        if (this.getIsDestroyCalled())
            return;

        const $table: JQuery = this.grid.$table;
        const data: IResizeInfo = this._resizeInfo;
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
        } else if (data.overflow) { 
            this.applyBounds();  //apply the new bounds 
        }

        $table.addClass(SIGNATURE);
        this.syncGrips();
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        _gridDestroyed(this);
        this.unBindDS(this._ds);
        this._ds = null;
        let $table: JQuery = this.grid.$table;
        let data: IResizeInfo = this._resizeInfo;
        if (!!data)
            data.$gripContainer.remove();
        $table.removeData(SIGNATURE);
        $table.removeClass(SIGNATURE + " " + FLEX);
        this._resizeInfo = null;
        super.destroy();
    }

    getResizeIfo(): IResizeInfo {
        return this._resizeInfo;
    }
}

export function initModule(app: RIAPP.Application) {
    app.registerElView('resizable_grid', ResizableGrid);
}