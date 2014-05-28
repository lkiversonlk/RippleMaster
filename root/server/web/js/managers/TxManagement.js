
function TxManager(){
    this.txes = [];
    this.startDate = null;
    this.endDate = null;
    this.minLedger = null;
    this.maxledger = null;
    this.index = 0;
    this.marker = null;
}

TxManager.BATCH_SIZE = 200;

TxManager.prototype = {
    AddTransactions : function(transactions){
        var self = this;
        if(transactions.length <= 0) return;
        transactions.reverse();
        var txMinLedger = transactions[0].ledger;
        var txStartDate = transactions[0].date;
        var txMaxLedger = transactions[transactions.length - 1].ledger;
        var txEndDate = transactions[transactions.length - 1].date;

        if(!self.maxLedger){
            self.startDate = txStartDate;
            self.endDate = txEndDate;
            self.minLedger = txMinLedger;
            self.maxLedger = txMaxLedger;
            self.txes = self.txes.concat(transactions);
            return;
        };

        var i;
        for(i = 0; i < transactions.length; i++){
            var tx = transactions[i];
            if(tx.ledger >= self.minLedger) break;
        };
        var length = i;

        if(length > 0){
            self.txes = transactions.slice(0, length).concat(self.txes);
            self.minLedger = self.txes[0].ledger;
            self.startDate = self.txes[0].date;
        }

        for(; i < transactions.length; i++){
            var tx = transactions[i];
            if(tx.ledger > self.maxLedger) break;
        }

        if(i == transactions.length) return;
        self.txes = self.txes.concat(transactions.slice(i));
        self.maxLedger = self.txes[self.txes.length - 1].ledger;
        self.endDate = self.txes[self.txes.length - 1].date;
    },

    QueryTransaction : function(startDate, endDate){
        var i, j;
        var self = this;
        for(i = 0; i < self.txes.length; i++){
            var tx = self.txes[i];
            if(tx.date >= startDate) break;
        }
        for(j = self.txes.length - 1; j >=0 ; j--){
            var tx = self.txes[j];
            if(tx.date <= endDate) break;
        }
        if(i <= j){
            return self.txes.slice(i, j + 1);
        }else{
            return [];
        }
    }
}