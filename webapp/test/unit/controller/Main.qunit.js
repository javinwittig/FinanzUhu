/* global QUnit */
sap.ui.define(
	[
		"finanzuhu/dashboard/controller/Main.controller",
		"finanzuhu/dashboard/model/formatter"
	],
	function (MainController, formatter) {
		"use strict";

		QUnit.module("Main controller");

		QUnit.test("The MainController class provides the expected methods", function (assert) {
			assert.strictEqual(typeof MainController.prototype.onSave, "function");
			assert.strictEqual(typeof MainController.prototype.onToggleForm, "function");
			assert.strictEqual(typeof MainController.prototype._addBooking, "function");
			assert.strictEqual(typeof MainController.prototype._updateKpis, "function");
		});

		QUnit.module("Formatter");

		QUnit.test("formatEuro uses German thousands separator and euro sign", function (assert) {
			assert.strictEqual(formatter.formatEuro(241300), "241.300 €");
			assert.strictEqual(formatter.formatEuro(12500), "12.500 €");
			assert.strictEqual(formatter.formatEuro(-340), "-340 €");
		});

		QUnit.test("formatEuroSigned adds a plus sign for positive values", function (assert) {
			assert.strictEqual(formatter.formatEuroSigned(12500), "+ 12.500 €");
			assert.strictEqual(formatter.formatEuroSigned(-340), "− 340 €");
		});

		QUnit.test("formatDateShort converts ISO date to TT.MM.JJJJ", function (assert) {
			assert.strictEqual(formatter.formatDateShort("2026-08-10"), "10.08.2026");
			assert.strictEqual(formatter.formatDateShort(""), "");
		});
	}
);
