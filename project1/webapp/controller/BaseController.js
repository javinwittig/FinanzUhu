sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/MessageToast",
    "project1/controller/formatter"
], function (Controller, UIComponent, MessageToast, formatter) {
    "use strict";

    return Controller.extend("project1.controller.BaseController", {

        formatter: formatter,

        /**
         * Convenience getter for the router.
         * @returns {sap.m.routing.Router} the router instance
         */
        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },

        /**
         * Convenience getter for the i18n resource bundle.
         * @returns {sap.base.i18n.ResourceBundle} the resource bundle
         */
        getBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        /**
         * Navigate to a named route.
         * @param {string} sRoute the route name
         */
        navTo: function (sRoute) {
            this.getRouter().navTo(sRoute);
        },

        /**
         * Update the shared shell state (title, active bottom-nav item, live toggle
         * visibility) consumed by the single ShellBar + IconTabBar in the App root view.
         * Every page controller calls this once in onInit.
         * @param {object} oConfig { title, nav, showLive }
         */
        setupShell: function (oConfig) {
            var oModel = this.getOwnerComponent().getModel("appView");
            oModel.setProperty("/title", oConfig.title || "");
            oModel.setProperty("/nav", oConfig.nav || "start");
            oModel.setProperty("/showLive", !!oConfig.showLive);
        },

        /**
         * KPI card headerPress → drill-down navigation. The card carries a CustomData
         * entry "kpi" identifying which figure was clicked.
         * @param {sap.ui.base.Event} oEvent the headerPress event
         */
        onKpiPress: function (oEvent) {
            var sKpi = oEvent.getSource().data("kpi");
            var mMap = {
                income: "einnahmen",
                result: "ergebnis",
                expenses: "ausgaben"
            };
            if (mMap[sKpi]) {
                this.navTo(mMap[sKpi]);
            }
        },

        /* --- User chip / notifications ----------------------------------- */
        onOpenProfile: function () { this.navTo("profil"); },
        onNotifications: function () {
            MessageToast.show("Keine neuen Benachrichtigungen");
        },

        /**
         * Show a translated toast message.
         * @param {string} sKey i18n key
         * @param {array} [aArgs] optional arguments for the message text
         */
        toast: function (sKey, aArgs) {
            MessageToast.show(this.getBundle().getText(sKey, aArgs));
        }
    });
});
