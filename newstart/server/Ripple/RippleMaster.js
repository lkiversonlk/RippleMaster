var RippleServer = require('./RippleServer').RippleServer;
var RippleRequest = require('./RippleRequest').RippleRequest;
var Transaction = require("./Transaction").Transaction;
var EventEmitter = require('events').EventEmitter;
var util = require('util');

function RippleMaster(){
    var self = this;
    self.initializeComponents();
    self.SetState(RippleMaster.STATE.OFF);
};

util.inherits(RippleMaster, EventEmitter);

RippleMaster.EVENT = {
    ST : 'st'
};

RippleMaster.STATE = {
    ON : 'ol',
    OFF:'of'
};

RippleMaster.BATCH = 40;

RippleMaster.prototype.SetState = function(state){
    this.state = state;
    this.emit(RippleMaster.EVENT.ST);
};


RippleMaster.prototype.Start = function(options, callback){
    var self = this;
    for(var i in options) {
        self._rippleServer.AddServer(options[i]);
    }
    self._rippleServer.Connect(function(result){
        switch (result){
            case RippleServer.RESULT.SUCC:
                self.SetState(RippleMaster.STATE.ON);
                callback();
                break;
        }
    });
};

RippleMaster.prototype.Stop = function(){
    this._rippleServer.Disconnect();
}

/*
RippleMaster.prototype.AccountCurrencies = function(address, callback){
    var self = this;
    if(!self.ids[address]){
        self.AccountInfo(address, function(result, id){
            if(result === RippleServer.RESULT.SUCC){
                callback(result, [id.XRP()].concat(id.Balances()));
            }else{
                callback(RippleMaster.RESULT.FAIL_ACCOUNTNOTLOADED);
            }
        })
    }else{
        callback(RippleMaster.RESULT.SUCCESS, [self.ids[address].XRP()].concat(self.ids[address].Balances()));
    }
};

RippleMaster.prototype.AccountInfo = function(address, callback) {
    var self = this;
    if (self.State() == RippleMaster.STATE.OFFLINE) {
        callback(RippleMaster.RESULT.FAIL_NETWORKERROR);
    } else {
        var request = RippleRequest.AccountRequest(RippleRequest.RequestCMD.AccountInfo, address, null, function (result, data) {
            if (result != RippleServer.RESULT.SUCC) {
                callback(result);
            } else {
                var id = new ID();
                var xrp = data.xrp;
                var request = RippleRequest.AccountRequest(RippleRequest.RequestCMD.AccountLines, address, null, function (result, data) {
                    if (result === RippleMaster.RESULT.SUCCESS) {
                        id.SetBalance(xrp, data);
                        self.ids[address] = id;
                        callback(Consts.RESULT.SUCCESS, id);
                        //self.LoadAllTransactions(address);
                    } else {
                        callback(result);
                    }
                });
                self._rippleServer.Request(request);
            }

        });
        self._rippleServer.Request(request);
    }
};

RippleMaster.prototype.ConsultOffers = function(address, callback){
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
};

/**
 * callback(istheremore(boolean), transactions), return whether keep consulting.
 * @param callback
 * @constructor
 */
RippleMaster.prototype.ConsultTransactions = function(address, callback){
    var self = this;
    if(self.state === RippleMaster.STATE.OFF){
        callback(false, null);
    }
    /*
    if(self._txManager.Flag(address) && self._txManager.Flag(address).finished === true){
        callback(Consts.RESULT.SUCCESS, false, []);  //bug fix
    }
    */
    var options = {
        ledger_index_min:-1,
        ledger_index_max:-1,
        limit:RippleMaster.BATCH
    };
    if(self._marker){
        options.marker = self._marker;
    }
    /*
    if(self._txManager.Flag(address) && self._txManager.Flag(address).marker){
        options.marker = self._txManager.Flag(address).marker;
    }*/
    var accountTxRequest = RippleRequest.AccountRequest(
        RippleRequest.RequestCMD.AccountTransactions,
        address,
        options,
        function(result, data){
            if(result === RippleServer.RESULT.SUCC){
                //self._txManager.AddAddressTransactions(address, data.transactions, data.marker);
                if(data.marker){
                    self._marker = data.marker;
                    var goOn = callback(true, data.transactions);
                    if(goOn){
                        self.ConsultTransactions(address, callback);
                    }
                }else{
                    callback(false, data.transactions);
                }
            }else{
                callback(false, null);
            }
        }
    );
    self._rippleServer.Request(accountTxRequest);
};
/*
RippleMaster.prototype.QueryTransactions = function(address, callback){
    var self = this;
    if(self.State() === RippleMaster.STATE.OFF){
        callback(Consts.RESULT.FAIL_NETWORKERROR);
    }
    var data = self._txManager.QueryData(address);
    if(!data){
        callback(Consts.RESULT.FAIL_ACCOUNTNOTLOADED);
    }else{
        callback(RippleServer.RESULT.SUCC, self._txManager.QueryData(address));
    }
};
*/
RippleMaster.prototype.initializeComponents = function(){
    this._rippleServer = new RippleServer();
    //this._txManager = new TxManager();
};

/*
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
}
*/
exports.RippleMaster = RippleMaster;