sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "project1/model/models",
    "project1/model/themeHelper"
], (UIComponent, JSONModel, models, themeHelper) => {
    "use strict";

    return UIComponent.extend("project1.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // apply the persisted colour-scheme preference before the UI renders
            var sThemePref = themeHelper.getPreference();
            themeHelper.apply(sThemePref);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");

            // shared shell state (active nav item, page title, live toggle
            // visibility, theme preference), written by App/page controllers and
            // consumed by the single ShellBar + IconTabBar in the App root view.
            this.setModel(new JSONModel({
                title: "",
                nav: "start",
                showLive: false,
                theme: sThemePref,
                compact: true,
                showChatFab: true
            }), "appView");

            // enable routing
            this.getRouter().initialize();
        }
    });
});
