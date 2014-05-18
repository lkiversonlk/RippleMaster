var AccountEvent = {
    ldTxes : "ldTxes",
    ldAcc : "ldAcc",
    addMod : "adMod"
};

function AccountPanel(address, nickname){
    /* append a account panel uner root */
    var self = this;
    var ele = $("<div />", {
        class : "account-panel"
    });
    var caption = $("<div />", {
        class : "account-caption row",
        text : nickname
    });

    var fold = $("<a />", {
        class : "left cursor-pointer"
    });
    fold.append($("<span />",{
        class : "glyphicon glyphicon-pushpin"
    }))
    var load = $("<a />", {
        class : "right cursor-pointer"
    });
    load.append($("<span />", {
        class : "glyphicon glyphicon-refresh"
    }));
    $(caption).append(fold);
    $(caption).append(load);
    $(ele).append(caption);

    self.panel = $("<div />",{
        class : "account-stat-group row"
    });

    $(ele).append(self.panel);
    self.root = ele;
    $(fold).click(function(){
        $(self.panel).toggle();
    });

    self.refresh = function(){
        alert("refresh");
        //var progressBar = new ProgressBar($("#loading"), "Loading " + self.address);
        //progressBar.Show();
        //progressBar.SetProgress(30, "Loading address balances");
        self.clientMaster.AccountInfo(self.address, function(result, id){
            //progressBar.SetProgress(60, "Loading address balances");
            if(result === Consts.RESULT.SUCCESS){
                //progressBar.SetProgress(100, "success");
                /*
                setTimeout(function(){
                    progressBar.Close()
                }, 2000);
                */
                $(self).trigger(AccountEvent.ldAcc);
            }else{
                //progressBar.SetProgress(100, "failed, please try again later");
                /*
                setTimeout(function(){
                    progressBar.Close()
                }, 2000);
                */
            }
        })
    };

    $(load).click(self.refresh.bind(self));
};

function ArbitragePanel(root, address, nickname, rippleMaster){
    var self = this;
    self.clientMaster = rippleMaster;
    self.address = address;
    var ele = $("<div />", {
        class : "account-panel"
    });
    var caption = $("<div />", {
        class : "account-caption row",
        text : nickname
    });
    var fold = $("<a />", {
        class : "left cursor-pointer"
    });
    fold.append($("<span />",{
        class : "glyphicon glyphicon-pushpin"
    }))

    var load = $("<a />", {
        class : "right cursor-pointer"
    });
    load.append($("<span />", {
        class : "glyphicon glyphicon-refresh"
    }));
    var ldTx = $("<a />", {
        class : "right cursor-pointer"
    });
    ldTx.append($("<span />", {
        class : "glyphicon glyphicon-search"
    }));
    var add = $("<a />",{
        class : "right cursor-pointer"
    });
    add.append($("<span />", {
        class : "glyphicon glyphicon-plus"
    }))
    $(caption).append(fold);
    $(caption).append(load);
    $(caption).append(ldTx);
    $(caption).append(add);
    $(ele).append(caption);

    self.panel = $("<div />",{
        class : "account-stat-group"
    });

    $(ele).append(self.panel);
    $(root).append(ele);
    self.root = ele;
    $(fold).click(function(){
        $(self.panel).toggle();
    });

    self.refresh = function(){
        //var progressBar = new ProgressBar($("#loading"), "Loading " + self.address);
        //progressBar.Show();
        //progressBar.SetProgress(30, "Loading address balances");
        self.clientMaster.AccountInfo(self.address, function(result, id){
            //progressBar.SetProgress(60, "Loading address balances");
            if(result === Consts.RESULT.SUCCESS){
                //progressBar.SetProgress(100, "success, will start to load transaction history");
                /*
                setTimeout(function(){
                    progressBar.Close()
                }, 2000);
                */
                $(self).trigger(AccountEvent.ldAcc);
                //setTimeout(function(){$(self).trigger(AccountEvent.ldTxes);}, 2000);
            }else{
                //progressBar.SetProgress(100, "failed, please try again later");
                /*
                setTimeout(function(){
                    progressBar.Close()
                }, 2000);
                */
            }
        })
    };

    $(load).click(self.refresh.bind(self));
    $(add).click(function(){
        $(self).trigger(AccountEvent.addMod);
    })
    $(ldTx).click(function(){
        $(self).trigger(AccountEvent.ldTxes);
    })
}