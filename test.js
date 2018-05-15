var request = require('request');
var Datastore = require('nedb'),
    db = new Datastore({
        filename: 'data-games',
        autoload: true
    });

    db.find({
        //$not:{"game.city": /.+?/}
        $not:{"date": /.+?/}
    }, function (err, docs) {
        console.log(docs.length);
        
    });
    