function Master(root, accMgr){
    this.root = root;
    this.address = $(root).find("select.baseaddress");
    this.currency = $(root).find("select.basecurrency");
    var self = this;
    $(accMgr).on(AccMgr.EVENT.ACC_INFO, function(event, account){
        $(self.address).empty();

        var updateIOU = function(balances){
            $(self.currency).empty();
            $.each(balances, function(i){
                var balance = balances[i];
                var opt = $("<option />", {
                    value : balance.Currency()+balance.Issuer(),
                    text : balance.Currency() + " " + balance.Issuer()
                });
                $(self.currency).append(opt);
            });
            $(self.currency).selectpicker('refresh');
        };

        $(self.address).on('change', function(){
            var address = $(self.address).val();
            accMgr.GetRpBalance(address, function(addr){
                updateIOU(addr.balances);
            });

            accMgr.GetRpBalance(address);
        });

        $.each(account.rippleAddress, function(i){
            var address = account.rippleAddress[i];
            if(address.addressType == 0){
                var opt = $("<option />", {
                    value : address.address,
                    text : address.nickname
                });
                $(self.address).append(opt);
            }
        });
        $(self.address).selectpicker('refresh');
        accMgr.GetRpBalance($(self.address).val(), function(addr){
            updateIOU(addr.balances);
        })
    });

    $(self.currency).selectpicker();
    $(self.address).selectpicker();

    $($(self.root).find("button.startmaster")).click(self.StartMaster.bind(self));
};

Master.prototype.StartMaster = function(){
    
}

