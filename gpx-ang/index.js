var log = "",
    coords = [],
    distLast = null,
    timeForNextUtterance = 0,
    running = null;

function getTimestampInMillis() {
    return new Date() / 1.0;
}

var mock_geoloc = (function() {
    var state = {
        coords: {
            latitude: 51.5883916,
            longitude: -0.0288636,
            accuracy: 10,
        },
        timestamp: getTimestampInMillis() /* some time in milliseconds */ ,
    };
    var geoloc = {
        getCurrentPosition: function(success, error, options) {
            success(state);
            var r1 = (Math.random() - 0.5) * 0.0005;
            var r2 = (Math.random() - 0.5) * 0.0005;
            state.timestamp = getTimestampInMillis();
            state.coords.latitude += r1;
            state.coords.longitude += r2;
        },
    };
    return geoloc;
})();

//var geoloc = navigator.geolocation;
var geoloc = mock_geoloc;

// window.addEventListener("load", init);

window.onbeforeunload = function() {
    return "You have attempted to leave this page. Are you sure?";
};

function seekPosition(first) {
    var opti = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0 /* don't use cache */ ,
    };
    geoloc.getCurrentPosition(
        function(position) {
            gotPosition(position);
        },
        function() {
            noGeolocation("Error: The Geolocation service failed.");
        },
        opti
    );
}

function restart() {
    stop();
    log = "";
    coords = [];
    distLast = null;
    timeForNextUtterance = 0;
    start();
}

function start() {
    if (running != null) return;
    document.getElementById("btnStart").disabled = true;
    if (geoloc) {
        seekPosition(true);
        running = setInterval(seekPosition, 5000);
    } else {
        noGeolocation("Error: Your browser doesn't support geolocation.");
    }
}

function stop() {
    if (running != null) clearInterval(running);
    running = null;
    document.getElementById("btnStart").disabled = false;
}

function RoundToDecimalPlaces(number, decimalPlaces) {
    return (
        Math.round(number * Math.pow(10.0, decimalPlaces)) /
        Math.pow(10.0, decimalPlaces)
    );
}

function gotPosition(position) {
    save(position);
}

function noGeolocation(message) {
    // TODO: ...
}

function save(position) {
    var at = position.coords;
    var off = at.accuracy;

    if (off > 50 /* metres */ ) {
        // Not accurate enough
        return;
    }

    var coordsThis = {
        lat: at.latitude,
        long: at.longitude,
        timestamp: position.timestamp,
        accuracy: off
    };

    /*
            timeForNextUtterance = timeDelta + 30;

            var s = RoundToDecimalPlaces(distanceTotal, 2).toString() + " km. ";

            var km_per_second = distanceTotal / timeDelta;
            var mins_per_km = 1.0 / km_per_second / 60.0;
            mins_per_km = RoundToDecimalPlaces(mins_per_km, 1);

            s += "Pace is " + mins_per_km + " minutes per km.";

            var synth = window.speechSynthesis;
            var utterThis = new SpeechSynthesisUtterance(s);
            synth.speak(utterThis);
    */

    coords.push(coordsThis);

    var i1 = coords.length;
    var i0 = Math.max(0, i1 - 5);

    var s = "";
    var bits = coords.slice(i0);
    bits.forEach(
        (bit) => {
            s = s + JSON.stringify(bit) + "\n";
        }
    );

    var ds = distanceSum(coords);
    s = s + JSON.stringify(ds) + "\n";
    var kmPerMilli = ds.distanceKm / ds.timesum_millis;
    var metresPerMinute = (kmPerMilli * 1000) * (60000);

    s = s + metresPerMinute + " metres per minutes\n";

    document.getElementById("log").innerHTML = s;
}

function distanceSum(someCoords) {
    var distance = 0;
    var last, count = 0,
        timesum_millis = 0;
    someCoords.forEach(
        (bit, index) => {
            if (index > 0) {
                distance = distance + getDistance(last, bit);
                timesum_millis += bit.timestamp - last.timestamp;
                count += 1;
            }
            last = bit;
        }
    );
    return { distanceKm: distance, count: count, timesum_millis: timesum_millis };
}

// Get distance in km between (coord1.lat, coord1.long) and coord2.
function getDistance(coord1, coord2) {
    var toRad = function(num) {
        return (num * Math.PI) / 180;
    };

    var lat2 = coord2.lat;
    var lon2 = coord2.long;
    var lat1 = coord1.lat;
    var lon1 = coord1.long;

    var R = 6371; // km
    //has a problem with the .toRad() method below.
    var x1 = lat2 - lat1;
    var dLat = toRad(x1);
    var x2 = lon2 - lon1;
    var dLon = toRad(x2);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;

    return d;
}

function copy() {
    var elem = document.getElementById("copy");
    var arr = Array();
    coords.forEach(
        function(value) {
            arr.push([value.lat, value.long, value.timestamp]);
        });
    elem.value = JSON.stringify(arr);
    elem.focus();
    elem.select();
}