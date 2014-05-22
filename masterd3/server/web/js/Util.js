function Util(){}

Util.toTimestamp = function(rpepoch){
    return new Date((rpepoch + 0x386D4380) * 1000);
};

Util.fromTimestamp = function(rpepoch){
    if (rpepoch instanceof Date) {
        rpepoch = rpepoch.getTime();
    }

    return Math.round(rpepoch / 1000) - 0x386D4380;

}

Util.formatDate = function(date, format){
    var o = {
        "M+" : date.getMonth()+1, //month
        "d+" : date.getDate(),    //day
        "h+" : date.getHours(),   //hour
        "m+" : date.getMinutes(), //minute
        "s+" : date.getSeconds(), //second
        "q+" : Math.floor((date.getMonth()+3)/3),  //quarter
        "S" : date.getMilliseconds() //millisecond
    }

    if(/(y+)/.test(format))
    {
        format=format.replace(RegExp.$1,(date.getFullYear()+"").substr(4 - RegExp.$1.length));
    }

    for(var k in o)
    {
        if(new RegExp("("+ k +")").test(format))
        {
            format = format.replace(RegExp.$1,RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
        }
    }
    return format;
}

if(typeof exports !== "undefined"){
    exports.Util = Util;
}