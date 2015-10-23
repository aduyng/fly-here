define(function (require) {
    var Backbone = require('backbone');
    var Super = Backbone.Model;
    var B = require('bluebird');
    var _ = require('underscore');
    var Model = Super.extend({});

    Model.prototype.listen = function () {
        var port = this.get('port');
        port.onMessage.addListener(function (msg) {
            if (msg.joke == "Knock knock")
                port.postMessage({question: "Who's there?"});
            else if (msg.answer == "Madame")
                port.postMessage({question: "Madame who?"});
            else if (msg.answer == "Madame... Bovary")
                port.postMessage({question: "I don't get it."});
        });
    };

    Model.prototype.parseLink = function (linkUrl) {
        var me = this;
        return new B(function (resolve) {
            chrome.tabs.sendMessage(me.id, {
                cmd: 'parseLink',
                linkUrl: linkUrl
            }, resolve);
        });

    };
    Model.prototype.showLowestFareInfo = function (fare) {
        var me = this;
        return new B(function (resolve) {
            chrome.tabs.sendMessage(me.id, {
                cmd: 'showLowestFareInfo',
                fare: fare
            }, resolve);
        });

    };

    return Model;
});

