var RippleServer = require('./RippleServer').RippleServer;
var RippleRequest = require('./RippleRequest').RippleRequest;
var Transaction = require("./Transaction").Transaction;
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var Consts = require('./Common').Consts;
var Address = require("./Model").Address;

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
            case Consts.RESULT.SUCC:
                self.SetState(RippleMaster.STATE.ON);
                callback();
                break;
        }
    });
};

RippleMaster.prototype.Stop = function(){
    this.SetState(RippleMaster.STATE.OFF);
    this._rippleServer.Disconnect();
}

RippleMaster.prototype.AddressInfo = function(address, callback) {
    var self = this;
    if (self.state == RippleMaster.STATE.OFF) {
        callback(Consts.RESULT.FAIL_NETWORK);
    } else {
        var request = RippleRequest.AccountRequest(RippleRequest.RequestCMD.AccountInfo, address, null, function (result, data) {
            if (result != Consts.RESULT.SUCC) {
                callback(result);
            } else {
                var xrp = data.xrp;
                var request = RippleRequest.AccountRequest(RippleRequest.RequestCMD.AccountLines, address, null, function (result, data) {
                    if (result === Consts.RESULT.SUCC) {
                        var ret = new Address(address);
                        ret.SetBalance(xrp, data);
                        callback(Consts.RESULT.SUCC, ret);
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

/**
 * callback(result, offers[sell,buy])
 * @param address
 * @param callback
 * @constructor
 */
RippleMaster.prototype.ConsultOffers = function(address, callback){
    if(typeof(callback) === 'undefined'){
        callback = function(){};
    }
    var self = this;
    if(self.state == RippleMaster.STATE.ON){
        var request = RippleRequest.AccountRequest(RippleRequest.RequestCMD.AccountOffers, address, null, function(result, offers){
            callback(result, offers);
        });
        self._rippleServer.Request(request);
    }else{
        callback(Consts.RESULT.FAIL_ACCOUNT);
    }
};

/**
 * callback(istheremore(boolean), transactions), return whether keep consulting.
 * @param callback
 * @constructor
 */
RippleMaster.prototype.ConsultTransactions = function(address, options, callback){
    var self = this;
    if(self.state === RippleMaster.STATE.OFF){
        callback(Consts.RESULT.FAIL_NETWORK, false, null);
    }
    if(!options){
        options = {
            ledger_index_min:-1,
            ledger_index_max:-1,
            limit:RippleMaster.BATCH
        };
    }
    var accountTxRequest = RippleRequest.AccountRequest(
        RippleRequest.RequestCMD.AccountTransactions,
        address,
        options,
        function(result, data){
            if(result === RippleServer.RESULT.SUCC){
                //self._txManager.AddAddressTransactions(address, data.transactions, data.marker);
                if(data.marker){
                    options.marker = data.marker;
                    var goOn = callback(Consts.RESULT.SUCC, true, data.transactions);
                    if(goOn){
                        self.ConsultTransactions(address, options, callback);
                    }
                }else{
                    callback(Consts.RESULT.SUCC,false, data.transactions);
                }
            }else{
                callback(Consts.RESULT.FAIL, false, null);
            }
        }
    );
    self._rippleServer.Request(accountTxRequest);
};

RippleMaster.prototype.initializeComponents = function(){
    this._rippleServer = new RippleServer();
};

exports.RippleMaster = RippleMaster;