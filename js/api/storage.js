// api-storage  "Create DB"

/* Variables globales */

var ismobile = (/iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile|ipad|android 3|xoom|sch-i800|playbook|tablet|kindle/i.test(navigator.userAgent.toLowerCase()));
var filename = location.pathname.substring(location.pathname.lastIndexOf('/') + 1);
/* Verifica si no es un dispositivo móvil y le asigna conectividad (para pruebas en el navegador) */
var connect = false;
var num_plans = 0;

//var _host = 'http://192.168.1.14/SaveGrow/'; /* LocalHome */
//var _host = 'http://alorse.net/mobile/SaveIsGrow/service/'; /* AlorseHome */
var _host = 'https://apps.aprendoaahorrar.com/app_mobile/'; /* AppHome */

var rows = [];
var vals = [];
var tableSQL = '';
var rows_savings = [];
var vals_savings = [];
var rows_fees = [];
var vals_fees = [];
//var upload_savings = '';
//var upload_fees = '';
var db = 0;

/*
 * createDB: Encargado de crear la base de Datos.
 * @returns tx:instancia de BD.
 */

function createDB() {
    (device.platform === 'Android') ? $('.back').hide() : '';
    if (!db) {
        if (!window.openDatabase) {
            alert('No soporta bases de datos.');
        } else {
            db = window.openDatabase("SaveIsGrow", "1.0", "Save Is Grow", 200000);
        }
    }
    db.transaction(tablesDB, errorCB, successCreateCB);
}

/*
 * tablesDB: Crea las tablas de la base de datos.
 * @param {type:db} tx
 */

function tablesDB(tx) {
    //tx.executeSql('DROP TABLE IF EXISTS sg_savings');
    tx.executeSql(
            'CREATE TABLE IF NOT EXISTS sg_savings ('
            + 'saving_id INTEGER primary key autoincrement, '
            + 'saving_user INTEGER NOT NULL, '
            + 'saving_reg INTEGER NOT NULL, '
            + 'saving_type INTEGER NOT NULL, '
            + 'saving_name TEXT NOT NULL, '
            + 'saving_value INTEGER NOT NULL, '
            + 'saving_percent NUMERIC NOT NULL, '
            + 'saving_long INTEGER NOT NULL, '
            + 'saving_noti INTEGER NOT NULL DEFAULT \'1\', '
            + 'saving_finish INTEGER NOT NULL DEFAULT \'0\')'
            );
    //tx.executeSql('DROP TABLE IF EXISTS sg_fees_paid');
    tx.executeSql(
            'CREATE TABLE IF NOT EXISTS sg_fees_paid ('
            + 'fee_id INTEGER primary key autoincrement, '
            + 'fee_reg INTEGER NOT NULL, '
            + 'fee_parent_reg INTEGER NOT NULL, '
            + 'fee_value INTEGER NOT NULL)'
            );
    //tx.executeSql('INSERT INTO sg_savings (saving_user, saving_reg, saving_type, saving_name, saving_value, saving_percent, saving_long, saving_noti) VALUES ("qwe@asd.com", "1366587722", "3", "Primer ahorro222", "1000000", "5", "1", "1");');
}
function errorCB(err) {
    console.log("Error al procesar el SQL: " + err.code);
    $('#sql-result').html("<strong>Error al procesar el SQL: " + err.code + "</strong>");
}
function successCreateCB() {
    console.log("Base de datos 1.0 creada con éxito");
    $('#sql-result').html("<strong>Base de datos 1.0 creada con éxito</strong>");
}

/*
 * getSqlResultSet(): Retorda el número de registro de la tabla de ahorros
 * @returns {num_plans}
 */

function getSqlResultSet() {
    if (!db) {
        db = window.openDatabase("SaveGrow", "1.0", "Save is Grow", 200000);
    }
    db.transaction(queryDB, errorCB);
}

/*
 * queryDB(): ejecuta la consulta buscando los los IDs de los ahorros
 * @param {type} tx
 */
function queryDB(tx) {
    tx.executeSql('SELECT saving_id FROM sg_savings', [], querySuccess, errorCB);
}

/*
 * querySuccess(): asigna a num_plans el tamaño de los resultados.
 * @param {type} tx
 * @param {type} results
 */
