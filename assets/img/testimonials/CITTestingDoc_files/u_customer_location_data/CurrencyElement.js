/*! RESOURCE: /scripts/classes/doctype/CurrencyElement.js */
var CurrencyElement = Class.create(GlideFilterCurrency, {
    initialize: function(name, type) {
		this.name = name;
		this.currencyType = type;
		this.fieldName = $(this.name);
		this.initCurrency();
		this.setCurrency();
	},
	initCurrency: function() {
		var c = gel(this.name).value;
		var currency;
		if (!c && typeof multi !== "undefined" && multi)
			currency = code;
		else {
			c = c.split(';');
			currency = c[0];
		}
		var dw = gel(this.name + ".display");
		if (dw) {
			var displayAmount = dw.value;
			dw.value = formatNumber(displayAmount);
		}
		gel("sys_original." + this.name).value = this._getCurrentValue();
		var sel = gel(this.name + '.currency');
		if (!sel)
			return;
		if (!sel.options)
			return;
		var found = false;
		for ( var i = 0; i != sel.options.length; i++) {
			if (sel.options[i].value != currency)
				continue;
			sel.options[i].selected = true;
			found = true;
			break;
		}
		if (!found)
			addOption(sel, currency, currency).selected = true;
    },
	setCurrency: function () {
		this._setElementValue(this._getCurrentValue());
	},
	setPolicyValue: function() {
		var field = this.name.split('.')[1];
		if (!this.hasPolicy(field)) {
			onChange(this.name);
			return;
		}
		var currency = this.value.split(';')[0];
		var value = this.value.split(';')[1];
		var ajax = new GlideAjax('CurrencyConverter');
		ajax.addParam('sysparm_name', 'convertStorageValue');
		ajax.addParam('sysparm_type', currency);
		ajax.addParam('sysparm_value', value);
		ajax.getXMLAnswer(this.setPolicyValueResponse.bind(this), [], this.name);
	},
	setPolicyValueResponse: function(answer) {
		var eStorage = gel(this.name + ".storage");
		var eDisplay = gel(this.name + ".display");
		eStorage.value = answer;
		eDisplay.title = answer;
		onChange(this.name);
	},
	setSessionCurrencyCode: function() {
	},
	hasPolicy: function() {
		var field = this.name.split('.')[1];
		for (var i = 0; i < uiPolicies.length; i++)
			if (uiPolicies[i].hasPolicy(field))
				return true;
		return false;
	},
	getValue: function() {
		return gel(this.name).getAttribute("value");
	},
	_formatCurrency: function(value, currencyCode, addSymbol, useGrouping) {
		var useLegacySALocaleInfo = window.NOW.locale.code === "en_ZA" && getDecimalSeparator() === ".";
		var locale_code = useLegacySALocaleInfo ? "en_US" : window.NOW.locale.code;
		var appended_symbol = '';
		if (useLegacySALocaleInfo) {
appended_symbol = new Intl.NumberFormat(window.NOW.locale.code.replace(/_/g, '-'), {
				style: 'currency',
				currency: currencyCode
			})
				.formatToParts(1).find(x => x.type === "currency").value + ' ';
		}
		var currency_display = (useLegacySALocaleInfo || !addSymbol) ? 'code' : 'symbol';
var formatted = Number(value).toLocaleString(locale_code.replace(/_/g, '-'), {
			style: 'currency',
			currency: currencyCode,
			minimumFractionDigits: 2,
			maximumFractionDigits: 4,
			currencyDisplay: currency_display,
			useGrouping: (typeof useGrouping !== 'undefined') ? useGrouping : false
		});
		if (currency_display === 'code') {
			var reCurrency = new RegExp('(' + currencyCode + '|\u00A0|\u200F)+', 'g');
			formatted = formatted.replace(reCurrency, '');
		}
		if (addSymbol === true) {
			formatted = appended_symbol + formatted;
		}
		return formatted;
	},
	_getCurrentValue: function() {
		var currencyElem = gel(this.name + '.currency');
		var displayElem = gel(this.name + '.display');
		var value = "";
		if (currencyElem)
			value += currencyElem.value;
		value += ";";
		if (displayElem) {
			var num = displayElem.value;
			if (num == '')
				value = '';
			else
				value += num;
		}
		return value;
	},
	_extractCurrency: function(value, displayValue) {
		if (typeof displayValue === 'string' && displayValue.indexOf(";") > -1) {
			value = displayValue;
		} else if (typeof value !== 'string' || value === '') {
			return;
		} else if (value.indexOf(";") === -1) {
			value = window.NOW.currency.code + ';' + value;
		}
		var currencyParts = value.split(';');
		var currencyCode = currencyParts[0];
value = currencyParts[1].replace(/[^\d-^.]/g,'');
		var negPrefix = value.startsWith('-') ? '-' : '';
value = negPrefix + value.replace(/[^\d\.]/g, '');
		var formattedDecimal = this._formatCurrency(value, currencyCode, false, false);
		var withGrouping = this._formatCurrency(value, currencyCode, false, true);
		var withSymbolGrouping = this._formatCurrency(value, currencyCode, true, true);
		return {
amount: formattedDecimal,
withGrouping: withGrouping,
withSymbolGrouping: withSymbolGrouping,
type: currencyCode
		}
	},
	setValue: function(value, displayValue) {
		var currency = this._extractCurrency(value, displayValue);
		if (!currency)
			return;
		if (currency.amount === "NaN") {
			console.log('%c WARNING: setValue called with an invalid currency NaN', 'background: darkred; color: white;');
			return;
		}
		this.fieldName.setValue(value);
		var dw = gel(this.name + ".display");
		if (dw) {
			dw.value = currency.withGrouping;
			this._getCurrencySelect().value = currency.type;
		}
		var currencyValue = currency.type + ';' + currency.amount;
		this._setElementValue(currencyValue);
		onChange(this.name);
	},
	_setElementValue: function(value) {
		this.value = value;
		gel(this.name).value = value;
	},
    setReadOnly: function(disabled) {
    	var pd = gel(this.name + '.display');
		if (!pd)
			return;
    	var ps = gel(this.name + '.currency');
    	var pe = gel(this.name + '.editLink');
    	g_form.setDisabledControl(pd, disabled);
    	if (ps)
    		g_form.setDisabledControl(ps, disabled);
    	if (pe) {
    		if (disabled)
    			pe.style.display = 'none';
    		else
    			pe.style.display = 'inline-flex';
    	}
    },
    isDisabled: function() {
    	var pd = gel(this.name + '.display');
		if (!pd)
			return;
    	var ps = this._getCurrencySelect();
    	var pe = gel(this.name + '.editLink');
    	if (ps && !hasClassName(ps, 'disabled'))
    		return false;
    	if (pe && pe.style.display != 'none')
    		return false;
    	return true;
    },
	currencyURL: function(table, fieldName) {
		return 'sysparm_query=table=' + table + '^field=' + fieldName + '^id=$sys_id';
	},
	editValue: function(table, fieldName) {
		this.url_fragment = (this.currencyType === "price") ? 'fx_price.do?' : 'fx_currency_instance.do?';
		this.url_suffix = (this.currencyType === "price") ? '^parent=NULL' : '';
		var url = this.url_fragment + this.currencyURL(table, fieldName) + this.url_suffix;
		checkSaveURL(table, url);
	},
	_getCurrencySelect: function() {
        return gel(this.name + '.currency');
	},
	type: "CurrencyElement",
	z: null
});
const MAX_FRACTION_DIGITS = 4;
function checkCurrencyInput(currencyValue) {
	if (!currencyValue)
		return;
	currencyValue = currencyValue + "";
	try {
		let wholePart = getWholePart(currencyValue);
		let fraction = getFraction(currencyValue);
		let gwt = new GwtMessage();
		if (!Number.isSafeInteger(Number(wholePart))) {
			g_form.addWarningMessage(gwt.getMessage('Currency amounts below {0} and above {1} will cause unexpected results. Please limit currency inputs to values between that range.'
				, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER));
		}
		if (fraction.length > MAX_FRACTION_DIGITS) {
			g_form.addWarningMessage(gwt.getMessage('The fraction part of a currency value cannot exceed {0} digits. It will be rounded off to the first {0} digits.', MAX_FRACTION_DIGITS));
		}
	} catch (exception) {
		console.error("Error parsing decimal currency input: " + currencyValue);
	}
}
(function(){
	CachedEvent.after('glideform.initialized', function() {
		var elems = $$('input[data-type="glide_element_currency"]');
		elems.each(function (elem) {
			var ref = elem.getAttribute('data-ref');
			var internalType = elem.getAttribute('data-internal-type');
			if (ref && ( typeof g_form != 'undefined' )) {
				var cHandler = new CurrencyElement(ref, internalType);
				g_form.registerHandler(ref, cHandler);
				elem.observe('change', function(evt) {
					elem.value = formatNumber(elem.value);
					cHandler.setCurrency();
					cHandler.setPolicyValue();
					telemetryForRecordUpdateElement(ref);
				});
			}
			
			var currencyInputs = $$('input[data-type="glide_element_currency_'+ ref + '_input"]');
			currencyInputs.each(function(currencyInput) {
				currencyInput.observe('change', function() {
					currencyInput.value = formatNumber(currencyInput.value);
					cHandler.setCurrency();
					cHandler.setPolicyValue();
					telemetryForRecordUpdateElement(ref);
				});
				currencyInput.observe('input', function() {
					checkCurrencyInput(currencyInput.value);
				});
			});
			var currencyLinks = $$('a[data-type="' + ref + '_glide_element_currency"]');
			currencyLinks.each(function(currencyElem) {
				var table = currencyElem.getAttribute('data-class_name');
				var fieldName = currencyElem.getAttribute('data-name')
				currencyElem.observe('click', function(evt) {
					cHandler.editValue(table, fieldName);
				});
			});
			var currencySelects = $$('select[data-type="glide_element_currency_' + ref + '_select"]');
			currencySelects.each(function(currencySelect) {
				currencySelect.observe('change', function(evt) {
					cHandler.setCurrency();
					cHandler.setPolicyValue();
					telemetryForRecordUpdateElement(ref);
				});
			});
		});
	});
})();
;
