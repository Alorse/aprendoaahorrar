/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


$(document).ready(function()
{
    document.addEventListener("deviceready", onDeviceUP, true);
    //Para que funcione en el simulador.
    onDeviceUP();
});

function onDeviceUP() {
    createDB();
    var username = window.localStorage.getItem("username");
    var f_name = username.split(' ');
    var first_n = (f_name[0].length > 10) ? f_name[0].substring(0, 10) + '.' : f_name[0];
    $('#loadname').html(first_n + '<span class="btn_close"></span>');
    document.addEventListener("menubutton", onMenuButtonGL, false);
    document.addEventListener("backbutton", onBackbuttonGL, false);

    $('#username').val(username);
    $('#email').val(window.localStorage.getItem("email"));
    $('#country').val(window.localStorage.getItem("country_pref"));

    $('.btn_close').click(function() {
        $(this).toggleClass('btn_closactive');
        $('.menu_up').toggle();
    });
}

var onBackbuttonGL = function() {
    window.location = 'goal_list.html';
};

var onMenuButtonGL = function() {
    ToastS('Perfil de usuario');
};

var profile = function() {
    var ck_email = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

    var username = $('#username').val();
    var email = $('#email').val();
    var oldemail = window.localStorage.getItem("email");
    var country = $('#country').val();

    if (username === window.localStorage.getItem("username") && email === window.localStorage.getItem("email") && country === window.localStorage.getItem("country_pref"))
    {
        ToastL('Tu perfil ya está actualizado.');
        return;
    }

    if (username.length > 4 & ck_email.test(email)) {
        var _page = "index.php?mode=update_profile";
        checkConnection();
        if (connect) {
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

            $.ajax({
                type: 'GET',
                url: _host + _page,
                data: {
                    user_name: username,
                    user_mail: email,
                    olduser_mail: oldemail,
                    user_country: country
                },
                success: function(data) {
                    switch (data) {
                        case '0':
                            $("#invalid_data").show().html('Se ha producido un error al actualizar el perfil.' + data);
                            spinner.remove();
                            break;
                        case '1':
                            window.localStorage.setItem('username', username);
                            window.localStorage.setItem('email', email);
                            window.localStorage.setItem('country_pref', country);
                            data_country();
                            ToastL('Perfil Actualizado');
                            $('#invalid_data').show().html('Perfil Actualizado correctamente');
                            spinner.remove();
                            break;
                        case '2':
                            $("#invalid_data").show().html('Esta dirección de correo electrónico ya está registrada.');
                            spinner.remove();
                            break;

                        default:
                            $("#invalid_data").show().html('Se ha producido un error al actualizar el perfil.' + data);
                            spinner.remove();
                            break;
                    }
                },
                error: function() {
                    ToastL("A ocurrido un error con la conexión");
                }
            });
        } else {
            ToastS("No hay conexión a internet");
        }

    } else {
        $('#invalid_data').show().html('Datos incorrectos');
        ToastL('Datos incorrectos');
    }
};

var data_country = function() {
    var _page = "index.php?mode=update_data_country";
    $.ajax({
        type: 'GET',
        url: _host + _page,
        data: {
            country: window.localStorage.getItem("country_pref")
        },
        success: function(data) {
            var country = data.split(',');
            window.localStorage.setItem('country_name', country[1]);
            window.localStorage.setItem('country_return', country[3]);
        },
        error: function() {
            ToastL("A ocurrido un error con la conexión");
        }
    });
};