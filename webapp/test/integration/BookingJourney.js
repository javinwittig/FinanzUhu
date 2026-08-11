/* global QUnit */
sap.ui.define(["sap/ui/test/opaQunit", "./pages/Main"], function (opaTest) {
	"use strict";

	QUnit.module("Buchungsfluss");

	opaTest("Das Dashboard zeigt Kennzahlen, Chart und 10 Buchungen", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyUIComponent({
			componentConfig: {
				name: "finanzuhu.dashboard"
			}
		});

		// Assertions
		Then.onTheMainPage.iShouldSeeTheKpiCards();
		Then.onTheMainPage.iShouldSeeTenBookings();

		// Cleanup
		Then.iTeardownMyApp();
	});

	opaTest("Eine neue Buchung wird erfasst, gespeichert und erscheint in der Liste", function (Given, When, Then) {
		// Arrangements
		Given.iStartMyUIComponent({
			componentConfig: {
				name: "finanzuhu.dashboard"
			}
		});

		// Actions
		When.onTheMainPage.iPressTheAddBookingButton();

		// Assertions
		Then.onTheMainPage.iShouldSeeTheBookingForm();

		// Actions
		When.onTheMainPage.iEnterBookingText("Testbuchung OPA");
		When.onTheMainPage.iEnterBookingAmount("1234.5");
		When.onTheMainPage.iPressTheSaveButton();

		// Assertions
		Then.onTheMainPage.iShouldSeeTheBookingText("Testbuchung OPA");
		Then.onTheMainPage.iShouldNotSeeTheBookingForm();

		// Cleanup
		Then.iTeardownMyApp();
	});
});
