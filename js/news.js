$(document).ready(function()
{
    document.addEventListener("deviceready", onDeviceN, true);
    //Para que funcione en el simulador.
    onDeviceN();
});

var where = 'load';
function onDeviceN() {
    (device.platform === 'Android') ? $('.back').hide() : '';
    $('.content').css('padding-bottom', '70px');

    var username = window.localStorage.getItem("username");
    var f_name = username.split(' ');
    var first_n = (f_name[0].length > 10) ? f_name[0].substring(0, 10) + '.' : f_name[0];
    $('#loadname').html(first_n + '<span class="btn_close"></span>');
    document.addEventListener("menubutton", onMenuButtonN, false);
    document.addEventListener("backbutton", onBackbuttonN, false);
    $('#news').hide();
    load_news();

    $('.btn_close').click(function() {
        $(this).toggleClass('btn_closactive');
        $('.menu_up').toggle();
    });
}

var onBackbuttonN = function() {
    if (where === 'load')
        window.location = 'goal_list.html';
    else {
        go_blog();
        where = 'load';
    }
};

var onMenuButtonN = function() {
    ToastS('Noticias');
};

var xml = "";
function load_news() {
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

    var _page = "index.php?mode=read_xml";

    $.ajax({
        type: 'GET',
        url: _host + _page,
        dataType: "xml",
        data: {
            country: window.localStorage.getItem("country_pref")
        },
        success: function(data) {
            var html = "";
            var htmlc = "";
            xml = data;
            //xml = data.replace("<img ", "<img style='max-width: " + (screen.width - 10) + "px' ");
            var categories = new Array();
            categories.push('Todas las categorias');
            html += "<ul>";
            $(xml).find('item').each(function(p)
            {
                categories.push($(this).find('category').text());
                var des = $(this).find('description:first').text();
                html += "<li class='" + $(this).find('category').text().replace(' ', '_') + "' style='min-height: 30px;' onclick='view_news(" + p + ");'><span class='arrowr' style='margin-top: 8px;'></span>";
                if ($(des).find('img:first').attr('src').charAt(1) === '/' || $(des).find('img:first').attr('src').charAt(0) === '/') {
                    var newString = $(des).find('img:first').attr('src').replace('/', 'http://www.aprendoaahorrar.com/');
                    html += "<img src='" + newString + "' width='35' style='float:left; margin-right: 5px;' />";
                } else {
                    html += "<img src='" + $(des).find('img:first').attr('src') + "' width='35' style='float:left; margin-right: 5px;' />";
                }
                html += $(this).find('title').text() + "</li>";

            });
            html += "</ul>";

            var uniquecategories = new Array();
            htmlc += "<label class='sel'><select id='cate'>";
            $.each(categories, function(i, el) {
                if ($.inArray(el, uniquecategories) === -1) {
                    uniquecategories.push(el);
                    htmlc += "<option value='" + el.replace(' ', '_') + "'>" + el + "</option>";
                }
            });
            htmlc += "</select></label>";
            //alert(uniquecategories);
            spinner.remove();

            $("#output_categories").html(htmlc);
            $("#output_news").html(html);
            opt_cat(uniquecategories);
        },
        error: function(data) {
            console.log(data);
            spinner.remove();
        }
    });
}

var view_news = function(position) {
    where = 'view';
    $('#blog').hide();
    $('#news').show();
    var html = "";
    $(xml).find('item').each(function(p)
    {
        if (p === position) {
            html += "<div>";
            html += "<h3 style='margin-bottom: 0px;'>" + $(this).find('title').text() + "</h3>";
            html += "<span style='font-size:10px;'>" + $(this).find('creator').text() + ", " + $(this).find('pubDate').text() + "</span>";
            html += "<br />";
            var des = $(this).find('description:first').text();

            //des = des.replace('<img ', '<img style="max-width: 300px" ');
            if ($(des).find('img:first').attr('src').charAt(1) === '/' || $(des).find('img:first').attr('src').charAt(0) === '/') {
                html += "<p>" + des.replace('/', 'http://www.aprendoaahorrar.com/') + "</p>";
            } else {
                html += "<p>" + des + "</p>";
            }
            html += "";
            html += "</div>";
        }
    });
    html = html.replace('<img', '<img style="max-width: ' + ((screen.width) - 40) + 'px"');
    $("#piece_news").html(html);
};

var go_blog = function() {
    $('#blog').show();
    $('#news').hide();
};

var contains = function(a, obj) {
    var i = a.length;
    while (i--) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
};


// Vaya!!! me gastaste mucho tiempo metodo HP
var opt_cat = function(cats) {
    $('#cate').change(function() {
        var val = $("#cate option:selected").val();
        if (val !== "Todas_las categorias") {
            $.each(cats, function(i, el) {
                $('.' + el.replace(' ', '_')).show();
            });
            $.each(cats, function(i, el) {
                if (el.replace(' ', '_') !== val) {
                    $('.' + el.replace(' ', '_')).hide();
                }
            });
        } else {
            $.each(cats, function(i, el) {
                $('.' + el.replace(' ', '_')).show();
            });
        }
    });
};