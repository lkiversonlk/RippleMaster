function SellBuyPanel(root){
    this._root = root;
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
                    '</div> '

SellBuyPanel.prototype = {
    initialLayout : function(){
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
        var contentHtml = '<div class="row">' +
                            '<div class="col-md-6 chart-area margin-top10" style="height: 300px"></div>' +
                            '<div class="col-md-4">' +
                                '<p>You have bought <strong class="green-text"></strong> at an average price of <strong class="green-text"></strong></p>' +
                                '<p>You have sold <strong class="green-text"></strong> at an average price of <strong class="green-text"></strong></p>' +
                                '<p>You have get <strong class="green-text"></strong> in amount of <strong class="green-text"></strong>'
                            '</div>' +
                        '</div>';
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
        $(strongs[4]).text(benefits + data.refCurrency);
        $(strongs[5]).text(amount + data.baseCurrency);
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
}