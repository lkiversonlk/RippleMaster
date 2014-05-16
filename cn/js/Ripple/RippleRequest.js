/**
 * Created by kliu on 2014/4/23.
 */
function RippleRequest(cmd, callback){
    this._callback = callback;
    this.message = {
        command : cmd,
        id : void(0)
    }
};

RippleRequest.Logger = new Log("RippleRequest");
RippleRequest.RequestCMD = {
  ServerInfo : 'server_info',
  TransactionEntry : 'transaction_entry',
  AccountInfo : 'account_info',
  AccountLines : 'account_lines',
  AccountOffers : 'account_offers',
  AccountTransactions : 'account_tx',
  BookOffers : 'book_offers',
  Data_sign : 'data_sign',
  Data_verify : 'data_verify',
  Ledger : 'ledger',
  LedgerClosed : 'ledger_closed',
  LedgerCurrent : 'ledger_current',
  LedgerData : 'ledger_data',
  LedgerEntry : 'ledger_entry',
  PathFind : 'path_find'


};

RippleRequest.prototype.Callback = function(result, msg){
    if(typeof this._callback !== 'undefined'){
        this._callback(result, msg);
    }
}


RippleRequest.ServerInfoRequest = function(callback){
    return new RippleRequest(RippleRequest.RequestCMD.ServerInfo,callback);
}

RippleRequest.TransactionRequest = function(hash, ledger_hash, callback){
    var request = new RippleRequest(RippleRequest.RequestCMD.TransactionEntry);
}

/****
 *
 * AccountInfo:
 *     account{address : value, xrp : value}
 *
 */
RippleRequest.AccountRequest = function(type, account, options, callback){
    RippleRequest.Logger.log(Log.DebugLevel, "find " + type + " of account: " + account);
    var request = new RippleRequest(type, function(result, msg){
        RippleRequest.Logger.log(Log.DEBUG_LEVEL, JSON.stringify(msg));
        if(result !== Consts.RESULT.SUCCESS){
            RippleRequest.Logger.log(Log.DEBUG_LEVEL, type + " request failed, error " + msg);
            callback(result, msg);
        }else{
            RippleRequest.Logger.log(Log.DEBUG_LEVEL, type + " request succeed");
            var ret;
            switch (type){
                case RippleRequest.RequestCMD.AccountInfo:
                    ret = {
                        address : msg.result.account_data.Account,
                        xrp : new Balance(msg.result.account_data.Balance)
                    }
                    break;
                case RippleRequest.RequestCMD.AccountLines:
                    var lines = msg.result.lines;
                    ret = new Array();
                    $.each(lines, function(i){
                        var balance = new Balance(lines[i]);
                        ret.push(balance);
                    });
                    break;
                case RippleRequest.RequestCMD.AccountOffers:
                    var offers = msg.result.offers;
                    ret = new Array();
                    $.each(offers, function(i){
                        var sell = new Balance(offers[i].taker_gets);
                        var  want = new Balance(offers[i].taker_pays);
                        ret.push(new Offers(sell, want));
                    });
                    break;
                case RippleRequest.RequestCMD.AccountTransactions:
                    var analyzer = new TransactionAnalyzer(msg.result.account);
                    var transactions = analyzer.AnalyzeTransactions(msg.result.transactions);
                    var ret = {
                        transactions : transactions,
                        marker : msg.result.marker
                    }
            };
            callback(Consts.RESULT.SUCCESS, ret);
        }
    });
    request.message.account = account;
    $.extend(request.message, options);
    return request;
}