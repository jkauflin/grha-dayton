/*==============================================================================
 * (C) Copyright 2015,2020,2021,2022 John J Kauflin, All rights reserved.
 *----------------------------------------------------------------------------
 * DESCRIPTION:
 *----------------------------------------------------------------------------
 * Modification History
 * 2015-03-06 JJK 	Initial version
 * 2016-03-01 JJK	Converted from JQuery Mobile to Twitter Bootstrap
 * 2016-03-25 JJK	Got most of website together.  PDF modals, help button,
 * 					fleshed out all menus but FAQ.
 * 2016-03-26 JJK	Working on property search and Dues Statement modal
 * 2016-08-26 JJK   Completed Dues Checker dues statement display (with
 * 					online payment option)
 * 2017-10-08 JJK	Update to HTML5 boilerplate 6, bootstrap 3.3, jquery 3
 * 2018-11-23 JJK   Re-factored for modules
 * 2020-03-14 JJK   Re-factored to use the new MediaGallery library and
 *                  Media folder for all photos and docs
 * 2020-03-15 JJK   Moved the dues stuff to dues.js
 * 2020-12-21 JJK   Moved dues stuff back here and added link-time handling
 * 2021-01-02 JJK   Modified for new Paypal API rather than smart button
 * 2022-05-31 JJK   Modified to use new fetch logic for service calls
 *============================================================================*/
