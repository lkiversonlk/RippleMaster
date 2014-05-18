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
            var sell = Number(offer._sell.Money());
            var buy = Number(offer._want.Money());
            var rate = buy / sell;
            return "<tr><td>" + offer._sell.Currency() + "</td><td>" + Consts.GetGatewayNick(offer._sell.Issuer()) + " </td><td>" + sell.toFixed(2) + "</td><td>" + offer._want.Currency() + "</td><td>" + Consts.GetGatewayNick(offer._want.Issuer()) + " </td><td>" + buy.toFixed(2) + "</td><td>" + rate.toFixed(2) + "</td></tr>";
        };

        $.each(offers, function(i){
            var offer = offers[i];
            self.AddRow(offerRow(offer));
        });
    },

    AddTxes : function(Txes){
        var self = this;
        var txRow = function(tx){
            var date = Consts.FormatDate(tx.Date());
            var type;
            switch (tx.Type()){
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
            switch (tx.Type()){
                case Transaction.Type.Send:
                    content=tx.Cost().Money().toFixed(2) + tx.Cost().Currency() + " to " + Consts.GetGatewayNick(tx.Dest());
                    break;
                case Transaction.Type.Trade:
                    content = tx.Cost().Money().toFixed(2) + tx.Cost().Currency() + " for " + tx.Amount().Money().toFixed(2) + tx.Amount().Currency() + " rate :" + (tx.Amount().Money()/tx.Cost().Money()).toFixed(2);

                    break;
                case Transaction.Type.Receive:
                    content=tx.Amount().Money().toFixed(2) + tx.Amount().Currency() + " from " + Consts.GetGatewayNick(tx.Host());
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
    }
}