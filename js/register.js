var ck_email = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
var ck_password = /^[A-Za-z0-9!@#$%^&amp;*()_]{5,20}$/;


$(document).ready(function()
                  {
                  document.addEventListener("deviceready", onDeviceR, true);
                  //Para que funcione en el simulador.
                  onDeviceR();
                  });

function onDeviceR(){
    document.addEventListener("menubutton", onMenuButtonR, false);
    document.addEventListener("backbutton", onBackbuttonR, false);
    
    if (window.localStorage.getItem("twname")) {
        $("#username").attr('value', window.localStorage.getItem("twname"));
        $("#username").attr('disabled', 'disabled');
        $("#password").hide();
        $("#password").attr('value', window.localStorage.getItem("twpass"));
    }
    $('body').height($(window).height() - 70);
    $(window).resize(function() {
        $('body').height($(window).height() - 70);
    });
    $(window).trigger('resize');
}

var onBackbuttonR = function() {
    window.location = 'init.html';
};

var onMenuButtonR = function() {
    ToastS('Registro');
};

function register() {
    checkConnection();
    if (connect)
        getCurrentPosition();
    else
        ToastL("No hay conexión a internet");
}

/* 
 * Muestra una notificación si es necesaria indicando que el nombre de usuario es incorrecto. 
 */
$('#username').focusout(function()
{
    var username = $(this).val();
    if (username.length < 4)
    {
        $("#invalid_data").show().html("Mínimo 4 caracteres");
    }
    else
    {
        $("#invalid_data").hide();
    }
});

/* 
 * Muestra una notificación si es necesaria indicando que la contraseña es incorrecta. 
 */
$('#password').focusout(function()
{
    var password = $(this).val();
    if (!ck_password.test(password))
    {
        $("#invalid_data").show().html("Mínimo 5 caracteres");
    }
    else
    {
        $("#invalid_data").hide();
    }
});

/* 
 * Muestra una notificación si es necesaria indicando que la dirección de email es incorrecta. 
 */
$('#email').focusout(function()
{
    var email = $(this).val();
    if (!ck_email.test(email))
    {
        $("#invalid_data").show().html("Entre un email valido");
    }
    else
    {
        $("#invalid_data").hide();
    }
});

/* 
 * register(): encargada de almacenar en local el registro del usuario.
 * enviar los datos al servidor para el registro en la nube.
 */

function save_register() {
    createDB();
    var email = $("#email").val();
    var username = $("#username").val();
    var password = $("#password").val();
    var country = $("#country").val();

    if (ck_email.test(email) && username.length >= 4) {
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

        var _page = "index.php?mode=register";

        $.ajax({
            type: 'GET',
            url: _host + _page,
            data: {
                username: username,
                email: email,
                password: md5(md5(password)),
                country: country,
                avatar: 'images/default_avatar.png'
            },
            success: function(data) {
                switch (data) {
                    case '0':
                        $("#invalid_reg").show().html('Se ha producido un error en nuestro servidor, inténtalo de nuevo más tarde.');
                        spinner.remove();
                        break;
                    case '1':
                        writeLocalStorage('r');
                        return true;
                        break;
                    case '2':
                        login();
                        $("#invalid_reg").show().html('Esta dirección de correo electrónico ya está registrada.');
                        spinner.remove();
                        return false;
                        break;
                    default :
                        $("#invalid_reg").show().html('Se ha producido un error en el registro.' + data);
                        spinner.remove();
                        break;
                }
            },
            error: function(data) {
                $("#invalid_reg").show().html('Se ha producido un error en el dispositivo.');
                spinner.remove();
            }
        });
        return false;
    }
    else
    {
        $("#invalid_data").show().html("Por favor complete todos los campos correctamente");
    }
}

function getCountry(result)
{
    for (var i = 0; i < result.results[0].address_components.length; i++)
    {
        var shortname = result.results[0].address_components[i].short_name;
        var longname = result.results[0].address_components[i].long_name;
        var type = result.results[0].address_components[i].types;
        if (type.indexOf("country") !== -1)
        {
            if (!isNullOrWhitespace(shortname))
            {
                return shortname;
            }
            else
            {
                return longname;
            }
        }
    }

}

function isNullOrWhitespace(text) {
    if (text === null) {
        return true;
    }
    return text.replace(/\s/gi, '').length < 1;
}