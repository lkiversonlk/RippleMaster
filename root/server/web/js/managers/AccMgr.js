/**
 * complex data structure
 *
 * [address, addressType, nickname]
 * {address: [Address]}
 * {address: start, end, marker, txes[]}
 *
 * One Big Acc Manager
 * AccMgr -> accInfo
 *                  [address, addressType, nickname, statesInLedger,
 * @constructor
 */
function AccMgr(ClMaster){
    this.rpMaster = ClMaster;
    this.accInfo = new AccountPage(ClMaster);
    this.txMgrs = {};
    this.mapper = {};
    var self = this;
    $(this).bind(AccMgr.EVENT.ACC_INFO, function(){
        self.GetAllAddressInfo();
        self.UpdateMapper();
    });

    setInterval(self.SyncRPAddresses.bind(self), 5 * 60 * 1000);
};

AccMgr.EVENT = {
    ACC_INFO : "acc_info",
    ACC_BASIC  : "acc_basic",
    ACC_OFF  : "acc_off"
};

AccMgr.prototype.GetAccInfo = function(){
    var self = this;
    $.ajax(
        {
            url : "accountinfo",
            type : "GET",
            dataType : "json",
            success : function(json){
                self.accInfo.AccountName(json.name);
                for(var i in json.rippleAddress){
                    var address = json.rippleAddress[i];
                    if(address.addressType == 0){
                        self.accInfo.WatchAddresses.push(new AddressPage(address.address, address.nickname));
                    }else{
                        self.accInfo.Gateways.push(new AddressPage(address.address, address.nickname));
                    }
                }
                $(self).trigger(AccMgr.EVENT.ACC_INFO);
                //self.GetRpBalance();
            },

            error : function(xhr, status, errThrown){
            }
        }
    )
};

AccMgr.prototype.AddRpAddress = function(address, nickname){
    var self = this;
    var found = false;
    if(self.accInfo.WatchAddresses().length > 3){
        alert("sorry, currently only 4 watch address is allowed");
        return;
    }
    for(var i in self.accInfo.WatchAddresses()){
        if(self.accInfo.WatchAddresses()[i].address == address){
            found = true;
            self.accInfo.WatchAddresses()[i].Nickname(nickname);
        }
    }
    if(!found){
        self.accInfo.WatchAddresses.push(new AddressPage(address, nickname));
    }
    $(self).trigger(AccMgr.EVENT.ACC_INFO, self.accInfo);
    self.SyncRPAddresses();
};

AccMgr.prototype.AddGtNick = function(address, nickname){
    var self = this;
    var found = false;
    for(var i in self.accInfo.Gateways()){
        if(self.accInfo.Gateways()[i].address == address){
            found = true;
            self.accInfo.Gateways()[i].Nickname(nickname);
        }
    }
    if(!found){
        self.accInfo.Gateways.push(new AddressPage(address, nickname));
    }
    $(self).trigger(AccMgr.EVENT.ACC_INFO, self.accInfo);
    self.SyncRPAddresses();
};
/*
AccMgr.prototype.RemoveRpAddress = function(address){
    var self = this;
    var remove = -1;
    for(i in self.accInfo.WatchAddresses()){
        if(self.accInfo.WatchAddresses()[i].address === address){
            remove = i;
        }
    }
    if(remove != -1) self.accInfo.WatchAddresses.splice(remove,1);
    //self.PushSync();
    $(self).trigger(AccMgr.EVENT.ACC_INFO, self.accInfo);
    //self.GetRpBalance();
};
*/
AccMgr.prototype.GetAllAddressInfo = function(){
    var self = this;
    self.accInfo.GetAllAddressInfo();
};

AccMgr.prototype.GetRpBalanceInLedger = function(address, ledger, callback){
    var self = this;
    self.rpMaster.AddrBalanceInLedger(address, ledger, function(result, address){
        if(result === Common.RESULT.SUCC){
            var ret = new AddressPage(address, self.mapper[address.address]);
            ret.updateBalances(address.balances);
            callback(result, ret);
        }else{
            callback(result);
        }
    });
};

