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
    self.db.start();
    self.rpMaster = new RippleMaster();
    self.rpMaster.on(RippleMaster.EVENT.ST, function(){
        self.running = true;
        callback();
    });

    self.rpMaster.Start(options.servers);
};

Host.prototype.InitRippleTx = function(account){
    var handle = function(transactions, accountTx){
        accountTx.transactions = [];
        for(var i in transactions){
            var txRp = transactions[i];
            var txDb = {};
            txDb.type = txRp.type;
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

            if(!accountTx.startTime){
                accountTx.startTime = accountTx.endTime = txDb.date;
                accountTx.maxLedger = accountTx.minLedger = txDb.ledger;
            }else{
                if(txDb.ledger <= accountTx.minLedger){
                    if(txDb.ledger < accountTx.minLedger){
                        accountTx.minLedger = txDb.ledger;
                        accountTx.startTime = txDb.date;
                    }else{
                        if(txDb.date <= accountTx.startTime){
                            accountTx.startTime = txDb.date;
                        }
                    }
                }else if(txDb.ledger >= accountTx.maxLedger){
                    if(txDb.ledger > accountTx.maxLedger){
                        accountTx.maxLedger = txDb.ledger;
                        accountTx.endTime = txDb.endTime;
                    }else{
                        if(txDb.date >= accountTx.endTime){
                            accountTx.endTime = txDb.date;
                        }
                    }
                }
            }
            accountTx.transactions.push(txDb);
        }
    };

    var self = this;
    if(self.running){
        self.db.fetchTx(account, function(result, transactions){
            if(result === db.RESULT.SUCC){

            }else{
                self.rpMaster.ConsultTransactions(account, function(more, transactions){
                    var save = new AccountTx({
                        name : account
                    });
                    handle(transactions, save);
                    save.save();
                })
            }
            return false;
        })
    }
};


exports.Host = Host;


