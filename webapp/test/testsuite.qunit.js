sap.ui.define(function () {
	"use strict";

	return {
		name: "QUnit test suite for the UI5 Application: finanzuhu.dashboard",
		defaults: {
			page: "ui5://test-resources/finanzuhu/dashboard/Test.qunit.html?testsuite={suite}&test={name}",
			qunit: {
				version: 2
			},
			sinon: {
				version: 1
			},
			ui5: {
				language: "EN",
				theme: "sap_horizon"
			},
			coverage: {
				only: "finanzuhu/dashboard/",
				never: "test-resources/finanzuhu/dashboard/"
			},
			loader: {
				paths: {
					"finanzuhu/dashboard": "../"
				}
			}
		},
		tests: {
			"unit/unitTests": {
				title: "Unit tests for finanzuhu.dashboard"
			},
			"integration/opaTests": {
				title: "Integration tests for finanzuhu.dashboard"
			}
		}
	};
});
