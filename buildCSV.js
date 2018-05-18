var Datastore = require('nedb'),
    gameData = new Datastore({
        filename: 'db-games',
        autoload: true
    }),
    statsData = new Datastore({
        filename: 'db-stats',
        autoload: true
    });

var stringify = require('csv-stringify');
var fs = require('fs-extra')
var csvWriter = fs.createWriteStream('fileForML.csv', {
    flags: 'a' // 'a' means appending (old data will be preserved)
});
csvWriter.write([
    'home_score',
    'home_wins',
    'home_losses',
    'home_fgm',
    'home_fga',
    'home_3pm',
    'home_3pa',
    'home_ftm',
    'home_fta',
    'home_oreb',
    'home_dreb',
    'home_treb',
    'home_ast',
    'home_blk',
    'home_to',
    'home_pf',
    'home_poss',
    'away_score',
    'away_wins',
    'away_losses',
    'away_fgm',
    'away_fga',
    'away_3pm',
    'away_3pa',
    'away_ftm',
    'away_fta',
    'away_oreb',
    'away_dreb',
    'away_treb',
    'away_ast',
    'away_blk',
    'away_to',
    'away_pf',
    'away_poss',
    'winner'
].toString() + "\n") // append string to your file

/* 1. Get all the games */
console.log("Getting all of the games")
gameData.find({
    //gameId: '1733628' //California Golden Bears vs Oregon State Beavers
    //date: {
    //    $lt: new Date('11/20/2016')
    //}
}, (err, listOfGames) => {
    listOfGames.map((gameHighLevel) => {
        /* 2. For each game, get the 'home' team stats to-date */
        console.log("Getting home stats for " + getTeamNameByLoc(gameHighLevel, 'home'));
        var csvResult = [];
        statsData.find({
            name: getTeamNameByLoc(gameHighLevel, 'home'),
            date: {
                $lt: gameHighLevel.date,
                $gt: findSeasonStart(gameHighLevel.date)
            }
        }, (err, homeTeamData) => {
            if (homeTeamData.length == 0) {
                return;
            }

            /* 3. For each game, get the 'away' team stats todate */
            console.log("Getting away stats for " + getTeamNameByLoc(gameHighLevel, 'away'));
            var homeTeamProcessed = teamGamesToAverages(homeTeamData);
            statsData.find({
                name: getTeamNameByLoc(gameHighLevel, 'away'),
                date: {
                    $lt: gameHighLevel.date,
                    $gt: findSeasonStart(gameHighLevel.date)
                }
            }, (err, awayTeamData) => {
                if (awayTeamData.length == 0) {
                    return;
                }
                var awayTeamProcessed = teamGamesToAverages(awayTeamData);

                /* 4. Build final array and write to CSV */
                console.log( "Writing " + getTeamNameByLoc(gameHighLevel, 'home') + " vs " + getTeamNameByLoc(gameHighLevel, 'away'))
                var finalArray = homeTeamProcessed.concat(awayTeamProcessed);
                finalArray.push(gameHighLevel.teams[0].score > gameHighLevel.teams[1].score ? gameHighLevel.teams[0].location : gameHighLevel.teams[1].location)
                csvWriter.write(finalArray.toString() + "\n") // append string to your file
            });
        });
    })
})

function teamGamesToAverages(arrays) {
    var whatToDo = {
        score: average,
        wins: max,
        losses: max,
        fgm: average,
        fga: average,
        '3pm': average,
        '3pa': average,
        ftm: average,
        fta: average,
        oreb: average,
        dreb: average,
        treb: average,
        ast: average,
        blk: average,
        to: average,
        pf: average,
        poss: average
    }
    var newArray = []
    arrays.map(function (array) {
        for (key in array) {
            if (!newArray[key]) {
                newArray[key] = []
            }
            newArray[key].push(array[key]);
        }
    });
    var returnArray = []
    for (key in whatToDo) {
        returnArray.push(whatToDo[key](newArray[key]));
    }
    return returnArray;
}

