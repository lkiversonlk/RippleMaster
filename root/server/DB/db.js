var mongoose = require('mongoose');
var model = require("./model.js");

var Account = model.Account;
var AccountTx = model.AccountTx;

function DB(connectionStr, username, passwd) {
    var self = this;

    self.Start = function(debugging){
        mongoose.set('debug', debugging);
        mongoose.connect(connectionStr);
    };

    self.CreateAccount = function(searchOptions, createOptions, callback){
        Account.findOne(searchOptions, function(err, doc){
            if(err){
                callback(DB.RESULT.FAIL);
            }else{
                if(doc){
                    callback(DB.RESULT.FAIL_EXIST);
                }else{
                    var account = new Account(createOptions);
                    account.save();
                    callback(DB.RESULT.SUCC);
                }
            }
        });
    };

    self.FindAccount = function(options, callback){
        Account.findOne(options, function(err, doc){
            if(err){
                callback(DB.RESULT.FAIL);
            }else{
                if(doc){

                    callback(DB.RESULT.SUCC, doc);
                }else{
                    callback(DB.RESULT.FAIL_NOT_EXISIT);
                }
            }
        });
    };

    self.UpdateAccount = function(searchOptions, updateOptions, callback){
        Account.findOne(searchOptions, function(err, doc){
            if(err){
                callback(DB.RESULT.FAIL);
            }else{
                if(doc){
                    for(var k in updateOptions){
                        if(updateOptions.hasOwnProperty(k)){
                            doc[k] = updateOptions[k];
                        }
                    }
                    doc.save();
                    callback(DB.RESULT.SUCC);
                }else{
                    callback(DB.RESULT.FAIL_NOT_EXISIT);
                }
            }
        });
    };

    self.UpdateOrCreateAccount = function(searchOptions, updateOptions, createOptions, callback){
        Account.findOne(searchOptions, function(err, doc){
            if(err){
                callback(DB.RESULT.FAIL);
            }else{
                if(doc){
                    for(var k in updateOptions){
                        if(updateOptions.hasOwnProperty(k)){
                            doc[k] = updateOptions[k];
                        }
                    }
                    doc.save();
                    callback(DB.RESULT.SUCC);
                }else{
                    var account = new Account(createOptions);
                    account.save();
                    callback(DB.RESULT.SUCC);
                }
            }
        });
    };

    /*
    self.RegisterLocalAccount = function(name, passwd, email, callback){
        self.FindLocalAccount(name, function(result, account){
            if(result === DB.RESULT.FAIL_NOT_EXISIT){
                var dbAccount = new Account({
                    name:name,
                    password:passwd,
                    email: email,
                    rippleAddress : [],
                    type: DB.localType
                });
                dbAccount.save();
                callback(DB.RESULT.SUCC, DB.localType, name);
            }else if(result === DB.RESULT.SUCC){
                callback(DB.RESULT.FAIL_EXIST);
            }else{
                callback(DB.RESULT.FAIL);
            }
        });
    };

    self.FindOAuthAccount = function(id, type, callback){
        Account.findOne({id:id, type:type}, function(err, doc){
            if(err){
                callback(DB.RESULT.FAIL);
            }else{
                if(doc){
                    callback(DB.RESULT.SUCC, doc);
                }else{
                    callback(DB.RESULT.FAIL_NOT_EXISIT);
                }
            }
        });
    };

    self.UpdateOAuthAccount = function(id, type, name, email, callback){
        self.FindOAuthAccount(id, type, function(result, account){
            if(result === DB.RESULT.FAIL_NOT_EXISIT){
                var dbAccount = new Account({
                    id: id,
                    type:type,
                    name : name,
                    email: email,
                    rippleAddress : []
                });
                dbAccount.save();
                callback(DB.RESULT.SUCC);
            }else if(result === DB.RESULT.SUCC){
                account.name = name;
                account.email = email;
                account.type = type;
                account.save();
                callback(DB.RESULT.SUCC);
            }else{
                callback(DB.RESULT.FAIL);
            }
        });
    };
    */
    self.AccountCount = function(callback){
        var ret = {};
        Account.count({}, function(err, count){
            if(err){
                callback(DB.RESULT.FAIL);
            }else{
                ret['users'] = count;
                callback(DB.RESULT.SUCC, ret);
            }
        });
    };

    self.UpdateModel = function(model, options){
        for(var key in options){
            if(options.hasOwnProperty(key)){
                model[key] = options[key];
            }
        };
        model.save();
    }

    /*
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
    };*/

    self.Stop = function(){
        mongoose.disconnect();
    };
}

DB.localType = 'l';
DB.GoogleType = "g";

DB.RESULT = {
    SUCC : 0,
    FAIL : 1,
    FAIL_NOT_EXISIT : 2,
    FAIL_EXIST : 3
}

exports.DB = DB;