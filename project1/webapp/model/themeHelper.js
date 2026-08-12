sap.ui.define([
    "sap/ui/core/Theming"
], function (Theming) {
    "use strict";

    var STORAGE_KEY = "finanzuhu.theme";
    var LIGHT = "sap_horizon";
    var DARK = "sap_horizon_dark";

    // Charts (sap.viz) need explicit label/legend colours per theme, otherwise
    // they render dark-on-dark or light-on-light. Registered VizFrames are
    // restyled whenever the theme changes.
    var aVizFrames = [];

    function isDarkTheme(sTheme) {
        return /dark|hcb/i.test(sTheme || Theming.getTheme());
    }

    function chartColors() {
        var bDark = isDarkTheme();
        return {
            palette: ["#3d7dff", "#28c76f", "#ea5455", "#00cfe8", "#ffce54"],
            label: bDark ? "#c7d0e0" : "#42526e",
            dataLabel: bDark ? "#e6ebf5" : "#32363a"
        };
    }

    var ThemeHelper = {
        LIGHT: LIGHT,
        DARK: DARK,

        /**
         * Resolve the persisted preference to a concrete UI5 theme id.
         * @param {string} sPref "light" | "dark" | "auto"
         * @returns {string} a UI5 theme id
         */
        resolve: function (sPref) {
            if (sPref === "light") { return LIGHT; }
            if (sPref === "dark") { return DARK; }
            // auto → follow the OS colour scheme
            var bPrefersDark = window.matchMedia &&
                window.matchMedia("(prefers-color-scheme: dark)").matches;
            return bPrefersDark ? DARK : LIGHT;
        },

        /**
         * Read the stored preference (defaults to "dark").
         * @returns {string} "light" | "dark" | "auto"
         */
        getPreference: function () {
            try {
                return window.localStorage.getItem(STORAGE_KEY) || "dark";
            } catch (e) {
                return "dark";
            }
        },

        /**
         * Persist the preference and apply the resolved theme immediately.
         * @param {string} sPref "light" | "dark" | "auto"
         */
        setPreference: function (sPref) {
            try {
                window.localStorage.setItem(STORAGE_KEY, sPref);
            } catch (e) {
                // storage may be unavailable (private mode) — ignore
            }
            this.apply(sPref);
        },

        /**
         * Apply the resolved theme and restyle all registered charts.
         * @param {string} sPref "light" | "dark" | "auto"
         */
        apply: function (sPref) {
            Theming.setTheme(this.resolve(sPref));
            // restyle charts once the theme change has settled
            setTimeout(this.restyleCharts.bind(this), 300);
        },

        /**
         * Register a VizFrame so it is restyled on theme changes, and style it now.
         * @param {sap.viz.ui5.controls.VizFrame} oVizFrame the chart
         * @param {object} [oExtra] extra vizProperties to merge (e.g. axes for column charts)
         */
        registerChart: function (oVizFrame, oExtra) {
            if (!oVizFrame) { return; }
            oVizFrame._fhExtra = oExtra || {};
            if (aVizFrames.indexOf(oVizFrame) === -1) {
                aVizFrames.push(oVizFrame);
                oVizFrame.attachEvent && oVizFrame.attachEventOnce("destroy", function () {
                    var i = aVizFrames.indexOf(oVizFrame);
                    if (i > -1) { aVizFrames.splice(i, 1); }
                });
            }
            this.styleChart(oVizFrame);
        },

        /**
         * Apply theme-aware vizProperties to a single chart.
         * @param {sap.viz.ui5.controls.VizFrame} oVizFrame the chart
         */
        styleChart: function (oVizFrame) {
            if (!oVizFrame || !oVizFrame.setVizProperties) { return; }
            var c = chartColors();
            var oProps = {
                title: { visible: false },
                plotArea: {
                    colorPalette: c.palette,
                    dataLabel: { style: { color: c.dataLabel } }
                },
                legend: { visible: true, label: { style: { color: c.label } } },
                legendGroup: { label: { style: { color: c.label } } },
                categoryAxis: { label: { style: { color: c.label } } },
                valueAxis: { label: { style: { color: c.label } } },
                tooltip: { visible: true }
            };
            var oExtra = oVizFrame._fhExtra || {};
            Object.keys(oExtra).forEach(function (k) {
                oProps[k] = Object.assign({}, oProps[k], oExtra[k]);
            });
            oVizFrame.setVizProperties(oProps);
        },

        restyleCharts: function () {
            aVizFrames.forEach(this.styleChart, this);
        },

        isDark: function () {
            return isDarkTheme();
        }
    };

    return ThemeHelper;
});
