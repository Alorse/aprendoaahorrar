$(document).ready(function()
{
    document.addEventListener("deviceready", onDeviceST, true);
});

function onDeviceST() {
    (device.platform === 'Android') ? $('.back').hide() : '';
    
    var username = window.localStorage.getItem("username");
    var f_name = username.split(' ');
    var first_n = (f_name[0].length > 10) ? f_name[0].substring(0, 10) + '.' : f_name[0];
    $('#loadname').html(first_n + '<span class="btn_close"></span>');
    
    document.addEventListener("menubutton", onMenuButtonST, false);
    document.addEventListener("backbutton", onBackbuttonST, false);
    
    $('#stage-data').hide();
    $('#stage-auth').hide();
    $('#tweet_msg').hide();
    $('#page-dialog-confirm').hide();
    $('#page-dialog-tweet').hide();

    // Check for access token key/secret in localStorage
    var storedAccessData, rawData = localStorage.getItem(localStoreKey);
    if (rawData !== null) {
        storedAccessData = JSON.parse(rawData);
        options.accessTokenKey = storedAccessData.accessTokenKey;
        options.accessTokenSecret = storedAccessData.accessTokenSecret;

        console.log("AppLaudLog: Attemping oauth with stored token key/secret");
        oauth = OAuth(options);
        oauth.get('https://api.twitter.com/1.1/account/verify_credentials.json?skip_status=true',
                function(data) {
                    var entry = JSON.parse(data.text);
                    console.log("AppLaudLog: Success getting credentials. screen_name: " + entry.screen_name);

                    //$('#confirm-user').live('click', function() {
                    $('#confirm-user').click(function() {
                        $('#oauthStatus').html('<span style="color:green;">Conectado!</span>');
                        $('#userInfo').html('<br /><p>Usuario de Twitter: <strong>' + entry.screen_name + '</strong></>');
                                             set_tweet();
                                             $('#friends').hide();
                        //$('#stage-data').show();
                        //$('#page-dialog-confirm').show();
                        $.mobile.changePage($('#register'), {reverse: true, changeHash: false});

                        return false;
                    });
                    //$('#cancel-user').live('click', function() {
                    $('#cancel-user').click(function() {
                        $('#cancel').trigger('click');
                        $('#page-dialog-confirm').hide();
                        $.mobile.changePage($('#register'), {reverse: true, changeHash: false});

                        return false;
                    });

                    var confirm = '<p>Soy <strong>' + entry.screen_name + '</strong> y quiero continuar con este usuario.<br />';
                    confirm += '<p>Cancelar para conectarse con un usuario diferente.</p>';
                    $('#page-dialog-confirm').show();
                    $('#dialog-confirm-text').html(confirm);
                    $('#stage-reading-local-store').hide();
                  set_tweet();
                  $('#friends').hide();
                    $.mobile.changePage($('#page-dialog-confirm'), {role: 'dialog', changeHash: false});
                },
                function(data) {
                    ToastL('Error with stored user data. Re-start authorization.');
                    options.accessTokenKey = '';
                    options.accessTokenSecret = '';
                    localStorage.removeItem(localStoreKey);
                    $('#stage-reading-local-store').hide();
                    $('#stage-auth').show();
                    console.log("AppLaudLog: No Authorization from localStorage data");
                }
        );
    } else {
        console.log("AppLaudLog: No localStorage data");
        $('#stage-reading-local-store').hide();
        $('#stage-auth').show();
    }

    function textCount() {
        var remaining = 140 - $('#tweettextarea').val().length;
        var color = (remaining < 0) ? 'red' : 'green';
        $('#textcount').html('<span style="color:' + color + ';">' + remaining + '</span> caracteres. Invitación para :');
    }
    textCount();
    $('#tweettextarea').change(textCount);
    $('#tweettextarea').keyup(textCount);

    $('#startbutton').click(function() {
        tw_connect();

        // Note: Consumer Key/Secret and callback url always the same for this app.        
        $('#oauthStatus').html('<span style="color:blue;">Obteniendo autorización...</span>');
        oauth = OAuth(options);
        oauth.get('https://api.twitter.com/oauth/request_token',
                function(data) {
                    requestParams = data.text;
                    console.log("AppLaudLog: requestParams: " + data.text);
                    ref = window.open(encodeURI('https://api.twitter.com/oauth/authorize?' + data.text), '_blank', 'location=no');
                    ref.addEventListener('loadstop', function(event) {
                        loc = event.url;
                        if (loc.indexOf("https://apps.aprendoaahorrar.com/app_mobile/tw/?") >= 0) {
                            var verifier = '';
                            var params = loc.substr(loc.indexOf('?') + 1);

                            params = params.split('&');
                            for (var i = 0; i < params.length; i++) {
                                var y = params[i].split('=');
                                if (y[0] === 'oauth_verifier') {
                                    verifier = y[1];
                                    ref.close();
                                    tw_connect();
                                }
                            }
                        }
                    });
                    ref.addEventListener('loaderror', function(event) {
                        console.log('error: ' + event.message);
                    });
                    ref.addEventListener('exit', function(event) {
                        console.log(event.type);

                    });
                    ref.addEventListener('loadstart', function(event) {
                        loc = event.url;
                        if (loc.indexOf("https://apps.aprendoaahorrar.com/app_mobile/tw/?") >= 0) {
                            var verifier = '';
                            var params = loc.substr(loc.indexOf('?') + 1);

                            params = params.split('&');
                            for (var i = 0; i < params.length; i++) {
                                var y = params[i].split('=');
                                if (y[0] === 'oauth_verifier') {
                                    verifier = y[1];
                                    ref.close();
                                    tw_connect();
                                }
                            }
                        }
                    });
                },
                function(data) {
                    ToastL('Error : No Authorization');
                    console.log("AppLaudLog: 2 Error " + data);
                    $('#oauthStatus').html('<span style="color:red;">Error during authorization</span>');
                }
        );
        mentionsId = 0;
    });

    $('#cancel').click(function() {
        $('#oauthStatus').html('<span style="color:red;">Acceso cancelado</span>');
        $('#userInfo').empty();
        $('#twitterdata').empty();
        $('#stage-auth').show();
        $('#stage-data').hide();
        localStorage.removeItem(localStoreKey);
        options.accessTokenKey = '';
        options.accessTokenSecret = '';
        oauth.post('http://api.twitter.com/1.1/account/end_session.json',
                {}, function(data) {
            console.log("AppLaudLog: User ended session");
        }, function(data) {
            console.log("AppLaudLog: Error: End session");
        });
    });

    $('#homeTimeline').click(function() {
        oauth.get('https://api.twitter.com/1.1/statuses/home_timeline.json?count=10',
                function(data) {
                    var entries = JSON.parse(data.text);
                    var count = entries.length;
                    var data_html = '<h4>Home Timeline: 1 of ' + count + ' entries</h4>';
                    data_html += '<script type="text/javascript" charset="utf-8" src="js/api/tw/main.js"></script>';

                    if (count >= 0) {
                        for (var i = 0; i < 1; i++) {
                            console.log("AppLaudLog: count: " + count);
                            data_html = data_html.concat('<div><img src="'
                                    + entries[i].user.profile_image_url + '">'
                                    + entries[i].user.name + '</div>');
                            data_html = data_html.concat('<p>' + entries[i].text + '<br>'
                                    + entries[i].created_at + '</p>');
                        }
                    }
                    $('#twitterdata').prepend(data_html);
                },
                function(data) {
                    ToastL('Error getting home timeline');
                    console.log("AppLaudLog: Error " + data);
                    $('#oauthStatus').html('<span style="color:red;">Error getting home timeline</span>');
                }
        );
    });

    $('#friends').click(function() {
        $('#twitterdata').show();
        $('#tweet_msg').hide();
                        set_tweet();
        //get_followers(-1);
    });




    $('#mentions').click(function() {
        var mentionsParams = (mentionsId === 0) ? '' : ('?since_id=' + mentionsId);
        oauth.get('https://api.twitter.com/1.1/statuses/mentions.json' + mentionsParams,
                function(data) {
                    var entries = JSON.parse(data.text);
                    var count = entries.length;
                    var data_html = '<h4>Mentions: 1 of ' + count + ' entries</h4>';

                    if (count > 0) {
                        // Use count value to display all mentions
                        // for (var i = 0; i < count; i++) {
                        for (var i = 0; i < 1; i++) {
                            console.log("AppLaudLog: count : " + count);
                            data_html = data_html.concat('<div><img src="'
                                    + entries[i].user.profile_image_url + '">'
                                    + entries[i].user.name + '</div>');
                            data_html = data_html.concat('<p>' + entries[i].text + '<br>'
                                    + entries[i].created_at + '</p>');
                        }
                        mentionsId = entries[i - 1].id;
                        console.log("AppLaudLog: mentionsId : " + mentionsId);
                    }
                    $('#twitterdata').prepend(data_html);
                },
                function(data) {
                    ToastL('Error getting mentions.');
                    console.log("AppLaudLog: Error " + data);
                    $('#oauthStatus').html('<span style="color:red;">Error getting mentions</span>');
                }
        );
    });

    $('#back').click(function() {
        window.location = 'goal_view.html';
    });

    $('#tweet').click(function() {

    });

    $('#networkbutton').click(function() {
        checkConnection();
    });
}

