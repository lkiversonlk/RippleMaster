var AccountEvent = {
    ldTxes : "ldTxes",
    ldAcc : "ldAcc"
};

function AccountPanel(root, address, rippleMaster){
    /* append a account panel uner root */
    var self = this;
    self.rippleMaster = rippleMaster;
    self.address = address;
    var ele = $("<div />", {
        class : "account-panel container-fluid"
    });
    var caption = $("<div />", {
        class : "account-caption row",
        text : address
    });

    var fold = $("<a />", {
        class : "left"
    });
    fold.append($("<span />",{
        class : "glyphicon glyphicon-pushpin"
    }))
    var load = $("<a />", {
        class : "right"
    });
    load.append($("<span />", {
        class : "glyphicon glyphicon-refresh"
    }));
    $(caption).append(fold);
    $(caption).append(load);
    $(ele).append(caption);
    $(ele).append($("<div />", {
        class : "shadow"
    }));
    self.panel = $("<div />",{
        class : "row account-stat-group"
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
        self.rippleMaster.AccountInfo(self.address, function(result, id){
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

function ArbitragePanel(root, address, rippleMaster){
    var self = this;
    self.rippleMaster = rippleMaster;
    self.address = address;
    var ele = $("<div />", {
        class : "account-panel container-fluid"
    });
    var caption = $("<div />", {
        class : "account-caption row",
        text : address
    });
    var fold = $("<a />", {
        class : "left"
    });
    fold.append($("<span />",{
        class : "glyphicon glyphicon-pushpin"
    }))

    var load = $("<a />", {
        class : "right"
    });
    load.append($("<span />", {
        class : "glyphicon glyphicon-refresh"
    }));
    var add = $("<a />",{
        class : "right"
    });
    add.append($("<span />", {
        class : "glyphicon glyphicon-plus"
    }))
    $(caption).append(fold);
    $(caption).append(load);
    $(caption).append(add);
    $(ele).append(caption);
    $(ele).append($("<div />", {
        class : "shadow"
    }));
    var statgroup = $("<div />",{
        class : "row account-stat-group"
    });
    self.panel = $("<div />",{
        class : "row account-stat-group"
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
        self.rippleMaster.AccountInfo(self.address, function(result, id){
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
        $('#modulePanel').modal('show');
    })
}