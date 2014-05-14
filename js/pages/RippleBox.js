function RippleBox(root, rippleMaster, address, options){
    var div = $("<div />", {
        class : "ripple-box"
    });
    $(root).append(div);
    this.root = div;
    this.rippleMaster = rippleMaster;
    this.buttons = [];
    this.SetAddress(address);
    this.initialLayout(options);
    this.startHooks = [];
    this.closeHooks = [];
};

RippleBox.Keys = {
    title : 'title',
    progressBar : 'progress',
    buttons : 'buttons'
};

RippleBox.ButtonTypes = {
    refresh : 'refresh',
    ok : 'ok',
    close : 'close'
};

RippleBox.prototype = {
    Init : function(){
        var self = this;
        $.each(self.startHooks, function(i){
            var hook = self.startHooks[i];
            if(typeof(hook) === 'function'){
                hook();
            }
        })
    },
    Close : function(){
        var self = this;
        $.each(self.closeHooks, function(i){
            var hook = self.closeHooks[i];
            if(typeof(hook) === 'function'){
                hook(self);
            }
        })
        $(self.root).remove();
    },

    initialLayout : function(options){
        var self = this;
        var title = $("<div />", {
            class : "second-caption",
            text : options[RippleBox.Keys.title]
        });

        var fold = $("<a />", {
            class : "left"
        });
        fold.append($("<span />",{
            class : "glyphicon glyphicon-th-list"
        }))
        $(title).append(fold);
        if(options[RippleBox.Keys.buttons]){
            $.each(options[RippleBox.Keys.buttons], function(i){
                var type = options[RippleBox.Keys.buttons][i].type;
                if(type){
                    var button = $("<a />", {
                        class : "right"
                    });
                    switch (type){
                        case RippleBox.ButtonTypes.refresh:
                            $(button).append($("<span />", {
                                class : "glyphicon glyphicon-refresh"
                            }));
                            break;
                        case RippleBox.ButtonTypes.ok:
                            $(button).append($("<span />", {
                                class : "glyphicon glyphicon-ok"
                            }));
                            break;
                        case RippleBox.ButtonTypes.close:
                            $(button).append($("<span />",{
                                class : "glyphicon glyphicon-remove"
                            }));
                            break;
                    }

                    $(title).append(button);
                    self.buttons.push(button);
                }
            });
        }
        $(self.root).append(title);

        if(options[RippleBox.Keys.progressBar]){
            var progress = $("<div />", {
                class : "progress"
            });
            var progressText = $("<span />", {
                class : 'text'
            });
            var progressBar = $("<div />", {
                class : 'progress-bar progress-bar-ripplemaster',
                role : 'progressbar',
                'aria-valuenow' : "0",
                'aria-valuemin' : "0",
                'aria-valuemax' : "100",
                'style' : "width: 0%"
            });
            $(progressBar).append(progressText);
            $(progress).append(progressBar);

            $(self.root).append(progress);

            self.progressBar = new ProgressBar(progress, "");
        }else{

        }

        var content = $("<div />");
        $(self.root).append(content);
        self.content = content;
        $(fold).click(function(){
            $(content).toggle();
        });
    },
    SetAddress : function(address){
        this.address = address;
    }
};

RippleBox.OfferBox = function(root, rippleMaster, address){
    var option = {};
    option[RippleBox.Keys.title] = "Current Offers";
    option[RippleBox.Keys.progressBar] = true;
    option[RippleBox.Keys.buttons] = [{
        type : RippleBox.ButtonTypes.refresh
    }];
    var ret = new RippleBox(root, rippleMaster, address, option);
    var tableHtml = '<table class="footable table" data-page-size="10"><thead><tr><th>Sell</th><th>Issuer</th><th>Amount</th><th>Want</th><th>Issuer</th><th>Amount</th><th>Rate</th></tr></thead><tbody></tbody></table>';
    $(ret.content).html(tableHtml);
    ret.table = new RippleTable(ret.content);
    ret.refresh = function(){
        ret.progressBar.SetProgress(30, "Loading account offers");
        ret.table.Clear();
        ret.rippleMaster.ConsultOffers(ret.address, function(result, offers) {
            if (result === Consts.RESULT.SUCCESS) {
                ret.progressBar.SetProgress(100, "Offers loaded");
                ret.table.AddOffers(offers);
            } else if(result === Consts.RESULT.FAIL_NETWORKERROR) {
                ret.progressBar.SetProgress(100, "Fail, verify your network status");
            } else {
                ret.progressBar.SetProgress(100, "Fail to load offers");
            }
        });
    };
    ret.initialCallback = ret.refresh;
    $(ret.buttons[0]).click(ret.refresh);
    ret.startHooks.push(ret.refresh);
    return ret;
};

