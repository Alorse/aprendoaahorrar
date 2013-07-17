$(document).ready(function()
                  {
                  document.addEventListener("deviceready", onDeviceL, true);
                  //Para que funcione en el simulador.
                  onDeviceL();
                  });

function onDeviceL() {
    if (window.localStorage.getItem("email") && window.localStorage.getItem("username")) {
        createDB();
        getSqlResultSet();
    } else {
        var filename = location.pathname.substring(location.pathname.lastIndexOf('/') + 1);
        if (filename !== 'init.html') {
            window.location = 'init.html';
        }
    }
    document.addEventListener("menubutton", onMenuButton, false);
    document.addEventListener("backbutton", onBackbutton, false);
    $('body').height($(window).height() - 70);
    $(window).resize(function() {
        $('body').height($(window).height() - 70);
    });
    $(window).trigger('resize');
    
    $('.btn_close').click(function() {
        $(this).toggleClass('btn_closactive');
        $('.menu_up').toggle();
    });
}

var onBackbutton = function() {
    ToastS('Chao');
    if (navigator.app) {
        navigator.app.exitApp();
    } else if (navigator.device) {
        navigator.device.exitApp();
    }
};

var onMenuButton = function() {
    ToastS('Inicio');
};

function login() {
    checkConnection();
    if (connect) {
        var email = $("#email").val();
        var password = $("#password").val();

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

        var _page = "index.php?mode=login";

        $.ajax({
            type: 'GET',
            url: _host + _page,
            data: {
                usermail: email,
                password: md5(md5(password))
            },
            success: function(data) {
                switch (data.charAt(0)) {
                    case '0':
                        $("#invalid_login").show().html('Email o Contraseña incorrecta.');
                        spinner.remove();
                        break;
                    case '{':
                        var obj = jQuery.parseJSON(data);
                        $("#username").attr('value', obj.user_name);
                        $("#country").attr('value', obj.user_country);
                        writeLocalStorage('l');
                        break;
                    default :
                        $("#invalid_login").show().html('Se ha producido un error al identificarse.' + data);
                        spinner.remove();
                        break;
                }
            },
            error: function(data) {
                $("#invalid_login").show().html('Se ha producido un error en el dispositivo.');
                spinner.remove();
            }
        });
        return false;
    } else {
        ToastL("No hay conexión a internet");
    }
}