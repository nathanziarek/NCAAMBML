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
    console.log(docs)
    docs.map(function (d) {
        gameData.find({
            name: new RegExp("(" + d.teams[0] + ")|(" + d.teams[1] + ")"),
            date: {
                $lt: d.date,
                $gt: findSeasonStart(d.date)
            }
        }).exec((err, docs) => {
            var obj = {}
            docs.map((d) => {


                if (!obj[d.name]) {
                    obj[d.name] = {}
                }

                obj[d.name].wins = Math.max(obj[d.name].wins || 0, d.wins);
                obj[d.name].losses = Math.max(obj[d.name].losses || 0, d.losses);

                ['score', 'fgm', 'fga', '3pm', '3pa', 'fta', 'ftm', 'oreb', 'dreb', 'ast', 'blk', 'to', 'pf', 'poss'].map((s) => {
                    if (!obj[d.name][s]) {
                        obj[d.name][s] = []
                    }
                    obj[d.name][s].push(d[s]);
                })

            });

            for (team in obj) {
                for (stat in obj[team]) {
                    if (Array.isArray(obj[team][stat])) {
                        obj[team][stat] = obj[team][stat].reduce(function (sum, a) {
                            return sum + a
                        }, 0) / (obj[team][stat].length || 1)
                    }
                }
            }
            console.log(obj);

            //season starts in OCT
            //so, if this is 10/11/12, then 
            // need to find a way to keep us in the season. dont want to go back in time to last season...
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

function findSeasonStart(date) {
    var thisMonth = date.getMonth() + 1;
    var thisYear = date.getFullYear();
    if (thisMonth < 10) {
        thisYear--;
    }
    return new Date('October 1, ' + thisYear);
}