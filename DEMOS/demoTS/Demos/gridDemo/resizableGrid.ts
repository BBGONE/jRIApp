﻿import * as RIAPP from "jriapp";
import * as uiMOD from "jriapp_ui";

const utils = RIAPP.Utils, DOM = RIAPP.DOM, doc = RIAPP.DOM.document, head = RIAPP.DOM.queryOne<Element>(doc, "head");
let drag: HTMLElement = null;	//reference to the current grip that is being dragged

//common strings for packing
let PX = "px";
let SIGNATURE = "JColResizer";
let FLEX = "JCLRFlex";

interface IResizeInfo {
    options: IOptions;
    mode: string;
    dc: number[];
    fixed: boolean;
    w: number;
    gripContainer: HTMLElement;
    cellspacing: number;
    len: number;
    columns: IColumnInfo[];
}

interface IColumnInfo {
    column: HTMLElement;
    grip: HTMLElement;
    w: number;
    locked: boolean;
}

interface IGripData {
    i: number;
    elview: ResizableGrid;
    last: boolean;
    w: number;
    ox: number; //original x
    x: number; // x
    l: number; //left
}

interface IOptions {
    resizeMode: 'fit' | 'overflow';
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
    onDrag: (e: Event) => void; //callback function to be fired during the column resizing process if liveDrag is enabled
    onResize: (e: Event) => void;	//callback function fired when the dragging process is over
}

let _gridsCount = 0;
let _created_grids: RIAPP.IIndexer<ResizableGrid> = {};

function _gridCreated(grid: ResizableGrid) {
    _created_grids[grid.uniqueID] = grid;
    _gridsCount += 1;
    if (_gridsCount === 1) {
        DOM.events.on(window, 'resize', onResize, SIGNATURE);
    }
}

function _gridDestroyed(grid: ResizableGrid) {
    delete _created_grids[grid.uniqueID];
    _gridsCount -= 1;
    if (_gridsCount === 0) {
        DOM.events.offNS(window, SIGNATURE);
    }
}

const cssRules = "<style type='text/css'>  .JColResizer{table-layout:fixed; box-sizing: border-box;} .JCLRgrips{ height:0px; position:relative; box-sizing: border-box;} .JCLRgrip{margin-left:-5px; position:absolute; z-index:5; box-sizing: border-box;} .JCLRgrip .JColResizer{position:absolute;background-color:red;filter:alpha(opacity=1);opacity:0;width:10px;height:100%;cursor: e-resize;top:0px; box-sizing: border-box;} .JCLRLastGrip{position:absolute; width:1px; box-sizing: border-box; } .JCLRgripDrag{ border-left:1px dotted black; box-sizing: border-box; } .JCLRFlex{ width:auto!important; } .JCLRgrip.JCLRdisabledGrip .JColResizer{cursor:default; display:none;}</style>";
//append required CSS rules  
DOM.append(head, RIAPP.DOM.fromHTML(cssRules));


/**
	 * Event handler used while dragging a grip. It checks if the next grip's position is valid and updates it. 
*/
let onGripDrag = function (e: TouchEvent | MouseEvent): boolean {
    if (!drag)
        return false;
    let gripData: IGripData = DOM.getData(drag, SIGNATURE), elview: ResizableGrid = gripData.elview;
    if (elview.getIsStateDirty())
        return false;
    let data: IResizeInfo = elview.getResizeIfo();
    let table = elview.grid.table;
    let touches = (<any>e).touches;   //touch or mouse event?
    //original position (touch or mouse)
    let ox = touches ? touches[0].pageX : (<MouseEvent>e).pageX;
    //next position according to horizontal mouse position increment
    let x = ox - gripData.ox + gripData.l;	
    let mw = data.options.minWidth; //cell's min width
    const index = gripData.i;
    const colInfo = data.columns[index];

    let minLen: number = data.cellspacing * 1.5 + mw;
    let last = index == data.len - 1;  //check if it is the last column's grip (usually hidden)
    //min position according to the contiguous cells
    let min = (index > 0) ? data.columns[index - 1].grip.offsetLeft + data.cellspacing + mw : minLen;	
    //max position according to the contiguous cells 
    let max = Infinity;
    if (data.fixed) {
        if (last) {
            max = data.w - minLen;
        }
        else {
            max = data.columns[index + 1].grip.offsetLeft - data.cellspacing - mw;
        }
    }

    x = Math.max(min, Math.min(max, x));	//apply bounding		
    gripData.x = x;
    drag.style.left = (x + PX); 	//apply position increment	
    if (last) {	//if it is the last grip
        gripData.w = colInfo.w + x - gripData.l;
    }

    if (!!data.options.liveDrag) { 	//if liveDrag is enabled
        if (last) {
            colInfo.column.style.width = (gripData.w + PX);
            if (!data.fixed) {	//if overflow is set, incriment min-width to force overflow
                table.style.minWidth = ((data.w + x - gripData.l) + PX);
            } else {
                data.w = table.offsetWidth;
            }
        } else {
            elview.syncCols(index, false); //columns are synchronized
        }

        elview.syncGrips();
        let cb = data.options.onDrag;	//check if there is an onDrag callback
        if (!!cb) { (<any>e).currentTarget = table; cb(e); }		//if any, it is fired			
    }
    return false; 	//prevent text selection while dragging				
};


