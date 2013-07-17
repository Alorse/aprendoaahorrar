$(document).ready(function()
{
    document.addEventListener("deviceready", onDeviceGV, true);
    //Para que funcione en el simulador.
    onDeviceGV();
});

function onDeviceGV() {
    createDB();
    var username = window.localStorage.getItem("username");
    var f_name = username.split(' ');
    var first_n = (f_name[0].length > 10) ? f_name[0].substring(0, 10) + '.' : f_name[0];
    $('#loadname').html(first_n + '<span class="btn_close"></span>');
    document.addEventListener("menubutton", onMenuButtonGV, false);
    document.addEventListener("backbutton", onBackbuttonGV, false);
    getSqlResultFeePaid();
    getSqlResultInfoPlan();

    //open popup
    $("#pop_share").click(function() {
        $("#share").fadeIn(500);
        positionPopup();
    });

//close popup
    $("#close").click(function() {
        $("#share").fadeOut(500);
    });

    $('.btn_close').click(function() {
        $(this).toggleClass('btn_closactive');
        $('.menu_up').toggle();
    });
}

var onBackbuttonGV = function() {
    window.location = 'goal_list.html';
};

var onMenuButtonGV = function() {
    ToastS('Viendo meta');
    trigger_menu();
};


function paid_fee(fee_parent_reg, fee_value) {
    /* Genera el load giratorio mientras se hacen peticiones al servidor. */
    var fee_time = ((new Date()).getTime() / 1000).toFixed(0);

    var info = [];
    var qwe = ['fee_reg', 'fee_parent_reg', 'fee_value'];
    info.push(fee_time, fee_parent_reg, fee_value);
    insertSQL(qwe, info, 'sg_fees_paid');

    var _page = "index.php?mode=paid_fee";

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
                fee_parent_reg: fee_parent_reg,
                fee_value: fee_value,
                fee_time: fee_time
            },
            success: function(data) {
                if (data === '1') {
                    window.location = 'goal_view.html';
                } else {
                    $('#info').show().html('Ha ocurrido un error, intentelo más tarde.' + data);
                }
            },
            error: function(data) {
                ToastL('El pago se guardó localmente ya que no hay conexión a internet.');
                window.location = 'goal_view.html';
                spinner.remove();
            }
        });
    } else {
        ToastL('El pago se guardó localmente ya que no hay conexión a internet.');
        window.location = 'goal_view.html';
    }
}

function setfinish(reg_plan, reload) {
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
    id_go = reg_plan;
    updateSQL();

    spinner.center();
    var _page = "index.php?mode=setfinish";

    checkConnection();
    if (connect) {
        $.ajax({
            type: 'GET',
            url: _host + _page,
            data: {
                reg_plan: reg_plan
            },
            success: function(data) {
                if (data === '1') {
                    spinner.remove();
                    ToastS('Meta de ahorro completada');
                    if (reload)
                        window.location = 'goal_view.html';
                } else {
                    $('#info').show().html('Ha ocurrido un error, intentelo más tarde.');
                }
            },
            error: function(data) {
                $('#info').show().html('Ha ocurrido un error, intentelo más tarde.' + data);
                spinner.remove();
            }
        });
    } else {
        ToastL("Se marcó como completado localmente ya que no hay conexión a internet.");
        window.location = 'goal_view.html';
    }
}

function confirm_delplan(reg_plan) {
    function onConfirm(button) {
        switch (button) {
            case 1:
                ToastS('Eliminación cancelada');
                break;
            case 2:
                delplan(reg_plan);
                break;
        }
    }
    if (ismobile) {
        navigator.notification.confirm(
                'Al eliminar esta meta no se podrá recuperar, ¿Estás seguro de eliminarla?', // message
                onConfirm, // callback to invoke with index of button pressed
                'Confirmar Eliminar', // title
                'Cancelar,Eliminar'    // buttonLabels
                );
    } else {
        ToastL('¡Meta Eliminada! pero función solo para móviles.');
    }
}

function delplan(reg_plan) {
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
    id_go = reg_plan;
    deleteSQL();

    spinner.center();
    var _page = "index.php?mode=delplan";

    checkConnection();
    if (connect) {
        $.ajax({
            type: 'GET',
            url: _host + _page,
            data: {
                reg_plan: reg_plan
            },
            success: function(data) {
                if (data === '1') {
                    ToastS('Meta de ahorro Eliminada');
                    window.location = 'goal_list.html';
                } else {
                    $('#info').show().html('Ha ocurrido un error, intentelo más tarde.' + data);
                }
            },
            error: function(data) {
                $('#info').show().html('Ha ocurrido un error, intentelo más tarde.');
                spinner.remove();
            }
        });
    } else {
        spinner.remove();
        ToastL("Se eliminó localmente ya que no hay conexión a internet.");
        window.location = 'goal_list.html';
    }
}

function numberWithCommas(x) {

    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.join(".");
}

var show = true;
var show_fees = function() {
    if (show) {
        $('#list_fees table tr').show();
        $('#more_fees').html('Ver menos <span class="fontawesome-minus"></span>');
        show = false;
    } else {
        $('#list_fees table tr').hide();
        $('#list_fees table tr:first-child').show();
        $('#list_fees table tr:last-child').show();
        $('#list_fees table tr:nth-child(2)').show();
        $('#more_fees').html('Ver más <span class="fontawesome-plus"></span>');
        show = true;
    }
};

/* Menú */

function trigger_menu()
{
    var cls = (device.platform === 'Android') ? 'android' : 'ios';
    $('#share').attr('class', cls);
    window.localStorage.setItem('menu', 'save');
    $('#share').slideToggle(200);
}

$(document).bind('pageinit', function() {
    $(document).click(function(e) {
        if (e.srcElement.className != 'show-menu ui-link') {
            $('#share').slideUp(200);
        }
    });

    $('#share').click(function() {
        $('#share').slideUp(200);
    });
});