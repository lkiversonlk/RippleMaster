var db = require('./model/db').db;
var AccountTx = require('./model/model').AccountTx;
var RippleMaster = require("./Ripple/RippleMaster").RippleMaster;
var Transaction = require("./Ripple/Transaction").Transaction;

function Host(){
    this.running = false;
};

Host.prototype.Work = function(options, callback){
    var self = this;
    self.db = new db(options.db, null, null);
    self.db.start(options.debugging);
    self.rpMaster = new RippleMaster();
    self.rpMaster.on(RippleMaster.EVENT.ST, function(){
        self.running = (self.rpMaster.state == RippleMaster.STATE.ON);
    });

    self.rpMaster.Start(options.servers, callback);
};

Host.prototype.InitRippleTx = function(account){
    var handle = function(transactions, accountTx){
        for(var i in transactions){
            var txRp = transactions[i];
            var txDb = {};
            txDb.transactiontype = txRp.type;
            txDb.host = txRp.host;
            txDb.dest = txRp.dest;
            txDb.cost = txRp.cost ? txRp.cost.Money() : 0;
            txDb.cost_cur = txRp.cost ? txRp.cost.Currency() : "";
            txDb.cost_iss = txRp.cost ? txRp.cost.Issuer() : "";
            txDb.gain = txRp.amount ? txRp.amount.Money() : 0;
            txDb.gain_cur = txRp.amount ? txRp.amount.Currency() : "";
            txDb.gain_iss = txRp.amount ? txRp.amount.Issuer() : "";
            txDb.date = txRp.date;
            txDb.ledger = txRp.ledger;
            txDb.sequence = txRp.sequence;
            accountTx.transactions.push(txDb);
        }
    };

    var self = this;
    if(self.running){
        var first = true;
        var save = new AccountTx({
            name : account,
            transactions : []
        });
        self.rpMaster.ConsultTransactions(account, function(more, transactions){
            handle(transactions, save);
            if(first){
                if(transactions.length > 0){
                    save.endTime = transactions[0].date;
                    save.maxLedger = transactions[0].ledger;
                }
            }
            if(!more){
                if(transactions.length > 0){
                    save.startTime = transactions[transactions.length - 1].date;
                    save.minLedger = transactions[transactions.length - 1].ledger;
                }
                save.save();
            }
            return true;
        })
    }
};

Host.prototype.FetchRippleTx = function(account){
    var self = this;
    if(self.running){
        AccountTx.findOne({name : account}, function(err, doc){
            if(err){

            }else{
                if(doc){
                    var test = doc.toObject();
                    var transactions = doc.transactions;
                }else{

                }
            }
        })
    }
}


exports.Host = Host;


