function RippleTable(element){
    this._root = element;
    var table = $(this._root).find("table");
    $(table).footable({
        limitNavigation : 6
    });
    this._table = $(table).data("footable");
}

RippleTable.prototype = {
    Clear : function(){
        var self = this;
        var rows = $(self._root).find("table tbody tr");
        $.each(rows, function(i){
            self._table.removeRow(rows[i]);
        })
    },

    AddRow : function(row){
        var self = this;
        self._table.appendRow(row);
    },

    AddOffers : function(offers){
        var self = this;
        var offerRow = function(offer){
            var sell = Number(offer.sell.value);
            var buy = Number(offer.want.value);
            var rate = buy / sell;
            return "<tr><td>" + offer.sell.currency + "</td><td>" + Consts.GetGatewayNick(offer.sell.issuer) + " </td><td>" + sell.toFixed(2) + "</td><td>" + offer.want.currency + "</td><td>" + Consts.GetGatewayNick(offer.want.issuer) + " </td><td>" + buy.toFixed(2) + "</td><td>" + rate.toFixed(2) + "</td></tr>";
        };

        $.each(offers, function(i){
            var offer = offers[i];
            self.AddRow(offerRow(offer));
        });
    },

    AddTxes : function(Txes){
        var self = this;
        var txRow = function(tx){
            var date = Util.formatDate(Util.toTimestamp(tx.date), 'MM/dd/yyyy hh:mm:ss');
            var type;
            switch (tx.type){
                case Transaction.Type.Send:
                    type="Send";
                    break;
                case Transaction.Type.Trade:
                    type="Trade";
                    break;
                case Transaction.Type.Receive:
                    type="Receive";
                    break;
                default :
                    return null;
            };
            var content;
            switch (tx.type){
                case Transaction.Type.Send:
                    content=tx.cost.value.toFixed(2) + tx.cost.currency + " to " + tx.dest;
                    break;
                case Transaction.Type.Trade:
                    content = tx.cost.value.toFixed(2) + tx.cost.currency + " for " + tx.amount.value.toFixed(2) + tx.amount.currency + " rate :" + (tx.amount.value/tx.cost.value).toFixed(2);

                    break;
                case Transaction.Type.Receive:
                    content=tx.amount.value.toFixed(2) + tx.amount.currency + " from " + tx.host;
                    break;
                default :
                    return null;
            };
            return "<tr><td>" + date + "</td><td>" + type + " </td><td>" + content + "</td></tr>";
        };

        $.each(Txes, function(i){
            var tx = Txes[i];
            self.AddRow(txRow(tx));
        })
    },

    RemoveTopRow : function(){
        var self = this;
        var rows = $(self._root).find("table tbody tr");
        if(rows.length > 0){
            self._table.removeRow(rows[0]);
        }
    }
}