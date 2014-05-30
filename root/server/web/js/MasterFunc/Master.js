function Master(root, accMgr){
    var self = this;
    self.accMgr = accMgr;
    self.logger = new Log();
    self.addressSelect = $(root).find("select.baseaddress")[0];
    self.SelectPageModel = {
        selectedAddress : ko.observable(),
        Addresses : self.accMgr.accInfo.WatchAddresses
    };
    self.IOUSelectModel = {
        selectedIOU : ko.observable(),
        BalancePages : ko.observableArray()
    };

    ko.applyBindings(self.SelectPageModel, self.addressSelect);

    self.progressBar = new ProgressBar($(root).find("div.progress"), null);

    self.baseSelect = $(root).find("div.baseiouSelect");

    self.costsList = $(root).find("div.cost-list")[0];

    ko.applyBindings(self.IOUSelectModel, $(self.baseSelect).find("select.baseIOU")[0]);

    $(self.baseSelect).hide();
    self.digButton = $(root).find("button.startMaster");
    $(self.digButton).click(function(){
        $(self.digButton).hide();
        self.UpdateBaseIOUSelect();
        self.progressBar.SetProgress(0, "Trying to load your previous calculate result");
        self.progressBar.SetProgress(20);

        self.accMgr.LoadMasterCost(self.SelectPageModel.selectedAddress(), function(result, costs){
            if(result != Common.RESULT.SUCC || !costs || costs.length == 0){
                self.ClearCostList();
                self.progressBar.SetProgress(100, "Please run RP Master on your address");
                $(self.baseSelect).toggle(1000);
                $(self.baseSelect).find("button.RPMaster").unbind();
                $(self.baseSelect).find("button.RPMaster").one('click', function(){
                    $(self.baseSelect).toggle(1000);
                    self.StartMaster(self.SelectPageModel.selectedAddress(), self.IOUSelectModel.selectedIOU());
                });
                $(self.baseSelect).find("button.Cancel").unbind();
                $(self.baseSelect).find("button.Cancel").one('click', function(){
                    $(self.baseSelect).toggle(1000);
                    $(self.digButton).show();
                });
            }else{
                $(self.digButton).show();
                self.progressBar.SetProgress(100, "Master cost loaded");
                self.ListMasterCost(costs);
            }
        });
    });
    self.root = $(root).find("div.rpMaster-panel");
    $(self.root).hide();
};

Master.prototype.UpdateBaseIOUSelect = function(){
    var self = this;
    var address = self.SelectPageModel.selectedAddress();
    self.IOUSelectModel.BalancePages.removeAll();
    for(var i in self.accMgr.accInfo.WatchAddresses()){
        var addressPage = self.accMgr.accInfo.WatchAddresses()[i];
        if(addressPage.address === address){
            for(var i in addressPage.BalancePages()){
                self.IOUSelectModel.BalancePages.push(addressPage.BalancePages()[i]);
            }
        }
    }
};

Master.prototype.StartMaster = function(address, baseiou){
    var self = this;
    self.progressBar.SetProgress(0, "Loading Transactions");
    self.accMgr.GetTransaction(address, -1, -1, function(result, more, txes){
        if(result === Common.RESULT.SUCC){
            if(more){
                self.progressBar.SetProgress(100 * (1 - self.progressBar.Left() * 0.8), null);
            }else{
                if(!txes || txes.length == 0){
                    self.progressBar.SetProgress(80, "Fail to load transactions or no transactions in this address");
                }else{
                    self.progressBar.SetProgress(0, "Loading your account starting balance");
                    var monthTxMgr = new MonthTxMgr(txes);
                    var startLedger = txes[0].ledger - 1;
                    var startTime = txes[0].date;
                    self.accMgr.GetRpBalanceInLedger(address, startLedger, function(result, addrBal){
                        if(result === Common.RESULT.SUCC){
                            self.progressBar.SetProgress(100, "Loaded your account starting balance");
                            self.Analyze(address, baseiou, addrBal, startTime, monthTxMgr);
                        }else{
                            self.progressBar.SetProgress(80, "Fail to load your account starting balance");
                        }
                    });
                }

            }
        }
    });
};

