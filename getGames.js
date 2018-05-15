var request = require('request');
var Datastore = require('nedb'),
    db = new Datastore({
        filename: 'data-games',
        autoload: true
    }),
    teams = new Datastore({
        filename: 'data-teams',
        autoload: true
    });

getMissingGameData();

function getMissingGameData() {
    db.find({
        $not: {
            "city": /.+?/
        }
    }).limit(1).exec(function (err, docs) {
        if (docs.length == 1) {
            getGameData(docs[0].gameId);
        } else {
            db.persistence.compactDatafile();
            teams.persistence.compactDatafile();
        }
    });
}

function validateJSON(d) {
    if (d.box_scores.length == 0) {
        return false
    }
    if (d.box_scores[0].team_stats.field_goals == null) {
        return false
    }
    return true;
}

function getGameData(id) {
    console.log("Getting game data for " + id)
    request('https://stats.api.si.com/v1/ncaab/game_detail?id=' + id + '&league=ncaab&box_score=true', (error, response, body) => {
        var data = JSON.parse(body).data;
        if (validateJSON(data)) {
            for (i = 0; i <= 1; i++) {
                teamData = data.teams[i];
                gameData = data.box_scores[i].team_stats
                teams.insert({
                    gameId: id,
                    'date': new Date(data.start.local),
                    'location-type': teamData.location.type,
                    'name': teamData.title,
                    'score': teamData.score,
                    'conference': teamData.conference && teamData.conference.name || '',
                    'wins': teamData.record.wins,
                    'losses': teamData.record.losses,
                    'fgm': gameData.field_goals.made,
                    'fga': gameData.field_goals.attempted,
                    '3pm': gameData.three_point_field_goals.made,
                    '3pa': gameData.three_point_field_goals.attempted,
                    'ftm': gameData.free_throws.made,
                    'fta': gameData.free_throws.attempted,
                    'oreb': gameData.rebounds.offensive,
                    'dreb': gameData.rebounds.defensive,
                    'treb': gameData.rebounds.team,
                    'ast': gameData.assists,
                    'blk': gameData.blocked_shots,
                    'to': gameData.turnovers.total,
                    'pf': gameData.personal_fouls,
                    'poss': gameData.field_goals.made + .475 * gameData.field_goals.attempted - gameData.rebounds.offensive + gameData.turnovers.total,
                });
            }

            db.update({
                gameId: id
            }, {
                $set: {
                    'date': new Date(data.start.local),
                    'city': data.venue && data.venue.city || '',
                    'state': data.venue && (data.venue.state && data.venue.state.abbreviation || ''),
                    'teams': [data.teams[0].title, data.teams[1].title]
                }
            }, {}, function (err, numReplaced) {
                getMissingGameData();
            });
        } else {
            db.remove({
                gameId: id
            }, {
                multi: true
            }, function (err, numRemoved) {
                getMissingGameData();
            });

        }
    });

}