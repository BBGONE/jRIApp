/*
The MIT License (MIT)

Copyright(c) 2016 Maxim V.Tsapov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and / or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
import * as langMOD from "jriapp_core/lang";
import { BaseObject } from "jriapp_core/object";
import { Utils as utils } from "jriapp_utils/utils";
import { PROP_NAME } from "const";
import { IEntityItem } from "int";
import { DbContext } from "dbcontext";
import { DbSet, IDbSetConstructor } from "dbset";

const strUtils = utils.str;

//implements the lazy initialization pattern for creation of DbSet's instances
export class DbSets extends BaseObject {
    protected _dbSetNames: string[];
    private _dbContext: DbContext;
    private _dbSets: { [name: string]: () => DbSet<IEntityItem, DbContext>; };
    private _arrDbSets: DbSet<IEntityItem, DbContext>[];

    constructor(dbContext: DbContext) {
        super();
        this._dbContext = dbContext;
        this._arrDbSets = [];
        this._dbSets = {};
        this._dbSetNames = [];
   }
    protected _dbSetCreated(dbSet: DbSet<IEntityItem, DbContext>) {
        let self = this;
        this._arrDbSets.push(dbSet);
        dbSet.addOnPropertyChange(PROP_NAME.isHasChanges, function (sender, args) {
            self._dbContext._getInternal().onDbSetHasChangesChanged(sender);
       }, null);
   }
    protected _createDbSet(name: string, dbSetType: IDbSetConstructor<IEntityItem>) {
        let self = this, dbContext = this._dbContext;
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
        return this._dbSetNames;
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
        this._arrDbSets.forEach(function (dbSet) {
            dbSet.destroy();
       });
        this._arrDbSets = [];
        this._dbSets = null;
        this._dbContext = null;
        super.destroy();
   }
}