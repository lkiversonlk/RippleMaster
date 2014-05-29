/* Initial BalancePage from a Balance */
function BalancePage(balance){
    var self = this;
    self.currency = balance.currency;
    self.issuer = ko.observable(balance.issuer);
    self.value = ko.observable(balance.value);
    self.Value = ko.observable(self.value().toFixed(3));
    self.mastercostvalue = ko.observable();
    self.mastercostcurrency = ko.observable();
    self.mastercostissuer = ko.observable();
    if(balance.mastercost){
        self.mastercostvalue(balance.mastercost.value);
        self.mastercostcurrency(balance.mastercost.currency);
        self.mastercostissuer(balance.mastercost.issuer);
    }
    self.Issuer = ko.computed(function(){
        return Consts.GetNick(self.issuer());
    });

    self.IOU = ko.computed(function(){
        return self.currency + " " + self.Issuer();
    });

    self.iou = self.currency + self.issuer();
    self.MasterCost = ko.computed(function(){
        if(self.mastercostvalue()){
            return self.mastercostvalue().toFixed(3) + " " + self.mastercostcurrency() + " " + Consts.GetNick(self.mastercostissuer());
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
    self.issuer(balance.issuer);
    self.value(balance.value);
    if(balance.mastercost){
        self.mastercostvalue(balance.mastercost.value);
        self.mastercostcurrency(balance.mastercost.currency);
        self.mastercostissuer(balance.mastercost.issuer);
    };
}

function OfferPage(offer){
    var self = this;
    self.sellCurrency = offer.sell.currency;
    self.sellIssuer = offer.sell.issuer;
    self.sellAmount = offer.sell.value;
    self.SellIssuer = ko.computed(function(){
        return Consts.GetNick(self.sellIssuer);
    });
    self.buyCurrency = offer.want.currency;
    self.buyIssuer = offer.want.issuer;
    self.BuyIssuer = ko.computed(function(){
        return Consts.GetNick(self.buyIssuer);
    });
    self.buyAmount = offer.want.value;
    var ratio = self.buyAmount / self.sellAmount;
    self.price = ratio.toFixed(3) + self.buyCurrency + '/' + self.sellCurrency;
};

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

AddressPage.prototype.updateOffers = function(offers){
    var self = this;
    self.Offers.removeAll();
    for(var i in offers){
        self.Offers.push(new OfferPage(offers[i]));
    }
}

AddressPage.prototype.Update = function(address){
    var self = this;
    self.updateBalances(address.balances);
    self.updateOffers(address.offers);
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
            addressPage.Update(addressModel);
        });
    };

    self.GetAddressDigest = function(){
        var ret = [];
        for(var i in self.WatchAddresses()){
            var addressPage = self.WatchAddresses()[i];
            ret.push({address : addressPage.address, nickname : addressPage.Nickname(), addressType : 0});
        }
        for(var i in self.Gateways()){
            var addressPage = self.Gateways()[i];
            ret.push({address : addressPage.address, nickname : addressPage.Nickname(), addressType : 1});
        }
        return ret;
    }
}

