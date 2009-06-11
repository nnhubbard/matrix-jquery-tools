/**
* MySource Matrix Simple Edit Tools (jquery.matrix.js)
* version: 0.3.1 (JUNE-11-2009)
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
		if (!obj.find('input:file')) {
			
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
			// We are using an asset builder for file uploads
			
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
* @version $Revision: 0.3
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
		ajaxStatus: false,
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
		var item_id = obj.attr('id');
		// What screen should we load?
		var item_screen = 'linking';
		var ajax_status = defaults.ajaxStatus;
		var complete = defaults.onComplete;
		var asset_status = null;
		
		// Remove simple edit url addition for links
		if (!defaults.simpleEdit) {
			var itemHref = obj.attr('href');
		} else {
			var itemHref = obj.attr('href').replace('/_edit', '');
			obj.attr('href', itemHref);
		}// End if
		
		// Add our multiple delete checkbox
		if (defaults.multiple) {
			var deleteCheckbox = '<input id="multi_' + item_id +'" class="' + defaults.checkboxClass + '" type="checkbox" value="' + itemHref + '" />';
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
					
					// Run our custom callback
					defaults.onComplete.apply(obj, []);
					
				} else {
					
					// Looks like we are going to run this straight through the server, no triggers! Hooray!
					get_locks(item_id, item_screen, ajax_status, asset_status, complete, obj);
					
				}// End else
		  
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
				
				if (deleteCount === 0) {
					alert('Please select one or more assets to delete.');
					return;	
				}
				
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
							
							// Run our custom callback
							defaults.onComplete.apply($(this), []);
						} else {
							// Set our correct object
							obj = $(this);
							
							// Looks like we are going to run this straight through the server, no triggers! Hooray!
							get_locks($(this).attr('id'), item_screen, ajax_status, asset_status, complete, obj);
							
						}// End else
				
					});// End each
					
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
* @version $Revision: 0.3
*/
$.fn.matrixStatus = function (options) {
	var defaults = {
		urlSuffix: '?action=live',
		assetStatus: 'Live',
		trigger: true,
		ajaxStatus: false,
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
		var item_id = obj.attr('id');
		var ajax_status = defaults.ajaxStatus;
		var asset_status = defaults.assetStatus;
		var complete = defaults.onComplete;
		
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
					
					// Run our custom callback
					defaults.onComplete.apply(obj, []);
				} else {
					// No triggers!  Heck yes!
					get_locks(item_id, item_screen, ajax_status, asset_status, complete, obj);
					
				}// End else
		  
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
* Function that cleans the input leaving just the asset id
*
* @param string		item_id				The id of the asset we are getting locks for
*
* @access public
*/
function clean_id(item_id) {
	return item_id.replace(/[^0-9]/g, '');
}// End clean_id


/**
* Function to check for any errors with the asset id
*
* @param string		item_id				The id of the asset we are getting locks for
*
* @access public
*/
function check_errors(item_id) {
	// Everything depends on the ID, so we need to check that we have it
	var item_id = clean_id(item_id);
	if (isNaN(item_id) || item_id === '' || item_id === undefined) {
		alert('The asset ID that was passed does not appear to be a number, please check the ID you are passing.');
		return true;
	}
}// End check_errors


/**
* Function that returns an ajax error
*
* @param string		xhr				The response code that we get back
* @param string		ajaxOptions		Extra options
* @param string		errorThrown		The error the is thrown
*
* @access public
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
*
* @param string		item_id				The id of the asset we are getting locks for
* @param string		percent_done		The percentage of progress for our hippo
* @param string		submitted_hippo_url	The url of our hippo job
* @param boolean	ajax_status			True or False if we want to show the status
* @param function	complete			The functin that we use for our callback
* @param object		obj					The jQuery object that we pass to our callback
*
* @access public
*/
function progress(item_id, percent_done, submitted_hippo_url, ajax_status, complete, obj) {
	
	debug('progress', 1, true);
	
	if (percent_done >= 100 || isNaN(percent_done)) {
		
		// Remove ajax_status one we are finished with the hippo
		$('#' + item_id).next('.ajax_status').remove();
		
		// Run our onComplete callback
		complete.apply(obj, []);
		
		return;	
	} else {
		
		$.ajax({
			url: submitted_hippo_url,
			type: 'POST'
		});// End ajax
		
		// Call our function again until we find 100
		submit_hippo(item_id, submitted_hippo_url, ajax_status, complete, obj);
		
	}// End else
	
}// End progress

/**
* Function to submit a hippo job using the hippo url that is passed
*
* @param string		item_id				The id of the asset we are getting locks for
* @param string		submitted_hippo_url	The url of our hippo job
* @param boolean	ajax_status			True or False if we want to show the status
* @param function	complete			The functin that we use for our callback
* @param object		obj					The jQuery object that we pass to our callback
*
* @access public
*/
function submit_hippo(item_id, submitted_hippo_url, ajax_status, complete, obj) {
	
	debug('submit_hippo function', 1, true);
	
	$.ajax({
		url: submitted_hippo_url,
		type: 'GET',
		success: function(data){
			var percent_done = parseInt($('.sq-hipo-header-progress-bar-percent', data).text().replace(/[^0-9]/g, ''));
			var status_message = 'Hippo is at ' + percent_done +'%';
			status(item_id, status_message, ajax_status)
			
			// Run our function that checks the hippo progress
			progress(item_id, percent_done, submitted_hippo_url, ajax_status, complete, obj);
			
		}// End success
		
	});// End ajax
	
}// End submit_hippo


function process_hippo(item_id, screen_url, main_form, hippo_url, ajax_status, complete, obj, linking_data) {
	
	debug('process_hippo function', 1, true);
	
	var status_message = 'Building data';
	status(item_id, status_message, ajax_status);
	
	var form_action = main_form.attr('action');
	$.ajax({
		url: form_action,
		data: linking_data,
		type: 'POST',
		error: ajax_error,
		beforeSend: function() {
			var status_message = 'Submitting hippo job';
			status(item_id, status_message, ajax_status);
		},
		success: function(hippo){
			
			// What screen are we using
			var current_screen = screen_url.split('asset_ei_screen=');
			current_scrren = current_screen[1];
			if (current_scrren === 'details') {
				var status_message = 'Status changed successfully';
				status(item_id, status_message, ajax_status);
				// Run our onComplete callback
				complete.apply(obj, []);
				return;
			}// End if
	
			hippo = '<div>' + hippo + '</div>';
			var submitted_hippo = $(hippo).html();
			
			// Find our hippo URL
			var submitted_hippo = submitted_hippo.split('?SQ_ACTION=hipo');
			// Check to see if we actually have a hippo
			if (submitted_hippo[1] === undefined) {
				var status_message = 'Hippo Error';
				status(item_id, status_message, ajax_status);
				return;	
			}// End if
			var submitted_hippo = submitted_hippo[1].split('&SQ_BACKEND_PAGE');
			var submitted_hippo_url = hippo_url + submitted_hippo[0];
			
			$.ajax({
				url: submitted_hippo_url,
				type: 'POST',
				error: ajax_error,
				success: function () {
					
					// Run our function to submit the hippo
					submit_hippo(item_id, submitted_hippo_url, ajax_status, complete, obj);	
					
				}// End success
				
		   });// End ajax
			
		}// End success
		
   });// End ajax
	
}// End process_hippo


/**
* Function will update the status when each ajax call is run
*
* @param string		item_id			The id of the asset we are getting locks for
* @param string		status_message	The status message that we are sending
* @param boolean	ajax_status			True or False if we want to show the status
*
* @access public
*/
function status(item_id, status_message, ajax_status) {
	
	debug('status function', 1, true);
	
	if (ajax_status) {
		// We need to set where out status will be
		$('#' + item_id).next('.ajax_status').remove();
		$('#' + item_id).after('<span class="ajax_status">' + status_message + '</span>');
		
	}// End if
	
}// End details_screen


/**
* Function that gets data and posts to the linking screen of an asset
*
* @param string		item_id			The id of the asset we are getting locks for
* @param string		screen_url		The url of the screen we are getting
* @param object		main_form		jQuery selector of our main form
* @param string		hippo_url		The url of the current hippo job
* @param boolean	ajax_status		True or False if we want to show the status
* @param function	complete		The functin that we use for our callback
* @param object		obj				The jQuery object that we pass to our callback
* @param string		asset_status	The status that we are to set the asset to
*
* @access public
*/
function details_screen(item_id, screen_url, main_form, hippo_url, ajax_status, complete, obj, asset_status) {
	
	debug('details_screen function', 1, true);
	
	// Lets see what status means in numerical values
	if (asset_status === 'Live') {
		var status_code = 16;
	} else if (asset_status === 'Safe Edit') {
		var status_code = 64;
	} else if (asset_status === 'Under Construction') {
		var status_code = 2;
	}
	
	$.ajax({
		url: screen_url,
		type: 'GET',
		error: ajax_error,
		beforeSend: function() {
			var status_message = 'Getting details screen info';
			status(item_id, status_message, ajax_status);
		},
		success: function(response){
			response = '<div>' + response + '</div>';
			var main_form_hippo = $('#main_form', response);
			// Submit the hippo
			var arr_screen = new Array();
			main_form_hippo.find('input, select').each(function() {
				if ($(this).attr('id').indexOf('_change_status') !== -1 && this.tagName === 'SELECT') {
					arr_screen.push($(this).attr('name') + '=' + status_code);
				} else {
					arr_screen.push($(this).attr('name') + '=' + $(this).val());
					
				}// End else
				
			});// End each
			
			// Serialize this crazy stuff
			var linking_data = arr_screen.join('&');	
			
			// Start to process our hippo job
			process_hippo(item_id, screen_url, main_form, hippo_url, ajax_status, complete, obj, linking_data);
			
		}// End success
		
   });// End ajax

}// End details_screen


/**
* Function that gets data and posts to the linking screen of an asset
* 
* @param string		item_id		The id of the asset we are getting locks for
* @param string		screen_url	The url of the screen we are getting
* @param object		main_form	jQuery selector of our main form
* @param string		hippo_url	The url of the current hippo job
* @param boolean	ajax_status	True or False if we want to show the status
* @param function	complete			The functin that we use for our callback
* @param object		obj					The jQuery object that we pass to our callback
*
* @access public
*/
function linking_screen(item_id, screen_url, main_form, hippo_url, ajax_status, complete, obj) {
	
	debug('linking_screen function', 1, true);
	
	$.ajax({
		url: screen_url,
		type: 'GET',
		error: ajax_error,
		beforeSend: function() {
			var status_message = 'Getting linking screen info';
			status(item_id, status_message, ajax_status);
		},
		success: function(response){
			response = '<div>' + response + '</div>';
			var main_form_hippo = $('#main_form', response);
			// Submit the hippo
			var arr_screen = new Array();
			main_form_hippo.find('input, select').each(function() {
				if ($(this).attr('id').indexOf('delete_linkid') !== -1) {
					arr_screen.push($(this).attr('name') + '=SQ_CRON_JOB_FUTURE_LINEAGE_DELETE_ALL_LINKS');
				} else {
					arr_screen.push($(this).attr('name') + '=' + $(this).val());	
				}// End else
				
			});// End each
			
			// Serialize this crazy stuff
			var linking_data = arr_screen.join('&');	
			
			// Start to process our hippo job
			process_hippo(item_id, screen_url, main_form, hippo_url, ajax_status, complete, obj, linking_data);
			
		}// End success
		
   });// End ajax
	
}// End linking_screen


/**
* Function to get the locks on an asset screen
*
* @param string		item_id		The id of the asset we are getting locks for
* @param string		item_screen	The screen that we are to get from the backend
* @param boolean	ajax_status	True or False if we want to show the status
* @param function	complete			The functin that we use for our callback
* @param object		obj					The jQuery object that we pass to our callback
*
* @access public
*/
function get_locks(item_id, item_screen, ajax_status, asset_status, complete, obj) {
	
	debug('get_locks function', 1, true);
	
	// Everything depends on the ID, so we need to check that we have it
	if (check_errors(item_id)) {
		return;
	}// End if
	
	// Find out what site we are at
	var site_url = location.protocol + '//' + location.host;
	var hippo_url = site_url + '?SQ_ACTION=hipo';
	var screen_url = site_url + '/_admin/?SQ_BACKEND_PAGE=main&backend_section=am&am_section=edit_asset&assetid=' + clean_id(item_id) + '&asset_ei_screen=' + item_screen;
	
	// Find current asset path and stuff
	$.ajax({
		url: screen_url,
		type: 'GET',
		error: ajax_error,
		beforeSend: function() {
			var status_message = 'Checking to see if we  need locks';
			status(item_id, status_message, ajax_status);
		},
		success: function(html){
			// jQuery bug, lets wrap the entire html in a div
			html = '<div>' + html + '</div>';
			
			// Get our form infoa
			var main_form = $('#main_form', html);
			var form_action = main_form.attr('action');
			
			// What is our current asset status
			var current_status = $(".sq-backend-data img", html).next('i:first').text();
			if (current_status === asset_status) {
				// Remove status from DOM and alert the user
				$('#' + item_id).next('.ajax_status').remove();
				alert('Asset ID:' + clean_id(item_id) + ' currently has the status of ' + current_status + '.  You are tring set this same status.');
				return;	
			}
			
			// We should check if we already have the locks
			if (main_form.find("input[value='Acquire Lock(s)']")) {
				var arr_current_item = new Array();
				main_form.find('input').each(function() {
					if ($(this).attr('name') == 'sq_lock_acquire') {
						arr_current_item.push($(this).attr('name') + '=1');	
					} else {
						arr_current_item.push($(this).attr('name') + '=' + $(this).val());	
					}
				});// End each
				
				// Serialize this stuff
				var linking_data = arr_current_item.join('&');
				
				// Lets check and see if we need to get locks
				$.ajax({
					url: form_action,
					data: linking_data,
					type: 'POST',
					error: ajax_error,
					beforeSend: function() {
						var status_message = 'Getting locks';
						status(item_id, status_message, ajax_status);
					},
					success: function(html){
						
						if (item_screen === 'linking') {
							// Run our linking function
							linking_screen(item_id, screen_url, main_form, hippo_url, ajax_status, complete, obj);
						} else if (item_screen === 'details') {
							// Run our details function
							details_screen(item_id, screen_url, main_form, hippo_url, ajax_status, complete, obj, asset_status);
							
						}// End if
			
					}// End success
					
				});// End ajax
				
			}// End if
			
			var status_message = 'Error getting locks';
			status(item_id, status_message, ajax_status);
					
			return;
			
		}// End success
	
	});// End ajax
	
}// End get_locks

// Small debug function that will log errors for us
function debug(message, error, trace) {
	
	// Since this is for testing, we can turn it on or off
	var status = false;
	
	if (status) {
		if (error === 1) console.debug(message);
		if (error === 2) console.info(message);
		if (error === 3) console.warn(message);
		if (error === 4) console.error(message);
		if (trace) console.trace();
	}
	
}// End debug