/**
 * Event handler fired when the dragging is over, updating table layout
*/
let onGripDragOver = function (e: TouchEvent | MouseEvent): void {
    DOM.events.offNS(doc, SIGNATURE);
    let dragCursor = RIAPP.DOM.queryOne(head, '#dragCursor');
    if (!!dragCursor) {
        DOM.removeNode(dragCursor);
    }
    if (!drag)
        return;
    const gripData: IGripData = DOM.getData(drag, SIGNATURE);
    const elview: ResizableGrid = gripData.elview;
    if (elview.getIsStateDirty())
        return;
    const data: IResizeInfo = elview.getResizeIfo(), table = elview.grid.table;
    //remove the grip's dragging css-class
    DOM.removeClass([drag], data.options.draggingClass);

    if (!!(gripData.x - gripData.l)) {
        let cb = data.options.onResize; //get some values	
        let index = gripData.i;   //column index
        let last = index == data.len - 1;   //check if it is the last column's grip (usually hidden)
        let colInfo = data.columns[index];  //the column being dragged
        if (last) {
            colInfo.column.style.width = (gripData.w + PX);
            colInfo.w = gripData.w;
        } else {
            elview.syncCols(index, true);	//the columns are updated
        }
        if (!data.fixed)
            elview.applyBounds();
        elview.syncGrips();	//the grips are updated
        if (!!cb) { (<any>e).currentTarget = table; cb(e); }	//if there is a callback function, it is fired
    }

    drag = null;   //since the grip's dragging is over									
};


/**
 * Event handler fired when the grip's dragging is about to start. Its main goal is to set up events 
 * and store some values used while dragging.
 */
let onGripMouseDown = function (this: HTMLElement, e: TouchEvent | MouseEvent): boolean {
    const grip: HTMLElement = this;
    let gripData: IGripData = DOM.getData(grip, SIGNATURE), elview: ResizableGrid = gripData.elview;
    if (elview.getIsStateDirty())
        return false;
    let data: IResizeInfo = elview.getResizeIfo();
    let touches = (<any>e).touches;   //touch or mouse event?
    gripData.ox = touches ? touches[0].pageX : (<MouseEvent>e).pageX;    //the initial position is kept
    gripData.l = grip.offsetLeft;
    gripData.x = gripData.l;
    //mousemove and mouseup events are bound
    DOM.events.on(doc, 'touchmove', onGripDrag, SIGNATURE);
    DOM.events.on(doc, 'mousemove', onGripDrag, SIGNATURE);
    DOM.events.on(doc, 'touchend', onGripDragOver, SIGNATURE);
    DOM.events.on(doc, 'mouseup', onGripDragOver, SIGNATURE);

    //change the mouse cursor
    let dragCursor = DOM.queryOne(head, '#dragCursor');
    if (!dragCursor) {
        const html = `<style id='dragCursor' type='text/css'>*{cursor: ${data.options.dragCursor} !important}</style>`;
        DOM.append(head, DOM.fromHTML(html));
    }

    DOM.addClass([grip], data.options.draggingClass);

    drag = grip; //the current grip is stored as the current dragging object
    let gripCol = data.columns[gripData.i];
    if (gripCol.locked) {
        for (let i = 0; i < data.len; i++)
        {
            //if the colum is locked (after browser resize), then c.w must be updated		
            let c = data.columns[i];
            c.locked = false;
            c.w = c.column.offsetWidth;
        } 	
    }
    return false; 	//prevent text selection
};

/**
 * Event handler fired when the browser is resized. The main purpose of this function is to update
 * table layout according to the browser's size synchronizing related grips 
 */
let onResize = function () {
    RIAPP.Utils.core.forEachProp(_created_grids, (name, gridView) => {
        gridView.syncGrips();
    });
};

export class ResizableGrid extends uiMOD.DataGridElView {
    private _ds: RIAPP.ICollection<RIAPP.ICollectionItem>;
    private _resizeInfo: IResizeInfo;

