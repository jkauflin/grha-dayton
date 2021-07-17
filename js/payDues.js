/*==============================================================================
 * (C) Copyright 2015,2020 John J Kauflin, All rights reserved.
 *----------------------------------------------------------------------------
 * DESCRIPTION:  Javascript for the page that present the buttons to
 *               make an online payment for dues
 *----------------------------------------------------------------------------
 * Modification History
 * 2021-01-01 JJK 	Initial version (seperated from main page to implement
 *                  newest Paypal API integration and button rendering)
 * 2021-02-13 JJK   Added parcelId after FY in the CustomId
 * 2021-07-17 JJK   Added money format around processing fee
 *============================================================================*/
var payDues = (function () {
	'use strict';  // Force declaration of variables before use (among other things)

	//=================================================================================================================
	// Variables cached from the DOM
    var $PayDuesTitle = $('#PayDuesTitle');
    var $PayDuesTitle2 = $('#PayDuesTitle2');
    var $PayDuesMessage = $('#PayDuesMessage');

    $PayDuesTitle.empty();
    $PayDuesTitle2.empty();

    // Check if a Parcel ID is passed as a parameter on the URL
    var results = new RegExp('[\?&]parcelId=([^&#]*)').exec(window.location.href);
    if (results != null) {
        var rawParcelId = results[1] || 0;
        var parcelId = decodeURIComponent(rawParcelId);
        //console.log("parcelId = " + parcelId);

        // Fetch data from the database for this property
        return fetch('hoadb/getHoaDbData2.php?parcelId='+rawParcelId)
        .then(function (response) {
            if (response.ok) {
                // if response and JSON are OK, return the JSON object part of the fetch response to the next promise
                return response.json();
            } else {
                $PayDuesMessage.html("Error is getting data on property");
                throw new Error('Error in response or JSON from server, code = '+response.status);
            }
        })
        .then(function (hoaRec) {
            //console.log("hoaRec.Parcel_ID = "+hoaRec.Parcel_ID);
            if (hoaRec.TotalDue == 0) {
                $PayDuesMessage.html("No Dues are currently owed on this property");
            } else if (hoaRec.TotalDue != util.formatMoney(hoaRec.assessmentsList[0].DuesAmt)) {
                $PayDuesMessage.html("More than current year dues are owed on this property - contact Treasurer");
            } else {
                var paymentValue = hoaRec.TotalDue + hoaRec.paymentFee;
                $PayDuesTitle.html("Pay HOA dues for property at "+hoaRec.Parcel_Location);
                $PayDuesTitle2.html("$"+hoaRec.TotalDue+" (Dues) + $"+util.formatMoney(hoaRec.paymentFee)
                    +" (Processing Fee) = $"+util.formatMoney(paymentValue)+" Total");

                // Use the Paypal javascript SDK to render buttons for dues payment, and respond to approval
                paypal.Buttons({
                    style: {
                        //layout:  'vertical',
                        //color:   'gold',
                        //shape:   'rect',
                        label:   'pay'
                    },
                    // Create an order with the payment amount, and re-direct to Paypal for approval of the payment transaction
                    createOrder: function (data, actions) {
                        return actions.order.create({
                            purchase_units: [{
                                reference_id: parcelId,
                                amount: {
                                    value: paymentValue
                                },
                                description: hoaRec.assessmentsList[0].FY+' Dues and processing fee for property at '+hoaRec.Parcel_Location,
                                custom_id: hoaRec.assessmentsList[0].FY+','+parcelId
                            }]
                        });
                    },
                    onApprove: function (data) {
                        // After payment approval, call a secure PHP service to capture the order payment details from Paypal
                        // and update the HOADB to record the payment (and also send confirmation emails)
                        return fetch('hoadb/handlePayment.php?orderID='+data.orderID)
                        .then(function (response) {
                            //console.log(response);
                            // Check the status of the reponse (400 or 500 errors)
                            if (response.ok) {
                                // if response and JSON are OK, return the JSON object part of the fetch response to the next promise
                                return response.json();
                            } else {
                                $PayDuesMessage.html("Payment made but there was a problem updating HOA records - contact Treasurer");
                                throw new Error('Error in response or JSON from server, code = '+response.status);
                            }
                            //return response.json();
                        }).then(function (details) {
                            $PayDuesMessage.html("Thank you, "+details.result.payer.name.given_name
                                +".  "+hoaRec.assessmentsList[0].FY+' Dues for property at '+hoaRec.Parcel_Location
                                +" have been marked as PAID");
                        })
                    },
                    onCancel: function (data) {
                        $PayDuesMessage.html("Payment cancelled ");
                    },
                    onError: function (err) {
                        console.log("Error in payment, err = "+err);
                        $PayDuesMessage.html("Error in payment - contact Treasurer");
                    }
                }).render('#paypal-button-container'); // Display payment options on your web page

            }
        })

    }

	//=================================================================================================================
	// This is what is exposed from this Module
	return {
	};

})(); // var payDues = (function(){
