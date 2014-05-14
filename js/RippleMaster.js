function RippleMaster(){
    var self = this;
    self.initializeComponents();
    self.initializeBindings();
    self.SetState(Consts.STATE.OFFLINE);
};

RippleMaster.prototype = {
    SetState : function(state){
        this._state = state;
        $(this).trigger(Consts.EVENT.STATE_CHANGE);
    },

    State : function(){
        return this._state;
    },

    Start : function(){
        var self = this;
        var netConfig = Consts.DefaultNetConfig;
        self._rippleServer.Connect(netConfig, function(result, msg){
            switch (result){
                case Consts.RESULT.SUCCESS:
                    self.SetState(Consts.STATE.ONLINE);
                    break;
            }
        });
    },

    AccountCurrencies : function(address, callback){
        var self = this;
        if(!self.ids[address]){
            callback(Consts.RESULT.FAIL_ACCOUNTNOTLOADED);
        }else{
            callback(Consts.RESULT.SUCCESS, [self.ids[address].XRP()].concat(self.ids[address].Balances()));
        }
    },

    AccountInfo : function(address, callback){
        var self = this;
        if(self.State() == Consts.STATE.OFFLINE){
            callback(Consts.RESULT.FAIL_NETWORKERROR);
        }else{
            var request = RippleRequest.AccountRequest(RippleRequest.RequestCMD.AccountInfo, address, null, function(result, data){
                if(result != Consts.RESULT.SUCCESS){
                    callback(result);
                }else{
                    var id = new ID();
                    var xrp = data.xrp;
                    var request = RippleRequest.AccountRequest(RippleRequest.RequestCMD.AccountLines, address, null, function(result, data){
                        if(result === Consts.RESULT.SUCCESS){
                            id.SetBalance(xrp, data);
                            self.ids[address] = id;
                            callback(Consts.RESULT.SUCCESS, id);
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
    ConsultTransactions: function(address, callback){
        var self = this;
        if(self.State() === Consts.STATE.OFFLINE){
            callback(Consts.RESULT.FAIL_NETWORKERROR);
        }
        if(self._txManager.Flag(address) && self._txManager.Flag(address).finished === true){
            callback(Consts.RESULT.SUCCESS, false, []);  //bug fix
        }
        var options = {
            ledger_index_min:-1,
            ledger_index_max:-1,
            limit:Consts.BATCH_SIZE
        };
        if(self._txManager.Flag(address) && self._txManager.Flag(address).marker){
            options.marker = self._txManager.Flag(address).marker;
        }
        var accountTxRequest = RippleRequest.AccountRequest(
            RippleRequest.RequestCMD.AccountTransactions,
            address,
            options,
            function(result, data){
                if(result === Consts.RESULT.SUCCESS){
                    self._txManager.AddAddressTransactions(address, data.transactions, data.marker);
                    if(data.marker){
                        var goOn = callback(Consts.RESULT.SUCCESS, true, data.transactions);
                        if(goOn){
                            self.ConsultTransactions(address, callback);
                        }
                    }else{
                        callback(Consts.RESULT.SUCCESS, false, data.transactions);
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
        this._navigationBar = new NavigationBar($("div[role='navigation']"), this);
        this._offer = RippleBox.OfferBox($("#offers"), this, "r9zbt4tB2s3KsrmgE6r1KoZtVN4cNAsfxN");
        this._tx = RippleBox.TxBox($("#transactions"), this, "r9zbt4tB2s3KsrmgE6r1KoZtVN4cNAsfxN");
        this._accountBalance = RippleBox.AccountBox($("#holds"), this, "r9zbt4tB2s3KsrmgE6r1KoZtVN4cNAsfxN")
        this._txManager = new TxManager();
        this._sellBuyPanel = RippleBox.SellBuyBox($("#test"), this , "r9zbt4tB2s3KsrmgE6r1KoZtVN4cNAsfxN");
    /*
        $('.selectpicker').selectpicker();
        $(".date").datetimepicker();
        */
    },

    initializeBindings : function(){
        var self = this;
    }
};

function ID(){
    this._address = null;
    this._nickname = null;
    this._balances = new Array();
    this._xrp = null;
    this._logger = new Log("ID");
};

ID.prototype = {
    Address : function(){return this._address;},
    Nickname : function(){return this._nickname;},
    Balances : function(){return this._balances;},

    SetBalance : function(xrp, balances){
        this._xrp = xrp;
        this._balances = balances;
    },

    SetAccount : function(address, nickname){
        this._address = address;
        this._nickname = nickname;
    },


    XRP : function(){return this._xrp;},

    Clear : function(){
        this._address = this._nickname = this._xrp = null;
        this.SetBalance(0, new Array());
    }
};