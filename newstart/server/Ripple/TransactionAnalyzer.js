var Log = require('log').log;
var Transaction = require("./Transaction").Transaction;
var Balance = require("./Model").Balance;

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
            logger.log(Log.DEBUG_LEVEL, transaction.date);
            switch (transaction.type){
                case Transaction.Type.Send:
                    if(transaction.cost){
                        logger.log(Log.DEBUG_LEVEL, " send " + transaction.cost.Money() + " " + transaction.cost.Currency() + " to " + transaction.dest);
                        ret.push(transaction);
                    }else{
                        logger.log(Log.DEBUG_LEVEL, "error:" + transactions[i]);
                    }
                    break;
                case Transaction.Type.Receive:
                    if(transaction.amount){
                        logger.log(Log.DEBUG_LEVEL, " receive " + transaction.amount.Money() + " " + transaction.amount.Currency() + " from " + transaction.host);
                        ret.push(transaction);
                    }else{
                        logger.log(Log.DEBUG_LEVEL, "error:" + transactions[i]);
                    }
                    break;
                case Transaction.Type.Trade :
                    if(transaction.cost && transaction.amount){
                        logger.log(Log.DEBUG_LEVEL, " trade " + transaction.cost.Money() + " " + transaction.cost.Currency() + " to " + transaction.amount.Money() + " " + transaction.amount.Currency());
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

    /*
     *
     meta: Object
     tx: Object
     Account: "r9zbt4tB2s3KsrmgE6r1KoZtVN4cNAsfxN"
     Amount: Object
     Destination: "rnuF96W4SZoCJmbHYBFoJZpR8eCaxNvekK"
     Fee: "12"
     Flags: 0
     SendMax: Object
     Sequence: 266
     SigningPubKey: "023B40FEBBB26CA465562713E015D1467864A429F36A75DE737BAE37C6FFAB1007"
     TransactionType: "Payment"
     TxnSignature: "3046022100F6EF31B4FF7BDE05C63017F2DBADC17CBFC29B6C9711463B475A6E423918BE24022100B4390A41407E48FB46EA46A3378C095B319D12391F1DBBFA59A39FAD28C9733A"
     date: 453540500
     hash: "D871733EFBD0BCC19368249B5C41ACC1696258406B121DFA0EBF88BB7D95EDE0"
     inLedger: 6653244
     ledger_index: 6653244
     __proto__: Object
     validated: true
     __proto__: Object
     */

    ParseTransaction : function(transaction){
        var self = this;
        var ret = new Transaction();
        var host = transaction.tx.Account;
        var guest = transaction.tx.Destination;
        ret.host = host;
        ret.dest = guest;
        ret.date = transaction.tx.date;
        ret.ledger = transaction.tx.inLedger;
        ret.sequence = transaction.tx.Sequence;
        ret.fee = new Balance(transaction.tx.Fee);

        switch (transaction.tx.TransactionType){
            case "Payment":
                if(host !== self._address && guest === self._address){
                    /* receive from Account -> Destination [Amount] */
                    ret.type = Transaction.Type.Receive;
                }else if(host === self._address && guest !== self._address){
                    /* send from Account -> Destination [Amount] */
                    ret.type = Transaction.Type.Send;
                }else if(host === self._address && guest === self._address){
                    /* convert */
                    ret.type = Transaction.Type.Trade;
                }else{
                    ret.type = Transaction.Type.ERROR;
                    return ret;
                }
                break;
            case "OfferCreate":
                if(host !== self._address){
                    /* order filled */
                    ret.type = Transaction.Type.Trade;
                }else{
                    /* create order */
                    /* unknown type, maybe just create order or convert some at the same time */
                    ret.type = Transaction.Type.WaitForMeta;
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
            for(var i in meta.AffectedNodes){
               var node = meta.AffectedNodes[i].ModifiedNode;
                if(typeof node!== 'undefined') {
                    if(node.LedgerEntryType === Transaction.LEDGER_ENTRY_TYPE.ACCOUNT_ROOT){
                        if(!node.FinalFields) return;
                        var account = node.FinalFields.Account;
                        if(account === self._address){
                            var current = new Balance(node.FinalFields.Balance);
                            if(typeof  node.PreviousFields.Balance !== 'undefined'){
                                var previous = new Balance(node.PreviousFields.Balance);
                                var xrpCost = current.Money() - previous.Money() + transaction.fee.Money();
                                if(Math.abs(xrpCost) > 0.0001){
                                    if(xrpCost > 0){
                                        transaction.amount = new Balance(xrpCost);
                                    }else{
                                        transaction.cost = new Balance(-1 * xrpCost);
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
                                if(transaction.amount){
                                    transaction.amount.SetMoney(transaction.amount.Money() + current.Money());
                                }else {
                                    transaction.amount = current;
                                }
                            }else{
                                current.SetMoney(-1 * current.Money());
                                if(transaction.cost){
                                    transaction.cost.SetMoney(transaction.cost.Money() + current.Money());
                                }else {
                                    transaction.cost = current;
                                }
                            }
                        }else if(node.FinalFields.LowLimit.issuer == self._address){
                            var current = new Balance(node.FinalFields.Balance);
                            current.SetIssuer(node.FinalFields.HighLimit.issuer);
                            var previous = new Balance(node.PreviousFields.Balance);
                            current.SetMoney(previous.Money() - current.Money());
                            if(current.Money() < 0){
                                current.SetMoney(-1 * current.Money());
                                transaction.amount = current ;
                            }else{
                                transaction.cost = current;
                            }
                        }
                    }
                }

            };

            if(transaction.type === Transaction.Type.WaitForMeta){
                if(typeof transaction.amount !== 'undefined'){
                    transaction.type = Transaction.Type.Trade;
                }
            }
        }
    }
};

exports.TransactionAnalyzer = TransactionAnalyzer;