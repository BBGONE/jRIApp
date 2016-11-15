/** The MIT License (MIT) Copyright(c) 2016 Maxim V.Tsapov */
import { BINDING_MODE, BindTo } from "./const";
import {
    IBaseObject, IIndexer, IBindingInfo, IBindingOptions,
    IBinding, IConverter, IErrorNotification, IValidationInfo, IApplication, IElView
} from "./shared";
import { ERRS } from "./lang";
import { BaseObject }  from "./object";
import { baseConverter } from "./converter";
import { bootstrap } from "./bootstrap";
import { parser } from "./parser";
import { Utils } from "../jriapp_utils/utils";

const utils = Utils, checks = utils.check, strUtils = utils.str, coreUtils = utils.core,
    sys = utils.sys, debug = utils.debug, log = utils.log,
    parse = parser, boot = bootstrap;

sys.isBinding = (obj: any) => {
    return (!!obj && obj instanceof Binding);
};

/**
 * Unresolved binding - property path is invalid or source is empty
 */
function fn_reportUnResolved(bindTo: BindTo, root: any, path: string, propName: string): void {
    if (!debug.isDebugging()) {
        return;
    }
    debug.checkStartDebugger();
    let msg = "Unresolved data binding for ";
    if (bindTo === BindTo.Source) {
        msg += " Source: "
    }
    else {
        msg += " Target: "
    }
    msg += "'" + root + "'";
    msg += ", property: '" + propName + "'";
    msg += ", binding path: '" + path + "'";

    log.error(msg);
}

/**
 * Maximum recursion exceeded
 */
function fn_reportMaxRec(bindTo: BindTo, src: any, tgt: any, spath: string, tpath: string): void {
    if (!debug.isDebugging()) {
        return;
    }
    debug.checkStartDebugger();
    let msg = "Maximum recursion exceeded for ";
    if (bindTo === BindTo.Source) {
        msg += "Updating Source value: "
    }
    else {
        msg += "Updating Target value: "
    }
    msg += " source:'" + src + "'";
    msg += ", target:'" + tgt + "'";
    msg += ", source path: '" + spath + "'";
    msg += ", target path: '" + tpath + "'";

    log.error(msg);
}

let _newID = 0;
function getNewID(): string {
    let id = "$bnd" + _newID;
    _newID += 1;
    return id;
}

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

