module.exports = function saveGamesPlayed(gamesArray, datastore, cb) {
	if (!gamesArray) {
		cb && cb();
		return;
	}

	var gamesInsert = gamesArray.map(id => {
		return {
			gameId: id.toString()
		};
	});

	findAndAdd();

	function findAndAdd() {
		if (gamesInsert.length == 0) {
			datastore.persistence.compactDatafile();
			cb && cb();
			return;
		}
		var d = gamesInsert.pop();
		datastore.find(d, function(err, docs) {
			if (docs.length == 0) {
				datastore.insert(d);
			}
			findAndAdd();
		});
	}
};
