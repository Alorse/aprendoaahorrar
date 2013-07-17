/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


/* Inicio plugin twitter */
// agregando comentario 
var oauth;
var requestParams;
var options = {
    consumerKey: '2Ah5X49H7kGn826HkPMAA',
    consumerSecret: 'ZjubutPhVlaNhTCjPe3elOzhI9BEfdCQTK9YsLOl0Gk',
    callbackUrl: 'https://apps.aprendoaahorrar.com/app_mobile/tw/'};
var mentionsId = 0;
var localStoreKey = "tmt5p1";

var ref = null;
var loc = null;

var tw_login2 = function() {
    ref = window.open('https://apps.aprendoaahorrar.com/app_mobile/tw/', '_blank', 'location=yes');
};

function tw_login() {
    checkConnection();
    
    if (connect) {
        tw_connect();
        // Note: Consumer Key/Secret and callback url always the same for this app.        
        ToastS('Obteniendo autorización...');
        oauth = OAuth(options);
        oauth.get('https://api.twitter.com/oauth/request_token',
                function(data) {
                    requestParams = data.text;
                    console.log("AppLaudLog: requestParams: " + data.text);
                    ref = window.open(encodeURI('https://api.twitter.com/oauth/authorize?' + data.text), '_blank', 'location=no');
                    ref.addEventListener('loadstop', function(event) {
                        loc = event.url;
                        //alert('loadstop => ' + event.url); //Linea a comentar
                        if (loc.indexOf("https://apps.aprendoaahorrar.com/app_mobile/tw/?") >= 0) {                            
                            var verifier = '';
                            var params = loc.substr(loc.indexOf('?') + 1);

                            params = params.split('&');
                            for (var i = 0; i < params.length; i++) {
                                var y = params[i].split('=');
                                if (y[0] === 'oauth_verifier') {
                                    verifier = y[1];
                                    tw_connect();
                                }
                            }
                            ref.close();
                        }
                    });
                    ref.addEventListener('loaderror', function(event) {
                        ref.close();
                        console.log('error: ' + event.message);
                    });
                    ref.addEventListener('exit', function(event) {
                        //alert('exit => ' + event.url); //Linea a comentar
                        ref.close();
                        console.log(event.type);
                    });
                    ref.addEventListener('loadstart', function(event) {
                        //alert('loadstart => ' + event.url); //Linea a comentar
                        loc = event.url;
                        if (loc.indexOf("https://apps.aprendoaahorrar.com/app_mobile/tw/?") >= 0) {                            
                            var verifier = '';
                            var params = loc.substr(loc.indexOf('?') + 1);

                            params = params.split('&');
                            for (var i = 0; i < params.length; i++) {
                                var y = params[i].split('=');
                                if (y[0] === 'oauth_verifier') {
                                    verifier = y[1];
                                    tw_connect();
                                }
                            }
                            ref.close();
                        }
                    });
                },
                function(data) {
                    ToastL('Error : No Authorization');
                    console.log("AppLaudLog: 2 Error " + data);
                    ToastS('Error durante la autorización');
                }
        );
    }
}
/* Fin Plugin Twitter */

var tw_connect = function() {

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

    if (loc !== null) {
        spinner.remove();
        console.log("AppLaudLog: onLocationChange : " + loc);
        // If user hit "No, thanks" when asked to authorize access
        if (loc.indexOf("https://apps.aprendoaahorrar.com/app_mobile/tw/?denied") >= 0) {
            ToastS('Usuario negó el acceso');
            ref.close();
            return;
        }

        // Same as above, but user went to app's homepage instead
        // of back to app. Don't close the browser in this case.
        if (loc === "https://apps.aprendoaahorrar.com/app_mobile/tw/") {
            ToastS('Usuario negó el acceso');
            return;
        }

        // The supplied oauth_callback_url for this session is being loaded
        if (loc.indexOf("https://apps.aprendoaahorrar.com/app_mobile/tw/?") >= 0) {
            var verifier = '';
            var params = loc.substr(loc.indexOf('?') + 1);

            params = params.split('&');
            for (var i = 0; i < params.length; i++) {
                var y = params[i].split('=');
                if (y[0] === 'oauth_verifier') {
                    verifier = y[1];
                    ref.close();
                }
            }
            // Exchange request token for access token
            oauth.get('https://api.twitter.com/oauth/access_token?oauth_verifier=' + verifier + '&' + requestParams,
                    function(data) {

                        var accessParams = {};
                        var qvars_tmp = data.text.split('&');
                        for (var i = 0; i < qvars_tmp.length; i++) {
                            var y = qvars_tmp[i].split('=');
                            accessParams[y[0]] = decodeURIComponent(y[1]);
                        }
                        console.log('AppLaudLog: ' + accessParams.oauth_token + ' : ' + accessParams.oauth_token_secret);
                        oauth.setAccessToken([accessParams.oauth_token, accessParams.oauth_token_secret]);

                        // Save access token/key in localStorage
                        var accessData = {};
                        accessData.accessTokenKey = accessParams.oauth_token;
                        accessData.accessTokenSecret = accessParams.oauth_token_secret;
                        console.log("AppLaudLog: Storing token key/secret in localStorage");
                        localStorage.setItem(localStoreKey, JSON.stringify(accessData));

                        oauth.get('https://api.twitter.com/1.1/account/verify_credentials.json?skip_status=true',
                                function(data) {
                                    var entry = JSON.parse(data.text); // contiene los campos que le solicité a TW
                                    $("#username").attr('value', entry.screen_name);
                                    $("#password").attr('value', 'twitterconnect' + entry.screen_name);
                                    get_email(entry.screen_name, 'twitterconnect' + entry.screen_name);
                                    console.log("Login Twitter: Nombre: " + entry.screen_name);

                                },
                                function(data) {
                                    ToastL('Error al obtener las credenciales de usuario');
                                    console.log("Error al obtener las credenciales de usuario: " + data);
                                }
                        );
                        ref.close();
                    },
                    function(data) {
                        ToastL('Error : No Authorization');
                        console.log("AppLaudLog: 1 Error " + data);
                        ToastS('Error during authorization');
                    }
            );
        }
    } // end if
    spinner.remove();
};

function get_email(username, password) {
    checkConnection();
    if (connect) {
        /* Genera el load giratorio mientras se hacen peticiones al servidor. */
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

        var _page = "index.php?mode=get_email";

        $.ajax({
            type: 'GET',
            url: _host + _page,
            data: {
                username: username,
                password: md5(md5(password))
            },
            success: function(data) {
                switch (data.charAt(0)) {
                    case '0':
                        window.localStorage.setItem('twname', username);
                        window.localStorage.setItem('twpass', password);

                        window.location = 'user_register.html';
                        spinner.remove();
                        break;
                    default :
                        $("#email").attr('value', data);
                        getCurrentPosition();
                        login();
                        //spinner.remove();
                        break;
                }
            },
            error: function(data) {
                ToastL('Se ha producido un error en el dispositivo.');
                spinner.remove();
            }
        });
        return false;
    } else {
        ToastL("No hay conexión a internet");
    }
}