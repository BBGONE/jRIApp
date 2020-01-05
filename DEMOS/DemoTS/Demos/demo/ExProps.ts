import * as RIAPP from "jriapp";
import * as dbMOD from "jriapp_db";
import * as FOLDERBROWSER_SVC from "./folderBrowserSvc";

export const infoType = "BASE_ROOT";

class ChildDataView extends dbMOD.ChildDataView<FOLDERBROWSER_SVC.FileSystemObject> {
}

export class ExProps extends RIAPP.BaseObject {
    private _item: FOLDERBROWSER_SVC.FileSystemObject;
    private _childView: dbMOD.ChildDataView<FOLDERBROWSER_SVC.FileSystemObject>
    private _toggleCommand: RIAPP.ICommand;
    private _clickCommand: RIAPP.ICommand;
    private _dbSet: FOLDERBROWSER_SVC.FileSystemObjectDb;
    private _dbContext: FOLDERBROWSER_SVC.DbContext;
    protected _clickTimeOut: number;

    constructor(item: FOLDERBROWSER_SVC.FileSystemObject, dbContext: FOLDERBROWSER_SVC.DbContext) {
        super();
        const self = this;
        this._item = item;
        this._dbContext = dbContext;
        this._childView = null;
        if (item.HasSubDirs) {
            this._childView = this.createChildView();
        }

        this._dbSet = <FOLDERBROWSER_SVC.FileSystemObjectDb>item._aspect.dbSet;
        self._toggleCommand = new RIAPP.Command(() => {
            if (!self.childView)
                return;
            if (self.childView.count <= 0) {
                self.loadChildren();
            }
            else {
                self.childView.items.forEach((item) => {
                    item._aspect.deleteItem();
                });
                self._dbSet.acceptChanges();
                self.refreshCss();
            }
        }, () => {
            return !!self.childView;
        });

        self._clickCommand = new RIAPP.Command(() => {
            if (!!self._clickTimeOut) {
                clearTimeout(self._clickTimeOut);
                self._clickTimeOut = null;
                self.objEvents.raise('dblclicked', { item: self._item });
            } else {
                self._clickTimeOut = setTimeout(function () {
                    self._clickTimeOut = null;
                    self.objEvents.raise('clicked', { item: self._item });
                }, 350);
            }
        });
    }
    addOnClicked(fn: (sender: ExProps, args: { item: FOLDERBROWSER_SVC.FileSystemObject; }) => void, nmspace?: string) {
        this.objEvents.on('clicked', fn, nmspace);
    }
    offOnClicked(nmspace?: string) {
        this.objEvents.off('clicked', nmspace);
    }
    addOnDblClicked(fn: (sender: ExProps, args: { item: FOLDERBROWSER_SVC.FileSystemObject; }) => void, nmspace?: string) {
        this.objEvents.on('dblclicked', fn, nmspace);
    }
    offOnDblClicked(nmspace?: string) {
        this.objEvents.off('dblclicked', nmspace);
    }
    createChildView() {
        const self = this;
        let dvw = new ChildDataView(
            {
                association: self._dbContext.associations.getChildToParent(),
                parentItem: self._item,
                //we need to use refresh explicitly after the ChildDataView creation
                explicitRefresh: true
            });

        dvw.addOnFill((s, a) => {
            self.refreshCss();
        });

        //explicit refresh with no async
        dvw.syncRefresh();
        return dvw;
    }
    loadChildren() {
        const self = this, query = self._dbSet.createReadChildrenQuery({ parentKey: self.item.Key, level: self.item.Level + 1, path: self.item.fullPath, includeFiles: false, infoType: infoType });
        query.isClearPrevData = false;
        let promise = query.load();
        return promise;
    }
    dispose() {
        if (this.getIsDisposed())
            return;
        this.setDisposing();
        const self = this;
        clearTimeout(self._clickTimeOut);
        if (!!this._childView) {
            this._childView.parentItem = null;
            this._childView.dispose();
            this._childView = null;
        }
        this._dbSet = null;
        this._dbContext = null;
        this._item = null;
        super.dispose();
    }
    refreshCss() {
        this.objEvents.raiseProp('css1');
        this.objEvents.raiseProp('css2');
    }
    get item() { return this._item; }
    get childView() { return this._childView; }
    get toggleCommand() { return this._toggleCommand; }
    get clickCommand() { return this._clickCommand; }
    get css1() {
        let children_css = this.item.HasSubDirs ? ' dynatree-has-children' : ''
        let folder_css = this.item.IsFolder ? ' dynatree-folder' : '';
        let css = '';
        if (!this._childView)
            css = 'dynatree-node dynatree-exp dynatree-ico-cf'; //dynatree-active
        else
            css = this._childView.count > 0 ? 'dynatree-node dynatree-exp-e dynatree-ico-ef' : 'dynatree-node dynatree-exp dynatree-ico-cf';
        /*
        if (!!this._childView)
            console.log(this._item.Name+ "   " + this._childView.count);
        */
        css += children_css;
        css += folder_css;
        return css;
    }
    get css2() {
        return this.item.HasSubDirs ? 'dynatree-expander' : 'dynatree-connector';
    }
}