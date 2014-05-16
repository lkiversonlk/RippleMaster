var Log = require('log');

function TransactionAnalyzer(address){
    this._logger = new Log("TransactionAnalyzer");
    this._address = address;
};

TransactionAnalyzer.TransactionType = {
    Send : 1,
    Receive : 2,
    Convert : 3,
    Buy     : 4,
    Sell    : 5
}

TransactionAnalyzer.prototype = {

    /**
     * transaction{
     *              meta
     *              tx{
     *                  Account:
     *                  Amount:
     *                  Destination:
     *                  Fee:
     *                  Flags:
     *                  TransactionType:
     *                  date:
     *                }
     *
 *                }
     * @param transactions
     * @returns {Array}
     * @constructor
     */
    AnalyzeTransactions : function(transactions){
        var self = this;
        var ret = new Array();
        for(var i in transactions){
            var transaction = self.ParseTransaction(transactions[i]);
            var logger = self._logger;
            logger.log(Log.DEBUG_LEVEL, transaction.Date());
            switch (transaction.Type()){
                case Transaction.Type.Send:
                    if(transaction.Cost()){
                        logger.log(Log.DEBUG_LEVEL, " send " + transaction.Cost().Money() + " " + transaction.Cost().Currency() + " to " + transaction.Dest());
                        ret.push(transaction);
                    }else{
                        logger.log(Log.DEBUG_LEVEL, "error:" + transactions[i]);
                    }
                    break;
                case Transaction.Type.Receive:
                    if(transaction.Amount()){
                        logger.log(Log.DEBUG_LEVEL, " receive " + transaction.Amount().Money() + " " + transaction.Amount().Currency() + " from " + transaction.Host());
                        ret.push(transaction);
                    }else{
                        logger.log(Log.DEBUG_LEVEL, "error:" + transactions[i]);
                    }
                    break;
                case Transaction.Type.Trade :
                    if(transaction.Cost() && transaction.Amount()){
                        logger.log(Log.DEBUG_LEVEL, " trade " + transaction.Cost().Money() + " " + transaction.Cost().Currency() + " to " + transaction.Amount().Money() + " " + transaction.Amount().Currency());
                        ret.push(transaction);
                    }else{
                        logger.log(Log.DEBUG_LEVEL, "error:" + transactions[i]);
                    }
                    break;
                case Transaction.Type.ERROR   :
                    logger.log(Log.DEBUG_LEVEL, " ");
                    break;
            }
        };
        return ret;
    },


    ParseTransaction : function(transaction){
        var self = this;
        var ret = new Transaction();
        var host = transaction.tx.Account;
        var guest = transaction.tx.Destination;
        ret.SetHost(host);
        ret.SetDest(guest);
        ret.SetFee(new Balance(transaction.tx.Fee));
        ret.SetDate(Util.toTimestamp(transaction.tx.date));

        switch (transaction.tx.TransactionType){
            case "Payment":
                if(host !== self._address && guest === self._address){
                    /* receive from Account -> Destination [Amount] */
                    ret.SetType(Transaction.Type.Receive);
                }else if(host === self._address && guest !== self._address){
                    /* send from Account -> Destination [Amount] */
                    ret.SetType(Transaction.Type.Send);
                }else if(host === self._address && guest === self._address){
                    /* convert */
                    ret.SetType(Transaction.Type.Trade);
                }else{
                    ret.SetType(Transaction.Type.ERROR);
                    return ret;
                }
                break;
            case "OfferCreate":
                if(host !== self._address){
                    /* order filled */
                    ret.SetType(Transaction.Type.Trade);
                }else{
                    /* create order */
                    /* unknown type, maybe just create order or convert some at the same time */
                    ret.SetType(Transaction.Type.WaitForMeta);
                }
                break;
            default :
                return ret;
        }
        self.parseMetas(transaction.meta, ret);
        return ret;
    },

    parseMetas : function(meta, transaction){
        var self = this;
        /* Current meta parse
        *  first : meta.TransactionResult shoulde be "tesSUCCESS"
        *  then : meta.AffectedNodes [
        *                             ModifiedNode{

        *                                               FinalFields{
    *                                                       Balance (Balance Class)
         *                                                  HighLimit{
     *                                                           currency (the currency)
     *                                                           issuer   (the owner)
     *                                                               }
 *                                                          LowLimit{
*                                                               currency (the currency)
*                                                               issuer   (the issuer of the currency)
*                                                                    }
 *                                                               }
        *                                               PreviousFields.Balance (Balance Class)
        *                                               LedgerEntryType : "RippleState"
        *                                           },      *** RippleState ***

        /*                            ModifiedNode{
         *                                               FinalFields{
     *                                                                      Account
 *                                                                          Balance (xrp string)
     *                                                                  }
         *                                               PreviousFields.Balance{
         *                                                                          Balance (xrp string)
         *                                                                      }
         *                                               LedgerEntryType : "AccountRoot"
         *                                           }        *** AccountRoot ***
        *                            ]
         */
        if(meta.TransactionResult !== Transaction.RESULT.SUCCESS){
            return null;
        }else{
            $.each(meta.AffectedNodes, function(i){
               var node = meta.AffectedNodes[i].ModifiedNode;
                if(typeof node!== 'undefined') {
                    if(node.LedgerEntryType === Transaction.LEDGER_ENTRY_TYPE.ACCOUNT_ROOT){
                        if(!node.FinalFields) return;
                        var account = node.FinalFields.Account;
                        if(account === self._address){
                            var current = new Balance(node.FinalFields.Balance);
                            if(typeof  node.PreviousFields.Balance !== 'undefined'){
                                var previous = new Balance(node.PreviousFields.Balance);
                                var xrpCost = current.Money() - previous.Money() + transaction.Fee().Money();
                                if(Math.abs(xrpCost) > 0.0001){
                                    if(xrpCost > 0){
                                        transaction.SetAmount(new Balance(xrpCost));
                                    }else{
                                        transaction.SetCost(new Balance(-1 * xrpCost));
                                    }
                                }
                            }else{
                                //somebody buy your order, nothing changed.
                            }
                        }
                    }else if(node.LedgerEntryType === Transaction.LEDGER_ENTRY_TYPE.RIPPLE_STATE){
                        if(node.FinalFields.HighLimit.issuer == self._address){
                            var current = new Balance(node.FinalFields.Balance);
                            current.SetIssuer(node.FinalFields.LowLimit.issuer);
                            var previous = new Balance(node.PreviousFields.Balance);
                            current.SetMoney(previous.Money() - current.Money());
                            if(current.Money() > 0){
                                if(transaction.Amount()){
                                    transaction.Amount().SetMoney(transaction.Amount().Money() + current.Money());
                                }else {
                                    transaction.SetAmount(current);
                                }
                            }else{
                                current.SetMoney(-1 * current.Money());
                                if(transaction.Cost()){
                                    transaction.Cost().SetMoney(transaction.Cost().Money() + current.Money());
                                }else {
                                    transaction.SetCost(current);
                                }
                            }
                        }else if(node.FinalFields.LowLimit.issuer == self._address){
                            var current = new Balance(node.FinalFields.Balance);
                            current.SetIssuer(node.FinalFields.HighLimit.issuer);
                            var previous = new Balance(node.PreviousFields.Balance);
                            current.SetMoney(previous.Money() - current.Money());
                            if(current.Money() < 0){
                                current.SetMoney(-1 * current.Money());
                                transaction.SetAmount(current);
                            }else{
                                transaction.SetCost(current);
                            }
                        }
                    }
                }

            });
            if(transaction.Type() === Transaction.Type.WaitForMeta){
                if(typeof transaction.Amount() !== 'undefined'){
                    transaction.SetType(Transaction.Type.Trade);
                }
            }
        }
    }
}