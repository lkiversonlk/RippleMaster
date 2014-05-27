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
    self.address = address;
    self.Nickname = ko.observable(nickname);
    self.addressType = 0;
    self.BalancePages = ko.observableArray();
    self.Offers = ko.observableArray();
};


AddressPage.prototype.updateBalances = function(balances){
    var self = this;
    for(var i = 0; i < self.BalancePages().length ; i++){
        var balancePage = self.BalancePages()[i];
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
            self.BalancePages.splice(i,1);
            i--;
        }
    };

    for(var j in balances){
        self.BalancePages.push(new BalancePage(balances[j]));
    }
};

AddressPage.prototype.Update = function(address){
    var self = this;
    self.updateBalances(address.balances);
};

function AccountPage(clientMaster){
    var self = this;
    self.clientMaster = clientMaster;
    self.AccountName = ko.observable("Loading");
    self.WatchAddresses = ko.observableArray();
    self.Gateways = ko.observableArray();

    self.RemoveGatewayNick = function(gatewayNick){
        self.Gateways.remove(gatewayNick);
    };

    self.RemoveWatchAddress = function(watchAddress){
        self.WatchAddresses.remove(watchAddress);
    };

    self.GetAllAddressInfo = function(){
        for(var i in self.WatchAddresses()){
            var addressPage = self.WatchAddresses()[i];
            self.GetAddressInfo(addressPage);
        }
    };

    self.GetAddressInfo = function(addressPage){
        self.clientMaster.AddrInfo(addressPage.address, function(result, addressModel){
            addressPage.updateBalances(addressModel.balances);
        });
    };
}

