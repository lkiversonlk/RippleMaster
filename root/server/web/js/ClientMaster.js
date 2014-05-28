function ClientMaster(){
    var self = this;
    self.initializeComponents();
    self.initializeBindings();
};

ClientMaster.prototype = {

    AddrInfo : function(address, callback){
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
                    callback(Common.RESULT.SUCC, ret);
                },
                error : function(){
                    callback(Common.RESULT.FAIL);
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
                    callback(Common.RESULT.SUCC, addrBalance);
                },
                error : function(){
                    callback(Common.RESULT.FAIL);
                }
            }
        )
    },

    Start : function(callback){
        this._rippleServer.Connect(Consts.DefaultNetConfig);
        callback();
    },

    /**
     * callback(result,istheremore(boolean)), return whether keep consulting.
     * @param callback
     * @constructor
     */
    ConsultTransactions: function(address, marker, callback){
        var self = this;

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
                if(result === Common.RESULT.SUCC){
                    if(data.marker){
                        var marker = data.marker;
                        var goOn = callback(Common.RESULT.SUCC, marker, data.transactions);
                        if(goOn){
                            self.ConsultTransactions(address, marker, callback);
                        }else{
                        }
                    }else{
                        callback(Common.RESULT.SUCC, null, data.transactions);
                    }
                }else{
                    callback(result);
                }
            }
        );
        self._rippleServer.Request(accountTxRequest);
    },

    LoadAllTransactions : function(address, size, marker, callback){
        var self = this;
        var options = {
            ledger_index_min:-1,
            ledger_index_max:-1,
            limit:size
        };
        if(marker){
            options.marker = marker;
        }
        var accountTxRequest = RippleRequest.AccountRequest(
            RippleRequest.RequestCMD.AccountTransactions,
            address,
            options,
            function(result, data){
                if(result === Common.RESULT.SUCC){
                    if(data.marker){
                        var goOn = callback(Common.RESULT.SUCC, true, data.transactions);
                        if(goOn){
                            self.LoadAllTransactions(address, size, data.marker, callback);
                        }else{
                        }
                    }else{
                        callback(Common.RESULT.SUCC, false, data.transactions);
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