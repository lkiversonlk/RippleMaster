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
    self.listenPanels();
    self.InitExtral(extral);
}

AccountPanelsControl.StructureKeys = {
    SellBuy : 'sellBuy',
    MoneyFlow : 'moneyFlow'
};

AccountPanelsControl.prototype = {
    listenPanels : function(){
        var self = this;
        $(self.arbitragePanel).bind(AccountEvent.addMod, function(){
            $("#add-module-ok").unbind();
            $("#add-module-ok").click(function(){
                var modulePanelModulePicker = $("#modulePanel .selectpicker")[0];
                var panelKey = $(modulePanelModulePicker).val();
                if(panelKey){
                    self.addExtralWidget(panelKey, true);
                }
                $("#modulePanel").modal('hide');
            });
            $('#modulePanel').modal('show');
        })
    },

    initCommonWidgets : function(){
        var self = this;
        self.addAccountBalancePanel();
        self.addAccountOrdersPanel();
        self.addArbitrageTxHistoryPanel();
    },

    InitExtral : function(extral){
        var self = this;
        $.each(extral, function(i){
            self.addExtralWidget(extral[i], false);
        })
    },

    addExtralWidget : function(key, refresh){
        var self = this;
        var number = self.extralWidgetKeys.length;

        var element;
        switch (key){
            case AccountPanelsControl.StructureKeys.SellBuy:
                element = self.addArbitrageSellBuyPanel();
                break;
            case AccountPanelsControl.StructureKeys.MoneyFlow:
                element = self.addMoneyFlowPanel();
                break;
        }
        self.extralWidgetKeys.push(key);
        self.extralWidgets.push(element);
        element.closeHooks.push(function(){
            self.extralWidgetKeys[number] = null;
            self.extralWidgets[number] = null;
        });
        if(refresh){
            element.refresh();
        }
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
        $(self.accountPanel).unbind();
        $(self.arbitragePanel).unbind();
    },

    addAccountBalancePanel : function(){
        var self = this;
        self.balanceWidgets = RippleBox.AccountBox(
            self.accountPanel.panel,
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
            self.accountPanel.panel,
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
            self.arbitragePanel.panel,
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
            self.arbitragePanel.panel,
            self.rippleMaster,
            self.address
        );

        $(self.arbitragePanel).bind(AccountEvent.ldAcc, panel.refresh.bind(panel));
        panel.closeHooks.push(function(){
            $(self.arbitragePanel).unbind(AccountEvent.ldAcc, panel.refresh.bind(panel));
        });
        return panel;
    },

    addMoneyFlowPanel : function(){
        var self = this;
        var panel = RippleBox.MoneyFlowBox(
            self.arbitragePanel.panel,
            self.rippleMaster,
            self.address
        );

        $(self.arbitragePanel).bind(AccountEvent.ldAcc, panel.refresh.bind(panel));
        panel.closeHooks.push(function(){
            $(self.arbitragePanel).unbind(AccountEvent.ldAcc, panel.refresh.bind(panel));
        });
        return panel;
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
    },

    Close : function(){
        var self = this;
        $(self.accountPanel).unbind();
        $(self.accountPanel.root).remove();
        $(self.arbitragePanel).unbind();
        $(self.arbitragePanel.root).remove();
    },

    refresh : function(){
        var self = this;
        self.accountPanel.refresh();
        self.arbitragePanel.refresh();
    }
}


