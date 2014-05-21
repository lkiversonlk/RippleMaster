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
        ret.clientMaster.AccountInfoNoRefresh(ret.address, function(result, id){
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
    return ret;
}

RippleBox.IOUFlowBox = function(address){
    var option = {};
    option[RippleBox.Keys.title] = "Money Flow Stats";
    //option[RippleBox.Keys.progressBar] = true;
    option[RippleBox.Keys.buttons] = [
        {type : RippleBox.ButtonTypes.ok},
        {type : RippleBox.ButtonTypes.close}
    ];
    var ret = new RippleBox(address, option);
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
        var dataCollections = ret.clientMaster.QueryTransactions(ret.address, function(result, data){
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
        ret.clientMaster.AccountInfoNoRefresh(ret.address, function(result, id){
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
    return ret;
}

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
    '</div>'

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

    var configureTableHtml = '<form class="form-horizontal" role="form">' +
        dateSelectHtml +
        '<div class="form-group">' +
        '<div class="col-md-2">' +
        '<label class="form-control">Base Currency</label>' +
        '</div>' +
        '<div class="col-md-10">' +
        '<select class="selectpicker" data-width="auto"></select>' +
        '</div>' +
        '</form>';

    var config = $("<div />", {
    });
    $(config).html(configureTableHtml);
    self.datepickers = $(config).find(".date");
    self.iouSelector = $(config).find(".selectpicker");
    $(self.iouSelector).selectpicker();
    $(self.datepickers).datetimepicker();
    var content = $("<div />");
    $(mainPanel).append(config);
    $(mainPanel).append($("<div />", {class : "shadow"}));
    $(mainPanel).append(content);
    var graph = $("<div />", {
        class : "col-md-7"
    });
    var tx = $("<div />", {
        class : "col-md-5"
    });
    $(content).append(graph);
    self.graph = graph;
    var balDiv = $("<div />");
    var label = $("<label />", {
        class : "form-control text-center green-background"
    });
    $(label).text("Balance Comparison");
    $(balDiv).append(label);
    var balChartDiv = $("<div />", {
        class : "balance chart"
    });
    $(balDiv).append(balChartDiv);
    var sep = $("<div />", {
        class : "shadow"
    });
    self.graph.append(sep);
    self.graph.append(balDiv);
    self.graph.append(sep);
    self.balanceDiv = balChartDiv;
    $(self.balanceDiv).dxChart({
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
        palette : Consts.BLACKGREE_PALETTE,
        rotated : true
    });

    var inoutDiv = $("<div />");
    $(inoutDiv).html(self.ComposeInoutForm());
    self.inoutFormDiv = inoutDiv;
    //$(self.graph).append(inoutDiv);

    $(self.graph).append(self.ComposeSellBuyBox());
    $(content).append(tx);
    $(tx).append($("<input />", {
        id : "table"+address,
        class : 'form-control',
        type : 'text'
    }));
    var table = $("<div />");
    $(tx).append(table);
    var tableHtml = '<table class="footable table" data-page-size="10" data-filter='+"#table"+address +'><thead><tr><th>Date</th><th>Type</th><th>Content</th></tr></thead><tbody></tbody><tfoot><tr style="text-align: center"><td colspan="5"><ul class="pagination"></div> </td> </tr></tfoot></table>';
    $(table).html(tableHtml);
    self.table = table;
    //self.txTable = new RippleTable(table);
    self.ok = button;
    $(self.ok).click(function(){
        self.StartAnalyze();
    });
};

AnalyzeBox.prototype.Initial = function(balances){
    var self = this;
    $(self.iouSelector).empty();
    $.each(balances, function(i){
        var balance = balances[i];
        var opt = $("<option />", {
            value : balance.Currency()+balance.Issuer(),
            text : balance.Currency() + " " + Consts.GetGatewayNick(balance.Issuer())
        });
        $(self.iouSelector).append(opt);
    });
    $(self.iouSelector).selectpicker('refresh');

    $(self.sellbuyIouSelectors).empty();
    $.each(balances, function(i){
        var balance = balances[i];
        var opt = $("<option />", {
            value : balance.Currency()+balance.Issuer(),
            text : balance.Currency() + " " + Consts.GetGatewayNick(balance.Issuer())
        });
        $(self.sellbuyIouSelectors).append(opt);
    });
    $(self.sellbuyIouSelectors).selectpicker('refresh');
};

AnalyzeBox.prototype.GetSelectedTimeRange = function(){
    var self = this;
    var startTime = new Date($(self.datepickers[0]).data('date'));
    var endTime = new Date($(self.datepickers[1]).data('date'));
    if(startTime > endTime) return null;
    return [startTime, endTime];
};


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
        if(result === Consts.RESULT.SUCCESS){
            self.txTable.AddTxes(txes);
            self.progressBar.SetProgress(100, "transactions loaded");
            self.txes = txes;

            if(txes.length != 0) {
                var minLedger = self.txes[self.txes.length - 1].ledger;
                var bTime = Util.toTimestamp(self.txes[self.txes.length - 1].date);
                var maxLedger = self.txes[0].ledger;
                var lTime = Util.toTimestamp(self.txes[0].date);
                self.accMgr.GetRpBalanceInLedger(self.address, minLedger, function (result, addrBal) {
                    if (result === Consts.RESULT.SUCCESS) {
                        var minBal = addrBal;
                        self.accMgr.GetRpBalanceInLedger(self.address, maxLedger, function (result, addrBal) {
                            if (result === Consts.RESULT.SUCCESS) {
                                var maxBal = addrBal;
                                self.AddBalanceBox(minBal, bTime, maxBal, lTime);
                            }
                        })
                    }
                });
                var inout = Stat.CalSummary(self.txes);
                self.PaintInoutForm(inout);
            }
            else{
                self.AddBalanceBox(null, null, null, null);
            }
        }else{
            self.progressBar.SetProgress(50, "transactions load failure");
        }
    });
};

AnalyzeBox.prototype.AddBalanceBox = function(balBefore, bTime, balLater, lTime){
    var self = this;
    var Chart = $(self.balanceDiv).dxChart("instance");
    if(balBefore == null){
        Chart.option({
            dataSource : []
        });
        return;
    }
    var data = [];
    var process = {};
    for(i in balBefore.balances){
        var iou = balBefore.balances[i].Currency() + balBefore.balances[i].Issuer();
        if(!process[iou]) process[iou] = {}
        process[iou].label = iou;
        process[iou].before = balBefore.balances[i].Money();
    };
    for(i in balLater.balances){
        var iou = balLater.balances[i].Currency() + balLater.balances[i].Issuer();
        if(!process[iou]) process[iou] = {}
        process[iou].label = iou;
        process[iou].after = balLater.balances[i].Money();
    };

    for(key in process){
        if(process.hasOwnProperty(key)){
            if(!process[key].before) process[key].before = 0;
            if(!process[key].after) process[key].after = 0;
            data.push(process[key]);
        }
    }

    $(self.balanceDiv).height(80 * data.length);
    //prepare balance div
    Chart.option({
        dataSource : data,
        series : [
            {valueField : 'before', name : bTime.format('MM/dd/yyyy hh:mm:ss')},
            {valueField : 'after', name : lTime.format('MM/dd/yyyy hh:mm:ss')}
        ]
    });
};

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
                    '</form>'

AnalyzeBox.prototype.ComposeInoutForm = function(){
    return inoutFormHtml;
};

AnalyzeBox.prototype.PaintInoutForm = function(data){
    var self = this;
    var form = $(self.inoutFormDiv).find("form");
    $($(form).find("fieldset.inout")).empty();
    function compose(data){

    };

    for(var i in data){
        var insert = $("<div />",{
            class : "form-group"
        });

    }
};

AnalyzeBox.prototype.ComposeSellBuyBox = function(){
    var self = this;
    var sellBuyDiv = $("<div />");
    var sellBuyConfHtml = '<form class="form-horizontal" role="form">' +
        '<label class="form-control text-center green-background">Sell&Buy Stat</label>' +
        '<div class="form-group">' +
        '<div class="col-md-2">' +
        '<label class="form-control">Currency</label>' +
        '</div>' +
        '<div class="col-md-8">' +
        '<select class="selectpicker" data-width="auto"></select>' +
        '</div>' +
        '</div>' +
        '<div class="form-group">' +
        '<div class="col-md-2">' +
        '<label class="form-control">Currency</label>' +
        '</div>' +
        '<div class="col-md-8">' +
        '<select class="selectpicker" data-width="auto"></select>' +
        '</div>' +
        '<div class="col-md-2">' +
        '<button type="button" class="btn btn-primary form-control">OK</button>' +
        '</div>' +
        '</div>' +
        '</form>';
    $(sellBuyDiv).html(sellBuyConfHtml);
    self.sellBuyChart = $("<div />", {
        class : "sellbuy chart"
    });
    $(sellBuyDiv).append(self.sellBuyChart);
    self.sellbuyConcluDiv = $("<div />",{
        class : "row"
    });
    $(self.sellbuyConcluDiv).html(
            '<div class="col-md-offset-1">'+
            '<p>You have bought <strong class="green-text"></strong> at an average price of <strong class="green-text"></strong></p>' +
            '<p>You have sold <strong class="green-text"></strong> at an average price of <strong class="green-text"></strong></p>' +
            '<p>You have get <strong class="green-text"></strong> in amount of <strong class="green-text"></strong>'+
            '</div>'
    );
    $(sellBuyDiv).append(self.sellbuyConcluDiv);
    self.sellbuyIouSelectors = $(sellBuyDiv).find(".selectpicker");
    self.sellbuyButton = $(sellBuyDiv).find("button");
    $(self.sellBuyChart).dxChart({
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
        palette : Consts.BLACKGREE_PALETTE
    });
    $(self.sellbuyButton).click(self.SellBuyAnalyze.bind(self));
    return sellBuyDiv;
};

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

