var request = require('request');

module.exports = function getGameData(date, cb) {
    
    console.log('Getting games for ' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + '...')
    
    var requestUrl = 'https://www.si.com/college-basketball/schedule?date=' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();

    request(requestUrl, function (error, response, body) {

        var gamesRegExArray = body.match(/college\-basketball\/game\/\d+/gi);

        var gamesArray = gamesRegExArray.map(function (d, i) {
            return d.replace('college-basketball/game/', '');
        });

        cb && cb(Array.from(new Set(gamesArray)));

    });
}