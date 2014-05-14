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
        class : "account-panel"
    });
    var caption = $("<div />", {
        class : "account-caption",
        text : address
    });

    var fold = $("<a />", {
        class : "left"
    });
    fold.append($("<span />",{
        class : "glyphicon glyphicon-th-list"
    }))
    var load = $("<a />", {
        class : "right"
    });
    load.append($("<span />", {
        class : "glyphicon glyphicon-search"
    }));
    $(caption).append(fold);
    $(caption).append(load);
    $(ele).append(caption);
    $(ele).append($("<div />", {
        class : "shadow"
    }));
    var statgroup = $("<div />",{
        class : "row account-stat-group"
    });
    self.leftPanel = $("<div />", {
        class : "col-md-6"
    });
    self.rightPanel = $("<div />", {
        class : "col-md-6"
    });
    $(statgroup).append(self.leftPanel);
    $(statgroup).append(self.rightPanel);
    $(ele).append(statgroup);
    $(root).append(ele);
    self.root = ele;
    $(fold).click(function(){
        $(statgroup).toggle();
    });
    $(load).click(function(){
        var progressBar = new ProgressBar($("#loading"), "Loading " + self.address);
        progressBar.Show();
        progressBar.SetProgress(30, "Loading address balances");
        self.rippleMaster.AccountInfo(self.address, function(result, id){
            progressBar.SetProgress(60, "Loading address balances");
            if(result === Consts.RESULT.SUCCESS){
                progressBar.SetProgress(100, "success");
                setTimeout(function(){
                    progressBar.Close()
                }, 2000);

                $(self).trigger(AccountEvent.ldAcc);
            }else{
                progressBar.SetProgress(100, "failed, please try again later");
                setTimeout(function(){
                    progressBar.Close()
                }, 2000);
            }
        })
    })
};

function ArbitragePanel(root, address, rippleMaster){
    var self = this;
    self.rippleMaster = rippleMaster;
    self.address = address;
    var ele = $("<div />", {
        class : "account-panel"
    });
    var caption = $("<div />", {
        class : "account-caption",
        text : address
    });
    var fold = $("<a />", {
        class : "left"
    });
    fold.append($("<span />",{
        class : "glyphicon glyphicon-th-list"
    }))

    var load = $("<a />", {
        class : "right"
    });
    load.append($("<span />", {
        class : "glyphicon glyphicon-search"
    }));
    $(caption).append(fold);
    $(caption).append(load);
    $(ele).append(caption);
    $(ele).append($("<div />", {
        class : "shadow"
    }));
    var statgroup = $("<div />",{
        class : "row account-stat-group"
    });
    self.leftPanel = $("<div />", {
        class : "col-md-6"
    });
    self.rightPanel = $("<div />", {
        class : "col-md-6"
    });
    $(statgroup).append(self.leftPanel);
    $(statgroup).append(self.rightPanel);
    $(ele).append(statgroup);
    $(root).append(ele);
    self.root = ele;
    $(fold).click(function(){
        $(statgroup).toggle();
    });
    $(load).click(function(){
        var progressBar = new ProgressBar($("#loading"), "Loading " + self.address);
        progressBar.Show();
        progressBar.SetProgress(30, "Loading address balances");
        self.rippleMaster.AccountInfo(self.address, function(result, id){
            progressBar.SetProgress(60, "Loading address balances");
            if(result === Consts.RESULT.SUCCESS){
                progressBar.SetProgress(100, "success, will start to load transaction history");

                setTimeout(function(){
                    progressBar.Close()
                }, 2000);

                $(self).trigger(AccountEvent.ldAcc);
                setTimeout(function(){$(self).trigger(AccountEvent.ldTxes);}, 2000);
            }else{
                progressBar.SetProgress(100, "failed, please try again later");
                setTimeout(function(){
                    progressBar.Close()
                }, 2000);
            }
        })
    });
}