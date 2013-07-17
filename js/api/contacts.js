$(document).ready(function()
{
    document.addEventListener("deviceready", onDeviceLC, true);
});

function onDeviceLC() {
    (device.platform === 'Android') ? $('.back').hide() : '';
    
    var username = window.localStorage.getItem("username");
    var f_name = username.split(' ');
    var first_n = (f_name[0].length > 10) ? f_name[0].substring(0, 10) + '.' : f_name[0];
    $('#loadname').html(first_n + '<span class="btn_close"></span>');
    document.addEventListener("menubutton", onMenuButtonLC, false);
    document.addEventListener("backbutton", onBackbuttonLC, false);
    $('body').height($(window).height() - 70);
    $(window).resize(function() {
        $('body').height($(window).height() - 70);
    });
    $(window).trigger('resize');
}

var onBackbuttonLC = function() {
    go_back();
};

var onMenuButtonLC = function() {
    ToastS('Compartir');
};

var go_back = function(){
    if(window.localStorage.getItem("menu") === "save"){
        window.location = 'goal_view.html';
    } else {
        window.location = 'goal_list.html';
    }
};

// api-contacts
function contacts_success(contacts) {
    $('#contacts-output').html("<strong>" + contacts.length + "</strong> contacts returned.");
    for (var i = 0; i < contacts.length; i++) {
        if (contacts[i].name && contacts[i].name.formatted) {
            $('#contacts-output').append("<br/>Contact " + (i + 1) + " is <strong>" +
                    contacts[i].name.formatted + "</strong>");
            break;
        }
    }
}

function contacts_fail(error) {
    $('#contacts-output').html("<strong>Error getting contacts.</strong>");
}

function get_contacts() {
    var obj = new ContactFindOptions();
    obj.filter = "";
    obj.multiple = true;
    navigator.contacts.find(
            ["displayName", "name"], contacts_success,
            contacts_fail, obj);
}



// Cordova is ready
//
var spinner;
function scarb() {
    /* Genera el load giratorio mientras se hacen peticiones al servidor. */
    if ($('#s_conta').val().length > 1) {
        spinner = Spinners.create('#spinner', {
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
        // find all contacts with 'Bob' in any name field
        var options = new ContactFindOptions();
        options.filter = $('#s_conta').val();
        options.multiple = true;
        var fields = ["displayName", "name", "phoneNumbers"];
        navigator.contacts.find(fields, onSuccess, onError, options);
    } else {
        ToastL('Debes ingresar al menos 3 letras');
    }
}

// onSuccess: Get a snapshot of the current contacts
//
function onSuccess(contacts) {

    var cont = '';
    var find = false;
    cont += '<p>' + contacts.length + ' resultados, algunos sin número telefonico por lo cual no fueron mostrados.</p>';
    cont += '<p>Selecciona el número de teléfono.</p>';
    cont += '<ul>';
    for (var i = 0; i < contacts.length; i++) {
        if (contacts[i].displayName) {
            find = true;
            spinner.remove();
            if (contacts[i].phoneNumbers !== null) {
                cont += "<li style='background-color: #EFEFEF;'>" + contacts[i].displayName + "</li>";
                for (var j = 0; j < contacts[i].phoneNumbers.length; j++) {
                    cont += "<li style='color: #333;' onclick='share_phonebook(" + (contacts[i].phoneNumbers[j].value).replace(/[^0-9+]+/g, '') + ")'>" + (contacts[i].phoneNumbers[j].value).replace(/[^0-9+]+/g, '') + "</li>";
                }
            }
        }
        if (!find && (contacts.length > 0)) {
            cont += 'Los resultados encontrados no tenian número telefonico.';
        }
        spinner.remove();
        $('#contacts-output').html(cont);
    }
    cont += '</ul>';
}
// onError: Failed to get the contacts
//
function onError(contactError) {
    ToastL('unError :S!');
}

function share_phonebook(f_num) {
    var f_body = 'Hola %0D%0A';
    if (window.localStorage.getItem("menu") === "save") {
        f_body += 'Quiero invitarte a compartir mi ahorro mediante la aplicación "aprendo a ahorrar" %0D%0A';
        f_body += 'ID del ahorro: ' + window.localStorage.getItem("id_go");
    } else {
        f_body += 'Te invito a que conozcas la app móvil de aprendeaahorrar.com %0D%0A %0D%0A';
        f_body += 'App Android http://goo.gl/npLIn %0D%0A';
        f_body += 'App iOS http://goo.gl/5Rmwq %0D%0A';
    }
    window.location = 'sms:' + f_num + '?body=' + f_body;
}