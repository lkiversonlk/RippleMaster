/* Log */

/* Gloabal Variable */
function Consts(){}

Consts.EVENT = {
    STATE_CHANGE : 'state',
    BALANCE_LOADED : 'balance_loaded',
    TRANSACTION_LOADED : 'transaction_loaded'
};

Consts.PageParam = {
    PRICING_WIDTH : 170
};

Consts.DefaultNetConfig = {
    domain : "s1.ripple.com",
    port    : 443,
    secure   : true
};

Consts.BATCH_SIZE = 30;

Consts.GetNick = function(address){
    if(Consts.NickMapper && Consts.NickMapper[address]) return Consts.NickMapper[address];
    return address;
}

/* page satus */
var mainPageParam = {
    ONLINE : 0,
    CONNECTING : 1
};

Consts.Palette = [
    "#AAD53B",
    "#E9772E",
    "#C0C0C0",
    "#CFE1A9"
];

Consts.BLACKGREEN_PALETTE = [
    "#3B3C3E",
    "#AAD53B"
]
Consts.ReversePalette = [
    "#E9772E",
    "#AAD53B",
    "#CFE1A9",
    "#C0C0C0"
];

