/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */
$(document).ready(function()
{
    document.addEventListener("deviceready", onDeviceGL, true);
    //Para que funcione en el simulador.
    onDeviceGL();
});

function onDeviceGL() {
    createDB();
    var username = window.localStorage.getItem("username");
    var f_name = username.split(' ');
    var first_n = (f_name[0].length > 10) ? f_name[0].substring(0, 10) + '.' : f_name[0];
    $('.content').css('padding-bottom', '70px');
    $('#loadname').html(first_n + '<span class="btn_close"></span>');
    getSqlResultPlans();
    document.addEventListener("menubutton", onMenuButtonGL, false);
    document.addEventListener("backbutton", onBackbuttonGL, false);
    show_requests();
    
    $('.btn_close').click(function() {
        $(this).toggleClass('btn_closactive');
        $('.menu_up').toggle();
    });
}

var onBackbuttonGL = function() {
    ToastS('Chao');
    if (navigator.app) {
        navigator.app.exitApp();
    } else if (navigator.device) {
        navigator.device.exitApp();
    }
};

var onMenuButtonGL = function() {
    ToastS('Listado metas');
};

function sync() {
    checkConnection();
    createDB();
    sync_savings();
    sync_fees();
}

/*
 * show_requests():Obtiene las solitudes pendientes para compartir ahorro.
 */

function show_requests() {

    var _page = "index.php?mode=show_requests";
    checkConnection();
    if (connect) {
        $.ajax({
            type: 'GET',
            url: _host + _page,
            data: {
                user_mail: window.localStorage.getItem("email")
            },
            success: function(data) {

                if (data !== '[]') {
                    var obj = $.parseJSON(data);
                    var conte = '';
                    for (var i = 0; i < obj.length; i++) {
                        conte += '<p id="re_' + obj[i].ss_saving + '">';
                        conte += '<strong>' + obj[i].user_name + '</strong> te solicita compartas el ahorro <strong>' + obj[i].saving_name + '.</strong><br />';
                        conte += '<a onclick="status_requests(' + obj[i].ss_saving + ',1);" style="float:left; color: #2489ce;">Aceptar</a><a onclick="status_requests(' + obj[i].ss_saving + ',0);" style="float:right; color: #2489ce;">Rechazar</a><br />';
                        conte += '</p>';
                        if (i !== (obj.length - 1))
                            conte += '<hr />';
                    }
                    $('#requests').show().html(conte);
                }
            },
            error: function() {
                //$("#lst_plans").show().html('A ocurrido un error con la conexión.');
                ToastL("A ocurrido un error con la conexión");
            }
        });
    } else {
        ToastS("No hay conexión a internet");
    }
}

/*
 * no_sync(): Obtiene el número de ahorros del usuario en el servidor y los compara con el número de local.
 */

function no_sync(num_lplans) {
    var _page = "index.php?mode=unm_obj";
    checkConnection();
    if (connect) {
        $.ajax({
            type: 'GET',
            url: _host + _page,
            data: {
                saving_user: window.localStorage.getItem("email")
            },
            success: function(data) {
                if (num_lplans !== (data * 1)) {
                    //$("#no_sync").show().html('<p>Tienes Metas sin sincronizar</p>');
                    sync();
                }
                console.log(num_lplans + ' === ' + data);
            },
            error: function() {
                //$("#lst_plans").show().html('A ocurrido un error con la conexión.');
                ToastL("A ocurrido un error con la conexión");
            }
        });
    }
}

function status_requests(id, x) {
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

    var _page = "index.php?mode=response_requests";
    checkConnection();
    if (connect) {
        $.ajax({
            type: 'GET',
            url: _host + _page,
            data: {
                id: id,
                response: x
            },
            success: function(data) {
                if (data === '1') {
                    if (x === 1) {
                        $('#re_' + id).show().html('<strong style="color:green;">Solicitud Aceptada.</strong>');
                    } else {
                        $('#re_' + id).show().html('<strong style="color:purple;">Solicitud rechazada.</strong>');
                    }
                } else {
                    $('#requests').show().html('<strong style="color:red;">Ocurrió un problema, intentalo más tarde.</strong>');
                }
                spinner.remove();
            },
            error: function() {
                $("#lst_plans").show().html('A ocurrido un error en el dispositivo.');
                spinner.remove();
            }
        });
    } else {
        ToastS("No hay conexión a internet");
        spinner.remove();
    }
}


function view_goal(id) {
    window.localStorage.setItem('id_go', id);
    window.location = 'goal_view.html';
}


