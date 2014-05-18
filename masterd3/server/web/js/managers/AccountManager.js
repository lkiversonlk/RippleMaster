function AccountManager(){
};

AccountManager.EVENT = {
    DATA_UPDATE : "data"
};

AccountManager.prototype.GetAccData = function(){
    var self = this;
    $.ajax(
        {
            url : "masteraccount",
            type : "GET",
            dataType : "json",
            success : function(json){
                self.data = json;
                $(self).trigger(AccountManager.EVENT.DATA_UPDATE, self.data);
            },

            error : function(xhr, status, errThrown){
                $(self).trigger(AccountManager.EVENT.DATA_UPDATE, null);
            }
        }
    )
};

AccountManager.prototype.SetAccData = function(accData){
    var self = this;
    self.data = accData;
    $(self).trigger(AccountManager.EVENT.DATA_UPDATE, self.data);
};