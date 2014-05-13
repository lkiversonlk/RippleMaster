var AccountEvent = {
    Loading : "loading"
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

    var close = $("<a />", {
        class : "right"
    });
    close.append($("<span />",{
        class : "glyphicon glyphicon-remove"
    }));

    $(caption).append(fold);
    $(caption).append(close);

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
    $(close).click(function(){
        $(self.root).remove();
    })
};

function ArbitragePanel(root, address){
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

    var close = $("<a />", {
        class : "right"
    });
    close.append($("<span />",{
        class : "glyphicon glyphicon-remove"
    }));

    var load = $("<a />", {
        class : "right"
    });
    load.append($("<span />", {
        class : "glyphicon glyphicon-search"
    }));
    $(caption).append(fold);
    $(caption).append(close);
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
        $(self).trigger(AccountEvent.Loading);
    });
    $(close).click(function(){
        $(self.root).remove();
    })
}