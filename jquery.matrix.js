/**
* MySource Matrix Simple Edit Tools (jquery.matrix.js)
* version: 0.3 (APR-16-2009)
* Copyright (C) 2009 Nicholas Hubbard
* @requires jQuery v1.3 or later
* @requires Trigger or Asset configuration in MySource Matrix
*
* Examples and documentation at: http://www.zedsaid.com/projects/simple-edit-tools
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
*
*/


/**
* Function that overrides page_on_load in limbo_outputter.inc.  
* This is nessessary to allow Matrix to open a frame as a stand alone.
*
* @version $Revision: 0.1 $
*/
function page_on_load() {
	SQ_DOCUMENT_LOADED = true;
};


(function ($) {
	  

/**
* Plugin that allows you to browse the MySource Matrix asset tree structure.  
* This is beneficial sometimes as you can bypass the java asset map.
* It sends XML to Matrix, then receives an XML response.
*
* @version $Revision: 0.3
*/
$.fn.matrixMap = function (options) {
	var defaults = {
		root: '1',
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
	var branch_stalk = '<img src="/__lib/web/images/tree/stalk" />';
	
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
					$('<li></li>').html(indicate_kids + '<a href="#" class="icon_hold">' + asset_image + '</a> <a id="a' + asset_id + '" href="#" rel="' + asset_num_kids + '">' + asset_name + '</a>').appendTo('#map_root');
				}// End if
			
			});// End each
			
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
			// This must meen that we can expant, so add a class
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
						
						$('<li></li>').html(indicate_kids + '<a href="#" class="icon_hold">' + asset_image + '</a> <a id="a' + asset_id + '" href="#" rel="' + asset_num_kids + '">' + asset_name + '</a>').appendTo(current_asset.parent().next());
					}// End if
				
				});// End each
				
			}// End success
			
		});// End ajax
		
		return false;
		
	});// End live click
	
};// End matrixMap


/**
* Plugin that allows Asset Builders to be submitted using Ajax.  
* This is nessessary to allow Matrix to open a from as a stand alone.
*
* @version $Revision: 0.2
*/
$.fn.matrixForm = function (options) {
	var defaults = {
		findCreated: '',
		findTarget: '',
		loading: '',
		errorArray: false,
		errorSource: '',
		errorMessage: 'Please correct the following errors:',
		onComplete: function () {}
	};

	var options = $.extend(defaults, options);

	return this.each(function () {

		var obj = $(this);
		var itemHref = obj.attr('action');
		obj.removeAttr('onsubmit');
		
		// Check to see if we are using an asset builder or custom form
		var form_type = $('#sq_commit_button', obj).length === 0;
		
		// Find our submit button for custom forms
		var form_submit = $("input[type='submit']", obj);
		var form_submit_name = form_submit.attr('name');
		var form_submit_val = form_submit.attr('value');
		var form_submit_class = form_submit.attr('class');
		
		// Check to see if we are uploading a file
		if ($(obj + ' input:file').length === 0) {
			$('#sq_commit_button').removeAttr('onclick');
			
			// Choose if we should set click for asset builder or custom form
			if (form_type) {
				var set_click = 'ajax_submit';
				
				// Hide the submit button
				form_submit.hide();
				
				// Add a new button
				form_submit.after('<input id="ajax_submit" type="button" class="' + form_submit_class +'" name="' + form_submit_name +'" value="' + form_submit_val +'" />');
				form_submit.remove();
				
				// Creat our own submit string, since serialize won't grab it
				var ajax_query = '&' + form_submit_name + '=' + form_submit_val + '';
			} else {
				var set_click = 'sq_commit_button';
			}// End else
			
			// Set our click function for commit button
			$('#' + set_click).click(function () {
				$('textarea[name^="news_item"], textarea[name^="calendar_event"]').each(function () {
					var textId = $(this).attr('id');
					$(this).val(eval('editor_' + textId + '.getHTML();'));
				});
				
				// Serialize all form data
				var serializeForm = obj.serialize();
				
				// Submit using Ajax
				$.ajax({
					type: 'POST',
					url: itemHref,
					data: serializeForm + ajax_query,
					beforeSend: function () {
						if (defaults.findTarget !== '') {
							$(defaults.findTarget).show();
						}
						if (defaults.loading !== '') {
							$('#' + set_click).after('<img id="loadingImage" src="' + defaults.loading + '" alt="Loading" />');
						}
					},
					success: function (data) {
						$('#loadingImage').remove();
						if (defaults.findCreated !== '' && defaults.findTarget !== '') {
							$(defaults.findTarget).html($(data).find(defaults.findCreated));
							
							setTimeout(function () {
								$(defaults.findTarget).fadeOut('slow',
									function () {
										$(this).html('');
									});
								},5000
								
							);// End timout
							
						}// End if
							
						if (defaults.errorArray) {
							// We don't want to create multiples
							if ($('#errorsHiddenHold').length < 1) {
								// Create a hidden div to hold our errors
								$('body').append('<div id="errorsHiddenHold" style="display:none;"></div>');
							}
							// Add our content
							$('#errorsHiddenHold').html($(data).find(defaults.errorSource));
							
							// Create an array of our error messages
							var arr_errors = new Array();
							$('#errorsHiddenHold li').each(function() { 
								arr_errors.push($(this).text()); 
							});
							
							// Is array empty?
							if (arr_errors.length < 1) {
								var arry_empyty = true;
							} else {
								var arry_empyty = false;
							}// End if
							
							// Display alert if array is not empty
							if (!arry_empyty) {
								alert(defaults.errorMessage + '\n\n' + arr_errors.join('\n'));	
							} else {
								// Since our array is empyty, our form must have been submitted correcty
								defaults.onComplete.apply(obj, []);	
							}// End else
							
						}// End if
							
					}// End success
					
				});// End Ajax
				
			});// End Click
			
		} else {
			
			// Use iframe if form is uploading a file
			$('body').append('<iframe id="assetBuilderFrame" name="assetBuilderFrame" style="position:absolute; top:-1000px; left:-1000px;"></iframe>');
			$('#assetBuilderFrame').attr('src', 'javascript:false;document.write("")');
			obj.attr('target', 'assetBuilderFrame');
			
			$('#sq_commit_button').click(function () {
				obj.submit();
			});// End click
	  
		}// End else

	});// End each

};// End matirixForm
  

