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
import { BINDING_MODE, BindTo } from "../jriapp_core/const";
import { IBaseObject, IIndexer, IBindingInfo, IBindingOptions, IBinding, IConverter, IErrorNotification, IValidationInfo } from "../jriapp_core/shared";
import { ERRS } from "../jriapp_core/lang";
import { BaseObject }  from "../jriapp_core/object";
import { SysChecks } from "../jriapp_utils/syschecks";
import { Checks as checks, StringUtils as strUtils, ERROR, CoreUtils as coreUtils, DEBUG } from "../jriapp_utils/coreutils";
import { bootstrap } from "../jriapp_core/bootstrap";
import { Utils as utils } from "../jriapp_utils/utils";
import { parser } from "../jriapp_core/parser";
import { BaseElView } from "../jriapp_elview/elview";

SysChecks._isBinding = (obj: any) => {
    return (!!obj && obj instanceof Binding);
};

const bindModeMap: IIndexer<BINDING_MODE> = {
    OneTime: BINDING_MODE.OneTime,
    OneWay: BINDING_MODE.OneWay,
    TwoWay: BINDING_MODE.TwoWay,
    BackWay: BINDING_MODE.BackWay
};

interface IBindingState {
    source: any;
    target: any;
}

export function getBindingOptions(app: { getConverter(name: string): IConverter; },
    bindInfo: IBindingInfo,
    defaultTarget: IBaseObject,
    defaultSource: any) {
    let bindingOpts: IBindingOptions = {
        mode: BINDING_MODE.OneWay,
        converterParam: null,
        converter: null,
        targetPath: null,
        sourcePath: null,
        target: null,
        source: null,
        isSourceFixed: false
   };

    let fixedSource = bindInfo.source, fixedTarget = bindInfo.target;

    if (!bindInfo.sourcePath && !!bindInfo.to)
        bindingOpts.sourcePath = bindInfo.to;
    else if (!!bindInfo.sourcePath)
        bindingOpts.sourcePath = bindInfo.sourcePath;
    if (!!bindInfo.targetPath)
        bindingOpts.targetPath = bindInfo.targetPath;
    if (!!bindInfo.converterParam)
        bindingOpts.converterParam = bindInfo.converterParam;
    if (!!bindInfo.mode)
        bindingOpts.mode = bindModeMap[bindInfo.mode];

    if (!!bindInfo.converter) {
        if (checks.isString(bindInfo.converter))
            bindingOpts.converter = app.getConverter(bindInfo.converter);
        else
            bindingOpts.converter = bindInfo.converter;
   }


    if (!fixedTarget)
        bindingOpts.target = defaultTarget;
    else {
        if (checks.isString(fixedTarget)) {
            if (fixedTarget === "this")
                bindingOpts.target = defaultTarget;
            else {
                //if no fixed target, then target evaluation starts from this app
                bindingOpts.target = parser.resolveBindingSource(app, parser.getPathParts(fixedTarget));
           }
       }
        else
            bindingOpts.target = fixedTarget;
   }

    if (!fixedSource) {
        //if source is not supplied use defaultSource parameter as source
        bindingOpts.source = defaultSource;
   }
    else {
        bindingOpts.isSourceFixed = true;
        if (checks.isString(fixedSource)) {
            if (fixedSource === "this") {
                bindingOpts.source = defaultTarget;
           }
            else {
                //source evaluation starts from this app
                bindingOpts.source = parser.resolveBindingSource(app, parser.getPathParts(fixedSource));
           }
       }
        else
            bindingOpts.source = fixedSource;
   }

    return bindingOpts;
}

export class Binding extends BaseObject implements IBinding {
    private _state: IBindingState;
    private _mode: BINDING_MODE;
    private _converter: IConverter;
    private _converterParam: any;
    private _srcPath: string[];
    private _tgtPath: string[];
    private _isSourceFixed: boolean;
    private _pathItems: { [key: string]: IBaseObject; };
    private _objId: string;
    private _ignoreSrcChange: boolean;
    private _ignoreTgtChange: boolean;
    private _sourceObj: any;
    private _targetObj: any;
    private _source: any;
    private _target: IBaseObject;
    private _appName: string;

