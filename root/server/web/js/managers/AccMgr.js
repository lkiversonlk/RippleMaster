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
    this.txes = {};
    this.mapper = {};
    var self = this;
    $(this).bind(AccMgr.EVENT.ACC_INFO, function(){
        self.GetAllAddressInfo();
        self.UpdateMapper();
    })
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

AccMgr.prototype.SetAccInfo = function(accData){
    var self = this;
    self.accInfo = accData;
    $(self).trigger(AccMgr.EVENT.ACC_INFO, self.accInfo);
};

AccMgr.prototype.AddRpAddress = function(address, nickname){
    var self = this;
    var found = false;
    for(var i in self.accInfo.WatchAddresses()){
        if(self.accInfo.WatchAddresses()[i].address == address){
            found = true;
            self.accInfo.WatchAddresses()[i].Nickname(nickname);
        }
    }
    if(!found){
        self.accInfo.WatchAddresses.push(new AddressPage(address, nickname));
    }
    //self.PushSync();
    $(self).trigger(AccMgr.EVENT.ACC_INFO, self.accInfo);
    //self.GetRpBalance();
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
    //self.PushSync();
    $(self).trigger(AccMgr.EVENT.ACC_INFO, self.accInfo);
    //self.GetRpBalance();
};

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

AccMgr.prototype.GetAllAddressInfo = function(){
    var self = this;
    self.accInfo.GetAllAddressInfo();
};

AccMgr.prototype.GetRpBalance = function(address, callback){
    var self = this;
    if(address){
        self.rpMaster.AddrBalance(address, function(result, addrBal){
            if(result === Common.RESULT.SUCC){
                $(self).trigger(AccMgr.EVENT.ACC_BASIC, addrBal);
                if(self.addressBalances[addrBal.address]){
                    self.addressBalances[addrBal.address].Update(addrBal);
                }else{
                    self.addressBalances[addrBal.address] = new AddressBalancePage(addrBal);
                }
                if(callback) callback(addrBal);
            }
        });
    }else{
        for(var i in self.accInfo.rippleAddress){
            if(self.accInfo.rippleAddress[i].addressType == 0){
                var addr = self.accInfo.rippleAddress[i].address;
                self.rpMaster.AddrBalance(addr, function(result, addrBal){
                    if(result === Common.RESULT.SUCC){
                        $(self).trigger(AccMgr.EVENT.ACC_BASIC, addrBal);
                        if(self.addressBalances[addrBal.address]){
                            self.addressBalances[addrBal.address].Update(addrBal);
                        }else{
                            self.addressBalances[addrBal.address] = new AddressBalancePage(addrBal);
                        }
                    }
                });
            }
        }
    }
};

AccMgr.prototype.GetRpBalanceInLedger = function(address, ledger, callback){
    this.rpMaster.AddrBalanceInLedger(address, ledger, callback);
};

AccMgr.prototype.GetTransaction = function(address, startTime, endTime, callback){
    var start = Util.fromTimestamp(startTime);
    var end = Util.fromTimestamp(endTime);
    var filter = function(txes, start, end){
        var s,e;
        for(s = txes.length - 1; s >= 0; s--){
            if(txes[s].date >= start) break;
        };
        for(e = 0; e < txes.length; e ++){
            if(txes[e].date <= end) break;
        }

        if(e <= s){
            return txes.slice(e, s + 1);
        }
        return [];
    };

    var self = this;
    if(!self.txes[address]){
        self.rpMaster.ConsultTransactions(address, null, function(result, marker, txes){
            if(result === Common.RESULT.SUCC){
                var txStart = (txes[txes.length -1].date);
                var txEnd = (txes[0].date);
                if(!self.txes[address]){
                    self.txes[address] = {start : txStart, end : txEnd, txes : txes, marker : marker};
                }else{
                    self.txes[address].marker = marker;
                    self.txes[address].start = txStart;
                    self.txes[address].txes = self.txes[address].txes.concat(txes);
                }

                if(marker){
                    if(txStart > startTime){
                        return true;
                    }
                }
                //all the data has been loaded
                callback(Common.RESULT.SUCC, filter(self.txes[address].txes, start, end));
            }else{
                callback(Common.RESULT.FAIL)
            }
        })
    }else{
        if(self.txes[address].start >= start && self.txes[address].marker){
            self.rpMaster.ConsultTransactions(address, self.txes[address].marker, function(result, marker, txes){
                self.txes[address].marker = marker;
                self.txes[address].start = txes[txes.length - 1].date;
                self.txes[address].txes = self.txes[address].txes.concat(txes);
                if(marker){
                    if(self.txes[address].start > startTime){
                        return true;
                    }
                }
                callback(Common.RESULT.SUCC, filter(self.txes[address].txes, start, end));
            })
        }else{
            //already have or can't get more
            callback(Common.RESULT.SUCC, filter(self.txes[address].txes, start, end));
        }
    }
};

AccMgr.prototype.PushSync = function(){
    var self = this;
    $.ajax(
        {
            url : "masteraccount",
            type : "POST",
            dataType : "json",
            data : {accountInfo : self.accInfo},
            success : function(){}
        }
    );
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
}




