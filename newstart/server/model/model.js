var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Account = new Schema({
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
        host : String,
        dest : String,
        cost : Number,
        cost_cur : String,
        cost_iss : String,
        gain : Number,
        gain_cur : String,
        gain_iss : String,
        date : Number,
        ledger : Number,
        sequence : Number
    }],
    startTime : Number,
    maxLedger : Number,
    endTime : Number,
    minLedger : Number
});

exports.Account = mongoose.model('Account', Account);
exports.AccountTx = mongoose.model('AccountTx', AccountTx);