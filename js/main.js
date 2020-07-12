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
    $document.on('click', '.navbar-collapse.in', function (e) {
        if ($(e.target).is('a') && $(e.target).attr('class') != 'dropdown-toggle') {
            $(this).collapse('hide');
        }
    });

})(); // var main = (function(){
