function TradePanel(root, accMgr){
    this.root = root;
    this.accMgr = accMgr;
    this.InitContent();
};

TradePanel.prototype.InitContent = function(){
    var self = this;
    var conf = $(self.root).find("#trade-conf");
    self.addressSelect = $(conf).find("select.selectpicker")[0];
    self.SelectPageModel = {
        selectedAddress : ko.observable(),
        Addresses : self.accMgr.accInfo.WatchAddresses
    };
    $(self.addressSelect).on('change', function(){
        if(self.tradeShow){
            $(self.tradePanel).toggle();
            self.tradeShow = false;
        }
    });
    ko.applyBindings(self.SelectPageModel, self.addressSelect);
    self.dateSelectors = $(self.root).find("input.time");
    $(self.dateSelectors).datetimepicker();
    self.progressBar = new ProgressBar($(self.root).find("div.progress"),'');
    self.balanceChangePanel = new BalanceChangeBox($(self.root).find("div.balance"));
    self.sellbuyPanel = new SellBuyBox($(self.root).find("div.sellbuy"));
    self.txPanel = new RippleTable($(self.root).find("div.tx"));
    if(self.SelectPageModel.Addresses().length > 0) {
        self.SelectPageModel.selectedAddress(self.SelectPageModel.Addresses()[i].address);
        self.UpdateSellbuyPanel();
    };
    self.tradePanel = $(self.root).find("div.trade-panel");
    $(self.tradePanel).toggle();
    self.tradeShow = false;
    $(self.root).find("a.ok").click(self.ShowMyTrade.bind(self));
};

TradePanel.prototype.UpdateSellbuyPanel = function(){
    var self = this;
    var address = self.SelectPageModel.selectedAddress();
    for(var i in self.accMgr.accInfo.WatchAddresses()){
        var addressPage = self.accMgr.accInfo.WatchAddresses()[i];
        if(addressPage.address === address){
            self.sellbuyPanel.UpdateSelect(addressPage.BalancePages);
            return;
        }
    }
}

TradePanel.prototype.ShowMyTrade = function(){
    var self = this;
    var address = self.SelectPageModel.selectedAddress();
    var start = Util.fromTimestamp(new Date($(self.dateSelectors[0]).data('date')));
    var end = Util.fromTimestamp(new Date($(self.dateSelectors[1]).data('date')));
    if(isNaN(start) || isNaN(end)){
        self.progressBar.SetProgress(90, "Please select time range");
        return;
    };

    self.UpdateSellbuyPanel();
    if(!self.tradeShow){
        $(self.tradePanel.toggle(1000));
        self.tradeShow = true;
    };
    self.progressBar.SetProgress(40, "Loading transactions");
    self.accMgr.GetTransaction(address, start, end, function(result, more, txes){
        if(result === Common.RESULT.SUCC){
            if(more){
                self.progressBar.SetProgress(100*(1 - self.progressBar.Left() * 0.7), null);
            }else{
                self.progressBar.SetProgress(100, "finished");
                self.sellbuyPanel.SetData(txes);
                self.txPanel.Clear();
                self.txPanel.AddTxes(txes);
                var startLedger = txes[0].ledger - 1;
                var startTime = Util.toTimestamp(txes[0].date);
                var endLedger = txes[txes.length - 1].ledger;
                var endTime = Util.toTimestamp(txes[txes.length - 1].date);
                self.accMgr.GetRpBalanceInLedger(address, startLedger, function(result, startBalPage){
                    if(result === Common.RESULT.SUCC){
                        self.accMgr.GetRpBalanceInLedger(address, endLedger, function(result, endBalPage){
                            if(result === Common.RESULT.SUCC){
                                self.balanceChangePanel.PaintPageData(startBalPage, startTime, endBalPage, endTime);
                            }else{
                                self.progressBar.SetProgress(90, "fail to load account status");
                            }
                        })
                    }else{
                        self.progressBar.SetProgress(90, "fail to load account status");
                    }
                })
            }
        }else{
            self.progressBar.SetProgress(50, "fail to load transactions");
        }
    });
};