function querySuccess(tx, results) {

    if ((results.rows.length * 1) > 0) {
        num_plans = results.rows.length * 1;
        if (num_plans > 0) {
            window.location = 'goal_list.html';
        } else {
            window.location = 'goal_new.html';
        }
    } else {
        window.location = 'goal_new.html';
    }
}


/*
 * insertSQL: Agrega las nuevos Metas en un arreglo y abre la conexión a la base de datos.
 * @param {type:array} row, value
 * @returns {rows, vals}
 */

function insertSQL(row, value, table) {
    if (!db) {
        db = window.openDatabase("SaveGrow", "1.0", "Save is Grow", 200000);
    }

    this.rows = row;
    this.vals = value;
    this.tableSQL = table;
    db.transaction(insertDB, errorCB);
}

/*
 * insertDB: Inserta nuevas Metas desde arreglos con información de estos.
 * @param {type:db} tx
 * @returns {undefined}
 */

function insertDB(tx) {
    var sql = "INSERT INTO " + tableSQL + " "
            + "(" + rows.join(', ') + ") VALUES "
            + "(\"" + vals.join('", "') + "\");";
    tx.executeSql(sql);
}

/*
 * getSqlResultPlans: abre la base dedatos para buscar el listado de metas
 * @returns {undefined}
 */

function getSqlResultPlans() {
    if (!db) {
        db = window.openDatabase("SaveGrow", "1.0", "Save is Grow", 200000);
    }
    db.transaction(queryDBPlans, errorCB);
}

/*
 * queryDBPlans: ejecuta la consulta SQL para buscar las matas del usuario.
 * @param {type} tx
 * @returns {undefined}
 */
function queryDBPlans(tx) {
    tx.executeSql('SELECT * FROM sg_savings WHERE saving_user = "' + window.localStorage.getItem("email") + '" ORDER BY saving_reg DESC', [], querySuccessPlans, errorCB);
}

/*
 * querySuccessPlans: retorna un listado con las metas del usuario
 * @param {type} tx
 * @param {type} results
 * @returns {savings}
 */
function querySuccessPlans(tx, results) {
    num_plans = results.rows.length * 1;
    no_sync(num_plans);
    if (results.rows.length > 0) {
        var savings = '';
        savings += '<ul>';
        for (var i = 0; i < results.rows.length; i++) {
            if (results.rows.item(i).saving_finish === 1) {
                savings += '<li class="goal_full" onclick="view_goal(' + results.rows.item(i).saving_reg + ');">';
                savings += results.rows.item(i).saving_name + '<span class="check"></span>';
            } else {
                savings += '<li onclick="view_goal(' + results.rows.item(i).saving_reg + ');">';
                savings += results.rows.item(i).saving_name + '<span class="arrowr"></span>';
            }
            savings += '</li>';
        }
        savings += '</ul>';
        $('#lst_plans').show().html(savings);
    } else {
        $('#lst_plans').html('No tienes Metas aún.');
    }
}

/*
 * insertSQL: Agrega las Metas de la sincronización en un arreglo y abre la conexión a la base de datos.
 * @param {type:array} row, value
 * @returns {rows, vals}
 */

function insertSQL_savings(row, value) {
    if (!db) {
        db = window.openDatabase("SaveGrow", "1.0", "Save is Grow", 200000);

    }
    this.rows_savings = row;
    this.vals_savings = value;
    db.transaction(insertDB_savings, errorCB);
}

/*
 * insertDB: Inserta metas sincronizados desde arreglos con información de estos.
 * @param {type:db} tx
 * @returns {undefined}
 */

function insertDB_savings(tx) {
    tx.executeSql('DELETE FROM sg_savings');
    tx.executeSql('DELETE FROM sqlite_sequence WHERE name = "sg_savings"');
    var poi = [];
    var saving_user = window.localStorage.getItem("email");

    $.each(vals_savings, function(index, value) {
        poi.push(saving_user, value.saving_reg, value.saving_type, value.saving_name, value.saving_value, value.saving_percent, value.saving_long, value.saving_noti, value.saving_finish);

        var sql = "INSERT INTO sg_savings "
                + "(" + rows_savings.join(', ') + ") VALUES "
                + "(\"" + poi.join('", "') + "\");";
        tx.executeSql(sql);
        poi = [];
    });
    ToastS("Metas sincronizadas");
}