var tw_connect = function() {

    if (loc !== null) {
        console.log("AppLaudLog: onLocationChange : " + loc);

        // If user hit "No, thanks" when asked to authorize access
        if (loc.indexOf("https://apps.aprendoaahorrar.com/app_mobile/tw/?denied") >= 0) {
            $('#oauthStatus').html('<span style="color:red;">Acceso cancelado</span>');
            ref.close();
            return;
        }

        // Same as above, but user went to app's homepage instead
        // of back to app. Don't close the browser in this case.
        if (loc === "https://apps.aprendoaahorrar.com/app_mobile/tw/") {
            $('#oauthStatus').html('<span style="color:red;">Acceso cancelado</span>');
            return;
        }

        // The supplied oauth_callback_url for this session is being loaded
        if (loc.indexOf("https://apps.aprendoaahorrar.com/app_mobile/tw/?") >= 0) {
            var index, verifier = '';
            var params = loc.substr(loc.indexOf('?') + 1);

            params = params.split('&');
            for (var i = 0; i < params.length; i++) {
                var y = params[i].split('=');
                if (y[0] === 'oauth_verifier') {
                    verifier = y[1];
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
                        $('#page-dialog-confirm').hide();
                        $('#oauthStatus').html('<span style="color:green;">Conectado!</span>');
                        $('#stage-auth').hide();
                        $('#stage-data').show();
                        oauth.setAccessToken([accessParams.oauth_token, accessParams.oauth_token_secret]);

                        // Save access token/key in localStorage
                        var accessData = {};
                        accessData.accessTokenKey = accessParams.oauth_token;
                        accessData.accessTokenSecret = accessParams.oauth_token_secret;
                        console.log("AppLaudLog: Storing token key/secret in localStorage");
                        localStorage.setItem(localStoreKey, JSON.stringify(accessData));

                        oauth.get('https://api.twitter.com/1.1/account/verify_credentials.json?skip_status=true',
                                function(data) {
                                    var entry = JSON.parse(data.text);
                                    $('#userInfo').html('Usuario de Twitter: <strong>' + entry.screen_name + '</strong>');
                                    console.log("AppLaudLog: screen_name: " + entry.screen_name);
                                },
                                function(data) {
                                    ToastL('Error getting user credentials');
                                    console.log("AppLaudLog: Error " + data);
                                    $('#oauthStatus').html('<span style="color:red;">Error al obtener las credenciales de usuario.</span>');
                                }
                        );
                        ref.close();
                    },
                    function(data) {
                        ToastL('Error : No Authorization');
                        console.log("AppLaudLog: 1 Error " + data);
                        $('#oauthStatus').html('<span style="color:red;">Error durante la autorización</span>');
                    }
            );
        }
    }
}; // end if

