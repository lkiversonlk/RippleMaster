var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//SingSetting
var Setting = new Schema({
    address : String,
    modules : [String]
});

//Account Shema
var Account = new Schema({
    name : String,
    password : String,
    settings : [{address:String, configure:[String]}]
});

exports.Account = mongoose.model('Account', Account);