/*
 * insertSQL: Agrega los pagos de las metas en un arreglo y abre la conexión a la base de datos.
 * @param {type:array} row, value
 * @returns {rows, vals}
 */

function insertSQL_fees(row, value) {
    if (!db) {
        db = window.openDatabase("SaveGrow", "1.0", "Save is Grow", 200000);
    }

    this.rows_fees = row;
    this.vals_fees = value;
    db.transaction(insertDB_fees, errorCB);
}

/*
 * insertDB: Inserta metas sincronizadas desde arreglos con información de estos.
 * @param {type:db} tx
 * @returns {undefined}
 */

function insertDB_fees(tx) {
    tx.executeSql('DELETE FROM sg_fees_paid');
    tx.executeSql('DELETE FROM sqlite_sequence WHERE name = "sg_fees_paid"');
    var poi = [];
    $.each(vals_fees, function(index, value) {
        poi.push(value.fee_reg, value.fee_parent_reg, value.fee_value);

        var sql = "INSERT INTO sg_fees_paid "
                + "(" + rows_fees.join(', ') + ") VALUES "
                + "(\"" + poi.join('", "') + "\");";
        tx.executeSql(sql);
        poi = [];
    });
    ToastS("Pagos sincronizados");
    window.location.reload();

}



function getSqlResultInfoPlan() {
    if (!db) {
        db = window.openDatabase("SaveGrow", "1.0", "Save is Grow", 200000);
    }
    db.transaction(queryDBInfoPlan, errorCB);
}

function queryDBInfoPlan(tx) {
    tx.executeSql('SELECT * FROM sg_savings WHERE saving_reg = ' + window.localStorage.getItem("id_go"), [], querySuccessInfoPlan, errorCB);
}