RippleBox.AccountBox = function(root, rippleMaster, address){
    var option = {};
    option[RippleBox.Keys.title] = "Account Balances";
    option[RippleBox.Keys.progressBar] = true;
    option[RippleBox.Keys.buttons] = [{
        type : RippleBox.ButtonTypes.refresh
    }];
    var ret = new RippleBox(root, rippleMaster, address, option);
    ret.balancePanel = new BalancePanel(ret.content);
    $(ret.content).addClass("max-width");
    ret.refresh = function(){
        ret.progressBar.SetProgress(40, "Loading account balances");
        ret.balancePanel.Clear();
        ret.rippleMaster.AccountInfoNoRefresh(ret.address, function(result, id){
            if(result === Consts.RESULT.SUCCESS){
                ret.progressBar.SetProgress(100, "Account balances loaded");
                ret.balancePanel.AddBalance(id.XRP());
                ret.balancePanel.AddBalances(id.Balances());
            }else if(result === Consts.RESULT.FAIL_NETWORKERROR) {
                ret.progressBar.SetProgress(100, "Fail, verify your network status");
            }else {
                ret.progressBar.SetProgress(100, "Fail to load account balances");
            }
        })
    };
    ret.initialCallback = ret.refresh;
    $(ret.buttons[0]).click(ret.refresh);
    ret.startHooks.push(ret.refresh);
    return ret;
};

RippleBox.TxBox = function(root, rippleMaster, address){
    var option = {};
    option[RippleBox.Keys.title] = "Transactions History";
    option[RippleBox.Keys.progressBar] = true;
    option[RippleBox.Keys.buttons] = [{
    }];
    var ret = new RippleBox(root, rippleMaster, address, option);
    var tableHtml = '<table class="footable table" data-page-size="20"><thead><tr><th>Date</th><th>Type</th><th>Content</th></tr></thead><tbody></tbody><tfoot><tr style="text-align: center"><td colspan="5"><ul class="pagination"></div> </td> </tr></tfoot></table>';
    $(ret.content).html(tableHtml);
    ret.table = new RippleTable(ret.content);
    ret.refresh = function(){
        ret.progressBar.SetProgress(30, "Loading account transactions");
        ret.table.Clear();
        ret.rippleMaster.ConsultTransactions(ret.address, function(result, isThereMore, addedTxes){
            if(result === Consts.RESULT.SUCCESS){
                ret.table.AddTxes(addedTxes);
                if(isThereMore){
                    var left = ret.progressBar.Left();
                    ret.progressBar.SetProgress(100 * (1 - left * 0.8), null);
                    return true;
                }else{
                    ret.progressBar.SetProgress(100, "Account transactions loaded");
                    return false;
                }
            }else if(result === Consts.RESULT.FAIL_NETWORKERROR) {
                ret.progressBar.SetProgress(100, "Fail, verify your network status");
            }else {
                ret.progressBar.SetProgress(100, "Fail to load transactions");
                return false;
            }
        });
    };
    return ret;
};

RippleBox.SellBuyBox = function(root, rippleMaster, address){
    var option = {};
    option[RippleBox.Keys.title] = "Sell & Buy Stats";
    option[RippleBox.Keys.progressBar] = true;
    option[RippleBox.Keys.buttons] = [
        {type : RippleBox.ButtonTypes.ok},
        {type : RippleBox.ButtonTypes.close},
        {type : RippleBox.ButtonTypes.refresh}
    ];
    var ret = new RippleBox(root, rippleMaster, address, option);
    ret.sellBuyPanel = new SellBuyPanel(ret.content);
    ret.ok = function(){
        ret.progressBar.SetProgress(40, "Loading transaction data");
        var startTime = new Date($(ret.sellBuyPanel.datepickers[0]).data('date'));
        var endTime = new Date($(ret.sellBuyPanel.datepickers[1]).data('date'));
        if(startTime > endTime){
            ret.progressBar.SetProgress(100, "Verify the time range");
            return;
        }
        var baseIOU = $(ret.sellBuyPanel.iouSelectors[0]).val();
        var refIOU = $(ret.sellBuyPanel.iouSelectors[1]).val();
        if(refIOU === baseIOU){
            ret.progressBar.SetProgress(100, "Use different IOUs");
            return;
        }
        var dataCollections = ret.rippleMaster.QueryTransactions(ret.address, function(result, data){
            if(result === Consts.RESULT.SUCCESS){
                var sellBuy = Stat.CalIOUBuySell(startTime,
                    endTime,
                    baseIOU,
                    refIOU,
                    data);
                if(sellBuy === null){
                    ret.progressBar.SetProgress(100, "No related transactions found");
                    return;
                }
                ret.sellBuyPanel.PaintData(sellBuy);
                ret.progressBar.SetProgress(100, "Succeed");
            }else if(result === Consts.RESULT.FAIL_NETWORKERROR) {
                ret.progressBar.SetProgress(100, "Fail, verify your network status");
            }else if(result === Consts.RESULT.FAIL_ACCOUNTNOTLOADED) {
                ret.progressBar.SetProgress(100, "Fail, please load the account's transactions");
            }else {
                    ret.progressBar.SetProgress(100, "Fail to load transaction data");
            }
        });
    };
    ret.refresh = function(){
        ret.progressBar.SetProgress(40, "Loading account info");
        ret.rippleMaster.AccountInfoNoRefresh(ret.address, function(result, id){
            var currencies = [id.XRP()].concat(id.Balances());
            if(result === Consts.RESULT.SUCCESS){
                $(ret.sellBuyPanel.iouSelectors).empty();
                $.each(currencies, function(i){
                    var balance = currencies[i];
                    var opt = $("<option />", {
                        value : balance.Currency()+balance.Issuer(),
                        text : balance.Currency() + " " + Consts.GetGatewayNick(balance.Issuer())
                    });
                    $(ret.sellBuyPanel.iouSelectors).append(opt);
                });
                $(ret.sellBuyPanel.iouSelectors).selectpicker('refresh');
                ret.progressBar.SetProgress(100, "Succeed");
            }else if(result === Consts.RESULT.FAIL_NETWORKERROR) {
                ret.progressBar.SetProgress(100, "Fail, verify your network status");
            }else if(result === Consts.RESULT.FAIL_ACCOUNTNOTLOADED){
                ret.progressBar.SetProgress(100, "Fail, please reload the account's information");
            }else {
                ret.progressBar.SetProgress(50, "Fail to load account info");
            }
        });
    }
    $(ret.buttons[0]).click(ret.ok);
    $(ret.buttons[1]).click(ret.Close.bind(ret));
    $(ret.buttons[2]).click(ret.refresh.bind(ret));
    ret.startHooks.push(ret.refresh);
    return ret;
}

