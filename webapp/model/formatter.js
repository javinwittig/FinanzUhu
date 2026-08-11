sap.ui.define(function () {
	"use strict";

	/**
	 * Formatiert einen Betrag in deutscher Schreibweise mit Euro-Zeichen.
	 * @param {number} v Der zu formatierende Betrag
	 * @returns {string} Formatierter Betrag, z. B. "241.300 €"
	 */
	function formatEuro(v) {
		return v.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + " €";
	}

	return {
		/**
		 * Formatiert einen Betrag mit Euro-Zeichen, leer bei null/undefined.
		 * @param {number} v Der zu formatierende Betrag
		 * @returns {string} Formatierter Betrag oder leerer String
		 */
		formatEuro: function (v) {
			if (v === null || v === undefined) {
				return "";
			}
			return formatEuro(v);
		},
		/**
		 * Formatiert einen Betrag mit Vorzeichen (+/−) und Euro-Zeichen.
		 * @param {number} v Der zu formatierende Betrag
		 * @returns {string} Formatierter Betrag, z. B. "+ 12.500 €" oder "− 340 €"
		 */
		formatEuroSigned: function (v) {
			if (v === null || v === undefined) {
				return "";
			}
			return (v > 0 ? "+ " : "− ") + formatEuro(Math.abs(v));
		},
		/**
		 * Formatiert ein ISO-Datum (JJJJ-MM-TT) in deutscher Schreibweise (TT.MM.JJJJ).
		 * @param {string} iso Das ISO-Datum
		 * @returns {string} Datum im Format TT.MM.JJJJ oder leerer String
		 */
		formatDateShort: function (iso) {
			if (!iso) {
				return "";
			}
			const aParts = iso.split("-");
			return aParts[2] + "." + aParts[1] + "." + aParts[0];
		}
	};
});
