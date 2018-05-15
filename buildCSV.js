var Datastore = require('nedb'),
    db = new Datastore({
        filename: 'data-games',
        autoload: true
    });
gameData = new Datastore({
    filename: 'data-teams',
    autoload: true
});

db.find({}).exec(function (err, docs) {
    docs.map(function (d) {
        gameData.find({
            name: d.teams[0],
            //date:{ $lt: d.date }
        }).exec((err, docs) => {
            if (docs[0] && docs[0].name == 'Maryland Terrapins') {
                console.log(d.gameId, d.date, docs[0] && docs[0].name, docs.length);
            }
        });
    })
});

function outputCSVLine() {

}