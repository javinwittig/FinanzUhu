sap.ui.define([], function () {
    "use strict";

    return {
        /**
         * Map the model's semantic state to sap.ui.core.ValueState
         * (used by ObjectStatus / ObjectNumber).
         * @param {string} sState "positive" | "negative" | "information"
         * @returns {string} a ValueState value
         */
        valueState: function (sState) {
            switch (sState) {
                case "positive": return "Success";
                case "negative": return "Error";
                case "information": return "Information";
                default: return "None";
            }
        },

        /**
         * Map a category colour hint to a ValueState for inverted ObjectStatus badges.
         * @param {string} sColor "green" | "red" | "blue"
         * @returns {string} a ValueState value
         */
        badgeState: function (sColor) {
            switch (sColor) {
                case "green": return "Success";
                case "red": return "Error";
                case "blue": return "Information";
                default: return "None";
            }
        },

        /**
         * Map the model's semantic state to sap.m.ValueColor
         * (used by sap.f.cards.NumericHeader).
         * @param {string} sState "positive" | "negative" | "information"
         * @returns {string} a ValueColor value
         */
        valueColor: function (sState) {
            switch (sState) {
                case "positive": return "Good";
                case "negative": return "Error";
                case "information": return "Neutral";
                default: return "Neutral";
            }
        },

        /**
         * Map the model's semantic state to a sap.m.DeviationIndicator trend.
         * @param {string} sState "positive" | "negative" | "information"
         * @returns {string} "Up" | "Down" | "None"
         */
        trend: function (sState) {
            switch (sState) {
                case "positive": return "Up";
                case "negative": return "Down";
                default: return "None";
            }
        }
    };
});
