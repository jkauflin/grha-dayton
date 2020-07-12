/*==============================================================================
 * (C) Copyright 2019 John J Kauflin, All rights reserved. 
 *----------------------------------------------------------------------------
 * DESCRIPTION: 
 *----------------------------------------------------------------------------
 * Modification History
 * 2015-03-06 JJK 	Initial version 
 *============================================================================*/
var googleAnalytics = (function () {
	'use strict';  // Force declaration of variables before use (among other things)

	window.ga = function () {
		ga.q.push(arguments)
	};
	ga.q = [];
	ga.l = +new Date;
	ga('create', 'UA-56094636-1', 'auto');
	ga('send', 'pageview')

})(); // var googleAnalytics = (function(){
