function ConfigPanel(){

};

ConfigPanel.MakeRpAddress = function(address, nickname, callback){
    var addressRowHtml = '<div class="col-sm-5"><label class="form-control">' + address + '</label></div><div class="col-sm-5"><label class="form-control">' + nickname + '</label></div><div class="col-sm-2"><button type="button" class="btn btn-danger">Delete</button></div>';
    var div = $("<div />",{
        class : "form-group"
    });
    $(div).html(addressRowHtml);
    var buttons = $(div).find("button");
    $(buttons[0]).click(function(){
        if(callback) callback();
    });
    return div;
};

ConfigPanel.UpdateRpAddress = function(root, address, nickname){
    var labels = $(root).find("label");
    $(labels[0]).text(address);
    $(labels[1]).text(nickname);
}

ConfigPanel.MakeNKEntry = function(address, nickname, callback){
    var addressRowHtml = '<div class="col-sm-5"><label class="form-control">' + address + '</label></div><div class="col-sm-5"><label class="form-control">' + nickname + '</label></div><div class="col-sm-2"><button type="button" class="btn btn-danger">Delete</button></div>';
    var div = $("<div />",{
        class : "form-group"
    });
    $(div).html(addressRowHtml);
    var buttons = $(div).find("button");
    $(buttons[0]).click(function(){
        if(callback) callback();
    });
    return div;
};


ConfigPanel.UpdateNick = function(root, address, nickname){
    var labels = $(root).find("label");
    $(labels[0]).text(address);
    $(labels[1]).text(nickname);
}
