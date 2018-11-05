﻿/*
	Generated from: /FolderBrowserService/code?lang=ts on 2018-11-05 at 20:51
	Don't make manual changes here, they will be lost when this interface will be regenerated!
*/

import * as RIAPP from "jriapp_shared";
import * as dbMOD from "jriapp_db";

export interface ISvcMethods extends dbMOD.TServiceMethods {
}

export interface IFileSystemObject {
    readonly Key: string;
    readonly ParentKey: string;
    readonly Name: string;
    readonly Level: number;
    readonly HasSubDirs: boolean;
    readonly IsFolder: boolean;
}

export type TFileSystemObjectAspect = dbMOD.EntityAspect<FileSystemObject, IFileSystemObject, DbContext>;

export interface FileSystemObject extends IFileSystemObject, dbMOD.IEntityItem {
    readonly _aspect: TFileSystemObjectAspect;
    readonly fullPath: string;
    readonly ExtraProps: any;
    Parent: FileSystemObject;
    readonly Children: FileSystemObject[];
}

class FileSystemObjectEntity extends RIAPP.CollectionItem<TFileSystemObjectAspect> implements FileSystemObject {

    constructor(aspect: TFileSystemObjectAspect) {
        super(aspect);

    }
    toString() {
        return 'FileSystemObjectEntity';
    }
    get Key(): string { return this._aspect._getFieldVal('Key'); }
    get ParentKey(): string { return this._aspect._getFieldVal('ParentKey'); }
    get Name(): string { return this._aspect._getFieldVal('Name'); }
    get Level(): number { return this._aspect._getFieldVal('Level'); }
    get HasSubDirs(): boolean { return this._aspect._getFieldVal('HasSubDirs'); }
    get IsFolder(): boolean { return this._aspect._getFieldVal('IsFolder'); }
    get fullPath(): string { return this._aspect._getCalcFieldVal('fullPath'); }
    get ExtraProps(): any { return this._aspect._getCalcFieldVal('ExtraProps'); }
    get Parent(): FileSystemObject { return this._aspect._getNavFieldVal('Parent'); }
    set Parent(v: FileSystemObject) { this._aspect._setNavFieldVal('Parent', v); }
    get Children(): FileSystemObject[] { return this._aspect._getNavFieldVal('Children'); }
}

