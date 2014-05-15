
/* when user login*/
function AddressFlag(){
    this.marker = null;
    this.finished = false;
};

function TxManager(){
    var self = this;
    self.initial();
}

TxManager.BATCH_SIZE = 200;

TxManager.prototype = {
    initial : function(){
        this._data = {};
        this._logger = new Log("TxManager");
        this._flag = {};
    },

    AddAddressTransactions : function(address, transactions, marker){
        var self = this;
        if(!self._data[address]){
            self._data[address] = new DataCollection(address);
            self._flag[address] = new AddressFlag();
        }
        self._data[address].AddTransactions(transactions);
        if(marker){
            self._flag[address].marker = marker;
            self._flag[address].finished = false;
        }else{
            self._flag[address].marker = null;
            self._flag[address].finished = true;
        }
    },

    QueryData : function(address){
        var self = this;
        if(self._data){
            return self._data[address];
        }
        return null;
    },

    Flag : function(address){
        return this._flag[address];
    }
}