module.exports = function saveGameStats(dirtyStats, gamesDs, statsDs, cb) {
    gamesDs.update({
        gameId: dirtyStats.id.toString()
    }, {
        $set: {
            'date': new Date(dirtyStats.start.local),
            'city': dirtyStats.venue && dirtyStats.venue.city || '',
            'state': dirtyStats.venue && (dirtyStats.venue.state && dirtyStats.venue.state.abbreviation || ''),
            'teams': [dirtyStats.teams[0].title, dirtyStats.teams[1].title]
        }
    }, {}, function (err, numReplaced) {
        var toInsert = [];
        for (i = 0; i <= 1; i++) {
            teamData = dirtyStats.teams[i];
            gameData = dirtyStats.box_scores[i].team_stats;

            toInsert.push({
                'gameId': dirtyStats.id.toString(),
                'date': new Date(dirtyStats.start.local),
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
        statsDs.insert(toInsert, function (err) {
            cb && cb()
        });

    });
}