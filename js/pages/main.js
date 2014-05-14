/*
$("#login").click(function (e) {
    e.stopImmediatePropagation();
});

$("#cancel-loading").click(function(e){
    $("#loading").modal("toggle");
});
*/
//Navigation Bar
var lkAccount = "r9zbt4tB2s3KsrmgE6r1KoZtVN4cNAsfxN";
var dyAccount = "rUsVKNn7zX315wzdLjarsrU8jJQ67vpK1g";

function AccountPanelsControl(accountRoot, arbitrageRoot, address, extral, rippleMaster){
    var self = this;
    self.address = address;
    self.rippleMaster = rippleMaster;
    self.accountPanel = new AccountPanel(accountRoot, address, rippleMaster);
    self.arbitragePanel = new ArbitragePanel(arbitrageRoot, address, rippleMaster);
    self.initCommonWidgets();
    self.extralWidgetKeys = [];
    self.extralWidgets = [];
    self.InitExtral(extral);
}

AccountPanelsControl.StructureKeys = {
    SellBuy : 'sellBuy'
};

AccountPanelsControl.prototype = {
    initCommonWidgets : function(){
        var self = this;
        self.addAccountBalancePanel();
        self.addAccountOrdersPanel();
        self.addArbitrageTxHistoryPanel();
    },

    InitExtral : function(extral){
        var self = this;
        self.removeAll();
        $.each(extral, function(i){
            self.addExtralWidget(extral[i]);
        })
    },

    removeAll : function(){
        var self = this;
        $.each(self.extralWidgets, function(i){
            if(self.extralWidgets[i]){
                self.extralWidgets[i].Close();
            }
        });
        self.extralWidgetKeys = [];
        self.extralWidgets = [];
    },

    addAccountBalancePanel : function(){
        var self = this;
        self.balanceWidgets = RippleBox.AccountBox(
            self.accountPanel.leftPanel,
            self.rippleMaster,
            self.address
        );
        $(self.accountPanel).bind(AccountEvent.ldAcc, self.balanceWidgets.refresh.bind(self.balanceWidgets));
        self.balanceWidgets.closeHooks.push(function () {
            $(self.accountPanel).unbind(AccountEvent.ldAcc, self.balanceWidgets.refresh.bind(self.balanceWidgets));
        })
    },

    addAccountOrdersPanel : function(){
        var self = this;
        self.ordersWidgets = RippleBox.OfferBox(
            self.accountPanel.rightPanel,
            self.rippleMaster,
            self.address
        );
        $(self.accountPanel).bind(AccountEvent.ldAcc, self.ordersWidgets.refresh.bind(self.ordersWidgets));
        self.ordersWidgets.closeHooks.push(function () {
            $(self.accountPanel).unbind(AccountEvent.ldAcc, self.ordersWidgets.refresh.bind(self.ordersWidgets));
        })
    },

    addArbitrageTxHistoryPanel : function(){
        var self = this;
        self.txHistoryWidgets = RippleBox.TxBox(
            self.arbitragePanel.leftPanel,
            self.rippleMaster,
            self.address
        );

        $(self.arbitragePanel).bind(AccountEvent.ldTxes, self.txHistoryWidgets.refresh.bind(self.txHistoryWidgets));
        self.txHistoryWidgets.closeHooks.push(function () {
            $(self.arbitragePanel).unbind(AccountEvent.ldTxes, self.txHistoryWidgets.refresh.bind(self.txHistoryWidgets));
        })
    },

    addArbitrageSellBuyPanel : function(){
        var self = this;

        var panel = RippleBox.SellBuyBox(
            self.arbitragePanel.rightPanel,
            self.rippleMaster,
            self.address
        );

        $(self.arbitragePanel).bind(AccountEvent.ldAcc, panel.refresh.bind(panel));
        panel.closeHooks.push(function(){
            $(self.arbitragePanel).unbind(AccountEvent.ldAcc, panel.refresh.bind(panel));
        });
        return panel;
    },

    addExtralWidget : function(key){
        var self = this;
        var number = self.extralWidgetKeys.length;

        var element;
        switch (key){
            case AccountPanelsControl.StructureKeys.SellBuy:
                element = self.addArbitrageSellBuyPanel();
                break;
        }
        self.extralWidgetKeys.push(key);
        self.extralWidgets.push(element);
        element.closeHooks.push(function(){
            self.extralWidgetKeys[number] = null;
            self.extralWidgets[number] = null;
        });
    },

    Settings : function(){
        var self = this;
        var ret = {
            address : self.address
        };
        var settings = [];
        $.each(self.extralWidgetKeys, function(i){
            if(self.extralWidgetKeys[i]){
                settings.push(self.extralWidgetKeys[i]);
            }
        });
        ret['configure'] = settings;
        return ret;
    }
}

