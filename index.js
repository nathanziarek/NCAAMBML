var request = require('request');
var startDate = new Date('November 10, 2017');
var endDate = new Date('November 15, 2017');

getGamesBetweenDates(startDate, endDate, function () {
    console.log('DONE')
})

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
        console.log('...' + games.length + ' games on ' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate())
        cb && cb();
        return games;
    });
}

function getGamesBetweenDates(start, end, cb) {
    if (start <= end) {
        getGamesForDate(start, () => {
            start.setDate(start.getDate() + 1)
            getGamesBetweenDates(start, end, cb);
        });
    } else {
        cb && cb();
    }
}