var log = "",
    t_0 = null,
    coords = [],
    distLast = null,
    timeForNextUtterance = 0,
    running = null;

var geoloc = navigator.geolocation;

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
            if (first == true) {
                t_0 = getTimeNow();
            }
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
    t_0 = null;
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
    var at = position.coords,
        off = at.accuracy,
        z;
    save(at, off);
}

function noGeolocation(message) {
    // TODO: ...
}

function getTimeNow() {
    return Math.round(new Date() / 1000);
}

function save(at, off) {
    if (off > 50 /* metres */ ) {
        // Not accurate enough
        return;
    }

    time = getTimeNow();
    if (t_0 == null) {
        t_0 = time;
        return;
    }

    var timeDelta = time - t_0;
    if (timeDelta < 1) {
        return;
    }

    var distNow = 0;
    var coordsThis = {
        lat: at.latitude,
        long: at.longitude,
        timeDelta: timeDelta,
        dist: distNow,
        accuracy: off,
    };

    if (coords.length > 1) {
        distNow = distance(
            coords[coords.length - 1],
            coordsThis
        );
        coordsThis.dist = distNow;

        var distanceTotal = 0;

        if (distLast == null || timeDelta > timeForNextUtterance) {
            timeForNextUtterance = timeDelta + 30;

            var s = RoundToDecimalPlaces(distanceTotal, 2).toString() + " km. ";

            var km_per_second = distanceTotal / timeDelta;
            var mins_per_km = 1.0 / km_per_second / 60.0;
            mins_per_km = RoundToDecimalPlaces(mins_per_km, 1);

            s += "Pace is " + mins_per_km + " minutes per km.";

            var synth = window.speechSynthesis;
            var utterThis = new SpeechSynthesisUtterance(s);
            synth.speak(utterThis);
        }
        distLast = distanceTotal;
    }

    coords.push(coordsThis);

    var i1 = coords.length;
    var i0 = Math.max(0, i1 - 5);

    var s = "";
    var bits = coords.slice(i0);
    for (var i = 0; i < bits.length; i++) {
        s += [
            bits[i].lat,
            bits[i].long,
            bits[i].timeDelta,
            RoundToDecimalPlaces(bits[i].dist, 4),
            RoundToDecimalPlaces(bits[i].accuracy, 1),
        ];
        s += "\n";
    }

    t_0 = time;

    document.getElementById("log").innerHTML = s;
}

// Get distance in km between (coord1.lat, coord1.long) and coord2.
function distance(coord1, coord2) {
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