/**
* This Plugin filters a list of matched elements. Great when used with Asset Listings.  
* Filter searching is similar to iTunes search.
*
* @version $Revision: 0.2
*/
$.fn.matrixFilter = function (options) {
	var defaults = {
		target: 'body',
		count: true
	};

	var options = $.extend(defaults, options);

	// Add our input field and counter
	$(defaults.target).append('<input id="filter" type="text" /> <span id="count"></span>');

	var obj = $(this);
	var total = obj.length;
	if (defaults.count) {
		$('#count').text(total + ' of ' + total);
	}// End if
	
	$('#filter').keyup(function () {
								
		var filter = $('#filter').val(),
		count = 0;
		
		obj.each(function () {
						  
			if ($(this).text().search(new RegExp(filter, 'i')) < 0) {
				$(this).hide();
			} else {
				$(this).show();
				count++;
			}// End else
			
		});// End each
		
		if (defaults.count) {
			$('#count').text(count + ' of ' + total);
		}// End if
	
	}); // End keyup
  
};// End matrixFilter


/**
* This Plugin is used to stay within the same page while opening Simple Edit pages.  
* It creates an iframe, then opens URLs within the iframe.
*
* @version $Revision: 0.2
*/
$.fn.matrixFrame = function (options) {
	var defaults = {
		urlSuffix: '',
		target: 'body'
	};

	var options = $.extend(defaults, options);

	// Add our iFrame
	$(defaults.target).append('<iframe name="assetEditFrame" id="assetEditFrame" scrolling="no" frameborder="0"></iframe>');

	return this.each(function () {

		var obj = $(this);
		var itemHref = obj.attr('href');
		obj.attr('target', 'assetEditFrame');
		obj.attr('href', itemHref + defaults.urlSuffix);
		
	});// End each
	
};// End matrixFrame


