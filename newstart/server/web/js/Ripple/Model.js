function Balance(json){
    if(typeof json === 'string'){
        this._issuer = "Ripple";
        this._currency = "XRP";
        this._money = new Number(json)/1000000.0;
        this._limit = null;
    }else if(typeof json === 'number') {
        this._issuer = "Ripple";
        this._currency = "XRP";
        this._money = json;
        this._limit = null;
    }else{
        /* amount: currency, issuer, value
         line  : currency, account, balance, limit
         */
        if(typeof json.account === 'undefined'){
            /* amount */
            this._currency = json.currency;
            this._issuer = json.issuer;
            this._money = new Number(json.value);
        }else{
            /* line */
            this._currency = json.currency;
            this._money = new Number(json.balance);
            this._issuer = json.account;
            this._limit = json.limit;
        }
    }
};

Balance.prototype = {
    Issuer : function() {
        return this._issuer;
    },

    Currency : function(){
        return this._currency;
    },

    Limit : function(){
        return this._limit;
    },

    Money : function(){
        return this._money;
    },

    SetMoney : function(money){
        this._money = money;
    },

    SetCurrency : function(currency){
        this._currency = currency;
    },

    SetIssuer : function(issuer){
        this._issuer = issuer;
    }
}

function Offers(sell, want){
    this._sell = sell;
    this._want = want;
};

Offers.prototype = {
    Sell : function(){
        return this._sell;
    },

    Want : function(){
        return this._want;
    }
}