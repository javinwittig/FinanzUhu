sap.ui.define([
    "project1/controller/BaseController"
], function (BaseController) {
    "use strict";
    return BaseController.extend("project1.controller.Home", {
        onInit: function () {
            this.setupShell({
                title: "Start / Home",
                nav: "start",
                ytd: false
            });
        },
        onManageProfile: function () {
            this.navTo("profil");
        }
    });
});
