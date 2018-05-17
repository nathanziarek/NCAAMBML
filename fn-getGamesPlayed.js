var requestAndCache = require('./fn-requestAndCache');

module.exports = function getGameData(date, cb) {

    console.log('Getting games for ' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + '...')

    var requestUrl = 'https://www.si.com/college-basketball/schedule?date=' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();

    requestAndCache(requestUrl, function (error, response, body) {

        var gamesRegExArray = body.match(/college\-basketball\/game\/\d+/gi);

        if (gamesRegExArray) {
            var gamesArray = gamesRegExArray.map(function (d, i) {
                return d.replace('college-basketball/game/', '');
            });

            cb && cb(Array.from(new Set(gamesArray)));
        } else {
            cb && cb(false)
        }

    }, true);
}