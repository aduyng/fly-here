require(
    {
        baseUrl: chrome.extension.getURL('/'),
        paths: {
            backbone: 'vendors/backbone.min',
            underscore: 'vendors/lodash.custom.min',
            jquery: 'vendors/jquery-2.1.4.min',
            bluebird: 'vendors/bluebird.min',
            moment: 'vendors/moment.min'
        },
        shim: {
            backbone: {
                deps: ['jquery', 'underscore'],
                exports: 'Backbone'
            }
        }
    },
    ['background/app'],
    function (App) {
        window.app = new App({});

        window.app.run();
    }
);