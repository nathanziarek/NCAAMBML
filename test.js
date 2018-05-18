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

getGamesPlayed(new Date('2017-11-19T02:30:00.000Z'), games => {
	console.log('getGamesPlayed', games.length == 276);
});

var saveGamesPlayed = require('./fn-saveGamesPlayed');

saveGamesPlayed([123], gamesDs, res => {
	console.log('saveGamesPlayed', res == false);
});

var getGameStats = require('./fn-getGameStats');

getGameStats('1972776', data => {
	console.log('getGameStats', data.id == 1972776);
});
