import * as RIAPP from "jriapp";
import * as dbMOD from "jriapp_db";
import * as uiMOD from "jriapp_ui";
import * as ANIMATION from "./animation";

export class MainViewVM extends RIAPP.BaseObject {
    private _custTemplName: string;
    private _custDetTemplName: string;
    private _viewName: string;
    private _animation: uiMOD.IDynaContentAnimation;

    constructor() {
        super();
        this._custTemplName = 'SPAcustTemplate';
        this._custDetTemplName = 'SPAcustDetailTemplate';
        this._viewName = this._custTemplName;
        this._animation = new ANIMATION.FadeAnimation(true);
    }
    goToAllCust() {
        this.viewName = this.custTemplName;
    }
    goToCustDet() {
        this.viewName = this.custDetTemplName;
    }
    reset() {
        this.viewName = this._custTemplName;
    }
    get animation() { return this._animation; }
    set animation(v) {
        if (v !== this._animation) {
            this._animation = v;
            this.raisePropertyChanged('animation');
        }
    }
    get viewName() { return this._viewName; }
    set viewName(v) {
        if (v !== this._viewName) {
            this._viewName = v;
            this.raisePropertyChanged('viewName');
        }
    }
    get custTemplName() { return this._custTemplName; }
    get custDetTemplName() { return this._custDetTemplName; }
}

export class CustDetViewVM extends RIAPP.BaseObject {
    private _infoTemplName: string;
    private _adrTemplName: string;
    private _viewName: string;
    private _animation: uiMOD.IDynaContentAnimation;

    constructor() {
        super();
        this._infoTemplName = 'customerInfo';
        this._adrTemplName = 'customerAddr';
        this._viewName = this._infoTemplName;
        this._animation = new ANIMATION.SlideAnimation(false);
    }
    goToCustInfo() {
        this.viewName = this.infoTemplName;
    }
    goToAdrInfo() {
        this.viewName = this.adrTemplName;
    }
    reset() {
        this.viewName = this._infoTemplName;
    }
    get animation() { return this._animation; }
    set animation(v) {
        if (v !== this._animation) {
            this._animation = v;
            this.raisePropertyChanged('animation');
        }
    }
    get viewName() { return this._viewName; }
    set viewName(v) {
        if (v !== this._viewName) {
            this._viewName = v;
            this.raisePropertyChanged('viewName');
        }
    }
    get infoTemplName() { return this._infoTemplName; }
    get adrTemplName() { return this._adrTemplName; }
}

export class AddrViewVM extends RIAPP.BaseObject {
    private _linkAdrTemplate: string;
    private _newAdrTemplate: string;
    private _viewName: string;
    constructor() {
        super();
        this._linkAdrTemplate = 'linkAdrTemplate';
        this._newAdrTemplate = 'newAdrTemplate';
        this._viewName = this._linkAdrTemplate;
    }
    goToLinkAdr() {
        this.viewName = this.linkAdrTemplate;
    }
    goToNewAdr() {
        this.viewName = this.newAdrTemplate;
    }
    get viewName() { return this._viewName; }
    set viewName(v) {
        if (v !== this._viewName) {
            this._viewName = v;
            this.raisePropertyChanged('viewName');
        }
    }
    get linkAdrTemplate() { return this._linkAdrTemplate; }
    get newAdrTemplate() { return this._newAdrTemplate; }
}