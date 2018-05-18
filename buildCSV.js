var Datastore = require('nedb'),
	gameData = new Datastore({
		filename: 'db-games',
		autoload: true
	}),
	statsData = new Datastore({
		filename: 'db-stats',
		autoload: true
	});

var stringify = require('csv-stringify');
var fs = require('fs-extra');
var csvWriter = fs.createWriteStream('fileForML-try2.csv', {
	flags: 'a' // 'a' means appending (old data will be preserved)
});
csvWriter.write(
	[
		'home_score',
		'home_wins',
		'home_losses',
		'home_fgm',
		'home_fga',
		'home_3pm',
		'home_3pa',
		'home_ftm',
		'home_fta',
		'home_oreb',
		'home_dreb',
		'home_treb',
		'home_ast',
		'home_blk',
		'home_to',
		'home_pf',
		'home_poss',
		'away_score',
		'away_wins',
		'away_losses',
		'away_fgm',
		'away_fga',
		'away_3pm',
		'away_3pa',
		'away_ftm',
		'away_fta',
		'away_oreb',
		'away_dreb',
		'away_treb',
		'away_ast',
		'away_blk',
		'away_to',
		'away_pf',
		'away_poss',
		'winner'
	].toString() + '\n'
); // append string to your file

/* 1. Get all the games */
console.log('Getting all of the games');
gameData.find(
	{
		//gameId: '1733628' //California Golden Bears vs Oregon State Beavers
		//date: {
		//    $lt: new Date('11/20/2016')
		//}
	},
	(err, listOfGames) => {
		listOfGames.map(gameHighLevel => {
			/* 2. For each game, get the 'home' team stats to-date */
			console.log(
				'Getting home stats for ' + getTeamNameByLoc(gameHighLevel, 'home')
			);
			var csvResult = [];
			statsData.find(
				{
					name: getTeamNameByLoc(gameHighLevel, 'home'),
					date: {
						$lt: gameHighLevel.date,
						$gt: findSeasonStart(gameHighLevel.date)
					}
				},
				(err, homeTeamData) => {
					if (homeTeamData.length == 0) {
						return;
					}

					/* 3. For each game, get the 'away' team stats todate */
					console.log(
						'Getting away stats for ' + getTeamNameByLoc(gameHighLevel, 'away')
					);
					var homeTeamProcessed = teamGamesToAverages(homeTeamData);
					statsData.find(
						{
							name: getTeamNameByLoc(gameHighLevel, 'away'),
							date: {
								$lt: gameHighLevel.date,
								$gt: findSeasonStart(gameHighLevel.date)
							}
						},
						(err, awayTeamData) => {
							if (awayTeamData.length == 0) {
								return;
							}
							var awayTeamProcessed = teamGamesToAverages(awayTeamData);

							/* 4. Build final array and write to CSV */
							console.log(
								'Writing ' +
									getTeamNameByLoc(gameHighLevel, 'home') +
									' vs ' +
									getTeamNameByLoc(gameHighLevel, 'away')
							);
							var finalArray = homeTeamProcessed.concat(awayTeamProcessed);
							finalArray.push(
								gameHighLevel.teams[0].score > gameHighLevel.teams[1].score
									? gameHighLevel.teams[0].location
									: gameHighLevel.teams[1].location
							);
							csvWriter.write(finalArray.toString() + '\n'); // append string to your file
						}
					);
				}
			);
		});
	}
);

function teamGamesToAverages(arrays) {
	var whatToDo = {
		score: average,
		wins: max,
		losses: max,
		fgm: average,
		fga: average,
		'3pm': average,
		'3pa': average,
		ftm: average,
		fta: average,
		oreb: average,
		dreb: average,
		treb: average,
		ast: average,
		blk: average,
		to: average,
		pf: average,
		poss: average
	};
	var newArray = [];
	arrays.map(function(array) {
		for (key in array) {
			if (!newArray[key]) {
				newArray[key] = [];
			}
			newArray[key].push(array[key]);
		}
	});
	var returnArray = [];
	for (key in whatToDo) {
		returnArray.push(whatToDo[key](newArray[key]));
	}
	return returnArray;
}

function average(array) {
	var sum = 0;
	for (var i = 0; i < array.length; i++) {
		sum = sum + array[i];
	}
	return Math.round(sum / array.length);
}

function max(array) {
	var max = 0;
	for (var i = 0; i < array.length; i++) {
		max = Math.max(max, array[i]);
	}
	return max;
}

function getTeamNameByLoc(gameData, location) {
	for (i = 0; i < 2; i++) {
		if (gameData.teams[i].location == location) {
			return gameData.teams[i].name;
		}
	}
}

function findSeasonStart(date) {
	var thisMonth = date.getMonth() + 1;
	var thisYear = date.getFullYear();
	if (thisMonth < 10) {
		thisYear--;
	}
	return new Date('October 1, ' + thisYear);
}