function querySuccessInfoPlan(tx, results) {
    var plan = '';
    if (results.rows.length > 0) {
        var fees = $.parseJSON(jsonFeePaid);

        var saving_typ = '';
        switch (results.rows.item(0).saving_type) {
            case 1:
                saving_typ = 'Casa Propia';
                break;
            case 2:
                saving_typ = 'Estudio';
                break;
            case 3:
                saving_typ = 'Proyecto Personal';
                break;
        }
        var yeartomonth = results.rows.item(0).saving_long * 12; // En meses
        var profitability = (Math.pow((1 + (results.rows.item(0).saving_percent / 100)), (1 / 12)) - 1); // Mensualizada

        //var payment_value = saving_value / (saving_long * saving_percent);
        var payment_value = results.rows.item(0).saving_value / (((1 + profitability) * (Math.pow((1 + profitability), yeartomonth) - 1)) / profitability);
        payment_value = (payment_value % 1 === 0) ? payment_value : payment_value.toFixed(0);
        var num_fees_paid = (payment_value * yeartomonth) / payment_value;

        window.localStorage.setItem("name_go", results.rows.item(0).saving_name);

        var rp = 0, gfm = 0, aa = 0, amr = 0, ta = 0;
        var info_saving = new Array();
        var tua = payment_value * yeartomonth;
        $.each(fees.saving_fees, function(i) {
            aa = ((payment_value) * (i + 1)).toFixed(0);
            rp = parseInt(rp) + parseInt(gfm);
            gfm = (aa * profitability).toFixed(0);
            amr = parseInt(aa) + parseInt(rp);

            info_saving.push([date("m-Y", fees.saving_fees[i].fee_reg), numberWithCommas(aa), numberWithCommas(amr)]);
            ta = amr;
        });
        if (results.rows.item(0).saving_finish === 1) {
            plan += '<div class="arrofinishtop"></div>';
            plan += '<div class="finish"><strong>Meta terminada, Felicidades.</strong><br /> Ya cumpliste con tu meta de ahorro "' + results.rows.item(0).saving_name + '".<br /><strong>Depositaste $' + numberWithCommas(payment_value * yeartomonth) + ' a una rentabilidad del ' + results.rows.item(0).saving_percent + '% anual.</strong></div>';
            plan += '<br />';
        }
        plan += '<h2>' + results.rows.item(0).saving_name + ':</h2>';
        plan += '<div class="typ"><strong>' + saving_typ + '</strong>, Creado el ' + date("Y-m-d g:i a", results.rows.item(0).saving_reg) + '</div>';
        plan += '<br /><br />';
        plan += '<div><table width="95%" class="tbl_info"><tr style="padding:5px;">';
        plan += '<td>Monto Meta</td><td style="font-size:18px;" id="saving_value">$' + numberWithCommas(results.rows.item(0).saving_value) + '</td>';
        plan += '</tr><tr>';
        plan += '<td>Periodo</td><td>' + results.rows.item(0).saving_long + ' año(s)</td>';
        plan += '</tr><tr>';
        plan += '<td>Rentabilidad</td><td>' + results.rows.item(0).saving_percent + '%</td>';
        plan += '</tr><tr>';
        plan += '<td>Ahorro mensual</td><td id="fee_month">$' + numberWithCommas(payment_value) + '</td>';
        plan += '</tr><tr>';
        plan += '<td>Aportes realizados</td><td>' + fees.saving_fees_count + ' de ' + num_fees_paid.toFixed(0) + '</td>';
        plan += '</tr><tr>';
        plan += '<td>Te faltan</td><td>$' + numberWithCommas(tua - ta) + '</td>';
        plan += '</tr><tr>';
        //plan += '<td><strong>Me falta por ahorrar</strong></td><td style="font-size:18px;"><strong>$' + numberWithCommas((payment_value * yeartomonth - (payment_value * fees.saving_fees_count))) + '<strong></td>';
        plan += '</tr></table></div><br />';
        plan += '<div id="list_fee">';
        plan += '<table width="100%" class="tbl_fees"><tr style="font-size: 13px;">';
        plan += '<td width="33%">Tu aporte</td>';
        plan += '<td width="1%"></td>';
        plan += '<td width="32%">Ganancia por Rentabilidad</td>';
        plan += '<td width="1%"></td>';
        plan += '<td width="33%">Meta de ahorro</td></tr>';
        plan += '<tr style="font-size: 14px;">';

        plan += '<td>$' + numberWithCommas(tua) + '</td>';
        plan += '<td>+</td>';
        plan += '<td>$' + numberWithCommas(results.rows.item(0).saving_value - tua) + '</td>';
        plan += '<td>=</td>';
        plan += '<td>$' + numberWithCommas(results.rows.item(0).saving_value) + '</td>';
        plan += '</tr>';
        plan += '</tr></table>';
        plan += '<br />';
        plan += '<div>';
        if (((payment_value * fees.saving_fees_count) < (payment_value * yeartomonth))) {
            plan += '<span style="font-size: 14px;color: #060668;">Con la rentabilidad del ' + results.rows.item(0).saving_percent + '% anual solo es necesario ahorrar <strong>$' + numberWithCommas(payment_value * yeartomonth) + '</strong> para cumplir tu meta, la diferencia de <strong>$' + numberWithCommas(results.rows.item(0).saving_value - tua) + '</strong> es <strong>"ganancia"</strong> gracias a la rentabilidad.</span>';
            plan += '</div><br />';
        }
        plan += '<div class="fees">';
        if (results.rows.item(0).saving_finish !== 1) {
            if (((payment_value * fees.saving_fees_count) < (payment_value * yeartomonth)))
                plan += '<span class="btn_addfee" onclick="paid_fee(' + results.rows.item(0).saving_reg + ',' + payment_value + ')"><span class="fontawesome-plus" style="border: 1px solid;padding: 1px 3px 0 3px; border-radius: 2px;"></span> Agregar registro de Ahorro</span>';
            plan += '<br /><br />';
        }
        plan += '<div id="list_fees">';

//        fees.saving_fees.reverse();
//        $.each(fees.saving_fees, function(i) {
//            aa = ((payment_value) * (i + 1)).toFixed(0);
//            rp = parseInt(rp) + parseInt(gfm);
//            gfm = (aa * profitability).toFixed(0);
//            amr = parseInt(aa) + parseInt(rp);
//
//
//            plan += '<table width="100%">';
//            plan += '<tr>';
//            plan += '<td>Número</td>';
//            plan += '<td>Mes</td>';
//            plan += '<td>Ahorro acumulado</td>';
//            plan += '</tr>';
//            plan += '<tr>';
//            plan += '<td rowspan=3>' + (i + 1) + '</td>';
//            plan += '<td>' + date("d/m/Y", fees.saving_fees[i].fee_reg) + '</td>';
//            plan += '<td>$' + numberWithCommas(aa) + '</td>';
//            plan += '</tr>';
//            plan += '<tr>';
//            plan += '<td>Rentabilidad proyectada</td>';
//            plan += '<td>Ahorro + Rentabilidad</td>';
//            plan += '</tr>';
//            plan += '<tr>';
//            plan += '<td>$' + numberWithCommas(rp) + '</td>';
//            plan += '<td>$' + numberWithCommas(amr) + '</td>';
//            plan += '</tr>';
//            plan += '</table>';
//        });
        if (fees.saving_fees_count > 0) {
            plan += '<div id="list_fees">';
            plan += '<table width="100%" class="tbl_fees"><tr>';
            plan += '<td width="30%">Mes</td>';
            plan += '<td width="35%">Ahorro acumulado</td>';
            plan += '<td width="35%">Ahorro + Rentabilidad</td></tr>';

            info_saving.reverse();
            $.each(info_saving, function(i) {
                plan += '<tr>';
                plan += '<td>' + info_saving[i][0] + '</td>';
                plan += '<td>$' + info_saving[i][1] + '</td>';
                plan += '<td>$' + info_saving[i][2] + '</td>';
                plan += '</tr>';
            });
            if (fees.saving_fees.length > 1) {
                plan += '<tr>';
                plan += '<td></td>';
                plan += '<td></td>';
                plan += '<td id="more_fees" onclick="show_fees();" >Ver más <span class="fontawesome-plus" style="padding: 1px 3px 0 3px;"></span></td>';
                plan += '</tr>';
                plan += '</tr>';
            }
            plan += '</table>';
            //alert(print(info_saving));
            plan += '<span style="float:right;">Aportes realizados (' + fees.saving_fees_count + '/' + num_fees_paid.toFixed(0) + ')</span>';
            plan += '</div>';
        }
        plan += '<br /><br /></div><br />';
        plan += '<div class="options">';
        //if (results.rows.item(0).saving_finish !== 1)
        //    plan += '<button onclick="setfinish(' + window.localStorage.getItem("id_go") + ', true);">Marcar Meta como Cumplida</button><br />';
        plan += '<div class="opt_menu">';
        plan += '<span><a onclick="go_(\'blog_tips.html\');"><img src="images/tips-over.png" />Tips<br /> </a><br /></span>';
        plan += '<span><a onclick="trigger_menu();"><img src="images/compartir_act.png" />Compartir<br />Meta</a></span>';
        plan += '<span><a onclick="confirm_delplan(' + window.localStorage.getItem("id_go") + ');"><img src="images/borrar.png" />Eliminar<br />Meta</a></span>';
        plan += '</div>';

        plan += '</div>';

        $('#show_plan').show().html(plan);

    } else {
        $("#show_plan").show().html('A ocurrido un problema, por favor sinconiza los ahorros.');
    }
}

