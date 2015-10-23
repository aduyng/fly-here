define(function (require) {
    var Backbone = require('backbone');
    var Config = require('./config');
    var B = require('bluebird');
    var _ = require('underscore');
    var Model = Backbone.Model.extend({});

    Model.getInstance = function () {
        if (!Model.instance) {
            Model.instance = new Model({
                key: Config.getInstance().get('alchemyAPIKey')
            });
        }
        return Model.instance;
    };


    Model.prototype.parseText = function (text) {
        var me = this;
        return B.resolve($.ajax({
            url: 'http://access.alchemyapi.com/calls/text/TextGetRankedNamedEntities',
            data: {
                apikey: me.get('key'),
                text: text,
                outputMode: 'json'
            }
        }))
            .then(function (response) {
                return _.filter(response.entities, function (entity) {
                    return _.contains(['GeographicFeature', 'City', 'Region', 'Facility'], entity.type);
                });
            });
    };

    return Model;
});

