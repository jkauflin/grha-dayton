/*==============================================================================
 * (C) Copyright 2015,2020 John J Kauflin, All rights reserved.
 *----------------------------------------------------------------------------
 * DESCRIPTION:
 *----------------------------------------------------------------------------
 * Modification History
 * 2020-03-15 JJK   Initial version - moved from main.js to here
 *============================================================================*/
var main = (function () {
	'use strict';  // Force declaration of variables before use (among other things)
	//=================================================================================================================
	// Private variables for the Module
    var onlinePaymentInstructions = '*** a <b>$4.00</b> processing fee will be added for online payment via PayPal, or you can pay by contacting GRHA Treasurer Misty Wilker at 937-554-9414 or by email at <b>treasurer@grha-dayton.org</b> (email is preferred) ***';
    var offlinePaymentInstructions = '*** For payment of dues, contact GRHA Treasurer Misty Wilker at 937-554-9414 or by email at <b>treasurer@grha-dayton.org</b> (email is preferred) ***';

	//=================================================================================================================
	// Variables cached from the DOM
	var $document = $(document);

	//=================================================================================================================
    // Bind events
    
    // Auto-close the collapse menu after clicking a non-dropdown menu item (in the bootstrap nav header)
    $document.on('click', '.navbar-collapse.in', function (e) {
        if ($(e.target).is('a') && $(e.target).attr('class') != 'dropdown-toggle') {
            $(this).collapse('hide');
        }
    });

	//=================================================================================================================
	// Module methods

    //Replace every ascii character except decimal and digits with a null, and round to 2 decimal places
    var nonMoneyCharsStr = "[\x01-\x2D\x2F\x3A-\x7F]";
    //"g" global so it does more than 1 substitution
    var regexNonMoneyChars = new RegExp(nonMoneyCharsStr, "g");
    function formatMoney(inAmount) {
        var inAmountStr = '' + inAmount;
        inAmountStr = inAmountStr.replace(regexNonMoneyChars, '');
        return parseFloat(inAmountStr).toFixed(2);
    }

    // Helper functions for setting UI components from data
    function setBoolText(inBool) {
        var tempStr = "NO";
        if (inBool) {
            tempStr = "YES";
        }
        return tempStr;
    }
    function setCheckbox(checkVal) {
        var tempStr = '';
        if (checkVal == 1) {
            tempStr = 'checked=true';
        }
        return '<input type="checkbox" ' + tempStr + ' disabled="disabled">';
    }
    //function setCheckboxEdit(checkVal, idName) {
    function setCheckboxEdit(idName, checkVal) {
        var tempStr = '';
        if (checkVal == 1) {
            tempStr = 'checked=true';
        }
        return '<input id="' + idName + '" type="checkbox" ' + tempStr + '>';
    }
    function setInputText(idName, textVal, textSize) {
        return '<input id="' + idName + '" name="' + idName + '" type="text" class="form-control input-sm resetval" value="' + textVal + '" size="' + textSize + '" maxlength="' + textSize + '">';
    }
    function setTextArea(idName, textVal, rows) {
        return '<textarea id="' + idName + '" class="form-control input-sm" rows="' + rows + '">' + textVal + '</textarea>';
    }
    function setInputDate(idName, textVal, textSize) {
        return '<input id="' + idName + '" type="text" class="form-control input-sm Date" value="' + textVal + '" size="' + textSize + '" maxlength="' + textSize + '" placeholder="YYYY-MM-DD">';
    }
    function setSelectOption(optVal, displayVal, selected, bg) {
        var tempStr = '';
        if (selected) {
            tempStr = '<option class="' + bg + '" value="' + optVal + '" selected>' + displayVal + '</option>';
        } else {
            tempStr = '<option class="' + bg + '" value="' + optVal + '">' + displayVal + '</option>';
        }
        return tempStr;
    }

    $(document).on("click", "#DuesButton", function () {
        $('#navbar a[href="#DuesPage"]').tab('show');
    });

    // Respond to any change in values and call service
    $("#DuesSearchInput").change(function () {
        $("#PropertyListDisplay tbody").html("");
        // Get the list
        $.getJSON("getHoaPropertiesListProxy.php", "address=" + $("#address").val(), function (hoaPropertyRecList) {
            displayPropertyList(hoaPropertyRecList);
        });
        event.stopPropagation();
    });

    // Respond to the Search button click (because I can't figure out how to combine it with input change)
    $document.on("click", "#DuesSearchButton", function () {
        $("#PropertyListDisplay tbody").html("");
        // Get the list
        $.getJSON("getHoaPropertiesListProxy.php", "address=" + $("#address").val(), function (hoaPropertyRecList) {
            displayPropertyList(hoaPropertyRecList);
        });
        event.stopPropagation();
    });

    $document.on("click", ".DuesStatement", function () {
        var $this = $(this);
        $.getJSON("getHoaDbDataProxy.php", "parcelId=" + $this.attr("data-parcelId"), function (hoaRec) {
            formatDuesStatementResults(hoaRec);
            // Display the modal window with the iframe
            $("#duesStatementModal").modal("show");
        });
    });

    function displayPropertyList(hoaPropertyRecList) {
        var tr = '<tr><td>No records found - try different search parameters</td></tr>';
        var rowId = 0;
        $.each(hoaPropertyRecList, function (index, hoaPropertyRec) {
            rowId = index + 1;
            if (index == 0) {
                tr = '';
                tr += '<tr>';
                tr += '<th>Row</th>';
                tr += '<th>Parcel Location</th>';
                tr += '<th class="hidden-xs"> Parcel Id</th>';
                tr += '<th class="hidden-xs hidden-sm">Lot No</th>';
                tr += '<th class="hidden-xs hidden-sm">Sub Div</th>';
                tr += '<th>Dues Statement</th>';
                tr += '</tr>';
            }
            tr += '<tr>';
            tr += '<td>' + rowId + '</td>';
            tr += '<td>' + hoaPropertyRec.parcelLocation + '</td>';
            tr += '<td class="hidden-xs">' + hoaPropertyRec.parcelId + '</td>';
            tr += '<td class="hidden-xs hidden-sm">' + hoaPropertyRec.lotNo + '</td>';
            tr += '<td class="hidden-xs hidden-sm">' + hoaPropertyRec.subDivParcel + '</td>';
            tr += '<td><button type="button" data-parcelId="' + hoaPropertyRec.parcelId + '" class="btn btn-success btn-xs DuesStatement">Dues Statement</button></td>';
            tr += '</tr>';
        });

        $("#PropertyListDisplay tbody").html(tr);
    }

    function formatDuesStatementResults(hoaRec) {
        var tr = '';
        var checkedStr = '';
        var currSysDate = new Date();
        $("#PayDues").html('');
        $("#PayDuesInstructions").html('');

        var ownerRec = hoaRec.ownersList[0];

        tr += '<tr><th>Parcel Id:</th><td>' + hoaRec.Parcel_ID + '</a></td></tr>';
        tr += '<tr><th>Lot No:</th><td>' + hoaRec.LotNo + '</td></tr>';
        //tr += '<tr><th>Sub Division: </th><td>'+hoaRec.SubDivParcel+'</td></tr>';
        tr += '<tr><th>Location: </th><td>' + hoaRec.Parcel_Location + '</td></tr>';
        tr += '<tr><th>City State Zip: </th><td>' + hoaRec.Property_City + ', ' + hoaRec.Property_State + ' ' + hoaRec.Property_Zip + '</td></tr>';

        var tempTotalDue = '' + hoaRec.TotalDue;
        tr += '<tr><th>Total Due: </th><td>$' + formatMoney(tempTotalDue) + '</td></tr>';
        $("#DuesStatementPropertyTable tbody").html(tr);

        var tempDuesAmt = formatMoney(hoaRec.assessmentsList[0].DuesAmt);

        // If enabled, payment button and instructions will have values, else they will be blank if online payment is not allowed
        if (hoaRec.TotalDue > 0) {
            // Only offer online payment if total due is just the current assessment (i.e. prior year due needs to contact the Treasurer)
            if (tempDuesAmt == hoaRec.TotalDue) {
                $("#PayDues").html(hoaRec.paymentButton);
                if (hoaRec.paymentButton != '') {
                    $("#PayDuesInstructions").html(onlinePaymentInstructions);
                } else {
                    $("#PayDuesInstructions").html(offlinePaymentInstructions);
                }
            } else {
                $("#PayDuesInstructions").html(offlinePaymentInstructions);
            }
        }

        tr = '';
        $.each(hoaRec.totalDuesCalcList, function (index, rec) {
            tr = tr + '<tr>';
            tr = tr + '<td>' + rec.calcDesc + '</td>';
            tr = tr + '<td>$</td>';
            tr = tr + '<td align="right">' + parseFloat('' + rec.calcValue).toFixed(2) + '</td>';
            tr = tr + '</tr>';
        });
        tr = tr + '<tr>';
        tr = tr + '<td><b>Total Due:</b></td>';
        tr = tr + '<td><b>$</b></td>';
        tr = tr + '<td align="right"><b>' + parseFloat('' + hoaRec.TotalDue).toFixed(2) + '</b></td>';
        tr = tr + '</tr>';

        tr = tr + '<tr>';
        tr = tr + '<td>' + hoaRec.assessmentsList[0].LienComment + '</td>';
        tr = tr + '<td></td>';
        tr = tr + '<td align="right"></td>';
        tr = tr + '</tr>';
        $("#DuesStatementCalculationTable tbody").html(tr);

        var TaxYear = '';
        tr = '';
        var tempDuesAmt = '';
        $.each(hoaRec.assessmentsList, function (index, rec) {
            if (index == 0) {
                tr = tr + '<tr>';
                tr = tr + '<th>Year</th>';
                tr = tr + '<th>Dues Amt</th>';
                tr = tr + '<th>Date Due</th>';
                tr = tr + '<th>Paid</th>';
                tr = tr + '<th>Date Paid</th>';
                tr = tr + '</tr>';
                TaxYear = rec.DateDue.substring(0, 4);
            }

            tempDuesAmt = '' + rec.DuesAmt;
            tr = tr + '<tr>';
            tr = tr + '<td>' + rec.FY + '</a></td>';
            tr = tr + '<td>' + formatMoney(tempDuesAmt) + '</td>';
            tr = tr + '<td>' + rec.DateDue.substring(0, 10) + '</td>';
            tr = tr + '<td>' + setCheckbox(rec.Paid) + '</td>';
            tr = tr + '<td>' + rec.DatePaid.substring(0, 10) + '</td>';
            tr = tr + '</tr>';
        });

        $("#DuesStatementAssessmentsTable tbody").html(tr);

    } // End of function formatDuesStatementResults(hoaRec){

	//=================================================================================================================
	// This is what is exposed from this Module
	return {
	};

})(); // var main = (function(){
