/*Design :
 * able to summary transactions by date, currently we only support month
 * this should only be a data basic
 */

function DataCollection(address){
    this._address = address;
    this._timeRange = null;
    this._txes = [];
};

DataCollection.prototype = {
    TimeRange : function(){
        return this._timeRange;
    },

    Address : function(){
        return this._address;
    },

    AddTransactions : function(transactions){
        var self = this;
        $.each(transactions, function(i){
            self.AddTransaction(transactions[i]);
        })
    },

    AddTransaction : function(transaction){
        var txDate = transaction.Date();
        if(this._timeRange){
            if(txDate > this._timeRange.end){
                this._timeRange.end = txDate;
            }else if(txDate < this._timeRange.start){
                this._timeRange.start = txDate;
            }
        }else{
            this._timeRange = {start : txDate, end : txDate};
        }
        this._txes.push(transaction);
    },

    ForeachTransaction : function(start, end, handler){
        var self = this;
        $.each(self._txes, function(i){
            var tx = self._txes[i];
            var time = tx.Date();
            if(((!start) || time >= start) &&((!end) || time <= end)){
                handler(tx);
            }
        });
    }
}