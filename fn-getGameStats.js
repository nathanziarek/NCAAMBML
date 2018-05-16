var request = require('request');
var requestAndCache = require('./fn-requestAndCache');

module.exports = function getGameStats(gameId, cb) {
    console.log("Getting game stats for " + gameId)
    requestAndCache('https://stats.api.si.com/v1/ncaab/game_detail?id=' + gameId + '&league=ncaab&box_score=true', (error, response, body) => {
        var data = JSON.parse(body).data;
        if (data.box_scores.length == 0) {
            cb && cb({
                league: false,
                id: gameId
            })
            return;
        }
        if (data.box_scores[0] && data.box_scores[0].team_stats.field_goals == null) {
            cb && cb({
                league: false,
                id: gameId
            })
            return;
        }
        cb && cb(data);
    })
}