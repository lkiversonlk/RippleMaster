function MainPage(clientMaster, callback){
    var self = this;
    self.accMgr = new AccMgr(clientMaster);
    self.clientMaster = clientMaster;
    self.account = null;
    self.initPage();
    self.initBinding();
    self.init(callback);
}

var addablePanels = [
    {key : "Sell & Buy statistic", value : protocol.widgetKey.SellBuy},
    {key : "IOU flow statistic", value : protocol.widgetKey.IOUFlow}
];

MainPage.BaseWidgets = [
    protocol.widgetKey.BaseInfo,
    protocol.widgetKey.Offers
];

MainPage.TradeWidgets = [
    protocol.widgetKey.TxHis,
    protocol.widgetKey.SellBuy,
    protocol.widgetKey.IOUFlow
];

MainPage.prototype = {
    updateAddableModules : function(data){
        var options = d3.select("#modulePanel select").selectAll("option").data(data, function(data){
            return data.key;
        });
        options.attr("value", function(d){
            return d.value;
        }).text(function(d){return d.key});

        options.enter().append("option").attr("value", function(d){
            return d.value;
        }).text(function(d){return d.key});

        $("#modulePanel select").selectpicker('refresh');
    },

    updateAccountPanel : function(acc){
        var addresses = acc.rippleAddress;
        var self = this;
        var accSe = d3.select("#account-content").selectAll("div.address-panel")
            .data(addresses.filter(function(d){return (d.addressType == 0);}), function(d){return d.address;})
            .each(function(d){
                BaseInfoPanel.UpDiv(this, d.nickname);
            });

        accSe.enter().append(function(d) {
            /*
            var acc = new BaseInfoPanel(d.address, d.nickname);
            return acc.root[0];*/
            var ret = BaseInfoPanel.ComposeDiv(d.address, d.nickname, self.accMgr);
            BaseInfoPanel.SetRefreshAction(ret, function(){
                self.accMgr.GetRpBalance(d.address);
            })
            return ret;
        });

        self.accMgr.GetRpBalance();
        accSe.exit().remove();

        /*
        accSe.each(function(addressData, i){
            var boxSe = d3.select(this).select(".addr-st-gp").selectAll("div.ripple-box").data(addressData.configure.filter(function(conf){return ($.inArray(conf, MainPage.BaseWidgets) != -1);}));
            boxSe.enter().append(function(d){
                return self.createWidget(d, addressData.address);
            });
            boxSe.exit().remove();
        });
        */
    },

    updateTradePanel : function(acc){
        var addresses = acc.rippleAddress;
        var self = this;
        var tradeSelect = d3.select("#trade-content").selectAll("div.address-panel")
            .data(addresses.filter(function(d){return (d.addressType == 0);}), function(d){return d.address;})
            .each(function(d){
                TradePanel.UpDiv(this, d.nickname);
            });

        tradeSelect.enter().append(function(d){
            return TradePanel.ComposeDiv(d.address, d.nickname, self.accMgr);
        });

        tradeSelect.exit().remove();

        /*
        tradeSelect.each(function(addressData, i){
            var boxSe = d3.select(this).select(".addr-st-gp").selectAll("div.ripple-box").data(addressData.configure.filter(function(conf){return ($.inArray(conf, MainPage.TradeWidgets) != -1);}))
                .each(function(d, i){
                    RippleBox.UpdateClose(this, function(){
                        self.accMgr.RemoveWidget(addressData.address, MainPage.TradeWidgets, i);
                    });
                });

            boxSe.enter().append(function(d, i){
                return self.createWidget(d, addressData.address, function(){
                    self.accMgr.RemoveWidget(addressData.address, MainPage.TradeWidgets, i);
                });
            });
            boxSe.exit().remove();
        });
        */
    },

    updateConfigurePanel : function(acc){
        var self = this;
        var addresses = acc.rippleAddress;
        var rpSe = d3.select("#conf-rp").select("form").selectAll("div.form-group")
            .data(addresses.filter(function(d){return d.addressType == 0;}), function(d){return d.address;})
            .each(function(d){
                ConfigPanel.UpdateRpAddress(this, d.address, d.nickname);
            });

        rpSe.enter().append(function(d){
            return ConfigPanel.MakeRpAddress(d.address, d.nickname, function(){
                self.accMgr.RemoveRpAddress(d.address);
            })[0];
        });
        rpSe.exit().remove();

        var gtSe = d3.select("#conf-gt").select("form").selectAll("div.form-group")
            .data(addresses.filter(function(d){return d.addressType == 1;}), function(d){return d.address;})
            .each(function(d){
                ConfigPanel.UpdateNick(this, d.address, d.nickname);
            });
        gtSe.enter().append(function(d){
            return ConfigPanel.MakeNKEntry(d.address, d.nickname, function(){
                self.accMgr.RemoveGateNick(d.address);
            })[0];
        });
        gtSe.exit().remove();
    },

    updateAccountName : function(name){
        $("#account-title-text").text(name);
        $("#configure-account").text(name);
    },

    initBinding : function() {
        var self = this;
        $("#logout").click(function () {
            location.href = "/logout";
        });

        $(self.accMgr).on(AccMgr.EVENT.ACC_INFO, function (event, account) {
            self.updateAccountName(account.name);
            self.updateAccountPanel(account);
            self.updateTradePanel(account);
            self.updateConfigurePanel(account);
        });

        $("#add-rippleaddress-ok").click(function () {
            var addressPanelAccountInput = $("#addRippleAccountPanel input");
            var address = $(addressPanelAccountInput[0]).val();
            var nickname = $(addressPanelAccountInput[1]).val();
            self.accMgr.AddRpAddress(address, nickname);
            $("#addRippleAccountPanel").modal('hide');
        });

        $("#set-gatewayname-ok").click(function () {
            var setGatewayNicksInput = $("#setGatewayNickname input");
            var address = $(setGatewayNicksInput[0]).val();
            var nickname = $(setGatewayNicksInput[1]).val();
            self.accMgr.AddGtNick(address, nickname);
            $("#setGatewayNickname").modal('hide');
        });

        //$(self.clientMaster).bind(ClientMaster.EVENT.STATE_CHANGE, self.updateeNetStat.bind(self));
    },

    updateNetStat : function(){
        var self = this;
        var lis = $("#netstat").find("ul li");
        switch (self.clientMaster.State()) {
            case Consts.STATE.OFFLINE:
                $(lis[mainPageParam.ONLINE]).hide();
                $(lis[mainPageParam.CONNECTING]).show();
                break;
            case Consts.STATE.ONLINE:
                $(lis[mainPageParam.ONLINE]).show();
                $(lis[mainPageParam.CONNECTING]).hide();
                break;
        }
    },

    init : function(callback){
        var self = this;
        self.accMgr.GetAccInfo(callback);
    },

    initPage : function(){
        var self = this;
        $(".selectpicker").selectpicker();
        self.updateAddableModules(addablePanels);
        self.updateNetStat();
    },

    postMasterAccountAndSettings : function(){

    }
};