function MainPage(rippleMaster){
    var self = this;
    self.rippleMaster = rippleMaster;
    self.accountPanelControls = [];
    self.account = "";
    self.initPage();
    self.fetchConfigFromServer();
}

var addablePanels = [
    {key : "Sell & Buy statistic", value : AccountPanelsControl.StructureKeys.SellBuy}
];

MainPage.EVENT = {
    updateRippleAddress : "uRpAd"
},

MainPage.prototype = {
    fetchConfigFromServer : function(){
        var self = this;
        $.ajax(
            {
                url : "masteraccount",
                type : "GET",
                dataType : "json",
                success : function(json){
                    self.setMasterAccountAndSettings(json.account, json.settings);
                },
                error : function(xhr, status, errThrown){

                }
            }
        )
    },

    initPage : function(){
        var self = this;
        self.modulePanelAccountPicker = $("#modulePanel .selectpicker")[0];
        self.modulePanelModulePicker = $("#modulePanel .selectpicker")[1];
        self.addressPanelAccountInput = $("#addRippleAccountPanel input");
        $(self.modulePanelAccountPicker).selectpicker();
        $.each(addablePanels, function(i){
            var addable = addablePanels[i];
            var opt = $("<option />",{
                value : addable.value,
                text : addable.key
            })
            $(self.modulePanelModulePicker).append(opt);
        })
        $(self.modulePanelModulePicker).selectpicker();

        $("#add-module-ok").click(function(){
            var address = $(self.modulePanelAccountPicker).val();
            var panelKey = $(self.modulePanelModulePicker).val();
            if(address && panelKey){
                self.addModuleToAddress(address, panelKey);
            }
            $("#modulePanel").modal('hide');
            self.postMasterAccountAndSettings();
        });

        $("#add-rippleaddress-ok").click(function(){
            var address = $(self.addressPanelAccountInput).val();
            self.addRippleAddress(address, []);
            $("#addRippleAccountPanel").modal('hide');
            self.postMasterAccountAndSettings();

        })
        $(self).bind(MainPage.EVENT.updateRippleAddress, self.updateModals.bind(self));
    },

    updateModals : function(){
        var self = this;
        $(self.modulePanelAccountPicker).empty();
        $.each(self.accountPanelControls, function(i){
            var opt = $("<option />",{
                value : self.accountPanelControls[i].address,
                text : self.accountPanelControls[i].address
            })
            $(self.modulePanelAccountPicker).append(opt);
        });
        $(self.modulePanelAccountPicker).selectpicker('refresh');
    },

    addRippleAddress : function(rippleAddress, configure){
        var self = this;
        var found = false;
        $.each(self.accountPanelControls, function(i){
            if(self.accountPanelControls[i].address === rippleAddress){
                found = true;
                if(configure) {
                    self.accountPanelControls[i].InitExtral(configure);
                }
                return false;
            };
        });
        if(!found) {
            self.accountPanelControls.push(new AccountPanelsControl($("#account-content"), $("#arbitrage-content"), rippleAddress, configure, self.rippleMaster));
            if(configure){
                self.accountPanelControls[self.accountPanelControls.length - 1].InitExtral(configure);
            }
            $(self).trigger(MainPage.EVENT.updateRippleAddress);
        }

    },

    addModuleToAddress : function(address, moduleKey){
        var self = this;
        var found = false;
        $.each(self.accountPanelControls, function(i){
            if(self.accountPanelControls[i].address === address){
                self.accountPanelControls[i].addExtralWidget(moduleKey);
                return false;
            };
        });
    },

    addressConfigure : function(address){
        var self = this;
        var ret = []
        $.each(self.settings, function(i){
            if(self.settings[i].address === address){
                ret = self.settings[i].configure;
            };
        });
        return ret;
    },

    postMasterAccountAndSettings : function(){
        var self = this;
        var settings = [];

        $.each(self.accountPanelControls, function(i){
            settings.push(self.accountPanelControls[i].Settings());
        });
        $.ajax(
            {
                url : "masteraccount",
                type : "POST",
                data : {account : self.account, settings : settings},
                dataType : "json"
            }
        )
    },

    setMasterAccountAndSettings : function(account, settings){
        var self = this;
        self.account = account;
        $("#account-title-text").text(account);
        $.each(settings, function(i){
            self.addRippleAddress(settings[i].address, settings[i].configure);
        })
    }
};