/**
* This Plugin will delete single or multiple assets using Ajax.  
* Plugin requires the configuration of a Trigger to delete assets.
*
* @version $Revision: 0.2.5
*/
$.fn.matrixDelete = function (options) {
	var defaults = {
		multiple: false,
		trigger: true,
		checkboxClass: 'delete',
		checkboxAfter: true,
		urlSuffix: '?action=delete',
		target: 'body',
		simpleEdit: false,
		removeParent: false,
		beforeComplete: function () {},
		onComplete: function () {}
	};
	
	var options = $.extend(defaults, options);
	
	if (defaults.multiple) {
		$(defaults.target).append('<input id="massDelete" type="button" value="Delete Multiple" />');
	}// End if
	
	return this.each(function () {
							  
		var obj = $(this);
		
		// Grab asset info
		var itemDesc = obj.attr('rel'); 
		var item_id = obj.attr('id').replace(/[^0-9]/g, '');
		// What screen should we load?
		var item_screen = 'linking';
		
		// Remove simple edit url addition for links
		if (!defaults.simpleEdit) {
			var itemHref = obj.attr('href');
		} else {
			var itemHref = obj.attr('href').replace('/_edit', '');
			obj.attr('href', itemHref);
		}// End if
		
		// Add our multiple delete checkbox
		if (defaults.multiple) {
			var deleteCheckbox = '<input id="a' + item_id +'" class="' + defaults.checkboxClass + '" type="checkbox" value="' + itemHref + '" />';
			if (defaults.checkboxAfter) {
				obj.after(deleteCheckbox);
			} else {
				obj.before(deleteCheckbox);
			}// End else
			
		}// End if
		
		obj.click(function () { 
			// Be nice with our wording
			if (!itemDesc === '') {
				var question = confirm('Are you sure you want to delete "' + itemDesc + '"?');
			} else {
				var question = confirm('Are you sure you want to delete this?');
			}// End else
			
			if (question) {
				// Run our custom callback
				defaults.beforeComplete.apply(obj, []);
				
				if (defaults.trigger) {
					$.ajax({
						type: 'POST',
						url: itemHref + defaults.urlSuffix
					});// End ajax
				} else {
					// Looks like we are going to run this straight through the server, no triggers! Hooray!
					get_locks(item_id, item_screen);
					
				}// End else
			
				if (defaults.removeParent) {
					obj.parent().remove();
				}// End if
		  
				// Run our custom callback
				defaults.onComplete.apply(obj, []);
		  
			}// End if
			
			return false;
			
		});// End click
		
		// Check to see if the user wants to delete multiples
		if (defaults.multiple) {
			$('#massDelete').unbind('click');
			$('#massDelete').click(function () { 
											
				// Lets count how many items we are going to delete
				var deleteCount = $('.' + defaults.checkboxClass + ':checked').length; 
				
				// Lets be kind with our wording
				if (deleteCount <= 1) {
					var deleteWord = 'item';
				} else {
					var deleteWord = 'items';
				}// End if
				
				var answerDelete = confirm('You are about to delete ' + deleteCount + ' ' + deleteWord + ', are you sure you want to do this?'); 
				
				// If the user confirms, continue
				if (answerDelete) {
					$('input:checked').each(function () {
						// Run our custom callback
						defaults.beforeComplete.apply($(this), []);
					
					if (defaults.trigger) {
						// Loop through each match and run a POST for that URL
						$.ajax({
							type: 'POST',
							url: this.value + defaults.urlSuffix
						});// End ajax
					} else {
						// Looks like we are going to run this straight through the server, no triggers! Hooray!
						get_locks($(this).attr('id').replace(/[^0-9]/g, ''), item_screen);
						
					}// End else
				
						// Run our custom callback
						defaults.onComplete.apply($(this), []);
			  
					});// End each
					
					// Check to see if we can remove parents
					if (defaults.removeParent) {
						$(this + ':checked').parent().remove();
					}// End removeParent
			  
				}// End if (answerDelete)
			
			});// End click function
		  
		}// End if (defaults.multiple)
	
	});// End each
  
};// End matrixDelete


