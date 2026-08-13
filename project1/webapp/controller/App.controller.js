sap.ui.define([
    "project1/controller/BaseController",
    "project1/model/themeHelper",
    "sap/ui/core/Fragment",
    "sap/ushell/ui/shell/ShellHeadItem"
], function (BaseController, themeHelper, Fragment, ShellHeadItem) {
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
            // Move the former ShellBar features (title, settings, notifications)
            // into the FLP Sandbox shell header that the app runs inside of.
            this._initSandboxHeader();
        },

        /**
         * Keep the single shell title + bottom IconTabBar selection in sync
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
            // Hide the floating chatbot button while the chatbot page is open
            // (it provides its own navigation).
            oModel.setProperty("/showChatFab", sName !== "chatbot");
            // Mirror the route title into the FLP Sandbox shell header.
            if (this._oShellUIService) {
                this._oShellUIService.setTitle(oCfg.title);
            }
        },

        /**
         * Push the application's header features into the FLP Sandbox shell
         * header (settings + notifications buttons, dynamic title). The sandbox
         * shell already provides the user/avatar (Me) area.
         */
        _initSandboxHeader: function () {
            var that = this;
            if (!(sap.ushell && sap.ushell.Container)) {
                return;
            }
            sap.ushell.Container.getServiceAsync("ShellUIService").then(function (oShellUIService) {
                that._oShellUIService = oShellUIService;
                var oBundle = that.getBundle();
                var sViewId = that.getView().getId();

                oShellUIService.addHeaderItem(new ShellHeadItem({
                    id: sViewId + "-homeHead",
                    icon: "sap-icon://home",
                    tooltip: oBundle.getText("navStart"),
                    press: that.onNavHome.bind(that)
                }), true, true);

                oShellUIService.addHeaderItem(new ShellHeadItem({
                    id: sViewId + "-settingsHead",
                    icon: "sap-icon://action-settings",
                    tooltip: oBundle.getText("settings"),
                    press: that.onOpenSettings.bind(that)
                }), true, true);

                oShellUIService.addHeaderItem(new ShellHeadItem({
                    id: sViewId + "-notifHead",
                    icon: "sap-icon://bell",
                    tooltip: "Benachrichtigungen",
                    press: that.onNotifications.bind(that)
                }), true, true);

                // Apply the title for the route that is active at startup.
                oShellUIService.setTitle(that.getOwnerComponent().getModel("appView").getProperty("/title"));
            }).catch(function () {
                // ShellUIService is not available (e.g. standalone / local serve).
                // The app keeps working without the sandbox header items.
            });
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

        /**
         * Open the chatbot page from the floating bottom-left button.
         */
        onOpenChatbot: function () {
            this.navTo("chatbot");
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
