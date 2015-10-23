define(function (require) {
    var Backbone = require('backbone');
    var Model = require('models/tab');

    var Collection = Backbone.Collection.extend({
        model: Model
    });

    return Collection;
});

