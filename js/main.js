/*==============================================================================
 * (C) Copyright 2015,2020 John J Kauflin, All rights reserved.
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
 *============================================================================*/
var main = (function () {
	'use strict';  // Force declaration of variables before use (among other things)

	//=================================================================================================================
	// Variables cached from the DOM
    var $document = $(document);
    
	//=================================================================================================================
    // Bind events
    // Auto-close the collapse menu after clicking a non-dropdown menu item (in the bootstrap nav header)
    $(".navbar-nav li a:not('.dropdown-toggle')").on('click', function () { 
        $('.navbar-collapse').collapse('hide'); 
    });


//    $(".navbar-nav li a:not('.dropdown-toggle')")
/*
    $document.on("click", "#DuesTabButton", function () {
        var $this = $(this);
        //console.log("Click on MediaFolderLink, data-dir = " + $this.attr('data-dir'));
        //displayThumbnails($this.attr('data-dir'));
        $(".nav-link").find(".active").removeClass("active");
        $('.navbar-nav a[href="#DuesPage"]').tab('show')
        $('.navbar-nav a[href="#DuesPage"]').addClass('active');
    });
    $document.on("click", "#ContactsTabButton", function () {
        var $this = $(this);
        //console.log("Click on MediaFolderLink, data-dir = " + $this.attr('data-dir'));
        //displayThumbnails($this.attr('data-dir'));
        //$(".nav-link").find(".active").removeClass("active");
        $('.navbar-nav a(".active")').removeClass("active");
        $('.navbar-nav a[href="#ContactsPage"]').tab('show');
        $('.navbar-nav a[href="#ContactsPage"]').addClass('active');
    });

<ul class="nav navbar-nav ml-auto">
        <li class="nav-item"><a class="nav-link active" data-toggle="tab" href="#HomePage" role="tab">
        <li class="nav-item"><a class="nav-link" data-toggle="tab" href="#ContactsPage" role="tab">


    $(".nav .nav-link").on("click", function () {
        $(".nav").find(".active").removeClass("active");
        $(this).addClass("active");
    });


    $(document).ready(function () {
        $(document).on('click', '.nav-item a', function (e) {
            $(this).parent().addClass('active').siblings().removeClass('active');
        });
    });

    $(document).on('click', '.nav-list li', function (e) {
        $(this).addClass('active').siblings().removeClass('active');
    });
*/


})(); // var main = (function(){
