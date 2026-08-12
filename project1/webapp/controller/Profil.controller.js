sap.ui.define([
    "project1/controller/BaseController"
], function (BaseController) {
    "use strict";
    return BaseController.extend("project1.controller.Profil", {
        onInit: function () {
            this.setupShell({ title: "Profilverwaltung", nav: "start" });
        },
        onSave: function () {
            this.toast("msgSaved");
        },
        onChangePicture: function () {
            this.toast("msgSaved");
        }
    });
});
