function Transaction(){
    this._type = null;
    this._date = null;
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

Transaction.prototype = {
    SetHost : function(address){
        this._host = address;
    },

    Host : function(){
        return this._host;
    },

    SetDest : function(address){
        this._dest = address;
    },

    Dest : function(){
        return this._dest;
    },

    SetType : function(type){
        this._type = type;
    },

    Type : function(){
        return this._type;
    },

    SetAmount : function(amount){
        this._amount = amount;
    },

    Amount : function(){
        return this._amount;
    },

    SetCost : function(cost){
        this._cost = cost;
    },

    Cost : function(){
        return this._cost;
    },

    SetFee : function(fee){
        this._fee = fee;
    },

    Fee : function(){
        return this._fee;
    },

    Date : function(){
        return this._date;
    },

    SetDate : function(date){
        this._date = date;
    }
}