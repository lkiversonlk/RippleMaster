/* Initial BalancePage from a Balance */
function BalancePage(balance){
    var self = this;
    self.currency = balance.currency;
    self.issuer = balance.issuer;
    self.value = ko.observable(balance.value);
    self.mastercostvalue = ko.observable();
    self.mastercostcurrency = ko.observable();
    self.mastercostissuer = ko.observable();
    if(balance.mastercost){
        self.mastercostvalue(balance.mastercost.value);
        self.mastercostcurrency(balance.mastercost.currency);
        self.mastercostissuer(balance.mastercost.issuer);
    }
    self.Issuer = ko.computed(function(){
        return Consts.GetNick(self.issuer);
    });

    self.MasterCost = ko.computed(function(){
        if(self.mastercostvalue()){
            return self.mastercostvalue() + " " + self.mastercostcurrency() + " " + Consts.GetNick(self.mastercostissuer());
        }else{
            return "run RP Master to get cost";
        }
    });

    self.Ratio = ko.computed({
        read : function(){
            return self.mastercostvalue();
        },
        write : function(value){
            self.mastercostvalue(value);
        }
    })
};

/* Update BalancePage */
BalancePage.prototype.Update = function(balance){
    var self = this;
    self.currency = balance.currency;
    self.issuer = balance.issuer;
    self.value(balance.value);
    if(balance.mastercost){
        self.mastercostvalue(balance.mastercost.value);
        self.mastercostcurrency(balance.mastercost.currency);
        self.mastercostissuer(balance.mastercost.issuer);
    };
}

/* An address's data */
function AddressPage(address, nickname){
    var self = this;
    self.address = Address.address;
    self.nickname = ko.observable(nickname);
    self.addressType = 0;
    self.balancePages = ko.observableArray();
    self.offers = [];
};


AddressPage.prototype.updateBalances = function(balances){
    var self = this;
    for(var i = 0; i < self.balancePages().length ; i++){
        var balancePage = self.balancePages()[i];
        var id = Util.composeIOU(balancePage.currency, balancePage.issuer);
        var found = false;
        for(var j in balances){
            var balance = balances[j];
            var bid = Util.composeIOU(balance.currency,balance.issuer);
            if(id == bid){
                found = true;
                break;
            }
        }

        if(found){
            var balance = balances[j];
            balances.splice(j, 1);
            balancePage.Update(balance);
        }else{
            self.balancePages.splice(i,1);
            i--;
        }
    };

    for(var j in balances){
        self.balancePages.push(new BalancePage(balances[j]));
    }
};

AddressPage.prototype.Update = function(address){
    var self = this;
    self.updateBalances(address.balances);
};


