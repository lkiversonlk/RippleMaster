var EventEmitter = require('events').EventEmitter;
var util = require('util');
var WebSocket = require('ws');
var Log = require('log').log;

function Server(domain, port, secure){
    EventEmitter.call(this);
    if(typeof domain !== 'string'){
        throw new TypeError("domain should be a string");
    }
    if(typeof port !== 'number'){
        throw new TypeError("port should be a number");
    }
    if(typeof secure !== 'boolean'){
        throw new TypeError("secure should be a boolean");
    }
    this._url = (secure?"wss":"ws") + "://" + domain + ":" + port;
    this._logger = new Log("Server");
    this._ws = null;
    this._state = Server.Disconnected;
};

util.inherits(Server, EventEmitter);

Server.Connected = 0;
Server.Disconnected = 1;
Server.Connecting = 2;

Server.RESULT = {
    SUCC : 0,
    FAIL : 1
};

Server.prototype.Connect = function(){
    var self = this;
    if(self._state === Server.Connected || self._state === Server.Connecting) return;
    if(self._ws) {
        self._ws.close();
    }
    self._state = Server.Connecting;
    var logger = this._logger;
    logger.log(Log.DEBUG_LEVEL,"try to connect to " + self._url);
    var ws = this._ws = new WebSocket(this._url);

    ws.onopen = function(){
        logger.log(Log.WORK_LEVEL, "connected to " + self._url);
        self._state = Server.Connected;
        self.emit("connected");
    }

    ws.onerror = function(e){
        logger.log(Log.WORK_LEVEL, "connection to " + self._url + " failed on error: " + e.reason);
        self.emit("error", e);
    }

    ws.onclose = function(){
        logger.log(Log.WORK_LEVEL, "connection to " + self._url + " closed");
        self.emit("close");
        self._state = Server.Disconnected;
        self._handleClose();
    }

    ws.onmessage = function(msg){
        logger.log(Log.DEBUG_LEVEL, "get msg :" + msg);
        self.emit("message", msg);
    }
};

Server.prototype.SendMessage = function(msg, callback){
    var message = JSON.stringify(msg);
    this._logger.log(Log.DEBUG_LEVEL, "send msg " + message);
    if(typeof callback === 'undefined'){
        callback = function(){};
    }

    this._ws.send(message, function(err){
        if(err){
            callback(Server.RESULT.FAIL);
        }else{
            callback(Server.RESULT.SUCC);
        }
    });
}

Server.prototype.State = function(){
    return this._state;
};

Server.prototype._handleClose = function(){
    var self = this;
    var ws = self._ws;
    ws.onopen = ws.onerror = ws.onclose = ws.onmessage = function noOp() {};
    setInterval(self.Connect.bind(self), 2000);
};

exports.Server = Server;

/*


 */