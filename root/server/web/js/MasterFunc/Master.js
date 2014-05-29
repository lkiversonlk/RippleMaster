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


    ko.applyBindings(self.IOUSelectModel, $(self.baseSelect).find("select.baseIOU")[0]);

    $(self.baseSelect).hide();
    $(root).find("button.startMaster").click(function(){
        self.UpdateBaseIOUSelect();
        self.progressBar.SetProgress(0, "Trying to load your previous calculate result");
        self.progressBar.SetProgress(20);

        self.accMgr.LoadMasterCost(self.SelectPageModel.selectedAddress(), function(result, costs){
            if(result != Common.RESULT.SUCC || !costs || costs.length == 0){
                self.progressBar.SetProgress(100, "Please run RP Master on your address");
                $(self.baseSelect).toggle(1000);
            }
        });

        /*
        self.StartMaster($(self.address).val(), $(self.currency).val());
        $(self.control).toggle();
        */
    });
    /*
    $(accMgr).on(AccMgr.EVENT.ACC_INFO, function(event, account){
        $(self.address).empty();
        var updateIOU = function(balances){
            $(self.currency).empty();
            $.each(balances, function(i){
                var balance = balances[i];
                var opt = $("<option />", {
                    value : balance.currency+balance.issuer,
                    text : balance.currency + " " + Consts.GetNick(balance.issuer)
                });
                $(self.currency).append(opt);
            });
            $(self.currency).selectpicker('refresh');
        };

        $(self.address).on('change', function(){
            var address = $(self.address).val();
            accMgr.GetRpBalance(address, function(addr){
                updateIOU(addr.balances);
            });

            accMgr.GetRpBalance(address);
        });

        $.each(account.rippleAddress, function(i){
            var address = account.rippleAddress[i];
            if(address.addressType == 0){
                var opt = $("<option />", {
                    value : address.address,
                    text : address.nickname
                });
                $(self.address).append(opt);
            }
        });
        $(self.address).selectpicker('refresh');
        accMgr.GetRpBalance($(self.address).val(), function(addr){
            updateIOU(addr.balances);
        })
    });

    */



    self.root = $(root).find("div.rpMaster-panel");
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
    var progressbar = new ProgressBar($("#loading"), "Start to load your transactions");

    progressbar.Show();
    var txManager = new TxManager();
    self.accMgr.ManualTxLoad(address, 80, function(result, more, txes){
        if(result === Common.RESULT.SUCC){
            if(more){
                txManager.AddTransactions(txes);

                //debug
                /*
                var startLedger = txes[txes.length - 1].ledger;
                var date = txes[txes.length -1].date;
                self.accMgr.GetRpBalanceInLedger(address, startLedger, function(result, addrBalance){
                    if(result === Common.RESULT.SUCC){
                        self.Analyze(address, baseiou, addrBalance, date, txManager);
                    }
                });
                setTimeout(progressbar.Close.bind(progressbar), 3000);
                return false;
                */

                progressbar.SetProgress(100 * (1 - progressbar.Left() * 0.7), "Loading transactions");
                return true;

            }else{
                function cleanTxInLedger(txes, ledger){
                    for(var i = txes.length - 1; i >= 0; i--){
                        if(txes[i].ledger === ledger){
                            txes.splice(i, 1);
                        }else{
                            return;
                        }
                    }
                }
                var startLedger = txes[txes.length - 1].ledger;
                var date = txes[txes.length -1].date;
                cleanTxInLedger(txes, startLedger);
                txManager.AddTransactions(txes);
                txManager.SetMonthGap(1);
                self.accMgr.GetRpBalanceInLedger(address, startLedger, function(result, addrBalance){
                    if(result === Common.RESULT.SUCC){
                        self.Analyze(address, baseiou, addrBalance, date, txManager);
                    }
                });
                progressbar.SetProgress(100, "finished @" + txManager.early);
                setTimeout(progressbar.Close.bind(progressbar), 3000);
            }
        }
    });
};

