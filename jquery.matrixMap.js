/**
* MySource Matrix Simple Edit Tools (jquery.matrixMap.js)
* version: 0.1 (MAY-05-2009)
* Copyright (C) 2009 Nicholas Hubbard
* @requires jQuery v1.3 or later
*
* Examples and documentation at: http://www.zedsaid.com/projects/simple-edit-tools
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
*
*/

(function ($) {
	  

/**
* Plugin that allows you to browse the MySource Matrix asset tree structure.  
* This is beneficial sometimes as you can bypass the java asset map.
* It sends XML to Matrix, then receives an XML response.
* Demo: http://www.puc.edu/dev/jquery-matrix-test-suite/matrix-map
*
* @version $Revision: 0.3
*/
$.fn.matrixMap = function (options) {
	var defaults = {
		root: 1,
		showChildren: false
	};
	
	var options = $.extend(defaults, options);
	var obj = $(this);
	
	// Find out what site we are at
	var proto = location.protocol;
	var site = location.host;
	var host_url = proto + '//' + site + '?SQ_ACTION=asset_map_request';
	
	// Construct our XML to send
	//var xml_move = '<command action="move asset" to_parent_assetid="2858" to_parent_pos="1"><asset assetid="47315"  linkid="81951"  parentid="2858" /></command>';
	var xml_get = '<command action="get assets"><asset assetid="' + defaults.root + '" start="0" limit="150" linkid="10" /></command>';
	
	// Create our element
	obj.append('<ul id="map_root"></ul>');
	
	// Set somes image vars
	var type_2_path = '/__lib/web/images/icons/asset_map/not_visible.png';
	var type_2_image = '<img class="type_2" src="' + type_2_path + '" />';
	var branch_closed = '<img src="/__lib/web/images/tree/branch_closed.gif" />';
	var branch_open = '<img src="/__lib/web/images/tree/branch_open.gif" />';
	var branch_stalk = '<img src="/__lib/web/images/tree/stalk.gif" />';
	
	// Create our ajax to send the XML
	$.ajax({
		url: host_url,
		type: 'POST',
		processData: false,
		data: xml_get,
		contentType: "text/xml",
		dataType: 'xml',
		success: function(xml) {
			// Check each asset that we find
			$(xml).find('asset').each(function() {
				// Only include asset tags with attributesp
				if ($(this).attr('assetid') > 0) {
					// Set some of our vars that will populate our asset map
					var asset_id = unescape($(this).attr('assetid'));
					var asset_status = $(this).attr('status');
					var asset_link_type = parseInt($(this).attr('link_type'));
					var asset_type_code = $(this).attr('type_code');
					var asset_num_kids = parseInt($(this).attr('num_kids'));
					var asset_name = unescape($(this).attr('name')).replace(/\+/g, ' ');
					// See what kind of link type we have
					if (asset_link_type === 2) {
						// Type 2 link
						var asset_image = '<img class="asset_image" src="/__data/asset_types/' + asset_type_code + '/icon.png" />';
						asset_image = type_2_image + asset_image;
					} else {
						// Type 1 link
						var asset_image = '<img src="/__data/asset_types/' + asset_type_code + '/icon.png" />';
					}
					
					// See if we have kids
					if (asset_num_kids === 0) {
						var indicate_kids = branch_stalk;
					} else {
						var indicate_kids = branch_closed;
					}
					$('<li></li>').html('<a href="#" class="icon_hold">' + asset_image + '</a> <a id="a' + asset_id + '" href="#" rel="' + asset_num_kids + '">' + asset_name + '</a>').appendTo('#map_root');
				}// End if
			
			});// End each
			
			// Set our first/last class
			$('ul li:first').addClass('first');
			$('ul li:last').addClass('last');
			
		}// End success
		
	});// End ajax
	
	// Lets click our parents to show their children
	$('#map_root li a').live('dblclick', function(){
		
		// Get our current asset
		var current_asset = $(this);
		var sub_root = $(this).attr('id').replace('a', '');
		var num_kids = $(this).attr('rel');
		
		// If there are no kids don't continue
		if (num_kids === '0') {
			return;	
		}
		
		// Check to see if we already have a class
		if (current_asset.hasClass('children')) {
			current_asset.removeClass('children');
			// Hide our tree
			current_asset.parent().next('ul').hide();
			return;
		} else {
			// This must meen that we can expand, so add a class
			current_asset.addClass('children');
			// Let it know that we have expanded so we don't have to load again
			current_asset.addClass('cache');
		}
		
		// Construct our XML to send
		var xml_get = '<command action="get assets"><asset assetid="' + sub_root + '" start="0" limit="150" linkid="10" /></command>';
		
		// Create a new list
		current_asset.parent().after('<ul></ul>');
		
		// Grab our child assets
		$.ajax({
			url: host_url,
			type: 'POST',
			processData: false,
			data: xml_get,
			contentType: "text/xml",
			dataType: 'xml',
			error: function (XMLHttpRequest, textStatus, errorThrown) {
				console.log(XMLHttpRequest + textStatus + errorThrown);
			},
			beforeSend: function () {
				current_asset.parent().after('<ul class="loading"><li><img src="/__lib/web/images/icons/asset_map/loading_node.png" /> Loading...</li></ul>');
			},
			success: function (xml) {
				// Remove loading
				$('.loading').remove();
				// Check each asset that we find
				$(xml).find('asset').each(function() {
					// Only include asset tags with attributesp
					if ($(this).attr('assetid') > 0) {
						// Set some of our vars that will populate our asset map
						var asset_id = unescape($(this).attr('assetid'));
						var asset_type_code = $(this).attr('type_code');
						var asset_link_type = parseInt($(this).attr('link_type'));
						var asset_num_kids = parseInt($(this).attr('num_kids'));
						var asset_name = unescape($(this).attr('name')).replace(/\+/g, ' ');
						var asset_image = ' <img src="/__data/asset_types/' + asset_type_code + '/icon.png" />';
						// See what kind of link type we have
						if (asset_link_type === 2) {
							// Type 2 link
							var asset_image = '<img class="asset_image" src="/__data/asset_types/' + asset_type_code + '/icon.png" />';
							var asset_image = type_2_image + asset_image;
						} else {
							// Type 1 link
							var asset_image = '<img src="/__data/asset_types/' + asset_type_code + '/icon.png" />';
						}
						
						// See if we have kids
						if (asset_num_kids === 0) {
							var indicate_kids = branch_stalk;
						} else {
							var indicate_kids = branch_closed;
						}
						
						$('<li></li>').html('<a href="#" class="icon_hold">' + asset_image + '</a> <a id="a' + asset_id + '" href="#" rel="' + asset_num_kids + '">' + asset_name + '</a>').appendTo(current_asset.parent().next());
					}// End if
				
				});// End each
				
				// Set our first/last class
				$('ul li:first').addClass('first');
				$('ul li:last').addClass('last');
				
			}// End success
			
		});// End ajax
		
		return false;
		
	});// End live click
	
};// End matrixMap

})(jQuery);