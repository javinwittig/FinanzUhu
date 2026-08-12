sap.ui.define([
    "project1/controller/BaseController",
    "project1/model/themeHelper"
], function (BaseController, themeHelper) {
    "use strict";
    return BaseController.extend("project1.controller.Graph", {
        onInit: function () {
            this.setupShell({
                title: "Entwicklung & Trends",
                nav: "graph"
            });
        },

        onAfterRendering: function () {
            var oVizFrame = this.byId("trendChart");
            if (oVizFrame && !oVizFrame._fhRegistered) {
                oVizFrame._fhRegistered = true;
                // income = green, expense = red; keep axis titles hidden
                themeHelper.registerChart(oVizFrame, {
                    plotArea: { colorPalette: ["#28c76f", "#ea5455"], dataLabel: { visible: false } },
                    categoryAxis: { title: { visible: false } },
                    valueAxis: { title: { visible: false } }
                });
            }
        }
    });
});
