var LocalePlugin = {
    localeFunction: function(success, fail, resultType) {
        return cordova.exec(success, fail,
                "com.aprendoaahorrar.plugins.LocalePlugin",
                "nativeAction", [resultType]);
    }
};

function localePlugin(returnSuccess) {
    LocalePlugin.localeFunction(localeResultHandler, localeErrorHandler, returnSuccess);
}
function localeResultHandler(result) {
    var opts = {language: result, pathPrefix: "js/locates", skipLanguage: "en"};
    $("[data-localize]").localize("locate", opts);
}
function localeErrorHandler(error) {
    ToastL(error);
}

document.addEventListener("deviceready", function() {
    localePlugin('Language');
}, true);