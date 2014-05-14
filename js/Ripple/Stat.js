function Stat(){

};


Stat.CalIOUSummary = function(start, end, dataCollection){
    var ret = {};

    dataCollection.ForeachTransaction(start, end, function(tx){
        var cost = null;
        var amount = null;
        if(tx.Cost()){
            cost = tx.Cost().Currency() + tx.Cost().Issuer();
            if(!ret[cost]){
                ret[cost] = {
                    sell : 0, send : 0, receive : 0, buy : 0
                };
            }
        }
        if(tx.Amount()){
            amount = tx.Amount().Currency() + tx.Amount().Issuer();
            if(!ret[amount]){
                ret[amount] = {
                    sell : 0, send : 0, receive : 0, buy : 0
                };
            }
        }
        switch (tx.Type()){
            case Transaction.Type.Send:
                ret[cost].send += tx.Cost().Money();
                break;
            case Transaction.Type.Receive:
                ret[amount].receive += tx.Amount().Money();
                break;
            case Transaction.Type.Trade :
                ret[cost].sell += tx.Cost().Money();
                ret[amount].buy += tx.Amount().Money();
                break;
            case Transaction.Type.ERROR   :
                // do nothing //
                break;
        }
    });

    return ret;
};

Stat.CallIOUSendReceive = function(start, end, dataCollection){
    var ret = new Array();
    dataCollection.ForeachTransaction(start, end, function(tx){

    });

    return ret;
};

Stat.CalIOUBuySell = function(start, end, baseIOU, refIOU, dataCollection){
    var sellHigh = null;
    var sellLow = null;
    var buyHigh = null;
    var buyLow = null;
    var sellRecords = new Array();
    var buyRecords = new Array();
    var sellBase = 0;
    var buyRef = 0;
    var sellRef = 0;
    var buyBase = 0;

    dataCollection.ForeachTransaction(start, end, function(tx){
        if(tx.Type() === Transaction.Type.Trade){
            var sellIOU = tx.Cost().Currency() + tx.Cost().Issuer();
            var sellAmount = tx.Cost().Money();
            var buyIOU = tx.Amount().Currency() + tx.Amount().Issuer();
            var buyAmount = tx.Amount().Money();

            if(sellIOU == baseIOU && buyIOU == refIOU){
                //sell
                var rate = buyAmount / sellAmount;
                if(!sellLow || rate < sellLow){
                    sellLow = rate;
                }
                if(!sellHigh || rate > sellHigh){
                    sellHigh = rate;
                }
                sellBase += sellAmount;
                buyRef += buyAmount;
                sellRecords.push({
                    'rate' : rate,
                    'sell' : sellAmount,
                    'buy' : buyAmount
                });
            }else if(sellIOU == refIOU && buyIOU == baseIOU){
                var rate = sellAmount/buyAmount;
                if(!buyLow || rate < buyLow){
                    buyLow = rate;
                }
                if(!buyHigh || rate > buyHigh){
                    buyHigh = rate;
                }
                sellRef += sellAmount;
                buyBase += buyAmount;
                buyRecords.push({
                   'rate' : rate,
                   'sell' : sellAmount,
                   'buy' : buyAmount
                });
            }
        }
    });

    //now shape the data.
    var finalSellRatio = (sellBase != 0 ? buyRef / sellBase : null);
    var finalBuyRatio = (sellRef != 0 ? sellRef / buyBase : null);
    var low = null;
    var high = null;
    if(sellRecords.length > 0){
        low = sellLow;
        high = sellHigh;
    }

    if(buyRecords.length > 0){
        if(low){
            low = low < buyLow ? low : buyLow;
        }else{
            low = buyLow;
        }
        if(high){
            high = high > buyHigh ? high : buyHigh;
        }else {
            high = buyHigh;
        }
    }

    if( (!finalSellRatio) && (!finalBuyRatio)){
        return null; //no data
    }

    var categoryCount = 5;
    var gap = (high - low) / categoryCount;
    var sellShaped = new Array();
    var buyShaped = new Array();
    var finalRecords = new Array();
    for(var i = 0; i < categoryCount; i++){
        sellShaped.push({
            'sell' : 0,
            'buy'   : 0
        });
        buyShaped.push({
            'buy' : 0,
            'sell' : 0
        });
        finalRecords.push({
            'rate' : 0,
            'buy' : 0,
            'sell' : 0
        });
    }

    $.each(sellRecords, function(i){
        var record = sellRecords[i];
        var rate = record.rate;
        var idx = Math.floor((rate - low)/gap);
        if(idx == categoryCount){
            idx --;
        }
        sellShaped[idx].sell += record.sell;
        sellShaped[idx].buy += record.buy;
        finalRecords[idx].sell += record.sell;
    });
    $.each(buyRecords, function(i){
        var record = buyRecords[i];
        var rate = record.rate;
        var idx = Math.floor((rate - low)/gap);
        if(idx == categoryCount){
            idx --;
        }
        buyShaped[idx].sell += record.sell;
        buyShaped[idx].buy += record.buy;
        finalRecords[idx].buy += record.buy;
    });

    for(var i = categoryCount - 1; i > -1 ; i--){
        if(sellShaped[i].sell != 0) {
            finalRecords[i].rate = sellShaped[i].buy / sellShaped[i].sell;
        }
        if(buyShaped[i].buy != 0){
            finalRecords[i].rate = buyShaped[i].sell / buyShaped[i].buy;
        }
        if(finalRecords[i].rate == 0){
            finalRecords.splice(i, 1);
        }
    }

    var ret = {
        lowestRatio : low,
        highestRatio : high,
        sellRatio : finalSellRatio,
        buyRatio : finalBuyRatio,
        sellBase : sellBase,
        buyBase : buyBase,
        sellRef : sellRef,
        buyRef : buyRef,
        records : finalRecords
    };
    return ret;
};