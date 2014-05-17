var RippleMaster = require("./Ripple/RippleMaster").RippleMaster;
var Transaction = require("./Ripple/Transaction").Transaction;
var Host = require("./Host").Host;

var Log = require('log').log;

Log.SetLevel(Log.DEBUG_LEVEL);
var options = {};
options.servers = [
    {
        domain : "s1.ripple.com",
        port : 443,
        secure : true
    },
    {
        domain : "s-west.ripple.com",
        port : 443,
        secure : true
    },
    {
        domain : "s-east.ripple.com",
        port : 443,
        secure : true
    }
];

options.db = "mongodb://localhost/ripplemaster";

var host = new Host();

host.Work(options, function(){
    host.InitRippleTx("r9zbt4tB2s3KsrmgE6r1KoZtVN4cNAsfxN")
});


