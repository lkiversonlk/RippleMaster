function MainPage(clientMaster, callback){
    var self = this;
    self.accMgr = new AccMgr(clientMaster);
    self.clientMaster = clientMaster;
    self.account = null;
    self.initPage();
    self.initBinding();
    self.init(callback);
}

MainPage.prototype = {
    updateAccountPanel : function(acc){
        var addresses = acc.rippleAddress;
        var self = this;
        var accSe = d3.select("#account-content").selectAll("div.address-panel")
            .data(addresses.filter(function(d){return (d.addressType == 0);}), function(d){return d.address;})
            .each(function(d){
                BaseInfoPanel.UpDiv(this, d.nickname);
            });

        accSe.enter().append(function(d) {
            var ret = BaseInfoPanel.ComposeDiv(d.address, d.nickname, self.accMgr);
            BaseInfoPanel.SetRefreshAction(ret, function(){
                self.accMgr.GetRpBalance(d.address);
            })
            return ret;
        });

        accSe.exit().remove();
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

    init : function(callback){
        var self = this;
        self.accMgr.RpStatus(function(status){
            var lis = $("#RpStatus").find('ul li');
            var userCnt = $(lis[0]).find("strong");
            $(userCnt).text(status.users);
        });
        self.accMgr.GetAccInfo(callback);
    },

    initPage : function(){
        var self = this;
        $(".selectpicker").selectpicker();
    },

    postMasterAccountAndSettings : function(){

    }
};