Master.prototype.Analyze = function(address, baseiou, startBalance, startDate, txManager){
    var self = this;
    var balanceRoot = $(self.root).find("div.balance-stat");
    var addressBalance = new AddressBalancePage(startBalance);
    self.timeLabel = $(balanceRoot).find("label.time");
    $(self.timeLabel).text("Your account balance at time " + Util.formatDate(Util.toTimestamp(startDate), 'MM/dd/yyyy hh:mm:ss'))
    var balancePanel = new BalancePanel(balanceRoot, addressBalance);
    var dataSegRoot = $(self.root).find("div.data-seg");
    $(dataSegRoot).toggle();
    self.subAnalyze(dataSegRoot, address, baseiou, addressBalance, startDate, txManager, true);
};

Master.prototype.subAnalyze = function(root, address, baseiou, startBalance, startTime, txManager, needEstimation){
    var self = this;
    if(needEstimation){
        function preProcess(addrBalancePage, baseiou){
            var baseCurrency = baseiou.substr(0,3);
            var baseIssuer = baseiou.substr(3);
            var balancePage = addrBalancePage.balancesPage()[0];
            if(!balancePage.mastercostcurrency() || (balancePage.mastercostcurrency() !== baseCurrency) || (balancePage.mastercostissuer() !== baseIssuer)){
                for(var i = 0; i < addrBalancePage.balancesPage().length; i++){
                    var balancePage = addrBalancePage.balancesPage  ()[i];
                    balancePage.mastercostcurrency(baseCurrency);
                    balancePage.mastercostissuer(baseIssuer);
                    if(balancePage.currency !== baseCurrency || balancePage.issuer !== baseIssuer){
                        balancePage.mastercostvalue(null);
                    }else{
                        balancePage.mastercostvalue(1);
                    }
                }
            }
        };
        function checkEstimation(addrBalancePage){
            for(var i = 0; i < addrBalancePage.balancesPage().length; i++){
                var balancePage = addrBalancePage.balancesPage()[i];
                if(!balancePage.mastercostvalue()){
                    alert("please estimate the cost for " + balancePage.currency + " " + Consts.GetNick(balancePage.issuer));
                    return false;
                }
            }
            return true;
        };
        preProcess(startBalance, baseiou);
        var estimationDiv = $("<div />", {
            class : "row white-background",
            "data-bind" : "template: {name:'cost-estimate-template', data:$root}",
            'style' : "border : 1px solid #000; border-radius:10px"
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
            }else{

            }
        });
        return;
    }

    var txes = txManager.Next();
    if(txes === null){
        //ok
        alert("finished!");
    }else{
        if(txes.length == 0){
            self.subAnalyze(root, address, baseiou, startBalance, startTime, txManager, false);
        }else{
            var maxLedger = txes[txes.length -1].ledger;
            var rTime = txes[txes.length -1].date;
            $(self.timeLabel).text("Your account balance at time " + Util.formatDate(Util.toTimestamp(startTime), 'MM/dd/yyyy hh:mm:ss'))
            self.accMgr.GetRpBalanceInLedger(address, maxLedger, function(result, addrBalance){
                if(result === Common.RESULT.SUCC){
                    var rBalPage = new AddressBalancePage(addrBalance);
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
                                for(var i in bal1.balancesPage()){
                                    var bal1Page = bal1.balancesPage()[i];
                                    for(var j in bal2.balancesPage()){
                                        var bal2Page = bal2.balancesPage()[j];
                                        if(bal1Page.currency == bal2Page.currency && bal1Page.issuer == bal2Page.issuer){
                                            bal1Page.value(bal2Page.value());
                                        }
                                    }
                                }
                            };
                            updateValue(startBalance, rBalPage);
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
    for(var i in startBalance.balancesPage()){
        var balancePage = startBalance.balancesPage()[i];
        var iouBaseItem = {
            iou : balancePage.currency + balancePage.issuer,
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
            for(var i in startBalance.balancesPage()){
                var balancePage = startBalance.balancesPage()[i];
                var iouBal = balancePage.currency + balancePage.issuer;
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
                startBalance.balancesPage.push(balPage);
            }
        }
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

