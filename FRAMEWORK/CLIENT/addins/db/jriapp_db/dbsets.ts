/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import * as langMOD from "jriapp_core/lang";
import { BaseObject } from "jriapp_core/object";
import { Utils } from "jriapp_utils/utils";
import { PROP_NAME } from "./const";
import { IEntityItem } from "./int";
import { DbContext } from "./dbcontext";
import { DbSet, IDbSetConstructor } from "./dbset";

const utils = Utils, strUtils = utils.str;

//implements the lazy initialization pattern for creation of DbSet's instances
export class DbSets extends BaseObject {
    private _dbContext: DbContext;
    private _dbSets: { [name: string]: () => DbSet<IEntityItem, DbContext>; };
    private _arrDbSets: DbSet<IEntityItem, DbContext>[];

    constructor(dbContext: DbContext) {
        super();
        this._dbContext = dbContext;
        this._arrDbSets = [];
        this._dbSets = {};
    }
    protected _dbSetCreated(dbSet: DbSet<IEntityItem, DbContext>) {
        let self = this;
        this._arrDbSets.push(dbSet);
        dbSet.addOnPropertyChange(PROP_NAME.isHasChanges, function (sender, args) {
            self._dbContext._getInternal().onDbSetHasChangesChanged(sender);
        });
    }
    protected _createDbSet(name: string, dbSetType: IDbSetConstructor<IEntityItem>) {
        let self = this, dbContext = this._dbContext;
        if (!!self._dbSets[name])
            throw new Error(utils.str.format("DbSet: {0} is already exists", name));
        //Lazy creation pattern
        self._dbSets[name] = function () {
            let t = new dbSetType(dbContext);
            let f = function () {
                return t;
            };
            self._dbSets[name] = f;
            self._dbSetCreated(t);
            return f();
        };
    }
    get dbSetNames() {
        return Object.keys(this._dbSets);
    }
    get arrDbSets() {
        return this._arrDbSets;
    }
    getDbSet(name: string) {
        let f = this._dbSets[name];
        if (!f)
            throw new Error(strUtils.format(langMOD.ERRS.ERR_DBSET_NAME_INVALID, name));
        return f();
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        this._arrDbSets.forEach(function (dbSet) {
            dbSet.destroy();
        });
        this._arrDbSets = [];
        this._dbSets = null;
        this._dbContext = null;
        super.destroy();
    }
}