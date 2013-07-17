/* Copyright (c) 2012 Mobile Developer Solutions. All rights reserved.
 * This software is available under the MIT License:
 * The MIT License
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software 
 * and associated documentation files (the "Software"), to deal in the Software without restriction, 
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, 
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software 
 * is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies 
 * or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR 
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE 
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, 
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// api-notification
var showAlert = function() {
    function alertDismissed() {
        console.log("Alert dismissed");
    }
    navigator.notification.alert(
            'You are the winner!', // message
            alertDismissed, // callback
            'Game Over', // title
            'Done'                  // buttonName
            );
};

var showConfirm = function() {
    function onConfirm() {
                window.location = 'goal_list.html';
    }
    if (ismobile) {
        navigator.notification.alert(
                'Has creado tu meta correctamente', // message
                onConfirm, // callback to invoke with index of button pressed
                '¡Meta Guardada!', // title
                'Continuar'    // buttonLabels
                );
    } else {
        alert('¡Meta Guardada! pero función solo para moviles.');
        window.location = 'goal_list.html';
    }
};

var confirmShare = function() {
    function onConfirm(button) {
        switch (button) {
            case 1:
                $('#info_shared').show().html('<p style="color:red;">Solitud cancelada.</p>');
                break;
            case 2:
                send_request_goal();
                break;
        }
    }
    if (ismobile) {
        navigator.notification.confirm(
                'Enviar solicitud para compartir este ahorro.', // message
                onConfirm, // callback to invoke with index of button pressed
                'Solicitar Ahorro', // title
                'Cancelar,Solicitar'    // buttonLabels
                );
    } else {
        ToastL('Función solo para moviles.');
        window.location = 'goal_list.html';
    }
};

var beep = function() {
    navigator.notification.beep(2);
};

var vibrate = function() {
    navigator.notification.vibrate(0);
};
