function NavigationBar(element, rippleMaser){
    var self = this;
    self._root = element;
    self._rippleMaster = rippleMaser;
    $(self._rippleMaster).bind(Consts.EVENT.STATE_CHANGE, function(){
        self.Update();
    });
};

NavigationBar.prototype = {

    Update : function(){
        var self = this;
        var lis = self._root.find("ul li");
        switch (self._rippleMaster.State()){
            case Consts.STATE.OFFLINE:
                $(lis[mainPageParam.ONLINE]).hide();
                $(lis[mainPageParam.CONNECTING]).show();
                break;
            case Consts.STATE.ONLINE:
                $(lis[mainPageParam.ONLINE]).show();
                $(lis[mainPageParam.CONNECTING]).hide();
                break;
        }
    }
}