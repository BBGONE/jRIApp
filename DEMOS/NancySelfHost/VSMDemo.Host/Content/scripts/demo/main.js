define(["require", "exports", "jriapp", "./gridDemo"], function (require, exports, RIAPP, DEMO) {
    "use strict";
    var bootstrap = RIAPP.bootstrap, $http = RIAPP.Utils.http;
    function start(mainOptions) {
        mainOptions = RIAPP.Utils.core.extend(DEMO.appOptions, mainOptions);
        bootstrap.startApp(function () { return new DEMO.DemoApplication(mainOptions); }, function (thisApp) {
            thisApp.loadTemplates(mainOptions.templates_url);
            thisApp.registerTemplateLoader('productEditTemplate', RIAPP.Utils.core.memoize(function () {
                return $http.getAjax(mainOptions.productEditTemplate_url);
            }));
        });
    }
    exports.start = start;
});