/**
 * callback(result, more[bool], txes[only return at the last])
 * @param address
 * @param startTime
 * @param endTime
 * @param callback
 * @constructor
 */
AccMgr.prototype.GetTransaction = function(address, start, end, callback){
    var self = this;
    if(!self.txMgrs[address]){
        self.txMgrs[address] = new TxManager();
        self.rpMaster.ConsultTransactions(address, null, function(result, marker, txes){
            if(result === Common.RESULT.SUCC){
                self.txMgrs[address].AddTransactions(txes);
                self.txMgrs[address].marker = marker;
                if(marker){
                    if(self.txMgrs[address].startDate > start){
                        callback(Common.RESULT.SUCC, true);
                        return true;
                    }
                }
                callback(Common.RESULT.SUCC, false, self.txMgrs[address].QueryTransaction(start, end));
            }else{
                callback(Common.RESULT.FAIL)
            }
        })
    }else{
        if(!self.txMgrs[address].startDate || self.txMgrs[address].startDate >= start){
            self.rpMaster.ConsultTransactions(address, self.txMgrs[address].marker, function(result, marker, txes){
                self.txMgrs[address].marker = marker;
                self.txMgrs[address].AddTransactions(txes);
                if(marker){
                    if(self.txMgrs[address].startDate >= start){
                        callback(Common.RESULT.SUCC, true);
                        return true;
                    }
                }
                callback(Common.RESULT.SUCC, false, self.txMgrs[address].QueryTransaction(start, end));
            })
        }else{
            //already have or can't get more
            callback(Common.RESULT.SUCC, false, self.txMgrs[address].QueryTransaction(start, end));
        }
    }
};

AccMgr.prototype.RpStatus = function(callback){
    var self = this;
    $.ajax(
        {
            url : "rpstatus",
            type : "GET",
            dataType : "json",
            success : function(status){
                callback(status);
            },
            error : function(){}
        }
    )
};

AccMgr.prototype.ManualTxLoad = function(address, size, callback){
    this.rpMaster.LoadAllTransactions(address, size, null, callback);
};

AccMgr.prototype.LoadMasterCost = function(address, callback){
    var self = this;
    $.ajax({
        url : "mastercost",
        type : "GET",
        dataType : "json",
        data : {address : address},
        success : function(json){
            callback(Common.RESULT.SUCC, json);
        },
        error : function(xhr){
            callback(Common.RESULT.FAIL);
        }
    })
}

AccMgr.prototype.Start = function(){
    var self = this;
    self.GetAccInfo();
};

AccMgr.prototype.UpdateMapper = function(){
    var self = this;
    self.mapper = {};
    for(var i in self.accInfo.WatchAddresses()){
        self.mapper[self.accInfo.WatchAddresses()[i].address] = self.accInfo.WatchAddresses()[i].Nickname();
    }
    for(var i in self.accInfo.Gateways()){
        self.mapper[self.accInfo.Gateways()[i].address] = self.accInfo.Gateways()[i].Nickname();

    }
    Consts.NickMapper = self.mapper;
};

AccMgr.prototype.SyncRPAddresses = function(){
    var self = this;
    var addresses = self.accInfo.GetAddressDigest();
    var postData = {};
    postData['comm'] = Protocol.Comm.SyncAddress;
    postData[Protocol.Keys.Addresses] = addresses;

    $.ajax(
        {
            url : "accountinfo",
            type : "POST",
            dataType : "json",
            data : postData,
            success : function(){}
        }
    );
};

AccMgr.prototype.SyncMasterCost = function(address, data){
    var self = this;
    $.ajax({
        url : "mastercost",
        type : "POST",
        dataType : "json",
        data : {address : address, balances : data},
        success : function(){}
    })
}




