define(function (require) {
    var Config = require('models/config');
    var CloudSight = require('models/cloud-sight');
    var Sabre = require('models/sabre');
    var Geocode = require('models/geocode');
    var ImageModel = require('models/image');
    var Images = require('collections/image');
    var Alchemy = require('models/alchemy');
    var Tabs = require('collections/tab');
    var Tab = require('models/tab');
    var _ = require('underscore');
    var B = require('bluebird');
    var moment = require('moment');
    var Super = Backbone.Model;
    var App = Super.extend({});

    App.prototype.initialize = function () {
        Super.prototype.initialize.apply(this, arguments);
        this.cloudSight = CloudSight.getInstance();
        this.sabre = Sabre.getInstance();
        this.images = new Images();
        this.tabs = new Tabs();
    };

    App.prototype.run = function () {
        var me = this;
        //me.installMouseMoveListener();

        //me.requestUserLocation()
        //.then(function (coors) {
        //    me.coordinates = coors;
        //    return Sabre.getInstance().geoSearchByCoordinates(me.coordinates.latitude, me.coordinates.longitude, 100);
        //})
        //.then(function (response) {
        //    me.airports = (((response || {}).GeoSearchRS || {}).Found || {}).Place || [];
        //    return me.installContextMenu();
        //})
        //.then(function () {
        //    return Sabre.getInstance().requestAirportsOfMAC('QDF'); //DFW
        //})
        //.then(function (airports) {
        //    me.airports = airports;
        //    return me.installContextMenu();
        //});
        return Sabre.getInstance().requestAirportsOfMAC('QDF')
            .then(function (airports) {
                me.airports = airports;
                return me.installContextMenu();

            });
    };

    //App.prototype.installContentScriptListener = function () {
    //    chrome.runtime.onConnect.addListener(function (port) {
    //        var tab;
    //        if (port.sender.tab) {
    //            tab = me.tabs.get(port.sender.tab.id);
    //            if (_.isEmpty(tab)) {
    //                tab = new Tab(_.extend(port.sender.tab, {port: port}));
    //                me.tabs.add(tab);
    //            }
    //        }
    //        tab.listen();
    //    });
    //};

    App.prototype.installContextMenu = function () {
        chrome.contextMenus.create({
            title: 'Fly Here',
            onclick: this.onSelectionClick.bind(this),
            contexts: ['selection']
        }, function () {
            if (chrome.extension.lastError) {
                console.log('Got expected error: ' + chrome.extension.lastError.message);
            }
        });

        chrome.contextMenus.create({
            title: 'Fly Here',
            onclick: this.onImageClick.bind(this),
            contexts: ['image']
        }, function () {
            if (chrome.extension.lastError) {
                console.log('Got expected error: ' + chrome.extension.lastError.message);
            }
        });
        //
        //chrome.contextMenus.create({
        //    title: 'Fly Here',
        //    onclick: this.onLinkClick.bind(this),
        //    contexts: ['link']
        //}, function () {
        //    if (chrome.extension.lastError) {
        //        console.log('Got expected error: ' + chrome.extension.lastError.message);
        //    }
        //});
    };

    App.prototype.onSelectionClick = function (info, t) {
        var tab = this.tabs.get(t.id);
        if (!tab) {
            tab = new Tab(t);
            this.tabs.add(tab);
        }

        var selectionText = info.selectionText;
        var geocode = Geocode.getInstance();
        var sabre = Sabre.getInstance();
        var departureDate = moment().add(2, 'months');
        var returnDate = departureDate.clone().add(2, 'weeks');
        var me = this;
        return Alchemy.getInstance().parseText(selectionText)
            .then(function (entities) {
                var entity = _.first(entities);
                if (entity) {
                    return geocode.getCoordinates(entity.text)
                        .then(function (geoResponse) {
                            var location = (((geoResponse.results || [])[0] || {}).geometry || {}).location;
                            if (location) {
                                //search for airport around
                                return sabre.geoSearchAirportByCoordinates(location.lat, location.lng, 200)
                                    .then(function (airportsAroundDestination) {
                                        var destinationAirports = (((airportsAroundDestination || {}).GeoSearchRS || {}).Found || {}).Place || [];
                                        return B.reduce(destinationAirports, function (memo, destinationAirport) {
                                            return B.reduce(me.airports, function (keep, originAirport) {
                                                return sabre.findLowestFare(originAirport.code, destinationAirport.Id, departureDate, returnDate)
                                                    .then(function (response) {
                                                        return keep.concat(response.PricedItineraries);
                                                    })
                                                    .catch(function (ignore) {
                                                        return keep;
                                                    });
                                            }, memo);
                                        }, [])
                                            .then(function (fares) {
                                                var lowest = _.min(fares, function (fare) {
                                                    return parseFloat((((fare.AirItineraryPricingInfo || {}).ItinTotalFare || {}).TotalFare || {}).Amount) || Infinity;
                                                });
                                                tab.showLowestFareInfo(lowest);
                                            })
                                    });
                            }
                        });
                }
            });
    };

    App.prototype.requestUserLocation = function () {
        return new B(function (resolve, reject) {
            window.navigator.geolocation.getCurrentPosition(function (position) {
                resolve(position.coords);
            });
        });
    };

    //App.prototype.onLinkClick = function (info, t) {
    //    var tab = this.tabs.get(t.id);
    //    if (!tab) {
    //        tab = new Tab(t);
    //        this.tabs.add(tab);
    //    }
    //    tab.parseLink(info.linkUrl)
    //        .then(function (linkInfo) {
    //            console.log(linkInfo);
    //        })
    //
    //};

    App.prototype.onImageClick = function (info) {
        var srcUrl = info.srcUrl;
    };

    App.prototype.resolveURL = function (url) {
        var doc = window.document
            , oldBase = doc.getElementsByTagName('base')[0]
            , oldHref = oldBase && oldBase.href
            , docHead = doc.head || doc.getElementsByTagName('head')[0]
            , ourBase = oldBase || docHead.appendChild(doc.createElement('base'))
            , resolver = doc.createElement('a')
            , resolvedUrl
            ;
        ourBase.href = window.location.href;
        resolver.href = url;
        resolvedUrl = resolver.href; // browser magic at work here

        if (oldBase) oldBase.href = oldHref;
        else docHead.removeChild(ourBase);

        return resolvedUrl;
    };

    //App.prototype.installMouseMoveListener = function () {
    //    var me = this;
    //    $(window.document).on('mousemove', _.debounce(function (event) {
    //        if (event.target instanceof HTMLImageElement) {
    //            var element = $(event.target);
    //            var path = me.resolveURL(element.attr('src'));
    //            var image = me.images.get(path) || new ImageModel({
    //                    img: element,
    //                    path: path
    //                });
    //            me.images.add(image);
    //            return image.process();
    //        }
    //    }, 500));
    //};

    return App;
});