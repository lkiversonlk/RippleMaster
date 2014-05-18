function BalancePanel(element){
    this._root = element;
};

BalancePanel.prototype = {
    AddBalances : function(balances){
        var self = this;
        $.each(balances, function(i){
            self.AddBalance(balances[i]);
        });
    },

    AddXRP : function(xrp){
        var line = new Balance(xrp);
        var div = $('<div class="pricingtable">' +
            this.assembleTop(line) + '</div>');
        $(this._root).append(div);
    },

    AddBalance : function(line){
        var self = this;
        var div = $("<div />", {
            class : "pricingtable col-md-2"
        });
        div.append(self.assembleTop(line));
        var inner = $("<div />", {
            class : "pure-white-background"
        });
        inner.append(self.assembleIssuer(line));
        inner.append("<hr />");
        inner.append(self.assembleBalance(line));
        div.append(inner);
        $(self._root).append(div);
    },

    Clear : function(){
        $(this._root).empty();
    },

    assembleTop : function(line){
        return '<div class="pricingtable-top"><div class="currency">' + line.Currency() + '</div></div>';
    },

    assembleIssuer : function(line){
        var gateway = Consts.GetGatewayNick(line.Issuer());
        return '<div class="pure-white-background"><p>' + gateway + '</p></div>';
    },

    assembleBalance : function(line){
        return '<div class="balance pure-white-background">' + line.Money().toFixed(2) + '</div>'
    }
};