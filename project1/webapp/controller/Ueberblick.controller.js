sap.ui.define([
    "project1/controller/BaseController"
], function (BaseController) {
    "use strict";
    return BaseController.extend("project1.controller.Ueberblick", {
        onInit: function () {
            this.setupShell({ title: "Überblick", nav: "start", showLive: true });
        }
    });
});
