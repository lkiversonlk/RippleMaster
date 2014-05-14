function Server(domain, port, secure){
    //var args = Array.prototype.slice.call(arguments);

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
    this._ws = null;

    this._logger = new Log("server");
    this._state = Server.Disconnected;
};

Server.Connected = 0;
Server.Disconnected = 1;
Server.Connecting = 2;

Server.prototype.Connect = function(){
    var self = this;
    if(self._state === Server.Connected || self._state === Server.Connecting) return;
    if(self._ws) {
        self._ws.close();
    }
    self._state = Server.Connecting;
    var self = this;
    var logger = this._logger;
    logger.log(Log.DEBUG_LEVEL,"try to connect to " + self._url);
    var ws = this._ws = new WebSocket(this._url);

    ws.onopen = function(){
        logger.log(Log.WORK_LEVEL, "connected to " + self._url);
        self.HandleConnected();
        $(self).trigger("connected");
    }

    ws.onerror = function(e){
        logger.log(Log.WORK_LEVEL, "connection to " + self._url + " failed on error: " + e.reason);
        self.HandleError(e);
        $(self).trigger("error", e);
    }

    ws.onclose = function(){
        logger.log(Log.WORK_LEVEL, "connection to " + self._url + " closed");
        self.HandleClose();
        $(self).trigger("close");
    }

    ws.onmessage = function(msg){
        logger.log(Log.DEBUG_LEVEL, "get msg :" + JSON.stringify(msg));
        self.HandleMessage(msg);
        $(self).trigger("message", msg);
    }
};

Server.prototype.HandleConnected = function(){
    this._state = Server.Connected;
}

Server.prototype.HandleError = function(e){
    this._state = Server.Disconnected;
    this._handleClose();
}

Server.prototype.HandleClose = function(){
    this._state = Server.Disconnected;
    this._handleClose();
}

Server.prototype.HandleMessage = function(msg){

}

Server.prototype.SendMessage = function(msg, callback){
    var message = JSON.stringify(msg);
    this._logger.log(Log.DEBUG_LEVEL, "send msg " + message);
    if(typeof callback === 'undefined'){
        callback = function(){};
    }
    if(this._ws){
        try{
            this._ws.send(message);
            callback(Consts.RESULT.SUCCESS);
        }catch (e) {
            this._logger.log(Log.WORK_LEVEL, "fail to send message");
            callback(Consts.RESULT.FAIL);
        }
    }
}

Server.prototype.State = function(){
    return this._state;
}

Server.prototype._handleClose = function(){
    var self = this;
    var ws = self._ws;
    ws.onopen = ws.onerror = ws.onclose = ws.onmessage = function noOp() {};
    setInterval(self.Connect.bind(self), 2000);
}