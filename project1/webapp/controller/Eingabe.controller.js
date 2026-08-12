sap.ui.define([
    "project1/controller/BaseController"
], function (BaseController) {
    "use strict";
    return BaseController.extend("project1.controller.Eingabe", {
        onInit: function () {
            this.setupShell({ title: "Neue Eingabe", nav: "eingabe" });
        },
        onAdd: function () {
            this.toast("msgEntryAdded");
        }
    });
});
