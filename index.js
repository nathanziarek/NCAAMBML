var Datastore = require('nedb'),
    gamesDs = new Datastore({
        filename: 'db-games',
        autoload: true
    }),
    statsDs = new Datastore({
        filename: 'db-stats',
        autoload: true
    });

var getGamesPlayed = require('./fn-getGamesPlayed');
var getGameStats = require('./fn-getGameStats');
var saveGamesPlayed = require('./fn-saveGamesPlayed');
var saveGameStats = require('./fn-saveGameStats');

/* Settings */
var startDate = new Date('October 1, 2014');
var endDate = new Date('April 15, 2018');
/* ******** */

/* Kick Off the Scraping */
getGamesPlayedBetween(startDate, endDate, gatherGameStats);

/* Standalone Functions */
function getGamesPlayedBetween(startDate, endDate, cb) {
    getGamesPlayed(startDate, (array) => {
        saveGamesPlayed(array, gamesDs, () => {
            startDate.setDate(startDate.getDate() + 1);
            if (startDate <= endDate) {
                getGamesPlayedBetween(startDate, endDate, cb);
            } else {
                cb && cb();
            }
        });
    })
}

function gatherGameStats() {
    gamesDs.find({
        $not: {
            "city": /.+?/
        }
    }).limit(1).exec(function (err, docs) {
        if (docs.length == 1) {
            getGameStats(docs[0].gameId, transformAndSaveGameStats);
        } else {
            gamesDs.persistence.compactDatafile();
            statsDs.persistence.compactDatafile();
        }
    });
}

function transformAndSaveGameStats(data) {
    if (data.league) {
        saveGameStats(data, gamesDs, statsDs, gatherGameStats);
    } else {
        gamesDs.remove({
            gameId: data.id
        }, {}, gatherGameStats);
    }
}