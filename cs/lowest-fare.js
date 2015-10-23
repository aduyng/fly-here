define(function (require) {
    var _ = require('underscore');
    var TEMPLATE = require('text!./lowest-fare.hbs');
    var Dialog = require('views/dialog');
    var Super = Backbone.View;
    var View = Super.extend({});


    View.prototype.open = function () {
        var html = Mustache.to_html(TEMPLATE, {
            price: (((this.model.AirItineraryPricingInfo || {}).ItinTotalFare || {}).TotalFare || {}).Amount
        });
        new Dialog({
            body: html
        });
    };

    View.prototype.close = function () {

    };

    return View;
});