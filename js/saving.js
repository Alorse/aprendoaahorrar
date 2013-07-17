$(document).ready(function()
{
    document.addEventListener("deviceready", onDeviceGN, true);
    //Para que funcione en el simulador.
    onDeviceGN();
});

function onDeviceGN() {
    if ((device.version.charAt(0) * 1) < 4) {
        document.getElementById('saving_value').type = 'number';
        document.getElementById('return').type = 'number';
    } else {
        document.getElementById('saving_value').type = 'text';
        document.getElementById('return').type = 'text';
    }
    $("#return").attr('placeholder', 'Rentabilidad sugerida ' + window.localStorage.getItem("country_return") + "%");
    $("#saving_value").attr('placeholder', '¿Cuánto necesitas para tu meta?');

    var username = window.localStorage.getItem("username");
    var f_name = username.split(' ');
    var first_n = (f_name[0].length > 10) ? f_name[0].substring(0, 10) + '.' : f_name[0];
    $('#loadname').html(first_n + '<span class="btn_close"></span>');

    document.addEventListener("menubutton", onMenuButtonGN, false);
    document.addEventListener("backbutton", onBackbuttonGN, false);

    $('#return_country').html(window.localStorage.getItem("country_name"));
    $('#annual_return').html(window.localStorage.getItem("country_return"));
    createDB();
    $('body').height($(window).height() - 70);
    $(window).resize(function() {
        $('body').height($(window).height() - 70);
    });
    $(window).trigger('resize');

    $('#saving_value').blur(function() {
        if ($(this).val()[0] !== '$') {
            this.type = 'text';
            $(this).val("$" + numberWithCommas($(this).val()));
        }
    });

    $('#saving_value').focus(function() {
        var sv = $(this).val();
        $(this).val(sv.substring(1, sv.legth));
        this.type = 'number';
    });

    $('#return').blur(function() {
        if ($(this).val()[$(this).val().length - 1] !== '$') {
            document.getElementById('return').type = 'text';
            $(this).val($(this).val() + '%');
        }
    });

    $('#return').focus(function() {
        var r = $(this).val();
        $(this).val(r.substring(0, r.legth - 2));
        this.type = 'number';
    });

    $('.btn_close').click(function() {
        $(this).toggleClass('btn_closactive');
        $('.menu_up').toggle();
    });
}

var numberWithCommas = function(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.join(".");
};

var onBackbuttonGN = function() {
    window.location = 'goal_list.html';
};

var onMenuButtonGN = function() {
    ToastS('Nueva Meta');
};

function calculate_monthly() {

    var saving_type = $("#saving_type").val();
    var saving_name = $("#saving_name").val();
    var saving_value = $("#saving_value").val().split('.').join("");
    saving_value = saving_value.replace("$", "");
    var saving_long = $("#saving_long").val();
    var saving_percent = $("#return").val() === "" ? window.localStorage.getItem("country_return") : $("#return").val();
    saving_percent = saving_percent.replace("%", "");

    if ((saving_value * 1) < 101) {
        ToastS('Debes ingresar un monto mayor.');
    } else if (saving_name !== '' && saving_value !== '' && saving_type !== '0' && saving_long !== '0') {

        $('#new_plan').hide();
        $('#shared_goal').hide();
        $('#succes_plan').show();
        $('#titlename').show().html(window.localStorage.getItem("username") + ",");

        var yeartomonth = saving_long * 12; // En meses
        var profitability = (Math.pow((1 + (saving_percent / 100)), (1 / 12)) - 1); // Mensualizada

        var payment_value = saving_value / (((1 + profitability) * (Math.pow((1 + profitability), yeartomonth) - 1)) / profitability);
        payment_value = (payment_value % 1 === 0) ? payment_value : payment_value.toFixed(0);

        $('#s_payment_value').html(numberWithCommas(payment_value));
        $('#s_value').html(numberWithCommas(saving_value));
        $('#s_time').html(saving_long);
        $('#s_return').html(saving_percent);
    } else {
        ToastS('Completa todos los campos.');
    }
}

var edit_goal = function() {
    $('#succes_plan').hide();
    $('#new_plan').show();
};