function getSqlResultFeePaid() {
    if (!db) {
        db = window.openDatabase("SaveGrow", "1.0", "Save is Grow", 200000);
    }
    db.transaction(queryDBFeePaid, errorCB);
}

function queryDBFeePaid(tx) {
    tx.executeSql('SELECT fee_reg FROM sg_fees_paid WHERE fee_parent_reg = ' + window.localStorage.getItem("id_go"), [], querySuccessFeePaid, errorCB);
}

var jsonFeePaid = "";
function querySuccessFeePaid(tx, results) {
    jsonFeePaid += '{"saving_fees_count": ' + results.rows.length + ',';
    jsonFeePaid += '"saving_fees": [';
    for (var i = 0; i < results.rows.length; i++) {
        jsonFeePaid += '{"fee_reg": ' + results.rows.item(i).fee_reg + '}';
        if (i !== (results.rows.length - 1)) {
            jsonFeePaid += ',';
        }
    }
    jsonFeePaid += ']}';
}

/*
 * updateSQL: Alista la base de datos para actualizar
 */

function updateSQL() {
    if (!db) {
        db = window.openDatabase("SaveGrow", "1.0", "Save is Grow", 200000);
    }

    db.transaction(updateDB, errorCB);
}

/*
 * updateDB: Actualiza registros en la base de datos.
 */

function updateDB(tx) {
    var sql = "UPDATE sg_savings SET saving_finish = 1 WHERE saving_reg = " + id_go;
    tx.executeSql(sql);
}

