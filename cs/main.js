require(
    {
        baseUrl: chrome.extension.getURL('/'),
        paths: {
            backbone: 'vendors/backbone.min',
            underscore: 'vendors/lodash.custom.min',
            jquery: 'vendors/jquery-2.1.4.min',
            bluebird: 'vendors/bluebird.min',
            moment: 'vendors/moment.min',
            classie: 'vendors/md/js/classie',
            modalEffects: 'vendors/md/js/modalEffects',
            text: 'vendors/text',
            bootstrap: 'vendors/bootstrap/js/bootstrap.min'
        },
        shim: {
            backbone: {
                deps: ['jquery', 'underscore'],
                exports: 'Backbone'
            },
            bootstrap: {
                deps: ['jquery']
            }
        }
    },
    ['cs/app', 'backbone'],
    function (App) {
        window.app = new App({});

        window.app.run();
    }
);