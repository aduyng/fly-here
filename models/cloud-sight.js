define(function (require) {
    var Backbone = require('backbone');
    var Config = require('./config');
    var B = require('bluebird');
    var Model = Backbone.Model.extend({});

    Model.getInstance = function () {
        if (!Model.instance) {
            Model.instance = new Model({
                authToken: Config.getInstance().get('cloudSightAuthToken')
            });
        }
        return Model.instance;
    };


    Model.prototype.recognize = function (path) {
        var me = this;
        return B.resolve($.ajax({
            url: 'https://api.cloudsightapi.com/image_requests',
            method: 'POST',
            data: {
                image_request: {
                    remote_image_url: path,
                    locale: 'en-US'
                }
            },
            headers: {
                'Authorization': me.getAuthorizationHeader()
            }
        }))
            .then(function (tokenResponse) {
                if (tokenResponse.token) {
                    return me.getResult(tokenResponse.token)
                        .then(function (imageResponse) {
                            if (imageResponse.name) {
                                return imageResponse.name;
                            }
                            return B.reject('No name found!');
                        })
                }
                return B.reject('No token returned');
            });
    };

    Model.prototype.getResult = function (token) {
        var me = this;
        console.log('retrieve decoded image for ' + token);
        return new B(function (resolve, reject) {

            function makeRequest() {
                $.ajax({
                    url: 'https://api.cloudsightapi.com/image_responses/' + token,
                    method: 'GET',
                    headers: {
                        'Authorization': me.getAuthorizationHeader()
                    },
                    success: function (response) {
                        console.log(response.status, response);
                        if (response.status === 'completed') {
                            return resolve(response);
                        }
                        setTimeout(function () {
                            return makeRequest();
                        }, 2000);
                    },
                    error: reject
                });
            }

            makeRequest();
        });
    };

    Model.prototype.getAuthorizationHeader = function () {
        return 'CloudSight ' + this.get('authToken');
    };

    return Model;
});

