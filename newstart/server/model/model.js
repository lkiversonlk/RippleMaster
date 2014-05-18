var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Account = new Schema({
    name : String,
    password : String,
    email : String,
    rippleAddress : [{address : String, nickname : String, type:Number, config: [String]}]
});


var AccountTx = new Schema({
    name : String,
    transactions : [{
        transactiontype : Number,
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