/* Inicio Plugin Facebook */

var FBAppID = "132999350226685"; //Sura
//var FBAppID = "451133711628211"; //mio
//var FBAppID = 	123070624561617 //Julián


if ((typeof cordova == 'undefined') && (typeof Cordova == 'undefined'))
    ToastL('Cordova variable does not exist. Check that you have included cordova.js correctly');
if (typeof CDV == 'undefined')
    ToastL('CDV variable does not exist. Check that you have included cdv-plugin-fb-connect.js correctly');
if (typeof FB == 'undefined')
    ToastL('FB variable does not exist. Check that you have included the Facebook JS SDK file.');

FB.Event.subscribe('auth.login', function(response) {
    //ToastS('login FB');
});

FB.Event.subscribe('auth.logout', function(response) {
    //ToastS('auth.logout event');
});

FB.Event.subscribe('auth.sessionChange', function(response) {
    //ToastS('auth.sessionChange event');
});

FB.Event.subscribe('auth.statusChange', function(response) {
    //ToastS('auth.statusChange event');
});

$(document).ready(function()
{
    document.addEventListener("deviceready", onDeviceF, true);
});

function onDeviceF() {
    (device.platform === 'Android') ? $('.back').hide() : '';
    
    var username = window.localStorage.getItem("username");
    var f_name = username.split(' ');
    var first_n = (f_name[0].length > 10) ? f_name[0].substring(0, 10) + '.' : f_name[0];
    $('#loadname').html(first_n + '<span class="btn_close"></span>');
    document.addEventListener("menubutton", onMenuButtonF, false);
    document.addEventListener("backbutton", onBackbuttonF, false);
    publishGoalFriend();
}

var onBackbuttonF = function() {
    go_back();
};

var onMenuButtonF = function() {
    ToastS('Compartir Facebook');
};

var go_back = function(){
    if(window.localStorage.getItem("menu") === "save"){
        window.location = 'goal_view.html';
    } else {
        window.location = 'goal_list.html';
    }
};


function fb_login() {
    checkConnection();
    if (connect) {
        FB.login(            
                function(response) {
                    if (response) {
                        fb_me();
                    } else {
                        fb_me();
                    }

                },
                {scope: "email"}
        );
    }
}

function fb_logout() {
    FB.logout(function(response) {
        //ToastS('logged out');
    });
}

function getLoginStatus() {
    FB.getLoginStatus(function(response) {
        if (response.status === 'connected') {
            return true;
        } else {
            return false;
        }
    });
}

function fb_me() {
    FB.api('/me', {
        fields: 'name, picture, email' // lo que le pido a FB
    }, function(response) {
        if (response.error) {
            alert(JSON.stringify(response.error));
        } else {
            user = response; // contiene los campos que le solicité a FB
            console.log('Conectó con facebook ' + JSON.stringify(response));

            $("#username").attr('value', user.name);
            $("#email").attr('value', user.email);
            $("#password").attr('value', 'facebookconnect' + user.email);
            getCurrentPosition();
            ToastS("Conectó con facebook");
            login();
        }
    });
}

function fb_connect() {

    FB.login(
            function(response) {
                if (response.session) {
                    me();
                } else {
                    //alert('No se pudo conectar con facebook');
                    me();
                }
            },
            {scope: "email"}
    );
}

function me() {
    FB.api('/me', {
        fields: 'name, picture, email'
    }, function(response) {
        if (response.error) {
            alert(JSON.stringify(response.error));
            logout();
        } else {
            user = response;
            console.log('Tiene el nombre del usuario y la imagen: ' + JSON.stringify(response));

            //Update display of user name and picture
            if (document.getElementById('user-name')) {
                document.getElementById('user-name').innerHTML = user.name;
            }
            if (document.getElementById('user-picture')) {
                document.getElementById('user-picture').src = user.picture.data.url;
            }
            friends();
        }
    });
}

