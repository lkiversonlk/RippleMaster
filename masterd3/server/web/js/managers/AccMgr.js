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
    this.accInfo = null;
    this.txes = {};
    this.mapper = {};
    var self = this;
    $(this).bind(AccMgr.EVENT.ACC_INFO, function(){
        self.mapper = {};
        for(var i in self.accInfo.rippleAddress){
            self.mapper[self.accInfo.rippleAddress[i].address] = self.accInfo.rippleAddress[i].nickname;
        }
        Consts.NickMapper = self.mapper;
    })
};

AccMgr.EVENT = {
    ACC_INFO : "acc_info",
    ACC_BASIC  : "acc_basic",
    ACC_OFF  : "acc_off"
};

AccMgr.prototype.GetAccInfo = function(callback){
    var self = this;
    $.ajax(
        {
            url : "masteraccount",
            type : "GET",
            dataType : "json",
            success : function(json){
                self.accInfo = json;
                var addresses = self.accInfo.rippleAddress.filter(function(d){return d.addressType == 0;});
                for(var i in addresses){
                    self.addressBalances[addresses[i].address] = new AddressBalancePage();
                }
                $(self).trigger(AccMgr.EVENT.ACC_INFO, self.accInfo);
                callback(true);
                self.GetRpBalance();
            },

            error : function(xhr, status, errThrown){
                $(self).trigger(AccMgr.EVENT.ACC_INFO, null);
                callback(false);
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
    var addresses = self.accInfo.rippleAddress;
    var found = false;
    for(i in addresses){
        if(addresses[i].address == address){
            found = true;
            address[i].nickname = nickname;
        }
    }
    if(!found){
        self.accInfo.rippleAddress.push({address : address, nickname : nickname, addressType:0});
    }
    self.PushSync();
    $(self).trigger(AccMgr.EVENT.ACC_INFO, self.accInfo);
    self.GetRpBalance();
};

AccMgr.prototype.AddGtNick = function(address, nickname){
    var self = this;
    var addresses = self.accInfo.rippleAddress;
    var found = false;
    for(i in addresses){
        if(addresses[i].address == address){
            found = true;
            address[i].nickname = nickname;
        }
    }
    if(!found){
        self.accInfo.rippleAddress.push({address : address, nickname : nickname, addressType:1});
    }
    self.PushSync();
    $(self).trigger(AccMgr.EVENT.ACC_INFO, self.accInfo);
    self.GetRpBalance();
};

AccMgr.prototype.RemoveRpAddress = function(address){
    var self = this;
    var remove = -1;
    for(i in self.accInfo.rippleAddress){
        if(self.accInfo.rippleAddress[i].address === address){
            remove = i;
        }
    }
    if(remove != -1) self.accInfo.rippleAddress.splice(remove,1);
    self.PushSync();
    $(self).trigger(AccMgr.EVENT.ACC_INFO, self.accInfo);
    self.GetRpBalance();
};

AccMgr.prototype.RemoveGateNick = function(address){
    var self = this;
    for(i in self.accInfo.rippleAddress){
        if(self.accInfo.rippleAddress[i].address === address){
            self.accInfo.rippleAddress.splice(i,1);
        }
    }
    self.PushSync();
    $(self).trigger(AccMgr.EVENT.ACC_INFO, self.accInfo);
    self.GetRpBalance();
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




