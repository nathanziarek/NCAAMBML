module.exports = function saveGamesPlayed(gamesArray, datastore, cb) {

    var gamesInsert = gamesArray.map((id) => {
        return {
            'gameId': id.toString()
        }
    });

    findAndAdd();

    function findAndAdd() {
        if (gamesInsert.length == 0) {
            datastore.persistence.compactDatafile();
            cb && cb();
            return;
        }
        var d = gamesInsert.pop();
        datastore.find(d, function (err, docs) {
            if (docs.length == 0) {
                datastore.insert(d);
            }
            findAndAdd();
        });
    }

    /*db.insert([{ a: 5 }, { a: 42 }], function (err, newDocs) {
      // Two documents were inserted in the database
      // newDocs is an array with these documents, augmented with their _id
    });*/

    /*console.log(gamesArray);

    gamesArray.map((id) => {
        datastore.find({
            gameId: id
        }, function (err, docs) {
            if (docs.length == 0) {
                datastore.insert({
                    gameId: id
                }, function () {
                    cb && cb(true);
                });
            } else {
                cb && cb(false)
            }
        });
    })*/
}