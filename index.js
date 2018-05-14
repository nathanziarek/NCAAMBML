var request = require('request');
var Datastore = require('nedb'),
    db = new Datastore({
        filename: 'data-games',
        autoload: true
    });


var startDate = new Date('November 10, 2017');
var endDate = new Date('November 15, 2017');

//getGamesForDate(startDate);
getGamesBetweenDates(startDate, endDate);

function URLFormatter(date) {
    return 'https://www.si.com/college-basketball/schedule?date=' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
}

function getGamesForDate(date, cb) {
    console.log('Getting games for ' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + '...')
    var requestUrl = URLFormatter(startDate);
    request(requestUrl, function (error, response, body) {
        var gamesRE = body.match(/college\-basketball\/game\/\d+/gi);
        var games = gamesRE.map(function (d, i) {
            return d.replace('college-basketball/game/', '');
        });
        games = Array.from(new Set(games));
        console.log('...' + games.length + ' games on ' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate());
        saveGames(games, date);
        cb && cb();
    });
}

function saveGames(games, date, cb) {
    games.map((id) => {
        db.insert({
            gameId: id,
            date: date
        });
    })
}

function getGamesBetweenDates(start, end) {
    if (start <= end) {
        getGamesForDate(start, () => {
            start.setDate(start.getDate() + 1)
            var games = getGamesBetweenDates(start, end);
        });
    }
}