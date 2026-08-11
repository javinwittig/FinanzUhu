sap.ui.define(
	["sap/ui/test/Opa5", "sap/ui/test/actions/Press", "sap/ui/test/actions/EnterText", "sap/ui/test/matchers/PropertyStrict"],
	function (Opa5, Press, EnterText, PropertyStrict) {
		"use strict";

		Opa5.createPageObjects({
			onTheMainPage: {
				actions: {
					iPressTheAddBookingButton: function () {
						return this.waitFor({
							id: "addButton",
							viewName: "finanzuhu.dashboard.view.Main",
							actions: new Press(),
							errorMessage: "Button '+ Buchung erfassen' nicht gefunden"
						});
					},

					iEnterBookingText: function (sText) {
						return this.waitFor({
							id: "fText",
							viewName: "finanzuhu.dashboard.view.Main",
							actions: new EnterText({ text: sText }),
							errorMessage: "Beschreibungsfeld nicht gefunden"
						});
					},

					iEnterBookingAmount: function (sAmount) {
						return this.waitFor({
							id: "fAmount",
							viewName: "finanzuhu.dashboard.view.Main",
							actions: new EnterText({ text: sAmount }),
							errorMessage: "Betragsfeld nicht gefunden"
						});
					},

					iPressTheSaveButton: function () {
						return this.waitFor({
							id: "saveButton",
							viewName: "finanzuhu.dashboard.view.Main",
							actions: new Press(),
							errorMessage: "Speichern-Button nicht gefunden"
						});
					}
				},

				assertions: {
					iShouldSeeTheKpiCards: function () {
						return this.waitFor({
							id: "kpiIncomeValue",
							viewName: "finanzuhu.dashboard.view.Main",
							check: function (oText) {
								return oText.getText().indexOf("€") > -1;
							},
							success: function () {
								Opa5.assert.ok(true, "Kennzahlen sind sichtbar");
							},
							errorMessage: "Kennzahlen sind nicht sichtbar"
						});
					},

					iShouldSeeTenBookings: function () {
						return this.waitFor({
							id: "bookingTable",
							viewName: "finanzuhu.dashboard.view.Main",
							check: function (oTable) {
								return oTable.getItems().length === 10;
							},
							success: function () {
								Opa5.assert.ok(true, "Buchungsliste enthält 10 Einträge");
							},
							errorMessage: "Buchungsliste enthält nicht 10 Einträge"
						});
					},

					iShouldSeeTheBookingForm: function () {
						return this.waitFor({
							id: "entryForm",
							viewName: "finanzuhu.dashboard.view.Main",
							check: function (oForm) {
								return oForm.getVisible();
							},
							success: function () {
								Opa5.assert.ok(true, "Formular ist sichtbar");
							},
							errorMessage: "Formular ist nicht sichtbar"
						});
					},

					iShouldNotSeeTheBookingForm: function () {
						return this.waitFor({
							id: "entryForm",
							viewName: "finanzuhu.dashboard.view.Main",
							check: function (oForm) {
								return !oForm.getVisible();
							},
							success: function () {
								Opa5.assert.ok(true, "Formular ist geschlossen");
							},
							errorMessage: "Formular ist noch sichtbar"
						});
					},

					iShouldSeeTheBookingText: function (sText) {
						return this.waitFor({
							controlType: "sap.m.Text",
							matchers: new PropertyStrict({ text: sText }),
							success: function () {
								Opa5.assert.ok(true, "Neue Buchung ist in der Liste");
							},
							errorMessage: "Neue Buchung ist nicht in der Liste"
						});
					}
				}
			}
		});
	}
);
