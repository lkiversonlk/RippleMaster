var mongoose = require('mongoose');
var model = require("./model.js");

var Account = model.Account;
var AccountTx = model.AccountTx;

db.RESULT = {
    SUCC : 0,
    FAIL : 1,
    NOT_EXISIT : 2,
    EXIST : 3
}

function db(connectionStr, username, passwd) {
    var self = this;

    self.start = function(){
        mongoose.connect(connectionStr);
    };

    self.matchAccount = function(account, password, callback){
        Account.findOne({name : account, password : password}, function(err, doc){
            if(err){
                callback(db.RESULT.FAIL);
            }else{
                if(doc){
                    callback(db.RESULT.SUCC, doc);
                }else{
                    callback(db.RESULT.NOT_EXISIT);
                }
            }
        });
    };
    self.fetchTx = function(account, callback){
        AccountTx.findOne({name : account}, function(err, doc){
            if(err){
                callback(db.RESULT.FAIL);
            }else{
                if(doc){
                    callback(db.RESULT.SUCC, doc.transactions);
                }else{
                    callback(db.RESULT.NOT_EXISIT);
                }
            }
        })
    };
    self.registerAccount = function(account, passwd, email, lanuage, callback){
        Account.findOne({name:account}, function(err, doc){
            if(!err){
                if(doc != null){
                    callback(db.RESULT.EXIST);
                }else{
                    var dbAccount = new Account({
                        name:account,
                        password:passwd,
                        email: email,
                        rippleAddress : [],
                        language : lanuage
                    });
                    dbAccount.save();
                    callback(db.RESULT.SUCC, account);
                }
            }else{
                callback(db.RESULT.FAIL);
            }
        })
    };
    self.stop = function(){
        mongoose.disconnect();
    };
}

exports.db = db;