/**
 * Created by kliu on 2014/4/23.
 */
function RippleServer(){
    this._logger = new Log("RippleServer");
    this._requests = {};
    this._id = 0;
}

RippleServer.prototype = {
    Connect : function(options, callback){
        var self = this;
        if(typeof callback === 'undefined'){
            callback = function(){}
        }
        try{
            self._server = new Server(options.domain, options.port, options.secure);
            var server = self._server;

            $(server).one('connected', function(event){
                callback(Common.RESULT.SUCC, "");
            });

            $(server).bind('message', function(event, msg){
                var message = JSON.parse(msg.data);
                self.HandleMessage(message);
            });

            $(server).bind('error', function(event, error){
            });

            this._server.Connect();
        }catch (e){
            callback(Common.RESULT.FAIL, e);
        }
    },

    successHandler : function(){},

    Request : function(request){
        var self = this;
        if(this._server.State() == Server.Disconnected){
            request.Callback(Consts.FAIL_NETWORKERROR);
        }else{
            request.message.id = this._id;
            this._requests[this._id] = request;
            this._id ++;
            this._logger.log(Log.WORK_LEVEL, " request==> id: " + request.message.id + " ## command: " + request.message.command);
            this._server.SendMessage(request.message)
        }
    },

    HandleMessage : function(message){
      switch (message.type){
          case Common.SERVER_MESSAGE_TYPE.LedgerClosed:
              break;
          case Common.SERVER_MESSAGE_TYPE.PATH_FIND:
              break;
          case Common.SERVER_MESSAGE_TYPE.RESPONSE:
              var id = message.id;
              var request = this._requests[id];
              delete this._requests[id];

              if(!request){
                  this._logger.log(Log.DEBUG_LEVEL, "unexpected msg: " + message.toString());
              }else if(message.error){
                  request.Callback(Common.RESULT.FAIL, message.error_message);
              }else if(message.status == 'success') {
                  request.Callback(Common.RESULT.SUCC, message);
              }else{

              }
              break;
          default :


      }
    }
};
