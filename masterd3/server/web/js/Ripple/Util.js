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

Util.DateString = function(date){

}

Date.prototype.format = function(format)
{
    var o = {
        "M+" : this.getMonth()+1, //month
        "d+" : this.getDate(),    //day
        "h+" : this.getHours(),   //hour
        "m+" : this.getMinutes(), //minute
        "s+" : this.getSeconds(), //second
        "q+" : Math.floor((this.getMonth()+3)/3),  //quarter
        "S" : this.getMilliseconds() //millisecond
    }

    if(/(y+)/.test(format))
    {
        format=format.replace(RegExp.$1,(this.getFullYear()+"").substr(4 - RegExp.$1.length));
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