var DB = require('./DB/db').DB;
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
    self.db = new DB(self.options.db, null, null);
    self.rpMaster = new RippleMaster();
};

Host.prototype.Work = function(callback){
    var self = this;
    self.db.Start(self.options.debugging);
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
            if(callback){callback(Common.RESULT.FAIL_ACCOUNT, doc.toObject().transactions);}
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

Host.prototype.InitLocalAccount = function(name, password, email, callback){
    var self = this;

    var cipher = crypto.createCipher('aes-256-cbc', self.options.dbKey);
    var crypted = cipher.update(password, 'utf-8', 'hex');
    crypted += cipher.final('hex');

    self.db.RegisterLocalAccount(name, crypted, email, function(result){
        switch (result){
            case DB.RESULT.SUCC:
                callback(Common.RESULT.SUCC);
                break;
            case DB.RESULT.FAIL_EXIST:
                callback(Common.RESULT.FAIL_ACCEXISTS);
                break;
            default :
                callback(Common.RESULT.FAIL);
                break;
        }
    });
};

Host.prototype.LoginLocalAccount = function(name, password, callback){
    var self = this;
    self.db.FindLocalAccount(name, function(result, account){
        if(result !== DB.RESULT.SUCC){
            callback(Common.RESULT.FAIL);
        }else{
            var cipher = crypto.createCipher('aes-256-cbc', self.options.dbKey);
            var crypted = cipher.update(password, 'utf-8', 'hex');
            crypted += cipher.final('hex');

            var correct = account.password;

            if(correct == crypted){
                callback(Common.RESULT.SUCC);
            }else{
                callback(Common.RESULT.FAIL_LOGINFIRST);
            }
        }
    });
};

Host.prototype.CreateOrUpdateOAuthAccount = function(id, type, name, email, callback){
    var self = this;
    self.db.UpdateOAuthAccount(id, type, name, email, function(result){
        switch (result){
            case DB.RESULT.SUCC:
                callback(Common.RESULT.SUCC);
                break;
            default :
                callback(Common.RESULT.FAIL);
                break;
        }
    });
};

Host.prototype.FindAccount = function(type, unique, callback){
    var self = this;
    if(type === DB.localType){
        self.db.FindLocalAccount(unique, function(result, account){
            if(result === DB.RESULT.SUCC){
                callback(Common.RESULT.SUCC, account);
            }else{
                callback(Common.RESULT.FAIL);
            }
        });
    }else{
        self.db.FindOAuthAccount(unique, type, function(result, account){
            if(result === DB.RESULT.SUCC){
                callback(Common.RESULT.SUCC, account);
            }else{
                callback(Common.RESULT.FAIL);
            }
        });
    }
};

Host.prototype.AddressInfo = function(address, ledger, callback){
    this.rpMaster.AddressInfo(address, ledger, callback);
};

/*
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
};
*/

Host.prototype.RpStatus = function(callback){
    this.db.AccountCount(function(result, ret){
        if(ret === DB.RESULT.SUCC){
            callback(Common.RESULT.SUCC, ret);
        }else{
            callback(Common.RESULT.FAIL);
        }
    });
};

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


