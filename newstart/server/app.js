var RippleServer = require("./Ripple/RippleServer").RippleServer;
var RippleRequest = require("./Ripple/RippleRequest").RippleRequest;
var rippleServer = new RippleServer();
var Log = require('log').log;

rippleServer.AddServer({
    domain : "s1.ripple.com",
    port : 443,
    secure : true
});

rippleServer.AddServer({
    domain : "s-west.ripple.com",
    port : 443,
    secure : true
});
rippleServer.AddServer({
    domain : "s-east.ripple.com",
    port : 443,
    secure : true
});

Log.SetLevel(Log.DEBUG_LEVEL);

var options = {
    ledger_index_min:-1,
    ledger_index_max:-1,
    limit:30
};

rippleServer.Connect(function(result){
    if(result === RippleServer.RESULT.SUCC){
        console.log("Success");
        var acctxRequest = RippleRequest.AccountRequest(RippleRequest.RequestCMD.AccountTransactions, "r9zbt4tB2s3KsrmgE6r1KoZtVN4cNAsfxN", options, function(result, txes){

        });
        rippleServer.Request(acctxRequest);
    }
})


