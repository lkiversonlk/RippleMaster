function ClientMaster(){
    var self = this;
    self.initializeComponents();
    self.initializeBindings();
    self.SetState(Consts.STATE.OFFLINE);
};

ClientMaster.prototype = {
    SetState : function(state){
        this._state = state;
        $(this).trigger(Consts.EVENT.STATE_CHANGE);
    },

    State : function(){
        return this._state;
    },

    Start : function(callback){
        var self = this;
        var netConfig = Consts.DefaultNetConfig;
        self._rippleServer.Connect(netConfig, function(result, msg){
            switch (result){
                case Consts.RESULT.SUCCESS:
                    self.SetState(Consts.STATE.ONLINE);
                    if(callback){
                        callback();
                    }
                    break;
            }
        });
    },

    AddrBalance : function(address, callback){
        var self = this;
        if(self.State() == Consts.STATE.OFFLINE){
            callback(Consts.RESULT.FAIL_NETWORKERROR);
        }else{
            var request = RippleRequest.AccountRequest(RippleRequest.RequestCMD.AccountInfo, address, null, function(result, data){
                if(result != Consts.RESULT.SUCCESS){
                    callback(result);
                }else{
                    var ret = new AddrBal(address);
                    var xrp = data.xrp;
                    var request = RippleRequest.AccountRequest(RippleRequest.RequestCMD.AccountLines, address, null, function(result, data){
                        if(result === Consts.RESULT.SUCCESS){
                            ret.SetBalance(xrp, data.lines);
                            callback(Consts.RESULT.SUCCESS, ret);
                            //self.LoadAllTransactions(address);
                        }else{
                            callback(result);
                        }
                    });
                    self._rippleServer.Request(request);
                }

            });
            self._rippleServer.Request(request);
        }
    },

    AddrBalanceInLedger : function(address, ledger, callback){
        var self = this;
        if(self.State() == Consts.STATE.OFFLINE){
            callback(Consts.RESULT.FAIL_NETWORKERROR);
        }else{
            var request = RippleRequest.AccountRequest(RippleRequest.RequestCMD.AccountInfo, address, {ledger_index : ledger}, function(result, data){
                if(result != Consts.RESULT.SUCCESS){
                    callback(result);
                }else{
                    var ret = new AddrBal(address);
                    var xrp = data.xrp;
                    var request = RippleRequest.AccountRequest(RippleRequest.RequestCMD.AccountLines, address, {ledger_index : ledger}, function(result, data){
                        if(result === Consts.RESULT.SUCCESS){
                            ret.SetBalance(xrp, data.lines);
                            callback(Consts.RESULT.SUCCESS, ret);
                            //self.LoadAllTransactions(address);
                        }else{
                            callback(result);
                        }
                    });
                    self._rippleServer.Request(request);
                }

            });
            self._rippleServer.Request(request);
        }
    },

    ConsultOffers : function(address, callback){
        if(typeof(callback) === 'undefined'){
            callback = function(){};
        }
        var self = this;
        if(self.State() == Consts.STATE.ONLINE){
            var request = RippleRequest.AccountRequest(RippleRequest.RequestCMD.AccountOffers, address, null, function(result, offers){
                callback(result, offers);
            });
            self._rippleServer.Request(request);
        }else{
            callback(Consts.RESULT.FAIL_ACCOUNTNOTLOADED);
        }
    },

    /**
     * callback(result,istheremore(boolean)), return whether keep consulting.
     * @param callback
     * @constructor
     */
    ConsultTransactions: function(address, marker, callback){
        var self = this;
        if(self.State() === Consts.STATE.OFFLINE){
            callback(Consts.RESULT.FAIL_NETWORKERROR);
        }
        var options = {
            ledger_index_min:-1,
            ledger_index_max:-1,
            limit:Consts.BATCH_SIZE
        };
        if(marker){
            options.marker = marker;
        }
        var accountTxRequest = RippleRequest.AccountRequest(
            RippleRequest.RequestCMD.AccountTransactions,
            address,
            options,
            function(result, data){
                if(result === Consts.RESULT.SUCCESS){
                    if(data.marker){
                        var marker = data.marker;
                        var goOn = callback(Consts.RESULT.SUCCESS, marker, data.transactions);
                        if(goOn){
                            self.ConsultTransactions(address, marker, callback);
                        }else{
                        }
                    }else{
                        callback(Consts.RESULT.SUCCESS, null, data.transactions);
                    }
                }else{
                    callback(result);
                }
            }
        );
        self._rippleServer.Request(accountTxRequest);
    },

    QueryTransactions : function(address, callback){
        var self = this;
        if(self.State() === Consts.STATE.OFFLINE){
            callback(Consts.RESULT.FAIL_NETWORKERROR);
        }
        var data = self._txManager.QueryData(address);
        if(!data){
            callback(Consts.RESULT.FAIL_ACCOUNTNOTLOADED);
        }else{
            callback(Consts.RESULT.SUCCESS, self._txManager.QueryData(address));
        }
    },

    initializeComponents : function(){
        this.ids = {};
        this._rippleServer = new RippleServer();
        this.markers = {};
    },

    initializeBindings : function(){
        var self = this;
    }
};

function AddrBal(address){
    this.address = address;
    this.balances = new Array();
    this._logger = new Log("AddrBal");
};

AddrBal.prototype = {
    SetBalance : function(xrp, balances){
        this.balances = balances.concat([xrp]);
    }
};