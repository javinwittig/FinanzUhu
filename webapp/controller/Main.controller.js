sap.ui.define(
	[
		"./BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/base/strings/formatMessage"
	],
	function (BaseController, JSONModel, formatMessage) {
		"use strict";

		const MONAT_KURZ = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
		const MONAT_LANG = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
		const FARBE_EINNAHMEN = "#2a78d6";
		const FARBE_AUSGABEN = "#eb6834";
		const FARBE_ERGEBNIS = "#1baf7a";

		/**
		 * Zweistellige Zahl mit führender Null.
		 * @param {number} i Zahl
		 * @returns {string} Zweistellige Darstellung
		 */
		function pad2(i) {
			return String(i).padStart(2, "0");
		}

		/**
		 * Formatiert ein Datum als ISO-String (JJJJ-MM-TT).
		 * @param {Date} d Datum
		 * @returns {string} ISO-Datum
		 */
		function toIso(d) {
			return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
		}

		/**
		 * Formatiert einen Betrag in deutscher Schreibweise mit Euro-Zeichen.
		 * @param {number} v Der zu formatierende Betrag
		 * @returns {string} Formatierter Betrag, z. B. "241.300 €"
		 */
		function formatEuro(v) {
			return v.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + " €";
		}

		return BaseController.extend("finanzuhu.dashboard.controller.Main", {
			onInit: async function () {
				const now = new Date();
				const oResourceBundle = await this.getResourceBundle();

				// Letzte 12 Monate, endend mit dem aktuellen Monat
				const aMonths = [];
				for (let i = 11; i >= 0; i--) {
					const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
					aMonths.push({
						short: MONAT_KURZ[d.getMonth()] + " " + String(d.getFullYear()).slice(2),
						long: MONAT_LANG[d.getMonth()] + " " + d.getFullYear()
					});
				}

				// Beispieldaten (12 Monatswerte)
				const oChartData = {
					labels: aMonths.map(function (m) { return m.short; }),
					labelsLong: aMonths.map(function (m) { return m.long; }),
					income: [198000, 205000, 210000, 225000, 199000, 208000, 215000, 220000, 230000, 228000, 235000, 241300],
					expenses: [175000, 180000, 178000, 195000, 182000, 185000, 190000, 192000, 195000, 193000, 196000, 198750],
					result: []
				};
				oChartData.result = oChartData.income.map(function (v, i) { return v - oChartData.expenses[i]; });

				const oViewModel = new JSONModel({
					title: formatMessage(oResourceBundle.getText("titlePattern"), [MONAT_LANG[now.getMonth()], now.getFullYear()]),
					kpiIncome: "",
					kpiExpense: "",
					kpiResult: "",
					chart: oChartData
				});
				this.setModel(oViewModel, "view");

				// Beispieldaten (10 Buchungen der letzten 10 Tage)
				const aSample = [
					["Kundenzahlung Projekt A", 12500],
					["Bürobedarf", -340],
					["Software-Lizenz", -890],
					["Kundenzahlung Projekt B", 8200],
					["Gehälter", -45000],
					["Miete Büro", -3200],
					["Kundenzahlung Projekt C", 15600],
					["Reisekosten", -620],
					["Beratungshonorar", 4300],
					["Versicherung", -410]
				];
				const aBookings = aSample.map(function (entry, i) {
					const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
					return { date: toIso(d), text: entry[0], amount: entry[1], seq: i + 1 };
				});
				this._iSeq = aBookings.length;

				const oBookingsModel = new JSONModel({ items: aBookings });
				this.setModel(oBookingsModel, "bookings");

				this.byId("kpiIncomeValue").addStyleClass("fd-kpi-income");
				this.byId("kpiExpenseValue").addStyleClass("fd-kpi-expense");

				this._updateKpis();
			},

			onAfterRendering: function () {
				this._updateChart();
			},

			/**
			 * Aktualisiert die drei Kennzahlen (Einnahmen, Ausgaben, Ergebnis) aus den Monatsdaten.
			 */
			_updateKpis: function () {
				const oChart = this.getModel("view").getProperty("/chart");
				const iLast = oChart.income.length - 1;
				const fIncome = oChart.income[iLast];
				const fExpense = oChart.expenses[iLast];
				const fResult = fIncome - fExpense;

				this.getModel("view").setProperty("/kpiIncome", formatEuro(fIncome));
				this.getModel("view").setProperty("/kpiExpense", formatEuro(fExpense));
				this.getModel("view").setProperty("/kpiResult", (fResult >= 0 ? "+ " : "− ") + formatEuro(Math.abs(fResult)));

				const oResult = this.byId("kpiResultValue");
				oResult.toggleStyleClass("fd-kpi-result-positive", fResult >= 0);
				oResult.toggleStyleClass("fd-kpi-result-negative", fResult < 0);
			},

			/**
			 * Erstellt das Chart.js-Trenddiagramm bzw. aktualisiert dessen Daten.
			 */
			_updateChart: function () {
				const oChartData = this.getModel("view").getProperty("/chart");
				const oCanvas = document.getElementById("trendChart");
				if (!oCanvas || !oChartData) {
					return;
				}

				if (!this._oChart) {
					this._oChart = new window.Chart(oCanvas, {
						type: "line",
						data: {
							labels: oChartData.labels,
							datasets: [
								{ label: "Einnahmen", data: oChartData.income, borderColor: FARBE_EINNAHMEN, pointRadius: 0, pointHoverRadius: 5, borderWidth: 2, tension: 0.25 },
								{ label: "Ausgaben", data: oChartData.expenses, borderColor: FARBE_AUSGABEN, pointRadius: 0, pointHoverRadius: 5, borderWidth: 2, tension: 0.25 },
								{ label: "Ergebnis", data: oChartData.result, borderColor: FARBE_ERGEBNIS, pointRadius: 0, pointHoverRadius: 5, borderWidth: 2, tension: 0.25 }
							]
						},
						options: {
							responsive: true,
							maintainAspectRatio: false,
							interaction: { mode: "index", intersect: false },
							plugins: {
								legend: { display: false },
								tooltip: {
									callbacks: {
										title: (oItems) => oChartData.labelsLong[oItems[0].dataIndex],
										label: (oCtx) => ({
											text: oCtx.dataset.label + ": " + formatEuro(oCtx.parsed.y),
											fillStyle: oCtx.dataset.borderColor
										})
									}
								}
							},
							scales: {
								y: {
									ticks: {
										color: "#8a8a86",
										callback: (v) => (v / 1000).toLocaleString("de-DE") + "k"
									},
									grid: { color: "#e6e6e2" }
								},
								x: {
									ticks: { color: "#8a8a86" },
									grid: { display: false }
								}
							}
						}
					});
				} else {
					this._oChart.data.labels = oChartData.labels;
					this._oChart.data.datasets[0].data = oChartData.income;
					this._oChart.data.datasets[1].data = oChartData.expenses;
					this._oChart.data.datasets[2].data = oChartData.result;
					this._oChart.update();
				}
			},

			onToggleForm: function () {
				const oForm = this.byId("entryForm");
				const bOpen = !oForm.getVisible();
				oForm.setVisible(bOpen);
				this.byId("formHint").setVisible(false);
				if (bOpen) {
					const oDate = this.byId("fDate");
					if (!oDate.getValue()) {
						oDate.setValue(toIso(new Date()));
					}
					this.byId("fText").focus();
				}
			},

			onSave: function () {
				const oDate = this.byId("fDate");
				const oText = this.byId("fText");
				const oAmount = this.byId("fAmount");
				const sDate = oDate.getValue();
				const sText = oText.getValue().trim();
				const fAmount = parseFloat(oAmount.getValue().replace(",", "."));
				const sType = this.byId("fType").getSelectedKey();

				if (!sDate || !sText || isNaN(fAmount) || fAmount <= 0) {
					this.byId("formHint").setVisible(true);
					return;
				}

				this._addBooking(sDate, sText, sType === "out" ? -fAmount : fAmount);

				oDate.setValue("");
				oText.setValue("");
				oAmount.setValue("");
				this.byId("formHint").setVisible(false);
				this.byId("entryForm").setVisible(false);
			},

			/**
			 * Fügt eine Buchung hinzu und aktualisiert Buchungsliste, Monatssummen und Kennzahlen.
			 * @param {string} sDate Datum im Format JJJJ-MM-TT
			 * @param {string} sText Beschreibung
			 * @param {number} fSigned Betrag mit Vorzeichen (positiv = Einnahme, negativ = Ausgabe)
			 */
			_addBooking: function (sDate, sText, fSigned) {
				// Buchungsliste aktualisieren (max. 10, neueste oben)
				const oModel = this.getModel("bookings");
				const aItems = oModel.getProperty("/items");
				aItems.push({ date: sDate, text: sText, amount: fSigned, seq: ++this._iSeq });
				aItems.sort(function (a, b) {
					return b.date.localeCompare(a.date) || b.seq - a.seq;
				});
				oModel.setProperty("/items", aItems.slice(0, 10));

				// Monatssummen aktualisieren (falls innerhalb der Chart-Spanne)
				const oViewModel = this.getModel("view");
				const oChart = oViewModel.getProperty("/chart");
				const d = new Date(sDate + "T00:00:00");
				const now = new Date();
				const iMonthDiff = (now.getFullYear() * 12 + now.getMonth()) - (d.getFullYear() * 12 + d.getMonth());
				if (iMonthDiff >= 0 && iMonthDiff < 12) {
					const iIdx = 11 - iMonthDiff;
					if (fSigned > 0) {
						oChart.income[iIdx] += fSigned;
					} else {
						oChart.expenses[iIdx] += Math.abs(fSigned);
					}
					oChart.result = oChart.income.map(function (v, i) { return v - oChart.expenses[i]; });
					oViewModel.setProperty("/chart", oChart);
					this._updateChart();
				}

				this._updateKpis();
			}
		});
	}
);
