/** The MIT License (MIT) Copyright(c) 2016-present Maxim V.Tsapov */
import { BaseObject, LocaleERRS as ERRS, Utils, Lazy, IIndexer, TEventHandler, IBaseObject } from "jriapp_shared";
import { IEntityItem } from "./int";
import { DbContext } from "./dbcontext";
import { IDbSetConstructor, TDbSet } from "./dbset";

const utils = Utils, { Indexer } = utils.core, { format } = utils.str;

const enum DBSETS_EVENTS {
    DBSET_CREATING = "dbset_creating"
}

export type TDbSetCreatingArgs = { name: string; dbSetType: IDbSetConstructor<IEntityItem, any>; };

export class DbSets extends BaseObject {
    private _dbContext: DbContext;
    private _dbSets: IIndexer<Lazy<TDbSet>>;
    private _arrDbSets: TDbSet[];

    constructor(dbContext: DbContext) {
        super();
        this._dbContext = dbContext;
        this._arrDbSets = [];
        this._dbSets = Indexer();
    }
    dispose(): void {
        if (this.getIsDisposed()) {
            return;
        }
        this.setDisposing();
        this._arrDbSets.forEach((dbSet) => {
            dbSet.dispose();
        });
        this._arrDbSets = [];
        this._dbSets = null;
        this._dbContext = null;
        super.dispose();
    }
    protected _dbSetCreated(dbSet: TDbSet): void {
        this._arrDbSets.push(dbSet);
        dbSet.objEvents.onProp("isHasChanges", (sender, args) => {
            this._dbContext._getInternal().onDbSetHasChangesChanged(sender);
        });
    }
    protected _createDbSet(name: string, dbSetType: IDbSetConstructor<IEntityItem, any>): void {
        const self = this, dbContext = this._dbContext;
        if (!!self._dbSets[name]) {
            throw new Error(utils.str.format("DbSet: {0} is already created", name));
        }
        self._dbSets[name] = new Lazy<TDbSet>(() => {
            const args: TDbSetCreatingArgs = { name: name, dbSetType: dbSetType };
            self.objEvents.raise(DBSETS_EVENTS.DBSET_CREATING, args);
            const res = new args.dbSetType(dbContext);
            self._dbSetCreated(res);
            return res;
        });
    }
    addOnDbSetCreating(fn: TEventHandler<this, TDbSetCreatingArgs>, nmspace?: string, context?: IBaseObject): void {
        this.objEvents.on(DBSETS_EVENTS.DBSET_CREATING, fn, nmspace, context);
    }
    offOnDbSetCreating(nmspace?: string): void {
        this.objEvents.off(DBSETS_EVENTS.DBSET_CREATING, nmspace);
    }
    get dbSetNames(): string[] {
        return Object.keys(this._dbSets);
    }
    get arrDbSets(): TDbSet[] {
        return this._arrDbSets;
    }
    findDbSet(name: string): TDbSet {
        const res = this._dbSets[name];
        if (!res) {
            return null;
        }
        return res.Value;
    }
    getDbSet(name: string): TDbSet {
        const dbSet = this.findDbSet(name);
        if (!dbSet) {
            throw new Error(format(ERRS.ERR_DBSET_NAME_INVALID, name));
        }
        return dbSet;
    }
}
