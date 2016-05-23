var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "jriapp", "jriapp_db", "jriapp_ui", "./demoDB", "./common", "./autocomplete"], function (require, exports, RIAPP, dbMOD, uiMOD, DEMODB, COMMON, AUTOCOMPLETE) {
    "use strict";
    var bootstrap = RIAPP.bootstrap, utils = RIAPP.Utils, $ = utils.dom.$;
    var CustomerVM = (function (_super) {
        __extends(CustomerVM, _super);
        function CustomerVM(app) {
            _super.call(this, app);
            var self = this;
            this._dbSet = this.dbSets.Customer;
            this._dbSet.isSubmitOnDelete = true;
            this._dbSet.addOnPropertyChange('currentItem', function (sender, args) {
                self._onCurrentChanged();
            }, self.uniqueID);
            this._dbSet.addOnItemDeleting(function (s, a) {
                if (!confirm('Are you sure that you want to delete customer ?'))
                    a.isCancel = true;
            }, self.uniqueID);
            this._dbSet.addOnEndEdit(function (sender, args) {
                if (!args.isCanceled) {
                    self.dbContext.submitChanges();
                }
            }, self.uniqueID);
            this._dbSet.addOnFill(function (sender, args) {
                self.raiseEvent('data_filled', args);
            }, self.uniqueID);
            this._dbSet.addOnItemAdded(function (s, args) {
                args.item.NameStyle = false;
                args.item.ComplexProp.LastName = "DummyLastName";
                args.item.ComplexProp.FirstName = "DummyFirstName";
            });
            this._dbSet.addOnItemAdded(function (sender, args) {
                var item = args.item;
                item.NameStyle = false;
            }, self.uniqueID);
            this._addNewCommand = new RIAPP.Command(function (sender, param) {
                self._dbSet.addNew();
            }, self, function (sender, param) {
                return true;
            });
            this._saveCommand = new RIAPP.Command(function (sender, param) {
                self.dbContext.submitChanges();
            }, self, function (s, p) {
                return self.dbContext.isHasChanges;
            });
            this._undoCommand = new RIAPP.Command(function (sender, param) {
                self.dbContext.rejectChanges();
            }, self, function (s, p) {
                return self.dbContext.isHasChanges;
            });
            this._loadCommand = new RIAPP.Command(function (sender, args) {
                self.load();
            }, self, null);
            this._helpCommand = new RIAPP.Command(function (sender, param) {
                alert('Help command executed for AddressID: ' + (!!param ? param.AddressID : '???'));
            }, self, null);
            this._customerAddressVM = null;
        }
        CustomerVM.prototype._getEventNames = function () {
            var base_events = _super.prototype._getEventNames.call(this);
            return ['data_filled'].concat(base_events);
        };
        CustomerVM.prototype._onCurrentChanged = function () {
            this.raisePropertyChanged('currentItem');
        };
        CustomerVM.prototype.load = function () {
            var query = this.dbSet.createReadCustomerQuery({ includeNav: false });
            query.pageSize = 50;
            query.loadPageCount = 10;
            query.isClearCacheOnEveryLoad = true;
            query.orderBy('ComplexProp.LastName').thenBy('ComplexProp.MiddleName').thenBy('ComplexProp.FirstName');
            return query.load();
        };
        CustomerVM.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            if (!!this._customerAddressVM) {
                this._customerAddressVM.destroy();
                this._customerAddressVM = null;
            }
            if (!!this._dbSet) {
                this._dbSet.removeNSHandlers(this.uniqueID);
            }
            _super.prototype.destroy.call(this);
        };
        Object.defineProperty(CustomerVM.prototype, "dbContext", {
            get: function () { return this.app.dbContext; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CustomerVM.prototype, "dbSets", {
            get: function () { return this.dbContext.dbSets; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CustomerVM.prototype, "dbSet", {
            get: function () { return this._dbSet; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CustomerVM.prototype, "currentItem", {
            get: function () { return this._dbSet.currentItem; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CustomerVM.prototype, "addNewCommand", {
            get: function () { return this._addNewCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CustomerVM.prototype, "saveCommand", {
            get: function () { return this._saveCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CustomerVM.prototype, "undoCommand", {
            get: function () { return this._undoCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CustomerVM.prototype, "loadCommand", {
            get: function () { return this._loadCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CustomerVM.prototype, "helpCommand", {
            get: function () { return this._helpCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CustomerVM.prototype, "customerAddressVM", {
            get: function () {
                if (!this._customerAddressVM)
                    this._customerAddressVM = new CustomerAddressVM(this);
                return this._customerAddressVM;
            },
            enumerable: true,
            configurable: true
        });
        return CustomerVM;
    }(RIAPP.ViewModel));
    exports.CustomerVM = CustomerVM;
    var CustomerAddressVM = (function (_super) {
        __extends(CustomerAddressVM, _super);
        function CustomerAddressVM(customerVM) {
            _super.call(this, customerVM.app);
            var self = this;
            this._customerVM = customerVM;
            this._addAddressVM = null;
            this._currentCustomer = null;
            this._addressesDb = this.dbSets.Address;
            this._custAdressDb = this.dbSets.CustomerAddress;
            this._custAdressDb.addOnItemDeleting(function (sender, args) {
                if (!confirm('Are you sure that you want to unlink Address from this customer?'))
                    args.isCancel = true;
            }, self.uniqueID);
            this._custAdressDb.addOnBeginEdit(function (sender, args) {
                var item = args.item;
                var address = item.Address;
                if (!!address)
                    address._aspect.beginEdit();
            }, self.uniqueID);
            this._custAdressDb.addOnEndEdit(function (sender, args) {
                var item = args.item;
                var address = item.Address;
                if (!args.isCanceled) {
                    if (!!address)
                        address._aspect.endEdit();
                }
                else {
                    if (address)
                        address._aspect.cancelEdit();
                }
            }, self.uniqueID);
            this._addressesDb.addOnItemDeleting(function (sender, args) {
                if (!confirm('Are you sure that you want to delete Customer\'s Address ?'))
                    args.isCancel = true;
            }, self.uniqueID);
            this._customerVM.dbSet.addOnFill(function (sender, args) {
                self.load(args.items);
            }, self.uniqueID);
            var custAssoc = self.dbContext.associations.getCustAddrToCustomer();
            this._custAdressView = new dbMOD.ChildDataView({
                association: custAssoc,
                fn_sort: function (a, b) { return a.AddressID - b.AddressID; }
            });
            this._addressesView = new dbMOD.DataView({
                dataSource: this._addressesDb,
                fn_sort: function (a, b) { return a.AddressID - b.AddressID; },
                fn_filter: function (item) {
                    if (!self._currentCustomer)
                        return false;
                    return item.CustomerAddresses.some(function (ca) {
                        return self._currentCustomer === ca.Customer;
                    });
                },
                fn_itemsProvider: function (ds) {
                    if (!self._currentCustomer)
                        return [];
                    var custAdrs = self._currentCustomer.CustomerAddresses;
                    return custAdrs.map(function (m) {
                        return m.Address;
                    }).filter(function (address) {
                        return !!address;
                    });
                }
            });
            this._custAdressView.addOnViewRefreshed(function (s, a) {
                self._addressesView.refresh();
            }, self.uniqueID);
            this._customerVM.addOnPropertyChange('currentItem', function (sender, args) {
                self._currentCustomer = self._customerVM.currentItem;
                self._custAdressView.parentItem = self._currentCustomer;
                self.raisePropertyChanged('currentCustomer');
            }, self.uniqueID);
        }
        CustomerAddressVM.prototype._loadAddresses = function (addressIDs, isClearTable) {
            var query = this._addressesDb.createReadAddressByIdsQuery({ addressIDs: addressIDs });
            query.isClearPrevData = isClearTable;
            return query.load();
        };
        CustomerAddressVM.prototype._addNewAddress = function () {
            var adr = this.addressesView.addNew();
            return adr;
        };
        CustomerAddressVM.prototype._addNewCustAddress = function (address) {
            var cust = this.currentCustomer;
            var ca = this.custAdressView.addNew();
            ca.CustomerID = cust.CustomerID;
            ca.AddressType = "Main Office";
            ca.Address = address;
            ca._aspect.endEdit();
            return ca;
        };
        CustomerAddressVM.prototype.load = function (customers) {
            var self = this, custArr = customers || [];
            var custIDs = custArr.map(function (item) {
                return item.CustomerID;
            });
            var query = this._custAdressDb.createReadAddressForCustomersQuery({ custIDs: custIDs });
            query.isClearPrevData = true;
            var promise = query.load();
            promise.then(function (res) {
                var addressIDs = res.fetchedItems.map(function (item) {
                    return item.AddressID;
                });
                self._loadAddresses(addressIDs, true);
            });
        };
        CustomerAddressVM.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            if (!!this._addressesDb) {
                this._addressesDb.removeNSHandlers(this.uniqueID);
            }
            if (!!this._custAdressDb) {
                this._custAdressDb.removeNSHandlers(this.uniqueID);
            }
            if (!!this._customerVM) {
                this._customerVM.removeNSHandlers(this.uniqueID);
            }
            if (this._addAddressVM) {
                this._addAddressVM.destroy();
                this._addAddressVM = null;
            }
            _super.prototype.destroy.call(this);
        };
        Object.defineProperty(CustomerAddressVM.prototype, "dbContext", {
            get: function () { return this.app.dbContext; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CustomerAddressVM.prototype, "dbSets", {
            get: function () { return this.dbContext.dbSets; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CustomerAddressVM.prototype, "addressesDb", {
            get: function () { return this._addressesDb; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CustomerAddressVM.prototype, "custAdressDb", {
            get: function () { return this._custAdressDb; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CustomerAddressVM.prototype, "addressesView", {
            get: function () { return this._addressesView; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CustomerAddressVM.prototype, "custAdressView", {
            get: function () { return this._custAdressView; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CustomerAddressVM.prototype, "addAddressVM", {
            get: function () {
                if (this._addAddressVM === null) {
                    this._addAddressVM = new AddAddressVM(this);
                }
                return this._addAddressVM;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CustomerAddressVM.prototype, "currentCustomer", {
            get: function () { return this._currentCustomer; },
            enumerable: true,
            configurable: true
        });
        return CustomerAddressVM;
    }(RIAPP.ViewModel));
    exports.CustomerAddressVM = CustomerAddressVM;
    var AddAddressVM = (function (_super) {
        __extends(AddAddressVM, _super);
        function AddAddressVM(customerAddressVM) {
            _super.call(this, customerAddressVM.app);
            var self = this;
            this._customerAddressVM = customerAddressVM;
            this._addressInfosDb = this.dbContext.dbSets.AddressInfo;
            this._currentCustomer = null;
            this._searchToolTip = 'enter any address part then press search button';
            this._newAddress = null;
            this._adressInfosGrid = null;
            this._searchString = null;
            this._isAddingNew = false;
            this._dialogVM = new uiMOD.DialogVM(self.app);
            var dialogOptions = {
                templateID: 'addAddressTemplate',
                width: 950,
                height: 600,
                title: 'add new customer address',
                submitOnOK: true,
                fn_OnClose: function (dialog) {
                    if (dialog.result != 'ok') {
                        if (!!self._newAddress) {
                            self._cancelAddNewAddress();
                        }
                        self.dbContext.rejectChanges();
                    }
                    self._addressInfosDb.clear();
                    self.searchString = null;
                },
                fn_OnOK: function (dialog) {
                    if (!self._isAddingNew) {
                        return 0;
                    }
                    if (!self._newAddress._aspect.endEdit())
                        return 1;
                    var custAdress = self._customerAddressVM._addNewCustAddress(self._newAddress);
                    custAdress._aspect.endEdit();
                    self._newAddress = null;
                    self._isAddingNew = false;
                    self.raisePropertyChanged('newAddress');
                    self.raisePropertyChanged('isAddingNew');
                    return 1;
                },
                fn_OnCancel: function (dialog) {
                    if (!self._isAddingNew) {
                        return 0;
                    }
                    if (!!self._newAddress) {
                        self._cancelAddNewAddress();
                    }
                    return 1;
                }
            };
            this._dialogVM.createDialog('addressDialog', dialogOptions);
            this._addressInfosView = new dbMOD.DataView({
                dataSource: this._addressInfosDb,
                fn_sort: function (a, b) { return a.AddressID - b.AddressID; },
                fn_filter: function (item) {
                    return !item.CustomerAddresses.some(function (CustAdr) {
                        return self._currentCustomer === CustAdr.Customer;
                    });
                }
            });
            this._addressInfosView.isPagingEnabled = true;
            this._addressInfosView.pageSize = 50;
            this._addressInfosView.addOnPropertyChange('currentItem', function (sender, args) {
                self.raisePropertyChanged('currentAddressInfo');
                self._linkCommand.raiseCanExecuteChanged();
            }, self.uniqueID);
            this._customerAddressVM.addOnPropertyChange('currentCustomer', function (sender, args) {
                self._currentCustomer = self._customerAddressVM.currentCustomer;
                self.raisePropertyChanged('customer');
                self._addNewCommand.raiseCanExecuteChanged();
            }, self.uniqueID);
            this.custAdressView.addOnPropertyChange('currentItem', function (sender, args) {
                self._unLinkCommand.raiseCanExecuteChanged();
            }, self.uniqueID);
            this._addNewCommand = new RIAPP.Command(function (sender, param) {
                try {
                    self._dialogVM.showDialog('addressDialog', self);
                }
                catch (ex) {
                    self.handleError(ex, this);
                }
            }, self, function (sender, param) {
                return !!self.customer;
            });
            this._execSearchCommand = new RIAPP.Command(function (sender, args) {
                self.loadAddressInfos();
            }, self, null);
            this._addNewAddressCommand = new RIAPP.Command(function (sender, args) {
                self._addNewAddress();
            }, self, null);
            this._linkCommand = new RIAPP.Command(function (sender, args) {
                self._linkAddress();
            }, self, function (s, a) {
                return !!self._addressInfosView.currentItem;
            });
            this._unLinkCommand = new RIAPP.Command(function (sender, args) {
                self._unLinkAddress();
            }, self, function (s, a) {
                return !!self.custAdressView.currentItem;
            });
            this._propChangeCommand = new RIAPP.PropChangedCommand(function (sender, args) {
                if (args.property == '*' || args.property == 'grid') {
                    self._adressInfosGrid = sender.grid;
                }
            }, self, null);
        }
        Object.defineProperty(AddAddressVM.prototype, "isCanSubmit", {
            get: function () { return true; },
            enumerable: true,
            configurable: true
        });
        AddAddressVM.prototype.submitChanges = function () { return this.dbContext.submitChanges(); };
        AddAddressVM.prototype.rejectChanges = function () {
        };
        AddAddressVM.prototype._cancelAddNewAddress = function () {
            var self = this;
            self._newAddress._aspect.cancelEdit();
            self._newAddress._aspect.rejectChanges();
            self._newAddress = null;
            self._isAddingNew = false;
            self.raisePropertyChanged('newAddress');
            self.raisePropertyChanged('isAddingNew');
        };
        AddAddressVM.prototype.loadAddressInfos = function () {
            var query = this._addressInfosDb.createReadAddressInfoQuery();
            query.isClearPrevData = true;
            COMMON.addTextQuery(query, 'AddressLine1', '%' + this.searchString + '%');
            query.orderBy('AddressLine1');
            return query.load();
        };
        AddAddressVM.prototype._addNewAddress = function () {
            this._newAddress = this._customerAddressVM._addNewAddress();
            this._isAddingNew = true;
            this.raisePropertyChanged('newAddress');
            this.raisePropertyChanged('isAddingNew');
        };
        AddAddressVM.prototype._linkAddress = function () {
            var self = this, adrInfo = this.currentAddressInfo, adrView = self.custAdressView, adrID;
            if (!adrInfo) {
                alert('_linkAddress error: adrInfoEntity is null');
                return;
            }
            adrID = adrInfo.AddressID;
            var existedAddr = adrView.items.some(function (item) {
                return item.AddressID === adrID;
            });
            if (existedAddr) {
                alert('Customer already has this address!');
                return;
            }
            var promise = this._customerAddressVM._loadAddresses([adrID], false);
            promise.then(function (res) {
                var address = self._customerAddressVM.addressesDb.findEntity(adrID);
                if (!!address) {
                    self._customerAddressVM._addNewCustAddress(address);
                    self._removeAddressRP(adrID);
                }
            });
        };
        AddAddressVM.prototype._unLinkAddress = function () {
            var item = this.custAdressView.currentItem;
            if (!item) {
                return;
            }
            var id = item.AddressID;
            if (item._aspect.deleteItem())
                this._addAddressRP(id);
        };
        AddAddressVM.prototype._addAddressRP = function (addressID) {
            if (this._checkAddressInRP(addressID)) {
                var deferred = utils.defer.createDeferred();
                deferred.reject();
                return deferred.promise();
            }
            var self = this, query = this._addressInfosDb.createReadAddressInfoQuery();
            query.isClearPrevData = false;
            query.where('AddressID', 0, [addressID]);
            var promise = query.load();
            promise.then(function () {
                self._checkAddressInRP(addressID);
            });
            return promise;
        };
        AddAddressVM.prototype._checkAddressInRP = function (addressID) {
            var item = this._addressInfosDb.findEntity(addressID);
            if (!!item) {
                var appended = this._addressInfosView.appendItems([item]);
                this._addressInfosView.currentItem = item;
                if (!!this._adressInfosGrid)
                    this._adressInfosGrid.scrollToCurrent(0);
            }
            return !!item;
        };
        AddAddressVM.prototype._removeAddressRP = function (addressID) {
            var item = this._addressInfosView.findByPK(addressID);
            if (!!item) {
                this._addressInfosView.removeItem(item);
            }
        };
        AddAddressVM.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            if (!!this._addressInfosDb) {
                this._addressInfosDb.removeNSHandlers(this.uniqueID);
                this._addressInfosDb.clear();
                this._addressInfosDb = null;
            }
            if (!!this._addressInfosView) {
                this._addressInfosView.destroy();
                this._addressInfosView = null;
            }
            this.custAdressView.removeNSHandlers(this.uniqueID);
            if (!!this._customerAddressVM) {
                this._customerAddressVM.removeNSHandlers(this.uniqueID);
                this._customerAddressVM = null;
            }
            _super.prototype.destroy.call(this);
        };
        Object.defineProperty(AddAddressVM.prototype, "dbContext", {
            get: function () { return this.app.dbContext; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AddAddressVM.prototype, "dbSets", {
            get: function () { return this.dbContext.dbSets; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AddAddressVM.prototype, "addressInfosDb", {
            get: function () { return this._addressInfosDb; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AddAddressVM.prototype, "addressInfosView", {
            get: function () { return this._addressInfosView; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AddAddressVM.prototype, "addressesView", {
            get: function () { return this._customerAddressVM.addressesView; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AddAddressVM.prototype, "custAdressView", {
            get: function () { return this._customerAddressVM.custAdressView; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AddAddressVM.prototype, "currentAddressInfo", {
            get: function () { return this._addressInfosView.currentItem; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AddAddressVM.prototype, "searchString", {
            get: function () { return this._searchString; },
            set: function (v) {
                if (this._searchString !== v) {
                    this._searchString = v;
                    this.raisePropertyChanged('searchString');
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AddAddressVM.prototype, "addNewCommand", {
            get: function () { return this._addNewCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AddAddressVM.prototype, "execSearchCommand", {
            get: function () { return this._execSearchCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AddAddressVM.prototype, "addNewAddressCommand", {
            get: function () { return this._addNewAddressCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AddAddressVM.prototype, "linkCommand", {
            get: function () { return this._linkCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AddAddressVM.prototype, "unLinkCommand", {
            get: function () { return this._unLinkCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AddAddressVM.prototype, "newAddress", {
            get: function () { return this._newAddress; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AddAddressVM.prototype, "customer", {
            get: function () { return this._currentCustomer; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AddAddressVM.prototype, "isAddingNew", {
            get: function () { return this._isAddingNew; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AddAddressVM.prototype, "propChangeCommand", {
            get: function () { return this._propChangeCommand; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AddAddressVM.prototype, "searchToolTip", {
            get: function () { return this._searchToolTip; },
            enumerable: true,
            configurable: true
        });
        return AddAddressVM;
    }(RIAPP.ViewModel));
    exports.AddAddressVM = AddAddressVM;
    var DemoApplication = (function (_super) {
        __extends(DemoApplication, _super);
        function DemoApplication(options) {
            _super.call(this, options);
            var self = this;
            this._dbContext = null;
            this._errorVM = null;
            this._customerVM = null;
        }
        DemoApplication.prototype.onStartUp = function () {
            var self = this, options = self.options;
            this._dbContext = new DEMODB.DbContext();
            this._dbContext.initialize({ serviceUrl: options.service_url, permissions: options.permissionInfo });
            function toText(str) {
                if (str === null)
                    return '';
                else
                    return str;
            }
            ;
            this._dbContext.dbSets.Customer.defineComplexProp_NameField(function (item) {
                return toText(item.ComplexProp.LastName) + '  ' + toText(item.ComplexProp.MiddleName) + '  ' + toText(item.ComplexProp.FirstName);
            });
            this.registerObject("dbContext", this._dbContext);
            this._errorVM = new COMMON.ErrorViewModel(this);
            this._customerVM = new CustomerVM(this);
            function handleError(sender, data) {
                self._handleError(sender, data);
            }
            ;
            this.addOnError(handleError);
            this._dbContext.addOnError(handleError);
            _super.prototype.onStartUp.call(this);
            this._customerVM.load();
        };
        DemoApplication.prototype._handleError = function (sender, data) {
            debugger;
            data.isHandled = true;
            this.errorVM.error = data.error;
            this.errorVM.showDialog();
        };
        DemoApplication.prototype.destroy = function () {
            if (this._isDestroyed)
                return;
            this._isDestroyCalled = true;
            var self = this;
            try {
                self._errorVM.destroy();
                self._customerVM.destroy();
                self._dbContext.destroy();
            }
            finally {
                _super.prototype.destroy.call(this);
            }
        };
        Object.defineProperty(DemoApplication.prototype, "options", {
            get: function () { return this._options; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DemoApplication.prototype, "dbContext", {
            get: function () { return this._dbContext; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DemoApplication.prototype, "errorVM", {
            get: function () { return this._errorVM; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DemoApplication.prototype, "customerVM", {
            get: function () { return this._customerVM; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DemoApplication.prototype, "TEXT", {
            get: function () { return RIAPP.LocaleSTRS.TEXT; },
            enumerable: true,
            configurable: true
        });
        return DemoApplication;
    }(RIAPP.Application));
    exports.DemoApplication = DemoApplication;
    bootstrap.addOnError(function (sender, args) {
        debugger;
        alert(args.error.message);
    });
    bootstrap.addOnUnResolvedBinding(function (s, args) {
        var msg = "unresolved databound property for";
        if (args.bindTo == 0) {
            msg += " Source: ";
        }
        else {
            msg += " Target: ";
        }
        msg += "'" + args.root + "'";
        msg += ", property: '" + args.propName + "'";
        msg += ", binding path: '" + args.path + "'";
        console.log(msg);
    });
    function start(mainOptions) {
        mainOptions.modulesInits = {
            "COMMON": COMMON.initModule,
            "AUTOCOMPLETE": AUTOCOMPLETE.initModule
        };
        bootstrap.startApp(function () {
            return new DemoApplication(mainOptions);
        }, function (thisApp) { });
    }
    exports.start = start;
});
