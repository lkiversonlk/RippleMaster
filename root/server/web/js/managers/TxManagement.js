
function TxManager(){
    this.txesInMonth = [];
    this.monthCount = 0;
    this.startYear = null;
    this.startMonth = null;
    this.index = 0;
}

TxManager.BATCH_SIZE = 200;

TxManager.prototype = {
    AddTransactions : function(transactions){
        var self = this;
        for(var i in transactions){
            var tx = transactions[i];
            var date = Util.toTimestamp(tx.date);

            var year = date.getYear();
            var month = date.getMonth();

            if(!self.startYear || self.startYear > year || self.startMonth > month){
                self.txesInMonth.unshift([]);
                self.startYear = year;
                self.startMonth = month;
            }

            self.txesInMonth[0].unshift(tx);
        }
    },

    SetMonthGap : function(number){
        this.gap = number;
        this.index = 0;
    },

    Next : function(){
        return this.NextN(this.gap);
    },

    NextN : function(n){
        var self = this;
        if(self.index >= self.txesInMonth.length){
            return null;
        }
        if(n == 1){
            return self.txesInMonth[self.index++];
        }else{
            var ret = self.txesInMonth[self.index++];
            var add = (self.NextN(n - 1));
            if(add == null){
                return ret;
            }else{
                return ret.concat(add);
            }
        }
    }
}