/*
 * updateSQL: Alista la base de datos para actualizar
 */

function updateNoti() {
    if (!db) {
        db = window.openDatabase("SaveGrow", "1.0", "Save is Grow", 200000);
    }

    db.transaction(updateNDB, errorCB);
}

/*
 * updateDB: Actualiza registros en la base de datos.
 */

function updateNDB(tx) {
    var sql = "UPDATE sg_savings SET saving_noti = " + saving_notification;
    tx.executeSql(sql);
}

/*
 * updateSQL: Alista la base de datos para actualizar
 */

function deleteSQL() {
    if (!db) {
        db = window.openDatabase("SaveGrow", "1.0", "Save is Grow", 200000);
    }

    db.transaction(deleteDB, errorCB);
}

/*
 * updateDB: Actualiza registros en la base de datos.
 */

function deleteDB(tx) {
    var sql = "DELETE FROM sg_savings WHERE saving_reg = " + id_go;
    tx.executeSql(sql);
    sql = "DELETE FROM sg_fees_paid WHERE fee_parent_reg = " + id_go;
    tx.executeSql(sql);
}











// api-storage   Local Storage

function readLocalStorage() {
    var value = window.localStorage.getItem("MiLlave");
    if (!value) {
        $('#local-storage-result').html("<strong>Null</strong> - Debe escribir primero");
    } else {
        $('#local-storage-result').html("El valor es: <strong>" + value + "</strong>");
    }
}
function removeItemLocalStorage() {
    window.localStorage.removeItem("MiLlave");
    $('#local-storage-result').html("Eliminada key/value: <strong>MiLlave/Valor de la llave</strong>");
}

function writeLocalStorage(type) {
    if (type === 'r') {
        window.localStorage.clear();
    }
    var username = $("#username").val();
    var email = $("#email").val();
    var password = $("#password").val();
    var country = $("#country").val();
    var _page = "index.php?mode=country_return";
    $.ajax({
        type: 'GET',
        url: _host + _page,
        data: {
            country_pref: country
        },
        success: function(data) {
            var obj = $.parseJSON(data);
            window.localStorage.setItem('username', username);
            window.localStorage.setItem('email', email);
            window.localStorage.setItem('password', md5(md5(password)));
            window.localStorage.setItem('country_pref', country);
            window.localStorage.setItem('country_name', obj.c_name);
            window.localStorage.setItem('country_return', obj.c_return);

            getSqlResultSet();
        },
        error: function(data) {
            ToastS("Problema con la conexión.");
        }
    });
}

function session_kill() {
    ToastS("<span data-localize='savings_plan'>Hasta al próxima</span>");
    window.localStorage.clear();
    window.location = 'init.html';
}

var go_ = function(where) {
    window.location = where;
};

var qualify = function() {
    if (device.platform === 'Android') {
        //Android
        navigator.app.loadUrl('http://goo.gl/npLIn', {openExternal: true});
    }
    else {
        //iOS
        navigator.app.loadUrl('http://goo.gl/5Rmwq', {openExternal: true});
    }

    stopPropagation();
    return false;

};

/*
 * Share
 */

function share_email() {
    var f_mail = '', f_subject = '', f_body = '';
    if (window.localStorage.getItem("menu") === "save") {
        f_subject = window.localStorage.getItem("username") + ' te quiere invitar a compartir su ahorro';
        f_body = 'Hola %0D%0A';
        f_body += 'Tu amigo ' + window.localStorage.getItem("username") + ' te invita a compartir su ahorro mediante la aplicación "Aprendo a ahorrar" %0D%0A';
        f_body += 'ID del ahorro: ' + window.localStorage.getItem("id_go") + ' %0D%0A %0D%0A';
        f_body += 'App Android http://goo.gl/npLIn %0D%0A';
        f_body += 'App iOS http://goo.gl/5Rmwq %0D%0A';
    } else {
        f_subject = 'Te invito a que conozcas la app móvil de aprendeaahorrar.com';
        f_body = 'Hola %0D%0A';
        f_body += 'Te invito a que conozcas la app móvil de aprendeaahorrar.com %0D%0A %0D%0A';
        f_body += 'App Android http://goo.gl/npLIn %0D%0A';
        f_body += 'App iOS http://goo.gl/5Rmwq %0D%0A';
    }
    window.location = 'mailto:' + f_mail + '?subject=' + f_subject + '&body=' + f_body;
}