    constructor(options: IBindingOptions, appName?: string) {
        super();
        let opts: IBindingOptions = coreUtils.extend({
            target: null, source: null,
            targetPath: null, sourcePath: null, mode: BINDING_MODE.OneWay,
            converter: null, converterParam: null, isSourceFixed: false
       }, options);

        if (checks.isString(opts.mode)) {
            opts.mode = bindModeMap[opts.mode];
       }

        if (!checks.isString(opts.targetPath)) {
            DEBUG.checkStartDebugger();
            throw new Error(strUtils.format(ERRS.ERR_BIND_TGTPATH_INVALID, opts.targetPath));
       }

        if (checks.isNt(opts.mode)) {
            DEBUG.checkStartDebugger();
            throw new Error(strUtils.format(ERRS.ERR_BIND_MODE_INVALID, opts.mode));
       }

        if (!opts.target) {
            throw new Error(ERRS.ERR_BIND_TARGET_EMPTY);
       }

        if (!SysChecks._isBaseObj(opts.target)) {
            throw new Error(ERRS.ERR_BIND_TARGET_INVALID);
       }

        this._appName = appName;
        this._state = null; //save state - source and target when binding is disabled
        this._mode = opts.mode;
        this._converter = opts.converter || bootstrap._getInternal().getConverter("BaseConverter");
        this._converterParam = opts.converterParam;
        this._srcPath = parser.getPathParts(opts.sourcePath);
        this._tgtPath = parser.getPathParts(opts.targetPath);
        if (this._tgtPath.length < 1)
            throw new Error(strUtils.format(ERRS.ERR_BIND_TGTPATH_INVALID, opts.targetPath));
        this._isSourceFixed = (!!opts.isSourceFixed);
        this._pathItems = {};
        this._objId = "bnd" + coreUtils.getNewID();
        this._ignoreSrcChange = false;
        this._ignoreTgtChange = false;
        this._sourceObj = null;
        this._targetObj = null;
        this._source = null;
        this._target = null;
        this.target = opts.target;
        this.source = opts.source;
        let err_notif = utils.getErrorNotification(this._sourceObj);
        if (!!err_notif && err_notif.getIsHasErrors())
            this._onSrcErrorsChanged(err_notif);
   }
    private static _isDestroyed(obj: any): boolean {
        let res = false;
        if (SysChecks._isBaseObj(obj)) {
            res = (<IBaseObject>obj).getIsDestroyCalled();
       }
        return res;
   }
    private _onSrcErrorsChanged(err_notif: IErrorNotification, args?: any) {
        let errors: IValidationInfo[] = [], tgt = this._targetObj, src = this._sourceObj, srcPath = this._srcPath;
        if (!!tgt && SysChecks._isElView(tgt)) {
            if (!!src && srcPath.length > 0) {
                let prop = srcPath[srcPath.length - 1];
                errors = err_notif.getFieldErrors(prop);
           }
            (<BaseElView>tgt).validationErrors = errors;
       }
   }
    private _getTgtChangedFn(self: Binding, obj: any, prop: string, restPath: string[], lvl: number) {
        let fn = function (sender: any, data: any) {
            let val = parser.resolveProp(obj, prop);
            if (restPath.length > 0) {
                self._setPathItem(null, BindTo.Target, lvl, restPath);
           }
            //bind and trigger target update
            self._parseTgtPath(val, restPath, lvl);
       };
        return fn;
   }
    private _getSrcChangedFn(self: Binding, obj: any, prop: string, restPath: string[], lvl: number) {
        let fn = function (sender: any, data: any) {
            let val = parser.resolveProp(obj, prop);
            if (restPath.length > 0) {
                self._setPathItem(null, BindTo.Source, lvl, restPath);
           }
            self._parseSrcPath(val, restPath, lvl);
       };
        return fn;
   }
    private _parseSrcPath(obj: any, path: string[], lvl: number) {
        let self = this;
        self._sourceObj = null;
        if (path.length === 0) {
            self._sourceObj = obj;
       }
        else
            self._parseSrcPath2(obj, path, lvl);

        if (self._mode === BINDING_MODE.BackWay) {
            if (!!self._sourceObj)
                self._updateSource();
       }
        else {
            if (!!self._targetObj)
                self._updateTarget();
       }
   }
    private _parseSrcPath2(obj: any, path: string[], lvl: number) {
        let self = this, nextObj: any, isBaseObj = (!!obj && SysChecks._isBaseObj(obj)), isValidProp: boolean;

        if (isBaseObj) {
            (<IBaseObject>obj).addOnDestroyed(self._onSrcDestroyed, self._objId, self);
            self._setPathItem(obj, BindTo.Source, lvl, path);
       }

        if (path.length > 1) {
            if (isBaseObj) {
                (<IBaseObject>obj).addOnPropertyChange(path[0], self._getSrcChangedFn(self, obj, path[0], path.slice(1), lvl + 1), self._objId);
           }

            if (!!obj) {
                nextObj = parser.resolveProp(obj, path[0]);
                if (!!nextObj) {
                    self._parseSrcPath2(nextObj, path.slice(1), lvl + 1);
               }
                else if (checks.isUndefined(nextObj)) {
                    if (DEBUG.isDebugging()) {
                        DEBUG.checkStartDebugger();
                        bootstrap._getInternal().onUnResolvedBinding(BindTo.Source, self.source, self._srcPath.join("."), path[0]);
                   }
               }
           }
            return;
       }

        if (!!obj && path.length === 1) {
            isValidProp = true;
            if (DEBUG.isDebugging())
                isValidProp = isBaseObj ? (<IBaseObject>obj)._isHasProp(path[0]) : checks.isHasProp(obj, path[0]);

            if (isValidProp) {
                let updateOnChange = isBaseObj && (self._mode === BINDING_MODE.OneWay || self._mode === BINDING_MODE.TwoWay);
                if (updateOnChange) {
                    (<IBaseObject>obj).addOnPropertyChange(path[0], self._updateTarget, self._objId, self);
               }
                let err_notif = utils.getErrorNotification(obj);
                if (!!err_notif) {
                    err_notif.addOnErrorsChanged(self._onSrcErrorsChanged, self._objId, self);
               }
                self._sourceObj = obj;
           }
            else {
                DEBUG.checkStartDebugger();
                bootstrap._getInternal().onUnResolvedBinding(BindTo.Source, self.source, self._srcPath.join("."), path[0]);
           }
       }
   }
    private _parseTgtPath(obj: any, path: string[], lvl: number) {
        let self = this;
        self._targetObj = null;
        if (path.length === 0) {
            self._targetObj = obj;
       }
        else
            self._parseTgtPath2(obj, path, lvl);

        if (self._mode === BINDING_MODE.BackWay) {
            if (!!self._sourceObj)
                self._updateSource();
       }
        else {
            //if new target then update target (not source!)
            if (!!self._targetObj)
                self._updateTarget();
       }
   }
    private _parseTgtPath2(obj: any, path: string[], lvl: number) {
        let self = this, nextObj: any, isBaseObj = (!!obj && SysChecks._isBaseObj(obj)), isValidProp: boolean = false;

        if (isBaseObj) {
            (<IBaseObject>obj).addOnDestroyed(self._onTgtDestroyed, self._objId, self);
            self._setPathItem(obj, BindTo.Target, lvl, path);
       }

        if (path.length > 1) {
            if (isBaseObj) {
                (<IBaseObject>obj).addOnPropertyChange(path[0], self._getTgtChangedFn(self, obj, path[0], path.slice(1), lvl + 1), self._objId, self);
           }
            if (!!obj) {
                nextObj = parser.resolveProp(obj, path[0]);
                if (!!nextObj) {
                    self._parseTgtPath2(nextObj, path.slice(1), lvl + 1);
               }
                else if (checks.isUndefined(nextObj)) {
                    if (DEBUG.isDebugging()) {
                        DEBUG.checkStartDebugger();
                        bootstrap._getInternal().onUnResolvedBinding(BindTo.Target, self.target, self._tgtPath.join("."), path[0]);
                   }
               }
           }
            return;
       }

        if (!!obj && path.length === 1) {
            isValidProp = true;
            if (DEBUG.isDebugging())
                isValidProp = isBaseObj ? (<IBaseObject>obj)._isHasProp(path[0]) : checks.isHasProp(obj, path[0]);

            if (isValidProp) {
                let updateOnChange = isBaseObj && (self._mode === BINDING_MODE.TwoWay || self._mode === BINDING_MODE.BackWay);
                if (updateOnChange) {
                    (<IBaseObject>obj).addOnPropertyChange(path[0], self._updateSource, self._objId, self);
               }
                self._targetObj = obj;
           }
            else {
                DEBUG.checkStartDebugger();
                bootstrap._getInternal().onUnResolvedBinding(BindTo.Target, self.target, self._tgtPath.join("."), path[0]);
           }
       }
   }
    private _setPathItem(newObj: IBaseObject, bindingTo: BindTo, lvl: number, path: string[]) {
        let oldObj: IBaseObject, key: string, len: number = lvl + path.length;
        for (let i = lvl; i < len; i += 1) {
            switch (bindingTo) {
                case BindTo.Source:
                    key = "s" + i;
                    break;
                case BindTo.Target:
                    key = "t" + i;
                    break;
                default:
                    throw new Error(strUtils.format(ERRS.ERR_PARAM_INVALID, "bindingTo", bindingTo));
           }

            oldObj = this._pathItems[key];
            if (!!oldObj) {
                this._cleanUpObj(oldObj);
                delete this._pathItems[key];
           }

            if (!!newObj && i === lvl) {
                this._pathItems[key] = newObj;
           }
       }
   }
    private _cleanUpObj(oldObj: IBaseObject) {
        if (!!oldObj) {
            oldObj.removeNSHandlers(this._objId);
            let err_notif = utils.getErrorNotification(oldObj);
            if (!!err_notif) {
                err_notif.removeOnErrorsChanged(this._objId);
           }
       }
   }
    private _onTgtDestroyed(sender: any, args: any) {
        if (this._isDestroyCalled)
            return;
        this._setTarget(null);
   }
    private _onSrcDestroyed(sender: any, args: any) {
        let self = this;
        if (self._isDestroyCalled)
            return;
        if (sender === self.source)
            self._setSource(null);
        else {
            self._setPathItem(null, BindTo.Source, 0, self._srcPath);
            setTimeout(function () {
                if (self._isDestroyCalled)
                    return;
                //rebind after the source destroy is fully completed
                self._bindToSource();
           }, 0);
       }
   }
    private _bindToSource() {
        this._parseSrcPath(this.source, this._srcPath, 0);
   }
    private _bindToTarget() {
        this._parseTgtPath(this.target, this._tgtPath, 0);
   }
    private _updateTarget(sender?: any, args?: any) {
        if (this._ignoreSrcChange || this._isDestroyCalled)
            return;
        this._ignoreTgtChange = true;
        try {
            let res = this._converter.convertToTarget(this.sourceValue, this._converterParam, this._sourceObj);
            if (res !== undefined)
                this.targetValue = res;
       }
        catch (ex) {
            if (this._mode === BINDING_MODE.BackWay) {
                //resync
                this._updateSource();
           }
            ERROR.reThrow(ex, this.handleError(ex, this));
       }
        finally {
            this._ignoreTgtChange = false;
       }
   }
    private _updateSource(sender?: any, args?: any) {
        if (this._ignoreTgtChange || this._isDestroyCalled)
            return;
        this._ignoreSrcChange = true;
        try {
            let res = this._converter.convertToSource(this.targetValue, this._converterParam, this._sourceObj);
            if (res !== undefined)
                this.sourceValue = res;
       }
        catch (ex) {
            if (!SysChecks._isValidationError(ex) || !SysChecks._isElView(this._targetObj)) {
                //BaseElView is notified about errors in _onSrcErrorsChanged event handler
                //we only need to invoke _onError in other cases
                //1) when target is not BaseElView
                //2) when error is not ValidationError
                this._ignoreSrcChange = false;
                if (this._mode !== BINDING_MODE.BackWay) {
                    //resync
                    this._updateTarget();
               }
                if (!this.handleError(ex, this))
                    throw ex;
           }
       }
        finally {
            this._ignoreSrcChange = false;
       }
   }
    protected _setTarget(value: any) {
        if (!!this._state) {
            this._state.target = value;
            return;
       }
        if (this._target !== value) {
            if (!!this._targetObj) {
                this._ignoreTgtChange = true;
                try {
                    this.targetValue = null;
               }
                finally {
                    this._ignoreTgtChange = false;
               }
           }
            this._setPathItem(null, BindTo.Target, 0, this._tgtPath);
            if (!!value && !SysChecks._isBaseObj(value))
                throw new Error(ERRS.ERR_BIND_TARGET_INVALID);
            this._target = value;
            this._bindToTarget();
            if (!!this._target && !this._targetObj)
                throw new Error(strUtils.format(ERRS.ERR_BIND_TGTPATH_INVALID, this._tgtPath.join(".")));
       }
   }
    protected _setSource(value: any) {
        if (!!this._state) {
            this._state.source = value;
            return;
       }
        if (this._source !== value) {
            this._setPathItem(null, BindTo.Source, 0, this._srcPath);
            this._source = value;
            this._bindToSource();
       }
   }
    handleError(error: any, source: any): boolean {
        let isHandled = super.handleError(error, source);
        if (!isHandled) {
            if (!!this._appName) {
                return bootstrap.findApp(this._appName).handleError(error, source);
           }
            else
                return bootstrap.handleError(error, source);
       }
        return isHandled;
   }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        let self = this;
        coreUtils.forEachProp(this._pathItems, function (key) {
            let old = self._pathItems[key];
            self._cleanUpObj(old);
       });
        this._pathItems = {};
        this._setSource(null);
        this._setTarget(null);
        this._state = null;
        this._converter = null;
        this._converterParam = null;
        this._srcPath = null;
        this._tgtPath = null;
        this._sourceObj = null;
        this._targetObj = null;
        this._source = null;
        this._target = null;
        super.destroy();
   }
    toString() {
        return "Binding";
   }

    get bindingID() {
        return this._objId;
   }
    get target() { return this._target; }
    set target(v: IBaseObject) {
        this._setTarget(v);
   }
    get source() { return this._source; }
    set source(v) {
        this._setSource(v);
   }
    get targetPath() { return this._tgtPath; }
    get sourcePath() { return this._srcPath; }
    get sourceValue() {
        if (this._srcPath.length === 0)
            return this._sourceObj;
        if (!this._sourceObj)
            return undefined;
        let prop = this._srcPath[this._srcPath.length - 1];
        let res = parser.resolveProp(this._sourceObj, prop);
        return res;
   }
    set sourceValue(v) {
        if (this._srcPath.length === 0 || !this._sourceObj)
            return;
        if (Binding._isDestroyed(this._sourceObj))
            return;
        let prop = this._srcPath[this._srcPath.length - 1];
        parser.setPropertyValue(this._sourceObj, prop, v);
   }
    get targetValue() {
        if (!this._targetObj)
            return undefined;
        let prop = this._tgtPath[this._tgtPath.length - 1];
        return parser.resolveProp(this._targetObj, prop);
   }
    set targetValue(v) {
        if (this._tgtPath.length === 0 || !this._targetObj)
            return;
        if (Binding._isDestroyed(this._targetObj))
            return;
        let prop = this._tgtPath[this._tgtPath.length - 1];
        parser.setPropertyValue(this._targetObj, prop, v);
   }
    get mode() { return this._mode; }
    get converter() { return this._converter; }
    set converter(v: IConverter) { this._converter = v; }
    get converterParam() { return this._converterParam; }
    set converterParam(v) { this._converterParam = v; }
    get isSourceFixed() { return this._isSourceFixed; }
    get isDisabled() { return !!this._state; }
    set isDisabled(v) {
        let s: IBindingState;
        v = !!v;
        if (this.isDisabled !== v) {
            if (v) {
                //going to disabled state
                s = { source: this._source, target: this._target };
                try {
                    this.target = null;
                    this.source = null;
               }
                finally {
                    this._state = s;
               }
           }
            else {
                //restoring from disabled state
                s = this._state;
                this._state = null;
                this._setTarget(s.target);
                this._setSource(s.source);
           }
       }
   }
    get appName() { return this._appName; }
}