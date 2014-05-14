/* Log */
function Log(type){this._type = type;}
Log.WORK_LEVEL = 0;
Log.DEBUG_LEVEL = 1;

Log.SetLevel = function(level) {
    this._level = level;
}

Log.GetLevel = function() {
    return this._level;
}

Log.prototype = {
    log : function(level, msg) {
        if(level <= Log.GetLevel()){
            console.log(this._type + ": " + msg);
        }
    }
};

/* Gloabal Variable */
function Consts(){}

Consts.RESULT = {
    SUCCESS : 'success',
    FAIL_NETWORKERROR : 'fail_network',
    FAIL_MESSAGEFORMAT : 'fail_message_format',
    FAIL_ACCOUNTNOTLOADED : 'fail_account_not_loaded',
    FAIL_LOGINFIRST : 'fail_loginfirst',
    FAIL : 'fail'
};

Consts.COOKIE = {
    ADDRESS : 'address'
};

Consts.SERVER_MESSAGE_TYPE = {
    LEDGER_CLOSED : "ledgerClosed",
    RESPONSE : "response",
    PATH_FIND : "path_find"
};

Consts.GatewayMapping = {
    'ruazs5h1qEsqpke88pcqnaseXdm6od2xc'  : 'GKO Gateway',
    'rHZP1pA3THovFqvwgtM2tnJWrS54hSrDiG' : 'CTC Gateway',
    'rNKXT1p7jpt5WxSRSzmUV6ZB6kY7jdqHmx' : 'WCG',
    'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'  : 'Bitstamp',
    'rnuF96W4SZoCJmbHYBFoJZpR8eCaxNvekK' : 'RippleCN',
    'razqQKzJRdB4UxFPWf5NEpEG3WMkmwgcXA' : 'RippleChina'

};

Consts.GetGatewayNick = function(address){
    if(typeof Consts.GatewayMapping[address] !== 'undefined'){
        return Consts.GatewayMapping[address];
    }
    return address;
}

Consts.EVENT = {
    STATE_CHANGE : 'state',
    BALANCE_LOADED : 'balance_loaded',
    TRANSACTION_LOADED : 'transaction_loaded'
};

Consts.PageParam = {
    PRICING_WIDTH : 170
};

Consts.DefaultNetConfig = {
    domain : "s1.ripple.com",
    port    : 443,
    secure   : true
};

Consts.BATCH_SIZE = 40;

Consts.DateToNumber = function(month, year){
    return ((year - 2000) * 12 + month);
};

Consts.STATE = {
    OFFLINE : 0,
    ONLINE : 1
};

Consts.pad = function(num, size){
    var s = "000000" + num;
    return s.substr(s.length - size);
};

Consts.FormatDate = function(date){
    var year = date.getFullYear() - 2000;
    var month = Consts.pad((date.getMonth() + 1), 2);
    var day = Consts.pad((date.getDate()), 2);
    var hour = Consts.pad((date.getHours() + 1), 2);
    var minute = Consts.pad((date.getMinutes()), 2);
    return year + "-" + month + "-" + day + " " + hour + ":" + minute;
}
//Here we use month [1-12]
Consts.NumberToDate = function(number){
    var year = Math.floor(number / 12);
    var month = number - year * 12;
    year += 2000;
    return {year : year, month : month};
};

/* page satus */
var mainPageParam = {
    ONLINE : 0,
    CONNECTING : 1
};

Consts.Palette = [
    "#88B8cc",
    "#aad53b",
    "#428bca",
    "#f2f3f5"
]