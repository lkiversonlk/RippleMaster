function MainPage(rippleMaster){
    var self = this;
    self.rippleMaster = rippleMaster;
    self.accountPanelControls = [];
    self.account = "";
    self.initPage();
    self.fetchConfigFromServer();
}

var addablePanels = [
    {key : "买卖套利", value : AccountPanelsControl.StructureKeys.SellBuy},
    {key : "IOU流向", value : AccountPanelsControl.StructureKeys.MoneyFlow}
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
            var modulePanelModulePicker = $("#modulePanel .selectpicker");
            $.each(addablePanels, function(i){
                var addable = addablePanels[i];
                var opt = $("<option />",{
                    value : addable.value,
                    text : addable.key
                })
                $(modulePanelModulePicker).append(opt);
            })
            $(modulePanelModulePicker).selectpicker();

            $("#logout").click(function(){
                location.href = "/logout";
            });

            $(self).bind(MainPage.EVENT.updateRippleAddress, self.updateModals.bind(self));


            var addressPanelAccountInput = $("#addRippleAccountPanel input");
            $("#add-rippleaddress-ok").click(function(){
                var address = $(addressPanelAccountInput).val();
                self.addRippleAddress(address, []);
                self.addRippleAddressToConfigurePanel(address);
                $("#addRippleAccountPanel").modal('hide');
                self.postMasterAccountAndSettings();
            });

            setInterval(self.postMasterAccountAndSettings.bind(self), 60 * 1000);
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
            var accountPanel;
            $.each(self.accountPanelControls, function(i){
                if(self.accountPanelControls[i].address === rippleAddress){
                    found = true;
                    accountPanel = self.accountPanelControls[i];
                    if(configure) {
                        self.accountPanelControls[i].InitExtral(configure);
                    }
                    return false;
                };
            });
            if(!found) {
                accountPanel = new AccountPanelsControl($("#account-content"), $("#arbitrage-content"), rippleAddress, configure, self.rippleMaster);
                self.accountPanelControls.push(accountPanel);
                $(self).trigger(MainPage.EVENT.updateRippleAddress);
            }
            accountPanel.refresh();
        },

        addModuleToAddress : function(address, moduleKey){
            var self = this;
            var found = false;
            $.each(self.accountPanelControls, function(i){
                if(self.accountPanelControls[i].address === address){
                    self.accountPanelControls[i].addExtralWidget(moduleKey, true);
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

        removeAddress : function(address){
            var self = this;
            $.each(self.accountPanelControls, function(i){
                if(self.accountPanelControls[i].address === address){
                    self.accountPanelControls[i].Close();
                    self.accountPanelControls.splice(i, 1);
                    return false;
                };
            });
            self.postMasterAccountAndSettings();
        },

        setMasterAccountAndSettings : function(account, settings){
            var self = this;
            self.account = account;
            $("#account-title-text").text(account);
            $("#configure-account").text(account);
            $.each(settings, function(i){
                self.addRippleAddress(settings[i].address, settings[i].configure);
                self.addRippleAddressToConfigurePanel(settings[i].address);
            })
        },

        addRippleAddressToConfigurePanel : function(address){
            var self = this;
            var addListDiv = $("#configure-ripple-address").find("form");
            var addressRowHtml = '<div class="col-sm-10"><label class="form-control">' + address + '</label></div><div class="col-sm-2"><button type="button" class="btn btn-danger">Delete</button></div>';
            var div = $("<div />",{
                class : "form-group"
            });
            $(div).html(addressRowHtml);
            $(addListDiv).append(div);
            var buttons = $(div).find("button");
            $(buttons[0]).click(function(){
                $(div).remove();
                self.removeAddress(address);
            });
        }
    };