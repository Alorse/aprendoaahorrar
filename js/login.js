$(document).ready(function()
{
    document.addEventListener("deviceready", onDeviceL, true);
    //Para que funcione en el simulador.
    onDeviceL();
});

var onDeviceL = function() {
    createDB();
    if (window.localStorage.getItem("email") && window.localStorage.getItem("username")) {
        getSqlResultSet();
    }
    document.addEventListener("menubutton", onMenuButtonL, false);
    document.addEventListener("backbutton", onBackbuttonL, false);


    if (filename === 'user_forgot.html') {
        $('#update').hide();

        $('#show_pass').click(function() {
            if ($('input[id=show_pass]').is(':checked')) {
                document.getElementById('new_pass').type = 'text';
            } else {
                document.getElementById('new_pass').type = 'password';
            }
        });
    }
};

var onBackbuttonL = function() {
    //session_kill();
    window.location = 'init.html';
};

var onMenuButtonL = function() {
    ToastS('Login');
};

var login = function() {
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
                //alert(data);
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
                        sync_savings();
                        sync_fees();
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
};

var recover = function() {
    var ck_email = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    var email = $('#email').val();
    if (!ck_email.test(email))
    {
        ToastS("Entra un email valido");
    } else {
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

            var _page = "index.php?mode=pass_recover";

            $.ajax({
                type: 'GET',
                url: _host + _page,
                data: {
                    usermail: email
                },
                success: function(data) {
                    switch (data) {
                        case '0':
                            spinner.remove();
                            $("#invalid_login").show().html('El correo ' + email + ' no se encuentra registrado.');
                            break;
                        case '1':
                            spinner.remove();
                            $('#update').show();
                            $('#forgot').hide();
                            window.localStorage.setItem('email', email);
                            alert('Las intrucciones fueron enviadas a tu correo.');
                            break;
                        default :
                            spinner.remove();
                            alert(data);
                            break;
                    }
                },
                error: function(data) {
                    $("#invalid_login").show().html('Se ha producido un error en el dispositivo.');
                    spinner.remove();
                }
            });
        } else {
            ToastL("No hay conexión a internet");
        }
    }
};

var update_pass = function() {
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

        var key = $('#recov_code').val();
        var pass = $('#new_pass').val();

        var _page = "index.php?mode=update_pass";

        $.ajax({
            type: 'GET',
            url: _host + _page,
            data: {
                user_mail: window.localStorage.getItem("email"),
                user_key: key,
                user_pass: md5(md5(pass))
            },
            success: function(data) {
                switch (data) {
                    case '0':
                        spinner.remove();
                        $("#result").show().html('El Código de recuperación es incorrecto.');
                        break;
                    case '1':
                        spinner.remove();
                        window.localStorage.clear();
                        alert('Contraseña actualizada.');
                        window.location = 'user_login.html';
                        break;
                    default :
                        spinner.remove();
                        ToastL('Problemas en el servidor, intenta más tarde.');
                        window.location = 'user_login.html';
                        break;
                }
            },
            error: function(data) {
                $("#invalid_login").show().html('Se ha producido un error en el dispositivo.');
                spinner.remove();
            }
        });
    } else {
        ToastL("No hay conexión a internet");
    }
}; conexión a internet");
    }
};