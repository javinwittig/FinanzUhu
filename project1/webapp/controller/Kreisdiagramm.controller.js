sap.ui.define([
    "project1/controller/BaseController",
    "project1/model/themeHelper"
], function (BaseController, themeHelper) {
    "use strict";
    return BaseController.extend("project1.controller.Kreisdiagramm", {
        onInit: function () {
            this.setupShell({
                title: "Kreisdiagramm",
                nav: "kreisdiagramm"
            });
        },

        onAfterRendering: function () {
            var oVizFrame = this.byId("donutChart");
            if (oVizFrame && !oVizFrame._fhRegistered) {
                oVizFrame._fhRegistered = true;
                themeHelper.registerChart(oVizFrame);
            }
        }
    });
});
