define(function (require) {
    var Backbone = require('backbone');
    var Config = require('./config');
    var B = require('bluebird');
    var Model = Backbone.Model.extend({});

    Model.getInstance = function () {
        if (!Model.instance) {
            Model.instance = new Model({
                key: Config.getInstance().get('googleMapAPIKey')
            });
        }
        return Model.instance;
    };

    Model.prototype.getCoordinates = function (address) {
        var me = this;
        console.log('running geodecode for ' + address);
        if (_.isEmpty(address)) {
            return B.reject('term is empty!');
        }

        return new B(function (resolve, reject) {
            return $.ajax({
                url: 'https://maps.googleapis.com/maps/api/geocode/json',
                method: 'GET',
                data: {
                    address: address,
                    key: me.get('key')
                },
                success: resolve,
                error: reject
            });
        });
    };

    return Model;
});

