var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Account = new Schma({
    name : String,
    password : String,
    email : String,
    rippleAddress : [{address : String, nickname : String, type : Number}],
    language : String
});


var AccountTx = new Schema({
    name : String,
    transactions : [{
        type : String,
        cost : Number,
        cost_cur : String,
        cost_iss : String,
        gain : Number,
        gain_cur : String,
        gain_iss : String
    }]
});

exports.Account = mongoose.model('Account', Account);
exports.AccountTx = mongoose.model('AccountTx', AccountTx);