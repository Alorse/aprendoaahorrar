$(document).ready(function()
{
    document.addEventListener("deviceready", onDeviceT, true);
    //Para que funcione en el simulador.
    onDeviceT();
});

var where = 'load';
function onDeviceT() {
    (device.platform === 'Android') ? $('.back').hide() : '';

    var username = window.localStorage.getItem("username");
    var f_name = username.split(' ');
    var first_n = (f_name[0].length > 10) ? f_name[0].substring(0, 10) + '.' : f_name[0];
    $('#loadname').html(first_n + '<span class="btn_close"></span>');
    $('.content').css('padding-bottom', '70px');
    
    document.addEventListener("menubutton", onMenuButtonT, false);
    document.addEventListener("backbutton", onBackbuttonT, false);


    $('#personal').click(function() {
        if ($('input[id=personal]').is(':checked')) {
            $('.personal').show();
        } else {
            $('.personal').hide();
        }
    });

    $('#vivienda').click(function() {
        if ($('input[id=vivienda]').is(':checked')) {
            $('.vivienda').show();
        } else {
            $('.vivienda').hide();
        }
    });

    $('#estudio').click(function() {
        if ($('input[id=estudio]').is(':checked')) {
            $('.estudio').show();
        } else {
            $('.estudio').hide();
        }
    });
    $('#tip').hide();
    load_tips();
    
    $('.btn_close').click(function() {
        $(this).toggleClass('btn_closactive');
        $('.menu_up').toggle();
    });
}


var onBackbuttonT = function() {
    if (where === 'load')
        window.location = 'goal_list.html';
    else {
        where = 'load';
        go_tips();
    }
};

var onMenuButtonT = function() {
    ToastS('Tips de ahorro');
};

var xml = "";
var load_tips = function() {
    where = 'load';
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

    var _page = "index.php?mode=tip_xml";

    $.ajax({
        type: 'GET',
        url: _host + _page,
        dataType: "xml",
        data: {
            country: window.localStorage.getItem("country_pref")
        },
        success: function(data) {
            var html = "";
            xml = data;
            var type = '';

            html += "<ul>";
            $(xml).find('item').each(function(p)
            {
                switch ($(this).find('type').text()) {
                    case '0':
                        type = 'oculto';
                        break;
                    case '1':
                        type = 'personal';
                        break;
                    case '2':
                        type = 'estudio';
                        break;
                    case '3':
                        type = 'vivienda';
                        break;
                    default:

                        break;
                }
                html += "<li class='" + type + "' style='height: 30px;' onclick='view_tip(" + p + ");'><span class='arrowr' style='margin-top: 8px;'></span>";
                html += $(this).find('title').text() + "</li>";

            });
            html += "</ul>";
            spinner.remove();
            $("#output_tips").html(html);
        },
        error: function(data) {
            console.log(data);
            spinner.remove();
        }
    });
};

var view_tip = function(position) {
    where = 'view';
    $('#tips').hide();
    $('#tip').show();
    var html = "";
    $(xml).find('item').each(function(p)
    {
        if (p === position) {
            var max_width = ((screen.width * 1) - 25);
            console.log("Ancho maximo " + max_width);
            html += "<div>";
            html += "<h3 style='margin-bottom: 0px;'>" + $(this).find('title').text() + "</h3>";
            if ($(this).find('image').text() !== '')
                html += "<img src='" + $(this).find('image').text() + "' style='max-width: 96%;' />";
            html += "<br />";
            html += "<p>" + $(this).find('description:first').text() + "</p>";
            html += "</div>";
        }
    });
    $("#piece_tip").html(html);
};

var go_tips = function() {
    $('#tips').show();
    $('#tip').hide();
};