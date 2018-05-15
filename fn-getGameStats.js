var request = require('request');

module.exports = function getGameStats(gameId, cb) {
    console.log("Getting game stats for " + gameId)
    request('https://stats.api.si.com/v1/ncaab/game_detail?id=' + gameId + '&league=ncaab&box_score=true', (error, response, body) => {
        var data = JSON.parse(body).data;
        if (data.box_scores.length == 0) {
            data = {
                league: false,
                id: gameId
            }
        }
        if (data.box_scores[0].team_stats.field_goals == null) {
            data = {
                league: false,
                id: gameId
            }
        }
        cb && cb(data);
    })
}