var intervalCounter = 0;

function hideToast() {
    var alert = document.getElementById("toast");
    alert.style.opacity = 0;
    clearInterval(intervalCounter);
}

function drawToast(message, time) {

    var alert = document.getElementById("toast");

    if (alert === null) {
        var toastHTML = '<div id="toast">' + message + '</div>';
        $('#toast').css('margin-left', (-1 * ($('#toast').width() / 1.5)) + "px");
        document.body.insertAdjacentHTML('beforeEnd', toastHTML);
    }
    else {
        alert.innerHTML = message;
        alert.style.opacity = 0.8;
        $('#toast').css('margin-left', (-1 * ($('#toast').width() / 1.5)) + "px");
    }

    intervalCounter = setInterval("hideToast()", time);
}

function ToastL(string) {
    drawToast(string, 2000);
}

function ToastS(string) {
    drawToast(string, 1500);
}
