/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { BaseObject, LocaleERRS as ERRS, Utils, Lazy, IIndexer } from "jriapp_shared";
import { PROP_NAME } from "./const";
import { IEntityItem } from "./int";
import { DbContext } from "./dbcontext";
import { DbSet, IDbSetConstructor } from "./dbset";

const utils = Utils, strUtils = utils.str;

export type TDbSet = DbSet<IEntityItem, DbContext>;

export class DbSets extends BaseObject {
    private _dbContext: DbContext;
    private _dbSets: IIndexer<Lazy<TDbSet>>;
    private _arrDbSets: TDbSet[];

    constructor(dbContext: DbContext) {
        super();
        this._dbContext = dbContext;
        this._arrDbSets = [];
        this._dbSets = {};
    }
    protected _dbSetCreated(dbSet: TDbSet) {
        const self = this;
        this._arrDbSets.push(dbSet);
        dbSet.addOnPropertyChange(PROP_NAME.isHasChanges, function (sender, args) {
            self._dbContext._getInternal().onDbSetHasChangesChanged(sender);
        });
    }
    protected _createDbSet(name: string, dbSetType: IDbSetConstructor<IEntityItem>) {
        const self = this, dbContext = this._dbContext;
        if (!!self._dbSets[name])
            throw new Error(utils.str.format("DbSet: {0} is already created", name));
        self._dbSets[name] = new Lazy<DbSet<IEntityItem,DbContext>>(() => {
            const res = new dbSetType(dbContext);
            self._dbSetCreated(res);
            return res;
        });
    }
    get dbSetNames() {
        return Object.keys(this._dbSets);
    }
    get arrDbSets() {
        return this._arrDbSets;
    }
    getDbSet(name: string): TDbSet {
        const res = this._dbSets[name];
        if (!res)
            throw new Error(strUtils.format(ERRS.ERR_DBSET_NAME_INVALID, name));
        return res.Value;
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