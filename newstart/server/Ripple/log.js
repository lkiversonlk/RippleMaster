/* Log */
function log(type){this._type = type;}
log.WORK_LEVEL = 0;
log.DEBUG_LEVEL = 1;

log.SetLevel = function(level) {
    this._level = level;
}

log.GetLevel = function() {
    return this._level;
}

log.prototype = {
    log : function(level, msg) {
        if(level <= log.GetLevel()){
            console.log(this._type + ": " + msg);
        }
    }
};

exports.log = log;