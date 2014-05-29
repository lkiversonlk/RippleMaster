function ColDataView(root, baseiou, title){
    var self = this;
    self.baseiou = baseiou;
    var div = $("<div />", {
        style : "border-radius : 10px"
    });
    $(root).append(div);
    self.root = div;
    self.initialLayout(title);
};

ColDataView.prototype.initialLayout = function(title){
    var self = this;
    var titleDiv = $("<label />", {
        class : "master-col-title form-control text-center black-background white-text",
        text : title
    });
    var contentDiv = $("<div />", {
        class : "master-col-content"
    });
    var listDiv = $("<div />", {
        class : "row"
    });
    var tableHtml = '<table class="footable table" data-page-size="5"><thead><tr><th>Date</th><th>Type</th><th>Content</th></tr></thead><tbody></tbody><tfoot><tr style="text-align: center"><td colspan="5"><ul class="pagination"></div> </td> </tr></tfoot></table>';

    var InOut = $("<div />", {
        class : "col-md-6"
    });

    InOut.append($("<label />", {
        class : "text-center green-background full-width",
        text : "Send & Receive transactions"
    }));
    var div = $("<div />",{
    });
    $(div).html(tableHtml);
    $(InOut).append(div);

    var tradeTxDiv = $("<div />", {
        class : "col-md-6"
    });
    tradeTxDiv.append($("<label />", {
        class : "text-center green-background full-width",
        text : "Trade transactions"
    }));
    var div = $("<div />",{
    });
    var wordsDiv = $("<div />", {
        class : "col-md-12"
    });

    $(div).html(tableHtml);
    $(tradeTxDiv).append(div);
    self.inoutTable = new RippleTable(InOut);
    self.tradeTable = new RippleTable(tradeTxDiv);
    $(listDiv).append(InOut, tradeTxDiv, wordsDiv);

    var concluDiv = $("<div />", {
        class : "row"
    });
    var balanCha = $("<div />", {
        class : "col-md-12"
    });
    var summary = $("<div />", {
        class : "col-md-12",
        'data-bind' : "template: { name:'inout-form-template', data: data}"
    });
    self.summary = summary[0];
    self.balanceChange = new BalanceChangeBox(balanCha);
    $(concluDiv).append(balanCha);
    $(concluDiv).append(summary);
    $(contentDiv).append(listDiv);
    $(contentDiv).append($("<div />",{class:"shadow"}));
    $(contentDiv).append(concluDiv);
    $(self.root).append(titleDiv);
    $(self.root).append($("<div />", {class:"shadow"}));
    $(self.root).append(contentDiv);
    var div = $("<div />");
    var okButton = $("<button />", {
        class : "btn btn-primary form-control",
        type : "button",
        text : "OK"
    });
    $(div).append(okButton);
    $(self.root).append(okButton);
    $(okButton).click(self.OK.bind(self));
};

ColDataView.prototype.PaintBalanceChange = function(lBal, lTime, rBal, rTime){
    var self = this;
    self.balanceChange.PaintData(lBal, Util.toTimestamp(lTime), rBal, Util.toTimestamp(rTime));
};

ColDataView.prototype.PaintBalancePageChange = function(lBalPage, lTime, rBalPage, rTime){
    var self = this;
    self.balanceChange.PaintPageData(lBalPage, Util.toTimestamp(lTime), rBalPage, Util.toTimestamp(rTime));
};

ColDataView.prototype.PaintSummary = function(data){
    var self = this;
    ko.applyBindings({data:data}, self.summary);
};

ColDataView.prototype.PaintTxData = function(txes){
    var self = this;
    self.tradeTable.Clear();
    self.tradeTable.AddTxes(txes.filter(function(d){return (d.type == Transaction.Type.Trade);}));
    self.inoutTable.Clear();
    self.inoutTable.AddTxes(txes.filter(function(d){return (d.type !== Transaction.Type.Trade);}));
};

ColDataView.prototype.OK = function(){
    if(this.ok) this.ok();
};

ColDataView.prototype.Clear = function(){
    ko.cleanNode(this.summary)
    $(this.root).remove();
};

ColDataView.prototype.RemoveOneTx = function(type){
    var self = this;
    if(type === Transaction.Type.Trade){
        self.tradeTable.RemoveTopRow();
    }else{
        self.inoutTable.RemoveTopRow();
    }
}

