function SellBuyPanel(root){
    this._root = root;
    this.initialLayout();
    this.parseLayout();
};

var dateSelectHtml = '<div class="row"><div class="col-md-2"><span class="label label-default">Start Time</span></div><div class="col-md-4"><div class="input-group date"><input type="text" class="form-control"><span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></span></div></div><div class="col-md-2"><span class="label label-default">End Time</span></div><div class="col-md-4"><div class="input-group date"><input type="text" class="form-control"><span class="input-group-addon"><span class="glyphicon glyphicon-calendar"></span></span></div></div></div> '

SellBuyPanel.prototype = {
    initialLayout : function(){
        var self = this;
        var configureTableHtml = '<div class="container-fluid">' + dateSelectHtml + '<div class="row"><div class="col-md-2"><span class="label label-default">Base Currency</span></div><div class="col-md-4"><select class="selectpicker" data-width="auto"></select></div><div class="col-md-2"><span class="label label-default">Pair Currency</span></div><div class="col-md-4"><select class="selectpicker" data-width="auto"></select></div></div></div>';
        var configureDiv = $("<div />", {
            class : "stat-panel-configure"
        });
        $(configureDiv).html(configureTableHtml);
        $(self._root).append(configureDiv);
        $(self._root).append($("<div />", {
            class : "shadow"
        }));
        var contentHtml = '<div class="row"><div class="col-md-6 chart-area margin-top10" style="height: 300px"></div><div class="col-md-4" style="padding-top: 12px"><div class="row"><div class="col-md-4" style="padding-top: 12px"><span class="label label-default">Total Sell</span></div><div class="col-md-8"><p class="ripplemaster-nav-font font-size30 sell-text">&nbsp; </p></div></div><div class="row"><div class="col-md-4" style="padding-top: 12px"><span class="label label-default">Sell Rate</span></div><div class="col-md-8"><p class="ripplemaster-nav-font font-size30 sell-text">&nbsp; </p></div></div><div class="row"><div class="col-md-4" style="padding-top: 12px"><span class="label label-default">Total Buy</span></div><div class="col-md-8"><p class="ripplemaster-nav-font font-size30 buy-text">&nbsp; </p></div></div><div class="row"><div class="col-md-4" style="padding-top: 12px"><span class="label label-default">Buy Rate</span></div><div class="col-md-8"><p class="ripplemaster-nav-font font-size30 buy-text">&nbsp; </p></div></div></div></div>';
        var contentDiv = $("<div />", {
            class : "container-fluid"
        });
        $(contentDiv).html(contentHtml);
        $(self._root).append(contentDiv);
    },

    parseLayout : function(){
        var self = this;
        var datepickers = $(self._root).find(".date");
        $(datepickers).datetimepicker({
            pickTime : false
        });
        self.datepickers = datepickers;
        var iouSelectors = $(self._root).find(".selectpicker");
        $(iouSelectors).selectpicker();
        self.iouSelectors = iouSelectors;
        var chartArea = $(self._root).find(".chart-area");
        $(chartArea).dxChart({
            commonSeriesSettings : {
                type : "bar",
                argumentField : 'rate'
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
                    return "Rate: " + point.argumentText + " : " + point.value.toFixed(2);
                },
                font:{
                    size : 14
                }
            },
            palette : Consts.Palette
        });
        self.chart = chartArea;
        var texts = $(self._root).find("p.ripplemaster-nav-font");
        self.sellAmountText = texts[0];
        self.sellRatioText = texts[1];
        self.buyAmountText = texts[2];
        self.buyRatioText = texts[3];
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
        $(self.sellAmountText).html(data.sellBase?data.sellBase.toFixed(2) + data.baseCurrency:"&nbsp; ");
        $(self.sellRatioText).html(data.sellRatio?data.sellRatio.toFixed(2) + data.refCurrency + "/1" + data.baseCurrency:"&nbsp; ");
        $(self.buyAmountText).html(data.buyBase?data.buyBase.toFixed(2) + data.baseCurrency:"&nbsp; ");
        $(self.buyRatioText).html(data.buyRatio?data.buyRatio.toFixed(2) + data.refCurrency + "/1" + data.baseCurrency:"&nbsp; ");
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
        var configureTableHtml = '<div class="container-fluid">' + dateSelectHtml + '<div class="row"><div class="col-md-2"><span class="label label-default">Select Currency</span></div><div class="col-md-4"><select class="selectpicker" data-width="auto"></select></div></div></div>';
        var configureDiv = $("<div />", {
            class : "stat-panel-configure"
        });
        $(configureDiv).html(configureTableHtml);
        $(self._root).append(configureDiv);
        $(self._root).append($("<div />", {
            class : "shadow"
        }));
        var contentHtml = '<div class="row"><div class="col-md-6 chart-area margin-top10" style="height: 300px"></div><div class="col-md-3 chart-area margin-top10" style="height: 300px"></div><div class="col-md-3 chart-area margin-top10" style="height: 300px"></div></div>';
        var contentDiv = $("<div />", {
            class : "container-fluid"
        });
        $(contentDiv).html(contentHtml);
        $(self._root).append(contentDiv);
    },

    parseLayout : function(){
        var self = this;
        var datepickers = $(self._root).find(".date");
        $(datepickers).datetimepicker({
            pickTime : false
        });
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
                valueField:'value'
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
                    return "Rate: " + point.argumentText + " : " + point.value.toFixed(2);
                },
                font:{
                    size : 14
                }
            }
        });
        $(self.inComeChart).dxPieChart({
            series : {
                type : 'doughnut',
                argumentField : 'type',
                valueField : 'value'
            },
            legend : {
                vericalAlignment : 'bottom',
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
            palette : Consts.Palette
        });

        $(self.outComeChart).dxPieChart({
            series : {
                type : 'doughnut',
                argumentField : 'type',
                valueField : 'value'
            },
            legend : {
                vericalAlignment : 'bottom',
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
            palette : Consts.Palette
        });
    },

    PaintData : function(data){
        var self = this;
        var outcome = [];
        outcome.push({type:'send', value:data['send']});
        outcome.push({type:'sell', value:data['sell']});
        var income = [];
        income.push({type:'receive', value:data['receive']});
        income.push({type:'buy',value:data['buy']});

        var chart = $(self.barChart).dxChart("instance");
        chart.option({
            dataSource : income.concat(outcome)
        });
        var incomeChart = $(self.inComeChart).dxChart("instance");
        incomeChart.option({
            dataSource : income
        });
        var outChart = $(self.outComeChart).dxChart("instance");
        outChart.option({
            dataSource : outcome
        });

    }
}