sap.ui.define([
    "project1/controller/BaseController"
], function (BaseController) {
    "use strict";
    return BaseController.extend("project1.controller.Buchhaltung", {
        onInit: function () {
            this.setupShell({ title: "Buchhaltung / Ledger", nav: "buchhaltung", showLive: false });
        },
        onExport: function () {
            this.toast("msgExport");
        },
        onDetails: function () {
            this.toast("details");
        }
    });
});