function search_phone() {
    window.location = 'lst_contact.html';
}

function share_facebook() {
    window.location = 'lst_fb_friends.html';
}

function share_twitter() {
    window.location = 'lst_tw_friends.html';
}

/* Menú */

function share_menu()
{
    var cls = (device.platform === 'Android') ? 'android' : 'ios';
    $('#share').attr('class', cls);
    window.localStorage.setItem('menu', 'app');
    $('#share').slideToggle(200);
}


/*
 * sync_savings(): Obtiene la información de las metas desde el servidor para poder sincrinizarlos en la BD del dispositivo.
 * @returns {qwe,obj}: Array
 */

function sync_savings() {

    var saving_user = window.localStorage.getItem("email");
    var _page = "index.php?mode=obj_user";
    if (connect) {
        $.ajax({
            type: 'GET',
            url: _host + _page,
            data: {
                saving_user: saving_user
            },
            success: function(data) {
                switch (data.charAt(0)) {
                    case '[':
                        var obj = $.parseJSON(data);
                        /* Sincronizar */
                        var qwe = ['saving_user', 'saving_reg', 'saving_type', 'saving_name', 'saving_value', 'saving_percent', 'saving_long', 'saving_noti', 'saving_finish'];
                        insertSQL_savings(qwe, obj);
                        /* Sincronizar */
                        break;
                    default :
                        $("#lst_plans").show().html('An error occurred in list.' + data);
                        break;
                }
            },
            error: function() {
                $("#lst_plans").show().html('An error occurred on the device.');
            }
        });
    } else {
        ToastS("No hay conexión a internet");
    }
}

/*
 * sync(): Obtiene la información de los pagos de los ahorros desde el servidor para poder sincrinizarlos en la BD del dispositivo.
 * @returns {qwe,obj}: Array
 */

function sync_fees() {
    var saving_user = window.localStorage.getItem("email");

    var _page = "index.php?mode=get_fees_paid";
    if (connect) {
        $.ajax({
            type: 'GET',
            url: _host + _page,
            data: {
                saving_user: saving_user
            },
            success: function(data) {
                switch (data.charAt(0)) {
                    case '[':
                        var obj = $.parseJSON(data);
                        /* Sincronizar */
                        var qwe = ['fee_reg', 'fee_parent_reg', 'fee_value'];
                        insertSQL_fees(qwe, obj);
                        /* Sincronizar */
                        break;
                    default :
                        $("#lst_plans").show().html('An error occurred in list.' + data);
                        break;
                }
            },
            error: function() {
                $("#lst_plans").show().html('An error occurred on the device.');
            }
        });
    } else {
        ToastS("No hay conexión a internet");
    }
}
var saving_notification = 1;
$(document).ready(function()
{

    if (!window.localStorage.getItem("saving_notification")) {
        window.localStorage.setItem('saving_notification', 1);
    }
    window.localStorage.getItem("saving_notification") === '1' ? $('#1').attr('checked', 'checked') : $('#1').removeAttr('checked');

    if (window.localStorage.getItem("email") && window.localStorage.getItem("username")) {
        $('.content').css('min-height', '90%');
    }

    $("#1").change(function() {
        saving_notification = $("#1").is(":checked") ? 1 : 0;
        updateNoti();
        window.localStorage.setItem('saving_notification', saving_notification);
        console.log("Notificaciones actualizadas a " + saving_notification);
        //$('input[type=checkbox].css-checkbox:checked + label.css-label').css('background-position', saving_notification ? '0 -15px' : '0 0');
    });

});

$(document).bind('pageinit', function() {
    $(document).click(function(e) {
        if (e.srcElement.className != 'show-menu ui-link') {
            $('#share').slideUp(200);
        }
    });

    $('#share').click(function() {
        $(this).slideUp(200);
    });
});

$(window).bind('touchmove', function(e) {
    $('.content').css('background-position', '0% 100%');
});

var print = function(o) {
    var str = '';

    for (var p in o) {
        if (typeof o[p] === 'string') {
            str += p + ': ' + o[p] + '; \n';
        } else {
            str += p + ': { \n' + print(o[p]) + '}';
        }
    }

    return str;
};