/**
* This Plugin will clone the current asset and link to the same parent.  
* Plugin requires the configuration of a Trigger to clone assets.
*
* @version $Revision: 0.2.5
*/
$.fn.matrixClone = function (options) {
	var defaults = {
		limit: 10,
		urlSuffix: '?action=duplicate',
		target: 'body',
		beforeComplete: function () {},
		onComplete: function () {}
	};

	var options = $.extend(defaults, options);

	// Add our duplicate field and button
	$(defaults.target).append('<input id="duplicateInput" type="text" value="" /> <input id="duplicateConfirm" type="button" value="Duplicate" />');

	return this.each(function () {

		var obj = $(this);
		obj.click(function () {
			var itemHref = obj.attr('href');
			var itemDesc = obj.attr('rel');
			$('#duplicateConfirm').unbind('click');
			$('#duplicateConfirm').click(function () {
				var duplicateVal = $('#duplicateInput').val();
				
				// Check if it is a number
				if (isNaN(duplicateVal)) {
					alert('You have entered a value that is not a number. Please enter a number.');
					$('#duplicateInput').val('');
					return false;
				}// End if
				
				var dulicateCheck = parseInt(duplicateVal);
				
				// Check our duplication limit
				if (dulicateCheck <= defaults.limit) {
					if (!itemDesc === '') {
						var cloneAnswer = confirm('Are you sure you want duplicate "' + itemDesc + '" ' + dulicateCheck + ' times?');
					} else {
						var cloneAnswer = confirm('Are you sure you want duplicate this ' + dulicateCheck + ' times?');
					}// End if
					
					if (cloneAnswer) {
				
						// Run our custom callback
						defaults.beforeComplete.apply(obj, []);
				
						for (var i = 1; i <= dulicateCheck; i++) {
							$.ajax({
								type: 'POST',
								url: itemHref + defaults.urlSuffix
							});// End ajax
							
						}// End for loop
			  
						// Run our custom callback
						defaults.onComplete.apply(obj, []);
			  
					}// End if
					
				} else {
					alert('You are limited to ' + defaults.limit + ' duplicates or less, please adjust your value.');
					$('#duplicateInput').val('');
				}// End else
		  
			}); // End DuplicateConfirm
		
			return false;
		
		}); // End obj.click
	  
	});// End each
	
};// End matrixClone

  
/**
* This Plugin will change the status of an asset.  
* Plugin requires the configuration of a Trigger to clone assets.
*
* @version $Revision: 0.2.5
*/
$.fn.matrixStatus = function (options) {
	var defaults = {
		urlSuffix: '?action=live',
		trigger: true,
		beforeComplete: function () {},
		onComplete: function () {}
	};

	var options = $.extend(defaults, options);
	
	// What screen should we load?
	var item_screen = 'details';

	return this.each(function () {
		var obj = $(this);
		var itemDesc = obj.attr('rel');
		var itemHref = obj.attr('href');
		var item_id = obj.attr('id').replace(/[^0-9]/g, '');
		obj.click(function () {
			
			// Make sure we want to change status
			if (!itemDesc === '') {
				var question = confirm('Are you sure you want to change the status of "'+itemDesc+'"?');
			} else {
				var question = confirm('Are you sure you want to change the status?');
			}// End if
			
			if (question) {
				
				// Run our custom callback
				defaults.beforeComplete.apply(obj, []);
		  
				if (defaults.trigger) {
					$.ajax({
						type: 'POST',
						url: itemHref + defaults.urlSuffix
					});// End ajax
				} else {
					// No triggers!  Heck yes!
					get_locks(item_id, item_screen);
					
				}// End else
		  
				// Run our custom callback
				defaults.onComplete.apply(obj, []);
		  
			}// End if
			
			return false;
		
		});// End click
	  
	});// End each
	
};// End matrixStatus
  

/**
* This Plugin is VERY experimental and hardly even functional.  
* It is used to edit text inline and POST back using ajax.
* Current page URL, %asset_url% must be passed to function
* Work in progress!!
* Plugin requires the configuration of a Trigger to work.
*
* @version $Revision: 0.1
*/
$.fn.matrixEdit = function (options) {
	var defaults = {
		//None yet
	};
	
	var options = $.extend(defaults, options);
	
	return this.each(function () {
		
		var obj = $(this);
		
		obj.click(function () {
			obj.attr('contentEditable', 'true').css('background-color', '#ccc');
		});// End click
		
		obj.blur(function () {
			obj.attr('contentEditable', 'false').css('background-color', '#fff');
		});// End blur
		
		$('#save').click(function () {
			var saveContent = obj.html();
			var currentHref = defaults.currentPage;
			
			$.ajax({
				type: 'POST',
				url: location.href,
				data: '?action=change&details=' + saveContent
			});// End ajax
				
		});// End click
		
	});// End each
	
};// End matrixEdit

  
})(jQuery);

/**
* Function that returns an ajax error
*/
function ajax_error(xhr, ajaxOptions, errorThrown) {
	if (xhr.status === 302) {
		alert('You do not have permissions to this asset.  Please log into MySource Matrix');
	} else {
		alert('You must be logged into MySource Matrix in order to complete this action.');
	}
	console.log(errorThrown);
}// End ajax_error


/**
* Function to check the progress of a hippo job  
*/
function progress(percent_done, submitted_hippo_url) {
	if (percent_done >= 100 || isNaN(percent_done)) {
		return;	
	} else {
		$.ajax({
			url: submitted_hippo_url,
			type: 'POST'
		});// End ajax
		
		// Call our function again until we find 100
		submit_hippo(submitted_hippo_url);
		
	}// End else
	
}// End progress

