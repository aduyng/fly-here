define(function (require) {
    var Backbone = require('backbone');
    var Super = Backbone.Model;
    var CloudSight = require('./cloud-sight');
    var Geocode = require('./geocode');
    var Sabre = require('./sabre');
    var B = require('bluebird');
    var _ = require('underscore');
    var ImageModel = Super.extend({
        idAttribute: 'path'
    });

    ImageModel.prototype.process = function (userLocation) {
        var me = this;
        if (this.get('isProcessed')) {
            console.log("don't do anything");
            return true;
        }

        this.set('isProcessed', true);

        //try with file name first
        me.set('name', me.get('path').split('/').pop().split('.').shift(1).replace(/[^a-z]/ig, ' '));
        return me.getCoordinates()
            .then(function () {
                //if the location returned as empty, try decode it using image content
                if (_.isEmpty(me.get('location'))) {
                    return me.getRealDimensions()
                        .then(function () {
                            return me.recognizePlaceName();
                        })
                        .then(function () {
                            return me.getCoordinates();
                        });
                }
                return B.resolve();
            })
            .then(function () {
                console.log(me.toJSON());

                if (!_.isEmpty(me.get('location'))) {
                    return me.searchForSurroundingAirportCodes()
                        .then(function () {
                            return me.getFlightsForAllAirports();
                        });
                }
            })
            .catch(function (e) {
                e = e || {};
                console.error(e, e.message, e.stack);
            });
    };
    ImageModel.prototype.searchForSurroundingAirportCodes = function () {
        return Sabre.getInstance().geoSearchAirportByCoordinates(this.get('location').lat, this.get('location').lng);
    };

    ImageModel.prototype.getFlightsForAllAirports = function () {

    };

    ImageModel.prototype.getRealDimensions = function () {
        var me = this;
        console.log('getRealDimensions(): path=' + me.get('path'));
        return new B(function (resolve, reject) {
            var img = new Image();
            img.onload = function () {
                if (img.width > 320 && img.height > 200) {
                    me.set('width', img.width);
                    me.set('height', img.height);
                    console.log(me.get('path'), img.width, img.height);
                    return resolve({
                        width: img.width,
                        height: img.height
                    });
                }
                return reject();
            };
            img.src = me.get('path');
        });
    };

    ImageModel.prototype.recognizePlaceName = function () {
        var me = this;
        return CloudSight.getInstance().recognize(me.get('path'));
    };

    ImageModel.prototype.getCoordinates = function () {
        var me = this;
        console.log('running geodecode for ' + me.get('name'));
        if (_.isEmpty(me.get('name'))) {
            return B.reject('Name is empty!');
        }

        return Geocode.getInstance().getCoordinates(me.get('name'))
            .then(function (geoResponse) {
                me.set('location', (((geoResponse.results || [])[0] || {}).geometry || {}).location);
            });
    };

    return ImageModel;
});

