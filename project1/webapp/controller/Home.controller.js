sap.ui.define([
    "project1/controller/BaseController",
    "project1/model/themeHelper"
], function (BaseController, themeHelper) {
    "use strict";
    return BaseController.extend("project1.controller.Home", {
        onInit: function () {
            this.setupShell({
                title: "Start / Home",
                nav: "start",
                ytd: false
            });
        },
        onAfterRendering: function () {
            var oVizFrame = this.byId("trendLineChart");
            if (oVizFrame && !oVizFrame._fhRegistered) {
                oVizFrame._fhRegistered = true;
                themeHelper.registerChart(oVizFrame, {
                    plotArea: { colorPalette: ["#28c76f", "#ea5455"], dataLabel: { visible: false } },
                    categoryAxis: { title: { visible: false } },
                    valueAxis: { title: { visible: false } }
                });
                // re-apply theme colours whenever the chart re-renders
                oVizFrame.attachRenderComplete(function () {
                    themeHelper.styleChart(oVizFrame);
                });
                // The first paint can happen before the card has its final
                // width; re-render once so the canvas matches the full card.
                setTimeout(function () {
                    oVizFrame._fhSized = true;
                    oVizFrame.invalidate();
                }, 0);
            }
        },
        onManageProfile: function () {
            this.navTo("profil");
        }
    });
});
