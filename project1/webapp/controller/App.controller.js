sap.ui.define([
    "project1/controller/BaseController",
    "project1/model/themeHelper",
    "sap/ui/core/Fragment"
], function (BaseController, themeHelper, Fragment) {
    "use strict";

    // Per-route shell configuration: page title, active bottom-nav key, and
    // whether the live-mode toggle is shown. Detail screens map to the closest
    // primary tab.
    var mRoutes = {
        home:          { title: "Start / Home",            nav: "start",         showLive: false },
        profil:        { title: "Profilverwaltung",        nav: "start",         showLive: false },
        eingabe:       { title: "Neue Eingabe",            nav: "eingabe",       showLive: false },
        buchhaltung:   { title: "Buchhaltung / Ledger",    nav: "buchhaltung",   showLive: false },
        kreisdiagramm: { title: "Kreisdiagramm",           nav: "kreisdiagramm", showLive: false },
        graph:         { title: "Entwicklung & Trends",    nav: "graph",         showLive: false },
        einnahmen:     { title: "Einnahmen Details",       nav: "buchhaltung",   showLive: false },
        ausgaben:      { title: "Ausgaben Details",        nav: "buchhaltung",   showLive: false },
        ergebnis:      { title: "Ergebnis & Rentabilität", nav: "buchhaltung",   showLive: false },
        ueberblick:    { title: "Überblick",               nav: "start",         showLive: true }
    };

    return BaseController.extend("project1.controller.App", {
        onInit: function () {
            this.getRouter().attachRouteMatched(this._onRouteMatched, this);
            // apply the initial content density (compact by default)
            this._applyDensity(this.getOwnerComponent().getModel("appView").getProperty("/compact"));
        },

        /**
         * Keep the single ShellBar title + bottom IconTabBar selection in sync
         * with the active route.
         * @param {sap.ui.base.Event} oEvent the routeMatched event
         */
        _onRouteMatched: function (oEvent) {
            var sName = oEvent.getParameter("name");
            var oCfg = mRoutes[sName] || { title: "", nav: "start", showLive: false };
            var oModel = this.getOwnerComponent().getModel("appView");
            oModel.setProperty("/title", oCfg.title);
            oModel.setProperty("/nav", oCfg.nav);
            oModel.setProperty("/showLive", oCfg.showLive);
        },

        /**
         * Bottom IconTabBar selection → route navigation.
         * @param {sap.ui.base.Event} oEvent the select event
         */
        onNavSelect: function (oEvent) {
            var mMap = {
                start: "home",
                eingabe: "eingabe",
                buchhaltung: "buchhaltung",
                kreisdiagramm: "kreisdiagramm",
                graph: "graph"
            };
            var sKey = oEvent.getParameter("key");
            if (mMap[sKey]) {
                this.navTo(mMap[sKey]);
            }
        },

        onNavHome: function () {
            this.navTo("home");
        },

        /* --- Settings popover ------------------------------------------- */

        /**
         * Open the settings popover next to the shell settings button.
         * @param {sap.ui.base.Event} oEvent the press event
         */
        onOpenSettings: function (oEvent) {
            var oButton = oEvent.getSource();
            var oView = this.getView();
            if (!this._pSettings) {
                this._pSettings = Fragment.load({
                    id: oView.getId(),
                    name: "project1.view.fragment.Settings",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    return oPopover;
                });
            }
            this._pSettings.then(function (oPopover) {
                oPopover.openBy(oButton);
            });
        },

        /**
         * Colour-scheme change (Hell / Dunkel / Auto).
         * @param {sap.ui.base.Event} oEvent the selectionChange event
         */
        onThemeChange: function (oEvent) {
            var sKey = oEvent.getParameter("item").getKey();
            this.getOwnerComponent().getModel("appView").setProperty("/theme", sKey);
            themeHelper.setPreference(sKey);
        },

        /**
         * Toggle compact / cozy content density.
         * @param {sap.ui.base.Event} oEvent the change event
         */
        onDensityChange: function (oEvent) {
            this._applyDensity(oEvent.getParameter("state"));
        },

        /**
         * Apply the content density class to the document body.
         * @param {boolean} bCompact true for compact, false for cozy
         */
        _applyDensity: function (bCompact) {
            var oBody = document.body;
            oBody.classList.toggle("sapUiSizeCompact", !!bCompact);
            oBody.classList.toggle("sapUiSizeCozy", !bCompact);
        }
    });
});
