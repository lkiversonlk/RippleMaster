function ProgressBar(element, startLabel){
    this._root = element;
    this.SetProgress(0, startLabel);
};

ProgressBar.prototype = {
    Show : function(){
        $(this._root).modal({
            backdrop : 'static',
            keyboard : false
        });
    },

    Close : function(){
        $(this._root).modal("toggle");
    },

    SetProgress : function(number, label){
        var date = Date();
        var maxWidth = $(this._root).width();
        var width = maxWidth * number / 100;
        $(this._root).find(".progress-bar").width(width);


        if(label){
            $(this._root).find(".text").text(label + "  @" + date);
        }
    },

    Left : function(){
        var maxWidth = $(this._root).width();
        return (maxWidth - $(this._root).find(".progress-bar").width())/maxWidth;
    }
}

