var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//addressType : 0 watchAddress, 1 Gateway
var Account = new Schema({
    name : String,
    password : String,
    email : String,
    rippleAddress : [{address : String, nickname : String, addressType:Number}],
    id : String,
    type : String
});


var AccountTx = new Schema({
    address : String,
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

var AccountAddressState = new Schema({
    accountType: String,
    unique: String,
    addresses: [{address : String, states : [{ledger : Number, date : Number, baseiou : String, balances : [{currency : String, issuer : String, cost : Number}]}]}]
});

exports.Account = mongoose.model('Account', Account);
exports.AccountTx = mongoose.model('AccountTx', AccountTx);