Master.prototype.Analyze = function(address, baseiou, startBalance, startDate, txManager){
    var self = this;
    var balanceRoot = $(self.root).find("div.balance-stat");
    ko.cleanNode(balanceRoot[0]);
    $(balanceRoot).empty();
    ko.applyBindings(startBalance, balanceRoot[0]);
    $(self.root).toggle(1000);
    self.timeP = $(self.root).find("p.time");
    $(self.timeP).text("Your account balance at time " + Util.formatDate(Util.toTimestamp(startDate), 'MM/dd/yyyy hh:mm:ss'))
    var dataSegRoot = $(self.root).find("div.data-seg");
    $(dataSegRoot).hide();
    self.subAnalyze(dataSegRoot, address, baseiou, startBalance, startDate, txManager, true);
};

Master.prototype.subAnalyze = function(root, address, baseiou, startBalance, startTime, txManager, needEstimation){
    var self = this;
    if(needEstimation){
        function preProcess(addrBalancePage, baseiou){
            var baseCurrency = baseiou.substr(0,3);
            var baseIssuer = baseiou.substr(3);
            var balancePage = addrBalancePage.BalancePages()[0];
            if(!balancePage.mastercostcurrency() || (balancePage.mastercostcurrency() !== baseCurrency) || (balancePage.mastercostissuer() !== baseIssuer)){
                for(var i = 0; i < addrBalancePage.BalancePages().length; i++){
                    var balancePage = addrBalancePage.BalancePages()[i];
                    balancePage.mastercostcurrency(baseCurrency);
                    balancePage.mastercostissuer(baseIssuer);
                    if(balancePage.currency !== baseCurrency || balancePage.issuer() !== baseIssuer){
                        balancePage.mastercostvalue(null);
                    }else{
                        balancePage.mastercostvalue(1);
                    }
                }
            }
        };

        function checkEstimation(addrBalancePage){
            for(var i = 0; i < addrBalancePage.BalancePages().length; i++){
                var balancePage = addrBalancePage.BalancePages()[i];
                if(!balancePage.mastercostvalue()){
                    alert("please estimate the cost for " + balancePage.currency + " " + balancePage.Issuer());
                    return false;
                }
            }
            return true;
        };

        preProcess(startBalance, baseiou);
        var estimationDiv = $("<div />", {
            class : "row white-background",
            "data-bind" : "template: {name:'cost-estimate-template', data:$root}",
            'style' : "border-radius:10px"
        });

        self.root.append(estimationDiv);

        ko.applyBindings(startBalance, estimationDiv[0]);
        $(estimationDiv).find("button").click(function(){
            if(checkEstimation(startBalance)){
                $(estimationDiv).toggle(1000);
                ko.cleanNode(estimationDiv[0]);
                setTimeout(function(){
                    $(estimationDiv).remove();
                },1200);
                self.subAnalyze(root, address, baseiou, startBalance, startTime, txManager, false);
            }
        });
        return;
    }

    var txes = txManager.Next();
    if(txes === null){
        $(self.digButton).show();
        $(self.root).hide();
        self.progressBar.SetProgress(50, "RP Master finished, loading your result");
        self.accMgr.LoadMasterCost(address, function(result, cost){
            if(result === Common.RESULT.SUCC){
                self.ListMasterCost(cost);
                self.progressBar.SetProgress(100, "RP Master");
            }else{
                self.progressBar.SetProgress(70, "Fail to load result");
            }
        });
    }else{

        if(txes.length == 0){
            self.subAnalyze(root, address, baseiou, startBalance, startTime, txManager, false);
        }else{
            self.progressBar.SetProgress(100," next data");
            var maxLedger = txes[txes.length -1].ledger;
            var rTime = txes[txes.length -1].date;
            $(self.timeP).text("Your account balance at time " + Util.formatDate(Util.toTimestamp(startTime), 'MM/dd/yyyy hh:mm:ss'))
            self.accMgr.GetRpBalanceInLedger(address, maxLedger, function(result, rBalPage){
                if(result === Common.RESULT.SUCC){
                    var title = "Your transactions betweeen " + Util.formatDate(Util.toTimestamp(startTime), 'MM/dd/yyyy hh:mm:ss') + " and " + Util.formatDate(Util.toTimestamp(rTime), 'MM/dd/yyyy hh:mm:ss');
                    var masterPage = new ColDataView(root, baseiou, title);
                    var data = self.analyzeInout(txes, baseiou)
                    masterPage.PaintSummary(data);
                    masterPage.PaintTxData(txes);
                    masterPage.ok = function(){
                        if(self.procceedNext(data)){
                            //add analyze
                            self.calculateCostChange(startBalance, baseiou, txes, data, masterPage);
                            function updateValue(bal1, bal2){
                                for(var i in bal1.BalancePages()){
                                    var bal1Page = bal1.BalancePages()[i];
                                    for(var j in bal2.BalancePages()){
                                        var bal2Page = bal2.BalancePages()[j];
                                        if(bal1Page.currency == bal2Page.currency && bal1Page.issuer() == bal2Page.issuer()){
                                            bal1Page.value(bal2Page.value());
                                        }
                                    }
                                }
                            };
                            updateValue(startBalance, rBalPage);
                            self.progressBar.SetProgress(10,"Finish one round, loading next round data");
                            self.SyncCostToServer(startBalance, maxLedger, rTime, baseiou);
                            $(root).toggle(1500);
                            setTimeout(masterPage.Clear.bind(masterPage), 1500);
                            self.subAnalyze(root, address, baseiou, startBalance, rTime, txManager, false);
                        }else{

                        }
                    }
                    $(root).toggle(1500);
                    setTimeout(function(){
                        masterPage.PaintBalancePageChange(startBalance, startTime, rBalPage, rTime);
                    }, 2000)
                }
            })
        }
    }
};