    constructor(el: HTMLTableElement, options: uiMOD.IDataGridViewOptions) {
        super(el, options);
        const self = this, grid = self.grid;
        _gridCreated(this);
        let defaults: IOptions = {
            resizeMode: <'fit' | 'overflow'>'overflow',  //mode can be 'fit' or 'overflow'
            draggingClass: 'JCLRgripDrag',	//css-class used when a grip is being dragged (for visual feedback purposes)
            gripInnerHtml: '',				//if it is required to use a custom grip it can be done using some custom HTML				
            liveDrag: false,				//enables table-layout updating while dragging	
            minWidth: 15, 					//minimum width value in pixels allowed for a column 
            headerOnly: true,				//specifies that the size of the the column resizing anchors will be bounded to the size of the first row 
            dragCursor: "e-resize",  		//cursor to be used while dragging
            marginLeft: <string>null,		//in case the table contains any margins, colResizable needs to know the values used, e.grip. "10%", "15em", "5px" ...
            marginRight: <string>null, 		//in case the table contains any margins, colResizable needs to know the values used, e.grip. "10%", "15em", "5px" ...
            disabledColumns: <number[]>[],  //column indexes to be excluded
            //events:
            onDrag: <(e: Event) => void>null, //callback function to be fired during the column resizing process if liveDrag is enabled
            onResize: <(e: Event) => void>null	//callback function fired when the dragging process is over
        }

        this._resizeInfo = null;
        this._ds = grid.dataSource;

        let opts: IOptions = <IOptions>utils.core.extend(defaults, options);
        self.init(opts);
        self.bindDS(this._ds);

        grid.objEvents.onProp("dataSource", (s, a) => {
            self.unBindDS(self._ds);
            self.bindDS(grid.dataSource);
            self._ds = grid.dataSource;
        }, this.uniqueID);

        self.syncGrips();
    }
    private bindDS(ds: RIAPP.ICollection<RIAPP.ICollectionItem>) {
        if (!ds)
            return;
        const self = this;
        ds.addOnCleared((s, a) => {
            utils.queue.enque(() => { self.syncGrips(); });
        }, this.uniqueID);
        ds.addOnFill((s, a) => {
            utils.queue.enque(() => { self.syncGrips(); });
        }, this.uniqueID);
    }
    private unBindDS(ds: RIAPP.ICollection<RIAPP.ICollectionItem>) {
        if (!ds)
            return;
        ds.objEvents.offNS(this.uniqueID);
    }
    protected init(options: IOptions) {
        const table = this.grid.table, style = window.getComputedStyle(table, null);
        //the grips container object is added. 
        //Signature class forces table rendering in fixed - layout mode to prevent column's min-width
        DOM.addClass([table], SIGNATURE);
        let gripContainer = DOM.fromHTML('<div class="JCLRgrips"/>')[0];
        const header = this.grid._getInternal().getHeader();
        header.parentElement.insertBefore(gripContainer, header);
         
        this._resizeInfo = {
            options: options,
            mode: options.resizeMode,
            dc: options.disabledColumns,
            fixed: options.resizeMode === 'fit',
            columns: <IColumnInfo[]>[],
            w: table.offsetWidth,
            gripContainer: gripContainer,
            cellspacing: parseInt(style.borderSpacing) || 2,
            len: 0
        };

        if (options.marginLeft) gripContainer.style.marginLeft = options.marginLeft;  	//if the table contains margins, it must be specified
        if (options.marginRight) gripContainer.style.marginRight = options.marginRight;  	//since there is no (direct) way to obtain margin values in its original units (%, em, ...)

        this.createGrips();	 
    }
    protected createGrips() {
        const table = this.grid.table, self = this;
        const allTH = this.grid._tHeadCells;
        const data: IResizeInfo = this._resizeInfo;
        data.len = allTH.length;	//table length is stored	
        allTH.forEach(function (column, index) {	//iterate through the table column headers		
            let isDisabled: boolean = data.dc.indexOf(index) != -1;   //is this a disabled column?
            //add the visual node to be used as grip
            let grip = DOM.fromHTML('<div class="JCLRgrip"></div>')[0];
            data.gripContainer.appendChild(grip);
            if (!isDisabled && !!data.options.gripInnerHtml) {
                let inner = DOM.fromHTML(data.options.gripInnerHtml);
                DOM.append(grip, inner);
            }
            DOM.append(grip, RIAPP.DOM.fromHTML('<div class="' + SIGNATURE + '"></div>'));
            if (index == data.len - 1) {  // if the current grip is the last one 
                DOM.addClass([grip], "JCLRLastGrip");    // add a different css class to style it in a different way if needed
                if (data.fixed)
                    grip.innerHTML = "";   // if the table resizing mode is set to fixed, the last grip is removed since table width can not change
            }


            if (!isDisabled) {
                //if normal column bind the mousedown event to start dragging, if disabled then apply its css class
                DOM.removeClass([grip], 'JCLRdisabledGrip');
                DOM.events.on(grip, 'touchstart', onGripMouseDown);
                DOM.events.on(grip, 'mousedown', onGripMouseDown);
            } else {
                DOM.addClass([grip], 'JCLRdisabledGrip');
            }

            const colInfo: IColumnInfo = { column: column, grip: grip, w: column.offsetWidth, locked: false };
            //the current grip and column are added to its table object
            data.columns.push(colInfo);
            //the width of the column is converted into pixel-based measurements
            column.style.width = (colInfo.w + PX);
            column.removeAttribute("width");
            //grip index and its the grid are stored
            const gripData: IGripData = { i: index, elview: self, last: index == data.len - 1, ox: 0, x: 0, l: 0, w: 0 };
            DOM.setData(grip, SIGNATURE, gripData);
        });

        if (!data.fixed) {
            table.removeAttribute('width');
            DOM.addClass([table], FLEX); //if not fixed, let the table grow as needed
        }
        //the grips are positioned according to the current table layout
        this.syncGrips();			
    }
    /**
       * Function that places each grip in the correct position according to the current table layout	 
    */
    syncGrips() {
        if (this.getIsStateDirty())
            return;
        const data: IResizeInfo = this._resizeInfo;
        data.gripContainer.style.width = (data.w + PX);	// the grip's container width is updated
        const table = this.grid.table;
        const header = this.grid._getInternal().getHeader();
        const viewport = this.grid._getInternal().getWrapper();
        const headerHeight = header.offsetHeight;
        const tableHeight = viewport.clientHeight;
        const lastGripOffset = 5;

        for (let i = 0; i < data.len; i++) {	// for each column
            let colInfo = data.columns[i], leftPos = (colInfo.column.offsetLeft - table.offsetLeft + colInfo.column.offsetWidth + data.cellspacing / 2);
            if (i == data.len - 1) {
                if ((leftPos + lastGripOffset) > data.w) {
                    leftPos = data.w - lastGripOffset;
                }
            }
            // height and position of the grip is updated according to the table layout
            colInfo.grip.style.left = (leftPos + PX);
            colInfo.grip.style.height = ((data.options.headerOnly ? headerHeight : (headerHeight + tableHeight)) + PX);
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
        if (this.getIsStateDirty())
            return;
        const table = this.grid.table, data: IResizeInfo = this._resizeInfo, gripData: IGripData = DOM.getData(drag, SIGNATURE);
        const inc = gripData.x - gripData.l, c: IColumnInfo = data.columns[i];
  
        if (data.fixed) { //if fixed mode
            const c2: IColumnInfo = data.columns[i + 1];
            const w2 = c2.w - inc;
            c2.column.style.width = (w2 + PX);
            if (isOver) {
                c2.w = c2.column.offsetWidth;
            }
        }
        else {	//if overflow is set, incriment min-width to force overflow
            table.style.minWidth = ((data.w + inc) + PX);
        }
        
        const w = c.w + inc;
        c.column.style.width = (w + PX);
        if (isOver) {
            c.w = c.column.offsetWidth;
        }
    }
    /**
	* This function updates all columns width according to its real width. It must be taken into account that the 
	* sum of all columns can exceed the table width in some cases (if fixed is set to false and table has some kind 
	* of max-width).
    */
    applyBounds() {
        if (this.getIsStateDirty())
            return;
        const table = this.grid.table;
        const data: IResizeInfo = this._resizeInfo;
        //obtain real widths
        const widths = data.columns.map(function (c) {
            return c.column.offsetWidth;
        });

        data.w = table.offsetWidth;
        table.style.width = (data.w + PX);
        DOM.removeClass([table], FLEX);	//prevent table width changes

        data.columns.forEach(function (c, i) {
            //set column widths applying bounds (table's max-width)
            c.column.style.width = (widths[i] + PX);
        });

        DOM.addClass([table], FLEX);	//allow table width changes

        //recalculate widths
        data.columns.forEach(function (c, i) {
            c.w = c.column.offsetWidth;
        });
        //recalculate width
        data.w = table.offsetWidth;
        const viewport = this.grid._getInternal().getWrapper();
        viewport.style.width = (table.offsetWidth + (viewport.offsetWidth - viewport.clientWidth)) + PX;
    }
    dispose() {
        if (this.getIsDisposed())
            return;
        this.setDisposing();
        _gridDestroyed(this);
        this.unBindDS(this._ds);
        this._ds = null;
        let table = this.grid.table, data: IResizeInfo = this._resizeInfo;
        if (!!data)
            data.gripContainer.remove();
        DOM.removeClass([table], SIGNATURE + " " + FLEX);
        this._resizeInfo = null;
        super.dispose();
    }

    getResizeIfo(): IResizeInfo {
        return this._resizeInfo;
    }
}

export function initModule(app: RIAPP.Application) {
    app.registerElView('resizable_grid', ResizableGrid);
}