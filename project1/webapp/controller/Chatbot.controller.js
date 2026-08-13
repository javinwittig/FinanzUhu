sap.ui.define([
    "project1/controller/BaseController",
    "sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
    "use strict";

    // Google Gemini API key (provided for this project).
    var API_KEY = "AIzaSyA4rZ7Oy_vNAsUcMtAloaH0OkgyTF12lEU";
    var MODEL = "gemini-3.5-flash";
    var ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/" +
        MODEL + ":generateContent?key=" + API_KEY;

    var SYSTEM_PROMPT = "Du bist ein freundlicher Finanz-Assistent für die App " +
        "FinanzUhu. Antworte höflich, auf Deutsch und möglichst kurz und hilfreich. " +
        "Du hilfst bei Fragen zu Einnahmen, Ausgaben, Budget und Finanzplanung.";

    return BaseController.extend("project1.controller.Chatbot", {

        onInit: function () {
            this.oChat = new JSONModel({
                messages: [],
                busy: false
            });
            this.getView().setModel(this.oChat, "chat");
            this._iTyping = null;
            this._addBot("Hallo! Ich bin dein Finanz-Assistent. " +
                "Stelle mir eine Frage zu deinen Finanzen, Ausgaben oder Einnahmen.");
        },

        /**
         * Send the typed message to the chatbot.
         */
        onSend: function () {
            var oInput = this.byId("chatInput");
            var sText = (oInput.getValue() || "").trim();
            if (!sText || this.oChat.getProperty("/busy")) {
                return;
            }
            this._addUser(sText);
            oInput.setValue("");
            this._askGemini(sText);
        },

        /**
         * Keep the send button in sync with the input (optional visual cue).
         */
        onInputChange: function () {
            // reserved for future use (e.g. typing indicator)
        },

        /**
         * Navigate back to the home page.
         */
        onNavBack: function () {
            this.navTo("home");
        },

        /* --- message helpers ---------------------------------------------- */

        _addUser: function (sText) {
            var a = this.oChat.getProperty("/messages");
            a.push({ role: "user", text: sText });
            this.oChat.setProperty("/messages", a);
            this._scroll();
        },

        _addBot: function (sText) {
            var a = this.oChat.getProperty("/messages");
            a.push({ role: "bot", text: sText });
            this.oChat.setProperty("/messages", a);
            this._scroll();
        },

        _showTyping: function () {
            var a = this.oChat.getProperty("/messages");
            a.push({ role: "bot", text: this.getBundle().getText("chatbotTyping") });
            this._iTyping = a.length - 1;
            this.oChat.setProperty("/messages", a);
            this._scroll();
        },

        _setTyping: function (sText) {
            var a = this.oChat.getProperty("/messages");
            if (this._iTyping !== null && a[this._iTyping]) {
                a[this._iTyping].text = sText;
            }
            this.oChat.setProperty("/messages", a);
            this._scroll();
        },

        _scroll: function () {
            var that = this;
            setTimeout(function () {
                var oScroll = that.byId("chatScroll");
                if (oScroll) {
                    oScroll.scrollTo(100000, 0);
                }
            }, 50);
        },

        /* --- Gemini API --------------------------------------------------- */

        _askGemini: function (sText) {
            var that = this;

            // Build conversation history (user <-> model), dropping a leading
            // model turn so the first content role is always "user".
            var aHistory = this.oChat.getProperty("/messages")
                .filter(function (m) {
                    return m.role === "user" || m.role === "bot";
                })
                .map(function (m) {
                    return {
                        role: m.role === "user" ? "user" : "model",
                        parts: [{ text: m.text }]
                    };
                });
            if (aHistory.length && aHistory[0].role === "model") {
                aHistory = aHistory.slice(1);
            }
            // Ensure there is at least the current user turn.
            if (!aHistory.length) {
                aHistory = [{ role: "user", parts: [{ text: sText }] }];
            }

            var oBody = {
                systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
                contents: aHistory
            };

            this.oChat.setProperty("/busy", true);
            this._showTyping();

            fetch(ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(oBody)
            })
                .then(function (oResp) { return oResp.json(); })
                .then(function (oData) {
                    var sReply = that.getBundle().getText("chatbotNoAnswer");
                    if (oData &&
                        oData.candidates &&
                        oData.candidates[0] &&
                        oData.candidates[0].content &&
                        oData.candidates[0].content.parts) {
                        sReply = oData.candidates[0].content.parts
                            .map(function (p) { return p.text; })
                            .join("");
                    } else if (oData && oData.error) {
                        sReply = that.getBundle().getText("chatbotError",
                            [oData.error.message || JSON.stringify(oData.error)]);
                    }
                    that._setTyping(sReply);
                })
                .catch(function (oErr) {
                    that._setTyping(that.getBundle().getText("chatbotConnectionError",
                        [oErr.message]));
                })
                .finally(function () {
                    that.oChat.setProperty("/busy", false);
                });
        }
    });
});
