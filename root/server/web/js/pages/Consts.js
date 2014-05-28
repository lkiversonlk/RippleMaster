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
function ViewModel() {
    var self = this;
    this.Name = ko.observable("Chris");
    this.teamItems = ko.observableArray([{
        text: 'Chris',
        id: 1
    }, {
        text: 'Peter',
        id: 2
    }, {
        text: 'John',
        id: 3
    }]);
    this.teamID = ko.observableArray([2, 3]);
};

ko.bindingHandlers.selectPicker = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        if ($(element).is('select')) {
            if (ko.isObservable(valueAccessor())) {
                if ($(element).prop('multiple') && $.isArray(ko.utils.unwrapObservable(valueAccessor()))) {
                    // in the case of a multiple select where the valueAccessor() is an observableArray, call the default Knockout selectedOptions binding
                    ko.bindingHandlers.selectedOptions.init(element, valueAccessor, allBindingsAccessor);
                } else {
                    // regular select and observable so call the default value binding
                    ko.bindingHandlers.value.init(element, valueAccessor, allBindingsAccessor);
                }
            }
            $(element).addClass('selectpicker').selectpicker();
        }
    },
    update: function (element, valueAccessor, allBindingsAccessor) {
        if ($(element).is('select')) {
            var selectPickerOptions = allBindingsAccessor().selectPickerOptions;
            if (typeof selectPickerOptions !== 'undefined' && selectPickerOptions !== null) {
                var options = selectPickerOptions.optionsArray,
                    optionsText = selectPickerOptions.optionsText,
                    optionsValue = selectPickerOptions.optionsValue,
                    optionsCaption = selectPickerOptions.optionsCaption,
                    isDisabled = selectPickerOptions.disabledCondition || false,
                    resetOnDisabled = selectPickerOptions.resetOnDisabled || false;
                if (ko.utils.unwrapObservable(options).length > 0) {
                    // call the default Knockout options binding
                    ko.bindingHandlers.options.update(element, options, allBindingsAccessor);
                }
                if (isDisabled && resetOnDisabled) {
                    // the dropdown is disabled and we need to reset it to its first option
                    $(element).selectpicker('val', $(element).children('option:first').val());
                }
                $(element).prop('disabled', isDisabled);
            }
            if (ko.isObservable(valueAccessor())) {
                if ($(element).prop('multiple') && $.isArray(ko.utils.unwrapObservable(valueAccessor()))) {
                    // in the case of a multiple select where the valueAccessor() is an observableArray, call the default Knockout selectedOptions binding
                    ko.bindingHandlers.selectedOptions.update(element, valueAccessor);
                } else {
                    // call the default Knockout value binding
                    ko.bindingHandlers.value.update(element, valueAccessor);
                }
            }

            $(element).selectpicker('refresh');
        }
    }
};