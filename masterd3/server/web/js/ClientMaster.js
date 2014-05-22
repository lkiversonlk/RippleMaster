function ClientMaster(){
    var self = this;
    self.initializeComponents();
    self.initializeBindings();
    self.SetState(Consts.STATE.OFFLINE);
};

ClientMaster.prototype = {

    AddrBalance : function(address, callback){
        $.ajax(
            {
                url : "addressinfo",
                type : "GET",
                dataType : "json",
                data : {address : address, ledger : -1},
                success : function(addrBalance){
                    var ret = new Address(addrBalance.address);
                    ret.SetBalance(addrBalance.balances);
                    ret.SetOffers(addrBalance.offers);
                    callback(Consts.RESULT.SUCCESS, ret);
                },
                error : function(){
                    callback(Consts.RESULT.FAIL);
                }
            }
        )
    },

    AddrBalanceInLedger : function(address, ledger, callback){
        $.ajax(
            {
                url : "addressinfo",
                type : "GET",
                dataType : "json",
                data : {address : address, ledger : ledger},
                success : function(addrBalance){
                    var ret = new Address(addrBalance.address);
                    ret.SetBalance(addrBalance.balances);
                    ret.SetOffers(addrBalance.offers);
                    callback(Consts.RESULT.SUCCESS, ret);
                },
                error : function(){
                    callback(Consts.RESULT.FAIL);
                }
            }
        )
    },

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

    initializeComponents : function(){
        this.ids = {};
        this._rippleServer = new RippleServer();
        this.markers = {};
    },

    initializeBindings : function(){
        var self = this;
    }
};