define(function (require) {
    var Config = require('models/config');
    var CloudSight = require('models/cloud-sight');
    var Sabre = require('models/sabre');
    var ImageModel = require('models/image');
    var Images = require('collections/image');
    var _ = require('underscore');
    var Bootstrap = require('bootstrap');
    var LowestFareView = require('cs/lowest-fare');
    var Super = Backbone.Model;
    var App = Super.extend({});


    App.prototype.initialize = function () {
        Super.prototype.initialize.apply(this, arguments);
        this.cloudSight = CloudSight.getInstance();
        this.sabre = Sabre.getInstance();
        this.images = new Images();

    };

    App.prototype.run = function () {
        var me = this;
        me.listenToBackgroundCommand();
    };

    App.prototype.listenToBackgroundCommand = function () {
        var me = this;

        chrome.runtime.onMessage.addListener(function (payload, sender, sendResponse) {
            var tmp;
            switch (payload.cmd) {
            case 'parseLink':
                tmp = $('a[href="' + payload.linkUrl + '"]');
                console.log(tmp);
                sendResponse({
                    linkUrl: payload.linkUrl,
                    text: tmp.text(),
                    title: tmp.attr('title')
                });
                break;
            case 'showLowestFareInfo':
                var lowestFare = new LowestFareView({
                    model: payload.fare
                });
                lowestFare.open();
                console.log(lowestFare);
                break;
            }
        });
    };


    return App;
});