Master.prototype.procceedNext = function(data){
    for(var i in data.inouts()){
        if(!data.inouts()[i]._ratio) {
            var depose = Util.deposeIOU(data.inouts()[i].iou);
            var message = "Please estimate the price for " + Util.composeIOU(depose.currency, Consts.GetNick(depose.isser));
            alert(message);
            return false;
        }
    }
    return true;
};

Master.prototype.analyzeInout = function(txes, baseiou){
    var stat = Stat.CallIOUInOut(txes);
    var ret = new inoutModel(baseiou);
    for(var iou in stat){
        if(stat.hasOwnProperty(iou)){
            if(stat[iou].send){
                ret.inouts.push(new inoutData(Transaction.Type.Send, iou, stat[iou].send));
            }else if(stat[iou].receive){
                ret.inouts.push(new inoutData(Transaction.Type.Receive, iou, stat[iou].receive));
            }
        }
    };
    return ret;
};

//update the cost for each transaction
Master.prototype.calculateCostChange = function(startBalance, baseiou, txes, inout, masterPage){
    var baseDepose = Util.deposeIOU(baseiou);
    var iouBase = {};
    for(var i in startBalance.BalancePages()){
        var balancePage = startBalance.BalancePages()[i];
        var iouBaseItem = {
            iou : balancePage.currency + balancePage.issuer(),
            value : balancePage.value(),
            cost : balancePage.mastercostvalue()
        };
        iouBase[iouBaseItem.iou] = iouBaseItem;
    };

    for(var i in txes){
        var tx = txes[i];
        if(tx.type === Transaction.Type.Trade){
            var sellIOU = tx.cost.currency + tx.cost.issuer;
            var sellAmount = tx.cost.value;
            var buyIOU = tx.amount.currency + tx.amount.issuer;
            var buyAmount = tx.amount.value;
            //the sell only reduce cost, but the buy will change cost
            if(!iouBase[buyIOU]){
                iouBase[buyIOU] = {iou:buyIOU, value:0, cost: 0};
            }
            iouBase[sellIOU].value -= sellAmount;
            iouBase[buyIOU].cost = (iouBase[sellIOU].cost * sellAmount + iouBase[buyIOU].cost * iouBase[buyIOU].value)/(iouBase[buyIOU].value + buyAmount);
            this.logger.log(Log.DEBUG_LEVEL, " trade " + buyIOU + " cost to " + iouBase[buyIOU].cost);
            iouBase[buyIOU].value += buyAmount;
        }else{
            if(tx.type === Transaction.Type.Send){
                /*
                var sendIOU = tx.cost.currency + tx.cost.issuer;
                var sendAmount = tx.cost.value;
                var sendCost = null;
                for(var i in inout.inouts()){
                    if(inout.inouts()[i].iou === sendIOU && inout.inouts()[i].type === tx.type){
                        sendCost = inout.inouts()[i]._ratio;
                        break;
                    }
                }
                //iouBase[sendIOU].cost = (iouBase[sendIOU].cost * iouBase[sendIOU].value - sendCost * sendAmount) / (iouBase[sendIOU].value - sendAmount);
                //this.logger.log(Log.DEBUG_LEVEL, " send " + sendIOU + " cost to " + iouBase[sendIOU].cost);
                //iouBase[sendIOU].value -= sendAmount;
                */
            }else if(tx.type === Transaction.Type.Receive){
                var receiveIOU = tx.amount.currency + tx.amount.issuer;
                var receiveAmount = tx.amount.value;
                var receiveCost = null;
                for(var i in inout.inouts()){
                    if(inout.inouts()[i].iou === receiveIOU && inout.inouts()[i].type === tx.type){
                        receiveCost = inout.inouts()[i]._ratio;
                        break;
                    }
                }
                if(!iouBase[receiveIOU]){
                    iouBase[receiveIOU] = {iou:receiveIOU, value: receiveAmount, cost: receiveCost}
                }
                iouBase[receiveIOU].cost = (iouBase[receiveIOU].cost * iouBase[receiveIOU].value + receiveCost * receiveAmount) / (iouBase[receiveIOU].value + receiveAmount);
                this.logger.log(Log.DEBUG_LEVEL, " receive " + receiveIOU + " cost to " + iouBase[receiveIOU].cost);
                iouBase[receiveIOU].value += receiveAmount;
            }
        }
    };

    for(var iou in iouBase){
        if(iouBase.hasOwnProperty(iou)){
            var found = false;
            for(var i in startBalance.BalancePages()){
                var balancePage = startBalance.BalancePages()[i];
                var iouBal = balancePage.currency + balancePage.issuer();
                if(iou == iouBal){
                    found = true;
                    balancePage.mastercostvalue(iouBase[iou].cost);
                };
            };
            if(!found){
                var depose = Util.deposeIOU(iou);
                var balance = new Balance({currency:depose.currency, issuer:depose.issuer, value: 0});
                var balPage = new BalancePage(balance);
                balPage.mastercostcurrency(baseDepose.currency);
                balPage.mastercostissuer(baseDepose.issuer);
                balPage.mastercostvalue(iouBase[iou].cost);
                startBalance.BalancePages.push(balPage);
            }
        }
    }
};

