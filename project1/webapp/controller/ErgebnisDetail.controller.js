sap.ui.define([
    "project1/controller/BaseController"
], function (BaseController) {
    "use strict";
    return BaseController.extend("project1.controller.ErgebnisDetail", {
        onInit: function () {
            this.setupShell({ title: "Ergebnis & Rentabilität", nav: "buchhaltung", showLive: false });
        }
    });
});