/**
* Function to submit a hippo job using the hippo url that is passed  
*/
function submit_hippo(submitted_hippo_url) {
	
	$.ajax({
		url: submitted_hippo_url,
		type: 'GET',
		success: function(data){
			var percent_done = parseInt($('.sq-hipo-header-progress-bar-percent', data).text().replace(/[^0-9]/g, ''));
			
			progress(percent_done, submitted_hippo_url);
			
		}// End success
		
	});// End ajax
	
}// End submit_hippo


/**
* Function that gets data and posts to the linking screen of an asset
*/
function details_screen(screen_url, main_form, hippo_url) {
	
}// End details_screen


/**
* Function that gets data and posts to the linking screen of an asset
*/
function linking_screen(screen_url, main_form, hippo_url) {
	
	$.ajax({
		url: screen_url,
		type: 'GET',
		error: ajax_error,
		success: function(response){
			response = '<div>' + response + '</div>';
			var main_form_hippo = $('#main_form', response);
			// Submit the hippo
			// Sweet, we already have the locks, lets continue
			var arr_linking_screen = new Array();
			main_form_hippo.find('input, select').each(function() {
				if ($(this).attr('id').indexOf('delete_linkid') !== -1) {
					arr_linking_screen.push($(this).attr('name') + '=SQ_CRON_JOB_FUTURE_LINEAGE_DELETE_ALL_LINKS');
				} else {
					arr_linking_screen.push($(this).attr('name') + '=' + $(this).val());	
				}
			});// End each
			
			// Serialize this crazy stuff
			var linking_data = arr_linking_screen.join('&');	
			var form_action = main_form.attr('action');
			$.ajax({
				url: form_action,
				data: linking_data,
				type: 'POST',
				error: ajax_error,
				success: function(hippo){
					hippo = '<div>' + hippo + '</div>';
					var submitted_hippo = $(hippo).html();
					var submitted_hippo = submitted_hippo.split('?SQ_ACTION=hipo');
					var submitted_hippo = submitted_hippo[1].split('&SQ_BACKEND_PAGE');
					var submitted_hippo_url = hippo_url + submitted_hippo[0];
					
					$.ajax({
						url: submitted_hippo_url,
						type: 'POST',
						error: ajax_error,
						success: function () {
							
							submit_hippo(submitted_hippo_url);	
						}
						
				   });// End ajax
					
				}// End success
				
		   });// End ajax
			
		}// End success
		
   });// End ajax
	
}// End linking_screen


/**
* Function to get the locks on an asset screen
*/
function get_locks(item_id, item_screen) {
	// Find out what site we are at
	var site_url = location.protocol + '//' + location.host;
	var host_url = site_url + '?SQ_ACTION=asset_map_request';
	var hippo_url = site_url + '?SQ_ACTION=hipo';
	var screen_url = site_url + '/_admin/?SQ_BACKEND_PAGE=main&backend_section=am&am_section=edit_asset&assetid=' + item_id + '&asset_ei_screen=' + item_screen;
	
	// Find current asset path and stuff
	$.ajax({
		url: screen_url,
		type: 'GET',
		error: ajax_error,
		success: function(html){
			// Silly jQuery bug, lets wrap the entire html in a div
			html = '<div>' + html + '</div>';
			// Get our form info
			var main_form = $('#main_form', html);
			var form_action = main_form.attr('action');
			
			// We should check if we already have the locks
			if (main_form.find("input[value='Acquire Lock(s)']")) {
				var arr_current_item = new Array();
				main_form.find('input').each(function() {
					if ($(this).attr('name') == 'sq_lock_acquire') {
						arr_current_item.push($(this).attr('name') + '=1');	
					} else {
						arr_current_item.push($(this).attr('name') + '=' + $(this).val());	
					}
				});
				// Serialize this crazy stuff
				var linking_data = arr_current_item.join('&');	
				// Lets check and see if we need to get locks
				$.ajax({
					url: form_action,
					data: linking_data,
					type: 'POST',
					error: ajax_error,
					success: function(html){
						
						if (item_screen === 'linking') {
							// Run our linking function
							linking_screen(screen_url, main_form, hippo_url);
						} else if (item_screen === 'details') {
							// Run our details function
							details_screen(screen_url, main_form, hippo_url);
						}
			
					}// End success
					
				});// End ajax
				
			}// End if
					
			return;
			
		}// End success
	
	});// End ajax
	
}// End get_locks