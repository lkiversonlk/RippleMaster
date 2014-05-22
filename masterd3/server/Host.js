var db = require('./DB/db').db;
var Account = require('./DB/model').Account;
var AccountTx = require('./DB/model').AccountTx;
var RippleMaster = require("./Ripple/RippleMaster").RippleMaster;
var Transaction = require("./Ripple/Share").Transaction;
var Common = require("./Ripple/Share").Common;
var crypto = require('crypto');

function Host(options){
    var self = this;
    self.options = options;
    self.running = false;
    self.db = new db(self.options.db, null, null);
    self.rpMaster = new RippleMaster();
};

Host.prototype.Work = function(callback){
    var self = this;
    self.db.start(self.options.debugging);
    self.rpMaster.on(RippleMaster.EVENT.ST, function(){
        self.running = (self.rpMaster.state == RippleMaster.STATE.ON);
    });

    self.rpMaster.Start(self.options.servers, callback);
};

Host.prototype.InitRippleTx = function(account, callback){
    var self = this;

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

    AccountTx.findOne({name : account}, function(err, doc){
        if(doc){
            if(callback){callback(Consts.RESULT.FAIL_ACCOUNT, doc.toObject().transactions);}
        }else{
            var first = true;
            var save = new AccountTx({
                name : account,
                transactions : []
            });
            self.rpMaster.ConsultTransactions(account, null, function(result, more, transactions){
                if(result != Common.RESULT.SUCC){
                    return false;
                }else{
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
                        if(callback) {callback(Common.RESULT.SUCC, save.toObject().transactions);}
                    }
                }
                return true;
            })
        }
    });
};

Host.prototype.InitAccount = function(account, password, email, callback){
    var self = this;
    Account.findOne({name : account}, function(err, doc){
        if(err){
            callback(Common.RESULT.FAIL);
        }else if(doc){
            callback(Common.RESULT.FAIL_ACCOUNT);
        }else{
            var cipher = crypto.createCipher('aes-256-cbc', self.options.dbKey);
            var crypted = cipher.update(password, 'utf-8', 'hex');
            crypted += cipher.final('hex');

            var save = new Account({
                name : account,
                password : crypted,
                email : email,
                rippleAddress : []
            });
            save.save();
            callback(Common.RESULT.SUCC);
        }
    })
}

Host.prototype.LoginAccount = function(account, password, callback){
    var self = this;
    Account.findOne({name : account}, function(err, doc){
        if(err){
            callback(Common.RESULT.FAIL);
        }else if(doc){
            var correct = doc.password;
            var cipher = crypto.createCipher('aes-256-cbc', self.options.dbKey);
            var crypted = cipher.update(password, 'utf-8', 'hex');
            crypted += cipher.final('hex');

            if(correct == crypted){
                callback(Common.RESULT.SUCC);
            }else{
                callback(Common.RESULT.FAIL_ACCOUNT);
            }
        }else{
            callback(Common.RESULT.FAIL_ACCOUNT);
        }
    })
}

Host.prototype.AddressInfo = function(address, ledger, callback){
    this.rpMaster.AddressInfo(address, ledger, callback);
};

Host.prototype.AccountInfo = function(account, callback){
    var self = this;
    Account.findOne({name : account}, function(err, doc){
        if(err){
            callback(Common.RESULT.FAIL);
        }else if(doc){
            var ret = doc.toObject();
            delete ret['password'];
            callback(Common.RESULT.SUCC, ret);
        }else{
            callback(Common.RESULT.FAIL_ACCOUNT);
        }
    })
};

Host.prototype.UpdateAccountInfo = function(accountInfo, callback){
    var self = this;
    Account.findOne({name : accountInfo.name}, function(err, doc){
        if(err){
            callback(Common.RESULT.FAIL);
        }else if(doc){
            if(accountInfo.email){
                doc.email = accountInfo.email;
            }
            if(accountInfo.rippleAddress){
                doc.rippleAddress = accountInfo.rippleAddress;
            }
            doc.save();
            callback(Common.RESULT.SUCC);
        }else{
            callback(Common.RESULT.FAIL_ACCOUNT);
        }
    })
}

Host.prototype.RpStatus = function(callback){
    var ret = {};
    Account.count({}, function(err, count){
        if(err){
            callback(Common.RESULT.FAIL);
        }else{
            ret['users'] = count;
            callback(Common.RESULT.SUCC, ret);
        }
    })
}
/*
 Host.prototype.UpdateAccountTx = function(account, callback){
 var self = this;
 AccountTx.findOne({name : account}, function(err, doc){
 if(err || !doc){
 self.InitRippleTx(account, callback);
 }else{
 var minLedger = doc.minLedger;
 var maxLedger = doc.maxLedger;


 }
 })
 }
 */

Host.prototype.FetchAccountTx = function(address, startTime, endTime){

}
exports.Host = Host;


