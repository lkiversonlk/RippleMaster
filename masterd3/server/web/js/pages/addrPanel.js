function BaseInfoPanel(address, nickname){};

BaseInfoPanel.ComposeDiv = function(address, nickname, accMgr){
    var ele = $("<div />", {
        class : "address-panel"
    });
    var caption = $("<div />", {
        class : "account-caption row",
        text : nickname
    });
    var refresh = $("<a />", {
        class : "right cursor-pointer refresh"
    });
    refresh.append($("<span />",{
        class : "glyphicon glyphicon-refresh"
    }))
    $(caption).append(refresh);
    $(ele).append(caption);
    var panel = $("<div />",{
        class : "addr-st-gp"
    });

    $(ele).append(panel);

    var balance = $("<div />", {
        class : "row balance"
    });
    var offers = $("<div />", {
        class : "row offers"
    });
    $(panel).append(balance);
    $(panel).append($("<div />", {
        class : "separator40"
    }))
    $(panel).append(offers);

    BalancePanel.Init(balance);
    $(accMgr).on(AccMgr.EVENT.ACC_BASIC, function(event, data){
        if(data.address === address){
            BalancePanel.PaintBalances(balance, data.balances);
            OfferPanel.ShowTx(offers, data.offers);
        }
    })
    return ele[0];
};

BaseInfoPanel.UpDiv = function(root, nickname){
    if(nickname) $(root).find("div.account-caption")[0].childNodes[0].data = nickname;
}

BaseInfoPanel.SetRefreshAction = function(root, callback, acMgr){
    var a = $(root).find("a.refresh");
    $(a).click(callback);
}

function TradePanel(address, nickname){
};

TradePanel.ComposeDiv = function(address, nickname, accMgr){
    var ele = $("<div />", {
        class : "address-panel"
    });
    var caption = $("<div />", {
        class : "account-caption row",
        text : nickname
    });
    $(ele).append(caption);

    var panel = $("<div />",{
        class : "addr-st-gp row"
    });

    var anlyzeBox = new AnalyzeBox(address, accMgr);
    $(panel).append(anlyzeBox.root);
    $(accMgr).bind(AccMgr.EVENT.ACC_BASIC, function(event, data){
        if(data.address === address){
            anlyzeBox.Initial(data.balances);
        }
    })
    $(ele).append(panel);
    return ele[0];
}

TradePanel.UpDiv = function(root, nickname){
    $(root).find("div.account-caption")[0].childNodes[0].data = nickname;
};