var friendIDs = [];
var fdata;
function friends() {

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


    function sortByName(a, b) {
        var x = a.name.toLowerCase();
        var y = b.name.toLowerCase();
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    }

    checkConnection();
    if (connect) {
        FB.api('/me/friends', {fields: 'id, name, picture'}, function(response) {
            if (response.error) {
                fb_connect();
                spinner.remove();
            } else {
                fdata = response.data.sort(sortByName);
                $('#before_info').hide();
                var d = 'Elije a un amigo para invitarlo a tu ahorro.';
                d += '<ul>';
                response.data.forEach(function(item) {
                    d += '<li style="color:#333; text-align:center" onclick="publishGoalFriend(' + item.id + ')">';
                    d += "<img src='" + item.picture.data.url + "'/><br />" + item.name;
                    d += '</li>';
                });
                d += '</ul>';
                $('#data').html(d);
                //data.innerHTML = d;
                spinner.remove();
            }
            var friends = response.data;
            console.log(friends.length);
            for (var k = 0; k < friends.length && k < 200; k++) {
                var friend = friends[k];
                friendIDs[k] = friend.id;
            }
        });
    } else {
        ToastS('No hay conexión a internet');
        spinner.remove();
    }
    //spinner.remove();
}

function publishGoalFriend(id) {

    var friendID = id;
    if (friendID == undefined) {
        alert('¿Cómo fue que sacaste este aviso?'); // Suecede cuando lleva vacio el ID del amigo
    } else {
        console.log("friend id: " + friendID);
        console.log('Opening a dialog for friendID: ', friendID);
        if (window.localStorage.getItem("menu") === "save") {
            var params = {
                method: 'feed',
                to: friendID.toString(),
                name: 'Aprendo a ahorrar',
                link: 'http://www.aprendoaahorrar.com/',
                picture: 'https://apps.aprendoaahorrar.com/app_mobile/f8.jpg',
                caption: window.localStorage.getItem("username") + ' te invita a compartir su ahorro',
                description: 'Quiero inviarte a compartir mi ahorro mediante la aplicación "Aprendo a ahorrar" ID del ahorro: ' + window.localStorage.getItem("id_go"),
                properties: [
                    {text: 'App Android', href: 'http://goo.gl/npLIn'},
                    {text: 'App iOS', href: 'http://goo.gl/5Rmwq'}
                ]
            };
        } else {
            var params = {
                method: 'feed',
                to: friendID.toString(),
                name: 'Aprendo a ahorrar',
                link: 'http://www.aprendoaahorrar.com/',
                picture: 'https://apps.aprendoaahorrar.com/app_mobile/f8.jpg',
                caption: 'Recueda que Ahorrar es Crecer',
                description: 'Te invito a que conozcas la app móvil de aprendeaahorrar.com',
                properties: [
                    {text: 'App Android', href: 'http://goo.gl/npLIn'},
                    {text: 'App iOS', href: 'http://goo.gl/5Rmwq'}
                ]
            };
        }
        FB.ui(params, function(obj) {
            console.log(obj);
            ToastL('Ahorro compartido');
        });
    }
}

function publishGoalFriend() {

        if (window.localStorage.getItem("menu") === "save") {
            var params = {
            method: 'feed',
            name: 'App Móvil Aprendo a Ahorrar',
            link: 'http://www.aprendoaahorrar.com/',
            picture: 'https://apps.aprendoaahorrar.com/app_mobile/f8.jpg',
            caption: 'Estoy ahorrando para "' + window.localStorage.getItem("name_go") + '".',
            description: 'Te invito a que conozcas la aplicación móvil "Aprendo a Ahorrar" de SURA',
            properties: [
                         {text: 'App Android  ', href: 'http://goo.gl/npLIn'},
                         {text: 'App iOS', href: 'http://goo.gl/5Rmwq'}
                         ]
            };
        } else {
            var params = {
            method: 'feed',
            name: 'App Móvil Aprendo a Ahorrar',
            link: 'http://www.aprendoaahorrar.com/',
            picture: 'https://apps.aprendoaahorrar.com/app_mobile/f8.jpg',
            caption: 'Recueda que Ahorrar es Crecer',
            description: 'Te invito a que conozcas la app móvil de aprendoaahorrar.com',
            properties: [
                         {text: 'App Android  ', href: 'http://goo.gl/npLIn'},
                         {text: 'App iOS', href: 'http://goo.gl/5Rmwq'}
                         ]
            };
        }
        FB.ui(params, function(obj) {
              console.log(obj);
              ToastL('Ahorro compartido');
              });
}

document.addEventListener('deviceready', function() {
    try {
        FB.init({
            appId: FBAppID, //surachile
            nativeInterface: CDV.FB,
            useCachedDialogs: false
        });
    } catch (e) {
        alert(e);
    }
}, false);