/// <reference path="../../built/shared/shared.d.ts" />
import * as RIAPP from "jriapp";
import * as dbMOD from "jriapp_db";
import * as uiMOD from "jriapp_ui";
import * as FOLDERBROWSER_SVC from "./folderBrowserSvc";
import * as COMMON from "common";

var bootstrap = RIAPP.bootstrap, utils = RIAPP.Utils, infoType = "BASE_ROOT", $ = RIAPP.$;

export interface IMainOptions extends RIAPP.IAppOptions {
    service_url: string;
    permissionInfo?: dbMOD.IPermissionsInfo;
    styles: string[];
}

export interface IOptions {
    service_url: string;
    permissionInfo?: dbMOD.IPermissionsInfo;
    includeFiles: boolean;
}

export interface IFolderBrowserOptions {
    service_url: string;
    permissionInfo?: dbMOD.IPermissionsInfo;
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
        var self = this;
        this._item = item;
        this._dbContext = dbContext;
        this._childView = null;
        if (item.HasSubDirs)
            this._childView = this.createChildView();

        this._dbSet = <FOLDERBROWSER_SVC.FileSystemObjectDb>item._aspect.dbSet;
        self._toggleCommand = new RIAPP.Command(function (s, a) {
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
        }, self,
            function (s, a) {
                return !!self.childView;
            });

