function ClientMaster(){
    var self = this;
    self.initializeComponents();
    self.initializeBindings();
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

    },

    ConsultOffers : function(address, callback){

    },

    /**
     * callback(result,istheremore(boolean)), return whether keep consulting.
     * @param callback
     * @constructor
     */
    ConsultTransactions: function(address, marker, callback){
    },

    QueryTransactions : function(address, callback){

    },

    initializeComponents : function(){
        this.ids = {};
    },

    initializeBindings : function(){
        var self = this;
    }
};