RippleBox.MoneyFlowBox = function(root, rippleMaster, address){
    var option = {};
    option[RippleBox.Keys.title] = "Money Flow Stats";
    option[RippleBox.Keys.progressBar] = true;
    option[RippleBox.Keys.buttons] = [
        {type : RippleBox.ButtonTypes.ok},
        {type : RippleBox.ButtonTypes.close},
        {type : RippleBox.ButtonTypes.refresh}
    ];
    var ret = new RippleBox(root, rippleMaster, address, option);
    ret.moneyFlowPanel = new MoneyFlowPanel(ret.content);
    ret.ok = function(){
        ret.progressBar.SetProgress(40, "Loading transaction data");
        var startTime = new Date($(ret.moneyFlowPanel.datepickers[0]).data('date'));
        var endTime = new Date($(ret.moneyFlowPanel.datepickers[1]).data('date'));
        if(startTime > endTime){
            ret.progressBar.SetProgress(100, "Verify the time range");
            return;
        }
        var iou = $(ret.moneyFlowPanel.iouSelector).val();
        var dataCollections = ret.rippleMaster.QueryTransactions(ret.address, function(result, data){
            if(result === Consts.RESULT.SUCCESS){
                var iouSummary = Stat.CalIOUSummary(startTime,
                    endTime,
                    iou,
                    data);
                if(iouSummary === null){
                    ret.progressBar.SetProgress(100, "No related transactions found");
                    return;
                }
                ret.moneyFlowPanel.PaintData(iouSummary);
                ret.progressBar.SetProgress(100, "Succeed");
            }else if(result === Consts.RESULT.FAIL_NETWORKERROR) {
                ret.progressBar.SetProgress(100, "Fail, verify your network status");
            }else if(result === Consts.RESULT.FAIL_ACCOUNTNOTLOADED) {
                ret.progressBar.SetProgress(100, "Fail, please load the account's transactions");
            }else {
                ret.progressBar.SetProgress(100, "Fail to load transaction data");
            }
        });
    };
    ret.refresh = function(){
        ret.progressBar.SetProgress(40, "Loading account info");
        ret.rippleMaster.AccountInfoNoRefresh(ret.address, function(result, id){
            if(result === Consts.RESULT.SUCCESS){
                var currencies = [id.XRP()].concat(id.Balances());
                $(ret.moneyFlowPanel.iouSelector).empty();
                $.each(currencies, function(i){
                    var balance = currencies[i];
                    var opt = $("<option />", {
                        value : balance.Currency()+balance.Issuer(),
                        text : balance.Currency() + " " + Consts.GetGatewayNick(balance.Issuer())
                    });
                    $(ret.moneyFlowPanel.iouSelector).append(opt);
                });
                $(ret.moneyFlowPanel.iouSelector).selectpicker('refresh');
                ret.progressBar.SetProgress(100, "Succeed");
            }else if(result === Consts.RESULT.FAIL_NETWORKERROR) {
                ret.progressBar.SetProgress(100, "Fail, verify your network status");
            }else if(result === Consts.RESULT.FAIL_ACCOUNTNOTLOADED){
                ret.progressBar.SetProgress(100, "Fail, please reload the account's information");
            }else {
                ret.progressBar.SetProgress(50, "Fail to load account info");
            }
        });
    }
    $(ret.buttons[0]).click(ret.ok);
    $(ret.buttons[1]).click(ret.Close.bind(ret));
    $(ret.buttons[2]).click(ret.refresh.bind(ret));
    ret.startHooks.push(ret.refresh);
    return ret;
}

