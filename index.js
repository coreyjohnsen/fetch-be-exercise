const express = require('express');
const app = express();

var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./storage');

const PORT = 8000;

app.use(express.json());

// helper function to insert points into the local storage array in sorted order based on timestamp
function insertPoints(arr, newPoints) {
    for (let i in arr) {
        if (newPoints.timestamp < arr[i].timestamp) { // check if timestamp to insert is less than current index
            arr.splice(i, 0, newPoints); // insert transaction
            return;
        }
    }
    arr.push(newPoints); // if not yet inserted, add transaction to the end of the array
    return;
}

// helper function to remove a given number of points from balance, removing from older points first
// assumes the total points in pointsArr is >= points to remove
function removePoints(pointsArr, remove) {
    var spent = {}; // tracks where points were removed from
    removed = 0; // tracks how many points have been removed so far

    for (let i in pointsArr) {
        var r = Math.min(pointsArr[i].points, remove - removed); // calculate points to remove from transaction
        removed += r;
        pointsArr[i].points -= r; // remove points from transaction

        // if points were removed, add the points removed to spent
        if (r != 0) {
            if (pointsArr[i].payer in spent) spent[pointsArr[i].payer] -= r
            else spent[pointsArr[i].payer] = -r
        }

        // stop if all points to be removed were removed
        if (removed >= remove) break;
    }

    // formats the removed points into expected endpoint output format
    var ret = [];
    for (let key in spent) {
        ret.push({
            "payer": key,
            "points": spent[key]
        });
    }

    return ret;
}

// helper method to get the total points available from each payer
function getPointsBal(pointsArr) {
    var ret = {};
    for (let o of pointsArr) {
        if (o.payer in ret) ret[o.payer] += o.points;
        else ret[o.payer] = o.points;
    }
    return ret;
}

app.get('/', (req, res) => {
    res.send('Up and running')
});

// adds points to the profile
app.post('/add', (req, res) => {
    // get request parameters and validate
    var payer = req.body.payer;
    var points = req.body.points;
    var timestamp = Date.parse(req.body.timestamp);
    if (!payer || !points || !timestamp) {
        res.status(400).send("Request body invalid");
        return;
    }

    // get data from local storage
    var pointsData = JSON.parse(localStorage.getItem('points')) || [];
    var totalPoints = JSON.parse(localStorage.getItem('total')) || 0;

    // insert points
    insertPoints(pointsData, {
        payer: payer,
        points: points,
        timestamp: timestamp
    });

    // update values in local storage
    localStorage.setItem('points', JSON.stringify(pointsData));
    totalPoints += points;
    localStorage.setItem('total', JSON.stringify(totalPoints));
    res.sendStatus(200);
    return;
});

// spends points from the profile
app.post('/spend', (req, res) => {
    // get request parameters and validate
    var points = req.body.points;
    if (!points) {
        res.status(400).send("Request body invalid");
        return;
    }

    // get data from local storage and check if user has enough points
    var pointsData = JSON.parse(localStorage.getItem('points')) || [];
    var totalPoints = JSON.parse(localStorage.getItem('total')) || 0;
    if (totalPoints < points) {
        res.status(400).send('Not enough points available')
        return;
    }

    // remove points and update local storage
    var ret = removePoints(pointsData, points);
    localStorage.setItem('points', JSON.stringify(pointsData));
    totalPoints -= points;
    localStorage.setItem('total', JSON.stringify(totalPoints));
    res.status(200).send(ret);
    return;
});

// gets points balance of profile
app.get('/balance', (req, res) => {
    var pointsData = JSON.parse(localStorage.getItem('points')) || [];
    res.status(200).send(getPointsBal(pointsData));
});

// start server on specified port
app.listen(PORT, () => console.log(`Server started, listening on port ${PORT}...\nUse Ctrl+C to stop`));