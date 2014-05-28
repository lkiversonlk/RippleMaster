/*
function RippleBox(address, options){
    var div = $("<div />", {
        class : "ripple-box col-md-12"
    });
    this.root = div;
    this.buttons = [];
    this.SetAddress(address);
    this.initialLayout(options);

    this.onAddressLoaded = function(){};
    this.onTxLoaded = function(){};
};
*/

/*
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

RippleBox.UpdateClose = function(root, callback){
    var a = $(root).find("a.closeBtn");
    $(a).unbind();
    $(a).click(callback);
}

RippleBox.prototype = {
    Init : function(){
        var self = this;
    },

    initialLayout : function(options){
        var self = this;
        var title = $("<div />", {
            class : "second-caption row",
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
                            $(button).addClass("closeBtn");
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
                class : "progress row"
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
        }

        var content = $("<div />", {
            class : "row"
        });
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


RippleBox.AddrBox = function(address){
    var option = {};
    option[RippleBox.Keys.title] = "Account Balances";
    //option[RippleBox.Keys.progressBar] = true;
    option[RippleBox.Keys.buttons] = [{
    }];
    var ret = new RippleBox(address, option);
    ret.balancePanel = new BalancePanel(ret.content);
    ret.refresh = function(){
        ret.progressBar.SetProgress(40, "Loading account balances");
        ret.balancePanel.Clear();
        ret.clientMaster.AccountInfoNoRefresh(ret.address, function(result, id){
            if(result === Common.RESULT.SUCC){
                ret.progressBar.SetProgress(100, "Account balances loaded");
                ret.balancePanel.AddBalance(id.XRP());
                ret.balancePanel.AddBalances(id.Balances());
            }else if(result === Common.RESULT.FAIL_NETWORKERROR) {
                ret.progressBar.SetProgress(100, "Fail, verify your network status");
            }else {
                ret.progressBar.SetProgress(100, "Fail to load account balances");
            }
        })
    };
    ret.onAddressLoaded = function(event, addrBal){
        if(addrBal.address == address){
            ret.balancePanel.Clear();
            ret.balancePanel.AddBalances(addrBal.balances);
        }
    };

    ret.initialCallback = ret.refresh;
    return ret;
};

RippleBox.TxBox = function(address){
    var option = {};
    option[RippleBox.Keys.title] = "Transactions History";
    //option[RippleBox.Keys.progressBar] = true;
    option[RippleBox.Keys.buttons] = [{
    }];
    var ret = new RippleBox(address, option);
    var tableHtml = '<table class="footable table" data-page-size="20"><thead><tr><th>Date</th><th>Type</th><th>Content</th></tr></thead><tbody></tbody><tfoot><tr style="text-align: center"><td colspan="5"><ul class="pagination"></div> </td> </tr></tfoot></table>';
    $(ret.content).html(tableHtml);
    ret.table = new RippleTable(ret.content);
    ret.refresh = function(){
        ret.progressBar.SetProgress(0, "");
        ret.progressBar.SetProgress(30, "Loading account transactions");
        ret.table.Clear();
        ret.clientMaster.ConsultTransactions(ret.address, function(result, isThereMore, addedTxes){
            if(result === Common.RESULT.SUCC){
                ret.table.AddTxes(addedTxes);
                if(isThereMore){
                    var left = ret.progressBar.Left();
                    ret.progressBar.SetProgress(100 * (1 - left * 0.8), null);
                    return true;
                }else{
                    ret.progressBar.SetProgress(100, "Account transactions loaded");
                    return false;
                }
            }else if(result === Common.RESULT.FAIL_NETWORKERROR) {
                ret.progressBar.SetProgress(100, "Fail, verify your network status");
            }else {
                ret.progressBar.SetProgress(100, "Fail to load transactions");
                return false;
            }
        });
    };
    return ret;
};

RippleBox.SellBuyBox = function(address){
    var option = {};
    option[RippleBox.Keys.title] = "Sell & Buy Stats";
    //option[RippleBox.Keys.progressBar] = true;
    option[RippleBox.Keys.buttons] = [
        {type : RippleBox.ButtonTypes.ok},
        {type : RippleBox.ButtonTypes.close}
    ];
    var ret = new RippleBox(address, option);
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
        var dataCollections = ret.clientMaster.QueryTransactions(ret.address, function(result, data){
            if(result === Common.RESULT.SUCC){
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
            }else if(result === Common.RESULT.FAIL_NETWORKERROR) {
                ret.progressBar.SetProgress(100, "Fail, verify your network status");
            }else if(result === Common.RESULT.FAIL_ACCOUNTNOTLOADED) {
                ret.progressBar.SetProgress(100, "Fail, please load the account's transactions");
            }else {
                ret.progressBar.SetProgress(100, "Fail to load transaction data");
            }
        });
    };
    ret.refresh = function(){
        ret.progressBar.SetProgress(40, "Loading account info");
        ret.clientMaster.AccountInfoNoRefresh(ret.address, function(result, id){
            var currencies = [id.XRP()].concat(id.Balances());
            if(result === Common.RESULT.SUCC){
                $(ret.sellBuyPanel.iouSelectors).empty();
                $.each(currencies, function(i){
                    var balance = currencies[i];
                    var opt = $("<option />", {
                        value : balance.currency+balance.Issuer(),
                        text : balance.currency + " " + Consts.GetGatewayNick(balance.Issuer())
                    });
                    $(ret.sellBuyPanel.iouSelectors).append(opt);
                });
                $(ret.sellBuyPanel.iouSelectors).selectpicker('refresh');
                ret.progressBar.SetProgress(100, "Succeed");
            }else if(result === Common.RESULT.FAIL_NETWORKERROR) {
                ret.progressBar.SetProgress(100, "Fail, verify your network status");
            }else if(result === Common.RESULT.FAIL_ACCOUNTNOTLOADED){
                ret.progressBar.SetProgress(100, "Fail, please reload the account's information");
            }else {
                ret.progressBar.SetProgress(50, "Fail to load account info");
            }
        });
    }
    $(ret.buttons[0]).click(ret.ok);
    return ret;
}

RippleBox.IOUFlowBox = function(address){
    var option = {};
    option[RippleBox.Keys.title] = "Value Flow Stats";
    //option[RippleBox.Keys.progressBar] = true;
    option[RippleBox.Keys.buttons] = [
        {type : RippleBox.ButtonTypes.ok},
        {type : RippleBox.ButtonTypes.close}
    ];
    var ret = new RippleBox(address, option);
    ret.ValueFlowPanel = new ValueFlowPanel(ret.content);
    ret.ok = function(){
        ret.progressBar.SetProgress(40, "Loading transaction data");
        var startTime = new Date($(ret.ValueFlowPanel.datepickers[0]).data('date'));
        var endTime = new Date($(ret.ValueFlowPanel.datepickers[1]).data('date'));
        if(startTime > endTime){
            ret.progressBar.SetProgress(100, "Verify the time range");
            return;
        }
        var iou = $(ret.ValueFlowPanel.iouSelector).val();
        var dataCollections = ret.clientMaster.QueryTransactions(ret.address, function(result, data){
            if(result === Common.RESULT.SUCC){
                var iouSummary = Stat.CalIOUSummary(startTime,
                    endTime,
                    iou,
                    data);
                if(iouSummary === null){
                    ret.progressBar.SetProgress(100, "No related transactions found");
                    return;
                }
                ret.ValueFlowPanel.PaintData(iouSummary);
                ret.progressBar.SetProgress(100, "Succeed");
            }else if(result === Common.RESULT.FAIL_NETWORKERROR) {
                ret.progressBar.SetProgress(100, "Fail, verify your network status");
            }else if(result === Common.RESULT.FAIL_ACCOUNTNOTLOADED) {
                ret.progressBar.SetProgress(100, "Fail, please load the account's transactions");
            }else {
                ret.progressBar.SetProgress(100, "Fail to load transaction data");
            }
        });
    };
    ret.refresh = function(){
        ret.progressBar.SetProgress(40, "Loading account info");
        ret.clientMaster.AccountInfoNoRefresh(ret.address, function(result, id){
            if(result === Common.RESULT.SUCC){
                var currencies = [id.XRP()].concat(id.Balances());
                $(ret.ValueFlowPanel.iouSelector).empty();
                $.each(currencies, function(i){
                    var balance = currencies[i];
                    var opt = $("<option />", {
                        value : balance.currency+balance.Issuer(),
                        text : balance.currency + " " + Consts.GetGatewayNick(balance.Issuer())
                    });
                    $(ret.ValueFlowPanel.iouSelector).append(opt);
                });
                $(ret.ValueFlowPanel.iouSelector).selectpicker('refresh');
                ret.progressBar.SetProgress(100, "Succeed");
            }else if(result === Common.RESULT.FAIL_NETWORKERROR) {
                ret.progressBar.SetProgress(100, "Fail, verify your network status");
            }else if(result === Common.RESULT.FAIL_ACCOUNTNOTLOADED){
                ret.progressBar.SetProgress(100, "Fail, please reload the account's information");
            }else {
                ret.progressBar.SetProgress(50, "Fail to load account info");
            }
        });
    }
    $(ret.buttons[0]).click(ret.ok);
    return ret;
}

*/
function AnalyzeBox(address, accMgr){
    var self = this;
    self.address = address;
    self.accMgr = accMgr;
    var div = $("<div />", {
        class : "ripple-box col-md-12"
    });
    self.root = div;
    var title = $("<div />", {
        class : "second-caption row",
        text : "Trade Analytic"
    });
    var fold = $("<a />", {
        class : "left"
    });
    fold.append($("<span />",{
        class : "glyphicon glyphicon-th-list"
    }))
    $(title).append(fold);
    var button = $("<a />", {
        class : "right"
    });
    $(button).append($("<span />", {
        class : "glyphicon glyphicon-ok"
    }));
    $(title).append(button);
    $(div).append(title);

    var progress = $("<div />", {
        class : "progress row"
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
    $(div).append(progress);
    self.progressBar = new ProgressBar(progress, "");

    var mainPanel = $("<div />", {
        class : "row"
    });
    $(div).append(mainPanel);

    $(fold).click(function(){
        $(content).toggle();
    });
    var sep = $("<div />", { class : "shadow"});
    $(mainPanel).append(self.ComposeConf());
    $(mainPanel).append(sep);
    var content = $("<div />");
    $(mainPanel).append(content);
    var graph = $("<div />", {
        class : "col-md-7"
    });
    var tx = $("<div />", {
        class : "col-md-5"
    });
    $(content).append(graph);
    var balDiv = $("<div />");
    graph.append(sep);
    graph.append(balDiv);
    self.balanceChangeBox = new BalanceChangeBox(balDiv);
    graph.append(sep);
    var sellBuyDiv = $("<div />");
    graph.append(sellBuyDiv);
    self.sellBuyBox = new SellBuyBox(sellBuyDiv);
    $(content).append(tx);
    self.ComposeTxHistoryBox(tx, address);
    self.ok = button;
    $(self.ok).click(function(){
        self.StartAnalyze();
    });
};

AnalyzeBox.prototype.ComposeConf = function(){
    var self = this;
    var dateSelectHtml = '<div class="form-group">' +
        '<div class="col-md-2">' +
        '<label class="form-control">Start Time</label>' +
        '</div>' +
        '<div class="col-md-4">' +
        '<div class="input-group date">' +
        '<input type="text" class="form-control"><span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></span>' +
        '</div>' +
        '</div>' +
        '<div class="col-md-2">' +
        '<label class="form-control">End Time</label>' +
        '</div>' +
        '<div class="col-md-4">' +
        '<div class="input-group date">' +
        '<input type="text" class="form-control"><span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></span>' +
        '</div>' +
        '</div>' +
        '</div>';

    var configureTableHtml = '<form class="form-horizontal" role="form">' +
        dateSelectHtml +
        '</form>';
    var div = $("<div />");
    $(div).html(configureTableHtml);
    self.datepickers = $(div).find(".date");
    $(self.datepickers).datetimepicker();
    return div;
};

AnalyzeBox.prototype.Initial = function(balances){
    var self = this;
    self.sellBuyBox.SetConfig(balances);
};

AnalyzeBox.prototype.GetSelectedTimeRange = function(){
    var self = this;
    var startTime = new Date($(self.datepickers[0]).data('date'));
    var endTime = new Date($(self.datepickers[1]).data('date'));
    if(startTime > endTime) return null;
    return [startTime, endTime];
};

AnalyzeBox.prototype.ComposeTxHistoryBox = function(root, address){
    var self = this;
    $(root).append($("<input />", {
        id : "table"+address,
        class : 'form-control',
        type : 'text'
    }));
    var table = $("<div />");
    $(root).append(table);
    var tableHtml = '<table class="footable table" data-page-size="20" data-filter='+"#table"+address +'><thead><tr><th>Date</th><th>Type</th><th>Content</th></tr></thead><tbody></tbody><tfoot><tr style="text-align: center"><td colspan="5"><ul class="pagination"></div> </td> </tr></tfoot></table>';
    $(table).html(tableHtml);
    self.table = table;
}

AnalyzeBox.prototype.StartAnalyze = function(){
    var self = this;
    self.progressBar.SetProgress(20, "Start to load transactions");
    if(!self.txTable) self.txTable = new RippleTable(self.table);
    self.txTable.Clear();
    var timeRange = self.GetSelectedTimeRange();
    if(timeRange == null){
        self.progressBar.SetProgress(50, "failed, verify your time range");
    }
    var finish = false;
    var findingLatest = true;
    var findingEarliest = true;
    self.accMgr.GetTransaction(self.address, timeRange[0], timeRange[1], function(result, txes){
        if(result === Common.RESULT.SUCC){
            self.txTable.AddTxes(txes);
            self.progressBar.SetProgress(100, "transactions loaded");
            self.txes = txes;
            self.sellBuyBox.SetData(self.txes);
            if(txes.length != 0) {
                var minLedger = self.txes[self.txes.length - 1].ledger;
                var bTime = Util.toTimestamp(self.txes[self.txes.length - 1].date);
                var maxLedger = self.txes[0].ledger;
                var lTime = Util.toTimestamp(self.txes[0].date);
                self.accMgr.GetRpBalanceInLedger(self.address, minLedger, function (result, addrBal) {
                    if (result === Common.RESULT.SUCC) {
                        var minBal = addrBal;
                        self.accMgr.GetRpBalanceInLedger(self.address, maxLedger, function (result, addrBal) {
                            if (result === Common.RESULT.SUCC) {
                                var maxBal = addrBal;
                                self.balanceChangeBox.PaintData(minBal, bTime, maxBal, lTime);
                            }
                        })
                    }
                });
            }
            else{
                self.balanceChangeBox.Clear();
            }
        }else{
            self.progressBar.SetProgress(50, "transactions load failure");
        }
    });
};

/*
AnalyzeBox.prototype.SellBuyAnalyze = function(){
    var self = this;
    var baseIOU = $(self.sellbuyIouSelectors[0]).val();
    var refIOU = $(self.sellbuyIouSelectors[1]).val();
    if(refIOU === baseIOU){
        return;
    }
    var chart = $(self.sellBuyChart).dxChart("instance");

    if(self.txes.length == 0){
        chart.option({
            dataSource : [],
            argumentAxis:{
                argumentType : 'numeric',
                max : data.highestRatio,
                min : data.lowestRatio
            }
        });
        return;
    }
    var data = Stat.CalIOUBuySell(baseIOU, refIOU, self.txes);

    chart.option({
        dataSource : data.records,
        argumentAxis:{
            argumentType : 'numeric',
            label : {
                visible : true,
                format : 'fixedPoint',
                precision : 3
            },
            max : data.highestRatio,
            min : data.lowestRatio
        }
    });
    var strongs = $(self.sellbuyConcluDiv).find("strong");
    $(strongs[0]).text((data.buyBase? data.buyBase.toFixed(3) : "0.000") + data.baseCurrency);
    $(strongs[1]).text((data.buyBase? data.buyRatio.toFixed(3) : "0.00") + data.refCurrency);
    $(strongs[2]).text((data.sellBase? data.sellBase.toFixed(3) : "0.000") + data.baseCurrency);
    $(strongs[3]).text((data.sellBase? data.sellRatio.toFixed(3) : "0.00") + data.refCurrency);

    var amount, benefits;
    if(data.sellBase && data.buyBase){
        amount = data.sellBase < data.buyBase ? data.sellBase : data.buyBase;
        benefits = (data.sellRatio - data.buyRatio) * amount;
    }else{
        amount = benefits = 0;
    }
    $(strongs[4]).text(benefits.toFixed(3) + data.refCurrency);
    $(strongs[5]).text(amount.toFixed(3) + data.baseCurrency);
}
*/

function BalanceChangeBox(root){
    this.root = root;
    var label = $("<label />", {
        class : "form-control text-center green-background"
    });
    $(label).text("Balance Change");
    $(this.root).append(label);
    var chart = $("<div />");
    this.chart = chart;
    $(this.root).append(chart);
    $(this.chart).dxChart({
        commonSeriesSettings :{
            argumentField : 'label',
            type : 'bar',
            label : {
                visible : true,
                format : 'fixedPoint',
                precision : 3
            }
        },
        legend : {
            verticalAlignment : "bottom",
            horizontalAlignment : "center"
        },
        palette : Consts.BLACKGREEN_PALETTE,
        rotated : true
    });
};

BalanceChangeBox.prototype.PaintData = function(balBefore, bTime, balLater, lTime){
    var self = this;
    var data = [];
    var process = {};
    for(i in balBefore.balances){
        var iou = balBefore.balances[i].currency + balBefore.balances[i].Issuer();
        if(!process[iou]) process[iou] = {}
        process[iou].label = iou;
        process[iou].before = balBefore.balances[i].value;
    };
    if(balLater){
        for(i in balLater.balances){
            var iou = balLater.balances[i].currency + balLater.balances[i].Issuer();
            if(!process[iou]) process[iou] = {}
            process[iou].label = iou;
            process[iou].after = balLater.balances[i].value;
        };
    }


    for(key in process){
        if(process.hasOwnProperty(key)){
            if(!process[key].before) process[key].before = 0;
            if(!process[key].after) process[key].after = 0;
            data.push(process[key]);
        }
    }

    $(self.chart).height(70 * data.length);
    var Chart = $(self.chart).dxChart("instance");
    Chart.option({
        dataSource : data,
        series : [
            {valueField : 'before', name : Util.formatDate(bTime,'MM/dd/yyyy hh:mm:ss')},
            {valueField : 'after', name : Util.formatDate(lTime, 'MM/dd/yyyy hh:mm:ss')}
        ]
    });
};

BalanceChangeBox.prototype.PaintPageData = function(balPageBefore, bTime, balPageLater, lTime){
    var self = this;
    var data = [];
    var process = {};
    for(i in balPageBefore.BalancePages()){
        var iou = balPageBefore.BalancePages()[i].currency + balPageBefore.BalancePages()[i].Issuer();
        if(!process[iou]) process[iou] = {}
        process[iou].label = iou;
        process[iou].before = balPageBefore.BalancePages()[i].value();
    };
    if(balPageLater){
        for(i in balPageLater.BalancePages()){
            var iou = balPageLater.BalancePages()[i].currency + balPageLater.BalancePages()[i].Issuer();
            if(!process[iou]) process[iou] = {}
            process[iou].label = iou;
            process[iou].after = balPageLater.BalancePages()[i].value();
        };
    }


    for(key in process){
        if(process.hasOwnProperty(key)){
            if(!process[key].before) process[key].before = 0;
            if(!process[key].after) process[key].after = 0;
            data.push(process[key]);
        }
    }

    $(self.chart).height(70 * data.length);
    var Chart = $(self.chart).dxChart("instance");
    Chart.option({
        dataSource : data,
        series : [
            {valueField : 'before', name : Util.formatDate(bTime,'MM/dd/yyyy hh:mm:ss')},
            {valueField : 'after', name : Util.formatDate(lTime, 'MM/dd/yyyy hh:mm:ss')}
        ]
    });
};

BalanceChangeBox.prototype.Clear = function(){
    var self = this;
    var Chart = $(self.chart).dxChart("instance");
    Chart.option({
        dataSource : []
    });
}

function InOutBox(root){
    var inoutFormHtml = '<form class="form-horizontal">' +
        '<fieldset>' +
        '<legend class="text-center">In Out Sheet</legend>' +
        '</fieldset>' +
        '<fieldset class="inout">' +
        '</fieldset>'
    '<div class="form-group">' +
    '<div class="col-md-offset-10 col-md-2">' +
    '<button type="submit" class="btn btn-default">Calculate</button>' +
    '</div>' +
    '</div>' +
    '</form>';
    this.root =root;
    $(this.root).html(inoutFormHtml);
}

function SellBuyBox(root){
    this.root = root;
    this.chart = $(this.root).find("div.chart");
    this.SelectModel = {
        iou1 : ko.observable(),
        iou2 : ko.observable(),
        BalancePages : ko.observableArray()
    };
    this.iouSelector = $(this.root).find("select.selectpicker");
    ko.applyBindings(this.SelectModel, this.iouSelector[0]);
    ko.applyBindings(this.SelectModel, this.iouSelector[1]);
    $(this.iouSelector).on('change', this.PaintData.bind(this));
    /*
    $(conclusion).html(
            '<div class="col-md-offset-1">'+
            '<p>You have bought <strong class="green-text"></strong> at an average price of <strong class="green-text"></strong></p>' +
            '<p>You have sold <strong class="green-text"></strong> at an average price of <strong class="green-text"></strong></p>' +
            '<p>You have get <strong class="green-text"></strong> in amount of <strong class="green-text"></strong>'+
            '</div>'
    );*/
    //this.sellbuyIouSelectors = $(root).find(".selectpicker");
    //$(this.sellbuyIouSelectors).on('change', this.PaintData.bind(this));

    $(this.chart).dxChart({
        commonSeriesSettings : {
            type : "bar",
            argumentField : "rate"
        },
        series:[
            {valueField : 'buy', name:'buy'},
            {valueField : 'sell', name:'sell'}
        ],
        valueAxis:{
            visible : true
        },
        legend:{
            verticalAlignment: 'bottom',
            horizontalAlignment: 'center',
            itemTextPosition: 'right',
            columnCount: 2
        },
        tooltip: {
            enabled : true,
            customizeText : function(point){
                return "Rate: " + point.argumentText + " Amount:" + point.value.toFixed(2);
            },
            font:{
                size : 14
            }
        },
        palette : Consts.BLACKGREEN_PALETTE
    });
};
SellBuyBox.prototype.SetData = function(data){
    this.txes = data;
    this.PaintData();
};
SellBuyBox.prototype.UpdateSelect = function(balancePages){
    var self = this;
    self.SelectModel.BalancePages.removeAll();
    for(var i in balancePages()){
        self.SelectModel.BalancePages.push(balancePages()[i]);
    }
};
SellBuyBox.prototype.PaintData = function(){
    var self = this;
    var chart = $(self.chart).dxChart("instance");
    var strongs = $(self.root).find("strong");

    if(!self.txes || self.txes.length == 0){
        chart.option({
            dataSource : []
        });
        $(strongs[0]).text("");
        $(strongs[1]).text("");
        $(strongs[2]).text("");
        $(strongs[3]).text("");
        $(strongs[4]).text("");
        $(strongs[5]).text("");
        return;
    }
    var baseIOU = self.SelectModel.iou1();
    var refIOU = self.SelectModel.iou2();
    if(baseIOU !== refIOU){
        var after = Stat.CalIOUBuySell(baseIOU, refIOU, self.txes);
        if(after == null){
            chart.option({
                dataSource : []
            });
        }else{
            chart.option({
                dataSource : after.records,
                argumentAxis:{
                    argumentType : 'numeric',
                    label : {
                        visible : true,
                        format : 'fixedPoint',
                        precision : 3
                    },
                    max : after.highestRatio,
                    min : after.lowestRatio
                }
            });
        }

        $(strongs[0]).text((after.buyBase? after.buyBase.toFixed(3) : "0.000") + after.baseCurrency);
        $(strongs[1]).text((after.buyBase? after.buyRatio.toFixed(3) : "0.00") + after.refCurrency);
        $(strongs[2]).text((after.sellBase? after.sellBase.toFixed(3) : "0.000") + after.baseCurrency);
        $(strongs[3]).text((after.sellBase? after.sellRatio.toFixed(3) : "0.00") + after.refCurrency);


        var amount, benefits;
        if(after.sellBase && after.buyBase){
            amount = after.sellBase < after.buyBase ? after.sellBase : after.buyBase;
            benefits = (after.sellRatio - after.buyRatio) * amount;
        }else{
            amount = benefits = 0;
        }
        $(strongs[4]).text(benefits.toFixed(3) + after.refCurrency);
        $(strongs[5]).text(amount.toFixed(3) + after.baseCurrency);
    }
}

function BalancePanel(root, data){
    var div = $("<div />", {
        class : "row",
        "data-bind" : "template: {name:'balance-template', data: $root}"
    });
    $(root).append(div);
    this.root = div;
    ko.applyBindings(data, this.root[0]);
}

function OfferPanel(){

};

OfferPanel.ShowTx = function(root, offers){
    $(root).empty();
    var tableHtml = '' +
        '<table class="footable table" data-page-size="10">' +
        '<thead>' +
        '<tr><th>Sell</th><th>Issuer</th><th>Amount</th><th>Want</th><th>Issuer</th><th>Amount</th><th>Rate</th></tr></thead>' +
        '<tbody>' +
        '</tbody>' +
        '</table>';
    $(root).html(tableHtml);
    var table = new RippleTable(root);
    table.AddOffers(offers);
};

