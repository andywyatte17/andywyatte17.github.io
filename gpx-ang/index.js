var log = "",
    coords = [],
    distLast = null,
    timeForNextUtteranceInMilliseconds = 0,
    running = null,
    saveCounter = 1;

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

var geoloc = navigator.geolocation;
//var geoloc = mock_geoloc;

window.addEventListener("load", init);

window.onbeforeunload = function() {
    return "You have attempted to leave this page. Are you sure?";
};

function init() {
    if (geoloc == mock_geoloc) {
        document.getElementById("heading_log").innerText = "Log (mock)";
    } else {
        document.getElementById("heading_log").innerText = "Log (real)";
    }
}

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
    timeForNextUtteranceInMilliseconds = 0;
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

    utter();
}

function utter() {
    var after = coords.length - 5;
    var dist = 0,
        millisCount = 0;
    coords.forEach(
        function(value, index) {
            if (index >= after && index > 0) {
                millisCount = millisCount + value.timestamp - coords[index - 1].timestamp;
                dist = dist + getDistance(coords[index - 1], value);
            }
        }
    );

    if (millisCount > 0 && getTimestampInMillis() > timeForNextUtteranceInMilliseconds) {
        var km_per_second = dist / (millisCount / 1000.0);
        var mins_per_km = 1.0 / km_per_second / 60.0;
        mins_per_km = RoundToDecimalPlaces(mins_per_km, 1);

        var s = mins_per_km + " minutes per km.";

        var synth = window.speechSynthesis;
        var utterThis = new SpeechSynthesisUtterance(s);
        synth.speak(utterThis);

        timeForNextUtteranceInMilliseconds = getTimestampInMillis() + 30 * 1000;
    }
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

function saveContent(fileContents, fileName) {
    var link = document.createElement("a");
    link.download = fileName;
    link.href = "data:" + fileContents;
    link.text = fileName;
    var linkParent = document.getElementById("link");
    while (linkParent.firstChild) {
        linkParent.removeChild(linkParent.lastChild);
    }
    linkParent.appendChild(link);
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

    var start = `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
<gpx xmlns="http://www.topografix.com/GPX/1/1" xmlns:gpxx="http://www.garmin.com/xmlschemas/GpxExtensions/v3" xmlns:gpxtpx="http://www.garmin.com/xmlschemas/TrackPointExtension/v1" creator="Oregon 400t" version="1.1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd http://www.garmin.com/xmlschemas/GpxExtensions/v3 http://www.garmin.com/xmlschemas/GpxExtensionsv3.xsd http://www.garmin.com/xmlschemas/TrackPointExtension/v1 http://www.garmin.com/xmlschemas/TrackPointExtensionv1.xsd">
  <metadata>
    <link href="http://www.garmin.com">
      <text>Garmin International</text>
    </link>
    <time>2009-10-17T22:58:43Z</time>
  </metadata>
  <trk>
    <name>Example GPX Document</name>
    <trkseg>`;

    /*
              <trkpt lat="47.644548" lon="-122.326897">
                <ele>4.46</ele>
                <time>2009-10-17T18:37:26Z</time>
              </trkpt>
        */
    var end = `
    </trkseg>
  </trk>
</gpx>`;

    var s = start;
    coords.forEach(function(value) {
        s =
            s +
            "\n" +
            '      <trkpt lat="' +
            value.lat +
            '" lon="' +
            value.long +
            '">';
        s = s + "\n" + "      </trkpt>";
    });
    s = s + end;

    var s = Base64.encode(s);
    saveContent("application/xml;base64," + s, "gps-trace-" + saveCounter + ".xml");
    saveCounter = saveCounter + 1;
}