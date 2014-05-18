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
        var div = $('<div class="pricingtable">' +
            this.assembleTop(line) + '</div>');
        $(this._root).append(div);
        var origin = $(this._root).width();
        $(this._root).width(origin + 170);
    },

    Clear : function(){
        $(this._root).empty();
    },

    assembleTop : function(line){
        var currency = line.Currency();
        var issuer = line.Issuer();
        var balance = new Number(line.Money());

        return '<div class="pricingtable-top"><div class="currency">' + currency + '</div>' + this.assembleIssuer(issuer) + "<hr>" + this.assembleBalance(balance) + "</div>";
    },

    assembleIssuer : function(issuer){
        var gateway = Consts.GetGatewayNick(issuer);
        return '<p>' + gateway + '</p>';
    },

    assembleBalance : function(balance){
        return '<div class="balance">' + balance.toFixed(2) + '</div>'
    }
};