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
 * 2022-06-01 JJK   Moved navbar tab stuff to navtab.js, and implement
 *                  vanilla javascript handling of duesStatement clicks
 * 2022-06-26 JJK   Converted the rest of the JQuery to vanilla javascript
 *                  (to remove the dependance and load of JQuery library)
 *============================================================================*/
var main = (function () {
	'use strict';  // Force declaration of variables before use (among other things)

	//=================================================================================================================
	// Variables cached from the DOM

	//=================================================================================================================
    // Bind events

    // Listen to clicks on the Body and look for specific classes for handling
    document.body.addEventListener("click", function (event) {
        if (event.target && event.target.classList.contains("DuesStatement")) {
            getDuesStatement(event.target);
        }
    });

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
            document.getElementById("MessageDisplay").textContent = "Fetch data FAILED - check log";
        });
    });


    //=================================================================================================================
	// Module methods

    function displayPropertyList(hoaPropertyRecList) {
        let propertyListDisplay = document.getElementById("PropertyListDisplay")
        let tbody = propertyListDisplay.getElementsByTagName("tbody")[0]
        util.empty(tbody)

        if (hoaPropertyRecList == null || hoaPropertyRecList.length == 0) {
            let tr = document.createElement('tr')
            tr.textContent = "No records found - try different search parameters"
            tbody.appendChild(tr)
        } else {
            let tr = document.createElement('tr')
            // Append the header elements
            let th = document.createElement("th"); th.textContent = "Row"; tr.appendChild(th)
            th = document.createElement("th"); th.textContent = "Parcel Location"; tr.appendChild(th)
            th = document.createElement("th"); th.classList.add('d-none','d-sm-table-cell'); th.textContent = "Parcel Id"; tr.appendChild(th)
            th = document.createElement("th"); th.classList.add('d-none','d-lg-table-cell'); th.textContent = "Lot No"; tr.appendChild(th)
            th = document.createElement("th"); th.classList.add('d-none','d-lg-table-cell'); th.textContent = "Sub Div"; tr.appendChild(th)
            th = document.createElement("th"); th.textContent = "Dues Statement"; tr.appendChild(th)
            tbody.appendChild(tr)

            // Append a row for every record in list
            for (let index in hoaPropertyRecList) {
                let hoaPropertyRec = hoaPropertyRecList[index]

                tr = document.createElement('tr')
                let td = document.createElement("td"); td.textContent = Number(index) + 1; tr.appendChild(td)
                td = document.createElement("td"); td.textContent = hoaPropertyRec.parcelLocation; tr.appendChild(td)
                td = document.createElement("td"); td.classList.add('d-none','d-sm-table-cell'); td.textContent = hoaPropertyRec.parcelId; tr.appendChild(td)
                td = document.createElement("td"); td.classList.add('d-none','d-lg-table-cell'); td.textContent = hoaPropertyRec.lotNo; tr.appendChild(td)
                td = document.createElement("td"); td.classList.add('d-none','d-lg-table-cell'); td.textContent = hoaPropertyRec.subDivParcel; tr.appendChild(td)
                td = document.createElement("td")
                let button = document.createElement("button"); button.setAttribute('type',"button"); button.setAttribute('role',"button")
                button.setAttribute('data-parcelId', hoaPropertyRec.parcelId); button.classList.add('btn','btn-success','btn-sm','DuesStatement')
                button.textContent = "Dues Statement"
                td.appendChild(button)
                tr.appendChild(td)
                tbody.appendChild(tr)
            }
        }
    }

    function getDuesStatement(element) {
        let url = "hoadb/getHoaDbData2.php";
        let paramMap = new Map();
        paramMap.set('parcelId', element.getAttribute("data-parcelId"));

        let urlParamStr = util.getParamDatafromInputs(null, paramMap, false);
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
            document.getElementById("MessageDisplay").textContent = "Fetch data FAILED - check log";
        })
    }

    function formatDuesStatementResults(hoaRec) {
        let duesStatementPropertyTable = document.getElementById("DuesStatementPropertyTable")
        let payDues = document.getElementById("PayDues")
        let payDuesInstructions = document.getElementById("PayDuesInstructions")
        
        util.empty(payDues)
        util.empty(payDuesInstructions)

        let tbody = duesStatementPropertyTable.getElementsByTagName("tbody")[0]
        util.empty(tbody)

        let tr = document.createElement('tr')
        let th = document.createElement("th"); th.textContent = "Parcel Id: "; tr.appendChild(th)
        let td = document.createElement("td"); td.textContent = hoaRec.Parcel_ID; tr.appendChild(td)
        tbody.appendChild(tr)
        tr = document.createElement('tr')
        th = document.createElement("th"); th.textContent = "Lot No: "; tr.appendChild(th)
        td = document.createElement("td"); td.textContent = hoaRec.LotNo; tr.appendChild(td)
        tbody.appendChild(tr)
        tr = document.createElement('tr')
        th = document.createElement("th"); th.textContent = "Location: "; tr.appendChild(th)
        td = document.createElement("td"); td.textContent = hoaRec.Parcel_Location; tr.appendChild(td)
        tbody.appendChild(tr)
        tr = document.createElement('tr')
        th = document.createElement("th"); th.textContent = "City State Zip: "; tr.appendChild(th)
        td = document.createElement("td"); td.textContent = hoaRec.Property_City + ', ' + hoaRec.Property_State + ' ' + hoaRec.Property_Zip
        tr.appendChild(td)
        tbody.appendChild(tr)
        tr = document.createElement('tr')
        th = document.createElement("th"); th.textContent = "Total Due: "; tr.appendChild(th)
        td = document.createElement("td")
        let tempTotalDue = '' + hoaRec.TotalDue;
        td.textContent = util.formatMoney(tempTotalDue)
        tr.appendChild(td)
        tbody.appendChild(tr)

        var tempDuesAmt = util.formatMoney(hoaRec.assessmentsList[0].DuesAmt);

        // If enabled, payment button and instructions will have values, else they will be blank if online payment is not allowed
        if (hoaRec.TotalDue > 0) {
            // Only offer online payment if total due is just the current assessment (i.e. prior year due needs to contact the Treasurer)
            if (tempDuesAmt == hoaRec.TotalDue) {
                let i = document.createElement("i");
                i.classList.add('fa','fa-usd','float-start','mr-1')
                i.textContent = ' Click HERE to make payment online'
                let a = document.createElement("a")
                a.href = "payDues.html?parcelId=" + hoaRec.Parcel_ID
                a.classList.add('btn','btn-success','m-2','link-tile')
                a.appendChild(i)
                payDues.appendChild(a)
            }
            payDuesInstructions.classList.add("mb-3")
            payDuesInstructions.innerHTML = hoaRec.paymentInstructions
        }


        let duesStatementCalculationTable = document.getElementById("DuesStatementCalculationTable")
        tbody = duesStatementCalculationTable.getElementsByTagName("tbody")[0]
        util.empty(tbody)

        // Display the dues calculation lines
        if (hoaRec.totalDuesCalcList != null && hoaRec.totalDuesCalcList.length > 0) {
            for (let index in hoaRec.totalDuesCalcList) {
                let rec = hoaRec.totalDuesCalcList[index]
                tr = document.createElement('tr')
                td = document.createElement("td"); td.textContent = rec.calcDesc; tr.appendChild(td)
                td = document.createElement("td"); td.textContent = '$'; tr.appendChild(td)
                td = document.createElement("td"); td.style.textAlign = "right";
                td.textContent = parseFloat('' + rec.calcValue).toFixed(2); tr.appendChild(td)
                tbody.appendChild(tr)
            }
        }

        tr = document.createElement('tr')
        td = document.createElement("td"); td.textContent = "Total Due: "; tr.appendChild(td)
        td = document.createElement("td"); td.textContent = '$'; tr.appendChild(td)
        td = document.createElement("td"); td.style.textAlign = "right";
        td.textContent = parseFloat('' + hoaRec.TotalDue).toFixed(2) ; tr.appendChild(td)
        tbody.appendChild(tr)

        tr = document.createElement('tr')
        td = document.createElement("td"); td.textContent = hoaRec.assessmentsList[0].LienComment; tr.appendChild(td)
        td = document.createElement("td"); td.textContent = ''; tr.appendChild(td)
        td = document.createElement("td"); td.style.textAlign = "right"; td.textContent = ''; tr.appendChild(td)
        tbody.appendChild(tr)


        let duesStatementAssessmentsTable = document.getElementById("DuesStatementAssessmentsTable")
        tbody = duesStatementAssessmentsTable.getElementsByTagName("tbody")[0]
        util.empty(tbody)

        // Display the assessment lines
        if (hoaRec.assessmentsList != null && hoaRec.assessmentsList.length > 0) {
            tr = document.createElement('tr')
            th = document.createElement("th"); th.textContent = 'Year'; tr.appendChild(th)
            th = document.createElement("th"); th.textContent = 'Dues Amt'; tr.appendChild(th)
            th = document.createElement("th"); th.textContent = 'Date Due'; tr.appendChild(th)
            th = document.createElement("th"); th.textContent = 'Paid'; tr.appendChild(th)
            th = document.createElement("th"); th.textContent = 'Date Paid'; tr.appendChild(th)
            tbody.appendChild(tr)

            let tempDuesAmt = '';
            let maxPaymentHistoryLines = 6;
            for (let index in hoaRec.assessmentsList) {
                let rec = hoaRec.assessmentsList[index]
                // 2024-11-08 JJK - new logic to limit display of historical PAID (or Non-Collectible)
                if ((!rec.Paid && !rec.NonCollectible) || index < maxPaymentHistoryLines) {
                    tempDuesAmt = '' + rec.DuesAmt;
                    tr = document.createElement('tr')
                    td = document.createElement("td"); td.textContent = rec.FY ; tr.appendChild(td)
                    td = document.createElement("td"); td.textContent = util.formatMoney(tempDuesAmt); tr.appendChild(td)
                    td = document.createElement("td"); td.textContent = rec.DateDue.substring(0, 10); tr.appendChild(td)
                    td = document.createElement("td"); td.innerHTML = util.setCheckbox(rec.Paid); tr.appendChild(td)
                    td = document.createElement("td"); td.textContent = rec.DatePaid.substring(0, 10); tr.appendChild(td)
                    tbody.appendChild(tr)
                }
            }
        }

    } // End of function formatDuesStatementResults(hoaRec){

	//=================================================================================================================
	// This is what is exposed from this Module
	return {
	};

})(); // var main = (function(){
