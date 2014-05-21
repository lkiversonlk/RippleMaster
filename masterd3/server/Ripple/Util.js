function Util(){}

Util.toTimestamp = function(rpepoch){
    return new Date((rpepoch + 0x386D4380) * 1000);
};

Util.fromTimestamp = function(timestamp){
    if (timestamp instanceof Date) {
        timestamp = timestamp.getTime();
    }
    return Math.round(rpepoch / 1000) - 0x386D4380;
}