Master.prototype.SyncCostToServer = function(addrBalance, ledger, time, baseiou){
    var self = this;
    var post = {};
    post['ledger'] = ledger;
    post['date'] = time;
    post['baseiou'] = baseiou;
    post['balances'] = [];
    for(var i in addrBalance.BalancePages()){
        var balancePage = addrBalance.BalancePages()[i];
        var balance = {currency : balancePage.currency, issuer : balancePage.issuer(), value : balancePage.value(), cost : balancePage.mastercostvalue()};
        post['balances'].push(balance);
    };
    self.accMgr.SyncMasterCost(addrBalance.address, post);
};

Master.prototype.ClearCostList = function(){
    var self = this;
    if(self.costsListData){
        self.costsListData.MasterCostPages.removeAll();
    }
};

Master.prototype.ListMasterCost = function(costs){
    var self = this;
    if(!self.costsListData){
        self.costsListData = new MasterCostListPage(costs);
        ko.applyBindings(self.costsListData, self.costsList);
    }else{
        self.costsListData.Update(costs);
    }
};

function inoutModel(baseiou){
    this.title = "In&Out Flow";
    this.inouts = ko.observableArray();
    this.baseiou = baseiou;
};

function inoutData(type, iou, amount){
    var self = this;
    self.type = type;
    self.iou = iou;
    self.amount = amount;
    self.typeText = ko.computed(function(){
        return self.type === Transaction.Type.Send ? "send":"receive";
    });
    self.ratio = ko.computed({
        read : function(){
            return self._ratio;
        },
        write : function(value){
            self._ratio = value;
        }
    });
    self.IOU = ko.computed(function(){
        var depose = Util.deposeIOU(self.iou);
        return Util.composeIOU(depose.currency, Consts.GetNick(depose.issuer));
    })
}

function MonthTxMgr(txes){
    var self = this;
    self.months = [];
    self.curYear = null;
    self.curMonth = null;
    self.index = 0;
    for(var i in txes){
        var tx = txes[i];
        var date = Util.toTimestamp(tx.date);
        var year = date.getYear();
        var month = date.getMonth();
        if(!self.curYear || year != self.curYear || month != self.curMonth){
            self.months.push([]);
            self.curYear = year;
            self.curMonth = month;
        }
        self.months[self.months.length - 1].push(tx);
    }

    self.Next = function(){
        if(self.index > (self.months.length - 1)){
            return null;
        }else{
            return self.months[self.index++];
        }
    }
};



