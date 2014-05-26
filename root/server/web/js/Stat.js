function Stat(){

};


Stat.CalIOUSummary = function(start, end, iou, dataCollection){
    var ret = {
        'send':0,
        'receive':0,
        'buy':0,
        'sell':0,
        buyDetail:{},
        sellDetail:{}
    };

    dataCollection.ForeachTransaction(start, end, function(tx){
        var proceed = 0;
        if(tx.cost){
            var costiou = tx.cost.Currency() + tx.cost.Issuer();
            if(costiou == iou){
                proceed = 1;
            }
        }
        if(tx.amount){
            var amountiou = tx.amount.Currency() + tx.amount.Issuer();
            if(amountiou == iou){
                proceed = 2;
            }
        }

        if(proceed != 0) {
            switch (tx.Type()){
                case Transaction.Type.Send:
                    ret['send'] += tx.cost.Value();
                    break;
                case Transaction.Type.Receive:
                    ret['receive'] += tx.amount.Value();
                    break;
                case Transaction.Type.Trade :
                    if(proceed == 1){
                        ret['sell'] += tx.cost.Value();
                        if(ret.sellDetail[tx.amount.Currency()]){
                            ret.sellDetail[tx.amount.Currency()] += tx.cost.Value();
                        }else{
                            ret.sellDetail[tx.amount.Currency()] = tx.cost.Value();
                        }
                    }else{
                        ret['buy'] += tx.amount.Value();
                        if(ret.buyDetail[tx.cost.Currency()]){
                            ret.buyDetail[tx.cost.Currency()] += tx.amount.Value();
                        }else{
                            ret.buyDetail[tx.cost.Currency()] = tx.amount.Value();
                        }
                    }
                    break;
                case Transaction.Type.ERROR   :
                    // do nothing //
                    break;
            }
        }
    });
    return ret;
};

Stat.CalIOUBuySell = function(baseIOU, refIOU, txes){
    var baseCurrency = baseIOU.substr(0,3);
    var refCurrency = refIOU.substr(0, 3);
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

    for(i in txes){
        var tx = txes[i];
        if(tx.type === Transaction.Type.Trade){
            var sellIOU = tx.cost.Currency() + tx.cost.Issuer();
            var sellAmount = tx.cost.Value();
            var buyIOU = tx.amount.Currency() + tx.amount.Issuer();
            var buyAmount = tx.amount.Value();

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
    };

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
    if(gap == 0){
        //maybe only one transaction
        gap = 1;
        categoryCount = 1;
    }
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
        records : finalRecords,
        baseCurrency : baseCurrency,
        refCurrency : refCurrency
    };
    return ret;
};

Stat.CallIOUInOut = function(txes){
    var ret = {};
    for(var i in txes){
        var tx = txes[i];

        switch (tx.type){
            case Transaction.Type.Receive:
                var iou = tx.amount.Currency() + tx.amount.Issuer();
                if(!ret[iou]) ret[iou] = {receive:0};
                ret[iou].receive += tx.amount.Value();
                break;
            case Transaction.Type.Send:
                var iou = tx.cost.Currency() + tx.cost.Issuer();
                if(!ret[iou]) ret[iou] = {send:0};
                ret[iou].send += tx.cost.Value();
                break;
        }
    }
    return ret;
}

if(typeof exports !== "undefined"){
    exports.Stat = Stat;
}