function average(array) {
    var sum = 0;
    for (var i = 0; i < array.length; i++) {
        sum = sum + array[i]
    }
    return Math.round(sum / array.length);
}

function max(array) {
    var max = 0;
    for (var i = 0; i < array.length; i++) {
        max = Math.max(max, array[i])
    }
    return max;
}

function getTeamNameByLoc(gameData, location) {
    for (i = 0; i < 2; i++) {
        if (gameData.teams[i].location == location) {
            return gameData.teams[i].name;
        }
    }
}

function findSeasonStart(date) {
    var thisMonth = date.getMonth() + 1;
    var thisYear = date.getFullYear();
    if (thisMonth < 10) {
        thisYear--;
    }
    return new Date('October 1, ' + thisYear);
}


/*


var csvArray = []
csvArray.push(['home_wins', 'home_losses', 'home_score', 'home_fgm', 'home_fga', 'home_3pm', 'home_3pa', 'home_fta', 'home_ftm', 'home_oreb', 'home_dreb', 'home_ast', 'home_blk', 'home_to', 'home_pf', 'home_poss', 'away_wins', 'away_losses', 'away_score', 'away_fgm', 'away_fga', 'away_3pm', 'away_3pa', 'away_fta', 'away_ftm', 'away_oreb', 'away_dreb', 'away_ast', 'away_blk', 'away_to', 'away_pf', 'away_poss', 'winner'])

db.find({
    //gameId: '1981773'
    date: {
        $lt: new Date('11/30/2016')
    }
}).exec(function (err, docs) {
    docs.map(function (game) {
        gameData.find({
            name: new RegExp("(" + game.teams[0] + ")|(" + game.teams[1] + ")"),
            date: {
                $lt: game.date,
                $gt: findSeasonStart(game.date)
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

            // at this point, if we don't have 2 teams, one team probably only has one game under their belt at this time.
            // we can either (1) just use the stats from this game or (2) skip this entry altogeher. I vote (2)
            // how do we figure out if there's only a single team?

            var checker = [];
            for (team in obj) {
                checker.push(team);
            }
            if (checker.length == 2) {

                for (team in obj) {
                    for (stat in obj[team]) {
                        if (Array.isArray(obj[team][stat])) {
                            obj[team][stat] = Math.round(obj[team][stat].reduce(function (sum, a) {
                                return sum + a
                            }, 0) / (obj[team][stat].length || 1))
                        }
                    }
                }

                //now we're having a problem where the callback is firing late and we're not able to 

                gameData.find({
                    gameId: game.gameId
                }).exec((err, records) => {
                    for (i = 0; i < records.length; i++) {
                        obj[records[i].name].loc = records[i]['location-type'];
                        obj[records[i].name].final = records[i].score;
                        if (records[i]['location-type'] == 'home') {
                            var homeKey = records[i].name
                        }
                        if (records[i]['location-type'] == 'away') {
                            var awayKey = records[i].name
                        }
                    }
                    row = [];

                    ['wins', 'losses', 'score', 'fgm', 'fga', '3pm', '3pa', 'fta', 'ftm', 'oreb', 'dreb', 'ast', 'blk', 'to', 'pf', 'poss'].map((d) => {
                        row.push(obj[homeKey][d])
                    });
                    ['wins', 'losses', 'score', 'fgm', 'fga', '3pm', '3pa', 'fta', 'ftm', 'oreb', 'dreb', 'ast', 'blk', 'to', 'pf', 'poss'].map((d) => {
                        row.push(obj[awayKey][d])
                    })
                    if (obj[homeKey].final > obj[awayKey].final) {
                        row.push('home')
                    } else {
                        row.push('away')
                    }

                    csvArray.push(row);
                    //stringify(csvArray, function (err, output) { fs.outputFile('./formattedData.csv', output); })
                });
            }
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
}*/