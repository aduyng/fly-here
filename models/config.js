define(function (require) {
    var Backbone = require('backbone');
    var Model = Backbone.Model.extend({
        defaults: {
            cloudSightAuthToken: 'qZkWWKNMRcPSWb87XN20Ug',
            sabreAuthToken: 'VmpFNmNIZzRZV1JyWW5WeGJqWnBibXAyTXpwRVJWWkRSVTVVUlZJNlJWaFU6Tm1STU9HeHpXVkk9',
            sabreBaseUrl: 'https://api.test.sabre.com',
            googleMapAPIKey: 'AIzaSyB48KWGB1pZmK9jhCn-CgdCyYPVHa16nbE',
            alchemyAPIKey: '56c8bb63e914401febc88e3c7ad5717719dec0c2',
            minimumImageWidth: 240,
            minimumImageHeight: 240
        }
    });

    Model.getInstance = function () {
        if (!Model.instance) {
            Model.instance = new Model({});
        }
        return Model.instance;
    };

    return Model;
});