export class FileSystemObjectDb extends dbMOD.DbSet<FileSystemObject, IFileSystemObject, DbContext>
{
    constructor(dbContext: DbContext) {
        var opts: dbMOD.IDbSetConstuctorOptions = {
            dbContext: dbContext,
            dbSetInfo: { "fieldInfos": [], "enablePaging": false, "pageSize": 100, "dbSetName": "FileSystemObject" },
            childAssoc: ([{ "name": "ChildToParent", "parentDbSetName": "FileSystemObject", "childDbSetName": "FileSystemObject", "childToParentName": "Parent", "parentToChildrenName": "Children", "onDeleteAction": 1, "fieldRels": [{ "parentField": "Key", "childField": "ParentKey" }] }]),
            parentAssoc: ([{ "name": "ChildToParent", "parentDbSetName": "FileSystemObject", "childDbSetName": "FileSystemObject", "childToParentName": "Parent", "parentToChildrenName": "Children", "onDeleteAction": 1, "fieldRels": [{ "parentField": "Key", "childField": "ParentKey" }] }])
        };
        opts.dbSetInfo.fieldInfos = ([{ "fieldName": "Key", "isPrimaryKey": 1, "dataType": 1, "isNullable": false, "isReadOnly": true, "isAutoGenerated": true, "isNeedOriginal": true, "maxLength": 255, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "ParentKey", "isPrimaryKey": 0, "dataType": 1, "isNullable": true, "isReadOnly": true, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 255, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "Name", "isPrimaryKey": 0, "dataType": 1, "isNullable": false, "isReadOnly": true, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": 255, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "Level", "isPrimaryKey": 0, "dataType": 3, "isNullable": false, "isReadOnly": true, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "HasSubDirs", "isPrimaryKey": 0, "dataType": 2, "isNullable": false, "isReadOnly": true, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "IsFolder", "isPrimaryKey": 0, "dataType": 2, "isNullable": false, "isReadOnly": true, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 0, "dependentOn": "", "nested": null }, { "fieldName": "fullPath", "isPrimaryKey": 0, "dataType": 1, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 2, "dependentOn": "", "nested": null }, { "fieldName": "ExtraProps", "isPrimaryKey": 0, "dataType": 0, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 2, "dependentOn": "", "nested": null }, { "fieldName": "Parent", "isPrimaryKey": 0, "dataType": 0, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 3, "dependentOn": "ParentKey", "nested": null }, { "fieldName": "Children", "isPrimaryKey": 0, "dataType": 0, "isNullable": true, "isReadOnly": false, "isAutoGenerated": false, "isNeedOriginal": true, "maxLength": -1, "dateConversion": 0, "allowClientDefault": false, "range": "", "regex": "", "fieldType": 3, "dependentOn": "", "nested": null }]);
        super(opts);
    }
    // override
    itemFactory(aspect: TFileSystemObjectAspect): FileSystemObject {
        return new FileSystemObjectEntity(aspect);
    }
    findEntity(key: string): FileSystemObject {
        return this.findByPK(RIAPP.Utils.arr.fromList(arguments));
    }
    toString(): string {
        return 'FileSystemObjectDb';
    }
    createReadAllQuery(args?: {
        includeFiles: boolean;
        infoType: string;
    }): dbMOD.DataQuery<FileSystemObject, IFileSystemObject> {
        var query = this.createQuery('ReadAll');
        query.params = args;
        return query;
    }
    createReadChildrenQuery(args?: {
        parentKey: string;
        level: number;
        path: string;
        includeFiles: boolean;
        infoType: string;
    }): dbMOD.DataQuery<FileSystemObject, IFileSystemObject> {
        var query = this.createQuery('ReadChildren');
        query.params = args;
        return query;
    }
    createReadRootQuery(args?: {
        includeFiles: boolean;
        infoType: string;
    }): dbMOD.DataQuery<FileSystemObject, IFileSystemObject> {
        var query = this.createQuery('ReadRoot');
        query.params = args;
        return query;
    }
    definefullPathField(getFunc: (item: FileSystemObject) => string) { this._defineCalculatedField('fullPath', getFunc); }
    defineExtraPropsField(getFunc: (item: FileSystemObject) => any) { this._defineCalculatedField('ExtraProps', getFunc); }
}

export interface IAssocs {
    getChildToParent: () => dbMOD.Association;
}


export class DbSets extends dbMOD.DbSets {
    constructor(dbContext: DbContext) {
        super(dbContext);
        this._createDbSet("FileSystemObject", FileSystemObjectDb);
    }
    get FileSystemObject() { return <FileSystemObjectDb>this.getDbSet("FileSystemObject"); }
}

export class DbContext extends dbMOD.DbContext<DbSets, ISvcMethods, IAssocs>
{
    protected _createDbSets(): DbSets {
        return new DbSets(this);
    }
    protected _createAssociations(): dbMOD.IAssociationInfo[] {
        return [{ "name": "ChildToParent", "parentDbSetName": "FileSystemObject", "childDbSetName": "FileSystemObject", "childToParentName": "Parent", "parentToChildrenName": "Children", "onDeleteAction": 1, "fieldRels": [{ "parentField": "Key", "childField": "ParentKey" }] }];
    }
    protected _createMethods(): dbMOD.IQueryInfo[] {
        return [{ "methodName": "ReadAll", "parameters": [{ "name": "includeFiles", "dataType": 2, "isArray": false, "isNullable": false, "dateConversion": 0, "ordinal": 0 }, { "name": "infoType", "dataType": 1, "isArray": false, "isNullable": false, "dateConversion": 0, "ordinal": 1 }], "methodResult": true, "isQuery": true }, { "methodName": "ReadChildren", "parameters": [{ "name": "parentKey", "dataType": 1, "isArray": false, "isNullable": false, "dateConversion": 0, "ordinal": 0 }, { "name": "level", "dataType": 3, "isArray": false, "isNullable": false, "dateConversion": 0, "ordinal": 1 }, { "name": "path", "dataType": 1, "isArray": false, "isNullable": false, "dateConversion": 0, "ordinal": 2 }, { "name": "includeFiles", "dataType": 2, "isArray": false, "isNullable": false, "dateConversion": 0, "ordinal": 3 }, { "name": "infoType", "dataType": 1, "isArray": false, "isNullable": false, "dateConversion": 0, "ordinal": 4 }], "methodResult": true, "isQuery": true }, { "methodName": "ReadRoot", "parameters": [{ "name": "includeFiles", "dataType": 2, "isArray": false, "isNullable": false, "dateConversion": 0, "ordinal": 0 }, { "name": "infoType", "dataType": 1, "isArray": false, "isNullable": false, "dateConversion": 0, "ordinal": 1 }], "methodResult": true, "isQuery": true }];
    }
}
