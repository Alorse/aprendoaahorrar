/* Copyright (c) 2012 Mobile Developer Solutions. All rights reserved.
 * This software is available under the MIT License:
 * The MIT License
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software 
 * and associated documentation files (the "Software"), to deal in the Software without restriction, 
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, 
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software 
 * is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies 
 * or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR 
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE 
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, 
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// api-geolocation


var getCurrentPosition = function() {
    if (watchID === null)
        toggleWatchPosition();
    var spinner = Spinners.create('#spinner', {
        radius: 25,
        height: 10,
        width: 4,
        dashes: 30,
        opacity: 1,
        padding: 3,
        rotation: 900,
        color: '#3B5998'
    }).play();
    spinner.center();

    var success = function(pos) {
        $.getJSON('http://maps.googleapis.com/maps/api/geocode/json?latlng=' + pos.coords.latitude + ',' + pos.coords.longitude, {
            sensor: false
        }, function(result) {
            $('#country').attr('value', getCountry(result));
            save_register();
        });
    };
    var fail = function(error) {
        $("#invalid_reg").html("Error obteniendo geolocalización: " + error.code);
        console.log("Error obteniendo geolocalización: code=" + error.code + " message=" + error.message);
        window.localStorage.clear();
        alert('Por favor enciende el GPS.');
        $("#invalid_reg").show().html('<span style="color: red;">Por favor enciende el GPS.</span>');
        spinner.remove();
    };

    navigator.geolocation.getCurrentPosition(success, fail);
};

// api-geolocation Watch Position
var watchID = null;
function clearWatch() {
    if (watchID !== null) {
        navigator.geolocation.clearWatch(watchID);
        watchID = null;
    }
}
var wsuccess = function(pos) {
    console.log(pos + "entra");
};
var wfail = function(error) {
    console.log("Error obteniendo geolocalización: code=" + error.code + " message=" + error.message);
    
    var spinner = Spinners.create('#spinner', {
        radius: 25,
        height: 10,
        width: 4,
        dashes: 30,
        opacity: 1,
        padding: 3,
        rotation: 900,
        color: '#3B5998'
    }).play();
    spinner.center();
    window.localStorage.clear();
    ToastL('Por favor enciende el GPS.');
    spinner.remove();
};
var toggleWatchPosition = function() {

    ToastL("Geolocalizando . . .");
    console.log("Ver geolocalización . . .");
    var options = {frequency: 3000, maximumAge: 5000, timeout: 5000, enableHighAccuracy: true};
    watchID = navigator.geolocation.watchPosition(wsuccess, wfail, options);
};
