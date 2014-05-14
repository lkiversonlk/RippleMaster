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
    $(caption).click(function(){
        $(statgroup).toggle();
    });
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
    $(caption).click(function(){
        $(statgroup).toggle();
    });

}