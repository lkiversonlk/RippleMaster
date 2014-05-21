function SellBuyPanel(root){
    this.root = root;
    this.initialLayout();
    this.parseLayout();
};

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

SellBuyPanel.prototype = {
    initialLayout : function(){
        var self = this;

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
        $(self.root).html(sellBuyConfHtml);
        self.sellBuyChart = $("<div />", {
            class : "sellbuy chart"
        });
        $(self.root).append(self.sellBuyChart);

        self.sellbuyIouSelectors = $(sellBuyDiv).find(".selectpicker");
        return sellBuyDiv;
        var self = this;
        var configureTableHtml = '<form class="form-horizontal" role="form">' +
                                    dateSelectHtml +
                                    '<div class="form-group">' +
                                        '<div class="col-md-2">' +
                                            '<label class="form-control">Currency1</label>' +
                                        '</div>' +
                                        '<div class="col-md-4">' +
                                            '<select class="selectpicker" data-width="auto"></select>' +
                                        '</div>' +
                                        '<div class="col-md-2">' +
                                            '<label class="form-control">Currency2</span>' +
                                        '</div>' +
                                        '<div class="col-md-4">' +
                                            '<select class="selectpicker" data-width="auto"></select>' +
                                        '</div>' +
                                    '</div>' +
                                '</form>';
        var configureDiv = $("<div />", {
            class : "stat-panel-configure"
        });
        $(configureDiv).html(configureTableHtml);
        $(self._root).append(configureDiv);
        $(self._root).append($("<div />", {
            class : "shadow"
        }));

        var contentDiv = $("<div />", {
            class : "container-fluid"
        });
        $(contentDiv).html(contentHtml);
        $(self._root).append(contentDiv);
        self.summaryDiv = contentDiv;
    },

    parseLayout : function(){
        var self = this;
        var datepickers = $(self._root).find(".date");
        $(datepickers).datetimepicker();
        self.datepickers = datepickers;
        var iouSelectors = $(self._root).find(".selectpicker");
        $(iouSelectors).selectpicker();
        self.iouSelectors = iouSelectors;
        var chartArea = $(self._root).find(".chart-area");
        $(chartArea).dxChart({
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
            palette : Consts.Palette
        });
        self.chart = chartArea;
    },

    PaintData : function(data){
        var self = this;
        var chart = $(self.chart).dxChart("instance");
        chart.option({
            dataSource : data.records,
            argumentAxis:{
                argumentType : 'numeric',
                max : data.highestRatio,
                min : data.lowestRatio
            }
        });
        var strongs = $(self.summaryDiv).find("strong");
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
};

function MoneyFlowPanel(root){
    this._root = root;
    this.initialLayout();
    this.parseLayout();
}

MoneyFlowPanel.prototype = {
    initialLayout : function(){
        var self = this;
        var configureTableHtml = '<form class="form-horizontal" role="form">' +
            dateSelectHtml +
            '<div class="form-group">' +
            '<div class="col-md-2">' +
            '<label class="form-control">Currency</label>' +
            '</div>' +
            '<div class="col-md-4">' +
            '<select class="selectpicker" data-width="auto"></select>' +
            '</div>'
            '</div>' +
            '</form>';
        var configureDiv = $("<div />", {
            class : "stat-panel-configure"
        });
        $(configureDiv).html(configureTableHtml);
        $(self._root).append(configureDiv);
        $(self._root).append($("<div />", {
            class : "shadow"
        }));
        var contentHtml = '<div class="row">' +
                            '<div class="col-md-6 chart-area margin-top10" style="height: 300px"></div>' +
                            '<div class="col-md-3 chart-area margin-top10" style="height: 300px"></div>' +
                            '<div class="col-md-3 chart-area margin-top10" style="height: 300px"></div>' +
                          '</div>';
        var contentDiv = $("<div />", {
            class : "container-fluid"
        });
        $(contentDiv).html(contentHtml);
        $(self._root).append(contentDiv);
    },

    parseLayout : function(){
        var self = this;
        var datepickers = $(self._root).find(".date");
        $(datepickers).datetimepicker();
        self.datepickers = datepickers;
        var iouSelector = $(self._root).find(".selectpicker");
        $(iouSelector).selectpicker();
        self.iouSelector = iouSelector;
        var chartAreas = $(self._root).find(".chart-area");
        self.barChart = chartAreas[0];
        self.inComeChart = chartAreas[1];
        self.outComeChart = chartAreas[2];

        $(self.barChart).dxChart({
            series:{
                type :'bar',
                argumentField:'type',
                valueField:'value',
                label:{
                    visible : true,
                    precision : 4,
                    position : "outside",
                    format : 'fixedPoint'
                }
            },
            valueAxis:{
                visible : true
            },
            legend:{
                visible:false
            },
            tooltip: {
                enabled : true,
                customizeText : function(point){
                    return point.argumentText + " : " + point.value.toFixed(2);
                },
                font:{
                    size : 14
                }
            },
            palette : Consts.Palette
        });

        $(self.inComeChart).dxPieChart({
            series : {
                type : 'doughnut',
                argumentField : 'type',
                valueField : 'value',
                label:{
                    visible : true,
                    position : "inside",
                    precision : 4,
                    format : 'fixedPoint'

                }
            },
            legend : {
                verticalAlignment : 'bottom',
                horizontalAlignment : 'center',
                itemTextPosition : 'right',
                columnCount : 2
            },
            tooltip : {
                enabled : true,
                customizeText : function(point){
                    return point.argumentText + ":" + point.value.toFixed(2);
                },
                font:{
                    size : 14

                }
            },
            palette : Consts.Palette,
            title : "Buy from"
        });

        $(self.outComeChart).dxPieChart({
            series : {
                type : 'doughnut',
                argumentField : 'type',
                valueField : 'value',
                label:{
                    visible : true,
                    position : "inside",
                    precision : 4,
                    format : 'fixedPoint'
                }
            },
            legend : {
                verticalAlignment : 'bottom',
                horizontalAlignment : 'center',
                itemTextPosition : 'right',
                columnCount : 2
            },
            tooltip : {
                enabled : true,
                customizeText : function(point){
                    return point.argumentText + ":" + point.value.toFixed(2);
                },
                font:{
                    size : 14

                }
            },
            palette : Consts.ReversePalette,
            title : "Sell for"
        });
    },

    PaintData : function(data){
        var self = this;
        var chartData = [];
        chartData.push({type:'send', value:data['send']});
        chartData.push({type:'sell', value:data['sell']});
        chartData.push({type:'receive', value:data['receive']});
        chartData.push({type:'buy',value:data['buy']});
        var outcome = [];
        for(var k in data.sellDetail){
            if(data.sellDetail.hasOwnProperty(k)){
                outcome.push({type:k, value:data.sellDetail[k]});
            }
        }
        var income = [];
        for(var k in data.buyDetail){
            if(data.buyDetail.hasOwnProperty(k)){
                income.push({type:k, value:data.buyDetail[k]});
            }
        }

        var chart = $(self.barChart).dxChart("instance");
        chart.option({
            dataSource : chartData
        });
        var incomeChart = $(self.inComeChart).dxPieChart("instance");
        incomeChart.option({
            dataSource : income
        });
        var outChart = $(self.outComeChart).dxPieChart("instance");
        outChart.option({
            dataSource : outcome
        });

    }
};

function BalancePanel(){
};

BalancePanel.Init = function(ele){
    var root = $("<div />", {
        class : "row"
    });
    $(ele).append(root);
};

BalancePanel.PaintBalances = function(ele, balances){
    var root = $(ele).find("div.row");
    $(root).empty();
    for(i in balances){
        $(root).append(BalancePanel.PaintBalance(balances[i]));
    }
};

BalancePanel.PaintBalance = function(balance){
    var div = $("<div />", {
        class : "pricingtable col-md-3"
    });
    div.append(BalancePanel.assembleTop(balance));
    var inner = $("<div />", {
        class : "pure-white-background"
    });
    inner.append(BalancePanel.assembleIssuer(balance));
    inner.append("<hr />");
    inner.append(BalancePanel.assembleBalance(balance));
    div.append(inner);
    return div;
};

BalancePanel.assembleTop = function(line){
    return '<div class="pricingtable-top"><div class="currency">' + line.Currency() + '</div></div>';
};

BalancePanel.assembleIssuer = function(line){
    var gateway = Consts.GetGatewayNick(line.Issuer());
    return '<div class="pure-white-background"><p>' + gateway + '</p></div>';
};

BalancePanel.assembleBalance = function(line){
    return '<div class="balance pure-white-background">' + line.Money().toFixed(2) + '</div>'
};

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
}

