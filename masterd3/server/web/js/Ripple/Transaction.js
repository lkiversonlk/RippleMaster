function Transaction(){
    this.type = null;
    this.date = null;
    this.host = null;
    this.dest = null;
    this.amount = null;
    this.cost = null;
    this.date = null;
    this.ledger = 0;
    this.sequence = 0;
    this.fee = null;
};

Transaction.Type = {
    Send : 1,
    Receive : 2,
    Trade : 3,
    ERROR   : 4,
    WaitForMeta : 5
};

Transaction.RESULT = {
    SUCCESS : "tesSUCCESS"
};

Transaction.LEDGER_ENTRY_TYPE = {
    RIPPLE_STATE : "RippleState",
    ACCOUNT_ROOT : "AccountRoot"
};

