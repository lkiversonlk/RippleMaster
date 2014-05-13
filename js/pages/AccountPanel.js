var AccountEvent = {
    ldTxes : "ldTxes",
    ldAcc : "ldAcc"
};

function AccountPanel(root, address){
    /* append a account panel uner root */
    var self = this;

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

    $(caption).append(fold);

    $(ele).append(caption);
    $(ele).append($("<div />", {
        class : "shadow"
    }));
    var statgroup = $("<div />",{
        class : "row account-stat-group"
    });
    self.leftPanel = $("<div />", {
        class : "col-md-6 col-xs-4"
    });
    self.rightPanel = $("<div />", {
        class : "col-md-6 col-xs-8"
    });
    $(statgroup).append(self.leftPanel);
    $(statgroup).append(self.rightPanel);
    $(ele).append(statgroup);
    $(root).append(ele);
    self.root = ele;
    $(fold).click(function(){
        $(statgroup).toggle();
    });
};

function ArbitragePanel(root, address){
    var self = this;
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
        class : "col-md-6 col-xs-4"
    });
    self.rightPanel = $("<div />", {
        class : "col-md-6 col-xs-8"
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
        $(self).trigger(AccountEvent.ldAcc)
        setTimeout(function(){$(self).trigger(AccountEvent.ldTxes);}, 2000);
    });
}