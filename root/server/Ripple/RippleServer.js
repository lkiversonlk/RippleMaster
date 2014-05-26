var EventEmitter = require('events').EventEmitter;
var util = require('util');
var Server = require('./Server').Server;
var Log = require('log').log;

function RippleServer(){
    EventEmitter.call(this);
    this._logger = new Log("RippleServer");
    this._requests = {};
    this._id = 0;
    this._server_id = 0;
    this._servers = [];
}

util.inherits(RippleServer, EventEmitter);

RippleServer.MessageType = {
    LEDGER_CLOSED : "ledgerClosed",
    RESPONSE : "response",
    PATH_FIND : "path_find"
}

RippleServer.RESULT = {
    SUCC : 0,
    FAIL_NO_SERVER : 1
};

RippleServer.prototype.AddServer = function(option){
    var self = this;
    self._logger.log(Log.WORK_LEVEL, " add Server: domain => " + option.domain + " port => " + option.port + " secure => " + option.secure);
    var server = new Server(option.domain, option.port, option.secure);
    this._servers.push(server);
    server.on('message', function(msg){
        var message = JSON.parse(msg.data);
        self.HandleMessage(message);
    });
};

RippleServer.prototype.Connect = function(callback){
    var self = this;
    if(typeof callback === 'undefined'){
        callback = function(){}
    }

    if(self._servers.length == 0){
        callback(RippleServer.RESULT.FAIL_NO_SERVER);
    }

    self.once('connected', function(){
        self._logger.log(Log.WORK_LEVEL, " connected ");
        callback(RippleServer.RESULT.SUCC);
    });

    for(var i in self._servers){
        var server = self._servers[i];
        if(server.State() === Server.Connected){
            callback(RippleServer.RESULT.SUCC);
        }else if(server.State() === Server.Disconnected){
            server.on('connected', function(){
                self.emit('connected');
            });
            server.Connect();
        }
    }
};

RippleServer.prototype.Request = function(request){
    var self = this;
    self._logger.log(Log.DEBUG_LEVEL, "calling Request");

    var server_id = this._server_id;
    request.start_server = server_id;
    this._server_id = (this._server_id + 1)%(this._servers.length);
    self.RequestN(request, server_id);
};

RippleServer.prototype.RequestFixed = function(request){
//
};

RippleServer.prototype.RequestN  = function(request, n){
    var self = this;
    request.message.id = self._id;
    this._requests[self._id] = request;
    self._id ++;
    self._logger.log(Log.WORK_LEVEL, " request==> id: " + request.message.id + " ## command: " + request.message.command + " in server " + n);
    request.cur_server = n;
    if((n + 1) % (self._servers.length) == request.start_server){
        self._servers[n].SendMessage(request.message, function(result){
            if(result != Server.RESULT.SUCC){
                delete self._requests[request.message.id];
                result.Callback(RippleServer.RESULT.FAIL_NO_SERVER);
            }
        })
    }else{
        self._servers[n].SendMessage(request.message, function(result){
            if(result != Server.RESULT.SUCC){
                self._logger.log(Log.DEBUG_LEVEL, "SendMessage fail, use server" + (n+1));
                var next_server = (n + 1) % self._servers.length;
                delete self._requests[request.message.id];
                self.RequestN(request, next_server);
            }
        })
    }
};

RippleServer.prototype.HandleMessage = function(message){
    var self = this;
    switch (message.type){
        case RippleServer.MessageType.LedgerClosed:
            break;
        case RippleServer.MessageType.PATH_FIND:
            break;
        case RippleServer.MessageType.RESPONSE:
            var id = message.id;
            var request = this._requests[id];
            delete this._requests[id];
            if(!request){
                this._logger.log(Log.DEBUG_LEVEL, "unexpected msg: " + message.toString());
            }else if(message.error){
                self._logger.log(Log.WORK_LEVEL, " receive error response:" + message.error_message);
                var cur_server = request.cur_server;
                var nxt_server = (cur_server + 1)% self._servers.length;
                if(nxt_server == request.start_server){
                    request.Callback(RippleServer.RESULT.FAIL_NO_SERVER, message.error_message);
                }else{
                    self.RequestN(request, nxt_server);
                }
            }else if(message.status == 'success') {
                request.Callback(RippleServer.RESULT.SUCC, message);
            }else{
            }
            break;
        default :
    }
};

RippleServer.prototype.Disconnect = function(){

};

exports.RippleServer = RippleServer;