function get_followers(cursor) {
    oauth.get('https://api.twitter.com/1.1/friends/list.json?cursor=' + cursor + '&skip_status=true&include_user_entities=false',
            function(data) {
                var entries = JSON.parse(data.text);
                var count = entries.users.length;
                var data_html = '';

                if (count >= 0) {
                    data_html += '<ul>';
                    for (var i = 0; i < count; i++) {
                        data_html += '<li style="text-align:center" onclick="set_tweet(\'@' + entries.users[i].screen_name + '\');"><img src="' + entries.users[i].profile_image_url + '"><br />@' + entries.users[i].screen_name + '</li>';
                    }
                    data_html += '</ul>';
                    if (count === -1 || entries.previous_cursor !== 0) {
                        data_html += "<button onclick='get_followers(" + entries.previous_cursor + ")'>Anterior</button>";
                    }
                    if (entries.next_cursor !== 0) {
                        data_html += "<button onclick='get_followers(" + entries.next_cursor + ")'>Siguiente</button>";
                    }
                }
                $('#twitterdata').html(data_html);
                $('#friends').hide();
            },
            function(data) {
                ToastL('Error obteniendo listado de amigos');
                console.log("AppLaudLog: Error " + data);
                $('#oauthStatus').html('<span style="color:red;">Error obteniendo amigos.</span>');
            }
    );
}

