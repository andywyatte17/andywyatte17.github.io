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
        accuracy: off,
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
    bits.forEach((bit) => {
        s = s + JSON.stringify(bit) + "\n";
    });

    var ds = distanceSum(coords);
    s = s + JSON.stringify(ds) + "\n";
    var kmPerMilli = ds.distanceKm / ds.timesum_millis;
    var metresPerMinute = kmPerMilli * 1000 * 60000;

    s = s + metresPerMinute + " metres per minutes\n";

    document.getElementById("log").innerHTML = s;
}

function distanceSum(someCoords) {
    var distance = 0;
    var last,
        count = 0,
        timesum_millis = 0;
    someCoords.forEach((bit, index) => {
        if (index > 0) {
            distance = distance + getDistance(last, bit);
            timesum_millis += bit.timestamp - last.timestamp;
            count += 1;
        }
        last = bit;
    });
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
    coords.forEach(function(value) {
        arr.push([value.lat, value.long, value.timestamp]);
    });
    elem.value = JSON.stringify(arr);
    elem.focus();
    elem.select();
}

function saveContent(fileContents, fileName) {
    var link = document.createElement("a");
    link.download = fileName;
    link.href = "data:" + fileContents;
    link.click();
}

function downloadGpsData() {
    var Base64 = {
        _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
        encode: function(e) {
            var t = "";
            var n, r, i, s, o, u, a;
            var f = 0;
            e = Base64._utf8_encode(e);
            while (f < e.length) {
                n = e.charCodeAt(f++);
                r = e.charCodeAt(f++);
                i = e.charCodeAt(f++);
                s = n >> 2;
                o = ((n & 3) << 4) | (r >> 4);
                u = ((r & 15) << 2) | (i >> 6);
                a = i & 63;
                if (isNaN(r)) {
                    u = a = 64;
                } else if (isNaN(i)) {
                    a = 64;
                }
                t =
                    t +
                    this._keyStr.charAt(s) +
                    this._keyStr.charAt(o) +
                    this._keyStr.charAt(u) +
                    this._keyStr.charAt(a);
            }
            return t;
        },
        decode: function(e) {
            var t = "";
            var n, r, i;
            var s, o, u, a;
            var f = 0;
            e = e.replace(/[^A-Za-z0-9\+\/\=]/g, "");
            while (f < e.length) {
                s = this._keyStr.indexOf(e.charAt(f++));
                o = this._keyStr.indexOf(e.charAt(f++));
                u = this._keyStr.indexOf(e.charAt(f++));
                a = this._keyStr.indexOf(e.charAt(f++));
                n = (s << 2) | (o >> 4);
                r = ((o & 15) << 4) | (u >> 2);
                i = ((u & 3) << 6) | a;
                t = t + String.fromCharCode(n);
                if (u != 64) {
                    t = t + String.fromCharCode(r);
                }
                if (a != 64) {
                    t = t + String.fromCharCode(i);
                }
            }
            t = Base64._utf8_decode(t);
            return t;
        },
        _utf8_encode: function(e) {
            e = e.replace(/\r\n/g, "\n");
            var t = "";
            for (var n = 0; n < e.length; n++) {
                var r = e.charCodeAt(n);
                if (r < 128) {
                    t += String.fromCharCode(r);
                } else if (r > 127 && r < 2048) {
                    t += String.fromCharCode((r >> 6) | 192);
                    t += String.fromCharCode((r & 63) | 128);
                } else {
                    t += String.fromCharCode((r >> 12) | 224);
                    t += String.fromCharCode(((r >> 6) & 63) | 128);
                    t += String.fromCharCode((r & 63) | 128);
                }
            }
            return t;
        },
        _utf8_decode: function(e) {
            var t = "";
            var n = 0;
            var r = (c1 = c2 = 0);
            while (n < e.length) {
                r = e.charCodeAt(n);
                if (r < 128) {
                    t += String.fromCharCode(r);
                    n++;
                } else if (r > 191 && r < 224) {
                    c2 = e.charCodeAt(n + 1);
                    t += String.fromCharCode(((r & 31) << 6) | (c2 & 63));
                    n += 2;
                } else {
                    c2 = e.charCodeAt(n + 1);
                    c3 = e.charCodeAt(n + 2);
                    t += String.fromCharCode(
                        ((r & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)
                    );
                    n += 3;
                }
            }
            return t;
        },
    };
    var arr = Array();
    coords.forEach(function(value) {
        arr.push([value.lat, value.long, value.timestamp]);
    });
    var s = Base64.encode(JSON.stringify(arr));
    saveContent("application/json;base64," + s, "track.gpx");
}