        self._clickCommand = new RIAPP.Command(function (s, a) {
            if (!!this._clickTimeOut) {
                clearTimeout(this._clickTimeOut);
                this._clickTimeOut = null;
                self.raiseEvent('dblclicked', { item: self._item });
            }
            else {
                this._clickTimeOut = setTimeout(function () {
                    self._clickTimeOut = null;
                    self.raiseEvent('clicked', { item: self._item });
                }, 350);
            }
        }, self, null);
    }
    _getEventNames() {
        var base_events = super._getEventNames();
        return ['clicked', 'dblclicked'].concat(base_events);
    }
    addOnClicked(fn: (sender: ExProps, args: { item: FOLDERBROWSER_SVC.FileSystemObject; }) => void, nmspace?: string) {
        this.addHandler('clicked', fn, nmspace);
    }
    removeOnClicked(nmspace?: string) {
        this.removeHandler('clicked', nmspace);
    }
    addOnDblClicked(fn: (sender: ExProps, args: { item: FOLDERBROWSER_SVC.FileSystemObject; }) => void, nmspace?: string) {
        this.addHandler('dblclicked', fn, nmspace);
    }
    removeOnDblClicked(nmspace?: string) {
        this.removeHandler('dblclicked', nmspace);
    }
    createChildView() {
        var self = this;
        var dvw = new dbMOD.ChildDataView<FOLDERBROWSER_SVC.FileSystemObject>(
            {
                association: self._dbContext.associations.getChildToParent(),
                parentItem: self._item
            });
        dvw.addOnFill((s, a) => {
                self.refreshCss();
        });
        return dvw;
    }
    loadChildren() {
        var self = this, query = self._dbSet.createReadChildrenQuery({ parentKey: self.item.Key, level: self.item.Level + 1, path: self.item.fullPath, includeFiles: false, infoType: infoType });
        query.isClearPrevData = false;
        var promise = query.load();
        return promise;
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        var self = this;
        clearTimeout(self._clickTimeOut);
        if (!!this._childView) {
            this._childView.parentItem = null;
            this._childView.destroy();
            this._childView = null;
        }
        this._dbSet = null;
        this._dbContext = null;
        this._item = null;
        super.destroy();
    }
    refreshCss() {
        this.raisePropertyChanged('css1');
        this.raisePropertyChanged('css2');
    }
    get item() { return this._item; }
    get childView() { return this._childView; }
    get toggleCommand() { return this._toggleCommand; }
    get clickCommand() { return this._clickCommand; }
    get css1() {
        var children_css = this.item.HasSubDirs ? ' dynatree-has-children' : ''
        var folder_css = this.item.IsFolder ? ' dynatree-folder' : '';
        var css = '';
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

export class FolderBrowser extends RIAPP.ViewModel<DemoApplication> {
    private _dbSet: FOLDERBROWSER_SVC.FileSystemObjectDb;
    private _collapseCommand: RIAPP.ICommand;
    private _reloadCommand: RIAPP.ICommand;
    private _rootView: dbMOD.DataView<FOLDERBROWSER_SVC.FileSystemObject>;

    constructor(app: DemoApplication, options: IFolderBrowserOptions) {
        super(app);
        var self = this;
        self._dbSet = self.dbContext.dbSets.FileSystemObject;

        self._collapseCommand = new RIAPP.Command(function (s, a) {
            self.collapse();
        }, self,
            function (s, a) {
                return true;
            });

        self._reloadCommand = new RIAPP.Command(function (s, a) {
            self.loadAll();
        }, self,
            function (s, a) {
                return true;
            });

        self.dbContext.dbSets.FileSystemObject.definefullPathField(function (item) {
            return self.getFullPath(item);
        });

        self.dbContext.dbSets.FileSystemObject.defineExtraPropsField(function (item) {
            let res = <ExProps>item._aspect.getCustomVal("exprop");
            if (!res) {
                res = new ExProps(item, self.dbContext);
                item._aspect.setCustomVal("exprop", res);
                res.addOnClicked((s, a) => { self._onItemClicked(a.item); });
                res.addOnDblClicked((s, a) => { self._onItemDblClicked(a.item); });
            }

            return res;
        });

        this._rootView = this.createDataView();
    }
    protected _onItemClicked(item: FOLDERBROWSER_SVC.FileSystemObject) {
        alert("clicked item: " + item.fullPath);
    }
    protected _onItemDblClicked(item: FOLDERBROWSER_SVC.FileSystemObject) {
        alert("double clicked item: " + item.fullPath);
    }
    private _getFullPath(item: FOLDERBROWSER_SVC.FileSystemObject, path: string): string {
        var self = this, part: string;
        if (utils.check.isNt(path))
            path = '';
        if (!path)
            part = '';
        else
            part = '\\' + path;
        var parent = <FOLDERBROWSER_SVC.FileSystemObject>self.dbContext.associations.getChildToParent().getParentItem(item);
        if (!parent) {
            return item.Name + part;
        }
        else {
            return self._getFullPath(parent, item.Name + part);
        }
    }
    private getFullPath(item: FOLDERBROWSER_SVC.FileSystemObject) {
        return this._getFullPath(item, null);
    }
    private createDataView() {
        var self = this;
        var res = new dbMOD.DataView<FOLDERBROWSER_SVC.FileSystemObject>(
            {
                dataSource: self._dbSet,
                fn_filter: (item) => {
                    //console.log(item.Level);
                    return item.Level == 0;
                }
            });
        return res;
    }
    collapse() {
        var self = this;
        var items = self._dbSet.items.filter((item) => {
            return (item.Level > 0);
        });

        items.forEach((item) => {
            item._aspect.deleteItem();
        });

        self._dbSet.acceptChanges();
        self._dbSet.items.forEach((item) => {
            let exProps = <ExProps>item._aspect.getCustomVal("exprop");
            if (!exProps)
                return;
            exProps.refreshCss();
        });
    }
    loadRootFolder() {
        var self = this, query = self._dbSet.createReadRootQuery({ includeFiles: false, infoType: infoType });
        query.isClearPrevData = true;
        var promise = query.load();
        promise.then(function (res) {
            //self._rootView.refresh();
        });
        return promise;
    }
    loadAll() {
        var self = this, query = self._dbSet.createReadAllQuery({ includeFiles: false, infoType: infoType });
        query.isClearPrevData = true;
        var promise = query.load();
        return promise;
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        var self = this;
        super.destroy();
    }
    get dbContext() { return this.app.dbContext; }
    get collapseCommand() { return this._collapseCommand; }
    get reloadCommand() { return this._reloadCommand; }
    get dbSet() { return this._dbSet; }
    get rootView() { return this._rootView; }
}

export class DemoApplication extends RIAPP.Application {
    private _errorVM: COMMON.ErrorViewModel;
    private _fbrowserVM: FolderBrowser;
    private _dbContext: FOLDERBROWSER_SVC.DbContext;

    constructor(options: IMainOptions) {
        super(options);
        var self = this;
        this._errorVM = null;
        this._fbrowserVM = null;
    }
    onStartUp() {
        var self = this, options: IMainOptions = self.options;
        self._dbContext = new FOLDERBROWSER_SVC.DbContext();
        self._dbContext.initialize({
            serviceUrl: options.service_url,
            permissions: options.permissionInfo
        });

        this._errorVM = new COMMON.ErrorViewModel(this);
        this._fbrowserVM = new FolderBrowser(this, { service_url: options.service_url, permissionInfo: options.permissionInfo });

        //here we could process application's errors
        this.addOnError(function (sender, data) {
            debugger;
            data.isHandled = true;
            self.errorVM.error = data.error;
            self.errorVM.showDialog();
        });
        super.onStartUp();
    }
    //really, the destroy method is redundant here because application lives till the page lives
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        var self = this;
        try {
            self._errorVM.destroy();
            self._fbrowserVM.destroy();
        } finally {
            super.destroy();
        }
    }
    get options() { return <IMainOptions>this._options; }
    get errorVM() { return this._errorVM; }
    get TEXT() { return RIAPP.LocaleSTRS.TEXT; }
    get fbrowserVM() { return this._fbrowserVM; }
    get dbContext() { return this._dbContext; }
}

//bootstrap error handler - the last resort (typically display message to the user)
RIAPP.bootstrap.addOnError(function (sender, args) {
    debugger;
    alert(args.error.message);
});

export function start(mainOptions: IMainOptions): RIAPP.IPromise<DemoApplication> {
    mainOptions.modulesInits = {
        "COMMON": COMMON.initModule
    };
    //an example  how to load styles dynamically
    //we could load  them statically but it is for example.
    bootstrap.stylesLoader.loadStyles(mainOptions.styles);
    //create and start application here
    return bootstrap.startApp(() => {
        return new DemoApplication(mainOptions);
    }, (thisApp) => { });
}