function set_tweet(fried) {
    $('#twitterdata').hide();
    $('#tweet_msg').show();

    var text = '';
    if (window.localStorage.getItem("menu") === "save") {
        text = fried + ' ';
        text += 'compartamos mi ahorro en "Aprendo a ahorrar"\n';
        text += 'ID ahorro: ' + window.localStorage.getItem("id_go") + '\n\n';
        text += 'Android http://goo.gl/npLIn \n';
        text += 'iOS http://goo.gl/5Rmwq';
    } else {
        text = fried + ',\n';
        text += 'Conoce la app móvil de aprendeaahorrar.com\n\n';
        text += 'App Android http://goo.gl/npLIn\n';
        text += 'App iOS http://goo.gl/5Rmwq';
    }
    $('#tweettextarea').val(text);
}


function set_tweet() {
    $('#twitterdata').hide();
    $('#tweet_msg').show();
    
    var text = '';
    if (window.localStorage.getItem("menu") === "save") {
        text += 'Mira mi ahorro en "Aprendo a ahorrar"\n';
        text += 'Android http://goo.gl/npLIn \n';
        text += 'iOS http://goo.gl/5Rmwq';
    } else {
        text += 'Conoce la app móvil de aprendeaahorrar.com\n\n';
        text += 'App Android http://goo.gl/npLIn\n';
        text += 'App iOS http://goo.gl/5Rmwq';
    }
    $('#tweettextarea').val(text);
}

function tweet() {
    $('#stage-data').hide();
    $('#stage-auth').hide();
    $('#tweet_msg').hide();
    $('#page-dialog-tweet').show();
    if ($('#tweettextarea').val().length === 0) {
        ToastL('You must enter text before tweeting.');
        return false;
    }
    var theTweet = $('#tweettextarea').val();
    $('#confirm-tweet').click(function() {
        //ToastL("entra");
        oauth.post('https://api.twitter.com/1.1/statuses/update.json',
                {'status': theTweet, // jsOAuth encodes for us
                    'trim_user': 'true'
                },
        function(data) {
            var entry = JSON.parse(data.text);
            var data_html = '<h4>Tu Tweet:</h4>';

            console.log("AppLaudLog: Tweet id: " + entry.id_str + " text: " + entry.text);
            data_html = data_html.concat('<p>Id: ' + entry.id_str + '<br>Texto: ' + entry.text + '</p>');
            $('#twitterdata').prepend(data_html);
            $('#tweettextarea').empty();
            if (window.localStorage.getItem("menu") === "save") {
                window.location = 'goal_view.html';
            } else {
                window.location = 'goal_list.html';
            }
        },
                function(data) {
                    ToastL('Error Tweeteando.');
                    console.log("AppLaudLog: Error during tweet " + data.text);
                    $('#oauthStatus').html('<span style="color:red;">Error</span>');
                    $.mobile.changePage($('#register'), {reverse: true, changeHash: false});
                }
        );
    });
    $('#cancel-tweet').click(function() {
        console.log("AppLaudLog: tweet cancelled by user");
        window.location = 'goal_view.html';
    });

    $('#dialog-tweet-text').html('Tu tweet:<br /><ul><li style="color: #000;">' + theTweet + '</li></ul>');
    $.mobile.changePage($('#page-dialog-tweet'), {role: 'dialog', changeHash: false});
}

var onBackbuttonST = function() {
    go_back();
};

var onMenuButtonST = function() {
    ToastS('Compartir twitter');
};


var go_back = function(){
    if(window.localStorage.getItem("menu") === "save"){
        window.location = 'goal_view.html';
    } else {
        window.location = 'goal_list.html';
    }
};