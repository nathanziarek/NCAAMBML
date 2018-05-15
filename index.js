var request = require('request');
var Datastore = require('nedb'),
    db = new Datastore({
        filename: 'data-games',
        autoload: true
    });


var startDate = new Date('November 10, 2017');
var endDate = new Date('November 25, 2017');

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
        console.log('...' + games.length + ' games on ' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate());
        games = Array.from(new Set(games))
        saveGames(games, date);
        cb && cb();
    });
}

function saveGames(games, date, cb) {
    games.map((id) => {
        db.find({
            gameId: id
        }, function (err, docs) {
            if (docs.length == 0) {
                db.insert({
                    gameId: id
                });
            }
        });

    })
}

function getGamesBetweenDates(start, end) {
    if (start <= end) {
        getGamesForDate(start, () => {
            start.setDate(start.getDate() + 1);
            var games = getGamesBetweenDates(start, end);
        });
    }
}

function getGameData(id) {
    request('https://stats.api.si.com/v1/ncaab/game_detail?id=' + id + '&league=ncaab&box_score=true', (error, response, body) => {
        var data = JSON.parse(body).data;
        if (data.teams[0].location.type == 'home') {
            var home = JSON.parse(body).data.box_scores[0].team_stats;
            var homeD = data.teams[0];
            var visitor = JSON.parse(body).data.box_scores[1].team_stats;
            var visitorD = data.teams[1];
        } else {
            var home = JSON.parse(body).data.box_scores[1].team_stats;
            var homeD = data.teams[1];
            var visitor = JSON.parse(body).data.box_scores[0].team_stats;
            var visitorD = data.teams[0];
        }
        db.update({
            gameId: id
        }, {
            $set: {
                'location.city': data.venue.city,
                'location.state': data.venue.state.abbreviation,
                'home.name': homeD.title,
                'home.score': homeD.score,
                'home.conference': homeD.conference && homeD.conference.name || '',
                'home.wins': homeD.record.wins,
                'home.losses': homeD.record.losses,
                'home.fgm': home.field_goals.made,
                'home.fga': home.field_goals.attempted,
                'home.3pm': home.three_point_field_goals.made,
                'home.3pa': home.three_point_field_goals.attempted,
                'home.ftm': home.free_throws.made,
                'home.fta': home.free_throws.attempted,
                'home.oreb': home.rebounds.offensive,
                'home.dreb': home.rebounds.defensive,
                'home.treb': home.rebounds.team,
                'home.ast': home.assists,
                'home.blk': home.blocked_shots,
                'home.to': home.turnovers.total,
                'home.pf': home.personal_fouls,
                'home.poss': home.field_goals.made + .475 * home.field_goals.attempted - home.rebounds.offensive + home.turnovers.total,
                'visitor.name': visitorD.title,
                'visitor.conference': visitorD.conference && visitorD.conference.name || '',
                'visitor.wins': visitorD.record.wins,
                'visitor.losses': visitorD.record.losses,
                'visitor.score': visitorD.score,
                'visitor.fgm': visitor.field_goals.made,
                'visitor.fga': visitor.field_goals.attempted,
                'visitor.3pm': visitor.three_point_field_goals.made,
                'visitor.3pa': visitor.three_point_field_goals.attempted,
                'visitor.ftm': visitor.free_throws.made,
                'visitor.fta': visitor.free_throws.attempted,
                'visitor.oreb': visitor.rebounds.offensive,
                'visitor.dreb': visitor.rebounds.defensive,
                'visitor.treb': visitor.rebounds.team,
                'visitor.ast': visitor.assists,
                'visitor.blk': visitor.blocked_shots,
                'visitor.to': visitor.turnovers.total,
                'visitor.pf': visitor.personal_fouls,
                'visitor.poss': visitor.field_goals.made + .475 * visitor.field_goals.attempted - visitor.rebounds.offensive + visitor.turnovers.total

            }
        }, {}, function (err, numReplaced) {});
    });
    /*https://stats.api.si.com/v1/ncaab/game_detail?id=1961094&league=ncaab&box_score=true
data.start.utc,epoch,local
data.venue/city,state.abbreviation,state.name
data.box_scores[0,1].timeouts_remaining,minutes,field_goals,free_throws,ejections,three_point_field_goals,points,rebounds,assists,steals,blocked_shots,turnovers,personal_fouls,disqualifications,technical_fouls
*/
}