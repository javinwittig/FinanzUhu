sap.ui.define([
    "project1/controller/BaseController",
    "sap/m/MessageToast"
], function (BaseController, MessageToast) {
    "use strict";

    var DEFAULT_ENTRY = {
        type: "income",
        date: "",
        party: "",
        amount: "",
        reason: "",
        extra: ""
    };

    /**
     * Spalten-Header, die beim Datei-Import erkannt werden (DE + EN).
     * Der Schlüssel ist die Ziel-Eigenschaft eines Eintrags.
     */
    var IMPORT_HEADERS = {
        type: ["typ", "type", "art", "kategorieart"],
        date: ["datum", "date"],
        party: ["herkunft", "party", "quelle", "source", "empfaenger", "recipient"],
        amount: ["betrag", "amount", "wert", "value"],
        reason: ["grund", "reason", "kategorie", "category"],
        extra: ["notiz", "note", "extra", "bemerkung", "comment"]
    };

    return BaseController.extend("project1.controller.Eingabe", {
        onInit: function () {
            this.setupShell({ title: "Neue Eingabe", nav: "eingabe" });
        },

        /**
         * Read the form, persist the new transaction into the finance model
         * (ledger + income/expense list) and refresh the KPI totals.
         */
        onAdd: function () {
            var oFinance = this.getOwnerComponent().getModel("finance");
            var oNew = oFinance.getProperty("/newEntry");

            if (!oNew.date || !oNew.amount) {
                this.toast("msgEntryMissing");
                return;
            }

            var fAmount = this._parseAmount(oNew.amount);
            if (isNaN(fAmount) || fAmount === 0) {
                this.toast("msgEntryInvalid");
                return;
            }

            this._applyEntry(oNew);
            oFinance.setProperty("/newEntry", Object.assign({}, DEFAULT_ENTRY));
            this.toast("msgEntryAdded");
        },

        /**
         * FileUploader change handler. Reads the selected CSV or JSON file
         * and feeds every row through _applyEntry so all graphs (KPIs, trend,
         * donut, ledger and income/expense lists) are updated.
         */
        onImport: function (oEvent) {
            var aFiles = oEvent.getParameter("files");
            if (!aFiles || !aFiles.length) {
                return;
            }
            var oFile = aFiles[0];
            var oReader = new FileReader();
            var that = this;

            oReader.onload = function (oEvt) {
                try {
                    var sText = oEvt.target.result;
                    var iCount = that._importData(sText);
                    if (iCount === 0) {
                        MessageToast.show(that.getBundle().getText("msgImportEmpty"));
                    } else {
                        that.toast("msgImportDone", [iCount]);
                    }
                } catch (oErr) {
                    MessageToast.show(that.getBundle().getText("msgImportError", [oErr.message]));
                }
                var oUploader = that.byId("fileUploader");
                if (oUploader) {
                    oUploader.clear();
                }
            };
            oReader.onerror = function () {
                MessageToast.show(that.getBundle().getText("msgImportError", ["Datei konnte nicht gelesen werden."]));
            };
            oReader.readAsText(oFile, "UTF-8");
        },

        /**
         * Parse CSV or JSON text into an array of entry objects and apply each
         * one. Returns the number of successfully applied entries.
         * @param {string} sText raw file content
         * @returns {number} count of imported entries
         */
        _importData: function (sText) {
            var aEntries = [];

            var sTrim = String(sText).trim();
            if (sTrim.charAt(0) === "[" || sTrim.charAt(0) === "{") {
                aEntries = this._parseJson(sTrim);
            } else {
                aEntries = this._parseCsv(sText);
            }

            var iCount = 0;
            for (var i = 0; i < aEntries.length; i++) {
                var oEntry = aEntries[i];
                if (!oEntry || !oEntry.date || !oEntry.amount) {
                    continue;
                }
                var fAmount = this._parseAmount(oEntry.amount);
                if (isNaN(fAmount) || fAmount === 0) {
                    continue;
                }
                this._applyEntry(oEntry);
                iCount++;
            }
            return iCount;
        },

        _parseJson: function (sText) {
            var oData = JSON.parse(sText);
            if (!Array.isArray(oData)) {
                oData = [oData];
            }
            return oData.map(function (o) {
                return {
                    type: o.type || o.art || "",
                    date: o.date || o.datum || "",
                    party: o.party || o.herkunft || o.empfaenger || "",
                    amount: o.amount || o.betrag || o.wert || "",
                    reason: o.reason || o.grund || o.kategorie || "",
                    extra: o.extra || o.notiz || o.note || ""
                };
            });
        },

        _parseCsv: function (sText) {
            var aLines = sText.split(/\r?\n/).filter(function (l) {
                return String(l).trim() !== "";
            });
            if (!aLines.length) {
                return [];
            }

            var sDelim = aLines[0].indexOf(";") >= 0 ? ";" : ",";
            var aFirst = this._splitCsv(aLines[0], sDelim).map(function (s) {
                return s.trim().toLowerCase();
            });

            var fnIsHeader = aFirst.some(function (s) {
                return /^(typ|type|art|datum|date|betrag|amount|herkunft|party|grund|reason)/.test(s);
            });

            var aMap, iStart;
            if (fnIsHeader) {
                aMap = this._mapHeader(aFirst);
                iStart = 1;
            } else {
                // positional: Typ;Datum;Herkunft;Betrag;Grund;Notiz
                aMap = { type: 0, date: 1, party: 2, amount: 3, reason: 4, extra: 5 };
                iStart = 0;
            }

            var aResult = [];
            for (var i = iStart; i < aLines.length; i++) {
                var aCols = this._splitCsv(aLines[i], sDelim);
                aResult.push({
                    type: (aMap.type >= 0 && aCols[aMap.type]) ? aCols[aMap.type].trim() : "",
                    date: (aMap.date >= 0 && aCols[aMap.date]) ? aCols[aMap.date].trim() : "",
                    party: (aMap.party >= 0 && aCols[aMap.party]) ? aCols[aMap.party].trim() : "",
                    amount: (aMap.amount >= 0 && aCols[aMap.amount]) ? aCols[aMap.amount].trim() : "",
                    reason: (aMap.reason >= 0 && aCols[aMap.reason]) ? aCols[aMap.reason].trim() : "",
                    extra: (aMap.extra >= 0 && aCols[aMap.extra]) ? aCols[aMap.extra].trim() : ""
                });
            }
            return aResult;
        },

        /**
         * Map header cells to our entry properties. Returns a map property -> column index (-1 = absent).
         */
        _mapHeader: function (aHeaders) {
            var oMap = { type: -1, date: -1, party: -1, amount: -1, reason: -1, extra: -1 };
            Object.keys(IMPORT_HEADERS).forEach(function (sProp) {
                var aAliases = IMPORT_HEADERS[sProp];
                for (var h = 0; h < aHeaders.length; h++) {
                    if (aAliases.indexOf(aHeaders[h]) >= 0) {
                        oMap[sProp] = h;
                        break;
                    }
                }
            });
            return oMap;
        },

        /**
         * Split a CSV line respecting simple "quoted" fields.
         */
        _splitCsv: function (sLine, sDelim) {
            var aOut = [];
            var sCur = "";
            var bInQuotes = false;
            for (var i = 0; i < sLine.length; i++) {
                var c = sLine.charAt(i);
                if (c === '"') {
                    if (bInQuotes && sLine.charAt(i + 1) === '"') {
                        sCur += '"';
                        i++;
                    } else {
                        bInQuotes = !bInQuotes;
                    }
                } else if (c === sDelim && !bInQuotes) {
                    aOut.push(sCur);
                    sCur = "";
                } else {
                    sCur += c;
                }
            }
            aOut.push(sCur);
            return aOut;
        },

        /**
         * Persist a single transaction into every part of the finance model
         * (ledger, income/expense list, KPIs, trend and donut) so all graphs
         * reflect the new numbers.
         */
        _applyEntry: function (oNew) {
            var oFinance = this.getOwnerComponent().getModel("finance");

            var fAmount = this._parseAmount(oNew.amount);
            var bIncome = this._isIncome(oNew);
            var sType = bIncome ? "income" : "expense";
            var fAbs = Math.abs(fAmount);
            var sAmount = "€ " + (bIncome ? "" : "-") + this._formatAmount(fAbs);
            var sState = bIncome ? "positive" : "negative";
            var sColor = bIncome ? "green" : "red";

            var oRow = {
                date: oNew.date,
                party: oNew.party || "",
                amount: sAmount,
                amountState: sState,
                category: oNew.reason || "Sonstiges",
                categoryColor: sColor,
                note: oNew.extra || "",
                type: sType
            };

            this._prepend(oFinance, "/ledger", oRow);
            this._prepend(oFinance, "/" + sType, {
                date: oRow.date,
                party: oRow.party,
                amount: sAmount,
                category: oRow.category,
                categoryColor: sColor,
                note: oRow.note
            });

            this._updateKpis(oFinance, sType, fAbs);
            this._updateTrend(oFinance, sType, fAbs, oNew.date);
            this._updateDonut(oFinance, fAbs, oNew.reason);
        },

        /**
         * Determine whether an entry is income. Honour an explicit type column
         * (income/expense or Einnahme/Ausgabe), otherwise fall back to the sign
         * of the amount.
         */
        _isIncome: function (oNew) {
            var sType = String(oNew.type || "").toLowerCase();
            if (sType) {
                if (/(ausgabe|^exp|aus$|ausg|expense)/.test(sType)) {
                    return false;
                }
                if (/(einnahme|^inc|ein$|einn|income)/.test(sType)) {
                    return true;
                }
            }
            var fAmount = this._parseAmount(oNew.amount);
            return fAmount >= 0;
        },

        /* --- helpers ---------------------------------------------------- */

        _prepend: function (oModel, sPath, oEntry) {
            var aList = oModel.getProperty(sPath) || [];
            aList.unshift(oEntry);
            oModel.setProperty(sPath, aList);
        },

        _parseAmount: function (sRaw) {
            var s = String(sRaw).trim();
            if (!s) { return NaN; }
            s = s.replace(/€/g, "").replace(/\s/g, "");
            var bNeg = s.charAt(0) === "-";
            s = s.replace(/-/g, "");
            // German format: thousands ".", decimal ","
            s = s.replace(/\./g, "").replace(",", ".");
            var f = parseFloat(s);
            return isNaN(f) ? NaN : (bNeg ? -f : f);
        },

        _formatAmount: function (fValue) {
            return fValue.toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        },

        _updateKpis: function (oModel, sType, fAbs) {
            var sIncomeVal = oModel.getProperty("/kpis/income/value");
            var sExpVal = oModel.getProperty("/kpis/expenses/value");
            var sResVal = oModel.getProperty("/kpis/result/value");

            var fIncome = this._parseKpi(sIncomeVal) + (sType === "income" ? fAbs : 0);
            var fExp = this._parseKpi(sExpVal) + (sType === "expense" ? fAbs : 0);
            var fRes = fIncome - fExp;

            oModel.setProperty("/kpis/income/value", "€ " + this._formatKpi(fIncome));
            oModel.setProperty("/kpis/expenses/value", "€ " + this._formatKpi(fExp));
            oModel.setProperty("/kpis/result/value", "€ " + this._formatKpi(fRes));
            oModel.setProperty("/kpis/result/state", fRes >= 0 ? "information" : "negative");
        },

        _parseKpi: function (sRaw) {
            var s = String(sRaw).replace(/€/g, "").replace(/\s/g, "");
            s = s.replace(/\./g, "").replace(",", ".");
            var f = parseFloat(s);
            return isNaN(f) ? 0 : f;
        },

        _formatKpi: function (fValue) {
            return Math.round(fValue).toLocaleString("de-DE");
        },

        /* --- graph updates ---------------------------------------------- */

        /**
         * Add the amount to the matching month in the 12-month trend series
         * used by the column chart on the Graph page.
         */
        _updateTrend: function (oModel, sType, fAbs, sDate) {
            var i = this._monthIndex(sDate);
            if (i < 0) { return; }
            var aTrend = oModel.getProperty("/trend");
            if (!aTrend || !aTrend[i]) { return; }
            if (sType === "income") {
                aTrend[i].income = (aTrend[i].income || 0) + fAbs;
            } else {
                aTrend[i].expense = (aTrend[i].expense || 0) + fAbs;
            }
            oModel.setProperty("/trend", aTrend);
        },

        /**
         * Add the amount to the matching slice of the expense donut chart and
         * recompute the slice amounts, percentages and the total.
         */
        _updateDonut: function (oModel, fAbs, sReason) {
            var aCats = oModel.getProperty("/categories");
            if (!aCats) { return; }
            var sTarget = this._mapCategory(sReason);
            var oCat = aCats.filter(function (c) { return c.name === sTarget; })[0];
            if (!oCat) {
                oCat = aCats.filter(function (c) { return c.name === "Sonstiges"; })[0];
            }
            if (!oCat) { return; }
            oCat.value = (oCat.value || 0) + fAbs;
            oCat.amount = "€ " + Math.round(oCat.value).toLocaleString("de-DE");

            var fTotal = aCats.reduce(function (s, c) { return s + (c.value || 0); }, 0);
            aCats.forEach(function (c) {
                c.percent = fTotal ? Math.round((c.value / fTotal) * 100) + "%" : "0%";
            });
            oModel.setProperty("/categories", aCats);
            oModel.setProperty("/donut/total", "€ " + Math.round(fTotal).toLocaleString("de-DE"));
        },

        _monthIndex: function (sDate) {
            var a = String(sDate).split(".");
            if (a.length < 2) { return -1; }
            var m = parseInt(a[1], 10);
            if (isNaN(m) || m < 1 || m > 12) { return -1; }
            return m - 1;
        },

        _mapCategory: function (sReason) {
            var mMap = {
                "Gehalt": "Gehälter",
                "Miete": "Miete",
                "Versicherung": "Versicherung",
                "Marketing": "Marketing"
            };
            return mMap[sReason] || "Sonstiges";
        }
    });
});
