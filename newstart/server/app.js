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

rippleServer.Connect(function(result){
    if(result === RippleServer.RESULT.SUCC){
        console.log("Success");
        var accountRequest = RippleRequest.AccountRequest(RippleRequest.RequestCMD.AccountInfo, "rB5r6M82VQqz8GnD4wfY4UTUikcEyox7mx", null, function(result, account){
            console.log(account);
        });
        rippleServer.Request(accountRequest);
    }
})


