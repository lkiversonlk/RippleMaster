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

function AccountPanelsControl(accountRoot, arbitrageRoot, account, structure, rippleMaster){
    var self = this;
    self.accountPanel = new AccountPanel(accountRoot, account);
    self.accountWidgets = {};
    self.accountWidgets['common'] = [];
    self.arbitragePanel = new ArbitragePanel(arbitrageRoot, account);
    self.account = account;
    self.rippleMaster = rippleMaster;
    self.initialComponents(structure);
}

AccountPanelsControl.StructureKeys = {
    Balance : 'balance',
    Orders : "orders",
    TxHistory : "txhis",
    SellBuy : 'sellBuy'
};

AccountPanelsControl.prototype = {
    initialComponents : function(structure){
        var self = this;
        $.each(structure, function(i){
            var key = structure[i];
            switch (key){
                case AccountPanelsControl.StructureKeys.Balance:
                    self.addAccountBalancePanel();
                    break;
                case AccountPanelsControl.StructureKeys.Orders:
                    self.addAccountOrdersPanel();
                    break;
                case AccountPanelsControl.StructureKeys.TxHistory:
                    self.addArbitrageTxHistoryPanel();
                    break;
                case AccountPanelsControl.StructureKeys.SellBuy:
                    self.addArbitrageSellBuyPanel();
                    break;
            }
        })
    },

    addAccountBalancePanel : function(){
        var self = this;
        if(self.accountWidgets[AccountPanelsControl.StructureKeys.Balance]){
            return;
        }
        self.accountWidgets[AccountPanelsControl.StructureKeys.Balance] = RippleBox.AccountBox(
            self.accountPanel.leftPanel,
            self.rippleMaster,
            self.account
        );
        self.accountWidgets[AccountPanelsControl.StructureKeys.Balance].Init();
    },

    addAccountOrdersPanel : function(){
        var self = this;
        if(self.accountWidgets[AccountPanelsControl.StructureKeys.Orders]){
            return;
        }
        self.accountWidgets[AccountPanelsControl.StructureKeys.Orders] = RippleBox.OfferBox(
            self.accountPanel.rightPanel,
            self.rippleMaster,
            self.account
        );
        self.accountWidgets[AccountPanelsControl.StructureKeys.Orders].Init();
    },


    addArbitrageTxHistoryPanel : function(){
        var self = this;
        if(self.accountWidgets[AccountPanelsControl.StructureKeys.TxHistory]){
            return;
        }

        self.accountWidgets[AccountPanelsControl.StructureKeys.TxHistory] = RippleBox.TxBox(
            self.arbitragePanel.rightPanel,
            self.rippleMaster,
            self.account
        );
        self.accountWidgets[AccountPanelsControl.StructureKeys.TxHistory].Init();
    },

    addArbitrageSellBuyPanel : function(){
        var self = this;

        var panel = RippleBox.SellBuyBox(
            self.arbitragePanel.leftPanel,
            self.rippleMaster,
            self.account
        );
        self.accountWidgets['common'].push(panel);
        panel.Init();
    }
}

var defaultConfiguration = [
    AccountPanelsControl.StructureKeys.Balance,
    AccountPanelsControl.StructureKeys.Orders,
    AccountPanelsControl.StructureKeys.TxHistory
];

function MainPage(rippleMaster){
    var self = this;
    self.rippleMaster = rippleMaster;
    self.accountPanelControls = {};

    self.account = "";
    self.settings = [];
    self.initial();
}

var addablePanels = [
    {key : "Sell & Buy statistic", value : AccountPanelsControl.StructureKeys.SellBuy}
];

MainPage.EVENT = {
    SettingsLoaded : "settings"
},

MainPage.prototype = {
    initial : function(){
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
                if(self.accountPanelControls[address]){
                    self.accountPanelControls[address].initialComponents([panelKey]);
                }
            }
            $("#modulePanel").modal('hide');
            self.postMasterAccountAndSettings();
        });

        $("#add-rippleaddress-ok").click(function(){
            var address = $(self.addressPanelAccountInput).val();
            self.addRippleAddressToSettings(address);
            self.addAccount(address);
            $("#addRippleAccountPanel").modal('hide');
        })

        $(self).bind(MainPage.EVENT.SettingsLoaded, self.updateModals.bind(self));
        self.getMasterAccountAndSettings();
    },

    updateModals : function(){
        var self = this;
        $(self.modulePanelAccountPicker).empty();
        $.each(self.settings, function(i){
            var opt = $("<option />",{
                value : self.settings[i].address,
                text : self.settings[i].address
            })
            $(self.modulePanelAccountPicker).append(opt);
        });
        $(self.modulePanelAccountPicker).selectpicker('refresh');
    },

    getMasterAccountAndSettings : function(){
        var self = this;
        $.ajax(
            {
                url : "masteraccount",
                type : "GET",
                dataType : "json",
                success : function(json){
                    self.account = json.account;
                    self.settings = json.settings;
                    $(self).trigger(MainPage.EVENT.SettingsLoaded);
                    self.setMasterAccountAndSettings(self.account, self.settings);
                },
                error : function(xhr, status, errThrown){

                }
            }
        )
    },

    addRippleAddressToSettings : function(rippleAddress){
        var self = this;
        var found = false;
        $.each(self.settings, function(i){
            if(self.settings[i].address === rippleAddress){
                found = true;
                return false;
            };
        });
        if(!found) {
            self.settings.push({address : rippleAddress, configure : defaultConfiguration});
        }
        $(self).trigger(MainPage.EVENT.SettingsLoaded);
    },

    addModuleToAddress : function(address, moduleKey){
        var self = this;
        var found = false;
        $.each(self.settings, function(i){
            if(self.settings[i].address === rippleAddress){
                self.settings[i].configure.push(moduleKey);
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
        $.ajax(
            {
                url : "masteraccount",
                type : "POST",
                data : {account : self.account, settings : self.settings},
                dataType : "json"
            }
        )
    },

    setMasterAccountAndSettings : function(account, settings){
        var self = this;
        self.account = account;
        self.settings = settings;
        $("#account-title-text").text(account);
        $.each(settings, function(i){
            self.addAccount(settings[i].address, settings[i].configure);
        })
    },

    addAccount : function(account) {
        var self = this;
        if (self.accountPanelControls[account]) {
            return;
        } else {
            self.accountPanelControls[account] = new AccountPanelsControl($("#account-content"), $("#arbitrage-content"), account, self.addressConfigure(account), self.rippleMaster);
        }
    }
};

