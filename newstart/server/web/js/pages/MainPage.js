function MainPage(clientMaster){
    var self = this;
    self.clientMaster = clientMaster;
    self.accountPanelControls = [];
    self.account = "";
    self.initPage();
    self.fetchConfigFromServer();
}

var addablePanels = [
    {key : "Sell & Buy statistic", value : AccountPanelsControl.StructureKeys.SellBuy},
    {key : "IOU flow statistic", value : AccountPanelsControl.StructureKeys.MoneyFlow}
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
                        self.setMasterAccountAndSettings(json.name, json.rippleAddress);
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
                var address = $(addressPanelAccountInput[0]).val();
                var nickname = $(addressPanelAccountInput[1]).val();
                self.addRippleAddress(address, nickname, []);
                self.addRippleAddressToConfigurePanel(address, nickname);
                $("#addRippleAccountPanel").modal('hide');
                self.postMasterAccountAndSettings();
            });

            var setGatewayNicksInput = $("#setGatewayNickname input");
            $("#set-gatewayname-ok").click(function(){
                var address = $(setGatewayNicksInput[0]).val();
                var nickname = $(setGatewayNicksInput[1]).val();
                if(Consts.GatewayMapping[address]){
                    alert("Please remove the current nickname");
                }else{
                    Consts.GatewayMapping[address] = nickname;
                    self.addGatewayNicknameToConfigPanel(address, nickname);
                    $("#setGatewayNickname").modal('hide');
                    self.postMasterAccountAndSettings();
                    $.each(self.accountPanelControls, function(i){
                        self.accountPanelControls[i].balanceWidgets.refresh();
                    })
                }
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

        addRippleAddress : function(rippleAddress, nickname, configure){
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
                accountPanel = new AccountPanelsControl($("#account-content"), $("#arbitrage-content"), rippleAddress, nickname, configure, self.clientMaster);
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
            $.each(Consts.GatewayMapping, function(key){
                if(Consts.GatewayMapping.hasOwnProperty(key)){
                    settings.push({address:key, addressType : 1, nickname : Consts.GatewayMapping[key], configure : []});
                }
            })
            $.ajax(
                {
                    url : "masteraccount",
                    type : "POST",
                    data : {accountInfo : {name : self.account, rippleAddress : settings}},
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
                var address = settings[i].address;
                var nickname = settings[i].nickname;
                if(settings[i].addressType == 1){
                    Consts.GatewayMapping[address] = nickname;
                    self.addGatewayNicknameToConfigPanel(address, nickname);
                }
            });

            $.each(settings, function(i){
                var address = settings[i].address;
                var nickname = settings[i].nickname;
                if(settings[i].addressType == 0){
                    self.addRippleAddress(address, nickname, settings[i].configure);
                    self.addRippleAddressToConfigurePanel(address, nickname);
                }
            })
        },

        addRippleAddressToConfigurePanel : function(address, nickname){
            var self = this;
            var addListDiv = $("#configure-ripple-address").find("form");
            var addressRowHtml = '<div class="col-sm-5"><label class="form-control">' + address + '</label></div><div class="col-sm-5"><label class="form-control">' + nickname + '</label></div><div class="col-sm-2"><button type="button" class="btn btn-danger">Delete</button></div>';
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
        },

        addGatewayNickname : function(address, nickname){

        },

        addGatewayNicknameToConfigPanel : function(address, nickname){
            Consts.GatewayMapping[address] = nickname;
            var self = this;
            var addListDiv = $("#configure-gateway-nicks").find("form");
            var addressRowHtml = '<div class="col-sm-5"><label class="form-control">' + address + '</label></div><div class="col-sm-5"><label class="form-control">' + nickname + '</label></div><div class="col-sm-2"><button type="button" class="btn btn-danger">Delete</button></div>';
            var div = $("<div />",{
                class : "form-group"
            });
            $(div).html(addressRowHtml);
            $(addListDiv).append(div);
            var buttons = $(div).find("button");
            $(buttons[0]).click(function(){
                $(div).remove();
                self.removeGatewayNick(address);
            });
        },

        removeGatewayNick : function(address){
            var self = this;
            if(Consts.GatewayMapping[address]){
                delete Consts.GatewayMapping[address];
                self.postMasterAccountAndSettings();
                $.each(self.accountPanelControls, function(i){
                    self.accountPanelControls[i].balanceWidgets.refresh();
                })
            }
        }

    };