var main = (function () {
	'use strict';  // Force declaration of variables before use (among other things)

	//=================================================================================================================
	// Variables cached from the DOM
    var $document = $(document);

	//=================================================================================================================
    // Bind events
    // Auto-close the collapse menu after clicking a non-dropdown menu item (in the bootstrap nav header)
    $('.navbar-collapse a').click(function(){
		$(".navbar-collapse").collapse('hide');
	});

    // Click on a link-tile will remove the active from the current tab, show the new tab and make it active
    $document.on("click", ".link-tile-tab", function (event) {
        var $this = $(this);
        event.preventDefault();
        var targetTab = $this.attr('data-dir');
        displayTabPage(targetTab);
    });


    // Check if a Tab name is passed as a parameter on the URL and navigate to it
    var results = new RegExp('[\?&]tab=([^&#]*)').exec(window.location.href);
    if (results != null) {
        var tabName = results[1] || 0;
        displayTabPage(tabName);
    }


    document.getElementById("InputValues").addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click
            document.getElementById("DuesSearchButton").click();
        }
    });

    document.getElementById("DuesSearchButton").addEventListener("click", function () {
        let url = 'hoadb/getHoaPropertiesList2.php';
        let urlParamStr = util.getParamDatafromInputs('InputValues', null, false);
        //console.log(`>>> in FetchData url = ${url}, urlParamStr = ${urlParamStr}`);
        fetch(url+urlParamStr)
        .then(response => {
            if (!response.ok) {
                throw new Error('Response was not OK');
            }
            return response.json();
        })
        .then(data => {
            displayPropertyList(data);
        })
        .catch((err) => {
            console.error(`Error in Fetch to ${url}, ${err}`);
            document.getElementById("MessageDisplay").innerHTML = "Fetch data FAILED - check log";
        });
    });

    $document.on("click", ".DuesStatement", function () {
        let url = "hoadb/getHoaDbData2.php";
        let paramMap = new Map();
        paramMap.set('parcelId', this.getAttribute("data-parcelId"));

        let urlParamStr = util.getParamDatafromInputs(null, paramMap, false);
        //console.log(`>>> in FetchData url = ${url}, urlParamStr = ${urlParamStr}`);
        fetch(url+urlParamStr)
        .then(response => {
            if (!response.ok) {
                throw new Error('Response was not OK');
            }
            return response.json();
        })
        .then(data => {
            formatDuesStatementResults(data);
            new bootstrap.Modal(document.getElementById('duesStatementModal')).show();
        })
        .catch((err) => {
            console.error(`Error in Fetch to ${url}, ${err}`);
            document.getElementById("MessageDisplay").innerHTML = "Fetch data FAILED - check log";
        });
    });


    //=================================================================================================================
	// Module methods
	function displayTabPage(targetTab) {
        var targetTabPage = targetTab + 'Page';
        // Remove the active class on the current active tab
        $(".nav-link.active").removeClass("active");
        // Show the target tab page
        $('.navbar-nav a[href="#'+targetTabPage+'"]').tab('show')
        // Make the target tab page active
        $('.navbar-nav a[href="#'+targetTabPage+'"]').addClass('active');
    }


    function displayPropertyList(hoaPropertyRecList) {
        var tr = '<tr><td>No records found - try different search parameters</td></tr>';
        var rowId = 0;

        // *** convert to javascript and check the data structure first ***
        
        $.each(hoaPropertyRecList, function (index, hoaPropertyRec) {
            rowId = index + 1;
            if (index == 0) {
                tr = '';
                tr += '<tr>';
                tr += '<th>Row</th>';
                tr += '<th>Parcel Location</th>';
                tr += '<th class="d-none d-sm-table-cell"> Parcel Id</th>';
                tr += '<th class="d-none d-lg-table-cell">Lot No</th>';
                tr += '<th class="d-none d-lg-table-cell">Sub Div</th>';
                tr += '<th>Dues Statement</th>';
                tr += '</tr>';
            }
            tr += '<tr>';
            tr += '<td>' + rowId + '</td>';
            tr += '<td>' + hoaPropertyRec.parcelLocation + '</td>';
            tr += '<td class="d-none d-sm-table-cell">' + hoaPropertyRec.parcelId + '</td>';
            tr += '<td class="d-none d-lg-table-cell">' + hoaPropertyRec.lotNo + '</td>';
            tr += '<td class="d-none d-lg-table-cell">' + hoaPropertyRec.subDivParcel + '</td>';
            tr += '<td><button type="button" data-parcelId="' + hoaPropertyRec.parcelId + '" class="btn btn-success btn-sm DuesStatement">Dues Statement</button></td>';
            tr += '</tr>';
        });

        $("#PropertyListDisplay tbody").html(tr);
    }

    function formatDuesStatementResults(hoaRec) {
        let tr = '';
        let checkedStr = '';
        let currSysDate = new Date();

        // *** convert to javascript and check the data structure first ***

        $("#PayDues").html('');
        $("#PayDuesInstructions").html('');

        var ownerRec = hoaRec.ownersList[0];

        tr += '<tr><th>Parcel Id:</th><td>' + hoaRec.Parcel_ID + '</a></td></tr>';
        tr += '<tr><th>Lot No:</th><td>' + hoaRec.LotNo + '</td></tr>';
        //tr += '<tr><th>Sub Division: </th><td>'+hoaRec.SubDivParcel+'</td></tr>';
        tr += '<tr><th>Location: </th><td>' + hoaRec.Parcel_Location + '</td></tr>';
        tr += '<tr><th>City State Zip: </th><td>' + hoaRec.Property_City + ', ' + hoaRec.Property_State + ' ' + hoaRec.Property_Zip + '</td></tr>';

        var tempTotalDue = '' + hoaRec.TotalDue;
        tr += '<tr><th>Total Due: </th><td>$' + util.formatMoney(tempTotalDue) + '</td></tr>';
        $("#DuesStatementPropertyTable tbody").html(tr);

        var tempDuesAmt = util.formatMoney(hoaRec.assessmentsList[0].DuesAmt);

        // If enabled, payment button and instructions will have values, else they will be blank if online payment is not allowed
        if (hoaRec.TotalDue > 0) {
            // Only offer online payment if total due is just the current assessment (i.e. prior year due needs to contact the Treasurer)
            if (tempDuesAmt == hoaRec.TotalDue) {
                $("#PayDues").append(
                    $('<a>')
                        .attr('href', "payDues.html?parcelId=" + hoaRec.Parcel_ID)
                        .prop('class', 'btn btn-success m-2 link-tile')
                        .append($('<i>').prop('class', "fa fa-usd float-left mr-1").html(' Click HERE to make payment online'))
                );
            }
            $("#PayDuesInstructions").prop('class', "mb-3").html(hoaRec.paymentInstructions);
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
            tr = tr + '<td>' + util.formatMoney(tempDuesAmt) + '</td>';
            tr = tr + '<td>' + rec.DateDue.substring(0, 10) + '</td>';
            tr = tr + '<td>' + util.setCheckbox(rec.Paid) + '</td>';
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
