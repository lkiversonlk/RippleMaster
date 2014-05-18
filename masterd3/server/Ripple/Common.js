
/* Gloabal Variable */
function Consts(){}

Consts.RESULT = {
    SUCC : 0,
    FAIL_NETWORK : 1,
    FAIL_MESSAGE : 2,
    FAIL_ACCOUNT : 3,
    FAIL_LOGIN : 4,
    FAIL : 5
};

Consts.GatewayMapping = {
    'ruazs5h1qEsqpke88pcqnaseXdm6od2xc'  : 'GKO Gateway',
    'rHZP1pA3THovFqvwgtM2tnJWrS54hSrDiG' : 'CTC Gateway',
    'rNKXT1p7jpt5WxSRSzmUV6ZB6kY7jdqHmx' : 'WCG',
    'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'  : 'Bitstamp',
    'rnuF96W4SZoCJmbHYBFoJZpR8eCaxNvekK' : 'RippleCN',
    'razqQKzJRdB4UxFPWf5NEpEG3WMkmwgcXA' : 'RippleChina'

};

Consts.RP_SERVERS = [
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

Consts.pad = function(num, size){
    var s = "000000" + num;
    return s.substr(s.length - size);
};

Consts.Palette = [
    "#AAD53B",
    "#E9772E",
    "#C0C0C0",
    "#CFE1A9"
];

Consts.ReversePalette = [
    "#E9772E",
    "#AAD53B",
    "#CFE1A9",
    "#C0C0C0"
];

exports.Consts = Consts;