export function getBindingOptions(
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

    let converter: IConverter, app = boot.getApp();

    if (checks.isString(bindInfo.converter)) {
        converter = app.getConverter(bindInfo.converter);
    }
    else {
        converter = bindInfo.converter;
    }

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

    if (!!converter) {
        bindingOpts.converter = converter;
    }

    if (!fixedTarget)
    {
        bindingOpts.target = defaultTarget;
    }
    else {
        if (checks.isString(fixedTarget)) {
            if (fixedTarget === "this")
                bindingOpts.target = defaultTarget;
            else {
                //if no fixed target, then target evaluation starts from this app
                bindingOpts.target = parse.resolveBindingSource(app, parse.getPathParts(fixedTarget));
            }
        }
        else {
            bindingOpts.target = fixedTarget;
        }
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
                bindingOpts.source = parse.resolveBindingSource(app, parse.getPathParts(fixedSource));
            }
        }
        else {
            bindingOpts.source = fixedSource;
        }
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
    private _srcFixed: boolean;
    private _pathItems: IIndexer<IBaseObject>;
    private _objId: string;
    //the last object in the source path
    private _srcEnd: any;
    //the last object in the target path
    private _tgtEnd: any;
    private _source: any;
    private _target: IBaseObject;
    private _umask: number;
    private _cntUtgt: number;
    private _cntUSrc: number;

    constructor(options: IBindingOptions) {
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
            debug.checkStartDebugger();
            throw new Error(strUtils.format(ERRS.ERR_BIND_TGTPATH_INVALID, opts.targetPath));
        }

        if (checks.isNt(opts.mode)) {
            debug.checkStartDebugger();
            throw new Error(strUtils.format(ERRS.ERR_BIND_MODE_INVALID, opts.mode));
        }

        if (!opts.target) {
            throw new Error(ERRS.ERR_BIND_TARGET_EMPTY);
        }

        if (!sys.isBaseObj(opts.target)) {
            throw new Error(ERRS.ERR_BIND_TARGET_INVALID);
        }

        //save the state - source and target, when the binding is disabled
        this._state = null; 
        this._mode = opts.mode;
        this._converter = !opts.converter ? null : opts.converter;
        this._converterParam = opts.converterParam;
        this._srcPath = parse.getPathParts(opts.sourcePath);
        this._tgtPath = parse.getPathParts(opts.targetPath);
        if (this._tgtPath.length < 1)
            throw new Error(strUtils.format(ERRS.ERR_BIND_TGTPATH_INVALID, opts.targetPath));
        this._srcFixed = (!!opts.isSourceFixed);
        this._pathItems = {};
        this._objId = getNewID();
        this._srcEnd = null;
        this._tgtEnd = null;
        this._source = null;
        this._target = null;
        //a mask indicating to update update the target or the source or both
        this._umask = 0;
        this._cntUtgt = 0;
        this._cntUSrc = 0;
        this._setTarget(opts.target);
        this._setSource(opts.source);
        this._update();

        let err_notif = sys.getErrorNotification(this._srcEnd);
        if (!!err_notif && err_notif.getIsHasErrors())
            this._onSrcErrChanged(err_notif);
    }
    private _update(): void {
        const umask = this._umask, MAX_REC= 3;
        let flag = 0;
        this._umask = 0;

        if (this._mode === BINDING_MODE.BackWay) {
            if (!!(umask & 1)) {
                flag = 1;
            }
        }
        else {
            if (!!(umask & 2)) {
                flag = 2;
            }
            else if (!!(umask & 1) && (this._mode === BINDING_MODE.TwoWay)) {
                flag = 1;
            }
        }

        switch (flag) {
            case 1:
                if (this._cntUtgt === 0) {
                    if (this._cntUSrc < MAX_REC) {
                        this._cntUSrc += 1;
                        try {
                            this._updateSource();
                        }
                        finally {
                            this._cntUSrc -= 1;
                        }
                    }
                    else {
                        fn_reportMaxRec(BindTo.Source, this._source, this._target, this._srcPath.join("."), this._tgtPath.join("."))
                    }
                }
                break;
            case 2:
                if (this._cntUSrc === 0) {
                    if (this._cntUtgt < MAX_REC) {
                        this._cntUtgt += 1;
                        try {
                            this._updateTarget();
                        }
                        finally {
                            this._cntUtgt -= 1;
                        }
                    }
                    else {
                        fn_reportMaxRec(BindTo.Target, this._source, this._target, this._srcPath.join("."), this._tgtPath.join("."))
                    }
                }
                break;
        }
    }
    private _onSrcErrChanged(err_notif: IErrorNotification, args?: any) {
        let errors: IValidationInfo[] = [], tgt = this._tgtEnd, src = this._srcEnd, srcPath = this._srcPath;
        if (!!tgt && sys.isElView(tgt)) {
            if (!!src && srcPath.length > 0) {
                let prop = srcPath[srcPath.length - 1];
                errors = err_notif.getFieldErrors(prop);
            }
            (<IElView>tgt).validationErrors = errors;
        }
    }
    private _getTgtChangedFn(self: Binding, obj: any, prop: string, restPath: string[], lvl: number) {
        let fn = function (sender: any, data: any) {
            let val = parse.resolveProp(obj, prop);
            if (restPath.length > 0) {
                self._setPathItem(null, BindTo.Target, lvl, restPath);
            }
            //bind and trigger target update
            self._parseTgt(val, restPath, lvl);
            self._update();
        };
        return fn;
    }
    private _getSrcChangedFn(self: Binding, obj: any, prop: string, restPath: string[], lvl: number) {
        let fn = function (sender: any, data: any) {
            let val = parse.resolveProp(obj, prop);
            if (restPath.length > 0) {
                self._setPathItem(null, BindTo.Source, lvl, restPath);
            }
            self._parseSrc(val, restPath, lvl);
            self._update();
        };
        return fn;
    }
    private _parseSrc(obj: any, path: string[], lvl: number) {
        let self = this;
        self._srcEnd = null;
        if (path.length === 0) {
            self._srcEnd = obj;
        }
        else {
            self._parseSrc2(obj, path, lvl);
        }

        if (self._mode === BINDING_MODE.BackWay) {
            if (!!self._srcEnd)
                self._umask |= 1;
        }
        else {
            if (!!self._tgtEnd)
                self._umask |= 2;
        }
    }
    private _parseSrc2(obj: any, path: string[], lvl: number) {
        let self = this, nextObj: any, isBaseObj = (!!obj && sys.isBaseObj(obj)), isValidProp: boolean;

        if (isBaseObj) {
            (<IBaseObject>obj).addOnDestroyed(self._onSrcDestroyed, self._objId, self);
            self._setPathItem(obj, BindTo.Source, lvl, path);
        }

        if (path.length > 1) {
            if (isBaseObj) {
                (<IBaseObject>obj).addOnPropertyChange(path[0],
                    self._getSrcChangedFn(self, obj, path[0], path.slice(1), lvl + 1),
                    self._objId);
            }

            if (!!obj) {
                nextObj = parse.resolveProp(obj, path[0]);
                if (!!nextObj) {
                    self._parseSrc2(nextObj, path.slice(1), lvl + 1);
                }
                else if (checks.isUndefined(nextObj)) {
                    fn_reportUnResolved(BindTo.Source, self.source, self._srcPath.join("."), path[0]);
                }
            }
            return;
        }

        if (!!obj && path.length === 1) {
            isValidProp = true;
            if (debug.isDebugging())
                isValidProp = isBaseObj ? (<IBaseObject>obj)._isHasProp(path[0]) : checks.isHasProp(obj, path[0]);

            if (isValidProp) {
                let updateOnChange = isBaseObj && (self._mode === BINDING_MODE.OneWay || self._mode === BINDING_MODE.TwoWay);
                if (updateOnChange) {
                    (<IBaseObject>obj).addOnPropertyChange(path[0], () => {
                        if (!!self._tgtEnd) {
                            self._umask |= 2;
                            self._update();
                        }
                    }, self._objId);
                }
                let err_notif = sys.getErrorNotification(obj);
                if (!!err_notif) {
                    err_notif.addOnErrorsChanged(self._onSrcErrChanged, self._objId, self);
                }
                self._srcEnd = obj;
            }
            else {
                fn_reportUnResolved(BindTo.Source, self.source, self._srcPath.join("."), path[0]);
            }
        }
    }
    private _parseTgt(obj: any, path: string[], lvl: number) {
        let self = this;
        self._tgtEnd = null;
        if (path.length === 0) {
            self._tgtEnd = obj;
        }
        else {
            self._parseTgt2(obj, path, lvl);
        }

        if (self._mode === BINDING_MODE.BackWay) {
            if (!!self._srcEnd)
                this._umask |= 1;
        }
        else {
            //if new target then update the target (not the source!)
            if (!!self._tgtEnd)
                this._umask |= 2;
        }
    }
    private _parseTgt2(obj: any, path: string[], lvl: number) {
        let self = this, nextObj: any, isBaseObj = sys.isBaseObj(obj), isValidProp = false;

        if (isBaseObj) {
            (<IBaseObject>obj).addOnDestroyed(self._onTgtDestroyed, self._objId, self);
            self._setPathItem(obj, BindTo.Target, lvl, path);
        }

        if (path.length > 1) {
            if (isBaseObj) {
                (<IBaseObject>obj).addOnPropertyChange(path[0],
                    self._getTgtChangedFn(self, obj, path[0], path.slice(1), lvl + 1),
                    self._objId);
            }
            if (!!obj) {
                nextObj = parse.resolveProp(obj, path[0]);
                if (!!nextObj) {
                    self._parseTgt2(nextObj, path.slice(1), lvl + 1);
                }
                else if (checks.isUndefined(nextObj)) {
                    fn_reportUnResolved(BindTo.Target, self.target, self._tgtPath.join("."), path[0]);
                }
            }
            return;
        }

        if (!!obj && path.length === 1) {
            isValidProp = true;
            if (debug.isDebugging()) {
                isValidProp = isBaseObj ? (<IBaseObject>obj)._isHasProp(path[0]) : checks.isHasProp(obj, path[0]);
            }

            if (isValidProp) {
                let updateOnChange = isBaseObj && (self._mode === BINDING_MODE.TwoWay || self._mode === BINDING_MODE.BackWay);
                if (updateOnChange) {
                    (<IBaseObject>obj).addOnPropertyChange(path[0], () => {
                        if (!!self._srcEnd) {
                            self._umask |= 1;
                            self._update();
                        }
                    }, self._objId);
                }
                self._tgtEnd = obj;
            }
            else {
                fn_reportUnResolved(BindTo.Target, self.target, self._tgtPath.join("."), path[0]);
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
                this._cleanUp(oldObj);
                delete this._pathItems[key];
            }

            if (!!newObj && i === lvl) {
                this._pathItems[key] = newObj;
            }
        }
    }
    private _cleanUp(obj: IBaseObject) {
        if (!!obj) {
            obj.removeNSHandlers(this._objId);
            let err_notif = sys.getErrorNotification(obj);
            if (!!err_notif) {
                err_notif.removeOnErrorsChanged(this._objId);
            }
        }
    }
    private _onTgtDestroyed(sender: any, args: any) {
        if (this.getIsDestroyCalled())
            return;
        this._setTarget(null);
        this._update();
    }
    private _onSrcDestroyed(sender: any, args: any) {
        let self = this;
        if (self.getIsDestroyCalled())
            return;
        if (sender === self.source)
        {
            self._setSource(null);
            self._update();
        }
        else {
            self._setPathItem(null, BindTo.Source, 0, self._srcPath);
            setTimeout(function () {
                if (self.getIsDestroyCalled())
                    return;
                //rebind after the source is destroyed
                self._parseSrc(self.source, self._srcPath, 0);
                self._update();
            }, 0);
        }
    }
    private _updateTarget(sender?: any, args?: any) {
        if (this.getIsDestroyCalled())
            return;
        try {
            if (!this._converter)
                this.targetValue = this.sourceValue;
            else
                this.targetValue = this._converter.convertToTarget(this.sourceValue, this._converterParam, this._srcEnd);
        }
        catch (ex) {
            utils.err.reThrow(ex, this.handleError(ex, this));
        }
    }
    private _updateSource(sender?: any, args?: any) {
        if (this.getIsDestroyCalled())
            return;
        try {
            if (!this._converter)
                this.sourceValue = this.targetValue;
            else
                this.sourceValue = this._converter.convertToSource(this.targetValue, this._converterParam, this._srcEnd);
        }
        catch (ex) {
            if (!sys.isValidationError(ex) || !sys.isElView(this._tgtEnd)) {
                //BaseElView is notified about errors in _onSrcErrorsChanged event handler
                //we only need to invoke _onError in other cases
                //1) when target is not BaseElView
                //2) when error is not ValidationError
                utils.err.reThrow(ex, this.handleError(ex, this));
            }
        }
    }
    protected _setTarget(value: any) {
        if (!!this._state) {
            this._state.target = value;
            return;
        }

        if (this._target !== value) {
            if (!!this._tgtEnd && !(this._mode === BINDING_MODE.BackWay)) {
                this._cntUtgt += 1;
                try {
                    this.targetValue = null;
                }
                finally {
                    this._cntUtgt -= 1;
                    //sanity check
                    if (this._cntUtgt < 0)
                        throw new Error("Invalid operation: this._cntUtgt = " + this._cntUtgt);
                }
            }
            this._setPathItem(null, BindTo.Target, 0, this._tgtPath);
            if (!!value && !sys.isBaseObj(value))
                throw new Error(ERRS.ERR_BIND_TARGET_INVALID);
            this._target = value;
            this._parseTgt(this._target, this._tgtPath, 0);
            if (!!this._target && !this._tgtEnd)
                throw new Error(strUtils.format(ERRS.ERR_BIND_TGTPATH_INVALID, this._tgtPath.join(".")));
        }
    }
    protected _setSource(value: any) {
        if (!!this._state) {
            this._state.source = value;
            return;
        }

        if (this._source !== value) {
            if (!!this._srcEnd && (this._mode === BINDING_MODE.BackWay)) {
                this._cntUSrc += 1;
                try {
                    this.sourceValue = null;
                }
                finally {
                    this._cntUSrc -= 1;
                    //sanity check
                    if (this._cntUSrc < 0)
                        throw new Error("Invalid operation: this._cntUSrc = " + this._cntUSrc);
                }
            }
            this._setPathItem(null, BindTo.Source, 0, this._srcPath);
            this._source = value;
            this._parseSrc(this._source, this._srcPath, 0);
        }
    }
    destroy() {
        if (this._isDestroyed)
            return;
        this._isDestroyCalled = true;
        let self = this;
        coreUtils.iterateIndexer(this._pathItems, function (key, old) {
            self._cleanUp(old);
        });
        this._pathItems = {};
        this._setSource(null);
        this._setTarget(null);
        this._state = null;
        this._converter = null;
        this._converterParam = null;
        this._srcPath = null;
        this._tgtPath = null;
        this._srcEnd = null;
        this._tgtEnd = null;
        this._source = null;
        this._target = null;
        this._umask = 0;
        super.destroy();
    }
    toString() {
        return "Binding";
    }

    get uniqueID() {
        return this._objId;
    }
    get target() { return this._target; }
    set target(v: IBaseObject) {
        this._setTarget(v);
        this._update();
    }
    get source() { return this._source; }
    set source(v) {
        this._setSource(v);
        this._update();
    }
    get targetPath() { return this._tgtPath; }
    get sourcePath() { return this._srcPath; }
    get sourceValue() {
        let res: any = null;
        if (this._srcPath.length === 0)
            res = this._srcEnd;
        if (!!this._srcEnd) {
            let prop = this._srcPath[this._srcPath.length - 1];
            res = parse.resolveProp(this._srcEnd, prop);
        }
        return res;
    }
    set sourceValue(v) {
        if (this._srcPath.length === 0 || !this._srcEnd || v === checks.undefined)
            return;
        const prop = this._srcPath[this._srcPath.length - 1];
        parse.setPropertyValue(this._srcEnd, prop, v);
    }
    get targetValue() {
        let res: any = null;
        if (!!this._tgtEnd) {
            let prop = this._tgtPath[this._tgtPath.length - 1];
            res = parse.resolveProp(this._tgtEnd, prop);
        }
        return res;
    }
    set targetValue(v) {
        if (this._tgtPath.length === 0 || !this._tgtEnd || v === checks.undefined)
            return;
        const prop = this._tgtPath[this._tgtPath.length - 1];
        parse.setPropertyValue(this._tgtEnd, prop, v);
    }
    get mode() { return this._mode; }
    get converter() { return this._converter; }
    set converter(v: IConverter) { this._converter = v; }
    get converterParam() { return this._converterParam; }
    set converterParam(v) { this._converterParam = v; }
    get isSourceFixed() { return this._srcFixed; }
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
                this._update();
            }
        }
    }
}