var Datastore = require('nedb'),
    db = new Datastore({
        filename: 'db-games',
        autoload: true
    });
gameData = new Datastore({
    filename: 'db-stats',
    autoload: true
});

db.find({
    gameId: '1981773'
}).exec(function (err, docs) {
    docs.map(function (d) {
        gameData.find({
            name: new RegExp("("+d.teams[0]+")|("+d.teams[1]+")"),
            date:{ $lt: d.date }
        }).exec((err, docs) => {
            console.log(docs, docs.length);
            /*{ gameId: '1982007',
    date: 2017-11-11T01:00:00.000Z,
    'location-type': 'home',
    name: 'FIU Golden Panthers',
    score: 70,
    conference: 'Conference USA',
    wins: 1,
    losses: 0,
    fgm: 25,
    fga: 55,
    '3pm': 10,
    '3pa': 24,
    ftm: 10,
    fta: 23,
    oreb: 10,
    dreb: 22,
    treb: 4,
    ast: 15,
    blk: 1,
    to: 11,
    pf: 19,
    poss: 52.125,
    _id: 'qlwhPOz7tNirwJzf' }*/
        });
    })
});

function outputCSVLine() {

}