var save_goal = function() {
    var saving_user = window.localStorage.getItem("email");
    var saving_reg = ((new Date()).getTime() / 1000).toFixed(0);
    var saving_type = $("#saving_type").val();
    var saving_name = $("#saving_name").val();
    var saving_value = $("#saving_value").val().split('.').join("");
    saving_value = saving_value.replace("$", "");
    var saving_percent = $("#return").val() === "" ? window.localStorage.getItem("country_return") : $("#return").val();
    saving_percent = saving_percent.replace("%", "");
    var saving_long = $("#saving_long").val();
    var saving_notification = window.localStorage.getItem("saving_notification");

    if ((saving_value * 1) < 101) {
        ToastS('Debes ingresar un monto mayor.');
    } else if (saving_name !== '' && saving_value !== '' && saving_type !== '0' && saving_long !== '0') {

        var info = [];
        var qwe = ['saving_user', 'saving_reg', 'saving_type', 'saving_name', 'saving_value', 'saving_percent', 'saving_long', 'saving_noti', 'saving_noti'];
        createDB();
        info.push(saving_user, saving_reg, saving_type, saving_name, saving_value, saving_percent, saving_long, saving_notification, 0);
        insertSQL(qwe, info, 'sg_savings');

        var yeartomonth = saving_long * 12; // En meses
        var profitability = (Math.pow((1 + (saving_percent / 100)), (1 / 12)) - 1); // Mensualizada

        //var payment_value = saving_value / (saving_long * saving_percent);
        var payment_value = saving_value / (((1 + profitability) * (Math.pow((1 + profitability), yeartomonth) - 1)) / profitability);
        payment_value = (payment_value % 1 === 0) ? payment_value : payment_value.toFixed(0);


        var _page = "index.php?mode=saving";
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

            $.ajax({
                type: 'GET',
                url: _host + _page,
                data: {
                    saving_user: saving_user,
                    saving_reg: saving_reg,
                    saving_type: saving_type,
                    saving_name: saving_name,
                    saving_value: saving_value,
                    saving_percent: saving_percent,
                    saving_long: saving_long,
                    saving_notification: saving_notification
                },
                success: function(data) {
                    switch (data) {
                        case '0':
                            ToastL('Este correo electrónico no está autorizado.');
                            spinner.remove();
                            session_kill();
                        case '1':
                            // Todo Full :D
                            ToastL("Guardó correctamente");
                            spinner.remove();
                            showConfirm();
                            break;
                        case '2':
                            $("#invalid_saving").show().html('Se ha producido un error en nuestro servidor, inténtalo de nuevo más tarde.');
                            spinner.remove();
                            break;
                        default :
                            $("#invalid_saving").show().html('Se ha producido un error guardando el ahorro online.' + data);
                            spinner.remove();
                            break;
                    }
                },
                error: function(data) {
                    ToastL('El ahorro se guardó localmente ya que no hay conexión a internet.');
                    spinner.remove();
                }
            });
        } else {
            ToastL('El ahorro se guardó localmente ya que no hay conexión a internet.');
            spinner.remove();
        }
    } else {
        $('#succes_plan').hide();
        $('#new_plan').show();
        $("#invalid_saving").show().html('Completa todos los campos.');
        ToastS('Completa todos los campos.');
    }
    return false;
};

function search_goal() {
    $('#new_plan').hide();
    var id_goal = $('#id_goal').val();
    if (id_goal !== '') {
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

        var _page = "index.php?mode=show_goal";
        checkConnection();
        if (connect) {
            $.ajax({
                type: 'GET',
                url: _host + _page,
                data: {
                    ss_saving: id_goal
                },
                success: function(data) {
                    if (data !== '[]') {
                        var obj = $.parseJSON(data);
                        var conte = '<p>Selecciona el ahorro para solicitar participar en el.<p>';
                        conte += '<ul>';
                        for (var i = 0; i < obj.length; i++) {
                            conte += '<li onclick="request_goal(' + obj[i].saving_reg + ', \'' + obj[i].user_mail + '\');">';
                            conte += 'Nombre Ahorro: ' + obj[i].saving_name + '<br />';
                            conte += 'Valor ahorro: ' + obj[i].saving_value + '<br />';
                            conte += 'Creador: ' + obj[i].user_name;
                            conte += '</li>';
                        }
                        conte += '</ul>';
                        $('#info_shared').show().html(conte);
                        spinner.remove();
                    } else {
                        spinner.remove();
                        $('#info_shared').show().html('<p>No se encontró ninguna meta con el ID <strong>' + id_goal + '</strong></p>');
                    }
                },
                error: function(data) {
                    $('#info_shared').show().html('A ocurrido un problema con el dispositivo');
                    spinner.remove();
                }
            });
        } else {
            ToastL('Es necesario tener conexión a internet');
            spinner.remove();
        }
    }
}

function request_goal(id_reg, email) {
    if (email !== window.localStorage.getItem("email")) {
        window.localStorage.setItem('id_go', id_reg);
        confirmShare();
    } else {
        $('#info_shared').show().html('<p>Pero... ¡Si este es tu ahorro!</p>');
    }
}

function send_request_goal() {
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

    var _page = "index.php?mode=request_goal";
    checkConnection();
    if (connect) {
        $.ajax({
            type: 'GET',
            url: _host + _page,
            data: {
                ss_saving: window.localStorage.getItem("id_go"),
                ss_friend: window.localStorage.getItem("email")
            },
            success: function(data) {
                if (data === '1') {
                    $('#shared_goal').hide();
                    $('#info_shared').show().html('<p style="color:green;">La solicitud fue enviada, en cuanto tu amigo la apruebe, podras acceder a esta.</p>');
                    spinner.remove();
                } else if (data === '2') {
                    $('#info_shared').show().html('<p style="color:purple;">Ya has enviado esta solitud.</p>');
                    spinner.remove();
                } else {
                    $('#info_shared').show().html('<p>Problemas enviado la solitud, por favor intentalo más tarde.</p>');
                    spinner.remove();
                }
            },
            error: function(data) {
                $('#info_shared').show().html('A ocurrido un problema con el dispositivo');
                spinner.remove();
            }
        });
    } else {
        ToastL('Es necesario tener conexión a internet');
        spinner.remove();
    }
}

function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.join(".");
}