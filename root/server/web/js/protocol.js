function Balance(json){
    if(typeof json === 'string'){
        this.issuer = "Ripple";
        this.currency = "XRP";
        this.value = new Number(json)/1000000.0;
        this.limit = null;
    }else if(typeof json === 'number') {
        this.issuer = "Ripple";
        this.currency = "XRP";
        this.value = json / 1000000.0;
        this.limit = null;
    }else{
        /* amount: currency, issuer, value
         line  : currency, account, balance, limit
         */
        if(typeof json.account === 'undefined'){
            /* amount */
            this.currency = json.currency;
            this.issuer = json.issuer;
            this.value = new Number(json.value);
            if(json.mastercost){
                this.mastercost = json.mastercost;
            }
        }else{
            /* line */
            this.currency = json.currency;
            this.value = new Number(json.balance);
            this.issuer = json.account;
            this.limit = json.limit;
            if(json.mastercost){
                this.mastercost = json.mastercost;
            }
        }
    }
};

function Offer(sell, want){
    this.sell = new Balance(sell);
    this.want = new Balance(want);
};

function Address(address){
    this.address = address;
    this.balances = [];
    this.offers = [];
};
Address.prototype = {
    SetBalance : function(balances){
        for(var i in balances){
            this.balances.push(new Balance(balances[i]));
        }
    },

    SetOffers : function(offers){
        for(var i in offers){
            this.offers.push(new Offer(offers[i].sell, offers[i].want));
        }
    }
};

function Common(){};
Common.RESULT = {
    SUCC : 0,
    FAIL : 2,
    FAIL_NETWORKERROR : 3,
    FAIL_MESSAGEFORMAT : 4,
    FAIL_ACCOUNTNOTLOADED : 5,
    FAIL_LOGINFIRST : 6,
    FAIL_ACCEXISTS : 7
};

Common.RP_SERVERS = [
    {
        domain : "s1.ripple.com",
        port : 443,
        secure : true
    },
    {
        domain : "s-west.ripple.com",
        port : 443,
        secure : true
    },
    {
        domain : "s-east.ripple.com",
        port : 443,
        secure : true
    }
];

Common.SERVER_MESSAGE_TYPE = {
    LEDGER_CLOSED : "ledgerClosed",
    RESPONSE : "response",
    PATH_FIND : "path_find"
};

function Transaction(){
    this.type = null;
    this.date = null;
    this.host = null;
    this.dest = null;
    this.amount = null;
    this.cost = null;
    this.date = null;
    this.ledger = 0;
    this.sequence = 0;
    this.fee = null;
};

Transaction.Type = {
    Send : 1,
    Receive : 2,
    Trade : 3,
    ERROR   : 4,
    WaitForMeta : 5
};

Transaction.RESULT = {
    SUCCESS : "tesSUCCESS"
};

Transaction.LEDGER_ENTRY_TYPE = {
    RIPPLE_STATE : "RippleState",
    ACCOUNT_ROOT : "AccountRoot"
};

function Log(type){this._type = type;}
Log.WORK_LEVEL = 0;
Log.DEBUG_LEVEL = 1;

Log.SetLevel = function(level) {
    this._level = level;
}

Log.GetLevel = function() {
    return this._level;
}

Log.prototype = {
    log : function(level, msg) {
        if(level <= Log.GetLevel()){
            console.log(this._type + ": " + msg);
        }
    }
};

function Protocol(){};
Protocol.Comm = {
    SyncAddress : "addr"
};

Protocol.Keys = {
    Addresses : 'addr'
}

if(typeof exports !== "undefined"){
    exports.Balance = Balance;
    exports.Offer = Offer;
    exports.Address = Address;
    exports.Common = Common;
    exports.Transaction = Transaction;
    exports.Log = Log;
    exports.Protocol = Protocol;
}